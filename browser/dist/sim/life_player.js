// Person mode: playing one person by hand. Each season you choose what they do; everybody else keeps living their
// seasons around you. Your choices use the same effects as everyone's (life.apply), so with "people shape the world"
// off they stay in the overlay and with it on they change the real world.
import {OFFICES} from './civic.js';
import {LADDER, SEASON_NAMES, DISPLACES, dice, ventureOf, studyOf} from './life_seasons.js';

const LOG_LIMIT = 40;
const money = n => Math.round(n).toLocaleString('en-US');

/** The player's record, or null. { id, season (0-3 played this year; 4 = year over), log: [{year, season, text}], since } */
export function newPlayer(sim, id) { return {id, season: 4, log: [], since: sim.year, choice: null, last: {}, eventKey: null}; }

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

/** What the person could do this season. */
export function actionsFor(sim, life, p, season) {
  const v = life.view(sim, p), c = sim.countries.get(v.country), adult = p.age >= 18;
  const odds = Math.round((0.5 + (v.job === 'merchant' ? 0.1 : 0) + (c ? c.prosperity / 400 : 0)) * 10);
  const out = [
    {id: 'work', label: 'Work steadily', hint: 'A modest, safe income.', enabled: true},
    {id: 'study', label: 'Study and practise', hint: 'Builds your name; a rare breakthrough is possible.', enabled: true}
  ];
  if (adult) out.push({id: 'trade', label: 'Trading venture', hint: `Stake some savings: about ${odds} in 10 chances to profit, and a loss costs you.`, enabled: v.wealth >= 2, why: v.wealth >= 2 ? '' : 'You have nothing to stake.'});
  const near = towns(sim, life, p);
  if (adult) out.push({id: 'move', label: 'Travel to another town', hint: 'Settle somewhere new, even across a border.', enabled: near.length > 0, options: near.map(t => ({value: String(t.id), label: `${t.name} · ${t.countryName} · ${t.distance} tiles · ${t.population} people`}))});
  if (adult && LADDER[v.job]) out.push({id: 'retrain', label: 'Learn a new trade', hint: `Today you are a ${v.job}.`, enabled: true, options: LADDER[v.job].map(j => ({value: j, label: j}))});
  if (adult && !v.role) {
    for (const [title, job] of OFFICES.filter(([, j]) => j === v.job)) {
      const holder = c ? sim.people.get(c.offices.get(title)) : null, hv = holder ? life.view(sim, holder) : null;
      const ok = !hv || v.fame > hv.fame + DISPLACES;
      out.push({id: 'office', arg: title, label: `Seek the office of ${title}`, enabled: ok, hint: hv ? `Held by ${sim.full_name(holder)}, fame ${Math.round(hv.fame)}.` : 'The office is vacant.', why: ok ? '' : `You need fame above ${Math.round(hv.fame + DISPLACES)} (yours: ${Math.round(v.fame)}).`});
    }
  }
  out.push({id: 'auto', label: 'Let the season pass', hint: 'Do what people like you usually do.', enabled: true});
  return out;
}

/** Carry out a chosen action for the person; returns the line for their journal. Throws a plain Error for a bad choice. */
export function perform(sim, life, p, season, act, arg) {
  const v = life.view(sim, p), c = sim.countries.get(v.country), u = dice(sim, season, p.id), adult = p.age >= 18;
  const need = ok => { if (!ok) throw Error('That is not possible for them right now.'); };
  switch (act) {
    case 'work': {
      const dw = 1 + Math.min(40, 0.02 * v.wealth);
      life.apply(sim, p, {dw});
      return `You worked steadily as a ${v.job} and put aside ${money(dw)}.`;
    }
    case 'study': {
      const e = studyOf(v, u); life.apply(sim, p, e);
      return e.insight ? 'You studied hard and made a real breakthrough. People noticed.' : 'You spent the season studying and practising, and your name grew a little.';
    }
    case 'trade': {
      need(adult && v.wealth >= 2);
      const e = ventureOf(v, c, u); life.apply(sim, p, e);
      return e.dw >= 0 ? `A trading venture paid off: you made ${money(e.dw)}.` : `A trading venture went badly: you lost ${money(-e.dw)}.`;
    }
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
      life.apply(sim, p, {job: arg});
      return `You gave up the ${v.job}'s life and took up work as a ${arg}.`;
    }
    case 'office': {
      need(adult && !v.role && OFFICES.some(([t, j]) => t === arg && j === v.job));
      const holder = c ? sim.people.get(c.offices.get(arg)) : null;
      need(!holder || v.fame > life.view(sim, holder).fame + DISPLACES);
      life.apply(sim, p, {role: arg});
      return `You were named ${arg} of ${c.name}.`;
    }
    default: throw Error('Unknown action.');
  }
}

