/**
 * Resources as an economy.
 *
 * Every tile may hold up to three deposits. Settlements work the deposits inside their claim,
 * nearest first, to feed their people and supply wood, stone, metal and luxuries. A deposit that
 * is worked down to nothing is *exhausted*: it refills slowly and cannot be worked again until it
 * is completely full. Goods go into national stockpiles, spoil, are traded between peaceful
 * neighbors at prices set by scarcity, are taxed by the government, and feed back into food,
 * construction, weapons, stability and prosperity.
 */

import {TupleSet, addAll, fixed, getOr, round, setdefault, sorted, sum} from './runtime.js';
import {W, H, RESOURCE_INFO, FEATURE_NAMES, world, _inhabited, reach, settlement_counts, contested_cells, dist, contacts, ensure_placed, cell_features, claim_owner} from './geography.js';
import {effects as tech_effects, era_index, ERA_GROUP} from './technology.js';
import {state as system_state} from './systems.js';
import {building_counts, BUILDINGS, damage_buildings} from './development.js';
import * as governments from './governments.js';

export const FOOD = ['grain', 'pasture', 'fish', 'game'];
export const MATERIALS = ['timber', 'stone', 'clay'];
export const METALS = ['iron', 'copper', 'coal'];
export const LUXURIES = ['gold', 'furs', 'salt'];
export const KINDS = [...FOOD, ...MATERIALS, ...METALS, ...LUXURIES];
const NON_FOOD = [...MATERIALS, ...METALS, ...LUXURIES];
export const SPOIL = new Map([
  ['grain', .30],
  ['pasture', .30],
  ['fish', .40],
  ['game', .40],
  ['timber', .03],
  ['stone', .0],
  ['clay', .0],
  ['iron', .005],
  ['copper', .005],
  ['coal', .01],
  ['gold', .0],
  ['furs', .06],
  ['salt', .0]
]);
export const FOOD_TECHS = new Set(['irrigation', 'crop rotation', 'granaries', 'watermills', 'pottery']);
export const YEARLY_SHARE = .5; // at most this share of a deposit can be worked in a year
export const CAPACITY_SHARE = .5; // share of the land's yearly food regrowth that can feed people sustainably
export const FOOD_NEED = .35; // tons of food per person per year (sum of the food needs below)

export function _state(sim) {
  sim.deposit_state ??= new Map();
  return sim.deposit_state;
}

export function _econ(sim) {
  sim.econ ??= new Map();
  return sim.econ;
}

export function label(kind) {
  return RESOURCE_INFO.get(kind)[0];
}

/** (amount, exhausted) for one deposit; untouched deposits are full. */
export function deposit_level(sim, key, slot, cap) {
  const entry = _state(sim).get(key * 4 + slot);
  if (entry == null) {
    return [Number(cap), false];
  }
  return [entry[0], Boolean(entry[1])];
}

/** Rows for one tile: kind, capacity, current amount, exhausted, regrowth share. */
export function tile_deposits(sim, x, y) {
  const geo = world(sim);
  const rows = [];
  const key = y * W + x;
  for (const [slot, [kind, cap]] of (geo.get('deposits').get(key) ?? []).entries()) {
    const [amount, locked] = deposit_level(sim, key, slot, cap);
    rows.push(new Map([
      ['kind', kind],
      ['cap', cap],
      ['amount', amount],
      ['locked', locked],
      ['rate', RESOURCE_INFO.get(kind)[2]]
    ]));
  }
  return rows;
}
// ---------------------------------------------------------------- yearly cycle

