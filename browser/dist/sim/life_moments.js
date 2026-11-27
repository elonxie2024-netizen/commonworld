// Moments from an ordinary life: nine more pop-ups that have nothing to do with the world's wars and plagues. A purse
// left to you, a theft, a festival, someone asking to learn from you, a friend in need, a rumour, a commission, a
// courtship, a bribe. They are rarer than the big ones, each has its own cooldown, and several depend on who you are:
// your trade, your honor, your friends. Outcomes use the same hash dice as everything else in the life layer.
import {mods, gainTrait, hasTrait} from './life_traits.js';
import {addBond, MAX_BONDS} from './life_depth.js';

const money = n => Math.round(n).toLocaleString('en-US');
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const opt = (id, label, hint, enabled = true, why = '') => ({id, label, hint, enabled, why: enabled ? '' : why, needsFlow: false});
const spend = (v, n) => Math.min(v.wealth, n);

export const COOLDOWN = {windfall: 6, thieves: 5, festival: 3, apprentice: 6, friend: 3, scandal: 6, commission: 4, courtship: 4, bribe: 5};
/** How a choice changes who you are (merged into life_events' table). */
export const EFFECT = {
  'windfall/share': {honor: 3, connections: 1}, 'windfall/invest': {skill: 0.3},
  'thieves/pursue': {connections: 0.5}, 'thieves/guard': {},
  'festival/host': {connections: 2.5, honor: 1}, 'festival/join': {connections: 1}, 'festival/headline': {skill: 1.5, connections: 1.5}, 'festival/work': {honor: -0.5},
  'apprentice/take': {honor: 2}, 'apprentice/recommend': {honor: 1, connections: 1},
  'friend/help': {honor: 2, connections: 1}, 'friend/refuse': {honor: -2}, 'friend/lend': {honor: 3, connections: 2},
  'scandal/confront': {honor: 1}, 'scandal/ignore': {}, 'scandal/counter': {honor: -3, connections: 1.5},
  'commission/accept': {skill: 1.2, connections: 0.5}, 'commission/negotiate': {connections: 0.5},
  'courtship/return': {connections: 1}, 'courtship/propose': {connections: 1},
  'bribe/take': {honor: -5}, 'bribe/refuse': {honor: 3}, 'bribe/report': {honor: 4, connections: -1}
};
export const STYLE = {windfall: ['coins', '#16a34a'], thieves: ['hammer', '#64748b'], festival: ['star', '#f59e0b'], apprentice: ['user', '#0d9488'], friend: ['users', '#3b82f6'], scandal: ['list', '#be123c'], commission: ['hammer', '#b45309'], courtship: ['star', '#ec4899'], bribe: ['coins', '#7c3aed']};

const folk = (x, ok) => [...x.sim.people.values()].filter(q => q.id !== x.p.id && q.settlement === x.v.settlement && ok(q)).sort((a, b) => a.id - b.id);
const pick = (list, r) => list[Math.floor(r * list.length)];
/** Whether this moment turns up this season (always when forced, for tests). */
const roll = (x, force, salt, chance) => force || x.u(salt) < chance;
const bonded = (x, kinds) => (x.life.player.bonds ?? []).filter(b => kinds.includes(b.kind) && x.sim.people.has(b.id));
const nm = (x, id) => x.sim.full_name(x.sim.people.get(id) ?? x.sim.archive.get(id));

