import { BrowserSimulation } from './bridge.js';
import { $, $$, esc, num, quote, initials, icon, PALETTE, JOBS, JOB_COLORS, CATEGORY_COLORS, CONDITION_COLORS } from './util.js';
import { WorldMap, MODES, TERRAIN, RESOURCES, FEATURES, BUILD_STYLE, HAZARD_STYLE, WONDERS } from './worldmap.js';
import { headlines } from './news.js';
import { Console } from './ui/console.js';
import { InfluenceBar } from './ui/influences.js';
import { Pings } from './ui/pings.js';
import { unitDialogs, findUnit, UNIT_TYPES } from './ui/units.js';
import { Editor } from './ui/editor.js';
import { playerPanel, PlayerMarker, choiceHtml, setTab } from './ui/player.js';

const SECTIONS = [
  ['overview', 'Overview', 'grid', 'Key numbers, the live world map, and recent events.'],
  ['map', 'World map', 'map', 'The full map: terrain, borders, roads, buildings, settlers, and disasters.'],
  ['countries', 'Countries', 'flag', 'Government, economy, and condition of every country.'],
  ['settlements', 'Settlements', 'home', 'Every village and town, with its residents.'],
  ['people', 'People', 'users', 'Search, filter, and inspect every individual.'],
  ['development', 'Settlers & building', 'hammer', 'Parties founding new towns, and what is being built where.'],
  ['systems', 'Systems', 'network', 'How politics, science, culture, health, war, and geography shape each other.'],
  ['economy', 'Economy', 'coins', 'Resource deposits, stockpiles, prices, trade, and each country\'s government.'],
  ['demographics', 'Demographics', 'chart', 'Ages, occupations, and wealth across the population.'],
  ['discoveries', 'Discoveries', 'bulb', 'Technologies and innovations by country.'],
  ['tech', 'Tech tree', 'tree', 'Fifteen ages of discovery: what each country knows, is researching, and what it unlocks.'],
  ['health', 'Health', 'pulse', 'Diseases, active infections, and outbreaks.'],
  ['wars', 'Wars', 'swords', 'Active conflicts and peace negotiations.'],
  ['events', 'Event log', 'list', 'Everything that has happened, newest first.'],
  ['person', 'My person', 'user', 'The person you are playing: choose what they do each season.']
];
const EV_ICONS = { war: 'swords', sickness: 'pulse', disease: 'pulse', discovery: 'bulb', discoveries: 'bulb', political: 'flag', creative: 'star', disaster: 'bolt', population: 'users', lineage: 'dna' };
const PAGE = 48;

let sim, snap, idx, section = 'overview', busy = false, playing = false, running = false, stopFlag = false, dialog = null;
let resume = null; // what a decision interrupted: 'play', or the number of years still to run. Answering it carries on.
let mapMode = 'country', showPeople = true;
const view = { search: '', country: '', job: '', status: 'living', infected: false, sort: 'fame', page: 0, eventCat: '', techOnly: '' };

const TECH_COLORS = { agriculture: '#65a30d', industry: '#d97706', energy: '#eab308', construction: '#92400e', warfare: '#dc2626', seafaring: '#0284c7', trade: '#ca8a04', knowledge: '#6366f1', medicine: '#10b981', culture: '#db2777', governance: '#a855f7' };
let techCache = null, techScroll = null;
// Eras are vertical bands, branches are horizontal lanes, and each discovery sits right of everything it needs.
// every discovery a discovery depends on, including the members of its "needs one of" groups
const techNeeds = (tk, n) => [...tk.tree[n][0], ...(((tk.any || {})[n] || []).flat())];
function techLayout(tk) {
  if (techCache && techCache.key === tk) return techCache;
  const names = Object.keys(tk.tree), W = 150, H = 36, GX = 34, GY = 4, LEFT = 96, TOP = 40, LANEGAP = 8, col = {}, span = [];
  let start = 0;
  for (let e = 0; e < tk.eras.length; e++) {
    let todo = names.filter(n => tk.tree[n][3] === e), max = start;
    while (todo.length) {
      const rest = [];
      for (const n of todo) {
        const needs = techNeeds(tk, n);
        if (needs.every(p => p in col)) { col[n] = Math.max(start, ...needs.map(p => col[p] + 1)); max = Math.max(max, col[n]); } else rest.push(n);
      }
      if (rest.length === todo.length) { for (const n of rest) col[n] = start; break; }
      todo = rest;
    }
    span.push({ start, end: max }); start = max + 1;
  }
  const slot = {}, rows = {}, laneIndex = Object.fromEntries(tk.branches.map((b, i) => [b, i]));
  const count = {}, lane = n => laneIndex[tk.tree[n][4]];
  for (const n of names) { const key = `${lane(n)}:${col[n]}`; count[key] = (count[key] ?? 0) + 1; rows[lane(n)] = Math.max(rows[lane(n)] || 1, count[key]); }
  const lanes = [], laneTop = [];
  let y = TOP;
  tk.branches.forEach((b, i) => { const h = (rows[i] || 1) * (H + GY) + LANEGAP; laneTop[i] = y; lanes.push({ name: b, top: y, height: h }); y += h; });
  // Inside a lane each discovery sits as close as it can to the height of what it needs, which keeps the lines short and uncrossed.
  const pos = {}, byCol = new Map();
  for (const n of names) { const key = `${lane(n)}:${col[n]}`; if (!byCol.has(key)) byCol.set(key, []); byCol.get(key).push(n); }
  const groups = [...byCol.entries()].map(([key, list]) => ({ lane: Number(key.split(':')[0]), col: Number(key.split(':')[1]), list })).sort((a, b) => a.col - b.col);
  for (const g of groups) {
    const top = laneTop[g.lane], n = rows[g.lane] || 1, free = Array(n).fill(true);
    const want = nm => { const ys = techNeeds(tk, nm).map(p => pos[p]?.y + H / 2).filter(v => v === v); return ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : top + (n * (H + GY)) / 2; };
    const order = g.list.map(nm => ({ nm, w: want(nm) })).sort((a, b) => a.w - b.w);
    for (const { nm, w } of order) {
      const ideal = Math.min(n - 1, Math.max(0, Math.round((w - top - H / 2) / (H + GY))));
      let best = -1; for (let d = 0; d < n && best < 0; d++) for (const s of [ideal - d, ideal + d]) if (s >= 0 && s < n && free[s]) { best = s; break; }
      free[best] = false; slot[nm] = best;
      pos[nm] = { x: LEFT + col[nm] * (W + GX), y: top + best * (H + GY) + 4 };
    }
  }
  const bands = span.map(s => ({ x0: LEFT + s.start * (W + GX) - GX / 2, x1: LEFT + (s.end + 1) * (W + GX) - GX / 2 }));
  // Every line is one smooth S-curve: it leaves its prerequisite level, eases to the height of the discovery it leads to, and arrives level.
  const paths = [];
  for (const n of names) for (const p of techNeeds(tk, n)) {
    const x1 = pos[p].x + W, y1 = pos[p].y + H / 2, x2 = pos[n].x, y2 = pos[n].y + H / 2, dx = Math.max(24, Math.min((x2 - x1) * 0.5, 170));
    paths.push({ from: p, to: n, d: `M${x1.toFixed(1)} ${y1.toFixed(1)} C${(x1 + dx).toFixed(1)} ${y1.toFixed(1)} ${(x2 - dx).toFixed(1)} ${y2.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}` });
  }
  return (techCache = { key: tk, pos, lanes, paths, bands, width: LEFT + (start) * (W + GX), height: y + 8 });
}
function techFocus(name) {
  const svg = $('.techsvg'), canvas = $('.techcanvas'); if (!svg) return;
  const related = new Set([name]);
  svg.querySelectorAll('path').forEach(p => { const hit = !!name && (p.dataset.from === name || p.dataset.to === name); p.classList.toggle('hl', hit); if (hit) { related.add(p.dataset.from); related.add(p.dataset.to); } });
  svg.classList.toggle('focus', !!name); canvas.classList.toggle('focus', !!name);
  canvas.querySelectorAll('.tnode').forEach(n => n.classList.toggle('rel', !!name && related.has(n.dataset.tech)));
}
const KIND_ORDER = ['grain', 'pasture', 'fish', 'game', 'timber', 'stone', 'clay', 'iron', 'copper', 'coal', 'gold', 'furs', 'salt'];
const govLabel = k => snap?.governments?.[k]?.label || (k ? k.charAt(0).toUpperCase() + k.slice(1) : '');
const govBlurb = k => snap?.governments?.[k]?.blurb || '';
// ---------- data helpers ----------
const push = (map, key, value) => { const k = String(key); if (!map.has(k)) map.set(k, []); map.get(k).push(value); };
function setSnap(s) {
  storyCache = new Map();
  snap = s;
  idx = { people: new Map(), settlements: new Map(), countries: new Map(), cIndex: new Map(), living: [], kids: new Map(), residents: new Map() };
  s.countries.forEach((c, i) => { idx.countries.set(String(c.id), c); idx.cIndex.set(String(c.id), i); });
  s.settlements.forEach(x => idx.settlements.set(String(x.id), x));
  for (const p of s.people) {
    idx.people.set(String(p.id), p);
    if (p.alive !== false) { idx.living.push(p); push(idx.residents, p.settlement, p); }
    for (const parent of p.parents || []) push(idx.kids, parent, p);
  }
  if (map) { playerMark.update(s, map); map.setData(s); pings.update(s, map); renderTray(); }
}
const cc = id => PALETTE[(idx?.cIndex.get(String(id)) ?? 0) % PALETTE.length];
const activeCountries = () => snap.countries.filter(c => c.population > 0 || c.ended == null);
const livePlaces = () => snap.settlements.filter(s => !s.abandoned && s.population > 0);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const firstLine = t => String(t).split('\n').find(l => l.trim()) || 'Done.';
const randomSeed = () => 1 + Math.floor(Math.random() * 999999999);
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------- small components ----------
const kpi = (label, value, note, ic, color) => `<div class="kpi" style="--c:${color}"><span class="kpi-ic">${icon(ic)}</span><div><span class="kpi-label">${label}</span><strong>${value}</strong><small>${note}</small></div></div>`;
const panel = (title, sub, body, action = '', cls = '') => `<section class="panel ${cls}"><div class="panel-head"><div><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div>${action}</div>${body}</section>`;
const tag = (text, color) => `<span class="tag" style="--c:${color || '#64748b'}">${esc(text)}</span>`;
const meter = (label, value, color, max = 100) => `<div class="meter-row"><span>${label}</span><div class="meter"><i style="width:${Math.max(2, Math.min(100, value / max * 100))}%;background:${color}"></i></div><b>${num(value)}</b></div>`;
const hbar = (label, value, total, color, extra = '') => `<div class="hbar"><span>${esc(label)}</span><div class="meter"><i style="width:${total ? Math.max(1.5, value / total * 100) : 0}%;background:${color}"></i></div><b>${num(value)}${extra}</b></div>`;
const stat = (label, value) => `<div class="statbox"><span>${label}</span><b>${value}</b></div>`;
const empty = text => `<div class="empty">${text}</div>`;
const select = (id, key, options, current) => `<select id="${id}" data-filter="${key}">${options.map(([v, l]) => `<option value="${esc(v)}" ${String(v) === String(current) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
const countryOptions = () => [['', 'All countries'], ...activeCountries().map(c => [c.id, c.name])];
const searchBox = placeholder => `<label class="search">${icon('search')}<input id="search" placeholder="${placeholder}" value="${esc(view.search)}" autocomplete="off"></label>`;
const pager = (count) => { const pages = Math.max(1, Math.ceil(count / PAGE)); view.page = Math.min(view.page, pages - 1); return `<div class="pager"><button data-page="prev" ${view.page === 0 ? 'disabled' : ''}>← Previous</button><span>Page ${view.page + 1} of ${pages}</span><button data-page="next" ${view.page >= pages - 1 ? 'disabled' : ''}>Next →</button></div>`; };

const personCard = p => `<button class="person-card ${p.alive === false ? 'gone' : ''}" data-person="${p.id}" style="--c:${cc(p.country)}"><span class="avatar">${esc(initials(p.name))}</span><span class="pc-body"><b>${esc(p.name)}</b><small>${esc(p.role || p.job || 'resident')} · age ${p.age}${p.alive === false ? ' · deceased' : ''}</small><small>${esc(p.settlementName)} · #${p.id}</small></span>${p.infection ? `<i class="sick" title="${esc(p.infection)}"></i>` : ''}</button>`;
const placeCard = s => {
  const max = Math.max(1, ...snap.settlements.map(x => x.population));
  return `<article class="place-card ${s.abandoned ? 'gone' : ''}" style="--c:${cc(s.country)}" data-settlement="${s.id}" role="button" tabindex="0"><div class="pl-top"><span>${esc(s.kind || 'settlement')}</span>${s.capital ? tag('★ Capital', '#f59e0b') : ''}${s.abandoned ? tag('Abandoned', '#ef4444') : ''}</div><h3>${esc(s.name)}</h3><p><i class="dot"></i>${esc(s.countryName)} · ${esc(s.terrainText || '')}</p><div class="meter"><i style="width:${Math.max(2, s.population / max * 100)}%"></i></div><div class="pl-foot"><b>${num(s.population)}</b> residents<small>#${s.id}</small></div></article>`;
};
const eventRow = e => `<div class="event" style="--c:${CATEGORY_COLORS[e.category] || '#64748b'}"><span class="ev-ic">${icon(EV_ICONS[e.category] || 'list')}</span><div><p>${esc(e.message)}</p><small><b>${esc(e.category)}</b> · Year ${esc(e.year)}</small></div></div>`;
const eventList = (events, limit) => events.slice(-limit).reverse().map(eventRow).join('') || empty('No events yet. Advance a year.');

function lineChart(vals, color, years) {
  if (vals.length < 2) return empty('Advance a year to start the chart.');
  const min = Math.min(...vals), max = Math.max(...vals), span = max - min || 1, id = 'g' + color.slice(1);
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * 600},${110 - ((v - min) / span) * 95}`).join(' ');
  return `<div class="chart"><div class="chart-y"><span>${num(max)}</span><span>${num(min)}</span></div><svg viewBox="0 0 600 120" preserveAspectRatio="none"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".35"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><polygon points="0,120 ${pts} 600,120" fill="url(#${id})"/><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2.6" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg><div class="chart-x"><span>Year ${years[0]}</span><span>Year ${years.at(-1)}</span></div></div>`;
}
function pairChart(reports) {
  if (!reports.length) return empty('Advance a year to start the chart.');
  const rows = reports.slice(-40), max = Math.max(1, ...rows.flatMap(r => [r.births, r.deaths]));
  return `<div class="chart"><div class="pairs">${rows.map(r => `<div class="pair" title="Year ${r.year}: ${r.births} births, ${r.deaths} deaths"><i style="height:${r.births / max * 100}%;background:#10b981"></i><i style="height:${r.deaths / max * 100}%;background:#f43f5e"></i></div>`).join('')}</div><div class="chart-x"><span>Year ${rows[0].year}</span><span class="lg-inline"><i style="background:#10b981"></i>Births <i style="background:#f43f5e"></i>Deaths</span><span>Year ${rows.at(-1).year}</span></div></div>`;
}

let newsItems = [], mapView = 'geo';
const geoOn = { terrain: true, rivers: true, borders: true, roads: true, resources: false, buildings: true, names: true, contested: true, settlers: true, armies: true, merchants: true, projects: true, outbreaks: true, disasters: true, labels: true };
const diseaseCounts = name => snap.healthStats?.diseases[name]?.counts || [0, 0, 0, 0];
function outcomeBar(sick, rec, died, cases) {
  const other = Math.max(0, cases - sick - rec - died), seg = (v, c, l) => (v ? `<i style="flex:${v};background:${c}" title="${l}: ${num(v)}"></i>` : '');
  return `<div class="obar">${seg(sick, '#f97316', 'Infected now')}${seg(rec, '#10b981', 'Recovered')}${seg(died, '#ef4444', 'Died')}${seg(other, '#cbd5e1', 'Cured by editor or other')}${cases ? '' : '<i style="flex:1;background:#e7e9f6"></i>'}</div>`;
}
const outcomeLegend = (sick, rec, died) => `<div class="obar-legend"><span><i style="background:#f97316"></i>Infected now <b>${num(sick)}</b></span><span><i style="background:#10b981"></i>Recovered <b>${num(rec)}</b></span><span><i style="background:#ef4444"></i>Died <b>${num(died)}</b></span></div>`;
function triChart(rows) {
  if (!rows.length) return empty('No infections recorded yet.');
  const sel = rows.slice(-30), max = Math.max(1, ...sel.flatMap(r => [r[1], r[2], r[3]]));
  return `<div class="chart"><div class="pairs tri">${sel.map(r => `<div class="pair" title="Year ${r[0]}: ${r[1]} infected, ${r[2]} recovered, ${r[3]} died"><i style="height:${r[1] / max * 100}%;background:#f97316"></i><i style="height:${r[2] / max * 100}%;background:#10b981"></i><i style="height:${r[3] / max * 100}%;background:#ef4444"></i></div>`).join('')}</div><div class="chart-x"><span>Year ${sel[0][0]}</span><span class="lg-inline"><i style="background:#f97316"></i>New cases<i style="background:#10b981"></i>Recovered<i style="background:#ef4444"></i>Died</span><span>Year ${sel.at(-1)[0]}</span></div></div>`;
}
const cureStatus = d => (d.cure >= 100 ? (d.active ? tag(`Cure ready · ${num(d.active)} still infected`, '#f59e0b') : tag('Ready to eradicate', '#10b981')) : tag(`Cure ${d.cure.toFixed(0)}%`, '#14b8a6'));

