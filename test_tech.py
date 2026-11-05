import random
import unittest

import development as dev
import technology as tech
from civsim import Simulation
from society import TECHNOLOGIES, technology_modifiers, unlock


def known_in_era(era, count):
    """A society that knows `count` discoveries of one age (plus whatever they need)."""
    out = set()
    while len([n for n in out if tech.TECH[n][3] == era]) < count:
        grew = False
        for name, entry in tech.TECH.items():
            if entry[3] != era or name in out:
                continue
            same = [p for p in entry[0] if tech.TECH[p][3] == era]
            if all(p in out for p in same):
                out |= owned(*[p for p in entry[0] if tech.TECH[p][3] != era])
                for group in tech.ANY.get(name, []):
                    if not any(m in out for m in group) and tech.TECH[group[0]][3] != era:
                        out |= owned(group[0])
                out.add(name)
                grew = True
                break
        if not grew:
            break
    return out


def owned(*names):
    """A set of discoveries including everything they need."""
    out = set()
    stack = list(names)
    while stack:
        n = stack.pop()
        if n not in out:
            out.add(n)
            stack.extend(tech.TECH[n][0])
            for group in tech.ANY.get(n, []):
                stack.append(group[0])
    return out


class Fake:
    def __init__(self, techs):
        self.technologies = set(techs)
        self.innovations = {}


class TreeTests(unittest.TestCase):
    def test_tree_is_large_consistent_and_layered(self):
        self.assertEqual(tech.validate(), [])
        self.assertGreaterEqual(len(tech.TECH), 70)
        self.assertEqual(len(tech.ERAS), 15)
        eras = {entry[3] for entry in tech.TECH.values()}
        self.assertEqual(eras, set(range(15)))
        self.assertEqual({entry[4] for entry in tech.TECH.values()}, set(tech.BRANCHES))
        # society still exposes (prerequisites, cost, description) for every discovery
        self.assertEqual(set(TECHNOLOGIES), set(tech.TECH))
        self.assertTrue(all(len(v) == 3 for v in TECHNOLOGIES.values()))
        # later ages cost more on average
        avg = [sum(e[1] for e in tech.TECH.values() if e[3] == i) / max(1, len([1 for e in tech.TECH.values() if e[3] == i])) for i in range(15)]
        broad = [sum(avg[i] for i in range(15) if tech.ERA_GROUP[i] == g) / len([1 for i in range(15) if tech.ERA_GROUP[i] == g]) for g in range(7)]
        self.assertTrue(all(broad[i] < broad[i + 1] for i in range(6)))

    def test_every_tech_is_reachable_from_nothing(self):
        have = set()
        progress = True
        while progress:
            progress = False
            for name, entry in tech.TECH.items():
                if name not in have and tech.met(name, have):
                    have.add(name)
                    progress = True
        self.assertEqual(have, set(tech.TECH))

    def test_era_arrives_when_a_third_of_its_discoveries_are_known(self):
        self.assertEqual(tech.era_index(set()), 0)
        for e in range(1, 15):
            have = known_in_era(e, tech.ERA_NEED[e] - 1)
            self.assertLess(tech.era_index(have), e, f"one short of the {tech.ERAS[e]}")
            have = known_in_era(e, tech.ERA_NEED[e])
            self.assertEqual(tech.era_index(have), e, tech.ERAS[e])
        self.assertEqual(tech.era_name(owned("stone tools")), "Old Stone Age")
        self.assertGreaterEqual(min(tech.ERA_NEED[1:]), 3, "later ages need real progress, not a lucky find")

    def test_the_tree_spans_many_topics_and_every_age(self):
        self.assertGreaterEqual(len(tech.TECH), 220)
        self.assertGreaterEqual(len(tech.BRANCHES), 11)
        for b in tech.BRANCHES:
            eras = {e[3] for e in tech.TECH.values() if e[4] == b}
            self.assertGreaterEqual(len(eras), 4, f"{b} should run through many ages")
            self.assertGreaterEqual(len([1 for e in tech.TECH.values() if e[4] == b]), 8, b)

    def test_new_kinds_of_effect_exist(self):
        self.assertGreater(tech.effects(owned("state religion"))["stab"], 0)
        self.assertGreater(tech.effects(owned("temple building"))["cult"], 0)
        self.assertLess(tech.effects(owned("building codes"))["haz"], 1.0)
        self.assertLess(tech.effects(owned("refrigeration"))["spoil"], tech.effects(owned("salt curing"))["spoil"])
        self.assertGreater(tech.effects(owned("concrete"))["build"], tech.effects(owned("thatched huts"))["build"])
        everything = tech.effects(set(tech.TECH))
        self.assertLessEqual(everything["prod"], tech.CEILING["prod"])
        self.assertGreaterEqual(everything["dth"], tech.FLOOR["dth"])
        self.assertEqual(everything["weapon"], 7)


