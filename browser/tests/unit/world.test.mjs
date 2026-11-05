// Port of test_world.py
import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import * as dev from '../../dist/sim/development.js';
import * as disasters from '../../dist/sim/disasters.js';
import * as g from '../../dist/sim/geography.js';
import * as systems from '../../dist/sim/systems.js';
import {command} from '../../dist/sim/civic.js';
import {Simulation} from '../../dist/sim/civsim.js';
import {deepClone, truthy} from '../../dist/sim/runtime.js';

function biggest(sim, cid = null) {
  const counts = g.settlement_counts(sim);
  const places = [...sim.settlements.values()].filter(s => s.abandoned == null && (cid == null || s.country === cid));
  let best = places[0];
  for (const s of places) if (counts.get(s.id) > counts.get(best.id)) best = s;
  return best;
}
const numSort = a => [...a].sort((x, y) => x - y);

describe('GeographyTests', () => {
  it('test_world_is_deterministic_and_varied', () => {
    const a = new Simulation(400, 11), b = new Simulation(400, 11);
    assert.deepEqual(g.world(a).get('terrain'), g.world(b).get('terrain'));
    const kinds = new Set(g.world(a).get('terrain').flat());
    assert.ok(kinds.size >= 6);
    assert.ok(g.world(a).get('river').some(row => row.some(v => truthy(v))));
    assert.ok(truthy(g.world(a).get('deposits')));
    const other = new Simulation(400, 12);
    assert.notDeepEqual(g.world(a).get('terrain'), g.world(other).get('terrain'));
  });

  it('test_settlements_sit_on_distinct_land_cells', () => {
    const sim = new Simulation(2000, 5);
    for (let i = 0; i < 12; i++) sim.tick(false);
    const cells = [...sim.settlements.values()].map(s => [s.gx, s.gy]);
    assert.equal(cells.length, new Set(cells.map(c => JSON.stringify(c))).size);
    for (const [x, y] of cells) {
      assert.ok(!g.WATER.includes(g.world(sim).get('terrain')[y][x]));
    }
  });

  it('test_paths_walk_over_connected_land', () => {
    const sim = new Simulation(2000, 5);
    const places = [...sim.settlements.values()].sort((a, b) => a.id - b.id);
    let route = null;
    for (const a of places) {
      for (const b of places) {
        if (a !== b) {
          route = g.find_path(sim, [a.gx, a.gy], [b.gx, b.gy]);
          if (route) break;
        }
      }
      if (route) break;
    }
    assert.notEqual(route, null);
    const [cells, cost] = route;
    assert.ok(cost > 0);
    for (let i = 0; i + 1 < cells.length; i++) {
      const [x1, y1] = cells[i], [x2, y2] = cells[i + 1];
      assert.ok(Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)) <= 1);
      assert.ok(!g.WATER.includes(g.world(sim).get('terrain')[y2][x2]));
    }
  });

  it('test_hazards_follow_terrain', () => {
    const sim = new Simulation(400, 9);
    const geo = g.world(sim);
    const cellsWhere = f => {
      const out = [];
      for (let y = 0; y < g.H; y++) for (let x = 0; x < g.W; x++) if (f(x, y)) out.push([x, y]);
      return out;
    };
    const river = cellsWhere((x, y) => truthy(geo.get('river')[y][x]) && !g.WATER.includes(geo.get('terrain')[y][x]));
    const dry = cellsWhere((x, y) => ['plains', 'forest'].includes(geo.get('terrain')[y][x])
      && !g.world(sim).get('river')[y][x] && !g._near_water(geo.get('terrain'), x, y, 3) && !g._near_flag(geo.get('river'), x, y, 2));
    const peaks = cellsWhere((x, y) => geo.get('terrain')[y][x] === 'hills' && geo.get('slope')[y][x] > .04);
    assert.ok(river.length && dry.length);
    const mean = (cells, kind) => cells.reduce((s, [x, y]) => s + g.hazards_at(sim, x, y).get(kind), 0) / cells.length;
    assert.ok(mean(river, 'flood') > mean(dry, 'flood'));
    if (peaks.length) {
      assert.ok(mean(peaks, 'earthquake') > mean(dry, 'earthquake'));
    }
  });
});