const HAZARDS = ['flood', 'storm', 'wildfire', 'earthquake', 'landslide', 'blizzard'];
const LAYERS = [
  ['terrain', 'Terrain', 'Land colours; off shows only water and land'], ['rivers', 'Rivers'], ['borders', 'Borders'], ['roads', 'Roads'], ['resources', 'Resources', 'Deposit pies on each tile'],
  ['buildings', 'Buildings', 'Houses and building sprites in settlements'], ['contested', 'War zones', 'Red-tinted tiles that two countries fight over'], ['names', 'Names'],
  ['settlers', 'Settlers', 'Parties walking or sailing to found new towns, and refugees'], ['armies', 'Armies', 'Marching soldiers, their routes, and the red pulsing ring around a besieged town'],
  ['merchants', 'Merchants', 'Caravans and trading ships'], ['projects', 'Construction', 'The yellow ring with a hammer: something is being built there; the arc shows progress'],
  ['outbreaks', 'Outbreaks', 'The dotted pink or red ring: sick residents. Red and NEW means a fresh epidemic'], ['disasters', 'Disasters', 'Expanding coloured rings where a flood, storm, fire or quake just struck'],
  ['labels', 'Labels', 'The text pills on armies, merchants, settlers and outbreaks']
];
let hazardKind = '', hazardData = null, hazardSeed = null;
const cellXY = (s) => { const g = snap.geo; return [(s.gx + 0.5) * (1000 / g.w), (s.gy + 0.5) * (600 / g.h)]; };
const etaYears = e => Math.max(1, Math.ceil(e.costs.slice(e.index).reduce((n, c) => n + c, 0) / 9));
const buildLabel = k => snap.buildingCatalog?.[k]?.[0] || cap(k);
const bchip = (k, year) => { const [letter, color] = BUILD_STYLE[k] || ['?', '#64748b']; return `<span class="bchip" style="--c:${color}" title="${esc(snap.buildingCatalog?.[k]?.[5] || '')}"><b>${letter}</b>${esc(buildLabel(k))}${year != null ? `<small>y${year}</small>` : ''}</span>`; };
const progressBar = (value, color) => `<div class="meter prog"><i style="width:${Math.max(2, Math.min(100, value * 100))}%;background:${color || 'var(--brand)'}"></i></div>`;

