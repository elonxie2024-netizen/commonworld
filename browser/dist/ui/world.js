// The press and the businesses, on screen: the world's seven channels, its culture, and its firms.
// Everything shown comes from snap.world (built in the worker by sim/world.js) and, in person mode, snap.player.biz.
// h: { esc, num, tag, icon, panel, kpi, lineChart, empty }

let channel = 'all'; // which channel's stories are shown
export const setChannel = c => { channel = c; };
let sel = null; // the firm open on the Business page
export const setFirm = id => { sel = sel === id ? null : id; };
let sector = 'all';
export const setSector = s => { sector = s; };

const chOf = (w, id) => w.channels.find(c => c.id === id) ?? w.channels[0];

/** The front page: the biggest recent stories across all channels, for the Overview. */
export function front(world, limit = 7) {
  if (!world?.stories?.length) return null;
  const top = world.stories[0].year, pool = world.stories.filter(s => s.year >= top - 1);
  const lead = pool.reduce((a, b) => (b.score > a.score ? b : a), pool[0]), seen = new Set([lead.id]), out = [lead];
  const perCh = new Map([[lead.ch, 1]]);
  for (const s of pool.slice().sort((a, b) => b.year - a.year || b.score - a.score)) {
    if (seen.has(s.id) || (perCh.get(s.ch) ?? 0) >= 2) continue;
    seen.add(s.id); perCh.set(s.ch, (perCh.get(s.ch) ?? 0) + 1); out.push(s);
    if (out.length >= limit) break;
  }
  return out.map(s => { const c = chOf(world, s.ch); return {tag: c.short.toUpperCase(), color: c.color, score: s.score, headline: s.head, sub: s.sub, year: s.year, message: s.text || `${s.head}\n${s.sub}\n\nReported by ${c.name}: “${c.slogan}.”`}; });
}

const filterBar = (w, esc) => `<div class="ch-bar"><button class="${channel === 'all' ? 'on' : ''}" data-ch="all">All channels</button>${w.channels.map(c => `<button class="${channel === c.id ? 'on' : ''}" data-ch="${c.id}" style="--c:${c.color}" title="${esc(c.slogan)}">${esc(c.short)}</button>`).join('')}</div>`;

function storyRow(s, w, h, near = null) {
  const {esc} = h, c = chOf(w, s.ch);
  const here = near && s.town === near.town && s.act === 'attend' && near.year - s.year <= 1 ? `<button class="soft" data-biz="attend" data-biz-id="${s.id}">Go</button>` : '';
  return `<article class="story ${near && s.town === near.town ? 'near' : ''}" style="--c:${c.color}"><div class="story-top"><span class="ch" style="--c:${c.color}">${esc(c.name)}</span><time>Year ${s.year}</time>${near && s.town === near.town ? '<span class="tag" style="--c:#0d9488">Your town</span>' : ''}</div><h3>${esc(s.head)}</h3>${s.sub ? `<p>${esc(s.sub)}</p>` : ''}${here ? `<div class="story-act">${here}</div>` : ''}</article>`;
}

function cultureSide(w, h) {
  const {esc, panel} = h, live = w.movements.filter(m => !m.ended), past = w.movements.filter(m => m.ended);
  const moves = live.length ? live.map(m => `<div class="wrow"><b>${esc(m.name)}</b><small>${esc(({art: 'Art', thought: 'Thought', faith: 'Devotion', music: 'Music'})[m.kind] ?? m.kind)} · begun ${esc(m.townName)} ${m.born} by ${esc(m.founderName)} · ${m.reach.length} town${m.reach.length === 1 ? '' : 's'}</small></div>`).join('') : '<p class="muted">No living schools yet.</p>';
  const cup = w.cup.titles.length ? w.cup.titles.map(t => `<div class="wrow"><b>${esc(t.name)}</b><small>${t.n} Grand Cup title${t.n === 1 ? '' : 's'}</small></div>`).join('') : '<p class="muted">The cup has not been played.</p>';
  const works = w.works.length ? w.works.slice(0, 6).map(x => `<div class="wrow"><b>“${esc(x.title)}”</b><small>${esc(x.kind)} by ${esc(x.byName)} · ${esc(x.townName)}, ${x.year}</small></div>`).join('') : '<p class="muted">Nothing has been staged yet.</p>';
  const prizes = w.prizes.length ? w.prizes.slice().reverse().map(x => `<div class="wrow"><b>${esc(x.byName)}</b><small>Golden Quill ${x.year}: “${esc(x.title)}”</small></div>`).join('') : '';
  return `${panel('Schools and movements', past.length ? `${past.length} have faded` : '', `<div class="pad">${moves}</div>`)}${panel('The Grand Cup', w.cup.last ? `${esc(w.cup.last.team)} won in ${w.cup.last.year}` : '', `<div class="pad">${cup}</div>`)}${panel('On the stage and the page', 'Newest first', `<div class="pad">${works}${prizes ? `<h4 class="wrow-h">Golden Quill</h4>${prizes}` : ''}</div>`)}`;
}

