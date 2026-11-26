// Person mode on screen: the page for the person you are playing, and their marker on the map.
// Everything shown comes from snap.player (built in the worker by sim/life_player.js); nothing here changes the world.
const SEASON_ICONS = ['🌱', '☀️', '🍂', '❄️'];

/** h: { esc, num, tag, stat, icon, cc, progressBar } */
export function playerPanel(v, h) {
  const { esc, num, tag, stat, icon, cc, progressBar } = h;
  if (!v) return '<div class="empty">Nobody is being played. Open a person and choose “Play as this person”.</div>';
  const col = cc(v.country?.id), head = (eyebrow, title, tags, right = '') => `<header class="pm-head" style="--c:${col}"><span class="avatar xl" style="--c:${col}">${esc(initials(v.name))}</span><div><span class="eyebrow">${eyebrow}</span><h2>${esc(title)}</h2><div class="tags">${tags}</div></div><div class="pm-head-actions">${right}</div></header>`;
  const stop = `<button class="soft" data-play-stop>Stop playing</button>`;
  if (!v.alive) return `<section class="pm">${head('YOU DIED', v.name, `${tag(`Died ${v.died ?? ''}, aged ${v.age}`, '#64748b')}${v.cause ? tag(v.cause, '#ef4444') : ''}${v.standing ? tag(`${v.standing.rank} · ${v.standing.score}`, '#8b5cf6') : ''}`, stop)}
    <div class="pm-grid"><section class="panel wide"><div class="panel-head"><div><h2>Your life</h2><p>${esc(v.summary)}</p></div></div>${lifeLines(v.lines, esc)}</section>
    <section class="panel"><div class="panel-head"><div><h2>Play on</h2><p>Choose who carries on.</p></div></div><div class="pad">${v.kids?.length ? `<div class="rows">${v.kids.map(k => `<div class="lrow"><span class="avatar sm">${esc(initials(k.name))}</span><div><b>${esc(k.name)}</b><small>Your child · age ${k.age}</small></div><button class="primary" data-play-as="${k.id}">Play as</button></div>`).join('')}</div>` : '<p class="muted">You left no living children.</p>'}<div class="actions"><button class="soft" data-play-random>${icon('users')} Play as someone at random</button></div></div></section></div></section>`;
  const pips = [0, 1, 2, 3].map(i => `<span class="pm-pip ${v.next.season > i ? 'done' : ''} ${v.next.season === i ? 'now' : ''}" title="${['Spring', 'Summer', 'Autumn', 'Winter'][i]}">${SEASON_ICONS[i]}</span>`).join('');
  const w = v.world, hurt = [v.health.infection ? tag(`Ill: ${v.health.infection}`, '#ef4444') : '', v.health.woundedUntil ? tag(`Wounded until year ${v.health.woundedUntil}`, '#f59e0b') : ''].join('');
  const act = a => {
    const sel = a.options ? `<select id="play-arg-${esc(a.id)}">${a.options.map(o => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('')}</select>` : '';
    return `<div class="pm-act ${a.enabled ? '' : 'off'} ${a.id === 'auto' ? 'auto' : ''}"><div><b>${esc(a.label)}</b><small>${esc(a.enabled ? a.hint : a.why || a.hint)}</small>${sel}</div><button class="${a.id === 'auto' ? 'primary' : 'soft'}" data-play-act="${esc(a.id)}" ${a.arg ? `data-play-arg="${esc(a.arg)}"` : ''} ${a.enabled ? '' : 'disabled'}>${a.id === 'auto' ? 'Continue' : 'Do this'}</button></div>`;
  };
  return `<section class="pm">${head('YOU ARE PLAYING', v.name, `${tag(`${v.standing.rank} · ${v.standing.score}`, '#8b5cf6')}${tag(v.role || v.job, col)}${tag(v.country.name, col)}${v.overlay ? tag('Own story', '#64748b') : ''}${hurt}`, stop)}
    <div class="pm-season"><div class="pm-clock"><span class="pm-yr">Year ${v.next.year}</span><b>${esc(v.next.name)}</b></div><div class="pm-pips">${pips}</div><p class="muted">Choose what ${esc(v.name.split(' ')[0])} does this season. ${v.flow ? 'What you do changes the real world.' : 'Your choices stay in your own story until “People shape the world” is switched on.'}</p></div>
    <div class="pm-grid">
      <section class="panel"><div class="panel-head"><div><h2>This season</h2><p>One choice moves your life on a season.</p></div></div><div class="pad pm-acts">${v.actions.map(act).join('')}</div></section>
      <section class="panel"><div class="panel-head"><div><h2>You</h2><p>${esc(v.summary)}</p></div></div><div class="pad"><div class="statgrid">${stat('Age', v.age)}${stat('Occupation', esc(v.job))}${stat('Wealth', num(v.wealth, 1))}${stat('Fame', Math.round(v.fame))}${stat('Standing', v.standing.score)}${stat('Family', esc(v.lineage))}</div>${progressBar(v.standing.score / 100, '#8b5cf6')}<small class="muted">Standing grows with wealth, fame, office, founding towns, war service, science and trade.</small></div></section>
      <section class="panel"><div class="panel-head"><div><h2>Where you are</h2><p>${esc(v.home.name)}, ${esc(v.country.name)}</p></div><button class="link" data-focus-settlement="${v.home.id}">${icon('map')} Show on map</button></div><div class="pad"><div class="rows">${v.nearby.map(t => `<div class="lrow" style="--c:${cc(t.country)}"><span class="flag-dot sm">${esc(t.name.charAt(0))}</span><div><b>${esc(t.name)}</b><small>${esc(t.countryName)}${t.home ? '' : ' · abroad'} · ${t.distance} tiles · ${num(t.population)} people</small></div><button class="soft" data-play-act="move" data-play-arg="${t.id}">Go there</button></div>`).join('') || '<p class="muted">No other towns.</p>'}</div></div></section>
      <section class="panel"><div class="panel-head"><div><h2>The world around you</h2><p>${esc(w.government)} · ruled by ${esc(w.ruler || 'nobody')}</p></div></div><div class="pad"><div class="statgrid">${stat('Food', Math.round(w.food))}${stat('Stability', Math.round(w.stability))}</div><div class="tags">${w.conditions.map(x => tag(x, '#64748b')).join('')}${w.wars.map(x => tag('⚔ at war with ' + x, '#dc2626')).join('')}${w.conditions.length || w.wars.length ? '' : '<span class="muted">All quiet.</span>'}</div></div></section>
      <section class="panel"><div class="panel-head"><div><h2>Journal</h2><p>Your seasons, newest first</p></div></div><div class="pad">${v.log.length ? `<ol class="life-lines">${v.log.map(l => `<li><b>${esc(['Spring', 'Summer', 'Autumn', 'Winter'][l.season])} ${l.year}</b><span>${esc(l.text)}</span></li>`).join('')}</ol>` : '<p class="muted">Nothing yet. Make your first choice.</p>'}</div></section>
      <section class="panel"><div class="panel-head"><div><h2>Family</h2><p>${v.kids.length ? `${v.kids.length} living ${v.kids.length === 1 ? 'child' : 'children'}` : 'No living children'}</p></div></div><div class="pad"><div class="linkrow">${v.parents.length ? '<span>Parents</span>' : ''}${v.parents.map(p => `<button class="chip" data-person="${p.id}"><i></i>${esc(p.name)}${p.alive ? '' : ' †'}</button>`).join('')}${v.kids.length ? '<span>Children</span>' : ''}${v.kids.slice(0, 12).map(k => `<button class="chip" data-person="${k.id}"><i></i>${esc(k.name)} · ${k.age}</button>`).join('')}</div></div></section>
      <section class="panel wide"><div class="panel-head"><div><h2>Life so far</h2><p>Stitched together from your milestones</p></div></div><div class="pad">${lifeLines(v.lines, esc)}</div></section>
    </div></section>`;
}

