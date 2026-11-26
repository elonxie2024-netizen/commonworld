// Life choices: a pop-up that interrupts the person you play when something big in the world reaches them.
// Six kinds, one at most per season, each with a cooldown so the same trouble does not nag:
//   war       the country has gone to war and levies are being raised
//   plague    a sickness is loose in your town
//   famine    the country is going hungry
//   settlers  a party is about to leave your town
//   office    an office in your trade is vacant or its holder is old
//   rival     someone in your trade makes you an offer
// Every outcome is a hash of (seed, year, season, person, purpose), never the simulation's random stream. Effects that
// only touch the person's own story (money, fame, job, home, office) work with "people shape the world" off; effects on
// the real world (catching a disease, being wounded, joining a settler party) need it on, and say so.
import {OFFICES} from './civic.js';
import {dice, DISPLACES} from './life_seasons.js';
import {towns, liveChoice} from './life_player.js';
import {bump} from './life_careers.js';
import {_infect} from './edit_commands.js';

export const COOLDOWN = {war: 4, plague: 3, famine: 3, settlers: 2, office: 3, rival: 5};
export const KINDS = Object.keys(COOLDOWN);
const money = n => Math.round(n).toLocaleString('en-US');
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const NEEDS_FLOW = 'Needs “People shape the world” switched on.';

function context(sim, life, p, season) {
  const v = life.view(sim, p), c = sim.countries.get(v.country);
  return {sim, life, p, v, c, season, u: dice(sim, season, p.id), flow: life.flow, here: sim.settlements.get(v.settlement), st: life.player?.stats ?? {skill: 0, knowledge: 0, connections: 0, honor: 0}};
}

/** The pop-up for this person this season, or null. `force` names a kind to build regardless of cooldown and chance (tests). */
export function detect(sim, life, p, season, force = null) {
  const pl = life.player; if (!pl || (p.age < 18 && !force)) return null;
  const x = context(sim, life, p, season); if (!x.c) return null;
  for (const kind of KINDS) {
    if (force && force !== kind) continue;
    if (!force && sim.year - (pl.last?.[kind] ?? -99) < COOLDOWN[kind]) continue;
    const ev = BUILD[kind](x, !!force);
    if (ev) return {kind, year: sim.year, season, ...ev};
  }
  return null;
}

// ---- building each pop-up: { title, text, options: [{id, label, hint, enabled, why}], data }
// needsFlow: the option changes the real world, so it is only open while "People shape the world" is on (checked live, see liveChoice).
const opt = (id, label, hint, enabled = true, why = '', needsFlow = false) => ({id, label, hint, enabled, why: enabled ? '' : why, needsFlow});

