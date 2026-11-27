// Person mode on screen: the page for the person you are playing, and their marker on the map.
// Everything shown comes from snap.player (built in the worker by sim/life_player.js); nothing here changes the world.
const SEASON_ICONS = ['🌱', '☀️', '🍂', '❄️'];
import {goalsTab, propertyTab, peopleTab} from './depth.js';
import {bizTab, newsTab} from './world.js';
let main = 'life'; // which page of the person's life is open: the routine, goals, property or people
export const setMain = m => { main = m; };
let tab = 'journal'; // which list sits under the focus: the season journal or the stitched life story
export const setTab = t => { tab = t; };

/** h: { esc, num, tag, stat, icon, cc, progressBar } */
export function playerPanel(v, h) {
  const { esc, num, tag, stat, icon, cc, progressBar } = h;
  if (!v) return '<div class="empty">Nobody is being played. Open a person and choose “Play as this person”.</div>';
  const col = cc(v.country?.id), head = (eyebrow, title, tags, right = '') => `<header class="pm-head" style="--c:${col}"><span class="avatar xl" style="--c:${col}">${esc(initials(v.name))}</span><div><span class="eyebrow">${eyebrow}</span><h2>${esc(title)}</h2><div class="tags">${tags}</div></div><div class="pm-head-actions">${right}</div></header>`;
  const stop = `<button class="soft" data-play-stop>Stop playing</button>`;
  const gen = v.gen > 1 ? tag(`Generation ${v.gen}`, '#0d9488') : '';
  const heirCard = k => {
    const g = k.gets, li = [g.wealth ? `<li class="ok">+${num(g.wealth)} money${g.already ? ` (on top of ${num(g.already)} already shared out)` : ""}</li>` : '', g.fame ? `<li class="ok">+${g.fame} fame</li>` : '', g.office ? `<li class="${g.office.ok ? 'ok' : 'no'}">${esc(g.office.text)}</li>` : ''].join('');
    return `<div class="heir"><span class="avatar" style="--c:${col}">${esc(initials(k.name))}</span><div class="heir-main"><div class="heir-top"><b>${esc(k.name)}</b>${tag(k.relation, '#0d9488')}${tag(`${k.standing.rank} · ${k.standing.score}`, '#8b5cf6')}</div><small>Age ${k.age} · ${esc(k.role || k.job)} · ${esc(k.place)}, ${esc(k.country)} · wealth ${num(k.wealth, 1)} · fame ${Math.round(k.fame)}</small><p class="muted">${esc(k.summary)}</p><ul class="heir-gets">${li || '<li>No inheritance.</li>'}</ul></div><button class="primary" data-play-heir="${k.id}">Continue as them</button></div>`;
  };
  if (!v.alive) return `<section class="pm">${head('YOU DIED', v.name, `${tag(`Died ${v.died ?? ''}, aged ${v.age}`, '#64748b')}${v.cause ? tag(v.cause, '#ef4444') : ''}${v.standing ? tag(`${v.standing.rank} · ${v.standing.score}`, '#8b5cf6') : ''}`, stop)}
    <div class="pm-grid"><section class="panel wide"><div class="panel-head"><div><h2>Your life</h2><p>${esc(v.summary)}</p></div></div>${lifeLines(v.lines, esc)}</section>
    <section class="panel wide"><div class="panel-head"><div><h2>Who carries on?</h2><p>${v.heirs?.length ? 'Your living family, closest first. Each heir inherits part of your money and fame, and an office only where the government lets it be inherited.' : 'No family is left to carry on.'}</p></div></div><div class="pad">${v.heirs?.length ? `<div class="heirs">${v.heirs.map(heirCard).join('')}</div>` : `<p class="muted">Your line has ended. Someone living will be chosen at random.</p><div class="actions"><button class="primary" data-play-random>${icon('users')} Play as someone at random</button></div>`}</div></section></div></section>`;
  const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];
  const pips = [0, 1, 2, 3].map(i => `<span class="pm-pip ${v.next.season > i ? 'done' : ''} ${v.next.season === i ? 'now' : ''}" title="${SEASONS[i]}">${SEASON_ICONS[i]}</span>`).join('');
  const w = v.world, first = esc(v.name.split(' ')[0]), cur = v.focuses.find(f => f.id === v.focus);
  const hurt = [v.health.infection ? tag(`Ill: ${v.health.infection}`, '#ef4444') : '', v.health.woundedUntil ? tag(`Wounded until year ${v.health.woundedUntil}`, '#f59e0b') : ''].join('');
  const last = v.log[0], queued = v.queued ? (v.oneoffs.find(a => a.id === v.queued.act && (a.arg == null || a.arg === v.queued.arg))?.label ?? v.queued.act) : '';
  // A focus is what you do every season until you change it; choosing one takes no time.
  const focusCard = f => `<button class="pm-focus ${f.id === v.focus ? 'on' : ''}" data-focus="${esc(f.id)}" ${f.enabled ? '' : 'disabled'} aria-pressed="${f.id === v.focus}"><b>${esc(f.label)}</b><small>${esc(f.enabled ? f.hint : f.why)}</small></button>`;
  const groups = [...new Set(v.focuses.map(f => f.group))].map(g => `<div class="pm-group"><h3>${esc(g)}</h3><div class="pm-focuses">${v.focuses.filter(f => f.group === g).map(focusCard).join('')}</div></div>`).join('');
  const moves = v.oneoffs.filter(a => a.id !== 'move');
  const moveAct = v.oneoffs.find(a => a.id === 'move');
  const oneoff = a => {
    const sel = a.options ? `<select id="queue-arg-${esc(a.id)}">${a.options.map(o => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('')}</select>` : '';
    return `<div class="pm-act ${a.enabled ? '' : 'off'}"><div><b>${esc(a.label)}</b><small>${esc(a.enabled ? a.hint : a.why || a.hint)}</small>${sel}</div><button class="soft" data-queue="${esc(a.id)}" ${a.arg ? `data-queue-arg="${esc(a.arg)}"` : ''} ${a.enabled ? '' : 'disabled'}>Do this</button></div>`;
  };
  const bar = s => {
    const lo = s.min ?? 0, pct = s.max == null ? null : Math.max(0, Math.min(100, ((s.value - lo) / (s.max - lo)) * 100));
    return `<div class="pm-stat"><span>${esc(s.label)}</span>${pct == null ? '<i class="none"></i>' : `<div class="pm-track ${s.min != null ? 'mid' : ''}"><i style="width:${pct}%"></i></div>`}<b>${num(s.value)}</b><small>${esc(s.note ?? '')}</small></div>`;
  };
  const journal = v.log.length ? `<ol class="life-lines">${v.log.map(l => `<li><b>${esc(SEASONS[l.season])} ${l.year}</b><span>${esc(l.text)}</span></li>`).join('')}</ol>` : '<p class="muted">Nothing yet. Press Play, or live one season.</p>';
  const tabs = [['journal', 'Journal'], ['story', 'Life story']].map(([id, label]) => `<button class="${tab === id ? 'on' : ''}" data-pm-tab="${id}">${label}</button>`).join('');
  const MAIN = [['life', 'Life'], ['goals', 'Goals'], ['property', 'Property'], ['people', 'People'], ['business', 'Business'], ['news', 'News']];
  const mainTabs = `<nav class="pm-nav" role="tablist">${MAIN.map(([id, label]) => `<button class="${main === id ? 'on' : ''}" data-pm-main="${id}">${label}${id === 'goals' && v.depth.perks.points ? `<em>${v.depth.perks.points}</em>` : ''}</button>`).join('')}</nav>`;
  const traits = `<div class="tags pm-traits">${v.depth.traits.map(x => `<span class="tag" style="--c:#0d9488" title="${esc(x.text)}">${esc(x.label)}</span>`).join('')}</div>`;
  const town = t => `<div class="pm-town"><span class="flag-dot sm" style="--c:${cc(t.country)}">${esc(t.name.charAt(0))}</span><div><b>${esc(t.name)}</b><small>${esc(t.countryName)}${t.home ? '' : ' · abroad'} · ${t.distance} tiles · ${num(t.population)} people</small></div><button class="soft" data-queue="move" data-queue-arg="${t.id}" ${moveAct?.enabled === false ? 'disabled' : ''}>Go</button></div>`;
  return `<section class="pm">
    ${head('YOU ARE PLAYING', v.name, `${tag(v.role || v.job, col)}${tag(`Age ${v.age}`, '#64748b')}${tag(`${v.home.name}, ${v.country.name}`, col)}${tag(`${v.standing.rank} · ${v.standing.score}`, '#8b5cf6')}${v.overlay ? tag('Own story', '#64748b') : ''}${gen}${hurt}`, `<button class="soft" data-tab="overview">${icon('compass')} View the world</button>${stop}`)}
    <div class="pm-season"><div class="pm-clock"><span class="pm-yr">Year ${v.next.year}</span><b>${esc(v.next.name)}</b></div><div class="pm-pips">${pips}</div>
      <div class="pm-now"><small>${last ? `Last season · ${esc(SEASONS[last.season])} ${last.year}` : 'A new life'}</small><p>${last ? esc(last.text) : `${first} is about to begin.`}</p>
        <small>${queued ? `Next season: <b>${esc(queued)}</b> <button class="link" data-queue-clear>Cancel</button>` : `${first} will ${esc((cur?.label ?? 'carry on').toLowerCase())}.`}</small></div>
      <button class="primary" data-play-next>Live one season</button></div>
    <div class="pm-cols"><div class="pm-main">${mainTabs}${main === 'life' ? `
      <section class="panel"><div class="panel-head"><div><h2>How you spend your seasons</h2><p>Pick one and ${first} keeps doing it while time runs. Change it whenever you like; it costs nothing.</p></div></div><div class="pad">${groups}</div></section>
      ${moves.length ? `<section class="panel"><div class="panel-head"><div><h2>Make a change</h2><p>Done at the start of the next season, in place of your usual routine.</p></div></div><div class="pad"><div class="pm-acts">${moves.map(oneoff).join('')}</div></div></section>` : ''}
      <section class="panel"><div class="panel-head"><div class="pm-tabs" role="tablist">${tabs}</div></div><div class="pad">${tab === 'story' ? lifeLines(v.lines, esc) : journal}</div></section>
    ` : main === 'goals' ? goalsTab(v, h) : main === 'property' ? propertyTab(v, h) : main === 'business' ? bizTab(v, h) : main === 'news' ? newsTab(v, h.world, h) : peopleTab(v, h)}</div><div class="pm-side">
      <section class="panel"><div class="panel-head"><div><h2>You</h2><p>${esc(v.summary)}</p></div></div><div class="pad">${traits}<div class="pm-stats">${v.stats.map(bar).join('')}</div><small class="muted">${esc(v.lineage)} family. Skill, knowledge, contacts and honor grow with what you do and shape how it turns out.</small></div></section>
      <section class="panel"><div class="panel-head"><div><h2>${esc(v.home.name)}</h2><p>${esc(w.government)} · ruled by ${esc(w.ruler || 'nobody')}</p></div><button class="link" data-focus-settlement="${v.home.id}">${icon('map')} Map</button></div><div class="pad"><div class="statgrid">${stat('Food', Math.round(w.food))}${stat('Stability', Math.round(w.stability))}</div><div class="tags">${w.conditions.map(x => tag(x, '#64748b')).join('')}${w.wars.map(x => tag('⚔ at war with ' + x, '#dc2626')).join('')}${w.conditions.length || w.wars.length ? '' : '<span class="muted">All quiet.</span>'}</div>${v.nearby.length ? `<h3 class="pm-sub">Move somewhere else</h3><div class="pm-towns">${v.nearby.map(town).join('')}</div>` : ''}</div></section>
    </div></div></section>`;
}

