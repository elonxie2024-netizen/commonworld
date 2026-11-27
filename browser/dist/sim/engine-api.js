// The Engine the UI talks to (through worker.js/bridge.js): create a world, advance years, run console commands,
// save/load, and build the plain-object snapshot that app.js renders.  It drives the native simulator in this folder.
import * as geography from './geography.js';
import * as development from './development.js';
import * as technology from './technology.js';
import * as governments from './governments.js';
import * as systems from './systems.js';
import {INNOVATIONS} from './discoveries.js';
import {TECHNOLOGIES, EVENT_CATALOG} from './society.js';
import {command} from './civic.js';
import {Life} from './life.js';
import {runSeasons, runSeason} from './life_seasons.js';
import {newPlayer, perform, playerView, oneOffs} from './life_player.js';
import {newStats, context, focusSpecs, runFocus} from './life_careers.js';
import {depthSeason, depthAct, ensureDepth} from './life_depth.js';
import {detect, resolveChoice} from './life_events.js';
import {succeed} from './life_succession.js';
import {observers} from './warfare.js';
import {Simulation, Person, Settlement, Sickness, Lineage, Country, NameGenerator} from './civsim.js';
import {serialize, deserialize, Counter, TupleMap} from './runtime.js';

/** Everything that can appear in a save file, by class name. */
const SAVE_CLASSES = {Simulation, Person, Settlement, Sickness, Lineage, Country, NameGenerator};

let discoveryNames = null, buildingCatalog = null, govCatalog = null, techTree = null;
// Rendered event text; cleared by anything that can rename people or places.
const eventCache = new Map();
let eventStamp = -1;
const geoCache = new Map();

/** Maps/Sets/tuples to plain JSON-friendly objects and arrays (what the UI reads). */
function js(x) {
  if (x instanceof Map || x instanceof TupleMap) return Object.fromEntries([...x].map(([k, v]) => [String(k), js(v)]));
  if (x instanceof Set) return [...x].map(js);
  if (Array.isArray(x)) return x.map(js);
  return x;
}

const TERRAIN_CODES = {ocean: 'o', lake: 'l', plains: 'p', forest: 'f', hills: 'h', mountains: 'm', desert: 'd', swamp: 's', tundra: 't'};
const TERRAIN_NAMES = {o: 'ocean', l: 'lake', p: 'plains', f: 'forest', h: 'hills', m: 'mountains', d: 'desert', s: 'swamp', t: 'tundra'};

/** The world map as compact strings, cached per terrain seed. */
function buildGeo(sim) {
  const seed = sim.geo_seed ?? 0;
  if (geoCache.has(seed)) return geoCache.get(seed);
  const world = geography.world(sim);
  const digit = (v, s) => Math.max(0, Math.min(9, Math.floor(v * s)));
  const W = geography.W;
  const geo = {
    w: W, h: geography.H,
    terrain: [...world.get('terrain')].map(r => [...r].map(c => TERRAIN_CODES[c]).join('')),
    river: [...world.get('river')].map(r => [...r].map(v => (v ? '1' : '0')).join('')),
    soil: [...world.get('soil')].map(r => [...r].map(v => digit(v, 10)).join('')),
    temp: [...world.get('temp')].map(r => [...r].map(v => digit(v, 9)).join('')),
    wet: [...world.get('wet')].map(r => [...r].map(v => digit(v, 12)).join('')),
    features: [...world.get('feat')].flatMap((r, y) => [...r].map((tags, x) => (tags ? [x, y, tags] : null)).filter(Boolean)),
    deposits: [...world.get('deposits')].map(([k, list]) => [k % W, Math.floor(k / W), [...list].map(t => [t[0], t[1]])]),
    elev: [...world.get('elev')].map(r => [...r].map(v => Math.max(0, Math.min(9, Math.floor(v * 10)))).join('')),
    land: [...world.get('land')].map(r => [...r]),
  };
  geoCache.set(seed, geo);
  return geo;
}