class EffectTests(unittest.TestCase):
    def test_weapons_get_deadlier_and_stronger(self):
        ages, running = [], set()
        for name in ("spear making", "bronze weapons", "ironworking", "military drill", "heavy cavalry", "musketry", "rifled firearms"):
            running = running | owned(name)
            ages.append(set(running))
        _unused = [
                ]
        tiers = [tech.effects(a)["weapon"] for a in ages]
        self.assertEqual(tiers, [0, 1, 2, 3, 4, 5, 6])
        power = [technology_modifiers(Fake(a))["military"] for a in ages]
        self.assertTrue(all(power[i] < power[i + 1] for i in range(6)))
        self.assertTrue(all(tech.LETHALITY[i] < tech.LETHALITY[i + 1] for i in range(7)))
        self.assertGreater(tech.LETHALITY[6], 1.5 * tech.LETHALITY[0])

    def test_defenses_and_sieges_answer_each_other(self):
        base = technology_modifiers(Fake(owned("masonry")))
        castle = technology_modifiers(Fake(owned("castles")))
        bastion = technology_modifiers(Fake(owned("bastion forts")))
        self.assertLess(castle["defense"], base["defense"])
        self.assertLess(bastion["defense"], castle["defense"])
        self.assertGreater(technology_modifiers(Fake(owned("artillery")))["siege"], technology_modifiers(Fake(owned("siege craft")))["siege"])

    def test_disease_changes_with_the_ages(self):
        none = technology_modifiers(Fake(set()))
        early = technology_modifiers(Fake(owned("aqueducts", "soapmaking")))
        late = technology_modifiers(Fake(owned("vaccination", "public health")))
        self.assertEqual(none["infection"], 1.0)
        self.assertLess(early["water"], 1.0)
        self.assertLess(late["water"], early["water"])
        self.assertLess(late["infection"], early["infection"])
        self.assertLess(late["disease_death"], early["disease_death"] + 1e-9)
        self.assertLess(late["air"], none["air"])
        self.assertGreater(late["cure"], early["cure"])
        self.assertGreater(late["care"], none["care"])

    def test_travel_improves_with_ships_and_rails(self):
        self.assertLess(technology_modifiers(Fake(owned("sailing")))["sea"], technology_modifiers(Fake(owned("steamships")))["sea"])
        self.assertLess(technology_modifiers(Fake(owned("roads")))["land"], technology_modifiers(Fake(owned("railways")))["land"])
        self.assertEqual(tech.units(owned("railways"))["wagons"], "freight trains")
        self.assertEqual(tech.units(owned("steamships"))["fleet"], "steamships")
        self.assertEqual(tech.units(set())["army"], "hunters with spears")


class ResearchChoiceTests(unittest.TestCase):
    def test_needs_steer_what_gets_researched(self):
        available = ["irrigation", "bronze weapons", "sailing", "writing", "medicine"]
        rng = random.Random(5)
        counts = {}
        for _ in range(600):
            pick = tech.choose(rng, available, set(), {"warfare": 5.0, "agriculture": 0.0}, 0)
            counts[pick] = counts.get(pick, 0) + 1
        self.assertGreater(counts["bronze weapons"], counts.get("irrigation", 0) * 2)
        rng = random.Random(5)
        counts = {}
        for _ in range(600):
            pick = tech.choose(rng, available, set(), {"agriculture": 5.0}, 0)
            counts[pick] = counts.get(pick, 0) + 1
        self.assertGreater(counts["irrigation"], counts.get("bronze weapons", 0) * 2)

    def test_countries_research_toward_their_needs(self):
        sim = Simulation(population=1500, seed=21)
        for _ in range(25):
            sim.tick(False)
        projects = [getattr(c, "research_project", None) for c in sim.countries.values() if c.ended is None]
        self.assertTrue(any(projects))
        for c in sim.countries.values():
            self.assertTrue(c.technologies <= set(tech.TECH))


