// People's lives, kept small. Nobody gets a precomputed biography: when a big thing actually happens to a person
// (surviving a plague, being wounded, moving, promotion, founding a town) they pick up one short milestone tag.
// A story is stitched together from those tags plus the archive only when somebody asks for it.
//
// This layer lives beside the simulation, never inside it: it reads the world before and after each year and draws no
// random numbers, so the world plays out exactly as it did without it. Saves carry it as an extra field.
//
// A tag is [year, code, a, b]. Codes and their arguments:
//   moved [settlementId]           allegiance [countryId, settlementId]   annexed [countryId, settlementId]   promoted [role, countryId]   lost [role, countryId]
//   job [job]                      rich [tier 1|2]                         founded [settlementId]       survived [disease]
//   wounded [countryId]            fought [countryId, lastYear]            event [category, text]

export const MAX_TAGS = 24;
const WEIGHT = {founded: 9, promoted: 8, survived: 7, rich: 6, event: 5, allegiance: 4, wounded: 4, annexed: 3, lost: 3, fought: 3, moved: 2, job: 2};

/** Wealth cut-offs for "among the richest tenth" and "top one percent". */
function thresholds(people) {
  const w = [];
  for (const p of people.values()) if ((p.wealth ?? 0) > 0) w.push(p.wealth);
  if (w.length < 50) return {p90: Infinity, p99: Infinity};
  w.sort((a, b) => a - b);
  return {p90: w[Math.floor(w.length * 0.9)], p99: w[Math.floor(w.length * 0.99)]};
}
const tierOf = (wealth, t) => ((wealth ?? 0) >= t.p99 ? 2 : (wealth ?? 0) >= t.p90 ? 1 : 0);

export class Life {
  constructor() { this.tags = new Map(); }

  // ---- recording
  add(id, year, code, a = null, b = null) {
    let list = this.tags.get(id); if (!list) this.tags.set(id, list = []);
    const last = list.at(-1);
    if (code === 'fought' && last && last[1] === 'fought' && last[2] === a && last[3] >= year - 1) { last[3] = year; return; } // one stint, not one tag per war year
    if (code === 'rich' && list.some(t => t[1] === 'rich' && t[2] >= a)) return; // only a new height is a milestone
    if (code === 'event' && list.some(t => t[0] === year && t[1] === 'event' && t[3] === b)) return;
    list.push([year, code, a, b]);
    if (list.length > MAX_TAGS) { // forget the least notable, oldest first
      let drop = 0;
      for (let i = 1; i < list.length; i++) if (WEIGHT[list[i][1]] < WEIGHT[list[drop][1]]) drop = i;
      list.splice(drop, 1);
    }
  }

  /** A cheap picture of the world to compare against after the year has run. */
  capture(sim) {
    const t = thresholds(sim.people), people = new Map();
    for (const p of sim.people.values()) people.set(p.id, [p.settlement, p.country, p.public_role || '', p.job, p.infection, p.wounded_until ?? 0, tierOf(p.wealth, t)]);
    return {people, settlements: new Set(sim.settlements.keys()), history: sim.history.length};
  }

  /** Soldiers called up this year (fed by the hook in warfare.js). */
  onLevy(sim, country, army) { for (const p of army) this.add(p.id, sim.year, 'fought', country.id, sim.year); }

  /** Compare the world with the picture taken before the year and tag whoever something happened to. */
  observe(sim, before) {
    const y = sim.year, t = thresholds(sim.people);
    for (const p of sim.people.values()) {
      const b = before.people.get(p.id); if (!b) continue; // born or arrived this year
      const [place, country, role, job, ill, wound, tier] = b;
      if (p.country !== country) this.add(p.id, y, p.settlement === place ? 'annexed' : 'allegiance', p.country, p.settlement); // annexed: their town changed hands, they did not move
      else if (p.settlement !== place) this.add(p.id, y, 'moved', p.settlement);
      const now = p.public_role || '';
      if (now !== role) {
        if (now && now !== 'royal family') this.add(p.id, y, 'promoted', now, p.country);
        else if (role && role !== 'royal family') this.add(p.id, y, 'lost', role, country);
      }
      if (p.job !== job && p.job !== 'child') this.add(p.id, y, 'job', p.job);
      if (ill && !p.infection) this.add(p.id, y, 'survived', ill);
      if ((p.wounded_until ?? 0) > wound && p.wounded_until > y) this.add(p.id, y, 'wounded', p.country);
      const now_tier = tierOf(p.wealth, t);
      if (now_tier > tier) this.add(p.id, y, 'rich', now_tier);
    }
    for (const [id, s] of sim.settlements) if (!before.settlements.has(id) && sim.archive.has(s.founder)) this.add(s.founder, y, 'founded', id);
    // Named in the year's record of discoveries, creative work, disasters, sickness, war and new family lines.
    for (let i = before.history; i < sim.history.length; i++) {
      const cat = sim.history_categories[i], text = sim.history[i][1];
      if (!EVENT_CATEGORIES.has(cat) || text.length > 240) continue;
      for (const m of text.matchAll(/\{person:(\d+):\d+:\d+\}/g)) { const id = Number(m[1]); if (sim.people.has(id)) this.add(id, y, 'event', cat, text); }
    }
  }

