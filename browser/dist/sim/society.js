/** Politics, trade, and gradual technological development for the simulation. */

import {addAll, difference, fixed, format, formatTemplate, intersection, isSubset, maxOf, pop, range, setdefault, sorted, sum, update} from './runtime.js';
import {advance_innovations, innovation_modifiers, share_innovation} from './discoveries.js';
import {effects as tech_effects, era_index, ERAS, BRANCHES, met as tech_met, MAX_LEAD} from './technology.js';
import {profile, contacts} from './geography.js';
import {trait, info, info as government_info} from './governments.js';
import {state, state as system_state} from './systems.js';
import {food_effect} from './economy.js';
import * as technology from './technology.js';

export let EVENT_CATALOG;
// Inventions require earlier discoveries; costs are accumulated research points.
// The full tree (eras, branches, and what each discovery changes) lives in technology.py.
export const TECHNOLOGIES = new Map([...technology.TECH].map(([name, entry]) => [name, [entry[0], entry[1], entry[2]]]));
export const FOOD_TECHS = new Set([...technology.TECH].filter(([name, entry]) => entry[4] === 'agriculture').map(([name, entry]) => name));
export const INDUSTRY_TECHS = new Set([...technology.TECH].filter(([name, entry]) => ['industry', 'trade', 'seafaring'].includes(entry[4])).map(([name, entry]) => name));
export const KNOWLEDGE_TECHS = new Set([...technology.TECH].filter(([name, entry]) => entry[4] === 'knowledge').map(([name, entry]) => name));
export const CARE_TECHS = new Set([...technology.TECH].filter(([name, entry]) => entry[4] === 'medicine').map(([name, entry]) => name));

/** Persistent modifiers consumed by disease, warfare, travel and economy systems. */
export function technology_modifiers(country) {
  const fx = tech_effects(country.technologies);
  const result = new Map([
    ['infection', fx.get('inf')],
    ['disease_death', fx.get('dth')],
    ['military', 1 + fx.get('mil')],
    ['defense', fx.get('dfn')],
    ['wound_death', fx.get('wnd')],
    ['water', fx.get('wat')],
    ['air', fx.get('air')],
    ['contact', fx.get('con')],
    ['care', fx.get('care')],
    ['cure', fx.get('cure')],
    ['siege', fx.get('siege')],
    ['trade', fx.get('trade')],
    ['land', fx.get('land')],
    ['sea', fx.get('sea')],
    ['food', fx.get('food')],
    ['weapon', fx.get('weapon')],
    ['ship', fx.get('ship')],
    ['cart', fx.get('cart')]
  ]);
  const applied = innovation_modifiers(country);
  for (const key of ['infection', 'disease_death', 'military']) {
    result.set(key, result.get(key) * applied.get(key));
  }
  update(result, new Map(['production', 'research', 'logistics'].map(key => [key, applied.get(key)])));
  result.set('production', result.get('production') * (1 + fx.get('prod')));
  result.set('research', result.get('research') * (1 + fx.get('research')));
  result.set('logistics', result.get('logistics') * (1 + fx.get('log')));
  result.set('wound_death', result.get('wound_death') * applied.get('disease_death'));
  return result;
}

/** Part-way knowledge of discoveries the country does not hold yet: {discovery: research points}. */
export function insight_of(country) {
  if (!('insight' in country)) {
    country.insight = new Map();
  }
  return country.insight;
}

/** Discoveries a conquered country held; the conqueror researches them twice as fast. */
export function boosted_of(country) {
  if (!('boosted' in country)) {
    country.boosted = new Set();
  }
  return country.boosted;
}

/** Ids of the countries this one shares learning with year after year. */
export function pacts_of(country) {
  if (!('pacts' in country)) {
    country.pacts = new Set();
  }
  return country.pacts;
}

/** Drop a science pact between two countries (both sides keep the same record). */
export function end_pact(sim, a, b) {
  pacts_of(a).delete(b.id);
  pacts_of(b).delete(a.id);
}

/** Credit research toward a discovery that others already hold; the country's own research power scales it. */
export function learn(sim, country, name, points) {
  if (country.technologies.has(name) || !tech_met(name, country.technologies)) {
    return 0;
  }
  let gain = points * technology_modifiers(country).get('research');
  if (boosted_of(country).has(name)) {
    gain *= 2;
  }
  gain = Math.min(gain, TECHNOLOGIES.get(name)[1]);
  const store = insight_of(country);
  store.set(name, (store.get(name) ?? 0) + gain);
  return gain;
}

/**
 * Carry some of one discovery the giver holds and the taker lacks across; returns (name, share of its cost) or None.
 *
 * `fraction` is the share of the discovery's cost the carriers could pass on, scaled by the giver's production and then
 * by the taker's research power.
 */
export function pass_on_knowledge(sim, giver, taker, fraction) {
  const ideas = technology.learnable(taker.technologies, giver.technologies);
  if (ideas.length === 0) {
    return null;
  }
  let name = sim.rng.choice(ideas);
  const project = (taker.research_project ?? null);
  if (ideas.includes(project) && sim.rng.random() < .5) {
    name = project;
  }
  const cost = TECHNOLOGIES.get(name)[1];
  const gain = learn(sim, taker, name, Math.min(.8, fraction * technology_modifiers(giver).get('production')) * cost);
  if (gain <= 0) {
    return null;
  }
  return [name, gain / cost];
}

/** Insight that adds up to a whole discovery is simply learned. */
export function settle_insight(sim, country, adults) {
  const store = insight_of(country);
  for (const name of sorted(store.keys())) {
    if (country.technologies.has(name)) {
      pop(store, name, null);
    } else if (store.get(name) >= TECHNOLOGIES.get(name)[1] && tech_met(name, country.technologies)) {
      pop(store, name, null);
      unlock(sim, country, name, sim.rng.choice(adults), true);
    }
  }
}

/** Pick what to research next from needs, geography, government and the shape of the tree. */
export function choose_project(sim, country, available, busy) {
  const favoured = available.filter(t => boosted_of(country).has(t));
  if (favoured.length > 0 && sim.rng.random() < .6) { // a conquered people's knowledge is cheap to take up

    return sim.rng.choice(sorted(favoured));
  }
  const prof = profile(sim, country.id);
  const need = new Map(BRANCHES.map(b => [b, 0]));
  need.set('agriculture', country.food < 55 || country.conditions.has('Famine') ? 3 : .5);
  need.set('medicine', country.sickness ? 3.5 : .6);
  need.set('warfare', busy.has(country.id) ? 3.5 : .3 + (['junta', 'empire', 'tyranny', 'tribal'].includes(country.government) ? 1 : 0));
  need.set('industry', .6 + 1.5 * prof.get('mountain'));
  need.set('seafaring', 2.2 * prof.get('coastal'));
  need.set('trade', (country.treasury ?? 0) < 500 ? 1.5 : .6);
  need.set('knowledge', 1 + Math.max(0, trait(country, 'research')) * 8);
  need.set('governance', country.stability < 50 ? 1.8 : .4);
  need.set('energy', .5 + 1.2 * prof.get('mountain') + .6 * prof.get('forest'));
  const recent = (country.last_disaster_year ?? null);
  need.set('construction', recent != null && sim.year - recent <= 6 ? 1.8 : .7);
  need.set('culture', .8 + (country.stability < 45 ? 1.6 : 0));
  const era = era_index(country.technologies);
  return technology.choose(sim.rng, available, country.technologies, need, era);
}

