/** A fictional population simulation. */

import {Counter, PythonRandom, TupleMap, ValueError, capitalize, divmod, fixed, format, maxOf, setdefault, sorted} from './runtime.js';
import {develop_societies, maintain_rulers, social_rates, ensure_year_events} from './society.js';
import {import_infections, resolve_disease, advance_cures, auto_eradicate} from './epidemiology.js';
import {resolve_wars as resolve_campaigns} from './warfare.js';
import {initialize_civic, annual_civic, refresh_public_roles} from './civic.js';
import {place_settlement, _placed, profile} from './geography.js';
import {resolve} from './disasters.js';
import {refresh, apply_yearly, state as system_state} from './systems.js';
import {yearly as economy_yearly, spend as economy_spend} from './economy.js';
import {advance_expeditions, advance_armies, advance_caravans, plan_projects, advance_projects, launch_expedition, launch_migration, launch_emigration} from './development.js';
import {evolve as evolve_governments, INITIAL} from './governments.js';

const _WEIGHTED = new Map(); // weight table (as text) -> expanded choice list

export function weighted(weights) {
  const key = JSON.stringify(Object.entries(weights));
  if (!_WEIGHTED.has(key)) {
    _WEIGHTED.set(key, Object.entries(weights).flatMap(([value, weight]) => new Array(weight).fill(value)));
  }
  return _WEIGHTED.get(key);
}

export function roman(number) {
  let result = '';
  for (const [value, symbol] of [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I']
  ]) {
    const [count, rest] = divmod(number, value);
    number = rest;
    result += symbol.repeat(count);
  }
  return result;
}

export class NameGenerator {
  constructor(rng) {
    this.rng = rng;
    this.used_countries = new Set();
  }

  make(kind) {
    const {formats, starters, enders, vowels, counts, endings} = kind === 'country' ? {
      formats: weighted({V: 1, CV: 5, CVC: 2, VC: 1}),
      starters: weighted({b: 1, d: 2, g: 1, h: 1, k: 1, l: 3, m: 2, n: 3, r: 3, s: 2, t: 2, v: 2, z: 1, th: 2, kh: 1, sh: 1, ph: 1, br: 1, dr: 1, tr: 1}),
      enders: weighted({n: 4, r: 3, s: 2, l: 2, m: 2, t: 1, k: 1, d: 1, nd: 1}),
      vowels: weighted({a: 5, e: 3, i: 2, o: 3, u: 2, ae: 2, ai: 1, au: 1}),
      counts: [1, 2, 2, 2, 2, 2, 3, 3],
      endings: ['', '', '', 'ia', 'ia', 'ia', 'a', 'a', 'ion', 'ar', 'ar', 'um', 'os', 'is', 'on', 'ea', 'eth']
    } : {
      formats: weighted({V: 1, CV: 4, CVC: 3, VC: 2}),
      starters: weighted({b: 2, c: 1, d: 2, f: 2, g: 2, h: 2, j: 1, k: 2, l: 3, m: 3, n: 3, p: 2, r: 3, s: 3, t: 3, v: 2, w: 1, y: 1, z: 1, bl: 1, br: 1, cl: 1, cr: 1, dr: 1, fl: 1, fr: 1, gl: 1, gr: 1, pl: 1, pr: 1, sl: 1, st: 1, tr: 1, ch: 1, sh: 1, th: 1}),
      enders: weighted({b: 1, d: 2, f: 1, g: 1, k: 2, l: 3, m: 2, n: 4, p: 1, r: 3, s: 3, t: 3, v: 1, z: 1, ch: 1, sh: 1, th: 1, nd: 1, nt: 1, ng: 1, rd: 1, rn: 1}),
      vowels: weighted({a: 5, e: 5, i: 4, o: 4, u: 2, ai: 1, ay: 1, ea: 1, ee: 1, ei: 1, ie: 1, oa: 1, oo: 1, ou: 1, au: 1}),
      counts: kind === 'first' ? [1, 1, 2, 2, 2, 2, 2, 3] : [1, 1, 1, 2, 2, 2, 2, 3, 3],
      endings: [
        ...new Array(10).fill(''),
        ...kind === 'first'
          ? ['a', 'a', 'e', 'o', 'y', 'an', 'en', 'in', 'on', 'el', 'ie', 'ey', 'er', 'ina']
          : ['s', 's', 'er', 'er', 'son', 'ton', 'ley', 'en', 'on', 'in', 'ar', 'o', 'es', 'al', 'ez', 'ov', 'ic', 'i', 'ell']
      ]
    };

    // Rejects names with long runs of vowels or consonants.
    const smooth = text => {
      let vowel_run = 0;
      let consonant_run = 0;
      for (const char of text) {
        if ('aeiouy'.includes(char)) {
          vowel_run += 1;
          consonant_run = 0;
        } else {
          consonant_run += 1;
          vowel_run = 0;
        }
        if (vowel_run > 2 || consonant_run > 3) return false;
      }
      return true;
    };

    for (let attempt = 0; attempt < 100; attempt++) {
      const parts = [];
      for (let syllable = 0, end = this.rng.choice(counts); syllable < end; syllable++) {
        const pattern = this.rng.choice(formats);
        parts.push([...pattern].map((char, i) => this.rng.choice(char === 'V' ? vowels : i === 0 ? starters : enders)).join(''));
      }
      let name = parts.join('');
      let ending = this.rng.choice(endings);
      if (ending) {
        if ('aeiou'.includes(ending[0])) name = name.replace(/[aeiou]+$/, '') || name;
        if (name.at(-1) === ending[0]) ending = ending.slice(1);
        name += ending;
      }
      if (name.length >= 2 && smooth(name)) return capitalize(name);
    }
    return this.rng.choice(['Mara', 'Dalen', 'Sora', 'Bren']);
  }

