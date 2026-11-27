// Depth for the person you play: lifelong ambitions, undertakings that take many seasons, property, the people in your
// life, and perks. All of it lives on the player record (life.player), outside the frozen simulation, and every roll is a
// hash of (seed, year, season, person, purpose), never the simulation's random stream.
//   ambition     one lifelong goal at a time; fulfilling it earns a perk point, fame and a trait
//   undertaking  a project that takes many seasons, costs money up front, and pays off by skill and luck
//   holdings     things you can buy: they earn (or cost) a little every season
//   bonds        friends, a partner, rivals and apprentices; each season you can tend one thing
//   perks        spent from points earned over the years
import {unit, dice} from './life_seasons.js';
import {bump} from './life_careers.js';
import {TRAITS, PERKS, mods, gainTrait} from './life_traits.js';

const money = n => Math.round(n).toLocaleString('en-US');
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
export const MAX_BONDS = 8, MAX_HOLDINGS = 8;

/** A fresh person's depth record. `from` is a dead predecessor's record: an heir keeps a trait and maybe the property. */
export function initDepth(sim, id, from = null, keepHoldings = false) {
  const born = Object.keys(TRAITS).filter(t => TRAITS[t].born), seed = sim.geo_seed ?? 0, traits = [];
  if (from?.traits?.length) { const own = from.traits.filter(t => t !== 'spouse'); if (own.length) traits.push(own[Math.floor(unit(seed, id, 89) * own.length)]); }
  for (let k = 0; traits.length < 2 && k < 12; k++) { const t = born[Math.floor(unit(seed, id, 90 + k) * born.length)]; if (!traits.includes(t)) traits.push(t); }
  return {traits, ambition: null, doneAmb: [], perks: [], pts: 1, yrs: 0, holdings: keepHoldings ? [...(from?.holdings ?? [])] : [], bonds: [], proj: null, projDone: 0, social: -1};
}
/** An older save has none of this yet. */
export function ensureDepth(sim, pl) { if (!pl.traits) Object.assign(pl, initDepth(sim, pl.id)); }

// ---------------------------------------------------------------- property
export const HOLDINGS = {
  field:    {label: 'A field', cost: 40, income: [0.6, 1.8], upkeep: 0.4, text: 'Steady harvests, season after season.'},
  cottage:  {label: 'A cottage', cost: 60, income: [0, 0], upkeep: 0.3, fame: 0.15, text: 'A respectable address: a little fame every season.'},
  shop:     {label: 'A shop', cost: 70, income: [1, 3.4], upkeep: 0.6, conn: 0.25, text: 'Takes custom and brings in friends.'},
  library:  {label: 'A library', cost: 90, income: [0.2, 1], upkeep: 0.5, know: 0.7, fame: 0.15, text: 'Little profit, but you learn and are admired for it.'},
  workshop: {label: 'A workshop', cost: 100, income: [1.5, 4.8], upkeep: 0.9, skill: 0.3, text: 'Good money, and hands-on skill with it.'},
  caravan:  {label: 'A caravan', cost: 140, income: [-1, 10], upkeep: 0.8, text: 'Rich when the roads are safe; sometimes lost.'},
  manor:    {label: 'A manor', cost: 300, income: [1, 5], upkeep: 2.5, fame: 1, text: 'Rents and a very good name.'},
  house:    {label: 'A trading house', cost: 500, income: [-3, 28], upkeep: 2, conn: 0.3, text: 'Ships and agents abroad: the biggest gains, and the biggest risks.'}
};
const SELL = 0.6;

// ---------------------------------------------------------------- ambitions
/** Each ambition: how far along you are (0-1), and the trait it earns. */
export const AMBITIONS = {
  fortune:   {label: 'Build a fortune', trait: 'tycoon', text: 'Be worth 300.', progress: c => c.v.wealth / 300},
  renown:    {label: 'Win renown', trait: 'celebrated', text: 'Reach fame 70.', progress: c => c.v.fame / 70},
  master:    {label: 'Master your craft', trait: 'master', text: 'Reach skill 85.', progress: c => c.st.skill / 85},
  sage:      {label: 'Become a sage', trait: 'sage', text: 'Reach knowledge 85.', progress: c => c.st.knowledge / 85},
  beloved:   {label: 'Be loved by all', trait: 'beloved', text: 'Reach connections 85.', progress: c => c.st.connections / 85},
  upright:   {label: 'Live honorably', trait: 'upright', text: 'Reach honor 60.', progress: c => c.st.honor / 60},
  statesman: {label: 'Rise to high office', trait: 'statesman', text: 'Hold a public office and reach fame 40.', progress: c => (c.v.role ? 0.5 : 0) + Math.min(0.5, c.v.fame / 80)},
  landowner: {label: 'Own the land', trait: 'landowner', text: 'Hold four properties.', progress: c => c.pl.holdings.length / 4},
  dynasty:   {label: 'Found a line', trait: 'founder', text: 'Have three living children or grandchildren.', progress: c => c.kin / 3},
  patron:    {label: 'See great things through', trait: 'patron', text: 'Complete three undertakings.', progress: c => c.pl.projDone / 3}
};