/** One funded project per country; progress is a view of saved research. */
export function advance_research(sim, country, adults, groups, busy) {
  let friend;

  settle_insight(sim, country, adults);
  const available = technology.researchable(country.technologies);
  country.research_focus = country.sickness ? 'medicine' : busy.has(country.id) ? 'military' : 'civilian';
  let project = (country.research_project ?? null);
  if (!available.includes(project)) {
    project = available.length > 0 ? choose_project(sim, country, available, busy) : null;
    country.research_project = project;
    if (project) {
      sim.record(`${country.name} began a research project on ${project} ${technology.reason(technology.branch_of(project))}.`, 'discovery');
    }
  }
  country.research_focus = country.sickness ? 'medicine' : busy.has(country.id) ? 'military' : 'civilian';
  country.research_budget = Math.min(2.5, .2 + country.prosperity / 50);
  country.prosperity = clamp(country.prosperity - country.research_budget * .2);
  let rate = (.5 + Math.min(5, adults.length / 80)) * (0.5 + country.prosperity / 100);
  rate *= technology_modifiers(country).get('research');
  rate *= state(sim, country.id).get('research');
  country.research += rate * (busy.has(country.id) ? .65 : 1) * (boosted_of(country).has(project) ? 2 : 1);
  const roll = sim.rng.random();
  if (project && roll < .14) {
    const bonus = sim.rng.uniform(2, 7);
    country.research += bonus;
    sim.record(`An experiment in ${country.name} advanced ${project} by ${fixed(bonus, 1)} research points.`, 'discovery');
  } else if (project && roll < .22) {
    const loss = Math.min(country.research, sim.rng.uniform(1, 4));
    country.research -= loss;
    sim.record(`Failed trials in ${country.name} cost ${fixed(loss, 1)} research points on ${project}.`, 'discovery');
  }
  const banked = project ? (insight_of(country).get(project) ?? 0) : 0;
  if (project && country.research + banked >= TECHNOLOGIES.get(project)[1]) {
    const used = Math.min(banked, TECHNOLOGIES.get(project)[1]);
    country.research = Math.max(0, country.research - (TECHNOLOGIES.get(project)[1] - used));
    unlock(sim, country, project, sim.rng.choice(adults));
    country.research_project = null;
  }
  country.research_progress = country.research;
  // Exchanges require peaceful inhabited partners and the recipient's prerequisites.
  // Ideas travel along borders and sea lanes, helped by trade.
  const [land, sea] = contacts(sim);
  const reachable = new Set((land.get(country.id) ?? new Set()));
  if (country.technologies.has('sailing')) {
    addAll(reachable, (sea.get(country.id) ?? new Set()));
  }
  const partners = [...groups.keys()].filter(cid => (cid !== country.id && reachable.has(cid) && !busy.has(cid) && !busy.has(country.id))).map(cid => sim.countries.get(cid));
  if (partners.length > 0 && sim.rng.random() < .18 * Math.min(2.5, .6 + .5 * state(sim, country.id).get('trade'))) {
    const partner = sim.rng.choice(partners);
    share_innovation(sim, partner, country, adults);
    const top = era_index(country.technologies) + MAX_LEAD;
    const ideas = [...difference(partner.technologies, country.technologies)].filter(t => (technology.met(t, country.technologies) && technology.era_of_tech(t) <= top));
    if (ideas.length > 0) {
      const idea = sim.rng.choice(sorted(ideas));
      unlock(sim, country, idea, sim.rng.choice(adults), true);
      sim.record(`Teachers from ${partner.name} shared methods with ${country.name}; both gained research experience.`, 'discovery');
      country.research += 1;
      partner.research += 1;
    }
  }
  // Day-to-day contact across the border: neighbors pass on a little of what they know (no news; it adds up).
  if (partners.length > 0 && sim.rng.random() < .85) {
    pass_on_knowledge(sim, sim.rng.choice(partners), country, .7);
  }
  // Standing pacts: partners share even without a border, as long as there is peace.
  for (const pid of sorted(pacts_of(country))) {
    friend = sim.countries.get(pid);
    if (friend == null || friend.ended != null || sim.wars.has([...sorted([pid, country.id])])) {
      continue;
    }
    if (sim.rng.random() < .9) {
      pass_on_knowledge(sim, friend, country, .5);
    }
  }
  if (partners.length > 0 && sim.rng.random() < .015) {
    friend = sim.rng.choice(partners);
    if (!pacts_of(country).has(friend.id)) {
      pacts_of(country).add(friend.id);
      pacts_of(friend).add(country.id);
      sim.record(`${country.name} and ${friend.name} agreed to share what they learn.`, 'discovery');
    }
  }
}

export function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

export function choose_ruler(sim, country, adults) {
  let ruler;

  const form = info(country.government);
  const previous = sim.archive.get(country.ruler);
  const heirs = previous && form.get('succession') === 'hereditary' ? adults.filter(p => p.parents.includes(previous.id)) : [];
  if (heirs.length > 0) {
    ruler = maxOf(heirs, {key: (p => p.age)});
  } else if (['fame', 'seizure'].includes(form.get('succession'))) {
    ruler = maxOf(adults, {key: (p => [(p.fame ?? 0), p.id])});
  } else if (form.get('succession') === 'wealth') {
    ruler = maxOf(adults, {key: (p => [(p.wealth ?? 0), p.id])});
  } else if (form.get('succession') === 'divine') {
    const clergy = adults.filter(p => ['healer', 'teacher', 'scientist', 'scholar'].includes((p.job ?? '')));
    ruler = sim.rng.choice(clergy.length > 0 ? clergy : adults);
  } else {
    ruler = sim.rng.choice(adults);
  }
  country.ruler = ruler.id;
  country.last_election = sim.year;
  const action = heirs.length > 0 ? (form.get('heir') ?? form.get('verb')) : form.get('verb');
  sim.record(`${sim.person_reference(ruler)} ${action} in ${country.name}.`);
}