/** Every worked deposit refills a little; exhausted ones stay locked until completely full. */
export function regrow(sim) {
  const geo = world(sim);
  const state = _state(sim);
  const refilled = [];
  for (const idx of sorted(state.keys())) {
    const entry = state.get(idx);
    const key = Math.floor(idx / 4);
    const slot = idx % 4;
    const [kind, cap] = geo.get('deposits').get(key)[slot];
    entry[0] = Math.min(cap, entry[0] + cap * RESOURCE_INFO.get(kind)[2]);
    if (entry[0] >= cap) {
      if (entry[1] && cap >= 100) {
        refilled.push([entry[2], kind, key]);
      }
      state.delete(idx);
    }
  }
  for (const [sid, kind] of refilled.slice(0, 2)) {
    const s = sim.settlements.get(sid);
    if (s != null && s.abandoned == null) {
      sim.record(`The ${label(kind).toLowerCase()} near ${s.name} has fully recovered and can be worked again.`, 'economy');
    }
  }
}

/** Which deposits each settlement works: (distance, cell, slot, kind, cap), nearest first. */
export function _sites(sim, counts, blocked) {
  const geo = world(sim);
  const comp = geo.get('land');
  const deposits = geo.get('deposits');
  const best = new Map();
  for (const s of sorted(_inhabited(sim), {key: (x => x.id)})) {
    const r = Math.trunc(Math.min(reach(getOr(counts, s.id, 1)), 9));
    const home = comp[s.gy][s.gx];
    for (let y = Math.max(0, s.gy - r), end = Math.min(H, s.gy + r + 1); y < end; y++) {
      for (let x = Math.max(0, s.gx - r), end = Math.min(W, s.gx + r + 1); x < end; x++) {
        const key = y * W + x;
        if (!deposits.has(key) || blocked.has(key) || comp[y][x] !== home) {
          continue;
        }
        const d = dist(s.gx, s.gy, x, y);
        if (d > r) {
          continue;
        }
        if (!best.has(key) || d < best.get(key)[0]) {
          best.set(key, [d, s.id]);
        }
      }
    }
  }
  const sites = new Map();
  for (const key of sorted(best.keys())) {
    const [d, sid] = best.get(key);
    for (const [slot, [kind, cap]] of deposits.get(key).entries()) {
      setdefault(sites, sid, []).push([d, key, slot, kind, cap]);
    }
  }
  for (const [sid, rows] of sites) {
    sites.set(sid, sorted(rows, {key: row => [row[0], row[1], row[2]]})); // array keys: sorted() compares them lexicographically
  }
  return sites;
}

/** What one settlement wants each year, in tons. */
export function _needs(sim, s, pop, country, built, projects, at_war) {
  const techs = country.technologies;
  const need = new Map();
  need.set('grain', pop * .22);
  need.set('pasture', pop * .05);
  need.set('fish', pop * .05);
  need.set('game', pop * .03);
  need.set('timber', pop * .05 + 2 * built + 4 * projects);
  need.set('stone', pop * .02 + 2 * built + 5 * projects);
  need.set('clay', pop * .015 + 1 * built + 2 * projects);
  if (techs.has('ironworking')) {
    need.set('iron', pop * .03 * (at_war ? 2 : 1));
    need.set('copper', pop * .008);
    need.set('coal', pop * (techs.has('steelmaking') ? .02 : .008));
  } else if (techs.has('bronze tools')) {
    need.set('copper', pop * .03 * (at_war ? 2 : 1));
  }
  if (techs.has('gunpowder')) {
    need.set('coal', (need.get('coal') ?? 0) + pop * .01);
    need.set('salt', pop * .01);
  }
  if (techs.has('steam power')) {
    need.set('coal', (need.get('coal') ?? 0) + pop * .03);
    need.set('iron', (need.get('iron') ?? 0) + pop * .01);
  }
  if (techs.has('railways')) {
    need.set('iron', (need.get('iron') ?? 0) + pop * .02);
  }
  need.set('salt', (need.get('salt') ?? 0) + pop * .01);
  need.set('furs', pop * .004);
  need.set('gold', pop * (techs.has('banking') ? .002 : .001));
  return need;
}

