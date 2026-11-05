/** Read-only directories and detailed inspection of simulation records. */

import {Counter, ValueError, fixed, format, int, maxOf, median, reEscape, repr, shlexQuote, shlexSplit, sorted, split, str, sum} from './runtime.js';
import {INNOVATIONS} from './discoveries.js';
import {TECHNOLOGIES} from './society.js';
import {projects_report, expeditions_report} from './development.js';
import {report as systems_report, hazard_report} from './systems.js';
import {report as economy_report, tile_report} from './economy.js';
import {describe as governments_report} from './governments.js';
import {report, describe} from './geography.js';

const PAGE_SIZE = 50;

/** Commands that take only a lower-cased free-text argument. */
const TEXT_REPORTS = new Map([
  ['projects', projects_report],
  ['expeditions', expeditions_report],
  ['systems', systems_report],
  ['economy', economy_report],
  ['governments', governments_report],
  ['borders', report],
  ['geography', report]
]);

const INSPECT_COMMANDS = new Set([
  'person', 'individual', 'people', 'persons', 'individuals', 'settlement', 'settlements', 'demographics',
  'wars', 'disease', 'diseases', 'ids', 'borders', 'geography', 'projects', 'expeditions', 'systems',
  'hazards', 'economy', 'tile', 'governments'
]);

const KIND_ALIASES = new Map([
  ['person', 'person'],
  ['people', 'person'],
  ['persons', 'person'],
  ['individual', 'person'],
  ['country', 'country'],
  ['countries', 'country'],
  ['settlement', 'settlement'],
  ['settlements', 'settlement'],
  ['lineage', 'lineage'],
  ['lineages', 'lineage'],
  ['discovery', 'discovery'],
  ['discoveries', 'discovery'],
  ['innovation', 'discovery']
]);

const count_where = (items, test) => items.filter(test).length;

export function _country_scope(sim, query) {
  return query ? resolve_entity(sim.countries, query, 'country').id : null;
}

export function _demographics(sim, query) {
  const cid = _country_scope(sim, query);
  const people = [...sim.people.values()].filter(p => cid == null || p.country === cid);
  const archived = [...sim.archive.values()].filter(p => cid == null || p.country === cid);
  const title = cid != null ? sim.countries.get(cid).name : 'World';
  const lines = [
    `Demographics: ${title}, year ${sim.year}`,
    `Living population: ${people.length}`,
    `Children (under 18): ${count_where(people, p => p.age < 18)}; adults: ${count_where(people, p => p.age >= 18)}`,
    'Age bands:'
  ];
  for (const [low, high] of [[0, 5], [6, 17], [18, 35], [36, 55], [56, 75], [76, 199]]) {
    lines.push(`  ${low}-${high}: ${count_where(people, p => low <= p.age && p.age <= high)}`);
  }
  const born = count_where(archived, p => p.born === sim.year);
  const dead = count_where(archived, p => p.died === sim.year);
  lines.push(`Archived records dated this year: births ${born}; deaths ${dead} (includes initial residents born in year 0 and editor additions).`);
  lines.push(`All archived people: ${archived.length}; deceased: ${count_where(archived, p => p.died != null)}`);
  if (cid == null) {
    const annual = [...sim.yearly_reports].reverse().find(r => r.get('year') === sim.year) ?? null;
    if (annual.size > 0) {
      lines.push(`Annual simulation report: births ${annual.get('births')}; deaths ${annual.get('deaths')} (before subsequent edits).`);
    }
  } else {
    lines.push('Birth/death records are grouped by current or last country, not historical citizenship.');
  }
  lines.push('Country distribution:');
  // sorted() orders the Counter's [key, count] pairs like Python tuples.
  for (const [country_id, count] of sorted(new Counter(people.map(p => p.country)))) {
    lines.push(`  ${sim.countries.get(country_id).name}: ${count}`);
  }
  lines.push('Settlement distribution:');
  // Real ids ascending, with the "no settlement" key last.
  for (const [sid, count] of sorted(new Counter(people.map(p => p.settlement)), {key: ([key]) => [key == null, key || 0]})) {
    const place = sim.settlements.get(sid);
    lines.push(`  ${place ? place.name : 'No settlement'}: ${count}`);
  }
  const jobs = sorted(new Counter(people.map(p => p.job ?? 'unrecorded'))).map(([job, count]) => `${job}: ${count}`);
  lines.push('Occupations: ' + (jobs.join(', ') || 'none'));
  const wealth = people.map(p => p.wealth ?? 0);
  lines.push(`Wealth: total ${format(sum(wealth), ',.2f')}; mean ${format(wealth.length > 0 ? sum(wealth) / wealth.length : 0, ',.2f')}; median ${format(wealth.length > 0 ? median(wealth) : 0, ',.2f')}; maximum ${format(maxOf(wealth, {default: 0}), ',.2f')}`);
  const immune = count_where(people, p => [...p.immunity].some(name => (p.immunity_until.get(name) ?? Infinity) > sim.year));
  lines.push(`Currently infected: ${count_where(people, p => p.infection)}; people with unexpired immunity: ${immune}`);
  return lines.join('\n');
}

