// Careers: what a person can do with a season, depending on who they are (trade, age, wealth, country, health) and how
// good they have become. Also the person's own stats, which only the person you play has:
//   skill        how good you are at your trade (raises income, venture and contest odds)
//   knowledge    what you have learned (raises the chance of a breakthrough)
//   connections  who you know (helps in office and trade)
//   honor        what people think of your character (moved by the choices you make)
// A "focus" is what you do every season until you change it, so time can just keep running.
// Every outcome is a hash of (seed, year, season, person, purpose), never the simulation's random stream.
import {PAY} from './civic.js';
import {info} from './governments.js';
import {dice} from './life_seasons.js';

const money = n => Math.round(n).toLocaleString('en-US');
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const r1 = x => Math.round(x * 10) / 10;
const gain = (cur, amt) => amt * (1 - cur / 130); // the better you are, the slower you improve

export const STAT_LIMITS = {skill: [0, 100], knowledge: [0, 100], connections: [0, 100], honor: [-100, 100]};

/** Starting stats for somebody just taken up; `from` is a dead predecessor's stats (an heir keeps some of their contacts). */
export function newStats(p, from = null) {
  const age = p.age ?? 20, adult = age >= 18, job = p.job;
  const st = {
    skill: adult ? Math.min(75, Math.max(5, (age - 16) * 1.6)) : Math.min(20, age),
    knowledge: (job === 'scientist' || job === 'scholar' ? 35 : job === 'teacher' || job === 'healer' ? 25 : 12) + Math.min(25, age / 2),
    connections: Math.min(60, (p.fame ?? 0) * 0.5 + age / 4),
    honor: 0
  };
  if (from) { st.connections = clamp(st.connections + 0.5 * from.connections, 0, 100); st.knowledge = clamp(st.knowledge + 0.25 * from.knowledge, 0, 100); st.honor = from.honor * 0.5; }
  for (const k in st) st[k] = r1(st[k]);
  return st;
}
export function bump(st, d = {}) {
  for (const k in d) if (STAT_LIMITS[k] && d[k]) st[k] = r1(clamp((st[k] ?? 0) + d[k], ...STAT_LIMITS[k]));
}
export function honorWord(h) { return h >= 40 ? 'Beloved' : h >= 15 ? 'Honest' : h > -15 ? 'Unremarkable' : h > -40 ? 'Shady' : 'Notorious'; }

/** Health 0-100, from age, illness and wounds. */
export function health(sim, p) {
  const ill = p.infection != null, hurt = (p.wounded_until ?? 0) > sim.year;
  const value = Math.round(clamp(100 - Math.max(0, p.age - 45) * 1.1 - (ill ? 35 : 0) - (hurt ? 20 : 0), 3, 100));
  return {value, ill, hurt, word: ill ? `Ill with ${p.infection}` : hurt ? 'Wounded' : value >= 80 ? 'Strong' : value >= 55 ? 'Well' : value >= 30 ? 'Frail' : 'Failing'};
}

/** Everything a focus needs to know about the person and their moment. */
export function context(sim, life, p, season) {
  const pl = life.player, v = life.view(sim, p), c = sim.countries.get(v.country), h = health(sim, p);
  let war = false; for (const [pair] of sim.wars) if ([...pair].includes(v.country)) war = true;
  return {sim, life, p, v, c, season, u: dice(sim, season, p.id), st: pl.stats, flow: life.flow, war, ill: h.ill || h.hurt, pay: PAY.get(v.job) ?? 10, how: c ? info(c.government).get('succession') : '', plague: !!c?.sickness};
}
const income = (x, k = 1) => (x.pay / 4 * (0.6 + x.st.skill / 80) * (x.ill ? 0.4 : 1) + Math.min(20, 0.01 * x.v.wealth)) * k;
const stake = (x, share) => Math.min(x.v.wealth, Math.min(400, 2 + share * x.v.wealth));

