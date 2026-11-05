/** Annual campaigns, limited recruitment, supply, conquest, and truces. */

import {TupleMap, fixed, format, pop, setdefault, sorted, sum} from './runtime.js';
import {technology_modifiers, boosted_of, end_pact} from './society.js';
import {LETHALITY, UNIT_NAMES} from './technology.js';
import {distance_to_country, contacts, defense} from './geography.js';
import {state, war_friction} from './systems.js';
import {damage_buildings, besieging} from './development.js';

/** Casualty multiplier from the gap in weapons: spearmen against muskets die faster, and the reverse. */
export function outclassed(own, foe) {
  return Math.max(.6, Math.min(1.6, 1 + .15 * (foe - own)));
}

/** How much easier or harder walls are to take: siege engines and cannon against castles and bastions. */
export function siege_odds(attacker_mods, defender_mods) {
  return Math.max(.4, Math.min(2, (1 + attacker_mods.get('siege')) * defender_mods.get('defense')));
}

export function _transfer(sim, victor, defeated, settlement = null) {
  for (const person of sim.people.values()) {
    if (person.country === defeated && (settlement == null || person.settlement === settlement.id)) {
      person.country = victor;
    }
  }
  for (const place of sim.settlements.values()) {
    if (place.country === defeated && (settlement == null || place.id === settlement.id)) {
      place.country = victor;
    }
  }
  const losing = sim.countries.get(defeated);
  const winning = sim.countries.get(victor);
  const firstPlaceOf = cid => [...sim.settlements.values()].find(s => s.country === cid && s.abandoned == null)?.id ?? null;
  if (winning.capital == null) {
    winning.capital = firstPlaceOf(victor);
  }
  if (settlement == null) {
    losing.capital = null;
    losing.ended = sim.year;
    winning.capacity += losing.capacity;
    // The conquerors do not simply own the loser's discoveries; they research each of them twice as fast.
    let studied = 0;
    for (const name of sorted(losing.technologies)) {
      if (!winning.technologies.has(name) && !boosted_of(winning).has(name)) {
        boosted_of(winning).add(name);
        studied += 1;
      }
    }
    if (studied > 0) {
      sim.record(`Scholars of ${winning.name} began studying ${studied} discoveries of ${losing.name}; researching them will go twice as fast.`, 'discovery');
    }
    if (!('innovations' in winning)) {
      winning.innovations = new Map();
    }
    for (const key of (losing.innovations ?? new Map()).keys()) {
      setdefault(winning.innovations, key, sim.year);
    }
    winning.treasury = (winning.treasury ?? 0) + (losing.treasury ?? 0);
    losing.treasury = 0;
    losing.absorbed_by = victor;
    losing.offices = new Map();
    losing.ruler = null;
  } else if (losing.capital === settlement.id) {
    losing.capital = firstPlaceOf(defeated);
  }
}

/** The enemy settlement closest to the attacker's own territory. */
export function _objective(sim, attacker, target) {
  let best = null;
  let best_distance = 1000;
  for (const place of sorted(sim.settlements.values(), {key: (s => s.id)})) {
    if (place.country === target && place.abandoned == null) {
      const distance = distance_to_country(sim, place, attacker);
      if (distance < best_distance) {
        best_distance = distance;
        best = place.id;
      }
    }
  }
  return best;
}

