// Businesses. The world has firms: mills, weavers, forges, shipyards, trading houses, presses, banks, railways. Each belongs to a
// town, was founded by a real person, earns or loses money every year according to its town, its country's fortunes and its
// luck, and can grow branches, go public, buy a rival, scandalise, or fail. They live beside the simulation (in the World) and read
// it; the only thing they ever change in it is a founder's wealth, through life.apply() (private unless "People shape the world" is on).
//
// A person you play can found a firm, take a job in one, buy and sell shares, and steer a firm they own.
import {unit} from './life_seasons.js';
import {bump} from './life_careers.js';

const R = (sim, ...k) => unit(sim.geo_seed ?? 0, sim.year, ...k);
const pick = (list, r) => list[Math.floor(r * list.length) % list.length];
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const num = n => Math.round(n).toLocaleString('en-US');

/** gate: any one of these technologies in some country opens the sector. roi: typical yearly return on capital. */
export const SECTORS = {
  mill:     {label: 'Mill', nouns: ['Mill', 'Millers', 'Grain Works'], cost: 40, roi: 0.11, gate: [], risk: 0.06},
  weaver:   {label: 'Weavers', nouns: ['Weavers', 'Looms', 'Cloth Hall'], cost: 55, roi: 0.12, gate: ['weaving'], risk: 0.07},
  brewery:  {label: 'Brewery', nouns: ['Brewery', 'Ale House', 'Maltings'], cost: 50, roi: 0.12, gate: ['pottery', 'kiln firing'], risk: 0.08},
  forge:    {label: 'Forge', nouns: ['Forge', 'Ironworks', 'Smithy'], cost: 70, roi: 0.12, gate: ['bronze tools', 'ironworking', 'smelting'], risk: 0.08},
  quarry:   {label: 'Quarry', nouns: ['Quarry', 'Stoneworks', 'Masons'], cost: 80, roi: 0.11, gate: ['masonry'], risk: 0.07},
  trader:   {label: 'Trading house', nouns: ['Trading Company', 'Traders', 'Merchant House'], cost: 90, roi: 0.14, gate: ['currency', 'barter', 'caravan routes'], risk: 0.13},
  shipyard: {label: 'Shipyard', nouns: ['Shipyard', 'Shipwrights', 'Dockworks'], cost: 130, roi: 0.13, gate: ['shipbuilding', 'sailing'], risk: 0.12},
  press:    {label: 'Press', nouns: ['Press', 'Printers', 'Type House'], cost: 150, roi: 0.15, gate: ['printing'], risk: 0.1},
  bank:     {label: 'Bank', nouns: ['Bank', 'Counting House', 'Savings Society'], cost: 200, roi: 0.13, gate: ['banking'], risk: 0.14},
  foundry:  {label: 'Foundry', nouns: ['Foundry', 'Steelworks', 'Engine Works'], cost: 260, roi: 0.14, gate: ['steelmaking', 'steam power', 'factory system'], risk: 0.1},
  railway:  {label: 'Railway', nouns: ['Railway Company', 'Rail & Carriage', 'Line'], cost: 420, roi: 0.16, gate: ['railways'], risk: 0.15}
};
export const STRATEGIES = {
  steady: {label: 'Steady', text: 'Keep things as they are.', roi: 0, growth: 1, rep: 0},
  expand: {label: 'Expand', text: 'Spend on growth: more return when times are good, deeper losses in bad years.', roi: 0.03, growth: 1.4, rep: 0, bad: -0.05},
  thrift: {label: 'Cut costs', text: 'Lean and safe: a smaller return, but bad years hurt less.', roi: -0.02, growth: 0.8, rep: -1, bad: 0.06},
  craft:  {label: 'Craft & quality', text: 'Build a name: slower profit, a stronger reputation.', roi: -0.015, growth: 1, rep: 3}
};
export const RANKS = [['Clerk', 6], ['Foreman', 14], ['Manager', 30], ['Partner', 60]];
const MAX_OWNED = 3, MAX_STAKE = 49, HIST = 14;

const firstName = (sim, p) => sim.full_name(p).split(' of ')[0];
const surname = (sim, p) => { const w = firstName(sim, p).split(' '); while (w.length > 1 && /^[IVXL]+$/.test(w.at(-1))) w.pop(); return w.at(-1); };
const ADJ = ['Golden', 'Blue', 'Iron', 'Honest', 'Bright', 'Old', 'Northern', 'Silver', 'Green', 'Red'], OBJ = ['Anchor', 'Wheel', 'Crown', 'Bell', 'Oak', 'Heron', 'Compass', 'Key', 'Lantern', 'Star'];

