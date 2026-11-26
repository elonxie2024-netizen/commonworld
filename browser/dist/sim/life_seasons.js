// What people do each season. Four rounds a year, after the year's own simulation has run, for every adult:
// work, try a trading venture, study, look for a better town, change trade, or get called to office.
// Every decision is a hash of (world seed, year, season, person, purpose), so it draws nothing from the simulation's
// random stream and is the same on every machine and after a save and load.
// Results go through life.apply(): into a private overlay while "people shape the world" is off, into the real
// simulation when it is on.
import {OFFICES} from './civic.js';

/** Where a trade can lead next. Only jobs that already exist in the simulation. */
export const LADDER = {
  laborer: ['artisan', 'merchant', 'soldier'], farmer: ['laborer', 'artisan'], artisan: ['merchant', 'performer'], merchant: ['politician'],
  teacher: ['scholar', 'scientist'], scholar: ['scientist', 'teacher'], healer: ['scientist'], performer: ['artisan'], soldier: ['politician', 'laborer']
};
const TRADERS = new Map([['merchant', 0.22], ['artisan', 0.07], ['laborer', 0.05]]);
const STUDENTS = new Map([['scientist', 0.35], ['scholar', 0.35], ['teacher', 0.15], ['healer', 0.15]]);
const HARD_TIMES = ['Famine', 'Drought', 'Disease', 'Panic'];
export const SEASON_NAMES = ['Spring', 'Summer', 'Autumn', 'Winter'];

/** A repeatable pseudo-random number in [0, 1) from any list of whole numbers. */
export function unit(...n) {
  let h = 2166136261 ^ n.length;
  for (const x of n) { h = Math.imul(h ^ (x | 0), 16777619); h ^= h >>> 15; h = Math.imul(h, 2246822519); h ^= h >>> 13; }
  return (h >>> 0) / 4294967296;
}

/** The decision numbers for one person in one season: u(1), u(2)... */
export const dice = (sim, season, id) => k => unit(sim.geo_seed ?? 0, sim.year, season, id, k);

// ---- the things a person can do; the same effects serve the world's people and the person you play
/** A trading venture: {dw, venture}. */
export function ventureOf(v, c, u) {
  const base = Math.min(400, 2 + 0.05 * v.wealth), win = u(3) < 0.5 + (v.job === 'merchant' ? 0.1 : 0) + (c ? c.prosperity / 400 : 0);
  const dw = win ? base * (1 + u(4)) : -Math.min(v.wealth * 0.5, base * 0.8 * u(4));
  return {dw, venture: win && dw >= 15 ? Math.round(dw) : 0};
}
/** A season of study: {df, insight}. */
export function studyOf(v, u) {
  const insight = u(5) < (v.job === 'scientist' || v.job === 'scholar' ? 0.02 : 0.005);
  return {df: 0.2 + u(6) * 0.6 + (insight ? 4 : 0), insight};
}
/** How much better known than an office holder somebody must be to take the office from them. */
export const DISPLACES = 8;

/** One season for everybody (except `skip`, a person somebody is playing by hand). */
export function runSeason(sim, life, season, skip = null) {
  const year = sim.year, warring = new Set();
  for (const [pair] of sim.wars) for (const id of pair) warring.add(id);
  const pop = new Map(), adults = new Map(), towns = new Map(), best = new Map();
  for (const p of sim.people.values()) pop.set(p.settlement, (pop.get(p.settlement) ?? 0) + 1);
  for (const s of sim.settlements.values()) {
    const n = pop.get(s.id) ?? 0;
    if (s.abandoned == null && n > 0) { if (!towns.has(s.country)) towns.set(s.country, []); towns.get(s.country).push([s.id, n]); }
  }
  for (const p of sim.people.values()) {
    if (p.age < 18) continue;
    const v = life.view(sim, p), c = sim.countries.get(v.country), u = dice(sim, season, p.id);
    adults.set(v.country, (adults.get(v.country) ?? 0) + 1);
    if (p.id === skip) continue;
    const hard = !!c && (c.sickness || HARD_TIMES.some(t => c.conditions.has(t))), war = warring.has(v.country);
    const pMove = ((hard ? 0.05 : 0.012) + (war ? 0.03 : 0)) * (v.wealth > 300 ? 0.5 : 1);
    const pTrade = (TRADERS.get(v.job) ?? 0.02) + (v.wealth > 100 ? 0.03 : 0), pStudy = STUDENTS.get(v.job) ?? 0, pRetrain = LADDER[v.job] ? 0.012 : 0;
    const r = u(1);
    if (r < pMove) {
      const options = (towns.get(v.country) ?? []).filter(([id]) => id !== v.settlement);
      let roll = u(2) * options.reduce((a, [, n]) => a + Math.sqrt(n), 0); // bigger towns draw more people, but not all of them
      for (const [id, n] of options) { roll -= Math.sqrt(n); if (roll <= 0) { life.apply(sim, p, {place: id}); break; } }
    } else if (r < pMove + pTrade) {
      life.apply(sim, p, ventureOf(v, c, u));
    } else if (r < pMove + pTrade + pStudy) {
      life.apply(sim, p, studyOf(v, u));
    } else if (r < pMove + pTrade + pStudy + pRetrain) {
      const next = LADDER[v.job]; life.apply(sim, p, {job: next[Math.floor(u(7) * next.length)]});
    }
    // Anyone without a public role is a candidate for the office that suits their trade.
    if (!v.role && OFFICES.some(([, job]) => job === v.job)) {
      const key = `${v.country}:${v.job}`, cur = best.get(key);
      if (!cur || v.fame > cur.fame || (v.fame === cur.fame && p.age > cur.p.age)) best.set(key, {p, fame: v.fame});
    }
  }
  // A better-known candidate can take an office from its holder.
  for (const [cid, c] of sim.countries) {
    if ((adults.get(cid) ?? 0) < 30) continue;
    for (const [title, job] of OFFICES) {
      const cand = best.get(`${cid}:${job}`), holder = sim.people.get(c.offices.get(title));
      if (cand && holder && cand.fame > life.view(sim, holder).fame + DISPLACES) life.apply(sim, cand.p, {role: title});
    }
  }
  // Soldiers who came through this year's fighting are better known for it.
  if (season === 3) {
    for (const [id, list] of life.tags) {
      const last = list.findLast(t => t[1] === 'fought'), p = sim.people.get(id);
      if (p && last && last[3] === year && id !== skip) life.apply(sim, p, {df: 2});
    }
  }
}

/** All four seasons of the year just simulated. */
export function runSeasons(sim, life) {
  for (let season = 0; season < 4; season++) runSeason(sim, life, season);
}
