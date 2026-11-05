/** Quarterly infection, immunity, treatment, and imported outbreaks. */

import {Counter, TupleMap, addAll, difference, pop, replace, setdefault, sorted, sum} from './runtime.js';
import {technology_modifiers} from './society.js';
import {state} from './systems.js';
import {neighbors, profile} from './geography.js';

export const CURE_TECH = new Set(['medicine', 'surgery', 'herbal pharmacology', 'germ theory', 'vaccination']);

const COURSE_DIFFICULTY = new Map([['acute', 1], ['chronic', 2], ['endemic', 1.5]]);

/** Disease name -> cure percentage (0-100), built by scientists and healers. */
export function cure_progress(sim) {
  if (!('cure_progress' in sim)) sim.cure_progress = new Map();
  return sim.cure_progress;
}

/**
 * Each year scientists and healers add to every disease's cure percentage.
 *
 * Healers count fully where a disease is active and a little elsewhere; scientists work
 * everywhere at half weight. Medical technology multiplies effort; chronic and endemic
 * diseases are harder. Dormant diseases progress more slowly.
 */
export function advance_cures(sim) {
  const progress = cure_progress(sim);
  const total = Math.max(1, sim.people.size);
  const scientists = new Map();
  const healers = new Map();
  const active = new TupleMap();
  for (const person of sim.people.values()) {
    if (person.age >= 18) {
      if (person.job === 'scientist') {
        scientists.set(person.country, (scientists.get(person.country) ?? 0) + 1);
      } else if (person.job === 'healer') {
        healers.set(person.country, (healers.get(person.country) ?? 0) + 1);
      }
    }
    if (person.infection) {
      const key = [person.country, person.infection];
      active.set(key, (active.get(key) ?? 0) + 1);
    }
  }
  for (const name of sorted(sim.sicknesses.keys())) {
    const disease = sim.sicknesses.get(name);
    let effort = 0;
    for (const cid of sorted(new Set([...scientists.keys(), ...healers.keys()]))) {
      const multiplier = (1 + technology_modifiers(sim.countries.get(cid)).get('cure')) * state(sim, cid).get('cure_mult');
      const weight = active.get([cid, name]) ? 1 : .3;
      effort += ((scientists.get(cid) ?? 0) * .5 + (healers.get(cid) ?? 0) * weight) * multiplier;
    }
    const difficulty = COURSE_DIFFICULTY.get(disease.course ?? 'acute') ?? 1;
    const circulating = [...active].some(([[, disease_name], count]) => disease_name === name && count > 0);
    const gain = 100 * effort / total / difficulty * (circulating ? 1 : .4);
    const before = progress.get(name) ?? 0;
    progress.set(name, Math.min(100, before + gain));
    if (before < 100 && progress.get(name) >= 100) {
      sim.record(`Scientists and healers completed a cure for ${name}; it will be eradicated as soon as no one is infected.`, 'sickness');
    }
  }
}

/** Remove a disease from play, keeping its history. Callers check the cure and infections first. */
export function retire_disease(sim, name) {
  for (const c of sim.countries.values()) {
    if (c.sickness === name) {
      c.sickness = null;
      c.conditions.delete('Disease');
    }
    const local = c.disease_outbreaks?.get(name);
    if (local != null) {
      c.disease_outbreaks.delete(name);
      if (!('retired_outbreaks' in c)) c.retired_outbreaks = new Map();
      c.retired_outbreaks.set(name, local);
    }
  }
  if (!('retired_sicknesses' in sim)) sim.retired_sicknesses = new Map();
  // pop() raises KeyError for an unknown disease, as the callers expect.
  sim.retired_sicknesses.set(name, pop(sim.sicknesses, name));
}

/** A disease with a complete cure and no one infected is eradicated at once. */
export function auto_eradicate(sim) {
  const progress = cure_progress(sim);
  const sick = new Counter([...sim.people.values()].filter(p => p.infection).map(p => p.infection));
  for (const name of sorted(sim.sicknesses.keys())) {
    if ((progress.get(name) ?? 0) >= 100 && sick.get(name) === 0) { // Counter.get() is 0 for absent keys
      retire_disease(sim, name);
      sim.record(`${name} has been eradicated: the cure is complete and the last patient has recovered.`, 'sickness');
    }
  }
}

