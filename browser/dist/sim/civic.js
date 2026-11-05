/** Personal fortunes, public offices and read-only commands for the simulator. */

import {Counter, capitalize, fixed, format, maxOf, round, setdefault, sorted, split} from './runtime.js';
import {technology_modifiers} from './society.js';
import {all_titles, title_of, HEREDITARY} from './governments.js';
import {inspect_command} from './inspection.js';
import {edit_command, EDIT_HELP} from './edit_commands.js';
import {INNOVATIONS} from './discoveries.js';

export const JOBS = [
  'farmer',
  'farmer',
  'farmer',
  'laborer',
  'laborer',
  'artisan',
  'merchant',
  'healer',
  'teacher',
  'scientist',
  'performer',
  'soldier',
  'politician'
];
export const PAY = new Map([
  ['farmer', 10],
  ['laborer', 9],
  ['artisan', 14],
  ['merchant', 19],
  ['healer', 15],
  ['teacher', 12],
  ['scientist', 13],
  ['scholar', 13],
  ['performer', 11],
  ['soldier', 11],
  ['politician', 12]
]);
export const SYSTEMS = ['mixed', 'capitalism', 'communism'];

// Share of income taxed into the public pool, and share of that pool paid back out to households.
const TAX_RATE = new Map([['capitalism', .15], ['mixed', .30], ['communism', 1]]);
const REDISTRIBUTION = new Map([['capitalism', .25], ['mixed', .65], ['communism', .90]]);

export function initialize_civic(sim) {
  for (const country of sim.countries.values()) {
    if (!('economic_system' in country)) {
      const parent = sim.countries.get(country.parent_country);
      country.economic_system = parent ? parent.economic_system ?? 'mixed' : SYSTEMS[(country.id - 1) % SYSTEMS.length];
      country.economic_since = sim.year;
      country.treasury = 0;
      country.offices = new Map();
    }
  }
  for (const person of sim.people.values()) {
    if (!('wealth' in person)) {
      person.wealth = round(person.age >= 18 ? sim.rng.uniform(5, 90) : 0, 2);
      person.job = person.age >= 18 ? sim.rng.choice(JOBS) : 'child';
      person.fame = 0;
      person.public_role = '';
    }
  }
}

export const OFFICES = [
  ['treasurer', 'merchant'],
  ['chief scholar', 'scientist'],
  ['chief physician', 'healer'],
  ['minister', 'politician']
];

/** Keep public offices local and royal titles tied to the living dynasty. */
export function refresh_public_roles(sim, announce = true) {
  const official_titles = new Set(OFFICES.map(([title]) => title));
  const role_titles = new Set([...official_titles, ...all_titles(), 'royal family']);
  for (const person of sim.people.values()) {
    if (role_titles.has(person.public_role)) person.public_role = '';
  }
  const groups = new Map();
  for (const person of sim.people.values()) {
    setdefault(groups, person.country, []).push(person);
  }
  for (const [cid, country] of sim.countries) {
    const residents = groups.get(cid) ?? [];
    const adults = residents.filter(p => p.age >= 18);
    const ruler = sim.people.get(country.ruler);
    if (ruler?.country === cid) {
      ruler.public_role = title_of(country.government);
      ruler.fame = Math.max(85, ruler.fame);
      if (HEREDITARY.includes(country.government)) {
        for (const person of residents) {
          if (person.parents.includes(ruler.id)) {
            person.public_role = 'royal family';
            person.fame = Math.max(60, person.fame);
          }
        }
      }
    }
    for (const [title, profession] of OFFICES) {
      const current = sim.people.get(country.offices.get(title));
      if (current?.country === cid && current.age >= 18 && !current.public_role) {
        current.public_role = title;
        continue;
      }
      country.offices.delete(title);
      if (adults.length < 30) continue;
      const candidates = adults.filter(p => !p.public_role && p.job === profession);
      if (candidates.length === 0) continue;
      // maxOf compares the [fame, age] pairs like Python tuples; the first of equals wins.
      const appointee = maxOf(candidates, {key: p => [p.fame, p.age]});
      country.offices.set(title, appointee.id);
      appointee.public_role = title;
      appointee.fame = Math.max(65, appointee.fame);
      if (announce) {
        sim.record(`${sim.person_reference(appointee)} was appointed ${title} of ${country.name}.`, 'political');
      }
    }
  }
}

