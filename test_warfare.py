"""Combat regression checks; run with Thonny's Python."""
import unittest
from civsim import Simulation
from warfare import resolve_wars, _transfer
from unittest.mock import Mock


class WarfareTests(unittest.TestCase):
    def test_campaign_accounts_for_every_death_and_territory(self):
        for seed in range(8):
            sim = Simulation(population=2000, seed=seed, war_chance=1)
            for year in range(1, 21):
                sim.year = year
                before = len(sim.people)
                lineage_before = sum(x.deaths for x in sim.lineages.values())
                populations = {cid: sum(p.country == cid for p in sim.people.values())
                               for cid in sim.countries}
                deaths = resolve_wars(sim)
                for pair, detail in sim.war_details.items():
                    for i, cid in enumerate(pair):
                        self.assertLessEqual(detail["mobilized"][i], int(populations[cid] * .08))
                self.assertEqual(before - len(sim.people), deaths)
                self.assertEqual(sum(x.deaths for x in sim.lineages.values()) - lineage_before, deaths)
                for person in sim.people.values():
                    if person.settlement is not None:
                        self.assertEqual(person.country, sim.settlements[person.settlement].country)

    def test_wounded_people_cannot_be_recruited(self):
        sim = Simulation(population=1000, seed=18, war_chance=0)
        countries = list(sim.countries)[:2]
        pair = tuple(sorted(countries))
        sim.wars[pair] = sim.year
        for person in sim.people.values():
            person.wounded_until = sim.year + 3
        before = len(sim.people)
        self.assertEqual(resolve_wars(sim), 0)
        self.assertEqual(len(sim.people), before)
        self.assertNotIn(pair, sim.wars)
        self.assertGreater(sim.truces[pair], sim.year)

    def test_capture_transfers_residents_and_capital(self):
        sim = Simulation(population=1000, seed=25)
        victor, defeated = list(sim.countries)[:2]
        target = next(s for s in sim.settlements.values() if s.country == defeated)
        sim.countries[defeated].capital = target.id
        people = [p for p in sim.people.values() if p.settlement == target.id]
        count = len(sim.people)
        _transfer(sim, victor, defeated, target)
        self.assertEqual(target.country, victor)
        self.assertTrue(all(p.country == victor for p in people))
        self.assertNotEqual(sim.countries[defeated].capital, target.id)
        self.assertEqual(len(sim.people), count)

    def test_annexation_ends_country_without_killing_residents(self):
        sim = Simulation(population=1000, seed=27)
        victor, defeated = list(sim.countries)[:2]
        count = len(sim.people)
        _transfer(sim, victor, defeated)
        self.assertEqual(len(sim.people), count)
        self.assertEqual(sim.countries[defeated].ended, sim.year)
        self.assertIsNone(sim.countries[defeated].capital)
        self.assertFalse(any(p.country == defeated for p in sim.people.values()))
        self.assertFalse(any(s.country == defeated for s in sim.settlements.values()))

    def test_campaign_can_conquer_last_settlement(self):
        sim = Simulation(1000, seed=27, war_chance=0)
        victor, defeated = 1, 2
        places = [s for s in sim.settlements.values() if s.country == defeated]
        final = places[0]
        for p in sim.people.values():
            p.age = 30
            if p.country == defeated:
                p.settlement = final.id
        for place in places[1:]:
            place.abandoned = 0
        sim.countries[defeated].food = 10
        sim.year = 3
        pair = (victor, defeated)
        sim.wars[pair] = 0
        sim.war_details = {pair: {"exhaustion": [0., 0.], "score": 5.}}
        sim.rng = Mock()
        sim.rng.random.return_value = .2
        sim.rng.uniform.return_value = 1
        sim.rng.choice.return_value = "field battle"
        sim.rng.sample.side_effect = lambda people, count: list(people)[:count]
        sim.rng.randint.return_value = 1
        before = len(sim.people)
        deaths = resolve_wars(sim)
        self.assertEqual(before - len(sim.people), deaths)
        self.assertEqual(sim.countries[defeated].ended, sim.year)
        self.assertNotIn(pair, sim.wars)
        self.assertTrue(all(p.country == victor for p in sim.people.values()))
        self.assertTrue(all(s.country == victor for s in sim.settlements.values()))
        self.assertTrue(any("conquered" in message for _, message in sim.history))

if __name__ == '__main__':
    unittest.main()