/** Return a stable course for each disease, stored outside frozen Sickness. */
export function _profile(sim, name) {
  const profiles = sim.disease_profiles ??= new Map();
  if (!profiles.has(name)) {
    const disease = sim.sicknesses.get(name);
    // A seeded draw keeps the mix varied while making the course stable.
    let course = disease.course;
    if (!['acute', 'chronic', 'endemic'].includes(course)) {
      course = sim.rng.choices(['acute', 'chronic', 'endemic'], [72, 10, 18], 1)[0];
    }
    if (disease.recurring) course = 'endemic';
    profiles.set(name, new Map([['course', course]]));
  }
  return profiles.get(name);
}

/** Keep a per-person record without changing the public Person constructor. */
export function _history(person, kind, name, year) {
  const history = person.infection_history ??= [];
  history.push(new Map([['event', kind], ['disease', name], ['year', year]]));
}

export function _local_outbreak(sim, country, name) {
  if (!('disease_outbreaks' in country)) country.disease_outbreaks = new Map();
  return setdefault(country.disease_outbreaks, name, new Map([
    ['age', 0],
    ['last_year', null],
    ['cooldown_until', 0],
    ['episodes', 0],
    ['annual', []],
    ['seasonal', []],
    ['source', country.sickness === name]
  ]));
}

export function _expire_immunity(person, year) {
  for (const [name, expiry] of [...person.immunity_until]) {
    if (expiry <= year) {
      person.immunity.delete(name);
      person.immunity_until.delete(name);
    }
  }
}

export function import_infections(sim) {
  for (const person of sim.people.values()) {
    _expire_immunity(person, sim.year);
  }
  const infected = [...sim.people.values()].filter(p => p.infection);
  if (infected.length === 0) return;
  const [land, sea] = neighbors(sim);
  const by_country = new Map();
  for (const person of sim.people.values()) {
    setdefault(by_country, person.country, []).push(person);
  }
  for (const [cid, residents] of by_country) {
    const country = sim.countries.get(cid);
    if (country.quarantine || sim.rng.random() >= .15) continue;
    // Disease travels over land borders, and only sometimes across a strait.
    const reachable = new Set(land.get(cid) ?? []);
    if (sim.rng.random() < .3) addAll(reachable, sea.get(cid) ?? []);
    const sources = infected.filter(p => reachable.has(p.country) && !sim.countries.get(p.country).quarantine);
    if (sources.length === 0) continue;
    const source = sim.rng.choice(sources);
    const candidates = residents.filter(p => !p.infection && !p.immunity.has(source.infection));
    if (candidates.length > 0) {
      const patient = sim.rng.choice(candidates);
      patient.infection = source.infection;
      patient.infection_steps = 0;
      _profile(sim, source.infection);
      _history(patient, 'infected', source.infection, sim.year);
      sim.record(`Travelers brought ${source.infection} from ${sim.countries.get(source.country).name} to ${country.name}; a new case was identified.`, 'sickness');
    }
  }
}

