/**
 * Settler expeditions that cross the map, and construction projects that build things.
 *
 * Settlers stay residents of their home settlement while they travel; only when they arrive
 * does a new town exist. Buildings are built by a settlement's workers, paid from the national
 * treasury, and then change how the country's other systems behave.
 */

import {Counter, TupleMap, format, isSubset, maxOf, sorted} from './runtime.js';
import {AUTHORITY} from './governments.js';
import {effects as tech_effects} from './technology.js';
import {materials_pace, use_materials} from './economy.js';
import {W, H, world, dist, find_path, find_sea_route, cached_route, coast_cell, step_cost, site_quality, claim_owner, claims_list, reach, settlement_counts, hazards_at, ensure_placed, resources_near, _near_flag, _inhabited, contacts} from './geography.js';
import {pass_on_knowledge} from './society.js';
import {state} from './systems.js';
import {_history} from './epidemiology.js';

export const SPEED = 9;
export const SEA_SPEED = 14;
export const ARMY_SPEED = 11;
export const CARAVAN_SPEED = 10;
export const CARAVAN_SEA_SPEED = 15;
export const BUILDINGS = new Map([
  ['well', [
    'Wells and cisterns',
    100,
    new Set(),
    40,
    '',
    'cleaner water and less waterborne disease',
    false
  ]],
  ['granary', ['Granary', 160, new Set(['granaries']), 60, '', 'food reserves that soften famine', false]],
  ['market', ['Market', 200, new Set(['pottery']), 80, '', 'trade, prosperity and treasury income', false]],
  ['school', ['School', 260, new Set(['writing']), 80, '', 'faster research and more creative work', false]],
  ['library', ['Library', 380, new Set(['paper']), 120, '', 'research and shared knowledge', false]],
  ['university', ['University', 700, new Set(['universities']), 200, '', 'major research gains', false]],
  ['observatory', ['Observatory', 560, new Set(['astronomy']), 150, '', 'research and navigation', false]],
  ['clinic', [
    'Clinic',
    280,
    new Set(['medicine']),
    70,
    '',
    'treatment: fewer deaths and more care capacity',
    false
  ]],
  ['hospital', ['Hospital', 500, new Set(['surgery']), 150, '', 'strong care and faster cures', false]],
  ['aqueduct', ['Aqueduct', 440, new Set(['aqueducts']), 120, '', 'clean water at scale', false]],
  ['walls', ['City walls', 440, new Set(['fortification']), 100, '', 'defense in war and sieges', false]],
  ['harbor', [
    'Harbor',
    320,
    new Set(['sailing']),
    80,
    'coast',
    'sea trade and fishing, but also a path for disease',
    false
  ]],
  ['levee', [
    'Levee and seawall',
    240,
    new Set(['irrigation']),
    60,
    'water',
    'protection from floods and storms',
    false
  ]],
  ['firebreak', ['Firebreak', 140, new Set(), 60, '', 'protection from wildfires', false]],
  ['foundations', [
    'Reinforced hall',
    320,
    new Set(['fortification']),
    80,
    '',
    'protection from earthquakes and landslides',
    false
  ]],
  ['monument', ['Monument', 440, new Set(['writing']), 100, '', 'stability and national pride', false]],
  ['theater', ['Theater', 340, new Set(['writing']), 100, '', 'culture and creative works', false]],
  ['mine', ['Mine', 300, new Set(['bronze tools']), 60, 'ore', 'prosperity and weapons', false]],
  ['mill', ['Mill', 280, new Set(['watermills']), 80, 'river', 'food and prosperity', false]],
  ['forge', ['Forge', 360, new Set(['ironworking']), 100, '', 'weapons, tools and prosperity', false]],
  ['bank', ['Bank', 520, new Set(['banking']), 200, '', 'treasury income and trade', false]],
  ['barracks', [
    'Barracks',
    480,
    new Set(['military drill']),
    150,
    '',
    'stronger armies and sturdier defense',
    false
  ]],
  ['factory', ['Factory', 900, new Set(['steam power']), 250, '', 'mass production and prosperity', false]],
  ['station', ['Railway station', 800, new Set(['railways']), 250, '', 'rail trade and swift supply', false]],
  ['palace', [
    'Royal palace',
    900,
    new Set(['writing']),
    150,
    'capital',
    'the seat of government: stability, taxes and settler drive',
    true
  ]],
  ['grand_academy', [
    'Grand academy',
    1500,
    new Set(['universities']),
    250,
    'university',
    'a great center of learning',
    true
  ]],
  ['lighthouse', [
    'Lighthouse',
    420,
    new Set(['navigation']),
    100,
    'harbor',
    'safer sea voyages and busier trade',
    true
  ]],
  ['fortress', [
    'Great fortress',
    1300,
    new Set(['steelmaking']),
    200,
    'walls',
    'a nearly impregnable stronghold',
    true
  ]]
]);
export const WORK = new Map([['laborer', 1], ['artisan', 1], ['farmer', .25], ['scientist', .2]]);
export const TRAVEL_RISK = new Map([
  ['ocean', .009],
  ['mountains', .012],
  ['desert', .008],
  ['swamp', .008],
  ['tundra', .007],
  ['hills', .003],
  ['forest', .003]
]);

export function _list(sim, name) {
  return sim[name] ??= [];
}

/** Remove the entry with the same id (list.remove is not available everywhere). */
export function _drop(items, target) {
  for (let i = 0, end = items.length; i < end; i++) {
    if (items[i].get('id') === target.get('id')) {
      items.splice(i, 1);
      return;
    }
  }
}

export function _next(sim, name) {
  const value = sim[name] ?? 1;
  sim[name] = value + 1;
  return value;
}

export function building_counts(sim, cid) {
  const counts = new Counter();
  for (const s of sim.settlements.values()) {
    if (s.country === cid && s.abandoned == null) {
      for (const kind of s.buildings?.keys() ?? []) {
        counts.set(kind, counts.get(kind) + 1);
      }
    }
  }
  return counts;
}

// ---------------------------------------------------------------- expeditions

