// The influence bar: small nudges to the world, aimed by clicking the map instead of typing commands.
// Each influence lists the clicks it needs; the last click turns them into one simulator command (so undo still works).

const MOODS = [['pact', 'Friendship', 'A science pact: they share what they learn every year'], ['peace', 'Ease tensions', 'Peace and a five-year truce'], ['war', 'Stoke rivalry', 'Their quarrel turns into war']];
const KINDS = ['likeliest', 'flood', 'storm', 'wildfire', 'earthquake', 'landslide', 'blizzard'];
const SEVERITIES = ['minor', 'major', 'severe'];

const STEPS = {
  town: { ask: 'a town', take: r => r.settlement },
  land: { ask: 'open land', take: r => (r.settlement ? null : !r.cell || r.water ? null : r) },
  country: { ask: 'a country (any of its towns or land)', take: r => r.country },
  tile: { ask: 'land', take: r => (!r.cell || r.water ? null : r) }
};

export const INFLUENCES = [
  {
    id: 'expedition', icon: 'compass', label: 'Spark an expedition', color: '#0d9488', steps: ['town', 'land'],
    prompt: ['Click a town to send settlers from', p => `Settlers from ${p[0].name}: click open land for the new town, or let them choose`],
    skip: 'Let them choose',
    command: (p, q) => `settle ${q(p[0].name)}${p[1] ? ` x=${p[1].cell[0]} y=${p[1].cell[1]}` : ''}`
  },
  {
    id: 'idea', icon: 'bulb', label: 'Seed an idea', color: '#8b5cf6', steps: ['country'],
    prompt: ['Click a country to plant an idea in its scholars’ heads'],
    command: (p, q) => `inspire ${q(p[0].name)}`
  },
  {
    id: 'diplomacy', icon: 'flag', label: 'Shift diplomacy', color: '#f59e0b', steps: ['country', 'country'],
    options: { mood: MOODS.map(m => m[0]) }, labels: Object.fromEntries(MOODS.map(m => [m[0], m[1]])), tips: Object.fromEntries(MOODS.map(m => [m[0], m[2]])),
    prompt: ['Click the first country', p => `${p[0].name} and… click the second country`],
    command: (p, q, o) => (o.mood === 'pact' ? `trade pact ${q(p[0].name)} ${q(p[1].name)}` : `${o.mood} ${q(p[0].name)} ${q(p[1].name)}`)
  },
  {
    id: 'disaster', icon: 'bolt', label: 'Stir the land', color: '#f97316', steps: ['tile'],
    options: { kind: KINDS, severity: SEVERITIES }, labels: { likeliest: 'Likeliest here' },
    prompt: ['Click where the land should stir'],
    command: (p, q, o) => `disaster ${q(p[0].country.name)} ${o.kind === 'likeliest' ? likeliest(p[0]) : o.kind} severity=${o.severity} x=${p[0].cell[0]} y=${p[0].cell[1]}`
  }
];

// What the ground itself would most likely do: rivers and marsh flood, peaks shake, slopes slide, forests and deserts burn.
export function likeliest(r) {
  if (r.river || r.terrain === 's') return 'flood';
  if (r.terrain === 'm') return 'earthquake';
  if (r.terrain === 'h') return 'landslide';
  if (r.terrain === 't') return 'blizzard';
  if (r.terrain === 'f' || r.terrain === 'd') return 'wildfire';
  return r.coast ? 'storm' : 'flood';
}

export class InfluenceBar {
  // run(command) -> Promise<boolean>; resolve(hit) -> { settlement, country, cell, water, terrain, river, coast, name } or null
  constructor(el, { run, resolve, quote, esc, icon, toast, onArm }) {
    Object.assign(this, { el, run, resolve, quote, esc, icon, toast, onArm });
    this.active = null; this.picks = []; this.opts = { mood: 'pact', kind: 'likeliest', severity: 'minor' };
    el.addEventListener('click', e => this.click(e));
    this.render();
  }

  get armed() { return !!this.active; }
  influence() { return INFLUENCES.find(i => i.id === this.active); }

  arm(id, picks = []) {
    this.active = this.active === id && !picks.length ? null : id; this.picks = this.active ? picks : [];
    this.render(); this.onArm?.(this.armed);
  }
  cancel() { if (this.armed) this.arm(this.active); }

  // A map click while armed. Returns true when the click was used for aiming (so it should not open a dialog).
  pick(hit) {
    const inf = this.influence(); if (!inf) return false;
    const r = this.resolve(hit), step = STEPS[inf.steps[this.picks.length]], got = r && step.take(r);
    if (!got) { this.toast(`Pick ${step.ask} for this.`, 'warn'); return true; }
    if (inf.id === 'diplomacy' && this.picks[0] && this.picks[0].id === got.id) { this.toast('Pick a different country.', 'warn'); return true; }
    this.picks.push(got);
    if (this.picks.length === inf.steps.length) this.fire(); else this.render();
    return true;
  }

  async fire() {
    const inf = this.influence(), cmd = inf.command(this.picks, this.quote, this.opts);
    this.active = null; this.picks = []; this.render(); this.onArm?.(false);
    await this.run(cmd);
  }

  // A line for the map tooltip while aiming.
  hint(hit) {
    const inf = this.influence(); if (!inf) return '';
    const r = this.resolve(hit), got = r && STEPS[inf.steps[this.picks.length]].take(r);
    return got ? `Click to choose ${esc1(got.name || (got.cell ? `${got.cell[0]}, ${got.cell[1]}` : ''))}` : `Not here: pick ${STEPS[inf.steps[this.picks.length]].ask}`;
  }

  click(e) {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.influence) this.arm(t.dataset.influence);
    else if (t.dataset.infOpt) { const [k, v] = t.dataset.infOpt.split(':'); this.opts[k] = v; this.render(); }
    else if ('infSkip' in t.dataset) { this.picks.push(null); this.fire(); }
    else if ('infCancel' in t.dataset) this.cancel();
  }

  render() {
    const { esc, icon } = this, inf = this.influence();
    const buttons = INFLUENCES.map(i => `<button class="inf-btn ${i.id === this.active ? 'on' : ''}" data-influence="${i.id}" style="--c:${i.color}" title="${esc(i.label)}" aria-pressed="${i.id === this.active}">${icon(i.icon)}<span>${esc(i.label)}</span></button>`).join('');
    let strip = '';
    if (inf) {
      const ask = inf.prompt[this.picks.length], text = typeof ask === 'function' ? ask(this.picks) : ask;
      const options = Object.entries(inf.options || {}).map(([k, values]) => `<span class="inf-opts">${values.map(v => `<button class="${this.opts[k] === v ? 'on' : ''}" data-inf-opt="${k}:${v}" ${inf.tips?.[v] ? `title="${esc(inf.tips[v])}"` : ''}>${esc(inf.labels?.[v] || v)}</button>`).join('')}</span>`).join('');
      const skip = inf.skip && this.picks.length === inf.steps.length - 1 ? `<button class="inf-skip" data-inf-skip>${esc(inf.skip)}</button>` : '';
      strip = `<div class="inf-strip" style="--c:${inf.color}"><span class="inf-step">${inf.steps.length > 1 ? `<b>${this.picks.length + 1}/${inf.steps.length}</b>` : ''}${esc(text)}</span>${options}${skip}<button class="inf-cancel" data-inf-cancel>Cancel <kbd>Esc</kbd></button></div>`;
    }
    this.el.innerHTML = `${strip}<div class="inf-buttons" role="toolbar" aria-label="Influence the world">${buttons}</div>`;
  }
}

const esc1 = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
