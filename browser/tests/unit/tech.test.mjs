// Port of test_tech.py
import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import * as dev from '../../dist/sim/development.js';
import * as tech from '../../dist/sim/technology.js';
import {Simulation} from '../../dist/sim/civsim.js';
import {TECHNOLOGIES, technology_modifiers, unlock} from '../../dist/sim/society.js';
import {PythonRandom} from '../../dist/sim/runtime.js';

const eqSet = (a, b, msg) => assert.deepStrictEqual(new Set(a), new Set(b), msg);
const addAll = (set, items) => { for (const x of items) set.add(x); };

/** A society that knows `count` discoveries of one age (plus whatever they need). */
function known_in_era(era, count) {
  const out = new Set();
  while ([...out].filter(n => tech.TECH.get(n)[3] === era).length < count) {
    let grew = false;
    for (const [name, entry] of tech.TECH) {
      if (entry[3] !== era || out.has(name)) continue;
      const same = [...entry[0]].filter(p => tech.TECH.get(p)[3] === era);
      if (same.every(p => out.has(p))) {
        addAll(out, owned(...[...entry[0]].filter(p => tech.TECH.get(p)[3] !== era)));
        for (const group of (tech.ANY.get(name) ?? [])) {
          if (!group.some(m => out.has(m)) && tech.TECH.get(group[0])[3] !== era) addAll(out, owned(group[0]));
        }
        out.add(name);
        grew = true;
        break;
      }
    }
    if (!grew) break;
  }
  return out;
}