/** The press page. `near` ({town, year}) marks stories in the player's own town and offers to go. */
export function newsPage(w, h, near = null) {
  const {esc, panel} = h;
  const list = w.stories.filter(s => channel === 'all' || s.ch === channel).slice(0, 80);
  const c = channel === 'all' ? null : chOf(w, channel);
  const desk = c ? `<div class="desk" style="--c:${c.color}"><b>${esc(c.name)}</b><span>“${esc(c.slogan)}”</span><small>Covers: ${esc(c.beat)}</small></div>` : `<div class="desk all"><b>Seven channels, seven beats</b><small>${w.channels.map(x => `${esc(x.short)}: ${esc(x.beat.toLowerCase())}`).join(' · ')}</small></div>`;
  return `<div class="wgrid"><div class="wcol">${panel('The press', 'Only what matters makes the paper.', `<div class="pad">${filterBar(w, esc)}${desk}<div class="stories">${list.map(s => storyRow(s, w, h, near)).join('') || h.empty('Nothing has been reported yet. Advance a few years.')}</div></div>`)}</div><aside class="wcol">${cultureSide(w, h)}</aside></div>`;
}

// ---------- businesses
const money = (n, num) => num(n);
const FIRM_COLS = (f, h, mine = false) => {
  const {esc, num} = h;
  return `<button class="firm ${f.alive ? '' : 'dead'} ${sel === f.id ? 'on' : ''}" data-firm="${f.id}"><span class="firm-name"><b>${esc(f.name)}</b><small>${esc(f.kind)} · ${esc(f.townName)}${f.pub ? ' · public' : ''}${f.owner != null && mine ? ' · yours' : ''}</small></span><span class="firm-num"><b>${f.alive ? num(f.worth) : '—'}</b><small>${f.alive ? 'worth' : esc(f.why ?? 'closed')}</small></span><span class="firm-num ${f.profit >= 0 ? 'up' : 'down'}"><b>${f.alive ? (f.profit >= 0 ? '+' : '') + num(f.profit) : ''}</b><small>${f.alive ? `${f.roi}% a year` : `closed ${f.ended}`}</small></span></button>`;
};

function firmCard(f, h, extra = '') {
  const {esc, num, tag} = h;
  return `<section class="panel firm-card"><div class="panel-head"><div><h2>${esc(f.name)}</h2><p>${esc(f.kind)} in ${esc(f.townName)} · founded ${f.born} by ${f.founder != null ? `<button class="link" data-person="${f.founder}">${esc(f.founderName)}</button>` : esc(f.founderName)}</p></div>${f.alive ? tag(f.pub ? 'Public' : 'Private', f.pub ? '#0369a1' : '#64748b') : tag(`Closed ${f.ended}`, '#be123c')}</div><div class="pad">
    <div class="statgrid"><div class="statbox"><span>Capital</span><b>${num(f.cap)}</b></div><div class="statbox"><span>Worth</span><b>${num(f.worth)}</b></div><div class="statbox"><span>Last year</span><b>${f.profit >= 0 ? '+' : ''}${num(f.profit)}</b></div><div class="statbox"><span>Staff</span><b>${num(f.staff)}</b></div><div class="statbox"><span>Reputation</span><b>${f.rep}</b></div><div class="statbox"><span>Branches</span><b>${f.branches}</b></div></div>
    ${f.ceoName && f.ceoName !== f.founderName ? `<p class="muted">Run by ${f.ceo != null ? `<button class="link" data-person="${f.ceo}">${esc(f.ceoName)}</button>` : esc(f.ceoName)}</p>` : ''}
    <ol class="life-lines">${f.hist.map(([y, t]) => `<li><b>${y}</b><span>${esc(t)}</span></li>`).join('')}</ol>${extra}</div></section>`;
}

