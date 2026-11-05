/**
 * How a civilization's systems shape one another.
 *
 * Politics, science, culture, economy, health, war, construction and geography are not
 * separate meters. Each year every country's state is analysed once; the results (and a
 * note explaining each effect) are used by research, disease, war, disaster and settlement
 * code, so a change anywhere ripples through the rest.
 */

import {Counter, TupleMap, fixed, sorted} from './runtime.js';
import {contacts, profile, settlement_counts, dist, _inhabited, resources_near, hazards_at, ensure_placed, describe} from './geography.js';
import {building_counts} from './development.js';
import {effects as tech_effects} from './technology.js';
import {of as economy_of} from './economy.js';
import * as governments from './governments.js';

export function _clamp(value) {
  return Math.max(0, Math.min(100, value));
}

export function _add(notes, label, value) {
  if (Math.abs(value) >= .004) {
    notes.push([label, Math.trunc(value * 1000) / 1000]);
  }
  return value;
}

export function _mul(notes, label, factor) {
  if (Math.abs(factor - 1) >= .004) {
    notes.push([label, Math.trunc((factor - 1) * 1000) / 1000]);
  }
  return factor;
}

/** One pass over everyone: country -> [residents, infected, jobs of adults]. */
export function census(sim) {
  const table = new Map();
  for (const p of sim.people.values()) {
    let row = table.get(p.country);
    if (row == null) {
      row = [0, 0, new Counter()];
      table.set(p.country, row);
    }
    row[0] += 1;
    if (p.infection) {
      row[1] += 1;
    }
    if (p.age >= 18) {
      row[2].set(p.job, row[2].get(p.job) + 1);
    }
  }
  return table;
}

