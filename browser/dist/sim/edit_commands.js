/** Validated, atomic sandbox interventions between simulated years. */

import {replaceState, KeyError, TupleMap, ValueError, addAll, capitalize, deepClone, difference, fixed, float, fstr, int, intersection, isSubset, maxOf, partition, removeAll, replace, repr, round, setdefault, shlexSplit, sorted, split, str} from './runtime.js';
import {resolve_entity} from './inspection.js';
import {_history, retire_disease, _local_outbreak, cure_progress} from './epidemiology.js';
import {initialize_civic, refresh_public_roles, PAY, SYSTEMS} from './civic.js';
import {maintain_rulers, TECHNOLOGIES, FOOD_TECHS, unlock, pass_on_knowledge, pacts_of, end_pact} from './society.js';
import {ANY, met as tech_met} from './technology.js';
import {INNOVATIONS, award_innovation} from './discoveries.js';
import {Country, Sickness} from './civsim.js';
import {_transfer} from './warfare.js';
import {KINDS, strike, describe} from './disasters.js';
import {ensure_placed, hazards_at, W, H, world, WATER} from './geography.js';
import {BUILDINGS, start_project, launch_expedition} from './development.js';
import {GOVERNMENTS} from './governments.js';

export const EDIT_HELP = 'Editing commands (no command advances the year):\nUse names from people/settlements/countries. Quote names containing spaces.\nInclude Roman numerals and the country suffix when needed to distinguish people.\nset person PERSON name|age|wealth|fame|job|lineage|settlement|country VALUE\nset country COUNTRY name|government|economy|food|prosperity|stability|research|treasury|capacity|ruler|quarantine VALUE\nset settlement SETTLEMENT name|country VALUE\nset simulation war_chance|country_chance|lineage_chance|disaster_chance VALUE\nadd person SETTLEMENT [name=Ada age=0 surname=Vale lineage=LINEAGE parent=PERSON]\n  Choose surname OR lineage OR parent; parent may contain two comma-separated names in quotes.\ndelete person PERSON  (records a death; ancestry and the person\'s archive remain)\nmove person PERSON SETTLEMENT\nadd settlement COUNTRY [name=Newtown founder=PERSON residents=10]\n  Relocates existing residents; default is one adult founder.\ndelete settlement SETTLEMENT to=DESTINATION  (relocates residents; keeps its history)\nadd country SETTLEMENT [name=Newland]  (the settlement secedes)\ndelete country COUNTRY to=DESTINATION  (merges population and territory)\nadd lineage PERSON [surname=Vale]  (found a family branch)\nadd disease NAME [course=acute infection=.35 death=.02 recovery=.85 transmission=contact immunity=8]\nset disease NAME course|infection|death|recovery|transmission|immunity VALUE\ninfect PERSON DISEASE | cure PERSON | outbreak COUNTRY DISEASE [cases=5]\neradicate DISEASE | delete disease NAME  (needs a 100% cure and no current infections; keeps records)\nset disease NAME cure 0-100  (scientists and healers raise cure progress each year)\ngrant COUNTRY DISCOVERY_NAME | revoke COUNTRY DISCOVERY_NAME\n  grant requires prerequisites; revoke also removes dependent discoveries.\ncatalog [QUERY] [page=N] | diseases | wars | changes  (information only)\nwar COUNTRY COUNTRY [force=true] | peace COUNTRY COUNTRY [years=5]\n  force=true explicitly breaks an existing truce.\ntrade science COUNTRY COUNTRY  (each learns part of a discovery the other holds; not during a war)\ntrade pact COUNTRY COUNTRY | trade end COUNTRY COUNTRY  (a standing science pact; war ends it)\ntrigger COUNTRY Famine|Drought|Panic|Health|Calm|Safety|Abundance\ndisaster COUNTRY flood|storm|wildfire|earthquake|landslide|blizzard [severity=minor|major|severe] [at=SETTLEMENT]\n  The disaster is centered on that settlement (default: the country\'s riskiest) and can reach neighbors.\nbuild SETTLEMENT KIND [force=true] | build SETTLEMENT road to=SETTLEMENT\n  KIND: well granary market school library university observatory clinic hospital aqueduct walls harbor\n  levee firebreak foundations monument theater mine mill. Needs technology unless force=true.\nsettle SETTLEMENT [x=CELL y=CELL] [size=N]  (send settlers to found a new town; they travel for years)\nundo  (restore the most recent edit; unavailable after advancing a year)\nExamples (substitute names from your world):\n  set person "Mara Vale II of Arden" wealth 500\n  add person "River Town" name=Ada age=25 surname=Vale\nNames are the normal controls. Optional advanced shortcut: ids person Mara looks up numeric IDs.\nEditing is immediate. Natural yearly births/deaths remain separate from editor additions/deaths.';

export const EDIT_VERBS = new Set([
  'set',
  'add',
  'delete',
  'remove',
  'eradicate',
  'move',
  'infect',
  'cure',
  'outbreak',
  'grant',
  'revoke',
  'war',
  'peace',
  'trade',
  'trigger',
  'disaster',
  'build',
  'settle',
  'undo'
]);

export function _number(value, low = 0, high = null, integer = false) {
  let result;
  try {
    result = integer ? int(value) : float(value);
  } catch (error) {
    if (!(error instanceof TypeError || error instanceof ValueError)) throw error;

    throw new ValueError('Expected ' + (integer ? 'an integer' : 'a number') + `, got ${repr(value)}.`);
  }
  if (!integer && !Number.isFinite(result) || result < low || high != null && result > high) {
    throw new ValueError(`Value must be finite and between ${low} and ${fstr(high ?? 'no upper limit')}.`);
  }
  return result;
}

