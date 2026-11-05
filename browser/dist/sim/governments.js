/**
 * Forms of government: who rules, how they are chosen, what each form is good and bad at,
 * and how countries slide from one form into another.
 */

import {fixed, format, sorted, sum} from './runtime.js';
import {state} from './systems.js';

// traits: research (+/-), culture (x), trade (x), stability (+/- per year), war (x chance of war),
// military (x), expansion (x), output (x resource output), quota (x share of a deposit taken each year),
// tax (x revenue collected), corruption (share of the treasury lost each year)
export const DEFAULT_TRAITS = new Map([
  ['research', 0],
  ['culture', 1],
  ['trade', 1],
  ['stability', 0],
  ['war', 1],
  ['military', 1],
  ['expansion', 1],
  ['output', 1],
  ['quota', 1],
  ['tax', 1],
  ['corruption', 0]
]);

export const GOVERNMENTS = new Map([
  ['tribal', new Map([
    ['label', 'Tribal confederacy'],
    ['title', 'chief'],
    ['succession', 'fame'],
    ['term', 0],
    ['verb', 'was chosen as war chief'],
    ['blurb', 'Clans under a chief. Little administration, hardy and eager for land.'],
    ['traits', new Map([
      ['research', -.06],
      ['expansion', 1.15],
      ['stability', .12],
      ['tax', .6],
      ['output', .95],
      ['war', 1.1],
      ['military', 1.05]
    ])]
  ])],
  ['monarchy', new Map([
    ['label', 'Monarchy'],
    ['title', 'monarch'],
    ['succession', 'hereditary'],
    ['term', 0],
    ['verb', 'was crowned'],
    ['heir', 'inherited the throne'],
    ['blurb', 'Hereditary rule. Stable dynasties, ambitious courts.'],
    ['traits', new Map([['expansion', 1.1], ['culture', 1.05], ['war', 1.05], ['stability', .05], ['corruption', .008]])]
  ])],
  ['council', new Map([
    ['label', 'Council'],
    ['title', 'council leader'],
    ['succession', 'election'],
    ['term', 8],
    ['verb', 'was elected to lead the council'],
    ['blurb', 'A council of notables chooses a leader every few years.'],
    ['traits', new Map([['research', .06], ['war', .95]])]
  ])],
  ['republic', new Map([
    ['label', 'Republic'],
    ['title', 'president'],
    ['succession', 'election'],
    ['term', 6],
    ['verb', 'was elected president'],
    ['blurb', 'Elected office under law. Trade and learning flourish; wars are harder to start.'],
    ['traits', new Map([
      ['research', .06],
      ['trade', 1.1],
      ['war', .85],
      ['expansion', .9],
      ['culture', 1.1],
      ['corruption', .004]
    ])]
  ])],
  ['democracy', new Map([
    ['label', 'Democracy'],
    ['title', 'prime minister'],
    ['succession', 'election'],
    ['term', 4],
    ['verb', 'won the national vote'],
    ['blurb', 'Broad participation. Strong science and culture, reluctant to fight, protective of resources.'],
    ['traits', new Map([
      ['research', .1],
      ['trade', 1.12],
      ['war', .6],
      ['expansion', .8],
      ['culture', 1.2],
      ['tax', .9],
      ['stability', -.05],
      ['quota', .85]
    ])]
  ])],
  ['theocracy', new Map([
    ['label', 'Theocracy'],
    ['title', 'high priest'],
    ['succession', 'divine'],
    ['term', 0],
    ['verb', 'was proclaimed high priest'],
    ['blurb', 'Priests rule. Very stable and devout, slow to learn, quick to fight over faith.'],
    ['traits', new Map([
      ['research', -.1],
      ['culture', 1.2],
      ['stability', .2],
      ['war', 1.15],
      ['military', 1.03],
      ['tax', 1.1],
      ['output', .97]
    ])]
  ])],
  ['junta', new Map([
    ['label', 'Military junta'],
    ['title', 'general'],
    ['succession', 'seizure'],
    ['term', 0],
    ['verb', 'seized power in a coup'],
    ['blurb', 'Officers rule. Strong armies and eager to expand; poor for learning and the arts; drains resources.'],
    ['traits', new Map([
      ['military', 1.15],
      ['war', 1.5],
      ['research', -.08],
      ['culture', .75],
      ['expansion', 1.25],
      ['stability', .1],
      ['output', 1.1],
      ['quota', 1.2],
      ['corruption', .01],
      ['tax', 1.15]
    ])]
  ])],
  ['oligarchy', new Map([
    ['label', 'Oligarchy'],
    ['title', 'chief magistrate'],
    ['succession', 'wealth'],
    ['term', 10],
    ['verb', 'was installed by the wealthy families'],
    ['blurb', 'The richest families rule. Good for trade, light on taxes, prone to corruption.'],
    ['traits', new Map([['trade', 1.15], ['tax', .8], ['corruption', .012], ['war', .95], ['culture', .95]])]
  ])],
  ['empire', new Map([
    ['label', 'Empire'],
    ['title', 'emperor'],
    ['succession', 'hereditary'],
    ['term', 0],
    ['verb', 'was crowned emperor'],
    ['heir', 'inherited the imperial crown'],
    ['blurb', 'A vast realm under an emperor. Heavy taxes and armies, restless provinces.'],
    ['traits', new Map([
      ['military', 1.08],
      ['war', 1.3],
      ['expansion', 1.2],
      ['tax', 1.25],
      ['stability', -.08],
      ['culture', 1.1],
      ['output', 1.05],
      ['corruption', .01]
    ])]
  ])],
  ['merchant', new Map([
    ['label', 'Merchant republic'],
    ['title', 'doge'],
    ['succession', 'election'],
    ['term', 6],
    ['verb', 'was elected doge by the guilds'],
    ['blurb', 'Guilds and ports rule. The best traders, peaceful, with modest armies.'],
    ['traits', new Map([
      ['trade', 1.3],
      ['war', .7],
      ['military', .92],
      ['research', .05],
      ['tax', .85],
      ['culture', 1.05],
      ['expansion', .95]
    ])]
  ])],
  ['tyranny', new Map([
    ['label', 'Tyranny'],
    ['title', 'dictator'],
    ['succession', 'seizure'],
    ['term', 0],
    ['verb', 'seized absolute power'],
    ['blurb', 'One strongman rules by fear. Fierce taxes and output, little freedom for science or art.'],
    ['traits', new Map([
      ['stability', .15],
      ['war', 1.3],
      ['tax', 1.3],
      ['corruption', .02],
      ['research', -.1],
      ['culture', .7],
      ['military', 1.1],
      ['output', 1.15],
      ['quota', 1.3]
    ])]
  ])]
]);
export const HEREDITARY = ['monarchy', 'empire'];
export const AUTHORITY = ['tribal', 'monarchy', 'empire', 'junta', 'tyranny'];
export const INITIAL = ['tribal', 'monarchy', 'council', 'theocracy', 'oligarchy'];

