import copy
import unittest

import economy
import geography as g
import governments
from civic import command
from civsim import Simulation


def run(seed, years, population=2000):
    sim = Simulation(population=population, seed=seed)
    for _ in range(years):
        sim.tick(False)
    return sim


class DepositTests(unittest.TestCase):
    def test_tiles_hold_several_deposits_and_kinds(self):
        sim = Simulation(population=400, seed=11)
        deposits = g.world(sim)["deposits"]
        self.assertGreater(len(deposits), 300)
        self.assertTrue(any(len(rows) >= 2 for rows in deposits.values()))
        kinds = {kind for rows in deposits.values() for kind, _cap in rows}
        self.assertGreaterEqual(len(kinds), 10)
        self.assertTrue(all(len(rows) <= 3 for rows in deposits.values()))

    def test_exhausted_deposit_stays_locked_until_completely_full(self):
        sim = run(5, 3)
        key = next(iter(g.world(sim)["deposits"]))
        kind, cap = g.world(sim)["deposits"][key][0]
        state = sim.deposit_state
        state[key * 4] = [0.0, True, 0]
        rate = g.RESOURCE_INFO[kind][2]
        economy.regrow(sim)
        amount, locked = economy.deposit_level(sim, key, 0, cap)
        self.assertTrue(locked)
        self.assertAlmostEqual(amount, cap * rate, places=3)
        steps = 0
        while key * 4 in state and steps < 400:
            self.assertTrue(state[key * 4][1], "must stay locked while refilling")
            economy.regrow(sim)
            steps += 1
        self.assertNotIn(key * 4, state)
        amount, locked = economy.deposit_level(sim, key, 0, cap)
        self.assertEqual((amount, locked), (float(cap), False))

    def test_settlements_use_up_deposits_over_time(self):
        sim = run(7, 60)
        self.assertGreater(len(sim.deposit_state), 50)
        self.assertTrue(any(entry[1] for entry in sim.deposit_state.values()), "something should have been exhausted")
        for entry in sim.deposit_state.values():
            self.assertGreaterEqual(entry[0], 0)

    def test_contested_tiles_cannot_be_worked(self):
        sim = run(7, 20)
        cells = {(y * g.W + x) for y in range(g.H) for x in range(g.W)}
        blocked = set(list(g.world(sim)["deposits"])[:200])
        counts = g.settlement_counts(sim)
        sites = economy._sites(sim, counts, blocked)
        worked = {row[1] for rows in sites.values() for row in rows}
        self.assertFalse(worked & blocked)
        self.assertTrue(cells)

    def test_disasters_damage_deposits(self):
        sim = run(7, 15)
        geo = g.world(sim)
        key = next(k for k, rows in geo["deposits"].items() if any(kind == "stone" for kind, _ in rows))
        before = len(sim.deposit_state)
        hit = economy.damage(sim, "earthquake", key % g.W, key // g.W, 6)
        self.assertGreater(hit, 0)
        self.assertGreaterEqual(len(sim.deposit_state), before)


class EconomyTests(unittest.TestCase):
    def test_stockpiles_prices_trade_and_reports(self):
        sim = run(7, 50)
        self.assertTrue(sim.econ)
        total_made = 0
        for cid, e in sim.econ.items():
            total_made += sum(e["made"].values())
            self.assertGreaterEqual(e["food_ratio"], 0)
            self.assertLessEqual(e["food_ratio"], 1)
            for price in e["prices"].values():
                self.assertGreater(price, 0)
            for kind, amount in sim.countries[cid].stock.items():
                self.assertGreaterEqual(amount, 0, kind)
        self.assertGreater(total_made, 0)
        text = command(sim, "economy")[0]
        self.assertIn("GDP", text)
        self.assertIn("deposits", text)

    def test_hunger_hurts_food(self):
        sim = run(7, 10)
        cid = sorted(sim.econ)[0]
        sim.econ[cid]["food_ratio"] = .3
        self.assertLess(economy.food_effect(sim, cid), -20)
        sim.econ[cid]["food_ratio"] = 1.0
        self.assertGreaterEqual(economy.food_effect(sim, cid), 0)

    def test_tile_command(self):
        sim = run(7, 5)
        key = next(iter(g.world(sim)["deposits"]))
        text = command(sim, f"tile {key % g.W} {key // g.W}")[0]
        self.assertIn("refills", text)

    def test_projects_wait_for_materials(self):
        sim = run(7, 8)
        country = sim.countries[1]
        country.stock = {k: 0.0 for k in economy.KINDS}
        slow = economy.materials_pace(country)
        country.stock["timber"] = 100
        self.assertGreater(economy.materials_pace(country), slow)


class BudgetTests(unittest.TestCase):
    def test_governments_pay_and_hoards_stay_bounded(self):
        sim = run(7, 60)
        rich = 0
        for cid, e in sim.econ.items():
            if sim.countries[cid].ended is not None:
                continue  # dissolved during the year: no budget was set
            self.assertIn("budget", e)
            self.assertGreater(e["budget"]["total"], 0)
            country = sim.countries[cid]
            if country.treasury > 40 * e["budget"]["total"]:
                rich += 1
        self.assertEqual(rich, 0, "no country should hoard more than 40 years of spending")
        self.assertIn("budget:", command(sim, "economy")[0])

    def test_debt_hurts(self):
        import systems
        sim = run(7, 30)
        cid = sorted(sim.econ)[0]
        country = sim.countries[cid]
        control = copy.deepcopy(sim)  # the same world and the same dice, minus the debt
        country.treasury = -5000.0
        notes = [row[0] for row in systems.analyze(sim, cid)["notes"]["military"]]
        self.assertIn("Unpaid soldiers", notes)
        sim.tick(False)
        control.tick(False)
        self.assertGreaterEqual(getattr(country, "debt_years", 0), 1)
        self.assertLess(country.stability, control.countries[cid].stability)


class GovernmentTests(unittest.TestCase):
    def test_many_forms_exist_with_titles(self):
        self.assertGreaterEqual(len(governments.GOVERNMENTS), 10)
        for key, form in governments.GOVERNMENTS.items():
            self.assertTrue(form["title"] and form["verb"], key)

    def test_forms_change_how_countries_behave(self):
        sim = run(3, 6)
        country = sim.countries[1]
        country.government = "junta"
        junta = __import__("systems").analyze(sim, 1)
        country.government = "democracy"
        democracy = __import__("systems").analyze(sim, 1)
        self.assertGreater(junta["power_mult"], democracy["power_mult"])
        self.assertGreater(democracy["research"], junta["research"])
        self.assertGreater(governments.trait(country, "culture"), 1.0)

    def test_governments_change_over_time(self):
        seen = set()
        for seed in (3, 7):
            sim = run(seed, 90)
            seen |= {c.government for c in sim.countries.values()}
        self.assertGreaterEqual(len(seen), 3)

    def test_edit_and_report_commands(self):
        sim = run(3, 2)
        command(sim, "set country 1 government republic")
        self.assertEqual(sim.countries[1].government, "republic")
        self.assertIn("Republic", command(sim, "governments")[0])
        sim.countries[1].ruler = None
        sim.tick(False)
        ruler = sim.people.get(sim.countries[1].ruler)
        self.assertIsNotNone(ruler)
        sim.countries[1].government = "junta"
        sim.countries[1].ruler = None
        sim.tick(False)
        self.assertTrue(any("seized power" in str(e) for e in sim.history))


if __name__ == "__main__":
    unittest.main()
