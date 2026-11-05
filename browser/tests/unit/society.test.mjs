// Discovery graph, persistent effect, research and event regression checks (port of test_society.py).
import {describe, it, beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import * as d from '../../dist/sim/discoveries.js';
import * as s from '../../dist/sim/society.js';
import * as technology from '../../dist/sim/technology.js';
import {PythonRandom, isSubset} from '../../dist/sim/runtime.js';

describe('SocietyTests', () => {
  let country, actor, messages, sim;
  beforeEach(() => {
    country = {id: 1, name: 'Testland', technologies: new Set(),
      innovations: new Map(), research: 0, prosperity: 70, food: 60, stability: 60,
      capacity: 1000, ended: null, sickness: null};
    actor = {id: 1, age: 30, fame: 0, job: 'farmer'};
    messages = [];
    sim = {year: 1, rng: new PythonRandom(4),
      person_reference: () => 'Researcher',
      record: (message, category) => messages.push([message, category])};
  });

  it('test_catalog_unique_and_meaningful', () => {
    assert.equal(d.INNOVATIONS.size, 1000);
    assert.equal(new Set([...d.INNOVATIONS.values()].map(i => i.name)).size, 1000);
    for (const item of d.INNOVATIONS.values()) {
      assert.ok([...item.prerequisites].every(p => s.TECHNOLOGIES.has(p)));
      assert.ok([...item.effects].some(Boolean));
      assert.ok(item.modifiers && (item.modifiers instanceof Map ? item.modifiers.size : Object.keys(item.modifiers).length));
      assert.ok(item.cost > 0);
    }
  });

  it('test_foundations_acyclic_and_reachable', () => {
    const known = new Set();
    for (;;) {
      const added = [...s.TECHNOLOGIES.keys()].filter(name => technology.met(name, known) && !known.has(name));
      if (!added.length) break;
      for (const n of added) known.add(n);
    }
    assert.deepEqual(known, new Set(s.TECHNOLOGIES.keys()));
  });

  it('test_prerequisite_enforcement_and_idempotence', () => {
    const project = d.INNOVATIONS.values().next().value;
    assert.equal(d.award_innovation(sim, country, project, actor), false);
    for (const p of project.prerequisites) country.technologies.add(p);
    assert.equal(d.award_innovation(sim, country, project, actor), true);
    const before = country.food;
    assert.equal(d.award_innovation(sim, country, project, actor), false);
    assert.equal(country.food, before);
    assert.equal(actor.job, 'scientist');
    assert.ok(actor.fame > 0);
  });

  it('test_foundation_prerequisites_guard_direct_awards', () => {
    assert.equal(s.unlock(sim, country, 'vaccination', actor), false);
    assert.ok(!country.technologies.has('vaccination'));
    assert.equal(s.unlock(sim, country, 'counting', actor), true);
  });

  it('test_effects_strong_bounded_and_integrated', () => {
    const base = s.technology_modifiers(country);
    country.innovations = new Map([...d.INNOVATIONS.keys()].map(key => [key, 1]));
    const improved = s.technology_modifiers(country);
    const get = (m, k) => (m instanceof Map ? m.get(k) : m[k]);
    for (const key of ['production', 'research', 'military', 'logistics']) {
      assert.ok(get(improved, key) > get(base, key) * 1.5);
      assert.ok(get(improved, key) <= 2.5);
    }
    for (const key of ['infection', 'disease_death', 'wound_death']) {
      assert.ok(get(improved, key) < get(base, key) * .6);
      assert.ok(get(improved, key) > 0);
    }
  });

  it('test_sharing_honors_recipient_prerequisites', () => {
    const donor = {innovations: new Map([...d.INNOVATIONS.keys()].map(key => [key, 1]))};
    assert.equal(d.share_innovation(sim, donor, country, [actor]), false);
    country.technologies.add('irrigation');
    assert.equal(d.share_innovation(sim, donor, country, [actor]), true);
    for (const item of d.acquired_innovations(country)) {
      assert.ok(isSubset(item.prerequisites, country.technologies));
    }
  });

  it('test_applied_research_finishes_with_funded_work', () => {
    country.technologies = new Set(s.TECHNOLOGIES.keys());
    for (let year = 1; year < 31; year++) {
      sim.year = year;
      d.advance_innovations(sim, country, new Array(400).fill(actor));
    }
    assert.ok(country.innovations.size > 0);
    assert.ok(country.innovations.size <= 30);
  });

  it('test_event_catalog_variety', () => {
    assert.equal(s.EVENT_CATALOG.length, 1500);
    assert.equal(new Set(s.EVENT_CATALOG.map(e => e.get('id'))).size, 1500);
    assert.equal(new Set(s.EVENT_CATALOG.map(e => e.get('text'))).size, 1500);
    for (const event of s.EVENT_CATALOG) {
      assert.ok(event.get('effects').size);
      // Python str.format(actor=..., country=...): every placeholder must be fillable
      const rendered = event.get('text').replaceAll('{actor}', 'Ada').replaceAll('{country}', 'Testland');
      assert.ok(!/[{}]/.test(rendered), event.get('text'));
    }
  });
});
