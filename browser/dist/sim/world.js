// The world's own layer: the press, its culture, and its businesses. It sits beside the simulation (like the life layer), reads it,
// never draws from its random stream, and is saved as one more field of the save file.
import {CHANNELS, pressYear, cultureYear} from './world_media.js';
import {firmsYear, seedFirms, summary, SECTORS, postYear} from './world_firms.js';

const MAX_STORIES = 320;

export class World {
  constructor() {
    this.stories = []; this.nextStory = 1; this.seen = 0; this.year = null; this.seeded = false;
    this.firms = new Map(); this.nextFirm = 1; this.stakes = new Map(); this.posts = new Map(); this.index = []; this.went = new Set();
    this.movements = []; this.nextMove = 1; this.works = []; this.nextWork = 1; this.prizes = []; this.cup = {titles: {}, last: null}; this.census = [];
  }

  /** Print a story. Newest first. */
  say(year, ch, kind, head, sub, o = {}) {
    if (this.stories.some(s => s.year === year && s.head === head)) return null;
    const s = {id: this.nextStory++, year, ch, kind, head, sub: sub ?? '', score: o.score ?? 50, town: o.town ?? null, act: o.act ?? null, firm: o.firm ?? null, who: o.who ?? null, text: o.text ?? ''};
    this.stories.unshift(s); if (this.stories.length > MAX_STORIES) this.stories.length = MAX_STORIES;
    return s;
  }

  /** Towns with their living populations (the one thing every part of the layer needs). */
  towns(sim) {
    const pop = new Map(); for (const p of sim.people.values()) pop.set(p.settlement, (pop.get(p.settlement) ?? 0) + 1);
    const out = new Map(); for (const s of sim.settlements.values()) if (s.abandoned == null && pop.get(s.id)) out.set(s.id, {s, pop: pop.get(s.id)});
    return out;
  }

  /** Make sure the world has its starting firms. Idempotent, so it is safe to ask from anywhere. */
  ensure(sim, life) {
    if (this.seeded) return; this.seeded = true;
    if (!this.firms.size) seedFirms(this, sim, life, this.towns(sim));
    this.seen = (sim.history ?? []).length; // a world already underway does not get its whole past reported at once
  }

  /** A year has just been simulated. Returns the lines the person being played should read. */
  tick(sim, life, render) {
    if (this.year === sim.year) return [];
    this.ensure(sim, life); this.year = sim.year;
    const towns = this.towns(sim), pl = life.player, mine = pl && sim.people.get(pl.id) ? {id: pl.id} : null;
    pressYear(this, sim, {render});
    cultureYear(this, sim, life, towns);
    const lines = firmsYear(this, sim, life, towns, mine);
    if (mine) lines.push(...postYear(this, sim, life, sim.people.get(pl.id), pl.stats));
    return lines;
  }

  /** Move what a dead person held to the heir (a firm they owned, shares, a post stays behind). */
  inherit(fromId, toId, kin) {
    for (const f of this.firms.values()) if (f.alive && f.owner === fromId) { if (kin) { f.owner = toId; f.founder = toId; f.hist.unshift([this.year ?? 0, 'Inherited by the next generation.']); } else { f.owner = null; } }
    for (const [k, n] of [...this.stakes]) if (k.startsWith(`${fromId}:`)) { this.stakes.delete(k); if (kin) this.stakes.set(`${toId}:${k.split(':')[1]}`, n); }
    this.posts.delete(fromId);
  }

  /** What the screens show. */
  view(sim, life) {
    this.ensure(sim, life);
    const firms = [...this.firms.values()].sort((a, b) => b.cap - a.cap), live = firms.filter(f => f.alive);
    const sectors = Object.entries(SECTORS).map(([id, s]) => { const fs = live.filter(f => f.sector === id); return {id, label: s.label, count: fs.length, worth: Math.round(fs.reduce((a, f) => a + f.cap, 0))}; }).filter(s => s.count);
    const lastIdx = this.index.at(-1)?.[1] ?? 100;
    return {
      channels: Object.entries(CHANNELS).map(([id, c]) => ({id, ...c})),
      stories: this.stories.slice(0, 160),
      firms: [...live, ...firms.filter(f => !f.alive).sort((a, b) => b.ended - a.ended).slice(0, 14)].map(summary),
      sectors, index: this.index.slice(-60), level: lastIdx, total: Math.round(live.reduce((a, f) => a + f.cap, 0)), staff: live.reduce((a, f) => a + f.staff, 0),
      movements: this.movements.slice(-12).map(m => ({...m})), works: this.works.slice(0, 10), prizes: this.prizes.slice(-6),
      cup: {...this.cup, titles: Object.entries(this.cup.titles).map(([id, n]) => ({id: Number(id), name: sim.settlements.get(Number(id))?.name ?? '', n})).sort((a, b) => b.n - a.n).slice(0, 6)}
    };
  }

  toJSON() {
    return {v: 1, stories: this.stories, nextStory: this.nextStory, seen: this.seen, year: this.year, seeded: this.seeded, firms: [...this.firms.values()], nextFirm: this.nextFirm,
      stakes: [...this.stakes], posts: [...this.posts], index: this.index, went: [...this.went], movements: this.movements, nextMove: this.nextMove, works: this.works, nextWork: this.nextWork, prizes: this.prizes, cup: this.cup, census: this.census, mood: this.mood ?? null};
  }
  static fromJSON(d) {
    const w = new World(); if (!d || d.v !== 1) return w;
    const arr = x => Array.isArray(x) ? x : [];
    w.stories = arr(d.stories).slice(0, MAX_STORIES); w.nextStory = d.nextStory | 0 || 1; w.seen = d.seen | 0; w.year = d.year ?? null; w.seeded = !!d.seeded;
    for (const f of arr(d.firms)) if (f && Number.isInteger(f.id)) w.firms.set(f.id, f); w.nextFirm = d.nextFirm | 0 || 1;
    for (const [k, n] of arr(d.stakes)) w.stakes.set(k, n); for (const [k, p] of arr(d.posts)) w.posts.set(k, p);
    w.index = arr(d.index); for (const x of arr(d.went)) w.went.add(x);
    w.movements = arr(d.movements); w.nextMove = d.nextMove | 0 || 1; w.works = arr(d.works); w.nextWork = d.nextWork | 0 || 1; w.prizes = arr(d.prizes);
    w.cup = d.cup && typeof d.cup === 'object' ? {titles: d.cup.titles ?? {}, last: d.cup.last ?? null} : w.cup; w.census = arr(d.census); w.mood = d.mood ?? null;
    return w;
  }
}

/** The world layer that goes with a life layer (made on first use). */
export const worldOf = life => (life.world ??= new World());