/** The Business page for the simulation view. */
export function businessPage(w, h) {
  const {esc, num, panel, kpi, lineChart} = h, live = w.firms.filter(f => f.alive), shown = w.firms.filter(f => (sector === 'all' || f.sector === sector));
  const open = sel != null ? w.firms.find(f => f.id === sel) : null;
  const edit = f => f.alive ? `<div class="firm-edit"><span class="muted">Intervene:</span><button class="soft" data-firm-edit="${f.id}:bailout">Bail out</button><button class="soft" data-firm-edit="${f.id}:boom">Boom</button><button class="soft" data-firm-edit="${f.id}:scandal">Scandal</button><button class="soft" data-firm-edit="${f.id}:close">Close it</button></div>` : '';
  const sectors = `<div class="ch-bar"><button class="${sector === 'all' ? 'on' : ''}" data-sector="all">All sectors</button>${w.sectors.map(s => `<button class="${sector === s.id ? 'on' : ''}" data-sector="${s.id}">${esc(s.label)} · ${s.count}</button>`).join('')}</div>`;
  return `<div class="kpis compact">${kpi('Firms trading', num(live.length), `${w.firms.length - live.length} recently closed`, 'hammer', '#b45309')}${kpi('Capital', num(w.total), 'across every firm', 'coins', '#ca8a04')}${kpi('People employed', num(w.staff), 'staff on payrolls', 'users', '#0d9488')}${kpi('Ledger index', w.level, w.index.length > 4 ? `${w.level >= w.index.at(-5)[1] ? 'up' : 'down'} on four years ago` : 'new market', 'chart', '#6366f1')}</div>
  <div class="wgrid"><div class="wcol">${open ? firmCard(open, h, edit(open)) : ''}${panel('Firms of the world', 'Click one to open it. Newest and biggest first.', `<div class="pad">${sectors}<div class="firms">${shown.map(f => FIRM_COLS(f, h)).join('') || h.empty('No firms yet.')}</div></div>`)}</div>
  <aside class="wcol">${panel('The Ledger index', 'Average yearly return, smoothed', lineChart(w.index.map(x => x[1]), '#b45309', w.index.map(x => x[0])))}${panel('By sector', '', `<div class="pad">${w.sectors.map(s => `<div class="wrow"><b>${esc(s.label)}</b><small>${s.count} firm${s.count === 1 ? '' : 's'} · ${num(s.worth)} capital</small></div>`).join('') || '<p class="muted">No sectors yet.</p>'}</div>`)}${panel('From the Daily Ledger', '', `<div class="pad">${w.stories.filter(s => s.ch === 'ledger').slice(0, 6).map(s => `<div class="wrow"><b>${esc(s.head)}</b><small>Year ${s.year} · ${esc(s.sub)}</small></div>`).join('') || '<p class="muted">Quiet markets.</p>'}</div>`)}</aside></div>`;
}

// ---------- person mode
const bbtn = (kind, id, label, ok = true, why = '', cls = 'soft', arg = null) => `<button class="${cls}" data-biz="${kind}" ${id == null ? '' : `data-biz-id="${id}"`} ${arg == null ? '' : `data-biz-arg="${arg}"`} ${ok ? '' : `disabled title="${why}"`}>${label}</button>`;