export function maintain_rulers(sim) {
  const groups = new Map();
  for (const person of sim.people.values()) {
    if (person.age >= 18) {
      setdefault(groups, person.country, []).push(person);
    }
  }
  for (const country of sim.countries.values()) {
    if (country.ended != null) {
      country.ruler = null;
      continue;
    }
    const current = sim.people.get(country.ruler);
    if (current && current.country === country.id) {
      continue;
    }
    const adults = (groups.get(country.id) ?? []);
    if (adults.length > 0) {
      choose_ruler(sim, country, adults);
    } else {
      country.ruler = null;
    }
  }
}

export function unlock(sim, country, technology, actor, borrowed = false) {
  if (country.technologies.has(technology) || !tech_met(technology, country.technologies)) {
    return false;
  }
  country.technologies.add(technology);
  pop(insight_of(country), technology, null);
  country.boosted = difference(boosted_of(country), new Set([technology]));
  const before_era = era_index(difference(country.technologies, new Set([technology])));
  if (FOOD_TECHS.has(technology)) {
    country.capacity = Math.max(1, Math.trunc(country.capacity * 1.05));
    country.food = clamp(country.food + 8);
  }
  if (INDUSTRY_TECHS.has(technology)) {
    country.prosperity = clamp(country.prosperity + 4);
  }
  if (KNOWLEDGE_TECHS.has(technology)) {
    country.research += 1;
  }
  if (CARE_TECHS.has(technology) || technology === 'quarantine') {
    country.stability = clamp(country.stability + 3);
  }
  const verb = borrowed ? 'introduced' : 'developed';
  actor.fame = Math.min(100, (actor.fame ?? 0) + (borrowed ? 5 : 12));
  actor.job = 'scholar';
  sim.record(`${sim.person_reference(actor)} ${verb} ${technology} in ${country.name}, bringing ${TECHNOLOGIES.get(technology)[2]}.`, 'discovery');
  const after_era = era_index(country.technologies);
  if (after_era > before_era) {
    sim.record(`${country.name} entered the ${ERAS[after_era]}.`, 'discovery');
  }
  return true;
}

export function develop_societies(sim) {
  let message;

  maintain_rulers(sim);
  const groups = new Map();
  for (const person of sim.people.values()) {
    setdefault(groups, person.country, []).push(person);
  }
  const busy = new Set([...sim.wars.keys()].flatMap(pair => [...pair]));
  for (const [cid, residents] of groups) { // granaries, mills, harbors

    const country = sim.countries.get(cid);
    const adults = residents.filter(p => p.age >= 18);
    if (adults.length === 0) {
      continue;
    }
    // Conditions recover gradually; wars and crises put continuous pressure on them.
    let food_target = 60 + Math.min(22, technology_modifiers(country).get('food'));
    food_target -= 25 * Boolean(intersection(country.conditions, new Set(['Famine', 'Drought'])).size > 0);
    food_target -= 10 * busy.has(cid);
    const production = technology_modifiers(country).get('production');
    food_target += Math.min(14, (production - 1) * 10);
    food_target += system_state(sim, cid).get('food_delta');
    food_target += food_effect(sim, cid); // harvested and stored food, or the lack of it
    food_target += (profile(sim, cid).get('fertility') - 1) * 25; // fertile plains feed more than deserts and peaks
    country.food = clamp(country.food + (food_target - country.food) * .15);
    country.prosperity = clamp(country.prosperity + (!busy.has(cid) ? .5 * production : -2));
    country.stability = clamp(country.stability + (country.food >= 40 ? .5 : -2) - (busy.has(cid) ? 2 : 0));
    const term = government_info(country.government).get('term');
    if (term && sim.year - country.last_election >= term) {
      choose_ruler(sim, country, adults);
    }

    advance_research(sim, country, adults, groups, busy);
    advance_innovations(sim, country, adults);
    // Most years have no additional political/economic event.

    if (sim.rng.random() >= .70) {
      continue;
    }
    // The catalog supplies most events; retain occasional government changes
    // and international exchanges with their specialized mechanics below.
    if (sim.rng.random() < .85) {
      run_catalog_event(sim, country, adults, groups, busy);
      continue;
    }
    let choices = ['harvest', 'festival', 'corruption', 'reform', 'tax', 'poem'];
    if (country.food < 45) {
      choices.push(...['relief', 'relief']);
    }
    if (country.stability < 40) {
      choices.push(...['protest', 'protest']);
    }
    if (country.stability < 25 && ['monarchy', 'empire', 'tyranny', 'tribal'].includes(country.government)) {
      choices.push(...['revolution']);
    }
    if (country.prosperity >= 45 && country.technologies.has('writing')) {
      choices.push(...['school']);
    }
    const [land, sea] = contacts(sim);
    const reachable = new Set((land.get(cid) ?? new Set()));
    if (country.technologies.has('sailing')) {
      addAll(reachable, (sea.get(cid) ?? new Set()));
    }
    const partners = [...groups.keys()].filter(other => (other !== cid && reachable.has(other) && !busy.has(other) && !busy.has(cid)));
    if (partners.length > 0) {
      choices.push(...['trade', 'trade']);
    }
    const event = sim.rng.choice(choices);
    const actor = sim.rng.choice(adults);
    const who = sim.person_reference(actor);
    const place = country.name;
    if (event === 'harvest') {
      country.food += 12;
      message = `Farmers in ${place} gathered an exceptional harvest; food reserves grew.`;
    } else if (event === 'festival') {
      country.prosperity -= 2;
      country.stability += 6;
      message = `A public festival in ${place} eased local tensions.`;
    } else if (event === 'corruption') {
      country.prosperity -= 6;
      country.stability -= 8;
      message = `Officials in ${place} were caught diverting public funds; trust in government fell.`;
    } else if (event === 'reform') {
      country.stability += 7;
      country.prosperity -= 3;
      message = `${place} established public hearings for legal disputes.`;
    } else if (event === 'tax') {
      country.prosperity -= 5;
      country.stability -= 6;
      country.research += 2;
      message = `${place} imposed new taxes to fund public works, provoking resentment.`;
    } else if (event === 'poem') {
      country.stability += 3;
      message = `${who} composed an epic that became popular across ${place}.`;
    } else if (event === 'relief') {
      country.food += 15;
      country.prosperity -= 8;
      country.stability += 4;
      message = `${place} distributed emergency food supplies at public expense.`;
    } else if (event === 'protest') {
      country.stability -= 5;
      country.prosperity -= 3;
      message = `Protesters in ${place} disrupted markets and demanded political reform.`;
    } else if (event === 'revolution') {
      const old_form = government_info(country.government).get('label').toLowerCase();
      country.government = sim.rng.choice(['council', 'republic', 'oligarchy', 'junta']);
      country.government_since = sim.year;
      country.stability = 45;
      country.prosperity -= 10;
      message = `An uprising in ${place} replaced the ${old_form} with a ${government_info(country.government).get('label').toLowerCase()}.`;
      sim.record(message);
      choose_ruler(sim, country, adults);
      message = null;
    } else if (event === 'school') {
      country.prosperity -= 5;
      country.research += 5;
      message = `${who} opened a school in ${place}, helping preserve and share knowledge.`;
    } else {
      const partner = sim.countries.get(sim.rng.choice(partners));
      const bonus = country.technologies.has('roads') ? 7 : 4;
      country.prosperity += bonus;
      partner.prosperity = clamp(partner.prosperity + bonus);
      message = `Merchants exchanged goods between ${place} and ${partner.name}; both economies benefited.`;
      const top = era_index(country.technologies) + MAX_LEAD;
      const ideas = [...TECHNOLOGIES.keys()].filter(tech => (partner.technologies.has(tech) && !country.technologies.has(tech) && tech_met(tech, country.technologies) && technology.era_of_tech(tech) <= top));
      if (ideas.length > 0 && sim.rng.random() < .35) {
        unlock(sim, country, sim.rng.choice(ideas), actor, true);
      }
      for (const [giver, taker] of [[partner, country], [country, partner]]) {
        const got = pass_on_knowledge(sim, giver, taker, .4);
        if (got?.length > 0) {
          sim.record(`Merchants carried word of ${got[0]} from ${giver.name} to ${taker.name}.`, 'discovery');
        }
      }
    }
    if (message) {
      sim.record(message, ['poem', 'festival'].includes(event) ? 'creative' : event === 'school' ? 'discovery' : 'political');
    }
    country.food = clamp(country.food);
    country.prosperity = clamp(country.prosperity);
    country.stability = clamp(country.stability);
  }
}

