import {describe, it, beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {Simulation, Sickness} from '../../dist/sim/civsim.js';
import {inspect_command, resolve_entity} from '../../dist/sim/inspection.js';
import {TupleMap, deepClone} from '../../dist/sim/runtime.js';

describe('InspectionTests', () => {
  let sim;
  beforeEach(() => { sim = new Simulation(120, 17); });

  it('test_read_only_including_random_state', () => {
    const before = deepClone({...sim});
    const rng = JSON.stringify(sim.rng.getstate());
    for (const text of ['people', 'people page=2', 'settlements', 'settlement 1', 'person 1', 'individual #1', 'people settlement=#1', 'demographics', 'demographics 1', 'wars', 'diseases', 'disease unknown']) {
      const result = inspect_command(sim, text);
      assert.equal(result[1], 'inspect');
    }
    assert.equal(JSON.stringify(sim.rng.getstate()), rng);
    // The names generator holds the shared random instance; compare everything else about it.
    const {rng: _a, ...namesBefore} = before.names;
    const {rng: _b, ...namesAfter} = sim.names;
    assert.deepStrictEqual(namesAfter, namesBefore);
    assert.equal(sim.names.rng, sim.rng);
    for (const [key, value] of Object.entries(before)) {
      if (key !== 'rng' && key !== 'names') assert.deepStrictEqual(sim[key], value, key);
    }
  });

  it('test_pages_and_validation', () => {
    const page1 = inspect_command(sim, 'people')[0];
    const page2 = inspect_command(sim, 'people page=2')[0];
    assert.ok(page1.includes('page 1/3'));
    assert.ok(page1.includes(sim.full_name(sim.people.get(50)) + ' |'));
    assert.equal(page1.includes(sim.full_name(sim.people.get(51)) + ' |'), false);
    assert.ok(page2.includes(sim.full_name(sim.people.get(51)) + ' |'));
    assert.ok(inspect_command(sim, 'people page=0')[0].includes('positive integer'));
    assert.ok(inspect_command(sim, 'people page=999')[0].includes('does not exist'));
  });

  it('test_person_details_and_archive', () => {
    const person = sim.people.get(1);
    sim.people.delete(1);
    person.died = 0;
    person.cause_of_death = 'test cause';
    person.infection_history = [new Map([['year', 0], ['event', 'infected'], ['disease', 'Test fever']])];
    const output = inspect_command(sim, 'person #1')[0];
    for (const label of ['deceased', 'test cause', 'Test fever', 'Wealth:', 'Parents:', 'Children:', 'Lineage:', 'Country:', 'Settlement:']) {
      assert.ok(output.includes(label), label);
    }
    assert.ok(inspect_command(sim, 'people')[0].includes(sim.full_name(person)));
  });

  it('test_lookup_ambiguity_and_exact_priority', () => {
    const places = sim.settlements;
    const first = places.values().next().value;
    assert.equal(resolve_entity(places, '#' + String(first.id), 'settlement'), first);
    assert.equal(resolve_entity(places, first.name.toUpperCase(), 'settlement'), first);
    const people = sim.archive;
    assert.throws(() => resolve_entity(people, 'of ', 'person', p => sim.full_name(p)), /Ambiguous person:.*full names/);
    assert.ok(inspect_command(sim, 'person 999999')[0].includes('No person'));
  });

  it('test_country_and_settlement_filters', () => {
    const country = sim.countries.get(1);
    assert.ok(inspect_command(sim, `people "${country.name}"`)[0].includes('120 matches'));
    const settlement = sim.settlements.get(1);
    const expected = [...sim.archive.values()].filter(p => p.settlement === 1).length;
    assert.ok(inspect_command(sim, 'people settlement=#1')[0].includes(`${expected} matches`));
    assert.ok(inspect_command(sim, 'settlement 1')[0].includes(settlement.name));
    assert.equal(inspect_command(sim, 'help'), null);
  });

  it('test_demographics_and_country_ids', () => {
    const output = inspect_command(sim, 'demographics #1')[0];
    for (const label of ['Living population: 120', 'Age bands:', 'Wealth:', 'Currently infected:']) {
      assert.ok(output.includes(label), label);
    }
    assert.ok(inspect_command(sim, 'demographics')[0].includes('Annual simulation report:'));
    assert.ok(inspect_command(sim, 'people country=#1')[0].includes('120 matches'));
  });

  it('test_war_details_and_truces', () => {
    const sim = new Simulation(1000, 5);
    sim.wars.set([1, 2], 0);
    sim.war_details = new TupleMap([[[1, 2], new Map([['mobilized', [12, 15]], ['supplies', [.8, .6]], ['exhaustion', [3, 5]], ['score', 2], ['captures', [0, 1]], ['objectives', [2, 1]]])]]);
    sim.truces = new TupleMap([[[1, 2], 4]]);
    const before = deepClone(sim.war_details);
    const output = inspect_command(sim, 'wars #1')[0];
    for (const label of ['mobilized: 12', 'supplies: 0.8', 'exhaustion: 3', 'captures: 1', 'Campaign score: 2.00', 'expires year 4; active']) {
      assert.ok(output.includes(label), label);
    }
    assert.deepStrictEqual(sim.war_details, before);
    assert.equal(inspect_command(sim, 'war 1 2'), null);
  });

  it('test_disease_details_retired_and_trends', () => {
    const disease = new Sickness({name: 'Test fever', infection_chance: .2, death_chance: .01, recovery_chance: .3});
    sim.sicknesses.set(disease.name, disease);
    sim.people.get(1).infection = disease.name;
    sim.people.get(2).immunity.add(disease.name);
    sim.people.get(2).immunity_until.set(disease.name, 2);
    sim.people.get(2).infection_history = [new Map([['event', 'vaccinated'], ['disease', disease.name], ['year', 0]])];
    sim.countries.get(1).disease_outbreaks = new Map([[disease.name, new Map([['annual', [new Map([['year', 0], ['infections', 2], ['deaths', 0], ['recoveries', 1], ['active', 1], ['phase', 'growing']])]]])]]);
    const before = deepClone({...sim});
    const output = inspect_command(sim, 'disease "Test fever"')[0];
    for (const label of ['Active cases: 1', 'unexpired immunity: 1', 'vaccinated: 1', 'infections 2', 'growing']) {
      assert.ok(output.includes(label), label);
    }
    assert.ok(inspect_command(sim, 'diseases #1')[0].includes('cases 1'));
    assert.deepStrictEqual(sim.countries, before.countries);
    assert.deepStrictEqual(sim.archive, before.archive);
    assert.equal(JSON.stringify(sim.rng.getstate()), JSON.stringify(before.rng.getstate()));
    for (const [key, value] of Object.entries(before)) {
      if (key !== 'rng' && key !== 'names') assert.deepStrictEqual(sim[key], value, key);
    }
    sim.retired_sicknesses = new Map([[disease.name, disease]]);
    sim.sicknesses.delete(disease.name);
    assert.ok(inspect_command(sim, 'disease Test fever')[0].includes('(retired)'));
    assert.equal(resolve_entity(sim.retired_sicknesses, 'test FEVER', 'disease'), disease);
    sim.sicknesses.set('Test cough', new Sickness({name: 'Test cough', infection_chance: .1, death_chance: .01, recovery_chance: .2}));
    assert.ok(inspect_command(sim, 'disease Test')[0].includes('Ambiguous'));
  });
});