export function _wars(sim, query) {
  const cid = _country_scope(sim, query);
  const lines = ['Current wars:'];
  // Entries sort like Python tuples: by country pair, then start year.
  for (const [pair, started] of sorted(sim.wars)) {
    if (cid != null && !pair.includes(cid)) {
      continue;
    }
    const detail = sim.war_details?.get(pair) ?? new Map();
    lines.push(`  ${sim.countries.get(pair[0]).name} versus ${sim.countries.get(pair[1]).name}: began year ${started}; ${sim.year - started} elapsed years`);
    lines.push(`    Campaign score: ${fixed(detail.get('score') ?? 0, 2)} (positive favors first country)`);
    for (const [index, country_id] of pair.entries()) {
      const metrics = ['mobilized', 'supplies', 'exhaustion', 'captures'].map(key => {
        const values = detail.get(key);
        return `${key}: ${values?.length > index ? str(values[index]) : 'not recorded'}`;
      });
      const targets = detail.get('objectives') ?? [];
      const target = targets.length > index ? sim.settlements.get(targets[index]) : null;
      metrics.push('objective: ' + (target ? target.name : 'none recorded'));
      lines.push(`    ${sim.countries.get(country_id).name}: ` + metrics.join('; '));
    }
  }
  if (lines.length === 1) {
    lines.push('  No current wars.');
  }
  lines.push('Truces (including expired records):');
  const truces = sorted(sim.truces ?? []).filter(([pair]) => cid == null || pair.includes(cid));
  for (const [pair, expiry] of truces) {
    lines.push(`  ${sim.countries.get(pair[0]).name} / ${sim.countries.get(pair[1]).name}: expires year ${expiry}; ${expiry > sim.year ? 'active' : 'expired'}`);
  }
  if (truces.length === 0) {
    lines.push('  none');
  }
  return lines.join('\n');
}