  country(founder_name = null) {
    let base;
    if (founder_name) {
      // Bob -> Bobia, Mara -> Maria; preserve a recognizable name root.
      const stem = founder_name.toLowerCase().replace(/[aeiouy]+$/, '') || founder_name.toLowerCase();
      const ending = this.rng.choice(['ia', 'ia', 'ia', 'ia', 'a', 'ar', 'on', 'os', 'um']);
      base = capitalize(stem + ending);
    } else {
      base = this.make('country');
    }
    let name = base;
    let number = 2;
    while (this.used_countries.has(name)) {
      name = `${base} ${roman(number)}`;
      number += 1;
    }
    this.used_countries.add(name);
    return name;
  }

  sickness() {
    const suffix = this.rng.choice(['pox', 'pox', 'cough', 'cough', 'fever', 'fever', 'chill', 'rot', 'blight', 'shivers']);
    let root;
    if (this.rng.random() < .5) {
      root = this.rng.choice(['gray', 'red', 'black', 'white', 'ashen', 'marsh', 'river', 'winter', 'dust', 'thorn', 'swamp', 'silver', 'night', 'bitter', 'bongo']);
    } else {
      // Short invented roots keep the illness suffix recognizable.
      const syllables = this.rng.choice([1, 2, 2, 2, 3]);
      root = Array.from({length: syllables}, () => this.rng.choice(['b', 'd', 'g', 'k', 'l', 'm', 'n', 'r', 's', 't', 'v']) + this.rng.choice(['a', 'e', 'i', 'o', 'u'])).join('');
    }
    return capitalize(root + suffix);
  }
}

export class Person {
  constructor({
    id,
    first,
    age,
    lineage,
    country,
    born,
    parents = [],
    died = null,
    infection = null,
    immunity = new Set(),
    settlement = null,
    infection_steps = 0,
    immunity_until = new Map(),
    cause_of_death = null
  }) {
    this.id = id;
    this.first = first;
    this.age = age;
    this.lineage = lineage;
    this.country = country;
    this.born = born;
    this.parents = parents;
    this.died = died;
    this.infection = infection;
    this.immunity = immunity;
    this.settlement = settlement;
    this.infection_steps = infection_steps;
    this.immunity_until = immunity_until;
    this.cause_of_death = cause_of_death;
  }
}

export class Settlement {
  constructor({id, name, country, founder, founded, kind = 'village', abandoned = null}) {
    this.id = id;
    this.name = name;
    this.country = country;
    this.founder = founder;
    this.founded = founded;
    this.kind = kind;
    this.abandoned = abandoned;
  }
}

export class Sickness {
  constructor({
    name,
    infection_chance,
    death_chance,
    recovery_chance,
    transmission = 'contact',
    incubation_steps = 0,
    immunity_years = 8,
    mutation_chance = .02,
    course = 'acute',
    recurring = false
  }) {
    this.name = name;
    this.infection_chance = infection_chance;
    this.death_chance = death_chance;
    this.recovery_chance = recovery_chance;
    this.transmission = transmission;
    this.incubation_steps = incubation_steps;
    this.immunity_years = immunity_years;
    this.mutation_chance = mutation_chance;
    this.course = course;
    this.recurring = recurring;
    Object.freeze(this);
  }
}

export class Lineage {
  constructor({
    id,
    surname,
    founder,
    founded,
    parent_lineage = null,
    births = 0,
    deaths = 0,
    founder_country = 1
  }) {
    this.id = id;
    this.surname = surname;
    this.founder = founder;
    this.founded = founded;
    this.parent_lineage = parent_lineage;
    this.births = births;
    this.deaths = deaths;
    this.founder_country = founder_country;
  }
}

