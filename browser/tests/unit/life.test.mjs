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
