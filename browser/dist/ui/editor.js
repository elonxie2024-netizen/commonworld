// Edit panels: everything you can change about one person, town, country, tile or disease, on one page.
// Opened by right-clicking it (on the map or in any list) or with the Edit button in its inspector.
// Every row turns into one simulator command, so the rules, the checks and undo are the same as the console.
import { likeliest } from './influences.js';

const KINDS = ['flood', 'storm', 'wildfire', 'earthquake', 'landslide', 'blizzard'];
const SEVERITIES = ['minor', 'major', 'severe'];
const ECONOMIES = ['mixed', 'capitalism', 'communism'];
const COURSES = ['acute', 'chronic', 'endemic'];
const TRANSMISSIONS = ['contact', 'respiratory', 'waterborne'];
const CRISES = [['Famine', 'Famine'], ['Drought', 'Drought'], ['Panic', 'Panic'], ['Health', 'Health scare'], ['Calm', 'Calm'], ['Safety', 'Safety'], ['Abundance', 'Abundance']];
const RELATIONS = [['war', 'Declare war'], ['peace', 'Make peace (5-year truce)'], ['pact', 'Sign a science pact'], ['end', 'End their science pact'], ['science', 'Swap knowledge once']];
export const EDITABLE = ['person', 'settlement', 'country', 'cell', 'disease', 'world'];

// ---- field helpers: [name, label, kind, value, options]
const text = (name, label, value = '', extra = {}) => ({ name, label, kind: 'text', value, ...extra });
const number = (name, label, value = '', extra = {}) => ({ name, label, kind: 'number', value, ...extra });
const choose = (name, label, options, value = '', extra = {}) => ({ name, label, kind: 'select', options, value, ...extra });
const check = (name, label, value = false) => ({ name, label, kind: 'check', value });
const round = (v, d = 2) => (v == null ? '' : Number(Number(v).toFixed(d)));
const pairs = list => list.map(v => (Array.isArray(v) ? v : [v, v]));
const opt = (key, v) => (v[key] !== '' && v[key] != null ? ` ${key}=${v.q(v[key])}` : '');

export class Editor {
  // h: { esc, quote, num, icon, tag, cc, snap(), idx(), places(), resolve(hit), jobs }
  constructor(h) { this.h = h; this.actions = []; }

  // Which editor a map hit or a list item opens. Units, pings and buildings edit the thing behind them.
  static target(hit) {
    if (!hit) return null;
    if (hit.type === 'building') return { type: 'settlement', id: String(hit.sid) };
    if (hit.type === 'ping') return { type: hit.item.target.type, id: String(hit.item.target.id) };
    if (['expedition', 'army', 'caravan'].includes(hit.type)) return { type: 'country', id: String(hit.item.country) };
    if (hit.type === 'cell') return { type: 'cell', id: `${hit.cx ?? hit.item?.x},${hit.cy ?? hit.item?.y}` };
    return EDITABLE.includes(hit.type) ? { type: hit.type, id: String(hit.id) } : null;
  }

  // HTML for the edit page of one item; remembers the actions so a form submit can find its command.
  render(type, item) {
    const { esc, icon } = this.h, page = this[type](item);
    this.actions = [];
    const groups = page.groups.filter(g => g.rows.length).map(g => `<h3 class="sub">${esc(g.title)}${g.note ? ` <small class="muted">${esc(g.note)}</small>` : ''}</h3><div class="ed-rows">${g.rows.map(r => this.row(r)).join('')}</div>`).join('');
    return `<header class="dlg-head" style="--c:${page.color}"><span class="avatar xl sq" style="--c:${page.color}">${icon('hammer')}</span><div><span class="eyebrow">EDIT · ${esc(page.kind)}</span><h2>${esc(page.title)}</h2><div class="tags">${page.links || ''}</div></div></header>
      <div class="dlg-body">${page.back ? `<div class="actions top"><button class="soft" data-edit-back>${icon('list')} Back to details</button></div>` : ''}${page.note ? `<p class="muted">${page.note}</p>` : ''}${groups}<p class="muted ed-foot">Every change happens at once, without advancing time. Undo (top bar) reverts the most recent one.</p></div>`;
  }