export function social_rates(country) {
  const birth = .85 + country.food / 400 + country.prosperity / 1000;
  let death = 1 + Math.max(0, 40 - country.food) / 80 + Math.max(0, 30 - country.stability) / 100;
  death *= .92 ** intersection(country.technologies, CARE_TECHS).size;
  return [birth, death];
}

export function build_event_catalog(domains) {
  const catalog = [];
  for (const [domain_id, domain] of domains) {
    for (const [situation_index, situation] of domain.get('situations').entries()) {
      for (const [outcome_index, outcome] of domain.get('outcomes').entries()) {
        catalog.push(new Map([
          ['id', `${domain_id}.${situation_index + 1}.${outcome_index + 1}`],
          ['situation_id', `${domain_id}.${situation_index + 1}`],
          ['domain', domain_id],
          ['category', domain.get('category')],
          ['requires', new Set(domain.get('requires'))],
          ['gate', domain.get('gate')],
          ['text', situation + ' ' + outcome.get('text')],
          ['effects', new Map(outcome.get('effects'))],
          ['weight', outcome.get('weight')]
        ]));
      }
    }
  }
  return [...catalog];
}

export function eligible_catalog_events(sim, country, residents, groups, busy) {
  const partners = [...groups.keys()].filter(cid => (cid !== country.id && !busy.has(cid)));
  const gates = new Map([
    ['any', true],
    ['peace', !busy.has(country.id)],
    ['shortage', country.food < 45],
    ['unrest', country.stability < 40],
    ['war', busy.has(country.id)],
    ['sickness', Boolean(country.sickness || residents.some(p => p.infection))],
    ['disaster', country.last_disaster_year != null && (0 <= sim.year - country.last_disaster_year && sim.year - country.last_disaster_year <= 5)],
    ['partner', Boolean(partners.length > 0) && !busy.has(country.id)]
  ]);
  return EVENT_CATALOG.filter(event => (isSubset(event.get('requires'), country.technologies) && gates.get(event.get('gate')) && sim.year - (country.last_catalog_events.get(event.get('situation_id')) ?? -100) >= 1));
}

export function apply_catalog_event(sim, country, actor, event) {
  for (const [stat, amount] of event.get('effects')) {
    const current = country[stat];
    country[stat] = stat === 'research' ? Math.max(0, current + amount) : clamp(current + amount);
  }
  country.last_catalog_events.set(event.get('situation_id'), sim.year);
  // str.format preserves the person reference inserted by this substitution;
  // it is resolved when the yearly report is displayed.
  const message = formatTemplate(event.get('text'), {actor: sim.person_reference(actor), country: country.name});
  if (event.get('text').includes('{actor}')) {
    actor.fame = Math.min(100, (actor.fame ?? 0) + 2);
  }
  sim.record(message, event.get('category'));
}

export function run_catalog_event(sim, country, adults, groups, busy) {
  let eligible = eligible_catalog_events(sim, country, groups.get(country.id), groups, busy);
  eligible = eligible.filter(event => [...event.get('effects')].some(([stat, amount]) => (amount > 0 && (stat === 'research' || country[stat] < 100) || amount < 0 && country[stat] > 0)));
  if (eligible.length === 0) {
    return null;
  }
  const by_domain = new Map();
  let event;
  for (event of eligible) {
    setdefault(by_domain, event.get('domain'), []).push(event);
  }
  // Choose a domain first so five outcomes do not make a situation five times
  // as likely; outcome weights only decide how that situation turns out.
  const domain = sim.rng.choice([...by_domain.keys()]);
  const by_situation = new Map();
  for (event of by_domain.get(domain)) {
    setdefault(by_situation, event.get('situation_id'), []).push(event);
  }
  const outcomes = sim.rng.choice([...by_situation.values()]);
  event = sim.rng.choices(outcomes, outcomes.map(item => item.get('weight')), 1)[0];
  const notable = adults.filter(p => ((p.public_role ?? '') || (p.fame ?? 0) >= 40));
  const actor = sim.rng.choice(notable.length > 0 && sim.rng.random() < .75 ? notable : adults);
  apply_catalog_event(sim, country, actor, event);
  return event.get('id');
}