/** What changed for a person between two life.view() results, as a sentence (for a season left to the usual way). */
export function describeChange(sim, before, after) {
  const bits = [];
  if (after.settlement !== before.settlement) bits.push(`moved to ${sim.settlements.get(after.settlement)?.name ?? 'a new town'}`);
  if (after.job !== before.job) bits.push(`took up work as a ${after.job}`);
  if (after.role && after.role !== before.role) bits.push(`became ${after.role}`);
  const dw = after.wealth - before.wealth;
  if (Math.abs(dw) >= 1) bits.push(dw > 0 ? `earned ${money(dw)}` : `lost ${money(-dw)}`);
  return bits.length ? `The season took its usual course: you ${bits.join(', ')}.` : 'The season passed quietly.';
}

/** Everything the person-mode screen needs, as plain data. */
export function playerView(sim, life) {
  const pl = life.player; if (!pl) return null;
  const arch = sim.archive.get(pl.id); if (!arch) return null;
  const alive = sim.people.has(pl.id), p = sim.people.get(pl.id) ?? arch;
  const next = pl.season >= 4 ? {year: sim.year + 1, season: 0} : {year: sim.year, season: pl.season};
  const base = {id: pl.id, name: sim.full_name(arch), alive, flow: life.flow, year: sim.year, next: {...next, name: SEASON_NAMES[next.season]}, since: pl.since, log: pl.log.slice(0, 30), choice: pl.choice ?? null};
  if (!alive) {
    const story = life.story(sim, pl.id);
    return {...base, age: arch.age, born: arch.born, died: arch.died, cause: arch.cause_of_death, summary: story?.summary ?? '', lines: (story?.lines ?? []).slice(-14), standing: story?.standing, kids: heirs(sim, pl.id)};
  }
  const v = life.view(sim, p), c = sim.countries.get(v.country), here = sim.settlements.get(v.settlement), story = life.story(sim, pl.id);
  const wars = [];
  for (const [pair] of sim.wars) { const ids = [...pair]; if (ids.includes(v.country)) wars.push(sim.countries.get(ids.find(i => i !== v.country))?.name ?? 'a rival'); }
  const conditions = c ? [...c.conditions].filter(x => x !== 'Nothing') : [];
  const parents = (arch.parents ?? []).map(id => sim.archive.get(id)).filter(Boolean).map(q => ({id: q.id, name: sim.full_name(q), alive: sim.people.has(q.id)}));
  return {
    ...base, age: p.age, born: arch.born, lineage: sim.lineage_name(p.lineage), job: v.job, role: v.role, wealth: v.wealth, fame: v.fame,
    standing: story.standing, summary: story.summary, lines: story.lines.slice(-12), overlay: !life.flow && life.track.has(pl.id),
    country: {id: v.country, name: c?.name ?? ''}, home: {id: v.settlement, name: here?.name ?? '', gx: here?.gx ?? null, gy: here?.gy ?? null, kind: here?.kind ?? ''},
    health: {infection: p.infection ?? null, woundedUntil: (p.wounded_until ?? 0) > sim.year ? p.wounded_until : 0},
    world: {conditions, wars, ruler: c?.ruler != null ? sim.full_name(sim.archive.get(c.ruler)) : '', government: c?.government ?? '', stability: c?.stability ?? 0, food: c?.food ?? 0},
    parents, kids: heirs(sim, pl.id), nearby: towns(sim, life, p, 8),
    actions: actionsFor(sim, life, p, next.season)
  };
}

/** Living children of a person (the start of the heir list; wider family comes with succession). */
export function heirs(sim, id) {
  const out = [];
  for (const q of sim.people.values()) if (q.parents?.includes(id)) out.push({id: q.id, name: sim.full_name(q), age: q.age});
  return out.sort((a, b) => b.age - a.age);
}