const KIND_STYLE = { windfall: ['coins', '#16a34a'], thieves: ['hammer', '#64748b'], festival: ['star', '#f59e0b'], apprentice: ['user', '#0d9488'], friend: ['users', '#3b82f6'], scandal: ['list', '#be123c'], commission: ['hammer', '#b45309'], courtship: ['star', '#ec4899'], bribe: ['coins', '#7c3aed'], war: ['swords', '#dc2626'], plague: ['pulse', '#ec4899'], famine: ['coins', '#b45309'], settlers: ['compass', '#0d9488'], office: ['flag', '#8b5cf6'], rival: ['star', '#f59e0b'] };

/** The pop-up for a life choice. Play stays paused until one option is picked. h: { esc, icon } */
export function choiceHtml(ch, h) {
  const { esc, icon } = h, [ic, col] = KIND_STYLE[ch.kind] || ['star', '#5b5bf0'];
  return `<div class="choice-card" style="--c:${col}"><header class="choice-head"><span class="avatar xl sq" style="--c:${col}">${icon(ic)}</span><div><span class="eyebrow">A DECISION · ${['SPRING', 'SUMMER', 'AUTUMN', 'WINTER'][ch.season]} ${ch.year}</span><h2>${esc(ch.title)}</h2></div></header>
    <p class="choice-text">${esc(ch.text)}</p>
    <div class="choice-opts">${ch.options.map(o => `<button class="choice-opt" data-choice="${esc(o.id)}" ${o.enabled ? '' : 'disabled'}><b>${esc(o.label)}</b><small>${esc(o.enabled ? o.hint : o.why)}</small></button>`).join('')}</div>
    ${ch.options.some(o => o.needsFlow) && !ch.flow ? `<div class="choice-switch"><span>Some of these change the real world, so they need “People shape the world”.</span><button class="soft" data-run="life flow on">Turn it on</button></div>` : ""}<p class="muted choice-foot">Time is paused until you decide, then it carries on.</p></div>`;
}