/** Which sectors can be opened in a country (the technology is known there). */
export function available(country) { return Object.keys(SECTORS).filter(k => !SECTORS[k].gate.length || SECTORS[k].gate.some(t => country?.technologies?.has?.(t))); }
/** What the firm is worth: its capital, read up or down by how it has been doing. */
export const worth = f => Math.max(1, f.cap * clamp(0.85 + f.roi * 4, 0.5, 2.5));
export const price = f => Math.max(0.1, worth(f) / 100);

function nameFor(sim, towns, f, founder, r) {
  const sec = SECTORS[f.sector], noun = pick(sec.nouns, r(1)), t = towns.get(f.town)?.s.name ?? 'Old';
  const style = Math.floor(r(2) * 4);
  return style === 0 && founder ? `${surname(sim, founder)} & Sons ${noun}` : style === 1 ? `${t} ${noun}` : style === 2 ? `${pick(ADJ, r(3))} ${pick(OBJ, r(4))} ${noun}` : founder ? `${surname(sim, founder)} ${noun}` : `${t} ${noun}`;
}
const log = (f, y, text) => { f.hist.unshift([y, text]); if (f.hist.length > HIST) f.hist.length = HIST; };

/** Found a firm. `founder` is a living person, `owner` the person who really owns it (the played one) or null. */
export function foundFirm(world, sim, towns, {founder, sector, town, cap, owner = null, born = sim.year, rep = 20}) {
  const id = world.nextFirm++, r = k => unit(sim.geo_seed ?? 0, born, 500 + id, k), t = towns.get(town);
  const f = {id, name: '', sector, town, townName: t.s.name, country: t.s.country, founder: founder?.id ?? null, founderName: founder ? firstName(sim, founder) : 'Unknown', owner, born, cap, rev: 0, profit: 0, roi: 0.05, peak: cap, rep, pub: false, strat: 'steady', branches: [], staff: 0, alive: true, ended: null, why: null, loss: 0, hist: [], born0: cap, ceo: founder?.id ?? null, ceoName: founder ? firstName(sim, founder) : ''};
  f.name = nameFor(sim, towns, f, founder, r); f.staff = Math.round(2 + Math.sqrt(cap) * 0.9);
  log(f, born, `Founded in ${f.townName} by ${f.founderName} with ${num(cap)} in capital.`);
  world.firms.set(id, f);
  return f;
}

const owned = (world, pid) => [...world.firms.values()].filter(f => f.alive && f.owner === pid);
const stakeOf = (world, pid, id) => world.stakes.get(`${pid}:${id}`) ?? 0;

