// Map pings: a pulsing marker wherever a big event just happened. Click one on the map, or in the tray, to jump to it.
// Display-only: pings read the event log and never feed back into the simulation.
import { classify } from '../news.js';

const BIG = 78;        // classify() score that earns a ping
const KEEP_YEARS = 4;  // pings fade over this many years, then go
const MAX = 12;
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export class Pings {
  constructor() { this.items = []; this.seen = new Set(); this.seed = null; this.year = -1; this.places = null; this.placeCount = -1; }

  // Call with every new snapshot. A new world (or an older save) clears the board; undone events lose their pings.
  update(snap, map) {
    if (snap.geoSeed !== this.seed || snap.year < this.year) { this.items = []; this.seen.clear(); this.seed = snap.geoSeed; }
    this.year = snap.year;
    if (snap.settlements.length !== this.placeCount) this.index(snap);
    const recent = new Set();
    const events = snap.events || [];
    for (let i = events.length - 1; i >= 0 && events[i].year >= snap.year - 1; i--) {
      const e = events[i], key = `${e.year}|${e.message}`;
      recent.add(key);
      if (this.seen.has(key)) continue;
      this.seen.add(key);
      const story = classify(e);
      if (!story || story.score < BIG) continue;
      const spot = this.locate(e, story, snap, map);
      if (spot) this.items.push({ key, year: e.year, ...story, message: e.message, ...spot, fresh: true });
    }
    this.items = this.items
      .filter(p => snap.year - p.year < KEEP_YEARS && (p.year < snap.year - 1 || recent.has(p.key)))
      .sort((a, b) => b.year - a.year || b.score - a.score)
      .slice(0, MAX);
    if (this.seen.size > 4000) this.seen = new Set(recent);
  }

  // Names longest first, matched as whole words, so "New Arden" wins over "Arden".
  index(snap) {
    const word = name => new RegExp(`(^|[^\\p{L}])${escRe(name)}($|[^\\p{L}])`, 'u');
    this.places = snap.settlements.filter(s => s.gx != null).map(s => ({ s, re: word(s.name) })).sort((a, b) => b.s.name.length - a.s.name.length);
    this.lands = snap.countries.map(c => ({ c, re: word(c.name) })).sort((a, b) => b.c.name.length - a.c.name.length);
    this.placeCount = snap.settlements.length;
  }

  locate(e, story, snap, map) {
    const at = (gx, gy) => ({ x: (gx + 0.5) * map.cw, y: (gy + 0.5) * map.ch });
    if (story.tag === 'DISASTER') {
      const d = (snap.disasters || []).filter(d => d.year === e.year && e.message.includes(d.kind)).at(-1);
      const place = this.places.find(p => p.re.test(e.message));
      if (d) return { ...at(d.x, d.y), target: place ? { type: 'settlement', id: place.s.id } : { type: 'cell', id: `${d.x},${d.y}` } };
    }
    const place = this.places.find(p => p.re.test(e.message));
    if (place) return { ...at(place.s.gx, place.s.gy), target: { type: 'settlement', id: place.s.id } };
    // A country's story pins to its capital: the middle of the country is where its big name label sits.
    const land = this.lands.find(l => l.re.test(e.message)); if (!land) return null;
    const capital = snap.settlements.find(s => s.capital && s.country === land.c.id && s.gx != null), centre = map.centroids.find(c => c.id === land.c.id);
    if (capital) return { ...at(capital.gx, capital.gy), target: { type: 'country', id: land.c.id } };
    if (centre) return { x: centre.x, y: centre.y, target: { type: 'country', id: land.c.id } };
    return null;
  }

  find(key) { return this.items.find(p => p.key === key); }
  mark(p) { p.fresh = false; }

  // ---- map layer
  live() { return this.items.length > 0; }
  draw(ctx, now, map) {
    const css = map.css;
    for (const p of this.items) {
      const age = this.year - p.year, fade = Math.max(0.35, 1 - age / KEEP_YEARS), r = 7 / css;
      if (p.fresh) for (const phase of [0, 0.5]) {
        const t = ((now / 1600) + phase) % 1;
        ctx.strokeStyle = rgba(p.color, (1 - t) * 0.85 * fade); ctx.lineWidth = 2.4 / css;
        ctx.beginPath(); ctx.arc(p.x, p.y, r * (1 + t * 2.6), 0, 7); ctx.stroke();
      }
      ctx.fillStyle = rgba(p.color, fade); ctx.strokeStyle = `rgba(255,255,255,${fade})`; ctx.lineWidth = 2 / css;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = `800 ${9 / css}px 'Segoe UI',sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('!', p.x, p.y + 0.5 / css);
    }
  }
  hit(vx, vy, map) {
    const reach = 11 / map.css;
    for (const p of this.items) if (Math.hypot(vx - p.x, vy - p.y) <= reach) return { type: 'ping', id: p.key, x: p.x, y: p.y, r: 9 / map.css, item: p };
    return null;
  }

  // ---- the tray: newest big stories, each one a jump
  tray(esc) {
    if (!this.items.length) return '';
    return `<div class="ping-tray" aria-label="Big events">${this.items.slice(0, 5).map(p => `<button class="ping-chip ${p.fresh ? 'fresh' : ''}" data-ping="${esc(p.key)}" style="--c:${p.color}" title="${esc(p.message)}"><i></i><span><b>${esc(p.headline)}</b><small>${esc(p.tag)} · year ${p.year}</small></span></button>`).join('')}</div>`;
  }
}

function rgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}