/** Everything that affects, and is affected by, one country this year. */
export function analyze(sim, cid, counted = null) {
  const country = sim.countries.get(cid);
  const [land, sea] = contacts(sim, false);
  const prof = profile(sim, cid);
  const b = building_counts(sim, cid);
  if (counted == null) {
    counted = census(sim);
  }
  const [headcount, infected, jobs] = counted.get(cid) ?? [0, 0, new Counter()];
  const residents = Math.max(1, headcount);
  const share = infected / residents;
  const wars = [...sim.wars.keys()].filter(pair => pair.includes(cid));
  const at_war = wars.length > 0;
  let exhaustion = 0;
  const details = sim.war_details ?? new TupleMap();
  for (const pair of wars) {
    const detail = details.get(pair);
    if (detail?.size > 0) {
      exhaustion = Math.max(exhaustion, detail.get('exhaustion')[pair[0] === cid ? 0 : 1]);
    }
  }
  const techs = country.technologies;
  const roads = (sim.roads ?? new Map());
  const road_len = [...roads.values()].filter(v => v === cid).length;
  const peaceful = [...(land.get(cid) ?? new Set())].filter(n => !sim.wars.has([...sorted([cid, n])]));
  const sea_contacts = techs.has('sailing') ? (sea.get(cid)?.size ?? 0) : 0;
  const fx = tech_effects(techs);
  const trade = (1 + fx.get('trade')) * governments.trait(country, 'trade') * Math.min(5, .5 * b.get('bank') + 1 * b.get('station') + .6 * b.get('market') + .8 * b.get('harbor') + .6 * b.get('lighthouse') + .015 * road_len + .35 * peaceful.length + .5 * sea_contacts);
  const culture = country.culture ?? 0;
  const level = Math.min(5, culture / 40);
  const monarchy = governments.AUTHORITY.includes(country.government);
  const form = governments.info(country.government).get('label');
  const eco = economy_of(sim, cid);
  const treasury = country.treasury ?? 0;
  const places = _inhabited(sim).filter(s => s.country === cid);
  let frontier = false;
  let s;
  for (s of places) {
    for (const o of _inhabited(sim)) {
      if (o.country !== cid && dist(s.gx, s.gy, o.gx, o.gy) <= 16) {
        frontier = true;
      }
    }
  }
  const last_disaster = country.last_disaster_year ?? null;
  const recent_disaster = last_disaster != null && sim.year - last_disaster <= 2;
  const notes = new Map();
  // Science: shaped by institutions, trade, culture, politics, health, war and geography.
  let n = [];
  notes.set('research', n);
  let r = 1;
  r += _add(n, 'Schools', .10 * b.get('school') ** .8);
  r += _add(n, 'Libraries', .16 * b.get('library') ** .8);
  r += _add(n, 'Universities', .28 * b.get('university') ** .8);
  r += _add(n, 'Observatories', .18 * b.get('observatory') ** .8);
  r += _add(n, 'Grand academy', .25 * b.get('grand_academy'));
  r += _add(n, 'Trade carries ideas', .07 * trade);
  r += _add(n, 'Culture and learning', .07 * level);
  r += _add(n, 'Political stability', (country.stability - 50) / 250);
  r += _add(n, form + ' government', governments.trait(country, 'research'));
  r += _add(n, 'Open markets', (country.economic_system ?? 'mixed') === 'capitalism' ? .04 : 0);
  r += _add(n, 'Epidemic disruption', -Math.min(.3, share * 3));
  r += _add(n, 'Isolation in the highlands', !land.get(cid)?.size && prof.get('mountain') > .5 ? -.12 : 0);
  r += _add(n, 'Treasury patronage', .08 * Math.min(1, Math.max(0, treasury) / 5000));
  const boost = Math.max(0, r - 1);
  const research = Math.max(.4, Math.min(2.4, r >= 1 ? 1 + boost / (1 + boost / 1.1) : r)); // diminishing returns
  // Culture: made by performers, teachers and cultural buildings, funded by prosperity and peace.
  n = [];
  notes.set('culture', n);
  let gain = jobs.get('performer') * .03 + jobs.get('teacher') * .015 + 1.8 * b.get('theater') + .8 * b.get('monument') + .7 * b.get('library') + .4 * b.get('school') + 1 * b.get('university') + 2.5 * (b.get('palace') + b.get('grand_academy') + b.get('lighthouse') + b.get('fortress'));
  gain *= (.5 + country.prosperity / 100) * (.6 + country.stability / 150) * (at_war ? .6 : 1) * governments.trait(country, 'culture') * (1 + fx.get('cult'));
  _add(n, form + ' shapes the arts', governments.trait(country, 'culture') !== 1 ? gain * (1 - 1 / governments.trait(country, 'culture')) : 0);
  _add(n, 'Performers and teachers', jobs.get('performer') * .03 + jobs.get('teacher') * .015);
  _add(n, 'Theaters, monuments and libraries', 1.8 * b.get('theater') + .8 * b.get('monument') + .7 * b.get('library'));
  _add(n, 'War suppresses the arts', at_war ? -gain * .4 / .6 : 0);
  // Politics: stability reacts to culture, buildings, war, disease, disaster and expansion.
  n = [];
  notes.set('stability', n);
  s = 0;
  s += _add(n, 'Monuments', Math.min(.8, .22 * b.get('monument') * (monarchy ? 1.4 : 1)));
  s += _add(n, form + ' rule', governments.trait(country, 'stability'));
  s += _add(n, 'Faith, law and civic life', fx.get('stab'));
  if (eco != null) {
    s += _add(n, 'Hunger', -1.4 * (1 - eco.get('food_ratio')));
    s += _add(n, 'Luxuries in the markets', .25 * eco.get('luxury_cover') * Math.min(1, (eco.get('made').get('gold') ?? 0) + (eco.get('made').get('furs') ?? 0) + (eco.get('imports').get('gold') ?? 0) + (eco.get('imports').get('furs') ?? 0)));
  }
  s += _add(n, 'Royal palace', .5 * b.get('palace'));
  s += _add(n, 'National pride from culture', .04 * level);
  s += _add(n, 'Defensible towns', at_war || frontier ? Math.min(.3, .1 * b.get('walls')) : 0);
  s += _add(n, 'War exhaustion', at_war ? -exhaustion / 60 : 0);
  s += _add(n, 'Epidemic fear', -share * 14);
  s += _add(n, 'Recent disaster', recent_disaster ? -1.2 : 0);
  s += _add(n, 'New towns raise confidence', sim.year - (country.last_expansion ?? -99) <= 3 ? .4 : 0);
  s += _add(n, 'Empty treasury', treasury < 0 ? -.3 : 0);
  if (s > 0) { // hard to improve what is already excellent
    s *= Math.max(.1, 1 - country.stability / 105);
  }
  const stability_delta = Math.max(-1.5, Math.min(1.2, s));
  // Economy: markets, harbors, roads and mines against disease and war.
  n = [];
  notes.set('prosperity', n);
  let p_delta = 0;
  p_delta += _add(n, 'Markets', .12 * b.get('market') ** .8);
  p_delta += _add(n, 'Harbors', .16 * b.get('harbor'));
  p_delta += _add(n, 'Trade routes', .05 * trade);
  p_delta += _add(n, 'Mines', .08 * b.get('mine'));
  p_delta += _add(n, 'Forges', .06 * b.get('forge'));
  p_delta += _add(n, 'Banks', .1 * b.get('bank'));
  p_delta += _add(n, 'Factories', .15 * b.get('factory'));
  p_delta += _add(n, 'Mills', .06 * b.get('mill'));
  p_delta += _add(n, 'Culture draws visitors', .08 * level);
  p_delta += _add(n, 'Epidemic costs', -share * 8);
  p_delta += _add(n, 'War costs', at_war ? -.6 : 0);
  if (eco != null) {
    p_delta += _add(n, 'Resource wealth', Math.min(.5, eco.get('gdp') / Math.max(1, residents) * .25));
    p_delta += _add(n, 'Shortages of building materials', -.6 * (1 - eco.get('material_cover')));
    p_delta += _add(n, 'Hunger', -1 * (1 - eco.get('food_ratio')));
    p_delta += _add(n, 'Trade profits', Math.min(.4, eco.get('trade_income') / Math.max(1, residents) * .1));
  }
  if (p_delta > 0) {
    p_delta *= Math.max(.1, 1 - country.prosperity / 110);
  }
  const prosperity_delta = Math.max(-2, Math.min(1.5, p_delta));

  n = [];
  notes.set('food', n);
  let food_delta = 0;
  food_delta += _add(n, 'Granaries', Math.min(6, 2.2 * b.get('granary') ** .8));
  food_delta += _add(n, 'Mills', 1.5 * b.get('mill') ** .8);
  food_delta += _add(n, 'Harbor fisheries', 1 * b.get('harbor') ** .8 * (1 + prof.get('coastal')));
  food_delta += _add(n, 'Wells and aqueducts (irrigation)', .6 * (b.get('well') + b.get('aqueduct')) ** .7);
  // Health: water works and clinics against trade, crowding and war.
  n = [];
  notes.set('infection', n);
  let infection = 1;
  infection *= _mul(n, 'Wells', Math.max(.6, 1 - .06 * b.get('well')));
  infection *= _mul(n, 'Aqueducts', Math.max(.6, 1 - .09 * b.get('aqueduct')));
  infection *= _mul(n, 'Trade carries disease', 1 + .04 * trade);
  const crowd = Math.min(2, Math.max(0, residents / Math.max(1, places.length) - 250) / 300);
  infection *= _mul(n, 'Crowded towns', 1 + .15 * crowd);
  infection *= _mul(n, 'Camp fever in wartime', at_war ? 1.2 : 1);
  const death_mult = .93 ** b.get('clinic') * .85 ** b.get('hospital');
  const care_bonus = 6 * b.get('clinic') + 18 * b.get('hospital');
  const cure_mult = 1 + .10 * b.get('clinic') + .15 * b.get('hospital') + .10 * b.get('university') + .08 * b.get('library');
  // War: weapons, walls, roads, culture and terrain.
  n = [];
  notes.set('military', n);
  let power = 1;
  power *= _mul(n, 'Mines supply arms', 1 + .05 * b.get('mine'));
  power *= _mul(n, form + ' army', governments.trait(country, 'military'));
  if (eco != null) {
    power *= _mul(n, 'Iron, copper and coal in stock', .88 + .16 * eco.get('metal_cover'));
  }
  power *= _mul(n, 'Morale from national culture', 1 + .03 * level);
  power *= _mul(n, 'Unpaid soldiers', treasury < 0 ? .85 : 1);
  power *= _mul(n, 'Forges and barracks', 1 + .04 * b.get('forge') + .06 * b.get('barracks'));
  power *= _mul(n, 'Roads move armies', 1 + Math.min(.12, .003 * road_len));
  const defense = _mul(n, 'City walls', .96 ** b.get('walls')) * _mul(n, 'Great fortress', .9 ** b.get('fortress'));
  const supply_bonus = Math.min(.3, .004 * road_len + .05 * b.get('harbor') + .05 * b.get('station'));
  // Expansion: how strongly the country wants to found new towns.
  n = [];
  notes.set('expansion', n);
  let drive = 1;
  drive *= _mul(n, form + ' seeks territory', governments.trait(country, 'expansion') * (monarchy ? 1.2 : 1));
  drive *= _mul(n, 'Hunger pushes people out', 1 + (eco != null ? .35 * (1 - eco.get('food_ratio')) : 0));
  drive *= _mul(n, 'Royal palace', 1 + .1 * b.get('palace'));
  drive *= _mul(n, 'Food surplus', 1 + (country.food - 50) / 150);
  const size = residents / Math.max(1, places.length);
  drive *= _mul(n, 'Crowded towns', 1 + Math.max(0, Math.min(.6, (size - 250) / 500)));
  drive *= _mul(n, 'Unrest', country.stability < 35 ? .6 : 1);
  drive *= _mul(n, 'Treasury', treasury > 2000 ? 1.15 : treasury < 0 ? .6 : 1);
  drive *= _mul(n, 'War', at_war ? .3 : 1);
  drive *= _mul(n, 'Quarantine', country.quarantine ? .5 : 1);
  drive *= _mul(n, 'Roads and trade', 1 + Math.min(.3, .01 * road_len + .03 * trade));

  return new Map([
    ['year', sim.year],
    ['research', research],
    ['culture_gain', gain],
    ['culture', culture],
    ['culture_level', level],
    ['stability_delta', stability_delta],
    ['prosperity_delta', prosperity_delta],
    ['food_delta', food_delta],
    ['trade', trade],
    ['expansion', Math.max(.15, Math.min(3, drive))],
    ['power_mult', power],
    ['defense_mult', defense],
    ['supply_bonus', supply_bonus],
    ['infection_mult', infection],
    ['death_mult', death_mult],
    ['care_bonus', care_bonus],
    ['cure_mult', cure_mult],
    ['infected_share', share],
    ['at_war', at_war],
    ['road_len', road_len],
    ['frontier', frontier],
    ['performers', jobs.get('performer')],
    ['scientists', jobs.get('scientist')],
    ['merchants', jobs.get('merchant')],
    ['healers', jobs.get('healer')],
    ['builders', jobs.get('laborer') + jobs.get('artisan')],
    ['residents', residents],
    ['settlements', places.length],
    ['buildings', new Map([...b].map(([k, v]) => [k, v]))],
    ['government', country.government],
    ['neighbors', sorted(land.get(cid) ?? new Set())],
    ['sea_neighbors', sorted(sea.get(cid) ?? new Set())],
    ['notes', notes]
  ]);
}

