import { esc, icon, quote, val, opt, JOBS } from './util.js';

export const EVENTS = ['Famine', 'Drought', 'Panic', 'Health', 'Calm', 'Safety', 'Abundance'];
export const DISASTERS = ['flood', 'storm', 'wildfire', 'earthquake', 'landslide', 'blizzard'];
const BUILD_KINDS = ['well', 'granary', 'market', 'school', 'library', 'university', 'observatory', 'clinic', 'hospital', 'aqueduct', 'walls', 'harbor', 'levee', 'firebreak', 'foundations', 'monument', 'theater', 'mine', 'mill'];
export const SEVERITIES = ['minor', 'major', 'severe'];
export const GOVERNMENTS = ['tribal', 'monarchy', 'council', 'republic', 'democracy', 'theocracy', 'junta', 'oligarchy', 'empire', 'merchant', 'tyranny'];
export const ECONOMIES = ['mixed', 'capitalism', 'communism'];
export const GROUP_COLORS = { Simulation: '#5b5bf0', People: '#ec4899', Places: '#14b8a6', Countries: '#f97316', Health: '#ef4444', 'Conflict & events': '#f59e0b', Discoveries: '#8b5cf6', Development: '#0ea5e9', Lookup: '#3b82f6' };
export const GROUPS = Object.keys(GROUP_COLORS);

const o = (v, ...keys) => keys.filter(k => String(v[k] ?? '').trim() !== '').map(k => ' ' + opt(k, String(v[k]).trim())).join('');
const PERSON_HINTS = { name: 'Any first name.', age: 'Whole number, 0–150.', wealth: 'Number in simulation units.', fame: 'Number, 0–100.', job: JOBS.join(', '), settlement: 'Settlement name.', country: 'Country name (moves the person to its capital).' };
const COUNTRY_HINTS = { name: 'Any name.', government: GOVERNMENTS.join(' or '), economy: ECONOMIES.join(', '), food: '0–100', prosperity: '0–100', stability: '0–100', research: 'Number ≥ 0', treasury: 'Number ≥ 0', capacity: 'Whole number ≥ 1', ruler: 'A living adult in this country, or none', quarantine: 'on or off' };
const DISEASE_HINTS = { course: 'acute, chronic, or endemic', infection: '0–1', death: '0–1', recovery: '0–1', transmission: 'contact, respiratory, or waterborne', immunity: 'Whole years, 1–100', cure: 'Cure progress, 0–100 (scientists and healers raise it each year)' };