/** Best unclaimed place for a new town. By land: on the origin's landmass. By sea: on another landmass. */
export function choose_site(sim, origin, around = null, radius = 40, sea = false) {
  ensure_placed(sim);
  const geo = world(sim);
  const comp = geo.get('land');
  const terrain = geo.get('terrain');
  const sizes = geo.get('size');
  const counts = settlement_counts(sim);
  const [cx, cy] = around?.length > 0 ? around : [origin.gx, origin.gy];
  const land = comp[origin.gy][origin.gx];
  const monarchy = AUTHORITY.includes(sim.countries.get(origin.country).government);
  const claims = claims_list(sim, counts);
  const occupied = new Set(claims.map(c => c[4]));
  const prefer = sea ? 22 : 14;
  let best = null;
  let best_score = -1000000;
  const reach_limit = radius + (sea ? 25 : 0);
  const y_end = Math.min(H - 1, cy + reach_limit + 1);
  const x_end = Math.min(W - 1, cx + reach_limit + 1);
  for (let y = Math.max(1, cy - reach_limit); y < y_end; y += 3) {
    for (let x = Math.max(1, cx - reach_limit); x < x_end; x += 3) {
      const here = comp[y][x];
      if (here === 0 || terrain[y][x] === 'mountains') {
        continue;
      }
      // by sea, only an empty land across the water will do
      if (sea && (here === land || sizes.get(here) < 25)) {
        continue;
      }
      if (!sea && here !== land) {
        continue;
      }
      let nearest = 99;
      let rival = 99;
      let claimed = false;
      for (const [country, sx, sy, r, other_land] of claims) {
        const d = ((sx - x) ** 2 + (sy - y) ** 2) ** .5;
        if (d < nearest) {
          nearest = d;
        }
        if (country !== origin.country && d < rival) {
          rival = d;
        }
        if (d <= r + 1 && other_land === here) {
          claimed = true;
        }
      }
      if (nearest < 7 || claimed) {
        continue;
      }
      if (sea && coast_cell(sim, x, y) == null) {
        continue;
      }
      const quality = site_quality(sim, x, y);
      if (quality < .8) {
        continue;
      }
      let score = quality - Math.abs(dist(origin.gx, origin.gy, x, y) - prefer) * .08;
      if (sea && !occupied.has(here)) {
        score += 1.5;
      }
      if (rival < 18) { // a monarchy stakes claims on the frontier
        score += monarchy ? .6 : -.3;
      }
      if (score > best_score) {
        best_score = score;
        best = [x, y];
      }
    }
  }
  return best;
}

export function _path_costs(sim, cells) {
  const costs = [];
  for (let i = 1, end = cells.length; i < end; i++) {
    costs.push(step_cost(sim, cells[i - 1][0], cells[i - 1][1], cells[i][0], cells[i][1]));
  }
  return costs;
}

export function _sea_costs(cells) {
  const costs = [];
  for (let i = 1, end = cells.length; i < end; i++) {
    const diagonal = cells[i][0] !== cells[i - 1][0] && cells[i][1] !== cells[i - 1][1];
    costs.push(diagonal ? 1.41 : 1);
  }
  return costs;
}

export function _can_sail(sim, origin) {
  return sim.countries.get(origin.country).technologies.has('sailing') && _coast(sim, origin);
}

/** Send settlers from a settlement to found a new town for their country, on foot or by boat. */
export function launch_expedition(sim, origin, kind = 'found', size = null, target = null, forced = false) {
  ensure_placed(sim);
  const exps = _list(sim, 'expeditions');
  const country = sim.countries.get(origin.country);
  if (!forced) {
    if (exps.some(e => e.get('country') === origin.country) || exps.filter(e => e.get('kind') === 'found').length >= 2) {
      return null;
    }
    if (sim.year - (country.last_launch ?? -99) < 6) {
      return null;
    }
  }
  const residents = [...sim.people.values()].filter(p => p.settlement === origin.id && !p.expedition);
  const adults = residents.filter(p => p.age >= 18 && p.infection == null);
  if (residents.length < 20 || adults.length === 0) {
    return null;
  }
  let mode = 'land';
  let site = null;
  let route = null;
  if (target != null) {
    site = target;
    route = find_path(sim, [origin.gx, origin.gy], [site[0], site[1]]);
    if (route == null && _can_sail(sim, origin)) {
      route = find_sea_route(sim, [origin.gx, origin.gy], [site[0], site[1]]);
      mode = 'sea';
    }
  } else {
    const by_sea_first = _can_sail(sim, origin) && sim.rng.random() < .35;
    for (const attempt of by_sea_first ? ['sea', 'land'] : ['land', 'sea']) {
      if (attempt === 'sea' && !_can_sail(sim, origin)) {
        continue;
      }
      const found = choose_site(sim, origin, undefined, undefined, attempt === 'sea');
      if (found == null) {
        continue;
      }
      route = attempt === 'sea' ? find_sea_route(sim, [origin.gx, origin.gy], found) : find_path(sim, [origin.gx, origin.gy], found);
      if (route != null) {
        site = found;
        mode = attempt;
        break;
      }
    }
  }
  if (site == null || route == null) {
    return null;
  }
  const [cells, total] = route;
  const limit = Math.min(size || Math.min(25, Math.max(8, Math.floor(residents.length / 4))), residents.length - 10);
  if (limit < 6) {
    return null;
  }
  const founder = sim.rng.choice(adults);
  const family = residents.filter(p => p.lineage === founder.lineage && p.id !== founder.id && p.infection == null);
  const selected = [founder, ...family.slice(0, limit - 1)];
  const chosen = new Set(selected.map(p => p.id));
  const others = residents.filter(p => !chosen.has(p.id) && p.infection == null);
  const wanted = size || 10;
  selected.push(...sim.rng.sample(others, Math.min(Math.max(0, wanted - selected.length), others.length)));
  const fx = tech_effects(country.technologies);
  const speed = mode === 'sea' ? SEA_SPEED * (1 + fx.get('sea')) : SPEED * (1 + fx.get('land'));
  const exp = new Map([
    ['id', _next(sim, 'next_expedition')],
    ['kind', kind],
    ['mode', mode],
    ['speed', speed],
    ['country', origin.country],
    ['origin', origin.id],
    ['target', [site[0], site[1]]],
    ['path', cells.map(([x, y]) => [x, y])],
    ['costs', mode === 'sea' ? _sea_costs(cells) : _path_costs(sim, cells)],
    ['index', 0],
    ['carry', 0],
    ['people', selected.map(p => p.id)],
    ['leader', founder.id],
    ['start', sim.year],
    ['total', total]
  ]);
  for (const p of selected) {
    p.expedition = exp.get('id');
  }
  exps.push(exp);
  country.last_launch = sim.year;
  const terrain = world(sim).get('terrain')[site[1]][site[0]];
  const ref = sim.person_reference(founder);
  const opening = mode === 'sea' ? `${ref} sailed from ${origin.name} with ${selected.length} settlers` : `${ref} led ${selected.length} settlers out of ${origin.name}`;
  sim.record(`${opening} to found a new ${country.name} town on ${terrain} land${mode === 'sea' ? ' across the sea' : ''}; the journey should take about ${Math.trunc(total / speed) + 1} years.`, 'political');
  return exp;
}

