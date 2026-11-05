import unittest

from civsim import Simulation, Sickness
from epidemiology import resolve_disease, _profile, _history, _local_outbreak


class DiseaseCourseTests(unittest.TestCase):
    def make_sim(self, course, infected=True):
        sim = Simulation(population=1, seed=19, country_chance=0, war_chance=0)
        country = sim.countries[1]
        country.sickness = "test fever"
        disease = Sickness("test fever", 0.0, 0.0, 0.0 if course == "chronic" else 1.0, "contact", 0, 8, 0.0)
        # Set dynamically too, so this test works with the current frozen model
        # and with the optional backward-compatible course field.
        object.__setattr__(disease, "course", course)
        sim.sicknesses[disease.name] = disease
        if infected:
            person = next(iter(sim.people.values()))
            person.infection = disease.name
            person.infection_steps = 1
            _history(person, "infected", disease.name, sim.year)
        return sim, country, next(iter(sim.people.values()))

    def test_acute_wave_resolves_and_tracks_recovery(self):
        sim, country, person = self.make_sim("acute")
        self.assertEqual(resolve_disease(sim, country, [person]), 0)
        self.assertIsNone(person.infection)
        self.assertIn("test fever", person.immunity)
        self.assertEqual(person.infection_history[-1]["event"], "recovered")
        self.assertIsNone(country.sickness)

    def test_chronic_case_persists_without_recovery(self):
        sim, country, person = self.make_sim("chronic")
        resolve_disease(sim, country, [person])
        self.assertEqual(person.infection, "test fever")
        self.assertNotIn("test fever", person.immunity)

    def test_endemic_course_is_stable_and_cooldown_bounded(self):
        sim, country, person = self.make_sim("endemic", infected=False)
        person.immunity.add("test fever")
        self.assertEqual(_profile(sim, "test fever")["course"], "endemic")
        state = _local_outbreak(sim, country, "test fever")
        # An endemic disease remains a source and uses a three-year lull after
        # a wave clears; the counter is decremented once per simulated year.
        state["cooldown_until"] = 3
        for _ in range(3):
            sim.year += 1
            resolve_disease(sim, country, [person])
        self.assertEqual(state["age"], 3)
        self.assertLessEqual(state["cooldown_until"], sim.year)
        self.assertEqual(country.sickness, "test fever")

    def test_death_is_removed_once_and_counted_in_lineage(self):
        sim = Simulation(population=1, seed=2, country_chance=0, war_chance=0)
        country = sim.countries[1]
        person = next(iter(sim.people.values()))
        disease = Sickness("fatal fever", 0.0, 1.0, 0.0, "contact", 0, 8, 0.0)
        object.__setattr__(disease, "course", "acute")
        sim.sicknesses[disease.name] = disease
        person.infection = disease.name
        person.infection_steps = 1
        self.assertEqual(resolve_disease(sim, country, [person]), 1)
        self.assertNotIn(person.id, sim.people)
        self.assertEqual(sim.lineages[person.lineage].deaths, 1)
        self.assertEqual(person.cause_of_death, disease.name)
        self.assertEqual(person.infection_history[-1]["event"], "died")

    def test_chronic_recovery_is_possible(self):
        sim, country, person = self.make_sim("chronic")
        from dataclasses import replace
        sim.sicknesses["test fever"] = replace(sim.sicknesses["test fever"], recovery_chance=1)
        resolve_disease(sim, country, [person])
        self.assertIsNone(person.infection)
        self.assertIn("test fever", person.immunity)

    def test_acute_growth_peak_and_decline_across_seeds(self):
        for seed in range(5):
            sim = Simulation(800, seed=seed, country_chance=0, war_chance=0)
            country = sim.countries[1]
            country.sickness = "wave"
            sim.sicknesses["wave"] = Sickness("wave", .55, .04, .85,
                                               incubation_steps=1, mutation_chance=0)
            for year in range(1, 13):
                sim.year = year
                before = len(sim.people)
                deaths = resolve_disease(sim, country, list(sim.people.values()))
                self.assertEqual(before - len(sim.people), deaths)
            rows = country.disease_outbreaks["wave"]["annual"]
            cases = [r["infections"] for r in rows]
            self.assertGreater(max(cases), cases[0] * 1.4)
            self.assertLess(cases[-1], max(cases) * .1)
            self.assertGreater(sum(r["deaths"] for r in rows), 0)
            self.assertLess(sum(p.infection is not None for p in sim.people.values()), 5)

    def test_mild_endemic_disease_recurs_after_immunity_expires(self):
        sim = Simulation(300, seed=33, country_chance=0, war_chance=0)
        country = sim.countries[1]
        country.sickness = "common cold"
        sim.sicknesses["common cold"] = Sickness("common cold", .5, 0, .98,
            immunity_years=1, mutation_chance=0, course="endemic", recurring=True)
        for year in range(1, 16):
            sim.year = year
            resolve_disease(sim, country, list(sim.people.values()))
        rows = country.disease_outbreaks["common cold"]["annual"]
        self.assertGreater(sum(r["infections"] > 0 for r in rows), 5)
        self.assertEqual(len(sim.people), 300)
        self.assertTrue(any(sum(h["event"] == "infected" for h in getattr(p, "infection_history", [])) > 1
                            for p in sim.people.values()))

    def test_outbreak_clocks_are_country_local(self):
        sim = Simulation(1000, seed=15)
        sim.sicknesses["shared"] = Sickness("shared", 0, 0, 0, mutation_chance=0, course="endemic")
        for year in range(1, 4):
            sim.year = year
            for country in sim.countries.values():
                country.sickness = "shared"
                resolve_disease(sim, country, [p for p in sim.people.values() if p.country == country.id])
        self.assertEqual([c.disease_outbreaks["shared"]["age"] for c in sim.countries.values()], [3, 3])


if __name__ == "__main__":
    unittest.main()