/** Regrow, work, consume, spoil, trade and tax. Called once per simulated year. */
export function yearly(sim) {
  regrow(sim);
  const counts = settlement_counts(sim);
  const econ = _econ(sim);
  const previous = new Map(econ);
  const contested = contested_cells(sim);
  const sites = _sites(sim, counts, contested);
  const projects = new Map();
  for (const p of sim.projects ?? []) {
    projects.set(p.get('settlement'), (projects.get(p.get('settlement')) ?? 0) + 1);
  }
  const state = _state(sim);
  const places = new Map();
  for (const s of sorted(_inhabited(sim), {key: x => x.id})) {
    setdefault(places, s.country, []).push(s);
  }
  const fresh = new Map();
  const exhausted_now = [];
  for (const cid of sorted(places.keys())) {
    const country = sim.countries.get(cid);
    const st = system_state(sim, cid);
    const at_war = st.get('at_war');
    country.stock ??= new Map();
    const stock = country.stock;
    for (const kind of KINDS) {
      setdefault(stock, kind, 0);
    }
    const need = new Map();
    const local = new Map();
    for (const s of places.get(cid)) {
      const built = s.buildings?.size ?? 0;
      const row = _needs(sim, s, getOr(counts, s.id, 1), country, built, projects.get(s.id) ?? 0, at_war);
      local.set(s.id, row);
      for (const [kind, amount] of row) {
        need.set(kind, (need.get(kind) ?? 0) + amount);
      }
    }
    // Neighbours that ran short last year give exporters a reason to dig a little deeper.
    const pull = new Map();
    for (const other of [...st.get('neighbors'), ...st.get('sea_neighbors')]) {
      const theirs = previous.get(other);
      if (theirs != null && !sim.wars.has(sorted([cid, other]))) {
        for (const [kind, short] of theirs.get('deficit')) {
          pull.set(kind, (pull.get(kind) ?? 0) + short * .5);
        }
      }
    }
    const system = country.economic_system ?? 'mixed';
    const quota = governments.trait(country, 'quota');
    const output = governments.trait(country, 'output');
    const skill = 1 + .5 * Math.min(1.5, tech_effects(country.technologies).get('prod'));
    if (!country.capacity_manual) {
      // The land sets how many people a country can feed: yearly regrowth of its food deposits, scaled by farming skill.
      let regrowth = 0;
      for (const s of places.get(cid)) {
        for (const [, , , kind, cap] of sites.get(s.id) ?? []) {
          if (FOOD.includes(kind)) {
            regrowth += cap * RESOURCE_INFO.get(kind)[2];
          }
        }
      }
      const target = Math.max(150, Math.trunc(CAPACITY_SHARE * regrowth * skill / FOOD_NEED));
      const residents = sum(places.get(cid).map(s => getOr(counts, s.id, 0)));
      if (country.capacity > 20 * target) {
        country.capacity = Math.max(target, Math.trunc(residents * 1.5));
      } else {
        country.capacity = Math.max(150, Math.trunc(country.capacity + (target - country.capacity) * .15));
      }
    }
    const want = new Map();
    for (const kind of need.keys()) {
      let drive = 1.4;
      if (system === 'capitalism' && !FOOD.includes(kind)) {
        drive = 1.7;
      }
      if (system === 'communism' && FOOD.includes(kind)) {
        drive = 1.6;
      }
      want.set(kind, Math.max(0, need.get(kind) * drive * quota - stock.get(kind) * .8) + Math.min((pull.get(kind) ?? 0), need.get(kind) * 1.5));
    }
    const made = new Map();
    let worked = 0;
    for (const s of places.get(cid)) {
      const mine = need_share(local.get(s.id), need);
      for (const [, key, slot, kind, cap] of sites.get(s.id) ?? []) {
        const goal = (want.get(kind) ?? 0) * (mine.get(kind) ?? 0);
        if (goal <= .01) {
          continue;
        }
        const idx = key * 4 + slot;
        let entry = state.get(idx);
        if (entry == null) {
          entry = [cap, false, s.id];
        } else if (entry[1]) {
          continue;
        }
        const effort = Math.min(goal / (skill * output), entry[0], cap * YEARLY_SHARE);
        if (effort <= 0) {
          continue;
        }
        entry[0] -= effort;
        entry[2] = s.id;
        const gained = effort * skill * output;
        want.set(kind, Math.max(0, want.get(kind) - gained));
        made.set(kind, (made.get(kind) ?? 0) + gained);
        stock.set(kind, stock.get(kind) + gained);
        worked += 1;
        if (entry[0] <= .5) {
          entry[0] = 0;
          entry[1] = true;
          exhausted_now.push([cid, s.id, kind, cap]);
        }
        state.set(idx, entry);
      }
    }
    const deficit = new Map();
    const food_need = sum(FOOD.map(k => need.get(k)));
    const food_short = food_need - sum(FOOD.map(k => stock.get(k)));
    if (food_short > .5) {
      for (const kind of FOOD) {
        deficit.set(kind, food_short);
      }
    }
    for (const kind of NON_FOOD) {
      const short = (need.get(kind) ?? 0) - stock.get(kind);
      if (short > .5) {
        deficit.set(kind, short);
      }
    }
    fresh.set(cid, new Map([
      ['need', need],
      ['made', made],
      ['deficit', deficit],
      ['food_ratio', 1],
      ['material_cover', 1],
      ['metal_cover', 1],
      ['luxury_cover', 1],
      ['worked', worked],
      ['imports', new Map()],
      ['exports', new Map()],
      ['trade_income', 0],
      ['trade_cost', 0],
      ['gdp', 0],
      ['tax', 0],
      ['prices', new Map()],
      ['cover', new Map()]
    ]));
  }
  econ.clear();
  for (const [cid, row] of fresh) {
    econ.set(cid, row);
  }
  for (const cid of sorted(econ.keys())) {
    const e = econ.get(cid);
    const stock = sim.countries.get(cid).stock;
    for (const kind of KINDS) {
      const scarcity = (e.get('need').get(kind) ?? 0) / ((e.get('need').get(kind) ?? 0) + stock.get(kind) * .7 + 1);
      e.get('prices').set(kind, RESOURCE_INFO.get(kind)[4] * (.55 + 1.45 * scarcity));
    }
  }
  trade(sim);
  consume(sim);
  for (const cid of sorted(econ.keys())) {
    const e = econ.get(cid);
    const country = sim.countries.get(cid);
    let base = 0;
    for (const [kind, amount] of e.get('made')) {
      base += amount * RESOURCE_INFO.get(kind)[4];
    }
    e.set('gdp', base + e.get('trade_income'));
    const system = country.economic_system ?? 'mixed';
    const rate = .05 * governments.trait(country, 'tax') * (system === 'communism' ? 1.15 : system === 'capitalism' ? .9 : 1);
    e.set('tax', e.get('gdp') * rate);
    country.treasury = (country.treasury ?? 0) + e.get('tax') - Math.max(0, country.treasury ?? 0) * governments.trait(country, 'corruption');
  }
  for (const [cid, sid, kind, cap] of exhausted_now.slice(0, 3)) {
    const s = sim.settlements.get(sid);
    if (cap >= 100 && s != null) {
      sim.record(`The ${label(kind).toLowerCase()} deposit near ${s.name} is exhausted; ${sim.countries.get(cid).name} cannot work it until it refills.`, 'economy');
    }
  }
  sim.deposit_stats = _deposit_stats(sim);
}