export function _name(value) {
  value = value.trim();
  if (!(2 <= value.length && value.length <= 80) || [...value].some(c => c.codePointAt(0) < 32 || '{}'.includes(c))) {
    throw new ValueError('Names must contain 2-80 characters, with no braces or control characters.');
  }
  return value;
}

/** `choices` is any iterable of allowed lower-case strings. */
export function _choice(value, choices) {
  value = value.toLowerCase();
  const allowed = [...choices];
  if (!allowed.includes(value)) {
    throw new ValueError('Choose one of: ' + sorted(allowed).join(', ') + '.');
  }
  return value;
}

export function _options(tokens, allowed) {
  const options = new Map();
  for (const token of tokens) {
    const [name, sep, value] = partition(token, '=');
    const key = name.toLowerCase();
    if (!sep || !value || !allowed.has(key) || options.has(key)) {
      throw new ValueError('Options must be unique key=value entries; allowed: ' + sorted(allowed).join(', '));
    }
    options.set(key, value);
  }
  return options;
}

export function _arity(tokens, count, usage) {
  if (tokens.length !== count) {
    throw new ValueError('Usage: ' + usage + '. Quote names containing spaces.');
  }
}

export function _person(sim, query) {
  return resolve_entity(sim.people, query, 'living person', p => sim.full_name(p));
}

export function _country(sim, query) {
  return resolve_entity(new Map([...sim.countries].filter(([, c]) => c.ended == null)), query, 'country');
}

export function _settlement(sim, query) {
  const active = [...sim.settlements].filter(([, s]) => s.demolished == null && sim.countries.get(s.country).ended == null);
  return resolve_entity(new Map(active), query, 'settlement');
}

export function _disease(sim, query) {
  return resolve_entity(sim.sicknesses, query, 'disease');
}

/** Eradication needs a complete cure and no one currently infected. */
export function _eradication_check(sim, disease) {
  const progress = sim.cure_progress?.get(disease.name) ?? 0;
  const infected = [...sim.people.values()].filter(p => p.infection === disease.name).length;
  const problems = [];
  if (progress < 100) {
    problems.push(`the cure is only ${fixed(progress, 0)}% complete (100% required)`);
  }
  if (infected > 0) {
    problems.push(`${infected} ${infected === 1 ? 'person is' : 'people are'} still infected`);
  }
  if (problems.length > 0) {
    throw new ValueError(`Cannot eradicate ${disease.name}: ` + problems.join(' and ') + '.');
  }
}

export function _unique_name(objects, name, exclude = null) {
  name = _name(name);
  if ([...objects].some(obj => obj.name.toLowerCase() === name.toLowerCase() && obj !== exclude)) {
    throw new ValueError(`The name ${repr(name)} is already in use.`);
  }
  return name;
}

/** One archived death and one estate transfer, without running annual income. */
export function _kill(sim, person, cause) {
  if (!sim.people.has(person.id)) {
    throw new ValueError('This person is already deceased.');
  }
  person.died = sim.year;
  person.cause_of_death = cause;
  sim.lineages.get(person.lineage).deaths += 1;
  sim.people.delete(person.id);
  const heirs = [...sim.people.values()].filter(p => p.parents.includes(person.id));
  const fortune = person.wealth ?? 0;
  if (heirs.length > 0) {
    for (const heir of heirs) {
      heir.wealth += fortune / heirs.length;
    }
  } else {
    let country = sim.countries.get(person.country);
    while (country.absorbed_by != null) {
      country = sim.countries.get(country.absorbed_by);
    }
    country.treasury += fortune;
  }
  person.wealth = 0;
  person.estate_settled = true;
}

export function _cure(sim, person, immunity = true) {
  if (!person.infection) {
    throw new ValueError('This person has no active infection.');
  }
  const name = person.infection;
  person.infection = null;
  person.infection_steps = 0;
  if (immunity) {
    person.immunity.add(name);
    person.immunity_until.set(name, sim.year + sim.sicknesses.get(name).immunity_years);
  }
  _history(person, 'recovered', name, sim.year);
}

export function _infect(sim, person, disease) {
  if (person.infection) {
    throw new ValueError('This person is already infected; cure them before replacing the infection.');
  }
  person.immunity.delete(disease.name);
  person.immunity_until.delete(disease.name);
  person.infection = disease.name;
  person.infection_steps = 0;
  _history(person, 'infected', disease.name, sim.year);
}

export function _reconcile(sim, refresh = true, elect = true) {
  initialize_civic(sim);
  const occupied = new Set([...sim.people.values()].map(p => p.country));
  for (const c of sim.countries.values()) {
    if (!occupied.has(c.id)) {
      c.ended = c.ended ?? sim.year;
      c.ruler = null;
      c.offices = new Map();
    }
    const ruler = sim.people.get(c.ruler);
    if (ruler == null || ruler.country !== c.id || ruler.age < 18) {
      c.ruler = null;
    }
  }
  sim.update_settlements(false);
  for (const pair of [...sim.wars.keys()]) {
    if (pair.some(cid => sim.countries.get(cid).ended != null)) {
      sim.wars.delete(pair);
      sim.war_details?.delete(pair);
    }
  }
  if (refresh) {
    if (elect) {
      maintain_rulers(sim);
    }
    refresh_public_roles(sim, false);
  }
}

const COURSES = ['acute', 'chronic', 'endemic'];
const TRANSMISSIONS = ['contact', 'respiratory', 'waterborne'];

