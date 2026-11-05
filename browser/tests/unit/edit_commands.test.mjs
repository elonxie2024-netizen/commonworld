import {describe, it, beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../../dist/sim/civsim.js';
import {command} from '../../dist/sim/civic.js';
import {INNOVATIONS} from '../../dist/sim/discoveries.js';
import {TECHNOLOGIES} from '../../dist/sim/society.js';
import {advance_cures} from '../../dist/sim/epidemiology.js';
import {serialize, deepClone} from '../../dist/sim/runtime.js';

const assertNone = (value, message) => assert.ok(value == null, message ?? `expected None, got ${String(value)}`);
const isSubset = (a, b) => [...a].every(x => b.has(x));
const sum = values => values.reduce((a, b) => a + b, 0);
const count = (items, fn) => items.filter(fn).length;

describe('EditCommandTests', () => {
  let sim;
  beforeEach(() => {
    // Simulation(population, seed, capacity, lineage_chance, country_chance, war_chance, disaster_chance)
    sim = new Simulation(1000, 23, 1_000_000, 0, 0, 0, 0);
  });

  function edit(text) {
    const year = sim.year;
    const [output, action] = command(sim, text);
    assert.equal(action, 'edit', `${text}: ${output}`);
    assert.ok(output);
    assert.equal(sim.year, year, text);
    return output;
  }

  function invalid(text) {
    const before = serialize(sim);
    const [output, action] = command(sim, text);
    assert.equal(action, 'inspect', `${text}: ${output}`);
    assert.ok(output);
    assert.equal(serialize(sim), before, text);
  }

  function ownership() {
    for (const person of sim.people.values()) {
      assertNone(person.died);
      const place = sim.settlements.get(person.settlement);
      assert.equal(person.country, place.country);
      assertNone(place.abandoned);
    }
    for (const country of sim.countries.values()) {
      if (country.capital != null) assert.equal(sim.settlements.get(country.capital).country, country.id);
    }
    assert.equal(sum([...sim.lineages.values()].map(x => x.deaths)),
      count([...sim.archive.values()], x => x.died != null));
  }

  it('test_scalar_edits_and_readonly_changes', () => {
    edit('set person 1 wealth 123.5');
    edit('set person 1 age 44');
    edit('set country 1 economy communism');
    edit('set simulation war_chance 0.25');
    assert.equal(sim.people.get(1).wealth, 123.5);
    assert.equal(sim.people.get(1).age, 44);
    assert.equal(sim.countries.get(1).economic_system, 'communism');
    assert.equal(sim.war_chance, .25);
    const before = serialize(sim);
    assert.equal(command(sim, 'changes')[1], 'inspect');
    assert.equal(serialize(sim), before);
  });

  it('test_invalid_input_preserves_everything_including_rng', () => {
    for (const text of ['set person 999999 wealth 3', 'set person 1 wealth nan',
      'set person 1 wealth -2', 'set person 1 age -1',
      'set country 1 food inf', 'set country 1 economy nonsense',
      'set simulation war_chance 1.1', 'set person 1 unknown 3',
      'add person 99999', 'add disease Bad infection=2',
      'add settlement 1 residents=99999', 'move person 1 999999',
      'delete country 1 to=1', 'war 1 1']) {
      invalid(text);
    }
  });

  it('test_invalid_command_preserves_previous_undo', () => {
    const old = sim.people.get(1).wealth;
    edit('set person 1 wealth 321');
    invalid('set person 1 wealth NaN');
    edit('undo');
    assert.equal(sim.people.get(1).wealth, old);
  });

  it('test_undo_restores_generated_person_and_rng', () => {
    const before = serialize(sim);
    const sid = sim.people.get(1).settlement;
    edit(`add person ${sid} age=25`);
    edit('undo');
    assert.equal(serialize(sim), before);
  });

  it('test_add_delete_person_archives_death_and_settles_estate', () => {
    const sid = sim.people.get(1).settlement;
    const before = new Set(sim.people.keys());
    edit(`add person ${sid} name=Testchild age=0 parent=1`);
    const added = [...sim.people.keys()].filter(k => !before.has(k));
    assert.equal(added.length, 1);
    const child_id = added[0];
    assert.ok(sim.people.get(child_id).parents.includes(1));
    edit('set person 1 wealth 100');
    const heirs = [...sim.people.values()].filter(p => p.parents.includes(1));
    const fortunes = new Map(heirs.map(p => [p.id, p.wealth]));
    edit('delete person 1');
    assert.equal(sim.people.has(1), false);
    assert.equal(sim.archive.get(1).died, sim.year);
    assert.equal(sim.archive.get(1).wealth, 0);
    for (const heir of heirs) {
      assert.ok(Math.abs(sim.people.get(heir.id).wealth - (fortunes.get(heir.id) + 100 / heirs.length)) < 0.5e-7);
    }
    ownership();
  });

  it('test_relocation_updates_country_and_offices', () => {
    const dest = [...sim.settlements.values()].find(s => s.country === 2);
    const person = sim.countries.get(1).ruler;
    edit(`move person ${person} ${dest.id}`);
    assert.equal(sim.people.get(person).country, 2);
    assert.notEqual(sim.countries.get(1).ruler, person);
    assert.equal([...sim.countries.get(1).offices.values()].includes(person), false);
    ownership();
  });

  it('test_settlement_creation_deletion_relocates_people', () => {
    const before = new Set(sim.settlements.keys());
    const n = sim.people.size;
    edit('add settlement 1 name=Newhaven residents=40');
    const added = [...sim.settlements.keys()].filter(k => !before.has(k));
    assert.equal(added.length, 1);
    const sid = added[0];
    const residents = [...sim.people.values()].filter(p => p.settlement === sid).map(p => p.id);
    assert.equal(residents.length, 40);
    const dest = [...sim.settlements.values()].find(s => s.country === 1 && s.id !== sid);
    edit(`delete settlement ${sid} to=${dest.id}`);
    assert.equal(sim.people.size, n);
    assert.ok(residents.every(pid => sim.people.get(pid).settlement === dest.id));
    assert.notEqual(sim.settlements.get(sid).abandoned, null);
    assert.notEqual(sim.settlements.get(sid).abandoned, undefined);
    ownership();
  });

  it('test_country_creation_and_annexation_preserve_ownership', () => {
    const sid = sim.people.get(1).settlement;
    const before = new Set(sim.countries.keys());
    const n = sim.people.size;
    edit(`add country ${sid} name=Testland`);
    const added = [...sim.countries.keys()].filter(k => !before.has(k));
    assert.equal(added.length, 1);
    const cid = added[0];
    assert.equal(sim.settlements.get(sid).country, cid);
    ownership();
    edit(`delete country ${cid} to=2`);
    assert.equal(sim.people.size, n);
    assert.ok(sim.countries.get(cid).ended != null);
    assert.equal([...sim.people.values()].some(p => p.country === cid), false);
    assert.equal([...sim.settlements.values()].some(s => s.country === cid && s.abandoned == null), false);
    ownership();
  });

  it('test_new_lineage_preserves_parent_branch', () => {
    const old = sim.people.get(1).lineage;
    edit('add lineage 1 surname=Tester');
    const new_ = sim.people.get(1).lineage;
    assert.notEqual(old, new_);
    assert.equal(sim.lineages.get(new_).parent_lineage, old);
    assert.equal(sim.lineages.get(new_).surname, 'Tester');
  });

  it('test_disease_infection_cure_outbreak_eradication', () => {
    edit('add disease Testfever course=acute infection=0.3 death=0.01 recovery=0.9');
    edit('infect 1 Testfever');
    assert.equal(sim.people.get(1).infection, 'Testfever');
    edit('cure 1');
    assertNone(sim.people.get(1).infection);
    edit('outbreak 2 Testfever cases=7');
    assert.equal(count([...sim.people.values()], p => p.infection === 'Testfever'), 7);
    invalid('delete disease Testfever'); // no cure yet
    edit('set disease Testfever cure 100');
    invalid('eradicate Testfever'); // cured, but people are still infected
    for (const person of [...sim.people.values()].filter(p => p.infection === 'Testfever')) {
      edit(`cure ${person.id}`);
    }
    edit('eradicate Testfever');
    assert.equal([...sim.people.values()].some(p => p.infection === 'Testfever'), false);
    assert.equal(sim.sicknesses.has('Testfever'), false);
  });

  it('test_scientists_and_healers_build_cure_progress', () => {
    edit('add disease Slowpox course=acute infection=0.3 death=0.01 recovery=0.9');
    for (const person of [...sim.people.values()].slice(0, 60)) {
      person.job = person.age >= 18 ? 'healer' : person.job;
    }
    for (let i = 0; i < 5; i++) advance_cures(sim);
    const first = sim.cure_progress.get('Slowpox');
    assert.ok(first > 0);
    assert.ok(first < 100);
    assert.ok(command(sim, 'disease Slowpox')[0].includes('Cure progress'));
  });

  it('test_discovery_prerequisites_and_cascading_revocation', () => {
    invalid('grant 1 "crop rotation"');
    invalid('grant 1 irrigation');
    for (const base of ['"stone tools"', '"seed gathering"', 'irrigation']) edit(`grant 1 ${base}`);
    invalid('grant 1 "crop rotation"');
    for (const base of ['"animal husbandry"', 'composting']) edit(`grant 1 ${base}`);
    edit('grant 1 "crop rotation"');
    const innovation = [...INNOVATIONS.values()].find(i => isSubset(i.prerequisites, sim.countries.get(1).technologies));
    edit(`grant 1 ${innovation.id}`);
    assert.ok(sim.countries.get(1).innovations.has(innovation.id));
    edit('revoke 1 irrigation');
    const c = sim.countries.get(1);
    assert.equal(c.technologies.has('crop rotation'), false);
    for (const tech of c.technologies) {
      assert.ok(isSubset(TECHNOLOGIES.get(tech)[0], c.technologies));
    }
    for (const key of c.innovations.keys()) {
      assert.ok(isSubset(INNOVATIONS.get(key).prerequisites, c.technologies));
    }
  });

  it('test_war_and_negotiated_peace', () => {
    edit('war 1 2');
    assert.ok(sim.wars.has([1, 2]));
    edit('peace 1 2 years=5');
    assert.equal(sim.wars.has([1, 2]), false);
    invalid('war 1 2');
    edit('war 1 2 force=true');
    assert.ok(sim.wars.has([1, 2]));
  });

  it('test_famine_trigger_and_relief', () => {
    edit('trigger 1 Famine');
    const c = sim.countries.get(1);
    assert.ok(c.conditions.has('Famine'));
    assert.ok(c.crisis_until.get('Famine') - sim.year <= 5);
    edit('trigger 1 Abundance');
    assert.equal(sim.countries.get(1).conditions.has('Famine'), false);
  });

  it('test_historical_years_frozen_and_next_tick_accounting', () => {
    sim.tick(false);
    const reports = deepClone(sim.yearly_reports);
    const sid = sim.settlements.keys().next().value;
    edit(`add person ${sid} name=Newperson age=30`);
    edit('delete person 1');
    assert.deepStrictEqual(sim.yearly_reports, reports);
    assert.equal(sim.pending_interventions.get('added'), 1);
    assert.equal(sim.pending_interventions.get('deaths'), 1);
    const start = sim.people.size;
    const archive_deaths = count([...sim.archive.values()], p => p.died != null);
    const [births, deaths] = sim.tick(false);
    assert.equal(sim.people.size, start + births - deaths);
    assert.equal(count([...sim.archive.values()], p => p.died != null) - archive_deaths, deaths);
    assert.equal(sum([...sim.yearly_reports.at(-1).get('death_causes').values()]), deaths);
    ownership();
    invalid('undo');
  });

  it('test_disaster_deaths_are_accounted_and_undoable', () => {
    const before = serialize(sim);
    const population = sim.people.size;
    edit('disaster 1 flood severity=major');
    const deaths = population - sim.people.size;
    assert.ok(deaths >= 0);
    assert.equal(sim.pending_interventions.get('deaths'), deaths);
    ownership();
    edit('undo');
    assert.equal(serialize(sim), before);
  });

  it('test_settlement_transfer_moves_all_residents', () => {
    const sid = sim.people.get(1).settlement;
    const residents = [...sim.people.values()].filter(p => p.settlement === sid).map(p => p.id);
    edit(`set settlement ${sid} country 2`);
    assert.ok(residents.every(pid => sim.people.get(pid).country === 2));
    ownership();
  });

  it('test_ambiguous_names_do_not_select_arbitrary_person', () => {
    edit('set person 1 name "Shared Name"');
    edit('set person 2 name "Shared Name"');
    invalid('set person "Shared Name" wealth 15');
  });

  it('test_inspection_with_undo_preserves_complete_state', () => {
    edit('add disease Testfever');
    edit('outbreak 1 Testfever cases=5');
    edit('war 1 2');
    const before = serialize(sim);
    for (const text of ['person 1', 'people country=1 page=2', 'settlement 1',
      'settlements country=1', 'demographics', 'demographics 1',
      'wars', 'wars 1', 'diseases', 'diseases 1', 'disease Testfever',
      'catalog irrigation', 'catalog page=2', 'changes', 'help edit']) {
      assert.equal(command(sim, text)[1], 'inspect');
      assert.equal(serialize(sim), before, text);
    }
  });

  it('test_eradicating_established_endemic_disease_then_tick', () => {
    edit('add disease "Mild cold" course=endemic death=0');
    edit('outbreak 1 "Mild cold" cases=10');
    sim.tick(false);
    assert.ok(sim.countries.get(1).disease_outbreaks.has('Mild cold'));
    edit('set disease "Mild cold" cure 100');
    for (const person of [...sim.people.values()].filter(p => p.infection === 'Mild cold')) {
      edit(`cure ${person.id}`);
    }
    edit('delete disease "Mild cold"');
    assert.ok(command(sim, 'disease "Mild cold"')[0].includes('retired'));
    for (let i = 0; i < 3; i++) {
      sim.tick(false);
      assert.equal([...sim.people.values()].some(p => p.infection === 'Mild cold'), false);
      ownership();
    }
  });

  it('test_rejected_options_huge_numbers_and_parent_ages', () => {
    edit('add person 1 age=0 parent=1');
    for (const text of ['set person 1 age 5', 'add person 1 age=80 parent=1',
      'set person 1 wealth 1e308', 'set person 1 age ' + '9'.repeat(400),
      'add person 1 surname=Vale parent=1', 'add person 1 typo=3',
      'set country 1 ruler 999999', 'add disease "bad quote',
      'delete settlement 1', 'delete country 1']) {
      invalid(text);
    }
  });

  it('test_edit_country_and_settlement_then_continue_naturally', () => {
    edit('add settlement 1 name=Newhaven residents=30');
    edit('add country 5 name=Newland');
    edit('set country 3 government council');
    edit('set country 3 economy capitalism');
    edit('grant 3 counting');
    edit('add person 5 name=Ada age=30 surname=Vale');
    edit('set person 1001 job scientist');
    edit('set country 3 ruler 1001');
    edit('add lineage 1001 surname=Branch');
    edit('delete country 2 to=3');
    for (let i = 0; i < 10; i++) {
      const before = sim.people.size;
      const [births, deaths] = sim.tick(false);
      assert.equal(sim.people.size, before + births - deaths);
      ownership();
    }
  });

  // The Python original spawned the real CLI (civsim.py --years 2 --population 1000 --seed 23) and fed it
  // these lines on stdin. The JS port has no CLI, so this replays the same session loop in-process
  // (civsim.py main(): command output indented four spaces, Enter advances a year, quit stops).
  it('test_real_cli_edit_and_inspection_session', () => {
    const inputs = ['demographics', 'people page=2', 'person 1', 'settlements',
      'add disease "Glass fever" death=0', 'outbreak 1 "Glass fever" cases=3',
      'disease "Glass fever"', 'set person 1 wealth 500',
      'add person 1 name=Ada age=25 surname=Vale', 'person 1001',
      'delete person 1001', 'person 1001', 'undo',
      'add settlement 1 name=Newhaven residents=40',
      'add country 5 name=Newland', 'war 1 2', 'wars', 'changes', '',
      'peace 1 2', 'wars', 'quit', ''];
    const cli = new Simulation(1000, 23, 1_000_000, 0.002, 0.04, 0.10, 0.02);
    const out = [cli.format_year(cli.yearly_reports[0]), '\n    Enter advances one year. Type help for inspection commands, or quit to stop.'];
    let next = 0, stopped = false;
    for (let year = 0; year < 2 && !stopped; year++) {
      for (;;) {
        out.push(`\n    Year ${cli.year + 1} — Enter or command: `);
        if (next >= inputs.length) { stopped = true; break; } // EOF
        const [output, action] = command(cli, inputs[next++]);
        if (output) out.push(output.split(/\r?\n/).map(line => (line ? '    ' + line : '')).join('\n'));
        if (action === 'quit') { stopped = true; break; }
        if (action === 'next') break;
      }
      if (stopped) break;
      cli.tick(false);
      out.push('\n' + cli.format_year(cli.yearly_reports.at(-1)));
    }
    const stdout = out.join('\n');
    assert.ok(!stdout.includes('Command error:'));
    assert.ok(stdout.includes('Person: Ada Vale'));
    assert.ok(stdout.includes('Status: deceased'));
    assert.ok(stdout.includes('Undid the most recent edit'));
    assert.ok(stdout.includes('editor additions 1, editor deaths 0'));
    assert.deepEqual(stdout.split(/\r?\n/).filter(line => line.startsWith('Year ')), ['Year 0', 'Year 1']);
  });
});