function _disease_detail(sim, query, known) {
  const wanted = query.toLowerCase();
  const exact = [...known.keys()].filter(name => name.toLowerCase() === wanted);
  const matches = exact.length > 0 ? exact : [...known.keys()].filter(name => name.toLowerCase().includes(wanted));
  if (!query || matches.length === 0) {
    throw new ValueError('Specify a known disease name. Use diseases to list them.');
  }
  if (matches.length > 1) {
    throw new ValueError('Ambiguous disease: ' + matches.join(', ') + '. Use its full name.');
  }
  const disease = known.get(matches[0]);
  const name = disease.name;
  const course = sim.disease_profiles?.get(name)?.get('course') ?? disease.course;
  const living = [...sim.people.values()];
  const lines = [
    `Disease: ${name}${!sim.sicknesses.has(name) ? ' (retired)' : ''}`,
    `Course: ${course}; recurring: ${str(disease.recurring)}; transmission: ${disease.transmission}`,
    `Baseline annual probabilities: infection ${format(disease.infection_chance, '.2%')}; death ${format(disease.death_chance, '.2%')}; recovery ${format(disease.recovery_chance, '.2%')}`,
    `Incubation steps: ${disease.incubation_steps}; immunity years: ${disease.immunity_years}; mutation chance: ${format(disease.mutation_chance, '.2%')}`,
    'Actual risks also depend on disease phase, care, immunity, and country conditions.',
    'Current cases by country:'
  ];
  for (const [country_id, count] of sorted(new Counter(living.filter(p => p.infection === name).map(p => p.country)))) {
    lines.push(`  ${sim.countries.get(country_id).name}: ${count}`);
  }
  const active = count_where(living, p => p.infection === name);
  const immune = count_where(living, p => p.immunity.has(name) && (p.immunity_until.get(name) ?? Infinity) > sim.year);
  const outcomes = new Counter([...sim.archive.values()].flatMap(p => (p.infection_history ?? []).filter(entry => entry.get('disease') === name).map(entry => entry.get('event'))));
  lines.push(`Active cases: ${active}; living people with unexpired immunity: ${immune}`);
  const cure = sim.cure_progress?.get(name) ?? 0;
  const researchers = count_where(living, p => p.age >= 18 && ['scientist', 'healer'].includes(p.job));
  lines.push(`Cure progress: ${fixed(cure, 1)}% (${researchers} scientists and healers at work); ` + (cure >= 100 ? 'eradication is possible once no one is infected.' : 'eradication requires 100%.'));
  lines.push('Recorded lifetime health events: ' + (sorted(outcomes).map(([event, count]) => `${event}: ${count}`).join(', ') || 'none'));
  lines.push('Local annual trends (last 10 recorded years per country):');
  for (const country of sim.countries.values()) {
    const outbreaks = new Map([...(country.retired_outbreaks ?? new Map()), ...(country.disease_outbreaks ?? new Map())]);
    const records = outbreaks.get(name)?.get('annual') ?? [];
    for (const record of records.slice(-10)) {
      lines.push(`  ${country.name}, year ${str(record.get('year'))}: infections ${str(record.get('infections'))}; deaths ${str(record.get('deaths'))}; recoveries ${str(record.get('recoveries'))}; active ${str(record.get('active'))}; ${record.get('phase') ?? 'unrecorded phase'}`);
    }
  }
  return lines.join('\n');
}

export function _diseases(sim, query, detailed = false) {
  const known = new Map([...(sim.retired_sicknesses ?? new Map()), ...sim.sicknesses]);
  if (detailed) {
    return _disease_detail(sim, query, known);
  }
  const cid = _country_scope(sim, query);
  const people = [...sim.people.values()].filter(p => cid == null || p.country === cid);
  const cases = new Counter(people.filter(p => p.infection).map(p => p.infection));
  const lines = [
    'Known disease types' + (cid != null ? ` (case counts in ${sim.countries.get(cid).name})` : ' (world case counts)') + ':'
  ];
  for (const [name, disease] of sorted(known)) {
    const course = sim.disease_profiles?.get(name)?.get('course') ?? disease.course;
    lines.push(`  ${name}: ${str(course)}; cases ${cases.get(name)}${!sim.sicknesses.has(name) ? ' | retired' : ''}`);
  }
  if (known.size === 0) {
    lines.push('  No known disease types.');
  }
  return lines.join('\n');
}

/** Part of a personal name before its " of <country>" suffix. */
const name_stem = name => {
  const cut = name.lastIndexOf(' of ');
  return cut < 0 ? name : name.slice(0, cut);
};

