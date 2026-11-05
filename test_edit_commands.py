"""Manual intervention invariants; run with Thonny's Python and unittest."""
import copy
import pickle
import unittest
import subprocess
import sys
from pathlib import Path

from civsim import Simulation
from civic import command
from discoveries import INNOVATIONS
from society import TECHNOLOGIES


class EditCommandTests(unittest.TestCase):
    def setUp(self):
        self.sim = Simulation(1000, seed=23, war_chance=0, country_chance=0,
                              lineage_chance=0, disaster_chance=0)

    def edit(self, text):
        year = self.sim.year
        output, action = command(self.sim, text)
        self.assertEqual(action, 'edit', (text, output))
        self.assertTrue(output)
        self.assertEqual(self.sim.year, year, text)
        return output

    def invalid(self, text):
        before = pickle.dumps(self.sim)
        output, action = command(self.sim, text)
        self.assertEqual(action, 'inspect', (text, output))
        self.assertTrue(output)
        self.assertEqual(pickle.dumps(self.sim), before, text)

    def ownership(self):
        for person in self.sim.people.values():
            self.assertIsNone(person.died)
            place = self.sim.settlements[person.settlement]
            self.assertEqual(person.country, place.country)
            self.assertIsNone(place.abandoned)
        for country in self.sim.countries.values():
            if country.capital is not None:
                self.assertEqual(self.sim.settlements[country.capital].country, country.id)
        self.assertEqual(sum(x.deaths for x in self.sim.lineages.values()),
                         sum(x.died is not None for x in self.sim.archive.values()))

    def test_scalar_edits_and_readonly_changes(self):
        self.edit('set person 1 wealth 123.5')
        self.edit('set person 1 age 44')
        self.edit('set country 1 economy communism')
        self.edit('set simulation war_chance 0.25')
        self.assertEqual(self.sim.people[1].wealth, 123.5)
        self.assertEqual(self.sim.people[1].age, 44)
        self.assertEqual(self.sim.countries[1].economic_system, 'communism')
        self.assertEqual(self.sim.war_chance, .25)
        before = pickle.dumps(self.sim)
        self.assertEqual(command(self.sim, 'changes')[1], 'inspect')
        self.assertEqual(pickle.dumps(self.sim), before)

    def test_invalid_input_preserves_everything_including_rng(self):
        for text in ['set person 999999 wealth 3', 'set person 1 wealth nan',
                     'set person 1 wealth -2', 'set person 1 age -1',
                     'set country 1 food inf', 'set country 1 economy nonsense',
                     'set simulation war_chance 1.1', 'set person 1 unknown 3',
                     'add person 99999', 'add disease Bad infection=2',
                     'add settlement 1 residents=99999', 'move person 1 999999',
                     'delete country 1 to=1', 'war 1 1']:
            with self.subTest(text=text):
                self.invalid(text)

    def test_invalid_command_preserves_previous_undo(self):
        old = self.sim.people[1].wealth
        self.edit('set person 1 wealth 321')
        self.invalid('set person 1 wealth NaN')
        self.edit('undo')
        self.assertEqual(self.sim.people[1].wealth, old)

    def test_undo_restores_generated_person_and_rng(self):
        before = pickle.dumps(self.sim)
        sid = self.sim.people[1].settlement
        self.edit(f'add person {sid} age=25')
        self.edit('undo')
        self.assertEqual(pickle.dumps(self.sim), before)

    def test_add_delete_person_archives_death_and_settles_estate(self):
        sid = self.sim.people[1].settlement
        before = set(self.sim.people)
        self.edit(f'add person {sid} name=Testchild age=0 parent=1')
        child_id, = set(self.sim.people) - before
        self.assertIn(1, self.sim.people[child_id].parents)
        self.edit('set person 1 wealth 100')
        heirs = [p for p in self.sim.people.values() if 1 in p.parents]
        fortunes = {p.id: p.wealth for p in heirs}
        self.edit('delete person 1')
        self.assertNotIn(1, self.sim.people)
        self.assertEqual(self.sim.archive[1].died, self.sim.year)
        self.assertEqual(self.sim.archive[1].wealth, 0)
        for heir in heirs:
            self.assertAlmostEqual(self.sim.people[heir.id].wealth,
                                   fortunes[heir.id] + 100 / len(heirs))
        self.ownership()

    def test_relocation_updates_country_and_offices(self):
        dest = next(s for s in self.sim.settlements.values() if s.country == 2)
        person = self.sim.countries[1].ruler
        self.edit(f'move person {person} {dest.id}')
        self.assertEqual(self.sim.people[person].country, 2)
        self.assertNotEqual(self.sim.countries[1].ruler, person)
        self.assertNotIn(person, self.sim.countries[1].offices.values())
        self.ownership()

    def test_settlement_creation_deletion_relocates_people(self):
        before = set(self.sim.settlements)
        n = len(self.sim.people)
        self.edit('add settlement 1 name=Newhaven residents=40')
        sid, = set(self.sim.settlements) - before
        residents = [p.id for p in self.sim.people.values() if p.settlement == sid]
        self.assertEqual(len(residents), 40)
        dest = next(s for s in self.sim.settlements.values() if s.country == 1 and s.id != sid)
        self.edit(f'delete settlement {sid} to={dest.id}')
        self.assertEqual(len(self.sim.people), n)
        self.assertTrue(all(self.sim.people[pid].settlement == dest.id for pid in residents))
        self.assertIsNotNone(self.sim.settlements[sid].abandoned)
        self.ownership()

    def test_country_creation_and_annexation_preserve_ownership(self):
        sid = self.sim.people[1].settlement
        before = set(self.sim.countries)
        n = len(self.sim.people)
        self.edit(f'add country {sid} name=Testland')
        cid, = set(self.sim.countries) - before
        self.assertEqual(self.sim.settlements[sid].country, cid)
        self.ownership()
        self.edit(f'delete country {cid} to=2')
        self.assertEqual(len(self.sim.people), n)
        self.assertIsNotNone(self.sim.countries[cid].ended)
        self.assertFalse(any(p.country == cid for p in self.sim.people.values()))
        self.assertFalse(any(s.country == cid and s.abandoned is None for s in self.sim.settlements.values()))
        self.ownership()

    def test_new_lineage_preserves_parent_branch(self):
        old = self.sim.people[1].lineage
        self.edit('add lineage 1 surname=Tester')
        new = self.sim.people[1].lineage
        self.assertNotEqual(old, new)
        self.assertEqual(self.sim.lineages[new].parent_lineage, old)
        self.assertEqual(self.sim.lineages[new].surname, 'Tester')

    def test_disease_infection_cure_outbreak_eradication(self):
        self.edit('add disease Testfever course=acute infection=0.3 death=0.01 recovery=0.9')
        self.edit('infect 1 Testfever')
        self.assertEqual(self.sim.people[1].infection, 'Testfever')
        self.edit('cure 1')
        self.assertIsNone(self.sim.people[1].infection)
        self.edit('outbreak 2 Testfever cases=7')
        self.assertEqual(sum(p.infection == 'Testfever' for p in self.sim.people.values()), 7)
        self.invalid('delete disease Testfever')  # no cure yet
        self.edit('set disease Testfever cure 100')
        self.invalid('eradicate Testfever')  # cured, but people are still infected
        for person in [p for p in self.sim.people.values() if p.infection == 'Testfever']:
            self.edit(f'cure {person.id}')
        self.edit('eradicate Testfever')
        self.assertFalse(any(p.infection == 'Testfever' for p in self.sim.people.values()))
        self.assertNotIn('Testfever', self.sim.sicknesses)

    def test_scientists_and_healers_build_cure_progress(self):
        self.edit('add disease Slowpox course=acute infection=0.3 death=0.01 recovery=0.9')
        for person in list(self.sim.people.values())[:60]:
            person.job = 'healer' if person.age >= 18 else person.job
        from epidemiology import advance_cures
        for _ in range(5):
            advance_cures(self.sim)
        first = self.sim.cure_progress['Slowpox']
        self.assertGreater(first, 0)
        self.assertLess(first, 100)
        self.assertIn('Cure progress', command(self.sim, 'disease Slowpox')[0])

    def test_discovery_prerequisites_and_cascading_revocation(self):
        self.invalid('grant 1 "crop rotation"')
        self.invalid('grant 1 irrigation')
        for base in ('"stone tools"', '"seed gathering"', 'irrigation'):
            self.edit(f'grant 1 {base}')
        self.invalid('grant 1 "crop rotation"')
        for base in ('"animal husbandry"', 'composting'):
            self.edit(f'grant 1 {base}')
        self.edit('grant 1 "crop rotation"')
        innovation = next(i for i in INNOVATIONS.values()
                          if i.prerequisites <= self.sim.countries[1].technologies)
        self.edit(f'grant 1 {innovation.id}')
        self.assertIn(innovation.id, self.sim.countries[1].innovations)
        self.edit('revoke 1 irrigation')
        c = self.sim.countries[1]
        self.assertNotIn('crop rotation', c.technologies)
        for tech in c.technologies:
            self.assertLessEqual(TECHNOLOGIES[tech][0], c.technologies)
        for key in c.innovations:
            self.assertLessEqual(INNOVATIONS[key].prerequisites, c.technologies)

    def test_war_and_negotiated_peace(self):
        self.edit('war 1 2')
        self.assertIn((1, 2), self.sim.wars)
        self.edit('peace 1 2 years=5')
        self.assertNotIn((1, 2), self.sim.wars)
        self.invalid('war 1 2')
        self.edit('war 1 2 force=true')
        self.assertIn((1, 2), self.sim.wars)

    def test_famine_trigger_and_relief(self):
        self.edit('trigger 1 Famine')
        c = self.sim.countries[1]
        self.assertIn('Famine', c.conditions)
        self.assertLessEqual(c.crisis_until['Famine'] - self.sim.year, 5)
        self.edit('trigger 1 Abundance')
        self.assertNotIn('Famine', self.sim.countries[1].conditions)

    def test_historical_years_frozen_and_next_tick_accounting(self):
        self.sim.tick(False)
        reports = copy.deepcopy(self.sim.yearly_reports)
        sid = next(iter(self.sim.settlements))
        self.edit(f'add person {sid} name=Newperson age=30')
        self.edit('delete person 1')
        self.assertEqual(self.sim.yearly_reports, reports)
        self.assertEqual(self.sim.pending_interventions['added'], 1)
        self.assertEqual(self.sim.pending_interventions['deaths'], 1)
        start = len(self.sim.people)
        archive_deaths = sum(p.died is not None for p in self.sim.archive.values())
        births, deaths = self.sim.tick(False)
        self.assertEqual(len(self.sim.people), start + births - deaths)
        self.assertEqual(sum(p.died is not None for p in self.sim.archive.values()) - archive_deaths, deaths)
        self.assertEqual(sum(self.sim.yearly_reports[-1]['death_causes'].values()), deaths)
        self.ownership()
        self.invalid('undo')

    def test_disaster_deaths_are_accounted_and_undoable(self):
        before = pickle.dumps(self.sim)
        population = len(self.sim.people)
        self.edit('disaster 1 flood severity=major')
        deaths = population - len(self.sim.people)
        self.assertGreaterEqual(deaths, 0)
        self.assertEqual(self.sim.pending_interventions['deaths'], deaths)
        self.ownership()
        self.edit('undo')
        self.assertEqual(pickle.dumps(self.sim), before)

    def test_settlement_transfer_moves_all_residents(self):
        sid = self.sim.people[1].settlement
        residents = [p.id for p in self.sim.people.values() if p.settlement == sid]
        self.edit(f'set settlement {sid} country 2')
        self.assertTrue(all(self.sim.people[pid].country == 2 for pid in residents))
        self.ownership()

    def test_ambiguous_names_do_not_select_arbitrary_person(self):
        self.edit('set person 1 name "Shared Name"')
        self.edit('set person 2 name "Shared Name"')
        self.invalid('set person "Shared Name" wealth 15')

    def test_inspection_with_undo_preserves_complete_state(self):
        self.edit('add disease Testfever')
        self.edit('outbreak 1 Testfever cases=5')
        self.edit('war 1 2')
        before = pickle.dumps(self.sim)
        for text in ('person 1', 'people country=1 page=2', 'settlement 1',
                     'settlements country=1', 'demographics', 'demographics 1',
                     'wars', 'wars 1', 'diseases', 'diseases 1', 'disease Testfever',
                     'catalog irrigation', 'catalog page=2', 'changes', 'help edit'):
            self.assertEqual(command(self.sim, text)[1], 'inspect')
            self.assertEqual(pickle.dumps(self.sim), before, text)

    def test_eradicating_established_endemic_disease_then_tick(self):
        self.edit('add disease "Mild cold" course=endemic death=0')
        self.edit('outbreak 1 "Mild cold" cases=10')
        self.sim.tick(False)
        self.assertIn('Mild cold', self.sim.countries[1].disease_outbreaks)
        self.edit('set disease "Mild cold" cure 100')
        for person in [p for p in self.sim.people.values() if p.infection == 'Mild cold']:
            self.edit(f'cure {person.id}')
        self.edit('delete disease "Mild cold"')
        self.assertIn('retired', command(self.sim, 'disease "Mild cold"')[0])
        for _ in range(3):
            self.sim.tick(False)
            self.assertFalse(any(p.infection == 'Mild cold' for p in self.sim.people.values()))
            self.ownership()

    def test_rejected_options_huge_numbers_and_parent_ages(self):
        self.edit('add person 1 age=0 parent=1')
        for text in ('set person 1 age 5', 'add person 1 age=80 parent=1',
                     'set person 1 wealth 1e308', 'set person 1 age ' + '9' * 400,
                     'add person 1 surname=Vale parent=1', 'add person 1 typo=3',
                     'set country 1 ruler 999999', 'add disease "bad quote',
                     'delete settlement 1', 'delete country 1'):
            self.invalid(text)

    def test_edit_country_and_settlement_then_continue_naturally(self):
        self.edit('add settlement 1 name=Newhaven residents=30')
        self.edit('add country 5 name=Newland')
        self.edit('set country 3 government council')
        self.edit('set country 3 economy capitalism')
        self.edit('grant 3 counting')
        self.edit('add person 5 name=Ada age=30 surname=Vale')
        self.edit('set person 1001 job scientist')
        self.edit('set country 3 ruler 1001')
        self.edit('add lineage 1001 surname=Branch')
        self.edit('delete country 2 to=3')
        for _ in range(10):
            before = len(self.sim.people)
            births, deaths = self.sim.tick(False)
            self.assertEqual(len(self.sim.people), before + births - deaths)
            self.ownership()

    def test_real_cli_edit_and_inspection_session(self):
        inputs = '\n'.join(['demographics', 'people page=2', 'person 1', 'settlements',
            'add disease "Glass fever" death=0', 'outbreak 1 "Glass fever" cases=3',
            'disease "Glass fever"', 'set person 1 wealth 500',
            'add person 1 name=Ada age=25 surname=Vale', 'person 1001',
            'delete person 1001', 'person 1001', 'undo',
            'add settlement 1 name=Newhaven residents=40',
            'add country 5 name=Newland', 'war 1 2', 'wars', 'changes', '',
            'peace 1 2', 'wars', 'quit', ''])
        result = subprocess.run([sys.executable, 'civsim.py', '--years', '2', '--population', '1000', '--seed', '23'],
                                input=inputs, text=True, capture_output=True, cwd=Path(__file__).parent, timeout=30)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertNotIn('Command error:', result.stdout)
        self.assertIn('Person: Ada Vale', result.stdout)
        self.assertIn('Status: deceased', result.stdout)
        self.assertIn('Undid the most recent edit', result.stdout)
        self.assertIn('editor additions 1, editor deaths 0', result.stdout)
        self.assertEqual([line for line in result.stdout.splitlines() if line.startswith('Year ')], ['Year 0', 'Year 1'])


if __name__ == '__main__':
    unittest.main()