/** The world's firms for the year: seed, found, earn, grow, fall. Returns lines for the person being played. */
export function firmsYear(world, sim, life, towns, mine) {
  const y = sim.year, lines = [], pid = mine?.id ?? null;
  const firms = [...world.firms.values()].filter(f => f.alive).sort((a, b) => a.id - b.id);
  const totalPop = [...towns.values()].reduce((a, t) => a + t.pop, 0), target = clamp(Math.round(totalPop / 190), 3, 48);
  const wars = new Set(); for (const [pair] of sim.wars) for (const c of pair) wars.add(c);

  for (const f of firms) {
    const t = towns.get(f.town), c = sim.countries.get(f.country), sec = SECTORS[f.sector], st = STRATEGIES[f.strat] ?? STRATEGIES.steady, u = k => R(sim, 600 + f.id, k);
    if (!t || !c) { fail(f, y, 'its town was abandoned', world, sim, life, lines, pid); continue; }
    const hard = c.sickness || ['Famine', 'Drought', 'Disease', 'Panic'].some(x => c.conditions?.has?.(x)), war = wars.has(f.country);
    const climate = (c.prosperity - 50) / 400 - (war ? 0.05 : 0) - (hard ? 0.05 : 0);
    const room = clamp(1.3 - f.cap / (t.pop * 5 * (1 + f.branches.length * 0.6)), 0.1, 1.3); // a town can only buy so much
    let roi = sec.roi * (0.35 + 1.3 * u(1)) * room + climate + st.roi + (f.rep - 30) / 1500 + 0.01 * Math.min(f.branches.length, 4) - sec.risk * 0.5;
    if (u(2) < sec.risk) roi += (u(3) < 0.5 ? -1 : 1) * 0.12; // a lucky or terrible year
    if (roi < 0) roi += (st.bad ?? 0) * Math.min(1, -roi * 8);
    f.roi = clamp(roi, -0.45, 0.5);
    f.profit = f.cap * f.roi; f.rev = Math.max(0, f.cap * (1.2 + f.branches.length * 0.2) * (0.8 + 0.4 * u(4)));
    const share = f.profit > 0 ? 0.4 : 0; // paid out
    const div = f.profit * share; f.cap = Math.max(0, f.cap + f.profit - div);
    if (f.profit < 0) f.loss++; else f.loss = 0;
    f.rep = clamp(f.rep + st.rep * (u(5) < 0.5 ? 1 : 0) + (f.roi > 0.1 ? 1 : f.roi < 0 ? -1 : 0), 0, 100);
    f.staff = Math.round(2 + Math.sqrt(f.cap) * 0.9 * (1 + f.branches.length * 0.15));
    if (f.cap > f.peak) f.peak = f.cap;
    // dividends: to the owner or founder, and to whoever holds shares
    const founder = sim.people.get(f.owner ?? f.founder), stake = pid ? stakeOf(world, pid, f.id) : 0;
    const float = f.pub ? 60 : 0, holders = Math.min(MAX_STAKE, stake);
    if (div > 0) {
      const holder = f.owner === pid && pid != null ? div : div * (100 - float) / 100;
      if (founder && founder.id !== pid) life.apply(sim, founder, {dw: holder});
      else if (f.owner === pid && pid != null) { life.apply(sim, sim.people.get(pid), {dw: holder}); lines.push(`${f.name} paid you ${num(holder)} in profits.`); }
      if (holders > 0 && f.owner !== pid) { const d = div * holders / 100; life.apply(sim, sim.people.get(pid), {dw: d}); lines.push(`Your ${holders} shares in ${f.name} paid ${num(d)}.`); }
    }
    if (f.owner === pid && pid != null && f.profit < 0) lines.push(`${f.name} lost ${num(-f.profit)} this year.`);
    // events
    const big = f.cap >= 150;
    if (f.cap >= f.born0 * 3 && f.branches.length < 3 && u(6) < 0.09 * st.growth) {
      const others = [...towns.values()].filter(x => x.s.country === f.country && x.s.id !== f.town && !f.branches.includes(x.s.id) && x.pop >= 25);
      const nt = others[Math.floor(u(7) * others.length)];
      if (nt) { f.branches.push(nt.s.id); f.cap -= f.cap * 0.1; log(f, y, `Opened a branch in ${nt.s.name}.`); if (big) world.say(y, 'ledger', 'firm', `${f.name} opens a branch in ${nt.s.name}`, `${f.townName}-based ${SECTORS[f.sector].label.toLowerCase()} now operates in ${f.branches.length + 1} towns`, {score: 58, town: f.town, firm: f.id}); if (f.owner === pid && pid != null) lines.push(`${f.name} opened a branch in ${nt.s.name}.`); }
    }
    if (!f.pub && f.cap >= 400 && sim.countries.get(f.country)?.technologies?.has?.('joint-stock companies') && u(8) < 0.3) {
      f.pub = true; log(f, y, 'Went public: 60% of the firm is now for sale.'); world.say(y, 'ledger', 'firm', `${f.name} goes public`, `Shares offered in ${f.townName}: ${num(price(f) * 100)} for the lot`, {score: 72, town: f.town, firm: f.id});
      if (f.owner === pid && pid != null) lines.push(`${f.name} was floated on the exchange: anyone can now buy its shares.`);
    }
    if (u(9) < 0.03) { f.rep = clamp(f.rep + 8, 0, 100); f.cap *= 1.04; log(f, y, 'Introduced a better way of working.'); if (big || f.owner === pid) world.say(y, 'sage', 'firm', `${f.name} unveils a better ${SECTORS[f.sector].label.toLowerCase()}`, 'Competitors are said to be copying it already', {score: 56, town: f.town, firm: f.id}); }
    if (u(10) < 0.02) { f.rep = clamp(f.rep - 14, 0, 100); log(f, y, 'A scandal damaged its name.'); if (big || f.owner === pid) world.say(y, 'whisper', 'firm', `What is ${f.name} hiding?`, `Rumours of short measures in ${f.townName}. The firm denies everything.`, {score: 50, town: f.town, firm: f.id}); if (f.owner === pid && pid != null) lines.push(`A scandal touched ${f.name}; its reputation fell.`); }
    if (f.staff >= 12 && climate < 0 && u(11) < 0.07) { f.cap *= 0.96; log(f, y, 'A strike halted work for weeks.'); world.say(y, 'hearth', 'firm', `Workers at ${f.name} walk out`, `${f.staff} staff demand better pay in ${f.townName}`, {score: 54, town: f.town, firm: f.id}); if (f.owner === pid && pid != null) lines.push(`Your workers at ${f.name} walked out for weeks.`); }
    // the founder dies: the firm passes on
    if (f.founder != null && !sim.people.has(f.founder) && f.ceo === f.founder) {
      const heir = [...sim.people.values()].filter(p => p.parents?.includes(f.founder) && p.age >= 18).sort((a, b) => a.id - b.id)[0] ?? [...sim.people.values()].filter(p => p.settlement === f.town && p.age >= 25 && ['merchant', 'artisan'].includes(p.job)).sort((a, b) => a.id - b.id)[0];
      if (heir) { f.ceo = heir.id; f.ceoName = firstName(sim, heir); if (f.owner == null) f.founder = heir.id; log(f, y, `${f.founderName} died. ${f.ceoName} took over.`); if (big) world.say(y, 'ledger', 'firm', `${f.name} passes to ${f.ceoName}`, `After the death of ${f.founderName}`, {score: 52, town: f.town, firm: f.id}); }
    }
    if (f.cap < 4 || (f.loss >= 3 && f.cap < f.peak * 0.4)) fail(f, y, f.cap < 4 ? 'it ran out of capital' : 'years of losses ate its capital', world, sim, life, lines, pid);
  }
  // a small firm is bought by a bigger one in its sector
  for (const f of [...world.firms.values()].filter(x => x.alive && x.cap < 70 && x.owner == null)) {
    const buyer = [...world.firms.values()].filter(b => b.alive && b.id !== f.id && b.sector === f.sector && b.country === f.country && b.cap > f.cap * 3).sort((a, b) => b.cap - a.cap)[0];
    if (buyer && R(sim, 700, f.id) < 0.05) { buyer.cap += f.cap * 0.5; f.alive = false; f.ended = y; f.why = `bought by ${buyer.name}`; log(f, y, `Bought by ${buyer.name}.`); log(buyer, y, `Bought ${f.name}.`); world.say(y, 'ledger', 'firm', `${buyer.name} buys ${f.name}`, `A ${SECTORS[f.sector].label.toLowerCase()} merger in ${buyer.townName}`, {score: 60, town: buyer.town, firm: buyer.id}); if (f.owner === pid && pid != null) lines.push(`${f.name} was bought by ${buyer.name}.`); }
  }
  // new firms, when the world has room
  const alive = [...world.firms.values()].filter(f => f.alive).length;
  if (alive < target && R(sim, 701) < 0.3 + 0.5 * (target - alive) / target) found(world, sim, life, towns, y, true);
  // the market index: average return, kept as a running level
  const live = [...world.firms.values()].filter(f => f.alive && f.rev > 0);
  const avg = live.length ? live.reduce((a, f) => a + f.roi, 0) / live.length : 0, last = world.index.at(-1)?.[1] ?? 100;
  world.mood = (world.mood ?? avg) * 0.6 + avg * 0.4; // smoothed average return: the index is where the mood stands, not a running product
  const level = Math.round((100 + 500 * (world.mood - 0.08)) * 10) / 10; world.index.push([y, level]); if (world.index.length > 80) world.index.shift();
  if (world.index.length > 3 && Math.abs(level / world.index[world.index.length - 4][1] - 1) >= 0.25) world.say(y, 'ledger', 'market', level > last ? 'Markets soar' : 'Markets slump', `The Ledger index stands at ${level}, ${level > last ? 'up' : 'down'} on three years ago`, {score: 76});
  return lines;
}