function describeCell(geo, x, y) {
  if (x == null) return 'unplaced';
  let coast = false, river = false;
  for (let yy = Math.max(0, y - 1); yy <= Math.min(geo.h - 1, y + 1); yy++) {
    for (let xx = Math.max(0, x - 1); xx <= Math.min(geo.w - 1, x + 1); xx++) {
      if ('ol'.includes(geo.terrain[yy][xx])) coast = true;
      if (geo.river[yy][xx] === '1') river = true;
    }
  }
  return `${coast ? 'coastal' : 'inland'}${river ? ' riverside' : ''} ${TERRAIN_NAMES[geo.terrain[y][x]]}`;
}

export class Engine {
  create({population = 2000, seed = 42} = {}) {
    eventCache.clear();
    if (!Number.isSafeInteger(population) || population < 1 || population > 20000) throw Error('Choose a population between 1 and 20,000.');
    if (!Number.isSafeInteger(seed)) throw Error('Use a whole-number seed.');
    this.sim = new Simulation(population, seed);
    this.life = new Life();
    return this.snapshot();
  }

  step(count = 1) {
    if (!Number.isInteger(count) || count < 1 || count > 100) throw Error('Advance between 1 and 100 years at a time.');
    for (let i = 0; i < count; i++) {
      const pl = this.life?.player;
      if (pl && this.sim.people.has(pl.id)) { // somebody is being played: their seasons are taken one by one, left to the usual way
        let ticked = false, paused = false;
        for (let guard = 0; !ticked && !paused && guard < 9 && this.sim.people.has(pl.id); guard++) ({ticked, paused} = this._playSeason('auto'));
        if (paused) break; // a decision is waiting: play stops until you make it
      } else this.tickYear();
    }
    return this.snapshot();
  }

  /** `life flow on|off` and `life status`: the layer's own switches, outside the simulation's command language. */
  lifeCommand(rest) {
    const life = this.life ??= new Life(), [what, value] = rest.split(/\s+/);
    if (what === 'flow' && ['on', 'off'].includes(value)) {
      const changed = life.setFlow(this.sim, value === 'on');
      return [value === 'on' ? (changed ? 'People now shape the world: what they do each season is applied to the simulation itself.' : 'People already shape the world.') : (changed ? 'People no longer change the world; what they do each season stays in their own story.' : 'People already stay in their own story.'), 'edit'];
    }
    if (what === 'status' || !what) return [`People shape the world: ${life.flow ? 'on' : 'off'}. ${life.tags.size} people have milestones; ${life.track.size} have private changes.`, 'info'];
    return ['Use: life flow on | life flow off | life status', 'error'];
  }

  command(text) {
    eventCache.clear();
    const lifeCall = /^\s*life(?:\s+(.*))?$/i.exec(String(text));
    if (lifeCall) { const [output, action] = this.lifeCommand((lifeCall[1] ?? '').trim().toLowerCase()); return {output, action, snapshot: this.snapshot()}; }
    const [output, action] = command(this.sim, String(text));
    if (action === 'next') this.step();
    return {output, action, snapshot: this.snapshot()};
  }

  getSnapshot() { return this.snapshot(); }

  /** Per-cell hazard strengths (0-9) for the hazard overlay. */
  hazardMap() {
    const geo = buildGeo(this.sim);
    const kinds = ['flood', 'storm', 'wildfire', 'earthquake', 'landslide', 'blizzard'];
    const out = Object.fromEntries(kinds.map(k => [k, []]));
    for (let y = 0; y < geo.h; y++) {
      const rows = Object.fromEntries(kinds.map(k => [k, '']));
      for (let x = 0; x < geo.w; x++) {
        const water = 'ol'.includes(geo.terrain[y][x]);
        const h = water ? null : geography.hazards_at(this.sim, x, y);
        for (const k of kinds) rows[k] += h ? String(Math.min(9, Math.round(h.get(k) * 2.2))) : '0';
      }
      for (const k of kinds) out[k].push(rows[k]);
    }
    return out;
  }