export const EVENT_DOMAINS_A = new Map([
  ['agriculture', new Map([
    ['category', 'political'],
    ['requires', []],
    ['gate', 'peace'],
    ['situations', [
      'Farmers in {country} tested planting dates agreed upon at a village council.',
      '{actor} organized a trial of communal grain reserves in {country}.',
      'Villages in {country} attempted to restore neglected field boundaries.',
      'Growers in {country} experimented with selecting seed from their strongest plants.',
      '{actor} sponsored a trial of shared ox teams for small farms in {country}.',
      'Farmers in {country} tried planting legumes on exhausted plots.',
      'Households in {country} attempted to coordinate harvest work across neighboring farms.',
      '{actor} backed an experiment in protecting stored grain from damp in {country}.',
      'Shepherds and farmers in {country} negotiated a trial schedule for grazing fallow fields.',
      'Villagers in {country} attempted to reclaim abandoned gardens for food production.'
    ]],
    ['outcomes', [
      new Map([
        ['text', 'The trial produced a reliable surplus, and neighboring villages adopted the practice.'],
        ['effects', new Map([['food', 9], ['prosperity', 2]])],
        ['weight', 4]
      ]),
      new Map([
        ['text', 'The trial yielded a modest improvement without demanding much additional labor.'],
        ['effects', new Map([['food', 4]])],
        ['weight', 5]
      ]),
      new Map([
        ['text', 'Food supplies improved, but disputes over the extra work weakened local cooperation.'],
        ['effects', new Map([['food', 5], ['stability', -4]])],
        ['weight', 3]
      ]),
      new Map([
        ['text', 'The effort consumed scarce resources and brought no useful gain.'],
        ['effects', new Map([['prosperity', -4]])],
        ['weight', 2]
      ]),
      new Map([
        ['text', 'Poor coordination disrupted ordinary work and left food reserves smaller than expected.'],
        ['effects', new Map([['food', -6], ['stability', -2]])],
        ['weight', 2]
      ])
    ]]
  ])],
  ['commerce', new Map([
    ['category', 'political'],
    ['requires', []],
    ['gate', 'peace'],
    ['situations', [
      'Merchants in {country} proposed a common set of market weights.',
      '{actor} backed a trial of regular market days in {country}.',
      'Traders in {country} attempted to pool the cost of guards for their goods.',
      'Market elders in {country} tried a public process for settling payment disputes.',
      '{actor} proposed clearer rules for stall fees in {country}.',
      'Craft sellers in {country} attempted to establish shared standards of workmanship.',
      'Merchants in {country} organized a trial system of witnesses for large exchanges.',
      'Village traders in {country} attempted to combine small loads for longer journeys.',
      '{actor} encouraged a trial exchange fair between inland communities in {country}.',
      'Traders in {country} proposed shared responsibility for damaged goods in transit.'
    ]],
    ['outcomes', [
      new Map([
        ['text', 'The arrangement earned trust and drew substantial new trade.'],
        ['effects', new Map([['prosperity', 8], ['stability', 2]])],
        ['weight', 4]
      ]),
      new Map([
        ['text', 'A limited trial reduced everyday trading costs.'],
        ['effects', new Map([['prosperity', 4]])],
        ['weight', 5]
      ]),
      new Map([
        ['text', 'Wealthy merchants gained most of the benefits, provoking resentment among small sellers.'],
        ['effects', new Map([['prosperity', 5], ['stability', -4]])],
        ['weight', 3]
      ]),
      new Map([
        ['text', 'Arguments over responsibility stalled the effort after participants had spent their savings.'],
        ['effects', new Map([['prosperity', -4], ['stability', -2]])],
        ['weight', 2]
      ]),
      new Map([
        ['text', 'Dishonest intermediaries exploited the arrangement before it was abandoned.'],
        ['effects', new Map([['prosperity', -6], ['stability', -4]])],
        ['weight', 2]
      ])
    ]]
  ])],
  ['civic_infrastructure', new Map([
    ['category', 'political'],
    ['requires', []],
    ['gate', 'peace'],
    ['situations', [
      '{actor} sought labor for repairing public wells in {country}.',
      'Residents of {country} proposed clearing blocked paths between settlements.',
      'Town elders in {country} attempted to organize repairs to communal meeting shelters.',
      '{actor} backed a plan to shore up an eroding river landing in {country}.',
      'Villagers in {country} sought to replace a dangerous footbridge.',
      'Households in {country} proposed improving drainage around crowded dwellings.',
      '{actor} requested materials for a communal storehouse in {country}.',
      'Settlements in {country} attempted to establish sheltered resting places along busy paths.',
      'Residents of {country} organized an effort to repair livestock watering troughs.',
      'Town elders in {country} proposed rebuilding a damaged marketplace shelter.'
    ]],
    ['outcomes', [
      new Map([
        ['text', 'Skilled supervision brought the work to completion and made daily life easier.'],
        ['effects', new Map([['prosperity', 6], ['stability', 4]])],
        ['weight', 4]
      ]),
      new Map([
        ['text', 'Volunteers completed a smaller version that still met the most urgent needs.'],
        ['effects', new Map([['stability', 4]])],
        ['weight', 5]
      ]),
      new Map([
        ['text', 'The work succeeded, but its demands drained household savings.'],
        ['effects', new Map([['stability', 5], ['prosperity', -4]])],
        ['weight', 3]
      ]),
      new Map([
        ['text', 'A shortage of skilled workers left the project unfinished and its materials wasted.'],
        ['effects', new Map([['prosperity', -5]])],
        ['weight', 2]
      ]),
      new Map([
        ['text', 'Coerced labor and missing supplies turned the project into a source of public anger.'],
        ['effects', new Map([['stability', -7], ['prosperity', -3]])],
        ['weight', 2]
      ])
    ]]
  ])],
  ['scholarship', new Map([
    ['category', 'discovery'],
    ['requires', ['writing']],
    ['gate', 'any'],
    ['situations', [
      'Scholars in {country} compared records of seasonal flooding.',
      '{actor} sponsored an inquiry into more consistent methods of measuring land in {country}.',
      'Teachers in {country} tested a new sequence for teaching arithmetic.',
      'Observers in {country} attempted to reconcile conflicting records of the stars.',
      '{actor} supported the comparison of medicinal plant descriptions in {country}.',
      'Scribes in {country} investigated errors that accumulated when copying accounts.',
      'Scholars in {country} attempted to compare regional systems of weights and lengths.',
      '{actor} commissioned a study of records describing past harvest failures in {country}.',
      "Teachers in {country} tried a new method of checking apprentices' calculations.",
      "Scholars in {country} gathered craftworkers' observations for a practical handbook."
    ]],
    ['outcomes', [
      new Map([
        ['text', 'Careful comparisons revealed a useful principle that other investigators could reproduce.'],
        ['effects', new Map([['research', 9]])],
        ['weight', 3]
      ]),
      new Map([
        ['text', 'The work corrected several persistent mistakes and improved instruction.'],
        ['effects', new Map([['research', 4]])],
        ['weight', 5]
      ]),
      new Map([
        ['text', "A promising finding emerged, although sustaining the inquiry strained its sponsors' resources."],
        ['effects', new Map([['research', 6], ['prosperity', -3]])],
        ['weight', 3]
      ]),
      new Map([
        ['text', 'Inconsistent evidence prevented a firm conclusion, but investigators documented their methods.'],
        ['effects', new Map([['research', 1.5], ['prosperity', -1]])],
        ['weight', 3]
      ]),
      new Map([
        ['text', 'An influential patron insisted on an unsupported conclusion, discouraging further inquiry.'],
        ['effects', new Map([['research', -3], ['stability', -2]])],
        ['weight', 1]
      ])
    ]]
  ])],
  ['arts', new Map([
    ['category', 'creative'],
    ['requires', []],
    ['gate', 'any'],
    ['situations', [
      '{actor} sponsored the composition of an epic about the ancestors of {country}.',
      'Performers in {country} rehearsed a new cycle of harvest songs.',
      'Craftworkers in {country} attempted an elaborate ceremonial carving.',
      'Storytellers in {country} prepared a public retelling of a disputed founding legend.',
      '{actor} commissioned a decorated vessel for public ceremonies in {country}.',
      'Dancers in {country} devised a performance honoring departed relatives.',
      'Musicians in {country} experimented with a new arrangement for familiar songs.',
      'Artisans in {country} planned a woven panel depicting everyday village life.',
      '{actor} supported a dramatic performance about justice and obligation in {country}.',
      'Poets in {country} attempted a shared collection of verses about travel and homecoming.'
    ]],
    ['outcomes', [
      new Map([
        ['text', 'The finished work found a wide audience and became a source of shared pride.'],
        ['effects', new Map([['stability', 7], ['prosperity', 2]])],
        ['weight', 4]
      ]),
      new Map([
        ['text', 'The work pleased a modest audience and encouraged younger artists.'],
        ['effects', new Map([['stability', 3], ['research', 1]])],
        ['weight', 5]
      ]),
      new Map([
        ['text', 'The work won admiration, but rival patrons argued over whose contribution deserved recognition.'],
        ['effects', new Map([['prosperity', 3], ['stability', -2]])],
        ['weight', 3]
      ]),
      new Map([
        ['text', 'Costs mounted, and the effort ended before the work could be presented.'],
        ['effects', new Map([['prosperity', -3]])],
        ['weight', 2]
      ]),
      new Map([
        ['text', 'The work offended powerful families, whose demands for punishment divided the community.'],
        ['effects', new Map([['stability', -6]])],
        ['weight', 2]
      ])
    ]]
  ])]
]);