  row(r) {
    const { esc } = this.h, i = this.actions.push(r) - 1;
    const fields = (r.fields || []).map(f => {
      const id = `ed-${i}-${f.name}`, attrs = `id="${id}" name="${f.name}" ${f.required ? 'required' : ''}`;
      const input = f.kind === 'select' ? `<select ${attrs}>${pairs(f.options).map(([v, l]) => `<option value="${esc(v)}" ${String(v) === String(f.value) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`
        : f.kind === 'check' ? `<input type="checkbox" ${attrs} ${f.value ? 'checked' : ''}>`
        : `<input type="${f.kind}" ${attrs} value="${esc(f.value)}" ${f.min != null ? `min="${f.min}"` : ''} ${f.max != null ? `max="${f.max}"` : ''} ${f.kind === 'number' ? `step="${f.step ?? 'any'}"` : ''} ${f.list ? `list="${f.list}"` : ''} ${f.placeholder ? `placeholder="${esc(f.placeholder)}"` : ''} title="${esc(f.label)}">`;
      return `<label class="ed-field ${f.kind === 'check' ? 'check' : ''} ${f.wide ? 'wide' : ''}" for="${id}"><span>${esc(f.label)}</span>${input}</label>`;
    }).join('');
    return `<form class="ed-row ${r.danger ? 'danger' : ''}" data-edit-action="${i}"><div class="ed-label"><b>${esc(r.label)}</b>${r.hint ? `<small>${esc(r.hint)}</small>` : ''}</div><div class="ed-fields">${fields}</div><button type="submit" class="${r.danger ? 'danger-btn' : 'primary'}">${esc(r.button || 'Apply')}</button></form>`;
  }

  // The command for a submitted row, or null. Field values arrive as strings (checkboxes as booleans).
  command(i, form) {
    const r = this.actions[Number(i)]; if (!r) return null;
    const v = { q: this.h.quote };
    for (const f of r.fields || []) { const el = form.elements[f.name]; v[f.name] = f.kind === 'check' ? el.checked : el.value.trim(); }
    const cmd = r.run(v);
    return cmd ? { cmd, confirm: r.confirm?.(v) } : null;
  }

  // ---- shared bits
  countryOptions(except) { return this.h.snap().countries.filter(c => c.population > 0 && c.id !== except).map(c => [c.name, c.name]); }
  placeOptions(except) { return this.h.places().filter(s => s.id !== except).sort((a, b) => a.name.localeCompare(b.name)).map(s => [s.name, `${s.name} (${s.countryName})`]); }
  chip(type, item) { return item ? `<button class="chip" data-${type}="${item.id}" style="--c:${this.h.cc(item.country ?? item.id)}"><i></i>${this.h.esc(item.name)}</button>` : ''; }
  editLink(type, id, label) { return `<button class="chip" data-edit="${type}:${id}"><i></i>${this.h.esc(label)}</button>`; }

  // ---- person
  person(p) {
    const { quote: q, idx, snap, jobs } = this.h, n = q(p.name), I = idx(), S = snap();
    const country = I.countries.get(String(p.country)), place = I.settlements.get(String(p.settlement));
    const page = { kind: 'PERSON', title: p.name, color: this.h.cc(p.country), back: true, links: `${this.chip('country', country)}${this.chip('settlement', place)}`, groups: [] };
    if (p.alive === false) { page.note = 'This person has died. Their record stays in the archive and can no longer be edited.'; return page; }
    const adult = p.age >= 18, diseases = S.diseases.map(d => d.name);
    page.groups.push({ title: 'Who they are', rows: [
      { label: 'First name', fields: [text('value', 'First name', p.first, { required: true })], run: v => `set person ${n} name ${q(v.value)}` },
      { label: 'Age', hint: 'Must stay at least 16 years from parents and children', fields: [number('value', 'Years', p.age, { min: 0, max: 150, step: 1 })], run: v => `set person ${n} age ${v.value}` },
      { label: 'Occupation', fields: [choose('value', 'Job', adult ? jobs.filter(j => j !== 'child') : ['child'], p.job)], run: v => `set person ${n} job ${v.value}` },
      { label: 'Family line', fields: [text('value', 'Surname', p.lineageName, { list: 'ed-lineages', required: true })], run: v => `set person ${n} lineage ${q(v.value)}` }
    ] });
    page.groups.push({ title: 'Standing', rows: [
      { label: 'Wealth', fields: [number('value', 'Wealth', round(p.wealth, 1), { min: 0 })], run: v => `set person ${n} wealth ${v.value}` },
      { label: 'Fame', fields: [number('value', '0 to 100', round(p.fame, 1), { min: 0, max: 100 })], run: v => `set person ${n} fame ${v.value}` },
      ...(adult && country ? [{ label: `Make ruler of ${country.name}`, hint: country.rulerName ? `Replaces ${country.rulerName}` : 'The country has no ruler', run: () => `set country ${q(country.name)} ruler ${n}`, button: 'Crown' }] : [])
    ] });
    page.groups.push({ title: 'Home', rows: [
      { label: 'Move to', hint: 'They take their citizenship from the new town', fields: [choose('to', 'Settlement', this.placeOptions(p.settlement))], run: v => `move person ${n} ${q(v.to)}` }
    ] });
    page.groups.push({ title: 'Health', rows: [
      ...(diseases.length ? [{ label: 'Infect', fields: [choose('disease', 'Disease', diseases)], run: v => `infect ${n} ${q(v.disease)}` }] : []),
      ...(p.infection ? [{ label: `Cure their ${p.infection}`, run: () => `cure ${n}`, button: 'Cure' }] : [])
    ] });
    page.groups.push({ title: 'Family', rows: adult ? [
      { label: 'Have a child', hint: 'Born today in their home town', fields: [text('name', 'Child’s name', '', { placeholder: 'random' })], run: v => `add person ${q(p.settlementName)}${v.name ? ` name=${q(v.name)}` : ''} age=0 parent=${n}`, button: 'Add' },
      { label: 'Found a new family branch', fields: [text('surname', 'Surname', '', { placeholder: 'random' })], run: v => `add lineage ${n}${opt('surname', v)}`, button: 'Found' }
    ] : [] });
    page.groups.push({ title: 'End', rows: [
      { label: 'Death', hint: 'Records a death; their estate is inherited and their history kept', run: () => `delete person ${n}`, danger: true, button: 'Kill', confirm: () => `Record the death of ${p.name}?` }
    ] });
    return page;
  }

  // ---- settlement
  settlement(s) {
    const { quote: q, idx, snap } = this.h, n = q(s.name), I = idx(), S = snap(), country = I.countries.get(String(s.country));
    const page = { kind: (s.kind || 'settlement').toUpperCase(), title: s.name, color: this.h.cc(s.country), back: true, links: this.chip('country', country), groups: [] };
    if (s.abandoned) { page.note = 'This settlement is abandoned. Its history remains, but it can no longer be edited.'; return page; }
    const kinds = Object.keys(S.buildingCatalog || {}).filter(k => !(k in (s.buildings || {}))), label = k => S.buildingCatalog[k]?.[0] || k;
    page.groups.push({ title: 'The town', rows: [
      { label: 'Name', fields: [text('value', 'Name', s.name, { required: true })], run: v => `set settlement ${n} name ${q(v.value)}` },
      { label: 'Belongs to', hint: 'Hands the town and its people to another country', fields: [choose('value', 'Country', this.countryOptions(s.country))], run: v => `set settlement ${n} country ${q(v.value)}` }
    ] });
    page.groups.push({ title: 'Build', rows: [
      ...(kinds.length ? [{ label: 'Building', hint: 'Finished at once; force skips the technology it needs', fields: [choose('kind', 'Kind', kinds.map(k => [k, label(k)])), check('force', 'Force')], run: v => `build ${n} ${v.kind}${v.force ? ' force=true' : ''}`, button: 'Build' }] : []),
      { label: 'Road', fields: [choose('to', 'To', this.placeOptions(s.id))], run: v => `build ${n} road to=${q(v.to)}`, button: 'Build' }
    ] });
    page.groups.push({ title: 'People', rows: [
      { label: 'Add a resident', fields: [text('name', 'First name', '', { placeholder: 'random' }), number('age', 'Age', 25, { min: 0, max: 150, step: 1 }), text('surname', 'Surname', '', { placeholder: 'random', list: 'ed-lineages' })], run: v => `add person ${n}${opt('name', v)}${opt('age', v)}${opt('surname', v)}`, button: 'Add' },
      { label: 'Send settlers', hint: 'They walk off to found a new town', fields: [number('size', 'How many', '', { min: 1, step: 1, placeholder: 'their choice' })], run: v => `settle ${n}${v.size ? ` size=${v.size}` : ''}`, button: 'Send' }
    ] });
    page.groups.push({ title: 'Events', rows: [
      ...(country ? [{ label: 'Disaster here', fields: [choose('kind', 'Kind', KINDS), choose('severity', 'Severity', SEVERITIES)], run: v => `disaster ${q(country.name)} ${v.kind} severity=${v.severity} at=${n}`, button: 'Strike' }] : []),
      { label: 'Break away', hint: 'Becomes a new country of its own', fields: [text('name', 'New country', '', { placeholder: 'random' })], run: v => `add country ${n}${opt('name', v)}`, button: 'Secede' },
      { label: 'Remove the town', hint: 'Its people move to the destination; history is kept', fields: [choose('to', 'Move people to', this.placeOptions(s.id))], run: v => `delete settlement ${n} to=${q(v.to)}`, danger: true, button: 'Remove', confirm: v => `Remove ${s.name} and move its people to ${v.to}?` }
    ] });
    return page;
  }

  // ---- country
  country(c) {
    const { quote: q, idx, snap } = this.h, n = q(c.name), I = idx(), S = snap();
    const page = { kind: 'COUNTRY', title: c.name, color: this.h.cc(c.id), back: true, groups: [] };
    if (!(c.population > 0)) { page.note = 'This country has dissolved. Its history remains, but it can no longer be edited.'; return page; }
    const govs = Object.entries(S.governments || {}).map(([k, g]) => [k, g?.label ?? (g instanceof Map ? g.get('label') : k)]);
    const adults = I.living.filter(p => p.country === c.id && p.age >= 18).sort((a, b) => (b.fame || 0) - (a.fame || 0) || a.name.localeCompare(b.name)).slice(0, 250);
    const known = [...c.technologies, ...c.innovations], knownSet = new Set(known);
    const others = this.countryOptions(c.id);
    page.groups.push({ title: 'Government', rows: [
      { label: 'Name', fields: [text('value', 'Name', c.name, { required: true })], run: v => `set country ${n} name ${q(v.value)}` },
      { label: 'Government', fields: [choose('value', 'Form', govs, c.government)], run: v => `set country ${n} government ${v.value}` },
      { label: 'Economy', fields: [choose('value', 'System', ECONOMIES, c.economicSystem)], run: v => `set country ${n} economy ${v.value}` },
      ...(adults.length ? [{ label: 'Ruler', hint: 'The 250 best-known adults', fields: [choose('value', 'Person', [['none', 'Nobody'], ...adults.map(p => [p.name, p.name])], adults.find(p => p.name === c.rulerName)?.name || 'none')], run: v => `set country ${n} ruler ${q(v.value)}` }] : []),
      { label: 'Quarantine', hint: 'Closes the borders to sickness, at a cost to trade', fields: [choose('value', 'State', [['on', 'On'], ['off', 'Off']], c.quarantine ? 'on' : 'off')], run: v => `set country ${n} quarantine ${v.value}` }
    ] });
    const score = (key, label, hint) => ({ label, hint, fields: [number('value', '0 to 100', round(c[key], 1), { min: 0, max: 100 })], run: v => `set country ${n} ${key} ${v.value}` });
    page.groups.push({ title: 'Condition', rows: [
      score('food', 'Food', 'Below 30 risks famine'), score('prosperity', 'Prosperity'), score('stability', 'Stability', 'Low stability breeds unrest and breakaways'),
      { label: 'Treasury', fields: [number('value', 'Coins', round(c.treasury, 0), { min: 0 })], run: v => `set country ${n} treasury ${v.value}` },
      { label: 'Research stock', fields: [number('value', 'Points', round(c.research, 0), { min: 0 })], run: v => `set country ${n} research ${v.value}` },
      { label: 'Land capacity', hint: 'How many people the land can feed', fields: [number('value', 'People', c.capacity ?? '', { min: 1, step: 1 })], run: v => `set country ${n} capacity ${v.value}` },
      { label: 'Crisis or blessing', fields: [choose('event', 'Event', CRISES)], run: v => `trigger ${n} ${v.event}`, button: 'Trigger' }
    ] });
    page.groups.push({ title: 'Discoveries', note: `${known.length} known`, rows: [
      { label: 'Seed an idea', hint: 'A third of the way to a discovery it is ready for', fields: [text('name', 'Discovery', '', { list: 'ed-discoveries', placeholder: 'the likeliest' })], run: v => `inspire ${n}${v.name ? ' ' + q(v.name) : ''}`, button: 'Inspire' },
      { label: 'Grant', hint: 'Ready ones first; the rest need prerequisites', fields: [choose('name', 'Discovery', this.grantable(c, knownSet))], run: v => `grant ${n} ${q(v.name)}`, button: 'Grant' },
      ...(known.length ? [{ label: 'Revoke', hint: 'Also removes what depends on it', fields: [choose('name', 'Discovery', [...known].sort())], run: v => `revoke ${n} ${q(v.name)}`, danger: true, button: 'Revoke' }] : [])
    ] });
    page.groups.push({ title: 'Relations', rows: others.length ? [
      { label: 'With another country', fields: [choose('other', 'Country', others), choose('act', 'Do', RELATIONS), check('force', 'Break a truce')],
        run: v => (v.act === 'pact' ? `trade pact ${n} ${q(v.other)}` : v.act === 'end' ? `trade end ${n} ${q(v.other)}` : v.act === 'science' ? `trade science ${n} ${q(v.other)}` : `${v.act} ${n} ${q(v.other)}${v.act === 'war' && v.force ? ' force=true' : ''}`), button: 'Go' }
    ] : [] });
    page.groups.push({ title: 'Events', rows: [
      ...(S.diseases.length ? [{ label: 'Outbreak', fields: [choose('disease', 'Disease', S.diseases.map(d => d.name)), number('cases', 'Cases', 5, { min: 1, step: 1 })], run: v => `outbreak ${n} ${q(v.disease)} cases=${v.cases || 5}`, button: 'Spread' }] : []),
      { label: 'Disaster', hint: 'Strikes its most exposed town', fields: [choose('kind', 'Kind', KINDS), choose('severity', 'Severity', SEVERITIES)], run: v => `disaster ${n} ${v.kind} severity=${v.severity}`, button: 'Strike' },
      { label: 'Found a settlement', hint: 'Moves residents from its towns', fields: [text('name', 'Name', '', { placeholder: 'random' }), number('residents', 'Residents', 10, { min: 1, step: 1 })], run: v => `add settlement ${n}${opt('name', v)}${opt('residents', v)}`, button: 'Found' },
      ...(others.length ? [{ label: 'Merge into', hint: 'Its people and land join the other country', fields: [choose('to', 'Country', others)], run: v => `delete country ${n} to=${q(v.to)}`, danger: true, button: 'Merge', confirm: v => `Merge ${c.name} into ${v.to}? The country ends.` }] : [])
    ] });
    return page;
  }

  // Unknown discoveries, the ones whose prerequisites are already known first.
  grantable(c, knownSet) {
    const S = this.h.snap(), tree = S.tech?.tree || {}, any = S.tech?.any || {};
    const missing = d => tree[d] ? [...tree[d][0].filter(r => !knownSet.has(r)), ...(any[d] || []).filter(g => !g.some(r => knownSet.has(r))).map(g => g.join(' or '))] : null;
    const rows = (S.discoveryNames || []).filter(d => !knownSet.has(d)).map(d => ({ d, need: missing(d) }));
    const ready = rows.filter(r => r.need && !r.need.length).map(r => [r.d, `${r.d} · ready`]);
    const rest = rows.filter(r => !r.need || r.need.length).map(r => [r.d, r.need ? `${r.d} · needs ${r.need.join(', ')}` : r.d]);
    return [...ready.sort(), ...rest.sort()];
  }

  // ---- tile
  cell(t) {
    const { quote: q, resolve } = this.h, r = resolve({ type: 'cell', cx: t.x, cy: t.y }) || {};
    const page = { kind: `TILE · ${t.x}, ${t.y}`, title: `Tile ${t.x}, ${t.y}`, color: '#0ea5e9', back: true, groups: [] };
    if (r.country) page.links = this.editLink('country', r.country.id, `Edit ${r.country.name}`);
    if (r.settlement) page.links += this.editLink('settlement', r.settlement.id, `Edit ${r.settlement.name}`);
    if (r.water) { page.note = 'This is water. Nothing can be founded or struck here; pick land.'; return page; }
    const near = this.h.places().map(s => ({ s, d: Math.hypot(s.gx - t.x, s.gy - t.y) })).filter(x => x.s.population >= 20).sort((a, b) => a.d - b.d).slice(0, 30);
    page.groups.push({ title: 'Settle', rows: near.length && !r.settlement ? [
      { label: 'Send settlers here', hint: 'They travel for a few years, then found a town', fields: [choose('from', 'From', near.map(x => [x.s.name, `${x.s.name} (${Math.round(x.d)} tiles)`])), number('size', 'How many', '', { min: 1, step: 1, placeholder: 'their choice' })], run: v => `settle ${q(v.from)} x=${t.x} y=${t.y}${v.size ? ` size=${v.size}` : ''}`, button: 'Send' }
    ] : [] });
    page.groups.push({ title: 'Disaster', note: r.country ? `Counts against ${r.country.name}` : '', rows: r.country ? [
      { label: 'Strike this tile', fields: [choose('kind', 'Kind', KINDS, likeliest(r)), choose('severity', 'Severity', SEVERITIES)], run: v => `disaster ${q(r.country.name)} ${v.kind} severity=${v.severity} x=${t.x} y=${t.y}`, button: 'Strike' }
    ] : [] });
    if (!page.groups.some(x => x.rows.length)) page.note = 'No country is near enough to this tile to act on it.';
    return page;
  }

  // ---- disease
  disease(d) {
    const { quote: q, snap } = this.h, n = q(d.name), S = snap(), ready = d.cure >= 100 && d.active === 0;
    const page = { kind: 'DISEASE', title: d.name, color: '#ec4899', back: true, groups: [] };
    const chance = (key, field, label) => ({ label, fields: [number('value', '0 to 1', round(d[key], 3), { min: 0, max: 1 })], run: v => `set disease ${n} ${field} ${v.value}` });
    page.groups.push({ title: 'How it behaves', rows: [
      { label: 'Course', fields: [choose('value', 'Course', COURSES, d.course)], run: v => `set disease ${n} course ${v.value}` },
      { label: 'Spreads by', fields: [choose('value', 'Route', TRANSMISSIONS, d.transmission)], run: v => `set disease ${n} transmission ${v.value}` },
      chance('infectionChance', 'infection', 'Chance to catch it on contact'), chance('deathChance', 'death', 'Yearly death chance when sick'), chance('recoveryChance', 'recovery', 'Yearly recovery chance'),
      { label: 'Immunity after recovery', fields: [number('value', 'Years', d.immunityYears ?? '', { min: 0, step: 1 })], run: v => `set disease ${n} immunity ${v.value}` }
    ] });
    page.groups.push({ title: 'Spread and cure', rows: [
      { label: 'Outbreak', fields: [choose('country', 'Country', this.countryOptions()), number('cases', 'Cases', 5, { min: 1, step: 1 })], run: v => `outbreak ${q(v.country)} ${n} cases=${v.cases || 5}`, button: 'Spread' },
      { label: 'Cure progress', fields: [number('value', '0 to 100', round(d.cure, 1), { min: 0, max: 100 })], run: v => `set disease ${n} cure ${v.value}` },
      { label: 'Eradicate', hint: ready ? 'Records stay inspectable' : 'Needs a 100% cure and nobody infected', run: () => `eradicate ${n}`, danger: true, button: 'Eradicate', confirm: () => `Eradicate ${d.name}?` }
    ] });
    return page;
  }

  // ---- the world's own rules
  world() {
    const { quote: q, snap } = this.h, s = snap().settings || {};
    const rule = (key, label, hint) => ({ label, hint, fields: [number('value', '0 to 1', round(s[key], 3), { min: 0, max: 1 })], run: v => `set simulation ${key} ${v.value}` });
    return { kind: 'WORLD', title: 'World rules', color: '#5b5bf0', groups: [
      { title: 'Yearly chances', rows: [rule('war_chance', 'War', 'How readily rivals go to war'), rule('country_chance', 'New countries', 'How readily towns break away'), rule('lineage_chance', 'New family lines'), rule('disaster_chance', 'Natural disasters')] },
      { title: 'People', rows: [
        { label: 'People shape the world', hint: 'Off: what people do each season (trade, study, moving, promotion) stays in their own story. On: it changes the real world.', fields: [choose('value', 'State', [['off', 'Off (their own story)'], ['on', 'On (changes the world)']], snap().lifeFlow ? 'on' : 'off')], run: v => `life flow ${v.value}` }
      ] },
      { title: 'New disease', rows: [
        { label: 'Create a disease', hint: 'It spreads only once it breaks out somewhere', fields: [text('name', 'Name', '', { required: true }), choose('course', 'Course', COURSES), choose('transmission', 'Spreads by', TRANSMISSIONS), number('infection', 'Infection', 0.35, { min: 0, max: 1 }), number('death', 'Death', 0.02, { min: 0, max: 1 }), number('recovery', 'Recovery', 0.85, { min: 0, max: 1 })],
          run: v => `add disease ${q(v.name)} course=${v.course} transmission=${v.transmission}${opt('infection', v)}${opt('death', v)}${opt('recovery', v)}`, button: 'Create' }
      ] }
    ] };
  }

  // Datalists shared by every panel (family names, discovery names).
  lists() {
    const { esc, snap } = this.h, S = snap();
    return `<datalist id="ed-lineages">${(S.lineages || []).map(l => `<option value="${esc(l)}">`).join('')}</datalist><datalist id="ed-discoveries">${(S.discoveryNames || []).map(d => `<option value="${esc(d)}">`).join('')}</datalist>`;
  }
}