export const TOOLS = [
  { id: 'person-set', group: 'People', icon: 'user', title: 'Edit a person', desc: 'Change a name, age, wealth, fame, job, home, or country.', fields: [{ key: 'person', type: 'person', label: 'Person' }, { key: 'field', type: 'select', label: 'Property', options: ['name', 'age', 'wealth', 'fame', 'job', 'settlement', 'country'] }, { key: 'value', type: 'text', label: 'New value' }], hint: v => PERSON_HINTS[v.field], build: v => `set person ${quote(v.person)} ${v.field} ${val(v.value)}` },
  { id: 'person-add', group: 'People', icon: 'plus', title: 'Add a person', desc: 'Create a resident in a settlement.', fields: [{ key: 'settlement', type: 'settlement', label: 'Settlement' }, { key: 'name', type: 'text', label: 'First name', optional: true }, { key: 'surname', type: 'text', label: 'Surname', optional: true }, { key: 'age', type: 'number', label: 'Age', optional: true, def: 25 }], build: v => `add person ${quote(v.settlement)}${o(v, 'name', 'age', 'surname')}` },
  { id: 'person-move', group: 'People', icon: 'map', title: 'Move a person', desc: 'Relocate someone to another settlement.', fields: [{ key: 'person', type: 'person', label: 'Person' }, { key: 'settlement', type: 'settlement', label: 'Destination' }], build: v => `move person ${quote(v.person)} ${quote(v.settlement)}` },
  { id: 'lineage-add', group: 'People', icon: 'users', title: 'Found a family branch', desc: 'Start a new lineage from a person.', fields: [{ key: 'person', type: 'person', label: 'Person' }, { key: 'surname', type: 'text', label: 'Surname', optional: true }], build: v => `add lineage ${quote(v.person)}${o(v, 'surname')}` },
  { id: 'person-delete', group: 'People', icon: 'trash', danger: true, title: 'Remove a person', desc: 'Records a death. Ancestry and archive remain.', fields: [{ key: 'person', type: 'person', label: 'Person' }], build: v => `delete person ${quote(v.person)}` },

  { id: 'settlement-add', group: 'Places', icon: 'plus', title: 'Add a settlement', desc: 'Found a new town; residents relocate into it.', fields: [{ key: 'country', type: 'country', label: 'Country' }, { key: 'name', type: 'text', label: 'Name', optional: true }, { key: 'residents', type: 'number', label: 'Residents', optional: true, def: 10 }], build: v => `add settlement ${quote(v.country)}${o(v, 'name', 'residents')}` },
  { id: 'settlement-set', group: 'Places', icon: 'home', title: 'Edit a settlement', desc: 'Rename it or hand it to another country.', fields: [{ key: 'settlement', type: 'settlement', label: 'Settlement' }, { key: 'field', type: 'select', label: 'Property', options: ['name', 'country'] }, { key: 'value', type: 'text', label: 'New value' }], hint: v => (v.field === 'country' ? 'Country name.' : 'Any name.'), build: v => `set settlement ${quote(v.settlement)} ${v.field} ${val(v.value)}` },
  { id: 'settlement-delete', group: 'Places', icon: 'trash', danger: true, title: 'Remove a settlement', desc: 'Residents relocate; its history remains.', fields: [{ key: 'settlement', type: 'settlement', label: 'Settlement' }, { key: 'to', type: 'settlement', label: 'Relocate residents to' }], build: v => `delete settlement ${quote(v.settlement)} ${opt('to', v.to)}` },

  { id: 'country-set', group: 'Countries', icon: 'flag', title: 'Edit a country', desc: 'Government, economy, food, prosperity, stability, and more.', fields: [{ key: 'country', type: 'country', label: 'Country' }, { key: 'field', type: 'select', label: 'Property', options: ['name', 'government', 'economy', 'food', 'prosperity', 'stability', 'research', 'treasury', 'capacity', 'ruler', 'quarantine'] }, { key: 'value', type: 'text', label: 'New value' }], hint: v => COUNTRY_HINTS[v.field], build: v => `set country ${quote(v.country)} ${v.field} ${val(v.value)}` },
  { id: 'country-add', group: 'Countries', icon: 'plus', title: 'Split off a country', desc: 'A settlement secedes as a new country.', fields: [{ key: 'settlement', type: 'settlement', label: 'Seceding settlement' }, { key: 'name', type: 'text', label: 'Country name', optional: true }], build: v => `add country ${quote(v.settlement)}${o(v, 'name')}` },
  { id: 'country-delete', group: 'Countries', icon: 'trash', danger: true, title: 'Merge a country', desc: 'Population and territory move to another country.', fields: [{ key: 'country', type: 'country', label: 'Country' }, { key: 'to', type: 'country', label: 'Merge into' }], build: v => `delete country ${quote(v.country)} ${opt('to', v.to)}` },

  { id: 'rates', group: 'Simulation', icon: 'sliders', title: 'Simulation rates', desc: 'Yearly chances. Moving a slider applies it immediately.', custom: 'rates' },

  { id: 'disease-add', group: 'Health', icon: 'dna', title: 'Create a disease', desc: 'Define a new disease. Blank fields use defaults.', fields: [{ key: 'name', type: 'text', label: 'Name' }, { key: 'course', type: 'select', label: 'Course', options: ['acute', 'chronic', 'endemic'] }, { key: 'infection', type: 'number', label: 'Infection chance (0–1)', optional: true, step: 0.01, def: 0.35 }, { key: 'death', type: 'number', label: 'Death chance (0–1)', optional: true, step: 0.001 }, { key: 'recovery', type: 'number', label: 'Recovery chance (0–1)', optional: true, step: 0.01 }, { key: 'transmission', type: 'select', label: 'Transmission', options: ['contact', 'respiratory', 'waterborne'] }, { key: 'immunity', type: 'number', label: 'Immunity (years)', optional: true }], build: v => `add disease ${val(v.name)}${o(v, 'course', 'infection', 'death', 'recovery', 'transmission', 'immunity')}` },
  { id: 'disease-set', group: 'Health', icon: 'dna', title: 'Tune a disease', desc: 'Adjust how a disease behaves.', fields: [{ key: 'disease', type: 'disease', label: 'Disease' }, { key: 'field', type: 'select', label: 'Property', options: ['cure', 'infection', 'death', 'recovery', 'immunity', 'course', 'transmission'] }, { key: 'value', type: 'text', label: 'New value' }], hint: v => DISEASE_HINTS[v.field], build: v => `set disease ${quote(v.disease)} ${v.field} ${val(v.value)}` },
  { id: 'infect', group: 'Health', icon: 'pulse', title: 'Infect a person', desc: 'Give a person a disease.', fields: [{ key: 'person', type: 'person', label: 'Person' }, { key: 'disease', type: 'disease', label: 'Disease' }], build: v => `infect ${quote(v.person)} ${quote(v.disease)}` },
  { id: 'cure', group: 'Health', icon: 'shield', title: 'Cure a person', desc: 'Remove a current infection.', fields: [{ key: 'person', type: 'person', label: 'Person' }], build: v => `cure ${quote(v.person)}` },
  { id: 'outbreak', group: 'Health', icon: 'bolt', title: 'Start an outbreak', desc: 'Infect several people in a country.', fields: [{ key: 'country', type: 'country', label: 'Country' }, { key: 'disease', type: 'disease', label: 'Disease' }, { key: 'cases', type: 'number', label: 'Cases', optional: true, def: 5 }], build: v => `outbreak ${quote(v.country)} ${quote(v.disease)}${o(v, 'cases')}` },
  { id: 'disease-eradicate', group: 'Health', icon: 'shield', title: 'Eradicate a disease', desc: 'Only possible with a 100% cure and no current infections.', fields: [{ key: 'disease', type: 'disease', label: 'Disease' }], build: v => `eradicate ${quote(v.disease)}` },

  { id: 'trigger', group: 'Conflict & events', icon: 'bolt', title: 'Trigger a condition', desc: 'Apply a national condition right now.', fields: [{ key: 'country', type: 'country', label: 'Country' }, { key: 'event', type: 'select', label: 'Condition', options: EVENTS }], build: v => `trigger ${quote(v.country)} ${v.event}` },
  { id: 'disaster', group: 'Conflict & events', icon: 'bolt', title: 'Cause a disaster', desc: 'Flood, storm, wildfire, or earthquake.', fields: [{ key: 'country', type: 'country', label: 'Country' }, { key: 'type', type: 'select', label: 'Disaster', options: DISASTERS }, { key: 'severity', type: 'select', label: 'Severity', options: SEVERITIES, def: 'major' }, { key: 'at', type: 'settlement', label: 'Centered on (optional; default is the riskiest town)', optional: true }], build: v => `disaster ${quote(v.country)} ${v.type}${o(v, 'severity', 'at')}` },
  { id: 'war', group: 'Conflict & events', icon: 'swords', title: 'Declare war', desc: 'Start a war between two countries.', fields: [{ key: 'a', type: 'country', label: 'Country A' }, { key: 'b', type: 'country', label: 'Country B', second: true }, { key: 'force', type: 'check', label: 'Break an existing truce' }], build: v => `war ${quote(v.a)} ${quote(v.b)}${v.force ? ' force=true' : ''}` },
  { id: 'peace', group: 'Conflict & events', icon: 'flag', title: 'Make peace', desc: 'End a war and set a truce.', fields: [{ key: 'a', type: 'country', label: 'Country A' }, { key: 'b', type: 'country', label: 'Country B', second: true }, { key: 'years', type: 'number', label: 'Truce years', optional: true, def: 5 }], build: v => `peace ${quote(v.a)} ${quote(v.b)}${o(v, 'years')}` },
  { id: 'trade-science', group: 'Conflict & events', icon: 'bulb', title: 'Trade science', desc: 'Two countries swap know-how: each learns part of a discovery the other holds.', fields: [{ key: 'a', type: 'country', label: 'Country A' }, { key: 'b', type: 'country', label: 'Country B', second: true }], build: v => `trade science ${quote(v.a)} ${quote(v.b)}` },
  { id: 'science-pact', group: 'Conflict & events', icon: 'bulb', title: 'Science pact', desc: 'A standing deal: two countries share what they learn every year until war breaks it.', fields: [{ key: 'a', type: 'country', label: 'Country A' }, { key: 'b', type: 'country', label: 'Country B', second: true }], build: v => `trade pact ${quote(v.a)} ${quote(v.b)}` },

  { id: 'grant', group: 'Discoveries', icon: 'bulb', title: 'Grant a discovery', desc: 'Requires the discovery’s prerequisites.', fields: [{ key: 'country', type: 'country', label: 'Country' }, { key: 'discovery', type: 'discovery', label: 'Discovery' }], build: v => `grant ${quote(v.country)} ${quote(v.discovery)}` },
  { id: 'revoke', group: 'Discoveries', icon: 'trash', danger: true, title: 'Revoke a discovery', desc: 'Also removes discoveries that depend on it.', fields: [{ key: 'country', type: 'country', label: 'Country' }, { key: 'discovery', type: 'discovery', label: 'Discovery' }], build: v => `revoke ${quote(v.country)} ${quote(v.discovery)}` },

  { id: 'borders', group: 'Lookup', icon: 'map', report: true, title: 'Borders and terrain', desc: 'Land borders, sea neighbors, and terrain profile of each country.', fields: [{ key: 'country', type: 'text', label: 'Country (optional)', optional: true }], build: v => `borders${v.country ? ' ' + val(v.country) : ''}` },
  { id: 'build', group: 'Development', icon: 'hammer', title: 'Build something', desc: 'Start a building. It needs technology and a fitting place unless you ignore the requirements.', fields: [{ key: 'settlement', type: 'settlement', label: 'Settlement' }, { key: 'kind', type: 'select', label: 'Building', options: BUILD_KINDS }, { key: 'force', type: 'check', label: 'Ignore requirements' }], build: v => `build ${quote(v.settlement)} ${v.kind}${v.force ? ' force=true' : ''}` },
  { id: 'road', group: 'Development', icon: 'map', title: 'Build a road', desc: 'Link two settlements of one country. Roads make travel and trade faster.', fields: [{ key: 'settlement', type: 'settlement', label: 'From' }, { key: 'to', type: 'settlement', label: 'To' }], build: v => `build ${quote(v.settlement)} road ${opt('to', v.to)}` },
  { id: 'settle', group: 'Development', icon: 'compass', title: 'Send settlers', desc: 'A party walks out of a settlement to found a new town. Leave the cell blank to let geography choose.', fields: [{ key: 'settlement', type: 'settlement', label: 'Leaving from' }, { key: 'x', type: 'number', label: 'Target cell x', optional: true }, { key: 'y', type: 'number', label: 'Target cell y', optional: true }, { key: 'size', type: 'number', label: 'Party size', optional: true }], build: v => `settle ${quote(v.settlement)}${o(v, 'x', 'y', 'size')}` },
  { id: 'hazards', group: 'Lookup', icon: 'bolt', report: true, title: 'Natural hazards', desc: 'How likely each disaster is at a settlement, from its terrain.', fields: [{ key: 'settlement', type: 'settlement', label: 'Settlement' }], build: v => `hazards ${quote(v.settlement)}` },
  { id: 'projects', group: 'Lookup', icon: 'hammer', report: true, title: 'Buildings and projects', desc: 'Everything standing or under construction.', fields: [{ key: 'country', type: 'text', label: 'Country or settlement (optional)', optional: true }], build: v => `projects${v.country ? ' ' + val(v.country) : ''}` },
  { id: 'expeditions', group: 'Lookup', icon: 'compass', report: true, title: 'Settler parties', desc: 'Who is on the road and where they are going.', fields: [{ key: 'country', type: 'text', label: 'Country (optional)', optional: true }], build: v => `expeditions${v.country ? ' ' + val(v.country) : ''}` },
  { id: 'systems', group: 'Lookup', icon: 'network', report: true, title: 'Systems report', desc: 'Every cross-system effect for a country.', fields: [{ key: 'country', type: 'text', label: 'Country (optional)', optional: true }], build: v => `systems${v.country ? ' ' + val(v.country) : ''}` },
  { id: 'ids', group: 'Lookup', icon: 'search', report: true, title: 'Find IDs', desc: 'Look up numeric IDs. Names work everywhere; IDs are optional.', fields: [{ key: 'kind', type: 'select', label: 'Type', options: ['person', 'country', 'settlement', 'lineage', 'discovery'] }, { key: 'search', type: 'text', label: 'Search', optional: true }], build: v => `ids ${v.kind}${v.search ? ' ' + val(v.search) : ''}` },
  { id: 'catalog', group: 'Lookup', icon: 'bulb', report: true, title: 'Discovery catalog', desc: 'Browse every technology and innovation.', fields: [{ key: 'query', type: 'text', label: 'Search', optional: true }, { key: 'page', type: 'number', label: 'Page', optional: true, def: 1 }], build: v => `catalog${v.query ? ' ' + val(v.query) : ''}${o(v, 'page')}` }
];