export const EVENT_DOMAINS_B = new Map([
  ['political_reform', new Map([
    ['category', 'political'],
    ['requires', []],
    ['gate', 'any'],
    ['situations', [
      '{actor} convened a council in {country} to discuss fairer harvest levies.',
      '{actor} heard petitions in {country} about abuses by local officials.',
      '{actor} proposed clearer rules for communal grazing in {country}.',
      '{actor} brought village delegates together in {country} to review public obligations.',
      '{actor} opened negotiations in {country} over service owed to the ruling household.',
      '{actor} called for an inquiry into disputed market tolls in {country}.',
      '{actor} assembled elders in {country} to discuss how grievances should be heard.',
      '{actor} asked the settlements of {country} to reconsider exemptions from communal labor.',
      '{actor} sponsored a public debate in {country} about the duties of tax collectors.',
      '{actor} arranged talks in {country} on settling boundary disputes without private feuds.'
    ]],
    ['outcomes', [
      new Map([
        ['text', 'A modest compromise won broad support and made local administration more predictable.'],
        ['effects', new Map([['stability', 5], ['prosperity', 2]])],
        ['weight', 4]
      ]),
      new Map([
        ['text', 'The council agreed to a limited trial, spending public resources to ease longstanding tensions.'],
        ['effects', new Map([['stability', 3], ['prosperity', -2]])],
        ['weight', 3]
      ]),
      new Map([
        ['text', 'Influential households blocked agreement, and disappointed petitioners returned home resentful.'],
        ['effects', new Map([['stability', -4]])],
        ['weight', 2]
      ]),
      new Map([
        ['text', 'A hurried settlement favored the wealthiest households, improving collections but deepening resentment.'],
        ['effects', new Map([['prosperity', 3], ['stability', -3]])],
        ['weight', 2]
      ]),
      new Map([
        ['text', 'Careful testimony exposed inconsistencies and helped officials understand local needs.'],
        ['effects', new Map([['research', 2], ['stability', 2]])],
        ['weight', 3]
      ])
    ]]
  ])],
  ['diplomacy', new Map([
    ['category', 'political'],
    ['requires', []],
    ['gate', 'partner'],
    ['situations', [
      '{actor} welcomed foreign envoys to {country} for discussions about frontier customs.',
      '{actor} sent representatives from {country} to discuss the treatment of traveling merchants.',
      '{actor} hosted talks in {country} about access to seasonal markets.',
      '{actor} sought foreign advice in {country} on resolving disputed tolls.',
      '{actor} arranged a ceremonial meeting in {country} to discuss borderland grievances.',
      '{actor} invited neighboring officials to {country} to compare trading practices.',
      '{actor} prepared a diplomatic delegation in {country} to seek clearer rules for caravans.',
      '{actor} received visitors in {country} seeking a shared understanding of river passage.',
      '{actor} organized discussions in {country} about protecting messengers on public roads.',
      '{actor} offered hospitality in {country} to delegates discussing disputed market privileges.'
    ]],
    ['outcomes', [
      new Map([
        ['text', 'The exchange clarified expectations and encouraged merchants to invest with greater confidence.'],
        ['effects', new Map([['prosperity', 4], ['stability', 2]])],
        ['weight', 4]
      ]),
      new Map([
        ['text', 'The visitors shared useful practical knowledge, although gifts and hospitality proved expensive.'],
        ['effects', new Map([['research', 4], ['prosperity', -2]])],
        ['weight', 3]
      ]),
      new Map([
        ['text', 'The talks stalled over precedence and ceremonial honors, wasting resources and embarrassing the hosts.'],
        ['effects', new Map([['prosperity', -3], ['stability', -2]])],
        ['weight', 2]
      ]),
      new Map([
        ['text', 'Only a narrow understanding emerged, but the respectful exchange reassured local communities.'],
        ['effects', new Map([['stability', 3]])],
        ['weight', 4]
      ]),
      new Map([
        ['text', 'Rumors of secret concessions spread faster than the delegates could explain their work.'],
        ['effects', new Map([['stability', -4], ['prosperity', -1]])],
        ['weight', 2]
      ])
    ]]
  ])],
  ['wartime_logistics', new Map([
    ['category', 'war'],
    ['requires', []],
    ['gate', 'war'],
    ['situations', [
      '{actor} gathered quartermasters in {country} to review the movement of military supplies.',
      '{actor} asked village elders in {country} to coordinate deliveries to the army.',
      '{actor} inspected the wartime storehouses of {country} and proposed improvements.',
      '{actor} convened wagon owners in {country} to discuss military transport.',
      '{actor} reviewed demands for pack animals across {country}.',
      '{actor} organized discussions in {country} about supplying distant garrisons.',
      '{actor} sought ways to distribute military requisitions more evenly in {country}.',
      '{actor} assembled camp suppliers in {country} to reconsider their delivery schedules.',
      '{actor} called a meeting in {country} about protecting provisions from spoilage during transport.',
      '{actor} asked officials in {country} to examine the burden of feeding troops through winter.'
    ]],
    ['outcomes', [
      new Map([
        ['text', 'Better coordination reduced waste and left more provisions available to local households.'],
        ['effects', new Map([['food', 5], ['stability', 2]])],
        ['weight', 4]
      ]),
      new Map([
        ['text', 'The new arrangements demanded costly equipment but eased confusion and public complaints.'],
        ['effects', new Map([['prosperity', -3], ['stability', 3]])],
        ['weight', 3]
      ]),
      new Map([
        ['text', 'Conflicting orders caused deliveries to spoil and increased pressure on civilian reserves.'],
        ['effects', new Map([['food', -5], ['stability', -3]])],
        ['weight', 2]
      ]),
      new Map([
        ['text', 'Experienced suppliers developed useful methods, though the immediate work strained local markets.'],
        ['effects', new Map([['research', 3], ['prosperity', -2]])],
        ['weight', 3]
      ]),
      new Map([
        ['text', 'Well-connected suppliers secured favorable terms while ordinary households carried the heavier burden.'],
        ['effects', new Map([['prosperity', 2], ['food', -2], ['stability', -4]])],
        ['weight', 2]
      ])
    ]]
  ])],
  ['public_health', new Map([
    ['category', 'sickness'],
    ['requires', []],
    ['gate', 'sickness'],
    ['situations', [
      '{actor} brought healers together in {country} to compare their observations of the outbreak.',
      '{actor} organized discussions in {country} about supporting households unable to work.',
      '{actor} asked community elders in {country} to review arrangements for nursing the sick.',
      '{actor} convened attendants in {country} to discuss the supply of bedding and clean water.',
      '{actor} sought proposals in {country} for keeping essential markets supplied during the outbreak.',
      '{actor} invited experienced caregivers in {country} to share practical advice.',
      '{actor} arranged a council in {country} about the rising cost of household care.',
      '{actor} appealed to the storekeepers of {country} to consider relief for afflicted families.',
      '{actor} asked officials in {country} to investigate rumors surrounding the sickness.',
      '{actor} gathered local leaders in {country} to discuss shortages among exhausted caregivers.'
    ]],
    ['outcomes', [
      new Map([
        ['text', 'Shared observations improved practical knowledge and reassured worried households.'],
        ['effects', new Map([['research', 4], ['stability', 2]])],
        ['weight', 4]
      ]),
      new Map([
        ['text', 'A relief effort drew on communal stores and eased public distress.'],
        ['effects', new Map([['food', -3], ['stability', 4]])],
        ['weight', 4]
      ]),
      new Map([
        ['text', 'Competing explanations turned into accusations, unsettling the markets and deepening fear.'],
        ['effects', new Map([['stability', -5], ['prosperity', -2]])],
        ['weight', 2]
      ]),
      new Map([
        ['text', 'Supplies were purchased at high prices, supporting household care while straining public resources.'],
        ['effects', new Map([['prosperity', -4], ['stability', 2]])],
        ['weight', 3]
      ]),
      new Map([
        ['text', 'The discussions exposed gaps in local knowledge, prompting careful observation at considerable expense.'],
        ['effects', new Map([['research', 3], ['prosperity', -2]])],
        ['weight', 3]
      ])
    ]]
  ])],
  ['disaster_recovery', new Map([
    ['category', 'disaster'],
    ['requires', []],
    ['gate', 'disaster'],
    ['situations', [
      '{actor} gathered builders in {country} to assess damage left by the disaster.',
      '{actor} convened a relief council in {country} to consider the needs of displaced households.',
      '{actor} asked settlements across {country} to discuss sharing reconstruction labor.',
      '{actor} brought storekeepers together in {country} to review emergency supplies.',
      '{actor} organized discussions in {country} about reopening damaged market spaces.',
      '{actor} sought advice in {country} on restoring essential paths and crossings.',
      '{actor} assembled craftspeople in {country} to plan repairs after the disaster.',
      '{actor} called on local elders in {country} to settle competing requests for rebuilding materials.',
      '{actor} arranged a survey in {country} of the work needed before normal trade could resume.',
      '{actor} asked households in {country} to coordinate temporary shelter and repair work.'
    ]],
    ['outcomes', [
      new Map([
        ['text', 'Cooperation reduced waste and helped ordinary commerce resume more steadily.'],
        ['effects', new Map([['prosperity', 4], ['stability', 3]])],
        ['weight', 4]
      ]),
      new Map([
        ['text', "Urgent work consumed food reserves but restored confidence in the community's ability to recover."],
        ['effects', new Map([['food', -4], ['stability', 4]])],
        ['weight', 3]
      ]),
      new Map([
        ['text', 'Disputes over priority delayed useful work and left families angry at local officials.'],
        ['effects', new Map([['prosperity', -3], ['stability', -4]])],
        ['weight', 2]
      ]),
      new Map([
        ['text', 'Craftspeople learned from the damage and tested sturdier methods at substantial cost.'],
        ['effects', new Map([['research', 4], ['prosperity', -3]])],
        ['weight', 3]
      ]),
      new Map([
        ['text', 'Materials proved scarcer than expected, and emergency purchases strained already limited reserves.'],
        ['effects', new Map([['prosperity', -4], ['food', -2]])],
        ['weight', 2]
      ])
    ]]
  ])]
]);
// Additional fictional civic patterns: 20 policy subjects x 10 community contexts
// x 5 consequential outcomes. These are composed variations, not 1,000 news stories.