// ---------------------------------------------------------------- undertakings
const DO = (cost, seasons, label, text, reward, need, jobs) => ({cost, seasons, label, text, reward, need, jobs});
export const UNDERTAKINGS = {
  clear:    DO(20, 8, 'Clear new land', 'Turn wild ground into a field of your own.', {holding: 'field', df: 1}, null, ['farmer', 'laborer']),
  strain:   DO(10, 6, 'Breed a better strain', 'A hardier crop, remembered by your neighbours.', {df: 3, d: {knowledge: 6}, dw: 15, trait: 'patient'}, null, ['farmer']),
  hall:     DO(15, 8, 'Raise a workers’ hall', 'A place for working people to meet and stand together.', {df: 4, d: {connections: 14, honor: 8}}, null, ['laborer']),
  masterpiece: DO(30, 8, 'Craft a masterpiece', 'The piece that will carry your name.', {dw: 60, df: 12, d: {skill: 8}}, ['skill', 40], ['artisan']),
  route:    DO(50, 8, 'Open a trade route', 'A new road of trade to far places.', {dw: 120, d: {connections: 10}, holding: 'caravan'}, null, ['merchant']),
  hospice:  DO(40, 10, 'Found a hospice', 'A house for the sick and dying.', {df: 8, d: {honor: 15, skill: 4}, trait: 'steadfast'}, null, ['healer']),
  academy:  DO(40, 10, 'Open an academy', 'A school that outlasts you.', {df: 6, d: {knowledge: 10, connections: 10}}, null, ['teacher']),
  experiment: DO(30, 10, 'Complete a great experiment', 'Months of careful work, and perhaps a discovery.', {df: 10, d: {knowledge: 10}, insight: true}, ['knowledge', 40], ['scientist']),
  greatwork: DO(20, 10, 'Compose a great work', 'The book you will be known by.', {df: 10, d: {knowledge: 8}, dw: 20}, ['knowledge', 35], ['scholar']),
  show:     DO(25, 6, 'Stage a grand show', 'A spectacle the whole town will talk about.', {dw: 40, df: 12, d: {connections: 8}}, null, ['performer']),
  medal:    DO(0, 8, 'Earn a decoration', 'Serve with such distinction that it is noticed.', {df: 8, d: {honor: 8, skill: 6}}, ['skill', 30], ['soldier']),
  reform:   DO(30, 8, 'Pass a reform', 'Change a law for the better, if you can find the votes.', {df: 10, d: {honor: 8, connections: 6}, trait: 'statesman'}, ['connections', 35], ['politician']),
  home:     DO(50, 6, 'Raise a family home', 'Build a house worthy of your name.', {holding: 'cottage', df: 1}, null, null),
  school:   DO(10, 6, 'Sponsor a school', 'Pay for others to learn.', {df: 3, d: {honor: 6, connections: 4}}, null, null)
};
const projectsFor = job => Object.entries(UNDERTAKINGS).filter(([, u]) => !u.jobs || u.jobs.includes(job));

// ---------------------------------------------------------------- the season
function kinOf(sim, id) {
  const kids = []; for (const q of sim.people.values()) if (q.parents?.includes(id)) kids.push(q.id);
  const set = new Set(kids); let n = kids.length;
  for (const q of sim.people.values()) if (q.parents?.some(x => set.has(x))) n++;
  return n;
}
const nameOf = (sim, id) => { const q = sim.people.get(id) ?? sim.archive.get(id); return q ? sim.full_name(q) : 'Someone'; };
const spend = (v, n) => Math.min(v.wealth, n);

