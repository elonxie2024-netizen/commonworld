"""Name-first controls and optional advanced ID search."""
import pickle
import unittest

from civic import command
from civsim import Simulation
from discoveries import INNOVATIONS


class NameCommandTests(unittest.TestCase):
    def setUp(self):
        self.sim = Simulation(1000, seed=15, country_chance=0, war_chance=0)
        self.sim.countries[1].name = 'Arden'
        self.sim.countries[2].name = 'Newland'
        self.sim.settlements[1].name = 'River Town'
        self.sim.settlements[2].name = 'Hill Town'
        self.sim.lineages[1].surname = 'Vale'
        self.sim.lineages[2].surname = 'Vale'
        for pid in (1, 2, 3):
            p = self.sim.people[pid]
            p.first, p.age, p.born = 'Mara', 30, -30
        self.sim.name_holders.clear()
        for p in self.sim.archive.values():
            self.sim.register_name(p)

    def edit(self, text):
        output, action = command(self.sim, text)
        self.assertEqual(action, 'edit', output)
        self.assertEqual(self.sim.year, 0)
        return output

    def test_short_roman_names_choose_exact_person(self):
        for roman, pid in (('I', 1), ('II', 2), ('III', 3)):
            self.edit(f'set person "Mara Vale {roman}" wealth {pid * 123}')
            self.assertEqual(self.sim.people[pid].wealth, pid * 123)
            output = command(self.sim, f'person Mara Vale {roman}')[0]
            self.assertTrue(output.startswith(f'Person: Mara Vale {roman} of Arden\n'))

    def test_ambiguity_lists_copyable_names_not_id_instructions(self):
        before = pickle.dumps(self.sim)
        output, action = command(self.sim, 'set person "Mara Vale" wealth 500')
        self.assertEqual(action, 'inspect')
        self.assertIn('Mara Vale I of Arden', output)
        self.assertIn('Mara Vale II of Arden', output)
        self.assertIn('full names', output)
        self.assertNotIn('Use an ID', output)
        self.assertNotRegex(output, r'#\d+')
        self.assertEqual(pickle.dumps(self.sim), before)

    def test_missing_roman_i_cannot_modify_roman_ii(self):
        self.edit('delete person "Mara Vale I of Arden"')
        before = pickle.dumps(self.sim)
        result, action = command(self.sim, 'set person "Mara Vale I" wealth 999')
        self.assertEqual(action, 'inspect')
        self.assertIn('No living person', result)
        self.assertEqual(pickle.dumps(self.sim), before)
        self.assertIn('deceased', command(self.sim, 'person Mara Vale I')[0])

    def test_everyday_views_show_names_without_indices(self):
        for text in ('people Mara', 'person Mara Vale II', 'settlements',
                     'settlement River Town', 'countries', 'richest', 'notables', 'demographics'):
            output, action = command(self.sim, text)
            self.assertEqual(action, 'inspect')
            self.assertNotRegex(output, r'#\d+')
            self.assertNotIn('using its ID', output)
        self.assertIn('person NAME', command(self.sim, 'help')[0])
        self.assertIn('Mara Vale II of Arden', command(self.sim, 'help edit')[0])

    def test_ids_search_is_readonly_with_undo_available(self):
        self.edit('set person "Mara Vale II" wealth 500')
        before = pickle.dumps(self.sim)
        cases = {'ids person Mara': 'person [2]: Mara Vale II of Arden',
                 'ids country Arden': 'country [1]: Arden',
                 'ids settlement "River Town"': 'settlement [1]: River Town',
                 'ids lineage Vale': 'lineage [2]: Vale II',
                 'ids discovery "seed selection"': '00-01-00',
                 'ids Mara': 'person [2]',
                 'ids person #2': 'Mara Vale II of Arden',
                 'ids person page=2': 'page 2/',
                 'ids person page=0': 'positive integer',
                 'help ids': 'Optional advanced ID lookup'}
        for text, expected in cases.items():
            output, action = command(self.sim, text)
            self.assertEqual(action, 'inspect')
            self.assertIn(expected, output, text)
            self.assertEqual(pickle.dumps(self.sim), before, text)
        self.edit('undo')

    def test_ids_remain_usable_after_lookup(self):
        self.assertIn('person [2]:', command(self.sim, 'ids person "Mara Vale II"')[0])
        self.edit('set person #2 wealth 700')
        self.assertEqual(self.sim.people[2].wealth, 700)
        self.assertEqual(command(self.sim, 'person #2'), command(self.sim, 'person Mara Vale II'))

    def test_names_in_filters_parents_lineages_and_destinations(self):
        self.assertIn('500 matches', command(self.sim, 'people country=Arden')[0])
        self.assertIn('250 matches', command(self.sim, 'people settlement="River Town"')[0])
        self.edit('add person "River Town" name=Ada parent="Mara Vale II of Arden"')
        child = self.sim.people[1001]
        self.assertEqual(child.parents, (2,))
        self.edit('set person "Mara Vale II" lineage "Vale II"')
        self.assertEqual(self.sim.people[2].lineage, 2)
        self.edit('move person "Mara Vale II of Arden" "Hill Town"')
        self.assertEqual(self.sim.people[2].settlement, 2)
        self.edit('set country Arden ruler "Mara Vale II of Arden"')
        self.assertEqual(self.sim.countries[1].ruler, 2)
        self.edit('add settlement Arden name=Newhaven founder="Mara Vale II of Arden" residents=10')
        self.edit('delete settlement Newhaven to="River Town"')
        self.assertEqual(self.sim.people[2].settlement, 1)

    def test_discovery_names_and_advanced_keys_both_work(self):
        for base in ('"stone tools"', '"seed gathering"', 'irrigation'):
            self.edit(f'grant Arden {base}')
        innovation = next(i for i in INNOVATIONS.values() if i.prerequisites <= self.sim.countries[1].technologies)
        self.edit(f'grant Arden "{innovation.name}"')
        self.assertIn(innovation.id, self.sim.countries[1].innovations)
        self.assertIn(innovation.id, command(self.sim, f'ids discovery "{innovation.name}"')[0])
        self.edit(f'revoke 1 {innovation.id}')
        self.assertNotIn(innovation.id, self.sim.countries[1].innovations)


if __name__ == '__main__':
    unittest.main()