describe('ExpeditionTests', () => {
  it('test_settlers_travel_then_found_a_town', () => {
    const sim = new Simulation(2000, 3);
    sim.country_chance = 0;
    const origin = biggest(sim);
    const before = sim.settlements.size;
    const exp = dev.launch_expedition(sim, origin, undefined, undefined, undefined, true);
    assert.notEqual(exp, null);
    const travelers = [...exp.get('people')];
    assert.ok(travelers.every(i => sim.people.get(i).settlement === origin.id));
    assert.ok(travelers.every(i => (sim.people.get(i).expedition ?? null) === exp.get('id')));
    for (let i = 0; i < 20; i++) {
      sim.tick(false);
      if (!(sim.expeditions ?? []).some(e => e.get('id') === exp.get('id'))) break;
    }
    assert.equal((sim.expeditions ?? []).some(e => e.get('id') === exp.get('id')), false);
    const arrived = travelers.filter(i => sim.people.has(i));
    assert.ok(sim.settlements.size >= before + 1);
    const founded = [...sim.settlements.values()].filter(s => travelers.includes(s.founder) && s.id !== origin.id);
    assert.equal(founded.length, 1);
    assert.equal(founded[0].country, origin.country);
    assert.ok(arrived.length > 0);
    assert.ok(arrived.every(i => sim.people.get(i).settlement === founded[0].id));
    assert.ok(arrived.every(i => !sim.people.get(i).expedition));
  });

  it('test_ownership_and_flags_stay_consistent', () => {
    const sim = new Simulation(2000, 21);
    for (let i = 0; i < 25; i++) {
      sim.tick(false);
      const active = new Set((sim.expeditions ?? []).map(e => e.get('id')));
      for (const p of sim.people.values()) {
        assert.equal(p.country, sim.settlements.get(p.settlement).country);
        const flag = p.expedition ?? null;
        assert.ok(!flag || active.has(flag), JSON.stringify([sim.year, p.id, flag]));
      }
    }
  });

  it('test_settle_command', () => {
    const sim = new Simulation(2000, 3);
    const name = biggest(sim).name;
    const [output, action] = command(sim, `settle "${name}" size=12`);
    assert.equal(action, 'edit', output);
    assert.equal(sim.expeditions.length, 1);
    assert.ok(command(sim, 'expeditions')[0].includes('Settler parties'));
    assert.equal(command(sim, 'undo')[1], 'edit');
    assert.equal((sim.expeditions ?? []).length, 0);
  });
});

describe('ProjectTests', () => {
  it('test_building_gets_built_and_changes_the_country', () => {
    const sim = new Simulation(2000, 3);
    const place = biggest(sim);
    const country = sim.countries.get(place.country);
    const project = dev.start_project(sim, place, 'school', true);
    assert.notEqual(project, null);
    for (let i = 0; i < 30; i++) {
      sim.tick(false);
      if (place.buildings?.has('school')) break;
    }
    assert.ok(place.buildings.has('school'));
    const notes = systems.analyze(sim, country.id).get('notes').get('research');
    assert.ok(notes.map(([label]) => label).includes('Schools'));
  });

  it('test_build_command_enforces_requirements', () => {
    const sim = new Simulation(2000, 3);
    const name = biggest(sim).name;
    let [output, action] = command(sim, `build "${name}" university`);
    assert.equal(action, 'inspect');
    assert.ok(output.includes('cannot build'));
    [output, action] = command(sim, `build "${name}" university force=true`);
    assert.equal(action, 'edit', output);
    assert.ok(command(sim, 'projects')[0].includes('1'));
  });

  it('test_roads_speed_up_travel', () => {
    const sim = new Simulation(2000, 3);
    const a = biggest(sim);
    const b = [...sim.settlements.values()].filter(s => s.country === a.country && s.id !== a.id)[0];
    const route = g.find_path(sim, [a.gx, a.gy], [b.gx, b.gy]);
    sim.roads = new Map(route[0].map(([x, y]) => [y * g.W + x, a.country]));
    const faster = g.find_path(sim, [a.gx, a.gy], [b.gx, b.gy]);
    assert.ok(faster[1] < route[1]);
  });
});

