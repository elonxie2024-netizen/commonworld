import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import * as economy from '../../dist/sim/economy.js';
import * as g from '../../dist/sim/geography.js';
import * as governments from '../../dist/sim/governments.js';
import * as systems from '../../dist/sim/systems.js';
import {command} from '../../dist/sim/civic.js';
import {Simulation} from '../../dist/sim/civsim.js';
import {deepClone} from '../../dist/sim/runtime.js';

function run(seed, years, population = 2000) {
  const sim = new Simulation(population, seed);
  for (let i = 0; i < years; i++) sim.tick(false);
  return sim;
}
const first = iterable => iterable[Symbol.iterator]().next().value;

describe('DepositTests', () => {
  it('test_tiles_hold_several_deposits_and_kinds', () => {
    const sim = new Simulation(400, 11);
    const deposits = g.world(sim).get('deposits');
    assert.ok(deposits.size > 300);
    assert.ok([...deposits.values()].some(rows => rows.length >= 2));
    const kinds = new Set([...deposits.values()].flatMap(rows => rows.map(([kind]) => kind)));
    assert.ok(kinds.size >= 10);
    assert.ok([...deposits.values()].every(rows => rows.length <= 3));
  });

  it('test_exhausted_deposit_stays_locked_until_completely_full', () => {
    const sim = run(5, 3);
    const key = first(g.world(sim).get('deposits').keys());
    const [kind, cap] = g.world(sim).get('deposits').get(key)[0];
    const state = sim.deposit_state;
    state.set(key * 4, [0.0, true, 0]);
    const rate = g.RESOURCE_INFO.get(kind)[2];
    economy.regrow(sim);
    let [amount, locked] = economy.deposit_level(sim, key, 0, cap);
    assert.ok(locked);
    assert.ok(Math.abs(amount - cap * rate) < 0.5e-3);
    let steps = 0;
    while (state.has(key * 4) && steps < 400) {
      assert.ok(state.get(key * 4)[1], 'must stay locked while refilling');
      economy.regrow(sim);
      steps += 1;
    }
    assert.equal(state.has(key * 4), false);
    [amount, locked] = economy.deposit_level(sim, key, 0, cap);
    assert.deepEqual([amount, locked], [Number(cap), false]);
  });

  it('test_settlements_use_up_deposits_over_time', () => {
    const sim = run(7, 60);
    assert.ok(sim.deposit_state.size > 50);
    assert.ok([...sim.deposit_state.values()].some(entry => entry[1]), 'something should have been exhausted');
    for (const entry of sim.deposit_state.values()) assert.ok(entry[0] >= 0);
  });

  it('test_contested_tiles_cannot_be_worked', () => {
    const sim = run(7, 20);
    const cells = new Set();
    for (let y = 0; y < g.H; y++) for (let x = 0; x < g.W; x++) cells.add(y * g.W + x);
    const blocked = new Set([...g.world(sim).get('deposits').keys()].slice(0, 200));
    const counts = g.settlement_counts(sim);
    const sites = economy._sites(sim, counts, blocked);
    const worked = new Set([...sites.values()].flatMap(rows => rows.map(row => row[1])));
    assert.equal([...worked].some(k => blocked.has(k)), false);
    assert.ok(cells.size > 0);
  });

  it('test_disasters_damage_deposits', () => {
    const sim = run(7, 15);
    const geo = g.world(sim);
    const key = [...geo.get('deposits')].find(([, rows]) => rows.some(([kind]) => kind === 'stone'))[0];
    const before = sim.deposit_state.size;
    const hit = economy.damage(sim, 'earthquake', key % g.W, Math.floor(key / g.W), 6);
    assert.ok(hit > 0);
    assert.ok(sim.deposit_state.size >= before);
  });
});