const BUILD = {
  war({sim, v, c, p, st}) {
    const enemies = [], warring = new Set();
    for (const [pair] of sim.wars) { const ids = [...pair]; if (ids.includes(v.country)) { const o = ids.find(i => i !== v.country); enemies.push(sim.countries.get(o)?.name ?? 'a rival'); warring.add(o); } }
    if (!enemies.length) return null;
    const cost = Math.min(40, Math.round(v.wealth * 0.2)), away = towns(sim, null, p, 30, v).find(t => !t.home && !warring.has(t.country));
    return {
      title: `War with ${enemies[0]}`,
      text: `${c.name} is at war with ${enemies.join(' and ')}. Levies are being raised in ${sim.settlements.get(v.settlement)?.name ?? 'your town'}. What will you do?`,
      options: [
        opt('volunteer', 'Volunteer to fight', 'Glory and a name, but you may be wounded.', p.age <= 55, 'You are too old to be taken.'),
        opt('exempt', `Pay for an exemption (${money(cost)})`, 'Stay home and keep your life unchanged.', v.wealth >= 5, 'You cannot afford it.'),
        opt('flee', away ? `Flee to ${away.name}` : 'Flee abroad', away ? `Leave for ${away.countryName}, out of the war's reach.` : '', !!away, 'There is nowhere safe to go.'),
        opt('supply', 'Supply the army', 'A risky wartime trade: great profit or ruin.', v.wealth >= 10, 'You have too little to stake.'),
        ...(v.job === 'healer' ? [opt('medic', 'Serve as a field medic', 'Tend the wounded: pay, respect and little danger.')] : []),
        ...(v.job === 'soldier' ? [opt('command', 'Take a command', 'Lead men in the field: great renown, real danger.', st.skill >= 35 && p.age <= 55, p.age > 55 ? 'You are too old to lead in the field.' : 'You need more experience (skill 35).')] : []),
        ...(v.job === 'politician' ? [opt('speech', 'Rally the people', 'A speech for the cause: contacts and a name.')] : [])
      ],
      data: {away: away?.id ?? null, cost}
    };
  },

  plague({sim, v, c, p, st}) {
    if (!c.sickness || p.infection) return null;
    const sickBy = new Map();
    for (const q of sim.people.values()) if (q.infection) sickBy.set(q.settlement, (sickBy.get(q.settlement) ?? 0) + 1);
    const sick = sickBy.get(v.settlement) ?? 0;
    if (sick < 3) return null;
    const safe = towns(sim, null, p, 30, v).find(t => t.home && (sickBy.get(t.id) ?? 0) < sick / 2);
    return {
      title: `${c.sickness} in ${sim.settlements.get(v.settlement)?.name}`,
      text: `${c.sickness} is spreading through your town: ${sick} people are ill. Neighbours are shutting their doors.`,
      options: [
        opt('tend', 'Tend the sick', 'You earn respect, and may catch it yourself.'),
        opt('flee', safe ? `Flee to ${safe.name}` : 'Flee to a healthier town', safe ? 'A quieter town in your country.' : '', !!safe, 'Every nearby town is as bad.'),
        opt('stay', 'Stay home and keep your distance', 'Nothing gained, little risked.'),
        opt('sell', 'Sell remedies', 'Profit from fear, at some cost to your name.'),
        ...(v.job === 'healer' ? [opt('cure', 'Treat the sick as a healer', 'Your skill saves lives: great respect, lower risk than anyone else.')] : []),
        ...(v.job === 'scientist' || v.job === 'scholar' ? [opt('study', 'Study the sickness', 'Learn from it: knowledge and perhaps a discovery.')] : [])
      ],
      data: {disease: c.sickness, safe: safe?.id ?? null}
    };
  },

  famine({sim, v, c}) {
    if (!c.conditions.has('Famine')) return null;
    const near = towns(sim, null, null, 20, v).find(t => t.home);
    return {
      title: `Famine in ${c.name}`,
      text: `The harvests have failed across ${c.name}. Bread is dear and people are hungry. What do you do with what you have?`,
      options: [
        opt('share', 'Share your savings', `Costs about ${money(Math.min(30, 0.15 * v.wealth))}; earns you love.`, v.wealth >= 5, 'You have too little to share.'),
        opt('hoard', 'Hoard what you have', 'Keep your savings, lose some goodwill.'),
        opt('migrate', near ? `Move to ${near.name}` : 'Move to another town', near ? 'Look for food elsewhere in your country.' : '', !!near, 'There is nowhere else to go.'),
        opt('speculate', 'Speculate on grain', `Stake about ${money(Math.min(400, 2 + 0.05 * v.wealth))}: buy low, sell high, and hope.`, v.wealth >= 10, 'You have too little to stake.'),
        ...(v.job === 'farmer' ? [opt('granary', 'Open your stores at a fair price', 'Sell grain cheaply: a little money, much honor.')] : []),
        ...(v.job === 'politician' ? [opt('relief', 'Organise relief', 'Costs a little; wins contacts and a name.')] : [])
      ],
      data: {near: near?.id ?? null}
    };
  },

  settlers({sim, v, p}) {
    const exp = (sim.expeditions ?? []).find(e => e.get('origin') === v.settlement && !e.get('people').includes(p.id) && !p.expedition);
    if (!exp) return null;
    const kind = exp.get('kind'), n = exp.get('people').length, town = sim.settlements.get(v.settlement)?.name;
    return {
      title: `Settlers leave ${town}`,
      text: `A party of ${n} is preparing to leave ${town}${kind === 'found' ? ' to found a new town' : ' to settle elsewhere'}. They are still looking for people willing to go.`,
      options: [
        opt('join', 'Join the settlers', 'You leave with them and live where they settle.', p.age < 60, 'You are too old for the road.', true),
        opt('lead', 'Lead them', 'If they found a town, you will have founded it.', kind === 'found' && v.fame >= 25, kind === 'found' ? 'You are not known enough to lead (fame 25).' : 'They are not founding a new town.', true),
        opt('fund', 'Fund the expedition', `Costs about ${money(Math.min(60, 0.2 * v.wealth))}; earns you gratitude.`, v.wealth >= 10, 'You have too little to give.'),
        opt('stay', 'Wish them well and stay', '')
      ],
      data: {exp: exp.get('id')}
    };
  },

  office({sim, life, v, c, p, st}) {
    if (p.age < 18 || v.role) return null;
    const adults = [...sim.people.values()].filter(q => q.country === v.country && q.age >= 18).length;
    if (adults < 30) return null;
    for (const [title, job] of OFFICES) {
      if (job !== v.job) continue;
      const holder = sim.people.get(c.offices.get(title)), hv = holder ? life.view(sim, holder) : null;
      if (holder && holder.age < 65) continue;
      const chance = hv ? clamp(0.25 + (v.fame - hv.fame) / 100 + st.connections / 400, 0.05, 0.9) : clamp(0.45 + v.fame / 200 + st.connections / 400, 0.1, 0.95);
      return {
        title: hv ? `${title} grows old` : `The office of ${title} is vacant`,
        text: hv ? `${sim.full_name(holder)}, ${title} of ${c.name}, is ${holder.age} and failing. People are already talking about a successor, and you work in the same trade.` : `${c.name} has no ${title}, and you are a ${v.job}. Your name has been mentioned.`,
        options: [
          opt('stand', `Put yourself forward (about ${Math.round(chance * 100)}%)`, 'Win the office, or lose some face and money trying.'),
          opt('back', 'Back a friend', 'A small cost, a small gain in standing.'),
          opt('decline', 'Decline', '')
        ],
        data: {title, chance}
      };
    }
    return null;
  },

  rival({sim, life, v, p, u}, forced) {
    if (!forced && !(u(30) < 0.05 && v.fame >= 5 && v.wealth >= 10)) return null;
    const rivals = [...sim.people.values()].filter(q => q.id !== p.id && q.country === v.country && q.age >= 18 && life.view(sim, q).job === v.job)
      .sort((a, b) => life.view(sim, b).fame - life.view(sim, a).fame || a.id - b.id).slice(0, 5);
    if (!rivals.length) return null;
    const r = rivals[Math.floor(u(31) * rivals.length)];
    return {
      title: `An offer from ${sim.full_name(r)}`,
      text: `${sim.full_name(r)}, a rival ${v.job} in ${sim.countries.get(v.country)?.name}, comes to you with a proposal.`,
      options: [
        opt('partner', 'Accept a partnership', 'Share the work and the money, but not the credit.'),
        opt('refuse', 'Refuse and go your own way', 'Your independence is noted.'),
        opt('contest', 'Challenge them to a contest', 'Win and your name grows; lose and it suffers.')
      ],
      data: {rival: r.id}
    };
  }
};

