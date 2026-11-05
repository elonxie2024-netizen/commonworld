import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {Simulation, Sickness} from '../../dist/sim/civsim.js';
import {resolve_disease, _profile, _history, _local_outbreak} from '../../dist/sim/epidemiology.js';
import {replace} from '../../dist/sim/runtime.js';

// Simulation(population, seed, capacity, lineage_chance, country_chance, war_chance, disaster_chance)
const make = (population, seed, {country_chance = 0, war_chance = 0} = {}) =>
  new Simulation(population, seed, 1_000_000, 0.002, country_chance, war_chance, 0.02);
const firstPerson = sim => sim.people.values().next().value;

describe('DiseaseCourseTests', () => {
  function make_sim(course, infected = true) {
    const sim = make(1, 19);
    const country = sim.countries.get(1);
    country.sickness = 'test fever';
    const disease = new Sickness({name: 'test fever', infection_chance: 0.0, death_chance: 0.0,
      recovery_chance: course === 'chronic' ? 0.0 : 1.0, transmission: 'contact', incubation_steps: 0,
      immunity_years: 8, mutation_chance: 0.0, course});
    sim.sicknesses.set(disease.name, disease);
    if (infected) {
      const person = firstPerson(sim);
      person.infection = disease.name;
      person.infection_steps = 1;
      _history(person, 'infected', disease.name, sim.year);
    }
    return [sim, country, firstPerson(sim)];
  }

  it('test_acute_wave_resolves_and_tracks_recovery', () => {
    const [sim, country, person] = make_sim('acute');
    assert.equal(resolve_disease(sim, country, [person]), 0);
    assert.equal(person.infection, null);
    assert.ok(person.immunity.has('test fever'));
    assert.equal(person.infection_history.at(-1).get('event'), 'recovered');
    assert.equal(country.sickness, null);
  });

  it('test_chronic_case_persists_without_recovery', () => {
    const [sim, country, person] = make_sim('chronic');
    resolve_disease(sim, country, [person]);
    assert.equal(person.infection, 'test fever');
    assert.equal(person.immunity.has('test fever'), false);
  });

  it('test_endemic_course_is_stable_and_cooldown_bounded', () => {
    const [sim, country, person] = make_sim('endemic', false);
    person.immunity.add('test fever');
    assert.equal(_profile(sim, 'test fever').get('course'), 'endemic');
    const state = _local_outbreak(sim, country, 'test fever');
    // An endemic disease remains a source and uses a three-year lull after
    // a wave clears; the counter is decremented once per simulated year.
    state.set('cooldown_until', 3);
    for (let i = 0; i < 3; i++) {
      sim.year += 1;
      resolve_disease(sim, country, [person]);
    }
    assert.equal(state.get('age'), 3);
    assert.ok(state.get('cooldown_until') <= sim.year);
    assert.equal(country.sickness, 'test fever');
  });

  it('test_death_is_removed_once_and_counted_in_lineage', () => {
    const sim = make(1, 2);
    const country = sim.countries.get(1);
    const person = firstPerson(sim);
    const disease = new Sickness({name: 'fatal fever', infection_chance: 0.0, death_chance: 1.0, recovery_chance: 0.0,
      transmission: 'contact', incubation_steps: 0, immunity_years: 8, mutation_chance: 0.0, course: 'acute'});
    sim.sicknesses.set(disease.name, disease);
    person.infection = disease.name;
    person.infection_steps = 1;
    assert.equal(resolve_disease(sim, country, [person]), 1);
    assert.equal(sim.people.has(person.id), false);
    assert.equal(sim.lineages.get(person.lineage).deaths, 1);
    assert.equal(person.cause_of_death, disease.name);
    assert.equal(person.infection_history.at(-1).get('event'), 'died');
  });

  it('test_chronic_recovery_is_possible', () => {
    const [sim, country, person] = make_sim('chronic');
    sim.sicknesses.set('test fever', replace(sim.sicknesses.get('test fever'), {recovery_chance: 1}));
    resolve_disease(sim, country, [person]);
    assert.equal(person.infection, null);
    assert.ok(person.immunity.has('test fever'));
  });

  it('test_acute_growth_peak_and_decline_across_seeds', () => {
    for (let seed = 0; seed < 5; seed++) {
      const sim = make(800, seed);
      const country = sim.countries.get(1);
      country.sickness = 'wave';
      sim.sicknesses.set('wave', new Sickness({name: 'wave', infection_chance: .55, death_chance: .04, recovery_chance: .85,
        incubation_steps: 1, mutation_chance: 0}));
      for (let year = 1; year <= 12; year++) {
        sim.year = year;
        const before = sim.people.size;
        const deaths = resolve_disease(sim, country, [...sim.people.values()]);
        assert.equal(before - sim.people.size, deaths);
      }
      const rows = country.disease_outbreaks.get('wave').get('annual');
      const cases = rows.map(r => r.get('infections'));
      assert.ok(Math.max(...cases) > cases[0] * 1.4);
      assert.ok(cases.at(-1) < Math.max(...cases) * .1);
      assert.ok(rows.reduce((a, r) => a + r.get('deaths'), 0) > 0);
      assert.ok([...sim.people.values()].filter(p => p.infection != null).length < 5);
    }
  });

  it('test_mild_endemic_disease_recurs_after_immunity_expires', () => {
    const sim = make(300, 33);
    const country = sim.countries.get(1);
    country.sickness = 'common cold';
    sim.sicknesses.set('common cold', new Sickness({name: 'common cold', infection_chance: .5, death_chance: 0, recovery_chance: .98,
      immunity_years: 1, mutation_chance: 0, course: 'endemic', recurring: true}));
    for (let year = 1; year < 16; year++) {
      sim.year = year;
      resolve_disease(sim, country, [...sim.people.values()]);
    }
    const rows = country.disease_outbreaks.get('common cold').get('annual');
    assert.ok(rows.filter(r => r.get('infections') > 0).length > 5);
    assert.equal(sim.people.size, 300);
    assert.ok([...sim.people.values()].some(p =>
      (p.infection_history ?? []).filter(h => h.get('event') === 'infected').length > 1));
  });

  it('test_outbreak_clocks_are_country_local', () => {
    const sim = new Simulation(1000, 15);
    sim.sicknesses.set('shared', new Sickness({name: 'shared', infection_chance: 0, death_chance: 0, recovery_chance: 0,
      mutation_chance: 0, course: 'endemic'}));
    for (let year = 1; year < 4; year++) {
      sim.year = year;
      for (const country of sim.countries.values()) {
        country.sickness = 'shared';
        resolve_disease(sim, country, [...sim.people.values()].filter(p => p.country === country.id));
      }
    }
    assert.deepEqual([...sim.countries.values()].map(c => c.disease_outbreaks.get('shared').get('age')), [3, 3]);
  });
});