export function resolve_wars(sim) {
  if (!('war_details' in sim)) {
    sim.war_details = new TupleMap();
  }
  if (!('truces' in sim)) {
    sim.truces = new TupleMap();
  }
  // Wounds recover after one to three years; casualties remain individual people.
  for (const person of sim.people.values()) {
    if ((person.wounded_until ?? 0) <= sim.year) {
      person.wounded_until = 0;
    }
  }
  const residents = new Map();
  for (const person of sim.people.values()) {
    setdefault(residents, person.country, []).push(person);
  }
  const busy = new Set([...sim.wars.keys()].flat());
  const available = [...residents].filter(([cid, people]) => (!busy.has(cid) && sim.countries.get(cid).ended == null && sum(people.map(p => 18 <= p.age && p.age <= 60)) >= 5)).map(([cid]) => cid);
  sim.rng.shuffle(available);
  // Only countries that share a land border can fight; sea and distance keep the rest at peace.
  const [bordering, _sea] = contacts(sim);
  const paired = new Set();
  for (const cid of available) {
    if (paired.has(cid)) {
      continue;
    }
    const options = available.filter(o => (o !== cid && !paired.has(o) && bordering.get(cid)?.has(o)));
    if (options.length === 0) {
      continue;
    }
    const other = sim.rng.choice(options);
    paired.add(cid);
    paired.add(other);
    const pair = sorted([cid, other]);
    if ((sim.truces.get(pair) ?? -1) > sim.year) {
      continue;
    }
    const [friction, envy] = war_friction(sim, pair[0], pair[1]);
    if (sim.rng.random() < sim.war_chance * friction) {
      sim.wars.set(pair, sim.year);
      end_pact(sim, sim.countries.get(pair[0]), sim.countries.get(pair[1]));
      const causes = [
        'a disputed frontier',
        'raids on merchants',
        'rival claims to farmland',
        'a broken tribute agreement'
      ];
      if (envy) {
        causes.push('control of the ore hills', 'control of the ore hills');
      }
      const cause = sim.rng.choice(causes);
      sim.record(`${sim.countries.get(pair[0]).name} declared war on ${sim.countries.get(pair[1]).name} over ${cause}.`, 'war');
    }
  }

  let deaths = 0;
  for (const [pair, started] of [...sim.wars]) {
    const [a, b] = pair;
    const countries = [sim.countries.get(a), sim.countries.get(b)];
    const sides = pair.map(cid => [...sim.people.values()].filter(p => p.country === cid));
    const detail = setdefault(sim.war_details, pair, new Map([['exhaustion', [0, 0]], ['score', 0]]));
    setdefault(detail, 'captures', [0, 0]);
    setdefault(detail, 'objectives', [0, 1].map(i => _objective(sim, pair[i], pair[1 - i])));
    if (!sides.every(side => side.length) || countries.some(c => c.ended != null)) {
      sim.record(`War between ${countries[0].name} and ${countries[1].name} ended: one country has no residents.`, 'war');
      sim.wars.delete(pair);
      pop(sim.war_details, pair, null);
      continue;
    }
    const armies = [];
    const supplies = [];
    const powers = [];
    for (const [i, country] of countries.entries()) {
      const side = sides[i];
      const adults = side.filter(p => ((18 <= p.age && p.age <= 55) && p.infection == null && (p.wounded_until ?? 0) <= sim.year));
      const innovation = technology_modifiers(country);
      const st = state(sim, country.id);
      // Leave most working adults at home and never mobilize over 8% of residents.
      const levy = Math.min(Math.trunc(adults.length * .22), Math.trunc(side.length * .08), Math.trunc(side.length * .10 * Math.min(1, country.food / 60) * innovation.get('logistics')));
      armies.push(sim.rng.sample(adults, levy));
      const supply_bonus = 0;
      const supply = Math.max(.25, Math.min(1.2, country.food / 65 * innovation.get('logistics') + supply_bonus + st.get('supply_bonus')));
      supplies.push(supply);
      const technology = innovation.get('military');
      const morale = Math.max(.3, .65 + country.stability / 100 - detail.get('exhaustion')[i] / 150);
      powers.push(levy * supply * technology * morale * defense(sim, country.id) * st.get('power_mult') * sim.rng.uniform(.75, 1.25));
      country.food = Math.max(0, country.food - 1 - 45 * levy / Math.max(1, side.length));
      country.prosperity = Math.max(0, country.prosperity - 2);
      country.stability = Math.max(0, country.stability - 1);
    }
    detail.set('mobilized', armies.map(army => army.length));
    detail.set('supplies', [...supplies]);
    const mode = sim.rng.choice(['border raids', 'field battle', 'field battle', 'siege', 'supply campaign']);
    if (!armies.some(army => army.length)) {
      sim.record(`${countries[0].name} and ${countries[1].name} suspended hostilities: neither could recruit a healthy adult force; a four-year truce began.`, 'war');
      sim.truces.set(sorted(pair), sim.year + 4);
      sim.wars.delete(pair);
      pop(sim.war_details, pair, null);
      continue;
    }
    const mods = countries.map(c => technology_modifiers(c));
    if (mode === 'siege') {
      for (let i = 0; i < 2; i++) {
        powers[i] *= (1 + (1 - mods[i].get('defense')) * 1.6) * (1 + mods[i].get('siege') * .5);
      }
    }
    let intensity = new Map([['border raids', .06], ['field battle', .12], ['siege', .09], ['supply campaign', .025]]).get(mode);
    const tiers = [mods[0].get('weapon'), mods[1].get('weapon')];
    intensity *= LETHALITY[Math.max(...tiers)]; // gunpowder kills more than spears
    const losses = [];
    const wounded = [];
    for (const [i, army] of armies.entries()) {
      const pressure = Math.min(2.5, powers[1 - i] / Math.max(1, powers[i]));
      let risk = Math.min(.5, intensity * pressure + .035 * (1 - Math.min(1, supplies[i])));
      const modifiers = technology_modifiers(countries[i]);
      risk *= modifiers.get('defense') * modifiers.get('wound_death') * state(sim, countries[i].id).get('defense_mult');
      risk *= outclassed(tiers[i], tiers[1 - i]);
      const killed = [];
      const injuries = [];
      for (const person of army) {
        const roll = sim.rng.random();
        if (roll < risk) {
          killed.push(person);
        } else if (roll < Math.min(.8, risk * 3)) {
          person.wounded_until = sim.year + sim.rng.randint(1, 3);
          injuries.push(person);
        }
      }
      wounded.push(injuries.length);
      for (const person of killed) {
        person.died = sim.year;
        person.cause_of_death = 'war';
        sim.lineages.get(person.lineage).deaths += 1;
        sim.people.delete(person.id);
      }
      losses.push(killed.length);
      detail.get('exhaustion')[i] += 5 + killed.length / Math.max(1, army.length) * 40 + (1 - Math.min(1, supplies[i])) * 8 + 1.2 * Math.max(...tiers);
    }
    deaths += sum(losses);
    const winner = powers[0] > powers[1] ? 0 : 1;
    detail.set('score', detail.get('score') + (winner === 0 ? 1 : -1) * Math.min(3, Math.max(...powers) / Math.max(1, Math.min(...powers))));
    sim.record(`War update (year ${sim.year - started + 1}): ${mode}; ${countries[0].name} lost ${losses[0]} of ${armies[0].length} levies, ${countries[1].name} lost ${losses[1]} of ${armies[1].length}; ${countries[winner].name} held the advantage. Wounded ${wounded[0]}/${wounded[1]}; supply ${format(supplies[0], '.0%')}/${format(supplies[1], '.0%')}; war exhaustion ${fixed(detail.get('exhaustion')[0], 0)}/${fixed(detail.get('exhaustion')[1], 0)}. Armies: ${UNIT_NAMES.get('weapon')[tiers[0]]} against ${UNIT_NAMES.get('weapon')[tiers[1]]}.`, 'war');
    sim.war_log ??= [];
    const log = sim.war_log;
    log.push(new Map([
      ['year', sim.year],
      ['pair', [...pair]],
      ['tiers', tiers],
      ['losses', losses],
      ['levies', armies.map(a => a.length)],
      ['winner', winner],
      ['mode', mode]
    ]));
    while (log.length > 300) {
      log.shift();
    }
    const [victor, defeated] = [pair[winner], pair[1 - winner]];
    const survivor_adults = armies.map(army => sum(army.map(p => sim.people.has(p.id) && (p.wounded_until ?? 0) <= sim.year)));
    const overwhelming = powers[winner] >= Math.max(1, powers[1 - winner]) * 4;
    let conquered = false;
    const sustained_advantage = winner === 0 ? detail.get('score') >= 6 : detail.get('score') <= -6;
    const defeated_reserves = sum(sides[1 - winner].map(p => sim.people.has(p.id) && (18 <= p.age && p.age <= 60) && !p.infection && (p.wounded_until ?? 0) <= sim.year));
    const defeated_places = [...sim.settlements.values()].filter(s => (s.country === defeated && s.abandoned == null));
    // Full annexation requires a sustained campaign against the final territory.
    if (survivor_adults[winner] && defeated_places.length <= 1 && sim.year - started >= 2 && sustained_advantage && (overwhelming || !defeated_reserves)) {
      _transfer(sim, victor, defeated);
      sim.record(`${sim.countries.get(victor).name} conquered ${sim.countries.get(defeated).name}; survivors joined the victorious country.`, 'war');
      conquered = true;
    } else if (mode === 'siege' && survivor_adults[winner] && supplies[winner] >= .65 && (winner === 0 ? detail.get('score') >= 3 : detail.get('score') <= -3) && sim.rng.random() < .45 * (besieging(sim, pair, winner) ? 1.3 : 1) * siege_odds(mods[winner], mods[1 - winner])) {
      const targets = [...sim.settlements.values()].filter(s => (s.country === defeated && [...sim.people.values()].some(p => (p.settlement === s.id && p.country === defeated))));
      if (targets.length > 1) {
        const randomTarget = sim.rng.choice(targets); // always drawn, even when the objective is found: keeps the RNG sequence
        const target = targets.find(s => s.id === detail.get('objectives')[winner]) ?? randomTarget;
        detail.get('captures')[winner] += 1;
        _transfer(sim, victor, defeated, target);
        damage_buildings(sim, target, .35, 'The assault');
        sim.record(`${sim.countries.get(victor).name} captured ${target.name}; its surviving residents changed allegiance.`, 'war');
      }
    }
    const peace = Math.max(...detail.get('captures')) >= 1 || sim.year - started >= 7 || Math.max(...detail.get('exhaustion')) >= 80 || !survivor_adults.some(Boolean) || sim.year > started && sim.rng.random() < .12;
    if (conquered || peace) {
      if (!conquered) {
        const duration = sim.rng.randint(4, 9);
        sim.truces.set(sorted(pair), sim.year + duration);
        let terms = detail.get('captures').some(Boolean) ? 'recognized the new frontier' : 'accepted the existing borders';
        if (!detail.get('captures').some(Boolean) && Math.abs(detail.get('score')) >= 4) {
          const beneficiary = detail.get('score') > 0 ? 0 : 1;
          const tribute = Math.min(5, countries[1 - beneficiary].prosperity * .08);
          countries[1 - beneficiary].prosperity -= tribute;
          countries[beneficiary].prosperity = Math.min(100, countries[beneficiary].prosperity + tribute);
          terms += ' with limited reparations';
        }
        sim.record(`${countries[0].name} and ${countries[1].name} ${terms}, signed peace and a ${duration}-year truce.`, 'war');
      }
      sim.wars.delete(pair);
      pop(sim.war_details, pair, null);
    }
  }
  return deaths;
}