export const COMMUNITY_CONTEXTS = [
  'river villages',
  'hill villages',
  'market towns',
  'farming communities',
  'craft districts',
  'frontier settlements',
  'crowded neighborhoods',
  'outlying hamlets',
  'regional centers',
  "the capital's households"
];
export const POLICY_SUBJECTS = [
  ['housing', 'repairing unsafe homes', 'prosperity'],
  ['workplace_safety', 'reducing injuries at work', 'stability'],
  ['apprenticeships', 'funding apprenticeships', 'research'],
  ['fire_safety', 'organizing fire watches', 'stability'],
  ['food_prices', 'publishing fair food prices', 'food'],
  ['land_rights', 'mediating land claims', 'stability'],
  ['childcare', 'supporting shared child care', 'prosperity'],
  ['eldercare', 'supporting elderly households', 'stability'],
  ['animal_care', 'improving livestock care', 'food'],
  ['forestry', 'managing timber cutting', 'prosperity'],
  ['fisheries', 'protecting fishing grounds', 'food'],
  ['craft_fairs', 'holding craft exhibitions', 'prosperity'],
  ['oral_history', 'preserving local oral histories', 'research'],
  ['music_teaching', 'training young musicians', 'stability'],
  ['public_games', 'organizing public games', 'stability'],
  ['debt_relief', 'mediating household debts', 'prosperity'],
  ['water_rights', 'sharing access to water', 'food'],
  ['refugee_aid', 'helping displaced families', 'stability'],
  ['surveying', 'mapping paths and property boundaries', 'research'],
  ['market_fraud', 'investigating dishonest market practices', 'prosperity']
];
export const EVENT_DOMAINS_C = new Map();
for (const [domain, subject, stat] of POLICY_SUBJECTS) {
  const trial_effects = new Map([[stat, 3]]);
  trial_effects.set('prosperity', (trial_effects.get('prosperity') ?? 0) - 1);
  EVENT_DOMAINS_C.set(domain, new Map([
    ['category', ['craft_fairs', 'oral_history', 'music_teaching', 'public_games'].includes(domain) ? 'creative' : 'political'],
    ['requires', []],
    ['gate', 'any'],
    ['situations', COMMUNITY_CONTEXTS.map(context => '{actor} led a public initiative for ' + subject + ' among ' + context + ' in {country}.')],
    ['outcomes', [
      new Map([
        ['text', 'Broad participation made the effort successful and brought lasting local benefits.'],
        ['effects', new Map([[stat, 5]])],
        ['weight', 4]
      ]),
      new Map([
        ['text', 'A small trial succeeded, although its costs strained local savings.'],
        ['effects', trial_effects],
        ['weight', 4]
      ]),
      new Map([
        ['text', 'Disagreements stalled the work and reduced trust in its organizers.'],
        ['effects', new Map([['stability', -3]])],
        ['weight', 2]
      ]),
      new Map([
        ['text', 'Volunteers documented useful lessons even though the original effort failed.'],
        ['effects', new Map([['research', 2], ['prosperity', -2]])],
        ['weight', 3]
      ]),
      new Map([
        ['text', 'An audit uncovered favoritism, and angry residents demanded new leadership.'],
        ['effects', new Map([['prosperity', -2], ['stability', -4]])],
        ['weight', 2]
      ])
    ]]
  ]));
}

