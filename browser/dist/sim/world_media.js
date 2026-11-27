// The press and the arts. Seven made-up channels, each with its own beat, report what matters:
//   * the simulation's big events (wars, coups, plagues, discoveries), judged by news.js and given to the channel that would cover them,
//     with a second angle from another channel when the story is big enough (the Ledger worries about a war, the Whisper smells a coup);
//   * the culture the world makes for itself: premieres, festivals, a yearly cup, treatises, schools of art and thought, prizes,
//     trials, fashions, old people and decade reviews, all tied to real towns and real people.
// Nothing here draws from the simulation's random stream (it uses the same hash dice as the life layer) and nothing here changes the
// world except through life.apply(), which is a private overlay unless "People shape the world" is on.
import {unit} from './life_seasons.js';
import {classify} from '../news.js';

export const CHANNELS = {
  herald:  {name: 'Dawn Herald', short: 'Herald', color: '#4338ca', slogan: 'First light on matters of state', beat: 'Politics, war and diplomacy'},
  ledger:  {name: 'The Daily Ledger', short: 'Ledger', color: '#b45309', slogan: 'Every coin accounted for', beat: 'Trade, firms and markets'},
  lantern: {name: 'The Lantern', short: 'Lantern', color: '#a855f7', slogan: 'Lighting the arts', beat: 'Arts, festivals and ideas'},
  furrow:  {name: 'Field & Furrow', short: 'Furrow', color: '#15803d', slogan: 'Weather, harvest and the land', beat: 'Harvests, weather and disasters'},
  sage:    {name: 'The Quarterly Sage', short: 'Sage', color: '#0369a1', slogan: 'Measured, and mostly right', beat: 'Science, medicine and discovery'},
  hearth:  {name: 'Hearthside Gazette', short: 'Hearth', color: '#be185d', slogan: 'What the neighbours are saying', beat: 'Towns, families and local life'},
  whisper: {name: 'Cobblestone Whisper', short: 'Whisper', color: '#64748b', slogan: 'You did not hear it from us', beat: 'Scandal and gossip'}
};
const BEAT = {war: 'herald', peace: 'herald', politics: 'herald', disaster: 'furrow', crisis: 'furrow', health: 'sage', cure: 'sage', tech: 'sage', economy: 'ledger', culture: 'lantern', expansion: 'hearth', migration: 'hearth', building: 'hearth', places: 'hearth', edit: 'hearth', news: 'hearth'};

const R = (sim, ...k) => unit(sim.geo_seed ?? 0, sim.year, ...k);
const pick = (list, r) => list[Math.floor(r * list.length) % list.length];
const num = n => Math.round(n).toLocaleString('en-US');
const ADJ = ['Silent', 'Golden', 'Last', 'Salt', 'Hollow', 'Bright', 'Crooked', 'Winter', 'Paper', 'Iron', 'Wandering', 'Honest', 'Red', 'Long'];
const NOUN = ['Road', 'Bell', 'Harvest', 'Crown', 'River', 'Orchard', 'Lantern', 'Promise', 'Garden', 'Bridge', 'Ledger', 'Wedding', 'Storm', 'Widow'];
const FEST = ['Lantern Night', 'Harvest Fair', 'Midwinter Fire', 'Blossom Days', 'Salt Market', 'River Procession', 'Bell Festival'];
const BEAST = ['Wolves', 'Herons', 'Stags', 'Foxes', 'Bears', 'Ravens', 'Otters', 'Hawks'];
const FASHION = [['indigo cloaks', 'a new blue dye'], ['high collars', 'a rumour about a royal cold'], ['painted clogs', 'the market guild'], ['striped sashes', 'a travelling troupe'], ['braided beards', 'a famous wrestler'], ['wide hats', 'the summer sun']];
const SCHOOL_A = ['Plain', 'Gilded', 'Quiet', 'Radiant', 'Stern', 'Open', 'Wild'], SCHOOL_B = ['Style', 'School', 'Circle', 'Manner', 'Fellowship', 'Movement'];
const KINDS = {art: 'a school of art', thought: 'a school of thought', faith: 'a devotional movement', music: 'a musical fashion'};

