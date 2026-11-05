"""Knowledge that crosses borders: settlers, trade, conquest, and the research they credit."""
import unittest

import development
import society as s
import technology as tech
import warfare
from civic import command
from civsim import Simulation


def closure(*names):
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


class SharingTests(unittest.TestCase):
    def setUp(self):
        self.sim = Simulation(1000, seed=23, war_chance=0, country_chance=0, lineage_chance=0, disaster_chance=0)
        self.a, self.b = self.sim.countries[1], self.sim.countries[2]
        self.a.technologies = closure("weaving", "pottery", "stone tools", "fire making")
        self.b.technologies = closure("stone tools")
        self.adults = [p for p in self.sim.people.values() if p.country == 2 and p.age >= 18]

    def test_research_is_dearer_on_its_own(self):
        self.assertGreater(tech.COST_SCALE, 3.0)  # dearer than the old flat 3.0, with sharing to make up for it

    def test_learning_is_scaled_by_research_power_and_conquest_doubles_it(self):
        power = s.technology_modifiers(self.b)["research"]
        gain = s.learn(self.sim, self.b, "weaving", 10)
        self.assertAlmostEqual(gain, 10 * power)
        self.assertAlmostEqual(self.b.insight["weaving"], 10 * power)
        s.boosted_of(self.b).add("pottery")
        self.assertAlmostEqual(s.learn(self.sim, self.b, "pottery", 10), 20 * power)

    def test_only_what_could_be_used_is_passed_on(self):
        # a discovery whose prerequisites the taker lacks teaches nothing yet
        self.a.technologies |= closure("bronze weapons")
        for _ in range(30):
            got = s.pass_on_knowledge(self.sim, self.a, self.b, .2)
            if got:
                self.assertTrue(tech.met(got[0], self.b.technologies))
        self.assertFalse(any(not tech.met(n, self.b.technologies) for n in self.b.insight))

    def test_enough_insight_is_simply_learned(self):
        self.b.insight["weaving"] = s.TECHNOLOGIES["weaving"][1] + 1
        s.settle_insight(self.sim, self.b, self.adults)
        self.assertIn("weaving", self.b.technologies)
        self.assertNotIn("weaving", self.b.insight)

    def test_insight_counts_toward_the_current_project(self):
        cost = s.TECHNOLOGIES["weaving"][1]
        self.b.research_project = "weaving"
        self.b.insight["weaving"] = cost * .9
        self.b.research = cost * .4
        s.advance_research(self.sim, self.b, self.adults, {2: self.adults}, set())
        self.assertIn("weaving", self.b.technologies)
        self.assertNotIn("weaving", self.b.insight)

    def test_conquest_boosts_research_instead_of_handing_over_discoveries(self):
        self.a.technologies = closure("stone tools")
        self.b.technologies = closure("weaving", "pottery", "stone tools")
        warfare._transfer(self.sim, 1, 2)
        self.assertNotIn("weaving", self.a.technologies)
        self.assertEqual(s.boosted_of(self.a), {"weaving", "pottery"})
        self.a.research_project = None
        self.assertIn(self.sim.rng.choice(sorted(s.boosted_of(self.a))), {"weaving", "pottery"})
        s.unlock(self.sim, self.a, "weaving", next(iter(self.sim.people.values())))
        self.assertEqual(s.boosted_of(self.a), {"pottery"})

    def test_newcomers_change_country_and_teach_their_hosts(self):
        origin = next(x for x in self.sim.settlements.values() if x.country == 1)
        destination = next(x for x in self.sim.settlements.values() if x.country == 2)
        members = [p for p in self.sim.people.values() if p.settlement == origin.id and p.country == 1][:6]
        exp = {"id": 99, "kind": "emigrant", "country": 1, "origin": origin.id, "target_settlement": destination.id,
               "people": [p.id for p in members], "leader": members[0].id, "start": self.sim.year}
        development._list(self.sim, "expeditions").append(exp)
        for p in members:
            p.expedition = 99
        development._arrive_abroad(self.sim, exp, members, origin, self.a, destination)
        self.assertTrue(all(p.country == 2 and p.settlement == destination.id and not p.expedition for p in members if p.id != self.a.ruler))
        self.assertNotIn(exp, development._list(self.sim, "expeditions"))
        self.assertTrue(self.b.insight, "the host learned something from the newcomers")

    def test_trade_science_command(self):
        output, action = command(self.sim, f'trade science "{self.a.name}" "{self.b.name}"')
        self.assertEqual(action, "edit", output)
        self.assertTrue(self.sim.countries[2].insight)  # (edits may swap in a restored copy of the world)
        self.sim.wars[(1, 2)] = self.sim.year
        output, action = command(self.sim, f'trade science "{self.a.name}" "{self.b.name}"')
        self.assertEqual(action, "inspect", output)

    def test_science_pacts_share_every_year_and_war_ends_them(self):
        output, action = command(self.sim, f'trade pact "{self.a.name}" "{self.b.name}"')
        self.assertEqual(action, "edit", output)
        self.assertIn(2, s.pacts_of(self.sim.countries[1]))
        self.assertIn(1, s.pacts_of(self.sim.countries[2]))
        command(self.sim, f'trade end "{self.a.name}" "{self.b.name}"')
        self.assertFalse(s.pacts_of(self.sim.countries[1]))
        command(self.sim, f'trade pact "{self.a.name}" "{self.b.name}"')
        command(self.sim, f'war "{self.a.name}" "{self.b.name}"')
        self.assertFalse(s.pacts_of(self.sim.countries[1]) or s.pacts_of(self.sim.countries[2]))


if __name__ == "__main__":
    unittest.main()
