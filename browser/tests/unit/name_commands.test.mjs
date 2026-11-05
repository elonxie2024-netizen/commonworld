// Name-first controls and optional advanced ID search (port of test_name_commands.py).
import {describe, it, beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../../dist/sim/civsim.js';
import {command} from '../../dist/sim/civic.js';
import {INNOVATIONS} from '../../dist/sim/discoveries.js';
import {serialize, isSubset} from '../../dist/sim/runtime.js';

describe('NameCommandTests', () => {
  let sim;
  beforeEach(() => {
    sim = new Simulation(1000, 15, undefined, undefined, 0, 0); // country_chance=0, war_chance=0
    sim.countries.get(1).name = 'Arden';
    sim.countries.get(2).name = 'Newland';
    sim.settlements.get(1).name = 'River Town';
    sim.settlements.get(2).name = 'Hill Town';
    sim.lineages.get(1).surname = 'Vale';
    sim.lineages.get(2).surname = 'Vale';
    for (const pid of [1, 2, 3]) {
      const p = sim.people.get(pid);
      p.first = 'Mara'; p.age = 30; p.born = -30;
    }
    sim.name_holders.clear();
    for (const p of sim.archive.values()) sim.register_name(p);
  });

  const edit = text => {
    const [output, action] = command(sim, text);
    assert.equal(action, 'edit', output);
    assert.equal(sim.year, 0);
    return output;
  };

  it('test_short_roman_names_choose_exact_person', () => {
    for (const [roman, pid] of [['I', 1], ['II', 2], ['III', 3]]) {
      edit(`set person "Mara Vale ${roman}" wealth ${pid * 123}`);
      assert.equal(sim.people.get(pid).wealth, pid * 123);
      const output = command(sim, `person Mara Vale ${roman}`)[0];
      assert.ok(output.startsWith(`Person: Mara Vale ${roman} of Arden\n`));
    }
  });

  it('test_ambiguity_lists_copyable_names_not_id_instructions', () => {
    const before = serialize(sim);
    const [output, action] = command(sim, 'set person "Mara Vale" wealth 500');
    assert.equal(action, 'inspect');
    assert.ok(output.includes('Mara Vale I of Arden'));
    assert.ok(output.includes('Mara Vale II of Arden'));
    assert.ok(output.includes('full names'));
    assert.ok(!output.includes('Use an ID'));
    assert.doesNotMatch(output, /#\d+/);
    assert.equal(serialize(sim), before);
  });

  it('test_missing_roman_i_cannot_modify_roman_ii', () => {
    edit('delete person "Mara Vale I of Arden"');
    const before = serialize(sim);
    const [result, action] = command(sim, 'set person "Mara Vale I" wealth 999');
    assert.equal(action, 'inspect');
    assert.ok(result.includes('No living person'));
    assert.equal(serialize(sim), before);
    assert.ok(command(sim, 'person Mara Vale I')[0].includes('deceased'));
  });

  it('test_everyday_views_show_names_without_indices', () => {
    for (const text of ['people Mara', 'person Mara Vale II', 'settlements',
      'settlement River Town', 'countries', 'richest', 'notables', 'demographics']) {
      const [output, action] = command(sim, text);
      assert.equal(action, 'inspect');
      assert.doesNotMatch(output, /#\d+/);
      assert.ok(!output.includes('using its ID'));
    }
    assert.ok(command(sim, 'help')[0].includes('person NAME'));
    assert.ok(command(sim, 'help edit')[0].includes('Mara Vale II of Arden'));
  });

  it('test_ids_search_is_readonly_with_undo_available', () => {
    edit('set person "Mara Vale II" wealth 500');
    const before = serialize(sim);
    const cases = [['ids person Mara', 'person [2]: Mara Vale II of Arden'],
      ['ids country Arden', 'country [1]: Arden'],
      ['ids settlement "River Town"', 'settlement [1]: River Town'],
      ['ids lineage Vale', 'lineage [2]: Vale II'],
      ['ids discovery "seed selection"', '00-01-00'],
      ['ids Mara', 'person [2]'],
      ['ids person #2', 'Mara Vale II of Arden'],
      ['ids person page=2', 'page 2/'],
      ['ids person page=0', 'positive integer'],
      ['help ids', 'Optional advanced ID lookup']];
    for (const [text, expected] of cases) {
      const [output, action] = command(sim, text);
      assert.equal(action, 'inspect');
      assert.ok(output.includes(expected), text);
      assert.equal(serialize(sim), before, text);
    }
    edit('undo');
  });

  it('test_ids_remain_usable_after_lookup', () => {
    assert.ok(command(sim, 'ids person "Mara Vale II"')[0].includes('person [2]:'));
    edit('set person #2 wealth 700');
    assert.equal(sim.people.get(2).wealth, 700);
    assert.deepEqual(command(sim, 'person #2'), command(sim, 'person Mara Vale II'));
  });

  it('test_names_in_filters_parents_lineages_and_destinations', () => {
    assert.ok(command(sim, 'people country=Arden')[0].includes('500 matches'));
    assert.ok(command(sim, 'people settlement="River Town"')[0].includes('250 matches'));
    edit('add person "River Town" name=Ada parent="Mara Vale II of Arden"');
    const child = sim.people.get(1001);
    assert.deepEqual([...child.parents], [2]);
    edit('set person "Mara Vale II" lineage "Vale II"');
    assert.equal(sim.people.get(2).lineage, 2);
    edit('move person "Mara Vale II of Arden" "Hill Town"');
    assert.equal(sim.people.get(2).settlement, 2);
    edit('set country Arden ruler "Mara Vale II of Arden"');
    assert.equal(sim.countries.get(1).ruler, 2);
    edit('add settlement Arden name=Newhaven founder="Mara Vale II of Arden" residents=10');
    edit('delete settlement Newhaven to="River Town"');
    assert.equal(sim.people.get(2).settlement, 1);
  });

  it('test_discovery_names_and_advanced_keys_both_work', () => {
    for (const base of ['"stone tools"', '"seed gathering"', 'irrigation']) edit(`grant Arden ${base}`);
    const innovation = [...INNOVATIONS.values()].find(i => isSubset(i.prerequisites, sim.countries.get(1).technologies));
    edit(`grant Arden "${innovation.name}"`);
    assert.ok(sim.countries.get(1).innovations.has(innovation.id));
    assert.ok(command(sim, `ids discovery "${innovation.name}"`)[0].includes(innovation.id));
    edit(`revoke 1 ${innovation.id}`);
    assert.ok(!sim.countries.get(1).innovations.has(innovation.id));
  });
});