/** Everything that happens around your focus in one season: property, the project, the ambition, people. Returns journal lines. */
export function depthSeason(sim, life, p, season) {
  const pl = life.player, st = pl.stats, lines = [], u = dice(sim, season, p.id), m = mods(pl);
  ensureDepth(sim, pl);
  const v = life.view(sim, p);
  // ---- property
  let net = 0;
  pl.holdings.forEach((id, i) => {
    const h = HOLDINGS[id]; if (!h) return;
    let inc = h.income[0] + (h.income[1] - h.income[0]) * u(120 + i); if (inc > 0) inc *= 1 + m.income;
    net += inc - h.upkeep * (1 + m.upkeep);
    if (h.fame) life.apply(sim, p, {df: h.fame * (1 + m.fame)});
    bump(st, {connections: h.conn ?? 0, knowledge: h.know ?? 0, skill: h.skill ?? 0});
  });
  if (pl.holdings.length) { life.apply(sim, p, {dw: Math.max(net, -v.wealth)}); lines.push(`Your property ${net >= 0 ? 'brought in' : 'cost you'} ${money(Math.abs(net))}.`); }
  // ---- the year turns in spring: years of play earn perk points, and friendships need tending
  if (season === 0) {
    pl.yrs = (pl.yrs ?? 0) + 1;
    if (pl.yrs % 3 === 0) { pl.pts = (pl.pts ?? 0) + 1; lines.push('A lifetime of experience has taught you something: you have a perk point to spend.'); }
    for (const b of pl.bonds) {
      if (b.kind === 'mentee' && b.close >= 50) { life.apply(sim, p, {df: 0.6, dw: 1.5}); lines.push(`${nameOf(sim, b.id)}, whom you taught, did you credit.`); }
      b.close -= b.kind === 'spouse' ? 1 : b.kind === 'friend' ? (pl.perks.includes('web') ? 0 : 3) : 2;
    }
  }
  // ---- people come and go
  const keep = [];
  for (const b of pl.bonds) {
    if (!sim.people.has(b.id)) { lines.push(`${nameOf(sim, b.id)} has died.`); if (b.kind === 'spouse') pl.traits = pl.traits.filter(t => t !== 'spouse'); continue; }
    if (b.close < (b.kind === 'rival' ? 1 : 5)) { lines.push(b.kind === 'rival' ? `Your rivalry with ${nameOf(sim, b.id)} has faded.` : `You and ${nameOf(sim, b.id)} have drifted apart.`); continue; }
    keep.push(b);
  }
  pl.bonds = keep;
  if (pl.bonds.some(b => b.kind === 'spouse')) bump(st, {connections: 0.3});
  // ---- an undertaking
  if (pl.proj) {
    pl.proj.left--;
    if (pl.proj.left <= 0) lines.push(finish(sim, life, p, pl, m, u));
  }
  // ---- the ambition
  const a = AMBITIONS[pl.ambition];
  if (a && a.progress(ctx(sim, life, p, v, st, pl)) >= 1) {
    pl.doneAmb.push(pl.ambition); pl.pts = (pl.pts ?? 0) + 1; life.apply(sim, p, {df: 8});
    const t = gainTrait(pl, a.trait);
    lines.push(`Ambition fulfilled: ${a.label.toLowerCase()}. You earn a perk point and fame${t ? `, and are now known as “${TRAITS[a.trait].label}”` : ''}.`);
    life.add(p.id, sim.year, 'event', 'choice', `Fulfilled an ambition: ${a.label.toLowerCase()}.`);
    pl.ambition = null;
  }
  return lines;
}
const ctx = (sim, life, p, v, st, pl) => ({sim, life, p, v, st, pl, get kin() { return kinOf(sim, p.id); }});

function finish(sim, life, p, pl, m, u) {
  const def = UNDERTAKINGS[pl.proj.id], st = pl.stats; pl.proj = null;
  const ok = u(130) < clamp(0.55 + st.skill / 200 + m.luck, 0.3, 0.95), r = def.reward, k = ok ? 1 : 0.4;
  life.apply(sim, p, {dw: (r.dw ?? 0) * k, df: (r.df ?? 0) * k * (1 + m.fame), insight: ok && !!r.insight});
  const d = {}; for (const x in r.d ?? {}) d[x] = r.d[x] * k; bump(st, d);
  pl.projDone = (pl.projDone ?? 0) + (ok ? 1 : 0);
  if (ok) {
    if (r.holding && !pl.holdings.includes(r.holding) && pl.holdings.length < MAX_HOLDINGS) pl.holdings.push(r.holding);
    if (r.trait) gainTrait(pl, r.trait);
    life.add(p.id, sim.year, 'event', 'choice', `Completed an undertaking: ${def.label.toLowerCase()}.`);
    return `Done: you ${def.label.toLowerCase()}. ${r.holding ? `${HOLDINGS[r.holding].label} is now yours. ` : ''}It was worth every season.`;
  }
  return `You did not quite manage to ${def.label.toLowerCase()}. Some of the work was worth something, but not what you hoped.`;
}

