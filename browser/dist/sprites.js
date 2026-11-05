// Hand-drawn canvas sprites for buildings, government halls, soldiers, ships and wagons.
// Every sprite is drawn in a unit box (-0.5..0.5) and styled by the owning country's era,
// so stone-age huts, marble temples, timber halls, brick houses and factories all look different.

const OUT = 'rgba(30,24,20,.7)';
// wall, roof, second roof colour, stone, door/dark
const PAL = [
  { wall: '#b98f56', roof: '#d9b45a', roof2: '#c79a3f', stone: '#a8a29e', dark: '#4a3416' },
  { wall: '#d6b184', roof: '#a5784f', roof2: '#8f6641', stone: '#b5aaa0', dark: '#4a3320' },
  { wall: '#d1cbbf', roof: '#b4533c', roof2: '#9c4331', stone: '#a1a1aa', dark: '#3b2f2a' },
  { wall: '#f3eee3', roof: '#c75b44', roof2: '#b04a36', stone: '#d6d3d1', dark: '#3b2f2a' },
  { wall: '#bfae8f', roof: '#4b5870', roof2: '#3f4a5f', stone: '#8b8f98', dark: '#2c2a33' },
  { wall: '#d99d82', roof: '#c2410c', roof2: '#a8380a', stone: '#c4b5a5', dark: '#3a2418' },
  { wall: '#b4533c', roof: '#4b5563', roof2: '#374151', stone: '#9ca3af', dark: '#1f2937' }
];
const FUTURE = { wall: '#9fb3c8', roof: '#334155', roof2: '#1e293b', stone: '#cbd5e1', dark: '#0f172a' };
const GROUP = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 6]; // the broad look each of the 15 ages grows from
const AGES = 15;
const hx = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => '#' + hx(a).map((v, i) => Math.round(v + (hx(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
// Each age sits part-way between its broad look and the next, so every new age changes the colours too.
const PALS = Array.from({ length: AGES }, (_, e) => {
  const g = GROUP[e], A = PAL[g], B = g === 6 ? FUTURE : PAL[g + 1], t = g === 6 ? (e - 12) * 0.5 : (e % 2) * 0.5;
  return Object.fromEntries(Object.keys(A).map(k => [k, mix(A[k], B[k], t)]));
});
const palOf = era => PALS[Math.max(0, Math.min(AGES - 1, era | 0))];
const GOLD = '#d4a017';

// Government buildings by form; the era makes them grander.
export const HALLS = {
  tribal: 'Great longhouse', monarchy: 'Royal palace', council: 'Council hall', republic: 'Senate house', democracy: 'Parliament',
  theocracy: 'Cathedral court', junta: 'Military headquarters', oligarchy: 'Magistrates\' manor', empire: 'Imperial palace',
  merchant: 'Guildhall', tyranny: 'Tyrant\'s citadel'
};
export const HOUSE_NAME = 'Houses';

function path(ctx, pts, fill, stroke = true) {
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = OUT; ctx.lineWidth = 0.05; ctx.stroke(); }
}
function rect(ctx, x, y, w, h, fill, stroke = true) {
  if (fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }
  if (stroke) { ctx.strokeStyle = OUT; ctx.lineWidth = 0.05; ctx.strokeRect(x, y, w, h); }
}
function disc(ctx, x, y, r, fill, stroke = true) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = OUT; ctx.lineWidth = 0.05; ctx.stroke(); }
}
function dome(ctx, x, y, r, fill) {
  ctx.beginPath(); ctx.arc(x, y, r, Math.PI, 0); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 0.05; ctx.stroke();
}
function line(ctx, x1, y1, x2, y2, color = OUT, w = 0.05) { ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
function flag(ctx, x, y, h, col) { line(ctx, x, y, x, y - h, '#3f3f46', 0.045); path(ctx, [[x, y - h], [x + h * 0.55, y - h * 0.8], [x, y - h * 0.6]], col, false); }
function columns(ctx, x0, x1, y, h, n, fill) { for (let i = 0; i < n; i++) { const x = x0 + (x1 - x0) * (n === 1 ? 0.5 : i / (n - 1)); rect(ctx, x - 0.035, y, 0.07, h, fill); } }

// What is new in each age, drawn on top of every house, building and hall of that country.
function marks(c, era, P) {
  const e = Math.max(0, Math.min(AGES - 1, era | 0));
  switch (e) {
    case 1: disc(c, 0.3, -0.5, 0.05, 'rgba(210,210,210,.75)', false); disc(c, 0.36, -0.58, 0.04, 'rgba(210,210,210,.55)', false); break; // cooking smoke
    case 2: rect(c, -0.14, 0.06, 0.28, 0.05, P.stone); break; // stone door lintel
    case 3: rect(c, -0.32, 0.0, 0.64, 0.05, '#2563eb', false); break; // painted band
    case 4: rect(c, 0.2, 0.02, 0.07, 0.12, P.dark, false); rect(c, 0.19, 0.0, 0.09, 0.03, P.roof2, false); break; // shuttered window
    case 5: line(c, -0.32, -0.34, 0.32, -0.34, P.roof2, 0.07); for (let i = -2; i <= 2; i++) disc(c, i * 0.14, -0.34, 0.03, P.roof, false); break; // tiled ridge
    case 6: columns(c, -0.42, 0.42, -0.02, 0.34, 2, '#fff'); break; // classical columns
    case 7: dome(c, 0.22, 0.14, 0.06, '#fde68a'); dome(c, -0.22, 0.14, 0.06, '#fde68a'); break; // arched windows
    case 8: line(c, -0.3, -0.02, 0.3, 0.3, P.dark, 0.04); line(c, 0.3, -0.02, -0.3, 0.3, P.dark, 0.04); break; // timber frame
    case 9: path(c, [[0.18, 0.14], [0.24, 0.0], [0.3, 0.14]], '#93c5fd'); rect(c, -0.46, -0.02, 0.06, 0.34, P.stone); break; // pointed window and buttress
    case 10: rect(c, 0.24, -0.5, 0.09, 0.2, P.stone); rect(c, 0.22, -0.52, 0.13, 0.04, P.dark, false); break; // chimney
    case 11: for (const x of [-0.24, 0.16]) { rect(c, x, 0.02, 0.09, 0.12, '#bfdbfe', false); line(c, x + 0.045, 0.02, x + 0.045, 0.14, P.dark, 0.02); } break; // sash windows
    case 12: rect(c, 0.28, -0.62, 0.09, 0.36, '#7c2d12'); disc(c, 0.32, -0.7, 0.07, 'rgba(100,116,139,.7)', false); disc(c, 0.4, -0.78, 0.06, 'rgba(100,116,139,.5)', false); break; // brick smokestack
    case 13: rect(c, -0.4, -0.02, 0.8, 0.04, '#475569', false); for (let i = 0; i < 5; i++) disc(c, -0.34 + i * 0.17, 0, 0.018, '#cbd5e1', false); line(c, 0.36, 0.3, 0.36, -0.14, '#475569', 0.04); break; // steel girder and rivets
    case 14: path(c, [[-0.2, -0.36], [0.2, -0.36], [0.28, -0.24], [-0.12, -0.24]], '#1e3a8a'); line(c, -0.04, -0.36, 0.04, -0.24, '#60a5fa', 0.02); line(c, 0.3, -0.3, 0.3, -0.62, '#94a3b8', 0.03); disc(c, 0.3, -0.64, 0.03, '#22d3ee', false); break; // solar panel and antenna
    default: break;
  }
}

// A pennant or banner on a pole, in screen pixels: the shape changes with the age of the country that raised it.
export function pennant(ctx, era, x, y, col, s = 1) {
  ctx.fillStyle = col; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.1; ctx.beginPath();
  if (era < 4) { ctx.moveTo(x, y); ctx.lineTo(x + 11 * s, y + 4 * s); ctx.lineTo(x, y + 8 * s); }
  else if (era < 8) { ctx.moveTo(x, y); ctx.lineTo(x + 12 * s, y); ctx.lineTo(x + 8 * s, y + 4 * s); ctx.lineTo(x + 12 * s, y + 8 * s); ctx.lineTo(x, y + 8 * s); }
  else if (era < 12) { ctx.rect(x, y, 11 * s, 9 * s); }
  else { ctx.rect(x, y, 12 * s, 9 * s); }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  if (era >= 8) { ctx.fillStyle = '#fff'; ctx.fillRect(x, y + 3.5 * s, (era >= 12 ? 12 : 11) * s, 2 * s); if (era >= 12) ctx.fillRect(x + 4 * s, y, 2 * s, 9 * s); }
}

// ---------------------------------------------------------------- houses
export function drawHouse(ctx, x, y, u, era, v = 0) {
  const P = palOf(era);
  ctx.save(); ctx.translate(x, y); ctx.scale(u, u);
  const g = GROUP[Math.max(0, Math.min(AGES - 1, era | 0))], roof = v % 2 ? P.roof2 : P.roof, flip = v % 3 === 1 ? -1 : 1;
  if (g === 0) {
    rect(ctx, -0.28, 0.0, 0.56, 0.3, P.wall); path(ctx, [[-0.38, 0.02], [0, -0.42], [0.38, 0.02]], roof); rect(ctx, -0.06, 0.12, 0.12, 0.18, P.dark, false);
  } else if (g === 1) {
    rect(ctx, -0.3, -0.06, 0.6, 0.36, P.wall); rect(ctx, -0.35, -0.14, 0.7, 0.1, roof); rect(ctx, -0.07 * flip - 0.05, 0.08, 0.1, 0.22, P.dark, false);
  } else if (g === 2 || g === 3) {
    rect(ctx, -0.3, -0.04, 0.6, 0.34, P.wall); path(ctx, [[-0.38, -0.02], [0, -0.38], [0.38, -0.02]], roof); rect(ctx, -0.06, 0.1, 0.12, 0.2, P.dark, false);
    if (g === 3) { rect(ctx, -0.24, -0.02, 0.05, 0.32, '#fff', false); rect(ctx, 0.19, -0.02, 0.05, 0.32, '#fff', false); }
  } else if (g === 4) {
    rect(ctx, -0.28, -0.12, 0.56, 0.42, P.wall); path(ctx, [[-0.36, -0.1], [0, -0.48], [0.36, -0.1]], roof);
    line(ctx, -0.28, 0.08, 0.28, 0.08, P.dark, 0.04); line(ctx, 0, -0.12, 0, 0.3, P.dark, 0.04); rect(ctx, -0.18, 0.12, 0.1, 0.18, P.dark, false);
  } else if (g === 5) {
    rect(ctx, -0.3, -0.14, 0.6, 0.44, P.wall); path(ctx, [[-0.38, -0.12], [0, -0.42], [0.38, -0.12]], roof); rect(ctx, 0.1 * flip - 0.04, -0.34, 0.08, 0.1, P.stone);
    rect(ctx, -0.2, -0.04, 0.1, 0.1, '#fde68a', false); rect(ctx, 0.1, -0.04, 0.1, 0.1, '#fde68a', false);
  } else {
    rect(ctx, -0.36, -0.22, 0.72, 0.52, P.wall); rect(ctx, -0.4, -0.3, 0.8, 0.1, roof);
    for (const [wx, wy] of [[-0.24, -0.12], [0, -0.12], [0.2, -0.12], [-0.24, 0.08], [0.2, 0.08]]) rect(ctx, wx, wy, 0.08, 0.1, '#fde68a', false);
    rect(ctx, 0.26 * flip - 0.04, -0.46, 0.08, 0.18, P.stone);
  }
  marks(ctx, era, P);
  ctx.restore();
}

// ---------------------------------------------------------------- buildings and halls
const SPRITES = {
  well(c, P) { disc(c, 0, 0.1, 0.24, P.stone); disc(c, 0, 0.1, 0.14, '#38bdf8', false); line(c, -0.22, -0.02, -0.22, -0.3, P.dark, 0.05); line(c, 0.22, -0.02, 0.22, -0.3, P.dark, 0.05); path(c, [[-0.3, -0.28], [0, -0.46], [0.3, -0.28]], P.roof); },
  granary(c, P) { rect(c, -0.2, -0.1, 0.4, 0.42, P.wall); path(c, [[-0.3, -0.08], [0, -0.46], [0.3, -0.08]], P.roof); rect(c, -0.06, 0.16, 0.12, 0.16, P.dark, false); line(c, -0.2, 0.06, 0.2, 0.06, P.dark, 0.035); },
  market(c, P) { rect(c, -0.4, 0.05, 0.8, 0.25, '#a8744a'); for (let i = 0; i < 4; i++) path(c, [[-0.42 + i * 0.21, -0.28], [-0.21 + i * 0.21, -0.28], [-0.21 + i * 0.21, 0.04], [-0.42 + i * 0.21, 0.04]], i % 2 ? '#fff' : '#ef4444'); disc(c, -0.15, 0.15, 0.07, '#facc15', false); disc(c, 0.12, 0.17, 0.07, '#84cc16', false); },
  school(c, P) { rect(c, -0.34, -0.02, 0.68, 0.34, P.wall); path(c, [[-0.4, 0], [0, -0.3], [0.4, 0]], P.roof); rect(c, -0.06, -0.46, 0.12, 0.2, P.stone); disc(c, 0, -0.34, 0.04, GOLD, false); rect(c, -0.07, 0.14, 0.14, 0.18, P.dark, false); },
  library(c, P) { rect(c, -0.4, -0.04, 0.8, 0.36, P.wall); path(c, [[-0.44, -0.04], [0, -0.38], [0.44, -0.04]], '#e7e5e4'); columns(c, -0.3, 0.3, -0.02, 0.34, 4, '#fff'); rect(c, -0.1, 0.12, 0.2, 0.2, P.dark, false); },
  university(c, P) { rect(c, -0.46, -0.04, 0.92, 0.36, P.wall); rect(c, -0.2, -0.22, 0.4, 0.2, P.wall); dome(c, 0, -0.22, 0.2, '#6366f1'); line(c, 0, -0.42, 0, -0.5, OUT, 0.04); rect(c, -0.08, 0.1, 0.16, 0.22, P.dark, false); columns(c, -0.38, 0.38, -0.02, 0.34, 5, P.stone); },
  observatory(c, P) { rect(c, -0.2, -0.1, 0.4, 0.42, P.stone); dome(c, 0, -0.1, 0.24, '#7dd3fc'); line(c, -0.02, -0.34, 0.14, -0.28, '#1e293b', 0.06); rect(c, -0.06, 0.16, 0.12, 0.16, P.dark, false); },
  clinic(c, P) { rect(c, -0.32, -0.08, 0.64, 0.4, '#f8fafc'); path(c, [[-0.38, -0.06], [0, -0.32], [0.38, -0.06]], P.roof); rect(c, -0.05, -0.02, 0.1, 0.24, '#10b981', false); rect(c, -0.12, 0.05, 0.24, 0.1, '#10b981', false); },
  hospital(c, P) { rect(c, -0.46, -0.16, 0.92, 0.48, '#f8fafc'); rect(c, -0.2, -0.36, 0.4, 0.22, '#f1f5f9'); rect(c, -0.05, -0.34, 0.1, 0.18, '#ef4444', false); rect(c, -0.12, -0.3, 0.24, 0.1, '#ef4444', false); for (const x of [-0.36, -0.2, 0.1, 0.26]) rect(c, x, -0.04, 0.08, 0.1, '#7dd3fc', false); rect(c, -0.07, 0.12, 0.14, 0.2, P.dark, false); },
  aqueduct(c, P) { rect(c, -0.5, -0.18, 1, 0.12, P.stone); for (let i = 0; i < 3; i++) { const x = -0.5 + i * 0.34; rect(c, x, -0.06, 0.34, 0.38, P.stone, false); ctx2(c, x + 0.17, 0.32); } rect(c, -0.5, -0.06, 1, 0.38, null); },
  harbor(c, P) { rect(c, -0.5, 0.18, 1, 0.14, '#8b5a2b'); for (const x of [-0.4, -0.1, 0.2, 0.46]) rect(c, x, 0.3, 0.05, 0.14, '#5b3a1a', false); path(c, [[-0.2, -0.04], [0.3, -0.04], [0.22, 0.14], [-0.12, 0.14]], '#7c4a03'); line(c, 0.05, -0.04, 0.05, -0.4, '#3f3f46', 0.04); path(c, [[0.06, -0.38], [0.28, -0.1], [0.06, -0.1]], '#fff'); rect(c, -0.46, 0.0, 0.18, 0.18, P.wall); },
  levee(c, P) { path(c, [[-0.5, 0.3], [-0.38, -0.06], [0.38, -0.06], [0.5, 0.3]], '#94a3b8'); line(c, -0.4, 0.06, 0.4, 0.06, '#64748b', 0.04); path(c, [[-0.5, 0.3], [0.5, 0.3], [0.5, 0.4], [-0.5, 0.4]], '#38bdf8', false); },
  firebreak(c, P) { rect(c, -0.45, -0.04, 0.9, 0.34, '#a8744a'); for (let i = 0; i < 6; i++) line(c, -0.4 + i * 0.16, 0, -0.4 + i * 0.16 + 0.08, 0.26, '#6b4a2a', 0.04); disc(c, -0.3, -0.2, 0.1, '#16a34a'); disc(c, 0.3, -0.2, 0.1, '#16a34a'); },
  foundations(c, P) { rect(c, -0.38, 0.0, 0.76, 0.32, P.stone); rect(c, -0.3, -0.18, 0.6, 0.2, P.wall); path(c, [[-0.34, -0.18], [0, -0.38], [0.34, -0.18]], P.roof); for (const x of [-0.42, 0.34]) path(c, [[x, 0.32], [x + 0.08, 0.32], [x + 0.08, -0.04]], P.stone); },
  monument(c, P) { rect(c, -0.2, 0.2, 0.4, 0.12, P.stone); rect(c, -0.14, 0.1, 0.28, 0.12, P.stone); path(c, [[-0.08, 0.1], [0.08, 0.1], [0.04, -0.4], [-0.04, -0.4]], '#e7e5e4'); path(c, [[-0.04, -0.4], [0.04, -0.4], [0, -0.5]], GOLD); },
  theater(c, P) { ctx2arc(c); rect(c, -0.4, 0.18, 0.8, 0.14, P.stone); for (let i = 1; i <= 3; i++) { c.beginPath(); c.arc(0, 0.18, 0.1 * i + 0.1, Math.PI, 0); c.strokeStyle = OUT; c.lineWidth = 0.04; c.stroke(); } disc(c, 0, 0.14, 0.06, '#f9a8d4', false); },
  mine(c, P) { path(c, [[-0.5, 0.32], [-0.24, -0.12], [0.1, -0.2], [0.5, 0.32]], '#78716c'); rect(c, -0.1, 0.06, 0.2, 0.26, '#1c1917', false); line(c, -0.12, 0.06, 0.12, 0.06, '#8b5a2b', 0.06); path(c, [[0.18, -0.12], [0.3, -0.42], [0.42, -0.12]], '#8b5a2b'); rect(c, 0.3, -0.18, 0.04, 0.2, '#3f3f46', false); },
  mill(c, P) { rect(c, -0.3, -0.06, 0.4, 0.38, P.wall); path(c, [[-0.36, -0.04], [-0.1, -0.34], [0.16, -0.04]], P.roof); disc(c, 0.26, 0.12, 0.22, null); c.strokeStyle = '#6b4a2a'; c.lineWidth = 0.06; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; c.beginPath(); c.moveTo(0.26, 0.12); c.lineTo(0.26 + Math.cos(a) * 0.22, 0.12 + Math.sin(a) * 0.22); c.stroke(); } rect(c, 0.2, 0.3, 0.12, 0.08, '#38bdf8', false); },
  forge(c, P) { rect(c, -0.34, -0.04, 0.68, 0.36, '#78716c'); path(c, [[-0.4, -0.02], [0, -0.28], [0.4, -0.02]], P.roof2); rect(c, 0.16, -0.46, 0.12, 0.3, '#57534e'); disc(c, 0.22, -0.5, 0.08, 'rgba(120,113,108,.7)', false); rect(c, -0.2, 0.08, 0.2, 0.24, '#fb923c', false); },
  bank(c, P) { rect(c, -0.44, 0.22, 0.88, 0.1, P.stone); rect(c, -0.4, -0.06, 0.8, 0.3, '#f5f5f4'); path(c, [[-0.46, -0.06], [0, -0.4], [0.46, -0.06]], '#e7e5e4'); columns(c, -0.32, 0.32, -0.04, 0.28, 5, '#fff'); disc(c, 0, -0.14, 0.08, GOLD); },
  barracks(c, P) { rect(c, -0.46, -0.06, 0.92, 0.38, '#9ca3af'); rect(c, -0.5, -0.12, 1, 0.08, P.roof); for (const x of [-0.34, -0.1, 0.14, 0.34]) rect(c, x, 0.04, 0.08, 0.14, '#1e293b', false); flag(c, 0.38, -0.12, 0.34, '#dc2626'); rect(c, -0.07, 0.14, 0.14, 0.18, P.dark, false); },
  factory(c, P) { rect(c, -0.5, -0.04, 1, 0.38, '#b45309'); path(c, [[-0.5, -0.04], [-0.34, -0.22], [-0.34, -0.04], [-0.14, -0.22], [-0.14, -0.04], [0.06, -0.22], [0.06, -0.04]], '#6b7280'); for (const x of [0.22, 0.38]) { rect(c, x, -0.48, 0.1, 0.46, '#57534e'); } disc(c, 0.3, -0.52, 0.1, 'rgba(148,163,184,.75)', false); disc(c, 0.4, -0.6, 0.08, 'rgba(148,163,184,.55)', false); for (const x of [-0.38, -0.14, 0.1]) rect(c, x, 0.06, 0.12, 0.1, '#fde68a', false); },
  station(c, P) { rect(c, -0.44, -0.1, 0.88, 0.34, '#b45309'); path(c, [[-0.5, -0.1], [0, -0.34], [0.5, -0.1]], '#4b5563'); disc(c, 0, -0.18, 0.09, '#fff'); line(c, 0, -0.18, 0, -0.24, OUT, 0.04); line(c, 0, -0.18, 0.04, -0.17, OUT, 0.04); line(c, -0.5, 0.34, 0.5, 0.34, '#44403c', 0.07); line(c, -0.5, 0.4, 0.5, 0.4, '#44403c', 0.07); },
  palace(c, P) { rect(c, -0.4, -0.04, 0.8, 0.36, P.wall); rect(c, -0.12, -0.22, 0.24, 0.2, P.wall); dome(c, 0, -0.22, 0.14, GOLD); for (const x of [-0.46, 0.32]) { rect(c, x, -0.24, 0.14, 0.56, P.stone); path(c, [[x - 0.03, -0.24], [x + 0.07, -0.44], [x + 0.17, -0.24]], '#dc2626'); } rect(c, -0.07, 0.1, 0.14, 0.22, P.dark, false); },
  grand_academy(c, P) { rect(c, -0.48, 0.02, 0.96, 0.3, '#f5f5f4'); path(c, [[-0.5, 0.02], [0, -0.24], [0.5, 0.02]], '#e7e5e4'); columns(c, -0.4, 0.4, 0.02, 0.3, 6, '#fff'); dome(c, 0, -0.2, 0.16, '#7c3aed'); flag(c, 0, -0.36, 0.14, '#7c3aed'); },
  lighthouse(c, P) { path(c, [[-0.16, 0.34], [0.16, 0.34], [0.1, -0.28], [-0.1, -0.28]], '#f5f5f4'); path(c, [[-0.14, 0.14], [0.14, 0.14], [0.12, 0.0], [-0.12, 0.0]], '#ef4444', false); path(c, [[-0.13, -0.1], [0.13, -0.1], [0.1, -0.2], [-0.1, -0.2]], '#ef4444', false); rect(c, -0.1, -0.4, 0.2, 0.12, '#fde047'); path(c, [[-0.13, -0.4], [0, -0.5], [0.13, -0.4]], '#44403c'); path(c, [[0.1, -0.34], [0.5, -0.46], [0.5, -0.22]], 'rgba(253,224,71,.4)', false); },
  fortress(c, P) { rect(c, -0.42, -0.04, 0.84, 0.36, '#6b7280'); for (const x of [-0.5, 0.3]) { rect(c, x, -0.3, 0.2, 0.62, '#57534e'); for (let i = 0; i < 3; i++) rect(c, x + i * 0.07, -0.38, 0.05, 0.08, '#57534e'); } for (let i = 0; i < 5; i++) rect(c, -0.3 + i * 0.14, -0.12, 0.08, 0.08, '#57534e'); rect(c, -0.1, 0.1, 0.2, 0.22, '#1c1917', false); flag(c, 0, -0.04, 0.3, '#dc2626'); }
};
function ctx2(c, x, y) { c.beginPath(); c.arc(x, y, 0.15, Math.PI, 0); c.fillStyle = '#c7ddf0'; c.fill(); c.strokeStyle = OUT; c.lineWidth = 0.04; c.stroke(); }
function ctx2arc(c) { c.beginPath(); c.arc(0, 0.18, 0.46, Math.PI, 0); c.closePath(); c.fillStyle = '#e7e5e4'; c.fill(); c.strokeStyle = OUT; c.lineWidth = 0.05; c.stroke(); }

const HALL_SPRITES = {
  tribal(c, P) { rect(c, -0.44, 0.0, 0.88, 0.32, P.wall); path(c, [[-0.5, 0.02], [-0.3, -0.34], [0.3, -0.34], [0.5, 0.02]], P.roof); line(c, -0.3, -0.34, -0.38, -0.5, '#6b4a2a', 0.06); line(c, 0.3, -0.34, 0.38, -0.5, '#6b4a2a', 0.06); rect(c, -0.07, 0.12, 0.14, 0.2, P.dark, false); },
  monarchy(c, P) { rect(c, -0.4, -0.06, 0.8, 0.4, P.wall); rect(c, -0.14, -0.28, 0.28, 0.24, P.wall); dome(c, 0, -0.28, 0.16, GOLD); for (const x of [-0.5, 0.3]) { rect(c, x, -0.3, 0.2, 0.64, P.stone); path(c, [[x - 0.03, -0.3], [x + 0.1, -0.52], [x + 0.23, -0.3]], '#dc2626'); } rect(c, -0.08, 0.1, 0.16, 0.24, P.dark, false); flag(c, 0, -0.44, 0.1, '#dc2626'); },
  council(c, P) { rect(c, -0.42, 0.22, 0.84, 0.1, P.stone); rect(c, -0.38, -0.08, 0.76, 0.3, P.wall); path(c, [[-0.46, -0.08], [0, -0.42], [0.46, -0.08]], '#e7e5e4'); columns(c, -0.3, 0.3, -0.06, 0.28, 5, '#fff'); },
  republic(c, P) { rect(c, -0.44, 0.22, 0.88, 0.1, P.stone); rect(c, -0.4, -0.02, 0.8, 0.24, '#f5f5f4'); columns(c, -0.32, 0.32, -0.02, 0.24, 6, '#fff'); rect(c, -0.2, -0.22, 0.4, 0.2, '#f5f5f4'); dome(c, 0, -0.22, 0.2, '#cbd5e1'); flag(c, 0, -0.42, 0.12, '#2563eb'); },
  democracy(c, P) { rect(c, -0.5, -0.02, 1, 0.34, P.wall); rect(c, -0.16, -0.26, 0.32, 0.26, P.wall); dome(c, 0, -0.26, 0.18, '#94a3b8'); rect(c, 0.32, -0.4, 0.12, 0.42, P.stone); disc(c, 0.38, -0.3, 0.05, '#fff'); path(c, [[0.3, -0.4], [0.38, -0.5], [0.46, -0.4]], P.roof); columns(c, -0.4, 0.2, 0.0, 0.3, 5, '#fff'); },
  theocracy(c, P) { rect(c, -0.4, -0.04, 0.8, 0.36, P.wall); path(c, [[-0.44, -0.04], [0, -0.28], [0.44, -0.04]], P.roof); rect(c, -0.1, -0.4, 0.2, 0.36, P.wall); path(c, [[-0.13, -0.4], [0, -0.62], [0.13, -0.4]], P.roof); disc(c, 0, 0.06, 0.1, '#fde68a'); line(c, 0, -0.62, 0, -0.7, GOLD, 0.05); line(c, -0.04, -0.66, 0.04, -0.66, GOLD, 0.05); },
  junta(c, P) { rect(c, -0.44, -0.02, 0.88, 0.34, '#78716c'); rect(c, -0.5, -0.1, 1, 0.1, '#57534e'); line(c, 0.28, -0.1, 0.28, -0.46, '#3f3f46', 0.04); flag(c, -0.3, -0.1, 0.34, '#b91c1c'); for (const x of [-0.34, -0.1, 0.14]) rect(c, x, 0.06, 0.12, 0.08, '#1c1917', false); for (let i = 0; i < 6; i++) rect(c, -0.5 + i * 0.17, 0.32, 0.14, 0.08, '#a8a29e'); },
  oligarchy(c, P) { rect(c, -0.5, 0.02, 0.28, 0.3, P.wall); rect(c, 0.22, 0.02, 0.28, 0.3, P.wall); rect(c, -0.26, -0.1, 0.52, 0.42, '#f5f5f4'); path(c, [[-0.32, -0.1], [0, -0.38], [0.32, -0.1]], P.roof); path(c, [[-0.54, 0.02], [-0.36, -0.14], [-0.18, 0.02]], P.roof); path(c, [[0.18, 0.02], [0.36, -0.14], [0.54, 0.02]], P.roof); disc(c, 0, 0.1, 0.07, GOLD); },
  empire(c, P) { rect(c, -0.46, 0.0, 0.92, 0.34, P.wall); rect(c, -0.2, -0.2, 0.4, 0.22, P.wall); dome(c, 0, -0.2, 0.24, GOLD); line(c, 0, -0.44, 0, -0.56, GOLD, 0.05); for (const x of [-0.56, 0.4]) { rect(c, x, -0.22, 0.16, 0.56, P.stone); path(c, [[x - 0.03, -0.22], [x + 0.08, -0.44], [x + 0.19, -0.22]], GOLD); } columns(c, -0.32, 0.32, 0.02, 0.3, 6, '#fff'); },
  merchant(c, P) { rect(c, -0.4, -0.02, 0.8, 0.34, P.wall); path(c, [[-0.4, -0.02], [-0.4, -0.14], [-0.28, -0.14], [-0.28, -0.26], [-0.14, -0.26], [-0.14, -0.38], [0.14, -0.38], [0.14, -0.26], [0.28, -0.26], [0.28, -0.14], [0.4, -0.14], [0.4, -0.02]], P.roof); line(c, 0, -0.38, 0, -0.5, '#3f3f46', 0.05); line(c, -0.12, -0.48, 0.12, -0.48, '#3f3f46', 0.05); disc(c, -0.12, -0.44, 0.04, GOLD, false); disc(c, 0.12, -0.44, 0.04, GOLD, false); rect(c, -0.08, 0.1, 0.16, 0.22, P.dark, false); },
  tyranny(c, P) { rect(c, -0.4, -0.12, 0.8, 0.44, '#44403c'); for (const x of [-0.46, 0.3]) { rect(c, x, -0.4, 0.16, 0.72, '#292524'); path(c, [[x - 0.02, -0.4], [x + 0.08, -0.58], [x + 0.18, -0.4]], '#7f1d1d'); } for (let i = 0; i < 6; i++) path(c, [[-0.4 + i * 0.14, -0.12], [-0.33 + i * 0.14, -0.26], [-0.26 + i * 0.14, -0.12]], '#292524'); rect(c, -0.08, 0.06, 0.16, 0.26, '#0c0a09', false); path(c, [[-0.2, -0.04], [-0.12, -0.04], [-0.16, 0.14]], '#b91c1c', false); path(c, [[0.12, -0.04], [0.2, -0.04], [0.16, 0.14]], '#b91c1c', false); }
};

export function drawBuilding(ctx, kind, x, y, u, era) {
  const P = palOf(era), fn = SPRITES[kind] || SPRITES.monument;
  ctx.save(); ctx.translate(x, y); ctx.scale(u, u); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; fn(ctx, P); marks(ctx, era, P); ctx.restore();
}
export function drawHall(ctx, government, x, y, u, era) {
  const P = palOf(era), fn = HALL_SPRITES[government] || HALL_SPRITES.monarchy;
  ctx.save(); ctx.translate(x, y); ctx.scale(u, u); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; fn(ctx, P); marks(ctx, era, P); ctx.restore();
}
export const SPRITE_KINDS = Object.keys(SPRITES);

// ---------------------------------------------------------------- ground
const GROUND = ['#c9b48a', '#d0b98f', '#cfc7b6', '#e0d9c8', '#bdb3a0', '#c7b8a2', '#a8a29e'];
export function groundColor(era) { const e = Math.max(0, Math.min(AGES - 1, era | 0)), g = GROUP[e]; return mix(GROUND[g], GROUND[Math.min(6, g + 1)], g === 6 ? (e - 12) * 0.25 : (e % 2) * 0.5); }

// ---------------------------------------------------------------- units (screen-pixel sized, drawn at x,y)
function figure(ctx, x, y, col, weapon, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const dark = '#1f2937';
  if (weapon === 'knight') { ctx.fillStyle = '#e5e7eb'; ctx.strokeStyle = dark; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, 2, 6, 3, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillRect(4, -3, 3, 6); ctx.beginPath(); ctx.moveTo(-5, 4); ctx.lineTo(-5, 8); ctx.moveTo(4, 4); ctx.lineTo(4, 8); ctx.stroke(); disc2(ctx, 0, -4, 2, col); ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-3, -1); ctx.lineTo(8, -9); ctx.stroke(); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(6.5, -8); ctx.lineTo(10, -6); ctx.lineTo(7.5, -5); ctx.fill(); ctx.restore(); return; }
  ctx.fillStyle = col; ctx.strokeStyle = dark; ctx.lineWidth = 0.9; ctx.fillRect(-1.6, -2, 3.2, 5); ctx.strokeRect(-1.6, -2, 3.2, 5);
  disc2(ctx, 0, -4, 1.9, weapon === 'rifle' ? '#d6c9a0' : '#f5d0a8');
  ctx.lineWidth = 1; ctx.strokeStyle = '#78350f';
  if (weapon === 'spear' || weapon === 'round') { ctx.beginPath(); ctx.moveTo(3, 5); ctx.lineTo(3, -9); ctx.stroke(); }
  if (weapon === 'round') { disc2(ctx, -3, 0, 2.6, '#b45309'); }
  if (weapon === 'sword') { ctx.strokeStyle = '#e5e7eb'; ctx.beginPath(); ctx.moveTo(3, 0); ctx.lineTo(6, -6); ctx.stroke(); disc2(ctx, -3, 0, 2.6, '#9ca3af'); }
  if (weapon === 'scutum') { ctx.fillStyle = '#b91c1c'; ctx.fillRect(-5, -2, 3.2, 6); ctx.strokeRect(-5, -2, 3.2, 6); ctx.strokeStyle = '#d1d5db'; ctx.beginPath(); ctx.moveTo(3, 4); ctx.lineTo(3, -8); ctx.stroke(); }
  if (weapon === 'musket' || weapon === 'rifle') { ctx.strokeStyle = '#44403c'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(-1, 3); ctx.lineTo(7, -6); ctx.stroke(); if (weapon === 'musket') { ctx.fillStyle = 'rgba(226,232,240,.8)'; ctx.beginPath(); ctx.arc(8.5, -7.5, 1.8, 0, 7); ctx.fill(); } }
  ctx.restore();
}
function disc2(ctx, x, y, r, fill) { ctx.fillStyle = fill; ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke(); }