/** People eat, workshops and forges use their share, and the rest spoils. */
export function consume(sim) {
  const econ = _econ(sim);
  for (const cid of sorted(econ.keys())) {
    const e = econ.get(cid);
    const country = sim.countries.get(cid);
    const stock = country.stock;
    const need = e.get('need');
    let eaten = 0;
    const food_need = sum(FOOD.map(k => need.get(k)));
    for (const kind of FOOD) {
      const take = Math.min(stock.get(kind), Math.max(0, need.get(kind)));
      stock.set(kind, stock.get(kind) - take);
      eaten += take;
    }
    if (eaten < food_need) {
      for (const kind of FOOD) {
        const take = Math.min(stock.get(kind), food_need - eaten);
        stock.set(kind, stock.get(kind) - take);
        eaten += take;
      }
    }
    const cover = new Map();
    for (const kind of NON_FOOD) {
      if ((need.get(kind) ?? 0) <= 0) {
        cover.set(kind, 1);
        continue;
      }
      const used = Math.min(stock.get(kind), need.get(kind));
      stock.set(kind, stock.get(kind) - used);
      cover.set(kind, used / need.get(kind));
    }
    const spoil_tech = tech_effects(country.technologies).get('spoil');
    let spoil_cut = 1;
    if ((need.get('salt') ?? 0) > 0 && stock.get('salt') > need.get('salt') * .5) {
      spoil_cut = .5;
    }
    // Drying, salting, canning and refrigeration (spoil_tech) slow the spoilage of food.
    for (const kind of KINDS) {
      const rate = SPOIL.get(kind) * (FOOD.includes(kind) ? spoil_cut * spoil_tech : 1);
      stock.set(kind, Math.max(0, stock.get(kind) * (1 - rate)));
    }
    e.set('food_ratio', food_need <= 0 ? 1 : Math.min(1, eaten / food_need));
    e.set('material_cover', sum(MATERIALS.map(k => cover.get(k))) / 3);
    let metal = 1;
    if (country.technologies.has('ironworking')) {
      metal = (cover.get('iron') * 2 + cover.get('copper') + cover.get('coal')) / 4;
    } else if (country.technologies.has('bronze tools')) {
      metal = cover.get('copper');
    }
    e.set('metal_cover', metal);
    e.set('luxury_cover', (cover.get('gold') + cover.get('furs') + cover.get('salt')) / 3);
    e.set('cover', cover);
  }
}

