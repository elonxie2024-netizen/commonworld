import copy
import unittest

import development as dev
import disasters
import geography as g
import systems
from civic import command
from civsim import Simulation


def biggest(sim, cid=None):
    counts = g.settlement_counts(sim)
    places = [s for s in sim.settlements.values() if s.abandoned is None and (cid is None or s.country == cid)]
    return max(places, key=lambda s: counts[s.id])


class GeographyTests(unittest.TestCase):
    def test_world_is_deterministic_and_varied(self):
        a, b = Simulation(population=400, seed=11), Simulation(population=400, seed=11)
        self.assertEqual(g.world(a)["terrain"], g.world(b)["terrain"])
        kinds = {t for row in g.world(a)["terrain"] for t in row}
        self.assertGreaterEqual(len(kinds), 6)
        self.assertTrue(any(v for row in g.world(a)["river"] for v in row))
        self.assertTrue(g.world(a)["deposits"])
        other = Simulation(population=400, seed=12)
        self.assertNotEqual(g.world(a)["terrain"], g.world(other)["terrain"])

    def test_settlements_sit_on_distinct_land_cells(self):
        sim = Simulation(population=2000, seed=5)
        for _ in range(12):
            sim.tick(False)
        cells = [(s.gx, s.gy) for s in sim.settlements.values()]
        self.assertEqual(len(cells), len(set(cells)))
        for x, y in cells:
            self.assertNotIn(g.world(sim)["terrain"][y][x], g.WATER)

    def test_paths_walk_over_connected_land(self):
        sim = Simulation(population=2000, seed=5)
        places = sorted(sim.settlements.values(), key=lambda s: s.id)
        route = None
        for a in places:
            for b in places:
                if a is not b:
                    route = g.find_path(sim, (a.gx, a.gy), (b.gx, b.gy))
                    if route:
                        break
            if route:
                break
        self.assertIsNotNone(route)
        cells, cost = route
        self.assertGreater(cost, 0)
        for (x1, y1), (x2, y2) in zip(cells, cells[1:]):
            self.assertLessEqual(max(abs(x1 - x2), abs(y1 - y2)), 1)
            self.assertNotIn(g.world(sim)["terrain"][y2][x2], g.WATER)

    def test_hazards_follow_terrain(self):
        sim = Simulation(population=400, seed=9)
        geo = g.world(sim)
        river = [(x, y) for y in range(g.H) for x in range(g.W) if geo["river"][y][x] and geo["terrain"][y][x] not in g.WATER]
        dry = [(x, y) for y in range(g.H) for x in range(g.W) if geo["terrain"][y][x] in ("plains", "forest")
               and not g.world(sim)["river"][y][x] and not g._near_water(geo["terrain"], x, y, 3) and not g._near_flag(geo["river"], x, y, 2)]
        peaks = [(x, y) for y in range(g.H) for x in range(g.W) if geo["terrain"][y][x] == "hills" and geo["slope"][y][x] > .04]
        self.assertTrue(river and dry)
        mean = lambda cells, kind: sum(g.hazards_at(sim, x, y)[kind] for x, y in cells) / len(cells)
        self.assertGreater(mean(river, "flood"), mean(dry, "flood"))
        if peaks:
            self.assertGreater(mean(peaks, "earthquake"), mean(dry, "earthquake"))


class ExpeditionTests(unittest.TestCase):
    def test_settlers_travel_then_found_a_town(self):
        sim = Simulation(population=2000, seed=3)
        sim.country_chance = 0
        origin = biggest(sim)
        before = len(sim.settlements)
        exp = dev.launch_expedition(sim, origin, forced=True)
        self.assertIsNotNone(exp)
        travelers = list(exp["people"])
        self.assertTrue(all(sim.people[i].settlement == origin.id for i in travelers))
        self.assertTrue(all(getattr(sim.people[i], "expedition", None) == exp["id"] for i in travelers))
        for _ in range(20):
            sim.tick(False)
            if not any(e["id"] == exp["id"] for e in sim.expeditions):
                break
        self.assertFalse(any(e["id"] == exp["id"] for e in sim.expeditions))
        arrived = [i for i in travelers if i in sim.people]
        self.assertGreaterEqual(len(sim.settlements), before + 1)
        founded = [s for s in sim.settlements.values() if s.founder in travelers and s.id != origin.id]
        self.assertEqual(len(founded), 1)
        self.assertEqual(founded[0].country, origin.country)
        self.assertTrue(arrived)
        self.assertTrue(all(sim.people[i].settlement == founded[0].id for i in arrived))
        self.assertTrue(all(not getattr(sim.people[i], "expedition", None) for i in arrived))

    def test_ownership_and_flags_stay_consistent(self):
        sim = Simulation(population=2000, seed=21)
        for _ in range(25):
            sim.tick(False)
            active = {e["id"] for e in getattr(sim, "expeditions", [])}
            for p in sim.people.values():
                self.assertEqual(p.country, sim.settlements[p.settlement].country)
                flag = getattr(p, "expedition", None)
                self.assertTrue(not flag or flag in active, (sim.year, p.id, flag))

    def test_settle_command(self):
        sim = Simulation(population=2000, seed=3)
        name = biggest(sim).name
        output, action = command(sim, f'settle "{name}" size=12')
        self.assertEqual(action, "edit", output)
        self.assertEqual(len(sim.expeditions), 1)
        self.assertIn("Settler parties", command(sim, "expeditions")[0])
        self.assertEqual(command(sim, "undo")[1], "edit")
        self.assertEqual(len(getattr(sim, "expeditions", [])), 0)


