"""Discovery graph, persistent effect, research and event regression checks."""
import unittest
from types import SimpleNamespace
import random

import discoveries as d
import society as s


class SocietyTests(unittest.TestCase):
    def setUp(self):
        self.country = SimpleNamespace(id=1, name='Testland', technologies=set(),
            innovations={}, research=0, prosperity=70, food=60, stability=60,
            capacity=1000, ended=None, sickness=None)
        self.actor = SimpleNamespace(id=1, age=30, fame=0, job='farmer')
        self.messages = []
        self.sim = SimpleNamespace(year=1, rng=random.Random(4),
            person_reference=lambda actor: 'Researcher',
            record=lambda message, category: self.messages.append((message, category)))

    def test_catalog_unique_and_meaningful(self):
        self.assertEqual(len(d.INNOVATIONS), 1000)
        self.assertEqual(len({i.name for i in d.INNOVATIONS.values()}), 1000)
        for item in d.INNOVATIONS.values():
            self.assertTrue(item.prerequisites <= s.TECHNOLOGIES.keys())
            self.assertTrue(any(item.effects))
            self.assertTrue(item.modifiers)
            self.assertGreater(item.cost, 0)

    def test_foundations_acyclic_and_reachable(self):
        known = set()
        while True:
            added = {name for name in s.TECHNOLOGIES if s.technology.met(name, known)} - known
            if not added:
                break
            known |= added
        self.assertEqual(known, set(s.TECHNOLOGIES))

    def test_prerequisite_enforcement_and_idempotence(self):
        project = next(iter(d.INNOVATIONS.values()))
        self.assertFalse(d.award_innovation(self.sim, self.country, project, self.actor))
        self.country.technologies |= project.prerequisites
        self.assertTrue(d.award_innovation(self.sim, self.country, project, self.actor))
        before = self.country.food
        self.assertFalse(d.award_innovation(self.sim, self.country, project, self.actor))
        self.assertEqual(self.country.food, before)
        self.assertEqual(self.actor.job, 'scientist')
        self.assertGreater(self.actor.fame, 0)

    def test_foundation_prerequisites_guard_direct_awards(self):
        self.assertFalse(s.unlock(self.sim, self.country, 'vaccination', self.actor))
        self.assertNotIn('vaccination', self.country.technologies)
        self.assertTrue(s.unlock(self.sim, self.country, 'counting', self.actor))

    def test_effects_strong_bounded_and_integrated(self):
        base = s.technology_modifiers(self.country)
        self.country.innovations = {key: 1 for key in d.INNOVATIONS}
        improved = s.technology_modifiers(self.country)
        for key in ('production', 'research', 'military', 'logistics'):
            self.assertGreater(improved[key], base[key] * 1.5)
            self.assertLessEqual(improved[key], 2.5)
        for key in ('infection', 'disease_death', 'wound_death'):
            self.assertLess(improved[key], base[key] * .6)
            self.assertGreater(improved[key], 0)

    def test_sharing_honors_recipient_prerequisites(self):
        donor = SimpleNamespace(innovations={key: 1 for key in d.INNOVATIONS})
        self.assertFalse(d.share_innovation(self.sim, donor, self.country, [self.actor]))
        self.country.technologies.add('irrigation')
        self.assertTrue(d.share_innovation(self.sim, donor, self.country, [self.actor]))
        for item in d.acquired_innovations(self.country):
            self.assertLessEqual(item.prerequisites, self.country.technologies)

    def test_applied_research_finishes_with_funded_work(self):
        self.country.technologies = set(s.TECHNOLOGIES)
        for year in range(1, 31):
            self.sim.year = year
            d.advance_innovations(self.sim, self.country, [self.actor] * 400)
        self.assertGreater(len(self.country.innovations), 0)
        self.assertLessEqual(len(self.country.innovations), 30)

    def test_event_catalog_variety(self):
        self.assertEqual(len(s.EVENT_CATALOG), 1500)
        self.assertEqual(len({e['id'] for e in s.EVENT_CATALOG}), 1500)
        self.assertEqual(len({e['text'] for e in s.EVENT_CATALOG}), 1500)
        for event in s.EVENT_CATALOG:
            self.assertTrue(event['effects'])
            event['text'].format(actor='Ada', country='Testland')


if __name__ == '__main__':
    unittest.main()