export function need_share(row, total) {
  const out = new Map();
  for (const kind of row.keys()) {
    out.set(kind, (total.get(kind) ?? 0) > 0 ? row.get(kind) / total.get(kind) : 0);
  }
  return out;
}

export function _deposit_stats(sim) {
  const geo = world(sim);
  let total = 0;
  for (const rows of geo.get('deposits').values()) {
    total += rows.length;
  }
  const locked = [..._state(sim).values()].filter(e => e[1]).length;
  return new Map([['total', total], ['exhausted', locked], ['worked', _state(sim).size]]);
}

/** Peaceful neighbors swap surplus for shortage, paying at the average of their prices. */
export function trade(sim) {
  const econ = _econ(sim);
  const [land, sea] = contacts(sim);
  const flows = [];
  const done = new TupleSet();
  let notable = 0;
  for (const a of sorted(econ.keys())) {
    const partners = new Set(land.get(a));
    if (sim.countries.get(a).technologies.has('sailing')) {
      addAll(partners, sea.get(a) ?? []);
    }
    for (const b of sorted(partners)) {
      const pair = [Math.min(a, b), Math.max(a, b)];
      if (!econ.has(b) || done.has(pair) || sim.wars.has(pair)) {
        continue;
      }
      done.add(pair);
      const [ca, cb] = [sim.countries.get(a), sim.countries.get(b)];
      if (!ca.technologies.has('sailing') && !land.get(a)?.has(b)) {
        continue;
      }
      let left = (12 + 14 * (system_state(sim, a).get('trade') + system_state(sim, b).get('trade'))) * governments.trait(ca, 'trade') * governments.trait(cb, 'trade');
      for (const [seller, buyer] of [[a, b], [b, a]]) {
        const [s_country, b_country] = [sim.countries.get(seller), sim.countries.get(buyer)];
        const [s_econ, b_econ] = [econ.get(seller), econ.get(buyer)];
        for (const kind of KINDS) {
          if (left <= 0) {
            break;
          }
          const spare = s_country.stock.get(kind) - (s_econ.get('need').get(kind) ?? 0) * 1.3;
          const lack = b_econ.get('deficit').get(kind) ?? 0;
          if (spare <= .5 || lack <= .5) {
            continue;
          }
          let qty = Math.min(spare, lack, left);
          const price = (s_econ.get('prices').get(kind) + b_econ.get('prices').get(kind)) / 2;
          const money = Math.max(0, b_country.treasury ?? 0) * .5;
          if (price * qty > money) {
            qty = money / price;
          }
          if (qty <= .5) {
            continue;
          }
          const value = qty * price;
          s_country.stock.set(kind, s_country.stock.get(kind) - qty);
          b_country.stock.set(kind, b_country.stock.get(kind) + qty);
          for (const same of FOOD.includes(kind) ? FOOD : [kind]) {
            b_econ.get('deficit').set(same, Math.max(0, lack - qty));
          }
          s_country.treasury = (s_country.treasury ?? 0) + value;
          b_country.treasury = (b_country.treasury ?? 0) - value;
          s_econ.get('exports').set(kind, (s_econ.get('exports').get(kind) ?? 0) + qty);
          b_econ.get('imports').set(kind, (b_econ.get('imports').get(kind) ?? 0) + qty);
          s_econ.set('trade_income', s_econ.get('trade_income') + value);
          b_econ.set('trade_cost', b_econ.get('trade_cost') + value);
          left -= qty;
          flows.push(new Map([
            ['from', seller],
            ['to', buyer],
            ['kind', kind],
            ['qty', round(qty, 1)],
            ['value', round(value, 1)]
          ]));
          if (value >= 120 && notable < 2 && RESOURCE_INFO.get(kind)[4] >= 1.8) {
            notable += 1;
            sim.record(`Merchants carried ${fixed(qty, 0)} tons of ${label(kind).toLowerCase()} from ${s_country.name} to ${b_country.name}, earning ${fixed(value, 0)} coins.`, 'economy');
          }
        }
      }
    }
  }
  sim.trade_flows = flows.slice(0, 40);
}
// ---------------------------------------------------------------- effects used elsewhere