export class Country {
  constructor({
    id,
    name,
    founder,
    founded,
    parent_country = null,
    conditions = new Set(),
    capacity = 1_000_000,
    ended = null,
    sickness = null,
    ruler = null,
    government = 'monarchy',
    last_election = 0,
    food = 60,
    prosperity = 50,
    stability = 60,
    research = 0,
    technologies = new Set(),
    insight = new Map(),
    pacts = new Set(),
    boosted = new Set(),
    last_catalog_events = new Map(),
    last_disaster_year = null,
    capital = null,
    quarantine = false,
    crisis_until = new Map(),
    crisis_cooldown = new Map()
  }) {
    this.id = id;
    this.name = name;
    this.founder = founder;
    this.founded = founded;
    this.parent_country = parent_country;
    this.conditions = conditions;
    this.capacity = capacity;
    this.ended = ended;
    this.sickness = sickness;
    this.ruler = ruler;
    this.government = government;
    this.last_election = last_election;
    this.food = food;
    this.prosperity = prosperity;
    this.stability = stability;
    this.research = research;
    this.technologies = technologies;
    this.insight = insight;
    this.pacts = pacts;
    this.boosted = boosted;
    this.last_catalog_events = last_catalog_events;
    this.last_disaster_year = last_disaster_year;
    this.capital = capital;
    this.quarantine = quarantine;
    this.crisis_until = crisis_until;
    this.crisis_cooldown = crisis_cooldown;
  }
}

// [birth, death] multipliers for lasting conditions and for this year's event.
const CONDITION_RATES = new Map([['Famine', [.5, 1.3]], ['Drought', [.8, 1.2]], ['Disease', [1, 1]], ['Panic', [.9, 1.1]]]);
const EVENT_RATES = new Map([['Growth', [1.2, 1]], ['Abundance', [1.5, 1]], ['Health', [1, .8]]]);

export class Simulation {
  static events = [
    'Famine',
    'Drought',
    'Disease',
    'Panic',
    'Growth',
    'Abundance',
    'Health',
    'Calm',
    'Safety',
    'Nothing'
  ];
  constructor(population = 2000, seed = null, capacity = 1_000_000, lineage_chance = 0.002, country_chance = 0.04, war_chance = 0.10, disaster_chance = 0.02) {
    const isChance = x => x >= 0 && x <= 1; // false for NaN
    if (population < 1 || capacity < 1) {
      throw new ValueError('Population and capacity must be positive');
    }
    if (!isChance(lineage_chance) || !isChance(country_chance)) {
      throw new ValueError('Lineage and country chances must be between 0 and 1');
    }
    if (!isChance(war_chance)) {
      throw new ValueError('War chance must be between 0 and 1');
    }
    if (!isChance(disaster_chance)) {
      throw new ValueError('Disaster chance must be between 0 and 1');
    }
    this.rng = new PythonRandom(seed);
    this.geo_seed = seed || 0; // terrain uses its own hash noise, not the main generator
    this.names = new NameGenerator(this.rng);
    this.people = new Map();
    this.archive = new Map(); // Includes deceased people so parent IDs stay traceable.
    this.name_holders = new Map(); // Names ever held, including earlier family names.
    this.lineages = new Map();
    this.countries = new Map();
    this.settlements = new Map();
    this.history = [];
    this.history_categories = [];
    this.yearly_reports = [];
    this.sicknesses = new Map();
    this.year = 0;
    this.next_person = 1;
    this.lineage_chance = lineage_chance;
    this.country_chance = country_chance;
    this.war_chance = war_chance;
    this.disaster_chance = disaster_chance;
    this.wars = new TupleMap(); // (country, country) -> year started; one war per country.
    this.bp = new Array(200).fill(0);
    this.dp = new Array(200).fill(0);
    // Per-age birth and death probabilities, filled by inclusive age bands.
    for (const [low, high, probability] of [[18, 30, .08], [31, 45, .10], [46, 55, .025], [56, 60, .005]]) {
      this.bp.fill(probability, low, high + 1);
    }
    for (const [low, high, probability] of [
      [0, 0, .015],
      [1, 10, .003],
      [11, 45, .002],
      [46, 60, .009],
      [61, 75, .035],
      [76, 90, .08],
      [91, 150, .18],
      [151, 199, 1]
    ]) {
      this.dp.fill(probability, low, high + 1);
    }
    let lid;
    for (let i = 0; i < population; i++) {
      // Small founding families; a one-person start matches the original.
      if (i % 4 === 0) lid = this.new_lineage(this.next_person);
      const age_range = this.rng.choices([[0, 17], [18, 45], [46, 65], [66, 85]], [20, 60, 15, 5], 1)[0];
      let age = population === 1 ? 0 : this.rng.randint(...age_range);
      if (population > 1 && i % 4 === 0) {
        age = this.rng.randint(18, 45);
      }
      this.add_person(age, lid, 1);
    }
    const initial_countries = Math.min(4, Math.max(1, Math.floor(population / 500)));
    const everyone = [...this.people.values()];
    for (let index = 0; index < initial_countries; index++) {
      const residents = everyone.slice(Math.floor(index * population / initial_countries), Math.floor((index + 1) * population / initial_countries));
      const founder = residents.find(p => p.age >= 18) ?? residents[0];
      const cid = index + 1;
      const country = new Country({
        id: cid,
        name: this.founder_country_name(founder),
        founder: founder.id,
        founded: 0,
        capacity
      });
      this.countries.set(cid, country);
      if (capacity !== 1_000_000) country.capacity_manual = true;
      for (const person of residents) {
        person.country = cid;
        if (this.lineages.get(person.lineage).founder === person.id) {
          this.lineages.get(person.lineage).founder_country = cid;
        }
      }
      if (founder.age >= 18) country.ruler = founder.id;
      this.record(`${this.person_reference(founder)} founded ${country.name} with ${residents.length} people.`);
      for (let offset = 0, end = residents.length; offset < end; offset += 250) {
        const local_residents = residents.slice(offset, offset + 250);
        const local_founder = local_residents.find(p => p.age >= 18) ?? local_residents[0];
        this.found_settlement(cid, local_founder, local_residents);
      }
    }
    initialize_civic(this);
    refresh_public_roles(this, false);
    this.yearly_reports.push(new Map([['year', 0], ['states', [...this.countries.values()].map(c => `${c.name}: Normal`)], ['start', 0], ['end', this.history.length], ['population', population], ['births', 0], ['deaths', 0]]));
  }