function _set_person(sim, target, field, value) {
  const p = _person(sim, target);
  if (field === 'name' || field === 'first') {
    const old = p.first;
    p.first = _name(value);
    // Preserve duplicate numbering for every surname this person held.
    for (const [key, holders] of [...sim.name_holders]) {
      if (key.startsWith(old + ' ') && holders.has(p.id)) {
        setdefault(sim.name_holders, p.first + key.slice(old.length), new Set()).add(p.id);
      }
    }
    sim.register_name(p);
  } else if (field === 'age') {
    const age = _number(value, 0, 150, true);
    const born = sim.year - age;
    if (p.parents.some(parent => sim.archive.get(parent).born + 16 > born)) {
      throw new ValueError('That age would make this person less than 16 years younger than a parent.');
    }
    if ([...sim.archive.values()].some(child => child.parents.includes(p.id) && child.born < born + 16)) {
      throw new ValueError('That age would make this person less than 16 years older than a child.');
    }
    p.age = age;
    p.born = sim.year - p.age;
    if (p.age < 18) {
      p.job = 'child';
    } else if (p.job === 'child') {
      p.job = 'laborer';
    }
    p.public_role = p.age < 18 ? '' : p.public_role;
  } else if (field === 'wealth' || field === 'fame') {
    p[field] = _number(value, 0, field === 'fame' ? 100 : 1e12);
  } else if (field === 'job') {
    const job = _choice(value, [...PAY.keys(), 'child']);
    if (p.age < 18 !== (job === 'child')) {
      throw new ValueError('Children use job=child; adults need an adult occupation.');
    }
    p.job = job;
  } else if (field === 'lineage') {
    const lineage = resolve_entity(sim.lineages, value, 'lineage', l => sim.lineage_name(l.id));
    p.lineage = lineage.id;
    sim.register_name(p);
  } else if (field === 'settlement' || field === 'country') {
    const place = field === 'settlement' ? _settlement(sim, value) : sim.settlements.get(_country(sim, value).capital);
    [p.settlement, p.country] = [place.id, place.country];
  } else {
    throw new ValueError('Person fields: name, age, wealth, fame, job, lineage, settlement, country.');
  }
  return `${sim.full_name(p)}: ${field} set to ${value}.`;
}

function _set_country(sim, target, field, value) {
  const c = _country(sim, target);
  if (field === 'name') {
    c.name = _unique_name(sim.countries.values(), value, c);
    sim.names.used_countries.add(c.name);
  } else if (['food', 'prosperity', 'stability'].includes(field)) {
    c[field] = _number(value, 0, 100);
  } else if (field === 'research' || field === 'treasury') {
    c[field] = _number(value, 0, 1e12);
  } else if (field === 'capacity') {
    c.capacity = _number(value, 1, 1000000000, true);
    c.capacity_manual = true;
  } else if (field === 'government') {
    c.government = _choice(value, GOVERNMENTS.keys());
    c.government_since = sim.year;
    c.last_election = sim.year;
  } else if (field === 'economy' || field === 'economic_system') {
    c.economic_system = _choice(value, SYSTEMS);
    c.economic_since = sim.year;
  } else if (field === 'ruler') {
    const ruler = value.toLowerCase() === 'none' ? null : _person(sim, value);
    if (ruler && (ruler.country !== c.id || ruler.age < 18)) {
      throw new ValueError('A ruler must be a living adult in this country.');
    }
    c.ruler = ruler ? ruler.id : null;
    c.last_election = sim.year;
  } else if (field === 'quarantine') {
    c.quarantine = ['true', 'on'].includes(_choice(value, ['true', 'false', 'on', 'off']));
  } else {
    throw new ValueError('Unknown country field. Type help edit for supported fields.');
  }
  return `${c.name}: ${field} set to ${value}.`;
}

function _set_settlement(sim, target, field, value) {
  const s = _settlement(sim, target);
  if (field === 'name') {
    s.name = _unique_name(sim.settlements.values(), value, s);
  } else if (field === 'country') {
    const c = _country(sim, value);
    if (c.id === s.country) {
      throw new ValueError('This settlement already belongs to that country.');
    }
    const residents_elsewhere = [...sim.people.values()].some(p => p.country === s.country && p.settlement !== s.id);
    _transfer(sim, c.id, s.country, residents_elsewhere ? s : null);
  } else {
    throw new ValueError('Settlement fields: name, country. Village/town/city status follows population.');
  }
  return `${s.name}: ${field} set to ${value}.`;
}

function _set_disease(sim, target, field, value) {
  const disease = _disease(sim, target);
  const chance_fields = new Map([['infection', 'infection_chance'], ['death', 'death_chance'], ['recovery', 'recovery_chance']]);
  let changes;
  if (field === 'cure') {
    cure_progress(sim).set(disease.name, _number(value, 0, 100));
    return `Disease ${disease.name}: cure progress set to ${value}%.`;
  }
  if (chance_fields.has(field)) {
    changes = {[chance_fields.get(field)]: _number(value, 0, 1)};
  } else if (field === 'immunity') {
    changes = {immunity_years: _number(value, 1, 100, true)};
  } else if (field === 'course') {
    const course = _choice(value, COURSES);
    changes = {course, recurring: course === 'endemic'};
  } else if (field === 'transmission') {
    changes = {transmission: _choice(value, TRANSMISSIONS)};
  } else {
    throw new ValueError('Disease fields: infection, death, recovery, immunity, course, transmission, cure.');
  }
  sim.sicknesses.set(disease.name, replace(disease, changes));
  sim.disease_profiles?.delete(disease.name);
  return `Disease ${disease.name}: ${field} set to ${value}.`;
}