export function of(sim, cid) {
  return sim.econ != null ? sim.econ.get(cid) : null;
}

export function food_effect(sim, cid) {
  const e = of(sim, cid);
  if (e == null) {
    return 0;
  }
  return -40 * (1 - e.get('food_ratio')) + (e.get('food_ratio') >= 1 ? 3 : 0);
}

export function materials_pace(country) {
  const stock = country.stock;
  if (stock == null) {
    return 1;
  }
  const have = stock.has('timber') ? stock.get('timber') + stock.get('stone') + stock.get('clay') : 0;
  return .35 + .65 * Math.min(1, have / 30);
}

export function use_materials(country, amount) {
  const stock = country.stock;
  if (stock == null) {
    return;
  }
  for (const kind of MATERIALS) {
    if (stock.has(kind)) {
      stock.set(kind, Math.max(0, stock.get(kind) - amount / 3));
    }
  }
}

/** Disasters destroy part of the deposits they strike (mines collapse, fires burn timber). */
export function damage(sim, disaster, cx, cy, radius) {
  const geo = world(sim);
  const hits = new Map([
    ['flood', new Map([['grain', .35], ['clay', .2], ['pasture', .3]])],
    ['storm', new Map([['fish', .35], ['timber', .15]])],
    ['wildfire', new Map([['timber', .5], ['game', .3], ['pasture', .35], ['furs', .3]])],
    ['earthquake', new Map([['stone', .3], ['iron', .3], ['copper', .3], ['coal', .3], ['gold', .2]])],
    ['landslide', new Map([['stone', .3], ['iron', .35], ['copper', .35], ['coal', .35], ['gold', .25]])],
    ['blizzard', new Map([['game', .3], ['furs', .25], ['pasture', .25]])]
  ]).get(disaster);
  const state = _state(sim);
  const r = Math.trunc(radius * .7);
  let lost = 0;
  for (let y = Math.max(0, cy - r), end = Math.min(H, cy + r + 1); y < end; y++) {
    for (let x = Math.max(0, cx - r), end = Math.min(W, cx + r + 1); x < end; x++) {
      const key = y * W + x;
      if (!geo.get('deposits').has(key) || dist(cx, cy, x, y) > r) {
        continue;
      }
      let slot = 0;
      for (const [kind, cap] of geo.get('deposits').get(key)) {
        const share = hits.get(kind) ?? 0;
        if (share > 0) {
          const idx = key * 4 + slot;
          let entry = state.get(idx);
          if (entry == null) {
            entry = [cap, false, 0];
          }
          if (!entry[1]) {
            entry[0] = Math.max(0, entry[0] - cap * share);
            if (entry[0] <= .5) {
              entry[0] = 0;
              entry[1] = true;
            }
            state.set(idx, entry);
            lost += 1;
          }
        }
        slot += 1;
      }
    }
  }
  return lost;
}
// ---------------------------------------------------------------- the public budget