const VERB = {farmer: 'worked your fields', laborer: 'put in honest labour', artisan: 'worked at your craft', merchant: 'kept your trade going', healer: 'saw your patients', teacher: 'taught your pupils',
  scientist: 'kept up your research', scholar: 'kept up your studies', performer: 'played for your living', soldier: 'kept your post', politician: 'attended to affairs'};

/** The focuses open to this person, each with {id, group, label, hint, enabled, why, run(x) -> effect}. Effect: {dw, df, d, insight, venture, text, wound}. */
export function focusSpecs(x) {
  const {v, p, st, u, c, war} = x, job = v.job, out = [];
  const add = (group, id, label, hint, run, ok = true, why = '') => out.push({group, id, label, hint, run, enabled: !!ok, why: ok ? '' : why});
  const adult = p.age >= 18, slow = x.ill ? ' Illness halves what you earn.' : '';
  if (!adult) {
    add('Growing up', 'school', 'Go to school', 'Learn what you can. Knowledge grows.', x => ({d: {knowledge: gain(x.st.knowledge, 2.5), skill: 0.4}, text: 'You spent the season at your lessons.'}));
    add('Growing up', 'apprentice', 'Learn a trade at home', 'Skill grows, a little pocket money.', x => ({dw: 0.5, d: {skill: gain(x.st.skill, 2)}, text: 'You helped out and learned the work.'}));
    return out;
  }
  // ---- your trade
  const T = 'Your trade';
  switch (job) {
    case 'farmer':
      add(T, 'harvest', 'Work the land hard', `Steady yields; better in a prosperous land.${slow}`, x => { const dw = income(x, 1.3); return {dw, d: {skill: gain(x.st.skill, 1.5)}, text: `You worked the land hard and brought in ${money(dw)}.`}; });
      add(T, 'market', 'Sell at market', 'Higher prices if you are known, but they swing.', x => { const dw = income(x, 0.8 + 1.4 * x.u(40)) * (1 + x.st.connections / 150); return {dw, d: {connections: 1}, text: `You took your produce to market and made ${money(dw)}.`}; });
      break;
    case 'laborer':
      add(T, 'shifts', 'Take extra shifts', `More pay for hard days.${slow}`, x => { const dw = income(x, 1.5); return {dw, d: {skill: gain(x.st.skill, 1)}, text: `You took every shift going and earned ${money(dw)}.`}; });
      add(T, 'guild', 'Organise with other workers', 'Contacts and a name among working people.', x => ({dw: -Math.min(x.v.wealth, 1), df: 0.8, d: {connections: gain(x.st.connections, 3), honor: 1}, text: 'You spent the season organising your fellow workers.'}));
      break;
    case 'artisan':
      add(T, 'masterwork', 'Labour on a masterwork', 'No pay now, but skill grows fast and a finished piece can make your name.', x => {
        const done = x.u(41) < Math.min(0.5, x.st.skill / 160), dw = done ? 25 + 60 * x.u(42) : 0;
        return {dw, df: done ? 6 : 0.2, d: {skill: gain(x.st.skill, 3)}, text: done ? `You finished a masterwork; a patron paid ${money(dw)} and it was admired across the town.` : 'You laboured on a masterwork. It is not finished yet.'};
      });
      add(T, 'commission', 'Take commissions', `Reliable paid work.${slow}`, x => { const dw = income(x, 1.4); return {dw, d: {skill: gain(x.st.skill, 1), connections: 0.5}, text: `You filled commissions and earned ${money(dw)}.`}; });
      break;
    case 'merchant':
      add(T, 'caravan', 'Send a caravan', 'Stake some savings on a long trade run. Skill and contacts help.', x => {
        const s = stake(x, 0.15), win = x.u(43) < clamp(0.55 + x.st.connections / 400 + x.st.skill / 600 + (x.c ? x.c.prosperity / 600 : 0), 0.2, 0.9), dw = win ? s * (0.5 + x.u(44)) : -s * (0.4 + 0.6 * x.u(44));
        return {dw, df: win ? 0.6 : 0, d: {connections: win ? 1.5 : 0, skill: 0.6}, venture: win && dw >= 15 ? Math.round(dw) : 0, text: win ? `Your caravan came home heavy and cleared ${money(dw)}.` : `Your caravan was lost on the road. You are out ${money(-dw)}.`};
      }, v.wealth >= 5, 'You have nothing to stake.');
      add(T, 'lend', 'Lend at interest', 'A steady return on your savings, and a name for hardness.', x => { const dw = Math.min(60, x.v.wealth * 0.012 * (0.5 + x.u(45))); return {dw, d: {honor: -0.8}, text: `Your loans earned ${money(dw)} in interest. Debtors do not love you.`}; }, v.wealth >= 20, 'You need savings to lend.');
      break;
    case 'healer':
      add(T, 'tend', 'Tend patients', `Respect and honest pay${c?.sickness ? '; people are sick, so you are needed' : ''}.${slow}`, x => { const dw = income(x, 1.1), df = 0.7 + (x.plague ? 1.5 : 0); return {dw, df, d: {skill: gain(x.st.skill, 1.2), honor: 1}, text: `You tended the sick and earned ${money(dw)} and some gratitude.`}; });
      add(T, 'remedies', 'Research remedies', 'Less income, more knowledge, and a chance of a real discovery.', x => { const found = x.u(46) < 0.015 + x.st.knowledge / 1500; return {dw: income(x, 0.5), df: found ? 4 : 0.3, d: {knowledge: gain(x.st.knowledge, 2.5) + (found ? 4 : 0), skill: 0.8}, insight: found, text: found ? 'After long trials you found a remedy that works.' : 'You tried new remedies and wrote down what failed.'}; });
      break;
    case 'teacher':
      add(T, 'teach', 'Teach pupils', `Pay, thanks and a growing circle.${slow}`, x => { const dw = income(x, 1.2); return {dw, df: 0.5, d: {connections: 1, knowledge: 0.5, skill: gain(x.st.skill, 0.8)}, text: `You taught your pupils and earned ${money(dw)}.`}; });
      add(T, 'textbook', 'Write a textbook', 'Slow work; a published one makes a name and some money.', x => { const done = x.u(47) < Math.min(0.4, x.st.knowledge / 250); return {dw: done ? 18 : 0, df: done ? 3 : 0.2, d: {knowledge: gain(x.st.knowledge, 2)}, text: done ? 'Your textbook was finished and schools began to use it.' : 'You worked on your textbook.'}; });
      break;
    case 'scientist':
      add(T, 'research', 'Pursue research', 'Little income, much learning, and a real chance of a breakthrough.', x => { const found = x.u(48) < 0.03 + x.st.knowledge / 1000; return {dw: income(x, 0.5), df: found ? 5 : 0.4, d: {knowledge: gain(x.st.knowledge, 3) + (found ? 5 : 0)}, insight: found, text: found ? 'You made a breakthrough. People will hear of it.' : 'You pushed your research a little further.'}; });
      add(T, 'advise', 'Advise the court', 'Paid, and you meet the powerful.', x => { const dw = income(x, 1.5); return {dw, df: 0.6, d: {connections: gain(x.st.connections, 2)}, text: `You advised those in power and earned ${money(dw)}.`}; }, !!c?.ruler, 'There is nobody to advise.');
      break;
    case 'scholar':
      add(T, 'treatise', 'Write a treatise', 'Slow, but a finished one makes your name.', x => { const done = x.u(49) < 0.12 + x.st.knowledge / 600; return {df: done ? 3.5 : 0.5, dw: done ? 10 : 0, d: {knowledge: gain(x.st.knowledge, 2)}, text: done ? 'You finished a treatise that scholars now quote.' : 'You made progress on your treatise.'}; });
      add(T, 'copy', 'Copy and trade manuscripts', `Reliable pay.${slow}`, x => { const dw = income(x, 1.3); return {dw, d: {knowledge: 0.8}, text: `You copied and sold manuscripts for ${money(dw)}.`}; });
      break;
    case 'performer':
      add(T, 'perform', 'Perform in town', 'Pay grows with your fame.', x => { const dw = x.pay / 4 * (0.6 + x.v.fame / 60) * (x.ill ? 0.4 : 1); return {dw, df: 0.8, d: {skill: gain(x.st.skill, 1)}, text: `You played to full houses and took ${money(dw)}.`}; });
      add(T, 'tour', 'Tour other towns', 'Costs a little; builds fame and contacts.', x => ({dw: -Math.min(x.v.wealth, 3) + income(x, 0.9), df: 1.5, d: {connections: gain(x.st.connections, 2)}, text: 'You toured the neighbouring towns and your name travelled with you.'}));
      break;
    case 'soldier':
      add(T, 'drill', 'Drill and train', 'Skill and discipline.', x => ({dw: income(x), df: 0.3, d: {skill: gain(x.st.skill, 2.5)}, text: 'You drilled with your company all season.'}));
      if (war) add(T, 'front', 'Serve at the front', 'Great renown and better pay, with some risk of a wound.', x => {
        const hurt = x.flow && x.u(50) < 0.12; if (hurt) x.p.wounded_until = x.sim.year + 1;
        return {dw: income(x, 1.5), df: 1.5, d: {skill: gain(x.st.skill, 2), honor: 1}, text: hurt ? 'You fought at the front and were wounded.' : 'You fought at the front and came through.'};
      });
      else add(T, 'guard', 'Stand guard duty', 'Quiet, steady pay and some local contacts.', x => { const dw = income(x, 1.2); return {dw, d: {honor: 0.3, connections: 0.8}, text: `You stood guard and earned ${money(dw)}.`}; });
      break;
    case 'politician': {
      const how = x.how, label = how === 'election' ? 'Campaign for votes' : how === 'hereditary' ? "Win the court's favour" : 'Win the strongmen’s favour';
      add(T, 'campaign', label, 'Costs a little. Builds support and a name.', x => ({dw: -Math.min(x.v.wealth, 3), df: 1, d: {connections: gain(x.st.connections, 3)}, text: how === 'election' ? 'You spent the season winning votes.' : 'You spent the season winning friends in high places.'}));
      add(T, 'patronage', 'Hand out favours', 'Buy loyalty with money; people notice where it came from.', x => ({dw: -Math.min(x.v.wealth, 6), df: 0.5, d: {connections: gain(x.st.connections, 4), honor: -1.5}, text: 'You handed out favours and bought a great deal of loyalty.'}), v.wealth >= 6, 'You cannot afford favours.');
      break;
    }
  }
  // ---- your office: rulers and office holders have duties that nobody else has
  if (v.role && v.role !== 'royal family') {
    const ruler = c?.ruler === p.id;
    add('Your office', 'govern', ruler ? `Rule as ${v.role}` : `Carry out the duties of ${v.role}`, ruler ? 'Hold court and govern: a name, contacts and a share of the treasury.' : 'Official work: pay, standing and contacts.', x => {
      const dw = ruler ? Math.min(60, 4 + (x.c?.treasury ?? 0) * 0.002) : income(x, 1.4);
      return {dw, df: ruler ? 0.4 : 0.6, d: {connections: gain(x.st.connections, 2), honor: ruler ? 0 : 0.3}, text: ruler ? `You held court and governed, drawing ${money(dw)} from the treasury.` : `You carried out the duties of ${x.v.role} and were paid ${money(dw)}.`};
    });
  }
  // ---- anyone
  const A = 'Anyone';
  add(A, 'work', 'Work steadily', `A modest, safe income.${slow}`, x => { const dw = income(x); return {dw, d: {skill: gain(x.st.skill, 1.2)}, text: `You ${VERB[x.v.job] ?? 'worked'} and put aside ${money(dw)}.${x.ill ? ' Illness slowed you.' : ''}`}; });
  add(A, 'study', 'Study and practise', 'Knowledge grows; a rare breakthrough is possible.', x => {
    const insight = x.u(5) < (['scientist', 'scholar'].includes(x.v.job) ? 0.02 : 0.005) + x.st.knowledge / 4000;
    return {df: 0.2 + x.u(6) * 0.6 + (insight ? 4 : 0), d: {knowledge: gain(x.st.knowledge, 1.5) + (insight ? 4 : 0), skill: 0.4}, insight, text: insight ? 'You studied hard and made a real breakthrough. People noticed.' : 'You spent the season studying and practising.'};
  });
  add(A, 'network', 'Cultivate contacts', 'Costs a little; builds your network.', x => ({dw: -Math.min(x.v.wealth, 2), df: 0.3, d: {connections: gain(x.st.connections, 2.2)}, text: 'You spent the season making and keeping friends.'}));
  add(A, 'trade', 'Trading venture', 'Stake some savings: a fair chance to profit, and a loss costs you.', x => {
    const base = Math.min(400, 2 + 0.05 * x.v.wealth), win = x.u(3) < clamp(0.5 + (x.v.job === 'merchant' ? 0.1 : 0) + (x.c ? x.c.prosperity / 400 : 0) + x.st.skill / 700 + x.st.connections / 900, 0.15, 0.9);
    const dw = win ? base * (1 + x.u(4)) : -Math.min(x.v.wealth * 0.5, base * 0.8 * x.u(4));
    return {dw, d: {skill: 0.3}, venture: win && dw >= 15 ? Math.round(dw) : 0, text: dw >= 0 ? `A trading venture paid off: you made ${money(dw)}.` : `A trading venture went badly: you lost ${money(-dw)}.`};
  }, v.wealth >= 2, 'You have nothing to stake.');
  if (x.ill) add(A, 'rest', 'Rest and recover', 'Keep to your bed and let the illness pass.', () => ({text: 'You rested and kept your strength.'}));
  // ---- your situation
  const S = 'Your situation';
  if (v.wealth >= 120) {
    add(S, 'invest', 'Invest your fortune', 'A return on your wealth, with some risk.', x => { const bad = x.u(51) < 0.2, dw = bad ? -x.v.wealth * 0.03 : x.v.wealth * (0.01 + 0.04 * x.u(52)); return {dw: Math.max(dw, -x.v.wealth), text: bad ? `Your investments soured and cost you ${money(-dw)}.` : `Your investments returned ${money(dw)}.`}; });
    add(S, 'patron', 'Patronise the arts and learning', 'Costs money; wins you fame and a good name.', x => { const cost = Math.min(x.v.wealth * 0.05, 60); return {dw: -cost, df: 2.5, d: {honor: 1.5, connections: gain(x.st.connections, 1.5)}, text: `You gave ${money(cost)} to artists and scholars and were toasted for it.`}; });
  }
  if (p.age >= 60) {
    add(S, 'mentor', 'Mentor the young', 'Passing it on: small pay, a good name and a wide circle.', x => ({dw: income(x, 0.6), df: 0.6, d: {connections: gain(x.st.connections, 1.5), honor: 0.5}, text: 'You spent the season teaching the young what you know.'}));
    add(S, 'retire', 'Retire and rest', 'Live off your savings and stop striving.', x => ({dw: x.v.wealth * 0.004, text: 'You rested, tended your garden and lived off your savings.'}));
  }
  return out;
}

/** The focus a person follows if nobody has chosen one. */
export const defaultFocus = p => (p.age < 18 ? 'school' : 'work');

/** Live one season of a focus (or the fallback if it is no longer open). Returns the line for the journal. */
export function runFocus(x, id) {
  const specs = focusSpecs(x);
  const spec = specs.find(f => f.id === id && f.enabled) ?? specs.find(f => f.id === defaultFocus(x.p) && f.enabled) ?? specs[0];
  const e = spec.run(x);
  x.life.apply(x.sim, x.p, {dw: e.dw, df: e.df, venture: e.venture, insight: e.insight});
  bump(x.st, e.d);
  return e.text;
}