/** The year's sim events that deserve the front page, each given to the channel that covers its beat (plus a second angle on the biggest). */
export function pressYear(world, sim, ctx) {
  const hist = sim.history ?? [], cats = sim.history_categories ?? [];
  if (hist.length < world.seen) world.seen = 0;
  const fresh = [];
  for (let i = world.seen; i < hist.length; i++) {
    const [year, raw] = hist[i], message = ctx.render(raw);
    const it = classify({message, category: cats[i] || 'world'});
    if (it && it.score >= 60) fresh.push({...it, year, message, i});
  }
  world.seen = hist.length;
  fresh.sort((a, b) => b.score - a.score || a.i - b.i);
  for (const it of fresh.slice(0, 6)) {
    const kind = {WAR: 'war', PEACE: 'peace', DISASTER: 'disaster', CRISIS: 'crisis', HEALTH: 'health', CURE: 'cure', DISCOVERY: 'tech', ECONOMY: 'economy', POLITICS: 'politics', CULTURE: 'culture'}[it.tag] ?? 'news';
    const ch = BEAT[kind] ?? 'hearth', k = it.i;
    world.say(it.year, ch, kind, it.headline, it.sub, {score: it.score, text: it.message});
    // a second angle for the biggest stories
    if (kind === 'war' && it.score >= 90) world.say(it.year, 'ledger', 'war', `Merchants brace as ${it.headline.charAt(0).toLowerCase()}${it.headline.slice(1)}`, 'Insurance climbs and caravans wait at the border', {score: it.score - 20, text: it.message});
    else if (kind === 'politics' && it.score >= 80 && R(sim, 90, k) < 0.7) world.say(it.year, 'whisper', 'politics', `Who is behind it? ${it.headline}`, 'The Whisper cannot confirm it, but nobody has denied it', {score: it.score - 25, text: it.message});
    else if (kind === 'disaster' && it.score >= 78) world.say(it.year, 'hearth', 'disaster', `Neighbours open their doors: ${it.headline}`, 'Collections for the homeless begin at every well', {score: it.score - 15, text: it.message});
    else if (kind === 'health' && it.score >= 80) world.say(it.year, 'ledger', 'health', `Markets shudder: ${it.headline}`, 'Prices of herbs and linen are already climbing', {score: it.score - 22, text: it.message});
    else if (kind === 'tech' && it.score >= 50 && R(sim, 91, k) < 0.5) world.say(it.year, 'lantern', 'tech', `Scholars toast a new idea: ${it.headline}`, 'The tavern debates are said to be unbearable', {score: it.score - 10, text: it.message});
  }
}

const folk = (sim, town, ok) => { const out = []; for (const p of sim.people.values()) if (p.settlement === town.id && p.age >= 16 && ok(p)) out.push(p); return out.sort((a, b) => a.id - b.id); };
const name = (sim, p) => sim.full_name(p).split(' of ')[0];
const has = (c, ...t) => !!c && t.some(x => c.technologies?.has?.(x));