class PrerequisiteTests(unittest.TestCase):
    def test_alternatives_are_rare_and_valid(self):
        self.assertEqual(tech.validate(), [])
        self.assertTrue(0 < len(tech.ANY) <= 12, "alternatives are used sparingly")
        for name, groups in tech.ANY.items():
            self.assertTrue(tech.TECH[name][0], f"{name} also has a plain prerequisite")
            for group in groups:
                self.assertGreaterEqual(len(group), 2)
                self.assertFalse(set(group) & tech.TECH[name][0])

    def test_one_of_a_group_is_enough(self):
        name = "castles"
        base = owned("engineering", "fortification")
        self.assertFalse(tech.met(name, base))
        for choice in tech.ANY[name][0]:
            self.assertTrue(tech.met(name, base | owned(choice)), choice)

    def test_systems_feed_several_chains(self):
        # metallurgy no longer stands alone: other systems are the base for its steps
        # (a prerequisite already implied by another one is not listed twice, so look through the whole chain)
        outside = [n for n in ("steelmaking", "cast iron", "ironworking", "gunpowder", "steam power", "rifled firearms")
                   if len({tech.TECH[p][4] for p in owned(n) if p != n}) >= 3]
        self.assertGreaterEqual(len(outside), 4)
        for base in ("wheel", "alchemy", "surveying", "horse domestication", "magnetism", "screw and lathe"):
            self.assertGreaterEqual(sum(1 for n in tech.TECH if n != base and base in owned(n)), 3, base)

    def test_no_shallow_leap_to_late_units(self):
        deep = owned("machine guns", "ironclads")
        self.assertGreater(len(deep), 60)
        self.assertEqual(tech.researchable(set()) and all(tech.TECH[n][3] <= tech.MAX_LEAD for n in tech.researchable(set())), True)
        # a society still in the Old Stone Age cannot even start research three ages ahead
        for n in tech.researchable(owned("stone tools")):
            self.assertLessEqual(tech.TECH[n][3], tech.era_index(owned("stone tools")) + tech.MAX_LEAD)

    def test_the_cap_never_stalls_research(self):
        have = set()
        for _ in range(len(tech.TECH)):
            options = tech.researchable(have)
            if not options:
                break
            have.add(options[0] if len(have) % 2 else options[-1])
        self.assertEqual(have, set(tech.TECH))


class WorldTests(unittest.TestCase):
    def test_ages_arrive_slowly(self):
        sim = Simulation(population=2000, seed=7)
        for _ in range(60):
            sim.tick(False)
        alive = [c for c in sim.countries.values() if c.ended is None]
        self.assertTrue(all(tech.ERA_GROUP[tech.era_index(c.technologies)] == 0 for c in alive), "no one leaves the Stone Age in 60 years")
        self.assertLess(max(len(c.technologies) for c in alive), 40)
        self.assertGreater(max(len(c.technologies) for c in alive), 4, "but they do learn things")

    def test_unlock_announces_a_new_age(self):
        sim = Simulation(population=400, seed=3)
        country = sim.countries[1]
        actor = next(p for p in sim.people.values() if p.country == 1 and p.age >= 18)
        short = known_in_era(2, tech.ERA_NEED[2] - 1)
        full = known_in_era(2, tech.ERA_NEED[2])
        nxt = next(n for n in full - short if tech.TECH[n][3] == 2)
        country.technologies = set(full - {nxt})
        self.assertLess(tech.era_index(country.technologies), 2)
        self.assertTrue(unlock(sim, country, nxt, actor))
        self.assertTrue(any("entered the Early Bronze Age" in str(e) for e in sim.history))

    def test_new_buildings_need_their_technology(self):
        for kind, needed in (("forge", "ironworking"), ("bank", "banking"), ("barracks", "military drill"), ("factory", "steam power"), ("station", "railways")):
            self.assertIn(kind, dev.BUILDINGS)
            self.assertIn(needed, dev.BUILDINGS[kind][2])
            self.assertIn(needed, tech.TECH)


if __name__ == "__main__":
    unittest.main()