  /** One year of the simulation, with the life layer watching (it only reads). */
  tickYear({seasons = true} = {}) {
    const life = this.life ??= new Life(), before = life.capture(this.sim);
    observers.levy = (sim, country, army) => life.onLevy(sim, country, army);
    try { this.sim.tick(false); } finally { observers.levy = null; }
    if (seasons) runSeasons(this.sim, life); // four seasons of what people do, then the diff notes what happened to whom
    life.observe(this.sim, before);
  }

  // ---- person mode
  /** Start playing a living person. */
  playAs(id) {
    const life = this.life ??= new Life(), p = this.sim.people.get(Number(id));
    if (!p) throw Error('Pick a living person to play as.');
    life.player = newPlayer(this.sim, p.id); life.touch(this.sim);
    return {view: playerView(this.sim, life), snapshot: null};
  }
  /** What the person does every season from now on, until you change it. Takes no time. */
  setFocus(id) {
    const life = this.life, pl = life?.player, sim = this.sim, p = pl && sim.people.get(pl.id);
    if (!p) throw Error('Nobody is being played.');
    const f = focusSpecs(context(sim, life, p, pl.season >= 4 ? 0 : pl.season)).find(x => x.id === String(id));
    if (!f || !f.enabled) throw Error(f?.why || 'That is not open to them right now.');
    pl.focus = f.id;
    return {view: playerView(sim, life), snapshot: null};
  }

  /** Line up a one-off move (travel, a new trade, an office) for the start of the next season; null clears it. */
  queueAct(act, arg = null) {
    const life = this.life, pl = life?.player, sim = this.sim, p = pl && sim.people.get(pl.id);
    if (!p) throw Error('Nobody is being played.');
    if (act == null) pl.queue = null;
    else {
      const o = oneOffs(sim, life, p).find(x => x.id === act && (x.arg == null || x.arg === arg) && x.enabled && (!x.options || x.options.some(op => op.value === String(arg))));
      if (!o) throw Error('That is not possible for them right now.');
      pl.queue = {act, arg: arg == null ? null : String(arg)};
    }
    return {view: playerView(sim, life), snapshot: null};
  }

  /** The person you played has died: carry on as one of their heirs (or 'random' when no family is left). */
  succeed(pick) {
    const life = this.life; succeed(this.sim, life, pick === 'random' ? pick : Number(pick));
    return {view: playerView(this.sim, life), snapshot: this.snapshot()};
  }
  /** Something done by choice, apart from the routine: set an ambition, buy a perk or property, start a project, see to the people in your life. */
  depth(kind, id = null, arg = null) {
    const life = this.life, pl = life?.player, sim = this.sim, p = pl && sim.people.get(pl.id);
    if (!p) throw Error('Nobody is being played.');
    delete sim._command_undo;
    const r = depthAct(sim, life, p, String(kind), id == null ? null : String(id), arg);
    pl.log.unshift({year: sim.year, season: Math.min(pl.season, 3), text: r.text}); if (pl.log.length > 40) pl.log.length = 40;
    if (r.tag) life.add(p.id, sim.year, 'event', 'choice', r.tag);
    life.touch(sim);
    return {view: playerView(sim, life), snapshot: null};
  }
  stopPlaying() { if (this.life) this.life.player = null; return {view: null, snapshot: null}; }
  playerView() { return this.life ? playerView(this.sim, this.life) : null; }

  /** Play one season as the chosen person ('auto' lets it pass the usual way). The year ticks before spring. */
  playSeason(act = 'auto', arg = null) {
    const {ticked, paused} = this._playSeason(act, arg), life = this.life;
    return {view: playerView(this.sim, life), snapshot: ticked || paused || life.flow ? this.snapshot() : null};
  }

  /** Answer the pop-up that is waiting. The world may have changed (an illness, a wound, a settler party), so a fresh snapshot comes back. */
  choose(optionId) {
    const life = this.life, pl = life?.player, sim = this.sim;
    if (!pl?.choice) throw Error('There is nothing to decide right now.');
    const p = sim.people.get(pl.id);
    if (!p) throw Error('Your person has died.');
    delete sim._command_undo;
    const ch = pl.choice, r = resolveChoice(sim, life, p, ch, String(optionId));
    pl.log.unshift({year: ch.year, season: ch.season, text: r.text}); if (pl.log.length > 40) pl.log.length = 40;
    if (r.tag) life.add(p.id, ch.year, 'event', 'choice', r.tag);
    pl.choice = null;
    return {view: playerView(sim, life), snapshot: this.snapshot()};
  }