/** Analyse every living country once at the start of the year. */
export function refresh(sim) {
  contacts(sim); // compute and remember this year's borders once
  const counted = census(sim);
  sim.systems_state = new Map([
    ['year', sim.year],
    ['countries', new Map(sorted(sim.countries.keys()).filter(cid => sim.countries.get(cid).ended == null).map(cid => [cid, analyze(sim, cid, counted)]))]
  ]);
}

export function state(sim, cid) {
  const cache = sim.systems_state ?? null;
  if (cache != null && cache.get('year') === sim.year && cache.get('countries').has(cid)) {
    return cache.get('countries').get(cid);
  }
  return analyze(sim, cid);
}

/** Apply this year's cross-system effects to the shared national meters. */
export function apply_yearly(sim) {
  const cache = sim.systems_state ?? null;
  if (cache == null || cache.get('year') !== sim.year) {
    return;
  }
  for (const cid of sorted(cache.get('countries').keys())) {
    const st = cache.get('countries').get(cid);
    const country = sim.countries.get(cid);
    if (country.ended != null) {
      continue;
    }
    country.culture = (country.culture ?? 0) * .96 + st.get('culture_gain');
    country.stability = _clamp(country.stability + st.get('stability_delta'));
    country.prosperity = _clamp(country.prosperity + st.get('prosperity_delta'));
    country.treasury = (country.treasury ?? 0) + 2 * st.get('trade') * st.get('residents') ** .5 * ((country.economic_system ?? 'mixed') === 'capitalism' ? 1.5 : 1);
  }
}