// ---------------------------------------------------------------- doing things
const keyOf = (sim, pl) => (pl.season >= 4 ? (sim.year + 1) * 4 : sim.year * 4 + pl.season);

/** Something you choose to do, apart from your usual routine. Returns {text, tag?}; throws a plain Error when it cannot be done. */
export function depthAct(sim, life, p, kind, id, arg = null) {
  const pl = life.player, st = pl.stats, m = mods(pl), v = life.view(sim, p); ensureDepth(sim, pl);
  const bad = msg => { throw Error(msg); }, season = Math.min(pl.season, 3), u = dice(sim, pl.season >= 4 ? 0 : season, p.id);
  const bond = () => pl.bonds.find(b => b.id === Number(id)) ?? bad('You do not know them any more.');
  const key = keyOf(sim, pl);
  const social = () => { if (pl.social === key) bad('You have already seen to the people in your life this season.'); pl.social = key; };
  switch (kind) {
    case 'ambition': {
      if (id === '' || id == null) { pl.ambition = null; return {text: 'You set no goal for yourself.'}; }
      if (!AMBITIONS[id] || pl.doneAmb.includes(id)) bad('That is not an ambition open to you.');
      pl.ambition = id; return {text: `You set your heart on one thing: to ${AMBITIONS[id].label.toLowerCase()}.`};
    }
    case 'perk': {
      const k = PERKS[id] ?? bad('Unknown perk.');
      if (pl.perks.includes(id)) bad('You already have it.');
      if ((pl.pts ?? 0) < k.cost) bad('You have not enough perk points.');
      if (k.need && st[k.need[0]] < k.need[1]) bad(`It needs ${k.need[0]} ${k.need[1]}.`);
      pl.pts -= k.cost; pl.perks.push(id); return {text: `You learned to be ${k.label.toLowerCase()}.`};
    }
    case 'buy': {
      const h = HOLDINGS[id] ?? bad('Unknown property.');
      if (pl.holdings.includes(id)) bad('You already own that.');
      if (pl.holdings.length >= MAX_HOLDINGS) bad('You cannot manage any more.');
      if (v.wealth < h.cost) bad('You cannot afford it.');
      life.apply(sim, p, {dw: -h.cost}); pl.holdings.push(id);
      return {text: `You bought ${h.label.toLowerCase()} for ${money(h.cost)}.`, tag: `Bought ${h.label.toLowerCase()}.`};
    }
    case 'sell': {
      const h = HOLDINGS[id]; if (!h || !pl.holdings.includes(id)) bad('You do not own that.');
      pl.holdings = pl.holdings.filter(x => x !== id); life.apply(sim, p, {dw: h.cost * SELL});
      return {text: `You sold ${h.label.toLowerCase()} for ${money(h.cost * SELL)}.`};
    }
    case 'start': {
      const d = UNDERTAKINGS[id]; if (!d || (d.jobs && !d.jobs.includes(v.job))) bad('That is not open to you.');
      if (pl.proj) bad('You are already seeing something through.');
      if (p.age < 18) bad('You are too young.');
      if (d.need && st[d.need[0]] < d.need[1]) bad(`It needs ${d.need[0]} ${d.need[1]}.`);
      if (v.wealth < d.cost) bad('You cannot afford it.');
      life.apply(sim, p, {dw: -d.cost}); pl.proj = {id, left: d.seasons, total: d.seasons};
      return {text: `You set out to ${d.label.toLowerCase()}. It will take about ${Math.ceil(d.seasons / 4)} years.`};
    }
    case 'abandon': { if (!pl.proj) bad('There is nothing to give up.'); const d = UNDERTAKINGS[pl.proj.id]; pl.proj = null; return {text: `You gave up on trying to ${d.label.toLowerCase()}.`}; }
    case 'meet': {
      if (p.age < 14) bad('You are too young.');
      if (pl.bonds.length >= MAX_BONDS) bad('You cannot keep up with any more people.');
      const have = new Set(pl.bonds.map(b => b.id)), pool = [...sim.people.values()].filter(q => q.id !== p.id && q.age >= 14 && !have.has(q.id) && q.settlement === v.settlement).sort((a, b) => a.id - b.id);
      if (!pool.length) bad('There is nobody new to meet here.');
      social();
      const q = pool[Math.floor(u(140) * pool.length)], qv = life.view(sim, q);
      life.apply(sim, p, {dw: -spend(v, 1)});
      if (u(141) > clamp(0.65 + st.connections / 300 + m.social * 0.2, 0.5, 0.95)) return {text: `You tried to get to know ${sim.full_name(q)}, but it came to nothing.`};
      pl.bonds.push({id: q.id, kind: 'friend', close: Math.round(22 + st.connections / 6 + 8 * u(142)), since: sim.year});
      bump(st, {connections: 0.8 * (1 + m.social)});
      return {text: `You got to know ${sim.full_name(q)}, a ${qv.job} of ${sim.settlements.get(qv.settlement)?.name ?? 'your town'}.`};
    }
    case 'time': {
      const b = bond(); if (b.kind === 'rival') bad('You are not spending time with a rival.');
      social(); life.apply(sim, p, {dw: -spend(v, 0.5)});
      b.close = clamp(b.close + 9 * (1 + m.social * 0.5), 0, 100); bump(st, {connections: 0.8 * (1 + m.social), skill: b.kind === 'mentee' ? 0.4 : 0, honor: b.kind === 'mentee' ? 0.5 : 0});
      return {text: b.kind === 'mentee' ? `You spent the season teaching ${nameOf(sim, b.id)}.` : `You spent time with ${nameOf(sim, b.id)}. The bond is stronger.`};
    }
    case 'favor': {
      const b = bond(); if (b.kind === 'rival') bad('A rival will not do you favours.');
      if (b.close < 35) bad('You do not know them well enough to ask.');
      social(); const dw = 2 + b.close / 12 * (0.6 + u(143) * 0.8); b.close = clamp(b.close - 8, 0, 100);
      life.apply(sim, p, {dw, df: 0.3}); bump(st, {connections: 0.5});
      return {text: `You asked ${nameOf(sim, b.id)} for a favour and came away ${money(dw)} better off.`};
    }
    case 'court': {
      const b = bond(); if (b.kind !== 'friend') bad('Only a friend can be courted.');
      if (pl.bonds.some(x => x.kind === 'spouse')) bad('You already have a partner.');
      const q = sim.people.get(b.id); if (!q || q.age < 18 || p.age < 18) bad('One of you is too young.');
      if (b.close < 55) bad('You are not close enough yet.');
      social(); life.apply(sim, p, {dw: -spend(v, 3)});
      if (u(144) < clamp(b.close / 120 + 0.15 + m.social * 0.3, 0.2, 0.9)) {
        b.kind = 'spouse'; b.close = Math.max(b.close, 70); gainTrait(pl, 'spouse');
        return {text: `${nameOf(sim, b.id)} said yes. You are married.`, tag: `Married ${nameOf(sim, b.id)}.`};
      }
      b.close = clamp(b.close - 12, 0, 100); return {text: `${nameOf(sim, b.id)} turned you down, kindly. It stings a little.`};
    }
    case 'outdo': {
      const b = bond(); if (b.kind !== 'rival') bad('Only a rival can be outdone.');
      const q = sim.people.get(b.id), rv = q ? life.view(sim, q).fame : 0; social();
      const win = u(145) < clamp(0.5 + (st.skill - 50) / 300 + (v.fame - rv) / 200 + m.luck, 0.15, 0.9);
      life.apply(sim, p, win ? {df: 4 * (1 + m.fame)} : {df: -2}); b.close = clamp(b.close + (win ? -15 : 10), 0, 100);
      return {text: win ? `You outdid ${nameOf(sim, b.id)} in public, and people noticed.` : `${nameOf(sim, b.id)} had the better of you this time.`};
    }
    case 'mend': {
      const b = bond(); if (b.kind !== 'rival') bad('There is nothing to mend.'); social();
      if (u(146) < clamp(0.55 - b.close / 250 + m.social * 0.2, 0.2, 0.8)) { b.kind = 'friend'; b.close = 28; bump(st, {honor: 2}); return {text: `You and ${nameOf(sim, b.id)} made peace.`}; }
      b.close = clamp(b.close + 5, 0, 100); return {text: `${nameOf(sim, b.id)} would not hear you out.`};
    }
    case 'cut': { const b = bond(); pl.bonds = pl.bonds.filter(x => x !== b); if (b.kind === 'spouse') pl.traits = pl.traits.filter(t => t !== 'spouse'); return {text: `You let ${nameOf(sim, b.id)} go.`}; }
  }
  bad('Unknown action.');
}