// ---- carrying out a choice: { text (for the journal), tag (for the life story) }
export function resolveChoice(sim, life, p, choice, optionId) {
  const o = liveChoice(choice, life.flow).options.find(x => x.id === optionId);
  if (!o) throw Error('That is not one of the choices.');
  if (!o.enabled) throw Error(o.why || 'That choice is not available.');
  const x = context(sim, life, p, choice.season), out = RESOLVE[choice.kind](x, optionId, choice.data);
  bump(life.player.stats, EFFECT[`${choice.kind}/${optionId}`]);
  return out;
}

/** Catch a disease for real (only when the world follows). Returns true if it took. */
function fall(sim, p, name) {
  const d = sim.sicknesses.get(name);
  if (!d || p.infection || p.immunity?.has(name)) return false;
  try { _infect(sim, p, d); return true; } catch { return false; }
}
const spend = (v, n) => Math.min(v.wealth, n);

/** How each choice changes who you are: skill, knowledge, connections, honor. */
const EFFECT = {
  'war/volunteer': {honor: 2, skill: 1}, 'war/exempt': {honor: -2}, 'war/flee': {honor: -3}, 'war/supply': {honor: -1, connections: 1}, 'war/medic': {honor: 3, skill: 2, knowledge: 1}, 'war/command': {honor: 2, skill: 3, connections: 2}, 'war/speech': {connections: 2, honor: 1},
  'plague/tend': {honor: 4, skill: 1, knowledge: 1}, 'plague/flee': {honor: -2}, 'plague/sell': {honor: -5}, 'plague/cure': {honor: 5, skill: 3, knowledge: 2}, 'plague/study': {knowledge: 4},
  'famine/share': {honor: 5, connections: 1}, 'famine/hoard': {honor: -5}, 'famine/speculate': {honor: -3}, 'famine/granary': {honor: 5, connections: 1}, 'famine/relief': {honor: 3, connections: 3},
  'settlers/join': {connections: 1}, 'settlers/lead': {honor: 1, connections: 2}, 'settlers/fund': {honor: 3, connections: 1},
  'office/stand': {connections: 1}, 'office/back': {honor: 2, connections: 2}, 'rival/partner': {connections: 2}, 'rival/refuse': {honor: 1}, 'rival/contest': {skill: 1}
};