  record(message, category = 'political') {
    this.history.push([this.year, message]);
    this.history_categories.push(category);
  }

  format_year(report) {
    const sections = [[`Year ${report.get('year')}`, ...report.get('states')].join('\n')];
    for (const category of ['discovery', 'political', 'creative', 'war', 'sickness', 'disaster']) {
      const lines = [];
      for (let index = report.get('start'), end = report.get('end'); index < end; index++) {
        if (this.history_categories[index] === category) {
          lines.push(this.render_history(this.history[index][1]));
        }
      }
      if (lines.length > 0) sections.push(lines.join('\n'));
    }
    let summary = `Population: ${report.get('population')} | Births: ${report.get('births')} | Deaths: ${report.get('deaths')}`;
    if (report.has('death_causes')) {
      const causes = report.get('death_causes');
      summary += ` (ordinary ${causes.get('ordinary')}, sickness ${causes.get('sickness')}, war ${causes.get('war')}, disasters ${causes.get('disaster')})`;
    }
    const interventions = report.get('interventions') ?? new Map();
    if (interventions.get('added') || interventions.get('deaths')) {
      summary += `\nBefore this year: editor additions ${interventions.get('added') ?? 0}, editor deaths ${interventions.get('deaths') ?? 0} (separate from yearly totals).`;
    }
    sections.push(summary);
    const [title, ...rest] = sections.join('\n\n').split(/\r?\n/);
    return [title, ...rest.map(line => (line ? '    ' + line : ''))].join('\n');
  }

  founder_country_name(founder) {
    const root = this.rng.choice([founder.first, founder.first, this.lineages.get(founder.lineage).surname]);
    return this.names.country(root);
  }

  new_lineage(founder, parent = null) {
    const lid = this.lineages.size + 1;
    this.lineages.set(lid, new Lineage({
      id: lid,
      surname: this.names.make('last'),
      founder,
      founded: this.year,
      parent_lineage: parent
    }));
    if (this.archive.has(founder)) {
      this.lineages.get(lid).founder_country = this.archive.get(founder).country;
    }
    return lid;
  }

  add_person(age, lineage, country, parents = []) {
    const pid = this.next_person;
    this.next_person += 1;
    const person = new Person({
      id: pid,
      first: this.names.make('first'),
      age,
      lineage,
      country,
      born: this.year - age,
      parents
    });
    const parent = parents.length > 0 ? this.archive.get(parents[0]) : null;
    if (parent?.country === country) {
      person.settlement = parent.settlement;
    } else if (this.countries.has(country)) {
      person.settlement = this.countries.get(country).capital;
    }
    this.people.set(pid, person);
    this.archive.set(pid, person);
    this.register_name(person);
    this.lineages.get(lineage).births += 1;
    return person;
  }

  static settlement_kind(population) {
    if (population >= 1000) return 'city';
    if (population >= 100) return 'town';
    return 'village';
  }

  found_settlement(cid, founder, residents, name = null, cell = null) {
    const sid = this.settlements.size + 1;
    if (name == null) {
      const root = this.names.make('first').toLowerCase().replace(/[aeiou]+$/, '') || 'al';
      const base = capitalize(root + this.rng.choice(['ford', 'ton', 'wick', 'haven', 'vale', 'bury', 'a']));
      const existing = new Set([...this.settlements.values()].map(s => s.name));
      name = base;
      let number = 2;
      while (existing.has(name)) {
        name = `${base} ${roman(number)}`;
        number += 1;
      }
    }
    const settlement = new Settlement({
      id: sid,
      name,
      country: cid,
      founder: founder.id,
      founded: this.year,
      kind: Simulation.settlement_kind(residents.length)
    });
    this.settlements.set(sid, settlement);
    const home = this.settlements.get(founder.settlement);
    const anchor = home != null && _placed(home) && home.id !== sid ? [home.gx, home.gy] : null;
    place_settlement(this, settlement, cell, anchor);
    for (const person of residents) {
      person.settlement = sid;
    }
    if (this.countries.get(cid).capital == null) {
      this.countries.get(cid).capital = sid;
    }
    this.record(`${this.person_reference(founder)} established the ${settlement.kind} of ${name} in ${this.countries.get(cid).name} with ${residents.length} residents.`);
    return settlement;
  }