export function _ore(sim, place) {
  const found = resources_near(sim, place.gx, place.gy, 3);
  return found.get('iron') + found.get('copper') + found.get('gold') + found.get('coal');
}

/** How likely two particular neighbors are to come to blows. */
export function war_friction(sim, a, b) {
  const ca = sim.countries.get(a);
  const cb = sim.countries.get(b);
  const sa = state(sim, a);
  const sb = state(sim, b);
  const places = _inhabited(sim);
  let close = 0;
  for (const x of places) {
    if (x.country === a) {
      for (const y of places) {
        if (y.country === b && dist(x.gx, x.gy, y.gx, y.gy) <= 12) {
          close += 1;
        }
      }
    }
  }
  let f = 1 + Math.min(1, .12 * close);
  const ore_a = places.filter(x => x.country === a).reduce((total, x) => total + _ore(sim, x), 0);
  const ore_b = places.filter(x => x.country === b).reduce((total, x) => total + _ore(sim, x), 0);
  const ore_gap = (ore_a === 0) !== (ore_b === 0);
  if (ore_gap) {
    f *= 1.25;
  }
  f /= 1 + .12 * Math.min(sa.get('trade'), sb.get('trade'));
  f *= 1 - .04 * Math.min(sa.get('culture_level'), sb.get('culture_level'));
  const low = Math.min(ca.stability, cb.stability);
  if (low < 60) {
    f *= 1 + (60 - low) / 200;
  }
  if (ca.government === 'monarchy' && cb.government === 'monarchy') {
    f *= 1.15;
  }
  f *= (governments.trait(ca, 'war') + governments.trait(cb, 'war')) / 2;
  const gap = Math.abs(tech_effects(ca.technologies).get('weapon') - tech_effects(cb.technologies).get('weapon'));
  f *= 1 + .08 * Math.min(3, gap); // the better armed neighbor is tempted
  if (['democracy', 'republic'].includes(ca.government) && ['democracy', 'republic'].includes(cb.government)) { // democracies rarely fight each other
    f *= .6;
  }
  return [Math.max(.2, Math.min(3, f)), ore_gap];
}

