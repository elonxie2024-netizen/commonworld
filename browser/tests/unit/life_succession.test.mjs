import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine} from '../../dist/engine-api.js';
import {officeRule, kin, candidates, MAX_HEIRS} from '../../dist/sim/life_succession.js';

// Succession: who carries on when the person you play dies, and what they inherit.

/** A world, and a person with grown children (and usually grandchildren) to play, set up as a ruler of the given kind. */
function scene({government = null, flow = false, office = null} = {}) {
  const g = new Engine(); g.create({population: 1500, seed: 42});
  g.step(40);
  if (flow) g.command('life flow on');
  let sim = g.sim;
  const living = [...sim.people.values()];
  const parent = living.filter(p => p.age >= 45 && living.filter(q => q.parents?.includes(p.id)).length >= 2)
    .sort((a, b) => b.wealth - a.wealth)[0];
  assert.ok(parent, 'somebody with two living children');
  if (government) g.command(`set country ${parent.country} government ${government}`);
  sim = g.sim;
  if (office === 'ruler') g.command(`set country ${parent.country} ruler ${parent.id}`);
  sim = g.sim;
  const p = sim.people.get(parent.id);
  if (office && office !== 'ruler') { sim.countries.get(p.country).offices.set(office, p.id); p.public_role = office; }
  g.playAs(p.id);
  return {g, id: p.id};
}
const die = s => { s.g.command(`delete person ${s.id}`); return s.g.playerView(); };

test('each form of government fills each office its own way', () => {
  assert.equal(officeRule('monarchy', 'ruler').mode, 'inherited');
  assert.equal(officeRule('empire', 'ruler').mode, 'inherited');
  for (const gov of ['republic', 'democracy', 'council', 'merchant']) assert.equal(officeRule(gov, 'ruler').mode, 'elected', gov);
  assert.equal(officeRule('oligarchy', 'ruler').mode, 'wealth');
  assert.equal(officeRule('theocracy', 'ruler').mode, 'chosen');
  for (const gov of ['junta', 'tyranny', 'tribal']) assert.equal(officeRule(gov, 'ruler').mode, 'contested', gov);
  for (const gov of ['monarchy', 'empire', 'oligarchy']) for (const t of ['treasurer', 'minister']) assert.equal(officeRule(gov, t).mode, 'inherited', `${gov}/${t}`);
  for (const gov of ['republic', 'democracy', 'council', 'merchant']) for (const t of ['treasurer', 'minister', 'chief scholar']) assert.equal(officeRule(gov, t).mode, 'elected', `${gov}/${t}`);
  for (const gov of ['monarchy', 'empire', 'oligarchy', 'theocracy', 'junta']) for (const t of ['chief scholar', 'chief physician']) assert.equal(officeRule(gov, t).mode, 'appointed', `${gov}/${t}`);
  assert.equal(officeRule('junta', 'treasurer').mode, 'appointed');
});

test('the dead person leaves a list of living family, closest first, at most eight', () => {
  const s = scene(), view = die(s);
  assert.equal(view.alive, false);
  assert.ok(view.heirs.length >= 2 && view.heirs.length <= MAX_HEIRS);
  const order = ['child', 'grandchild', 'sibling', 'partner', 'nephew', 'parent'];
  for (let i = 1; i < view.heirs.length; i++) assert.ok(order.indexOf(view.heirs[i - 1].rel) <= order.indexOf(view.heirs[i].rel), 'closest first');
  for (const h of view.heirs) {
    assert.ok(s.g.sim.people.has(h.id), 'alive');
    for (const k of ['name', 'relation', 'age', 'job', 'wealth', 'fame', 'place', 'country', 'summary', 'standing', 'gets']) assert.ok(h[k] !== undefined, k);
  }
  const family = kin(s.g.sim, s.id);
  assert.ok(family.every(k => s.g.sim.people.has(k.id)) && !family.some(k => k.id === s.id));
});

test('the heir you choose inherits money and a share of fame, and the line is counted', () => {
  const s = scene({flow: true}), mark = {...s.g.life.player.mark}, view = die(s);
  const pick = view.heirs[0], before = s.g.sim.people.get(pick.id);
  const w0 = before.wealth, f0 = before.fame;
  const r = s.g.succeed(pick.id), now = s.g.sim.people.get(pick.id);
  assert.equal(r.view.id, pick.id); assert.equal(r.view.alive, true); assert.equal(r.view.gen, 2);
  assert.equal(r.view.line[0].id, s.id);
  assert.ok(Math.abs((now.wealth - w0) - pick.gets.wealth) < 1, 'real money arrives with the switch on');
  assert.ok(now.fame >= f0 && Math.abs(Math.min(100, f0 + pick.gets.fame) - now.fame) < 1.01);
  assert.ok(pick.gets.fame === Math.round(mark.fame * 0.5), 'half the fame to a child');
  assert.match(r.view.log[0].text, /^You take up the life of/);
  assert.ok(s.g.lifeStory(pick.id).lines.some(l => /legacy of/.test(l.text)), 'the story remembers whose heir they are');
  assert.equal(s.g.sim.people.get(pick.id).public_role === undefined, false);
});

