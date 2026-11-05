// Knowledge that crosses borders: settlers, trade, conquest, and the research they credit (port of test_sharing.py).
import {describe, it, beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../../dist/sim/civsim.js';
import {command} from '../../dist/sim/civic.js';
import * as development from '../../dist/sim/development.js';
import * as s from '../../dist/sim/society.js';
import * as tech from '../../dist/sim/technology.js';
import * as warfare from '../../dist/sim/warfare.js';

const close_to = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} !~= ${b}`);

function closure(...names) {
  const out = new Set();
  const stack = [...names];
  while (stack.length) {
    const n = stack.pop();
    if (!out.has(n)) {
      out.add(n);
      stack.push(...tech.TECH.get(n)[0]);
      for (const group of (tech.ANY.get(n) ?? [])) stack.push(group[0]);
    }
  }
  return out;
}

describe('SharingTests', () => {
  let sim, a, b, adults;
  beforeEach(() => {
    sim = new Simulation(1000, 23, undefined, 0, 0, 0, 0); // lineage_chance, country_chance, war_chance, disaster_chance = 0
    a = sim.countries.get(1); b = sim.countries.get(2);
    a.technologies = closure('weaving', 'pottery', 'stone tools', 'fire making');
    b.technologies = closure('stone tools');
    adults = [...sim.people.values()].filter(p => p.country === 2 && p.age >= 18);
  });

  it('test_research_is_dearer_on_its_own', () => {
    assert.ok(tech.COST_SCALE > 3.0); // dearer than the old flat 3.0, with sharing to make up for it
  });

  it('test_learning_is_scaled_by_research_power_and_conquest_doubles_it', () => {
    const power = s.technology_modifiers(b).get('research');
    const gain = s.learn(sim, b, 'weaving', 10);
    close_to(gain, 10 * power);
    close_to(b.insight.get('weaving'), 10 * power);
    s.boosted_of(b).add('pottery');
    close_to(s.learn(sim, b, 'pottery', 10), 20 * power);
  });

  it('test_only_what_could_be_used_is_passed_on', () => {
    // a discovery whose prerequisites the taker lacks teaches nothing yet
    for (const n of closure('bronze weapons')) a.technologies.add(n);
    for (let i = 0; i < 30; i++) {
      const got = s.pass_on_knowledge(sim, a, b, .2);
      if (got && got.length) assert.ok(tech.met(got[0], b.technologies));
    }
    assert.ok(![...b.insight.keys()].some(n => !tech.met(n, b.technologies)));
  });

  it('test_enough_insight_is_simply_learned', () => {
    b.insight.set('weaving', s.TECHNOLOGIES.get('weaving')[1] + 1);
    s.settle_insight(sim, b, adults);
    assert.ok(b.technologies.has('weaving'));
    assert.ok(!b.insight.has('weaving'));
  });

  it('test_insight_counts_toward_the_current_project', () => {
    const cost = s.TECHNOLOGIES.get('weaving')[1];
    b.research_project = 'weaving';
    b.insight.set('weaving', cost * .9);
    b.research = cost * .4;
    s.advance_research(sim, b, adults, new Map([[2, adults]]), new Set());
    assert.ok(b.technologies.has('weaving'));
    assert.ok(!b.insight.has('weaving'));
  });

  it('test_conquest_boosts_research_instead_of_handing_over_discoveries', () => {
    a.technologies = closure('stone tools');
    b.technologies = closure('weaving', 'pottery', 'stone tools');
    warfare._transfer(sim, 1, 2);
    assert.ok(!a.technologies.has('weaving'));
    assert.deepEqual(s.boosted_of(a), new Set(['weaving', 'pottery']));
    a.research_project = null;
    assert.ok(new Set(['weaving', 'pottery']).has(sim.rng.choice([...s.boosted_of(a)].sort())));
    s.unlock(sim, a, 'weaving', sim.people.values().next().value);
    assert.deepEqual(s.boosted_of(a), new Set(['pottery']));
  });

  it('test_newcomers_change_country_and_teach_their_hosts', () => {
    const origin = [...sim.settlements.values()].find(x => x.country === 1);
    const destination = [...sim.settlements.values()].find(x => x.country === 2);
    const members = [...sim.people.values()].filter(p => p.settlement === origin.id && p.country === 1).slice(0, 6);
    const exp = new Map([['id', 99], ['kind', 'emigrant'], ['country', 1], ['origin', origin.id], ['target_settlement', destination.id],
      ['people', members.map(p => p.id)], ['leader', members[0].id], ['start', sim.year]]);
    development._list(sim, 'expeditions').push(exp);
    for (const p of members) p.expedition = 99;
    development._arrive_abroad(sim, exp, members, origin, a, destination);
    assert.ok(members.filter(p => p.id !== a.ruler).every(p => p.country === 2 && p.settlement === destination.id && !p.expedition));
    assert.ok(!development._list(sim, 'expeditions').includes(exp));
    assert.ok(b.insight.size > 0, 'the host learned something from the newcomers');
  });

  it('test_trade_science_command', () => {
    let [output, action] = command(sim, `trade science "${a.name}" "${b.name}"`);
    assert.equal(action, 'edit', output);
    assert.ok(sim.countries.get(2).insight.size > 0); // (edits may swap in a restored copy of the world)
    sim.wars.set([1, 2], sim.year);
    [output, action] = command(sim, `trade science "${a.name}" "${b.name}"`);
    assert.equal(action, 'inspect', output);
  });

  it('test_science_pacts_share_every_year_and_war_ends_them', () => {
    const [output, action] = command(sim, `trade pact "${a.name}" "${b.name}"`);
    assert.equal(action, 'edit', output);
    assert.ok(s.pacts_of(sim.countries.get(1)).has(2));
    assert.ok(s.pacts_of(sim.countries.get(2)).has(1));
    command(sim, `trade end "${a.name}" "${b.name}"`);
    assert.equal(s.pacts_of(sim.countries.get(1)).size, 0);
    command(sim, `trade pact "${a.name}" "${b.name}"`);
    command(sim, `war "${a.name}" "${b.name}"`);
    assert.ok(!(s.pacts_of(sim.countries.get(1)).size || s.pacts_of(sim.countries.get(2)).size));
  });
});
