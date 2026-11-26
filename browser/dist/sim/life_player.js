// Person mode: playing one person by hand. You set a *focus* (what they do every season) and time simply keeps running;
// one-off moves (travel, a new trade, seeking an office) happen at the start of the next season; and big events in the
// world reach them as pop-ups (life_events.js). Everybody else keeps living their seasons around you. Your choices use
// the same effects as everyone's (life.apply), so with "people shape the world" off they stay in the overlay and with it
// on they change the real world.
import {OFFICES} from './civic.js';
import {candidates} from './life_succession.js';
import {LADDER, SEASON_NAMES, DISPLACES} from './life_seasons.js';
import {newStats, honorWord, health, context, focusSpecs, runFocus, defaultFocus} from './life_careers.js';

const money = n => Math.round(n).toLocaleString('en-US');

/** The player's record, or null. { id, season (0-3 played this year; 4 = year over), log, since, choice, last, eventKey, gen, line, mark, stats, focus, queue } */
export function newPlayer(sim, id, from = null) {
  const p = sim.people.get(id);
  return {id, season: 4, log: [], since: sim.year, choice: null, last: {}, eventKey: null, gen: 1, line: [], mark: null, stats: newStats(p ?? sim.archive.get(id) ?? {age: 20}, from), focus: p ? defaultFocus(p) : 'work', queue: null};
}

/** Towns a person could travel to, nearest first. */
export function towns(sim, life, p, limit = 14, view = null) {
  const v = view ?? life.view(sim, p), here = sim.settlements.get(v.settlement), pop = new Map();
  for (const q of sim.people.values()) pop.set(q.settlement, (pop.get(q.settlement) ?? 0) + 1);
  return [...sim.settlements.values()]
    .filter(s => s.abandoned == null && s.gx != null && s.id !== v.settlement && (pop.get(s.id) ?? 0) > 0)
    .map(s => ({id: s.id, name: s.name, country: s.country, countryName: sim.countries.get(s.country)?.name ?? '', population: pop.get(s.id), gx: s.gx, gy: s.gy,
      distance: here?.gx == null ? 99 : Math.round(Math.hypot(s.gx - here.gx, s.gy - here.gy)), home: s.country === v.country}))
    .sort((a, b) => a.distance - b.distance).slice(0, limit);
}

/** Fame needed to take an office from its holder; contacts make it a little easier. */
const needFame = (hv, st) => hv.fame + DISPLACES - st.connections * 0.1;

/** One-off moves: they take the next season in place of your focus. */
export function oneOffs(sim, life, p) {
  const v = life.view(sim, p), c = sim.countries.get(v.country), st = life.player.stats, out = [];
  if (p.age < 18) return out;
  const near = towns(sim, life, p);
  out.push({id: 'move', label: 'Travel to another town', hint: 'Settle somewhere new, even across a border.', enabled: near.length > 0, options: near.map(t => ({value: String(t.id), label: `${t.name} · ${t.countryName} · ${t.distance} tiles · ${t.population} people`}))});
  if (LADDER[v.job]) out.push({id: 'retrain', label: 'Learn a new trade', hint: `Today you are a ${v.job}. Your skill starts over at half.`, enabled: true, options: LADDER[v.job].map(j => ({value: j, label: j}))});
  if (!v.role) {
    for (const [title] of OFFICES.filter(([, j]) => j === v.job)) {
      const holder = c ? sim.people.get(c.offices.get(title)) : null, hv = holder ? life.view(sim, holder) : null;
      const need = hv ? needFame(hv, st) : 0, ok = !hv || v.fame > need;
      out.push({id: 'office', arg: title, label: `Seek the office of ${title}`, enabled: ok, hint: hv ? `Held by ${sim.full_name(holder)}, fame ${Math.round(hv.fame)}.` : 'The office is vacant.', why: ok ? '' : `You need fame above ${Math.round(need)} (yours: ${Math.round(v.fame)}). Contacts help.`});
    }
  }
  return out;
}

/** Carry out a one-off move or a focus for the person; returns the line for their journal. Throws a plain Error for a bad choice. */
export function perform(sim, life, p, season, act, arg) {
  const v = life.view(sim, p), c = sim.countries.get(v.country), adult = p.age >= 18, st = life.player.stats;
  const need = ok => { if (!ok) throw Error('That is not possible for them right now.'); };
  switch (act) {
    case 'move': {
      need(adult);
      const s = sim.settlements.get(Number(arg));
      need(s && s.abandoned == null && s.id !== v.settlement);
      life.apply(sim, p, {place: s.id});
      if (s.country !== v.country) life.add(p.id, sim.year, 'allegiance', s.country, s.id);
      return s.country !== v.country ? `You left for ${s.name} and became a citizen of ${sim.countries.get(s.country)?.name}.` : `You moved to ${s.name}.`;
    }
    case 'retrain': {
      need(adult && LADDER[v.job]?.includes(arg));
      life.apply(sim, p, {job: arg}); st.skill = Math.round(st.skill * 5) / 10;
      return `You gave up the ${v.job}'s life and took up work as a ${arg}.`;
    }
    case 'office': {
      need(adult && !v.role && OFFICES.some(([t, j]) => t === arg && j === v.job));
      const holder = c ? sim.people.get(c.offices.get(arg)) : null;
      need(!holder || v.fame > needFame(life.view(sim, holder), st));
      life.apply(sim, p, {role: arg});
      return `You were named ${arg} of ${c.name}.`;
    }
    default: {
      const x = context(sim, life, p, season);
      if (!focusSpecs(x).some(f => f.id === act)) throw Error('Unknown action.');
      return runFocus(x, act);
    }
  }
}

