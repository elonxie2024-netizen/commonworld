import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine} from '../../dist/engine-api.js';
import {CHANNELS} from '../../dist/sim/world_media.js';
import {SECTORS, price} from '../../dist/sim/world_firms.js';

// The world's own layer: seven channels of news and culture, and the businesses of the world.

const make = (years = 0, seed = 42) => { const g = new Engine(); g.create({population: 2000, seed}); if (years) g.step(years); return g; };
const w = g => g.snapshot().world;
const wealthOf = (g, id) => g.life.view(g.sim, g.sim.people.get(id)).wealth;
const player = (g, flow = false) => {
  if (flow) g.command('life flow on');
  const p = [...g.sim.people.values()].filter(q => q.age >= 28 && q.age < 55).sort((a, b) => b.wealth - a.wealth)[0];
  g.playAs(p.id); return p;
};
const clear = g => { while (g.life.player?.choice) g.choose(g.playerView().choice.options.find(o => o.enabled).id); };
const year = g => { for (let i = 0; i < 12; i++) { clear(g); const before = g.sim.year; g.playSeason('auto'); if (g.sim.year > before) break; } };

test('a new world already has firms, a market and seven channels', () => {
  const x = w(make());
  assert.ok(x.firms.length >= 2); assert.equal(x.channels.length, 7);
  assert.ok(x.firms.every(f => SECTORS[f.sector] && f.alive && f.cap > 0 && f.townName && f.founderName));
});

test('the press: stories come from several channels, each with a beat', () => {
  const x = w(make(40));
  const by = new Set(x.stories.map(s => s.ch));
  assert.ok(by.size >= 5, `five or more channels were heard from: ${[...by]}`);
  assert.ok(x.stories.every(s => CHANNELS[s.ch] && s.head && s.year >= 0 && s.score >= 0));
  assert.ok(x.stories.some(s => s.kind === 'premiere') || x.stories.some(s => s.kind === 'festival'), 'culture was made');
  assert.ok(x.stories.filter(s => ['firm', 'market'].includes(s.kind)).length > 0, 'business made the news');
  assert.ok(x.stories.every(s => s.score >= 40), 'routine noise stays out');
});

test('culture: schools of thought and art, a cup, and prizes are recorded', () => {
  const x = w(make(60));
  assert.ok(x.movements.length >= 1); assert.ok(x.cup.titles.length >= 1); assert.ok(x.works.length >= 1);
  assert.ok(x.stories.some(s => s.kind === 'movement'));
});

test('firms are founded, earn, grow and fail over the years', () => {
  const x = w(make(50));
  assert.ok(x.firms.filter(f => f.alive).length >= 3); assert.ok(x.firms.some(f => !f.alive && f.why), 'some failed or were bought');
  assert.ok(x.firms.some(f => f.hist.length >= 2)); assert.ok(x.index.length >= 40);
  assert.ok(x.level > 20 && x.level < 400, `the index stays sensible: ${x.level}`);
});

test('the world layer is deterministic and never changes the simulation', () => {
  const a = make(25), b = make(25);
  assert.deepEqual(w(a).stories.map(s => s.head), w(b).stories.map(s => s.head));
  assert.deepEqual(w(a).firms.map(f => [f.name, f.cap]), w(b).firms.map(f => [f.name, f.cap]));
  const plain = new Engine(); plain.create({population: 2000, seed: 42}); for (let i = 0; i < 25; i++) plain.sim.tick(false);
  assert.equal(a.sim.year, plain.sim.year); assert.equal(a.sim.people.size, plain.sim.people.size, 'same people, with or without the layer');
});

test('the world survives a save; an old save with no world gets one', () => {
  const g = make(20), copy = new Engine(); copy.importSave(g.exportSave());
  assert.deepEqual(w(copy).stories.map(s => s.id), w(g).stories.map(s => s.id)); assert.equal(w(copy).firms.length, w(g).firms.length);
  copy.step(3); g.step(3); assert.deepEqual(w(copy).firms.map(f => f.cap), w(g).firms.map(f => f.cap), 'the same future after loading');
  const text = g.exportSave(), at = text.lastIndexOf(',"life":'), data = JSON.parse(text.slice(at + 8, -1)); delete data.world;
  const old = new Engine(); old.importSave(text.slice(0, at) + ',"life":' + JSON.stringify(data) + '}'); assert.ok(w(old).firms.length >= 2);
});