export function _set(sim, args) {
  if (args.length < 3) {
    throw new ValueError('Usage: set TYPE NAME FIELD VALUE; or set simulation FIELD VALUE.');
  }
  const kind = args[0].toLowerCase();
  if (kind === 'simulation') {
    _arity(args, 3, 'set simulation FIELD VALUE');
    const field = _choice(args[1], ['war_chance', 'country_chance', 'lineage_chance', 'disaster_chance']);
    sim[field] = _number(args[2], 0, 1);
    return `Simulation ${field} is now ${fstr(sim[field])}.`;
  }
  _arity(args, 4, 'set TYPE NAME FIELD VALUE');
  const [, target, raw_field, value] = args;
  const field = raw_field.toLowerCase();
  if (kind === 'person' || kind === 'individual') {
    return _set_person(sim, target, field, value);
  }
  if (kind === 'country') {
    return _set_country(sim, target, field, value);
  }
  if (kind === 'settlement') {
    return _set_settlement(sim, target, field, value);
  }
  if (kind === 'disease') {
    return _set_disease(sim, target, field, value);
  }
  throw new ValueError('Editable types: person, country, settlement, disease, simulation.');
}

function _add_person(sim, target, option_tokens) {
  const place = _settlement(sim, target);
  const options = _options(option_tokens, new Set(['name', 'age', 'surname', 'lineage', 'parent']));
  const age = _number(options.get('age') ?? '0', 0, 150, true);
  const first = options.has('name') ? _name(options.get('name')) : null;
  if (['surname', 'lineage', 'parent'].filter(k => options.has(k)).length > 1) {
    throw new ValueError('Choose only one of surname, lineage, or parent.');
  }
  const parents = (options.get('parent') ?? '').split(',').filter(q => q).map(q => _person(sim, q));
  if (parents.length > 2 || new Set(parents.map(p => p.id)).size !== parents.length) {
    throw new ValueError('Use one or two distinct parents.');
  }
  if (parents.some(p => p.age < 18 || p.age - age < 16)) {
    throw new ValueError('Parents must be adults and at least 16 years older than the child.');
  }
  let lid;
  if (parents.length > 0) {
    lid = parents[0].lineage;
  } else if (options.has('lineage')) {
    lid = resolve_entity(sim.lineages, options.get('lineage'), 'lineage', l => sim.lineage_name(l.id)).id;
  } else {
    const surname = options.has('surname') ? _name(options.get('surname')) : null;
    lid = sim.new_lineage(sim.next_person);
    sim.lineages.get(lid).founder_country = place.country;
    if (surname) {
      sim.lineages.get(lid).surname = surname;
    }
  }
  const person = sim.add_person(age, lid, place.country, parents.map(p => p.id));
  person.settlement = place.id;
  if (first) {
    // add_person reserved a generated name; remove that unused reservation.
    const generated = `${person.first} ${sim.lineages.get(lid).surname}`;
    sim.name_holders.get(generated).delete(person.id);
    person.first = first;
    sim.register_name(person);
  }
  initialize_civic(sim);
  return `Added ${sim.full_name(person)}, age ${age}, to ${place.name}.`;
}

function _add_settlement(sim, target, option_tokens) {
  const c = _country(sim, target);
  const options = _options(option_tokens, new Set(['name', 'founder', 'residents']));
  const residents = [...sim.people.values()].filter(p => p.country === c.id);
  const adults = residents.filter(p => p.age >= 18);
  if (adults.length === 0) {
    throw new ValueError('A settlement needs an adult founder in its country.');
  }
  const founder = options.has('founder') ? _person(sim, options.get('founder')) : maxOf(adults, {key: p => p.age});
  if (founder.country !== c.id || founder.age < 18) {
    throw new ValueError('The founder must be an adult in this country.');
  }
  const count = _number(options.get('residents') ?? '1', 1, residents.length, true);
  const name = options.has('name') ? _unique_name(sim.settlements.values(), options.get('name')) : null;
  const selected = [founder, ...sim.rng.sample(residents.filter(p => p.id !== founder.id), count - 1)];
  const place = sim.found_settlement(c.id, founder, selected, name);
  return `Founded ${place.name} with ${count} relocated residents.`;
}

function _add_country(sim, target, option_tokens) {
  const place = _settlement(sim, target);
  const options = _options(option_tokens, new Set(['name']));
  const residents = [...sim.people.values()].filter(p => p.settlement === place.id);
  const adults = residents.filter(p => p.age >= 18);
  if (adults.length === 0) {
    throw new ValueError('A new country needs an inhabited settlement with an adult founder.');
  }
  const founder = maxOf(adults, {key: p => p.age});
  const name = options.has('name') ? _unique_name(sim.countries.values(), options.get('name')) : sim.founder_country_name(founder);
  const parent = sim.countries.get(place.country);
  const cid = maxOf(sim.countries.keys(), {default: 0}) + 1;
  const c = new Country({
    id: cid,
    name,
    founder: founder.id,
    founded: sim.year,
    parent_country: parent.id,
    capacity: parent.capacity
  });
  c.ruler = founder.id;
  c.government = parent.government;
  c.last_election = sim.year;
  c.technologies = new Set(parent.technologies);
  c.innovations = new Map(parent.innovations ?? new Map());
  sim.countries.set(cid, c);
  sim.names.used_countries.add(name);
  _transfer(sim, cid, parent.id, place);
  return `${place.name} seceded to form ${name}, with ${residents.length} residents.`;
}

function _add_lineage(sim, target, option_tokens) {
  const p = _person(sim, target);
  if (p.age < 18) {
    throw new ValueError('A lineage founder must be an adult.');
  }
  const options = _options(option_tokens, new Set(['surname']));
  const surname = options.has('surname') ? _name(options.get('surname')) : null;
  const lid = sim.new_lineage(p.id, p.lineage);
  if (surname) {
    sim.lineages.get(lid).surname = surname;
  }
  p.lineage = lid;
  sim.register_name(p);
  return `${sim.full_name(p)} founded lineage ${sim.lineage_name(lid)}; existing relatives retain their lineages.`;
}

