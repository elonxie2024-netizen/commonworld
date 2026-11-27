// The deeper parts of person mode: ambitions and projects, perks, property, and the people in your life.
// Every button carries data-depth="<kind>" data-depth-id="<id>"; app.js sends it to the engine and redraws.
// Everything shown comes from snap.player.depth (built by sim/life_depth.js).

const KIND = {friend: 'Friend', spouse: 'Partner', rival: 'Rival', mentee: 'Apprentice'};
const KIND_COLOR = {friend: '#3b82f6', spouse: '#ec4899', rival: '#be123c', mentee: '#0d9488'};

const bar = (pct, cls = '') => `<div class="pm-track ${cls}"><i style="width:${Math.max(2, Math.min(100, pct))}%"></i></div>`;
const btn = (kind, id, label, ok = true, why = '', cls = 'soft') => `<button class="${cls}" data-depth="${kind}" ${id == null ? '' : `data-depth-id="${id}"`} ${ok ? '' : `disabled title="${why}"`}>${label}</button>`;

/** Ambitions, undertakings and perks. h: { esc, tag } */
export function goalsTab(v, h) {
  const {esc, tag} = h, d = v.depth, a = d.ambition, first = esc(v.name.split(' ')[0]);
  const ambition = a.current
    ? `<div class="pm-goal"><div><b>${esc(a.current.label)}</b><small>${esc(a.current.text)} Reward: ${esc(a.current.reward)}.</small>${bar(a.current.progress)}<small>${a.current.progress}% there</small></div>${btn('ambition', '', 'Change course')}</div>`
    : `<p class="muted">${first} has no great goal yet. Choose one: it is what a life is for, and fulfilling it earns a perk point, fame and a trait.</p>`;
  const choices = a.list.filter(x => x.id !== a.current?.id).map(x => `<div class="pm-pick"><div><b>${esc(x.label)}</b><small>${esc(x.text)}</small>${bar(x.progress, 'thin')}</div>${btn('ambition', x.id, 'Pursue')}</div>`).join('');
  const done = a.done.length ? `<div class="tags">${a.done.map(x => tag('✓ ' + x, '#16a34a')).join('')}</div>` : '';
  const pr = d.proj, cur = pr.current;
  const proj = cur
    ? `<div class="pm-goal"><div><b>${esc(cur.label)}</b><small>${esc(cur.text)}</small>${bar((cur.total - cur.left) / cur.total * 100)}<small>${cur.total - cur.left} of ${cur.total} seasons</small></div>${btn('abandon', null, 'Give up')}</div>`
    : `<div class="pm-picks">${pr.list.map(x => `<div class="pm-pick ${x.enabled ? '' : 'off'}"><div><b>${esc(x.label)}</b><small>${esc(x.text)}</small><small>${x.cost ? `Costs ${x.cost}. ` : ''}About ${Math.ceil(x.seasons / 4)} years.${x.enabled ? '' : ' ' + esc(x.why)}</small></div>${btn('start', x.id, 'Begin', x.enabled, x.why)}</div>`).join('') || '<p class="muted">Nothing is open to you yet.</p>'}</div>`;
  const perks = `<div class="pm-perks">${d.perks.list.map(k => `<div class="pm-perk ${k.owned ? 'own' : ''}"><div><b>${esc(k.label)}</b><small>${esc(k.text)}</small></div>${k.owned ? '<span class="tag" style="--c:#16a34a">Learned</span>' : btn('perk', k.id, `Learn · ${k.cost}`, k.enabled, k.why)}</div>`).join('')}</div>`;
  return `<section class="panel"><div class="panel-head"><div><h2>Your ambition</h2><p>One lifelong goal at a time. It is checked every season.</p></div></div><div class="pad">${ambition}${a.current ? '' : `<div class="pm-picks">${choices}</div>`}${done}</div></section>
    <section class="panel"><div class="panel-head"><div><h2>An undertaking</h2><p>A project of many seasons. You pay up front; skill and luck decide how well it ends. ${pr.done ? `${pr.done} finished so far.` : ''}</p></div></div><div class="pad">${proj}</div></section>
    <section class="panel"><div class="panel-head"><div><h2>Perks</h2><p>${d.perks.points} point${d.perks.points === 1 ? '' : 's'} to spend. You earn one every three years and one for each ambition.</p></div></div><div class="pad">${perks}</div></section>`;
}