class ProjectTests(unittest.TestCase):
    def test_building_gets_built_and_changes_the_country(self):
        sim = Simulation(population=2000, seed=3)
        place = biggest(sim)
        country = sim.countries[place.country]
        project = dev.start_project(sim, place, "school", forced=True)
        self.assertIsNotNone(project)
        for _ in range(30):
            sim.tick(False)
            if "school" in getattr(place, "buildings", {}):
                break
        self.assertIn("school", place.buildings)
        notes = systems.analyze(sim, country.id)["notes"]["research"]
        self.assertIn("Schools", [label for label, _ in notes])

    def test_build_command_enforces_requirements(self):
        sim = Simulation(population=2000, seed=3)
        name = biggest(sim).name
        output, action = command(sim, f'build "{name}" university')
        self.assertEqual(action, "inspect")
        self.assertIn("cannot build", output)
        output, action = command(sim, f'build "{name}" university force=true')
        self.assertEqual(action, "edit", output)
        self.assertIn("1", command(sim, "projects")[0])

    def test_roads_speed_up_travel(self):
        sim = Simulation(population=2000, seed=3)
        a = biggest(sim)
        b = [s for s in sim.settlements.values() if s.country == a.country and s.id != a.id][0]
        route = g.find_path(sim, (a.gx, a.gy), (b.gx, b.gy))
        sim.roads = {y * g.W + x: a.country for x, y in route[0]}
        faster = g.find_path(sim, (a.gx, a.gy), (b.gx, b.gy))
        self.assertLess(faster[1], route[1])


class DisasterTests(unittest.TestCase):
    def test_disaster_is_local_and_protection_helps(self):
        sim = Simulation(population=2000, seed=3)
        for _ in range(5):
            sim.tick(False)
        place = biggest(sim)
        protected = copy.deepcopy(sim)
        protected.settlements[place.id].buildings = {"levee": 1}
        plain = copy.deepcopy(sim)
        far = [s for s in sim.settlements.values() if g.dist(s.gx, s.gy, place.gx, place.gy) > disasters.RADIUS["severe"]]
        hit = disasters.strike(plain, "flood", "severe", place.gx, place.gy)
        shielded = disasters.strike(protected, "flood", "severe", place.gx, place.gy)
        self.assertLessEqual(shielded["deaths"], hit["deaths"])
        self.assertTrue({a["settlement"] for a in hit["affected"]})
        for s in far:
            self.assertNotIn(s.id, {a["settlement"] for a in hit["affected"]})

    def test_disaster_command_targets_a_settlement(self):
        sim = Simulation(population=2000, seed=3)
        country = sim.countries[biggest(sim).country].name
        output, action = command(sim, f'disaster "{country}" landslide severity=major')
        self.assertEqual(action, "edit", output)
        self.assertIn("struck", output)
        self.assertTrue(sim.disaster_log)


class EradicationTests(unittest.TestCase):
    def test_complete_cure_with_no_infections_eradicates_automatically(self):
        sim = Simulation(population=800, seed=4)
        command(sim, "add disease Testpox infection=0.3")
        command(sim, "set disease Testpox cure 100")
        self.assertIn("Testpox", sim.sicknesses)
        sim.tick(False)
        self.assertNotIn("Testpox", sim.sicknesses)
        self.assertIn("Testpox", sim.retired_sicknesses)
        self.assertTrue(any("Testpox has been eradicated" in m for _, m in sim.history))

    def test_cured_but_still_infectious_waits(self):
        sim = Simulation(population=800, seed=4)
        command(sim, "add disease Waitpox infection=0 death=0 recovery=0 course=chronic")
        command(sim, "infect 1 Waitpox")
        command(sim, "set disease Waitpox cure 100")
        sim.tick(False)
        self.assertIn("Waitpox", sim.sicknesses)


