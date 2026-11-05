import copy
import unittest

from civsim import Simulation, Sickness
from inspection import inspect_command, resolve_entity


class InspectionTests(unittest.TestCase):
    def setUp(self):
        self.sim = Simulation(population=120, seed=17)

    def test_read_only_including_random_state(self):
        before = copy.deepcopy(self.sim.__dict__)
        rng = self.sim.rng.getstate()
        for text in ('people', 'people page=2', 'settlements', 'settlement 1', 'person 1', 'individual #1', 'people settlement=#1', 'demographics', 'demographics 1', 'wars', 'diseases', 'disease unknown'):
            result = inspect_command(self.sim, text)
            self.assertEqual(result[1], 'inspect')
        self.assertEqual(self.sim.rng.getstate(), rng)
        # Names generator and random instances compare by identity; inspect their states separately.
        self.assertEqual(self.sim.names.__dict__, {**before['names'].__dict__, 'rng': self.sim.rng})
        for key, value in before.items():
            if key not in {'rng', 'names'}:
                self.assertEqual(self.sim.__dict__[key], value, key)

    def test_pages_and_validation(self):
        page1 = inspect_command(self.sim, 'people')[0]
        page2 = inspect_command(self.sim, 'people page=2')[0]
        self.assertIn('page 1/3', page1)
        self.assertIn(self.sim.full_name(self.sim.people[50]) + ' |', page1)
        self.assertNotIn(self.sim.full_name(self.sim.people[51]) + ' |', page1)
        self.assertIn(self.sim.full_name(self.sim.people[51]) + ' |', page2)
        self.assertIn('positive integer', inspect_command(self.sim, 'people page=0')[0])
        self.assertIn('does not exist', inspect_command(self.sim, 'people page=999')[0])

    def test_person_details_and_archive(self):
        person = self.sim.people.pop(1)
        person.died = 0
        person.cause_of_death = 'test cause'
        person.infection_history = [{'year': 0, 'event': 'infected', 'disease': 'Test fever'}]
        output = inspect_command(self.sim, 'person #1')[0]
        for label in ('deceased', 'test cause', 'Test fever', 'Wealth:', 'Parents:', 'Children:', 'Lineage:', 'Country:', 'Settlement:'):
            self.assertIn(label, output)
        self.assertIn(self.sim.full_name(person), inspect_command(self.sim, 'people')[0])

    def test_lookup_ambiguity_and_exact_priority(self):
        places = self.sim.settlements
        first = next(iter(places.values()))
        self.assertIs(resolve_entity(places, '#' + str(first.id), 'settlement'), first)
        self.assertIs(resolve_entity(places, first.name.upper(), 'settlement'), first)
        people = self.sim.archive
        with self.assertRaisesRegex(ValueError, 'Ambiguous person:.*full names'):
            resolve_entity(people, 'of ', 'person', self.sim.full_name)
        self.assertIn('No person', inspect_command(self.sim, 'person 999999')[0])

    def test_country_and_settlement_filters(self):
        country = self.sim.countries[1]
        self.assertIn('120 matches', inspect_command(self.sim, f'people "{country.name}"')[0])
        settlement = self.sim.settlements[1]
        expected = sum(p.settlement == 1 for p in self.sim.archive.values())
        self.assertIn(f'{expected} matches', inspect_command(self.sim, 'people settlement=#1')[0])
        self.assertIn(settlement.name, inspect_command(self.sim, 'settlement 1')[0])
        self.assertIsNone(inspect_command(self.sim, 'help'))

    def test_demographics_and_country_ids(self):
        output = inspect_command(self.sim, 'demographics #1')[0]
        for label in ('Living population: 120', 'Age bands:', 'Wealth:', 'Currently infected:'):
            self.assertIn(label, output)
        self.assertIn('Annual simulation report:', inspect_command(self.sim, 'demographics')[0])
        self.assertIn('120 matches', inspect_command(self.sim, 'people country=#1')[0])

    def test_war_details_and_truces(self):
        sim = Simulation(population=1000, seed=5)
        sim.wars[(1, 2)] = 0
        sim.war_details = {(1, 2): {'mobilized': [12, 15], 'supplies': [.8, .6], 'exhaustion': [3, 5], 'score': 2, 'captures': [0, 1], 'objectives': [2, 1]}}
        sim.truces = {(1, 2): 4}
        before = copy.deepcopy(sim.war_details)
        output = inspect_command(sim, 'wars #1')[0]
        for label in ('mobilized: 12', 'supplies: 0.8', 'exhaustion: 3', 'captures: 1', 'Campaign score: 2.00', 'expires year 4; active'):
            self.assertIn(label, output)
        self.assertEqual(before, sim.war_details)
        self.assertIsNone(inspect_command(sim, 'war 1 2'))

    def test_disease_details_retired_and_trends(self):
        sim = self.sim
        disease = Sickness('Test fever', .2, .01, .3)
        sim.sicknesses[disease.name] = disease
        sim.people[1].infection = disease.name
        sim.people[2].immunity.add(disease.name)
        sim.people[2].immunity_until[disease.name] = 2
        sim.people[2].infection_history = [{'event': 'vaccinated', 'disease': disease.name, 'year': 0}]
        sim.countries[1].disease_outbreaks = {disease.name: {'annual': [{'year': 0, 'infections': 2, 'deaths': 0, 'recoveries': 1, 'active': 1, 'phase': 'growing'}]}}
        before = copy.deepcopy(sim.__dict__)
        output = inspect_command(sim, 'disease "Test fever"')[0]
        for label in ('Active cases: 1', 'unexpired immunity: 1', 'vaccinated: 1', 'infections 2', 'growing'):
            self.assertIn(label, output)
        self.assertIn('cases 1', inspect_command(sim, 'diseases #1')[0])
        self.assertEqual(before['countries'], sim.countries)
        self.assertEqual(before['archive'], sim.archive)
        self.assertEqual(before['rng'].getstate(), sim.rng.getstate())
        for key, value in before.items():
            if key not in {'rng', 'names'}:
                self.assertEqual(sim.__dict__[key], value, key)
        sim.retired_sicknesses = {disease.name: sim.sicknesses.pop(disease.name)}
        self.assertIn('(retired)', inspect_command(sim, 'disease Test fever')[0])
        self.assertIs(resolve_entity(sim.retired_sicknesses, 'test FEVER', 'disease'), disease)
        sim.sicknesses['Test cough'] = Sickness('Test cough', .1, .01, .2)
        self.assertIn('Ambiguous', inspect_command(sim, 'disease Test')[0])


if __name__ == '__main__':
    unittest.main()