  // ---- telling the story (only when asked)
  /** { summary, lines: [{year, text}] } or null for an unknown person. */
  story(sim, id) {
    const p = sim.archive.get(id); if (!p) return null;
    const place = sid => sim.settlements.get(sid)?.name ?? 'somewhere', land = cid => sim.countries.get(cid)?.name ?? 'a country';
    const name = pid => { const q = sim.archive.get(pid); return q ? sim.full_name(q) : 'someone'; };
    const lines = [];
    const parents = (p.parents ?? []).map(name);
    lines.push({year: p.born, text: `Born${parents.length ? ` to ${parents.join(' and ')}` : ''}.`});
    for (const [year, code, a, b] of this.tags.get(id) ?? []) {
      const text = {
        moved: () => `Moved to ${place(a)}.`,
        allegiance: () => `Moved to ${place(b)} and became a citizen of ${land(a)}.`,
        annexed: () => `Saw ${place(b)} pass to ${land(a)}.`,
        promoted: () => `Became ${a} of ${land(b)}.`,
        lost: () => `Left the office of ${a}.`,
        job: () => `Took up work as a ${a}.`,
        rich: () => (a >= 2 ? 'Became one of the richest people in the world.' : 'Grew wealthy, among the richest tenth.'),
        founded: () => `Founded ${place(a)}.`,
        survived: () => `Survived ${a}.`,
        wounded: () => `Was wounded fighting for ${land(a)}.`,
        fought: () => (b > year ? `Served in the army of ${land(a)} until year ${b}.` : `Served in the army of ${land(a)}.`),
        event: () => sim.render_history(b)
      }[code]?.();
      if (text) lines.push({year, text});
    }
    if (p.died != null) lines.push({year: p.died, text: `Died aged ${p.age}${p.cause_of_death ? ` of ${p.cause_of_death}` : ''}.`});
    lines.sort((x, y) => x.year - y.year);
    return {summary: this.summary(sim, p), lines};
  }

  /** One line: who they are now and the two or three things that defined them. */
  summary(sim, p) {
    const alive = sim.people.has(p.id), land = sim.countries.get(p.country)?.name ?? 'nowhere';
    const marks = (this.tags.get(p.id) ?? []).slice().sort((a, b) => WEIGHT[b[1]] - WEIGHT[a[1]]).slice(0, 3).map(([, code, a]) => ({
      founded: 'founded a town', promoted: `rose to ${a}`, survived: `survived ${a}`, rich: a >= 2 ? 'among the richest' : 'wealthy', event: 'noted in the records',
      allegiance: 'emigrated', annexed: 'lived through a change of rulers', wounded: 'wounded in war', lost: 'left office', fought: 'a soldier', moved: 'moved house', job: 'changed trade'
    }[code]));
    const who = `${alive ? p.age : `died at ${p.age}`}, ${p.public_role || p.job || 'resident'} of ${land}`;
    return marks.length ? `${who}; ${[...new Set(marks)].join(', ')}.` : `${who}.`;
  }

  // ---- saving
  toJSON() { return {v: 1, tags: [...this.tags]}; }
  static fromJSON(data) {
    const life = new Life();
    if (data && data.v === 1 && Array.isArray(data.tags)) for (const [id, list] of data.tags) if (Array.isArray(list)) life.tags.set(Number(id), list.slice(-MAX_TAGS));
    return life;
  }
}

const EVENT_CATEGORIES = new Set(['discovery', 'creative', 'disaster', 'sickness', 'war', 'lineage']);