  update_settlements(allow_migration = true) {
    const groups = new Map();
    for (const person of this.people.values()) {
      setdefault(groups, person.settlement, []).push(person);
    }
    const at_war = new Set([...this.wars.keys()].flatMap(pair => [...pair]));
    // Families establish new villages inside their country, without creating
    // a new nation. Larger settlements occasionally attract nearby families.
    if (allow_migration) {
      for (const [sid, residents] of [...groups]) {
        const settlement = this.settlements.get(sid);
        const adults = residents.filter(p => p.age >= 18);
        if (at_war.has(settlement.country) || adults.length === 0) {
          continue;
        }
        const drive = system_state(this, settlement.country).get('expansion');
        if (residents.length >= 120 && this.rng.random() < .012 * drive) {
          // Settlers walk to a site chosen from the geography; the town exists when they arrive.
          launch_expedition(this, settlement);
        } else if (residents.length >= 10 && this.rng.random() < .02) {
          const destinations = [...this.settlements.values()].filter(s => s.country === settlement.country && s.id !== sid && (groups.get(s.id) ?? []).length > residents.length);
          if (destinations.length > 0) {
            const target = maxOf(destinations, {key: s => (groups.get(s.id) ?? []).length});
            const migrant = this.rng.choice(adults);
            const family = residents.filter(p => p.lineage === migrant.lineage);
            const journey = launch_migration(this, settlement, target, family);
            this.record(`${family.length} residents ${journey.size > 0 ? 'set out' : 'moved'} from ${settlement.name} to ${target.name} in ${this.countries.get(settlement.country).name}.`);
          }
        } else if (residents.length >= 25 && this.rng.random() < .04) {
          launch_emigration(this, settlement, groups);
        }
      }
    }
    const counts = new Counter([...this.people.values()].map(p => p.settlement));
    for (const [sid, settlement] of this.settlements) {
      const count = counts.get(sid);
      if (!count) {
        if (settlement.abandoned == null) {
          settlement.abandoned = this.year;
          this.record(`${settlement.name} in ${this.countries.get(settlement.country).name} was abandoned.`);
        }
        continue;
      }
      if (settlement.abandoned != null) {
        settlement.abandoned = null;
        this.record(`${settlement.name} was resettled.`);
      }
      const kind = Simulation.settlement_kind(count);
      if (kind !== settlement.kind) {
        const old_kind = settlement.kind;
        settlement.kind = kind;
        this.record(`${settlement.name} changed from ${old_kind} to ${kind}, with ${count} residents.`);
      }
    }
    for (const [cid, country] of this.countries) {
      const inhabited = [...this.settlements.values()].filter(s => s.country === cid && counts.get(s.id));
      if (inhabited.length === 0) {
        country.capital = null;
      } else if (country.capital == null || !counts.get(country.capital)) {
        const capital = maxOf(inhabited, {key: s => counts.get(s.id)});
        country.capital = capital.id;
        this.record(`${capital.name} became the capital of ${country.name}.`);
      }
    }
  }

  register_name(person) {
    const name = `${person.first} ${this.lineages.get(person.lineage).surname}`;
    setdefault(this.name_holders, name, new Set()).add(person.id);
  }

  full_name(person, lineage = null, country = null) {
    const lid = lineage ?? person.lineage;
    let name = `${person.first} ${this.lineages.get(lid).surname}`;
    const holders = sorted(new Set([...(this.name_holders.get(name) ?? []), person.id]));
    if (holders.length > 1) name += ` ${roman(holders.indexOf(person.id) + 1)}`;
    const cid = country ?? person.country;
    return `${name} of ${this.countries.get(cid).name}`;
  }

  lineage_name(lid) {
    const name = this.lineages.get(lid).surname;
    const holders = sorted([...this.lineages].filter(([, family]) => family.surname === name).map(([id]) => id));
    return holders.length === 1 ? name : `${name} ${roman(holders.indexOf(lid) + 1)}`;
  }

  person_reference(person) {
    return `{person:${person.id}:${person.lineage}:${person.country}}`;
  }

  render_history(message) {
    // Resolve names at display time so later duplicates also number earlier entries.
    message = message.replace(/\{person:(\d+):(\d+):(\d+)\}/g,
      (_, id, lineage, country) => this.full_name(this.archive.get(Number(id)), Number(lineage), Number(country)));
    return message.replace(/\{lineage:(\d+)\}/g, (_, id) => this.lineage_name(Number(id)));
  }