/** Your career, firms and shares. */
export function bizTab(v, h) {
  const {esc, num, tag} = h, b = v.biz, first = esc(v.name.split(' ')[0]);
  const post = b.post ? `<div class="pm-goal"><div><b>${esc(b.post.rank)} at ${esc(b.post.name)}</b><small>Paid ${num(b.post.pay)} a year${b.post.next ? `. The next step is ${esc(b.post.next.toLowerCase())}: skill and friends help` : '. You have risen as far as you can'}.</small></div>${bbtn('quit', null, 'Leave the post')}</div>` : `<p class="muted">${first} works for no firm. Take a post in a firm below: it pays every year and you may rise.</p>`;
  const mine = b.mine.length ? b.mine.map(f => `<div class="pm-pick biz-mine"><div><b>${esc(f.name)}</b><small>${esc(f.kind)} · ${esc(f.townName)} · worth ${num(f.worth)} · ${f.profit >= 0 ? 'earned' : 'lost'} ${num(Math.abs(f.profit))} last year · ${f.staff} staff${f.pub ? ' · public' : ''}</small>
      <div class="strats">${b.strategies.map(s => bbtn('strategy', f.id, esc(s.label), f.strat !== s.id, 'Already so', f.strat === s.id ? 'primary' : 'soft', s.id)).join('')}</div><small>${esc(b.strategies.find(s => s.id === f.strat)?.text ?? '')}</small></div>${bbtn('close', f.id, 'Wind up', true, '', 'link')}</div>`).join('') : '<p class="muted">You run no firm of your own.</p>';
  const found = b.sectors.map(s => `<div class="pm-pick ${s.enabled ? '' : 'off'}"><div><b>${esc(s.label)}</b><small>Typical return about ${s.roi}% a year.${s.enabled ? '' : ' ' + esc(s.why)}</small></div>${bbtn('found', s.id, `Found · ${s.cost}`, s.enabled, s.why)}</div>`).join('');
  const hiring = b.hiring.map(f => `<div class="pm-pick ${f.enabled ? '' : 'off'}"><div><b>${esc(f.name)}</b><small>${esc(f.kind)} · ${esc(f.townName)} · ${f.staff} staff${f.enabled ? '' : ' · ' + esc(f.why)}</small></div>${bbtn('work', f.id, `Take a post · ${f.pay}/yr`, f.enabled, f.why)}</div>`).join('') || '<p class="muted">No firm in this country is looking for anyone yet.</p>';
  const stakes = b.stakes.map(s => `<div class="pm-pick"><div><b>${esc(s.name)}</b><small>${s.shares} shares worth ${num(s.value)} · ${s.roi}% a year</small></div>${bbtn('sell', s.id, 'Sell 5')}</div>`).join('');
  const market = b.market.map(m => `<div class="pm-pick ${m.enabled ? '' : 'off'}"><div><b>${esc(m.name)}</b><small>${esc(m.kind)} · ${esc(m.townName)} · ${m.roi}% a year · ${m.price} a share${m.own ? ` · you hold ${m.own}` : ''}${m.enabled ? '' : ' · ' + esc(m.why)}</small></div>${bbtn('buy', m.id, 'Buy 5', m.enabled, m.why)}</div>`).join('') || '<p class="muted">No firm has sold shares yet. They do once a country knows joint-stock companies and a firm grows large.</p>';
  return `<section class="panel"><div class="panel-head"><div><h2>Your career</h2><p>A post in a firm pays a wage every year.</p></div></div><div class="pad">${post}<div class="pm-picks">${b.post ? '' : hiring}</div></div></section>
    <section class="panel"><div class="panel-head"><div><h2>Your firms</h2><p>${b.mine.length} of ${b.limit}. A firm earns every year; you choose its direction.${b.income ? ` Expect about ${num(b.income)} a year from firms and shares.` : ''}</p></div></div><div class="pad"><div class="pm-picks">${mine}</div></div></section>
    <section class="panel"><div class="panel-head"><div><h2>Found a firm</h2><p>Open one here in ${esc(v.home.name)}. It costs what is listed and earns a share of what the town buys.</p></div></div><div class="pad"><div class="pm-picks">${found || '<p class="muted">Nothing is open to you.</p>'}</div></div></section>
    <section class="panel"><div class="panel-head"><div><h2>Shares</h2><p>Public firms sell their shares five at a time. You may hold up to 49 of 100 in any one.</p></div></div><div class="pad"><div class="pm-picks">${stakes}${market}</div></div></section>`;
}

/** The press as read by the person you play: your own town first. */
export function newsTab(v, w, h) {
  return newsPage(w, h, {town: v.home.id, year: v.year});
}
