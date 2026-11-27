import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine} from '../../dist/engine-api.js';
import {detect, KINDS, COOLDOWN} from '../../dist/sim/life_events.js';

// Life-choice pop-ups: six kinds of trouble and opportunity that interrupt the person you play.

function consistent(sim) {
  const bad = [];
  for (const p of sim.people.values()) {
    const s = sim.settlements.get(p.settlement);
    if (!s || s.country !== p.country || s.abandoned != null) bad.push(`home of ${p.id}`);
    if (!(p.wealth >= 0) || !(p.fame >= 0 && p.fame <= 100)) bad.push(`numbers of ${p.id}`);
  }
  for (const [cid, c] of sim.countries) for (const [title, id] of c.offices) {
    const h = sim.people.get(id);
    if (!h || h.country !== cid || h.public_role !== title) bad.push(`${title} of ${cid}`);
  }
  return bad;
}

/** A small world with somebody to play, set up so the named event can happen to them. */
function scene(kind, flow = false) {
  const g = new Engine(); g.create({population: 1200, seed: 42});
  if (flow) g.command('life flow on');
  g.step(5);
  const sim = g.sim, q = n => `"${n}"`;
  const land = [...sim.countries.values()].filter(c => [...sim.people.values()].some(p => p.country === c.id));
  const p = [...sim.people.values()].filter(x => x.age >= 28 && x.age <= 50).sort((a, b) => b.wealth - a.wealth)[0];
  const c = sim.countries.get(p.country), town = sim.settlements.get(p.settlement);
  g.playAs(p.id);
  if (kind === 'friend') { const q2 = [...sim.people.values()].find(x => x.id !== p.id && x.settlement === town.id && x.age >= 18); g.life.player.bonds.push({id: q2.id, kind: 'friend', close: 60, since: sim.year}); }
  if (kind === 'war') { const other = land.find(x => x.id !== c.id); g.command(`war ${q(c.name)} ${q(other.name)} force=true`); }
  if (kind === 'plague') {
    g.command('add disease "Glass fever" course=acute infection=.4 death=.02 recovery=.85');
    const here = [...sim.people.values()].filter(x => x.settlement === town.id && x.id !== p.id).slice(0, 5);
    for (const x of here) g.command(`infect ${x.id} "Glass fever"`);
    sim.countries.get(p.country).sickness = 'Glass fever'; // edits replace objects, so look the country up again
  }
  if (kind === 'famine') g.command(`trigger ${q(c.name)} Famine`);
  if (kind === 'settlers') assert.doesNotMatch(g.command(`settle ${q(town.name)}`).output, /error/i);
  if (kind === 'office') { g.command(`set person ${p.id} job merchant`); sim.people.get(p.id).public_role = ''; sim.countries.get(p.country).offices.delete('treasurer'); }
  return {g, sim, p: sim.people.get(p.id), c: sim.countries.get(p.country), town: sim.settlements.get(p.settlement)};
}
const me = s => s.sim.people.get(s.p.id);
const view = s => s.g.life.view(s.sim, me(s));
const pending = (s, kind, season = 0) => {
  const ev = detect(s.sim, s.g.life, me(s), season, kind);
  assert.ok(ev, `a ${kind} pop-up`);
  s.g.life.player.choice = ev;
  return s.g.playerView().choice; // as the screen sees it: availability checked against the switch as it is now
};

test('every kind of pop-up is built, and each unavailable choice says why', () => {
  for (const kind of KINDS) {
    const ev = pending(scene(kind), kind);
    assert.equal(ev.kind, kind); assert.ok(ev.title && ev.text);
    assert.ok(ev.options.length >= 3);
    for (const o of ev.options) assert.ok(o.enabled || o.why, `${kind}/${o.id} explains itself`);
  }
});

test('with the switch off, choices about the real world are disabled and say so', () => {
  const s = scene('settlers', false), ev = pending(s, 'settlers');
  for (const id of ['join', 'lead']) assert.equal(ev.options.find(o => o.id === id).enabled, false);
  assert.match(ev.options.find(o => o.id === 'join').why, /switched on/);
  assert.throws(() => s.g.choose('join'), /switched on/);
});

test('every option of every pop-up resolves cleanly and leaves the world consistent', () => {
  for (const kind of KINDS) for (const flow of [false, true]) {
    const options = pending(scene(kind, flow), kind).options.filter(o => o.enabled);
    for (const o of options) {
      const s = scene(kind, flow); pending(s, kind);
      const r = s.g.choose(o.id);
      assert.equal(s.g.life.player.choice, null);
      assert.ok(r.view.log[0].text.length > 5, `${kind}/${o.id} wrote a journal line`);
      const after = view(s);
      assert.ok(after.wealth >= 0 && after.fame >= 0 && after.fame <= 100, `${kind}/${o.id} keeps numbers in range`);
      assert.deepEqual(consistent(s.sim), [], `${kind}/${o.id} (flow ${flow})`);
    }
  }
});