  pickevent(country, forced_event = null) {
    // Episodes never extend when the same crisis is rolled again. Recovery
    // guarantees four complete years free of that crisis before recurrence.
    for (const crisis of ['Famine', 'Drought']) {
      if (country.conditions.has(crisis)) {
        setdefault(country.crisis_until, crisis, this.year + 2);
        if (this.year >= country.crisis_until.get(crisis)) {
          this.end_crisis(country, crisis);
        }
      }
    }
    let event = forced_event != null ? forced_event : this.rng.random() > .4 ? this.rng.choice(Simulation.events) : 'Nothing';
    if (forced_event == null) {
      // Dry countries suffer more droughts; wet coastal ones suffer fewer.

      const terrain = profile(this, country.id);
      if (event === 'Drought' && this.rng.random() < .5 * terrain.get('coastal') * (1 - terrain.get('dry'))) {
        event = 'Nothing';
      } else if (event === 'Nothing' && this.rng.random() < .12 * terrain.get('dry')) {
        event = 'Drought';
      }
    }
    if (['Famine', 'Drought'].includes(event)) {
      if (this.year < (country.crisis_cooldown.get(event) ?? 0)) {
        event = 'Nothing';
      } else if (!country.conditions.has(event)) {
        const duration = this.rng.randint(2, event === 'Famine' ? 4 : 3);
        country.crisis_until.set(event, this.year + duration);
        this.record(`${country.name} entered a ${event.toLowerCase()} episode; relief and recovery are expected within ${duration} years.`, 'disaster');
      }
    }
    if (['Famine', 'Drought', 'Disease', 'Panic'].includes(event)) {
      country.conditions.add(event);
    }
    if (event === 'Disease' && country.sickness == null) {
      country.sickness = this.names.sickness();
      if (this.retired_sicknesses?.has(country.sickness)) {
        const base = country.sickness;
        let number = 2;
        while (this.sicknesses.has(country.sickness) || this.retired_sicknesses.has(country.sickness)) {
          country.sickness = `${base} strain ${number}`;
          number += 1;
        }
      }
      if (!this.sicknesses.has(country.sickness)) {
        const course = this.rng.choices(['acute', 'chronic', 'endemic'], [70, 10, 20], 1)[0];
        const fatality = course === 'acute' ? this.rng.uniform(.005, .08) : course === 'chronic' ? this.rng.uniform(.01, .04) : this.rng.uniform(.0001, .001);
        const recovery = course === 'chronic' ? this.rng.uniform(.1, .3) : this.rng.uniform(.75, .98);
        this.sicknesses.set(country.sickness, new Sickness({
          name: country.sickness,
          infection_chance: this.rng.uniform(.15, .55),
          death_chance: fatality,
          recovery_chance: recovery,
          transmission: this.rng.choice(['respiratory', 'waterborne', 'contact']),
          incubation_steps: 1,
          immunity_years: course === 'endemic' ? 1 : this.rng.randint(4, 12),
          course,
          recurring: course === 'endemic'
        }));
      }
      const disease = this.sicknesses.get(country.sickness);
      this.record(`An outbreak of ${country.sickness} (${disease.course}) began in ${country.name}: baseline annual transmission chance ${format(disease.infection_chance, '.0%')}, death chance when infected ${format(disease.death_chance, '.0%')}, recovery chance after surviving ${format(disease.recovery_chance, '.0%')}.`, 'sickness');
    }
    if (['Health', 'Safety'].includes(event)) {
      country.conditions.delete('Disease');
      if (country.sickness != null) {
        this.record(`${country.name} contained the external source of ${country.sickness}; existing patients can still spread the sickness until they recover.`, 'sickness');
        country.sickness = null;
      }
    }
    if (['Calm', 'Safety'].includes(event)) {
      country.conditions.delete('Panic');
    }
    if (['Growth', 'Abundance', 'Safety'].includes(event)) {
      for (const crisis of ['Famine', 'Drought']) {
        if (country.conditions.has(crisis)) this.end_crisis(country, crisis);
      }
    }
    return event;
  }

  end_crisis(country, crisis) {
    country.conditions.delete(crisis);
    country.crisis_until.delete(crisis);
    country.crisis_cooldown.set(crisis, this.year + 4);
    country.food = Math.min(100, Math.max(40, country.food + 12));
    this.record(`${country.name}'s ${crisis.toLowerCase()} ended as harvests and relief supplies recovered; reserves will buffer the next four years.`, 'disaster');
  }

  static apply(country, event) {
    // Recompute each year: positive events are temporary, crises persist.
    let bm = 1;
    let dm = 1;
    for (const condition of sorted(country.conditions)) {
      const [b, d] = CONDITION_RATES.get(condition);
      bm *= b;
      dm *= d;
    }
    const [b, d] = EVENT_RATES.get(event) ?? [1, 1];
    return [bm * b, dm * d];
  }

  resolve_sickness(country, residents) {
    return resolve_disease(this, country, residents);
  }

  /** At most one disaster per inhabited country per year, placed by geographic risk. */
  resolve_disasters() {
    return resolve(this);
  }

  resolve_wars() {
    return resolve_campaigns(this);
  }