export const BUILD = {
  windfall(x, force) {
    if (x.p.age < 18 || !roll(x, force, 70, 0.02)) return null;
    const amt = Math.round(10 + x.u(71) * 20 + Math.min(40, x.v.wealth * 0.05));
    return {
      title: 'A windfall', text: `A distant relative has died and left you ${money(amt)}. Nobody expected it, and nobody is watching what you do with it.`,
      options: [opt('keep', 'Keep it', 'Put it by.'), opt('share', 'Share half with your neighbours', 'Less for you, and a name for generosity.'), opt('invest', 'Stake it on a venture', 'Nearly double it, or lose most of it.')],
      data: {amt}
    };
  },
  thieves(x, force) {
    if (x.p.age < 18 || (x.v.wealth < 20 && !force) || !roll(x, force, 72, 0.018)) return null;
    const loss = Math.round(Math.min(40, 4 + x.v.wealth * 0.18));
    return {
      title: 'Thieves in the night', text: `Someone broke in while you slept and took ${money(loss)}. The door is still swinging.`,
      options: [opt('pursue', 'Hunt them down', 'You may get it back, and a name for toughness.'), opt('accept', 'Accept the loss', 'Money is only money.'), opt('guard', 'Hire a watchman (6)', 'Never again.', x.v.wealth >= 6, 'You cannot afford it.')],
      data: {loss}
    };
  },
  festival(x, force) {
    if (x.p.age < 14 || !roll(x, force, 73, 0.03)) return null;
    const cost = Math.round(Math.min(14, 2 + x.v.wealth * 0.08));
    return {
      title: `A festival in ${x.here?.name ?? 'town'}`, text: 'The whole town is celebrating. Everyone who matters will be there.',
      options: [
        opt('host', `Host a feast (${money(cost)})`, 'Fame, contacts and a lighter purse.', x.v.wealth >= cost, 'You cannot afford it.'),
        ...(x.v.job === 'performer' ? [opt('headline', 'Headline the evening', 'Your moment: fame, a fee and new admirers.')] : []),
        opt('join', 'Join the revels', 'Meet a few people and have a good time.'), opt('work', 'Work through it', 'Everyone else is busy; you earn a little.')
      ],
      data: {cost}
    };
  },
  apprentice(x, force) {
    if (x.p.age < 28 || (x.st.skill < 35 && !force) || !roll(x, force, 74, 0.02)) return null;
    const pool = folk(x, q => q.age >= 12 && q.age <= 22); if (!pool.length) return null;
    const q = pick(pool, x.u(75)), room = x.life.player.bonds.length < MAX_BONDS || x.life.player.bonds.some(b => b.id === q.id);
    return {
      title: 'Someone wants to learn from you', text: `${x.sim.full_name(q)}, a young person in ${x.here?.name ?? 'town'}, has asked you to take them on and teach them your trade.`,
      options: [opt('take', 'Take them on (3)', 'A mentee: they will credit you for years.', room && x.v.wealth >= 3, room ? 'You cannot afford it.' : 'You cannot keep up with any more people.'), opt('refuse', 'Politely refuse', 'You have your own work.'), opt('recommend', 'Recommend another master', 'Kind, and costs nothing.')],
      data: {who: q.id}
    };
  },
  friend(x, force) {
    const fr = bonded(x, ['friend', 'spouse']).filter(b => b.close >= 30 || force); if (!fr.length || !roll(x, force, 76, 0.04)) return null;
    const b = pick(fr, x.u(77)), cost = Math.round(Math.min(14, 3 + x.v.wealth * 0.1));
    return {
      title: `${nm(x, b.id)} needs help`, text: `${nm(x, b.id)} has come to you in some trouble and would be grateful for your help.`,
      options: [opt('help', `Help (${money(cost)})`, 'Your friendship grows.', x.v.wealth >= cost, 'You cannot afford it.'), opt('lend', `Lend a great deal (${money(cost * 3)})`, 'Friends for life, if they can repay you.', x.v.wealth >= cost * 3, 'You cannot afford it.'), opt('refuse', 'Refuse', 'They will remember it.')],
      data: {who: b.id, cost}
    };
  },
  scandal(x, force) {
    if (x.p.age < 18 || (x.v.fame < 5 && !force) || !roll(x, force, 78, 0.015 + (x.st.honor < 0 ? 0.03 : 0))) return null;
    return {
      title: 'A rumour', text: x.st.honor < 0 ? 'People are saying things about you that are not entirely untrue.' : 'A rumour about you has gone round the town. It is not true, but it is spreading.',
      options: [opt('confront', 'Confront it openly', 'Honesty usually wins, but not always.'), opt('ignore', 'Ignore it', 'Rumours fade.'), opt('counter', 'Spread a worse one about whoever started it', 'Effective, and ugly.')],
      data: {}
    };
  },
  commission(x, force) {
    if (x.p.age < 18 || !roll(x, force, 79, 0.03)) return null;
    const offer = Math.round(10 + x.st.skill * 0.15 + x.v.fame * 0.1);
    return {
      title: 'A commission', text: `A wealthy patron has heard of your work as a ${x.v.job} and offers ${money(offer)} for a piece of it.`,
      options: [opt('accept', 'Accept', 'Good money, and a patron to remember.'), opt('negotiate', 'Name a higher price', 'Risky: they may walk away.'), opt('decline', 'Decline', 'You have other plans.')],
      data: {offer}
    };
  },
  courtship(x, force) {
    const pl = x.life.player;
    if (x.p.age < 18 || x.p.age > 55 || bonded(x, ['spouse']).length || !roll(x, force, 80, 0.035)) return null;
    const have = new Set(pl.bonds.map(b => b.id)), pool = folk(x, q => q.age >= 18 && q.age <= 60 && !have.has(q.id)); if (!pool.length || pl.bonds.length >= MAX_BONDS) return null;
    const q = pick(pool, x.u(81));
    return {
      title: `${x.sim.full_name(q)} has noticed you`, text: `${x.sim.full_name(q)}, a ${x.life.view(x.sim, q).job} in ${x.here?.name ?? 'town'}, has been seeking out your company.`,
      options: [opt('propose', 'Court them seriously (5)', 'A good chance of marriage.', x.v.wealth >= 5, 'You cannot afford it.'), opt('return', 'Return the interest', 'Become close friends and see where it goes.'), opt('decline', 'Gently decline', 'You have other things to think about.')],
      data: {who: q.id}
    };
  },
  bribe(x, force) {
    if (x.p.age < 20 || !(x.v.job === 'politician' || x.v.role || force) || !roll(x, force, 82, 0.03)) return null;
    const amt = Math.round(14 + x.v.fame * 0.4);
    return {
      title: 'An offer you should refuse', text: `A merchant has quietly offered you ${money(amt)} to look the other way on a matter that is within your power to settle.`,
      options: [opt('take', 'Take the money', 'Easy money, and a stain.'), opt('refuse', 'Refuse', 'Your honor is noted.'), opt('report', 'Report it', 'Make an example of them. Not everyone will thank you.')],
      data: {amt}
    };
  }
};

