// Port of test_war_tech.py
import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import * as tech from '../../dist/sim/technology.js';
import * as warfare from '../../dist/sim/warfare.js';
import {contacts} from '../../dist/sim/geography.js';
import {technology_modifiers} from '../../dist/sim/society.js';
import {Simulation} from '../../dist/sim/civsim.js';

function closure(...names) {
  const out = new Set();
  const stack = [...names];
  while (stack.length) {
    const n = stack.pop();
    if (!out.has(n)) { out.add(n); stack.push(...tech.TECH.get(n)[0]); }
  }
  return out;
}
class Fake {
  constructor(techs) { this.technologies = new Set(techs); this.innovations = new Map(); }
}
const mods = n => technology_modifiers(new Fake(closure(n)));
const numSort = a => [...a].sort((x, y) => x - y);

describe('RuleTests', () => {
  it('test_outclassed_armies_suffer_more', () => {
    assert.ok(warfare.outclassed(0, 5) > 1.0);
    assert.ok(warfare.outclassed(5, 0) < 1.0);
    assert.equal(warfare.outclassed(3, 3), 1.0);
    assert.ok(warfare.outclassed(0, 6) <= 1.6);
    assert.ok(warfare.outclassed(6, 0) >= .6);
  });

  it('test_siege_engines_beat_walls_and_walls_answer', () => {
    const walls = mods('masonry'), castles = mods('castles'), bastions = mods('bastion forts'), guns = mods('artillery'), rams = mods('siege craft');
    assert.ok(warfare.siege_odds(guns, walls) > warfare.siege_odds(rams, walls));
    assert.ok(warfare.siege_odds(rams, walls) > warfare.siege_odds(rams, castles));
    assert.ok(warfare.siege_odds(guns, castles) > warfare.siege_odds(guns, bastions));
  });

  it('test_modern_wars_are_deadlier_and_wear_nations_out', () => {
    assert.ok(tech.LETHALITY[6] > tech.LETHALITY[0] * 1.5);
  });
});

describe('CampaignTests', () => {
  function fight(seed) {
    const sim = new Simulation(2000, seed);
    for (let i = 0; i < 25; i++) sim.tick(false);
    const [land] = contacts(sim);
    let pair = null;
    for (const a of numSort(land.keys())) {
      for (const b of numSort(land.get(a))) {
        if (a < b && sim.countries.get(a).ended == null && sim.countries.get(b).ended == null && !sim.wars.has([a, b])) {
          pair = [a, b];
          break;
        }
      }
      if (pair) break;
    }
    if (pair == null) return null;
    const [a, b] = pair;
    sim.countries.get(a).technologies = closure('rifled firearms', 'artillery', 'bastion forts');
    sim.countries.get(b).technologies = closure('spear making');
    sim.countries.get(a).research_project = sim.countries.get(b).research_project = null;
    sim.war_log = [];
    if (sim.truces) sim.truces.delete(pair);
    sim.wars.set(pair, sim.year);
    for (let i = 0; i < 6; i++) {
      if (!sim.wars.has(pair)) break;
      sim.tick(false);
    }
    const rows = sim.war_log.filter(r => JSON.stringify(r.get('pair')) === JSON.stringify(pair));
    return [sim, pair, rows];
  }

  it('test_the_better_armed_side_loses_fewer_of_its_levy', () => {
    let lost_a = 0, levy_a = 0, lost_b = 0, levy_b = 0, fought = 0;
    for (const seed of [3, 5, 9, 14]) {
      const result = fight(seed);
      if (!result) continue;
      const [, , rows] = result;
      for (const r of rows) {
        fought += 1;
        lost_a += r.get('losses')[0];
        levy_a += Math.max(1, r.get('levies')[0]);
        lost_b += r.get('losses')[1];
        levy_b += Math.max(1, r.get('levies')[1]);
        assert.ok(r.get('tiers')[0] >= 5);
        assert.equal(r.get('tiers')[1], 0);
      }
    }
    assert.ok(fought > 0);
    assert.ok(lost_a / levy_a < lost_b / levy_b);
  });

  it('test_war_reports_name_the_armies', () => {
    let result = null;
    for (const s of [3, 4, 5, 6]) { result = fight(s); if (result) break; } // any world with a land border
    assert.ok(result != null);
    const sim = result[0];
    const updates = sim.history.map(h => h[1]).filter(m => m.startsWith('War update'));
    assert.ok(updates.some(m => m.includes('Armies:') && m.includes('riflemen')));
  });
});
