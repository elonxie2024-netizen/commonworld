// Detail panels for things moving on the map: settler parties, armies and merchant bands.
// `h` supplies the app's live state and small renderers, so this module holds no state of its own.

export const UNIT_TYPES = ['expedition', 'army', 'caravan'];
const LIST = { expedition: 'expeditions', army: 'armies', caravan: 'caravans' };

export function findUnit(snap, type, id) {
  return (snap?.[LIST[type]] || []).find(u => String(u.id) === String(id)) || null;
}

export function unitDialogs(h) {
  const { esc, num, tag, stat, dlgHead, icon, cc, progressBar } = h;
  const country = id => h.idx().countries.get(String(id));
  const place = id => h.idx().settlements.get(String(id));
  const link = (type, item) => item ? `<button class="chip" data-${type}="${item.id}" style="--c:${cc(item.country ?? item.id)}"><i></i>${esc(item.name)}</button>` : '—';
  const steps = u => `${u.index} of ${Math.max(1, u.path.length - 1)} steps`;
  const progress = (u, color) => progressBar(u.index / Math.max(1, u.path.length - 1), color);

  return {
    expedition(e) {
      const founders = e.kind === 'found', col = cc(e.country), sea = e.mode === 'sea';
      const where = founders ? `a new town at ${e.target[0]}, ${e.target[1]}` : esc(e.targetName || 'a new home');
      return `${dlgHead(col, `<span class="avatar xl sq" style="--c:${col}">${icon('compass')}</span>`, founders ? (sea ? 'SETTLERS · BY SEA' : 'SETTLERS') : 'MIGRANTS', `${e.people} ${founders ? 'settlers' : 'migrants'} from ${e.originName}`, `${tag(e.countryName, col)}${sea ? tag('By sea', '#0284c7') : ''}`)}
      <div class="dlg-body"><div class="statgrid">${stat('People', num(e.people))}${stat('Leader', esc(e.leaderName || '—'))}${stat('Heading to', where)}${stat('Arrives in', `about ${h.etaYears(e)} yr`)}</div>
      <h3 class="sub">Journey <small class="muted">${steps(e)}</small></h3>${progress(e, col)}
      <p class="muted">${founders ? 'When they arrive the new town exists. Rough ground, rivers and mountains slow them and cost lives; roads speed them up. A party that loses too many turns back.' : 'They settle into an existing town when they arrive.'}</p>
      <div class="linkrow"><span>Country</span>${link('country', country(e.country))}<span>From</span>${link('settlement', place(e.origin))}</div>
      <div class="actions"><button class="soft" data-focus-exp="${e.id}">${icon('map')} Follow on the map</button></div></div>`;
    },

    army(a) {
      const col = cc(a.country), sieging = a.state === 'besieging';
      return `${dlgHead(col, `<span class="avatar xl sq" style="--c:${col}">${icon('swords')}</span>`, sieging ? 'ARMY · SIEGE' : 'ARMY', `${a.countryName} army`, `${tag(`${num(a.men)} ${a.unit || 'soldiers'}`, col)}${tag(`vs ${a.enemyName}`, '#dc2626')}`)}
      <div class="dlg-body"><div class="statgrid">${stat('Soldiers', num(a.men))}${stat('Troops', esc(a.unit || 'soldiers'))}${stat('Objective', esc(a.objectiveName))}${stat('Status', sieging ? 'Besieging' : 'Marching')}</div>
      <h3 class="sub">March <small class="muted">${sieging ? 'at the walls' : steps(a)}</small></h3>${progress(a, '#ef4444')}
      <p class="muted">An army at the walls of its objective lays siege, which improves its side's odds of taking the town.</p>
      <div class="linkrow"><span>Country</span>${link('country', country(a.country))}<span>Enemy</span>${link('country', country(a.enemy))}<span>From</span>${link('settlement', place(a.origin))}<span>Objective</span>${link('settlement', place(a.objective))}</div>
      <div class="actions"><button class="soft" data-focus-army="${a.id}">${icon('map')} Follow on the map</button></div></div>`;
    },

    caravan(c) {
      const col = cc(c.country), big = c.size >= 40;
      const sick = c.carries ? h.snap().diseases.find(d => d.name === c.carries) : null;
      return `${dlgHead(col, `<span class="avatar xl sq" style="--c:${col}">${icon(c.mode === 'sea' ? 'compass' : 'home')}</span>`, c.mode === 'sea' ? 'MERCHANTS · BY SHIP' : 'MERCHANTS', `${big ? 'Large band' : 'Band'} of ${c.size} merchants`, `${tag(c.countryName, col)}${tag(c.cargo, '#d97706')}${c.carries ? tag('Carrying ' + c.carries, '#84cc16') : ''}`)}
      <div class="dlg-body"><div class="statgrid">${stat('Merchants', num(c.size))}${stat('Cargo', esc(c.cargo))}${stat('Route', `${esc(c.originName)} → ${esc(c.destName)}`)}${stat('Trading with', esc(c.partnerName))}</div>
      <h3 class="sub">Route <small class="muted">${steps(c)}</small></h3>${progress(c, c.carries ? '#84cc16' : '#d97706')}
      <p class="muted">Merchants carry goods and know-how between trading countries${c.carries ? ', and this band also carries a disease into the town it reaches' : ''}.</p>
      <div class="linkrow"><span>Country</span>${link('country', country(c.country))}<span>Partner</span>${link('country', country(c.partner))}<span>From</span>${link('settlement', place(c.origin))}<span>To</span>${link('settlement', place(c.dest))}${sick ? `<span>Disease</span><button class="chip" data-disease="${esc(sick.name)}" style="--c:#84cc16"><i></i>${esc(sick.name)}</button>` : ''}</div>
      <div class="actions"><button class="soft" data-focus-caravan="${c.id}">${icon('map')} Follow on the map</button></div></div>`;
    }
  };
}