const rivalFor = x => { const pool = folk(x, q => q.age >= 18 && x.life.view(x.sim, q).job === x.v.job && !x.life.player.bonds.some(b => b.id === q.id)); return pool.length ? pick(pool, x.u(90)) : null; };

export const RESOLVE = {
  windfall(x, id, d) {
    const {life, sim, p} = x;
    if (id === 'share') { life.apply(sim, p, {dw: d.amt / 2, df: 2.5}); return {text: `You shared half of the ${money(d.amt)} with your neighbours and kept the rest.`, tag: 'Shared an unexpected inheritance with the neighbours.'}; }
    if (id === 'invest') {
      const win = x.u(73) < clamp(0.5 + mods(life.player).luck + x.st.skill / 600, 0.2, 0.85);
      life.apply(sim, p, {dw: win ? d.amt * 1.8 : d.amt * 0.3}); return {text: win ? `You staked the money on a venture and came out with ${money(d.amt * 1.8)}.` : `Your venture went wrong and you were left with ${money(d.amt * 0.3)} of the ${money(d.amt)}.`, tag: ''};
    }
    life.apply(sim, p, {dw: d.amt}); return {text: `You put the ${money(d.amt)} by.`, tag: ''};
  },
  thieves(x, id, d) {
    const {life, sim, p, v} = x;
    if (id === 'guard') { life.apply(sim, p, {dw: -spend(v, 6)}); gainTrait(life.player, 'wary'); return {text: 'You paid a watchman. Nobody will take from you twice.', tag: ''}; }
    if (id === 'pursue') {
      const win = x.u(74) < clamp(0.45 + x.st.connections / 300 + mods(life.player).luck, 0.2, 0.85);
      if (win) { life.apply(sim, p, {df: 1.2}); return {text: 'You tracked the thief down with the help of your neighbours and got everything back.', tag: ''}; }
      life.apply(sim, p, {dw: -(d.loss + spend(v, 2))}); return {text: `You chased them for days and found nothing, and the ${money(d.loss)} is gone.`, tag: ''};
    }
    life.apply(sim, p, {dw: -d.loss}); return {text: `You shrugged and let the ${money(d.loss)} go.`, tag: ''};
  },
  festival(x, id, d) {
    const {life, sim, p, v} = x, m = mods(life.player);
    if (id === 'host') { life.apply(sim, p, {dw: -d.cost, df: 3 * (1 + m.fame)}); return {text: `You hosted a feast that people talked about for weeks. It cost ${money(d.cost)}.`, tag: 'Hosted a feast for the whole town.'}; }
    if (id === 'headline') { const dw = 6 + x.u(75) * 8; life.apply(sim, p, {dw, df: 4.5 * (1 + m.fame)}); return {text: `You headlined the festival and were paid ${money(dw)}. The crowd would not let you go.`, tag: 'Headlined a festival.'}; }
    if (id === 'work') { life.apply(sim, p, {dw: 2 + x.u(76) * 2}); return {text: 'You worked while the town celebrated and earned a little extra.', tag: ''}; }
    life.apply(sim, p, {df: 0.4}); return {text: 'You joined the revels and met a good many people.', tag: ''};
  },
  apprentice(x, id, d) {
    const {life, sim, p, v} = x;
    if (id === 'take') { life.apply(sim, p, {dw: -spend(v, 3)}); addBond(sim, life.player, d.who, 'mentee', 45); return {text: `You took ${sim.full_name(sim.people.get(d.who) ?? sim.archive.get(d.who))} on as an apprentice.`, tag: 'Took on an apprentice.'}; }
    if (id === 'recommend') { life.apply(sim, p, {df: 0.5}); return {text: 'You recommended another master. They were grateful.', tag: ''}; }
    return {text: 'You turned the request down politely.', tag: ''};
  },
  friend(x, id, d) {
    const {life, sim, p, v} = x, b = life.player.bonds.find(q => q.id === d.who), name = nm(x, d.who);
    if (id === 'refuse') { if (b) b.close = clamp(b.close - 15, 0, 100); return {text: `You turned ${name} away. They did not say a word.`, tag: ''}; }
    const pay = id === 'lend' ? d.cost * 3 : d.cost, back = id === 'lend' && x.u(77) < 0.5;
    life.apply(sim, p, {dw: back ? pay * 0.4 : -spend(v, pay), df: id === 'lend' ? 1.5 : 0.5});
    if (b) b.close = clamp(b.close + (id === 'lend' ? 30 : 15), 0, 100);
    return {text: id === 'lend' ? `You lent ${name} ${money(pay)}.${back ? ' They repaid it in full, with interest.' : ' You doubt you will see it again, but they are a friend for life.'}` : `You helped ${name} through it. It cost ${money(pay)}.`, tag: ''};
  },
  scandal(x, id) {
    const {life, sim, p, st} = x, m = mods(life.player), rival = rivalFor(x);
    if (id === 'confront') {
      const win = x.u(78) < clamp(0.5 + st.honor / 200 + m.luck, 0.2, 0.85);
      if (win) { life.apply(sim, p, {df: 1}); return {text: 'You faced it out, and the rumour died.', tag: ''}; }
      life.apply(sim, p, {df: -3}); if (rival) addBond(sim, life.player, rival.id, 'rival', 35);
      return {text: `You faced it out, but mud sticks.${rival ? ` You suspect ${sim.full_name(rival)}.` : ''}`, tag: ''};
    }
    if (id === 'counter') {
      const win = x.u(79) < clamp(0.45 + st.connections / 300 + m.luck, 0.2, 0.85);
      life.apply(sim, p, {df: win ? 0 : -3}); gainTrait(life.player, 'schemer'); if (rival) addBond(sim, life.player, rival.id, 'rival', 50);
      return {text: win ? 'You spread a worse tale about whoever started it. It worked. People are a little afraid of you.' : 'You tried to answer in kind and it backfired badly.', tag: ''};
    }
    life.apply(sim, p, {df: st.honor < 0 ? -2 : -0.5}); return {text: 'You ignored the rumour. For a while it followed you, then it faded.', tag: ''};
  },
  commission(x, id, d) {
    const {life, sim, p} = x, m = mods(life.player);
    if (id === 'decline') return {text: 'You told the patron you had other plans.', tag: ''};
    if (id === 'negotiate') {
      const win = x.u(80) < clamp(0.4 + x.st.connections / 300 + x.st.skill / 400 + m.luck, 0.15, 0.85);
      if (!win) { life.apply(sim, p, {df: -0.5}); return {text: 'You named too high a price, and the patron went elsewhere.', tag: ''}; }
      const dw = d.offer * 1.8; life.apply(sim, p, {dw: dw * (1 + m.income), df: 1.5}); return {text: `You held out for more and got it: ${money(dw)}.`, tag: ''};
    }
    life.apply(sim, p, {dw: d.offer * (1 + m.income), df: 1}); return {text: `You took the commission and were paid ${money(d.offer)}. The patron was pleased.`, tag: ''};
  },
  courtship(x, id, d) {
    const {life, sim, p, v} = x, name = nm(x, d.who), m = mods(life.player);
    if (id === 'decline') return {text: `You told ${name} you were flattered, but no.`, tag: ''};
    if (id === 'return') { addBond(sim, life.player, d.who, 'friend', 62); return {text: `You and ${name} grew close.`, tag: ''}; }
    life.apply(sim, p, {dw: -spend(v, 5)});
    if (x.u(81) < clamp(0.5 + m.social * 0.3 + x.v.fame / 300 + x.st.honor / 400, 0.25, 0.9)) {
      addBond(sim, life.player, d.who, 'spouse', 75); gainTrait(life.player, 'spouse');
      return {text: `You courted ${name} and they said yes. You are married.`, tag: `Married ${name}.`};
    }
    addBond(sim, life.player, d.who, 'friend', 40); return {text: `${name} liked you, but was not ready for more. You are friends.`, tag: ''};
  },
  bribe(x, id, d) {
    const {life, sim, p} = x;
    if (id === 'take') { life.apply(sim, p, {dw: d.amt, df: -1}); gainTrait(life.player, 'schemer'); return {text: `You took the ${money(d.amt)} and looked the other way.`, tag: ''}; }
    if (id === 'report') { life.apply(sim, p, {df: 2}); const r = rivalFor(x); if (r && x.u(83) < 0.4) addBond(sim, life.player, r.id, 'rival', 40); return {text: 'You reported the offer and had the merchant made an example of. People noticed.', tag: 'Reported a bribe.'}; }
    life.apply(sim, p, {df: 0.5}); return {text: 'You refused the money and word of it got round.', tag: ''};
  }
};