export function info(government) {
  return GOVERNMENTS.get(government) ?? GOVERNMENTS.get('monarchy');
}

export function trait(country, name) {
  return info(country.government).get('traits').get(name) ?? DEFAULT_TRAITS.get(name);
}

export function title_of(government) {
  return info(government).get('title');
}

export function all_titles() {
  return new Set([...GOVERNMENTS.values()].map(g => g.get('title')));
}

/** Gini coefficient of personal wealth among a country's adults (sampled for speed). */
export function inequality(sim, cid) {
  const wealth = sorted([...sim.people.values()].filter(p => p.country === cid && p.age >= 18).map(p => p.wealth ?? 0));
  const n = wealth.length;
  const total = sum(wealth);
  if (n < 10 || total <= 0) {
    return 0;
  }
  let running = 0;
  for (let i = 0; i < n; i++) {
    running += (i + 1) * wealth[i];
  }
  return Math.max(0, Math.min(1, 2 * running / (n * total) - (n + 1) / n));
}

/** Governments this country could realistically turn into, with weights. */
export function _options(sim, country, st, places) {
  const gov = country.government;
  const techs = country.technologies;
  const stab = country.stability;
  const culture = country.culture ?? 0;
  const pop = st.get('residents');
  const war = st.get('at_war');
  const options = [];

  const add = (target, weight) => {
    if (weight > 0) {
      options.push([target, weight]);
    }
  };

  if (gov === 'tribal') {
    add('monarchy', pop >= 500 ? 3 : 1);
    add('council', techs.has('writing') ? 2 : 0);
    add('theocracy', 1.5);
    add('oligarchy', techs.has('pottery') ? 1 : 0);
  } else if (gov === 'monarchy') {
    add('empire', places >= 5 && pop >= 2500 && techs.has('bronze tools') ? 3 : 0);
    add('council', techs.has('writing') && stab > 55 ? 1.2 : 0);
    add('republic', stab < 40 && techs.has('writing') ? 2.2 : 0);
    add('theocracy', stab < 50 ? 1.5 : 0);
    add('oligarchy', stab < 45 ? 1.2 : 0);
    add('junta', war && stab < 40 ? 2 : 0);
  } else if (gov === 'council') {
    add('republic', techs.has('writing') && stab > 55 ? 2.5 : 0);
    add('merchant', st.get('trade') >= 2.5 ? 2 : 0);
    add('oligarchy', inequality(sim, country.id) > .5 ? 2 : 0);
    add('tyranny', stab < 30 && war ? 1.5 : 0);
    add('monarchy', stab < 35 ? 1 : 0);
  } else if (gov === 'republic') {
    add('democracy', (techs.has('printing') || techs.has('universities')) && culture >= 30 && stab > 60 ? 3 : 0);
    add('oligarchy', inequality(sim, country.id) > .55 ? 2 : 0);
    add('junta', stab < 30 ? 2.5 : 0);
    add('merchant', st.get('trade') >= 3 ? 1.5 : 0);
    add('empire', places >= 6 && war ? 1 : 0);
  } else if (gov === 'democracy') {
    add('republic', stab < 35 ? 2 : 0);
    add('oligarchy', inequality(sim, country.id) > .6 ? 1.5 : 0);
    add('junta', stab < 25 && war ? 2 : 0);
    add('tyranny', stab < 20 ? 1.5 : 0);
  } else if (gov === 'theocracy') {
    add('monarchy', stab < 40 ? 2 : 0);
    add('republic', culture >= 40 && techs.has('universities') ? 2 : 0);
    add('junta', war ? 1 : 0);
  } else if (gov === 'junta') {
    add('tyranny', stab > 60 ? 2 : 0);
    add('republic', stab > 65 && country.prosperity > 55 ? 1.5 : 0);
    add('monarchy', 1);
  } else if (gov === 'oligarchy') {
    add('merchant', st.get('trade') >= 2 ? 1.5 : 0);
    add('republic', stab < 35 ? 2 : 0);
    add('monarchy', 1);
    add('tyranny', 1);
  } else if (gov === 'empire') {
    add('monarchy', stab < 30 ? 3 : 0);
    add('junta', war ? 1.5 : 0);
    add('republic', stab < 40 ? .6 : 0);
  } else if (gov === 'merchant') {
    add('republic', 1);
    add('oligarchy', inequality(sim, country.id) > .5 ? 2 : 0);
    add('monarchy', war ? .5 : 0);
  } else if (gov === 'tyranny') {
    add('junta', 1.5);
    add('republic', stab < 20 ? 2 : 0);
    add('monarchy', 1);
  }
  return options;
}