function mapTools() {
  if (mapView === 'political') {
    return `<div class="layers">${[['buildings', 'Buildings'], ['contested', 'War zones'], ['names', 'Names']].map(([k, l]) => `<label class="chk"><input type="checkbox" data-geo="${k}" ${geoOn[k] ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>`;
  }
  if (mapView === 'geo') {
    return `<div class="layers">${LAYERS.map(([k, l, tip]) => `<label class="chk" ${tip ? `title="${esc(tip)}"` : ''}><input type="checkbox" data-geo="${k}" ${geoOn[k] ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div><label class="haz"><span>Hazard map</span><select id="hazard-select">${[['', 'Off'], ...HAZARDS.map(h => [h, cap(h)])].map(([v, l]) => `<option value="${v}" ${hazardKind === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>`;
  }
  return `<div class="seg" role="group" aria-label="Color people by">${MODES.map(([k, l]) => `<button data-map-mode="${k}" class="${mapMode === k ? 'on' : ''}">${l}</button>`).join('')}</div><label class="switch"><input type="checkbox" id="map-people" ${showPeople ? 'checked' : ''}><span></span>Individuals</label>`;
}

function mapKey(politicalOnly = false) {
  const cat = snap.buildingCatalog || {};
  const buildings = `<div><b>Settlements</b><span class="lg"><i class="sq" style="background:#c9b48a">▫</i>Village: one tile, a few huts</span><span class="lg"><i class="sq" style="background:#c9b48a">⌂</i>Town: a cross of tiles with houses and workshops</span><span class="lg"><i class="sq" style="background:#c9b48a">▦</i>City: seat of government in the middle, buildings around it</span><span class="lg"><i class="sq" style="background:#d4a017">★</i>Capital</span><span class="lg">Hover any building to read its name. Styles change with each age.</span></div>`;
  if (politicalOnly) return `<details class="mapkey"><summary>Map key</summary><div class="keygrid">${buildings}<div><b>Politics</b><span class="lg"><i class="sq" style="background:#d4a017">♛</i>Wonder</span><span class="lg"><i class="ring2"></i>Ringed circle = capital</span><span class="lg"><i class="war"></i>Red tint = contested tiles in an active war</span><span class="lg"><i class="wall"></i>Heavy ring = walled town</span></div></div></details>`;
  return `<details class="mapkey"><summary>Map key</summary><div class="keygrid"><div><b>Resources</b>${Object.values(RESOURCES).map(r => `<span class="lg"><i style="background:${r.color}"></i>${r.name}</span>`).join('')}</div>${buildings}<div><b>On the map</b><span class="lg"><i class="flagk"></i>Settlers on the road, or a boat at sea</span><span class="lg"><i class="sq" style="background:#b91c1c">⚔</i>Army with its soldier count</span><span class="lg"><i class="sq" style="background:#a16207">▭</i>Merchant band (gold ring = large)</span><span class="lg"><i class="sq" style="background:#be123c">☣</i>Epidemic (NEW = first seen lately)</span><span class="lg"><i class="sq" style="background:#d4a017">♛</i>Wonder (one of each per country)</span><span class="lg"><i class="ring"></i>Under construction (ring = progress)</span><span class="lg"><i class="road"></i>Road</span><span class="lg"><i class="riv"></i>River</span><span class="lg"><i class="war"></i>Red tint = contested tiles in a war</span></div></div></details>`;
}

function mapPanel(big) {
  const geoView = mapView !== 'clusters', top = livePlaces().slice().sort((a, b) => b.population - a.population).slice(0, big ? 18 : 10);
  return `<section class="panel map-panel ${big ? 'big' : ''}"><div class="panel-head"><div><h2>World map</h2><p>${mapView === 'political' ? 'Countries, borders, settlements, and buildings only.' : geoView ? 'Terrain, rivers, borders, roads, buildings, settlers on the move, and disasters as they strike.' : 'Each dot is a person; each cluster is a settlement.'}</p></div><div class="seg" role="group" aria-label="Map view"><button data-map-view="clusters" class="${mapView === 'clusters' ? 'on' : ''}">${icon('users')} People</button><button data-map-view="geo" class="${mapView === 'geo' ? 'on' : ''}">${icon('map')} Geography</button><button data-map-view="political" class="${mapView === 'political' ? 'on' : ''}">${icon('flag')} Political</button></div></div><div class="map-tools">${mapTools()}<span class="map-hint">Scroll to zoom · drag to pan · ⤢ resets</span></div><div id="map-slot"></div><div class="legend" id="map-legend"></div>${geoView ? mapKey(mapView === 'political') : ''}<div class="chips"><span class="chips-label">Jump to</span>${top.map(s => `<button class="chip" data-focus-settlement="${s.id}" style="--c:${cc(s.country)}"><i></i>${esc(s.name)} <b>${num(s.population)}</b></button>`).join('')}</div></section>`;
}

const parties = () => snap.expeditions.filter(e => e.kind === 'found');
const liveExpeditions = (limit = 6) => panel('Settlers on the road', `${parties().length} ${parties().length === 1 ? 'party' : 'parties'} traveling`, parties().length ? `<div class="rows">${parties().slice(0, limit).map(e => `<div class="lrow" style="--c:${cc(e.country)}"><span class="flag-dot sm">${esc(initials(e.countryName).charAt(0))}</span><div><b>${esc(e.countryName)} · ${e.people} ${e.kind === 'found' ? 'settlers' : 'migrants'}</b><small>${esc(e.originName)} ${e.mode === 'sea' ? '⛵' : '→'} ${e.kind === 'found' ? `a new town at ${e.target[0]},${e.target[1]}` : esc(e.targetName || 'a new home')} · ${e.index} of ${e.path.length - 1} steps · about ${etaYears(e)} yr</small>${progressBar(e.index / Math.max(1, e.path.length - 1), cc(e.country))}</div><button class="soft" data-focus-exp="${e.id}">Follow</button></div>`).join('')}</div>` : empty('Nobody is on the road. Settlers leave when a town grows large and the country is stable.'));
const liveProjects = (limit = 6) => panel('Under construction', `${snap.projects.length} ${snap.projects.length === 1 ? 'project' : 'projects'}`, snap.projects.length ? `<div class="rows">${snap.projects.slice().sort((a, b) => b.progress - a.progress).slice(0, limit).map(p => `<div class="lrow" style="--c:${cc(snap.settlements.find(s => s.id === p.settlement)?.country)}"><span class="flag-dot sm">${icon('hammer')}</span><div><b>${esc(p.label)}</b><small>${esc(p.settlementName)}, ${esc(p.countryName)} · ${num(p.workers)} workers · ${Math.round(p.progress * 100)}%</small>${progressBar(p.progress, '#f59e0b')}</div><button class="soft" data-focus-settlement="${p.settlement}">Show</button></div>`).join('')}</div>` : empty('Nothing is being built right now.'));
const liveDisasters = (limit = 6) => panel('Recent disasters', 'Placed by terrain, rivers, coast and fault lines', snap.disasters.length ? `<div class="rows">${snap.disasters.slice(-limit).reverse().map(d => `<div class="lrow" style="--c:${HAZARD_STYLE[d.kind]}"><span class="flag-dot sm">${icon('bolt')}</span><div><b>${cap(d.severity)} ${d.kind}</b><small>Year ${d.year} · cell ${d.x},${d.y} · reached ${d.settlements.length} ${d.settlements.length === 1 ? 'settlement' : 'settlements'} · ${num(d.deaths)} dead</small></div><button class="soft" data-focus-cell="${d.x},${d.y}">Show</button></div>`).join('')}</div>` : empty('No disasters yet.'));


const liveArmies = (limit = 6) => panel('Armies on the march', `${snap.armies.length} ${snap.armies.length === 1 ? 'army' : 'armies'} in the field`, snap.armies.length ? `<div class="rows">${snap.armies.slice(0, limit).map(a => `<div class="lrow" style="--c:${cc(a.country)}"><span class="flag-dot sm">${icon('swords')}</span><div><b>${esc(a.countryName)} · ${num(a.men)} soldiers</b><small>${esc(a.originName)} → ${esc(a.objectiveName)} (${esc(a.enemyName)}) · ${a.state === 'besieging' ? 'besieging' : `${a.index} of ${a.path.length - 1} steps`}</small>${progressBar(a.index / Math.max(1, a.path.length - 1), '#ef4444')}</div><button class="soft" data-focus-army="${a.id}">Follow</button></div>`).join('')}</div>` : empty('No armies in the field. Wars send them out.'));
const liveCaravans = (limit = 6) => panel('Merchant bands', `${snap.caravans.length} on the road or sea`, snap.caravans.length ? `<div class="rows">${snap.caravans.slice().sort((a, b) => b.size - a.size).slice(0, limit).map(c => `<div class="lrow" style="--c:${cc(c.country)}"><span class="flag-dot sm">${icon(c.mode === 'sea' ? 'compass' : 'home')}</span><div><b>${c.size >= 40 ? 'Large band' : 'Band'} of ${c.size} ${esc(c.countryName)} merchants${c.carries ? ' ☣' : ''}</b><small>${esc(c.originName)} → ${esc(c.destName)} (${esc(c.partnerName)}) · ${esc(c.cargo)}${c.mode === 'sea' ? ' · by ship' : ''}${c.carries ? ' · carrying ' + esc(c.carries) : ''}</small>${progressBar(c.index / Math.max(1, c.path.length - 1), c.carries ? '#84cc16' : '#d97706')}</div><button class="soft" data-focus-caravan="${c.id}">Follow</button></div>`).join('')}</div>` : empty('No merchants are traveling. Trade grows with markets, harbors, roads and peace.'));
const liveOutbreaks = (limit = 6) => {
  const rows = snap.diseases.map(d => {
    const towns = snap.settlements.filter(s => s.sick && s.sick[d.name]).sort((a, b) => b.sick[d.name] - a.sick[d.name]);
    return { d, towns, fresh: d.firstYear != null && d.firstYear >= snap.year - 3 };
  }).filter(r => r.d.active).sort((a, b) => (b.fresh - a.fresh) || (b.d.active - a.d.active));
  return panel('Epidemics', 'New outbreaks are flagged on the map', rows.length ? `<div class="rows">${rows.slice(0, limit).map(({ d, towns, fresh }) => `<div class="lrow" style="--c:${fresh ? '#ef4444' : '#ec4899'}"><span class="flag-dot sm">${icon('pulse')}</span><div><b>${esc(d.name)} ${fresh ? '<span class="newtag">NEW</span>' : ''}</b><small>${num(d.active)} sick · since year ${d.firstYear ?? '?'} · worst in ${esc(towns.slice(0, 3).map(s => s.name + ' ' + s.sick[d.name]).join(', ') || '—')}</small></div><button class="soft" data-disease="${esc(d.name)}">Open</button></div>`).join('')}</div>` : empty('No active epidemics.'));
};

const TOPICS = { research: ['Science output', 'percent'], culture: ['Culture', 'plain'], stability: ['Stability per year', 'plain'], prosperity: ['Prosperity per year', 'plain'], food: ['Food target', 'plain'], infection: ['Disease spread', 'percent'], military: ['Military strength', 'percent'], expansion: ['Drive to found towns', 'percent'] };
const LINKS = [
  ['Geography', 'Science', 'Coasts, rivers and roads carry trade and ideas; isolated highlands slow research.'],
  ['Science', 'Construction', 'Technologies unlock buildings: granaries, schools, clinics, walls, harbors, mills.'],
  ['Construction', 'Science', 'Schools, libraries, universities and observatories raise research.'],
  ['Construction', 'Health', 'Wells, aqueducts and clinics slow disease and cut deaths; hospitals speed up cures.'],
  ['Health', 'Politics', 'Epidemics cut stability and prosperity and slow research.'],
  ['Politics', 'Construction', 'Monarchies build monuments and walls; councils build schools; capitalism builds markets and harbors.'],
  ['Culture', 'Politics', 'Performers, theaters and monuments raise national pride and stability.'],
  ['Politics', 'Culture', 'Stable, prosperous peace funds the arts; war suppresses them.'],
  ['War', 'Everything', 'War slows building, research and the arts, drains treasuries, spreads camp fever, and destroys buildings.'],
  ['Geography', 'War', 'Only bordering countries fight; terrain, rivers, walls and roads decide battles and supply.'],
  ['Geography', 'Disasters', 'Floods, storms, fires, quakes and slides strike where the terrain makes them likely, and reach across borders.'],
  ['Construction', 'Disasters', 'Levees, firebreaks and reinforced halls cut deaths; disasters can destroy buildings and send refugees.'],
  ['Politics', 'Expansion', 'Monarchies expand eagerly; unrest, quarantine and war hold settlers back.'],
  ['Expansion', 'Politics', 'New towns raise confidence, extend borders, and can provoke neighbors.'],
  ['Economy', 'Disease', 'Trade and crowding spread disease; floods spread waterborne disease.'],
  ['Disease', 'Science', 'Scientists and healers race to cure diseases; a complete cure allows eradication.']
];

// ---------- views ----------
const VIEWS = {
  person() { return playerPanel(snap.player, { esc, num, tag, stat, icon, cc, progressBar }); },
  overview() {
    const infected = idx.living.filter(p => p.infection).length, places = livePlaces(), countries = snap.countries.filter(c => c.population > 0);
    const found = new Set(snap.countries.flatMap(c => [...c.technologies, ...c.innovations])).size;
    const reports = (snap.reports || []).slice(-120);
    newsItems = headlines(snap, 7);
    const [lead, ...rest] = newsItems;
    const news = `<section class="panel news"><div class="news-head"><span class="live"><i></i>BREAKING NEWS</span><span class="news-year">Year ${snap.year}</span></div>
      <button class="lead-story" data-news="0" style="--c:${lead.color}"><span class="ntag">${lead.tag}</span><h2>${esc(lead.headline)}</h2>${lead.sub ? `<p>${esc(lead.sub)}</p>` : ''}</button>
      <div class="headlines">${rest.map((n, i) => `<button class="headline" data-news="${i + 1}" style="--c:${n.color}"><span class="ntag">${n.tag}</span><div><b>${esc(n.headline)}</b>${n.sub ? `<small>${esc(n.sub)}</small>` : ''}</div><time>Y${n.year}</time></button>`).join('')}</div>
      <button class="link news-more" data-tab="events">Full event log →</button></section>`;
    return `<div class="ov-grid"><div class="ov-main">
    <div class="kpis compact">${kpi('Population', num(snap.population), `+${num(snap.births)} / −${num(snap.deaths)} last year`, 'users', '#5b5bf0')}${kpi('Settlements', num(places.length), `${parties().length} settler parties · ${snap.projects.length} building`, 'home', '#14b8a6')}${kpi('Countries', num(countries.length), `${snap.countries.length - countries.length} dissolved`, 'flag', '#f97316')}${kpi('Infections', num(infected), `${snap.diseases.filter(d => d.active).length} ${snap.diseases.filter(d => d.active).length === 1 ? 'disease' : 'diseases'} active`, 'pulse', '#ef4444')}${kpi('Wars', num(snap.wars.length), snap.wars.length ? 'Active conflicts' : 'All at peace', 'swords', '#f59e0b')}${kpi('Discoveries', num(found), `of ${num(snap.catalog.foundations + snap.catalog.innovations)}`, 'bulb', '#8b5cf6')}</div>
    ${mapPanel(false)}
    <div class="grid-2 compact-charts">${panel('Population', `${num(snap.population)} living`, lineChart(reports.map(r => Number(r.population)), '#5b5bf0', reports.map(r => r.year)))}${panel('Births and deaths', 'Last 40 years', pairChart(snap.reports || []))}</div>
    </div><aside class="ov-side">${news}${panel('Countries', 'Click to inspect or edit.', `<div class="ctable">${snap.countries.filter(c => c.population > 0).map(c => `<button class="crow" data-country="${c.id}" style="--c:${cc(c.id)}"><span class="flag-dot">${esc(initials(c.name).charAt(0))}</span><span class="cr-name"><b>${esc(c.name)}</b><small>${esc(govLabel(c.government))} · ${esc(c.economicSystem)} · ${esc(c.eraName || '')}</small></span><span class="cr-bar"><div class="meter"><i style="width:${c.population / Math.max(1, snap.population) * 100}%"></i></div></span><b class="cr-pop">${num(c.population)}</b></button>`).join('') || empty('No countries have residents.')}</div>`, '<button class="link" data-tab="countries">Details →</button>')}</aside></div>`;
  },

  map() {
    return `${mapPanel(true)}<div class="grid-3">${liveExpeditions()}${liveArmies()}${liveCaravans()}</div><div class="grid-3">${liveOutbreaks()}${liveProjects()}${liveDisasters()}</div>`;
  },

  development() {
    const built = snap.settlements.filter(s => !s.abandoned && Object.keys(s.buildings || {}).length), total = built.reduce((n, s) => n + Object.keys(s.buildings).length, 0);
    return `<div class="kpis">${kpi('Settler parties', num(parties().length), 'Walking to new towns', 'compass', '#14b8a6')}${kpi('Building now', num(snap.projects.length), 'Projects in progress', 'hammer', '#f59e0b')}${kpi('Buildings standing', num(total), `in ${built.length} settlements`, 'home', '#6366f1')}${kpi('Road cells', num(snap.roads.length), 'Faster travel and trade', 'map', '#a16207')}</div>
    <div class="grid-2">${liveExpeditions(12)}${liveProjects(12)}</div>
    <div class="grid-2">${liveArmies(12)}${liveCaravans(12)}</div>
    ${panel('Buildings by settlement', 'Hover a badge for what it does', built.length ? `<div class="bgrid">${built.sort((a, b) => Object.keys(b.buildings).length - Object.keys(a.buildings).length).map(s => `<button class="bcard" data-settlement="${s.id}" style="--c:${cc(s.country)}"><b>${esc(s.name)}</b><small>${esc(s.countryName)}</small><div>${Object.entries(s.buildings).map(([k, y]) => bchip(k, y)).join('')}</div></button>`).join('')}</div>` : empty('No buildings yet. Settlements build as soon as their country has funds and a need.'))}`;
  },

  economy() {
    const list = snap.countries.filter(c => c.economy), c = list.find(x => String(x.id) === view.country) || list[0];
    if (!c) return empty('No economy yet. Advance a year so settlements can start working their land.');
    const e = c.economy, ds = snap.depositStats || { total: 0, exhausted: 0, worked: 0 }, pct = v => `${Math.round(v * 100)}%`;
    const tile = (label, value, note, color) => `<div class="stile" style="--c:${color}"><span>${label}</span><b>${value}</b><small>${note}</small></div>`;
    const rows = KIND_ORDER.map(k => {
      const info = snap.resourceInfo?.[k] || [k, '', 0, 0, 1], need = e.need[k] || 0, have = c.stock?.[k] || 0, made = e.made[k] || 0, imp = e.imports[k] || 0, exp = e.exports[k] || 0, short = e.deficit[k] > 0.5;
      const fill = Math.min(100, have / Math.max(1, need * 3) * 100);
      return `<tr class="${short ? 'short' : ''}"><td><i class="sw" style="background:${RESOURCES[k]?.color || '#999'}"></i>${esc(info[0])}<small>${esc(info[1])}</small></td><td class="bar"><div class="meter"><i style="width:${Math.max(2, fill)}%;background:${RESOURCES[k]?.color || '#999'}"></i></div></td><td>${num(have)}</td><td>${num(need)}</td><td>${num(made)}</td><td>${imp ? '+' + num(imp) : '—'}</td><td>${exp ? '−' + num(exp) : '—'}</td><td>${(e.prices[k] || 0).toFixed(1)}</td><td>${short ? '<b class="neg">short</b>' : '<span class="muted">ok</span>'}</td></tr>`;
    }).join('');
    const flows = (snap.tradeFlows || []).slice(0, 14).map(f => { const a = idx.countries.get(String(f.from)), b = idx.countries.get(String(f.to)); return `<div class="flow"><span style="--c:${cc(f.from)}">${esc(a?.name || '?')}</span><i>→</i><span style="--c:${cc(f.to)}">${esc(b?.name || '?')}</span><b>${num(f.qty)} t ${esc(snap.resourceInfo?.[f.kind]?.[0]?.toLowerCase() || f.kind)}</b><small>${num(f.value)} coins</small></div>`; }).join('');
    const compare = list.slice().sort((a, b) => b.economy.gdp - a.economy.gdp).map(x => `<tr data-country="${x.id}" class="clickable"><td><i class="sw" style="background:${cc(x.id)}"></i>${esc(x.name)}<small>${esc(govLabel(x.government))}</small></td><td>${num(x.economy.gdp)}</td><td>${num(x.economy.tax)}</td><td>${num(x.treasury)}</td><td>${pct(x.economy.food_ratio)}</td><td>${pct(x.economy.material_cover)}</td><td>${pct(x.economy.metal_cover)}</td></tr>`).join('');
    return `<div class="toolbar">${select('f-country', 'country', list.map(x => [x.id, x.name]), c.id)}<span class="grow"></span><button class="soft" data-report="${esc('economy ' + quote(c.name))}">${icon('list')} Economy report</button><button class="soft" data-report="governments">${icon('list')} Governments</button></div>
    <div class="stiles">${tile('Output (GDP)', num(e.gdp), `${num(e.worked)} deposits worked this year`, '#ca8a04')}${tile('Taxes', num(e.tax), `${esc(govLabel(c.government))} · ${esc(c.economicSystem)}`, '#6366f1')}${tile('Treasury', num(c.treasury), `trade +${num(e.trade_income)} / −${num(e.trade_cost)}`, '#14b8a6')}${tile('People fed', pct(e.food_ratio), e.food_ratio < 1 ? 'Hunger is spreading' : 'Granaries are holding', e.food_ratio < 0.9 ? '#ef4444' : '#84cc16')}${tile('Building materials', pct(e.material_cover), 'timber, stone, clay', '#a8561f')}${tile('Metal for tools & arms', pct(e.metal_cover), 'iron, copper, coal', '#64748b')}${tile('Exhausted deposits', `${ds.exhausted}`, `${ds.worked} worked · ${ds.total} in the world`, '#f97316')}</div>
    ${panel(`${esc(c.name)} stockpile`, 'Tons in store, tons needed per year, produced, bought and sold this year, and the going price in coins', `<div class="tablewrap"><table class="rtable"><thead><tr><th>Resource</th><th></th><th>Stock</th><th>Need</th><th>Made</th><th>Bought</th><th>Sold</th><th>Price</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`)}
    <div class="grid-2 lead">${panel('Trade this year', 'Peaceful neighbors swap surplus for shortage', flows ? `<div class="flows">${flows}</div>` : empty('No goods changed hands this year.'))}
    ${panel('Yearly budget', 'What the government pays for each year', e.budget ? `<div class="bars pad">${[['Administration', e.budget.admin, '#6366f1'], ['Standing army', e.budget.army, '#dc2626'], ['Building upkeep', e.budget.buildings, '#d97706'], ['Hunger relief', e.budget.relief, '#84cc16']].map(([l, v, col]) => hbar(l, v, Math.max(1, e.budget.total), col, ` · ${num(v)} coins`)).join('')}<p class="muted">${c.treasury < 0 ? 'In debt: soldiers go unpaid, stability and prosperity fall, and buildings fall into ruin.' : `Total ${num(e.budget.total)} coins a year. Treasury ${num(c.treasury)}.`}</p></div>` : empty('The first budget is set after a year.'))}
    ${panel('How resources matter', 'Deposits drive everything else', `<ul class="ruleslist"><li><b>Working deposits.</b> Each town works the deposits inside its claim, nearest first. Contested war tiles cannot be worked.</li><li><b>Exhaustion.</b> A deposit worked down to nothing is locked. It refills slowly, and cannot be worked again until it is completely full. Grain refills fast, ore takes generations.</li><li><b>Hunger.</b> Short of food, the food meter drops, stability and prosperity fall, and people move out.</li><li><b>Construction.</b> Buildings need timber, stone and clay, and slow to a crawl without them.</li><li><b>War.</b> Iron, copper and coal strengthen armies; metal-poor countries covet metal-rich neighbors.</li><li><b>Trade.</b> Shortages are bought from peaceful neighbors at scarcity prices; the seller earns the coins.</li><li><b>Money.</b> Governments pay for administration, standing armies, building upkeep and hunger relief. Debt means unpaid soldiers, unrest and crumbling buildings.</li><li><b>Disasters.</b> Floods, fires, quakes and slides destroy part of the deposits they hit.</li></ul>`)}</div>
    ${panel('All countries', 'Click a row to open the country', `<div class="tablewrap"><table class="rtable"><thead><tr><th>Country</th><th>GDP</th><th>Tax</th><th>Treasury</th><th>Fed</th><th>Materials</th><th>Metal</th></tr></thead><tbody>${compare}</tbody></table></div>`)}`;
  },

  systems() {
    const list = snap.countries.filter(c => c.systems), c = list.find(x => String(x.id) === view.country) || list[0];
    if (!c) return empty('No living countries.');
    const st = c.systems, ledger = [];
    for (const [topic, rows] of Object.entries(st.notes)) for (const [label, value] of rows) ledger.push({ topic, label, value });
    ledger.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    const max = Math.max(0.05, ...ledger.map(r => Math.abs(r.value)));
    const fmt = (topic, v) => (TOPICS[topic]?.[1] === 'percent' ? `${v >= 0 ? '+' : ''}${(v * 100).toFixed(0)}%` : `${v >= 0 ? '+' : ''}${v.toFixed(2)}`);
    const tile = (label, value, note, color) => `<div class="stile" style="--c:${color}"><span>${label}</span><b>${value}</b><small>${note}</small></div>`;
    return `<div class="toolbar">${select('f-country', 'country', list.map(x => [x.id, x.name]), c.id)}<span class="grow"></span><button class="soft" data-report="${esc('systems ' + quote(c.name))}">${icon('list')} Systems report</button></div>
    <div class="stiles">${tile('Science output', '×' + st.research.toFixed(2), `${st.scientists} scientists · ${st.healers} healers`, '#6366f1')}${tile('Culture', num(st.culture), `${st.culture_gain >= 0 ? '+' : ''}${st.culture_gain.toFixed(1)} per year · level ${st.culture_level.toFixed(1)}`, '#d946ef')}${tile('Stability', `${st.stability_delta >= 0 ? '+' : ''}${st.stability_delta.toFixed(2)}/yr`, `now ${num(c.stability)}`, '#3b82f6')}${tile('Prosperity', `${st.prosperity_delta >= 0 ? '+' : ''}${st.prosperity_delta.toFixed(2)}/yr`, `now ${num(c.prosperity)}`, '#f59e0b')}${tile('Trade', st.trade.toFixed(1), `${st.road_len} road cells · ${st.neighbors.length} land neighbors`, '#14b8a6')}${tile('Drive to found towns', '×' + st.expansion.toFixed(2), `${st.settlements} ${st.settlements === 1 ? 'settlement' : 'settlements'}`, '#10b981')}${tile('Disease spread', '×' + st.infection_mult.toFixed(2), `deaths ×${st.death_mult.toFixed(2)} · care +${st.care_bonus}`, '#ef4444')}${tile('Military', '×' + st.power_mult.toFixed(2), `walls cut losses ×${st.defense_mult.toFixed(2)}`, '#78716c')}</div>
    <div class="grid-2 lead">${panel('What is shaping this country', `Every effect on ${esc(c.name)} this year, strongest first`, ledger.length ? `<div class="ledger">${ledger.slice(0, 22).map(r => `<div class="lgrow ${r.value >= 0 ? 'pos' : 'neg'}"><span class="cause">${esc(r.label)}</span><span class="arrow">→</span><span class="target">${esc(TOPICS[r.topic]?.[0] || r.topic)}</span><div class="lbar"><i style="width:${Math.max(3, Math.abs(r.value) / max * 100)}%"></i></div><b>${fmt(r.topic, r.value)}</b></div>`).join('')}</div>` : empty('Nothing notable yet. Advance a few years.'))}
    ${panel('Standing buildings', `${Object.values(st.buildings).reduce((n, v) => n + v, 0)} across ${c.name}`, Object.keys(st.buildings).length ? `<div class="pad bchips">${Object.entries(st.buildings).map(([k, n]) => `${bchip(k)}<b class="mult">×${n}</b>`).join('')}</div>` : empty('No buildings yet.'))}</div>
    ${panel('How the systems connect', 'These rules run every year for every country', `<div class="links">${LINKS.map(([a, b, text]) => `<div class="lk"><span class="from">${a}</span><span class="arrow">→</span><span class="to">${b}</span><p>${text}</p></div>`).join('')}</div>`)}`;
  },

  countries() {
    const list = snap.countries.slice().sort((a, b) => (b.population > 0) - (a.population > 0) || b.population - a.population);
    const used = {}; for (const c of snap.countries) if (c.population > 0) used[c.government] = (used[c.government] || []).concat(c);
    const forms = Object.entries(snap.governments || {}).map(([k, g]) => { const t = g.traits || {}, pct = (v, base = 1) => v === undefined ? '' : `${(v - base) >= 0 ? '+' : ''}${Math.round((v - base) * 100)}%`; const bits = [['war', 'war', 1], ['military', 'army', 1], ['trade', 'trade', 1], ['culture', 'culture', 1], ['expansion', 'expansion', 1], ['tax', 'taxes', 1], ['output', 'output', 1]].filter(([key]) => t[key] !== undefined).map(([key, name]) => `<span class="gt ${t[key] >= 1 ? 'up' : 'down'}">${name} ${pct(t[key])}</span>`).concat(t.research ? [`<span class="gt ${t.research >= 0 ? 'up' : 'down'}">science ${t.research >= 0 ? '+' : ''}${Math.round(t.research * 100)}%</span>`] : [], t.stability ? [`<span class="gt ${t.stability >= 0 ? 'up' : 'down'}">stability ${t.stability >= 0 ? '+' : ''}${t.stability}/yr</span>`] : [], t.corruption ? [`<span class="gt down">corruption ${Math.round(t.corruption * 1000) / 10}%/yr</span>`] : []); return `<div class="govcard"><b>${esc(g.label)}</b><small>Rules as ${esc(g.title)} · ${esc(g.succession === 'election' ? 'elected every ' + g.term + ' years' : g.succession === 'hereditary' ? 'hereditary succession' : g.succession === 'seizure' ? 'seized by force' : g.succession === 'wealth' ? 'chosen by the wealthy' : g.succession === 'divine' ? 'proclaimed by clergy' : 'chosen for renown')}</small><p>${esc(g.blurb)}</p><div>${bits.join('')}</div><div class="gcount">${(used[k] || []).length ? (used[k] || []).map(c => `<button class="chip" data-country="${c.id}" style="--c:${cc(c.id)}"><i></i>${esc(c.name)}</button>`).join('') : '<small class="muted">No country right now</small>'}</div></div>`; });
    return `<div class="cards big">${list.map(countryCard).join('')}</div>${panel('Forms of government', 'Each form changes war, trade, science, culture, taxes, and how rulers are chosen. Countries drift between them as they change.', `<div class="govgrid">${forms.join('')}</div>`)}`;
  },

  settlements() { return `<div class="toolbar">${searchBox('Search settlements by name…')}${select('f-country', 'country', countryOptions(), view.country)}${select('f-sort', 'sort', [['pop', 'Largest first'], ['name', 'Name A–Z']], view.sort === 'name' ? 'name' : 'pop')}<span class="count" id="count"></span></div><div id="results"></div>`; },
  people() { return `<div class="toolbar">${searchBox('Search by name, job, or place…')}${select('f-country', 'country', countryOptions(), view.country)}${select('f-job', 'job', [['', 'Any occupation'], ...JOBS.map(j => [j, cap(j)])], view.job)}${select('f-status', 'status', [['living', 'Living'], ['dead', 'Deceased'], ['all', 'Everyone']], view.status)}${select('f-sort', 'sort', [['fame', 'Most famous'], ['wealth', 'Wealthiest'], ['age', 'Oldest'], ['name', 'Name A–Z']], ['fame', 'wealth', 'age', 'name'].includes(view.sort) ? view.sort : 'fame')}<label class="check"><input type="checkbox" data-filter="infected" ${view.infected ? 'checked' : ''}> Infected only</label><span class="count" id="count"></span></div><div id="results"></div>`; },

  demographics() {
    const list = idx.living.filter(p => !view.country || String(p.country) === view.country), n = list.length || 1;
    const bins = [[0, 17, 'Under 18'], [18, 34, '18–34'], [35, 49, '35–49'], [50, 64, '50–64'], [65, 200, '65+']];
    const cols = activeCountries().filter(c => !view.country || String(c.id) === view.country);
    const ageData = bins.map(([a, b, l]) => { const inBin = list.filter(p => p.age >= a && p.age <= b); return { l, total: inBin.length, parts: cols.map(c => ({ c, n: inBin.filter(p => p.country === c.id).length })) }; });
    const ageMax = Math.max(1, ...ageData.map(d => d.total));
    const jobs = JOBS.map(j => [j, list.filter(p => p.job === j).length]).filter(x => x[1]).sort((a, b) => b[1] - a[1]);
    const wealthBins = [[0, 10], [10, 25], [25, 50], [50, 100], [100, 250], [250, Infinity]].map(([a, b]) => [b === Infinity ? `${a}+` : `${a}–${b}`, list.filter(p => (p.wealth || 0) >= a && (p.wealth || 0) < b).length]);
    const wMax = Math.max(1, ...wealthBins.map(x => x[1])), jMax = Math.max(1, ...jobs.map(x => x[1]));
    const avg = f => list.reduce((s, p) => s + (f(p) || 0), 0) / n;
    const report = 'demographics' + (view.country ? ' ' + quote(idx.countries.get(view.country)?.name || '') : '');
    return `<div class="toolbar">${select('f-country', 'country', countryOptions(), view.country)}<span class="grow"></span><button class="soft" data-report="${esc(report)}">${icon('list')} Full demographic report</button></div>
    <div class="kpis">${kpi('Population', num(list.length), 'Living residents', 'users', '#5b5bf0')}${kpi('Average age', num(avg(p => p.age), 1), 'Years', 'user', '#14b8a6')}${kpi('Children', num(list.filter(p => p.age < 18).length), 'Under 18', 'star', '#06b6d4')}${kpi('Seniors', num(list.filter(p => p.age >= 65).length), '65 and over', 'shield', '#f97316')}${kpi('Infected', num(list.filter(p => p.infection).length), 'Current infections', 'pulse', '#ef4444')}${kpi('Average wealth', num(avg(p => p.wealth), 1), 'Simulation units', 'bolt', '#eab308')}</div>
    <div class="grid-2">${panel('Age groups', 'Stacked by country', `<div class="chart"><div class="stack-chart">${ageData.map(d => `<div class="stack-col"><b>${num(d.total)}</b><div class="stack" style="height:${Math.max(3, d.total / ageMax * 170)}px">${d.parts.filter(x => x.n).map(x => `<i title="${esc(x.c.name)}: ${x.n}" style="flex:${x.n};background:${cc(x.c.id)}"></i>`).join('')}</div><span>${d.l}</span></div>`).join('')}</div></div>`)}${panel('Occupations', 'Living residents by job', `<div class="bars">${jobs.map(([j, c]) => hbar(cap(j), c, jMax, JOB_COLORS[j])).join('') || empty('No data.')}</div>`)}</div>
    <div class="grid-2">${panel('Wealth distribution', 'People by personal wealth', `<div class="bars">${wealthBins.map(([l, c]) => hbar(l, c, wMax, '#8b5cf6')).join('')}</div>`)}${panel('Population by country', 'Share of all living people', `<div class="bars">${snap.countries.filter(c => c.population > 0).sort((a, b) => b.population - a.population).map(c => hbar(c.name, c.population, snap.population, cc(c.id), ` · ${(c.population / Math.max(1, snap.population) * 100).toFixed(0)}%`)).join('')}</div>`)}</div>`;
  },

  tech() {
    const tk = snap.tech; if (!tk) return empty('Technology data is loading.');
    const list = snap.countries.filter(c => c.units && c.population > 0), c = list.find(x => String(x.id) === view.country) || list[0];
    if (!c) return empty('No living countries.');
    const owned = new Set(c.technologies), names = Object.keys(tk.tree), L = techLayout(tk);
    const pct = v => `${v >= 0 ? '+' : ''}${Math.round(v * 100)}%`, cutp = v => `${Math.round((1 - v) * 100)}% less`;
    const FX = { prod: v => `production ${pct(v)}`, research: v => `research ${pct(v)}`, trade: v => `trade ${pct(v)}`, food: v => `food +${v}`, mil: v => `army strength ${pct(v)}`, siege: v => `siege strength ${pct(v)}`, log: v => `army supply ${pct(v)}`, dfn: v => `defender losses ${cutp(v)}`, wnd: v => v < 1 ? `wound deaths ${cutp(v)}` : `deadlier wounds`, inf: v => `infection ${cutp(v)}`, wat: v => `waterborne disease ${cutp(v)}`, air: v => `airborne disease ${cutp(v)}`, con: v => `contact disease ${cutp(v)}`, dth: v => `disease deaths ${cutp(v)}`, care: v => `hospital capacity ${pct(v)}`, cure: v => `cure speed ${pct(v)}`, land: v => `land travel ${pct(v)}`, sea: v => `sea travel ${pct(v)}`, cult: v => `culture ${pct(v)}`, stab: v => `stability +${v}/yr`, build: v => `building speed ${pct(v)}`, haz: v => `disaster damage ${cutp(v)}`, spoil: v => `food spoilage ${cutp(v)}`, weapon: v => `army: ${tk.units.weapon[v]}`, ship: v => `ships: ${tk.units.ship[v]}`, cart: v => `freight: ${tk.units.cart[v]}` };
    const effects = fx => Object.entries(fx).map(([k, v]) => (FX[k] ? FX[k](v) : '')).filter(Boolean).join(', ');
    const state = n => owned.has(n) ? 'known' : c.researchProject === n ? 'doing' : tk.tree[n][0].every(r => owned.has(r)) && ((tk.any || {})[n] || []).every(g => g.some(r => owned.has(r))) ? 'open' : 'locked';
    const tally = { known: 0, doing: 0, open: 0, locked: 0 };
    for (const n of names) tally[state(n)]++;
    const node = n => {
      const [needs, cost, blurb, era, branch, fx] = tk.tree[n], st = state(n), p = L.pos[n];
      const learned = Math.round(Math.min(99, ((c.insight || {})[n] || 0) / cost * 100)), twice = (c.boosted || []).includes(n) ? ' · 2×' : '';
      const sub = st === 'known' ? 'known' : st === 'doing' ? `researching · ${Math.round(Math.min(99, (c.research + ((c.insight || {})[n] || 0)) / cost * 100))}%${twice}` : st === 'open' ? `ready · ${cost}${learned ? ` · ${learned}% learned` : ''}${twice}` : `${cost} research${learned ? ` · ${learned}% learned` : ''}${twice}`;
      return `<div class="tnode ${st}" data-learn="${learned ? 1 : 0}" data-boost="${twice ? 1 : 0}" data-tech="${esc(n)}" style="left:${p.x}px;top:${p.y}px" title="${esc(`${n}\n${cap(branch)} · ${tk.eras[era]}\n${blurb}\nNeeds: ${needs.length ? needs.join(', ') : 'nothing'}${((tk.any || {})[n] || []).map(g => `
Also needs one of: ${g.join(' or ')}`).join('')}\nCost ${cost} research\n${effects(fx)}`)}"><b>${esc(n)}</b><small>${sub}</small></div>`;
    };
    const lines = L.paths.map(q => `<path d="${q.d}" data-from="${esc(q.from)}" data-to="${esc(q.to)}"/>`).join('');
    const bands = L.bands.map((b, e) => `<div class="tband ${c.era === e ? 'now' : ''}" style="left:${b.x0}px;width:${b.x1 - b.x0}px;height:${L.height}px"><b>${esc(tk.eras[e])}</b><small>${names.filter(n => tk.tree[n][3] === e && owned.has(n)).length} / ${names.filter(n => tk.tree[n][3] === e).length}</small></div>`).join('');
    const lanes = L.lanes.map(l => `<div class="tlane" style="top:${l.top}px;height:${l.height}px;--c:${TECH_COLORS[l.name]}"><span>${esc(cap(l.name))}</span></div>`).join('');
    const only = [['open', 'Ready'], ['learning', 'Learning'], ['boost', '2×']];
    return `<div class="toolbar">${searchBox('Find a discovery…')}${select('f-country', 'country', list.map(x => [x.id, x.name]), c.id)}<div class="chips">${only.map(([k, l]) => `<button class="chip ${view.techOnly === k ? 'on' : ''}" data-tech-only="${k}">${l}</button>`).join('')}</div><span class="grow"></span><span class="tzoom"><button class="soft" data-tzoom="out" title="Zoom out">−</button><b>${Math.round(techZoom * 100)}%</b><button class="soft" data-tzoom="in" title="Zoom in">+</button><button class="soft" data-tzoom="fit" title="Fit the whole tree">Fit</button></span><button class="soft" data-report="${esc('discoveries ' + quote(c.name))}">${icon('list')} Discoveries report</button></div>
    <div class="stiles">${[['Age', c.eraName, `${owned.size} of ${names.length} discoveries`, '#b45309'], ['Army', c.units.army, 'changes war: strength, deaths and sieges', '#dc2626'], ['Ships', c.units.fleet, 'sets sea speed and safety', '#0284c7'], ['Freight', c.units.wagons, 'sets trade and army speed on land', '#ca8a04'], ['Researching', c.researchProject || 'nothing yet', c.researchProject ? `${Math.round(c.research)} of ${tk.tree[c.researchProject][1]} research` : 'waiting for a new project', '#6366f1']].map(([l, v, n, col]) => `<div class="stile" style="--c:${col}"><span>${l}</span><b style="font-size:20px">${esc(v)}</b><small>${esc(n)}</small></div>`).join('')}</div>
    <div class="tlegend"><span class="st known">Known · ${tally.known}</span><span class="st doing">Researching · ${tally.doing}</span><span class="st open">Ready to research · ${tally.open}</span><span class="st locked">Unknown · ${tally.locked}</span><span class="lg muted">Each smooth line runs from what a discovery needs to the discovery it unlocks. Hover a discovery to follow its lines and see what it needs; drag to scroll; Ctrl + wheel or the buttons zoom.</span></div>
    <div class="techwrap" data-scroll="${Math.max(0, L.bands[c.era].x0 - 150)}"><div class="techcanvas" data-w="${L.width}" data-h="${L.height}" style="width:${L.width}px;height:${L.height}px;zoom:${techZoom}">${bands}${lanes}<svg class="techsvg" width="${L.width}" height="${L.height}">${lines}</svg>${names.map(node).join('')}</div></div>`;
  },

  discoveries() {
    const total = snap.catalog.foundations + snap.catalog.innovations, q = view.search.toLowerCase();
    return `<div class="toolbar">${searchBox('Search discoveries…')}${select('f-country', 'country', countryOptions(), view.country)}<span class="grow"></span><button class="soft" data-report="catalog">${icon('list')} Browse full catalog</button></div>
    <div class="cards two">${snap.countries.filter(c => (c.population > 0 || c.technologies.length) && (!view.country || String(c.id) === view.country)).map(c => {
      const have = c.technologies.length + c.innovations.length, chip = (t, kind) => `<span class="tag ${kind}" style="--c:${kind === 'found' ? '#3b82f6' : '#f59e0b'}">${esc(t)}<button title="Revoke" aria-label="Revoke ${esc(t)}" data-run="${esc(`revoke ${quote(c.name)} ${quote(t)}`)}" data-confirm="Revoke ${esc(t)} from ${esc(c.name)}? Discoveries that depend on it are removed too.">×</button></span>`;
      return `<section class="panel" style="--c:${cc(c.id)}"><div class="panel-head"><div><h2><i class="dot"></i>${esc(c.name)}</h2><p>${c.technologies.length} foundations · ${c.innovations.length} innovations</p></div><button class="link" data-report="${esc('discoveries ' + quote(c.name))}">Report →</button></div><div class="pad"><div class="meter big"><i style="width:${Math.max(1, have / total * 100)}%"></i></div><small class="muted">${have} of ${total} known</small><div class="taglist">${c.technologies.filter(t => t.toLowerCase().includes(q)).map(t => chip(t, 'found')).join('')}${c.innovations.filter(t => t.toLowerCase().includes(q)).map(t => chip(t, 'innov')).join('') || ''}${have ? '' : '<span class="muted">Nothing discovered yet.</span>'}</div>${c.population > 0 ? `<button class="soft" data-influence-go="idea:${c.id}">${icon('bulb')} Seed an idea</button>` : ''}</div></section>`;
    }).join('')}</div>`;
  },

  health() {
    const hs = snap.healthStats, [cases, rec, died] = hs.totals, sick = idx.living.filter(p => p.infection), q = view.search.toLowerCase();
    const courseColor = { acute: '#ec4899', chronic: '#8b5cf6', endemic: '#f59e0b' }, pct = x => (Number(x || 0) * 100).toFixed(1) + '%';
    const byCountry = snap.countries.filter(c => c.population > 0 || (hs.countries[c.id] || [0])[0]).map(c => ({ c, now: sick.filter(p => p.country === c.id).length, r: hs.countries[c.id] || [0, 0, 0, 0] }));
    const ready = snap.diseases.filter(d => d.cure >= 100 && !d.active).length;
    return `<div class="kpis">${kpi('Infected now', num(sick.length), `${(sick.length / Math.max(1, snap.population) * 100).toFixed(1)}% of the population`, 'pulse', '#f97316')}${kpi('Recovered', num(rec), 'All-time recoveries', 'shield', '#10b981')}${kpi('Died', num(died), `${cases ? (died / cases * 100).toFixed(1) : '0.0'}% of all cases`, 'trash', '#ef4444')}${kpi('Total cases', num(cases), `${snap.diseases.filter(d => d.active).length} diseases circulating`, 'dna', '#ec4899')}${kpi('Cure research', num(snap.researchers.scientists + snap.researchers.healers), `${num(snap.researchers.scientists)} scientists · ${num(snap.researchers.healers)} healers`, 'bulb', '#14b8a6')}${kpi('Eradicated', num(snap.eradicated.length), ready ? `${ready} about to be eradicated` : 'Automatic at 100% cure, 0 infected', 'star', '#8b5cf6')}</div>
    <div class="grid-2">${panel('Outcome of every infection', `${num(cases)} cases recorded`, `<div class="pad">${outcomeBar(sick.length, rec, died, cases)}${outcomeLegend(sick.length, rec, died)}<div class="outcomes3 big"><div class="o inf"><b>${num(sick.length)}</b><span>Infected</span></div><div class="o ok"><b>${num(rec)}</b><span>Recovered</span></div><div class="o dead"><b>${num(died)}</b><span>Died</span></div></div></div>`)}${panel('Cases per year', 'New infections, recoveries, and deaths', triChart(hs.yearly))}</div>
    ${panel('By country', 'Where people are sick, have recovered, or have died', `<div class="htable"><div class="hrow head"><span></span><span>Country</span><span>Infected</span><span>Recovered</span><span>Died</span><span>Outcome</span></div>${byCountry.map(({ c, now, r }) => `<button class="hrow" data-country="${c.id}" style="--c:${cc(c.id)}"><span class="flag-dot sm">${esc(initials(c.name).charAt(0))}</span><b>${esc(c.name)}</b><span class="hn inf">${num(now)}</span><span class="hn ok">${num(r[1])}</span><span class="hn dead">${num(r[2])}</span><span>${outcomeBar(now, r[1], r[2], r[0])}</span></button>`).join('')}</div>`)}
    <div class="toolbar">${searchBox('Search diseases…')}<span class="grow"></span><button class="soft" data-report="diseases">${icon('list')} Disease report</button><button class="primary" data-open-tool="disease-add">${icon('plus')} New disease</button></div>
    <div class="cards">${snap.diseases.filter(d => d.name.toLowerCase().includes(q)).map(d => {
      const [dc, dr, dd] = diseaseCounts(d.name);
      return `<article class="dz-card" style="--c:${courseColor[d.course] || '#64748b'}" data-disease="${esc(d.name)}" role="button" tabindex="0"><div class="pl-top">${tag(d.course || 'disease', courseColor[d.course])}${tag(d.transmission || 'contact', '#64748b')}</div><h3>${esc(d.name)}</h3><div class="outcomes3"><div class="o inf"><b>${num(d.active)}</b><span>Infected</span></div><div class="o ok"><b>${num(dr)}</b><span>Recovered</span></div><div class="o dead"><b>${num(dd)}</b><span>Died</span></div></div>${outcomeBar(d.active, dr, dd, dc)}<div class="cure-row"><span>Cure</span><div class="meter"><i style="width:${Math.max(1, d.cure)}%;background:#14b8a6"></i></div><b>${d.cure.toFixed(0)}%</b></div><div class="tags">${cureStatus(d)}</div><div class="dz-foot">Spread ${pct(d.infectionChance)} · deadly ${pct(d.deathChance)} · recovery ${pct(d.recoveryChance)}</div></article>`;
    }).join('') || empty('No diseases match.')}</div>
    ${snap.eradicated.length ? panel('Eradicated diseases', 'Fully cured and cleared. Records remain in reports.', `<div class="chips pad">${snap.eradicated.map(d => `<span class="chip on" style="--c:#10b981"><i></i>${esc(d.name)}</span>`).join('')}</div>`) : ''}
    ${panel('Currently infected', `${num(sick.length)} people${sick.length > 12 ? ' · showing the 12 most notable' : ''}`, sick.length ? `<div class="people-grid pad">${sick.sort((a, b) => b.fame - a.fame).slice(0, 12).map(p => `<div class="sick-item">${personCard(p)}<button class="soft" data-run="${esc('cure ' + quote(p.name))}">Cure</button></div>`).join('')}</div>` : empty('Nobody is infected right now.'))}`;
  },

  wars() {
    const warCard = w => {
      const [a, b] = w.countries.map(id => idx.countries.get(String(id))), duration = snap.year - w.started;
      const side = c => `<div class="side" style="--c:${cc(c.id)}" data-country="${c.id}" role="button" tabindex="0"><span class="flag-dot big">${esc(initials(c.name).charAt(0))}</span><b>${esc(c.name)}</b><small>${num(c.population)} residents</small><small class="army">${esc(c.units?.army || '')}</small></div>`;
      return `<article class="war-card">${side(a)}<div class="vs"><span>VS</span><small>Since year ${w.started}</small><small>${duration} ${duration === 1 ? 'year' : 'years'}</small></div>${side(b)}<div class="war-actions"><button class="soft" data-report="${esc('wars ' + quote(a.name))}">${icon('list')} War report</button><button class="primary" data-run="${esc(`peace ${quote(a.name)} ${quote(b.name)}`)}">${icon('flag')} Broker peace</button></div></article>`;
    };
    return `${snap.wars.length ? `<div class="cards two">${snap.wars.map(warCard).join('')}</div>` : `<section class="panel peace">${icon('shield')}<div><h2>No active wars</h2><p>All countries are at peace. To stoke a rivalry, use Shift diplomacy in the bar at the bottom.</p></div></section>`}
    ${diplomacyPanel()}
    <div class="toolbar"><button class="soft" data-report="government">${icon('list')} Government report</button><button class="soft" data-report="wars">${icon('list')} All wars report</button></div>`;
  },

  events() {
    const cats = [...new Set(snap.events.map(e => e.category))];
    return `<div class="toolbar">${searchBox('Search events…')}<div class="chips"><button class="chip ${view.eventCat ? '' : 'on'}" data-event-cat="">All</button>${cats.map(c => `<button class="chip ${view.eventCat === c ? 'on' : ''}" data-event-cat="${esc(c)}" style="--c:${CATEGORY_COLORS[c] || '#64748b'}"><i></i>${esc(cap(c))}</button>`).join('')}</div></div><section class="panel"><div class="events spaced" id="results"></div></section>`;
  }
};

const RESULTS = {
  settlements() {
    const q = view.search.trim().toLowerCase().replace(/^#/, '');
    let list = snap.settlements.filter(s => (!view.country || String(s.country) === view.country) && (!q || s.name.toLowerCase().includes(q) || String(s.id) === q));
    list = view.sort === 'name' ? list.sort((a, b) => a.name.localeCompare(b.name)) : list.sort((a, b) => b.population - a.population);
    setCount(`${num(list.length)} settlements`);
    return `<div class="cards">${list.map(placeCard).join('') || empty('No settlements match.')}</div>`;
  },
  people() {
    const q = view.search.trim().toLowerCase().replace(/^#/, '');
    let list = snap.people.filter(p => (view.status === 'all' || (view.status === 'living') === (p.alive !== false)) && (!view.country || String(p.country) === view.country) && (!view.job || p.job === view.job) && (!view.infected || p.infection) && (!q || String(p.id) === q || `${p.name} ${p.job} ${p.role} ${p.settlementName}`.toLowerCase().includes(q)));
    const sorters = { fame: (a, b) => (b.fame || 0) - (a.fame || 0), wealth: (a, b) => (b.wealth || 0) - (a.wealth || 0), age: (a, b) => b.age - a.age, name: (a, b) => a.name.localeCompare(b.name) };
    list = list.sort(sorters[view.sort] || sorters.fame);
    setCount(`${num(list.length)} people`);
    return `<div class="people-grid">${list.slice(view.page * PAGE, view.page * PAGE + PAGE).map(personCard).join('') || empty('No people match.')}</div>${pager(list.length)}`;
  },
  events() {
    const q = view.search.toLowerCase();
    return eventList(snap.events.filter(e => (!view.eventCat || e.category === view.eventCat) && (!q || e.message.toLowerCase().includes(q))), 300);
  }
};
function setCount(text) { const el = $('#count'); if (el) el.textContent = text; }
function renderResults() { const r = $('#results'); const fn = RESULTS[section]; if (r && fn) r.innerHTML = fn(); else render(true); }

function countryCard(c) {
  const col = cc(c.id), places = snap.settlements.filter(s => s.country === c.id && !s.abandoned && s.population > 0).length;
  const enemies = snap.wars.filter(w => w.countries.includes(c.id)).map(w => w.names.find(n => n !== c.name));
  const dissolved = c.population === 0 && c.ended != null;
  return `<article class="country-card ${dissolved ? 'gone' : ''}" style="--c:${col}" data-country="${c.id}" role="button" tabindex="0"><div class="cc-top"><span class="flag-dot big">${esc(initials(c.name).charAt(0))}</span><div><h3>${esc(c.name)}</h3><div class="tags">${tag(govLabel(c.government), col)}${tag(c.economicSystem, '#64748b')}${c.eraName && !dissolved ? tag(c.eraName, '#b45309') : ''}${dissolved ? tag('Dissolved', '#ef4444') : ''}${c.quarantine ? tag('Quarantine', '#ec4899') : ''}</div></div><div class="cc-pop"><b>${num(c.population)}</b><small>residents</small></div></div>${meter('Food', c.food, '#84cc16')}${meter('Prosperity', c.prosperity, '#f59e0b')}${meter('Stability', c.stability, '#3b82f6')}<div class="cc-facts"><span><b>${places}</b> settlements</span><span><b>${c.technologies.length + c.innovations.length}</b> discoveries</span><span><b>${num(c.treasury)}</b> treasury</span></div><div class="tags">${c.conditions.map(x => tag(x, CONDITION_COLORS[x] || '#64748b')).join('')}${enemies.map(n => tag('⚔ ' + n, '#dc2626')).join('')}</div><p class="ruler">Ruler: <b>${esc(c.rulerName || 'none')}</b></p><p class="ruler">Borders: <b>${esc(c.borders.map(id => idx.countries.get(String(id))?.name).filter(Boolean).join(', ') || 'none (isolated)')}</b> · ${Math.round(c.terrain.coastal * 100)}% coastal · ${Math.round(c.terrain.mountain * 100)}% highland</p></article>`;
}

// ---------- dialogs ----------
const chipLink = (type, item, label) => `<button class="chip" data-${type}="${item.id}" style="--c:${cc(item.country)}"><i></i>${esc(label ?? item.name)}</button>`;
const dlgHead = (color, avatar, eyebrow, title, tags) => `<header class="dlg-head" style="--c:${color}">${avatar}<div><span class="eyebrow">${eyebrow}</span><h2>${esc(title)}</h2><div class="tags">${tags}</div></div></header>`;

const DIALOGS = {
  cell(c) {
    const g = snap.geo, k = g.terrain[c.y][c.x], t = TERRAIN[k], ownerId = map.owner[c.y]?.[c.x], owner = ownerId ? idx.countries.get(String(ownerId)) : null;
    const list = map.depositsAt(c.x, c.y), feats = (map.features.get(c.y * g.w + c.x) || '').split('').map(f => FEATURES[f]).filter(Boolean), contested = map.contested.has(c.y * g.w + c.x), soil = Number(g.soil[c.y][c.x]) / 9;
    const col = owner ? cc(owner.id) : '#64748b', info = snap.resourceInfo || {};
    const rows = list.map(d => { const [name, cls, rate] = info[d.kind] || [d.kind, '', 0.05], frac = Math.max(0, Math.min(1, d.amount / d.cap)), years = frac >= 1 ? 0 : Math.ceil((d.cap - d.amount) / (d.cap * rate)); return `<div class="dep ${d.locked ? 'locked' : ''}"><i class="sw lg" style="background:${RESOURCES[d.kind]?.color || '#999'}"></i><div><b>${esc(name)}</b><small>${esc(cls)} · refills ${(rate * 100).toFixed(1)}% of capacity per year</small><div class="meter"><i style="width:${Math.max(2, frac * 100)}%;background:${d.locked ? '#78716c' : RESOURCES[d.kind]?.color || '#999'}"></i></div></div><span>${Math.round(d.amount)} / ${d.cap}<small>${d.locked ? `Exhausted · locked until full (~${years} yr)` : frac >= 1 ? 'Full' : `Partly worked · ~${years} yr to full`}</small></span></div>`; }).join('');
    return `${dlgHead(col, `<span class="flag-dot xl" style="--c:${t.color || col}">${esc(c.x)}</span>`, `TILE · ${c.x}, ${c.y}`, t.name + (g.river[c.y][c.x] === '1' ? ' with a river' : ''), `${owner ? chipLink('country', owner) : tag('Unclaimed', '#64748b')}${contested ? tag('Contested in war', '#dc2626') : ''}${feats.map(f => tag(f, '#0ea5e9')).join('')}`)}
    <div class="dlg-body"><div class="statgrid">${stat('Soil richness', Math.round(soil * 100) + '%')}${stat('Deposits', list.length)}${stat('Owner', esc(owner?.name || 'none'))}${stat('Cell', `${c.x}, ${c.y}`)}</div>
    <h3 class="sub">Deposits on this tile</h3>${rows ? `<div class="deps">${rows}</div><p class="muted">A deposit that is worked down to nothing is exhausted. It refills a little every year and cannot be worked again until it is completely full.</p>` : empty('No deposits here.')}
    <div class="actions"><button class="soft" data-report="${esc(`tile ${c.x} ${c.y}`)}">${icon('list')} Tile report</button></div></div>`;
  },
  person(p) {
    const n = quote(p.name), alive = p.alive !== false, parents = (p.parents || []).map(id => idx.people.get(String(id))).filter(Boolean), kids = idx.kids.get(String(p.id)) || [];
    const country = idx.countries.get(String(p.country)), place = idx.settlements.get(String(p.settlement));
    return `${dlgHead(cc(p.country), `<span class="avatar xl" style="--c:${cc(p.country)}">${esc(initials(p.name))}</span>`, 'PERSON', p.name, `${tag(p.role || p.job || 'resident', cc(p.country))}${alive ? tag('Living', '#10b981') : tag(`Died year ${p.died ?? '?'}${p.causeOfDeath ? ' · ' + p.causeOfDeath : ''}`, '#64748b')}${p.infection ? tag('Infected: ' + p.infection, '#ef4444') : ''}`)}
    <div class="dlg-body"><div class="statgrid">${stat('Age', p.age)}${stat('Born', 'year ' + p.born)}${stat('Occupation', esc(p.job || 'resident'))}${stat('Wealth', num(p.wealth, 1))}${stat('Fame', num(p.fame, 1))}${stat('Lineage', esc(p.lineageName))}</div>
    <div class="linkrow"><span>Country</span>${country ? chipLink('country', country) : '—'}<span>Home</span>${place ? chipLink('settlement', place) : '—'}</div>
    ${parents.length || kids.length ? `<h3 class="sub">Family</h3><div class="linkrow">${parents.length ? '<span>Parents</span>' : ''}${parents.map(x => chipLink('person', x)).join('')}${kids.length ? '<span>Children</span>' : ''}${kids.slice(0, 12).map(x => chipLink('person', x)).join('')}${kids.length > 12 ? `<small class="muted">+${kids.length - 12} more</small>` : ''}</div>` : ''}
    ${alive ? `<div class="actions"><button class="primary" data-play-as="${p.id}">${icon('user')} Play as this person</button></div>` : ''}
    <h3 class="sub">Life story <small class="muted">stitched together from their milestones</small></h3><div class="life-story" data-life="${p.id}"><p class="muted">Gathering their story…</p></div>
    <div class="actions"><button class="soft" data-report="${esc('person ' + n)}">${icon('list')} Full life report</button></div>
    </div>`;
  },

  settlement(s) {
    const n = quote(s.name), residents = (idx.residents.get(String(s.id)) || []).slice().sort((a, b) => (b.fame || 0) - (a.fame || 0)), country = idx.countries.get(String(s.country));
    return `${dlgHead(cc(s.country), `<span class="avatar xl sq" style="--c:${cc(s.country)}">${icon('home')}</span>`, (s.kind || 'settlement').toUpperCase(), s.name, `${tag(s.countryName, cc(s.country))}${s.capital ? tag('★ Capital', '#f59e0b') : ''}${s.abandoned ? tag('Abandoned', '#ef4444') : ''}`)}
    <div class="dlg-body"><div class="statgrid">${stat('Residents', num(s.population))}${stat('Type', esc(s.kind || '—'))}${stat('Terrain', esc(s.terrainText || '—'))}${stat('Founder', esc(s.founderName || '—'))}</div>
    <div class="linkrow"><span>Country</span>${country ? chipLink('country', country) : '—'}</div>
    <div class="actions"><button class="soft" data-report="${esc('settlement ' + n)}">${icon('list')} Full settlement report</button></div>
    ${settlementExtras(s)}
    <h3 class="sub">Residents <small class="muted">${num(residents.length)} total · most notable first</small></h3><div class="people-grid tight">${residents.slice(0, 24).map(personCard).join('') || '<p class="muted">No residents.</p>'}</div></div>`;
  },

  country(c) {
    const n = quote(c.name), col = cc(c.id), enemies = snap.wars.filter(w => w.countries.includes(c.id)).map(w => w.names.find(x => x !== c.name));
    const places = snap.settlements.filter(s => s.country === c.id && !s.abandoned && s.population > 0);
    const top = idx.living.filter(p => p.country === c.id).sort((a, b) => (b.fame || 0) - (a.fame || 0)).slice(0, 6);
    return `${dlgHead(col, `<span class="flag-dot xl" style="--c:${col}">${esc(initials(c.name).charAt(0))}</span>`, 'COUNTRY', c.name, `${tag(govLabel(c.government), col)}${tag(c.economicSystem, '#64748b')}${tag(c.eraName || '', '#b45309')}${c.conditions.map(x => tag(x, CONDITION_COLORS[x])).join('')}${enemies.map(x => tag('⚔ ' + x, '#dc2626')).join('')}`)}
    <div class="dlg-body"><p class="muted gov-note"><b>${esc(govLabel(c.government))}.</b> ${esc(govBlurb(c.government))}</p><div class="statgrid">${stat('Residents', num(c.population))}${stat('Treasury', num(c.treasury))}${stat('Research', num(c.research))}${stat('Settlements', places.length)}${stat('Discoveries', c.technologies.length + c.innovations.length)}${stat('Ruler', esc(c.rulerName || 'none'))}${stat('Land fertility', c.terrain.fertility.toFixed(2))}${stat('Terrain defense', '×' + c.terrain.defense.toFixed(2))}</div>
    <div class="linkrow"><span>Land borders</span>${c.borders.map(id => idx.countries.get(String(id))).filter(Boolean).map(x => chipLink('country', x)).join('') || '<small class="muted">None. This country is isolated and cannot be invaded by land.</small>'}${c.seaNeighbors.length ? '<span>Across the sea</span>' + c.seaNeighbors.map(id => idx.countries.get(String(id))).filter(Boolean).map(x => chipLink('country', x)).join('') : ''}</div>
    <div class="linkrow"><span>Settlements</span>${places.map(s => chipLink('settlement', s)).join('') || '—'}</div>
    ${top.length ? `<div class="linkrow"><span>Notable people</span>${top.map(p => chipLink('person', p)).join('')}</div>` : ''}
    <div class="actions"><button class="soft" data-report="${esc('country ' + n)}">${icon('list')} Country report</button><button class="soft" data-report="${esc('demographics ' + n)}">${icon('chart')} Demographics</button><button class="soft" data-report="${esc('discoveries ' + n)}">${icon('bulb')} Discoveries</button><button class="soft" data-report="${esc('wars ' + n)}">${icon('swords')} Wars</button></div>
    ${learningRow(c)}
    ${countryExtras(c)}
    ${(c.pacts || []).length ? `<div class="linkrow"><span>Science pacts</span>${c.pacts.map(id => idx.countries.get(String(id))).filter(Boolean).map(x => chipLink('country', x)).join('')}</div>` : ''}
    ${c.population > 0 ? `<h3 class="sub">Influence</h3><div class="actions"><button class="soft" data-influence-go="idea:${c.id}">${icon('bulb')} Seed an idea</button><button class="soft" data-influence-go="diplomacy:${c.id}">${icon('flag')} Shift diplomacy…</button></div>` : ''}</div>`;
  },

  disease(d) {
    const courseColor = { acute: '#ec4899', chronic: '#8b5cf6', endemic: '#f59e0b' }[d.course] || '#64748b';
    const [cases, rec, died, vac] = diseaseCounts(d.name), ready = d.cure >= 100 && d.active === 0, work = snap.researchers;
    const why = ready ? 'The cure is complete and nobody is infected. It is eradicated automatically at the end of the year, or you can do it now.' : `Eradication is automatic once the cure reaches 100% and nobody is infected. Right now: cure ${d.cure.toFixed(0)}%, ${num(d.active)} infected.`;
    return `${dlgHead(courseColor, `<span class="avatar xl sq" style="--c:${courseColor}">${icon('dna')}</span>`, 'DISEASE', d.name, `${tag(d.course, courseColor)}${tag(d.transmission || 'contact', '#64748b')}${cureStatus(d)}`)}
    <div class="dlg-body"><div class="statgrid">${stat('Infected now', num(d.active))}${stat('Recovered', num(rec))}${stat('Died', num(died))}${stat('Total cases', num(cases))}${stat('Vaccinated', num(vac))}${stat('Immunity', (d.immunityYears ?? '—') + ' yrs')}</div>
    ${outcomeBar(d.active, rec, died, cases)}${outcomeLegend(d.active, rec, died)}
    <h3 class="sub">Cases per year</h3>${triChart(snap.healthStats.diseases[d.name]?.timeline || [])}
    <h3 class="sub">Cure and eradication</h3><div class="cure-box"><div class="cure-top"><b>${d.cure.toFixed(1)}%</b><span>cure progress</span></div><div class="meter big"><i style="width:${Math.max(1, d.cure)}%;background:#14b8a6"></i></div>
    <p class="muted">${num(work.scientists)} scientists and ${num(work.healers)} healers add to this every year. Healers count fully where the disease is active; medical technology speeds the work, and chronic diseases are slower to cure. A partial cure already lowers spread and deaths.</p>
    <div class="actions"><button class="primary" ${ready ? '' : 'disabled'} data-run="${esc('eradicate ' + quote(d.name))}" data-confirm="Eradicate ${esc(d.name)}? Historical records remain.">${icon('shield')} Eradicate</button><span class="muted why">${why}</span></div></div>
    <div class="actions"><button class="soft" data-report="${esc('disease ' + quote(d.name))}">${icon('list')} Full disease report</button></div></div>`;
  }
};

const UNITS = unitDialogs({ esc, num, tag, stat, dlgHead, icon, cc, progressBar, etaYears, snap: () => snap, idx: () => idx });

// Read-only: which countries share what they learn. Changing it is an influence in the bottom bar.
function diplomacyPanel() {
  const pairs = [];
  for (const c of activeCountries()) for (const id of c.pacts || []) if (c.id < id) { const o = idx.countries.get(String(id)); if (o && o.population > 0) pairs.push([c, o]); }
  return panel('Diplomacy', 'Science pacts share what each side learns every year, until war breaks them', pairs.length
    ? `<div class="rows">${pairs.map(([a, b]) => `<div class="lrow" style="--c:${cc(a.id)}"><span class="flag-dot sm">${icon('bulb')}</span><div><b>${esc(a.name)} and ${esc(b.name)}</b><small>Science pact</small></div><button class="soft" data-country="${a.id}">Open</button></div>`).join('')}</div>`
    : empty('No science pacts yet. Use Shift diplomacy in the bar at the bottom to broker one.'));
}

function nearbyResources(s) {
  const g = snap.geo, found = {};
  for (let y = Math.max(0, s.gy - 3); y <= Math.min(g.h - 1, s.gy + 3); y++) for (let x = Math.max(0, s.gx - 3); x <= Math.min(g.w - 1, s.gx + 3); x++) for (const d of map.depositsAt(x, y)) found[d.kind] = (found[d.kind] || 0) + 1;
  return found;
}
function settlementExtras(s) {
  const built = Object.entries(s.buildings || {}), projects = snap.projects.filter(p => p.settlement === s.id), n = quote(s.name), near = nearbyResources(s);
  const hazards = Object.entries(s.hazards || {}).sort((a, b) => b[1] - a[1]);
  return `<h3 class="sub">Buildings and construction</h3>
    <div class="bchips">${built.length ? built.map(([k, y]) => bchip(k, y)).join('') : '<span class="muted">Nothing built yet.</span>'}</div>
    ${projects.map(p => `<div class="proj"><b>${esc(p.label)}</b> <span class="muted">${Math.round(p.progress * 100)}% · ${num(p.workers)} workers</span>${progressBar(p.progress, '#f59e0b')}</div>`).join('')}
    <h3 class="sub">Place and hazards</h3>
    <div class="statgrid">${stat('Terrain', esc(s.terrainText))}${stat('Cell', `${s.gx}, ${s.gy}`)}${stat('Land claimed', `${Math.min(16, 4 + Math.sqrt(s.population) * 0.55).toFixed(1)} cells`)}</div>
    <div class="linkrow"><span>Resources nearby</span>${Object.entries(near).map(([r, c]) => `<span class="lg"><i style="background:${RESOURCES[r].color}"></i>${RESOURCES[r].name} ×${c}</span>`).join('') || '<small class="muted">none</small>'}</div>
    <div class="bars hz">${hazards.map(([k, v]) => `<div class="hbar"><span>${cap(k)}</span><div class="meter"><i style="width:${Math.min(100, v * 25)}%;background:${HAZARD_STYLE[k]}"></i></div><b>${v.toFixed(1)}</b></div>`).join('')}</div>
    <div class="actions"><button class="soft" data-focus-settlement="${s.id}">${icon('map')} Show on map</button>${s.population >= 20 && !s.abandoned ? `<button class="soft" data-influence-go="expedition:${s.id}">${icon('compass')} Spark an expedition from here</button>` : ''}<button class="soft" data-report="${esc('hazards ' + n)}">${icon('list')} Hazard report</button></div>`;
}
// What a country is part-way through learning from settlers, merchants and conquest (top few, by progress).
function learningRow(c) {
  const tree = snap.tech && snap.tech.tree; if (!tree) return '';
  const boosted = new Set(c.boosted || []), pct = n => Math.min(99, Math.round(((c.insight || {})[n] || 0) / tree[n][1] * 100));
  const names = [...new Set([...Object.keys(c.insight || {}), ...boosted])].filter(n => tree[n] && !c.technologies.includes(n));
  if (!names.length) return '';
  const shown = names.sort((a, b) => pct(b) - pct(a) || boosted.has(b) - boosted.has(a)).slice(0, 6);
  return `<div class="linkrow"><span>Learning</span>${shown.map(n => `<span class="tag" style="--c:${boosted.has(n) ? '#f97316' : '#16a34a'}" title="${boosted.has(n) ? 'Studied twice as fast after a conquest' : 'Learned from settlers and trade'}">${esc(n)} ${pct(n)}%${boosted.has(n) ? ' · 2×' : ''}</span>`).join('')}${names.length > shown.length ? `<small class="muted">+${names.length - shown.length} more</small>` : ''}</div>`;
}

// Dim every discovery that does not match the search box or the Ready / Learning / 2× chip.
function applyTechFilter() {
  const q = view.search.trim().toLowerCase(), only = view.techOnly, on = !!(q || only);
  $$('.techcanvas .tnode').forEach(el => {
    const ok = (!q || el.dataset.tech.toLowerCase().includes(q)) && (!only || (only === 'open' ? el.classList.contains('open') : only === 'learning' ? el.dataset.learn === '1' : el.dataset.boost === '1'));
    el.classList.toggle('dim', on && !ok);
  });
}

function countryExtras(c) {
  const st = c.systems; if (!st) return '';
  const n = quote(c.name), biggest = livePlaces().filter(s => s.country === c.id).sort((a, b) => b.population - a.population)[0], parties = snap.expeditions.filter(e => e.country === c.id).length;
  return `<h3 class="sub">How this country works</h3><div class="statgrid">${stat('Science output', '×' + st.research.toFixed(2))}${stat('Culture', num(st.culture))}${stat('Trade', st.trade.toFixed(1))}${stat('Town-founding drive', '×' + st.expansion.toFixed(2))}${stat('Disease spread', '×' + st.infection_mult.toFixed(2))}${stat('Settler parties', parties)}</div>
    <div class="actions"><button class="soft" data-systems-country="${c.id}">${icon('network')} See every effect</button>${biggest ? `<button class="soft" data-influence-go="expedition:${biggest.id}">${icon('compass')} Spark an expedition</button>` : ''}</div>`;
}

const dlg = () => $('#detail-dialog');
// mode 'view' inspects; mode 'edit' shows everything that can be changed about it (ui/editor.js).
function showDialog(type, id, mode = 'view') { dialog = { type, id: String(id), mode }; renderDialog(); if (!dlg().open) { dlg().showModal(); $('#detail-content').scrollTop = 0; } }
function openEditor(target) { if (!target || !snap) return; if (influences.armed) influences.cancel(); showDialog(target.type, target.id, 'edit'); }
// What the Edit button of an inspector opens: the thing itself, or for a moving party the country it belongs to.
function editTarget(type, item) { return UNIT_TYPES.includes(type) ? { type: 'country', id: String(item.country) } : { type, id: String(item.id ?? dialog.id) }; }
function lookup(type, id) { if (type === 'world') return { id: 'world' }; if (UNIT_TYPES.includes(type)) return findUnit(snap, type, id); if (type === 'cell') { const [x, y] = String(id).split(',').map(Number); return snap?.geo && y >= 0 && y < snap.geo.h ? { id: String(id), x, y } : null; } return type === 'person' ? idx.people.get(id) : type === 'settlement' ? idx.settlements.get(id) : type === 'country' ? idx.countries.get(id) : snap.diseases.find(d => d.name === id); }
function renderDialog() {
  if (!dialog) return;
  const item = lookup(dialog.type, dialog.id);
  if (!item) { dlg().close(); return; }
  const box = $('#detail-content'), top = box.scrollTop, same = box.dataset.key === `${dialog.mode}:${dialog.type}:${dialog.id}`;
  if (dialog.mode === 'edit') box.innerHTML = editor.render(dialog.type, item) + editor.lists();
  else { const e = editTarget(dialog.type, item); box.innerHTML = `<button class="edit-open" data-edit="${e.type}:${esc(e.id)}" title="Edit (or right-click it anywhere)">${icon('hammer')}<span>Edit</span></button>` + (DIALOGS[dialog.type] || UNITS[dialog.type])(item); }
  const key = `${dialog.mode}:${dialog.type}:${dialog.id}`;
  box.dataset.key = key; box.scrollTop = same ? top : 0;
  if (dialog.mode !== 'edit' && dialog.type === 'person') fillStory();
}
// A person's story is stitched together in the worker only when their panel is open, then kept until the world changes.
let storyCache = new Map();
function storyHtml(s) {
  if (!s) return '<p class="muted">No record.</p>';
  const st = s.standing, n = s.now;
  const now = n ? `<p class="life-now">Now ${esc(n.job)}${n.role ? `, ${esc(n.role)}` : ''} in ${esc(n.settlement)}, ${esc(n.country)} · wealth ${num(n.wealth)} · fame ${Math.round(n.fame)}${n.overlay ? ' <em>(in their own story: the world has not caught up)</em>' : ''}</p>` : '';
  return `<p class="life-summary">${tag(`${st.rank} · ${st.score}`, '#8b5cf6')} ${esc(s.summary)}</p>${now}<ol class="life-lines">${s.lines.map(l => `<li><b>Year ${l.year}</b><span>${esc(l.text)}</span></li>`).join('')}</ol>`;
}
async function fillStory() {
  const el = $('#detail-content .life-story'); if (!el || !snap) return;
  const id = el.dataset.life, key = `${snap.year}|${id}`, paint = s => { if (el.isConnected && el.dataset.life === id) el.innerHTML = storyHtml(s); };
  if (storyCache.has(key)) { paint(storyCache.get(key)); return; }
  try { const s = await sim.lifeStory(id); storyCache.set(key, s); paint(s); } catch { paint(null); }
}
function refreshDialog() { if (dialog && dlg().open) renderDialog(); }
function openReport(title, text) {
  $('#report-title').textContent = title; $('#report-text').textContent = text;
  if (!$('#report-dialog').open) $('#report-dialog').showModal();
  $('#report-text').scrollTop = 0;
}

// ---------- rendering ----------
function renderNav() {
  $('#navigation').innerHTML = SECTIONS.filter(s => s[0] !== 'person' || snap?.player).map(([id, label, ic]) => {
    const badge = id === 'wars' && snap?.wars.length ? `<em>${snap.wars.length}</em>` : id === 'health' && snap ? (n => n ? `<em>${n > 999 ? '999+' : n}</em>` : '')(idx.living.filter(p => p.infection).length) : '';
    return `<button data-tab="${id}" class="${section === id ? 'active' : ''}" ${section === id ? 'aria-current="page"' : ''}>${icon(ic)}<span>${label}</span>${badge}</button>`;
  }).join('');
}
function renderTop() {
  const s = SECTIONS.find(x => x[0] === section);
  const pm = section === 'person' && snap?.player; document.body.classList.toggle('pm-mode', !!pm); // playing a person: the simulation's own controls step aside
  $('#page-title').textContent = pm ? snap.player.name : s[1]; $('#page-description').textContent = pm ? `Year ${snap.player.next.year} · ${snap.player.next.name}` : s[3];
  $('#year-num').textContent = snap ? snap.year : 0;
  const seedBox = $('#seed-input'); if (seedBox && snap && document.activeElement !== seedBox) seedBox.value = snap.geoSeed;
  $('#undo').disabled = busy || !snap?.canUndo;
  updatePlay();
  document.title = `${s[1]} · Year ${snap?.year ?? 0} · Commonworld`;
}
function render(force = false) {
  if (!snap) return;
  if (section === 'person' && !snap.player) section = 'overview'; // nobody is being played any more
  renderNav(); renderTop();
  $('#content').innerHTML = VIEWS[section]();
  if (RESULTS[section]) renderResults();
  if (section === 'overview' || section === 'map') { $('#map-slot').append(mapHost); map.redraw(); renderLegend(); }
  if (section === 'tech') { applyTechFilter(); const w = $('.techwrap'); if (w) { if (techScroll) { w.scrollLeft = techScroll.x; w.scrollTop = techScroll.y; } else w.scrollLeft = Number(w.dataset.scroll) || 0; } }
  refreshDialog(); renderChoice();
}
// A life choice waiting for the person you play: a pop-up nobody can dismiss, shown over whatever page is open.
function renderChoice() {
  const ch = snap?.player?.choice, box = $('#choice-dialog');
  if (!ch) { if (box.open) box.close(); box.dataset.key = ''; return; }
  const key = `${ch.year}:${ch.season}:${ch.kind}:${ch.flow}`;
  if (box.dataset.key !== key) { box.innerHTML = choiceHtml(ch, { esc, icon }); box.dataset.key = key; }
  if (!box.open) box.showModal();
}
function renderLegend() { const el = $('#map-legend'); if (el) el.innerHTML = map.legend.map(l => `<span class="lg ${l.terrain ? 'terr' : ''}"><i style="background:${l.color}"></i>${esc(l.label)} <b>${num(l.count)}</b></span>`).join('') + (mapView === 'geo' && hazardKind ? `<span class="lg"><i style="background:${HAZARD_STYLE[hazardKind]}"></i>${cap(hazardKind)} risk (stronger = more likely)</span>` : ''); }
function focusMap(where) {
  $$('dialog[open]').forEach(d => d.close());
  mapView = 'geo'; map.setView('geo');
  if (section !== 'map') { section = 'map'; view.search = ''; }
  render(true);
  const spot = where(); if (spot) { map.focus(spot[0], spot[1], 3.6); renderLegend(); window.scrollTo({ top: 0 }); }
}
document.addEventListener('mouseover', e => { const n = e.target.closest?.('.tnode'); if (n) techFocus(n.dataset.tech); });
document.addEventListener('mouseout', e => { if (e.target.closest?.('.tnode')) techFocus(null); });
document.addEventListener('scroll', e => { if (e.target.classList?.contains('techwrap')) techScroll = { x: e.target.scrollLeft, y: e.target.scrollTop }; }, true);
let techZoom = 1;
function setTechZoom(z, cx, cy) {
  const w = $('.techwrap'), c = $('.techcanvas'); if (!w || !c) return;
  z = Math.max(.15, Math.min(2.5, z)); if (cx == null) { cx = w.clientWidth / 2; cy = w.clientHeight / 2; }
  const px = (w.scrollLeft + cx) / techZoom, py = (w.scrollTop + cy) / techZoom;
  techZoom = z; c.style.zoom = z;
  w.scrollLeft = px * z - cx; w.scrollTop = py * z - cy;
  const b = $('.tzoom b'); if (b) b.textContent = Math.round(z * 100) + '%';
}
document.addEventListener('click', e => {
  const b = e.target.closest?.('[data-tzoom]'); if (!b) return;
  const w = $('.techwrap'), c = $('.techcanvas'); if (!w || !c) return;
  if (b.dataset.tzoom === 'fit') { setTechZoom(Math.min(w.clientWidth / Number(c.dataset.w), (innerHeight * .74) / Number(c.dataset.h))); w.scrollLeft = 0; w.scrollTop = 0; }
  else setTechZoom(techZoom * (b.dataset.tzoom === 'in' ? 1.25 : 0.8));
});
document.addEventListener('wheel', e => {
  const w = e.target.closest?.('.techwrap'); if (!w || !(e.ctrlKey || e.metaKey)) return;
  e.preventDefault(); const r = w.getBoundingClientRect();
  setTechZoom(techZoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12), e.clientX - r.left, e.clientY - r.top);
}, { passive: false });
let techDrag = null;
document.addEventListener('pointerdown', e => { const w = e.target.closest?.('.techwrap'); if (w && !e.target.closest('.tnode')) techDrag = { w, x: e.clientX, y: e.clientY, sx: w.scrollLeft, sy: w.scrollTop }; });
document.addEventListener('pointermove', e => { if (techDrag) { techDrag.w.scrollLeft = techDrag.sx - (e.clientX - techDrag.x); techDrag.w.scrollTop = techDrag.sy - (e.clientY - techDrag.y); } });
document.addEventListener('pointerup', () => { techDrag = null; });
function switchSection(id) { section = id; view.search = ''; view.country = ''; view.page = 0; view.job = ''; view.infected = false; view.eventCat = ''; view.techOnly = ''; render(true); window.scrollTo({ top: 0 }); }

// ---------- map ----------
const mapHost = document.createElement('div'); mapHost.className = 'map-host';
const map = new WorldMap(mapHost, {
  countryColor: id => cc(id),
  onPick: hit => {
    if (influences.armed && influences.pick(hit)) return;
    if (hit.type === 'ping') { openPing(hit.item); return; }
    if (hit.type === 'building') { showDialog('settlement', hit.sid); return; }
    if (hit.type === 'cell' && mapView !== 'geo') return;
    showDialog(hit.type, hit.id);
  },
  onHover: (hit, e) => {
    const tip = $('#tooltip');
    if (!hit || !e) { tip.hidden = true; return; }
    const it = hit.item, rect = mapHost.getBoundingClientRect();
    tip.innerHTML = hit.type === 'ping' ? `<b>${esc(it.headline)}</b>${it.sub ? `<span>${esc(it.sub)}</span>` : ''}<span>Year ${it.year} · click to open</span>`
      : hit.type === 'person'
      ? `<b>${esc(it.name)}</b><span>${esc(it.role || it.job || 'resident')} · age ${it.age}</span><span>${esc(it.settlementName)} · wealth ${num(it.wealth)}${it.infection ? ' · ' + esc(it.infection) : ''}</span>`
      : hit.type === 'expedition' ? `<b>${esc(it.countryName)} settlers</b><span>${it.people} people from ${esc(it.originName)}</span><span>${it.kind === 'found' ? 'Heading to found a new town' : 'Heading to ' + esc(it.targetName || 'a new home')} · about ${etaYears(it)} yr</span>`
      : hit.type === 'army' ? `<b>${esc(it.countryName)} army</b><span>${num(it.men)} ${esc(it.unit || 'soldiers')} from ${esc(it.originName)}</span><span>${it.state === 'besieging' ? 'Besieging' : 'Marching on'} ${esc(it.objectiveName)} (${esc(it.enemyName)})</span>`
      : hit.type === 'caravan' ? `<b>${it.size >= 40 ? 'Large merchant band' : 'Merchant band'}</b><span>${it.size} ${esc(it.countryName)} merchants with ${esc(it.cargo)}</span><span>${esc(it.originName)} → ${esc(it.destName)}${it.mode === 'sea' ? ' by ship' : ''}</span>${it.carries ? `<span>Carrying ${esc(it.carries)}</span>` : ''}`
      : hit.type === 'building' ? `<b>${esc(it.name)}</b><span>${esc(it.blurb)}</span><span>${esc(it.settlement)} · ${esc(it.country)}</span>`
      : hit.type === 'cell' && it.terrain == null ? `<b>${it.owner ? esc(it.owner) : 'Unclaimed land'}</b><span>${it.contested ? 'Contested tile: fought over in a war' : 'Territory'}</span>`
      : hit.type === 'cell' ? `<b>${esc(it.terrain)}${it.river ? ' · river' : ''}</b><span>${it.owner ? esc(it.owner) + ' territory' : 'Unclaimed land'}${it.contested ? ' · contested' : ''}</span>${(it.deposits || []).map(d => `<span>${esc(RESOURCES[d.kind].name)} ${Math.round(d.amount)}/${d.cap}${d.locked ? ' · exhausted' : ''}</span>`).join('')}${it.features ? `<span>${[...it.features].map(c => FEATURES[c]).join(', ')}</span>` : ''}<span>cell ${it.x}, ${it.y}</span>`
      : `<b>${esc(it.name)}</b><span>${esc(cap(it.kind || 'settlement'))}${it.capital ? ' · capital' : ''} of ${esc(it.countryName)}</span><span>${num(it.population)} residents${it.terrainText ? ' · ' + esc(it.terrainText) : ''}</span>${Object.keys(it.buildings || {}).length ? `<span>${Object.keys(it.buildings).map(buildLabel).join(', ')}</span>` : ''}${Object.keys(it.sick || {}).length ? `<span>☣ ${Object.entries(it.sick).map(([k, v]) => `${esc(k)} ${v}`).join(', ')}</span>` : ''}${(snap.projects || []).filter(p => p.settlement === it.id).map(p => `<span>Building: ${esc(p.label)} ${Math.round(p.progress * 100)}%</span>`).join('')}`;
    if (influences.armed) tip.innerHTML += `<em class="aim">${influences.hint(hit)}</em>`;
    tip.hidden = false;
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    tip.style.left = Math.min(x + 16, rect.width - tip.offsetWidth - 8) + 'px'; tip.style.top = Math.max(8, y - tip.offsetHeight - 14 < 0 ? y + 18 : y - tip.offsetHeight - 14) + 'px';
  }
});
window.__map = map; // handy for debugging and automated checks
const pings = new Pings(); map.addLayer(pings); window.__pings = pings;
const playerMark = new PlayerMarker(); map.addLayer(playerMark);
const pingTray = document.createElement('div'); pingTray.className = 'ping-slot'; mapHost.append(pingTray);
function renderTray() { pingTray.innerHTML = pings.tray(esc); }
// Jump: the map centres on the event. Clicking the ping itself opens what it is about.
function jumpPing(p) { pings.mark(p); focusMap(() => [p.x, p.y]); renderTray(); }
function openPing(p) {
  pings.mark(p); renderTray(); toast(`${p.headline}${p.sub ? ' · ' + p.sub : ''}`);
  if (lookup(p.target.type, String(p.target.id))) showDialog(p.target.type, p.target.id);
}
const tooltip = document.createElement('div'); tooltip.id = 'tooltip'; tooltip.hidden = true; mapHost.append(tooltip);
for (const [key, on] of Object.entries(geoOn)) map.geoOpts[key] = on;

async function chooseHazard(kind) {
  if (kind && (!hazardData || hazardSeed !== snap.geoSeed)) {
    toast('Computing hazards for every cell… (a few seconds)', 'warn');
    const ok = await work(async () => { hazardData = await sim.hazardMap(); hazardSeed = snap.geoSeed; });
    if (!ok) { $('#hazard-select').value = ''; return; }
  }
  hazardKind = kind; map.setHazard(kind, hazardData); renderLegend();
}

// ---------- actions ----------
function setBusy(v) {
  busy = v; document.body.classList.toggle('busy', v);
  $$('#step, #new-world, #save, #load, #command-form button, [data-years]').forEach(el => { el.disabled = v || !snap; });
  $('#undo').disabled = v || !snap?.canUndo; $('#new-form button[type=submit]').disabled = v;
}
function showError(error) { $('#error').hidden = false; $('#error').textContent = error?.message || String(error); playing = false; stopFlag = true; updatePlay(); }
async function work(fn) { if (busy) return false; setBusy(true); $('#error').hidden = true; try { await fn(); return true; } catch (e) { showError(e); return false; } finally { setBusy(false); } }
function updatePlay() { const on = playing || running, pm = document.body.classList.contains('pm-mode'); $('#play').innerHTML = on ? `${icon('stop')} ${pm ? 'Pause' : 'Stop'}` : `${icon('play')} ${pm ? 'Live on' : 'Play'}`; $('#play').classList.toggle('stop', on); }
function setProgress(i, n) { $('#progress').textContent = i ? `Simulating ${i} / ${n}` : ''; $('#progress').hidden = !i; }
// A year plays out as four seasons spread over the time its travellers need to walk their hops (at least a short minimum).
// The speed setting is the time to cross one tile; autoplay rests a little after the last hop.
const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];
let seasonRun = 0, yearMs = 0;
const tileMs = () => Number($('#speed').value) / 12;
async function runSeasons(total) {
  const run = ++seasonRun;
  for (const name of SEASONS) { if (run !== seasonRun) return; $('#season').textContent = name; await sleep(total / 4); }
}
async function runYears(n) {
  if (busy) return;
  stopFlag = false; running = true; updatePlay();
  await work(async () => {
    for (let i = 0; i < n && !stopFlag; i++) {
      const s = await sim.step(1); map.tileMs = n > 1 ? 0 : tileMs(); setSnap(s); render();
      if (s.player?.choice) { resume = playing ? 'play' : n > 1 ? n - i : null; stopFlag = true; playing = false; updatePlay(); toast('A decision is waiting for you.', 'warn'); break; } // time pauses at every pop-up, then carries on once it is answered
      if (n > 1) setProgress(i + 1, n); else { yearMs = Math.max(map.animMs, 8 * tileMs()); runSeasons(yearMs); }
    }
  });
  running = false; setProgress(); updatePlay();
}
async function togglePlay() {
  if (playing || running) { playing = false; stopFlag = true; resume = null; updatePlay(); return; }
  playing = true; updatePlay();
  while (playing) { await runYears(1); if (!playing) break; await sleep(yearMs + Number($('#speed').value) / 2); }
  playing = false; updatePlay();
}
function toast(text, kind = 'ok') {
  const el = document.createElement('div'); el.className = `toast ${kind}`; el.textContent = text.length > 160 ? text.slice(0, 157) + '…' : text;
  const box = $('#toasts'); box.append(el); while (box.children.length > 4) box.firstChild.remove();
  setTimeout(() => el.classList.add('out'), 4200); setTimeout(() => el.remove(), 4700);
}
// to: 'toast' (edits from buttons/forms), 'report' (information dialogs), 'dock' (typed console commands)
async function runCmd(text, { confirm: msg, to = 'toast' } = {}) {
  text = text.trim(); if (!text) return false;
  if (msg && !window.confirm(msg)) return false;
  playing = false; stopFlag = true; updatePlay();
  return work(async () => {
    const r = await sim.command(text);
    setSnap(r.snapshot || await sim.getSnapshot());
    const out = Array.isArray(r.output) ? r.output.join('\n') : String(r.output || 'Command completed.');
    if (to === 'dock') console_.show(text, out);
    if (to === 'report') openReport(text, out);
    else if (to === 'dock') { if (r.action === 'edit') toast(firstLine(out), 'ok'); }
    else toast(firstLine(out), r.action === 'edit' || r.action === 'next' ? 'ok' : 'warn');
    render(true);
  });
}

// ---------- inputs ----------
document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'search') { view.search = t.value; view.page = 0; if (section === 'tech') applyTechFilter(); else renderResults(); }
  if (t.id === 'map-people') { showPeople = t.checked; map.setShowPeople(showPeople); }
  if (t.dataset.geo) { geoOn[t.dataset.geo] = t.checked; map.setGeoOption(t.dataset.geo, t.checked); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'hazard-select') { chooseHazard(t.value); return; }
  if (t.dataset.filter) {
    const k = t.dataset.filter; view[k] = t.type === 'checkbox' ? t.checked : t.value; view.page = 0;
    if (k === 'country' && (section === 'demographics' || section === 'discoveries')) render(true); else renderResults();
    return;
  }
});
// ---------- console (hidden behind ~) ----------
const console_ = new Console({ $, $$, esc, quote, num, run: text => runCmd(text, { to: 'dock' }), snap: () => snap, idx: () => idx, places: () => livePlaces() });