function fail(f, y, why, world, sim, life, lines, pid) {
  f.alive = false; f.ended = y; f.why = why; log(f, y, `Closed: ${why}.`);
  if (f.peak >= 80 || f.owner === pid) world.say(y, 'ledger', 'firm', `${f.name} closes its doors`, `Closed in ${f.townName}: ${why}. Staff: ${f.staff}.`, {score: 66, town: f.town, firm: f.id});
  if (f.owner != null && f.owner === pid) lines.push(`${f.name} has failed: ${why}.`);
  for (const [pk, post] of [...world.posts]) if (post.firm === f.id) { world.posts.delete(pk); if (pk === pid) lines.push(`${f.name} closed. You lost your post.`); }
}

/** Found (or seed) one new firm run by a rich person. Returns it, or null when nobody fits. */
function found(world, sim, life, towns, y, charge, seeding = false) {
  const count = new Map(); for (const f of world.firms.values()) if (f.alive) count.set(f.founder, (count.get(f.founder) ?? 0) + 1);
  const cands = [...sim.people.values()].filter(p => p.age >= 22 && p.age < 70 && (p.wealth ?? 0) >= 30 && (count.get(p.id) ?? 0) < 2 && towns.has(p.settlement) && towns.get(p.settlement).pop >= 20 && (['merchant', 'artisan', 'laborer'].includes(p.job)))
    .sort((a, b) => (b.wealth ?? 0) - (a.wealth ?? 0) || a.id - b.id).slice(0, 25);
  if (!cands.length) return null;
  const founder = cands[Math.floor(R(sim, 710, world.nextFirm) ** 2 * cands.length)], t = towns.get(founder.settlement), ks = available(sim.countries.get(t.s.country));
  const open = ks.filter(k => !seeding || !world.firms.size || true);
  const sector = pick(open, R(sim, 711, world.nextFirm)), sec = SECTORS[sector], cap = clamp(Math.round(sec.cost * (0.8 + R(sim, 712, world.nextFirm) * 0.8)), 20, Math.max(20, (founder.wealth ?? 0) * 0.6));
  const born = seeding ? Math.max(0, y - Math.floor(R(sim, 713, world.nextFirm) * 15)) : y;
  const first = ![...world.firms.values()].some(f => f.sector === sector);
  const f = foundFirm(world, sim, towns, {founder, sector, town: t.s.id, cap: seeding ? Math.round(cap * 1.3) : cap, born});
  f.born0 = f.cap;
  if (charge && !seeding) life.apply(sim, founder, {dw: -cap});
  if (!seeding) { world.say(y, first ? 'lantern' : 'ledger', 'firm', first ? `The world’s first ${SECTORS[sector].label.toLowerCase()}: ${f.name} opens in ${t.s.name}` : `${f.name} opens in ${t.s.name}`, `Founded by ${f.founderName} with ${num(cap)} of their own money`, {score: first ? 78 : cap >= 120 ? 56 : 42, town: t.s.id, firm: f.id, who: founder.id}); life.add(founder.id, y, 'event', 'business', `founded ${f.name}`); }
  return f;
}