/** Move a group between two settlements of one country; far journeys take years. */
export function launch_migration(sim, origin, target, members, kind = 'migrate') {
  ensure_placed(sim);
  members = members.filter(p => !p.expedition);
  if (members.length === 0) {
    return null;
  }
  let route = null;
  if (dist(origin.gx, origin.gy, target.gx, target.gy) > 4) {
    route = find_path(sim, [origin.gx, origin.gy], [target.gx, target.gy]);
  }
  if (route == null) {
    for (const p of members) {
      p.settlement = target.id;
    }
    return null;
  }
  const [cells, total] = route;
  const exp = new Map([
    ['id', _next(sim, 'next_expedition')],
    ['kind', kind],
    ['country', origin.country],
    ['origin', origin.id],
    ['target', [target.gx, target.gy]],
    ['target_settlement', target.id],
    ['path', cells.map(([x, y]) => [x, y])],
    ['costs', _path_costs(sim, cells)],
    ['index', 0],
    ['carry', 0],
    ['people', members.map(p => p.id)],
    ['leader', members[0].id],
    ['start', sim.year],
    ['total', total]
  ]);
  for (const p of members) {
    p.expedition = exp.get('id');
  }
  _list(sim, 'expeditions').push(exp);
  return exp;
}

/** A family sets out for a town of a neighboring country, carrying what its people know. */
export function launch_emigration(sim, origin, groups) {
  ensure_placed(sim);
  const [land, sea] = contacts(sim);
  const neighbors = sorted(land.get(origin.country) ?? new Set()).filter(n => !sim.wars.has([...sorted([origin.country, n])]) && sim.countries.get(n).ended == null);
  if (neighbors.length === 0) {
    return null;
  }
  const host = sim.rng.choice(neighbors);
  const towns = [...sim.settlements.values()].filter(s => s.country === host && s.abandoned == null && groups.get(s.id).length > 0);
  if (towns.length === 0) {
    return null;
  }
  let target = towns[0];
  for (const s of towns) {
    if (dist(s.gx, s.gy, origin.gx, origin.gy) < dist(target.gx, target.gy, origin.gx, origin.gy)) {
      target = s;
    }
  }
  const route = find_path(sim, [origin.gx, origin.gy], [target.gx, target.gy]);
  if (route == null || route[0].length < 2) {
    return null;
  }
  const ruler = sim.countries.get(origin.country).ruler;
  const residents = (groups.get(origin.id) ?? []).filter(p => !p.expedition && p.id !== ruler && p.infection == null);
  const adults = residents.filter(p => p.age >= 18);
  if (adults.length === 0) {
    return null;
  }
  const migrant = sim.rng.choice(adults);
  const members = residents.filter(p => p.lineage === migrant.lineage).slice(0, 12);
  const [cells, total] = route;
  const exp = new Map([
    ['id', _next(sim, 'next_expedition')],
    ['kind', 'emigrant'],
    ['country', origin.country],
    ['origin', origin.id],
    ['target', [target.gx, target.gy]],
    ['target_settlement', target.id],
    ['path', cells.map(([x, y]) => [x, y])],
    ['costs', _path_costs(sim, cells)],
    ['index', 0],
    ['carry', 0],
    ['people', members.map(p => p.id)],
    ['leader', migrant.id],
    ['start', sim.year],
    ['total', total]
  ]);
  for (const p of members) {
    p.expedition = exp.get('id');
  }
  _list(sim, 'expeditions').push(exp);
  sim.record(`${members.length} people from ${origin.name} set out for ${target.name} in ${sim.countries.get(host).name}.`, 'population');
  return exp;
}

/** Newcomers settle in a foreign town; the host learns a little of what their homeland knows. */
export function _arrive_abroad(sim, exp, members, origin, country, destination) {
  const host = sim.countries.get(destination.country);
  const pair = [...sorted([country.id, host.id])];
  if (destination.abandoned != null || host.ended != null || sim.wars.has(pair)) {
    _release(sim, exp);
    return;
  }
  const movers = members.filter(p => p.id !== country.ruler);
  for (const person of members) {
    person.expedition = null;
  }
  for (const person of movers) {
    person.settlement = destination.id;
    person.country = host.id;
  }
  _drop(_list(sim, 'expeditions'), exp);
  if (movers.length === 0) {
    return;
  }
  sim.record(`${movers.length} newcomers from ${country.name} (${origin.name}) settled in ${destination.name} in ${host.name}.`, 'population');
  const got = pass_on_knowledge(sim, country, host, Math.min(.8, .08 * movers.length));
  if (got?.length > 0) {
    sim.record(`Settlers from ${country.name} brought knowledge of ${got[0]} to ${host.name}.`, 'discovery');
  }
}

export function _release(sim, exp) {
  for (const pid of exp.get('people')) {
    const person = sim.people.get(pid);
    if (person != null) {
      person.expedition = null;
    }
  }
  _drop(_list(sim, 'expeditions'), exp);
}

export function _kill_traveler(sim, person) {
  person.died = sim.year;
  person.cause_of_death = 'hardships of the journey';
  sim.lineages.get(person.lineage).deaths += 1;
  sim.people.delete(person.id);
}