export function resolve_disease(sim, country, residents) {
  residents = residents.filter(p => sim.people.has(p.id));
  if (residents.length === 0) return 0;
  for (const person of residents) {
    _expire_immunity(person, sim.year);
  }
  const local_names = new Set(residents.filter(p => p.infection).map(p => p.infection));
  addAll(local_names, country.disease_outbreaks?.keys() ?? []);
  if (country.sickness) local_names.add(country.sickness);
  for (const name of local_names) {
    const outbreak = _local_outbreak(sim, country, name);
    if (country.sickness === name) outbreak.set('source', true);
    if (outbreak.get('last_year') !== sim.year) {
      outbreak.set('age', outbreak.get('age') + 1);
      outbreak.set('last_year', sim.year);
    }
  }
  const cures = sim.cure_progress ?? new Map();
  const initially_infected = residents.filter(p => p.infection);
  const should_quarantine = initially_infected.length / residents.length >= .05;
  if (should_quarantine !== country.quarantine) {
    country.quarantine = should_quarantine;
    sim.record(`${country.name} ${should_quarantine ? 'restricted gatherings and travel' : 'lifted its quarantine'}.`, 'sickness');
  }
  if (country.quarantine) {
    country.prosperity = Math.max(0, country.prosperity - 2);
  }
  if (initially_infected.length > 0) {
    const patient = sim.rng.choice(initially_infected);
    const disease = sim.sicknesses.get(patient.infection);
    if (sim.rng.random() < disease.mutation_chance) {
      let number = 2;
      const root = disease.name.split(' strain ')[0];
      let name = `${root} strain ${number}`;
      while (sim.sicknesses.has(name)) {
        number += 1;
        name = `${root} strain ${number}`;
      }
      // replace() copies the frozen Sickness with the new fields.
      sim.sicknesses.set(name, replace(disease, {name, infection_chance: Math.min(.85, disease.infection_chance * sim.rng.uniform(.85, 1.25)), death_chance: Math.min(.2, disease.death_chance * sim.rng.uniform(.7, 1.3))}));
      const parent_profile = _profile(sim, patient.infection);
      sim.disease_profiles.set(name, new Map(parent_profile));
      cure_progress(sim).set(name, (cure_progress(sim).get(disease.name) ?? 0) * .5);
      patient.infection = name;
      patient.infection_steps = 0;
      _history(patient, 'variant', name, sim.year);
      sim.record(`A new variant, ${name}, emerged in ${country.name}; immunity to earlier strains may not protect residents.`, 'sickness');
    }
  }

  const counts = new Map();
  const disease_starting_counts = new Counter(initially_infected.filter(p => p.infection).map(p => p.infection));
  let deaths = 0;
  const technology = country.technologies;
  const modifiers = technology_modifiers(country);
  const st = state(sim, country.id);
  const medical = modifiers.get('disease_death');
  const coastal = profile(sim, country.id).get('coastal');
  const sanitation = modifiers.get('water');
  const care_fraction = .04 + modifiers.get('care');
  const capacity = Math.max(5, Math.trunc(residents.length * care_fraction)) + st.get('care_bonus');
  if (technology.has('vaccination')) {
    const known = sorted(new Set([...residents.filter(p => p.infection).map(p => p.infection), ...(country.sickness ? [country.sickness] : [])]));
    for (const name of known) {
      let vaccinated = 0;
      for (const person of residents) {
        if (!person.infection && !person.immunity.has(name) && sim.rng.random() < .2) {
          person.immunity.add(name);
          person.immunity_until.set(name, sim.year + sim.sicknesses.get(name).immunity_years);
          _history(person, 'vaccinated', name, sim.year);
          vaccinated += 1;
        }
      }
      if (vaccinated) {
        country.prosperity = Math.max(0, country.prosperity - 1);
        sim.record(`A vaccination campaign in ${country.name} protected ${vaccinated} residents against ${name}.`, 'sickness');
      }
    }
  }
  // Annual probabilities become quarterly hazards; incubation delays outcomes.
  for (let season = 0; season < 4; season++) { // trade, crowding, wells, war
    const active = residents.filter(p => sim.people.has(p.id));
    const infectious = new Counter(active.filter(p => p.infection && p.infection_steps >= sim.sicknesses.get(p.infection).incubation_steps).map(p => p.infection));
    const infectious_total = sum(infectious.values());
    const names = new Set(infectious.keys());
    addAll(names, active.filter(p => p.infection).map(p => p.infection));
    if (country.sickness) names.add(country.sickness);
    for (const [name, outbreak] of country.disease_outbreaks ?? []) {
      if (_profile(sim, name).get('course') === 'endemic' && outbreak.get('source')) names.add(name);
    }
    for (const name of names) setdefault(counts, name, [0, 0, 0]);
    const overload = 1 + Math.min(1, Math.max(0, infectious_total - capacity) / capacity) * .5;
    const season_prob = new Map();
    // Restrictions respond within the year, allowing early growth followed
    // by containment and immunity-driven decline rather than a fixed plateau.
    const seasonal_quarantine = infectious_total / Math.max(1, active.length) >= .08;
    for (const person of active) { // floodwater spreads waterborne disease
      let newly_infected = false;
      if (person.infection == null) {
        const candidates = sorted(difference(names, person.immunity));
        if (candidates.length > 1) {
          sim.rng.shuffle(candidates);
        }
        for (const name of candidates) {
          // Everything here is the same for every resident in a season, so work it out once per disease.
          let infection_probability = season_prob.get(name);
          if (infection_probability == null) {
            const disease = sim.sicknesses.get(name);
            const course = _profile(sim, name).get('course');
            const local = _local_outbreak(sim, country, name);
            const contacts = course === 'acute' ? 12 : course === 'endemic' ? 6 : 3;
            let pressure = Math.min(4, infectious.get(name) / Math.max(1, active.length) * contacts);
            if (country.sickness === name || course === 'endemic' && local.get('source')) {
              // Acute introductions burn out; endemic sources recur at
              // a low level after the initial wave has subsided.
              if (course === 'endemic') {
                if (sim.year >= local.get('cooldown_until')) {
                  pressure = Math.max(pressure, [0, 3].includes(season) ? .10 : .02);
                }
              } else if (course === 'acute' && local.get('age') <= 2) {
                pressure = Math.max(pressure, .18 / local.get('age'));
              } else if (course === 'chronic' && local.get('age') <= 2) {
                pressure = Math.max(pressure, .12);
              }
            }
            if (country.quarantine || seasonal_quarantine) pressure *= .55;
            pressure *= modifiers.get('infection');
            pressure *= st.get('infection_mult');
            if (disease.transmission === 'waterborne' && country.last_disaster_type === 'flood' && sim.year - (country.last_disaster_year || -9) <= 2) {
              pressure *= 1.4;
            }
            pressure *= 1 - .4 * (cures.get(name) ?? 0) / 100;
            if (disease.transmission === 'waterborne') {
              pressure *= sanitation * ([1, 2].includes(season) ? 1.3 : .8) * (1 + .3 * coastal);
            } else if (disease.transmission === 'respiratory') {
              pressure *= ([0, 3].includes(season) ? 1.3 : .8) * modifiers.get('air');
            } else {
              pressure *= modifiers.get('contact');
            }
            infection_probability = 1 - (1 - disease.infection_chance) ** (pressure / 4);
            season_prob.set(name, infection_probability);
          }
          if (sim.rng.random() < infection_probability) {
            person.infection = name;
            person.infection_steps = 0;
            _history(person, 'infected', name, sim.year);
            counts.get(name)[0] += 1;
            newly_infected = true;
            break;
          }
        }
      }
      if (person.infection == null || newly_infected) {
        continue;
      }
      const name = person.infection;
      const disease = sim.sicknesses.get(name);
      person.infection_steps += 1;
      if (person.infection_steps <= disease.incubation_steps) continue;
      const vulnerability = person.age < 5 || person.age >= 65 ? 1.35 : 1;
      const cure = (cures.get(name) ?? 0) / 100;
      const hazard = 1 - (1 - disease.death_chance) ** (medical * overload * vulnerability * (1 - .6 * cure) * st.get('death_mult') / 4);
      if (sim.rng.random() < hazard) {
        person.died = sim.year;
        person.cause_of_death = name;
        _history(person, 'died', name, sim.year);
        sim.lineages.get(person.lineage).deaths += 1;
        sim.people.delete(person.id);
        counts.get(name)[1] += 1;
        deaths += 1;
      } else if (sim.rng.random() < 1 - (1 - disease.recovery_chance) ** (.25 * (1 + cure) / medical)) {
        person.infection = null;
        person.infection_steps = 0;
        person.immunity.add(name);
        person.immunity_until.set(name, sim.year + disease.immunity_years);
        _history(person, 'recovered', name, sim.year);
        counts.get(name)[2] += 1;
      }
    }
    const still = new Counter(residents.filter(p => sim.people.has(p.id) && p.infection).map(p => p.infection));
    for (const name of names) {
      const local = _local_outbreak(sim, country, name);
      local.get('seasonal').push(new Map([
        ['year', sim.year],
        ['season', season + 1],
        ['active', still.get(name)],
        ['infections', counts.get(name)[0]],
        ['deaths', counts.get(name)[1]],
        ['recoveries', counts.get(name)[2]]
      ]));
    }
  }
  const final = new Counter(residents.filter(p => sim.people.has(p.id) && p.infection).map(p => p.infection));
  for (const name of sorted(counts.keys())) {
    const [infected, killed, recovered] = counts.get(name);
    const remaining = final.get(name);
    const local = _local_outbreak(sim, country, name);
    const previous = local.get('annual').length > 0 ? local.get('annual').at(-1).get('infections') : 0;
    const phase = infected > previous ? 'growing' : infected < previous ? 'declining' : 'steady';
    local.get('annual').push(new Map([
      ['year', sim.year],
      ['infections', infected],
      ['deaths', killed],
      ['recoveries', recovered],
      ['active', remaining],
      ['phase', phase]
    ]));
    sim.record(`${name} in ${country.name}: ${infected} new infections, ${killed} deaths, ${recovered} recoveries, ${remaining} still infected; ${phase}; care capacity ${capacity}.`, 'sickness');
    if (remaining === 0) {
      const endemic = _profile(sim, name).get('course') === 'endemic';
      if (disease_starting_counts.get(name) || infected) {
        local.set('episodes', local.get('episodes') + 1);
        local.set('cooldown_until', endemic ? sim.year + 2 : sim.year);
      }
      if (country.sickness === name && !endemic) {
        country.sickness = null;
        country.conditions.delete('Disease');
      }
      if (disease_starting_counts.get(name) || infected || killed || recovered) {
        sim.record(`The ${name} outbreak in ${country.name} ended.`, 'sickness');
      }
    }
  }
  return deaths;
}