/** Things you own and things you could buy. */
export function propertyTab(v, h) {
  const {esc} = h, d = v.depth.holdings, wealth = Math.round(v.wealth);
  const owned = d.owned.length ? d.owned.map(x => `<div class="pm-pick"><div><b>${esc(x.label)}</b><small>${esc(x.text)}</small></div>${btn('sell', x.id, `Sell · ${x.sell}`)}</div>`).join('') : '<p class="muted">You own nothing yet beyond what you carry. Property earns (or costs) a little every season.</p>';
  const market = d.market.map(x => `<div class="pm-pick ${x.enabled ? '' : 'off'}"><div><b>${esc(x.label)}</b><small>${esc(x.text)}</small><small>Earns ${esc(x.income)}, before upkeep.${x.enabled ? '' : ' ' + esc(x.why)}</small></div>${btn('buy', x.id, `Buy · ${x.cost}`, x.enabled, x.why)}</div>`).join('') || '<p class="muted">You own one of everything.</p>';
  return `<section class="panel"><div class="panel-head"><div><h2>What you own</h2><p>You have ${wealth} in hand. Property is sold for 60% of what it cost.</p></div></div><div class="pad"><div class="pm-picks">${owned}</div></div></section>
    <section class="panel"><div class="panel-head"><div><h2>For sale</h2><p>Each one earns something every season and costs something to keep.</p></div></div><div class="pad"><div class="pm-picks">${market}</div></div></section>`;
}

/** Friends, a partner, rivals, apprentices, and your family. */
export function peopleTab(v, h) {
  const {esc} = h, d = v.depth, used = d.social.used, adult = v.age >= 18, hasSpouse = d.bonds.some(b => b.kind === 'spouse');
  const tend = 'You have already seen to the people in your life this season.';
  const card = b => {
    const acts = [];
    if (b.kind === 'rival') acts.push(btn('outdo', b.id, 'Outdo them', !used, tend), btn('mend', b.id, 'Make peace', !used, tend));
    else {
      acts.push(btn('time', b.id, b.kind === 'mentee' ? 'Teach' : 'Spend time', !used, tend));
      if (b.kind !== 'mentee') acts.push(btn('favor', b.id, 'Ask a favour', !used && b.close >= 35, used ? tend : 'You are not close enough to ask.'));
      if (b.kind === 'friend' && adult && b.age >= 18 && !hasSpouse) acts.push(btn('court', b.id, 'Court', !used && b.close >= 55, used ? tend : 'You are not close enough yet.'));
    }
    acts.push(btn('cut', b.id, 'Let go', true, '', 'link'));
    return `<div class="pm-bond" style="--c:${KIND_COLOR[b.kind]}"><div class="pm-bond-top"><b>${esc(b.name)}</b><span class="tag" style="--c:${KIND_COLOR[b.kind]}">${KIND[b.kind]}</span></div><small>${esc(b.job)}${b.age ? `, age ${b.age}` : ''}${b.place ? ` · ${esc(b.place)}` : ''}</small>${bar(b.close, b.kind === 'rival' ? 'rival' : '')}<small>${b.kind === 'rival' ? 'Rivalry' : 'Closeness'} ${b.close}</small><div class="pm-bond-acts">${acts.join('')}</div></div>`;
  };
  const family = (v.parents.length || v.kids.length) ? `<div class="linkrow">${v.parents.length ? '<span>Parents</span>' : ''}${v.parents.map(p => `<button class="chip" data-person="${p.id}"><i></i>${esc(p.name)}${p.alive ? '' : ' †'}</button>`).join('')}${v.kids.length ? '<span>Children</span>' : ''}${v.kids.slice(0, 12).map(k => `<button class="chip" data-person="${k.id}"><i></i>${esc(k.name)} · ${k.age}</button>`).join('')}</div>` : '<p class="muted">No living parents or children.</p>';
  return `<section class="panel"><div class="panel-head"><div><h2>People in your life</h2><p>You can see to one of them each season: friendships fade if you do not.${used ? ' This season you already have.' : ''}</p></div>${btn('meet', null, 'Meet someone new', !used && d.social.room && v.age >= 14, used ? tend : d.social.room ? 'You are too young.' : 'You cannot keep up with any more people.', 'primary')}</div><div class="pad">${d.bonds.length ? `<div class="pm-bonds">${d.bonds.map(card).join('')}</div>` : '<p class="muted">You do not know anyone well yet. Meet someone in your town.</p>'}</div></section>
    <section class="panel"><div class="panel-head"><div><h2>Family</h2><p>${v.kids.length ? `${v.kids.length} living ${v.kids.length === 1 ? 'child' : 'children'}` : 'No living children'}. An heir inherits from them.</p></div></div><div class="pad">${family}</div></section>`;
}