const KIND_STYLE = { war: ['swords', '#dc2626'], plague: ['pulse', '#ec4899'], famine: ['coins', '#b45309'], settlers: ['compass', '#0d9488'], office: ['flag', '#8b5cf6'], rival: ['star', '#f59e0b'] };

/** The pop-up for a life choice. Play stays paused until one option is picked. h: { esc, icon } */
export function choiceHtml(ch, h) {
  const { esc, icon } = h, [ic, col] = KIND_STYLE[ch.kind] || ['star', '#5b5bf0'];
  return `<div class="choice-card" style="--c:${col}"><header class="choice-head"><span class="avatar xl sq" style="--c:${col}">${icon(ic)}</span><div><span class="eyebrow">A DECISION · ${['SPRING', 'SUMMER', 'AUTUMN', 'WINTER'][ch.season]} ${ch.year}</span><h2>${esc(ch.title)}</h2></div></header>
    <p class="choice-text">${esc(ch.text)}</p>
    <div class="choice-opts">${ch.options.map(o => `<button class="choice-opt" data-choice="${esc(o.id)}" ${o.enabled ? '' : 'disabled'}><b>${esc(o.label)}</b><small>${esc(o.enabled ? o.hint : o.why)}</small></button>`).join('')}</div>
    <p class="muted choice-foot">Time is paused until you decide.</p></div>`;
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