class WorldLifeTests(unittest.TestCase):
    def test_new_towns_are_founded_only_on_unclaimed_land(self):
        sim = Simulation(population=2000, seed=3)
        for _ in range(8):
            sim.tick(False)
        counts = g.settlement_counts(sim)
        origin = biggest(sim)
        site = dev.choose_site(sim, origin)
        if site is not None:
            self.assertEqual(g.claim_owner(sim, site[0], site[1], counts), 0)
            for s in sim.settlements.values():
                if s.abandoned is None:
                    self.assertGreaterEqual(g.dist(s.gx, s.gy, site[0], site[1]), 7)

    def test_the_world_has_several_continents_and_islands(self):
        sim = Simulation(population=400, seed=42)
        sizes = sorted(g.world(sim)["size"].values(), reverse=True)
        self.assertGreaterEqual(len([s for s in sizes if s >= 300]), 3)
        self.assertGreaterEqual(len([s for s in sizes if 25 <= s < 300]), 2)

    def test_settlers_can_cross_the_sea_by_boat(self):
        sim = Simulation(population=2000, seed=3)
        origin = [s for s in sorted(sim.settlements.values(), key=lambda s: s.id) if g.is_coastal(sim, s)][0]
        sim.countries[origin.country].technologies.add("sailing")
        site = dev.choose_site(sim, origin, sea=True)
        self.assertIsNotNone(site)
        comp = g.world(sim)["land"]
        self.assertNotEqual(comp[site[1]][site[0]], comp[origin.gy][origin.gx])
        exp = dev.launch_expedition(sim, origin, target=site, forced=True)
        self.assertIsNotNone(exp)
        self.assertEqual(exp["mode"], "sea")
        self.assertTrue(any(g.world(sim)["terrain"][y][x] == "ocean" for x, y in exp["path"][1:-1]))
        for _ in range(25):
            sim.tick(False)
            if not any(e["id"] == exp["id"] for e in sim.expeditions):
                break
        self.assertFalse(any(e["id"] == exp["id"] for e in sim.expeditions))

    def test_armies_march_and_besiege(self):
        sim = Simulation(population=2000, seed=14)
        land, _sea = g.contacts(sim)
        a = sorted(land)[0]
        b = sorted(land[a])[0]
        sim.war_chance = 0
        output, action = command(sim, f'war "{sim.countries[a].name}" "{sim.countries[b].name}"')
        self.assertEqual(action, "edit", output)
        seen = False
        for _ in range(12):
            sim.tick(False)
            for army in getattr(sim, "armies", []):
                seen = True
                self.assertGreater(army["men"], 0)
                self.assertIn(army["state"], ("marching", "besieging"))
            if not sim.wars:
                break
        self.assertTrue(seen)

    def test_merchant_bands_travel_and_trade(self):
        sim = Simulation(population=2000, seed=7)
        most = 0
        for _ in range(45):
            sim.tick(False)
            most = max(most, len(getattr(sim, "caravans", [])))
            for c in getattr(sim, "caravans", []):
                self.assertGreaterEqual(c["size"], 4)
                self.assertLess(c["index"], len(c["path"]))
        self.assertGreater(most, 0)

    def test_wonders_are_unique_and_need_their_prerequisites(self):
        sim = Simulation(population=2000, seed=3)
        place = biggest(sim)
        country = sim.countries[place.country]
        country.technologies |= {"writing"}
        sim.countries[place.country].capital = place.id
        self.assertIsNotNone(dev.start_project(sim, place, "palace", forced=False)) if dev._available(sim, place, "palace", 999) else None
        self.assertFalse(dev._available(sim, place, "grand_academy", 999))  # needs a university first
        place.buildings = {"palace": 1}
        self.assertFalse(dev._available(sim, place, "palace", 999))
        self.assertIn("palace", dev.BUILDINGS)
        self.assertTrue(dev.BUILDINGS["palace"][6])


class SystemsTests(unittest.TestCase):
    def test_systems_report_and_cross_effects(self):
        sim = Simulation(population=2000, seed=3)
        for _ in range(6):
            sim.tick(False)
        cid = biggest(sim).country
        for s in sim.settlements.values():
            if s.country == cid:
                s.buildings = {}  # start from a country with nothing built
        base = systems.analyze(sim, cid)
        place = biggest(sim, cid)
        place.buildings = {"clinic": 1, "well": 1, "school": 1, "walls": 1}
        built = systems.analyze(sim, cid)
        self.assertLess(built["death_mult"], base["death_mult"])
        self.assertLess(built["infection_mult"], base["infection_mult"])
        self.assertGreater(built["research"], base["research"])
        self.assertLess(built["defense_mult"], base["defense_mult"])
        sim.wars.clear()
        built = systems.analyze(sim, cid)
        sim.wars[tuple(sorted((cid, [c for c in sim.countries if c != cid][0])))] = sim.year
        warring = systems.analyze(sim, cid)
        self.assertLess(warring["expansion"], built["expansion"])
        self.assertIn("research", command(sim, "systems")[0])

    def test_wars_need_a_shared_border(self):
        sim = Simulation(population=2000, seed=14)
        for _ in range(40):
            before = dict(sim.wars)
            sim.tick(False)
            land, _sea = g.contacts(sim)
            for pair in sim.wars:
                if pair not in before:
                    self.assertIn(pair[1], land.get(pair[0], set()))


if __name__ == "__main__":
    unittest.main()