export const toolById = id => TOOLS.find(t => t.id === id);
const missing = (tool, v) => tool.fields.some(f => !f.optional && f.type !== 'check' && String(v[f.key] ?? '').trim() === '');

export function previewFor(tool, v) {
  if (missing(tool, v)) return null;
  try { return tool.build(v); } catch { return null; }
}

function fieldHtml(f, saved, snap) {
  const v = saved[f.key] ?? f.def ?? '';
  const label = `<span>${esc(f.label)}${f.optional ? ' <em>optional</em>' : ''}</span>`;
  let ctl;
  if (['person', 'settlement', 'discovery', 'lineage'].includes(f.type)) ctl = `<span class="pick-wrap"><input name="${f.key}" data-pick="${f.type}" autocomplete="off" spellcheck="false" placeholder="Start typing a name…" value="${esc(v)}"><span class="pick-list" hidden></span></span>`;
  else if (f.type === 'country') {
    const list = snap.countries.filter(c => c.population > 0 || c.ended == null);
    const chosen = v || (f.second && list[1] ? list[1].name : list[0]?.name);
    ctl = `<select name="${f.key}">${list.map(c => `<option ${c.name === chosen ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>`;
  } else if (f.type === 'disease') {
    const list = snap.diseases.filter(d => !d.retired);
    ctl = `<select name="${f.key}">${list.map(d => `<option ${d.name === v ? 'selected' : ''}>${esc(d.name)}</option>`).join('') || '<option value="">No diseases</option>'}</select>`;
  } else if (f.type === 'select') ctl = `<select name="${f.key}">${f.options.map(x => `<option ${x === (v || f.options[0]) ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select>`;
  else if (f.type === 'check') return `<label class="field check"><input type="checkbox" name="${f.key}" ${saved[f.key] ? 'checked' : ''}> <span>${esc(f.label)}</span></label>`;
  else ctl = `<input name="${f.key}" type="${f.type === 'number' ? 'number' : 'text'}" ${f.step ? `step="${f.step}"` : 'step="any"'} autocomplete="off" value="${esc(v)}" ${f.optional ? 'placeholder="Default"' : ''}>`;
  return `<label class="field">${label}${ctl}</label>`;
}

export function toolCard(tool, snap, saved = {}) {
  const color = GROUP_COLORS[tool.group];
  const head = `<div class="tool-head"><span class="tool-ic" style="--c:${color}">${icon(tool.icon)}</span><div><h3>${esc(tool.title)}</h3><p>${esc(tool.desc)}</p></div></div>`;
  if (tool.custom === 'rates') {
    const labels = { war_chance: ['War chance', 'Chance per year that a war begins'], country_chance: ['New country chance', 'Chance a large settlement secedes'], lineage_chance: ['New lineage chance', 'Chance an adult founds a family branch'], disaster_chance: ['Disaster chance', 'Chance of a disaster per country per year'] };
    return `<div class="tool wide" data-tool-card="rates">${head}<div class="rates">${Object.entries(labels).map(([k, [l, d]]) => `<label class="rate"><span><b>${l}</b><small>${d}</small></span><input type="range" min="0" max="1" step="0.005" value="${snap.settings?.[k] ?? 0}" data-tpl="set simulation ${k} {value}" data-live="rate-${k}"><output id="rate-${k}">${(snap.settings?.[k] ?? 0).toFixed(3)}</output></label>`).join('')}</div></div>`;
  }
  return `<form class="tool ${tool.danger ? 'danger' : ''}" data-tool="${tool.id}" autocomplete="off">${head}<div class="tool-fields">${tool.fields.map(f => fieldHtml(f, saved, snap)).join('')}</div><div class="hint" data-hint></div><code class="preview" data-preview>Fill in the fields to preview the command.</code><div class="tool-actions"><button class="${tool.danger ? 'danger-btn' : 'primary'}" type="submit">${icon(tool.report ? 'search' : 'bolt')} ${tool.report ? 'Look up' : 'Apply'}</button></div></form>`;
}

export function collect(form) {
  const v = {};
  for (const el of form.elements) {
    if (!el.name) continue;
    v[el.name] = el.type === 'checkbox' ? el.checked : el.value;
  }
  return v;
}