// ---------- influences ----------
// What a map click points at, in the terms an influence needs.
function resolveHit(hit) {
  const g = snap?.geo; if (!g) return null;
  let s = null, cid = null, cell = null;
  const town = id => { const x = idx.settlements.get(String(id)); return x && !x.abandoned && x.population > 0 ? x : null; };
  if (hit.type === 'settlement' || hit.type === 'building') s = town(hit.type === 'building' ? hit.sid : hit.id);
  else if (hit.type === 'ping') { if (hit.item.target.type === 'settlement') s = town(hit.item.target.id); else if (hit.item.target.type === 'country') cid = hit.item.target.id; else cell = hit.item.target.id.split(',').map(Number); }
  else if (hit.type === 'cell') cell = [hit.cx, hit.cy];
  else if (UNIT_TYPES.includes(hit.type)) { cell = hit.item.path[hit.item.index]; cid = hit.item.country; s = livePlaces().find(x => x.gx === cell[0] && x.gy === cell[1]) || null; } // whatever stands where the unit is
  else if (hit.item?.country != null) cid = hit.item.country;
  if (s) { cid = s.country; cell = [s.gx, s.gy]; }
  if (cell && cid == null) cid = map.owner[cell[1]]?.[cell[0]] || nearestTown(cell)?.country;
  const c = cid != null ? idx.countries.get(String(cid)) : null, k = cell ? g.terrain[cell[1]][cell[0]] : null;
  return {
    settlement: s && { id: s.id, name: s.name, country: s.country }, country: c && c.population > 0 ? { id: c.id, name: c.name } : null,
    cell, terrain: k, water: k === 'o' || k === 'l', river: cell ? g.river[cell[1]][cell[0]] === '1' : false,
    coast: !!cell && [-1, 0, 1].some(dy => [-1, 0, 1].some(dx => g.terrain[cell[1] + dy]?.[cell[0] + dx] === 'o'))
  };
}
function nearestTown([x, y]) {
  let best = null, bd = Infinity;
  for (const s of livePlaces()) { const d = (s.gx - x) ** 2 + (s.gy - y) ** 2; if (d < bd) { bd = d; best = s; } }
  return best;
}
const influences = new InfluenceBar($('#influences'), {
  run: text => runCmd(text), resolve: resolveHit, quote, esc, icon, toast,
  extra: `<span class="inf-sep"></span><button class="inf-btn quiet" data-edit="world:world" style="--c:#5b5bf0" title="World rules: war, breakaway and disaster chances, new diseases">${icon('network')}<span>World rules</span></button>`,
  onArm: on => { mapHost.classList.toggle('aiming', on); if (on && section !== 'overview' && section !== 'map') { $$('dialog[open]').forEach(d => d.close()); switchSection('map'); } }
});
window.__influences = influences;
const editor = new Editor({ esc, quote, num, icon, tag, cc, jobs: JOBS, snap: () => snap, idx: () => idx, places: () => livePlaces(), resolve: hit => resolveHit(hit) });
window.__editor = editor;
// Right-click anything to edit it: on the map, or any person, town, country or disease in a list.
mapHost.addEventListener('contextmenu', e => { if (e.target.closest('.map-zoom, .ping-slot')) return; e.preventDefault(); openEditor(Editor.target(map.find(e))); });
document.addEventListener('contextmenu', e => {
  const el = e.target.closest?.('[data-person],[data-settlement],[data-country],[data-disease]'); if (!el || mapHost.contains(el)) return;
  e.preventDefault(); for (const type of ['person', 'settlement', 'country', 'disease']) if (el.dataset[type] != null) { openEditor({ type, id: el.dataset[type] }); return; }
});
document.addEventListener('submit', e => {
  const form = e.target.closest('form[data-edit-action]'); if (!form) return;
  e.preventDefault(); const c = editor.command(form.dataset.editAction, form); if (c) runCmd(c.cmd, { confirm: c.confirm });
});
// Influence shortcuts inside dialogs: an idea runs at once; the others start aiming with the first choice made.
function influenceGo(kind, id) {
  $$('dialog[open]').forEach(d => d.close());
  if (kind === 'idea') { const c = idx.countries.get(id); if (c) runCmd(`inspire ${quote(c.name)}`); return; }
  const item = kind === 'expedition' ? idx.settlements.get(id) : idx.countries.get(id); if (!item) return;
  influences.arm(kind, [{ id: item.id, name: item.name, country: item.country ?? item.id }]);
}

