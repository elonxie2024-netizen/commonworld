import unittest

import technology as tech
import warfare
from geography import contacts
from society import technology_modifiers
from civsim import Simulation


def closure(*names):
    out = set()
    stack = list(names)
    while stack:
        n = stack.pop()
        if n not in out:
            out.add(n)
            stack.extend(tech.TECH[n][0])
    return out


class Fake:
    def __init__(self, techs):
        self.technologies = set(techs)
        self.innovations = {}


class RuleTests(unittest.TestCase):
    def test_outclassed_armies_suffer_more(self):
        self.assertGreater(warfare.outclassed(0, 5), 1.0)
        self.assertLess(warfare.outclassed(5, 0), 1.0)
        self.assertEqual(warfare.outclassed(3, 3), 1.0)
        self.assertLessEqual(warfare.outclassed(0, 6), 1.6)
        self.assertGreaterEqual(warfare.outclassed(6, 0), .6)

    def test_siege_engines_beat_walls_and_walls_answer(self):
        walls = technology_modifiers(Fake(closure("masonry")))
        castles = technology_modifiers(Fake(closure("castles")))
        bastions = technology_modifiers(Fake(closure("bastion forts")))
        guns = technology_modifiers(Fake(closure("artillery")))
        rams = technology_modifiers(Fake(closure("siege craft")))
        self.assertGreater(warfare.siege_odds(guns, walls), warfare.siege_odds(rams, walls))
        self.assertGreater(warfare.siege_odds(rams, walls), warfare.siege_odds(rams, castles))
        self.assertGreater(warfare.siege_odds(guns, castles), warfare.siege_odds(guns, bastions))

    def test_modern_wars_are_deadlier_and_wear_nations_out(self):
        self.assertGreater(tech.LETHALITY[6], tech.LETHALITY[0] * 1.5)


class CampaignTests(unittest.TestCase):
    def fight(self, seed):
        sim = Simulation(population=2000, seed=seed)
        for _ in range(25):
            sim.tick(False)
        land, _sea = contacts(sim)
        pair = None
        for a in sorted(land):
            for b in sorted(land[a]):
                if a < b and sim.countries[a].ended is None and sim.countries[b].ended is None and (a, b) not in sim.wars:
                    pair = (a, b)
                    break
            if pair:
                break
        if pair is None:
            return None
        a, b = pair
        sim.countries[a].technologies = closure("rifled firearms", "artillery", "bastion forts")
        sim.countries[b].technologies = closure("spear making")
        sim.countries[a].research_project = sim.countries[b].research_project = None
        sim.war_log = []
        sim.truces.pop(pair, None) if hasattr(sim, "truces") else None
        sim.wars[pair] = sim.year
        for _ in range(6):
            if pair not in sim.wars:
                break
            sim.tick(False)
        rows = [r for r in sim.war_log if r["pair"] == list(pair)]
        return sim, pair, rows

    def test_the_better_armed_side_loses_fewer_of_its_levy(self):
        lost_a = levy_a = lost_b = levy_b = 0
        fought = 0
        for seed in (3, 5, 9, 14):
            result = self.fight(seed)
            if not result:
                continue
            sim, pair, rows = result
            for r in rows:
                fought += 1
                lost_a += r["losses"][0]
                levy_a += max(1, r["levies"][0])
                lost_b += r["losses"][1]
                levy_b += max(1, r["levies"][1])
                self.assertGreaterEqual(r["tiers"][0], 5)
                self.assertEqual(r["tiers"][1], 0)
        self.assertGreater(fought, 0)
        self.assertLess(lost_a / levy_a, lost_b / levy_b)

    def test_war_reports_name_the_armies(self):
        result = next((r for r in (self.fight(s) for s in (3, 4, 5, 6)) if r), None)  # any world with a land border
        self.assertIsNotNone(result)
        sim = result[0]
        updates = [m for _, m in sim.history if m.startswith("War update")]
        self.assertTrue(any("Armies:" in m and "riflemen" in m for m in updates))


if __name__ == "__main__":
    unittest.main()