const initials = name => name.split(/\s+/).filter(w => /^\p{L}/u.test(w) && w !== 'of').slice(0, 2).map(w => w[0]).join('').toUpperCase();
const lifeLines = (lines, esc) => `<ol class="life-lines">${(lines || []).map(l => `<li><b>Year ${l.year}</b><span>${esc(l.text)}</span></li>`).join('')}</ol>`;

/** A ring on the map around the person you are playing. */
export class PlayerMarker {
  constructor() { this.at = null; this.name = ''; }
  update(snap, map) {
    const v = snap?.player;
    this.at = v && v.alive && v.home.gx != null ? { x: (v.home.gx + 0.5) * map.cw, y: (v.home.gy + 0.5) * map.ch } : null;
    this.name = v?.name ?? '';
  }
  live() { return false; }
  hit() { return null; }
  draw(ctx, now, map) {
    if (!this.at) return;
    const r = 9 / map.css, { x, y } = this.at;
    ctx.save();
    ctx.strokeStyle = '#facc15'; ctx.fillStyle = 'rgba(250,204,21,.22)'; ctx.lineWidth = 2.6 / map.css;
    ctx.beginPath(); ctx.arc(x, y, r * 1.5, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#facc15'; ctx.strokeStyle = '#7c5a00'; ctx.lineWidth = 1.6 / map.css;
    ctx.beginPath(); ctx.arc(x, y, r * 0.55, 0, 7); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
}