/** Each year an unstable or changed country may switch its form of government. */
export function evolve(sim) {
  const places = new Map();
  for (const s of sim.settlements.values()) {
    if (s.abandoned == null) {
      places.set(s.country, (places.get(s.country) ?? 0) + 1);
    }
  }
  for (const cid of sorted(sim.countries.keys())) {
    const country = sim.countries.get(cid);
    if (country.ended != null || sim.year - (country.government_since ?? 0) < 10) {
      continue;
    }
    const chance = .012 + Math.max(0, 45 - country.stability) * .005;
    if (sim.rng.random() >= chance) {
      continue;
    }
    const options = _options(sim, country, state(sim, cid), places.get(cid) ?? 0);
    if (options.length === 0) {
      continue;
    }
    const target = sim.rng.choices(options.map(o => o[0]), options.map(o => o[1]), 1)[0];
    const old = country.government;
    country.government = target;
    country.government_since = sim.year;
    country.last_election = sim.year;
    country.ruler = null;
    if (country.stability < 45) {
      country.stability = Math.min(60, country.stability + 12);
    }
    const how = country.stability < 55 ? 'An uprising' : 'A reform movement';
    sim.record(`${how} in ${country.name} replaced the ${info(old).get('label').toLowerCase()} with a ${info(target).get('label').toLowerCase()}.`, 'political');
  }
}

export function describe(sim, query = '') {
  const lines = ['Forms of government:'];
  for (const [key, g] of GOVERNMENTS) {
    const traits = [...g.get('traits')]
      .map(([k, v]) => (['research', 'stability', 'corruption'].includes(k) ? `${k} ${format(v, '+.2f')}` : `${k} x${fixed(v, 2)}`))
      .join(', ');
    lines.push(`  ${g.get('label')} (${key}): rules as ${g.get('title')}; chosen by ${g.get('succession')}; ${g.get('blurb')} [${traits}]`);
  }
  lines.push('Countries:');
  for (const cid of sorted(sim.countries.keys())) {
    const country = sim.countries.get(cid);
    if (country.ended == null && (!query || country.name.toLowerCase().includes(query))) {
      lines.push(`  ${country.name}: ${info(country.government).get('label')} (since year ${country.government_since ?? 0})`);
    }
  }
  return lines.join('\n');
}
