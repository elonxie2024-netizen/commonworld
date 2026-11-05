// Integration and command regressions (port of test_simulation.py).
import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {Simulation, NameGenerator} from '../../dist/sim/civsim.js';
import {command, annual_civic, refresh_public_roles} from '../../dist/sim/civic.js';
import {INNOVATIONS} from '../../dist/sim/discoveries.js';
import {TECHNOLOGIES} from '../../dist/sim/society.js';
import {serialize, deepClone, isSubset, PythonRandom} from '../../dist/sim/runtime.js';

// Simulation(population, seed=, capacity, lineage_chance, country_chance, war_chance, disaster_chance)
const make = (population, seed, o = {}) => new Simulation(population, seed, undefined,
  o.lineage_chance, o.country_chance, o.war_chance, o.disaster_chance);
const finite = x => Number.isFinite(x);
const first = map => map.values().next().value;
const lines = text => text.split(/\r?\n/);

describe('IntegrationTests', () => {
  it('test_default_population_and_countries', () => {
    const sim = new Simulation(undefined, 3);
    assert.equal(sim.people.size, 2000);
    assert.equal(sim.countries.size, 4);
    assert.equal(sim.lineage_chance, .002);
    assert.deepEqual(new Set([...sim.countries.values()].map(c => c.economic_system)),
      new Set(['mixed', 'capitalism', 'communism']));
  });

  it('test_all_inspections_preserve_entire_simulation_and_rng', () => {
    const sim = make(1000, 5);
    sim.tick(false);
    const country = sim.countries.get(1).name;
    const commands = ['help', 'lineage', 'lineages', 'rich', 'richest', 'inventions',
      'discoveries', 'innovations', 'roles', 'government', 'people', 'notables',
      'countries', 'country', 'bad command', 'rich no-such-country'];
    for (const name of ['rich', 'richest', 'inventions', 'discoveries', 'country', 'roles', 'notables']) {
      commands.push(name + ' ' + country);
    }
    const before = serialize(sim);
    for (const text of commands) {
      const [output, action] = command(sim, text);
      assert.equal(action, 'inspect', text);
      assert.ok(output, text);
      assert.equal(serialize(sim), before, text);
    }
    assert.equal(command(sim, '')[1], 'next');
    assert.equal(command(sim, 'quit')[1], 'quit');
    assert.equal(serialize(sim), before);
  });

  it('test_richest_uses_real_wealth_and_country_filter', () => {
    const sim = make(1000, 8);
    const person = [...sim.people.values()].find(p => p.country === 2);
    person.wealth = 1000000;
    assert.ok(lines(command(sim, 'richest')[0])[1].includes(sim.full_name(person)));
    assert.ok(!command(sim, 'rich ' + sim.countries.get(1).name)[0].includes(sim.full_name(person)));
  });

  it('test_economies_have_distinct_distribution', () => {
    const base = make(100, 6);
    for (const p of base.people.values()) {
      p.age = 30;
      p.wealth = 100;
      p.job = 'farmer';
    }
    const rich_id = base.people.keys().next().value;
    base.people.get(rich_id).wealth = 100000;
    const results = {};
    for (const system of ['capitalism', 'communism']) {
      const sim = deepClone(base);
      sim.countries.get(1).economic_system = system;
      sim.year = 1;
      annual_civic(sim);
      results[system] = sim;
    }
    assert.ok(results.capitalism.people.get(rich_id).wealth > results.communism.people.get(rich_id).wealth);
    const gains = {};
    for (const [system, sim] of Object.entries(results)) {
      gains[system] = [...sim.people.values()].map(p => p.wealth - base.people.get(p.id).wealth);
    }
    const spread = xs => Math.max(...xs) - Math.min(...xs);
    assert.ok(Math.abs(spread(gains.communism)) < 1e-7); // assertAlmostEqual(max, min), 7 places
    assert.ok(spread(gains.capitalism) > 1);
    for (const sim of Object.values(results)) {
      assert.equal(sim.countries.get(1).government, 'monarchy');
      assert.ok([...sim.people.values()].every(p => finite(p.wealth) && p.wealth >= 0));
    }
  });

  it('test_estate_inherited_once', () => {
    const sim = make(2, 7);
    const [parent, child] = [...sim.people.values()];
    parent.wealth = 100; child.wealth = 0;
    child.parents = [parent.id]; child.age = 1;
    parent.died = sim.year = 1;
    sim.people.delete(parent.id);
    annual_civic(sim);
    assert.equal(child.wealth, 100);
    assert.equal(parent.wealth, 0);
    sim.year += 1;
    annual_civic(sim);
    assert.equal(child.wealth, 100);
  });

  it('test_office_holder_must_live_in_country', () => {
    const sim = make(1000, 18);
    const c = sim.countries.get(1);
    const [title, pid] = c.offices.entries().next().value;
    sim.people.get(pid).country = 2;
    refresh_public_roles(sim);
    assert.notEqual(c.offices.get(title), pid);
    for (const country of sim.countries.values()) {
      for (const holder of country.offices.values()) {
        assert.equal(sim.people.get(holder).country, country.id);
      }
    }
  });

  it('test_famine_and_drought_have_bounds_and_four_clear_years', () => {
    for (const [crisis, maximum] of [['Famine', 4], ['Drought', 3]]) {
      const sim = make(20, 4);
      const country = sim.countries.get(1);
      sim.rng = {random: () => .9, choice: () => crisis, randint: () => maximum};
      let run = 0;
      let last_ended = null;
      let was_active = false;
      for (let year = 1; year < 51; year++) {
        sim.year = year;
        const event = sim.pickevent(country);
        const active = country.conditions.has(crisis);
        if (active) {
          run += 1;
          if (!was_active && last_ended !== null) {
            assert.ok(year - last_ended >= 4);
          }
        } else {
          if (was_active) last_ended = year;
          run = 0;
          assert.notEqual(event, crisis);
        }
        assert.ok(run <= maximum);
        was_active = active;
      }
    }
  });

  it('test_early_famine_relief_starts_cooldown', () => {
    const sim = make(10, 1);
    const c = sim.countries.get(1);
    c.conditions.add('Famine');
    c.crisis_until.set('Famine', 4);
    sim.year = 1;
    sim.rng = {random: () => .9, choice: () => 'Abundance', randint: () => { throw new Error('unexpected'); }};
    sim.pickevent(c);
    assert.ok(!c.conditions.has('Famine'));
    assert.equal(c.crisis_cooldown.get('Famine'), 5);
  });

  it('test_names_never_one_letter', () => {
    const names = new NameGenerator(new PythonRandom(42));
    for (let i = 0; i < 3000; i++) {
      assert.ok(names.make('first').length >= 2);
      assert.ok(names.make('last').length >= 2);
    }
  });

  it('test_duplicate_names_keep_roman_numerals_and_country', () => {
    const sim = make(2, 12);
    const [a, b] = sim.people.values();
    b.first = a.first; b.lineage = a.lineage;
    sim.register_name(b);
    assert.ok(sim.full_name(a).includes(' I of '));
    assert.ok(sim.full_name(b).includes(' II of '));
  });

  it('test_lineage_records_hidden_from_year_and_final_report', () => {
    const sim = make(40, 17, {lineage_chance: 1, country_chance: 0});
    sim.tick(false);
    assert.ok(sim.history_categories.includes('lineage'));
    const rendered = sim.format_year(sim.yearly_reports.at(-1));
    assert.ok(!rendered.includes('starts lineage'));
    assert.equal(lines(rendered)[0], 'Year 1');
    assert.ok(lines(rendered).slice(1).every(line => !line || line.startsWith('    ')));
    const captured = [];
    const original = console.log;
    console.log = (...args) => captured.push(args.join(' '));
    try { sim.report(); } finally { console.log = original; }
    assert.ok(!captured.join('\n').includes('Lineage tree'));
    assert.ok(command(sim, 'lineages')[0].includes('founder:'));
  });

  it('test_small_inhabited_year_has_ten_visible_events', () => {
    const sim = make(1, 31, {disaster_chance: 0, war_chance: 0});
    sim.dp = new Array(200).fill(0);
    sim.tick(false);
    const report = sim.yearly_reports.at(-1);
    const visible = new Set(['discovery', 'political', 'creative', 'war', 'sickness', 'disaster']);
    const n = sim.history_categories.slice(report.get('start'), report.get('end')).filter(c => visible.has(c)).length;
    assert.ok(n >= 10);
  });

  it('test_integrated_accounting_ownership_prerequisites', () => {
    for (const seed of [4, 15, 29]) {
      const sim = make(2000, seed, {war_chance: .7, disaster_chance: .1});
      const dead = () => [...sim.archive.values()].filter(p => p.died != null).length;
      for (let i = 0; i < 30; i++) {
        const before = sim.people.size;
        const prior_deaths = dead();
        const [births, deaths] = sim.tick(false);
        assert.equal(sim.people.size, before + births - deaths);
        assert.equal(dead() - prior_deaths, deaths);
        assert.equal([...sim.yearly_reports.at(-1).get('death_causes').values()].reduce((a, b) => a + b, 0), deaths);
        assert.equal([...sim.lineages.values()].reduce((a, l) => a + l.deaths, 0), dead());
        for (const p of sim.people.values()) {
          assert.equal(p.died, null);
          assert.equal(p.country, sim.settlements.get(p.settlement).country);
          assert.ok(finite(p.wealth) && p.wealth >= 0);
        }
        for (const c of sim.countries.values()) {
          for (const tech of c.technologies) {
            assert.ok(isSubset(TECHNOLOGIES.get(tech)[0], c.technologies));
          }
          for (const key of (c.innovations ?? new Map()).keys()) {
            assert.ok(isSubset(INNOVATIONS.get(key).prerequisites, c.technologies));
          }
          if (c.capital != null) {
            assert.equal(sim.settlements.get(c.capital).country, c.id);
          }
        }
      }
    }
  });

  // The Python test drives `civsim.py --years 2 --population 100 --seed 8` as a subprocess; the JS port has no
  // command-line entry point, so there is nothing to spawn.
  it('test_thonny_cli_commands_do_not_advance_year', {skip: 'no JS CLI: the Python test spawns civsim.py as a subprocess'}, () => {});
});
