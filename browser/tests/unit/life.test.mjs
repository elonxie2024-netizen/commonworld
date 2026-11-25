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

test('the life command reports and rejects politely', () => {
  assert.match(e.command('life status').output, /People shape the world: off/);
  assert.match(e.command('life nonsense').output, /^Use: life flow/);
});
