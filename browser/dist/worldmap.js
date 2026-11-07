import { JOB_COLORS, rgba, rnd } from './util.js';
import { drawBuilding, drawHall, drawHouse, drawArmy, drawShip, drawCart, pennant, groundColor, HALLS, SPRITE_KINDS } from './sprites.js';

const W = 1000, H = 600;
export const MODES = [['country', 'Country'], ['age', 'Age'], ['wealth', 'Wealth'], ['health', 'Health'], ['job', 'Occupation']];
const AGE_BINS = [['Under 18', '#38bdf8'], ['18–34', '#34d399'], ['35–49', '#fbbf24'], ['50–64', '#fb923c'], ['65+', '#f43f5e']];
const WEALTH_BINS = [['Lowest 20%', '#64748b'], ['20–40%', '#6366f1'], ['40–60%', '#a855f7'], ['60–80%', '#ec4899'], ['Top 20%', '#facc15']];
export const TERRAIN = {
  o: { name: 'Ocean', color: '#1c4f8c' }, l: { name: 'Lake', color: '#2f7fc4' }, p: { name: 'Plains', color: '#9bcb7c' },
  f: { name: 'Forest', color: '#4f9a5d' }, h: { name: 'Hills', color: '#bfae72' }, m: { name: 'Mountains', color: '#a3a9bd' },
  d: { name: 'Desert', color: '#e7cf90' }, s: { name: 'Swamp', color: '#68967a' }, t: { name: 'Tundra', color: '#d9e2ea' }
};
export const RESOURCES = {
  grain: { name: 'Grain', color: '#eab308' }, pasture: { name: 'Pasture', color: '#a3e635' }, fish: { name: 'Fish', color: '#22d3ee' }, game: { name: 'Game', color: '#fb7185' },
  timber: { name: 'Timber', color: '#a8561f' }, stone: { name: 'Stone', color: '#94a3b8' }, clay: { name: 'Clay', color: '#c2703d' }, iron: { name: 'Iron ore', color: '#64748b' },
  copper: { name: 'Copper', color: '#f97316' }, coal: { name: 'Coal', color: '#1f2937' }, gold: { name: 'Gold', color: '#facc15' }, salt: { name: 'Salt', color: '#e5e7eb' }, furs: { name: 'Furs', color: '#a78bfa' }
};
export const FEATURES = { f: 'floodplain', d: 'river delta', b: 'natural harbor', o: 'oasis', s: 'spring', p: 'mountain pass' };
export const BUILD_STYLE = {
  well: ['W', '#38bdf8'], granary: ['G', '#f59e0b'], market: ['M', '#f97316'], school: ['S', '#8b5cf6'], library: ['L', '#6366f1'],
  university: ['U', '#4f46e5'], observatory: ['O', '#0ea5e9'], clinic: ['C', '#10b981'], hospital: ['H', '#059669'], aqueduct: ['A', '#06b6d4'],
  walls: ['▣', '#78716c'], harbor: ['P', '#0369a1'], levee: ['V', '#2563eb'], firebreak: ['F', '#ef4444'], foundations: ['R', '#a16207'],
  monument: ['★', '#ca8a04'], theater: ['T', '#d946ef'], mine: ['N', '#64748b'], mill: ['I', '#84cc16'],
  forge: ['⚒', '#ea580c'], bank: ['$', '#16a34a'], barracks: ['⚔', '#b91c1c'], factory: ['⚙', '#475569'], station: ['⇄', '#0f766e'],
  palace: ['♛', '#d4a017'], grand_academy: ['Ω', '#7c3aed'], lighthouse: ['☼', '#0ea5e9'], fortress: ['⛫', '#57534e']
};
export const WONDERS = ['palace', 'grand_academy', 'lighthouse', 'fortress'];
const LANDMARKS = ['palace', 'grand_academy', 'fortress', 'lighthouse', 'university', 'hospital', 'observatory', 'monument', 'harbor', 'library', 'theater', 'mine'];
export const HAZARD_STYLE = { flood: '#3b82f6', storm: '#94a3b8', wildfire: '#f97316', earthquake: '#a16207', landslide: '#d6a86a', blizzard: '#e2e8f0' };
const hasWater = k => k === 'o' || k === 'l';
const RESOURCE_VALUE = { gold: 9, iron: 5, copper: 5, coal: 4, salt: 4, furs: 4, stone: 3, timber: 3, clay: 2, grain: 3, pasture: 3, fish: 3, game: 2 };

// Canvas renderer with two views. "Settlements": every living person is a dot in a cluster per
// settlement (positions illustrative). "Geography": real map cells with terrain, rivers, roads,
// borders, buildings, construction, settler parties on the road, and disasters as they happen.
// A small gold bulb: this mover carries know-how across a border.
function bulb(ctx, x, y) {
  ctx.fillStyle = '#fde047'; ctx.strokeStyle = '#a16207'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, 3.6, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#a16207'; ctx.fillRect(x - 1.6, y + 3.4, 3.2, 1.6);
}