// ---------- person mode ----------
// Playing one person: choices go to the worker one season at a time; a new year only starts when spring does.
async function startPlaying(id) {
  playing = false; stopFlag = true; updatePlay();
  if (snap.player && String(snap.player.id) !== String(id) && !window.confirm('Switch to this person? You stop playing ' + snap.player.name + '.')) return;
  await work(async () => { await sim.playAs(id); setSnap(await sim.getSnapshot()); $$('dialog[open]').forEach(dd => dd.close()); section = 'person'; render(true); window.scrollTo({ top: 0 }); });
}
async function playSeasonUI(act, arg) {
  playing = false; stopFlag = true; updatePlay();
  await work(async () => {
    const r = await sim.playSeason(act, arg);
    if (r.snapshot) setSnap(r.snapshot); else { snap.player = r.view; playerMark.update(snap, map); map.redraw(); }
    render(true);
    if (r.view?.choice) toast('A decision is waiting for you.', 'warn');
    else if (r.view?.log?.[0]) toast(r.view.log[0].text);
  });
}
// Answer the pop-up. The answer may change the world (an illness, a wound, a settler party), so a fresh snapshot comes back.
async function chooseUI(option) {
  const ok = await work(async () => {
    const r = await sim.choose(option);
    setSnap(r.snapshot); render(true);
    if (r.view?.log?.[0]) toast(r.view.log[0].text);
  });
  const again = resume; resume = null;
  if (ok && again && snap?.player?.alive && !snap.player.choice) { if (again === 'play') togglePlay(); else runYears(again); } // the decision made, time carries on by itself
  else if (!ok) resume = again;
}
// A focus is what the person does every season; changing it takes no time and does not stop the clock.
async function setFocusUI(id) {
  try { const r = await sim.setFocus(id); snap.player = r.view; render(true); toast('Focus: ' + (r.view.focuses.find(f => f.id === id)?.label ?? id)); } catch (e) { showError(e); }
}
// A one-off move waits for the next season. If time is stopped, live that season now so the click has an effect.
async function queueUI(act, arg) {
  try {
    const r = await sim.queueAct(act, arg); snap.player = r.view; render(true);
    if (act && !(playing || running)) playSeasonUI('auto'); else if (act) toast('Queued for next season.');
  } catch (e) { showError(e); }
}
// The person you played has died: carry on as an heir. Money, fame and perhaps an office come with them.
async function succeedUI(pick) {
  await work(async () => {
    const r = await sim.succeed(pick);
    setSnap(r.snapshot); section = 'person'; render(true); window.scrollTo({ top: 0 });
    if (r.view?.log?.[0]) toast(r.view.log[0].text);
  });
}
async function stopPlaying() { await work(async () => { await sim.stopPlaying(); setSnap(await sim.getSnapshot()); if (section === 'person') section = 'overview'; render(true); toast('You stopped playing.'); }); }