const RESOLVE = {
  war({sim, life, p, v, u, flow}, id, d) {
    if (id === 'medic') { const dw = 6 + u(60) * 8; life.apply(sim, p, {dw, df: 3}); return {text: `You served as a field medic and tended the wounded. You earned ${money(dw)} and a great deal of respect.`, tag: 'Served as a field medic in the war.'}; }
    if (id === 'speech') { life.apply(sim, p, {df: 2.5}); return {text: 'You spoke for the cause in the market and the hall. People remembered it.', tag: 'Rallied the people in wartime.'}; }
    if (id === 'command') {
      life.apply(sim, p, {df: 6, ...(v.job !== 'soldier' ? {job: 'soldier'} : {})});
      const hurt = flow && u(61) < 0.25; if (hurt) p.wounded_until = sim.year + 1 + Math.floor(u(62) * 2);
      return {text: hurt ? 'You took a command and led your men well, and a wound sent you home with honor.' : 'You took a command and led your men well. Your name is spoken with respect.', tag: 'Took a command in the war.'};
    }
    if (id === 'volunteer') {
      life.apply(sim, p, {df: 4, ...(v.job !== 'soldier' ? {job: 'soldier'} : {})});
      let hurt = false;
      if (flow && u(23) < 0.3) { p.wounded_until = sim.year + 1 + Math.floor(u(24) * 2); hurt = true; }
      return {text: hurt ? 'You took up arms for your country. A wound sent you home, and your courage was remembered.' : 'You took up arms for your country, and your courage was remembered.', tag: 'Volunteered to fight when war came.'};
    }
    if (id === 'exempt') { life.apply(sim, p, {dw: -d.cost}); return {text: `You paid ${money(d.cost)} to be spared the levy.`, tag: 'Paid to be spared the levy in wartime.'}; }
    if (id === 'flee') {
      const t = sim.settlements.get(d.away);
      life.apply(sim, p, {place: t.id, dw: -spend(v, 5), df: -1});
      if (t.country !== v.country) life.add(p.id, sim.year, 'allegiance', t.country, t.id);
      return {text: `You left for ${t.name} and put the war behind you.`, tag: `Fled the war to ${t.name}.`};
    }
    const base = Math.min(400, 2 + 0.05 * v.wealth) * 1.5, win = u(25) < 0.6, dw = win ? base * (1 + u(26)) : -Math.min(v.wealth * 0.4, base * u(26));
    life.apply(sim, p, {dw, df: win ? 1 : 0});
    return {text: win ? `You supplied the army and cleared ${money(dw)}.` : `Your wartime venture failed: you lost ${money(-dw)}.`, tag: win ? 'Profited from supplying an army.' : 'Lost money supplying an army.'};
  },

  plague({sim, life, p, v, u, flow}, id, d) {
    if (id === 'cure') { const ill = flow && u(63) < 0.12 && fall(sim, p, d.disease); life.apply(sim, p, {df: 5 + u(20) * 2, dw: spend(v, 0) + 4}); return {text: ill ? `You treated the sick with real skill and saved many, then caught ${d.disease} yourself.` : 'You treated the sick with real skill and saved many. The town will not forget it.', tag: `Treated the sick during the ${d.disease} outbreak.`}; }
    if (id === 'study') { const found = u(64) < 0.08; life.apply(sim, p, {df: found ? 4 : 0.6, insight: found}); return {text: found ? `You studied ${d.disease} closely and understood something new about it.` : `You studied ${d.disease} from a careful distance and filled your notebooks.`, tag: found ? `Made a discovery about ${d.disease}.` : ''}; }
    if (id === 'tend') {
      life.apply(sim, p, {df: 3 + u(20) * 2, dw: -spend(v, 3)});
      const ill = flow && u(21) < 0.35 && fall(sim, p, d.disease);
      return {text: ill ? `You tended the sick for weeks, earning real respect, and then caught ${d.disease} yourself.` : 'You tended the sick for weeks and earned real respect.', tag: `Tended the sick during the ${d.disease} outbreak.`};
    }
    if (id === 'flee') { const t = sim.settlements.get(d.safe); life.apply(sim, p, {place: t.id, dw: -spend(v, 5)}); return {text: `You left for ${t.name}, away from the sickness.`, tag: `Fled ${d.disease} to ${t.name}.`}; }
    if (id === 'stay') { const ill = flow && u(22) < 0.08 && fall(sim, p, d.disease); return {text: ill ? `You kept to your house, but ${d.disease} found you anyway.` : 'You kept to your house and let the sickness pass by.', tag: ''}; }
    const dw = (10 + 0.05 * v.wealth) * (0.6 + u(28));
    life.apply(sim, p, {dw, df: -1});
    return {text: `You sold remedies at a price and made ${money(dw)}. Some noticed.`, tag: `Sold remedies during the ${d.disease} outbreak.`};
  },

  famine({sim, life, p, v, u}, id, d) {
    if (id === 'granary') { const dw = 3 + u(65) * 5; life.apply(sim, p, {dw, df: 3}); return {text: `You opened your stores at a fair price and took only ${money(dw)}. People will remember who did not gouge them.`, tag: 'Sold grain fairly in a famine.'}; }
    if (id === 'relief') { life.apply(sim, p, {dw: -spend(v, 4), df: 3.5}); return {text: 'You organised relief for the hungry and put your name to it.', tag: 'Organised famine relief.'}; }
    if (id === 'share') { const give = Math.min(30, 0.15 * v.wealth); life.apply(sim, p, {dw: -give, df: 3 + (give >= 10 ? 1.5 : 0)}); return {text: `You shared ${money(give)} with your hungry neighbours. They will remember.`, tag: 'Shared their savings in a famine.'}; }
    if (id === 'hoard') { life.apply(sim, p, {df: -3}); return {text: 'You kept your savings to yourself. Neighbours noticed.', tag: ''}; }
    if (id === 'migrate') { const t = sim.settlements.get(d.near); life.apply(sim, p, {place: t.id, dw: -spend(v, 3)}); return {text: `You moved to ${t.name} in search of bread.`, tag: `Left for ${t.name} in a famine.`}; }
    const base = Math.min(400, 2 + 0.05 * v.wealth), win = u(29) < 0.45, dw = win ? base * 1.8 * (0.8 + u(26) * 0.5) : -Math.min(v.wealth * 0.3, base);
    life.apply(sim, p, {dw, df: win ? 0 : -1});
    return {text: win ? `You sold grain at famine prices and made ${money(dw)}.` : `Your grain gamble failed: you lost ${money(-dw)}.`, tag: win ? 'Made money speculating on grain in a famine.' : ''};
  },

  settlers({sim, life, p, v}, id, d) {
    const exp = (sim.expeditions ?? []).find(e => e.get('id') === d.exp);
    if (id === 'stay') return {text: 'You wished the settlers well and stayed where you were.', tag: ''};
    if (id === 'fund') { const give = Math.min(60, 0.2 * v.wealth); life.apply(sim, p, {dw: -give, df: 3}); return {text: `You gave ${money(give)} to the settlers. They will remember who helped.`, tag: 'Funded settlers leaving for a new land.'}; }
    if (!exp) return {text: 'The party had already left without you.', tag: ''};
    if (!exp.get('people').includes(p.id)) { if (id === 'lead') exp.get('people').unshift(p.id); else exp.get('people').push(p.id); }
    p.expedition = exp.get('id');
    if (id === 'lead') { exp.set('leader', p.id); life.apply(sim, p, {df: 4}); return {text: 'You took command of the settlers. If they reach their land, the new town will be yours.', tag: 'Led settlers out to found a new town.'}; }
    life.apply(sim, p, {df: 2});
    return {text: 'You joined the settlers and set out with them.', tag: 'Left home with a party of settlers.'};
  },

  office({sim, life, p, v, c, u}, id, d) {
    if (id === 'decline') return {text: 'You let the chance go by.', tag: ''};
    if (id === 'back') { life.apply(sim, p, {dw: -spend(v, 5), df: 2}); return {text: 'You lent your name and a little money to a friend’s cause.', tag: ''}; }
    if (u(27) < d.chance) { life.apply(sim, p, {role: d.title}); return {text: `You were named ${d.title} of ${c.name}.`, tag: `Won the office of ${d.title}.`}; }
    life.apply(sim, p, {df: -2, dw: -spend(v, 5)});
    return {text: `You put yourself forward for ${d.title}, but another was chosen. It cost you some face.`, tag: ''};
  },

  rival({sim, life, p, v, u, st}, id, d) {
    const r = sim.people.get(d.rival), name = r ? sim.full_name(r) : 'your rival', rv = r ? life.view(sim, r) : {fame: v.fame};
    if (id === 'partner') { const dw = (8 + 0.05 * v.wealth) * (0.5 + u(32)); life.apply(sim, p, {dw, df: -1}); return {text: `You went into partnership with ${name} and made ${money(dw)}, though little of the credit was yours.`, tag: `Went into partnership with ${name}.`}; }
    if (id === 'refuse') { life.apply(sim, p, {df: 1}); return {text: `You turned ${name} down and went your own way.`, tag: ''}; }
    const win = u(33) < clamp(0.5 + (v.fame - rv.fame) / 200 + (st.skill - 50) / 300, 0.15, 0.9);
    life.apply(sim, p, win ? {df: 6} : {df: -4, dw: -spend(v, 8)});
    return {text: win ? `You bested ${name} in front of the whole trade, and your name grew.` : `${name} outdid you in the contest. It stung, and it cost you.`, tag: win ? `Bested ${name} in a contest.` : `Lost a contest to ${name}.`};
  }
};

