import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine} from '../../dist/engine-api.js';
import {detect} from '../../dist/sim/life_events.js';

// Person mode as a running life: a standing focus that depends on who you are, stats that grow, queued moves.

function world(flow = false) {
  const g = new Engine(); g.create({population: 1500, seed: 42});
  if (flow) g.command('life flow on');
  g.step(5);
  return g;
}
const byJob = (g, job, min = 22) => [...g.sim.people.values()].filter(p => g.life.view(g.sim, p).job === job && p.age >= min && p.age < 60).sort((a, b) => b.wealth - a.wealth)[0];
const clear = g => { while (g.life.player?.choice) g.choose(g.playerView().choice.options.find(o => o.enabled).id); };
const ids = v => v.focuses.map(f => f.id);

test('what you can do depends on who you are: trade, age and wealth', () => {
  const g = world();
  const kits = {};
  for (const job of ['farmer', 'merchant', 'healer', 'scholar', 'soldier', 'politician', 'artisan', 'performer', 'laborer']) {
    const p = byJob(g, job); if (!p) continue;
    kits[job] = ids(g.playAs(p.id).view);
    assert.ok(kits[job].includes('work') && kits[job].includes('study'), `${job} can always work and study`);
  }
  assert.ok(Object.keys(kits).length >= 5, 'a good spread of trades in the world');
  const trade = job => kits[job]?.filter(i => !['work', 'study', 'network', 'trade', 'rest', 'invest', 'patron', 'mentor', 'retire'].includes(i));
  const seen = new Set();
  for (const job of Object.keys(kits)) { const k = trade(job).join(','); assert.ok(k, `${job} has trade-specific choices`); assert.ok(!seen.has(k), `${job} differs from the others`); seen.add(k); }
  if (kits.healer) assert.ok(kits.healer.includes('tend') && kits.healer.includes('remedies'));
  if (kits.merchant) assert.ok(kits.merchant.includes('caravan'));
  if (kits.farmer) assert.ok(kits.farmer.includes('market'));
  const kid = [...g.sim.people.values()].find(p => p.age < 18 && p.age >= 6);
  const young = ids(g.playAs(kid.id).view);
  assert.deepEqual(young.sort(), ['apprentice', 'school'], 'children go to school or learn a trade');
  const old = [...g.sim.people.values()].find(p => p.age >= 62);
  if (old) assert.ok(ids(g.playAs(old.id).view).includes('retire'), 'the old can retire');
  const rich = [...g.sim.people.values()].filter(p => p.age >= 25).sort((a, b) => b.wealth - a.wealth)[0];
  if (rich.wealth >= 120) assert.ok(ids(g.playAs(rich.id).view).includes('invest'), 'the rich can invest');
});

test('the person has stats beyond money and fame, and they move with what you do', () => {
  const g = world(), p = byJob(g, 'scholar') ?? byJob(g, 'merchant');
  const v0 = g.playAs(p.id).view, stat = (v, id) => v.stats.find(s => s.id === id).value;
  for (const id of ['health', 'wealth', 'fame', 'skill', 'knowledge', 'connections', 'honor']) assert.ok(v0.stats.some(s => s.id === id), id);
  const st0 = {...g.life.player.stats};
  g.setFocus('study'); clear(g); g.playSeason('auto'); clear(g); g.playSeason('auto');
  assert.ok(g.life.player.stats.knowledge > st0.knowledge, 'studying teaches');
  g.setFocus('network'); clear(g); g.playSeason('auto'); clear(g); g.playSeason('auto');
  assert.ok(g.life.player.stats.connections > st0.connections, 'cultivating contacts builds them');
  g.setFocus('work'); clear(g); const s1 = g.life.player.stats.skill; g.playSeason('auto'); clear(g); g.playSeason('auto');
  assert.ok(g.life.player.stats.skill > s1, 'steady work builds skill');
  assert.ok(stat(g.playerView(), 'honor') === Math.round(g.life.player.stats.honor));
});

test('a standing focus keeps running year after year by itself, stopping only for decisions', () => {
  const g = world(true), p = byJob(g, 'merchant') ?? byJob(g, 'laborer');
  g.playAs(p.id); g.setFocus('study');
  const k0 = g.life.player.stats.knowledge, y0 = g.sim.year;
  let stops = 0;
  for (let i = 0; i < 8; i++) { g.step(1); if (g.life.player.choice) { stops++; g.choose(g.playerView().choice.options.find(o => o.enabled).id); } }
  assert.ok(g.sim.year >= y0 + 4, 'years passed without any clicks');
  assert.ok(g.life.player.stats.knowledge > k0 + 5, 'the focus was lived season after season');
  assert.equal(g.life.player.focus, 'study');
  assert.ok(g.playerView().log.length >= 8);
});

test('a focus that stops being open gives way to the default instead of failing', () => {
  const g = world(), p = byJob(g, 'soldier') ?? byJob(g, 'merchant');
  g.playAs(p.id); const f = ids(g.playerView()).find(i => !['work', 'study', 'network', 'trade'].includes(i));
  g.setFocus(f);
  g.life.player.focus = 'no-such-focus'; clear(g);
  assert.doesNotThrow(() => { g.playSeason('auto'); clear(g); });
  assert.throws(() => g.setFocus('no-such-focus'), /not open/);
});