export function advance_expeditions(sim) {
  const exps = _list(sim, 'expeditions');
  if (exps.length === 0) {
    return 0;
  }
  ensure_placed(sim);
  const rows = world(sim).get('terrain');
  let died = 0;
  for (const exp of [...exps]) {
    let members = exp.get('people').filter(i => sim.people.has(i)).map(i => sim.people.get(i));
    if (members.length > 0) {
      const leader = sim.people.get(exp.get('leader')) || members[0];
      exp.set('country', leader.country);
      members = members.filter(p => p.country === exp.get('country'));
    }
    const released = exp.get('people').filter(i => sim.people.has(i) && !members.includes(sim.people.get(i))).map(i => sim.people.get(i));
    for (const person of released) {
      person.expedition = null;
    }
    exp.set('people', members.map(p => p.id));
    const origin = sim.settlements.get(exp.get('origin'));
    const minimum = exp.get('kind') === 'found' ? 4 : 1;
    if (members.length < minimum || sim.countries.get(exp.get('country')).ended != null) {
      sim.record(`The expedition from ${origin.name} dissolved on the road.`, 'political');
      _release(sim, exp);
      continue;
    }
    let budget = (exp.get('speed') ?? SPEED) + (exp.get('carry') ?? 0);
    let index = exp.get('index');
    const path = exp.get('path');
    const costs = exp.get('costs');
    while (index < path.length - 1 && budget >= costs[index]) {
      budget -= costs[index];
      index += 1;
    }
    exp.set('carry', Math.min(budget, 6));
    exp.set('index', index);
    const here = rows[path[index][1]][path[index][0]];
    let risk = TRAVEL_RISK.get(here) ?? .0015;
    if (here === 'ocean') { // better ships and a lighthouse make the seas safer
      risk *= Math.max(.35, 1 - .8 * tech_effects(sim.countries.get(exp.get('country')).technologies).get('sea'));
      if (building_counts(sim, exp.get('country')).get('lighthouse') > 0) {
        risk *= .5;
      }
    }
    const lost = members.filter(p => sim.rng.random() < risk);
    for (const person of lost) {
      _kill_traveler(sim, person);
    }
    died += lost.length;
    members = members.filter(p => sim.people.has(p.id));
    exp.set('people', members.map(p => p.id));
    if (members.length < minimum) {
      sim.record(`The party from ${origin.name} turned back after the ${here} claimed too many lives.`, 'political');
      _release(sim, exp);
      continue;
    }
    if (index >= path.length - 1) {
      _arrive(sim, exp, members);
    }
  }
  return died;
}

export function _arrive(sim, exp, members) {
  const origin = sim.settlements.get(exp.get('origin'));
  const country = sim.countries.get(exp.get('country'));
  const years = Math.max(1, sim.year - exp.get('start'));
  if (exp.get('kind') === 'found') {
    let target = [exp.get('target')[0], exp.get('target')[1]];
    const counts = settlement_counts(sim);
    const occupied = [...sim.settlements.values()].some(s => s.abandoned == null && s.gx === target[0] && s.gy === target[1]);
    const owner = claim_owner(sim, target[0], target[1], counts);
    if (occupied || owner && owner !== exp.get('country')) {
      const alt = choose_site(sim, origin, target, 8, exp.get('mode') === 'sea');
      if (alt == null) {
        sim.record(`Settlers from ${origin.name} found their destination taken and returned home.`, 'political');
        _release(sim, exp);
        return;
      }
      target = alt;
    }
    const leader = sim.people.get(exp.get('leader')) || members[0];
    sim.record(`A party of ${members.length} settlers from ${origin.name} reached the site of a new ${country.name} town after ${years} years on the road.`, 'political');
    _drop(_list(sim, 'expeditions'), exp);
    sim.found_settlement(exp.get('country'), leader, members, undefined, target);
    for (const person of members) {
      person.expedition = null;
    }
    country.last_expansion = sim.year;
    return;
  }
  const destination = sim.settlements.get(exp.get('target_settlement'));
  if (exp.get('kind') === 'emigrant' && destination != null && destination.country !== exp.get('country')) {
    _arrive_abroad(sim, exp, members, origin, country, destination);
    return;
  }
  if (destination == null || destination.country !== exp.get('country') || destination.abandoned != null) {
    _release(sim, exp);
    return;
  }
  for (const person of members) {
    person.settlement = destination.id;
    person.expedition = null;
  }
  _drop(_list(sim, 'expeditions'), exp);
  const verb = exp.get('kind') === 'refugee' ? 'Refugees' : 'Migrants';
  sim.record(`${verb} from ${origin.name} (${members.length} people) settled in ${destination.name} in ${country.name}.`, 'population');
}

// ---------------------------------------------------------------- construction

export function _available(sim, s, kind, counts_here) {
  const [label, cost, tech, minimum, need, blurb, wonder] = BUILDINGS.get(kind);
  const country = sim.countries.get(s.country);
  if (s.buildings?.has(kind) || !isSubset(tech, country.technologies) || counts_here < minimum) {
    return false;
  }
  if (wonder && (building_counts(sim, s.country).get(kind) > 0 || _list(sim, 'projects').some(p => p.get('country') === s.country && p.get('kind') === kind))) { // one of each wonder per country
    return false;
  }
  if (need === 'capital' && country.capital !== s.id) {
    return false;
  }
  if (['university', 'harbor', 'walls'].includes(need) && !s.buildings?.has(need)) {
    return false;
  }
  if (_list(sim, 'projects').some(p => p.get('settlement') === s.id && p.get('kind') === kind)) {
    return false;
  }
  const features = world(sim);
  if (need === 'coast' && !_coast(sim, s)) {
    return false;
  }
  if (need === 'water' && !(_coast(sim, s) || _near_flag(features.get('river'), s.gx, s.gy, 1))) {
    return false;
  }
  if (need === 'river' && !_near_flag(features.get('river'), s.gx, s.gy, 1)) {
    return false;
  }
  if (need === 'ore') {
    const found = resources_near(sim, s.gx, s.gy, 3);
    if (['iron', 'copper', 'gold', 'coal', 'stone'].every(k => found.get(k) === 0)) {
      return false;
    }
  }
  if (kind === 'hospital' && !s.buildings?.has('clinic')) {
    return false;
  }
  return true;
}