function _add_disease(sim, target, option_tokens) {
  const options = _options(option_tokens, new Set(['course', 'infection', 'death', 'recovery', 'transmission', 'immunity']));
  const all_diseases = [...sim.sicknesses.values(), ...(sim.retired_sicknesses ?? new Map()).values()];
  const name = _unique_name(all_diseases, target);
  const course = _choice(options.get('course') ?? 'acute', COURSES);
  const disease = new Sickness({
    name,
    infection_chance: _number(options.get('infection') ?? '.35', 0, 1),
    death_chance: _number(options.get('death') ?? (course === 'endemic' ? '.001' : '.02'), 0, 1),
    recovery_chance: _number(options.get('recovery') ?? (course === 'chronic' ? '.15' : '.85'), 0, 1),
    transmission: _choice(options.get('transmission') ?? 'contact', TRANSMISSIONS),
    incubation_steps: 1,
    immunity_years: _number(options.get('immunity') ?? (course === 'endemic' ? '1' : '8'), 1, 100, true),
    course,
    recurring: course === 'endemic'
  });
  sim.sicknesses.set(name, disease);
  return `Added ${course} disease ${name}. Use infect or outbreak to introduce it.`;
}

export function _add(sim, args) {
  if (args.length < 2) {
    throw new ValueError('Usage: add TYPE TARGET [key=value ...]. Type help edit.');
  }
  const kind = args[0].toLowerCase();
  const target = args[1];
  const option_tokens = args.slice(2);
  if (kind === 'person' || kind === 'individual') {
    return _add_person(sim, target, option_tokens);
  }
  if (kind === 'settlement') {
    return _add_settlement(sim, target, option_tokens);
  }
  if (kind === 'country') {
    return _add_country(sim, target, option_tokens);
  }
  if (kind === 'lineage') {
    return _add_lineage(sim, target, option_tokens);
  }
  if (kind === 'disease') {
    return _add_disease(sim, target, option_tokens);
  }
  throw new ValueError('Add types: person, settlement, country, lineage, disease.');
}

export function _delete(sim, args) {
  if (args.length < 2) {
    throw new ValueError('Usage: delete person NAME; delete settlement/country NAME to=DESTINATION; delete disease NAME.');
  }
  const kind = args[0].toLowerCase();
  const target = args[1];
  if (kind === 'person' || kind === 'individual') {
    _arity(args, 2, 'delete person NAME');
    const p = _person(sim, target);
    _kill(sim, p, 'editor intervention');
    return `${sim.full_name(p)} died; their history and ancestry remain in the archive.`;
  }
  if (kind === 'settlement' || kind === 'country') {
    const options = _options(args.slice(2), new Set(['to']));
    if (kind === 'country') {
      const source = _country(sim, target);
      if (!options.has('to')) {
        throw new ValueError('Deleting a country requires to=COUNTRY to receive its residents and territory.');
      }
      const destination = _country(sim, options.get('to'));
      if (source.id === destination.id) {
        throw new ValueError('Choose a different receiving country.');
      }
      _transfer(sim, destination.id, source.id);
      return `${source.name} merged into ${destination.name}; its people, settlements and knowledge were transferred.`;
    }
    const source = _settlement(sim, target);
    const residents = [...sim.people.values()].filter(p => p.settlement === source.id);
    if (residents.length > 0 && !options.has('to')) {
      throw new ValueError('This settlement is inhabited. Supply to=SETTLEMENT to relocate its residents.');
    }
    if (options.has('to')) {
      const destination = _settlement(sim, options.get('to'));
      if (source.id === destination.id) {
        throw new ValueError('Choose a different receiving settlement.');
      }
      for (const p of residents) {
        [p.country, p.settlement] = [destination.country, destination.id];
      }
    }
    source.abandoned = source.demolished = sim.year;
    return `${source.name} was removed; ${residents.length} residents relocated and its history retained.`;
  }
  if (kind === 'disease') {
    _arity(args, 2, 'delete disease NAME');
    const disease = _disease(sim, target);
    _eradication_check(sim, disease);
    retire_disease(sim, disease.name);
    return `Eradicated ${disease.name}; patients recovered and historical records remain available.`;
  }
  throw new ValueError('Delete types: person, settlement, country, disease. Historical ancestry is retained.');
}