  tick(verbose = true) {
    delete this._command_undo;
    const interventions = new Map(this.pending_interventions ?? new Map([['added', 0], ['deaths', 0]]));
    this.pending_interventions = new Map([['added', 0], ['deaths', 0]]);
    this.year += 1;
    refresh(this);
    advance_cures(this);
    const history_start = this.history.length;
    const before = this.people.size;
    import_infections(this);
    develop_societies(this);
    apply_yearly(this);
    economy_yearly(this);
    const groups = new Map();
    for (const person of this.people.values()) {
      setdefault(groups, person.country, []).push(person);
    }
    let births = 0;
    let deaths = 0;
    const causes = new Map([['ordinary', 0], ['sickness', 0], ['war', 0], ['disaster', 0]]);
    const states = [];
    for (let [cid, residents] of groups) {
      const country = this.countries.get(cid);
      const event = this.pickevent(country);
      const labels = new Set(country.conditions);
      labels.delete('Disease');
      if (country.sickness) labels.add(country.sickness);
      if (!['Nothing', 'Disease'].includes(event)) labels.add(event);
      states.push(`${country.name}: ${sorted(labels).join(', ') || 'Normal'}`);
      const sickness_deaths = this.resolve_sickness(country, residents);
      deaths += sickness_deaths;
      causes.set('sickness', causes.get('sickness') + sickness_deaths);
      residents = residents.filter(p => this.people.has(p.id));
      let [bm, dm] = Simulation.apply(country, event);
      const [social_birth, social_death] = social_rates(country);
      bm *= social_birth;
      dm *= social_death;
      const crowd = Math.max(0, 1 - residents.length / country.capacity);
      const mortality = dm * (1 + residents.length / country.capacity);
      const survivors = [];
      for (const person of residents) {
        if (this.rng.random() < Math.min(1, this.dp[person.age] * mortality)) {
          deaths += 1;
          causes.set('ordinary', causes.get('ordinary') + 1);
          this.lineages.get(person.lineage).deaths += 1;
          person.died = this.year;
          person.cause_of_death = person.age >= 65 ? 'old age' : 'ordinary mortality';
          this.people.delete(person.id);
        } else {
          survivors.push(person);
        }
      }
      const adults = survivors.filter(p => p.age >= 21 && p.age <= 60);
      for (const person of survivors) {
        if (person.age >= 18 && this.rng.random() < this.lineage_chance) {
          const old = person.lineage;
          person.lineage = this.new_lineage(person.id, old);
          this.register_name(person);
          // The founder transfers affiliation; earlier children keep theirs.
          this.record(`${this.person_reference(person)} starts lineage {lineage:${person.lineage}}, a branch of {lineage:${old}}.`, 'lineage');
        }
        if (this.rng.random() < Math.min(1, this.bp[person.age] * bm * crowd)) {
          // Optional second parent; births remain per-person as in the original.
          let partner = null;
          for (let attempt = 0; attempt < 8; attempt++) {
            const candidate = adults.length > 0 ? this.rng.choice(adults) : null;
            if (candidate && candidate.id !== person.id && candidate.lineage !== person.lineage) {
              partner = candidate;
              break;
            }
          }
          const parents = partner == null ? [person.id] : [person.id, partner.id];
          this.add_person(0, person.lineage, cid, parents);
          births += 1;
        }
        person.age += 1;
      }
    }
    // Migration is evaluated after births, once per original country each year.
    const current = new Map();
    for (const person of this.people.values()) {
      setdefault(current, person.country, []).push(person);
    }
    for (const [cid, residents] of current) {
      const adults = residents.filter(p => p.age >= 18);
      if (residents.length < 80 || adults.length === 0 || this.rng.random() >= this.country_chance) {
        continue;
      }
      const founder = this.rng.choice(adults);
      const target = this.rng.randint(10, Math.max(10, Math.floor(residents.length / 3)));
      let followers = residents.filter(p => p.lineage === founder.lineage);
      // Keep both countries populated, even if the founder's family is huge.
      followers = [founder, ...followers.filter(p => p.id !== founder.id).slice(0, target - 1)];
      const selected = new Set(followers.map(p => p.id));
      const others = residents.filter(p => !selected.has(p.id));
      followers.push(...this.rng.sample(others, Math.min(target - followers.length, others.length)));
      const new_id = this.countries.size + 1;
      const parent = this.countries.get(cid);
      const child = new Country({
        id: new_id,
        name: this.founder_country_name(founder),
        founder: founder.id,
        founded: this.year,
        parent_country: cid,
        capacity: parent.capacity
      });
      this.countries.set(new_id, child);
      child.ruler = founder.id;
      child.technologies = new Set(parent.technologies);
      child.innovations = new Map(parent.innovations ?? new Map());
      child.government = parent.government;
      if (this.rng.random() < .25) child.government = this.rng.choice([...INITIAL]);
      child.government_since = this.year;
      if (parent.capacity_manual) child.capacity_manual = true;
      child.last_election = this.year;
      states.push(`${child.name}: Newly founded`);
      for (const person of followers) person.country = new_id;
      this.record(`${this.person_reference(founder)} founded ${child.name} with ${followers.length} settlers from ${parent.name}.`);
      this.found_settlement(new_id, founder, followers);
    }

    const disaster_deaths = this.resolve_disasters();
    deaths += disaster_deaths;
    causes.set('disaster', disaster_deaths);
    const war_deaths = this.resolve_wars();
    deaths += war_deaths;
    causes.set('war', war_deaths);
    advance_armies(this);
    advance_caravans(this);
    const journey_deaths = advance_expeditions(this);
    deaths += journey_deaths;
    causes.set('ordinary', causes.get('ordinary') + journey_deaths);
    const occupied = new Set([...this.people.values()].map(p => p.country));
    for (const country of this.countries.values()) {
      if (country.ended == null && !occupied.has(country.id)) {
        country.ended = this.year;
        this.record(`${country.name} becomes uninhabited.`);
      }
    }
    evolve_governments(this);
    maintain_rulers(this);
    this.update_settlements();
    plan_projects(this);
    advance_projects(this);
    auto_eradicate(this);
    annual_civic(this);
    economy_spend(this);
    ensure_year_events(this, history_start, 10);
    const after = this.people.size;
    if (after !== before) {
      const direction = after > before ? 'increased' : 'decreased';
      this.record(`Population ${direction} from ${before} to ${after}.`, 'population');
    }
    const report = new Map([['year', this.year], ['states', states], ['start', history_start], ['end', this.history.length], ['population', after], ['births', births], ['deaths', deaths], ['death_causes', causes], ['interventions', interventions]]);
    this.yearly_reports.push(report);
    if (verbose) {
      console.log('\n' + this.format_year(report));
    }
    return [births, deaths];
  }