/** A set of discoveries including everything they need. */
function owned(...names) {
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

class Fake {
  constructor(techs) { this.technologies = new Set(techs); this.innovations = new Map(); }
}
const mods = (...names) => technology_modifiers(new Fake(owned(...names)));

describe('TreeTests', () => {
  it('test_tree_is_large_consistent_and_layered', () => {
    assert.deepEqual(tech.validate(), []);
    assert.ok(tech.TECH.size >= 70);
    assert.equal(tech.ERAS.length, 15);
    const eras = new Set([...tech.TECH.values()].map(e => e[3]));
    eqSet(eras, Array.from({length: 15}, (_, i) => i));
    eqSet([...tech.TECH.values()].map(e => e[4]), tech.BRANCHES);
    // society still exposes (prerequisites, cost, description) for every discovery
    eqSet(TECHNOLOGIES.keys(), tech.TECH.keys());
    assert.ok([...TECHNOLOGIES.values()].every(v => v.length === 3));
    // later ages cost more on average
    const avg = Array.from({length: 15}, (_, i) => {
      const es = [...tech.TECH.values()].filter(e => e[3] === i);
      return es.reduce((s, e) => s + e[1], 0) / Math.max(1, es.length);
    });
    const broad = Array.from({length: 7}, (_, g) => {
      const idx = Array.from({length: 15}, (_, i) => i).filter(i => tech.ERA_GROUP[i] === g);
      return idx.reduce((s, i) => s + avg[i], 0) / idx.length;
    });
    assert.ok(Array.from({length: 6}, (_, i) => i).every(i => broad[i] < broad[i + 1]));
  });

  it('test_every_tech_is_reachable_from_nothing', () => {
    const have = new Set();
    let progress = true;
    while (progress) {
      progress = false;
      for (const [name] of tech.TECH) {
        if (!have.has(name) && tech.met(name, have)) { have.add(name); progress = true; }
      }
    }
    eqSet(have, tech.TECH.keys());
  });

  it('test_era_arrives_when_a_third_of_its_discoveries_are_known', () => {
    assert.equal(tech.era_index(new Set()), 0);
    for (let e = 1; e < 15; e++) {
      let have = known_in_era(e, tech.ERA_NEED[e] - 1);
      assert.ok(tech.era_index(have) < e, `one short of the ${tech.ERAS[e]}`);
      have = known_in_era(e, tech.ERA_NEED[e]);
      assert.equal(tech.era_index(have), e, tech.ERAS[e]);
    }
    assert.equal(tech.era_name(owned('stone tools')), 'Old Stone Age');
    assert.ok(Math.min(...tech.ERA_NEED.slice(1)) >= 3, 'later ages need real progress, not a lucky find');
  });

  it('test_the_tree_spans_many_topics_and_every_age', () => {
    assert.ok(tech.TECH.size >= 220);
    assert.ok(tech.BRANCHES.length >= 11);
    for (const b of tech.BRANCHES) {
      const eras = new Set([...tech.TECH.values()].filter(e => e[4] === b).map(e => e[3]));
      assert.ok(eras.size >= 4, `${b} should run through many ages`);
      assert.ok([...tech.TECH.values()].filter(e => e[4] === b).length >= 8, b);
    }
  });

  it('test_new_kinds_of_effect_exist', () => {
    const fx = (...n) => tech.effects(owned(...n));
    assert.ok(fx('state religion').get('stab') > 0);
    assert.ok(fx('temple building').get('cult') > 0);
    assert.ok(fx('building codes').get('haz') < 1.0);
    assert.ok(fx('refrigeration').get('spoil') < fx('salt curing').get('spoil'));
    assert.ok(fx('concrete').get('build') > fx('thatched huts').get('build'));
    const everything = tech.effects(new Set(tech.TECH.keys()));
    assert.ok(everything.get('prod') <= tech.CEILING.get('prod'));
    assert.ok(everything.get('dth') >= tech.FLOOR.get('dth'));
    assert.equal(everything.get('weapon'), 7);
  });
});

describe('EffectTests', () => {
  it('test_weapons_get_deadlier_and_stronger', () => {
    const ages = [];
    let running = new Set();
    for (const name of ['spear making', 'bronze weapons', 'ironworking', 'military drill', 'heavy cavalry', 'musketry', 'rifled firearms']) {
      running = new Set([...running, ...owned(name)]);
      ages.push(new Set(running));
    }
    const tiers = ages.map(a => tech.effects(a).get('weapon'));
    assert.deepEqual(tiers, [0, 1, 2, 3, 4, 5, 6]);
    const power = ages.map(a => technology_modifiers(new Fake(a)).get('military'));
    assert.ok([0, 1, 2, 3, 4, 5].every(i => power[i] < power[i + 1]));
    assert.ok([0, 1, 2, 3, 4, 5, 6].every(i => tech.LETHALITY[i] < tech.LETHALITY[i + 1]));
    assert.ok(tech.LETHALITY[6] > 1.5 * tech.LETHALITY[0]);
  });

  it('test_defenses_and_sieges_answer_each_other', () => {
    const base = mods('masonry'), castle = mods('castles'), bastion = mods('bastion forts');
    assert.ok(castle.get('defense') < base.get('defense'));
    assert.ok(bastion.get('defense') < castle.get('defense'));
    assert.ok(mods('artillery').get('siege') > mods('siege craft').get('siege'));
  });

  it('test_disease_changes_with_the_ages', () => {
    const none = technology_modifiers(new Fake(new Set()));
    const early = mods('aqueducts', 'soapmaking');
    const late = mods('vaccination', 'public health');
    assert.equal(none.get('infection'), 1.0);
    assert.ok(early.get('water') < 1.0);
    assert.ok(late.get('water') < early.get('water'));
    assert.ok(late.get('infection') < early.get('infection'));
    assert.ok(late.get('disease_death') < early.get('disease_death') + 1e-9);
    assert.ok(late.get('air') < none.get('air'));
    assert.ok(late.get('cure') > early.get('cure'));
    assert.ok(late.get('care') > none.get('care'));
  });

  it('test_travel_improves_with_ships_and_rails', () => {
    assert.ok(mods('sailing').get('sea') < mods('steamships').get('sea'));
    assert.ok(mods('roads').get('land') < mods('railways').get('land'));
    assert.equal(tech.units(owned('railways')).get('wagons'), 'freight trains');
    assert.equal(tech.units(owned('steamships')).get('fleet'), 'steamships');
    assert.equal(tech.units(new Set()).get('army'), 'hunters with spears');
  });
});

describe('ResearchChoiceTests', () => {
  it('test_needs_steer_what_gets_researched', () => {
    const available = ['irrigation', 'bronze weapons', 'sailing', 'writing', 'medicine'];
    let rng = new PythonRandom(5);
    let counts = new Map();
    for (let i = 0; i < 600; i++) {
      const pick = tech.choose(rng, available, new Set(), new Map([['warfare', 5.0], ['agriculture', 0.0]]), 0);
      counts.set(pick, (counts.get(pick) ?? 0) + 1);
    }
    assert.ok(counts.get('bronze weapons') > (counts.get('irrigation') ?? 0) * 2);
    rng = new PythonRandom(5);
    counts = new Map();
    for (let i = 0; i < 600; i++) {
      const pick = tech.choose(rng, available, new Set(), new Map([['agriculture', 5.0]]), 0);
      counts.set(pick, (counts.get(pick) ?? 0) + 1);
    }
    assert.ok(counts.get('irrigation') > (counts.get('bronze weapons') ?? 0) * 2);
  });

  it('test_countries_research_toward_their_needs', () => {
    const sim = new Simulation(1500, 21);
    for (let i = 0; i < 25; i++) sim.tick(false);
    const projects = [...sim.countries.values()].filter(c => c.ended == null).map(c => c.research_project ?? null);
    assert.ok(projects.some(Boolean));
    for (const c of sim.countries.values()) {
      assert.ok([...c.technologies].every(t => tech.TECH.has(t)));
    }
  });
});

describe('PrerequisiteTests', () => {
  it('test_alternatives_are_rare_and_valid', () => {
    assert.deepEqual(tech.validate(), []);
    assert.ok(0 < tech.ANY.size && tech.ANY.size <= 12, 'alternatives are used sparingly');
    for (const [name, groups] of tech.ANY) {
      assert.ok(tech.TECH.get(name)[0].size > 0, `${name} also has a plain prerequisite`);
      for (const group of groups) {
        assert.ok(group.length >= 2);
        assert.ok(!group.some(g => tech.TECH.get(name)[0].has(g)));
      }
    }
  });

  it('test_one_of_a_group_is_enough', () => {
    const name = 'castles';
    const base = owned('engineering', 'fortification');
    assert.equal(tech.met(name, base), false);
    for (const choice of tech.ANY.get(name)[0]) {
      assert.ok(tech.met(name, new Set([...base, ...owned(choice)])), choice);
    }
  });

  it('test_systems_feed_several_chains', () => {
    const outside = ['steelmaking', 'cast iron', 'ironworking', 'gunpowder', 'steam power', 'rifled firearms']
      .filter(n => new Set([...owned(n)].filter(p => p !== n).map(p => tech.TECH.get(p)[4])).size >= 3);
    assert.ok(outside.length >= 4);
    for (const base of ['wheel', 'alchemy', 'surveying', 'horse domestication', 'magnetism', 'screw and lathe']) {
      assert.ok([...tech.TECH.keys()].filter(n => n !== base && owned(n).has(base)).length >= 3, base);
    }
  });

  it('test_no_shallow_leap_to_late_units', () => {
    const deep = owned('machine guns', 'ironclads');
    assert.ok(deep.size > 60);
    const first = tech.researchable(new Set());
    assert.equal(first.length > 0 && first.every(n => tech.TECH.get(n)[3] <= tech.MAX_LEAD), true);
    // a society still in the Old Stone Age cannot even start research three ages ahead
    for (const n of tech.researchable(owned('stone tools'))) {
      assert.ok(tech.TECH.get(n)[3] <= tech.era_index(owned('stone tools')) + tech.MAX_LEAD);
    }
  });

  it('test_the_cap_never_stalls_research', () => {
    const have = new Set();
    for (let i = 0; i < tech.TECH.size; i++) {
      const options = tech.researchable(have);
      if (!options.length) break;
      have.add(have.size % 2 ? options[0] : options.at(-1));
    }
    eqSet(have, tech.TECH.keys());
  });
});

describe('WorldTests', () => {
  it('test_ages_arrive_slowly', () => {
    const sim = new Simulation(2000, 7);
    for (let i = 0; i < 60; i++) sim.tick(false);
    const alive = [...sim.countries.values()].filter(c => c.ended == null);
    assert.ok(alive.every(c => tech.ERA_GROUP[tech.era_index(c.technologies)] === 0), 'no one leaves the Stone Age in 60 years');
    assert.ok(Math.max(...alive.map(c => c.technologies.size)) < 40);
    assert.ok(Math.max(...alive.map(c => c.technologies.size)) > 4, 'but they do learn things');
  });

  it('test_unlock_announces_a_new_age', () => {
    const sim = new Simulation(400, 3);
    const country = sim.countries.get(1);
    const actor = [...sim.people.values()].find(p => p.country === 1 && p.age >= 18);
    const short = known_in_era(2, tech.ERA_NEED[2] - 1);
    const full = known_in_era(2, tech.ERA_NEED[2]);
    const diff = [...full].filter(n => !short.has(n));
    const nxt = diff.find(n => tech.TECH.get(n)[3] === 2);
    country.technologies = new Set([...full].filter(n => n !== nxt));
    assert.ok(tech.era_index(country.technologies) < 2);
    assert.ok(unlock(sim, country, nxt, actor));
    assert.ok(sim.history.some(e => String(e).includes('entered the Early Bronze Age')));
  });

  it('test_new_buildings_need_their_technology', () => {
    for (const [kind, needed] of [['forge', 'ironworking'], ['bank', 'banking'], ['barracks', 'military drill'], ['factory', 'steam power'], ['station', 'railways']]) {
      assert.ok(dev.BUILDINGS.has(kind));
      assert.ok(dev.BUILDINGS.get(kind)[2].has(needed));
      assert.ok(tech.TECH.has(needed));
    }
  });
});