export const ADMIN = new Map([
  ['tribal', .5],
  ['monarchy', 1],
  ['council', .9],
  ['republic', 1],
  ['democracy', 1.2],
  ['theocracy', 1],
  ['junta', .9],
  ['oligarchy', .8],
  ['empire', 1.3],
  ['merchant', .85],
  ['tyranny', 1]
]);

/**
 * Governments pay for administration, standing armies, upkeep of every building, and hunger relief.
 * Debts hurt: stability and prosperity fall, soldiers go unpaid, and buildings fall into ruin.
 */
export function spend(sim) {
  for (const cid of sorted(sim.countries.keys())) {
    const country = sim.countries.get(cid);
    if (country.ended != null) {
      continue;
    }
    const st = system_state(sim, cid);
    const r = st.get('residents');
    const fx = tech_effects(country.technologies);
    const era = ERA_GROUP[era_index(country.technologies)];
    const e = _econ(sim).get(cid);
    const built = building_counts(sim, cid);
    const upkeep = sum([...built].map(([k, n]) => BUILDINGS.get(k)[1] * n)) * .02;
    const admin = r * .6 * (ADMIN.get(country.government) ?? 1) * (1 + .15 * era);
    const army = r * (.06 + .06 * fx.get('weapon')) * (st.get('at_war') ? 2.5 : 1) * governments.trait(country, 'military');
    let relief = 0;
    if (e != null && e.get('food_ratio') < 1) {
      relief = r * .3 * (1 - e.get('food_ratio'));
    }
    const austerity = (country.debt_years ?? 0) > 0 ? .8 : 1;
    const total = (admin + army + upkeep + relief) * austerity;
    country.treasury = (country.treasury ?? 0) - total;
    if (relief > 0) {
      country.food = Math.min(100, country.food + Math.min(5, relief / Math.max(1, r * .1)));
    }
    if (e != null) {
      e.set('budget', new Map([
        ['admin', admin * austerity],
        ['army', army * austerity],
        ['buildings', upkeep * austerity],
        ['relief', relief * austerity],
        ['total', total]
      ]));
    }
    if (country.treasury < 0) {
      country.debt_years = (country.debt_years ?? 0) + 1;
      country.stability = Math.max(0, country.stability - 1.2);
      country.prosperity = Math.max(0, country.prosperity - .5);
      if (country.debt_years === 1 && r >= 200 && (country.debt_notice ?? -99) < sim.year - 10) {
        country.debt_notice = sim.year;
        sim.record(`${country.name} ran out of money; soldiers and officials go unpaid.`, 'political');
      }
      if (country.debt_years >= 3) {
        for (const s of sorted(_inhabited(sim), {key: (x => x.id)})) {
          if (s.country === cid && sim.rng.random() < .04) {
            damage_buildings(sim, s, .25, 'Neglect');
          }
        }
      }
    } else {
      country.debt_years = 0;
      if (country.treasury > 6 * total) {
        const excess = (country.treasury - 6 * total) * .15;
        country.treasury -= excess;
        country.prosperity = Math.min(100, country.prosperity + excess / Math.max(1, r * 20));
        country.stability = Math.min(100, country.stability + .3);
      }
    }
  }
}
// ---------------------------------------------------------------- reports