export function _coast(sim, s) {
  const rows = world(sim).get('terrain');
  for (let yy = Math.max(0, s.gy - 1), end = Math.min(H, s.gy + 2); yy < end; yy++) {
    for (let xx = Math.max(0, s.gx - 1), end = Math.min(W, s.gx + 2); xx < end; xx++) {
      if (['ocean', 'lake'].includes(rows[yy][xx])) {
        return true;
      }
    }
  }
  return false;
}

/** Begin building something. Returns the project, or None if it cannot be built. */
export function start_project(sim, s, kind, forced = false, target = null) {
  const projects = _list(sim, 'projects');
  if (kind === 'road') {
    if (target == null || target.country !== s.country) {
      return null;
    }
    const route = find_path(sim, [s.gx, s.gy], [target.gx, target.gy]);
    if (route == null) {
      return null;
    }
    const [cells, total] = route;
    const project = new Map([
      ['id', _next(sim, 'next_project')],
      ['settlement', s.id],
      ['country', s.country],
      ['kind', 'road'],
      ['label', `Road to ${target.name}`],
      ['start', sim.year],
      ['progress', 0],
      ['cost', 40 + total * 9],
      ['workers', 0],
      ['cells', cells.map(([x, y]) => [x, y])],
      ['target', target.id]
    ]);
    projects.push(project);
    sim.record(`Work began on a road linking ${s.name} and ${target.name} in ${sim.countries.get(s.country).name}.`, 'political');
    return project;
  }
  const spec = BUILDINGS.get(kind);
  if (spec == null) {
    return null;
  }
  const counts = settlement_counts(sim);
  if (!forced && !_available(sim, s, kind, counts.get(s.id))) {
    return null;
  }
  if (forced && (s.buildings?.has(kind) || projects.some(p => p.get('settlement') === s.id && p.get('kind') === kind))) {
    return null;
  }
  const project = new Map([
    ['id', _next(sim, 'next_project')],
    ['settlement', s.id],
    ['country', s.country],
    ['kind', kind],
    ['label', spec[0]],
    ['start', sim.year],
    ['progress', 0],
    ['cost', spec[1]],
    ['workers', 0]
  ]);
  projects.push(project);
  sim.record(`Construction began on a ${spec[0].toLowerCase()} in ${s.name}, ${sim.countries.get(s.country).name}.`, 'political');
  return project;
}

/** How much a country wants a particular building in a particular place. */
export function _weight(sim, s, kind, st, built, haz, country) {
  let w = 1;
  const sick = st.get('infected_share');
  const war = st.get('at_war');
  const monarchy = AUTHORITY.includes(country.government);
  if (kind === 'well') {
    w += sick > .005 ? 2.5 : 0;
    w += _near_flag(world(sim).get('river'), s.gx, s.gy, 1) ? 1 : 0;
  } else if (kind === 'granary') {
    w += country.food < 55 || country.conditions.has('Famine') || country.conditions.has('Drought') ? 3 : 0;
  } else if (kind === 'market') {
    w += (country.economic_system ?? 'mixed') === 'capitalism' ? 1.5 : .5;
  } else if (['school', 'library', 'university', 'observatory'].includes(kind)) {
    w += !monarchy ? 1.4 : .2;
    w += (country.economic_system ?? 'mixed') === 'communism' ? 1 : 0;
  } else if (['clinic', 'hospital'].includes(kind)) {
    w += sick > .01 ? 3.5 : sick > 0 ? 1 : 0;
  } else if (kind === 'aqueduct') {
    w += s.buildings?.has('well') ? 1.5 : 0;
  } else if (kind === 'walls') {
    w += war ? 3.5 : st.get('frontier') ? 1 : 0;
    w += monarchy ? 1.5 : 0;
  } else if (kind === 'harbor') {
    w += (country.economic_system ?? 'mixed') === 'capitalism' ? 2 : .6;
  } else if (kind === 'levee') {
    w += haz.get('flood') * 1.2 + haz.get('storm') * .8;
  } else if (kind === 'firebreak') {
    w += haz.get('wildfire') * 1.6;
  } else if (kind === 'foundations') {
    w += haz.get('earthquake') * 1.6 + haz.get('landslide') * 1.2;
  } else if (kind === 'monument') {
    w += monarchy ? 2.5 : .3;
    w += country.stability < 45 ? 2 : 0;
  } else if (kind === 'theater') {
    w += st.get('performers') >= 3 ? 1 : 0;
    w += !monarchy ? .8 : 0;
  } else if (kind === 'mine') {
    w += 1.5 + (war ? 2 : 0);
  } else if (kind === 'mill') {
    w += 1;
  } else if (kind === 'palace') {
    w += monarchy ? 3 : 1;
  } else if (kind === 'grand_academy') {
    w += !monarchy ? 2.5 : .8;
  } else if (kind === 'lighthouse') {
    w += 1.5 + ((country.economic_system ?? 'mixed') === 'capitalism' ? 1.5 : 0);
  } else if (kind === 'fortress') {
    w += war ? 3.5 : st.get('frontier') ? 1.5 : 0;
  } else if (kind === 'forge') {
    w += 1 + (war ? 1.5 : 0);
  } else if (kind === 'bank') {
    w += (country.economic_system ?? 'mixed') === 'capitalism' ? 1.5 : .6;
  } else if (kind === 'barracks') {
    w += (war ? 2.5 : .3) + (['junta', 'empire', 'tyranny'].includes(country.government) ? 1 : 0);
  } else if (kind === 'factory') {
    w += 1.5 + ((country.economic_system ?? 'mixed') === 'capitalism' ? 1 : 0);
  } else if (kind === 'station') {
    w += 1.5;
  }
  return Math.max(0, w * .7 ** built.get(kind));
}