export function drawArmy(ctx, tier, x, y, col, bob = 0, era = 0) {
  const kinds = ['spear', 'round', 'sword', 'scutum', 'knight', 'musket', 'rifle'], w = kinds[Math.min(6, tier)];
  const spots = w === 'knight' ? [[-9, 4], [4, 6]] : [[-8, 4], [-1, 6], [7, 4]];
  for (const [dx, dy] of spots) figure(ctx, x + dx, y + dy + bob, col, w, 1);
  ctx.strokeStyle = '#3f3f46'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, y + 2 + bob); ctx.lineTo(x, y - 17 + bob); ctx.stroke();
  pennant(ctx, era, x, y - 17 + bob, col);
  if (tier >= 6) { ctx.fillStyle = '#44403c'; ctx.fillRect(x + 8, y + 5 + bob, 9, 3); ctx.beginPath(); ctx.arc(x + 11, y + 10 + bob, 2.2, 0, 7); ctx.arc(x + 16, y + 10 + bob, 2.2, 0, 7); ctx.fill(); }
}

export function drawShip(ctx, tier, x, y, col, bob = 0, big = false, era = 0) {
  const k = big ? 1.15 : 0.9;
  ctx.save(); ctx.translate(x, y + bob); ctx.scale(k, k); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.lineWidth = 1.1; ctx.strokeStyle = '#fff';
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-22, 7); ctx.lineTo(-8, 6); ctx.stroke();
  const mast = (mx, h) => { ctx.strokeStyle = '#3f3f46'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(mx, 1); ctx.lineTo(mx, 1 - h); ctx.stroke(); };
  const sail = (pts, fill = '#fff') => { ctx.fillStyle = fill; ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]); ctx.closePath(); ctx.fill(); ctx.stroke(); };
  const hull = (pts, fill) => { ctx.fillStyle = fill; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]); ctx.closePath(); ctx.fill(); ctx.stroke(); };
  if (tier <= 0) { for (let i = 0; i < 4; i++) { ctx.fillStyle = '#a16207'; ctx.strokeStyle = '#451a03'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.roundRect(-9 + i * 4.5, 1, 4.2, 9, 2); ctx.fill(); ctx.stroke(); } ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, -1, 2.4, 0, 7); ctx.fill(); }
  else if (tier === 1) { hull([[-9, 3], [9, 3], [6, 8], [-6, 8]], '#92400e'); mast(0, 14); sail([[1, -12], [10, 1], [1, 1]]); }
  else if (tier === 2) { hull([[-13, 3], [13, 3], [9, 8], [-9, 8]], '#7c2d12'); mast(0, 13); sail([[-8, -11], [8, -11], [8, 1], [-8, 1]]); ctx.strokeStyle = '#451a03'; ctx.lineWidth = 1; for (let i = -9; i <= 9; i += 4) { ctx.beginPath(); ctx.moveTo(i, 6); ctx.lineTo(i - 2, 12); ctx.stroke(); } }
  else if (tier === 3) { hull([[-12, 1], [12, 1], [10, 9], [-10, 9]], '#78350f'); rect2(ctx, -12, -3, 6, 4, '#92400e'); mast(0, 18); sail([[-8, -16], [8, -16], [8, 0], [-8, 0]]); line2(ctx, -7, -8, 7, -8, col); }
  else if (tier === 4) { hull([[-14, 2], [14, 0], [10, 9], [-10, 9]], '#5b3a1a'); mast(-5, 17); mast(5, 20); sail([[-4, -15], [-5, -15], [-12, 0], [-4, 0]]); sail([[6, -19], [6, 0], [15, 0]]); sail([[-5, -15], [3, -3], [-5, -3]], '#f1f5f9'); }
  else { hull([[-15, 2], [15, 2], [11, 9], [-11, 9]], '#374151'); rect2(ctx, -6, -4, 12, 6, '#e5e7eb'); rect2(ctx, 3, -13, 4, 10, '#1f2937'); ctx.fillStyle = 'rgba(148,163,184,.8)'; ctx.beginPath(); ctx.arc(6, -16, 3, 0, 7); ctx.arc(10, -19, 2.6, 0, 7); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-6, -4); ctx.lineTo(-6, -11); ctx.stroke(); ctx.fillStyle = col; ctx.fillRect(-6, -11, 5, 3); }
  if (tier >= 1) { const top = [0, 14, 13, 18, 20, 16][Math.min(5, tier)]; ctx.strokeStyle = '#3f3f46'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, 1 - top); ctx.lineTo(0, -top - 4); ctx.stroke(); pennant(ctx, era, 0, -top - 5, col, 0.7); }
  ctx.restore();
}
function rect2(ctx, x, y, w, h, fill) { ctx.fillStyle = fill; ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 0.9; ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h); }
function line2(ctx, x1, y1, x2, y2, color) { ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }

export function drawCart(ctx, tier, x, y, col, bob = 0, k = 1, era = 0) {
  ctx.save(); ctx.translate(x, y + bob); ctx.scale(k, k); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (tier <= 0) {
    ctx.fillStyle = '#a8a29e'; ctx.strokeStyle = '#1c1917'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, 0, 7, 4, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillRect(5, -6, 3, 6); ctx.strokeRect(5, -6, 3, 6);
    for (const dx of [-5, -2, 2, 5]) { ctx.beginPath(); ctx.moveTo(dx, 3); ctx.lineTo(dx, 8); ctx.stroke(); } ctx.fillStyle = col; ctx.fillRect(-5, -6, 8, 3); ctx.strokeRect(-5, -6, 8, 3);
  } else if (tier === 1) {
    ctx.fillStyle = '#a16207'; ctx.strokeStyle = '#451a03'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.roundRect(-7, -6, 14, 8, 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = col; ctx.fillRect(-7, -6, 14, 2.5); ctx.fillStyle = '#1c1917'; for (const dx of [-4, 4]) { ctx.beginPath(); ctx.arc(dx, 3, 2.2, 0, 7); ctx.fill(); }
  } else {
    ctx.fillStyle = '#1f2937'; ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 1; ctx.fillRect(-14, -5, 10, 8); ctx.fillRect(-12, -9, 3, 4); ctx.fillStyle = col; ctx.fillRect(-14, -5, 10, 2);
    for (const [wx, ww] of [[-2, 8], [7, 8]]) { ctx.fillStyle = '#92400e'; ctx.fillRect(wx, -3, ww, 6); ctx.strokeRect(wx, -3, ww, 6); }
    ctx.fillStyle = '#111827'; for (const dx of [-12, -7, 0, 5, 9, 14]) { ctx.beginPath(); ctx.arc(dx, 4, 1.6, 0, 7); ctx.fill(); }
    ctx.fillStyle = 'rgba(203,213,225,.8)'; ctx.beginPath(); ctx.arc(-11, -12, 2.6, 0, 7); ctx.arc(-7, -15, 2.2, 0, 7); ctx.fill();
  }
  if (era >= 2) { const px = tier <= 1 ? 6 : -13; ctx.strokeStyle = '#3f3f46'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px, tier <= 1 ? -6 : -9); ctx.lineTo(px, -15); ctx.stroke(); pennant(ctx, era, px, -16, col, 0.55); }
  ctx.restore();
}