describe('EconomyTests', () => {
  it('test_stockpiles_prices_trade_and_reports', () => {
    const sim = run(7, 50);
    assert.ok(sim.econ.size > 0);
    let total_made = 0;
    for (const [cid, e] of sim.econ) {
      total_made += [...e.get('made').values()].reduce((a, b) => a + b, 0);
      assert.ok(e.get('food_ratio') >= 0);
      assert.ok(e.get('food_ratio') <= 1);
      for (const price of e.get('prices').values()) assert.ok(price > 0);
      for (const [kind, amount] of sim.countries.get(cid).stock) assert.ok(amount >= 0, kind);
    }
    assert.ok(total_made > 0);
    const text = command(sim, 'economy')[0];
    assert.ok(text.includes('GDP'));
    assert.ok(text.includes('deposits'));
  });

  it('test_hunger_hurts_food', () => {
    const sim = run(7, 10);
    const cid = [...sim.econ.keys()].sort((a, b) => a - b)[0];
    sim.econ.get(cid).set('food_ratio', .3);
    assert.ok(economy.food_effect(sim, cid) < -20);
    sim.econ.get(cid).set('food_ratio', 1.0);
    assert.ok(economy.food_effect(sim, cid) >= 0);
  });

  it('test_tile_command', () => {
    const sim = run(7, 5);
    const key = first(g.world(sim).get('deposits').keys());
    const text = command(sim, `tile ${key % g.W} ${Math.floor(key / g.W)}`)[0];
    assert.ok(text.includes('refills'));
  });

  it('test_projects_wait_for_materials', () => {
    const sim = run(7, 8);
    const country = sim.countries.get(1);
    country.stock = new Map(economy.KINDS.map(k => [k, 0.0]));
    const slow = economy.materials_pace(country);
    country.stock.set('timber', 100);
    assert.ok(economy.materials_pace(country) > slow);
  });
});

describe('BudgetTests', () => {
  it('test_governments_pay_and_hoards_stay_bounded', () => {
    const sim = run(7, 60);
    let rich = 0;
    for (const [cid, e] of sim.econ) {
      if (sim.countries.get(cid).ended != null) continue; // dissolved during the year: no budget was set
      assert.ok(e.has('budget'));
      assert.ok(e.get('budget').get('total') > 0);
      const country = sim.countries.get(cid);
      if (country.treasury > 40 * e.get('budget').get('total')) rich += 1;
    }
    assert.equal(rich, 0, 'no country should hoard more than 40 years of spending');
    assert.ok(command(sim, 'economy')[0].includes('budget:'));
  });

  it('test_debt_hurts', () => {
    const sim = run(7, 30);
    const cid = [...sim.econ.keys()].sort((a, b) => a - b)[0];
    const country = sim.countries.get(cid);
    const control = deepClone(sim); // the same world and the same dice, minus the debt
    country.treasury = -5000.0;
    const notes = systems.analyze(sim, cid).get('notes').get('military').map(row => row[0]);
    assert.ok(notes.includes('Unpaid soldiers'));
    sim.tick(false);
    control.tick(false);
    assert.ok((country.debt_years ?? 0) >= 1);
    assert.ok(country.stability < control.countries.get(cid).stability);
  });
});

describe('GovernmentTests', () => {
  it('test_many_forms_exist_with_titles', () => {
    assert.ok(governments.GOVERNMENTS.size >= 10);
    for (const [key, form] of governments.GOVERNMENTS) assert.ok(form.get('title') && form.get('verb'), key);
  });

  it('test_forms_change_how_countries_behave', () => {
    const sim = run(3, 6);
    const country = sim.countries.get(1);
    country.government = 'junta';
    const junta = systems.analyze(sim, 1);
    country.government = 'democracy';
    const democracy = systems.analyze(sim, 1);
    assert.ok(junta.get('power_mult') > democracy.get('power_mult'));
    assert.ok(democracy.get('research') > junta.get('research'));
    assert.ok(governments.trait(country, 'culture') > 1.0);
  });

  it('test_governments_change_over_time', () => {
    const seen = new Set();
    for (const seed of [3, 7]) {
      const sim = run(seed, 90);
      for (const c of sim.countries.values()) seen.add(c.government);
    }
    assert.ok(seen.size >= 3);
  });

  it('test_edit_and_report_commands', () => {
    const sim = run(3, 2);
    command(sim, 'set country 1 government republic');
    assert.equal(sim.countries.get(1).government, 'republic');
    assert.ok(command(sim, 'governments')[0].includes('Republic'));
    sim.countries.get(1).ruler = null;
    sim.tick(false);
    const ruler = sim.people.get(sim.countries.get(1).ruler);
    assert.notEqual(ruler, undefined);
    assert.notEqual(ruler, null);
    sim.countries.get(1).government = 'junta';
    sim.countries.get(1).ruler = null;
    sim.tick(false);
    assert.ok(sim.history.some(e => String(e).includes('seized power')));
  });
});
