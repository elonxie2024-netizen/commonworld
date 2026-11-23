import {describe, it, beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../../dist/sim/civsim.js';
import {command} from '../../dist/sim/civic.js';
import {TECHNOLOGIES, insight_of} from '../../dist/sim/society.js';
import {researchable} from '../../dist/sim/technology.js';
import {world, WATER} from '../../dist/sim/geography.js';
import {serialize} from '../../dist/sim/runtime.js';

// The world influences in the browser toolbar: `inspire` (seed an idea) and disasters aimed at a cell.
describe('InfluenceTests', () => {
  let sim;
  beforeEach(() => {
    sim = new Simulation(1000, 23, 1_000_000, 0, 0, 0, 0);
  });

  function edit(text) {
    const [output, action] = command(sim, text);
    assert.equal(action, 'edit', `${text}: ${output}`);
    return output;
  }

  function invalid(text) {
    const before = serialize(sim);
    const [output, action] = command(sim, text);
    assert.equal(action, 'inspect', `${text}: ${output}`);
    assert.equal(serialize(sim), before, text);
  }

  it('inspire_seeds_part_of_a_ready_discovery_without_random_numbers', () => {
    const rng = JSON.stringify(sim.rng.getstate());
    const output = edit(`inspire "${sim.countries.get(1).name}"`);
    const c = sim.countries.get(1); // edits may replace state objects, so look the country up again
    assert.match(output, /An idea about .+ took hold in/);
    assert.equal(JSON.stringify(sim.rng.getstate()), rng, 'a seeded idea draws no random numbers');
    const [[name, amount]] = [...insight_of(c)];
    assert.ok(researchable(c.technologies).includes(name));
    assert.ok(amount > 0 && amount < TECHNOLOGIES.get(name)[1], 'part of the cost, not the whole discovery');
    assert.ok(!c.technologies.has(name), 'it is not learned on the spot');
  });

  it('inspire_named_discovery_adds_up_without_passing_the_cost', () => {
    const c = sim.countries.get(1), name = researchable(c.technologies)[0];
    edit(`inspire "${c.name}" "${name}"`);
    const once = insight_of(sim.countries.get(1)).get(name);
    for (let i = 0; i < 3; i++) edit(`inspire "${c.name}" "${name}"`);
    const total = insight_of(sim.countries.get(1)).get(name);
    assert.ok(once > 0 && total > once, 'the seeds add up');
    assert.ok(total <= TECHNOLOGIES.get(name)[1] * 4 / 3 + 1e-9, 'each seed is at most a third of the cost');
  });

  it('inspire_rejects_unready_and_unknown_discoveries', () => {
    const c = sim.countries.get(1);
    const far = [...TECHNOLOGIES.keys()].find(n => !researchable(c.technologies).includes(n) && !c.technologies.has(n));
    invalid(`inspire "${c.name}" "${far}"`);
    invalid(`inspire "${c.name}" "Nonsense engine"`);
    invalid('inspire');
  });

  it('inspire_can_be_undone', () => {
    const c = sim.countries.get(1), before = serialize(sim);
    edit(`inspire "${c.name}"`);
    edit('undo');
    assert.equal(serialize(sim), before);
  });

  it('disaster_strikes_the_chosen_cell', () => {
    const terrain = world(sim).get('terrain');
    const s = [...sim.settlements.values()][0];
    edit(`disaster "${sim.countries.get(s.country).name}" flood severity=minor x=${s.gx} y=${s.gy}`);
    const last = sim.disaster_log.at(-1);
    assert.equal(last.get('x'), s.gx);
    assert.equal(last.get('y'), s.gy);
    let water = null;
    terrain.forEach((row, y) => row.forEach((t, x) => { if (!water && WATER.includes(t)) water = [x, y]; }));
    invalid(`disaster "${sim.countries.get(s.country).name}" storm x=${water[0]} y=${water[1]}`);
    invalid(`disaster "${sim.countries.get(s.country).name}" storm x=${s.gx}`);
  });
});