export function _knowledge(sim, verb, args) {
  _arity(args, 2, verb + ' COUNTRY TECHNOLOGY_OR_INNOVATION');
  const c = _country(sim, args[0]);
  const query = args[1].toLowerCase();
  const foundation = [...TECHNOLOGIES.keys()].find(name => name.toLowerCase() === query) ?? null;
  let innovation = INNOVATIONS.get(query);
  if (!foundation && innovation == null) {
    innovation = resolve_entity(INNOVATIONS, args[1], 'innovation');
  }
  const key = foundation || innovation.id;
  const owned = foundation ? c.technologies : (c.innovations ?? new Map());
  if (verb === 'grant') {
    if (owned.has(key)) {
      throw new ValueError('This country already knows that discovery.');
    }
    const prerequisites = foundation ? TECHNOLOGIES.get(foundation)[0] : innovation.prerequisites;
    const missing = difference(prerequisites, c.technologies);
    if (missing.size > 0) {
      throw new ValueError('Missing prerequisites: ' + sorted(missing).join(', '));
    }
    if (foundation) {
      for (const group of ANY.get(foundation) ?? []) {
        if (!group.some(other => c.technologies.has(other))) {
          throw new ValueError('Missing one of: ' + sorted(group).join(', '));
        }
      }
    }
    const adults = [...sim.people.values()].filter(p => p.country === c.id && p.age >= 18);
    if (adults.length === 0) {
      throw new ValueError('An adult researcher is needed to introduce this knowledge.');
    }
    const actor = maxOf(adults, {key: p => p.fame ?? 0});
    if (foundation) {
      unlock(sim, c, foundation, actor);
    } else {
      award_innovation(sim, c, innovation, actor);
    }
    return `Granted ${foundation || innovation.name} to ${c.name}.`;
  }
  if (!owned.has(key)) {
    throw new ValueError('This country does not know that discovery.');
  }
  const removed = new Set();
  let applied;
  if (foundation) {
    removed.add(foundation);
    while (true) {
      const remaining = difference(c.technologies, removed);
      const dependents = new Set([...remaining].filter(name => !tech_met(name, remaining)));
      if (dependents.size === 0) {
        break;
      }
      addAll(removed, dependents);
    }
    removeAll(c.technologies, removed);
    // round() is Python's banker's rounding.
    c.capacity = Math.max(1, round(c.capacity / 1.05 ** intersection(removed, FOOD_TECHS).size));
    applied = [...(c.innovations ?? new Map()).keys()].filter(k => !isSubset(INNOVATIONS.get(k).prerequisites, c.technologies));
  } else {
    applied = [innovation.id];
  }
  for (const k of applied) {
    c.innovations.delete(k);
  }
  if (c.research_project && !tech_met(c.research_project, c.technologies)) {
    c.research_project = null;
  }
  const project = INNOVATIONS.get(c.innovation_project);
  if (project && !isSubset(project.prerequisites, c.technologies)) {
    c.innovation_project = null;
    c.innovation_progress = 0;
  }
  return `${c.name} lost ${removed.size} foundational discoveries and ${applied.length} applied innovations; dependent knowledge was removed.`;
}

function _infect_or_cure(sim, verb, args) {
  _arity(args, verb === 'infect' ? 2 : 1, verb === 'infect' ? 'infect PERSON DISEASE' : 'cure PERSON');
  const p = _person(sim, args[0]);
  if (verb === 'infect') {
    const disease = _disease(sim, args[1]);
    _infect(sim, p, disease);
    return `${sim.full_name(p)} contracted ${disease.name}.`;
  }
  const name = p.infection;
  _cure(sim, p);
  return `${sim.full_name(p)} recovered from ${name} and gained immunity.`;
}

function _outbreak(sim, args) {
  if (args.length < 2) {
    throw new ValueError('Usage: outbreak COUNTRY DISEASE [cases=5]');
  }
  const c = _country(sim, args[0]);
  const disease = _disease(sim, args[1]);
  const options = _options(args.slice(2), new Set(['cases']));
  const residents = [...sim.people.values()].filter(p => p.country === c.id && !p.infection && (!p.immunity.has(disease.name) || (p.immunity_until.get(disease.name) ?? Infinity) <= sim.year));
  const count = _number(options.get('cases') ?? '5', 1, residents.length, true);
  for (const p of sim.rng.sample(residents, count)) {
    _infect(sim, p, disease);
  }
  c.sickness = disease.name;
  c.conditions.add('Disease');
  _local_outbreak(sim, c, disease.name);
  return `Introduced ${count} cases of ${disease.name} in ${c.name}.`;
}

function _war_or_peace(sim, verb, args) {
  if (args.length < 2) {
    throw new ValueError('Usage: war COUNTRY COUNTRY; peace COUNTRY COUNTRY [years=5]');
  }
  const a = _country(sim, args[0]);
  const b = _country(sim, args[1]);
  if (a.id === b.id) {
    throw new ValueError('Choose two different countries.');
  }
  const options = _options(args.slice(2), verb === 'peace' ? new Set(['years']) : new Set(['force']));
  const pair = sorted([a.id, b.id]);
  if (verb === 'war') {
    const force = _choice(options.get('force') ?? 'false', ['true', 'false']) === 'true';
    if ((sim.truces?.get(pair) ?? -1) > sim.year && !force) {
      throw new ValueError('These countries have an active truce. Use force=true to deliberately break it.');
    }
    if ([...sim.wars.keys()].some(active => active.includes(a.id) || active.includes(b.id))) {
      throw new ValueError('One of these countries is already at war; make peace first.');
    }
    sim.wars.set(pair, sim.year);
    end_pact(sim, a, b);
    sim.truces?.delete(pair);
    return `${a.name} declared war on ${b.name}; campaigns begin next year.`;
  }
  const years = _number(options.get('years') ?? '5', 1, 100, true);
  sim.wars.delete(pair);
  sim.war_details?.delete(pair);
  if (!('truces' in sim)) {
    sim.truces = new TupleMap();
  }
  sim.truces.set(pair, sim.year + years);
  return `${a.name} and ${b.name} agreed to peace and a ${years}-year truce.`;
}

