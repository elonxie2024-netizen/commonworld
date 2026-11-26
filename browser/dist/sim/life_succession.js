// Succession: when the person you play dies, you choose who carries on. The heirs are the family that is still alive,
// closest first; each one inherits part of the dead person's money and fame, and may inherit an office, but only where
// the country's form of government lets that office be inherited.
//
// Who takes an office follows the government (governments.js says how its ruler is chosen):
//   hereditary (monarchy, empire)  the crown passes to the eldest adult child (the simulation already did that);
//                                  the court posts of treasurer and minister are family property and pass to a child
//   wealth (oligarchy)             the richest families rule: no crown, but treasurer and minister stay in the family
//   election (council, republic, democracy, merchant republic)   every office is won by vote, nothing is inherited
//   divine, fame, seizure          chosen by the clergy or taken by the strongest; nothing is inherited
//   chief scholar and chief physician are always given for merit (a trade), never by birth
// The simulation settles money itself (a dead person's fortune is split among their children); the heir's bequest here
// tops that up to their share, so choosing well matters. Nothing here draws from the simulation's random stream.
import {OFFICES} from './civic.js';
import {info, title_of} from './governments.js';
import {unit} from './life_seasons.js';

export const MAX_HEIRS = 8;
/** Share of the estate's money and of the dead person's fame that each kind of relative inherits. */
export const SHARES = {
  child: {wealth: 0.6, fame: 0.5, word: 'Child'}, grandchild: {wealth: 0.5, fame: 0.4, word: 'Grandchild'}, sibling: {wealth: 0.4, fame: 0.3, word: 'Sibling'},
  partner: {wealth: 0.4, fame: 0.3, word: 'Partner'}, nephew: {wealth: 0.3, fame: 0.25, word: 'Niece or nephew'}, parent: {wealth: 0.3, fame: 0.2, word: 'Parent'}
};
const ORDER = ['child', 'grandchild', 'sibling', 'partner', 'nephew', 'parent'];
/** Who may inherit an office that passes by birth (the crown has its own rule). */
const LINEAL = new Set(['child', 'grandchild']);

/** How an office is filled under a form of government: {mode: inherited|elected|wealth|chosen|contested|appointed, text}. */
export function officeRule(government, title) {
  const g = info(government), how = g.get('succession'), term = g.get('term');
  if (title === 'ruler') {
    const t = title_of(government);
    return {
      hereditary: {mode: 'inherited', text: `The ${t} is the eldest adult child.`},
      election: {mode: 'elected', text: `The ${t} is elected every ${term} years; it is never inherited.`},
      wealth: {mode: 'wealth', text: `The ${t} is installed by the wealthiest families, not by birth.`},
      divine: {mode: 'chosen', text: `The ${t} is chosen by the clergy, not by birth.`}
    }[how] ?? {mode: 'contested', text: `The ${t} is taken by the strongest, not by birth.`};
  }
  if ((how === 'hereditary' || how === 'wealth') && (title === 'treasurer' || title === 'minister')) return {mode: 'inherited', text: `The post of ${title} stays in the family.`};
  if (how === 'election') return {mode: 'elected', text: `The ${title} is won by vote, not inherited.`};
  return {mode: 'appointed', text: `The ${title} is given for merit in a trade, not by birth.`};
}

/** The living kin of someone, closest first: [{id, rel}]. Built from the archive, so dead links in the family still count. */
export function kin(sim, id) {
  const p = sim.archive.get(id); if (!p) return [];
  const kids = new Map();
  for (const q of sim.archive.values()) for (const par of q.parents ?? []) { let l = kids.get(par); if (!l) kids.set(par, l = []); l.push(q.id); }
  const rel = new Map(), put = (qid, r) => { if (qid !== id && sim.people.has(qid) && !(rel.has(qid) && ORDER.indexOf(rel.get(qid)) <= ORDER.indexOf(r))) rel.set(qid, r); };
  const mine = kids.get(id) ?? [];
  for (const c of mine) { put(c, 'child'); for (const g of kids.get(c) ?? []) put(g, 'grandchild'); for (const q of archiveOf(sim, c).parents ?? []) if (q !== id) put(q, 'partner'); }
  for (const par of p.parents ?? []) for (const s of kids.get(par) ?? []) { put(s, 'sibling'); for (const n of kids.get(s) ?? []) put(n, 'nephew'); }
  for (const par of p.parents ?? []) put(par, 'parent');
  return [...rel].map(([qid, r]) => ({id: qid, rel: r}));
}
const archiveOf = (sim, id) => sim.archive.get(id) ?? {};

/** What the dead person left: money (their own story included), fame, office, country. From the mark taken while they lived. */
function estateOf(sim, pl) {
  const a = sim.archive.get(pl.id) ?? {};
  return {wealth: 0, real: 0, fame: a.fame ?? 0, role: a.public_role ?? '', ruler: false, country: a.country, ...(pl.mark ?? {})};
}

