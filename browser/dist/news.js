// Turns raw simulation events into short, ranked news headlines. Display-only: it never feeds back into the simulation.
const T = {
  war: ['WAR', '#ef4444'], peace: ['PEACE', '#10b981'], disaster: ['DISASTER', '#f97316'], crisis: ['CRISIS', '#f59e0b'], health: ['HEALTH', '#ec4899'],
  cure: ['CURE', '#14b8a6'], expansion: ['SETTLERS', '#0d9488'], building: ['BUILT', '#d97706'], migration: ['MOVING', '#0284c7'], tech: ['DISCOVERY', '#8b5cf6'], culture: ['CULTURE', '#a855f7'], politics: ['POLITICS', '#6366f1'], economy: ['ECONOMY', '#ca8a04'], places: ['PLACES', '#0ea5e9'], edit: ['EDIT', '#64748b'], news: ['NEWS', '#64748b']
};
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const n = v => Number(v).toLocaleString();
const h = (kind, score, headline, sub = '') => ({ tag: T[kind][0], color: T[kind][1], score, headline, sub });

// [pattern, builder]; first match wins. Score decides what makes the front page.
const RULES = [
  [/^(.+?) ran out of money; soldiers and officials go unpaid\./, m => h('economy', 70, `${m[1]} goes broke`, 'Soldiers and officials unpaid')],
  [/^The (.+?) deposit near (.+?) is exhausted; (.+?) cannot work it until it refills\./, m => h('economy', 66, `${cap(m[1])} runs dry near ${m[2]}`, `${m[3]} must wait for it to refill`)],
  [/^The (.+?) near (.+?) has fully recovered/, m => h('economy', 52, `${cap(m[1])} returns near ${m[2]}`, 'The deposit can be worked again')],
  [/^Merchants carried (\d+) tons of (.+?) from (.+?) to (.+?), earning (\d+) coins\./, m => h('economy', 64, `${m[3]} ships ${n(m[1])} tons of ${m[2]} to ${m[4]}`, `${n(m[5])} coins changed hands`)],
  [/^(An uprising|A reform movement) in (.+?) replaced the (.+?) with a (.+?)\./, m => h('politics', m[1] === 'An uprising' ? 86 : 74, `${m[2]} becomes a ${m[4]}`, `${m[1] === 'An uprising' ? 'Uprising topples' : 'Reform ends'} the ${m[3]}`)],
  [/^(.+?) (seized power in a coup|seized absolute power) in (.+?)\./, m => h('politics', 80, `${m[3]}: ${m[1].replace(/ \(.*$/, '')} ${m[2]}`)],
  [/^(.+?) declared war on (.+?) over (.+)\.$/, m => h('war', 95, `${m[1]} declares war on ${m[2]}`, `Cause: ${m[3]}`)],
  [/^(.+?) conquered (.+?);/, m => h('war', 100, `${m[1]} annexes ${m[2]}`, 'Survivors join the victor')],
  [/^(.+?) captured (.+?);/, m => h('war', 92, `${m[1]} captures ${m[2]}`, 'Residents change allegiance')],
  [/^War update \(year (\d+)\): ([^;]+); (.+?) lost (\d+) of \d+ levies, (.+?) lost (\d+) of \d+ levies; (.+?) held the advantage/, m => h('war', 55 + Math.min(25, Number(m[4]) + Number(m[6])), `${m[7]} gains the upper hand in ${m[2]}`, `${m[3]} lost ${m[4]} · ${m[5]} lost ${m[6]}`)],
  [/^(.+?) and (.+?) suspended hostilities/, m => h('peace', 70, `War between ${m[1]} and ${m[2]} stalls`, 'Four-year truce')],
  [/^(.+?) and (.+?) .*signed peace and a (\d+)-year truce/, m => h('peace', 82, `${m[1]} and ${m[2]} sign peace`, `${m[3]}-year truce`)],
  [/^War between (.+?) and (.+?) ended/, m => h('peace', 70, `War between ${m[1]} and ${m[2]} ends`)],
  [/^A (minor|major|severe) (flood|storm|wildfire|earthquake|landslide|blizzard) struck (.+?): (\d+) deaths, (\d+) survivors(?: \(affecting (.+?)\))?(?:; (\d+) buildings lost)?\./, m => h('disaster', m[1] === 'severe' ? 90 : m[1] === 'major' ? 78 : 58, `${cap(m[1])} ${m[2]} hits ${m[6] || m[3]}`, `${n(m[4])} dead${m[7] ? ` · ${m[7]} buildings lost` : ''}`)],
  [/^The (?:assault|\w+) destroyed the (.+?) in (.+?)\./, m => h(/assault/.test(m[0]) ? 'war' : 'disaster', 66, `${m[2]} loses its ${m[1]}`, m[0].replace(/ in .+$/, ''))],
  [/^(.+?) led (\d+) settlers out of (.+?) to found a new (.+?) town on (\w+) land; the journey should take about (\d+) years\./, m => h('expansion', 74, `${m[4]} sends ${m[2]} settlers from ${m[3]}`, `New town planned on ${m[5]} land · about ${m[6]} years away`)],
  [/^(.+?) sailed from (.+?) with (\d+) settlers to found a new (.+?) town on (\w+) land across the sea; the journey should take about (\d+) years\./, m => h('expansion', 78, `${m[4]} settlers set sail from ${m[2]}`, `${m[3]} people bound for ${m[5]} land overseas · about ${m[6]} years`)],
  [/^(.+?) mobilized (\d+) soldiers, who marched out of (.+?) toward (.+?)\./, m => h('war', 84, `${m[1]} army of ${n(m[2])} marches on ${m[4]}`, `Out of ${m[3]}`)],
  [/^The (.+?) army of (\d+) soldiers laid siege to (.+?)\./, m => h('war', 88, `${m[3]} besieged by ${m[1]}`, `${n(m[2])} soldiers at the walls`)],
  [/^(A large band|A band) of (\d+) (.+?) merchants left (.+?) for (.+?) with (.+?)(?:, some of them sick with (.+?))?\./, m => h(m[7] ? 'health' : 'building', m[7] ? 82 : (m[1] === 'A large band' ? 62 : 40), m[7] ? `Sick merchants carry ${m[7]} toward ${m[5]}` : `${m[2]} ${m[3]} merchants head for ${m[5]}`, `${m[1] === 'A large band' ? 'Large caravan' : 'Caravan'} from ${m[4]} with ${m[6]}`)],
  [/^Merchants from (.+?) brought (.+?) to (.+?) in (.+?)\./, m => h('health', 86, `${m[2]} reaches ${m[3]} with traders`, `Carried from ${m[1]} into ${m[4]}`)],
  [/^A party of (\d+) settlers from (.+?) reached the site of a new (.+?) town after (\d+) years on the road\./, m => h('expansion', 80, `${m[3]} settlers arrive at their new town`, `${m[1]} people from ${m[2]} after ${m[4]} years`)],
  [/^The party from (.+?) turned back after the (\w+) claimed too many lives/, m => h('expansion', 68, `Settlers from ${m[1]} turn back`, `The ${m[2]} claimed too many lives`)],
  [/^Settlers from (.+?) found their destination taken and returned home/, m => h('expansion', 58, `Settlers from ${m[1]} find their site taken`, 'They return home')],
  [/^The expedition from (.+?) dissolved on the road/, m => h('expansion', 56, `Expedition from ${m[1]} falls apart`)],
  [/^(Refugees|Migrants) from (.+?) \((\d+) people\) settled in (.+?) in (.+?)\./, m => h('migration', 50, `${n(m[3])} ${m[1].toLowerCase()} reach ${m[4]}`, `Moved from ${m[2]} within ${m[5]}`)],
  [/^Construction began on a (.+?) in (.+?), (.+?)\./, m => h('building', /walls|university|hospital|observatory|monument/i.test(m[1]) ? 44 : 33, `${m[3]} starts building a ${m[1]}`, `In ${m[2]}`)],
  [/^A road linking (.+?) and (.+?) was completed in (.+?)\./, m => h('building', 60, `New road links ${m[1]} and ${m[2]}`, m[3])],
  [/^(.+?) completed in (.+?), (.+?): (.+)\./, m => h('building', 62, `${m[3]} opens a ${m[1].toLowerCase()} in ${m[2]}`, m[4])],
  [/^(.+?) entered a (famine|drought) episode/, m => h('crisis', 74, `${cap(m[2])} grips ${m[1]}`, 'Relief expected within years')],
  [/^(.+?)'s (famine|drought) ended/, m => h('crisis', 48, `${m[1]}'s ${m[2]} ends`, 'Harvests recover')],
  [/^An outbreak of (.+?) \((\w+)\) began in (.+?):/, m => h('health', 78, `${m[1]} outbreak hits ${m[3]}`, `${cap(m[2])} disease`)],
  [/^(.+?) in (.+?): (\d+) new infections, (\d+) deaths, (\d+) recoveries, (\d+) still infected; (\w+);/, m => h('health', Number(m[3]) >= 40 || Number(m[4]) >= 5 ? 66 : 28, `${m[1]} ${m[7]} in ${m[2]}`, `${n(m[3])} new cases · ${n(m[4])} dead · ${n(m[5])} recovered · ${n(m[6])} sick`)],
  [/^A new variant, (.+?), emerged in (.+?);/, m => h('health', 80, `New variant: ${m[1]} emerges in ${m[2]}`, 'Earlier immunity may not protect')],
  [/^(.+?) has been eradicated: /, m => h('cure', 99, `${m[1]} eradicated`, 'The cure is complete and the last patient has recovered')],
  [/^Scientists and healers completed a cure for (.+?);/, m => h('cure', 96, `Cure found for ${m[1]}`, 'It will be eradicated once no one is infected')],
  [/^The (.+?) outbreak in (.+?) ended/, m => h('health', 52, `${m[1]} outbreak ends in ${m[2]}`)],
  [/^(.+?) restricted gatherings and travel/, m => h('health', 64, `${m[1]} locks down`, 'Gatherings and travel restricted')],
  [/^(.+?) lifted its quarantine/, m => h('health', 46, `${m[1]} lifts quarantine`)],
  [/^Travelers brought (.+?) from (.+?) to (.+?);/, m => h('health', 68, `${m[1]} spreads from ${m[2]} to ${m[3]}`, 'Carried across the border')],
  [/^A vaccination campaign in (.+?) protected (\d+) residents against (.+?)\./, m => h('health', 58, `${m[1]} vaccinates ${n(m[2])} against ${m[3]}`)],
  [/^(.+?) (?:developed|introduced) (.+?) in (.+?)(?:[,;]| bringing|$)/, m => h('tech', 52, `${m[3]} unlocks ${m[2]}`, `Credited to ${m[1].replace(/ of .+$/, '')}`)],
  [/^(.+?) earned national acclaim for (.+?)\.$/, m => h('culture', 42, `${m[1].replace(/ of (.+)$/, ' ($1)')} wins acclaim`, `For ${m[2]}`)],
  [/^(.+?) founded (.+?) with (\d+) settlers from (.+?)\./, m => h('politics', 90, `${m[2]} breaks away from ${m[4]}`, `${n(m[3])} settlers follow ${m[1].replace(/ of .+$/, '')}`)],
  [/^(.+?), (monarch|council leader), died aged (\d+)/, m => h('politics', 72, `${m[1].replace(/ of (.+)$/, '')} of ${m[1].replace(/^.+ of /, '')} dies`, `${cap(m[2])}, aged ${m[3]}`)],
  [/^(.+?) became the capital of (.+?)\./, m => h('places', 60, `${m[1]} becomes capital of ${m[2]}`)],
  [/^(.+?) in (.+?) was abandoned\./, m => h('places', 56, `${m[1]} abandoned`, `Everyone has left ${m[2]}`)],
  [/^(.+?) was resettled\./, m => h('places', 44, `${m[1]} resettled`)],
  [/^(.+?) changed from (\w+) to (\w+), with (\d+) residents/, m => h('places', 46, `${m[1]} grows into a ${m[3]}`, `${n(m[4])} residents`)],
  [/^(.+?) established the (village|town|city) of (.+?) in (.+?) with (\d+) residents/, m => h('places', 36, `New ${m[2]}: ${m[3]} founded in ${m[4]}`, `${n(m[5])} residents`)],
  [/^Farmers in (.+?) gathered an exceptional harvest/, m => h('crisis', 50, `Record harvest in ${m[1]}`)],
  [/^(.+?) distributed emergency food supplies/, m => h('crisis', 54, `${m[1]} hands out emergency food`)],
  [/^Intervention: (.+)$/, m => h('edit', 30, m[1].replace(/ \(Year unchanged.*$/, ''))]
];
const QUIET = /began a research project|Failed trials|An experiment in|Teachers from|public initiative|Population (increased|decreased)|starts lineage|was appointed|asked |requested |proposed |organized a trial|established public|tried a public|backed a plan|Storytellers|died aged|restricted|moved from|Volunteers|attempted to/;

export function headlines(snap, limit = 7) {
  const found = [];
  const events = snap.events || [];
  for (let i = events.length - 1; i >= 0 && found.length < 160; i--) {
    const e = events[i];
    let item = null;
    for (const [pattern, build] of RULES) {
      const m = e.message.match(pattern);
      if (m) { item = build(m); break; }
    }
    if (!item) {
      if (QUIET.test(e.message) || ['political', 'creative', 'lineage', 'population'].includes(e.category)) continue;
      const kind = e.category === 'war' ? 'war' : e.category === 'disaster' ? 'disaster' : e.category === 'sickness' ? 'health' : 'news';
      item = h(kind, 30, e.message.length > 90 ? e.message.slice(0, 87) + '…' : e.message);
    }
    if (item.score < 30) continue;
    found.push({ ...item, year: e.year, message: e.message, order: i });
  }
  // Newest year first, then the biggest story; avoid repeating the same story type endlessly.
  const latest = found.length ? found[0].year : snap.year;
  const recent = found.filter(f => f.year >= latest - 1);
  const pool = recent.length >= 4 ? recent : found;
  pool.sort((a, b) => b.year - a.year || b.score - a.score || b.order - a.order);
  const seen = new Map(), picked = [];
  for (const f of pool) {
    const k = f.tag + (f.headline.match(/^\S+ \S+/) || [''])[0];
    if ((seen.get(f.tag) || 0) >= 3 || seen.has(k) && f.score < 60) continue;
    seen.set(f.tag, (seen.get(f.tag) || 0) + 1); seen.set(k, 1);
    picked.push(f);
    if (picked.length >= limit) break;
  }
  if (!picked.length) {
    const places = (snap.settlements || []).filter(s => !s.abandoned && s.population > 0).length;
    return [{ tag: 'NEWS', color: '#5b5bf0', score: 100, headline: `New world: ${snap.countries.filter(c => c.population > 0).length} countries, ${n(snap.population)} people`, sub: `${places} settlements. Advance a year to start the news.`, year: snap.year, message: '' }];
  }
  // Lead story: the highest-scoring item among those picked.
  const lead = picked.reduce((a, b) => (b.score > a.score ? b : a));
  return [lead, ...picked.filter(p => p !== lead)];
}