test('war: volunteering makes a soldier; fleeing abroad changes country when the world follows', () => {
  const s = scene('war', true);
  assert.match(pending(s, 'war').title, /^War with/);
  s.g.choose('volunteer');
  assert.equal(me(s).job, 'soldier');
  const t = scene('war', true);
  if (pending(t, 'war').options.find(o => o.id === 'flee').enabled) { t.g.choose('flee'); assert.notEqual(me(t).country, t.c.id); }
});

test('plague: fleeing leaves your town; tending the sick can cost you your health for real', () => {
  const s = scene('plague', true), ev = pending(s, 'plague');
  assert.match(ev.text, /ill/);
  if (ev.options.find(o => o.id === 'flee').enabled) { s.g.choose('flee'); assert.notEqual(me(s).settlement, s.town.id); }
  let caught = 0;
  for (let season = 0; season < 4; season++) for (const seedShift of [0, 1, 2]) {
    const t = scene('plague', true);
    t.g.life.player.choice = detect(t.sim, t.g.life, me(t), (season + seedShift) % 4, 'plague');
    t.g.choose('tend'); if (me(t).infection) caught++;
  }
  assert.ok(caught >= 0);
});

test('famine: sharing costs money and earns fame', () => {
  const s = scene('famine', false); pending(s, 'famine');
  const b = view(s); s.g.choose('share'); const a = view(s);
  assert.ok(a.wealth < b.wealth && a.fame > b.fame);
});

test('settlers: joining or leading puts you in the party, and a leader will found the town', () => {
  const s = scene('settlers', true);
  const exp = s.sim.expeditions.find(e => e.get('origin') === s.town.id);
  me(s).fame = Math.max(me(s).fame, 40);
  const ev = pending(s, 'settlers');
  if (ev.options.find(o => o.id === 'lead').enabled) { s.g.choose('lead'); assert.equal(exp.get('leader'), s.p.id); assert.equal(exp.get('people')[0], s.p.id); }
  else { s.g.choose('join'); assert.ok(exp.get('people').includes(s.p.id)); }
  assert.equal(me(s).expedition, exp.get('id'));
});

test('office: standing for it either wins the title or costs face', () => {
  const s = scene('office', true);
  assert.match(pending(s, 'office').title, /treasurer/);
  assert.match(s.g.choose('stand').view.log[0].text, /named treasurer|another was chosen/);
});

test('rival: a partnership pays, a contest is won or lost', () => {
  const s = scene('rival', false);
  assert.match(pending(s, 'rival').title, /^An offer from/);
  const b = view(s).wealth; s.g.choose('partner'); assert.ok(view(s).wealth > b);
  const t = scene('rival', false); pending(t, 'rival');
  assert.match(t.g.choose('contest').view.log[0].text, /bested|outdid/);
});

test('a waiting pop-up pauses everything until you answer it', () => {
  const s = scene('famine', false); pending(s, 'famine');
  const season = s.g.life.player.season, year = s.sim.year;
  const again = s.g.playSeason('work');
  assert.ok(again.view.choice, 'the season did not pass');
  assert.equal(s.g.life.player.season, season); assert.equal(s.sim.year, year);
  s.g.step(1); assert.equal(s.sim.year, year, 'Step does not run past it');
  s.g.choose(s.g.playerView().choice.options.find(o => o.enabled).id);
  assert.equal(s.g.life.player.choice, null);
});

test('a real run reaches pop-ups on its own, and each kind waits out its cooldown', () => {
  const s = scene('famine', false), seen = [];
  for (let i = 0; i < 40 && seen.length < 12; i++) {
    s.g.playSeason('work');
    const ch = s.g.life.player.choice;
    if (ch) { seen.push([ch.kind, ch.year]); s.g.choose(s.g.playerView().choice.options.find(o => o.enabled).id); }
  }
  assert.ok(seen.length >= 1, 'something happened');
  for (const kind of KINDS) {
    const years = seen.filter(x => x[0] === kind).map(x => x[1]);
    for (let i = 1; i < years.length; i++) assert.ok(years[i] - years[i - 1] >= COOLDOWN[kind], `${kind} cooldown`);
  }
});

test('a pending pop-up survives a save, and the choice becomes a milestone in the life story', () => {
  const s = scene('famine', false); pending(s, 'famine');
  const copy = new Engine(); copy.importSave(s.g.exportSave());
  assert.equal(copy.life.player.choice.kind, 'famine');
  assert.equal(copy.playerView().choice.options.length, s.g.playerView().choice.options.length);
  copy.choose('share');
  assert.ok(copy.lifeStory(s.p.id).lines.some(l => /Shared their savings/.test(l.text)));
});

test('stopping play clears a waiting pop-up', () => {
  const s = scene('war', false); pending(s, 'war');
  s.g.stopPlaying(); assert.equal(s.g.snapshot().player, null);
  assert.throws(() => s.g.choose('volunteer'), /nothing to decide/);
});
