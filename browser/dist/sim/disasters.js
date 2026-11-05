/**
 * Natural disasters whose kind, place, reach and damage come from geography.
 *
 * Rivers and low coasts flood, open coasts take storms, forests and deserts burn, highlands
 * shake and slide, cold peaks bring blizzards. A disaster has an epicenter and a radius, so it
 * can strike several settlements, even across a border. Protective buildings reduce the harm,
 * buildings can be destroyed, and badly hit towns send refugees away.
 */

import {minOf, setdefault, sorted, sum} from './runtime.js';
import {effects as tech_effects} from './technology.js';
import {H, W, hazards_at, ensure_placed, dist, _inhabited} from './geography.js';
import {damage_buildings, launch_migration, _list} from './development.js';
import {damage as damage_deposits} from './economy.js';

export const KINDS = ['flood', 'storm', 'wildfire', 'earthquake', 'landslide', 'blizzard'];
export const SEVERITY_RATE = new Map([['minor', [.0, .01]], ['major', [.01, .05]], ['severe', [.05, .15]]]);
export const RADIUS = new Map([['minor', 5], ['major', 10], ['severe', 16]]);
export const DAMAGE = new Map([['minor', 3], ['major', 8], ['severe', 18]]);
export const BUILDING_LOSS = new Map([['minor', .04], ['major', .12], ['severe', .28]]);
export const PROTECTION = new Map([
  ['flood', 'levee'],
  ['storm', 'levee'],
  ['wildfire', 'firebreak'],
  ['earthquake', 'foundations'],
  ['landslide', 'foundations'],
  ['blizzard', 'granary']
]);

/** Apply a disaster centered on a cell. Returns a summary used for reports and the map. */
export function strike(sim, kind, severity, cx, cy) {
  ensure_placed(sim);
  const rate = sim.rng.uniform(...SEVERITY_RATE.get(severity));
  const radius = RADIUS.get(severity);
  const by_place = new Map();
  for (const person of sim.people.values()) {
    setdefault(by_place, person.settlement, []).push(person);
  }
  const protection = PROTECTION.get(kind);
  const affected = [];
  let deaths = 0;
  let lost_buildings = 0;
  const share = new Map();
  // building codes, levees, insurance
  for (const s of sorted(_inhabited(sim), {key: x => x.id})) {
    const d = dist(s.gx, s.gy, cx, cy);
    if (d > radius) continue;
    const risk = hazards_at(sim, s.gx, s.gy).get(kind);
    const intensity = (1 - d / (radius + 1) * .7) * Math.min(1.6, .5 + risk * .45);
    const shield = s.buildings?.has(protection) ? .5 : 0;
    const residents = by_place.get(s.id) ?? [];
    const resilience = tech_effects(sim.countries.get(s.country).technologies).get('haz');
    const victims = residents.filter(() => sim.rng.random() < rate * intensity * (1 - shield) * resilience);
    for (const person of victims) {
      person.died = sim.year;
      person.cause_of_death = 'natural disaster';
      sim.lineages.get(person.lineage).deaths += 1;
      sim.people.delete(person.id);
    }
    deaths += victims.length;
    const lost = damage_buildings(sim, s, BUILDING_LOSS.get(severity) * intensity * (1 - shield) * resilience, `The ${kind}`);
    lost_buildings += lost.length;
    affected.push({settlement: s.id, deaths: victims.length, population: residents.length});
    const row = setdefault(share, s.country, [0, 0]);
    row[0] += residents.length;
    row[1] += victims.length;
  }
  for (const cid of sorted(share.keys())) {
    const country = sim.countries.get(cid);
    const [population, dead] = share.get(cid);
    const living = [...sim.people.values()].filter(p => p.country === cid).length;
    const fraction = Math.min(1, population / Math.max(1, living + dead));
    country.food = Math.max(0, country.food - DAMAGE.get(severity) * fraction);
    country.prosperity = Math.max(0, country.prosperity - DAMAGE.get(severity) * fraction);
    country.last_disaster_year = sim.year;
    country.last_disaster_type = kind;
  }
  const damaged = damage_deposits(sim, kind, cx, cy, radius);
  const log = _list(sim, 'disaster_log');
  log.push(new Map([
    ['year', sim.year],
    ['kind', kind],
    ['severity', severity],
    ['x', cx],
    ['y', cy],
    ['radius', radius],
    ['deaths', deaths],
    ['settlements', affected.map(a => a.settlement)],
    ['deposits', damaged]
  ]));
  while (log.length > 25) log.shift();
  // Survivors of a devastated town may leave for a safer one.
  for (const a of affected) {
    const s = sim.settlements.get(a.settlement);
    const left = a.population - a.deaths;
    if (a.population > 0 && a.deaths / a.population >= .12 && left >= 30) {
      const safer = _inhabited(sim).filter(t => t.country === s.country && t.id !== s.id && !affected.some(x => x.settlement === t.id));
      if (safer.length > 0) {
        const target = minOf(safer, {key: t => dist(t.gx, t.gy, s.gx, s.gy)});
        const movers = [...sim.people.values()].filter(p => p.settlement === s.id && p.age >= 18).slice(0, Math.max(5, Math.floor(left / 5)));
        launch_migration(sim, s, target, movers, 'refugee');
      }
    }
  }
  return {deaths, affected, buildings: lost_buildings, radius};
}

export function describe(sim, kind, severity, summary, country) {
  const names = summary.affected.map(a => sim.settlements.get(a.settlement).name);
  const where = names.slice(0, 3).join(', ') + (names.length > 3 ? ` and ${names.length - 3} more` : '');
  const survivors = sum(summary.affected.map(a => a.population - a.deaths));
  let text = `A ${severity} ${kind} struck ${country.name}: ${summary.deaths} deaths, ${survivors} survivors`;
  if (where) text += ` (affecting ${where})`;
  if (summary.buildings) text += `; ${summary.buildings} buildings lost`;
  return text + '.';
}

/** At most one disaster per inhabited country per year, placed by geographic risk. */
export function resolve(sim) {
  ensure_placed(sim);
  const groups = new Map();
  for (const person of sim.people.values()) {
    setdefault(groups, person.country, []).push(person);
  }
  let deaths = 0;
  for (const cid of [...groups.keys()]) {
    if (sim.rng.random() >= sim.disaster_chance) continue;
    const country = sim.countries.get(cid);
    const places = _inhabited(sim).filter(s => s.country === cid);
    if (places.length === 0) continue;
    const drought = country.conditions.has('Drought');
    const pairs = [];
    const weights = [];
    for (const place of places) {
      const risk = hazards_at(sim, place.gx, place.gy);
      for (const kind of KINDS) {
        pairs.push([place, kind]);
        weights.push(risk.get(kind) * (kind === 'wildfire' && drought ? 1.8 : 1));
      }
    }
    const [s, kind] = sim.rng.choices(pairs, weights, 1)[0];
    const severity = sim.rng.choice(['minor', 'minor', 'minor', 'major', 'major', 'severe']);
    const cx = Math.max(0, Math.min(W - 1, s.gx + sim.rng.randint(-2, 2)));
    const cy = Math.max(0, Math.min(H - 1, s.gy + sim.rng.randint(-2, 2)));
    const summary = strike(sim, kind, severity, cx, cy);
    deaths += summary.deaths;
    sim.record(describe(sim, kind, severity, summary, country), 'disaster');
  }
  return deaths;
}