function _trade(sim, args) {
  if (args.length !== 3 || !['science', 'pact', 'end'].includes(args[0].toLowerCase())) {
    throw new ValueError('Usage: trade science|pact|end COUNTRY COUNTRY');
  }
  const a = _country(sim, args[1]);
  const b = _country(sim, args[2]);
  if (a.id === b.id) {
    throw new ValueError('Choose two different countries.');
  }
  if (sim.wars.has(sorted([a.id, b.id]))) {
    throw new ValueError('Countries at war do not trade science; make peace first.');
  }
  const mode = args[0].toLowerCase();
  if (mode === 'pact') {
    pacts_of(a).add(b.id);
    pacts_of(b).add(a.id);
    return `${a.name} and ${b.name} will share what they learn every year, until war or an end to the pact.`;
  }
  if (mode === 'end') {
    if (!pacts_of(a).has(b.id)) {
      throw new ValueError(`${a.name} and ${b.name} have no science pact.`);
    }
    end_pact(sim, a, b);
    return `The science pact between ${a.name} and ${b.name} has ended.`;
  }
  const lines = [];
  for (const [giver, taker] of [[a, b], [b, a]]) {
    const got = pass_on_knowledge(sim, giver, taker, .3);
    lines.push(got ? `${taker.name} learned ${fixed(got[1] * 100, 0)}% of ${got[0]} from ${giver.name}.` : `${giver.name} had nothing new that ${taker.name} could use.`);
  }
  return lines.join(' ');
}

function _disaster(sim, args) {
  if (args.length < 2) {
    throw new ValueError('Usage: disaster COUNTRY TYPE [severity=major] [at=SETTLEMENT]');
  }
  const c = _country(sim, args[0]);
  const disaster = _choice(args[1], KINDS);
  const options = _options(args.slice(2), new Set(['severity', 'at']));
  const severity = _choice(options.get('severity') ?? 'major', ['minor', 'major', 'severe']);
  ensure_placed(sim);
  let site;
  if (options.has('at')) {
    site = _settlement(sim, options.get('at'));
  } else {
    const places = [...sim.settlements.values()].filter(s => s.country === c.id && s.abandoned == null);
    if (places.length === 0) {
      throw new ValueError(`${c.name} has no inhabited settlement to strike.`);
    }
    site = maxOf(places, {key: s => hazards_at(sim, s.gx, s.gy).get(disaster)});
  }
  const summary = strike(sim, disaster, severity, site.gx, site.gy);
  return describe(sim, disaster, severity, summary, c);
}

function _build(sim, args) {
  if (args.length < 2) {
    throw new ValueError('Usage: build SETTLEMENT KIND [force=true]; build SETTLEMENT road to=SETTLEMENT');
  }
  const s = _settlement(sim, args[0]);
  const kind = args[1].toLowerCase();
  const options = _options(args.slice(2), new Set(['to', 'force']));
  if (kind === 'road') {
    if (!options.has('to')) {
      throw new ValueError('Roads need a destination: build SETTLEMENT road to=SETTLEMENT.');
    }
    const other = _settlement(sim, options.get('to'));
    if (start_project(sim, s, 'road', undefined, other) == null) {
      throw new ValueError('Those settlements are not linked by land within one country.');
    }
    return `Road work began between ${s.name} and ${other.name}.`;
  }
  _choice(kind, BUILDINGS.keys());
  const force = ['true', 'yes', 'on'].includes((options.get('force') ?? 'false').toLowerCase());
  const spec = BUILDINGS.get(kind);
  if (start_project(sim, s, kind, force) == null) {
    const need = sorted(spec[2]).join(', ') || 'none';
    throw new ValueError(`${s.name} cannot build a ${spec[0].toLowerCase()} now. It needs technology (${need}), at least ${spec[3]} residents, suitable terrain, and none already built or pending. Use force=true to override.`);
  }
  return `Construction of a ${spec[0].toLowerCase()} began in ${s.name}.`;
}

function _settle(sim, args) {
  if (args.length === 0) {
    throw new ValueError('Usage: settle SETTLEMENT [x=CELL y=CELL] [size=N]');
  }
  const s = _settlement(sim, args[0]);
  const options = _options(args.slice(1), new Set(['x', 'y', 'size']));
  let target = null;
  if (options.has('x') || options.has('y')) {
    if (!options.has('x') || !options.has('y')) {
      throw new ValueError('Give both x and y, or neither.');
    }
    target = [_number(options.get('x'), 0, W - 1, true), _number(options.get('y'), 0, H - 1, true)];
    if (WATER.includes(world(sim).get('terrain')[target[1]][target[0]])) {
      throw new ValueError('That cell is water.');
    }
  }
  const size = options.has('size') ? _number(options.get('size'), 6, 60, true) : null;
  const exp = launch_expedition(sim, s, undefined, size, target, true);
  if (exp == null) {
    throw new ValueError(`${s.name} cannot send settlers: it needs at least 20 residents and a reachable site on its landmass.`);
  }
  const [x, y] = exp.get('target');
  return `${exp.get('people').length} settlers set out from ${s.name} toward cell ${x},${y}.`;
}

export function _execute(sim, verb, args) {
  if (verb === 'set') {
    return _set(sim, args);
  }
  if (verb === 'add') {
    return _add(sim, args);
  }
  if (verb === 'delete' || verb === 'remove') {
    return _delete(sim, args);
  }
  if (verb === 'eradicate') {
    _arity(args, 1, 'eradicate DISEASE');
    return _delete(sim, ['disease', args[0]]);
  }
  if (verb === 'move') {
    _arity(args, 3, 'move person NAME SETTLEMENT');
    if (!['person', 'individual'].includes(args[0].toLowerCase())) {
      throw new ValueError('Use move person NAME SETTLEMENT.');
    }
    return _set(sim, ['person', args[1], 'settlement', args[2]]);
  }
  if (verb === 'grant' || verb === 'revoke') {
    return _knowledge(sim, verb, args);
  }
  if (verb === 'infect' || verb === 'cure') {
    return _infect_or_cure(sim, verb, args);
  }
  if (verb === 'outbreak') {
    return _outbreak(sim, args);
  }
  if (verb === 'war' || verb === 'peace') {
    return _war_or_peace(sim, verb, args);
  }
  if (verb === 'trade') {
    return _trade(sim, args);
  }
  if (verb === 'trigger') {
    _arity(args, 2, 'trigger COUNTRY EVENT');
    const c = _country(sim, args[0]);
    const event = capitalize(_choice(args[1], ['famine', 'drought', 'panic', 'health', 'calm', 'safety', 'abundance']));
    if (event === 'Famine' || event === 'Drought') {
      c.crisis_cooldown.delete(event);
    }
    sim.pickevent(c, event);
    if (event === 'Abundance') {
      c.food = Math.min(100, c.food + 15);
    }
    return `Triggered ${event} in ${c.name}. Crises retain their normal duration limits.`;
  }
  if (verb === 'disaster') {
    return _disaster(sim, args);
  }
  if (verb === 'build') {
    return _build(sim, args);
  }
  if (verb === 'settle') {
    return _settle(sim, args);
  }
  throw new ValueError('Unknown edit. Type help edit.');
}