export class WorldMap {
  constructor(host, { countryColor, onPick, onHover }) {
    this.host = host;
    this.countryColor = countryColor;
    this.onPick = onPick;
    this.onHover = onHover;
    this.base = document.createElement('canvas');
    this.over = document.createElement('canvas');
    host.append(this.base, this.over);
    this.mode = 'country';
    this.zoom = 1; this.panX = 0; this.panY = 0; this.drag = null; this.moved = false;
    this.showPeople = true;
    this.pos = new Map(); this.anchors = new Map();
    this.sites = []; this.dots = [];
    this.legendCluster = [];
    this.view = 'geo';
    this.geoOpts = { terrain: true, rivers: true, borders: true, roads: true, resources: false, buildings: true, names: true, contested: true, settlers: true, armies: true, merchants: true, projects: true, outbreaks: true, disasters: true, labels: true };
    this.contested = new Set();
    this.deposits = new Map(); this.features = new Map();
    this.hazardKind = ''; this.hazardData = null;
    this.siteCells = new Set(); this.geoSites = []; this.owner = []; this.geoLegend = []; this.centroids = [];
    this.cw = 12.5; this.ch = 12.5;
    this.expAnim = new Map(); this.tileMs = 0; this.animMs = 0; this.lastIndex = new Map(); this.loop = 0; this.lastFrame = 0;
    this.terrainCanvas = null; this.terrainKey = '';
    this.hover = null;
    this.dotR = 1.5;
    this.snap = null;
    new ResizeObserver(() => this.redraw()).observe(host);
    host.addEventListener('pointermove', e => this.pointer(e));
    host.addEventListener('pointerleave', () => this.setHover(null));
    host.addEventListener('click', e => {
      if (this.moved) { this.moved = false; return; }
      const hit = this.find(e); if (hit?.type === 'building') this.onPick?.('settlement', hit.sid); else if (hit && ['person', 'settlement', 'cell'].includes(hit.type)) this.onPick?.(hit.type, hit.id);
    });
    host.addEventListener('wheel', e => { e.preventDefault(); this.zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0018)); }, { passive: false });
    host.addEventListener('pointerdown', e => { if (e.target.closest('.map-zoom')) return; this.drag = { x: e.clientX, y: e.clientY, px: this.panX, py: this.panY }; this.moved = false; });
    host.addEventListener('pointerup', () => { this.drag = null; });
    host.addEventListener('pointercancel', () => { this.drag = null; });
    const bar = document.createElement('div');
    bar.className = 'map-zoom';
    bar.innerHTML = '<button type="button" data-z="in" aria-label="Zoom in" title="Zoom in">+</button><button type="button" data-z="out" aria-label="Zoom out" title="Zoom out">−</button><button type="button" data-z="reset" aria-label="Reset view" title="Reset view">⤢</button><span class="zl">100%</span>';
    bar.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; e.stopPropagation(); if (b.dataset.z === 'in') this.zoomBy(1.4); else if (b.dataset.z === 'out') this.zoomBy(1 / 1.4); else this.resetView(); });
    this.zoomLabel = bar.querySelector('.zl');
    host.append(bar);
  }

  get legend() { return this.view === 'geo' ? this.geoLegend : this.view === 'political' ? this.geoLegend.filter(l => !l.terrain) : this.legendCluster; }
  setView(view) { this.view = view; this.setHover(null); this.redraw(); }
  setGeoOption(key, on) { this.geoOpts[key] = on; if (key === 'terrain') this.terrainKey = ''; this.redraw(); }
  setHazard(kind, data) { this.hazardKind = kind; if (data) this.hazardData = data; this.redraw(); }
  zoomAt(cx, cy, f) {
    const rect = this.host.getBoundingClientRect(), vx = (cx - rect.left) / rect.width * W, vy = (cy - rect.top) / rect.height * H;
    const z = Math.min(10, Math.max(0.5, this.zoom * f)), k = z / this.zoom;
    this.panX = vx - (vx - this.panX) * k; this.panY = vy - (vy - this.panY) * k; this.zoom = z;
    this.clampPan(); this.setHover(null); this.redraw();
  }
  zoomBy(f) { const r = this.host.getBoundingClientRect(); this.zoomAt(r.left + r.width / 2, r.top + r.height / 2, f); }
  resetView() { this.zoom = 1; this.panX = 0; this.panY = 0; this.setHover(null); this.redraw(); }
  depositsAt(x, y) { return this.deposits.get(y * this.snap.geo.w + x) || []; }
  focus(x, y, zoom = 3.5) { this.zoom = zoom; this.panX = W / 2 - x * zoom; this.panY = H / 2 - y * zoom; this.clampPan(); this.setHover(null); this.redraw(); }
  clampPan() {
    const z = this.zoom;
    this.panX = Math.min(W * 0.75, Math.max(W * 0.25 - W * z, this.panX));
    this.panY = Math.min(H * 0.75, Math.max(H * 0.25 - H * z, this.panY));
  }
  setMode(mode) { this.mode = mode; this.assignColors(); this.redraw(); }
  setShowPeople(on) { this.showPeople = on; this.redraw(); }

  anchor(countryId) {
    if (!this.anchors.has(countryId)) {
      const slot = this.anchors.size, a = slot * 2.39996, rad = 0.42 * Math.sqrt(Math.min(1, (slot + 0.5) / 16));
      this.anchors.set(countryId, { x: W / 2 + Math.cos(a) * rad * W, y: H / 2 + Math.sin(a) * rad * H });
    }
    return this.anchors.get(countryId);
  }

  setData(snap) {
    this.snap = snap;
    const living = snap.people.filter(p => p.alive !== false);
    const sites = snap.settlements.filter(s => !s.abandoned && s.population > 0).map(s => ({ ...s }));
    const total = Math.max(1, sites.reduce((n, s) => n + s.population, 0));
    const k = Math.sqrt(0.13 * W * H / (Math.PI * total));
    this.dotR = Math.min(3.2, Math.max(0.8, k * 0.55));
    for (const s of sites) {
      s.r = Math.min(135, Math.max(16, Math.sqrt(s.population) * k));
      const anchor = this.anchor(s.country);
      let p = this.pos.get(s.id);
      if (!p) { p = { x: anchor.x + (rnd(s.id * 7 + 1) - 0.5) * 160, y: anchor.y + (rnd(s.id * 13 + 2) - 0.5) * 110 }; this.pos.set(s.id, p); }
    }
    for (let it = 0; it < 90; it++) {
      for (let i = 0; i < sites.length; i++) for (let j = i + 1; j < sites.length; j++) {
        const a = this.pos.get(sites[i].id), b = this.pos.get(sites[j].id);
        let dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
        const min = sites[i].r + sites[j].r + 24;
        if (d < min) {
          if (d < 0.01) { dx = rnd(i * 31 + j) - 0.5; dy = rnd(i * 17 + j) - 0.5; d = Math.hypot(dx, dy) || 1; }
          const push = (min - d) / 2;
          a.x -= dx / d * push; a.y -= dy / d * push; b.x += dx / d * push; b.y += dy / d * push;
        }
      }
      for (const s of sites) {
        const p = this.pos.get(s.id), an = this.anchor(s.country);
        p.x += (an.x - p.x) * 0.015; p.y += (an.y - p.y) * 0.015;
        p.x = Math.min(W - s.r - 10, Math.max(s.r + 10, p.x));
        p.y = Math.min(H - s.r - 28, Math.max(s.r + 10, p.y));
      }
    }
    const bySite = new Map();
    for (const p of living) { if (!bySite.has(p.settlement)) bySite.set(p.settlement, []); bySite.get(p.settlement).push(p); }
    this.dots = [];
    for (const s of sites) {
      const p = this.pos.get(s.id); s.x = p.x; s.y = p.y;
      const list = (bySite.get(s.id) || []).sort((a, b) => a.id - b.id), n = list.length;
      s.dotStart = this.dots.length;
      list.forEach((person, i) => {
        const ang = i * 2.39996, dist = (s.r - 3) * Math.sqrt((i + 0.5) / n);
        this.dots.push({ person, site: s, x: s.x + Math.cos(ang) * dist, y: s.y + Math.sin(ang) * dist, color: '#fff', hi: false });
      });
      s.dotEnd = this.dots.length;
    }
    this.sites = sites;
    this.living = living;
    this.assignColors();
    this.buildGeo();
    this.redraw();
  }

  assignColors() {
    if (!this.snap) return;
    const tally = new Map(), add = (label, color) => { const t = tally.get(label) || { label, color, count: 0 }; t.count++; tally.set(label, t); return color; };
    let thresholds = [];
    if (this.mode === 'wealth') {
      const w = this.living.map(p => p.wealth || 0).sort((a, b) => a - b);
      thresholds = [1, 2, 3, 4].map(i => w[Math.floor(w.length * i / 5)] ?? 0);
    }
    for (const d of this.dots) {
      const p = d.person; d.hi = false;
      if (this.mode === 'country') d.color = add(p.countryName, this.countryColor(p.country));
      else if (this.mode === 'age') { const b = p.age < 18 ? 0 : p.age < 35 ? 1 : p.age < 50 ? 2 : p.age < 65 ? 3 : 4; d.color = add(AGE_BINS[b][0], AGE_BINS[b][1]); }
      else if (this.mode === 'wealth') { const b = thresholds.filter(t => (p.wealth || 0) >= t).length; d.color = add(WEALTH_BINS[b][0], WEALTH_BINS[b][1]); }
      else if (this.mode === 'health') { d.hi = !!p.infection; d.color = p.infection ? add('Infected', '#ef4444') : add('Healthy', '#4ade80'); }
      else d.color = add(p.job || 'resident', JOB_COLORS[p.job] || '#cbd5e1');
    }
    let items = [...tally.values()];
    if (this.mode === 'age') items = AGE_BINS.map(([l, c]) => tally.get(l) || { label: l, color: c, count: 0 });
    else if (this.mode === 'wealth') items = WEALTH_BINS.map(([l, c]) => tally.get(l) || { label: l, color: c, count: 0 });
    else items.sort((a, b) => b.count - a.count);
    this.legendCluster = items;
  }

  fit(canvas) {
    const dpr = window.devicePixelRatio || 1, w = Math.max(1, Math.round(this.host.clientWidth * dpr)), h = Math.max(1, Math.round(this.host.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    return canvas.width / W;
  }
  get css() { return this.host.clientWidth / W * this.zoom; }

  redraw() {
    const c = this.base; if (!c.isConnected || !this.host.clientWidth) return;
    const s = this.fit(c), ctx = c.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = this.view === 'geo' ? '#10335f' : this.view === 'political' ? '#c3dcec' : '#0a0e26'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.setTransform(s * this.zoom, 0, 0, s * this.zoom, s * this.panX, s * this.panY);
    if (this.zoomLabel) this.zoomLabel.textContent = Math.round(this.zoom * 100) + '%';
    if (this.view === 'geo') { this.drawGeo(ctx); this.drawOver(); this.ensureLoop(); return; }
    if (this.view === 'political') { this.drawPolitical(ctx); this.drawOver(); return; }
    const bg = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, 700);
    bg.addColorStop(0, '#1b2559'); bg.addColorStop(1, '#0a0e26'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(148,163,255,.12)';
    for (let x = 20; x < W; x += 40) for (let y = 20; y < H; y += 40) ctx.fillRect(x, y, 1.6, 1.6);
    const fs = Math.min(26, Math.max(11, 10.5 / this.css));
    for (const site of this.sites) {
      const col = this.countryColor(site.country), g = ctx.createRadialGradient(site.x, site.y, site.r * 0.3, site.x, site.y, site.r * 2.2);
      g.addColorStop(0, rgba(col, 0.34)); g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(site.x, site.y, site.r * 2.2, 0, 7); ctx.fill();
    }
    for (const site of this.sites) {
      const col = this.countryColor(site.country);
      ctx.fillStyle = rgba(col, this.showPeople ? 0.12 : 0.38); ctx.strokeStyle = rgba(col, 0.85); ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(site.x, site.y, site.r + 4, 0, 7); ctx.fill(); ctx.stroke();
      if (site.capital) { ctx.setLineDash([4, 4]); ctx.strokeStyle = rgba(col, 0.7); ctx.beginPath(); ctx.arc(site.x, site.y, site.r + 10, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
    }
    if (this.showPeople) {
      for (const pass of [false, true]) for (const d of this.dots) {
        if (d.hi !== pass) continue;
        ctx.fillStyle = d.color; ctx.globalAlpha = d.hi ? 1 : 0.92; ctx.beginPath(); ctx.arc(d.x, d.y, d.hi ? this.dotR * 1.7 : this.dotR, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const site of this.sites) { ctx.font = `700 ${Math.max(12, Math.min(34, site.r * 0.55))}px 'Segoe UI',sans-serif`; ctx.fillText(site.population.toLocaleString(), site.x, site.y); }
    }
    ctx.font = `600 ${fs}px 'Segoe UI',sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const site of this.sites) {
      const label = (site.capital ? '★ ' : '') + site.name, tw = ctx.measureText(label).width + fs * 1.1, y = site.y + site.r + 10 + fs * 0.9;
      site.label = { x: site.x - tw / 2, y: y - fs * 0.85, w: tw, h: fs * 1.7 };
      ctx.fillStyle = 'rgba(8,12,32,.78)'; ctx.beginPath(); ctx.roundRect(site.label.x, site.label.y, tw, site.label.h, fs * 0.85); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillText(label, site.x, y);
    }
    this.drawOver();
  }

  // ------------------------------------------------------------------ geography data
  buildGeo() {
    const snap = this.snap, g = snap.geo; if (!g) return;
    this.cw = W / g.w; this.ch = H / g.h;
    this.geoSites = snap.settlements.filter(s => !s.abandoned && s.population > 0 && s.gx != null).map(s => ({
      ...s, px: (s.gx + 0.5) * this.cw, py: (s.gy + 0.5) * this.ch,
      r: 6, reach: Math.min(16, 4 + Math.sqrt(s.population) * 0.55),
      count: 0
    }));
    this.layoutSettlements();
    const owner = [], counts = new Map(), sums = new Map();
    for (let y = 0; y < g.h; y++) {
      const row = [];
      for (let x = 0; x < g.w; x++) {
        let best = null, bd = Infinity;
        if (!hasWater(g.terrain[y][x])) {
          const land = g.land[y][x];
          for (const s of this.geoSites) {
            if (g.land[s.gy][s.gx] !== land) continue;
            const d = Math.hypot(s.gx - x, s.gy - y);
            if (d <= s.reach && d < bd) { bd = d; best = s; }
          }
        }
        const id = best ? best.country : 0;
        row.push(id);
        if (id) { counts.set(id, (counts.get(id) || 0) + 1); const q = sums.get(id) || [0, 0, 0]; q[0] += x; q[1] += y; q[2]++; sums.set(id, q); }
      }
      owner.push(row);
    }
    this.owner = owner;
    this.centroids = [...sums.entries()].map(([id, q]) => ({ id, x: (q[0] / q[2] + 0.5) * this.cw, y: (q[1] / q[2] + 0.5) * this.ch, cells: q[2] }));
    this.warPairs = new Set((snap.wars || []).map(w => [...w.countries].sort((a, b) => a - b).join('-')));
    this.contested = new Set((snap.contested || []).map(c => c[1] * g.w + c[0]));
    if (this.depositKey !== snap.geoSeed) { this.depositKey = snap.geoSeed; this.staticDeposits = new Map(g.deposits.map(([x, y, list]) => [y * g.w + x, list.map(([kind, cap]) => ({ kind, cap }))])); this.features = new Map(g.features.map(([x, y, tags]) => [y * g.w + x, tags])); }
    this.deposits = new Map();
    for (const [key, list] of this.staticDeposits) this.deposits.set(key, list.map(d => ({ ...d, amount: d.cap, locked: false })));
    for (const [x, y, slot, amount, locked] of snap.depositState || []) { const d = this.deposits.get(y * g.w + x)?.[slot]; if (d) { d.amount = amount; d.locked = !!locked; } }
    this.roadSet = new Set((snap.roads || []).map(r => r[1] * g.w + r[0]));
    const names = new Map(snap.countries.map(c => [c.id, c.name]));
    const tcount = {}; for (const row of g.terrain) for (const c of row) tcount[c] = (tcount[c] || 0) + 1;
    this.geoLegend = [
      ...[...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id, n]) => ({ label: names.get(id) || 'Country', color: this.countryColor(id), count: n })),
      ...['p', 'f', 'h', 'm', 'd', 's', 't', 'l', 'o'].filter(k => tcount[k]).map(k => ({ label: TERRAIN[k].name, color: TERRAIN[k].color, count: tcount[k], terrain: true }))
    ];
    // A year's travel is cut into hops of 2-4 tiles. Every party walks a hop at the same steady speed, all parties start each hop together,
    // and they all stand still for a moment between hops.
    const now = performance.now(), seen = new Set(), HOP = 4;
    this.animMs = 0;
    for (const [prefix, list] of [['exp', snap.expeditions], ['army', snap.armies], ['car', snap.caravans]]) {
      for (const e of list || []) {
        const key = `${prefix}:${e.id}`; seen.add(key);
        const prev = this.lastIndex.get(key);
        if (prev !== undefined && prev !== e.index && this.tileMs > 0) {
          const hops = Math.max(1, Math.ceil((e.index - prev) / HOP));
          this.expAnim.set(key, { from: prev, to: e.index, t0: now, hops, tileMs: this.tileMs, gap: this.tileMs * 2 });
          this.animMs = Math.max(this.animMs, (hops - 1) * (HOP * this.tileMs + this.tileMs * 2) + (e.index - prev) / hops * this.tileMs);
        }
        this.lastIndex.set(key, e.index);
      }
    }
    for (const key of [...this.lastIndex.keys()]) if (!seen.has(key)) { this.lastIndex.delete(key); this.expAnim.delete(key); }
  }

  terrainImage() {
    const g = this.snap.geo, key = `${this.snap.geoSeed}:${this.geoOpts.terrain}`;
    if (this.terrainCanvas && this.terrainKey === key) return this.terrainCanvas;
    const S = 5, c = document.createElement('canvas'); c.width = g.w * S; c.height = g.h * S;
    const x = c.getContext('2d');
    const el = (xx, yy) => +g.elev[Math.max(0, Math.min(g.h - 1, yy))][Math.max(0, Math.min(g.w - 1, xx))];
    const wet = (xx, yy) => xx < 0 || yy < 0 || xx >= g.w || yy >= g.h || hasWater(g.terrain[yy][xx]);
    for (let yy = 0; yy < g.h; yy++) for (let xx = 0; xx < g.w; xx++) {
      const k = g.terrain[yy][xx];
      x.fillStyle = this.geoOpts.terrain || hasWater(k) ? TERRAIN[k].color : '#3b4f7a'; x.fillRect(xx * S, yy * S, S, S);
      if (hasWater(k)) {
        let near = false;
        for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2; dx++) if (!wet(xx + dx, yy + dy)) { near = true; break; }
        x.fillStyle = near ? 'rgba(130,200,255,.20)' : 'rgba(0,10,40,.18)'; x.fillRect(xx * S, yy * S, S, S);
        continue;
      }
      const shade = el(xx - 1, yy - 1) - el(xx + 1, yy + 1);
      x.fillStyle = shade > 0 ? `rgba(255,255,255,${Math.min(0.3, shade * 0.1)})` : `rgba(0,0,40,${Math.min(0.32, -shade * 0.1)})`; x.fillRect(xx * S, yy * S, S, S);
      x.fillStyle = `rgba(0,0,0,${rnd(xx * 131 + yy * 17) * 0.09})`; x.fillRect(xx * S, yy * S, S, S);
    }
    this.terrainCanvas = c; this.terrainKey = key;
    return c;
  }

  visibleCells() {
    const g = this.snap.geo, x0 = Math.max(0, Math.floor((-this.panX / this.zoom) / this.cw) - 1), y0 = Math.max(0, Math.floor((-this.panY / this.zoom) / this.ch) - 1);
    const x1 = Math.min(g.w - 1, Math.ceil(((W - this.panX) / this.zoom) / this.cw) + 1), y1 = Math.min(g.h - 1, Math.ceil(((H - this.panY) / this.zoom) / this.ch) + 1);
    return { x0, y0, x1, y1 };
  }

  drawGeo(ctx) {
    const g = this.snap?.geo; if (!g) return;
    const cw = this.cw, ch = this.ch, o = this.geoOpts, css = this.css, V = this.visibleCells();
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(this.terrainImage(), 0, 0, W, H);
    if (this.hazardKind && this.hazardData?.[this.hazardKind]) {
      const rows = this.hazardData[this.hazardKind], hue = HAZARD_STYLE[this.hazardKind];
      for (let y = V.y0; y <= V.y1; y++) for (let x = V.x0; x <= V.x1; x++) {
        const v = Number(rows[y]?.[x] ?? 0); if (!v) continue;
        ctx.fillStyle = rgba(hue, Math.min(0.78, v / 9 * 0.8)); ctx.fillRect(x * cw, y * ch, cw, ch);
      }
    }
    if (o.terrain && css * cw >= 15) {
      for (let y = V.y0; y <= V.y1; y++) for (let x = V.x0; x <= V.x1; x++) {
        const k = g.terrain[y][x], cx = x * cw + cw / 2, cy = y * ch + ch / 2;
        ctx.lineWidth = 1.1; ctx.strokeStyle = 'rgba(30,40,30,.4)'; ctx.fillStyle = 'rgba(20,50,30,.42)';
        if (k === 'm') { ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.moveTo(cx - 5, cy + 4); ctx.lineTo(cx, cy - 5); ctx.lineTo(cx + 5, cy + 4); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(60,64,80,.65)'; ctx.stroke(); }
        else if (k === 'h') { ctx.beginPath(); ctx.arc(cx, cy + 2, 4, Math.PI, 0); ctx.stroke(); }
        else if (k === 'f') { for (const [dx, dy] of [[-3, 1], [2, -2], [3, 3]]) { ctx.beginPath(); ctx.arc(cx + dx, cy + dy, 2, 0, 7); ctx.fill(); } }
        else if (k === 'd') { ctx.fillStyle = 'rgba(120,80,20,.4)'; for (const [dx, dy] of [[-3, 2], [1, -3], [3, 3]]) ctx.fillRect(cx + dx, cy + dy, 1.4, 1.4); }
        else if (k === 's') { ctx.strokeStyle = 'rgba(20,70,60,.55)'; ctx.beginPath(); ctx.moveTo(cx - 3, cy); ctx.lineTo(cx + 3, cy); ctx.moveTo(cx - 2, cy + 3); ctx.lineTo(cx + 2, cy + 3); ctx.stroke(); }
        else if (k === 't') { ctx.fillStyle = 'rgba(120,150,180,.45)'; ctx.fillRect(cx - 3, cy, 1.4, 1.4); ctx.fillRect(cx + 2, cy - 3, 1.4, 1.4); }
      }
    }
    if (o.rivers) {
      ctx.strokeStyle = '#69b4ff'; ctx.lineWidth = 2.3; ctx.lineCap = 'round'; ctx.beginPath();
      for (let y = V.y0; y <= V.y1; y++) for (let x = V.x0; x <= V.x1; x++) {
        if (g.river[y][x] !== '1') continue;
        for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [-1, 1]]) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < g.w && ny < g.h && g.river[ny][nx] === '1') { ctx.moveTo((x + 0.5) * cw, (y + 0.5) * ch); ctx.lineTo((nx + 0.5) * cw, (ny + 0.5) * ch); }
        }
      }
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(235,248,255,.65)'; ctx.lineWidth = 1.4; ctx.beginPath();
    const wetAt = (xx, yy) => xx < 0 || yy < 0 || xx >= g.w || yy >= g.h || hasWater(g.terrain[yy][xx]);
    for (let y = V.y0; y <= V.y1; y++) for (let x = V.x0; x <= V.x1; x++) {
      if (hasWater(g.terrain[y][x])) continue;
      const X = x * cw, Y = y * ch;
      if (wetAt(x, y - 1)) { ctx.moveTo(X, Y); ctx.lineTo(X + cw, Y); } if (wetAt(x, y + 1)) { ctx.moveTo(X, Y + ch); ctx.lineTo(X + cw, Y + ch); }
      if (wetAt(x - 1, y)) { ctx.moveTo(X, Y); ctx.lineTo(X, Y + ch); } if (wetAt(x + 1, y)) { ctx.moveTo(X + cw, Y); ctx.lineTo(X + cw, Y + ch); }
    }
    ctx.stroke();
    if (o.roads && this.roadSet.size) {
      ctx.strokeStyle = 'rgba(120,76,32,.95)'; ctx.lineWidth = 2.2; ctx.setLineDash([5, 3]); ctx.beginPath();
      for (const key of this.roadSet) {
        const x = key % g.w, y = Math.floor(key / g.w);
        for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [-1, 1]]) { const nx = x + dx, ny = y + dy; if (this.roadSet.has(ny * g.w + nx)) { ctx.moveTo((x + 0.5) * cw, (y + 0.5) * ch); ctx.lineTo((nx + 0.5) * cw, (ny + 0.5) * ch); } }
      }
      ctx.stroke(); ctx.setLineDash([]);
    }
    if (o.borders) {
      for (let y = V.y0; y <= V.y1; y++) for (let x = V.x0; x <= V.x1; x++) { const a = this.owner[y][x]; if (a) { ctx.fillStyle = rgba(this.countryColor(a), 0.30); ctx.fillRect(x * cw, y * ch, cw, ch); } }
      const seg = (x1, y1, x2, y2, a, b) => {
        if (a === b || (!a && !b)) return;
        ctx.lineCap = 'round';
        if (a && b) { ctx.strokeStyle = 'rgba(8,12,34,.85)'; ctx.lineWidth = 4.2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.92)'; ctx.lineWidth = 1.7; }
        else { ctx.strokeStyle = rgba(this.countryColor(a || b), 0.95); ctx.lineWidth = 1.8; }
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      };
      for (let y = V.y0; y <= V.y1; y++) for (let x = V.x0; x <= V.x1; x++) {
        if (hasWater(g.terrain[y][x])) continue;
        const a = this.owner[y][x];
        if (x + 1 < g.w && !hasWater(g.terrain[y][x + 1])) seg((x + 1) * cw, y * ch, (x + 1) * cw, (y + 1) * ch, a, this.owner[y][x + 1]);
        if (y + 1 < g.h && !hasWater(g.terrain[y + 1][x])) seg(x * cw, (y + 1) * ch, (x + 1) * cw, (y + 1) * ch, a, this.owner[y + 1][x]);
      }
    }
    if (o.contested && this.contested.size) {
      for (let y = V.y0; y <= V.y1; y++) for (let x = V.x0; x <= V.x1; x++) if (this.contested.has(y * g.w + x)) { ctx.fillStyle = 'rgba(220,38,38,.30)'; ctx.fillRect(x * cw, y * ch, cw, ch); }
    }
    if (o.resources) {
      const detailed = css * cw >= 18;
      for (let y = V.y0; y <= V.y1; y++) for (let x = V.x0; x <= V.x1; x++) {
        if (this.siteCells.has(y * g.w + x)) continue;
        const list = this.deposits.get(y * g.w + x); if (!list) continue;
        const shown = detailed ? list : [list.slice().sort((p, q) => (RESOURCE_VALUE[q.kind] || 1) - (RESOURCE_VALUE[p.kind] || 1))[0]];
        shown.forEach((d, i) => {
          const r = detailed ? Math.min(3.3, 6.5 / css) : 2.4, cx = x * cw + cw * (detailed ? 0.26 + i * 0.3 : 0.5), cy = y * ch + ch * (detailed ? 0.74 : 0.5), fill = Math.max(0, Math.min(1, d.amount / d.cap));
          ctx.fillStyle = 'rgba(15,23,42,.55)'; ctx.beginPath(); ctx.arc(cx, cy, r + Math.min(1.3, 1.8 / css), 0, 7); ctx.fill();
          ctx.fillStyle = d.locked ? '#78716c' : RESOURCES[d.kind].color; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.04, fill)); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = d.locked ? '#ef4444' : 'rgba(255,255,255,.85)'; ctx.lineWidth = (d.locked ? 1.3 : 0.8) * Math.min(1, 1.5 / css); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
        });
      }
    }
    this.drawSettlements(ctx, css);
    if (o.buildings) this.drawBuildings(ctx, css);
  }


  // ------------------------------------------------------------------ settlement layout
  // draw a unit sprite at a fixed on-screen size however far the map is zoomed in
  sc(ctx, x, y, css, fn) { ctx.save(); ctx.translate(x, y); const z = Math.min(1, 1.6 / css); ctx.scale(z, z); fn(0, 0); ctx.restore(); }
  unitsOf(id) { return this.countryUnits?.get(id) || { weapon: 0, ship: 1, cart: 1, era: 0, army: 'hunters with spears', fleet: 'sailing boats', wagons: 'ox carts' }; }

  // Villages are one tile; towns a small cross of tiles; cities a 3x3 block with the seat of government in the middle.
  layoutSettlements() {
    const g = this.snap.geo, cw = this.cw, ch = this.ch, snap = this.snap;
    this.countryUnits = new Map(snap.countries.map(c => [c.id, c.units]));
    const countries = new Map(snap.countries.map(c => [c.id, c]));
    const occupied = new Map();
    for (const s of this.geoSites) occupied.set(s.gy * g.w + s.gx, s.id);
    this.spriteBoxes = []; this.siteCells = new Set();
    const hash = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
    const ring = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
    for (const s of this.geoSites.slice().sort((a, b) => b.population - a.population)) {
      const c = countries.get(s.country);
      s.era = c?.era ?? 0; // the fine age (0-14), so every new age brings new art s.government = c?.government || 'monarchy';
      s.tier = s.population >= 700 ? 'city' : s.population >= 150 ? 'town' : 'village';
      const offs = s.tier === 'city' ? [[0, 0], ...ring] : s.tier === 'town' ? [[0, 0], [0, -1], [1, 0], [0, 1], [-1, 0]] : [[0, 0]];
      s.tiles = [];
      for (const [dx, dy] of offs) {
        const x = s.gx + dx, y = s.gy + dy; if (x < 0 || y < 0 || x >= g.w || y >= g.h) continue;
        const key = y * g.w + x;
        if (dx || dy) { if (hasWater(g.terrain[y][x]) || (occupied.has(key) && occupied.get(key) !== s.id)) continue; occupied.set(key, s.id); }
        s.tiles.push({ x, y, dx, dy });
      }
      s.r0 = s.r = (s.tier === 'city' ? 2.1 : s.tier === 'town' ? 1.6 : 0.75) * cw;
      // what stands where
      const built = Object.keys(s.buildings || {}).filter(k => k !== 'walls' && k !== 'palace' && SPRITE_KINDS.includes(k));
      const rank = k => { const i = LANDMARKS.indexOf(k); return i < 0 ? 99 : i; };
      built.sort((a, b) => rank(a) - rank(b));
      const sprites = [], center = s.tiles[0], outer = s.tiles.slice(1);
      const slots = n => n === 1 ? [[0, 0.04, 0.88]] : n === 2 ? [[-0.23, 0.05, 0.54], [0.23, 0.05, 0.54]] : [[-0.25, -0.17, 0.46], [0.25, -0.17, 0.46], [0, 0.2, 0.52]];
      const at = (tile, [ox, oy, u], what) => sprites.push({ ...what, x: (tile.x + 0.5 + ox) * cw, y: (tile.y + 0.5 + oy) * ch, u: u * cw, tile });
      if (s.tier === 'village') {
        at(center, [-0.24, 0.12, 0.5], { kind: 'house', v: s.id });
        at(center, [0.24, 0.0, 0.42], { kind: 'house', v: s.id + 1 });
      } else {
        const wonders = built.filter(k => WONDERS.includes(k)), common = built.filter(k => !WONDERS.includes(k));
        const order = outer.map((tile, i) => [hash(s.id, i), tile]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
        const cap = s.tier === 'city' ? 3 : 2, plan = new Map(order.map(tile => [tile, []]));
        if (s.tier === 'city') {
          at(center, [0, 0.02, 1.0], { kind: 'hall' });
        } else {
          at(center, [-0.24, -0.1, 0.5], { kind: 'house', v: s.id });
          at(center, [0.25, 0.0, 0.5], { kind: 'house', v: s.id + 1 });
          at(center, [0, 0.22, 0.5], { kind: 'house', v: s.id + 2 });
        }
        wonders.forEach((k, i) => { const tile = order[i % Math.max(1, order.length)]; if (tile && !plan.get(tile).length) plan.get(tile).push({ kind: k, big: true }); });
        let i = 0, placed = 0;
        for (const k of common) {
          if (placed >= order.length * cap) break;
          for (let tries = 0; tries < order.length; tries++) {
            const tile = order[(i + tries) % order.length], list = plan.get(tile);
            if (list.length < cap && !(list[0] && list[0].big)) { list.push({ kind: k }); i = (i + tries + 1) % order.length; placed++; break; }
          }
        }
        order.forEach((tile, n) => {
          const list = plan.get(tile);
          if (list[0] && list[0].big) { at(tile, [0, 0.02, 0.96], list[0]); return; }
          let h = 0; while (list.length < 2 + (hash(s.id, n + 40) > 0.55 && cap === 3 ? 1 : 0) && list.length < cap) list.push({ kind: 'house', v: s.id + n + h++ });
          slots(list.length).forEach((slot, j) => at(tile, slot, list[j].kind === 'house' ? { kind: 'house', v: list[j].v } : { kind: list[j].kind }));
        });
      }
      for (const q of s.tiles) this.siteCells.add(q.y * g.w + q.x);
      s.sprites = sprites.sort((a, b) => a.y - b.y);
      if (s.tier === 'city') { const hall = s.sprites.find(q => q.kind === 'hall'); if (hall) hall.name = (s.capital && (s.buildings || {}).palace) ? 'Royal palace' : (HALLS[s.government] || 'Town hall'); }
    }
  }

  drawSettlements(ctx, css) {
    const cw = this.cw, ch = this.ch, o = this.geoOpts, political = this.view === 'political', boost = Math.max(1, Math.min(2.2, 14 / (cw * css))), detail = cw * css * boost >= 9, cat = this.snap.buildingCatalog || {};
    this.boost = boost; // settlements are drawn larger than their tiles when the map is zoomed out, so they stay readable
    this.spriteBoxes = []; this.spritesShown = detail && (o.buildings !== false);
    for (const s of this.geoSites) {
      s.r = s.r0 * boost;
      const col = this.countryColor(s.country), built = s.buildings || {}, V = this.visibleCells();
      if (s.gx < V.x0 - 3 || s.gx > V.x1 + 3 || s.gy < V.y0 - 3 || s.gy > V.y1 + 3) continue;
      ctx.save(); ctx.translate(s.px, s.py); ctx.scale(boost, boost); ctx.translate(-s.px, -s.py);
      // ground plates, tinted with the owner's colour
      for (const tile of s.tiles) {
        const X = tile.x * cw, Y = tile.y * ch;
        ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fillRect(X + 0.9, Y + 1.3, cw - 0.6, ch - 0.6);
        ctx.fillStyle = detail ? groundColor(s.era) : rgba(col, 0.9); ctx.fillRect(X + 0.4, Y + 0.4, cw - 0.8, ch - 0.8);
        if (detail) { ctx.fillStyle = rgba(col, 0.2); ctx.fillRect(X + 0.4, Y + 0.4, cw - 0.8, ch - 0.8); }
        ctx.strokeStyle = rgba(col, 0.95); ctx.lineWidth = Math.max(0.7, 1.4 / css); ctx.strokeRect(X + 0.4, Y + 0.4, cw - 0.8, ch - 0.8);
      }
      if (built.walls && s.tier !== 'village') {
        const xs = s.tiles.map(q => q.x), ys = s.tiles.map(q => q.y), x0 = Math.min(...xs) * cw - 1, y0 = Math.min(...ys) * ch - 1, w = (Math.max(...xs) - Math.min(...xs) + 1) * cw + 2, h = (Math.max(...ys) - Math.min(...ys) + 1) * ch + 2;
        ctx.strokeStyle = '#44403c'; ctx.lineWidth = Math.max(1.6, 3.2 / css); ctx.strokeRect(x0, y0, w, h);
        ctx.strokeStyle = '#d6d3d1'; ctx.lineWidth = Math.max(0.8, 1.6 / css); ctx.setLineDash([cw * 0.2, cw * 0.1]); ctx.strokeRect(x0, y0, w, h); ctx.setLineDash([]);
      }
      if (!detail) {
        ctx.fillStyle = '#fff'; ctx.strokeStyle = col; ctx.lineWidth = Math.max(0.7, 1.4 / css); ctx.beginPath(); ctx.arc(s.px, s.py, cw * (s.tier === 'city' ? 0.6 : s.tier === 'town' ? 0.45 : 0.32), 0, 7); ctx.fill(); ctx.stroke();
        if (s.capital) { ctx.fillStyle = '#d4a017'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `800 ${cw * 0.95}px 'Segoe UI',sans-serif`; ctx.fillText('★', s.px, s.py - cw * 1.05); }
        ctx.restore(); continue;
      }
      if (o.buildings === false) { ctx.restore(); continue; }
      for (const q of s.sprites) {
        if (q.kind === 'house') drawHouse(ctx, q.x, q.y, q.u, s.era, q.v);
        else if (q.kind === 'hall') drawHall(ctx, s.government, q.x, q.y, q.u, s.era);
        else drawBuilding(ctx, q.kind, q.x, q.y, q.u, s.era);
        if (q.kind !== 'house' || s.tier !== 'village') this.spriteBoxes.push({ x: s.px + (q.x - s.px) * boost, y: s.py + (q.y - s.py) * boost, half: q.u * 0.52 * boost, sid: s.id, kind: q.kind, name: q.kind === 'house' ? 'Houses' : q.kind === 'hall' ? q.name : (cat[q.kind]?.[0] || q.kind), blurb: q.kind === 'house' ? `Homes of ${s.name}'s residents` : q.kind === 'hall' ? `Seat of government of ${s.countryName}` : (cat[q.kind]?.[5] || ''), settlement: s.name, country: s.countryName });
      }
      // owner's flag on the first tile; a golden star for capitals
      const f = s.tiles[0], fx = (f.x + 0.5) * cw, fy = f.y * ch + ch * 0.06;
      ctx.strokeStyle = '#3f3f46'; ctx.lineWidth = Math.max(0.6, 1.2 / css); ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx, fy - cw * 0.5); ctx.stroke();
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(fx, fy - cw * 0.5); ctx.lineTo(fx + cw * 0.34, fy - cw * 0.4); ctx.lineTo(fx, fy - cw * 0.3); ctx.fill();
      if (s.capital) { ctx.fillStyle = '#d4a017'; ctx.strokeStyle = 'rgba(30,24,20,.7)'; ctx.lineWidth = 0.6; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `800 ${cw * 0.7}px 'Segoe UI',sans-serif`; ctx.strokeText('★', fx - cw * 0.3, fy - cw * 0.45); ctx.fillText('★', fx - cw * 0.3, fy - cw * 0.45); }
      ctx.restore();
    }
  }

  drawBuildings(ctx, css) { return; // replaced by drawSettlements (real building sprites)
  }
  _oldDrawBuildings(ctx, css) {
    for (const s of this.geoSites) {
      const all = Object.keys(s.buildings || {}).filter(k => k !== 'walls');
      if (!all.length) continue;
      const kinds = all.slice().sort((a, b) => (LANDMARKS.indexOf(a) + 99 * (LANDMARKS.indexOf(a) < 0)) - (LANDMARKS.indexOf(b) + 99 * (LANDMARKS.indexOf(b) < 0)));
      const icon = (k, x, y, size) => {
        const [letter, color] = BUILD_STYLE[k] || ['?', '#64748b'], wonder = WONDERS.includes(k);
        ctx.fillStyle = color; ctx.strokeStyle = wonder ? '#fde68a' : '#fff'; ctx.lineWidth = wonder ? 2 : 1.2; ctx.beginPath();
        if (wonder) { ctx.moveTo(x, y - size * 0.8); ctx.lineTo(x + size * 0.8, y); ctx.lineTo(x, y + size * 0.8); ctx.lineTo(x - size * 0.8, y); ctx.closePath(); } else ctx.roundRect(x - size / 2, y - size / 2, size, size, 3);
        ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.font = `700 ${size * 0.7}px 'Segoe UI',sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(letter, x, y + 0.5);
      };
      if (css < 2) {
        const shown = kinds.slice(0, 3), rest = kinds.length - shown.length, step = 12, x0 = s.px - ((shown.length - 1) * step) / 2, y = s.py - s.r - 11;
        shown.forEach((k, i) => icon(k, x0 + i * step, y, WONDERS.includes(k) ? 15 : 10.5));
        if (rest > 0) { const x = x0 + shown.length * step - 2; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#1e293b'; ctx.font = "700 7px 'Segoe UI',sans-serif"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('+' + rest, x, y + 0.4); }
        for (const k of kinds) if (WONDERS.includes(k) && css >= 1.1) { const label = (this.snap.buildingCatalog?.[k]?.[0] || k), fs = 9 / css; ctx.font = `700 ${fs}px 'Segoe UI',sans-serif`; const w = ctx.measureText(label).width + 8; ctx.fillStyle = 'rgba(120,53,15,.88)'; ctx.beginPath(); ctx.roundRect(s.px - w / 2, y - 24 / css * 0.9 - 4, w, fs + 5, 5); ctx.fill(); ctx.fillStyle = '#fde68a'; ctx.fillText(label, s.px, y - 24 / css * 0.9 - 4 + (fs + 5) / 2); break; }
        continue;
      }
      const R = s.r + 9, n = kinds.length;
      kinds.forEach((k, i) => { const a = -Math.PI / 2 + (i / Math.max(8, n)) * Math.PI * 2; icon(k, s.px + Math.cos(a) * R, s.py + Math.sin(a) * R, WONDERS.includes(k) ? 15 : 11); });
    }
  }


  // ------------------------------------------------------------------ political view
  drawPolitical(ctx) {
    const g = this.snap?.geo; if (!g) return;
    const cw = this.cw, ch = this.ch, css = this.css, o = this.geoOpts, V = this.visibleCells();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let y = V.y0; y <= V.y1; y++) for (let x = V.x0; x <= V.x1; x++) {
      if (hasWater(g.terrain[y][x])) continue;
      const a = this.owner[y][x];
      ctx.fillStyle = '#f4f0e1'; ctx.fillRect(x * cw - 0.3, y * ch - 0.3, cw + 0.6, ch + 0.6);
      if (a) { ctx.fillStyle = rgba(this.countryColor(a), 0.6); ctx.fillRect(x * cw - 0.3, y * ch - 0.3, cw + 0.6, ch + 0.6); }
    }
    if (o.contested && this.contested.size) {
      for (let y = V.y0; y <= V.y1; y++) for (let x = V.x0; x <= V.x1; x++) if (this.contested.has(y * g.w + x)) { ctx.fillStyle = 'rgba(220,38,38,.34)'; ctx.fillRect(x * cw, y * ch, cw, ch); }
    }
    ctx.strokeStyle = 'rgba(70,90,110,.75)'; ctx.lineWidth = 1.5; ctx.beginPath();
    const wetAt = (xx, yy) => xx < 0 || yy < 0 || xx >= g.w || yy >= g.h || hasWater(g.terrain[yy][xx]);
    for (let y = V.y0; y <= V.y1; y++) for (let x = V.x0; x <= V.x1; x++) {
      if (hasWater(g.terrain[y][x])) continue;
      const X = x * cw, Y = y * ch;
      if (wetAt(x, y - 1)) { ctx.moveTo(X, Y); ctx.lineTo(X + cw, Y); } if (wetAt(x, y + 1)) { ctx.moveTo(X, Y + ch); ctx.lineTo(X + cw, Y + ch); }
      if (wetAt(x - 1, y)) { ctx.moveTo(X, Y); ctx.lineTo(X, Y + ch); } if (wetAt(x + 1, y)) { ctx.moveTo(X + cw, Y); ctx.lineTo(X + cw, Y + ch); }
    }
    ctx.stroke();
    const seg = (x1, y1, x2, y2, a, b) => {
      if (a === b || (!a && !b)) return;
      if (a && b) { ctx.strokeStyle = 'rgba(22,26,48,.92)'; ctx.lineWidth = 3.2; } else { ctx.strokeStyle = rgba(this.countryColor(a || b), 0.95); ctx.lineWidth = 2.2; }
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    };
    for (let y = V.y0; y <= V.y1; y++) for (let x = V.x0; x <= V.x1; x++) {
      if (hasWater(g.terrain[y][x])) continue;
      const a = this.owner[y][x];
      if (x + 1 < g.w && !hasWater(g.terrain[y][x + 1])) seg((x + 1) * cw, y * ch, (x + 1) * cw, (y + 1) * ch, a, this.owner[y][x + 1]);
      if (y + 1 < g.h && !hasWater(g.terrain[y + 1][x])) seg(x * cw, (y + 1) * ch, (x + 1) * cw, (y + 1) * ch, a, this.owner[y + 1][x]);
    }
    this.drawSettlements(ctx, css);
    if (o.buildings) this.drawBuildings(ctx, css);
  }

  // Country and settlement names. They are drawn last, on the overlay, so no sprite, army or caravan ever covers them.
  drawNames(ctx) {
    const o = this.geoOpts, css = this.css, political = this.view === 'political';
    if (!o.names || !this.snap?.geo || !(political || this.view === 'geo')) return;
    if (political || o.borders) {
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const names = new Map(this.snap.countries.map(c => [c.id, c.name]));
      for (const c of this.centroids) {
        const size = political ? Math.min(34, Math.max(Math.min(20, 11 / css), Math.sqrt(c.cells) * 1.7)) : Math.min(30, Math.max(Math.min(18, 10 / css), Math.sqrt(c.cells) * 1.5)), text = (names.get(c.id) || '').toUpperCase();
        ctx.font = `800 ${size}px 'Segoe UI',sans-serif`; ctx.lineWidth = political ? 4 : 3.4;
        ctx.strokeStyle = political ? 'rgba(255,255,255,.75)' : 'rgba(8,12,34,.5)'; ctx.fillStyle = political ? 'rgba(30,34,60,.7)' : 'rgba(255,255,255,.72)';
        ctx.strokeText(text, c.x, c.y); ctx.fillText(text, c.x, c.y);
      }
    }
    const fs = Math.min(24, 10.5 / css);
    ctx.font = `${political ? 700 : 600} ${fs}px 'Segoe UI',sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const s of this.geoSites) {
      if (s.tier === 'village' && css < 1.5) continue; // tiny villages are named only when you look closer
      const label = s.name, tw = ctx.measureText(label).width + fs * 1.1;
      const y = s.py + s.r + fs * 1.15 + (political && css >= 2 && s.count ? 12 : 0);
      if (political) { ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.strokeStyle = 'rgba(30,34,60,.45)'; ctx.lineWidth = 1; }
      else ctx.fillStyle = 'rgba(8,12,34,.8)';
      ctx.beginPath(); ctx.roundRect(s.px - tw / 2, y - fs * 0.85, tw, fs * 1.7, fs * 0.85); ctx.fill(); if (political) ctx.stroke();
      ctx.fillStyle = political ? '#1e223c' : '#fff'; ctx.fillText(label, s.px, y);
    }
  }

  // ------------------------------------------------------------------ dynamic layer
  needsLoop() {
    const s = this.snap;
    return !!(s && this.view === 'geo' && this.host.isConnected && ((s.expeditions || []).length || (s.armies || []).length || (s.caravans || []).length || (s.projects || []).length || (s.disasters || []).some(d => d.year >= s.year - 1) || this.geoSites.some(x => x.sick && Object.keys(x.sick).length)));
  }
  ensureLoop() {
    if (this.loop || !this.needsLoop()) return;
    const tick = t => {
      this.loop = 0;
      if (!this.needsLoop()) { this.drawOver(); return; }
      if (!document.hidden && t - this.lastFrame > 32) { this.lastFrame = t; this.drawOver(t); }
      this.loop = requestAnimationFrame(tick);
    };
    this.loop = requestAnimationFrame(tick);
  }

  expPos(e, now, key = 'exp:' + e.id) {
    const a = this.expAnim.get(key); let idx = e.index;
    if (a) {
      const len = (a.to - a.from) / a.hops, elapsed = now - a.t0; idx = a.from;
      for (let j = 0; j < a.hops; j++) {
        const start = j * (4 * a.tileMs + a.gap), p = Math.min(1, (elapsed - start) / (len * a.tileMs));
        if (elapsed < start) break;
        idx = a.from + len * (j + p);
        if (p < 1) break;
      }
    }
    const last = e.path.length - 1, i = Math.min(last, Math.max(0, Math.floor(idx))), j = Math.min(last, i + 1), f = idx - i;
    return { x: (e.path[i][0] + (e.path[j][0] - e.path[i][0]) * f + 0.5) * this.cw, y: (e.path[i][1] + (e.path[j][1] - e.path[i][1]) * f + 0.5) * this.ch, idx };
  }

  drawOver(now = performance.now()) {
    const c = this.over; if (!c.isConnected) return;
    const s = this.fit(c), ctx = c.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, c.width, c.height); ctx.setTransform(s * this.zoom, 0, 0, s * this.zoom, s * this.panX, s * this.panY);
    const snap = this.snap;
    if (this.view === 'geo' && snap?.geo) {
      const css = this.css, cw = this.cw, ch = this.ch, pulse = (Math.sin(now / 380) + 1) / 2, opt = this.geoOpts;
      for (const d of opt.disasters ? snap.disasters || [] : []) {
        if (d.year < snap.year - 1) continue;
        const col = HAZARD_STYLE[d.kind] || '#fff', cx = (d.x + 0.5) * cw, cy = (d.y + 0.5) * ch, R = d.radius * cw;
        for (const phase of [0, 0.5]) {
          const t = ((now / 2200) + phase) % 1; ctx.strokeStyle = rgba(col, (1 - t) * 0.9); ctx.lineWidth = 3 * (1 - t) + 1; ctx.beginPath(); ctx.arc(cx, cy, R * (0.15 + t * 0.85), 0, 7); ctx.stroke();
        }
        ctx.fillStyle = rgba(col, 0.12 + pulse * 0.08); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = `800 ${11 / css}px 'Segoe UI',sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeStyle = 'rgba(8,12,34,.8)'; ctx.lineWidth = 3;
        const label = `${d.kind.toUpperCase()}${d.deaths ? ` · ${d.deaths} dead` : ''}`; ctx.strokeText(label, cx, cy); ctx.fillText(label, cx, cy);
      }
      for (const p of opt.projects ? snap.projects || [] : []) {
        if (p.kind === 'road') {
          const upto = Math.floor(p.cells.length * Math.min(1, p.progress));
          ctx.strokeStyle = 'rgba(251,191,36,.95)'; ctx.lineWidth = 2.6; ctx.setLineDash([2, 3]); ctx.beginPath();
          p.cells.forEach(([x, y], i) => { if (i > upto) return; const X = (x + 0.5) * cw, Y = (y + 0.5) * ch; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
          ctx.stroke(); ctx.setLineDash([]); continue;
        }
        const site = this.geoSites.find(x => x.id === p.settlement); if (!site) continue;
        const zs = Math.min(1, 1.4 / css), R = site.r + 6.5 * zs;
        ctx.strokeStyle = 'rgba(251,191,36,.35)'; ctx.lineWidth = 3.2 * zs; ctx.beginPath(); ctx.arc(site.px, site.py, R, 0, 7); ctx.stroke();
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3.6 * zs; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(site.px, site.py, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, p.progress)); ctx.stroke();
        const bx = site.px - site.r - 4 * zs, by = site.py - site.r - 4 * zs;
        ctx.fillStyle = '#fbbf24'; ctx.strokeStyle = '#7c2d12'; ctx.lineWidth = 1.2 * zs; ctx.beginPath(); ctx.roundRect(bx - 6 * zs, by - 6 * zs - pulse * 1.5 * zs, 12 * zs, 12 * zs, 3 * zs); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#7c2d12'; ctx.font = `800 ${8 * zs}px 'Segoe UI',sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('⚒', bx, by - pulse * 1.5 * zs + 0.5);
      }
      const pill = (text, x, y, bg, fg, fs) => { if (!opt.labels) return; const pad = 3 / css; ctx.font = `700 ${fs}px 'Segoe UI',sans-serif`; const w = ctx.measureText(text).width + 3 * pad, h = fs + 2 * pad; ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x - w / 2, y, w, h, 2 * pad); ctx.fill(); ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y + h / 2); };
      const fresh = new Map((snap.diseases || []).map(d => [d.name, d.firstYear]));
      for (const s of opt.outbreaks ? this.geoSites : []) {
        let total = 0, top = null, topN = 0; for (const [name, n] of Object.entries(s.sick || {})) { total += n; if (n > topN) { topN = n; top = name; } }
        const isNew = top && fresh.get(top) != null && fresh.get(top) >= snap.year - 2;
        if (!total || (total < 8 && total / Math.max(1, s.population) < 0.03 && !isNew)) continue;
        const zs = Math.min(1, 1.4 / css); ctx.strokeStyle = isNew ? 'rgba(239,68,68,.95)' : 'rgba(236,72,153,.8)'; ctx.lineWidth = (isNew ? 3 : 2) * zs; ctx.setLineDash([2 * zs, 3 * zs]); ctx.beginPath(); ctx.arc(s.px, s.py, s.r + (13 + (isNew ? pulse * 4 : 0)) * zs, 0, 7); ctx.stroke(); ctx.setLineDash([]);
        pill(isNew ? `☣ NEW · ${top} · ${total} sick` : `☣ ${total} sick`, s.px, s.py + s.r + 16 / css, isNew ? 'rgba(185,28,28,.94)' : 'rgba(157,23,77,.88)', '#fff', 9.5 / css);
      }
      for (const a of opt.armies ? snap.armies || [] : []) {
        const col = this.countryColor(a.country), pos = this.expPos(a, now, 'army:' + a.id), obj = this.geoSites.find(x => x.id === a.objective);
        ctx.strokeStyle = 'rgba(239,68,68,.6)'; ctx.lineWidth = 2.4; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
        a.path.forEach(([x, y], i) => { if (i > pos.idx) ctx.lineTo((x + 0.5) * cw, (y + 0.5) * ch); }); if (obj) ctx.lineTo(obj.px, obj.py); ctx.stroke(); ctx.setLineDash([]);
        if (obj && a.state === 'besieging') { ctx.strokeStyle = `rgba(239,68,68,${0.55 + pulse * 0.4})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(obj.px, obj.py, obj.r + 8 + pulse * 3, 0, 7); ctx.stroke(); }
        const bob = Math.sin(now / 180 + a.id) * 1.2, un = this.unitsOf(a.country);
        this.sc(ctx, pos.x, pos.y, css, (x, y) => drawArmy(ctx, un.weapon, x, y, col, bob, un.era));
        pill(`⚔ ${a.countryName} ${this.unitsOf(a.country).army} · ${a.men}${a.state === 'besieging' ? ' · besieging ' + a.objectiveName : ''}`, pos.x, pos.y + 12, 'rgba(127,29,29,.92)', '#fff', 9.5 / css);
      }
      for (const c of opt.merchants ? snap.caravans || [] : []) {
        const col = this.countryColor(c.country), pos = this.expPos(c, now, 'car:' + c.id), big = c.size >= 40, sea = c.mode === 'sea', bob = Math.sin(now / 220 + c.id) * 1;
        ctx.strokeStyle = rgba(sea ? '#7dd3fc' : '#fbbf24', 0.5); ctx.lineWidth = 1.8; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
        c.path.forEach(([x, y], i) => { if (i > pos.idx) ctx.lineTo((x + 0.5) * cw, (y + 0.5) * ch); }); ctx.stroke(); ctx.setLineDash([]);
        if (big) { ctx.strokeStyle = `rgba(250,204,21,${0.6 + pulse * 0.4})`; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(pos.x, pos.y, 11 + pulse * 1.5, 0, 7); ctx.stroke(); }
        const k = big ? 1.25 : 0.9, uc = this.unitsOf(c.country);
        this.sc(ctx, pos.x, pos.y, css, (x, y) => { if (sea) drawShip(ctx, uc.ship, x, y, col, bob, big, uc.era); else drawCart(ctx, uc.cart, x, y, col, bob, k, uc.era); });
        bulb(ctx, pos.x - 8 * k, pos.y - 8 * k);
        if (c.carries) { ctx.fillStyle = '#84cc16'; ctx.strokeStyle = '#1a2e05'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(pos.x + 8 * k, pos.y - 8 * k, 4.2, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#1a2e05'; ctx.font = "700 7px 'Segoe UI',sans-serif"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('☣', pos.x + 8 * k, pos.y - 8 * k + 0.5); }
        if (big || c.carries || css >= 1.8) pill(`${big ? 'Large caravan' : 'Merchants'} · ${c.size} · ${c.cargo}${c.carries ? ' · carrying ' + c.carries : ''}`, pos.x, pos.y + 11 * k, c.carries ? 'rgba(54,83,20,.94)' : 'rgba(69,26,3,.9)', '#fff', 9 / css);
      }
      for (const e of opt.settlers ? snap.expeditions || [] : []) {
        const col = this.countryColor(e.country), pos = this.expPos(e, now), tx = (e.target[0] + 0.5) * cw, ty = (e.target[1] + 0.5) * ch, sea = e.mode === 'sea', founders = e.kind === 'found';
        ctx.lineCap = 'round';
        ctx.strokeStyle = rgba(sea ? '#e0f2fe' : col, sea ? 0.8 : 0.9); ctx.lineWidth = founders ? 3 : 1.8; ctx.beginPath();
        e.path.forEach(([x, y], i) => { if (i > pos.idx + 0.01) return; const X = (x + 0.5) * cw, Y = (y + 0.5) * ch; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
        ctx.lineTo(pos.x, pos.y); ctx.stroke();
        ctx.strokeStyle = rgba(sea ? '#bae6fd' : col, 0.55); ctx.lineWidth = founders ? 2.2 : 1.4; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
        e.path.forEach(([x, y], i) => { if (i <= pos.idx) return; ctx.lineTo((x + 0.5) * cw, (y + 0.5) * ch); }); ctx.stroke(); ctx.setLineDash([]);
        if (founders) {
          ctx.strokeStyle = rgba(col, 0.6 + pulse * 0.4); ctx.lineWidth = 2; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(tx, ty, 8 + pulse * 2, 0, 7); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = rgba(col, 0.9); ctx.font = "800 11px 'Segoe UI',sans-serif"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('+', tx, ty + 0.5);
        }
        const bob = Math.sin(now / 160 + e.id) * 1.2;
        if (!founders) { for (const [dx, dy] of [[-3, 1], [3, 2], [0, 4]]) { ctx.fillStyle = col; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(pos.x + dx, pos.y + dy + bob, 2, 0, 7); ctx.fill(); ctx.stroke(); } if (css >= 2) pill(`${e.people} ${e.kind === 'refugee' ? 'refugees' : 'migrants'}`, pos.x, pos.y + 8, 'rgba(8,12,34,.85)', '#fff', 9 / css); continue; }
        if (sea) {
          this.sc(ctx, pos.x, pos.y, css, (x, y) => drawShip(ctx, this.unitsOf(e.country).ship, x, y, col, bob, true, this.unitsOf(e.country).era));
        } else {
          ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(pos.x, pos.y + 6, 7, 2.5, 0, 0, 7); ctx.fill();
          for (const [dx, dy] of [[-5, 3], [5, 3], [0, 5]]) { ctx.fillStyle = '#fff'; ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(pos.x + dx, pos.y + dy + bob, 2.7, 0, 7); ctx.fill(); ctx.stroke(); }
          ctx.strokeStyle = '#3f3f46'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(pos.x, pos.y + 2 + bob); ctx.lineTo(pos.x, pos.y - 13 + bob); ctx.stroke();
          pennant(ctx, this.unitsOf(e.country).era, pos.x, pos.y - 13 + bob + Math.sin(now / 220) * 1.2, col);
        }
        if (e.kind === 'emigrant') bulb(ctx, pos.x + 9, pos.y - 12);
        if (css >= 0.9) pill(`${e.people} ${e.kind === 'emigrant' ? 'newcomers' : 'settlers'}${sea ? ' · by sea' : ''}`, pos.x, pos.y + 12, 'rgba(8,12,34,.88)', '#fff', 9.5 / css);
      }
    }
    this.drawNames(ctx);
    const h = this.hover; if (!h) return;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.shadowColor = '#fff'; ctx.shadowBlur = 12;
    if (h.type === 'cell') { ctx.shadowBlur = 0; ctx.strokeRect(h.cx * this.cw + 1, h.cy * this.ch + 1, this.cw - 2, this.ch - 2); }
    else if (h.type === 'building') { ctx.shadowBlur = 6; ctx.strokeRect(h.x - h.half, h.y - h.half, h.half * 2, h.half * 2); }
    else if (h.type === 'person') { ctx.beginPath(); ctx.arc(h.x, h.y, this.dotR + 4, 0, 7); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(h.x, h.y, (h.r || 10) + 8, 0, 7); ctx.stroke(); }
    ctx.shadowBlur = 0;
  }

  // ------------------------------------------------------------------ hit testing
  find(e) {
    const rect = this.host.getBoundingClientRect(), vx = ((e.clientX - rect.left) / rect.width * W - this.panX) / this.zoom, vy = ((e.clientY - rect.top) / rect.height * H - this.panY) / this.zoom;
    if (this.view === 'geo' || this.view === 'political') return this.findGeo(vx, vy);
    const reach = Math.max(3, 8 / (rect.width / W * this.zoom));
    for (const site of this.sites) {
      const L = site.label;
      if (L && vx >= L.x && vx <= L.x + L.w && vy >= L.y && vy <= L.y + L.h) return { type: 'settlement', id: site.id, x: site.x, y: site.y, r: site.r, item: site };
    }
    let best = null, bd = Infinity;
    for (const site of this.sites) {
      const d = Math.hypot(vx - site.x, vy - site.y);
      if (d > site.r + 8) continue;
      if (this.showPeople && d < site.r - 4) {
        for (let i = site.dotStart; i < site.dotEnd; i++) {
          const dot = this.dots[i], dd = Math.hypot(vx - dot.x, vy - dot.y);
          if (dd < reach && dd < bd) { bd = dd; best = { type: 'person', id: dot.person.id, x: dot.x, y: dot.y, item: dot.person, site }; }
        }
        if (best) return best;
      }
      return { type: 'settlement', id: site.id, x: site.x, y: site.y, r: site.r, item: site };
    }
    return null;
  }

  findGeo(vx, vy) {
    const g = this.snap?.geo; if (!g) return null;
    const now = performance.now(), slack = Math.max(0, 6 / this.zoom), political = this.view === 'political';
    const gopt = this.geoOpts;
    for (const ex of political || !gopt.settlers ? [] : this.snap.expeditions || []) {
      const p = this.expPos(ex, now);
      if (Math.hypot(vx - p.x, vy - p.y) <= 11 + slack) return { type: 'expedition', id: ex.id, x: p.x, y: p.y, r: 10, item: ex };
    }
    for (const a of political || !gopt.armies ? [] : this.snap.armies || []) { const p = this.expPos(a, now, 'army:' + a.id); if (Math.hypot(vx - p.x, vy - p.y) <= 12 + slack) return { type: 'army', id: a.id, x: p.x, y: p.y, r: 11, item: { ...a, unit: this.unitsOf(a.country).army } }; }
    for (const c of political || !gopt.merchants ? [] : this.snap.caravans || []) { const p = this.expPos(c, now, 'car:' + c.id); if (Math.hypot(vx - p.x, vy - p.y) <= 10 + slack) return { type: 'caravan', id: c.id, x: p.x, y: p.y, r: 10, item: c }; }
    if (this.spritesShown) { let hb = null, hd = Infinity; for (const b of this.spriteBoxes) { const d = Math.max(Math.abs(vx - b.x), Math.abs(vy - b.y)); if (d <= b.half && d < hd) { hd = d; hb = b; } } if (hb) return { type: 'building', id: `${hb.sid}:${hb.kind}:${Math.round(hb.x)},${Math.round(hb.y)}`, x: hb.x, y: hb.y, half: hb.half, sid: hb.sid, item: hb }; }
    let best = null, bd = Infinity;
    for (const s of this.geoSites) { const d = Math.hypot(vx - s.px, vy - s.py); if (d <= s.r + 5 + slack && d < bd) { bd = d; best = s; } }
    if (best) return { type: 'settlement', id: best.id, x: best.px, y: best.py, r: best.r, item: best };
    const cx = Math.floor(vx / this.cw), cy = Math.floor(vy / this.ch);
    if (cx < 0 || cy < 0 || cx >= g.w || cy >= g.h) return null;
    const k = g.terrain[cy][cx], own = this.owner[cy]?.[cx], c = this.snap.countries.find(x => x.id === own), res = this.deposits.get(cy * g.w + cx) || [];
    return { type: 'cell', id: `${cx},${cy}`, cx, cy, item: political ? { terrain: null, owner: c ? c.name : null, contested: this.contested.has(cy * g.w + cx), x: cx, y: cy } : { terrain: TERRAIN[k].name, owner: c ? c.name : null, river: g.river[cy][cx] === '1', deposits: res, features: this.features.get(cy * g.w + cx) || '', soil: g.soil[cy][cx], contested: this.contested.has(cy * g.w + cx), x: cx, y: cy } };
  }

  pointer(e) {
    if (this.drag) {
      const rect = this.host.getBoundingClientRect(), dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y;
      if (this.moved || Math.abs(dx) + Math.abs(dy) > 5) {
        this.moved = true; this.panX = this.drag.px + dx / rect.width * W; this.panY = this.drag.py + dy / rect.height * H;
        this.clampPan(); this.host.style.cursor = 'grabbing'; this.setHover(null); if (!this.frame) this.frame = requestAnimationFrame(() => { this.frame = 0; this.redraw(); });
        return;
      }
    }
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => { this.frame = 0; this.setHover(this.find(e), e); });
  }

  setHover(hit, e) {
    const same = (!hit && !this.hover) || (hit && this.hover && hit.type === this.hover.type && hit.id === this.hover.id);
    this.hover = hit; this.host.style.cursor = hit && hit.type !== 'cell' ? 'pointer' : 'default';
    if (!same) this.drawOver();
    this.onHover?.(hit, e);
  }
}