/** Each year idle settlements may start something their country needs. */
export function plan_projects(sim) {
  const projects = _list(sim, 'projects');
  const counts = settlement_counts(sim);
  for (const cid of sorted(sim.countries.keys())) {
    const country = sim.countries.get(cid);
    if (country.ended != null || (country.treasury ?? 0) < 150) {
      continue;
    }
    const st = state(sim, cid);
    const built = building_counts(sim, cid);
    for (const s of sorted(_inhabited(sim), {key: (x => x.id)})) {
      if (s.country !== cid) {
        continue;
      }
      const pop = counts.get(s.id);
      const active = projects.filter(p => p.get('settlement') === s.id);
      if (pop < 40 || active.length >= (pop >= 400 ? 2 : 1) || sim.rng.random() >= .30) {
        continue;
      }
      const haz = hazards_at(sim, s.gx, s.gy);
      const kinds = [];
      const weights = [];
      for (const kind of BUILDINGS.keys()) {
        if (_available(sim, s, kind, pop) && BUILDINGS.get(kind)[1] * .6 <= country.treasury) {
          const weight = _weight(sim, s, kind, st, built, haz, country);
          if (weight > 0) {
            kinds.push(kind);
            weights.push(weight);
          }
        }
      }
      if (kinds.length > 0) {
        start_project(sim, s, sim.rng.choices(kinds, weights, 1)[0]);
      }
    }
    // Roads between a country's own towns, once it knows how.
    if (country.technologies.has('roads') && sim.rng.random() < .10) {
      const mine = _inhabited(sim).filter(s => s.country === cid && counts.get(s.id) >= 60);
      const roads = sim.roads ?? new Map();
      let best = null;
      let best_gap = 999;
      for (let i = 0; i < mine.length; i++) {
        for (let j = i + 1; j < mine.length; j++) {
          const d = dist(mine[i].gx, mine[i].gy, mine[j].gx, mine[j].gy);
          const linked = projects.some(p => p.get('kind') === 'road' && (p.get('settlement') === mine[i].id && p.get('target') === mine[j].id || p.get('settlement') === mine[j].id && p.get('target') === mine[i].id));
          const midpoint = [Math.trunc((mine[i].gx + mine[j].gx) / 2), Math.trunc((mine[i].gy + mine[j].gy) / 2)];
          const covered = roads.has(midpoint[1] * W + midpoint[0]);
          if (d < best_gap && d > 4 && d < 48 && !linked && !covered) {
            best_gap = d;
            best = [mine[i], mine[j]];
          }
        }
      }
      if (best != null) {
        start_project(sim, best[0], 'road', undefined, best[1]);
      }
    }
  }
}

export function advance_projects(sim) {
  const projects = _list(sim, 'projects');
  if (projects.length === 0) {
    return;
  }
  const workers = new Map();
  for (const p of sim.people.values()) {
    if (p.age >= 18 && p.infection == null && (p.wounded_until ?? 0) <= sim.year) {
      const weight = WORK.get(p.job) ?? 0;
      if (weight) {
        workers.set(p.settlement, (workers.get(p.settlement) ?? 0) + weight);
      }
    }
  }
  const shares = new Counter(projects.map(p => p.get('settlement')));
  const busy = new Set([...sim.wars.keys()].flatMap(pair => [...pair]));
  for (const project of [...projects]) {
    const s = sim.settlements.get(project.get('settlement'));
    const country = sim.countries.get(s.country);
    if (s.abandoned != null || country.ended != null) {
      _drop(projects, project);
      continue;
    }
    const crew = (workers.get(s.id) ?? 0) / shares.get(s.id);
    let pace = 1;
    if (busy.has(s.country)) {
      pace *= .4;
    }
    if (country.conditions.has('Famine')) {
      pace *= .6;
    }
    if (country.quarantine) {
      pace *= .7;
    }
    if ((country.treasury ?? 0) < 0) {
      pace *= .3;
    }
    pace *= materials_pace(country); // no timber, stone or clay in the stockpile: work crawls
    const done = crew * pace * (country.technologies.has('roads') ? 1.15 : 1) * (1 + tech_effects(country.technologies).get('build'));
    project.set('workers', Math.trunc(crew * 10) / 10);
    project.set('progress', project.get('progress') + done / project.get('cost'));
    country.treasury = (country.treasury ?? 0) - done * .6;
    use_materials(country, done * .15);
    if (project.get('progress') >= 1) {
      _drop(projects, project);
      _complete(sim, s, country, project);
    }
  }
}

export function _complete(sim, s, country, project) {
  if (project.get('kind') === 'road') {
    sim.roads ??= new Map();
    const roads = sim.roads;
    for (const [x, y] of project.get('cells')) {
      roads.set(y * W + x, s.country);
    }
    const other = sim.settlements.get(project.get('target'));
    sim.record(`A road linking ${s.name} and ${other ? other.name : 'a neighboring town'} was completed in ${country.name}.`, 'political');
    country.prosperity = Math.min(100, country.prosperity + 1);
    return;
  }
  s.buildings ??= new Map();
  s.buildings.set(project.get('kind'), sim.year);
  const spec = BUILDINGS.get(project.get('kind'));
  country.stability = Math.min(100, country.stability + (project.get('kind') === 'monument' ? 2 : 1));
  country.prosperity = Math.min(100, country.prosperity + 1);
  sim.record(`${spec[0]} completed in ${s.name}, ${country.name}: ${spec[5]}.`, 'political');
}

/** A settlement may lose buildings to disaster or war. Returns the names lost. */
export function damage_buildings(sim, s, chance, cause) {
  const built = s.buildings ?? null;
  const lost = [];
  if (!built?.size) {
    return lost;
  }
  for (const kind of sorted(built.keys())) {
    if (sim.rng.random() < chance) {
      lost.push(kind);
    }
  }
  for (const kind of lost) {
    built.delete(kind);
  }
  if (lost.length > 0) {
    const names = lost.map(k => BUILDINGS.get(k)[0].toLowerCase()).join(', ');
    sim.record(`${cause} destroyed the ${names} in ${s.name}.`, 'disaster');
  }
  return lost;
}