test('one-off moves are queued for the next season and can be cancelled', () => {
  const g = world(), p = byJob(g, 'laborer') ?? byJob(g, 'farmer');
  const v = g.playAs(p.id).view, move = v.oneoffs.find(a => a.id === 'move'), target = move.options[0].value;
  const r = g.queueAct('move', target);
  assert.deepEqual(r.view.queued, {act: 'move', arg: target});
  g.queueAct(null); assert.equal(g.playerView().queued, null);
  g.queueAct('move', target); clear(g); g.playSeason('auto'); clear(g);
  assert.equal(g.life.player.queue, null, 'the queue was used up');
  assert.equal(g.life.view(g.sim, g.sim.people.get(p.id)).settlement, Number(target));
  assert.throws(() => g.queueAct('move', '999999'), /not possible/);
});

test('a pop-up built before you switched the world on opens up as soon as you do', () => {
  const g = new Engine(); g.create({population: 1200, seed: 42}); g.step(5);
  const p = [...g.sim.people.values()].filter(x => x.age >= 28 && x.age <= 50).sort((a, b) => b.wealth - a.wealth)[0];
  g.playAs(p.id); const town = g.sim.settlements.get(p.settlement);
  g.command(`settle "${town.name}"`);
  g.life.player.choice = detect(g.sim, g.life, g.sim.people.get(p.id), 0, 'settlers');
  const join = () => g.playerView().choice.options.find(o => o.id === 'join');
  assert.equal(join().enabled, false); assert.match(join().why, /switched on/);
  g.command('life flow on');
  assert.equal(join().enabled, true, 'no need to wait for a new pop-up');
  g.command('life flow off');
  assert.equal(join().enabled, false);
});

test('your trade changes the decisions the world puts to you', () => {
  const g = world(true), find = (job, kind) => {
    const p = byJob(g, job); if (!p) return null;
    g.playAs(p.id);
    const ev = detect(g.sim, g.life, g.sim.people.get(p.id), 0, kind);
    return ev && ev.options.map(o => o.id);
  };
  const war = (() => { const land = [...g.sim.countries.values()]; return land; })();
  assert.ok(war.length >= 2);
  const healer = byJob(g, 'healer'); if (healer) { g.playAs(healer.id); g.command('add disease "Glass fever" course=acute infection=.4 death=.02 recovery=.85'); for (const x of [...g.sim.people.values()].filter(q => q.settlement === healer.settlement && q.id !== healer.id).slice(0, 5)) g.command(`infect ${x.id} "Glass fever"`); g.sim.countries.get(healer.country).sickness = 'Glass fever'; }
  const h = healer && find('healer', 'plague'), laborer = find('laborer', 'plague'), sci = find('scholar', 'plague') ?? find('scientist', 'plague');
  if (h && laborer) { assert.ok(h.includes('cure') && !laborer.includes('cure'), 'only healers can treat with skill'); }
  if (sci && laborer) assert.ok(sci.includes('study') && !laborer.includes('study'));
  const farmer = find('farmer', 'famine'), pol = find('politician', 'famine');
  if (farmer) assert.ok(farmer.includes('granary'));
  if (pol) assert.ok(pol.includes('relief'));
});

test('decisions change who you are: honor rises with generosity and falls with greed', () => {
  const g = world(true), p = byJob(g, 'merchant') ?? byJob(g, 'laborer');
  g.playAs(p.id); const c = g.sim.countries.get(p.country);
  g.command(`trigger "${c.name}" Famine`);
  const mk = () => detect(g.sim, g.life, g.sim.people.get(p.id), 0, 'famine');
  g.life.player.choice = mk(); const h0 = g.life.player.stats.honor;
  g.choose('share'); const h1 = g.life.player.stats.honor; assert.ok(h1 > h0);
  g.life.player.choice = mk(); g.choose('hoard'); assert.ok(g.life.player.stats.honor < h1);
});

test('stats and focus survive a save, and an heir keeps some of the contacts', () => {
  const g = new Engine(); g.create({population: 1500, seed: 42}); g.step(40); g.command('life flow on');
  const p = [...g.sim.people.values()].filter(q => q.age >= 40 && [...g.sim.people.values()].some(k => k.parents?.includes(q.id) && k.age >= 18)).sort((a, b) => b.wealth - a.wealth)[0];
  g.playAs(p.id); g.setFocus('network'); g.life.player.stats.connections = 80; g.life.player.stats.honor = 30;
  const copy = new Engine(); copy.importSave(g.exportSave());
  assert.equal(copy.life.player.focus, 'network'); assert.equal(copy.life.player.stats.connections, 80);
  g.command(`delete person ${p.id}`);
  const heir = g.playerView().heirs[0]; g.succeed(heir.id);
  const st = g.life.player.stats;
  assert.ok(st.connections >= 40, 'half the old contacts come with the name'); assert.ok(st.honor >= 14 && st.honor <= 16, 'half the honor');
});