describe('DisasterTests', () => {
  it('test_disaster_is_local_and_protection_helps', () => {
    const sim = new Simulation(2000, 3);
    for (let i = 0; i < 5; i++) sim.tick(false);
    const place = biggest(sim);
    const protectedSim = deepClone(sim);
    protectedSim.settlements.get(place.id).buildings = new Map([['levee', 1]]);
    const plain = deepClone(sim);
    const far = [...sim.settlements.values()].filter(s => g.dist(s.gx, s.gy, place.gx, place.gy) > disasters.RADIUS.get('severe'));
    const hit = disasters.strike(plain, 'flood', 'severe', place.gx, place.gy);
    const shielded = disasters.strike(protectedSim, 'flood', 'severe', place.gx, place.gy);
    assert.ok(shielded.deaths <= hit.deaths);
    assert.ok(new Set(hit.affected.map(a => a.settlement)).size > 0);
    const hitIds = new Set(hit.affected.map(a => a.settlement));
    for (const s of far) assert.ok(!hitIds.has(s.id));
  });

  it('test_disaster_command_targets_a_settlement', () => {
    const sim = new Simulation(2000, 3);
    const country = sim.countries.get(biggest(sim).country).name;
    const [output, action] = command(sim, `disaster "${country}" landslide severity=major`);
    assert.equal(action, 'edit', output);
    assert.ok(output.includes('struck'));
    assert.ok(truthy(sim.disaster_log));
  });
});

describe('EradicationTests', () => {
  it('test_complete_cure_with_no_infections_eradicates_automatically', () => {
    const sim = new Simulation(800, 4);
    command(sim, 'add disease Testpox infection=0.3');
    command(sim, 'set disease Testpox cure 100');
    assert.ok(sim.sicknesses.has('Testpox'));
    sim.tick(false);
    assert.ok(!sim.sicknesses.has('Testpox'));
    assert.ok(sim.retired_sicknesses.has('Testpox'));
    assert.ok(sim.history.some(([, m]) => m.includes('Testpox has been eradicated')));
  });

  it('test_cured_but_still_infectious_waits', () => {
    const sim = new Simulation(800, 4);
    command(sim, 'add disease Waitpox infection=0 death=0 recovery=0 course=chronic');
    command(sim, 'infect 1 Waitpox');
    command(sim, 'set disease Waitpox cure 100');
    sim.tick(false);
    assert.ok(sim.sicknesses.has('Waitpox'));
  });
});

