export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const num = (v, d = 0) => Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: 0 });
export const quote = v => '"' + String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
// Quote only when the value needs it (numbers and single words stay bare).
export const val = v => (/[\s"'\\]/.test(String(v)) || String(v) === '' ? quote(v) : String(v));
export const opt = (k, v) => `${k}=${val(v)}`;
export const initials = n => String(n).split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0].toUpperCase()).join('');
export const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
export const rnd = seed => { let t = (seed + 0x6D2B79F5) | 0; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

export const PALETTE = ['#14b8a6', '#f97316', '#8b5cf6', '#3b82f6', '#eab308', '#ec4899', '#22c55e', '#ef4444', '#06b6d4', '#a855f7', '#84cc16', '#f43f5e', '#0ea5e9', '#d946ef', '#10b981', '#fb923c'];
export const JOBS = ['farmer', 'laborer', 'artisan', 'merchant', 'healer', 'teacher', 'scientist', 'scholar', 'performer', 'soldier', 'politician', 'child'];
export const JOB_COLORS = { farmer: '#84cc16', laborer: '#94a3b8', artisan: '#f59e0b', merchant: '#eab308', healer: '#10b981', teacher: '#3b82f6', scientist: '#06b6d4', scholar: '#8b5cf6', performer: '#ec4899', soldier: '#ef4444', politician: '#a855f7', child: '#7dd3fc', resident: '#cbd5e1' };
export const CATEGORY_COLORS = { war: '#ef4444', sickness: '#ec4899', disease: '#ec4899', discovery: '#f59e0b', discoveries: '#f59e0b', political: '#6366f1', creative: '#8b5cf6', disaster: '#f97316', population: '#10b981', lineage: '#14b8a6', world: '#64748b' };
export const CONDITION_COLORS = { Famine: '#ef4444', Drought: '#f97316', Panic: '#eab308', Disease: '#ec4899', War: '#dc2626' };

const P = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  home: '<path d="M3 11 12 3l9 8M5 10v10h14V10M10 20v-6h4v6"/>',
  users: '<path d="M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M21 20v-1a4 4 0 0 0-3-3.9M16 4.1a3.5 3.5 0 0 1 0 6.8"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.7.6 1 1.3 1 2.1h5c0-.8.3-1.5 1-2.1A6 6 0 0 0 12 3z"/>',
  pulse: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  swords: '<path d="M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M9.5 6.5 21 18v3h-3L6.5 9.5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  terminal: '<path d="M4 17l6-6-6-6M12 19h8"/>',
  undo: '<path d="M3 7v6h6M3 13a9 9 0 1 0 3-7.7L3 8"/>',
  play: '<path d="M7 4v16l13-8z" fill="currentColor"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>',
  step: '<path d="M5 4v16l10-8zM19 4v16" />',
  plus: '<path d="M12 5v14M5 12h14"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  upload: '<path d="M12 21V9M7 14l5-5 5 5M4 3h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  wand: '<path d="M15 4V2M15 16v-2M8 9H6M24 9h-2M17.8 6.2l1.4-1.4M17.8 11.8l1.4 1.4M3 21l9-9M12.2 6.2 10.8 4.8"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>',
  hammer: '<path d="M14 6l4 4M5 19l8-8M11 7l3-3 6 6-3 3z"/>',
  coins: '<circle cx="9" cy="9" r="6"/><path d="M15.2 9.3a6 6 0 1 1-5.9 5.9M7 9h4"/>',
  tree: '<circle cx="12" cy="5" r="2.4"/><circle cx="6" cy="18" r="2.4"/><circle cx="18" cy="18" r="2.4"/><path d="M12 7.4v4M12 11.4H6v4.2M12 11.4h6v4.2"/>',
  network: '<circle cx="6" cy="6" r="2.6"/><circle cx="18" cy="7" r="2.6"/><circle cx="12" cy="18" r="2.6"/><path d="M8.4 6.4l7.2.4M7.3 8.2l3.5 7.6M16.8 9.4l-3.6 6.4"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.6 8.4-2.1 5.1-5.1 2.1 2.1-5.1z"/>',
  dna: '<path d="M6 3c0 6 12 6 12 12M6 21c0-6 12-6 12-12M8 6h8M8 18h8M7 12h10"/>'
};
export const icon = (name, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;