/** What one heir would receive: {wealth, fame, office: null | {title, mode, ok, text}}. */
function inheritance(sim, life, pl, h, rel) {
  const e = estateOf(sim, pl), share = SHARES[rel];
  let received = 0; // the world already split the real fortune evenly between the children
  if (rel === 'child') { const n = [...sim.people.values()].filter(q => q.parents?.includes(pl.id)).length; received = n ? e.real / n : 0; }
  const out = {already: Math.round(received), wealth: Math.max(0, Math.round(e.wealth * share.wealth - received)), fame: Math.round(e.fame * share.fame), office: null};
  const c = sim.countries.get(e.country);
  if (!c || c.ended != null) return out;
  const title = e.ruler ? 'ruler' : OFFICES.some(([t]) => t === e.role) ? e.role : null;
  if (!title) return out;
  const r = officeRule(c.government, title), name = title === 'ruler' ? title_of(c.government) : title;
  if (r.mode !== 'inherited') return {...out, office: {title: name, mode: r.mode, ok: false, text: r.text}};
  if (title === 'ruler') { // the simulation crowned its successor when the ruler died
    const now = sim.people.get(c.ruler);
    return {...out, office: {title: name, mode: r.mode, ok: c.ruler === h.id, text: c.ruler === h.id ? `Already holds the throne as ${name}.` : `${r.text} The crown passed to ${now ? sim.full_name(now) : 'no one'}.`}};
  }
  const home = life.view(sim, h).country;
  const why = !LINEAL.has(rel) ? 'Only a child or grandchild takes a family post.' : h.age < 18 ? 'Too young to hold office.' : home !== c.id ? `Must live in ${c.name} to hold it.` : '';
  return {...out, office: {title: name, mode: r.mode, ok: !why, text: why ? `${r.text} ${why}` : `${r.text} They would take it.`}};
}

/** Up to eight living relatives to carry on, each with what they are, what they have and what they would inherit. */
export function candidates(sim, life, pl) {
  const list = kin(sim, pl.id).map(({id, rel}) => ({p: sim.people.get(id), rel}))
    .sort((a, b) => ORDER.indexOf(a.rel) - ORDER.indexOf(b.rel) || b.p.age - a.p.age).slice(0, MAX_HEIRS);
  return list.map(({p, rel}) => {
    const v = life.view(sim, p), c = sim.countries.get(v.country), s = sim.settlements.get(v.settlement), st = life.standing(sim, p);
    return {id: p.id, name: sim.full_name(p), rel, relation: SHARES[rel].word, age: p.age, job: v.job, role: v.role, wealth: v.wealth, fame: v.fame,
      place: s?.name ?? '', country: c?.name ?? '', summary: life.summary(sim, p), standing: st, gets: inheritance(sim, life, pl, p, rel)};
  });
}

/** Carry on as an heir (or, only when no family is left, as a random living person). Returns the new player record. */
export function succeed(sim, life, pick) {
  const pl = life.player;
  if (!pl) throw Error('Nobody is being played.');
  if (sim.people.has(pl.id)) throw Error('Your person is still alive.');
  const list = candidates(sim, life, pl), dead = sim.archive.get(pl.id), when = sim.year;
  let p, gets = null, rel = null;
  if (pick === 'random') {
    if (list.length) throw Error('You have family to carry on. Choose one of them.');
    const pool = [...sim.people.values()].filter(q => q.age >= 18), all = pool.length ? pool : [...sim.people.values()];
    if (!all.length) throw Error('There is nobody left to play.');
    p = all[Math.floor(unit(sim.geo_seed ?? 0, sim.year, pl.id, 77) * all.length)];
  } else {
    const c = list.find(x => x.id === Number(pick));
    if (!c) throw Error('That person is not one of your heirs.');
    p = sim.people.get(c.id); gets = c.gets; rel = c.rel;
  }
  const line = rel ? [...(pl.line ?? []), {id: pl.id, name: sim.full_name(dead), born: dead.born, died: dead.died}].slice(-12) : [];
  const next = {id: p.id, season: 4, log: [], since: when, choice: null, last: {}, eventKey: null, gen: rel ? (pl.gen ?? 1) + 1 : 1, line, mark: null};
  life.player = next;
  const bits = [];
  if (gets) {
    delete sim._command_undo;
    if (gets.wealth || gets.fame) life.apply(sim, p, {dw: gets.wealth, df: gets.fame});
    const e = estateOf(sim, pl), c = sim.countries.get(e.country);
    if (life.flow && gets.wealth && c && ![...sim.people.values()].some(q => q.parents?.includes(pl.id))) c.treasury = Math.max(0, c.treasury - gets.wealth); // no children: the world had sent the fortune to the treasury
    if (gets.office?.ok && gets.office.mode === 'inherited' && gets.office.title !== title_of(c?.government)) life.apply(sim, p, {role: gets.office.title});
    life.add(p.id, when, 'heir', pl.id, gets.wealth);
    if (gets.wealth) bits.push(`${Math.round(gets.wealth).toLocaleString('en-US')} in money`);
    if (gets.fame) bits.push(`a share of their fame (${gets.fame})`);
    if (gets.office?.ok) bits.push(`the office of ${gets.office.title}`);
  }
  next.log.unshift({year: when, season: 0, text: rel ? `You take up the life of ${sim.full_name(p)}, heir of ${sim.full_name(dead)}${bits.length ? `, inheriting ${bits.join(', ')}` : ''}.` : `You begin as ${sim.full_name(p)}, a stranger chosen by chance.`});
  life.touch(sim);
  return next;
}