/** Names are primary; numeric IDs remain an optional advanced shortcut. */
export function resolve_entity(mapping, query, label, name_fn = item => item.name) {
  query = query.trim();
  if (!query) {
    throw new ValueError(`Specify a ${label} name.`);
  }
  if (mapping.has(query)) {
    return mapping.get(query);
  }
  const wanted = query.toLowerCase();
  const key_matches = [...mapping].filter(([key]) => typeof key === 'string' && key.toLowerCase() === wanted).map(([, item]) => item);
  if (key_matches.length === 1) {
    return key_matches[0];
  }
  const number = query.replace(/^#+/, '');
  if (/^\d+$/.test(number)) {
    const item = mapping.get(int(number));
    if (item == null) {
      throw new ValueError(`No ${label} with ID #${number}.`);
    }
    return item;
  }
  const items = [...mapping.values()];
  const exact = items.filter(item => name_fn(item).toLowerCase() === wanted);
  // Allow a personal name without its country suffix, keeping I distinct from
  // II/III. Never let a missing "Mara Vale I" silently target "Mara Vale II".
  const short = items.filter(item => name_stem(name_fn(item)).toLowerCase() === wanted);
  const pattern = new RegExp('(?<![\\p{L}\\p{N}_])' + reEscape(wanted) + '(?![\\p{L}\\p{N}_])', 'u');
  const numbered = /^[ivxlcdm]+$/.test(query.split(/\s+/).at(-1).toLowerCase());
  const fuzzy = () => items.filter(item => numbered ? pattern.test(name_fn(item).toLowerCase()) : name_fn(item).toLowerCase().includes(wanted));
  const matches = exact.length > 0 ? exact : short.length > 0 ? short : fuzzy();
  if (matches.length === 0) {
    throw new ValueError(`No ${label} matching ${repr(query)}.`);
  }
  if (matches.length > 1) {
    const candidates = matches.slice(0, 20).map(item => shlexQuote(name_fn(item))).join('; ');
    const suffix = matches.length > 20 ? `; and ${matches.length - 20} more` : '';
    throw new ValueError(`Ambiguous ${label}: ${candidates}${suffix}. Use one of these full names, including its Roman numeral and country when shown.`);
  }
  return matches[0];
}

export function _person_ref(sim, pid) {
  const person = sim.archive.get(pid);
  return person ? sim.full_name(person) : 'Unrecorded person';
}

export function _person_detail(sim, person) {
  const country = sim.countries.get(person.country);
  const settlement = sim.settlements.get(person.settlement);
  const lineage = sim.lineages.get(person.lineage);
  const children = [...sim.archive.values()].filter(p => p.parents.includes(person.id));
  const lines = [
    `Person: ${sim.full_name(person)}`,
    `Status: ${sim.people.has(person.id) ? 'living' : 'deceased'}; age: ${person.age}; born: year ${person.born}`,
    `Country: ${country.name}`,
    `Settlement: ${settlement ? settlement.name : 'none'}`,
    `Lineage: ${sim.lineage_name(lineage.id)}`,
    `Wealth: ${format(person.wealth ?? 0, ',.2f')}; occupation: ${person.job ?? 'none'}`,
    `Public role: ${person.public_role || 'none'}; fame: ${fixed(person.fame ?? 0, 1)}`,
    'Parents: ' + (person.parents.map(pid => _person_ref(sim, pid)).join('; ') || 'unrecorded'),
    'Children: ' + (children.map(p => _person_ref(sim, p.id)).join('; ') || 'none'),
    `${person.died == null ? 'Current infection' : 'Infection at death'}: ${person.infection || 'none'}; infection steps: ${person.infection_steps}`,
    `Wounds: ${(person.wounded_until ?? 0) > sim.year ? 'recovering until year ' + person.wounded_until : 'none active'}`,
    'Immunity records: ' + (sorted(person.immunity).join(', ') || 'none'),
    'Immunity expiry years: ' + (sorted(person.immunity_until).map(([name, year]) => `${name}: ${year}`).join(', ') || 'none')
  ];
  if (person.died != null) {
    lines.push(`Died: year ${person.died}; cause: ${person.cause_of_death || 'unrecorded'}`);
  }
  const health = person.infection_history ?? [];
  lines.push('Health history:');
  lines.push(...health.map(entry => `  Year ${entry.get('year') ?? '?'}: ${entry.get('event') ?? '?'} - ${entry.get('disease') ?? '?'}`));
  if (health.length === 0) {
    lines.push('  No recorded infections or vaccinations.');
  }
  const marker = `{person:${person.id}:`;
  const events = sim.history.filter(([, message]) => message.includes(marker));
  lines.push('Recorded public history:');
  lines.push(...events.map(([year, message]) => `  Year ${year}: ${sim.render_history(message)}`));
  if (events.length === 0) {
    lines.push('  No public events recorded.');
  }
  return lines.join('\n');
}

export function _directory(rows, title, page, footer = 'Use page=N to browse; inspect a record using its displayed name.') {
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  if (page > pages) {
    throw new ValueError(`Page ${page} does not exist; choose 1 through ${pages}.`);
  }
  const shown = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return `${title} (${rows.length} matches; page ${page}/${pages}):\n` + (shown.join('\n') || 'No matches.') + '\n' + footer;
}

/** Parse a "page=N" token into a positive integer. */
function _parse_page(token) {
  let page;
  try {
    page = int(token.slice(5));
  } catch (error) {
    if (error instanceof ValueError) {
      throw new ValueError('Page must be a positive integer.');
    }
    throw error;
  }
  if (page < 1) {
    throw new ValueError('Page must be a positive integer.');
  }
  return page;
}

/** Optional ID directory, separate from normal name-based views. */
export function _id_search(sim, tokens) {
  const kind = tokens.length > 0 ? KIND_ALIASES.get(tokens[0].toLowerCase()) : null;
  tokens = kind ? tokens.slice(1) : tokens;
  const terms = [];
  let page = 1;
  for (const token of tokens) {
    if (token.toLowerCase().startsWith('page=')) {
      page = _parse_page(token);
    } else {
      terms.push(token);
    }
  }
  const query = terms.join(' ').toLowerCase();
  const wants = name => kind == null || kind === name;
  const entries = [];
  if (wants('person')) {
    entries.push(...[...sim.archive.values()].map(p => ['person', String(p.id), sim.full_name(p) + (p.died != null ? ' [deceased]' : '')]));
  }
  if (wants('country')) {
    entries.push(...[...sim.countries.values()].map(c => ['country', String(c.id), c.name + (c.ended != null ? ' [ended]' : '')]));
  }
  if (wants('settlement')) {
    entries.push(...[...sim.settlements.values()].map(s => ['settlement', String(s.id), s.name + (s.abandoned != null ? ' [abandoned]' : '')]));
  }
  if (wants('lineage')) {
    entries.push(...[...sim.lineages.values()].map(l => ['lineage', String(l.id), sim.lineage_name(l.id)]));
  }
  if (kind === 'discovery') {
    entries.push(...[...INNOVATIONS.values()].map(i => ['innovation', i.id, i.name]));
    entries.push(...[...TECHNOLOGIES.keys()].map(name => ['foundation', name, name]));
  }
  const id_query = query.replace(/^#+/, '');
  const rows = entries
    .filter(([, key, name]) => name.toLowerCase().includes(query) || id_query === key.toLowerCase())
    .map(([label, key, name]) => `${label} [${key}]: ${name}`);
  return _directory(rows, 'Advanced ID lookup', page, 'Names work in all commands. Alternatively use the ID in brackets (without brackets); numeric IDs may also use #. Use page=N to browse.');
}

function _settlement_detail(sim, place) {
  const residents = [...sim.people.values()].filter(p => p.settlement === place.id).sort((a, b) => a.id - b.id);
  const country = sim.countries.get(place.country);
  const lines = [
    `Settlement: ${place.name}`,
    `Country: ${country.name}; kind: ${place.kind}`,
    `Terrain: ${describe(sim, place)} (map cell ${place.gx}, ${place.gy})`,
    'Buildings: ' + (sorted((place.buildings ?? new Map()).keys()).join(', ') || 'none'),
    `Founded: year ${place.founded}; founder: ${_person_ref(sim, place.founder)}`,
    `Abandoned: ${place.abandoned != null ? 'year ' + place.abandoned : 'no'}`,
    `Removed by editor: ${place.demolished != null ? 'year ' + place.demolished : 'no'}`,
    `Population: ${residents.length}; capital: ${country.capital === place.id ? 'yes' : 'no'}`,
    'Residents:'
  ];
  lines.push(...residents.slice(0, PAGE_SIZE).map(p => '  ' + _person_ref(sim, p.id)));
  if (residents.length === 0) {
    lines.push('  none');
  }
  if (residents.length > PAGE_SIZE) {
    lines.push(`  Showing ${PAGE_SIZE} of ${residents.length}. Use people settlement=${shlexQuote(place.name)} page=N for more.`);
  }
  lines.push('Recorded history (name mentions):');
  const events = sim.history.filter(([, message]) => message.toLowerCase().includes(place.name.toLowerCase()));
  lines.push(...events.map(([year, message]) => `  Year ${year}: ${sim.render_history(message)}`));
  if (events.length === 0) {
    lines.push('  No events recorded.');
  }
  return lines.join('\n');
}

/** Return [display, 'inspect'] for supported commands, otherwise null. */
export function inspect_command(sim, text) {
  const head = split(text.trim());
  if (head.length === 0 || !INSPECT_COMMANDS.has(head[0].toLowerCase())) {
    return null;
  }
  try {
    const tokens = shlexSplit(text);
    const command = tokens.shift().toLowerCase();
    const joined = tokens.join(' ');
    if (command === 'ids') {
      return [_id_search(sim, tokens), 'inspect'];
    }
    if (TEXT_REPORTS.has(command)) {
      return [TEXT_REPORTS.get(command)(sim, joined.toLowerCase()), 'inspect'];
    }
    if (command === 'tile') {
      if (tokens.length !== 2 || !tokens.every(t => /^-*\d+$/.test(t))) {
        throw new ValueError('Usage: tile X Y');
      }
      return [tile_report(sim, int(tokens[0]), int(tokens[1])), 'inspect'];
    }
    if (command === 'hazards') {
      return [hazard_report(sim, resolve_entity(sim.settlements, joined, 'settlement')), 'inspect'];
    }
    if (command === 'demographics') {
      return [_demographics(sim, joined), 'inspect'];
    }
    if (command === 'wars') {
      return [_wars(sim, joined), 'inspect'];
    }
    if (command === 'disease' || command === 'diseases') {
      return [_diseases(sim, joined, command === 'disease'), 'inspect'];
    }
    if (command === 'person' || command === 'individual') {
      const person = resolve_entity(sim.archive, joined, 'person', p => sim.full_name(p));
      return [_person_detail(sim, person), 'inspect'];
    }
    if (command === 'settlement') {
      return [_settlement_detail(sim, resolve_entity(sim.settlements, joined, 'settlement')), 'inspect'];
    }
    // Remaining commands are the people/settlements directories.
    let page = 1;
    const query_parts = [];
    let settlement_id = null;
    let country_id = null;
    for (const token of tokens) {
      const lowered = token.toLowerCase();
      if (lowered.startsWith('page=')) {
        page = _parse_page(token);
      } else if (lowered.startsWith('settlement=') && command !== 'settlements') {
        settlement_id = resolve_entity(sim.settlements, token.slice(token.indexOf('=') + 1), 'settlement').id;
      } else if (lowered.startsWith('country=')) {
        country_id = resolve_entity(sim.countries, token.slice(token.indexOf('=') + 1), 'country').id;
      } else {
        query_parts.push(token);
      }
    }
    const query = query_parts.join(' ').toLowerCase();
    const rows = [];
    if (command === 'settlements') {
      const places = [...sim.settlements.values()].sort((a, b) => a.id - b.id);
      for (const place of places) {
        if (country_id != null && place.country !== country_id) {
          continue;
        }
        const country = sim.countries.get(place.country);
        if (query && !place.name.toLowerCase().includes(query) && !country.name.toLowerCase().includes(query) && ![String(place.id), '#' + place.id].includes(query)) {
          continue;
        }
        const population = count_where([...sim.people.values()], p => p.settlement === place.id);
        rows.push(`${place.name} | ${country.name} | ${place.kind} | population ${population}` + (place.abandoned != null ? ' | abandoned' : ''));
      }
      return [_directory(rows, 'Settlements', page), 'inspect'];
    }
    const archive = [...sim.archive.values()].sort((a, b) => a.id - b.id);
    for (const person of archive) {
      if (country_id != null && person.country !== country_id) {
        continue;
      }
      if (settlement_id != null && person.settlement !== settlement_id) {
        continue;
      }
      const name = sim.full_name(person);
      if (query && !name.toLowerCase().includes(query) && ![String(person.id), '#' + person.id].includes(query)) {
        continue;
      }
      rows.push(`${name} | age ${person.age} | ${sim.people.has(person.id) ? 'living' : 'deceased'}`);
    }
    return [_directory(rows, 'People (living and deceased)', page), 'inspect'];
  } catch (error) {
    if (error instanceof ValueError) {
      return [error.message, 'inspect'];
    }
    throw error;
  }
}