/** Called once for a world with no firms: a handful of established ones, so there is something to see from year one. */
export function seedFirms(world, sim, life, towns) {
  const totalPop = [...towns.values()].reduce((a, t) => a + t.pop, 0), n = clamp(Math.round(totalPop / 380), 2, 14);
  for (let i = 0; i < n; i++) found(world, sim, life, towns, sim.year, false, true);
  for (const f of world.firms.values()) f.born0 ??= f.cap;
}

// ---------- the person you play
export function bizView(world, sim, life, p, v, st) {
  const pid = p.id, c = sim.countries.get(v.country), toTown = f => f.townName;
  const mine = owned(world, pid).map(f => ({...summary(f), strat: f.strat}));
  const post = world.posts.get(pid), pf = post && world.firms.get(post.firm);
  const stakes = [...world.stakes].filter(([k]) => k.startsWith(`${pid}:`)).map(([k, n]) => { const f = world.firms.get(Number(k.split(':')[1])); return f && n > 0 ? {...summary(f), shares: n, value: Math.round(price(f) * n)} : null; }).filter(Boolean);
  const sectors = available(c).map(k => { const s = SECTORS[k], dup = owned(world, pid).some(f => f.sector === k && f.town === v.settlement);
    const why = v.age < 18 ? 'You are too young.' : mine.length >= MAX_OWNED ? `You can run only ${MAX_OWNED} firms.` : dup ? 'You already run one here.' : v.wealth < s.cost ? `You need ${s.cost}.` : '';
    return {id: k, label: s.label, cost: s.cost, roi: Math.round(s.roi * 100), enabled: !why, why}; });
  const market = [...world.firms.values()].filter(f => f.alive && f.pub && f.owner !== pid).sort((a, b) => b.cap - a.cap).slice(0, 12).map(f => { const own = stakeOf(world, pid, f.id), cost = Math.ceil(price(f) * 5);
    const why = own + 5 > MAX_STAKE ? 'You hold as much as you may.' : v.wealth < cost ? `Five shares cost ${cost}.` : ''; return {...summary(f), price: Math.round(price(f) * 10) / 10, own, enabled: !why, why}; });
  const hiring = [...world.firms.values()].filter(f => f.alive && f.country === v.country && f.owner !== pid && f.id !== post?.firm)
    .sort((a, b) => (b.town === v.settlement) - (a.town === v.settlement) || b.cap - a.cap).slice(0, 8)
    .map(f => ({...summary(f), pay: RANKS[0][1], enabled: f.town === v.settlement, why: f.town === v.settlement ? '' : `Based in ${f.townName}: move there first.`}));
  return {mine, stakes, sectors, market, hiring, strategies: Object.entries(STRATEGIES).map(([id, s]) => ({id, label: s.label, text: s.text})), limit: MAX_OWNED,
    post: pf ? {firm: pf.id, name: pf.name, rank: RANKS[post.rank][0], pay: Math.round(RANKS[post.rank][1] * (1 + pf.staff / 40)), next: post.rank < 3 ? RANKS[post.rank + 1][0] : null, since: post.since} : null,
    income: Math.round(mine.reduce((a, f) => a + Math.max(0, f.profit * 0.4 + f.profit * 0.6 * (f.owner === pid ? 1 : 0)), 0) + stakes.reduce((a, s) => a + Math.max(0, s.profit * 0.4 * (s.shares / 100)), 0))};
}
export function summary(f) {
  return {id: f.id, name: f.name, sector: f.sector, kind: SECTORS[f.sector]?.label ?? f.sector, town: f.town, townName: f.townName, country: f.country, founder: f.founder, founderName: f.founderName, ceo: f.ceo, ceoName: f.ceoName, owner: f.owner,
    born: f.born, cap: Math.round(f.cap), worth: Math.round(worth(f)), profit: Math.round(f.profit * 10) / 10, rev: Math.round(f.rev), roi: Math.round(f.roi * 1000) / 10, rep: Math.round(f.rep), staff: f.staff, branches: f.branches.length, pub: f.pub, alive: f.alive, ended: f.ended, why: f.why, strat: f.strat, hist: f.hist.slice(0, 8)};
}