test('you can found a firm, steer it, and it pays you every year', () => {
  const g = make(20), p = player(g); g.command(`set person ${p.id} wealth 900`);
  const biz = () => g.playerView().biz, kind = biz().sectors.find(s => s.enabled && s.id === 'mill') ?? biz().sectors.find(s => s.enabled);
  const w0 = wealthOf(g, p.id); g.business('found', kind.id);
  assert.equal(Math.round(wealthOf(g, p.id) - w0), -kind.cost); assert.equal(biz().mine.length, 1);
  assert.throws(() => g.business('found', kind.id), /already/);
  const f = biz().mine[0]; g.business('strategy', f.id, 'expand'); assert.equal(biz().mine[0].strat, 'expand');
  assert.throws(() => g.business('strategy', f.id, 'nonsense'), /direction/);
  const w1 = wealthOf(g, p.id); for (let i = 0; i < 6; i++) year(g);
  assert.ok(g.playerView().log.some(l => l.text.includes(f.name) && /paid you|lost|failed/.test(l.text)), 'the journal reports on it');
  assert.ok(wealthOf(g, p.id) > w1 - 200, 'a firm does not bleed you dry');
  const back = wealthOf(g, p.id); g.business('close', f.id); assert.ok(wealthOf(g, p.id) > back); assert.equal(biz().mine.length, 0);
});

test('you can take a post in a firm in your town, be paid, and be promoted', () => {
  const g = make(15), p = player(g), wd = g.life.world;
  g.command(`set person ${p.id} wealth 800`); g.business('found', g.playerView().biz.sectors.find(s => s.enabled).id);
  const f = [...wd.firms.values()].find(x => x.owner === p.id); f.owner = null; f.cap = 3000; // somebody else's firm, in your own town, too big to fail
  assert.throws(() => g.business('quit'), /no post/);
  g.business('work', f.id); assert.equal(g.playerView().biz.post.rank, 'Clerk');
  g.life.player.stats.skill = 100; g.life.player.stats.connections = 100;
  const w0 = wealthOf(g, p.id); for (let i = 0; i < 10; i++) year(g);
  assert.ok(wealthOf(g, p.id) > w0, 'a salary was paid'); assert.ok(['Foreman', 'Manager', 'Partner'].includes(g.playerView().biz.post?.rank), 'promoted');
  g.business('quit'); assert.equal(g.playerView().biz.post, null);
});

test('shares of a public firm: buy five at a time, sell, and the limit holds', () => {
  const g = make(10), p = player(g), wd = g.life.world;
  const f = [...wd.firms.values()].find(x => x.alive); f.pub = true; g.command(`set person ${p.id} wealth 5000`);
  const w0 = wealthOf(g, p.id); g.business('buy', f.id);
  assert.ok(Math.abs(w0 - wealthOf(g, p.id) - price(f) * 5) < 0.2); assert.equal(g.playerView().biz.stakes[0].shares, 5);
  for (let i = 0; i < 12; i++) { try { g.business('buy', f.id); } catch (e) { assert.match(e.message, /as much/); break; } }
  assert.ok(g.playerView().biz.stakes[0].shares <= 49);
  const before = wealthOf(g, p.id); g.business('sell', f.id); assert.ok(wealthOf(g, p.id) > before);
  f.pub = false; assert.throws(() => g.business('buy', f.id), /public/);
});

test('go to a festival or a premiere in your own town, once', () => {
  const g = make(25), p = player(g), here = g.playerView().home.id, wd = g.life.world;
  const s = wd.say(g.sim.year, 'hearth', 'festival', 'Test fair', '', {town: here, act: 'attend'});
  const c0 = g.life.player.stats.connections; g.business('attend', s.id);
  assert.ok(g.life.player.stats.connections > c0); assert.throws(() => g.business('attend', s.id), /already/);
  assert.throws(() => g.business('attend', 99999), /not in your town/);
});

test('an heir takes over the firms a parent owned', () => {
  const g = make(40); g.command('life flow on');
  const p = [...g.sim.people.values()].filter(q => q.age >= 40 && [...g.sim.people.values()].some(k => k.parents?.includes(q.id) && k.age >= 18)).sort((a, b) => b.wealth - a.wealth)[0];
  g.playAs(p.id); g.command(`set person ${p.id} wealth 800`); g.business('found', g.playerView().biz.sectors.find(s => s.enabled).id);
  const fid = g.playerView().biz.mine[0].id, kids = g.playerView().kids.map(k => k.id); g.command(`delete person ${p.id}`);
  const heirs = g.playerView().heirs, heir = heirs.find(h => kids.includes(h.id)) ?? heirs[0]; g.succeed(heir.id);
  const owner = g.life.world.firms.get(fid).owner;
  if (kids.includes(heir.id)) { assert.equal(owner, heir.id); assert.equal(g.playerView().biz.mine.length, 1); } else assert.ok(owner === null || owner === heir.id);
});

test('a firm that closes takes your post with it', () => {
  const g = make(10), p = player(g), wd = g.life.world, f = [...wd.firms.values()].find(x => x.alive);
  wd.posts.set(p.id, {firm: f.id, rank: 0, since: g.sim.year}); f.cap = 1; f.loss = 5; year(g);
  assert.equal(wd.posts.has(p.id), false); assert.ok(g.playerView().log.some(l => /lost your post|failed/.test(l.text)));
});
