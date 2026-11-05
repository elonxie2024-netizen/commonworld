// Port of test_warfare.py (combat regression checks)
import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../../dist/sim/civsim.js';
import {resolve_wars, _transfer} from '../../dist/sim/warfare.js';
import {TupleMap} from '../../dist/sim/runtime.js';

describe('WarfareTests', () => {
  it('test_campaign_accounts_for_every_death_and_territory', () => {
    for (let seed = 0; seed < 8; seed++) {
      const sim = new Simulation(2000, seed, undefined, undefined, undefined, 1);
      for (let year = 1; year <= 20; year++) {
        sim.year = year;
        const before = sim.people.size;
        const lineage_before = [...sim.lineages.values()].reduce((s, x) => s + x.deaths, 0);
        const populations = new Map([...sim.countries.keys()].map(cid => [cid, [...sim.people.values()].filter(p => p.country === cid).length]));
        const deaths = resolve_wars(sim);
        for (const [pair, detail] of sim.war_details) {
          pair.forEach((cid, i) => {
            assert.ok(detail.get('mobilized')[i] <= Math.trunc(populations.get(cid) * .08));
          });
        }
        assert.equal(before - sim.people.size, deaths);
        assert.equal([...sim.lineages.values()].reduce((s, x) => s + x.deaths, 0) - lineage_before, deaths);
        for (const person of sim.people.values()) {
          if (person.settlement != null) {
            assert.equal(person.country, sim.settlements.get(person.settlement).country);
          }
        }
      }
    }
  });

  it('test_wounded_people_cannot_be_recruited', () => {
    const sim = new Simulation(1000, 18, undefined, undefined, undefined, 0);
    const countries = [...sim.countries.keys()].slice(0, 2);
    const pair = [...countries].sort((a, b) => a - b);
    sim.wars.set(pair, sim.year);
    for (const person of sim.people.values()) person.wounded_until = sim.year + 3;
    const before = sim.people.size;
    assert.equal(resolve_wars(sim), 0);
    assert.equal(sim.people.size, before);
    assert.equal(sim.wars.has(pair), false);
    assert.ok(sim.truces.get(pair) > sim.year);
  });

  it('test_capture_transfers_residents_and_capital', () => {
    const sim = new Simulation(1000, 25);
    const [victor, defeated] = [...sim.countries.keys()].slice(0, 2);
    const target = [...sim.settlements.values()].find(s => s.country === defeated);
    sim.countries.get(defeated).capital = target.id;
    const people = [...sim.people.values()].filter(p => p.settlement === target.id);
    const count = sim.people.size;
    _transfer(sim, victor, defeated, target);
    assert.equal(target.country, victor);
    assert.ok(people.every(p => p.country === victor));
    assert.notEqual(sim.countries.get(defeated).capital, target.id);
    assert.equal(sim.people.size, count);
  });

  it('test_annexation_ends_country_without_killing_residents', () => {
    const sim = new Simulation(1000, 27);
    const [victor, defeated] = [...sim.countries.keys()].slice(0, 2);
    const count = sim.people.size;
    _transfer(sim, victor, defeated);
    assert.equal(sim.people.size, count);
    assert.equal(sim.countries.get(defeated).ended, sim.year);
    assert.equal(sim.countries.get(defeated).capital, null);
    assert.equal([...sim.people.values()].some(p => p.country === defeated), false);
    assert.equal([...sim.settlements.values()].some(s => s.country === defeated), false);
  });

  it('test_campaign_can_conquer_last_settlement', () => {
    const sim = new Simulation(1000, 27, undefined, undefined, undefined, 0);
    const victor = 1, defeated = 2;
    const places = [...sim.settlements.values()].filter(s => s.country === defeated);
    const final = places[0];
    for (const p of sim.people.values()) {
      p.age = 30;
      if (p.country === defeated) p.settlement = final.id;
    }
    for (const place of places.slice(1)) place.abandoned = 0;
    sim.countries.get(defeated).food = 10;
    sim.year = 3;
    const pair = [victor, defeated];
    sim.wars.set(pair, 0);
    sim.war_details = new TupleMap([[pair, new Map([['exhaustion', [0., 0.]], ['score', 5.]])]]);
    // Mock RNG, as in the Python test
    sim.rng = {
      random: () => .2,
      uniform: () => 1,
      choice: () => 'field battle',
      sample: (people, count) => [...people].slice(0, count),
      randint: () => 1,
      shuffle: () => {},
    };
    const before = sim.people.size;
    const deaths = resolve_wars(sim);
    assert.equal(before - sim.people.size, deaths);
    assert.equal(sim.countries.get(defeated).ended, sim.year);
    assert.equal(sim.wars.has(pair), false);
    assert.ok([...sim.people.values()].every(p => p.country === victor));
    assert.ok([...sim.settlements.values()].every(s => s.country === victor));
    assert.ok(sim.history.some(([, message]) => message.includes('conquered')));
  });
});