/** Something done by choice. Returns {text, tag?}; throws a plain-English Error when it cannot be done. */
export function bizAct(world, sim, life, p, v, kind, id, arg, towns) {
  const pid = p.id, y = sim.year, c = sim.countries.get(v.country);
  const firm = () => { const f = world.firms.get(Number(id)); if (!f || !f.alive) throw Error('That firm no longer exists.'); return f; };
  if (kind === 'found') {
    if (v.age < 18) throw Error('You are too young to found a firm.');
    if (!SECTORS[id] || !available(c).includes(id)) throw Error('Nobody here knows how to run that kind of firm yet.');
    if (owned(world, pid).length >= MAX_OWNED) throw Error(`You can run only ${MAX_OWNED} firms.`);
    const s = SECTORS[id]; if (v.wealth < s.cost) throw Error(`You need ${s.cost} to found it.`);
    if (owned(world, pid).some(f => f.sector === id && f.town === v.settlement)) throw Error('You already run one here.');
    const t = towns.get(v.settlement) ?? {s: sim.settlements.get(v.settlement), pop: 30};
    const f = foundFirm(world, sim, new Map([[t.s.id, t]]), {founder: p, sector: id, town: t.s.id, cap: Math.round(s.cost * 0.85), owner: pid}); f.born0 = f.cap;
    life.apply(sim, p, {dw: -s.cost});
    world.say(y, 'ledger', 'firm', `${f.name} opens in ${t.s.name}`, `Founded by ${f.founderName} with ${num(f.cap)} in capital`, {score: 58, town: t.s.id, firm: f.id, who: pid});
    return {text: `You founded ${f.name} in ${t.s.name}. It earns every year, and you see to its direction on the Business page.`, tag: `founded ${f.name}`, bump: {skill: 0.8, connections: 1}};
  }
  if (kind === 'strategy') { const f = firm(); if (f.owner !== pid) throw Error('That firm is not yours.'); if (!STRATEGIES[arg]) throw Error('Choose a direction.'); f.strat = arg; log(f, y, `New direction: ${STRATEGIES[arg].label}.`); return {text: `${f.name} will now run: ${STRATEGIES[arg].label.toLowerCase()}.`}; }
  if (kind === 'close') { const f = firm(); if (f.owner !== pid) throw Error('That firm is not yours.'); const back = Math.round(f.cap * 0.7); f.alive = false; f.ended = y; f.why = 'wound up by its owner'; log(f, y, 'Wound up by its owner.'); life.apply(sim, p, {dw: back}); return {text: `You closed ${f.name} and took ${num(back)} out of it.`}; }
  if (kind === 'buy' || kind === 'sell') {
    const f = firm(); if (!f.pub) throw Error('Only public firms sell shares.'); if (f.owner === pid) throw Error('You own this firm outright.');
    const own = stakeOf(world, pid, f.id), n = kind === 'buy' ? 5 : Math.min(5, own), cost = Math.round(price(f) * n * 10) / 10;
    if (kind === 'buy') { if (own + n > MAX_STAKE) throw Error('You hold as much of it as you may.'); if (v.wealth < cost) throw Error(`You cannot afford that: ${Math.ceil(cost)}.`); life.apply(sim, p, {dw: -cost}); world.stakes.set(`${pid}:${f.id}`, own + n); return {text: `You bought ${n} shares of ${f.name} for ${num(cost)}. They pay a share of the profits every year.`, tag: `invested in ${f.name}`}; }
    if (!own) throw Error('You hold none of its shares.'); life.apply(sim, p, {dw: cost}); const left = own - n; if (left > 0) world.stakes.set(`${pid}:${f.id}`, left); else world.stakes.delete(`${pid}:${f.id}`); return {text: `You sold ${n} shares of ${f.name} for ${num(cost)}.`};
  }
  if (kind === 'work') {
    const f = firm(); if (f.town !== v.settlement) throw Error('You can only take a post in a firm in your own town.'); if (v.age < 16) throw Error('You are too young.');
    if (f.owner === pid) throw Error('You already run it.');
    world.posts.set(pid, {firm: f.id, rank: 0, since: y}); return {text: `You took a post as a clerk at ${f.name}. It pays ${RANKS[0][1]} a year, and good work is noticed.`, tag: `joined ${f.name}`};
  }
  if (kind === 'quit') { if (!world.posts.has(pid)) throw Error('You have no post.'); world.posts.delete(pid); return {text: 'You left your post.'}; }
  if (kind === 'attend') {
    const s = world.stories.find(x => x.id === Number(id)); if (!s || s.town !== v.settlement) throw Error('That is not in your town.');
    if (world.went.has(`${pid}:${s.id}`)) throw Error('You have already been.'); if (y - s.year > 1) throw Error('It is over.');
    const cost = Math.min(v.wealth, 4); world.went.add(`${pid}:${s.id}`); if (world.went.size > 400) world.went.delete(world.went.values().next().value);
    life.apply(sim, p, {dw: -cost, df: 0.4}); return {text: `You went to ${s.head}. You met people and spent ${num(cost)}.`, bump: {connections: 1.5, honor: 0.3}};
  }
  throw Error('Unknown business action.');
}

/** A person you play, once a year: salary and promotion. Returns lines. */
export function postYear(world, sim, life, p, st) {
  const post = world.posts.get(p.id), f = post && world.firms.get(post.firm); if (!f?.alive) return [];
  const lines = [], pay = Math.round(RANKS[post.rank][1] * (1 + f.staff / 40));
  life.apply(sim, p, {dw: pay}); lines.push(`${f.name} paid you ${num(pay)} as ${RANKS[post.rank][0].toLowerCase()}.`);
  const r = unit(sim.geo_seed ?? 0, sim.year, 800, p.id);
  if (post.rank < 3 && r < 0.14 + (st?.skill ?? 0) / 400 + (st?.connections ?? 0) / 600) { post.rank++; lines.push(`You were promoted to ${RANKS[post.rank][0].toLowerCase()} at ${f.name}.`); if (post.rank === 3) { bump(st, {honor: 1}); } }
  return lines;
}