describe('WorldLifeTests', () => {
  it('test_new_towns_are_founded_only_on_unclaimed_land', () => {
    const sim = new Simulation(2000, 3);
    for (let i = 0; i < 8; i++) sim.tick(false);
    const counts = g.settlement_counts(sim);
    const origin = biggest(sim);
    const site = dev.choose_site(sim, origin);
    if (site != null) {
      assert.equal(g.claim_owner(sim, site[0], site[1], counts), 0);
      for (const s of sim.settlements.values()) {
        if (s.abandoned == null) {
          assert.ok(g.dist(s.gx, s.gy, site[0], site[1]) >= 7);
        }
      }
    }
  });

  it('test_the_world_has_several_continents_and_islands', () => {
    const sim = new Simulation(400, 42);
    const sizes = [...g.world(sim).get('size').values()].sort((a, b) => b - a);
    assert.ok(sizes.filter(s => s >= 300).length >= 3);
    assert.ok(sizes.filter(s => 25 <= s && s < 300).length >= 2);
  });

  it('test_settlers_can_cross_the_sea_by_boat', () => {
    const sim = new Simulation(2000, 3);
    const origin = [...sim.settlements.values()].sort((a, b) => a.id - b.id).filter(s => g.is_coastal(sim, s))[0];
    sim.countries.get(origin.country).technologies.add('sailing');
    const site = dev.choose_site(sim, origin, undefined, undefined, true);
    assert.notEqual(site, null);
    const comp = g.world(sim).get('land');
    assert.notEqual(comp[site[1]][site[0]], comp[origin.gy][origin.gx]);
    const exp = dev.launch_expedition(sim, origin, undefined, undefined, site, true);
    assert.notEqual(exp, null);
    assert.equal(exp.get('mode'), 'sea');
    assert.ok(exp.get('path').slice(1, -1).some(([x, y]) => g.world(sim).get('terrain')[y][x] === 'ocean'));
    for (let i = 0; i < 25; i++) {
      sim.tick(false);
      if (!sim.expeditions.some(e => e.get('id') === exp.get('id'))) break;
    }
    assert.equal(sim.expeditions.some(e => e.get('id') === exp.get('id')), false);
  });

  it('test_armies_march_and_besiege', () => {
    const sim = new Simulation(2000, 14);
    const [land] = g.contacts(sim);
    const a = numSort(land.keys())[0];
    const b = numSort(land.get(a))[0];
    sim.war_chance = 0;
    const [output, action] = command(sim, `war "${sim.countries.get(a).name}" "${sim.countries.get(b).name}"`);
    assert.equal(action, 'edit', output);
    let seen = false;
    for (let i = 0; i < 12; i++) {
      sim.tick(false);
      for (const army of (sim.armies ?? [])) {
        seen = true;
        assert.ok(army.get('men') > 0);
        assert.ok(['marching', 'besieging'].includes(army.get('state')));
      }
      if (!sim.wars.size) break;
    }
    assert.ok(seen);
  });

  it('test_merchant_bands_travel_and_trade', () => {
    const sim = new Simulation(2000, 7);
    let most = 0;
    for (let i = 0; i < 45; i++) {
      sim.tick(false);
      most = Math.max(most, (sim.caravans ?? []).length);
      for (const c of (sim.caravans ?? [])) {
        assert.ok(c.get('size') >= 4);
        assert.ok(c.get('index') < c.get('path').length);
      }
    }
    assert.ok(most > 0);
  });

  it('test_wonders_are_unique_and_need_their_prerequisites', () => {
    const sim = new Simulation(2000, 3);
    const place = biggest(sim);
    const country = sim.countries.get(place.country);
    country.technologies.add('writing');
    sim.countries.get(place.country).capital = place.id;
    if (dev._available(sim, place, 'palace', 999)) {
      assert.notEqual(dev.start_project(sim, place, 'palace', false), null);
    }
    assert.equal(dev._available(sim, place, 'grand_academy', 999), false); // needs a university first
    place.buildings = new Map([['palace', 1]]);
    assert.equal(dev._available(sim, place, 'palace', 999), false);
    assert.ok(dev.BUILDINGS.has('palace'));
    assert.ok(dev.BUILDINGS.get('palace')[6]);
  });
});

describe('SystemsTests', () => {
  it('test_systems_report_and_cross_effects', () => {
    const sim = new Simulation(2000, 3);
    for (let i = 0; i < 6; i++) sim.tick(false);
    const cid = biggest(sim).country;
    for (const s of sim.settlements.values()) {
      if (s.country === cid) s.buildings = new Map(); // start from a country with nothing built
    }
    const base = systems.analyze(sim, cid);
    const place = biggest(sim, cid);
    place.buildings = new Map([['clinic', 1], ['well', 1], ['school', 1], ['walls', 1]]);
    let built = systems.analyze(sim, cid);
    assert.ok(built.get('death_mult') < base.get('death_mult'));
    assert.ok(built.get('infection_mult') < base.get('infection_mult'));
    assert.ok(built.get('research') > base.get('research'));
    assert.ok(built.get('defense_mult') < base.get('defense_mult'));
    sim.wars.clear();
    built = systems.analyze(sim, cid);
    const other = [...sim.countries.keys()].find(c => c !== cid);
    sim.wars.set([cid, other].sort((x, y) => x - y), sim.year);
    const warring = systems.analyze(sim, cid);
    assert.ok(warring.get('expansion') < built.get('expansion'));
    assert.ok(command(sim, 'systems')[0].includes('research'));
  });

  it('test_wars_need_a_shared_border', () => {
    const sim = new Simulation(2000, 14);
    for (let i = 0; i < 40; i++) {
      const before = [...sim.wars.keys()].map(p => JSON.stringify(p));
      sim.tick(false);
      const [land] = g.contacts(sim);
      for (const pair of sim.wars.keys()) {
        if (!before.includes(JSON.stringify(pair))) {
          assert.ok((land.get(pair[0]) ?? new Set()).has(pair[1]));
        }
      }
    }
  });
});