/** A waiting pop-up with each option's availability worked out against the switch as it is now. */
export function liveChoice(ch, flow) {
  if (!ch) return null;
  return {...ch, flow, options: ch.options.map(o => (o.needsFlow && !flow ? {...o, enabled: false, why: 'Needs “People shape the world” switched on.'} : o))};
}

/** Everything the person-mode screen needs, as plain data. */
export function playerView(sim, life) {
  const pl = life.player; if (!pl) return null;
  const arch = sim.archive.get(pl.id); if (!arch) return null;
  const alive = sim.people.has(pl.id), p = sim.people.get(pl.id) ?? arch;
  const next = pl.season >= 4 ? {year: sim.year + 1, season: 0} : {year: sim.year, season: pl.season};
  const base = {id: pl.id, name: sim.full_name(arch), alive, flow: life.flow, year: sim.year, next: {...next, name: SEASON_NAMES[next.season]}, since: pl.since, log: pl.log.slice(0, 30), choice: liveChoice(pl.choice, life.flow), gen: pl.gen ?? 1, line: pl.line ?? []};
  if (!alive) {
    const story = life.story(sim, pl.id);
    return {...base, age: arch.age, born: arch.born, died: arch.died, cause: arch.cause_of_death, summary: story?.summary ?? '', lines: (story?.lines ?? []).slice(-14), standing: story?.standing, kids: heirs(sim, pl.id), heirs: candidates(sim, life, pl)};
  }
  const v = life.view(sim, p), c = sim.countries.get(v.country), here = sim.settlements.get(v.settlement), story = life.story(sim, pl.id), st = pl.stats, hl = health(sim, p);
  const wars = [];
  for (const [pair] of sim.wars) { const ids = [...pair]; if (ids.includes(v.country)) wars.push(sim.countries.get(ids.find(i => i !== v.country))?.name ?? 'a rival'); }
  const conditions = c ? [...c.conditions].filter(x => x !== 'Nothing') : [];
  const parents = (arch.parents ?? []).map(id => sim.archive.get(id)).filter(Boolean).map(q => ({id: q.id, name: sim.full_name(q), alive: sim.people.has(q.id)}));
  const specs = focusSpecs(context(sim, life, p, next.season)), focus = specs.some(f => f.id === pl.focus && f.enabled) ? pl.focus : defaultFocus(p);
  const stats = [
    {id: 'health', label: 'Health', value: hl.value, max: 100, note: hl.word},
    {id: 'wealth', label: 'Wealth', value: Math.round(v.wealth), note: story.standing.rank},
    {id: 'fame', label: 'Fame', value: Math.round(v.fame), max: 100, note: v.fame >= 60 ? 'Famous' : v.fame >= 25 ? 'Known' : v.fame >= 8 ? 'Recognised' : 'Unknown'},
    {id: 'skill', label: 'Skill', value: Math.round(st.skill), max: 100, note: `at your ${v.job === 'child' ? 'lessons' : v.job + "'s trade"}`},
    {id: 'knowledge', label: 'Knowledge', value: Math.round(st.knowledge), max: 100, note: st.knowledge >= 60 ? 'Learned' : st.knowledge >= 30 ? 'Educated' : 'Self-taught'},
    {id: 'connections', label: 'Connections', value: Math.round(st.connections), max: 100, note: st.connections >= 60 ? 'Well connected' : st.connections >= 30 ? 'Known around town' : 'Few friends'},
    {id: 'honor', label: 'Honor', value: Math.round(st.honor), min: -100, max: 100, note: honorWord(st.honor)}
  ];
  return {
    ...base, age: p.age, born: arch.born, lineage: sim.lineage_name(p.lineage), job: v.job, role: v.role, wealth: v.wealth, fame: v.fame,
    standing: story.standing, summary: story.summary, lines: story.lines.slice(-12), overlay: !life.flow && life.track.has(pl.id),
    country: {id: v.country, name: c?.name ?? ''}, home: {id: v.settlement, name: here?.name ?? '', gx: here?.gx ?? null, gy: here?.gy ?? null, kind: here?.kind ?? ''},
    health: {infection: p.infection ?? null, woundedUntil: (p.wounded_until ?? 0) > sim.year ? p.wounded_until : 0, value: hl.value},
    world: {conditions, wars, ruler: c?.ruler != null ? sim.full_name(sim.archive.get(c.ruler)) : '', government: c?.government ?? '', stability: c?.stability ?? 0, food: c?.food ?? 0},
    parents, kids: heirs(sim, pl.id), nearby: towns(sim, life, p, 8), stats, focus,
    focuses: specs.map(({run, ...f}) => f), oneoffs: oneOffs(sim, life, p), queued: pl.queue
  };
}

/** Living children of a person. */
export function heirs(sim, id) {
  const out = [];
  for (const q of sim.people.values()) if (q.parents?.includes(id)) out.push({id: q.id, name: sim.full_name(q), age: q.age});
  return out.sort((a, b) => b.age - a.age);
}

/** What changed for a person between two life.view() results, as a sentence. */
export function describeChange(sim, before, after) {
  const bits = [];
  if (after.settlement !== before.settlement) bits.push(`moved to ${sim.settlements.get(after.settlement)?.name ?? 'a new town'}`);
  if (after.job !== before.job) bits.push(`took up work as a ${after.job}`);
  if (after.role && after.role !== before.role) bits.push(`became ${after.role}`);
  const dw = after.wealth - before.wealth;
  if (Math.abs(dw) >= 1) bits.push(dw > 0 ? `earned ${money(dw)}` : `lost ${money(-dw)}`);
  return bits.length ? `The season took its usual course: you ${bits.join(', ')}.` : 'The season passed quietly.';
}
