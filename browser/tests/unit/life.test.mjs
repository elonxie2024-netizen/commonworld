import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine} from '../../dist/engine-api.js';
import {Life, MAX_TAGS} from '../../dist/sim/life.js';

// One 40-year world shared by the read-only checks.
const e = new Engine();
e.create({population: 1500, seed: 42});
e.step(40);
const tagged = [...e.life.tags];

test('big events leave a few milestone tags, not a biography for everyone', () => {
  assert.ok(tagged.length > 0);
  assert.ok(tagged.every(([, list]) => list.length <= MAX_TAGS));
  const codes = new Set(tagged.flatMap(([, list]) => list.map(t => t[1])));
  for (const code of ['survived', 'job', 'fought']) assert.ok(codes.has(code), `expected some ${code} tags`);
  assert.ok(tagged.length < e.sim.archive.size, 'most people have no tags');
});

test('the richest tier is tagged once, not every year', () => {
  for (const [, list] of tagged) {
    const tiers = list.filter(t => t[1] === 'rich').map(t => t[2]);
    assert.deepEqual(tiers, [...tiers].sort((a, b) => a - b));
    assert.equal(new Set(tiers).size, tiers.length);
  }
});

test('a story is stitched together on demand and ends with the death', () => {
  const dead = tagged.find(([id]) => e.sim.archive.get(id).died != null && e.sim.archive.get(id).cause_of_death);
  const s = e.lifeStory(dead[0]);
  assert.match(s.lines[0].text, /^Born/);
  assert.match(s.lines.at(-1).text, /^Died aged/);
  assert.ok(s.lines.every((l, i, a) => i === 0 || a[i - 1].year <= l.year), 'in order');
  assert.match(s.summary, /^died at \d+/);
  const living = tagged.find(([id]) => e.sim.people.has(id));
  assert.match(e.lifeStory(living[0]).summary, /^\d+, /);
  assert.equal(e.lifeStory(99999999), null);
});

test('founders are credited with their towns', () => {
  const founder = tagged.find(([, list]) => list.some(t => t[1] === 'founded'));
  assert.ok(founder, 'a town was founded in 40 years');
  const id = founder[1].find(t => t[1] === 'founded')[2];
  assert.ok(e.lifeStory(founder[0]).lines.some(l => l.text === `Founded ${e.sim.settlements.get(id).name}.`));
});

test('tags survive save and load, and old saves still load', () => {
  const copy = new Engine();
  copy.importSave(e.exportSave());
  assert.equal(JSON.stringify([...copy.life.tags]), JSON.stringify(tagged));
  const old = new Engine();
  const plain = e.exportSave(); // strip the life field the way an older save lacks it
  old.importSave(plain.slice(0, plain.lastIndexOf(',"life":')) + '}');
  assert.equal(old.life.tags.size, 0);
  assert.equal(old.step().year, e.sim.year + 1);
});

test('the layer never changes the world: same seed, same future with or without it watching', () => {
  const a = new Engine(), b = new Engine();
  a.create({population: 400, seed: 9}); b.create({population: 400, seed: 9});
  a.step(15);
  for (let i = 0; i < 15; i++) b.sim.tick(false); // no life layer at all
  assert.equal(JSON.stringify(a.sim.rng.getstate()), JSON.stringify(b.sim.rng.getstate()));
  assert.equal(a.sim.people.size, b.sim.people.size);
});

test('tags are capped and the least notable is forgotten first', () => {
  const life = new Life();
  life.add(1, 1, 'founded', 5);
  for (let y = 2; y < 60; y++) life.add(1, y, 'moved', y);
  const list = life.tags.get(1);
  assert.equal(list.length, MAX_TAGS);
  assert.ok(list.some(t => t[1] === 'founded'));
  life.add(2, 1, 'fought', 7, 1); life.add(2, 2, 'fought', 7, 2); life.add(2, 5, 'fought', 7, 5);
  assert.deepEqual(life.tags.get(2).map(t => t.slice(1)), [['fought', 7, 2], ['fought', 7, 5]]);
});

// ---- seasons: what people do, and where it lands
import {unit} from '../../dist/sim/life_seasons.js';