// ---------- global clicks ----------
document.addEventListener('click', e => {
  const t = e.target; let el;
  if ((el = t.closest('[data-tab]'))) { $$('dialog[open]').forEach(d => d.close()); switchSection(el.dataset.tab); return; }
  if ((el = t.closest('[data-run]'))) { runCmd(el.dataset.run, { confirm: el.dataset.confirm }); return; }
  if ((el = t.closest('[data-report]'))) { runCmd(el.dataset.report, { to: 'report' }); return; }
  if ((el = t.closest('[data-choice]'))) { chooseUI(el.dataset.choice); return; }
  if ((el = t.closest('[data-play-heir]'))) { succeedUI(el.dataset.playHeir); return; }
  if ((el = t.closest('[data-play-as]'))) { startPlaying(el.dataset.playAs); return; }
  if ((el = t.closest('[data-pm-tab]'))) { setTab(el.dataset.pmTab); render(true); return; }
  if ((el = t.closest('[data-focus]'))) { setFocusUI(el.dataset.focus); return; }
  if ((el = t.closest('[data-queue]'))) { const act = el.dataset.queue, sel = $(`#queue-arg-${act}`); queueUI(act, el.dataset.queueArg ?? (sel ? sel.value : null)); return; }
  if (t.closest('[data-queue-clear]')) { queueUI(null); return; }
  if (t.closest('[data-play-next]')) { playSeasonUI('auto'); return; }
  if (t.closest('[data-play-stop]')) { stopPlaying(); return; }
  if (t.closest('[data-play-random]')) { succeedUI('random'); return; }
  if ((el = t.closest('[data-edit]'))) { const [type, ...id] = el.dataset.edit.split(':'); openEditor({ type, id: id.join(':') }); return; }
  if ((el = t.closest('[data-edit-back]'))) { if (dialog) showDialog(dialog.type, dialog.id); return; }
  if ((el = t.closest('[data-ping]'))) { const p = pings.find(el.dataset.ping); if (p) jumpPing(p); return; }
  if ((el = t.closest('[data-influence-go]'))) { const [kind, id] = el.dataset.influenceGo.split(':'); influenceGo(kind, id); return; }
  if ((el = t.closest('[data-map-view]'))) { mapView = el.dataset.mapView; map.setView(mapView); render(true); return; }
  if ((el = t.closest('[data-news]'))) { const item = newsItems[Number(el.dataset.news)]; if (item) openReport(`${item.tag} · Year ${item.year}`, `${item.headline}${item.sub ? '\n' + item.sub : ''}${item.message ? '\n\n' + item.message : ''}`); return; }
  if ((el = t.closest('[data-focus-settlement]'))) { focusMap(() => { const s = idx.settlements.get(el.dataset.focusSettlement); return s && s.gx != null ? cellXY(s) : null; }); return; }
  if ((el = t.closest('[data-focus-exp]'))) { focusMap(() => { const e = snap.expeditions.find(x => String(x.id) === el.dataset.focusExp); return e ? [(e.path[e.index][0] + 0.5) * 1000 / snap.geo.w, (e.path[e.index][1] + 0.5) * 600 / snap.geo.h] : null; }); return; }
  if ((el = t.closest('[data-focus-army]'))) { focusMap(() => { const a = snap.armies.find(x => String(x.id) === el.dataset.focusArmy); return a ? [(a.path[a.index][0] + 0.5) * 1000 / snap.geo.w, (a.path[a.index][1] + 0.5) * 600 / snap.geo.h] : null; }); return; }
  if ((el = t.closest('[data-focus-caravan]'))) { focusMap(() => { const c = snap.caravans.find(x => String(x.id) === el.dataset.focusCaravan); return c ? [(c.path[c.index][0] + 0.5) * 1000 / snap.geo.w, (c.path[c.index][1] + 0.5) * 600 / snap.geo.h] : null; }); return; }
  if ((el = t.closest('[data-focus-cell]'))) { focusMap(() => { const [x, y] = el.dataset.focusCell.split(',').map(Number); return [(x + 0.5) * 1000 / snap.geo.w, (y + 0.5) * 600 / snap.geo.h]; }); return; }
  if ((el = t.closest('[data-systems-country]'))) { $$('dialog[open]').forEach(d => d.close()); const id = el.dataset.systemsCountry; switchSection('systems'); view.country = id; render(true); return; }
  if ((el = t.closest('[data-map-mode]'))) { mapMode = el.dataset.mapMode; map.setMode(mapMode); $$('[data-map-mode]').forEach(b => b.classList.toggle('on', b === el)); renderLegend(); return; }
  if ((el = t.closest('[data-tech-only]'))) { view.techOnly = view.techOnly === el.dataset.techOnly ? '' : el.dataset.techOnly; $$('[data-tech-only]').forEach(b => b.classList.toggle('on', b.dataset.techOnly === view.techOnly)); applyTechFilter(); return; }
  if ((el = t.closest('[data-event-cat]'))) { view.eventCat = el.dataset.eventCat; $$('[data-event-cat]').forEach(b => b.classList.toggle('on', b === el)); renderResults(); return; }
  if ((el = t.closest('[data-page]'))) { view.page += el.dataset.page === 'next' ? 1 : -1; renderResults(); $('#content').scrollIntoView({ block: 'start' }); return; }
  for (const type of ['person', 'settlement', 'country', 'disease']) if ((el = t.closest(`[data-${type}]`))) { showDialog(type, el.dataset[type]); return; }
  if ((el = t.closest('[data-copy]'))) { navigator.clipboard?.writeText($('#report-text').textContent); toast('Copied to clipboard.'); return; }
  if (t.closest('.close')) { t.closest('dialog').close(); return; }
  if (t.tagName === 'DIALOG' && t.id !== 'choice-dialog') t.close();
});
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('[role=button][data-person],[role=button][data-settlement],[role=button][data-country],[role=button][data-disease]')) { e.preventDefault(); e.target.click(); return; }
  if (e.key === 'Enter' && !e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey && snap && !e.target.closest('input,textarea,select,button,a,dialog,[role=button]')) { e.preventDefault(); runYears(1); return; }
  if (e.key === 'Escape' && influences.armed && !$('dialog[open]')) { influences.cancel(); }
});
dlg().addEventListener('close', () => { dialog = null; });
$('#choice-dialog').addEventListener('cancel', e => e.preventDefault()); // Esc cannot dodge a decision

