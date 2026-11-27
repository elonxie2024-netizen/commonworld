import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine} from '../../dist/engine-api.js';
import {mods, TRAITS} from '../../dist/sim/life_traits.js';
import {HOLDINGS, UNDERTAKINGS} from '../../dist/sim/life_depth.js';

// Depth: traits and perks, ambitions, undertakings, property, and the people in a life.

function world(flow = false) {
  const g = new Engine(); g.create({population: 1500, seed: 42});
  if (flow) g.command('life flow on');
  g.step(6);
  const p = [...g.sim.people.values()].filter(q => q.age >= 28 && q.age < 50).sort((a, b) => b.wealth - a.wealth)[0];
  g.playAs(p.id);
  return {g, p};
}
const clear = g => { while (g.life.player?.choice) g.choose(g.playerView().choice.options.find(o => o.enabled).id); };
const live = (g, n = 1) => { for (let i = 0; i < n; i++) for (let k = 0; k < 6; k++) { clear(g); g.playSeason('auto'); if (!g.life.player.choice) break; } };
const rich = (g, p, n = 2000) => { g.command(`set person ${p.id} wealth ${n}`); };
const depth = g => g.playerView().depth;
const wealthOf = (g, id) => g.life.view(g.sim, g.sim.people.get(id)).wealth;

test('everyone starts with two traits and a perk point, and traits change the numbers', () => {
  const {g} = world(), d = depth(g);
  assert.equal(d.traits.length, 2); assert.equal(d.perks.points, 1);
  assert.ok(d.traits.every(t => TRAITS[t.id]));
  const pl = g.life.player; pl.traits = ['shrewd']; pl.perks = [];
  assert.equal(mods(pl).income, 0.1);
  pl.perks = ['haggler']; assert.ok(Math.abs(mods(pl).income - 0.18) < 1e-9);
});

test('perks cost points and need the stats they ask for', () => {
  const {g} = world(); g.life.player.stats.skill = 10;
  assert.throws(() => g.depth('perk', 'hand'), /skill 50|not enough/i);
  g.depth('perk', 'haggler'); assert.ok(g.life.player.perks.includes('haggler')); assert.equal(g.life.player.pts, 0);
  assert.throws(() => g.depth('perk', 'quick'), /not enough/i);
  assert.throws(() => g.depth('perk', 'haggler'), /already/i);
});

test('an ambition is fulfilled when you reach it: a perk point, fame and a trait', () => {
  const {g, p} = world(); g.depth('ambition', 'fortune');
  assert.equal(depth(g).ambition.current.id, 'fortune');
  rich(g, p, 400); const pts = g.life.player.pts; live(g);
  assert.deepEqual(depth(g).ambition.done, ['Build a fortune']);
  assert.equal(g.life.player.pts, pts + 1); assert.ok(g.life.player.traits.includes('tycoon')); assert.equal(g.life.player.ambition, null);
  assert.throws(() => g.depth('ambition', 'fortune'), /not an ambition/i);
  assert.ok(g.playerView().log.some(l => /Ambition fulfilled/.test(l.text)));
});

test('property: buy, earn and pay upkeep every season, and sell for 60%', () => {
  const {g, p} = world(); rich(g, p, 500);
  const w0 = wealthOf(g, p.id); g.depth('buy', 'workshop'); assert.ok(g.life.player.holdings.includes('workshop'));
  assert.equal(Math.round(wealthOf(g, p.id) - w0), -HOLDINGS.workshop.cost);
  live(g, 4); assert.ok(g.playerView().log.some(l => /property/.test(l.text)), 'the journal reports on it');
  assert.throws(() => g.depth('buy', 'workshop'), /already/);
  const w = wealthOf(g, p.id); g.depth('sell', 'workshop');
  assert.ok(Math.abs(wealthOf(g, p.id) - w - HOLDINGS.workshop.cost * 0.6) < 1e-6);
  g.command(`set person ${p.id} wealth 1`); assert.throws(() => g.depth('buy', 'manor'), /afford/);
});

test('an undertaking costs money, takes seasons, and pays off when it is finished', () => {
  const {g, p} = world(); rich(g, p, 500);
  const open = depth(g).proj.list.filter(x => x.enabled); assert.ok(open.length >= 1);
  const pick = open.find(x => x.id === 'home' || x.id === 'school') ?? open[0], def = UNDERTAKINGS[pick.id];
  g.life.player.stats.skill = 100;
  g.depth('start', pick.id); assert.equal(depth(g).proj.current.id, pick.id);
  assert.throws(() => g.depth('start', pick.id), /already/);
  live(g, def.seasons); assert.equal(g.life.player.proj, null, 'the project ended');
  assert.ok(g.playerView().log.some(l => /Done:|did not quite/.test(l.text)));
  g.depth('start', pick.id); g.depth('abandon'); assert.equal(g.life.player.proj, null);
});