  /** Show family branches, including lineages with no living members. */
  lineage_tree() {
    const living = new Counter([...this.people.values()].map(p => p.lineage));
    const children = new Map();
    for (const [lid, family] of this.lineages) {
      setdefault(children, family.parent_lineage, []).push(lid);
    }

    const label = lid => {
      const family = this.lineages.get(lid);
      const founder = this.archive.get(family.founder);
      // Use the founder's surname when this branch began, even if changed later.
      const name = this.full_name(founder, lid, family.founder_country);
      const status = living.get(lid) ? `${living.get(lid)} living` : 'no living members';
      return `${this.lineage_name(lid)} - founder: ${name} | year ${family.founded} | ${status}`;
    };

    const lines = [];
    // Each stack entry is [lineage id, line prefix, is last sibling]; reversed so pop() yields siblings in order.
    const entries = (ids, prefix) => ids.map((id, i) => [id, prefix, i === ids.length - 1]).reverse();
    for (const root of children.get(null) ?? []) {
      if (lines.length > 0) lines.push('');
      lines.push(label(root));
      const stack = entries(children.get(root) ?? [], '');
      // Iterative traversal also handles long simulations with deep ancestry.
      while (stack.length > 0) {
        const [lid, prefix, last] = stack.pop();
        lines.push(prefix + (last ? '`-- ' : '|-- ') + label(lid));
        stack.push(...entries(children.get(lid) ?? [], prefix + (last ? '    ' : '|   ')));
      }
    }
    return lines.join('\n') || 'No lineages.';
  }

  report(show_history = false) {
    if (show_history) {
      for (const report of this.yearly_reports) {
        console.log('\n' + this.format_year(report));
      }
    }
    const countries = new Counter([...this.people.values()].map(p => p.country));
    const settlement_counts = new Counter([...this.people.values()].map(p => p.settlement));
    const families = new Counter([...this.people.values()].map(p => p.lineage));
    console.log(`\nLiving population: ${this.people.size}`);
    console.log(`Countries: ${countries.size} inhabited, ${this.countries.size} founded`);
    for (const [cid, count] of countries.mostCommon()) {
      const country = this.countries.get(cid);
      const illness = country.sickness ? ` | outbreak: ${country.sickness}` : '';
      console.log(`  ${country.name}: ${count}${illness}`);
      const ruler = this.people.get(country.ruler);
      const leader = ruler ? this.full_name(ruler) : 'no adult ruler';
      console.log(`    ${capitalize(country.government)} | Economy: ${country.economic_system} | Leader: ${leader}`);
      console.log(`    Food: ${fixed(country.food, 0)}/100 | Prosperity: ${fixed(country.prosperity, 0)}/100 | Stability: ${fixed(country.stability, 0)}/100`);
      console.log('    Discoveries: ' + (sorted(country.technologies).join(', ') || 'none yet'));
      console.log(`    Applied innovations: ${country.innovations?.size ?? 0} | Treasury: ${format(country.treasury, ',.1f')}`);
      if (country.research_project) {
        console.log(`    Research: ${country.research_project} | Saved points: ${fixed(country.research, 1)} | Focus: ${country.research_focus}`);
      }
      for (const settlement of this.settlements.values()) {
        if (settlement.country === cid && settlement_counts.get(settlement.id)) {
          const capital = settlement.id === country.capital ? ' (capital)' : '';
          console.log(`    ${capitalize(settlement.kind)} of ${settlement.name}${capital}: ${settlement_counts.get(settlement.id)} residents`);
        }
      }
    }
    console.log(`Lineages: ${families.size} living, ${this.lineages.size} founded`);
    console.log('Type lineages between years to inspect family trees.');
  }
}