// ---------- top bar and sidebar ----------
$('#step').onclick = () => { playing = false; runYears(1); };
$$('[data-years]').forEach(b => { b.onclick = () => { playing = false; runYears(Number(b.dataset.years)); }; });
$('#play').onclick = togglePlay;
$('#undo').onclick = () => runCmd('undo');
$('#new-world').onclick = () => { playing = false; stopFlag = true; $('#new-form [name=seed]').value = randomSeed(); $('#new-dialog').showModal(); };
$('#seed-form').onsubmit = e => {
  e.preventDefault(); const seed = Number($('#seed-input').value);
  if (!Number.isSafeInteger(seed) || seed < 1) { toast('Enter a whole number of 1 or more.'); return; }
  if (snap && snap.year > 0 && !confirm(`Start a new world from seed ${seed}? This replaces the current one; save first to keep it.`)) return;
  playing = false; stopFlag = true;
  work(async () => { setSnap(await sim.create({ population: Number($('#new-form [name=population]').value) || 2000, seed })); section = 'overview'; render(true); toast(`New world from seed ${seed}.`); });
};
$('#random-seed').onclick = () => { $('#new-form [name=seed]').value = randomSeed(); };
$('#new-form').onsubmit = e => {
  e.preventDefault(); const data = new FormData(e.target);
  work(async () => { setSnap(await sim.create({ population: Number(data.get('population')), seed: Number(data.get('seed')) })); $('#new-dialog').close(); section = 'overview'; render(true); toast('New simulation created.'); });
};
$('#save').onclick = () => {
  playing = false; stopFlag = true;
  work(async () => { const text = await sim.exportSave(), url = URL.createObjectURL(new Blob([text], { type: 'application/json' })), a = document.createElement('a'); a.href = url; a.download = `commonworld-year-${snap.year}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast('Save file downloaded.'); });
};
$('#load').onclick = () => { playing = false; stopFlag = true; $('#load-file').click(); };
$('#load-file').onchange = e => { const file = e.target.files[0]; if (file) work(async () => { setSnap(await sim.importSave(await file.text())); render(true); toast(`Restored ${file.name}.`); }); e.target.value = ''; };

// ---------- start ----------
setBusy(true); updatePlay();
try {
  sim = new BrowserSimulation();
  setSnap(await sim.create({ population: 2000, seed: randomSeed() }));
  render(true);
} catch (e) {
  showError(e);
  $('#content').innerHTML = '<div class="loading"><h2>The simulation could not start.</h2><p>Check the error above, then reload this page.</p></div>';
} finally { setBusy(false); }