test('with the switch off the inheritance stays in their own story', () => {
  const s = scene({flow: false}), view = die(s), pick = view.heirs[0];
  const w0 = s.g.sim.people.get(pick.id).wealth;
  const r = s.g.succeed(pick.id);
  assert.equal(s.g.sim.people.get(pick.id).wealth, w0, 'the world is untouched');
  assert.ok(r.view.wealth >= pick.wealth, 'yet the person you play is richer');
});

test('a monarch’s crown goes only to the eldest adult child, and nobody inherits a vote', () => {
  const s = scene({government: 'monarchy', office: 'ruler', flow: true}), view = die(s);
  const offices = view.heirs.filter(h => h.gets.office);
  assert.ok(offices.length && offices.every(h => h.gets.office.mode === 'inherited'));
  const crowned = s.g.sim.countries.get(s.g.sim.archive.get(s.id).country).ruler;
  for (const h of offices) assert.equal(h.gets.office.ok, h.id === crowned, 'only the one the realm crowned');
  const rep = scene({government: 'republic', office: 'ruler', flow: true}), v2 = die(rep);
  for (const h of v2.heirs) { assert.ok(h.gets.office, 'the office is mentioned'); assert.equal(h.gets.office.ok, false); assert.equal(h.gets.office.mode, 'elected'); }
});

test('a family post passes to a child who lives in that country; an elected one does not', () => {
  const s = scene({government: 'monarchy', office: 'treasurer', flow: true}), view = die(s);
  const kid = view.heirs.find(h => h.rel === 'child' && h.age >= 18 && h.gets.office?.ok);
  if (kid) {
    s.g.succeed(kid.id);
    const sim = s.g.sim, p = sim.people.get(kid.id);
    assert.equal(p.public_role, 'treasurer'); assert.equal(sim.countries.get(p.country).offices.get('treasurer'), kid.id);
  }
  for (const h of view.heirs.filter(h => h.rel !== 'child' && h.rel !== 'grandchild')) assert.equal(h.gets.office?.ok ?? false, false, 'only direct descendants');
  const rep = scene({government: 'democracy', office: 'treasurer', flow: true}), v2 = die(rep);
  assert.ok(v2.heirs.every(h => !h.gets.office?.ok));
});

test('only family can be chosen, and a random person only when there is none', () => {
  const s = scene(), view = die(s);
  assert.throws(() => s.g.succeed('random'), /family to carry on/);
  const stranger = [...s.g.sim.people.values()].find(p => !view.heirs.some(h => h.id === p.id));
  assert.throws(() => s.g.succeed(stranger.id), /not one of your heirs/);
  assert.throws(() => scene().g.succeed(1), /still alive/);
});

test('with the family gone, a random living adult takes over, with no inheritance, and a new line begins', () => {
  const s = scene(), sim = s.g.sim;
  for (const q of [...sim.people.values()]) if (candidates(sim, s.g.life, {id: s.id}).some(c => c.id === q.id)) s.g.command(`delete person ${q.id}`);
  const view = die(s);
  assert.equal(view.heirs.length, 0);
  const r = s.g.succeed('random');
  assert.equal(r.view.alive, true); assert.equal(r.view.gen, 1); assert.deepEqual(r.view.line, []);
  assert.match(r.view.log[0].text, /stranger chosen by chance/);
  const again = scene(); for (const q of candidates(again.g.sim, again.g.life, {id: again.id})) again.g.command(`delete person ${q.id}`);
  die(again); assert.equal(again.g.succeed('random').view.id, r.view.id, 'the same world picks the same person');
});

test('the heir, the generation count and the estate survive a save', () => {
  const s = scene({flow: true}), view = die(s), pick = view.heirs[0];
  s.g.succeed(pick.id);
  const copy = new Engine(); copy.importSave(s.g.exportSave());
  const v = copy.playerView();
  assert.equal(v.id, pick.id); assert.equal(v.gen, 2); assert.equal(v.line.length, 1);
  const t = scene(), mid = new Engine(); t.g.command(`delete person ${t.id}`); mid.importSave(t.g.exportSave());
  assert.equal(mid.playerView().heirs.length, candidates(mid.sim, mid.life, mid.life.player).length, 'the list rebuilds after loading');
  assert.ok(mid.life.player.mark.wealth >= 0, 'the estate mark was saved');
});