export function projects_report(sim, query = '') {
  const projects = _list(sim, 'projects');
  const lines = ['Construction projects (workers build; the national treasury pays):'];
  let shown = 0;
  for (const project of projects) {
    const s = sim.settlements.get(project.get('settlement'));
    const country = sim.countries.get(s.country);
    if (query && !country.name.toLowerCase().includes(query) && !s.name.toLowerCase().includes(query)) {
      continue;
    }
    shown += 1;
    lines.push(`  #${project.get('id')} ${project.get('label')} in ${s.name} (${country.name}): ${format(project.get('progress'), '.0%')} done; ${project.get('workers')} workers`);
  }
  if (!shown) {
    lines.push('  none under way');
  }
  lines.push('Completed buildings:');
  let total = 0;
  for (const s of sorted(sim.settlements.values(), {key: (x => x.id)})) {
    const built = s.buildings ?? new Map();
    const country = sim.countries.get(s.country);
    if (built.size > 0 && (!query || country.name.toLowerCase().includes(query) || s.name.toLowerCase().includes(query))) {
      total += built.size;
      lines.push(`  ${s.name} (${country.name}): ` + sorted(built.keys()).map(k => BUILDINGS.get(k)[0].toLowerCase()).join(', '));
    }
  }
  if (!total) {
    lines.push('  none yet');
  }
  const roads = sim.roads ?? new Map();
  lines.push(`Road cells: ${roads.size}`);
  return lines.join('\n');
}

export function expeditions_report(sim, query = '') {
  const lines = ['Settler parties on the road:'];
  let shown = 0;
  for (const exp of _list(sim, 'expeditions')) {
    const country = sim.countries.get(exp.get('country'));
    if (query && !country.name.toLowerCase().includes(query)) {
      continue;
    }
    const origin = sim.settlements.get(exp.get('origin'));
    const steps = exp.get('path').length - 1;
    const left = steps - exp.get('index');
    const aim = exp.get('kind') === 'found' ? 'to found a new town' : 'to ' + sim.settlements.get(exp.get('target_settlement')).name;
    shown += 1;
    lines.push(`  ${country.name}: ${exp.get('people').length} people from ${origin.name} ${aim}; ${exp.get('index')} of ${steps} steps done, ${left} to go (left in year ${exp.get('start')})`);
  }
  if (!shown) {
    lines.push('  none');
  }
  return lines.join('\n');
}

// ---------------------------------------------------------------- armies

/** Is this side's army standing at the walls of its objective? */
export function besieging(sim, pair, side) {
  return _list(sim, 'armies').some(army => army.get('war')[0] === pair[0] && army.get('war')[1] === pair[1] && army.get('side') === side && army.get('state') === 'besieging');
}

/** Armies march from their own towns to the enemy settlement they are fighting for. */
export function advance_armies(sim) {
  ensure_placed(sim);
  const armies = _list(sim, 'armies');
  const details = sim.war_details ?? new TupleMap();
  const keep = [];
  for (const pair of sorted(sim.wars.keys())) {
    const detail = details.get(pair);
    if (detail.size === 0) {
      continue;
    }
    for (const side of [0, 1]) {
      const cid = pair[side];
      const enemy = pair[1 - side];
      const men = (detail.get('mobilized') ?? [0, 0])[side];
      const objectives = detail.get('objectives') ?? [null, null];
      const objective = sim.settlements.get(objectives[side]);
      if (men <= 0 || objective == null || objective.country !== enemy || objective.abandoned != null) {
        continue;
      }
      let army = null;
      for (const a of armies) {
        if (a.get('war')[0] === pair[0] && a.get('war')[1] === pair[1] && a.get('side') === side) {
          army = a;
        }
      }
      if (army == null) {
        const mine = _inhabited(sim).filter(s => s.country === cid);
        if (mine.length === 0) {
          continue;
        }
        let home = mine[0];
        for (const s of mine) {
          if (dist(s.gx, s.gy, objective.gx, objective.gy) < dist(home.gx, home.gy, objective.gx, objective.gy)) {
            home = s;
          }
        }
        const route = cached_route(sim, [home.gx, home.gy], [objective.gx, objective.gy]);
        if (route == null) {
          continue;
        }
        const cells = route[0];
        const stop = Math.max(0, cells.length - 3);
        army = new Map([
          ['id', _next(sim, 'next_army')],
          ['country', cid],
          ['enemy', enemy],
          ['war', [pair[0], pair[1]]],
          ['side', side],
          ['objective', objective.id],
          ['origin', home.id],
          ['men', men],
          ['path', cells.slice(0, stop + 1).map(([x, y]) => [x, y])],
          ['costs', _path_costs(sim, cells.slice(0, stop + 1))],
          ['index', 0],
          ['carry', 0],
          ['state', 'marching'],
          ['start', sim.year]
        ]);
        armies.push(army);
        sim.record(`${sim.countries.get(cid).name} mobilized ${men} soldiers, who marched out of ${home.name} toward ${objective.name}.`, 'war');
      }
      army.set('men', men);
      army.set('objective', objective.id);
      if (army.get('state') === 'marching') {
        let budget = ARMY_SPEED * (1 + tech_effects(sim.countries.get(cid).technologies).get('land')) + army.get('carry');
        let index = army.get('index');
        while (index < army.get('path').length - 1 && budget >= army.get('costs')[index]) {
          budget -= army.get('costs')[index];
          index += 1;
        }
        army.set('carry', Math.min(budget, 6));
        army.set('index', index);
        if (index >= army.get('path').length - 1) {
          army.set('state', 'besieging');
          sim.record(`The ${sim.countries.get(cid).name} army of ${men} soldiers laid siege to ${objective.name}.`, 'war');
        }
      }
      keep.push(army.get('id'));
    }
  }
  sim.armies = armies.filter(a => keep.includes(a.get('id')));
}

// ---------------------------------------------------------------- merchant caravans

export const CARGO = new Map([
  ['grain', 'grain'],
  ['pasture', 'wool'],
  ['fish', 'salted fish'],
  ['game', 'meat'],
  ['timber', 'timber'],
  ['stone', 'stone'],
  ['clay', 'pottery clay'],
  ['iron', 'iron'],
  ['copper', 'copper'],
  ['coal', 'coal'],
  ['gold', 'gold'],
  ['salt', 'salt'],
  ['furs', 'furs']
]);