export function _signed(value) {
  return (value >= 0 ? '+' : '') + fixed(value, 2);
}

export function report(sim, query = '') {
  const lines = [
    "Systems: how each country's politics, science, culture, economy, health, war, buildings and geography shape one another."
  ];
  for (const cid of sorted(sim.countries.keys())) {
    const country = sim.countries.get(cid);
    if (country.ended != null || query && !country.name.toLowerCase().includes(query)) {
      continue;
    }
    const st = state(sim, cid);
    lines.push(`${country.name}: research x${fixed(st.get('research'), 2)}; culture ${fixed(st.get('culture'), 0)} (${_signed(st.get('culture_gain'))}/yr); stability ${_signed(st.get('stability_delta'))}/yr; prosperity ${_signed(st.get('prosperity_delta'))}/yr; trade ${fixed(st.get('trade'), 1)}; expansion x${fixed(st.get('expansion'), 2)}; infection x${fixed(st.get('infection_mult'), 2)}; military x${fixed(st.get('power_mult'), 2)}`);
    for (const topic of ['research', 'stability', 'prosperity', 'expansion', 'infection', 'military']) {
      const notes = st.get('notes').get(topic) ?? [];
      if (notes.length > 0) {
        lines.push(`  ${topic}: ` + notes.map(([label, value]) => `${label} ${_signed(value)}`).join('; '));
      }
    }
  }
  return lines.join('\n');
}

export function hazard_report(sim, settlement) {
  ensure_placed(sim);
  const risk = hazards_at(sim, settlement.gx, settlement.gy);
  const lines = [
    `Natural hazards at ${settlement.name} (${describe(sim, settlement)}, cell ${settlement.gx},${settlement.gy}):`
  ];
  for (const [kind, value] of sorted(risk, {key: ([, v]) => -v})) {
    lines.push(`  ${kind}: ${fixed(value, 2)} ` + '#'.repeat(Math.trunc(value * 4)));
  }
  return lines.join('\n');
}