/** Add a bond (events do this). Updates one that exists. */
export function addBond(sim, pl, id, kind, close) {
  const had = pl.bonds.find(b => b.id === id);
  if (had) { if (kind === 'rival' || had.kind === 'friend') had.kind = kind; had.close = clamp(Math.max(had.close, close), 0, 100); return had; }
  if (pl.bonds.length >= MAX_BONDS) { pl.bonds.sort((a, b) => a.close - b.close); if (pl.bonds[0].kind === 'spouse') return null; pl.bonds.shift(); }
  const b = {id, kind, close, since: sim.year}; pl.bonds.push(b); return b;
}

// ---------------------------------------------------------------- what the screen shows
const rewardText = a => `+1 perk point, +8 fame, and the “${TRAITS[a.trait].label}” trait`;
export function depthView(sim, life, p, v, st) {
  const pl = life.player, m = mods(pl), key = keyOf(sim, pl), c = ctx(sim, life, p, v, st, pl); ensureDepth(sim, pl);
  const pct = a => Math.round(clamp(a.progress(c), 0, 1) * 100);
  const amb = id => { const a = AMBITIONS[id]; return {id, label: a.label, text: a.text, progress: pct(a), reward: rewardText(a)}; };
  const adult = p.age >= 18, held = new Set(pl.holdings);
  const nameOfBond = b => { const q = sim.people.get(b.id), qv = q ? life.view(sim, q) : null; return {id: b.id, name: nameOf(sim, b.id), kind: b.kind, close: Math.round(b.close), job: qv?.job ?? '', age: q?.age ?? 0, place: qv ? sim.settlements.get(qv.settlement)?.name ?? '' : ''}; };
  const proj = pl.proj ? {id: pl.proj.id, label: UNDERTAKINGS[pl.proj.id].label, text: UNDERTAKINGS[pl.proj.id].text, left: pl.proj.left, total: pl.proj.total} : null;
  const unitsOk = (d, why) => (d.need && st[d.need[0]] < d.need[1] ? `Needs ${d.need[0]} ${d.need[1]}.` : v.wealth < d.cost ? 'You cannot afford it.' : !adult ? 'You are too young.' : pl.proj ? 'You are already seeing something through.' : why);
  return {
    traits: pl.traits.map(id => ({id, label: TRAITS[id].label, text: TRAITS[id].text})),
    mods: m,
    ambition: {current: pl.ambition ? amb(pl.ambition) : null, list: Object.keys(AMBITIONS).filter(id => !pl.doneAmb.includes(id)).map(amb), done: pl.doneAmb.map(id => AMBITIONS[id].label)},
    perks: {points: pl.pts ?? 0, list: Object.entries(PERKS).map(([id, k]) => {
      const owned = pl.perks.includes(id), short = (pl.pts ?? 0) < k.cost, need = k.need && st[k.need[0]] < k.need[1];
      return {id, label: k.label, text: k.text, cost: k.cost, owned, enabled: !owned && !short && !need, why: owned ? '' : need ? `Needs ${k.need[0]} ${k.need[1]}.` : short ? 'Not enough points.' : ''};
    })},
    holdings: {
      owned: pl.holdings.map(id => ({id, label: HOLDINGS[id].label, text: HOLDINGS[id].text, sell: Math.round(HOLDINGS[id].cost * SELL)})),
      market: Object.entries(HOLDINGS).filter(([id]) => !held.has(id)).map(([id, h]) => {
        const why = !adult ? 'You are too young.' : pl.holdings.length >= MAX_HOLDINGS ? 'You cannot manage any more.' : v.wealth < h.cost ? 'You cannot afford it.' : '';
        return {id, label: h.label, text: h.text, cost: h.cost, income: `${h.income[0]} to ${h.income[1]} a season`, enabled: !why, why};
      })
    },
    bonds: pl.bonds.map(nameOfBond).sort((a, b) => b.close - a.close),
    social: {used: pl.social === key, room: pl.bonds.length < MAX_BONDS},
    proj: {current: proj, done: pl.projDone ?? 0, list: projectsFor(v.job).map(([id, d]) => { const why = unitsOk(d, ''); return {id, label: d.label, text: d.text, cost: d.cost, seasons: d.seasons, enabled: !why, why}; })}
  };
}