export function _caravan_spawn(sim, cid, st, caravans, land, sea) {
  const country = sim.countries.get(cid);
  const partners = sorted(land.get(cid) ?? new Set()).filter(n => !sim.wars.has([...sorted([cid, n])]));
  if (country.technologies.has('sailing')) {
    partners.push(...sorted(sea.get(cid) ?? new Set()).filter(n => !partners.includes(n)));
  }
  if (partners.length === 0) {
    return;
  }
  const other = sim.rng.choice(partners);
  const mine = _inhabited(sim).filter(s => s.country === cid);
  const theirs = _inhabited(sim).filter(s => s.country === other);
  if (mine.length === 0 || theirs.length === 0) {
    return;
  }
  const counts = settlement_counts(sim);
  const origin = maxOf(mine, {key: (s => counts.get(s.id) + (s.buildings?.has('market') ? 40 : 0) + (s.buildings?.has('harbor') ? 40 : 0))});
  const comp = world(sim).get('land');
  const same = theirs.filter(s => comp[s.gy][s.gx] === comp[origin.gy][origin.gx]);
  const by_sea = same.length === 0;
  let pool = by_sea ? theirs : same;
  if (by_sea) {
    pool = pool.filter(s => _coast(sim, s));
    if (pool.length === 0 || !_coast(sim, origin)) {
      return;
    }
  }
  let dest = pool[0];
  for (const s of pool) {
    if (dist(s.gx, s.gy, origin.gx, origin.gy) < dist(dest.gx, dest.gy, origin.gx, origin.gy)) {
      dest = s;
    }
  }
  const route = cached_route(sim, [origin.gx, origin.gy], [dest.gx, dest.gy], by_sea);
  if (route == null) {
    return;
  }
  const cells = route[0];
  const size = Math.max(4, Math.min(90, Math.floor(st.get('merchants') / 3) + 4 * ((st.get('buildings').get('market') ?? 0) + (st.get('buildings').get('harbor') ?? 0))));
  let carries = null;
  if (st.get('infected_share') >= .02) {
    const sick = new Counter([...sim.people.values()].filter(p => p.country === cid && p.infection).map(p => p.infection));
    if (sick.size > 0) {
      carries = sick.mostCommon(1)[0][0];
    }
  }
  const near = resources_near(sim, origin.gx, origin.gy, 4);
  const cargo = near.size > 0 ? CARGO.get(near.mostCommon(1)[0][0]) : 'cloth';
  const caravan = new Map([
    ['id', _next(sim, 'next_caravan')],
    ['country', cid],
    ['partner', other],
    ['origin', origin.id],
    ['dest', dest.id],
    ['mode', by_sea ? 'sea' : 'land'],
    ['path', cells.map(([x, y]) => [x, y])],
    ['costs', by_sea ? _sea_costs(cells) : _path_costs(sim, cells)],
    ['index', 0],
    ['carry', 0],
    ['size', size],
    ['cargo', cargo],
    ['carries', carries],
    ['start', sim.year],
    ['large', size >= 40]
  ]);
  caravans.push(caravan);
  if (size >= 40 || carries) {
    sim.record(`${size >= 40 ? 'A large band' : 'A band'} of ${size} ${country.name} merchants left ${origin.name} for ${dest.name} with ${cargo}${carries ? ', some of them sick with ' + carries : ''}.`, 'political');
  }
}

/** Merchants carry goods, ideas and sometimes disease between towns. */
export function advance_caravans(sim) {
  ensure_placed(sim);
  const caravans = _list(sim, 'caravans');
  const [land, sea] = contacts(sim);
  const arrived = [];
  for (const c of caravans) {
    const cfx = tech_effects(sim.countries.get(c.get('country')).technologies);
    const speed = c.get('mode') === 'sea' ? CARAVAN_SEA_SPEED * (1 + cfx.get('sea')) : CARAVAN_SPEED * (1 + cfx.get('land'));
    let budget = speed + c.get('carry');
    let index = c.get('index');
    while (index < c.get('path').length - 1 && budget >= c.get('costs')[index]) {
      budget -= c.get('costs')[index];
      index += 1;
    }
    c.set('carry', Math.min(budget, 6));
    c.set('index', index);
    if (index >= c.get('path').length - 1) {
      arrived.push(c);
    }
  }
  for (const c of arrived) {
    _drop(caravans, c);
    const home = sim.countries.get(c.get('country'));
    const away = sim.countries.get(c.get('partner'));
    const dest = sim.settlements.get(c.get('dest'));
    if (dest == null || away.ended != null || home.ended != null) {
      continue;
    }
    const gain = Math.min(2, c.get('size') / 40);
    for (const country of [home, away]) {
      country.prosperity = Math.min(100, country.prosperity + gain * .5);
      country.treasury = (country.treasury ?? 0) + c.get('size') * 3;
    }
    // Merchants swap know-how both ways: more traders and a more productive giver pass on more.
    for (const [giver, taker] of [[home, away], [away, home]]) {
      const got = pass_on_knowledge(sim, giver, taker, Math.min(.6, .02 * c.get('size')));
      if (got?.length > 0 && c.get('size') >= 40) {
        sim.record(`Merchants from ${giver.name} taught ${taker.name} about ${got[0]} in ${dest.name}.`, 'discovery');
      }
    }
    if (c.get('carries') && sim.sicknesses.has(c.get('carries')) && sim.rng.random() < .6) {
      const residents = [...sim.people.values()].filter(p => (p.settlement === dest.id && p.infection == null && !p.immunity.has(c.get('carries'))));
      if (residents.length > 0) {
        const patient = sim.rng.choice(residents);
        patient.infection = c.get('carries');
        patient.infection_steps = 0;
        _history(patient, 'infected', c.get('carries'), sim.year);
        sim.record(`Merchants from ${home.name} brought ${c.get('carries')} to ${dest.name} in ${away.name}.`, 'sickness');
      }
    }
  }
  if (caravans.length >= 8) {
    return;
  }
  for (const cid of sorted(sim.countries.keys())) {
    const country = sim.countries.get(cid);
    if (country.ended != null || _list(sim, 'caravans').length >= 8) {
      continue;
    }
    const st = state(sim, cid);
    if (st.get('trade') < .6 || sim.rng.random() >= Math.min(.4, .05 + .06 * st.get('trade'))) {
      continue;
    }
    _caravan_spawn(sim, cid, st, caravans, land, sea);
  }
}