  /** {ticked, paused}: whether the year ticked, and whether a pop-up now waits (the season is then not yet lived). */
  _playSeason(act, arg) {
    const life = this.life, pl = life?.player, sim = this.sim;
    if (!pl) throw Error('Nobody is being played. Click a person and choose Play as.');
    if (!sim.people.has(pl.id)) throw Error('Your person has died. Choose someone else to play.');
    if (pl.choice) return {ticked: false, paused: true};
    let ticked = false;
    if (pl.season >= 4) {
      this.tickYear({seasons: false}); pl.season = 0; ticked = true;
      if (!sim.people.has(pl.id)) { const a = sim.archive.get(pl.id); pl.log.unshift({year: sim.year, season: 0, text: `You died at ${a.age}${a.cause_of_death ? ` of ${a.cause_of_death}` : ''}.`}); pl.season = 4; pl.choice = null; return {ticked: true, paused: false}; }
    }
    delete sim._command_undo; // seasons change the world outside an edit
    const p = sim.people.get(pl.id), season = pl.season, before = life.view(sim, p);
    const key = sim.year * 4 + season;
    if (pl.eventKey !== key) { // something big may reach you before the season is lived
      const ev = detect(sim, life, p, season);
      if (ev) { pl.choice = ev; pl.eventKey = key; pl.last = {...(pl.last ?? {}), [ev.kind]: sim.year}; return {ticked, paused: true}; }
    }
    const auto = act === 'auto'; // the usual way: a queued one-off move, else your standing focus
    if (auto) { if (pl.queue) { ({act, arg} = pl.queue); pl.queue = null; } else act = pl.focus || 'work'; }
    runSeason(sim, life, season, pl.id);
    let text;
    if (auto && !['move', 'retrain', 'office'].includes(act)) text = runFocus(context(sim, life, p, season), act);
    else { try { text = perform(sim, life, p, season, act, arg); } catch (e) { if (!auto) throw e; text = runFocus(context(sim, life, p, season), pl.focus || 'work'); } } // a queued move that is no longer possible gives way to your focus
    pl.log.unshift({year: sim.year, season, text});
    for (const line of depthSeason(sim, life, p, season)) pl.log.unshift({year: sim.year, season, text: line}); // property, projects, ambition, people
    if (pl.log.length > 40) pl.log.length = 40;
    pl.season++; life.touch(sim);
    return {ticked, paused: false};
  }

  /** A person's story, stitched together now from their milestone tags and the archive. */
  lifeStory(id) { return (this.life ??= new Life()).story(this.sim, Number(id)); }

  // The life layer rides along as one extra field at the end of the save text.
  exportSave() {
    // The pending-undo snapshot is plain scratch data that a save file cannot hold (and would be stale on loading anyway).
    const undo = this.sim._command_undo; delete this.sim._command_undo;
    let text; try { text = serialize(this.sim); } finally { if (undo) this.sim._command_undo = undo; }
    return `${text.slice(0, -1)},"life":${JSON.stringify((this.life ??= new Life()).toJSON())}}`;
  }

  importSave(text) {
    eventCache.clear();
    const candidate = deserialize(text, SAVE_CLASSES);
    if (!(candidate instanceof Simulation) || !(candidate.people instanceof Map) || !(candidate.countries instanceof Map)) {
      throw Error('The save does not contain a simulation.');
    }
    this.sim = candidate;
    let life = new Life();
    const at = text.lastIndexOf(',"life":');
    if (at > 0) { try { life = Life.fromJSON(JSON.parse(text.slice(at + 8, -1))); } catch { /* an older save: start with no tags */ } }
    this.life = life;
    const pl = life.player; // an older save has no stats or focus yet
    if (pl) ensureDepth(this.sim, pl);
    if (pl && !pl.stats) { pl.stats = newStats(this.sim.people.get(pl.id) ?? this.sim.archive.get(pl.id) ?? {age: 20}); pl.focus ??= 'work'; pl.queue ??= null; }
    return this.snapshot();
  }

