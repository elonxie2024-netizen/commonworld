"""Integration and command regressions; standard library only."""
import copy
import io
import math
import pickle
import random
import subprocess
import sys
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest.mock import Mock

from civsim import Simulation, NameGenerator
from civic import command, annual_civic, refresh_public_roles
from discoveries import INNOVATIONS
from society import TECHNOLOGIES


class IntegrationTests(unittest.TestCase):
    def test_default_population_and_countries(self):
        sim = Simulation(seed=3)
        self.assertEqual(len(sim.people), 2000)
        self.assertEqual(len(sim.countries), 4)
        self.assertEqual(sim.lineage_chance, .002)
        self.assertEqual({c.economic_system for c in sim.countries.values()},
                         {"mixed", "capitalism", "communism"})

    def test_all_inspections_preserve_entire_simulation_and_rng(self):
        sim = Simulation(1000, seed=5)
        sim.tick(False)
        country = sim.countries[1].name
        commands = ["help", "lineage", "lineages", "rich", "richest", "inventions",
                    "discoveries", "innovations", "roles", "government", "people", "notables",
                    "countries", "country", "bad command", "rich no-such-country"]
        commands += [name + " " + country for name in
                     ("rich", "richest", "inventions", "discoveries", "country", "roles", "notables")]
        before = pickle.dumps(sim)
        for text in commands:
            output, action = command(sim, text)
            self.assertEqual(action, "inspect", text)
            self.assertTrue(output, text)
            self.assertEqual(pickle.dumps(sim), before, text)
        self.assertEqual(command(sim, "")[1], "next")
        self.assertEqual(command(sim, "quit")[1], "quit")
        self.assertEqual(pickle.dumps(sim), before)

    def test_richest_uses_real_wealth_and_country_filter(self):
        sim = Simulation(1000, seed=8)
        person = next(p for p in sim.people.values() if p.country == 2)
        person.wealth = 1000000
        self.assertIn(sim.full_name(person), command(sim, "richest")[0].splitlines()[1])
        self.assertNotIn(sim.full_name(person), command(sim, "rich " + sim.countries[1].name)[0])

    def test_economies_have_distinct_distribution(self):
        base = Simulation(100, seed=6)
        for p in base.people.values():
            p.age = 30
            p.wealth = 100
            p.job = "farmer"
        rich_id = next(iter(base.people))
        base.people[rich_id].wealth = 100000
        results = {}
        for system in ("capitalism", "communism"):
            sim = copy.deepcopy(base)
            sim.countries[1].economic_system = system
            sim.year = 1
            annual_civic(sim)
            results[system] = sim
        self.assertGreater(results["capitalism"].people[rich_id].wealth,
                           results["communism"].people[rich_id].wealth)
        gains = {system: [p.wealth - base.people[p.id].wealth for p in sim.people.values()]
                 for system, sim in results.items()}
        self.assertAlmostEqual(max(gains["communism"]), min(gains["communism"]))
        self.assertGreater(max(gains["capitalism"]) - min(gains["capitalism"]), 1)
        for sim in results.values():
            self.assertEqual(sim.countries[1].government, "monarchy")
            self.assertTrue(all(math.isfinite(p.wealth) and p.wealth >= 0 for p in sim.people.values()))

    def test_estate_inherited_once(self):
        sim = Simulation(2, seed=7)
        parent, child = list(sim.people.values())
        parent.wealth, child.wealth = 100, 0
        child.parents, child.age = (parent.id,), 1
        parent.died = sim.year = 1
        del sim.people[parent.id]
        annual_civic(sim)
        self.assertEqual(child.wealth, 100)
        self.assertEqual(parent.wealth, 0)
        sim.year += 1
        annual_civic(sim)
        self.assertEqual(child.wealth, 100)

    def test_office_holder_must_live_in_country(self):
        sim = Simulation(1000, seed=18)
        c = sim.countries[1]
        title, pid = next(iter(c.offices.items()))
        sim.people[pid].country = 2
        refresh_public_roles(sim)
        self.assertNotEqual(c.offices.get(title), pid)
        for country in sim.countries.values():
            for holder in country.offices.values():
                self.assertEqual(sim.people[holder].country, country.id)

    def test_famine_and_drought_have_bounds_and_four_clear_years(self):
        for crisis, maximum in (("Famine", 4), ("Drought", 3)):
            sim = Simulation(20, seed=4)
            country = sim.countries[1]
            sim.rng = Mock()
            sim.rng.random.return_value = .9
            sim.rng.choice.return_value = crisis
            sim.rng.randint.return_value = maximum
            run = 0
            last_ended = None
            was_active = False
            for year in range(1, 51):
                sim.year = year
                event = sim.pickevent(country)
                active = crisis in country.conditions
                if active:
                    run += 1
                    if not was_active and last_ended is not None:
                        self.assertGreaterEqual(year - last_ended, 4)
                else:
                    if was_active:
                        last_ended = year
                    run = 0
                    self.assertNotEqual(event, crisis)
                self.assertLessEqual(run, maximum)
                was_active = active

    def test_early_famine_relief_starts_cooldown(self):
        sim = Simulation(10, seed=1)
        c = sim.countries[1]
        c.conditions.add("Famine")
        c.crisis_until["Famine"] = 4
        sim.year = 1
        sim.rng = Mock()
        sim.rng.random.return_value = .9
        sim.rng.choice.return_value = "Abundance"
        sim.pickevent(c)
        self.assertNotIn("Famine", c.conditions)
        self.assertEqual(c.crisis_cooldown["Famine"], 5)

    def test_names_never_one_letter(self):
        names = NameGenerator(random.Random(42))
        for _ in range(3000):
            self.assertGreaterEqual(len(names.make("first")), 2)
            self.assertGreaterEqual(len(names.make("last")), 2)

    def test_duplicate_names_keep_roman_numerals_and_country(self):
        sim = Simulation(2, seed=12)
        a, b = sim.people.values()
        b.first, b.lineage = a.first, a.lineage
        sim.register_name(b)
        self.assertIn(" I of ", sim.full_name(a))
        self.assertIn(" II of ", sim.full_name(b))

    def test_lineage_records_hidden_from_year_and_final_report(self):
        sim = Simulation(40, seed=17, lineage_chance=1, country_chance=0)
        sim.tick(False)
        self.assertIn("lineage", sim.history_categories)
        rendered = sim.format_year(sim.yearly_reports[-1])
        self.assertNotIn("starts lineage", rendered)
        self.assertEqual(rendered.splitlines()[0], "Year 1")
        self.assertTrue(all(not line or line.startswith("    ") for line in rendered.splitlines()[1:]))
        output = io.StringIO()
        with redirect_stdout(output):
            sim.report()
        self.assertNotIn("Lineage tree", output.getvalue())
        self.assertIn("founder:", command(sim, "lineages")[0])

    def test_small_inhabited_year_has_ten_visible_events(self):
        sim = Simulation(1, seed=31, disaster_chance=0, war_chance=0)
        sim.dp = [0] * 200
        sim.tick(False)
        report = sim.yearly_reports[-1]
        visible = {"discovery", "political", "creative", "war", "sickness", "disaster"}
        self.assertGreaterEqual(sum(c in visible for c in sim.history_categories[report["start"]:report["end"]]), 10)

    def test_integrated_accounting_ownership_prerequisites(self):
        for seed in (4, 15, 29):
            sim = Simulation(2000, seed=seed, war_chance=.7, disaster_chance=.1)
            for _ in range(30):
                before = len(sim.people)
                prior_deaths = sum(p.died is not None for p in sim.archive.values())
                births, deaths = sim.tick(False)
                self.assertEqual(len(sim.people), before + births - deaths)
                self.assertEqual(sum(p.died is not None for p in sim.archive.values()) - prior_deaths, deaths)
                self.assertEqual(sum(sim.yearly_reports[-1]["death_causes"].values()), deaths)
                self.assertEqual(sum(l.deaths for l in sim.lineages.values()),
                                 sum(p.died is not None for p in sim.archive.values()))
                for p in sim.people.values():
                    self.assertIsNone(p.died)
                    self.assertEqual(p.country, sim.settlements[p.settlement].country)
                    self.assertTrue(math.isfinite(p.wealth) and p.wealth >= 0)
                for c in sim.countries.values():
                    for tech in c.technologies:
                        self.assertLessEqual(TECHNOLOGIES[tech][0], c.technologies)
                    for key in getattr(c, "innovations", {}):
                        self.assertLessEqual(INNOVATIONS[key].prerequisites, c.technologies)
                    if c.capital is not None:
                        self.assertEqual(sim.settlements[c.capital].country, c.id)

    def test_thonny_cli_commands_do_not_advance_year(self):
        result = subprocess.run([sys.executable, "civsim.py", "--years", "2", "--population", "100", "--seed", "8"],
            input="help\nrich\nroles\n\ndiscoveries\nquit\n", text=True,
            capture_output=True, cwd=Path(__file__).parent, timeout=30)
        self.assertEqual(result.returncode, 0, result.stderr)
        headings = [line for line in result.stdout.splitlines() if line.startswith("Year ")]
        self.assertEqual(headings, ["Year 0", "Year 1"])
        self.assertNotIn("Lineage tree", result.stdout)


if __name__ == "__main__":
    unittest.main()