function consistent(sim) {
  let bad = [];
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

test('season decisions are repeatable numbers in [0, 1)', () => {
  assert.equal(unit(1, 2, 3, 4, 5), unit(1, 2, 3, 4, 5));
  assert.notEqual(unit(1, 2, 3, 4, 5), unit(1, 2, 3, 4, 6));
  let lo = 1, hi = 0; for (let i = 0; i < 2000; i++) { const u = unit(7, i); lo = Math.min(lo, u); hi = Math.max(hi, u); }
  assert.ok(lo >= 0 && hi < 1 && lo < 0.05 && hi > 0.95);
});

test('with the switch off, people act in an overlay and the world is untouched', () => {
  assert.equal(e.life.flow, false);
  assert.ok(e.life.track.size > 100, 'many people have private changes');
  const [id, t] = [...e.life.track].find(([id, t]) => e.sim.people.has(id) && t.dw);
  const p = e.sim.people.get(id), v = e.life.view(e.sim, p);
  assert.notEqual(v.wealth, p.wealth, 'the overlay differs from the simulation');
  assert.equal(e.lifeStory(id).now.overlay, true);
  assert.equal(consistent(e.sim).length, 0);
});

test('with the switch on, people change the real world and it stays consistent', () => {
  const a = new Engine(); a.create({population: 1500, seed: 42});
  assert.match(a.command('life flow on').output, /shape the world/);
  assert.equal(a.snapshot().lifeFlow, true);
  a.step(40);
  assert.equal(a.life.track.size, 0, 'nothing is held back in the overlay');
  assert.deepEqual(consistent(a.sim), []);
  assert.notEqual(a.sim.people.size, e.sim.people.size, 'the world played out differently');
  const jobs = new Set(); for (const p of a.sim.people.values()) jobs.add(p.job);
  assert.ok(jobs.has('scientist') && jobs.has('merchant'));
  const b = new Engine(); b.create({population: 1500, seed: 42}); b.command('life flow on'); b.step(40);
  assert.equal(b.exportSave(), a.exportSave(), 'the same seed gives the same world');
});

test('switching on carries the overlay into the world once', () => {
  const x = new Engine(); x.create({population: 800, seed: 3}); x.step(10);
  const before = [...x.sim.people.values()].reduce((s, p) => s + p.wealth, 0), held = [...x.life.track.values()].reduce((s, t) => s + (t.dw ?? 0), 0);
  assert.ok(x.life.track.size > 0);
  x.command('life flow on');
  const after = [...x.sim.people.values()].reduce((s, p) => s + p.wealth, 0);
  assert.equal(x.life.track.size, 0);
  assert.ok(Math.abs(after - before - held) < before * 0.05 + 50, 'the overlay money arrived (some belonged to people who have since died)');
  assert.match(x.command('life flow on').output, /already/);
  x.command('life flow off'); x.step(2);
  assert.ok(x.life.track.size > 0, 'off again: new changes go back to the overlay');
});

test('promotion into an existing office is announced and keeps the offices consistent', () => {
  const a = new Engine(); a.create({population: 1500, seed: 11}); a.command('life flow on'); a.step(30);
  const appointed = a.sim.history.filter(([, m]) => /was appointed/.test(m)).length;
  assert.ok(appointed > 0);
  const promoted = [...a.life.tags].filter(([, l]) => l.some(t => t[1] === 'promoted'));
  assert.ok(promoted.length > 0);
  assert.deepEqual(consistent(a.sim), []);
});

test('standing rises with fame, fortune and office; ranks are named', () => {
  const ranks = new Set(), scores = [];
  for (const p of e.sim.people.values()) { const s = e.life.standing(e.sim, p); ranks.add(s.rank); scores.push(s.score); }
  assert.ok(scores.every(s => s >= 0 && s <= 100));
  assert.ok(ranks.has('Commoner') && ranks.size >= 3);
  const ruler = [...e.sim.countries.values()].map(c => e.sim.people.get(c.ruler)).find(Boolean);
  assert.ok(e.life.standing(e.sim, ruler).score >= 25);
});

test('save and load keep the switch and the overlay', () => {
  const copy = new Engine(); copy.importSave(e.exportSave());
  assert.equal(copy.life.flow, false);
  assert.equal(JSON.stringify([...copy.life.track]), JSON.stringify([...e.life.track]));
  const on = new Engine(); on.create({population: 300, seed: 2}); on.command('life flow on');
  const back = new Engine(); back.importSave(on.exportSave());
  assert.equal(back.life.flow, true);
});

test('a save made right after an edit still loads, and the edit can still be undone', () => {
  const g = new Engine(); g.create({population: 300, seed: 4});
  g.command('add person 1 age=30');
  assert.equal(g.snapshot().canUndo, true);
  const copy = new Engine(); copy.importSave(g.exportSave());
  assert.equal(copy.sim.people.size, g.sim.people.size);
  assert.equal(g.snapshot().canUndo, true, 'saving does not use up undo');
  assert.match(g.command('undo').output, /Undid|undo/i);
});

test('the life command reports and rejects politely', () => {
  assert.match(e.command('life status').output, /People shape the world: off/);
  assert.match(e.command('life nonsense').output, /^Use: life flow/);
});

// ---- person mode
// Pop-ups pause play, so these helpers answer whatever is waiting (the first option you could pick) and then play the season.
const clear = g => { while (g.life.player?.choice) g.choose(g.life.player.choice.options.find(o => o.enabled).id); };
const season = (g, act, arg) => { let r; do { clear(g); r = g.playSeason(act, arg); } while (g.life.player.choice); return r; };
function playable(flow) {
  const g = new Engine(); g.create({population: 1500, seed: 42});
  if (flow) g.command('life flow on');
  g.step(12);
  const p = [...g.sim.people.values()].find(q => q.age >= 25 && q.age <= 45 && g.life.view(g.sim, q).wealth > 10);
  return {g, id: p.id};
}

test('playing a person: a year ticks only when spring begins, and seasons come one at a time', () => {
  const {g, id} = playable(false), y = g.sim.year;
  const first = g.playAs(id).view;
  assert.equal(first.next.season, 0); assert.equal(first.next.year, y + 1);
  assert.ok(first.actions.some(a => a.id === 'work') && first.actions.some(a => a.id === 'auto'));
  const r1 = season(g, 'study');
  assert.equal(g.sim.year, y + 1, 'spring started a new year');
  assert.ok(r1.snapshot, 'a new year sends a fresh snapshot');
  assert.equal(r1.view.next.name, 'Summer');
  assert.match(r1.view.log[0].text, /studying/);
  const r2 = season(g, 'work');
  assert.equal(g.sim.year, y + 1); assert.equal(r2.snapshot, null, 'no snapshot when nothing but the overlay changed');
  season(g, 'auto'); const r4 = season(g, 'auto');
  assert.equal(r4.view.next.year, y + 2); assert.equal(g.sim.year, y + 1, 'the next year waits for the next spring');
  assert.equal(r4.view.log.length, 4);
});

test('the Step button plays the person for you, one year per step', () => {
  const {g, id} = playable(false), y = g.sim.year;
  g.playAs(id);
  for (let guard = 0; g.sim.year < y + 3 && guard < 40; guard++) { clear(g); g.step(1); }
  assert.equal(g.sim.year, y + 3);
  assert.ok(g.life.player.log.length >= 8, 'their seasons were lived and recorded');
});

test('choices: travel, retrain and offices are validated', () => {
  const {g, id} = playable(false);
  const v = g.playAs(id).view, mv = v.actions.find(a => a.id === 'move');
  const r = season(g, 'move', mv.options[0].value);
  assert.notEqual(r.view.home.id, v.home.id);
  assert.throws(() => season(g, 'move', '999999'), /not possible/);
  assert.throws(() => season(g, 'retrain', 'wizard'), /not possible/);
  assert.throws(() => season(g, 'office', 'king'), /not possible/);
  assert.throws(() => season(g, 'dance'), /Unknown action/);
});

test('with the switch off the choices stay in the overlay; on, they change the world', () => {
  const off = playable(false); off.g.playAs(off.id);
  season(off.g, 'work'); // spring: the year ticks first
  const w0 = off.g.sim.people.get(off.id).wealth, v0 = off.g.playerView().wealth;
  for (let i = 0; i < 3; i++) season(off.g, 'work');
  assert.equal(off.g.sim.people.get(off.id).wealth, w0, 'the simulation is untouched');
  assert.ok(off.g.playerView().wealth > v0);
  const on = playable(true); on.g.playAs(on.id);
  season(on.g, 'work');
  const w1 = on.g.sim.people.get(on.id).wealth; for (let i = 0; i < 3; i++) season(on.g, 'work');
  assert.ok(on.g.sim.people.get(on.id).wealth > w1, 'real wealth rose');
});

test('moving abroad makes you a citizen there when the world follows', () => {
  const {g, id} = playable(true);
  const v = g.playAs(id).view, abroad = v.actions.find(a => a.id === 'move').options.map(o => g.sim.settlements.get(Number(o.value))).find(s => s.country !== v.country.id);
  if (!abroad) return;
  season(g, 'move', String(abroad.id));
  assert.equal(g.sim.people.get(id).country, abroad.country);
});

test('dying ends the run of play and names the children; stop clears it', () => {
  const {g, id} = playable(false); g.playAs(id);
  g.command(`delete person ${id}`);
  const v = g.playerView();
  assert.equal(v.alive, false); assert.ok(Array.isArray(v.kids));
  assert.throws(() => season(g, 'work'), /has died/);
  g.stopPlaying(); assert.equal(g.playerView(), null); assert.equal(g.snapshot().player, null);
  assert.throws(() => season(g, 'work'), /Nobody is being played/);
  assert.throws(() => g.playAs(99999999), /living person/);
});

test('the person you play survives a save and load', () => {
  const {g, id} = playable(false); g.playAs(id); season(g, 'study'); season(g, 'trade');
  const copy = new Engine(); copy.importSave(g.exportSave());
  const a = g.playerView(), b = copy.playerView();
  assert.equal(b.id, id); assert.deepEqual(b.log, a.log); assert.deepEqual(b.next, a.next);
});

test('playing a person never changes a world with the switch off', () => {
  const a = new Engine(), b = new Engine();
  a.create({population: 600, seed: 8}); b.create({population: 600, seed: 8});
  a.step(6); b.step(6);
  const id = [...a.sim.people.values()].find(p => p.age > 25).id;
  a.playAs(id); for (let i = 0; i < 12; i++) season(a, ['trade', 'study', 'work', 'auto'][i % 4]);
  b.step(3);
  assert.equal(JSON.stringify(a.sim.rng.getstate()), JSON.stringify(b.sim.rng.getstate()));
  assert.equal(a.sim.people.size, b.sim.people.size);
});