/** What the world made this year. Returns nothing; stories land in world.stories. */
export function cultureYear(world, sim, life, towns) {
  const y = sim.year, list = [...towns.values()].filter(t => t.pop >= 30).sort((a, b) => a.s.id - b.s.id);
  if (!list.length) return;
  const at = (salt, w = t => t.pop) => { const tot = list.reduce((a, t) => a + w(t), 0); let r = R(sim, salt) * tot; for (const t of list) { r -= w(t); if (r <= 0) return t; } return list.at(-1); };
  const cn = t => sim.countries.get(t.s.country);
  const ping = (p, df) => { if (p && df) life.apply(sim, p, {df}); };

  // a premiere, when a performer lives in a town big enough to have an audience
  if (R(sim, 1) < 0.55) {
    const t = at(2), art = folk(sim, t.s, p => p.job === 'performer')[0];
    if (art && t.pop >= 40) {
      const kind = has(cn(t), 'printing') ? 'novel' : has(cn(t), 'epic poetry', 'writing') ? 'epic' : 'ballad', title = `The ${pick(ADJ, R(sim, 3))} ${pick(NOUN, R(sim, 4))}`;
      const mood = pick(['The audience wept.', 'Critics were divided, and said so loudly.', 'Three people left; four hundred stayed.', 'The doors had to be held open for the crowd outside.', 'It was too long, and nobody minded.'], R(sim, 5));
      world.works.unshift({id: world.nextWork++, year: y, title, kind, by: art.id, byName: name(sim, art), town: t.s.id, townName: t.s.name}); world.works.length = Math.min(world.works.length, 40);
      world.say(y, 'lantern', 'premiere', `“${title}” premieres in ${t.s.name}`, `A new ${kind} by ${name(sim, art)}. ${mood}`, {score: 66, town: t.s.id, act: 'attend', who: art.id});
      ping(art, 1.5);
    }
  }
  // a festival
  if (R(sim, 6) < 0.5) {
    const t = at(7), f = pick(FEST, R(sim, 8)), guests = Math.round(t.pop * (1.2 + R(sim, 9) * 2.5));
    world.say(y, R(sim, 10) < 0.5 ? 'hearth' : 'lantern', 'festival', `${f} in ${t.s.name} draws ${num(guests)} visitors`, pick(['Inns are full and the baker has sold out twice.', 'The procession lasted until the lamps were out.', 'The mayor’s speech was, by general agreement, brief.', 'Children took over the main square by noon.'], R(sim, 11)), {score: 58, town: t.s.id, act: 'attend'});
  }
  // the cup: two towns of one country meet
  if (y % 2 === 0 && list.length >= 2 && R(sim, 12) < 0.85) {
    const a = at(13), others = list.filter(t => t !== a && t.s.country === a.s.country);
    if (others.length) {
      const b = others[Math.floor(R(sim, 14) * others.length)], aWin = R(sim, 15) < 0.5 + (a.pop - b.pop) / (4 * (a.pop + b.pop)), w = aWin ? a : b, l = aWin ? b : a;
      const team = `${w.s.name} ${pick(BEAST, w.s.id * 7 + 1)}`, n = (world.cup.titles[w.s.id] = (world.cup.titles[w.s.id] ?? 0) + 1);
      world.cup.last = {year: y, winner: w.s.id, team, loser: l.s.name};
      world.say(y, 'hearth', 'cup', `${team} win the Grand Cup`, `${n === 1 ? 'A first title' : `Title number ${n}`}, over ${l.s.name}. ${pick(['The bells have not stopped.', 'Losers say it was the mud.', 'Both crowds sang the same song afterwards.'], R(sim, 16))}`, {score: 56, town: w.s.id, act: 'attend'});
    }
  }
  // a treatise from a scholar
  if (R(sim, 17) < 0.35) {
    const t = at(18), s = folk(sim, t.s, p => ['scholar', 'scientist', 'teacher'].includes(p.job))[0];
    if (s && has(cn(t), 'writing', 'paper')) {
      const topic = pick(['the tides', 'honest weights', 'why crops fail', 'the stars’ roads', 'the nature of debt', 'what makes a good law'], R(sim, 19));
      world.say(y, 'sage', 'treatise', `${name(sim, s)} of ${t.s.name} publishes a treatise on ${topic}`, pick(['Rivals call it obvious; copies are sold out.', 'It is already being quoted in the wrong places.', 'A short book, and a long argument.'], R(sim, 20)), {score: 60, town: t.s.id, who: s.id});
      ping(s, 1.5);
    }
  }
  // a new school of art or thought, sometimes spreading
  const live = world.movements.filter(m => !m.ended);
  if (live.length < 5 && R(sim, 21) < 0.16) {
    const t = at(22), f = folk(sim, t.s, p => ['performer', 'scholar', 'artisan', 'scientist'].includes(p.job))[0];
    if (f) {
      const kind = pick(Object.keys(KINDS), R(sim, 23)), nm = `${pick(SCHOOL_A, R(sim, 24))} ${pick(SCHOOL_B, R(sim, 25))}`;
      if (!world.movements.some(m => m.name === nm && !m.ended)) {
        world.movements.push({id: world.nextMove++, name: nm, kind, born: y, town: t.s.id, townName: t.s.name, country: t.s.country, founder: f.id, founderName: name(sim, f), reach: [t.s.id], ended: null});
        world.say(y, 'lantern', 'movement', `${nm}: ${KINDS[kind]} is born in ${t.s.name}`, `Founded by ${name(sim, f)}. Admirers call it overdue; critics call it a phase.`, {score: 74, town: t.s.id, who: f.id});
        ping(f, 2);
      }
    }
  }
  for (const m of world.movements) {
    if (m.ended) continue;
    if (R(sim, 26, m.id) < 0.15 && m.reach.length < 6) { // it spreads
      const t = list.find(x => !m.reach.includes(x.s.id) && R(sim, 27, m.id, x.s.id) < 0.4);
      if (t) { m.reach.push(t.s.id); world.say(y, 'lantern', 'movement', `${m.name} reaches ${t.s.name}`, `Now followed in ${m.reach.length} towns. It began in ${m.townName}.`, {score: 54, town: t.s.id}); }
    }
    if (y - m.born >= 12 && R(sim, 28, m.id) < 0.1) { m.ended = y; world.say(y, 'lantern', 'movement', `${m.name} fades after ${y - m.born} years`, `Its last follower in ${m.townName} has gone back to the old ways`, {score: 50, town: m.town}); }
  }
  // a trial of the year: a rich person is accused of something
  if (R(sim, 30) < 0.22) {
    const rich = [...sim.people.values()].filter(p => p.age >= 25 && (p.wealth ?? 0) > 60).sort((a, b) => (b.wealth ?? 0) - (a.wealth ?? 0)).slice(0, 12);
    const p = rich[Math.floor(R(sim, 31) * rich.length)], t = p && towns.get(p.settlement);
    if (p && t) {
      const crime = pick(['short-weight grain', 'bribing a judge', 'selling the same field twice', 'hiding a debt', 'a very public insult to the council'], R(sim, 32)), r = R(sim, 33);
      const verdict = r < 0.4 ? 'cleared of all charges' : r < 0.85 ? 'fined heavily' : 'driven out of the town';
      world.say(y, 'whisper', 'trial', `${name(sim, p)} of ${t.s.name} accused of ${crime}`, `Verdict: ${verdict}. ${pick(['The gallery was full.', 'The jury took one night.', 'Half the town has an opinion.'], R(sim, 34))}`, {score: 62, town: t.s.id, who: p.id});
      if (r >= 0.4) life.apply(sim, p, {df: -3, dw: -Math.round((p.wealth ?? 0) * (r < 0.85 ? 0.12 : 0.25))});
    }
  }
  // fashion
  if (R(sim, 35) < 0.3) {
    const t = at(36), [what, why] = pick(FASHION, R(sim, 37));
    world.say(y, 'whisper', 'fashion', `${t.s.name} cannot stop wearing ${what}`, `Blamed on ${why}. Spreading to the next town by spring.`, {score: 40, town: t.s.id});
  }
  // the oldest resident
  if (R(sim, 38) < 0.18) {
    const old = [...sim.people.values()].filter(p => p.age >= 80).sort((a, b) => b.age - a.age || a.id - b.id)[0];
    if (old && towns.get(old.settlement)) world.say(y, 'hearth', 'elder', `${name(sim, old)}, ${old.age}, is the oldest person in the world`, `Of ${towns.get(old.settlement).s.name}. Credits ${pick(['plain bread', 'stubbornness', 'a long walk every morning', 'never having been asked their opinion'], R(sim, 39))}.`, {score: 48, town: old.settlement, who: old.id});
  }
  // a prize every fifth year
  if (y % 5 === 0 && R(sim, 40) < 0.9) {
    const pool = world.works.filter(w => y - w.year < 10 && sim.people.has(w.by));
    const w = pool.sort((a, b) => b.year - a.year || a.id - b.id)[Math.floor(R(sim, 41) * pool.length)];
    if (w) { world.say(y, 'lantern', 'prize', `The Golden Quill goes to ${w.byName} for “${w.title}”`, `The fifth-year prize, last won in ${world.prizes.at(-1)?.year ?? 'living memory'}. Judges were unanimous, until they were not.`, {score: 78, town: w.town, who: w.by}); world.prizes.push({year: y, by: w.by, byName: w.byName, title: w.title}); ping(sim.people.get(w.by), 3); }
  }
  // a review of the decade
  if (y % 10 === 0 && y > 0) {
    const pop = [...sim.people.values()].length, then = world.census[world.census.length - 1];
    world.census.push([y, pop]);
    world.say(y, 'hearth', 'census', `Census: ${num(pop)} souls in the world${then ? `, ${pop >= then[1] ? 'up' : 'down'} ${Math.abs(Math.round((pop / then[1] - 1) * 100))}% in ten years` : ''}`, `${list.length} towns of any size. ${world.firms.size ? `${[...world.firms.values()].filter(f => f.alive).length} firms trade.` : ''}`, {score: 64});
  }
}