  snapshot() {
    const sim = this.sim;
    const {countries, settlements, lineages, people, archive} = sim;
    const pop = new Map(), residents = new Map(), ill = new Map(), sickBy = new Map();
    for (const p of people.values()) {
      pop.set(p.country, (pop.get(p.country) || 0) + 1);
      residents.set(p.settlement, (residents.get(p.settlement) || 0) + 1);
      if (p.infection) {
        ill.set(p.infection, (ill.get(p.infection) || 0) + 1);
        let m = sickBy.get(p.settlement);
        if (!m) { m = {}; sickBy.set(p.settlement, m); }
        m[p.infection] = (m[p.infection] || 0) + 1;
      }
    }
    const full = p => (p ? sim.full_name(p) : 'Unknown');
    const reports = (sim.yearly_reports ?? []).map(r => ({year: r.get('year'), population: r.get('population'), births: r.get('births'), deaths: r.get('deaths')}));
    const latest = reports.at(-1) || {births: 0, deaths: 0};
    const cs = [...countries.values()].map(c => ({
      id: c.id, name: c.name, population: pop.get(c.id) || 0, government: c.government, economicSystem: c.economic_system,
      food: c.food, prosperity: c.prosperity, stability: c.stability, treasury: c.treasury ?? 0, capital: c.capital,
      conditions: [...(c.conditions ?? [])], technologies: [...(c.technologies ?? [])],
      innovations: [...(c.innovations ?? [])].map(k => INNOVATIONS.get(k)?.name ?? k), rulerName: full(archive.get(c.ruler)),
    }));
    const cures = sim.cure_progress;
    const cureOf = n => (cures && cures.has(n) ? cures.get(n) : 0);
    let scientists = 0, healers = 0;
    for (const p of people.values()) {
      if (p.age >= 18) {
        if (p.job === 'scientist') scientists++;
        else if (p.job === 'healer') healers++;
      }
    }
    const geo = buildGeo(sim);
    if (!buildingCatalog) buildingCatalog = js(development.BUILDINGS);
    if (!techTree) {
      techTree = {tree: js(technology.TECH), eras: js(technology.ERAS), branches: js(technology.BRANCHES), any: js(technology.ANY), units: js(technology.UNIT_NAMES)};
    }
    if (!govCatalog) govCatalog = js(governments.GOVERNMENTS);
    const [landN, seaN] = geography.neighbors(sim);
    const ids = (d, k) => (d.has(k) ? [...d.get(k)] : []);
    for (const c of cs) {
      const pr = geography.profile(sim, c.id);
      c.borders = ids(landN, c.id);
      c.seaNeighbors = ids(seaN, c.id);
      c.terrain = {
        fertility: pr.get('fertility'), coastal: pr.get('coastal'), mountain: pr.get('mountain'), forest: pr.get('forest'), dry: pr.get('dry'),
        river: pr.get('river'), swamp: pr.get('swamp'), cold: pr.get('cold'), defense: geography.defense(sim, c.id),
      };
    }
    // Infection history, tallied for the health charts: [infected, recovered, died, vaccinated].
    const bump = (m, k, i) => { let r = m.get(k); if (!r) { r = [0, 0, 0, 0]; m.set(k, r); } r[i]++; };
    const byDisease = new Map(), byCountry = new Map(), yearly = new Map(), byDiseaseYear = new Map(), totals = [0, 0, 0, 0];
    for (const p of archive.values()) {
      for (const h of p.infection_history ?? []) {
        const ev = h.get('event'), d = h.get('disease'), yr = h.get('year');
        const i = ev === 'infected' || ev === 'variant' ? 0 : ev === 'recovered' ? 1 : ev === 'died' ? 2 : ev === 'vaccinated' ? 3 : -1;
        if (i < 0) continue;
        totals[i]++;
        bump(byDisease, d, i); bump(byCountry, p.country, i); bump(yearly, yr, i); bump(byDiseaseYear, d + '\u0000' + yr, i);
      }
    }
    const rows = m => [...m.entries()].map(([k, r]) => [k, ...r]).sort((a, b) => a[0] - b[0]);
    const healthStats = {
      totals, yearly: rows(yearly), countries: Object.fromEntries(byCountry),
      diseases: Object.fromEntries([...byDisease].map(([k, r]) => [k, {
        counts: r,
        timeline: rows(new Map([...byDiseaseYear].filter(([key]) => key.startsWith(k + '\u0000')).map(([key, v]) => [Number(key.split('\u0000')[1]), v]))),
      }])),
    };
    [...countries.values()].forEach((c, i) => Object.assign(cs[i], {research: c.research ?? 0, capacity: c.capacity, quarantine: !!c.quarantine, ended: c.ended, founded: c.founded}));
    if (!discoveryNames) discoveryNames = [...TECHNOLOGIES.keys(), ...[...INNOVATIONS.values()].map(v => v.name)];
    const depositState = sim.deposit_state ? [...sim.deposit_state].map(([idx, v]) => [(idx >> 2) % geo.w, Math.floor((idx >> 2) / geo.w), idx & 3, v[0], v[1]]) : [];
    const stCache = sim.systems_state;
    const stMap = stCache && stCache.get('year') === sim.year ? stCache.get('countries') : null;
    [...countries.values()].forEach((c, i) => {
      if (c.ended !== null) { cs[i].systems = null; return; }
      cs[i].systems = js(stMap && stMap.has(c.id) ? stMap.get(c.id) : systems.analyze(sim, c.id));
      const un = js(technology.units(c.technologies));
      Object.assign(cs[i], {
        units: un, era: un.era, age: un.age, eraName: techTree.eras[un.era], researchProject: c.research_project ?? null,
        insight: js(c.insight ?? null) || {}, boosted: js(c.boosted ?? null) || [], pacts: js(c.pacts ?? null) || [],
        economy: sim.econ && sim.econ.has(c.id) ? js(sim.econ.get(c.id)) : null, stock: js(c.stock ?? null),
        culture: c.culture ?? 0, lastExpansion: c.last_expansion ?? null,
      });
    });
    const roads = sim.roads ? [...sim.roads].map(([k, v]) => [k % geo.w, Math.floor(k / geo.w), v]) : [];
    const placeName = id => settlements.get(id)?.name ?? 'Unknown';
    const cname = id => countries.get(id)?.name ?? 'Unknown';
    const expeditions = (sim.expeditions ?? []).map(e => {
      const o = js(e);
      o.originName = placeName(o.origin); o.leaderName = full(archive.get(o.leader)); o.people = o.people.length; o.countryName = cname(o.country);
      if (o.target_settlement != null) o.targetName = placeName(o.target_settlement);
      return o;
    });
    const armies = (sim.armies ?? []).map(x => {
      const o = js(x);
      o.countryName = cname(o.country); o.enemyName = cname(o.enemy); o.objectiveName = placeName(o.objective); o.originName = placeName(o.origin);
      return o;
    });
    const caravans = (sim.caravans ?? []).map(x => {
      const o = js(x);
      o.countryName = cname(o.country); o.partnerName = cname(o.partner); o.originName = placeName(o.origin); o.destName = placeName(o.dest);
      return o;
    });
    const projects = (sim.projects ?? []).map(p => {
      const o = js(p);
      o.settlementName = placeName(o.settlement); o.countryName = cname(settlements.get(o.settlement)?.country);
      return o;
    });
    const contested = [...geography.contested_cells(sim)].map(([k, v]) => [k % geo.w, Math.floor(k / geo.w), v[0], v[1]]);
    return {
      year: sim.year, contested, depositState, tradeFlows: js(sim.trade_flows ?? []), depositStats: js(sim.deposit_stats ?? null),
      governments: govCatalog, tech: techTree, resourceInfo: js(geography.RESOURCE_INFO), population: people.size, geoSeed: sim.geo_seed ?? 0,
      roads, expeditions, armies, caravans, projects, disasters: js(sim.disaster_log ?? []), buildingCatalog, births: latest.births, deaths: latest.deaths,
      countries: cs, geo, healthStats, researchers: {scientists, healers},
      eradicated: [...(sim.retired_sicknesses ?? new Map()).values()].map(d => ({name: d.name, course: d.course, cure: cureOf(d.name)})),
      settings: {war_chance: sim.war_chance, country_chance: sim.country_chance, lineage_chance: sim.lineage_chance, disaster_chance: sim.disaster_chance},
      lineages: [...lineages.values()].map(l => l.surname), discoveryNames,
      settlements: [...settlements.values()].map(s => ({
        id: s.id, name: s.name, country: s.country, countryName: cname(s.country), population: residents.get(s.id) || 0, kind: s.kind, gx: s.gx, gy: s.gy,
        terrainText: describeCell(geo, s.gx, s.gy), buildings: s.buildings ? Object.fromEntries(s.buildings) : {}, sick: sickBy.get(s.id) || {},
        hazards: s.gx == null ? {} : js(geography.hazards_at(sim, s.gx, s.gy)), capital: countries.get(s.country)?.capital === s.id,
        abandoned: s.abandoned !== null, founderName: full(archive.get(s.founder)),
      })),
      people: [...archive.values()].map(p => ({
        id: p.id, name: full(p), first: p.first, age: p.age, country: p.country, countryName: cname(p.country), settlement: p.settlement,
        settlementName: settlements.get(p.settlement)?.name ?? 'Unsettled', lineageName: lineages.get(p.lineage)?.surname ?? 'Unknown',
        wealth: p.wealth ?? 0, job: p.job ?? 'resident', role: p.public_role, fame: p.fame ?? 0, infection: p.infection, alive: people.has(p.id),
        born: p.born, died: p.died, causeOfDeath: p.cause_of_death, parents: [...(p.parents ?? [])],
      })),
      diseases: [...sim.sicknesses.values()].map(d => ({
        name: d.name, course: d.course, active: ill.get(d.name) || 0, deathChance: d.death_chance, infectionChance: d.infection_chance,
        recoveryChance: d.recovery_chance, transmission: d.transmission, immunityYears: d.immunity_years, cure: cureOf(d.name),
        firstYear: (h => (h && h.timeline.length ? h.timeline[0][0] : null))(healthStats.diseases[d.name]), retired: false,
      })),
      wars: [...sim.wars].map(([pair, started]) => ({
        countries: [...pair], names: [...pair].map(id => countries.get(id)?.name ?? 'Unknown'), started,
        detail: 'Inspect armies, supply, morale, wounds, and territorial objectives in the war report.',
      })),
      events: this.events(sim, lineages),
      reports,
      catalog: {foundations: TECHNOLOGIES.size, innovations: INNOVATIONS.size, events: EVENT_CATALOG.length},
      canUndo: !!sim._command_undo, lifeFlow: !!this.life?.flow, player: this.life?.player ? playerView(sim, this.life) : null,
    };
  }

  /** History lines with names rendered; text is cached because rendering walks every referenced person. */
  events(sim, lineages) {
    const cats = sim.history_categories ?? [];
    const seen = new Map();
    for (const l of lineages.values()) seen.set(l.surname, (seen.get(l.surname) || 0) + 1);
    let shared = 0;
    for (const n of seen.values()) if (n > 1) shared += n;
    // A new namesake renumbers older entries (Ku -> Ku I), so cached text is only valid while the namesakes are unchanged.
    if (shared !== eventStamp) { eventCache.clear(); eventStamp = shared; }
    return (sim.history ?? []).map(([year, message], i) => {
      const key = typeof message === 'string' ? message : null;
      let m = key === null ? undefined : eventCache.get(key);
      if (m === undefined) {
        m = sim.render_history(message);
        if (key !== null) eventCache.set(key, m);
      }
      return {year, category: cats[i] || 'world', message: m};
    });
  }
}