/** Run once after this year's deaths and ruler maintenance, before rendering. */
export function annual_civic(sim) {
  initialize_civic(sim);
  if (sim._civic_year === sim.year) return;
  sim._civic_year = sim.year;
  // Settled estates go to surviving children; otherwise the public treasury.
  const heirs_by_parent = new Map();
  for (const child of sim.people.values()) {
    for (const parent of child.parents) {
      setdefault(heirs_by_parent, parent, []).push(child);
    }
  }
  for (const person of sim.archive.values()) {
    if (person.died == null || person.estate_settled) continue;
    person.estate_settled = true;
    const fortune = person.wealth ?? 0;
    const heirs = fortune ? heirs_by_parent.get(person.id) ?? [] : [];
    if (heirs.length > 0) {
      for (const heir of heirs) {
        heir.wealth += fortune / heirs.length;
      }
    } else if (sim.countries.has(person.country)) {
      let beneficiary = sim.countries.get(person.country);
      while (beneficiary.absorbed_by != null) {
        beneficiary = sim.countries.get(beneficiary.absorbed_by);
      }
      beneficiary.treasury += fortune;
    }
    person.wealth = 0;
    const role = person.public_role ?? '';
    if (role || (person.fame ?? 0) >= 65) {
      const cause = person.cause_of_death || 'natural causes';
      sim.record(`${sim.person_reference(person)}, ${role || person.job}, died aged ${person.age} (${cause}).`, 'political');
    }
  }

  const groups = new Map();
  for (const person of sim.people.values()) {
    setdefault(groups, person.country, []).push(person);
    if (person.age >= 18 && person.job === 'child') person.job = sim.rng.choice(JOBS);
    person.fame *= .98;
  }
  for (const [cid, residents] of groups) {
    const country = sim.countries.get(cid);
    const adults = residents.filter(p => p.age >= 18);
    if (adults.length === 0) continue;
    // Economic institutions need literacy and a sustained political history.
    if (sim.year - country.economic_since >= 20 && country.technologies.has('writing') && sim.rng.random() < .025) {
      const previous = country.economic_system;
      country.economic_system = sim.rng.choice(SYSTEMS.filter(s => s !== previous));
      country.economic_since = sim.year;
      sim.record(`${country.name} adopted ${country.economic_system}, replacing ${previous}; taxation and the distribution of income changed.`, 'political');
    }
    const system = country.economic_system;
    // Communal production enters the public pool before equal household
    // shares; private systems retain wages and allow returns on capital.
    const tax_rate = TAX_RATE.get(system);
    let public_income = 0;
    let productivity = (.5 + country.prosperity / 100) * technology_modifiers(country).get('production');
    if (country.conditions.has('Famine')) productivity *= .6;
    if (country.quarantine) productivity *= .85;
    for (const person of adults) {
      let income = (PAY.get(person.job) ?? 10) * productivity * sim.rng.uniform(.7, 1.3);
      if ((person.wounded_until ?? 0) > sim.year || person.infection) income *= .65;
      if (system === 'capitalism') {
        income += person.wealth * sim.rng.uniform(-.015, .05);
      } else if (system === 'mixed') {
        income += person.wealth * sim.rng.uniform(-.005, .015);
      }
      income = Math.max(0, income);
      public_income += income * tax_rate;
      person.wealth = Math.max(0, person.wealth + income * (1 - tax_rate) - 6);
    }
    const redistribution = public_income * REDISTRIBUTION.get(system);
    country.treasury += public_income - redistribution;
    const recipients = system === 'communism' ? residents : sorted(residents, {key: p => p.wealth}).slice(0, Math.max(1, Math.floor(residents.length / 2)));
    for (const person of recipients) person.wealth += redistribution / recipients.length;
    country.prosperity = Math.max(0, Math.min(100, country.prosperity + (public_income - redistribution) / (residents.length * 20)));
    const performers = adults.filter(p => p.job === 'performer' && p.fame < 65);
    if (performers.length > 0 && sim.rng.random() < .12) {
      const artist = sim.rng.choice(performers);
      artist.fame = 80;
      artist.public_role = 'celebrated artist';
      sim.record(`${sim.person_reference(artist)} earned national acclaim for ${sim.rng.choice(['a tragic play', 'a cycle of songs', 'a historical epic', 'a public sculpture'])}.`, 'creative');
    }
  }
  refresh_public_roles(sim);
}