test('people: meet someone, tend them once a season, court a close friend, and let go', () => {
  const {g} = world(); g.life.player.stats.connections = 90;
  for (let i = 0; i < 6 && !g.life.player.bonds.length; i++) { try { g.depth('meet'); } catch (e) { assert.match(e.message, /already|nobody/i); } live(g); }
  const b = g.life.player.bonds[0]; assert.ok(b, 'a friend was made'); assert.equal(b.kind, 'friend');
  live(g); g.depth('time', b.id); assert.throws(() => g.depth('time', b.id), /already/, 'one thing a season');
  live(g); b.close = 20; assert.throws(() => g.depth('court', b.id), /close|young/i);
  b.close = 90; live(g);
  const q = g.sim.people.get(b.id);
  if (q && q.age >= 18) for (let i = 0; i < 8 && b.kind === 'friend'; i++) { b.close = 90; try { g.depth('court', b.id); } catch { /* no room this season */ } live(g); }
  live(g); g.depth('cut', b.id); assert.ok(!g.life.player.bonds.some(x => x.id === b.id));
});

test('a bond dies with the person', () => {
  const {g} = world(); g.life.player.stats.connections = 95;
  for (let i = 0; i < 8 && !g.life.player.bonds.length; i++) { try { g.depth('meet'); } catch { /* try again next season */ } live(g); }
  const b = g.life.player.bonds[0]; assert.ok(b);
  g.command(`delete person ${b.id}`); live(g);
  assert.ok(!g.life.player.bonds.some(x => x.id === b.id));
  assert.ok(g.playerView().log.some(l => /has died/.test(l.text)));
});

test('traits and perks scale what a season earns', () => {
  const a = world(), b = world(); a.g.setFocus('work'); b.g.setFocus('work');
  for (const w of [a, b]) { w.g.life.player.traits = []; w.g.life.player.perks = []; w.g.life.player.holdings = []; w.g.life.player.stats.skill = 80; }
  b.g.life.player.traits = ['shrewd']; b.g.life.player.perks = ['haggler', 'hand'];
  const a0 = wealthOf(a.g, a.p.id), b0 = wealthOf(b.g, b.p.id); live(a.g, 4); live(b.g, 4);
  assert.ok(wealthOf(b.g, b.p.id) - b0 > wealthOf(a.g, a.p.id) - a0, 'a shrewd haggler earns more than a plain worker');
});

test('depth survives a save; an heir keeps a trait and, from a parent, the property', () => {
  const g = new Engine(); g.create({population: 1500, seed: 42}); g.step(40); g.command('life flow on');
  const p = [...g.sim.people.values()].filter(q => q.age >= 40 && [...g.sim.people.values()].some(k => k.parents?.includes(q.id) && k.age >= 18)).sort((a, b) => b.wealth - a.wealth)[0];
  g.playAs(p.id); rich(g, p, 800); g.depth('buy', 'shop'); g.depth('ambition', 'master'); g.life.player.perks.push('quick');
  const copy = new Engine(); copy.importSave(g.exportSave());
  assert.deepEqual(copy.life.player.holdings, ['shop']); assert.equal(copy.life.player.ambition, 'master'); assert.deepEqual(copy.life.player.perks, ['quick']);
  const mine = [...g.life.player.traits], kids = g.playerView().kids.map(k => k.id);
  g.command(`delete person ${p.id}`);
  const heir = g.playerView().heirs.find(h => h.relation === 'child') ?? g.playerView().heirs[0]; g.succeed(heir.id);
  const n = g.life.player;
  assert.equal(n.traits.length, 2); assert.ok(n.traits.some(t => mine.includes(t)), 'one trait comes down the line');
  assert.ok(n.holdings.length <= 1, 'a close heir may keep the shop, a distant one not');
  if (kids.includes(heir.id)) assert.deepEqual(n.holdings, ['shop']);
  assert.deepEqual(n.perks, []); assert.equal(n.ambition, null);
});

test('an old save with no depth gets it on loading', () => {
  const {g} = world(); const text = g.exportSave();
  const stripped = text.replace(/"traits":\[[^\]]*\],?/, '');
  const copy = new Engine(); copy.importSave(stripped);
  assert.ok(copy.life.player.traits.length > 0); assert.ok(depth(copy));
});