EVENT_CATALOG = build_event_catalog(new Map([...EVENT_DOMAINS_A, ...EVENT_DOMAINS_B, ...EVENT_DOMAINS_C]));

/** Fill quiet inhabited years with distinct, consequential local events. */
export function ensure_year_events(sim, start_index, minimum = 10) {
  const groups = new Map();
  for (const person of sim.people.values()) {
    setdefault(groups, person.country, []).push(person);
  }
  if (groups.size === 0) {
    return;
  }
  const busy = new Set([...sim.wars.keys()].flatMap(pair => [...pair]));
  const categories = new Set(['discovery', 'political', 'creative', 'war', 'sickness', 'disaster']);
  let count = sum(sim.history_categories.slice(start_index).map(c => categories.has(c)));
  const countries = [...groups.keys()];
  sim.rng.shuffle(countries);
  // Passive household/environment developments also work for orphan communities:
  // no infant is assigned an adult profession or political office.
  const household_events = [
    ['Wild fruit ripened near homes', 'food', 2, 'political'],
    ['Stored grain spoiled in damp shelters', 'food', -2, 'political'],
    ['A nearby spring ran clearer after rainfall', 'food', 1, 'political'],
    ['Cold nights damaged household supplies', 'prosperity', -1, 'political'],
    ['Early shoots replenished nearby edible plants', 'food', 1, 'political'],
    ['Insects damaged stored bedding', 'prosperity', -1, 'political'],
    ['Mild weather reduced shelter needs', 'prosperity', 1, 'political'],
    ['Animal tracks revealed a nearby water source', 'research', .2, 'discovery'],
    ['Fallen branches damaged an empty shelter', 'prosperity', -1, 'political'],
    ['New grass improved local grazing grounds', 'food', 1, 'political'],
    ['A dry spell preserved household stores', 'food', 1, 'political'],
    ['Wind scattered exposed supplies', 'food', -1, 'political'],
    ['Rain filled household water jars', 'food', 1, 'political'],
    ['Frost cracked exposed storage vessels', 'prosperity', -1, 'political'],
    ['A quiet season spared household reserves', 'food', 1, 'political'],
    ['Mice consumed grain left in open baskets', 'food', -1, 'political'],
    ['Reeds regrew around nearby shelters', 'prosperity', 1, 'political'],
    ['Rot weakened unused fences', 'prosperity', -1, 'political'],
    ['Fallen fruit supplemented local food supplies', 'food', 1, 'political'],
    ['Leaks soaked stored firewood', 'prosperity', -1, 'political'],
    ['Dry weather reduced losses from damp', 'prosperity', 1, 'political'],
    ['Straying animals consumed garden plants', 'food', -1, 'political'],
    ['Sheltered gardens retained moisture', 'food', 1, 'political'],
    ['Loose roof coverings deteriorated', 'prosperity', -1, 'political']
  ];
  const used = new Map(countries.map(cid => [cid, new Set()]));
  while (count < minimum) {
    let made_progress = false;
    for (const cid of countries) {
      const country = sim.countries.get(cid);
      const adults = groups.get(cid).filter(p => p.age >= 18);
      if (adults.length > 0 && run_catalog_event(sim, country, adults, groups, busy)) {
        count += 1;
        made_progress = true;
      } else {
        const candidates = range(household_events.length).filter(i => !used.get(cid).has(i));
        if (candidates.length === 0) {
          continue;
        }
        const index = sim.rng.choice(candidates);
        used.get(cid).add(index);
        const [text, stat, amount, category] = household_events[index];
        const before = country[stat];
        const after = stat === 'research' ? Math.max(0, before + amount) : clamp(before + amount);
        // Saturated stats must not produce pretend consequences.
        if (before === after) {
          continue;
        }
        country[stat] = after;
        sim.record(`${text} in ${country.name} (${stat} ${format(after - before, '+.1f')}).`, category);
        count += 1;
        made_progress = true;
      }
      if (count >= minimum) {
        break;
      }
    }
    if (!made_progress) {
      // Try other unused household developments; end only when all exhausted.

      if (countries.every(cid => used.get(cid).size === household_events.length)) {
        break;
      }
    }
  }
}