export function tile_report(sim, x, y) {
  ensure_placed(sim);
  const geo = world(sim);
  if (!(x >= 0 && x < W && y >= 0 && y < H)) {
    return 'That cell is outside the map.';
  }
  const info = cell_features(sim, x, y);
  const owner = claim_owner(sim, x, y, settlement_counts(sim));
  const lines = [
    `Cell ${x},${y}: ${info.get('terrain')}${info.get('river') === '1' ? ', river' : ''}, soil ${fixed(info.get('soil'), 2)}` + (owner ? `, ${sim.countries.get(owner).name} territory` : ', unclaimed')
  ];
  const tags = [...info.get('features')].map(c => FEATURE_NAMES.get(c));
  if (tags.length > 0) {
    lines.push('  features: ' + tags.join(', '));
  }
  if (contested_cells(sim).has(y * W + x)) {
    lines.push('  contested: fought over in an active war (cannot be worked)');
  }
  const rows = tile_deposits(sim, x, y);
  if (rows.length === 0) {
    lines.push('  no deposits');
  }
  for (const row of rows) {
    const status = row.get('locked') ? 'EXHAUSTED, refilling; locked until full' : row.get('amount') >= row.get('cap') ? 'full' : 'partly worked';
    const years = row.get('amount') < row.get('cap') ? Math.trunc((row.get('cap') - row.get('amount')) / (row.get('cap') * row.get('rate')) + .99) : 0;
    lines.push(`  ${label(row.get('kind'))}: ${fixed(row.get('amount'), 0)}/${row.get('cap')} (${status}); refills ${fixed(row.get('rate') * 100, 1)}% of capacity per year` + (years ? `; about ${years} years to full` : ''));
  }
  return lines.join('\n');
}

export function report(sim, query = '') {
  const econ = _econ(sim);
  const stats = sim.deposit_stats ?? _deposit_stats(sim);
  const lines = [
    `Economy, year ${sim.year}: ${stats.get('worked')} deposits worked, ${stats.get('exhausted')} exhausted of ${stats.get('total')} in the world.`
  ];
  for (const cid of sorted(econ.keys())) {
    const country = sim.countries.get(cid);
    if (country.ended != null || query && !country.name.toLowerCase().includes(query)) {
      continue;
    }
    const e = econ.get(cid);
    lines.push(`${country.name} (${governments.info(country.government).get('label')}, ${country.economic_system ?? 'mixed'}): GDP ${fixed(e.get('gdp'), 0)}, tax ${fixed(e.get('tax'), 0)}, treasury ${fixed(country.treasury ?? 0, 0)}; fed ${fixed(e.get('food_ratio') * 100, 0)}%, materials ${fixed(e.get('material_cover') * 100, 0)}%, metal ${fixed(e.get('metal_cover') * 100, 0)}%`);
    const b = e.get('budget');
    if (b) {
      lines.push(`  budget: administration ${fixed(b.get('admin'), 0)}, army ${fixed(b.get('army'), 0)}, buildings ${fixed(b.get('buildings'), 0)}, relief ${fixed(b.get('relief'), 0)} = ${fixed(b.get('total'), 0)} a year`);
    }
    const stock = country.stock;
    lines.push('  stock: ' + KINDS.filter(k => stock.get(k) >= 1).map(k => `${label(k).toLowerCase()} ${fixed(stock.get(k), 0)}`).join(', '));
    if (e.get('imports').size > 0) {
      lines.push('  imports: ' + [...e.get('imports')].map(([k, v]) => `${label(k).toLowerCase()} ${fixed(v, 0)}`).join(', ') + ` (spent ${fixed(e.get('trade_cost'), 0)})`);
    }
    if (e.get('exports').size > 0) {
      lines.push('  exports: ' + [...e.get('exports')].map(([k, v]) => `${label(k).toLowerCase()} ${fixed(v, 0)}`).join(', ') + ` (earned ${fixed(e.get('trade_income'), 0)})`);
    }
    const short = [...e.get('deficit').keys()].map(k => label(k).toLowerCase());
    if (short.length > 0) {
      lines.push('  short of: ' + short.join(', '));
    }
  }
  return lines.join('\n');
}