/** Return (output, action); only 'next' advances time; edits return 'edit'. */
export function command(sim, text) {
  const raw = text.trim();
  if (!raw || ['next', 'continue'].includes(raw.toLowerCase())) {
    return ['', 'next'];
  }
  const parts = split(raw); // Python str.split(): any whitespace, no empty tokens
  const name = parts[0].toLowerCase();
  const query = parts.length > 1 ? parts[1].trim().replace(/^"+|"+$/g, '').toLowerCase() : '';
  if (['quit', 'exit'].includes(name)) {
    return ['Simulation stopped.', 'quit'];
  }
  if (name === 'help') {
    if (query === 'ids') {
      return [
        'Optional advanced ID lookup: ids [person|country|settlement|lineage|discovery] [SEARCH] [page=N]\nExample: ids person Mara\nUse the ID in brackets as an alternative to a name; numeric IDs also accept #. Names remain the normal controls.',
        'inspect'
      ];
    }
    if (['edit', 'editing', 'commands', 'sandbox'].includes(query)) {
      return [EDIT_HELP, 'inspect'];
    }
    return [
      'Enter/next: advance one year | quit: stop\npeople [QUERY] [page=N] | person NAME | settlements [QUERY] [page=N] | settlement NAME\ncountries | country NAME | rich [COUNTRY] | inventions [COUNTRY]\nroles [COUNTRY] | notables [COUNTRY] | lineages [NAME]\ndemographics [COUNTRY] | wars [COUNTRY] | diseases [COUNTRY] | disease NAME\ncatalog [QUERY] [page=N] | changes | help edit (all editing commands) | undo\nborders [COUNTRY] | geography: terrain, land borders, and sea neighbors.\nprojects [COUNTRY] | expeditions [COUNTRY] | systems [COUNTRY] | hazards SETTLEMENT\nAliases: richest, discoveries, innovations, government, individual, persons.\n34 foundations + 1,000 composed technique/application innovations, with prerequisites and effects.\nUse displayed names, including Roman numerals when shown. Quote multiword names in edits.\nOptional advanced ID lookup: help ids. Person views include deceased records. Wealth uses simulation units.\nInspection is read-only; edits take effect immediately. Neither advances the year.',
      'inspect'
    ];
  }
  const inspected = inspect_command(sim, raw);
  if (inspected != null) return inspected;
  const edited = edit_command(sim, raw);
  if (edited != null) return edited;
  if (['lineage', 'lineages'].includes(name)) {
    let tree = sim.lineage_tree();
    if (query) {
      tree = tree.split('\n\n').filter(block => block.toLowerCase().includes(query)).join('\n\n');
    }
    return [tree || 'No matching lineage.', 'inspect'];
  }
  let countries = [...sim.countries.values()].filter(c => c.ended == null);
  if (query) {
    const exact = countries.filter(c => c.name.toLowerCase() === query || query === String(c.id) || query === '#' + c.id);
    countries = exact.length > 0 ? exact : countries.filter(c => c.name.toLowerCase().includes(query));
  }
  if (countries.length === 0) {
    return ['No matching inhabited country.', 'inspect'];
  }
  const cids = new Set(countries.map(c => c.id));
  const people = [...sim.people.values()].filter(p => cids.has(p.country));
  if (['rich', 'richest'].includes(name)) {
    const rows = sorted(people, {key: p => p.wealth ?? 0, reverse: true}).slice(0, 20)
      .map((p, i) => `${i + 1}. ${sim.full_name(p)}: ${format(p.wealth ?? 0, ',.1f')} (${p.job ?? 'unassigned'})`);
    return ['Richest living people (wealth units):\n' + rows.join('\n'), 'inspect'];
  }
  if (['inventions', 'discoveries', 'innovations'].includes(name)) {
    const rows = [];
    for (const c of countries) {
      rows.push(`${c.name}\n  Foundational discoveries: ` + (sorted(c.technologies).join(', ') || 'none'));
      const acquired = c.innovations ?? new Map();
      for (const [key, year] of acquired) {
        const item = INNOVATIONS.get(key);
        if (!item) continue;
        const effects = item.modifiers.map(([effect, value]) => `${effect.replaceAll('_', ' ')} ${format(value, '+.1%')}`);
        rows.push(`  ${item.name} (year ${year}): ${effects.join(', ')}`);
      }
      if (acquired.size === 0) rows.push('  Specialized innovations: none yet');
      if (c.research_project) rows.push(`  Foundation project: ${c.research_project} (${fixed(c.research, 1)} points)`);
      const applied = INNOVATIONS.get(c.innovation_project);
      if (applied) rows.push(`  Applied project: ${applied.name} (${fixed(c.innovation_progress ?? 0, 1)}/${fixed(applied.cost, 1)})`);
    }
    return [rows.join('\n'), 'inspect'];
  }
  if (['roles', 'government'].includes(name)) {
    const rows = [];
    for (const c of countries) {
      rows.push(`${c.name}: ${c.government}; economy: ${c.economic_system ?? 'mixed'}`);
      const ruler = sim.people.get(c.ruler);
      rows.push('  Ruler: ' + (ruler ? sim.full_name(ruler) : 'vacant'));
      for (const [role, pid] of c.offices ?? new Map()) {
        const holder = sim.people.get(pid);
        if (holder?.country === c.id) rows.push(`  ${role}: ${sim.full_name(holder)}`);
      }
    }
    return [rows.join('\n'), 'inspect'];
  }
  if (['people', 'notables'].includes(name)) {
    const notable = people.filter(p => p.public_role || (p.fame ?? 0) >= 65);
    const lines = sorted(notable, {key: p => p.fame, reverse: true}).map(p => `${sim.full_name(p)}: ${p.public_role || p.job}, age ${p.age}`);
    return [lines.join('\n') || 'No public figures yet.', 'inspect'];
  }
  if (['country', 'countries'].includes(name)) {
    const counts = new Counter(people.map(p => p.country)); // Counter.get() is 0 for absent keys
    const rows = countries.map(c => `${c.name}: ${counts.get(c.id)} residents | ${c.government} | ${c.economic_system ?? 'mixed'} | food ${fixed(c.food, 0)}, prosperity ${fixed(c.prosperity, 0)}, stability ${fixed(c.stability, 0)} | ${sorted(c.conditions).join(', ') || 'normal conditions'}`);
    if (name === 'country') {
      for (const c of countries) {
        const ruler = sim.people.get(c.ruler);
        rows.push(`${c.name}: founded year ${c.founded}; leader ` + (ruler ? sim.full_name(ruler) : 'vacant') + `; treasury ${format(c.treasury, ',.1f')}; ${c.technologies.size} foundations, ${c.innovations?.size ?? 0} innovations`);
        const populations = new Counter(people.filter(p => p.country === c.id).map(p => p.settlement));
        rows.push(...[...sim.settlements.values()].filter(s => s.country === c.id && populations.get(s.id)).map(s => `  ${capitalize(s.kind)} ${s.name}: ${populations.get(s.id)} residents` + (c.capital === s.id ? ' (capital)' : '')));
      }
    }
    return [rows.join('\n'), 'inspect'];
  }
  return ['Unknown command. Type help for commands.', 'inspect'];
}