export function _information(sim, verb, args) {
  if (verb === 'changes') {
    _arity(args, 0, 'changes');
    const rows = sim.interventions ?? [];
    return rows.map(row => `Year ${row.get('year')}: ${row.get('message')} (added ${row.get('added')}, deaths ${row.get('deaths')})`).join('\n') || 'No editor interventions yet.';
  }
  let page = 1;
  const terms = [];
  for (const token of args) {
    if (token.startsWith('page=')) {
      page = _number(token.slice(5), 1, 100000, true);
    } else {
      terms.push(token);
    }
  }
  const query = terms.join(' ').toLowerCase();
  const rows = [...TECHNOLOGIES]
    .filter(([name]) => name.toLowerCase().includes(query))
    .map(([name, [req, , effect]]) => `${name}: prerequisites ${sorted(req).join(', ') || 'none'}; ${effect}`);
  rows.push(...[...INNOVATIONS.values()].filter(i => i.name.toLowerCase().includes(query) || query === i.id).map(i => `${i.name}; prerequisites ${sorted(i.prerequisites).join(', ')}`));
  const selected = rows.slice((page - 1) * 40, page * 40);
  return `Discovery catalog: ${rows.length} matches, page ${page}/${Math.max(1, Math.ceil(rows.length / 40))}\n` + (selected.length > 0 ? selected : ['No entries on this page.']).join('\n');
}

/** Return null if unhandled; failed edits preserve state including RNG/undo. */
export function edit_command(sim, text) {
  const first = text.trim() ? split(text.trim())[0].toLowerCase() : '';
  if (!EDIT_VERBS.has(first) && first !== 'changes' && first !== 'catalog') {
    return null;
  }
  let verb, args;
  try {
    const tokens = shlexSplit(text);
    [verb, args] = [tokens[0].toLowerCase(), tokens.slice(1)];
    if (verb === 'changes' || verb === 'catalog') {
      return [_information(sim, verb, args), 'inspect'];
    }
    if (verb === 'undo') {
      _arity(args, 0, 'undo');
      const previous = sim._command_undo ?? null;
      if (previous == null) {
        throw new ValueError('No edit to undo. Undo covers only the latest edit before advancing a year.');
      }
      replaceState(sim, previous);
      return ['Undid the most recent edit; simulation state and random generator restored.', 'edit'];
    }
  } catch (exc) {
    if (!(exc instanceof ValueError)) throw exc;

    return ['Command error: ' + exc.message, 'inspect'];
  }
  // Execute on a detached world. A rejected operation never mutates the
  // original object graph (including sharing between state and undo history).
  const target_sim = sim;
  const snapshot = Object.fromEntries(Object.entries(sim).filter(([key]) => key !== '_command_undo'));
  sim = Object.assign(Object.create(Object.getPrototypeOf(target_sim)), deepClone(snapshot));
  const population = sim.people.size;
  try {
    const message = _execute(sim, verb, args);
    const quiet_fields = ['wealth', 'fame', 'job', 'name', 'first', 'food', 'prosperity', 'stability', 'research', 'treasury', 'capacity', 'economy', 'economic_system', 'quarantine'];
    const refresh = !(verb === 'set' && (args[0].toLowerCase() === 'simulation' || args.length === 4 && quiet_fields.includes(args[2].toLowerCase())));
    const elect = !(verb === 'set' && args.length === 4 && args[0].toLowerCase() === 'country' && args[2].toLowerCase() === 'ruler' && args[3].toLowerCase() === 'none');
    _reconcile(sim, refresh, elect);
    sim.contact_cache = null;
    sim.systems_state = null;
    const delta = sim.people.size - population;
    if (!('interventions' in sim)) {
      sim.interventions = [];
    }
    sim.interventions.push(new Map([['year', sim.year], ['message', message], ['added', Math.max(0, delta)], ['deaths', Math.max(0, -delta)]]));
    if (!('pending_interventions' in sim)) {
      sim.pending_interventions = new Map([['added', 0], ['deaths', 0]]);
    }
    sim.pending_interventions.set('added', sim.pending_interventions.get('added') + Math.max(0, delta));
    sim.pending_interventions.set('deaths', sim.pending_interventions.get('deaths') + Math.max(0, -delta));
    sim.record('Intervention: ' + message, 'political');
    sim._command_undo = snapshot;
    replaceState(target_sim, sim);
    return [message + ' (Year unchanged; undo is available.)', 'edit'];
  } catch (exc) {
    if (exc instanceof ValueError || exc instanceof KeyError) {
      return ['Command error: ' + str(exc), 'inspect'];
    }
    // Discard the working world, but expose programmer errors during testing.
    throw exc;
  }
}
