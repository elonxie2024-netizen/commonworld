import {$import,$get,$call} from './engine.js';
import {PD,PS,serialize,deserialize} from './python-runtime.js';
const attr=(o,n,d=null)=>o?.attrs?.has(n)?o.attrs.get(n):d;
const vals=x=>x instanceof PD?[...x.values()]:[];
let discoveryNames=null,buildingCatalog=null,govCatalog=null,techTree=null;const eventCache=new Map();let eventStamp=-1;// rendered event text; cleared by anything that can rename people or places
const geoCache=new Map();
const js=x=>x instanceof PD?Object.fromEntries([...x.entries()].map(([k,v])=>[String(k),js(v)])):x instanceof PS?[...x].map(js):Array.isArray(x)?x.map(js):x;
function buildGeo(sim,geoMod){
 const seed=attr(sim,'geo_seed',0);if(geoCache.has(seed))return geoCache.get(seed);
 const world=$call($get(geoMod,'world'),[sim]),codes={ocean:'o',lake:'l',plains:'p',forest:'f',hills:'h',mountains:'m',desert:'d',swamp:'s',tundra:'t'},digit=(v,s)=>Math.max(0,Math.min(9,Math.floor(v*s)));
 const geo={w:$get(geoMod,'W'),h:$get(geoMod,'H'),
  terrain:[...world.get('terrain')].map(r=>[...r].map(c=>codes[c]).join('')),
  river:[...world.get('river')].map(r=>[...r].map(v=>v?'1':'0').join('')),
  soil:[...world.get('soil')].map(r=>[...r].map(v=>digit(v,10)).join('')),
  temp:[...world.get('temp')].map(r=>[...r].map(v=>digit(v,9)).join('')),
  wet:[...world.get('wet')].map(r=>[...r].map(v=>digit(v,12)).join('')),
  features:[...world.get('feat')].flatMap((r,y)=>[...r].map((tags,x)=>tags?[x,y,tags]:null).filter(Boolean)),
  deposits:[...world.get('deposits').entries()].map(([k,list])=>[k%$get(geoMod,'W'),Math.floor(k/$get(geoMod,'W')),[...list].map(t=>[t[0],t[1]])]),
  elev:[...world.get('elev')].map(r=>[...r].map(v=>Math.max(0,Math.min(9,Math.floor(v*10)))).join('')),
  land:[...world.get('land')].map(r=>[...r])};
 geoCache.set(seed,geo);return geo;
}
const TERRAIN_NAMES={o:'ocean',l:'lake',p:'plains',f:'forest',h:'hills',m:'mountains',d:'desert',s:'swamp',t:'tundra'};
function describeCell(geo,x,y){if(x==null)return 'unplaced';let coast=false,river=false;for(let yy=Math.max(0,y-1);yy<=Math.min(geo.h-1,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(geo.w-1,x+1);xx++){if('ol'.includes(geo.terrain[yy][xx]))coast=true;if(geo.river[yy][xx]==='1')river=true;}return `${coast?'coastal':'inland'}${river?' riverside':''} ${TERRAIN_NAMES[geo.terrain[y][x]]}`;}
export class Engine {
 create({population=2000,seed=42}={}){eventCache.clear();if(!Number.isSafeInteger(population)||population<1||population>20000)throw Error('Choose a population between 1 and 20,000.');if(!Number.isSafeInteger(seed))throw Error('Use a whole-number seed.');this.sim=$call($get($import('civsim'),'Simulation'),[],new PD([['population',population],['seed',seed]]));return this.snapshot();}
 step(count=1){if(!Number.isInteger(count)||count<1||count>100)throw Error('Advance between 1 and 100 years at a time.');for(let i=0;i<count;i++)$call($get(this.sim,'tick'),[],new PD([['verbose',false]]));return this.snapshot();}
 command(text){eventCache.clear();const [output,action]=$call($get($import('civic'),'command'),[this.sim,String(text)]);if(action==='next')this.step();return {output,action,snapshot:this.snapshot()};}
 getSnapshot(){return this.snapshot();}
 hazardMap(){const geoMod=$import('geography'),geo=buildGeo(this.sim,geoMod),kinds=['flood','storm','wildfire','earthquake','landslide','blizzard'],out=Object.fromEntries(kinds.map(k=>[k,[]]));for(let y=0;y<geo.h;y++){const rows=Object.fromEntries(kinds.map(k=>[k,'']));for(let x=0;x<geo.w;x++){const water='ol'.includes(geo.terrain[y][x]),h=water?null:js($call($get(geoMod,'hazards_at'),[this.sim,x,y]));for(const k of kinds)rows[k]+=h?String(Math.min(9,Math.round(h[k]*2.2))):'0';}for(const k of kinds)out[k].push(rows[k]);}return out;}
 exportSave(){return serialize(this.sim);}
 importSave(text){eventCache.clear();const candidate=deserialize(text);if(candidate?.cls?.name!=='Simulation'||!(attr(candidate,'people') instanceof PD)||!(attr(candidate,'countries') instanceof PD))throw Error('The save does not contain a simulation.');const previous=this.sim;try{this.sim=candidate;return this.snapshot();}catch(e){this.sim=previous;throw e;}}
 snapshot(){
  const sim=this.sim,a=(n,d=null)=>attr(sim,n,d),countries=a('countries'),settlements=a('settlements'),lineages=a('lineages'),people=a('people'),archive=a('archive'),pop=new Map(),residents=new Map(),ill=new Map(),sickBy=new Map();
  for(const p of people.values()){const c=attr(p,'country'),s=attr(p,'settlement'),infection=attr(p,'infection');pop.set(c,(pop.get(c)||0)+1);residents.set(s,(residents.get(s)||0)+1);if(infection){ill.set(infection,(ill.get(infection)||0)+1);let m=sickBy.get(s);if(!m){m={};sickBy.set(s,m);}m[infection]=(m[infection]||0)+1;}}
  const full=p=>p?$call($get(sim,'full_name'),[p]):'Unknown';
  const innovations=$get($import('discoveries'),'INNOVATIONS');
  const reports=a('yearly_reports',[]).map(r=>({year:r.get('year'),population:r.get('population'),births:r.get('births'),deaths:r.get('deaths')}));
  const latest=reports.at(-1)||{births:0,deaths:0};
  const cs=vals(countries).map(c=>({id:attr(c,'id'),name:attr(c,'name'),population:pop.get(attr(c,'id'))||0,government:attr(c,'government'),economicSystem:attr(c,'economic_system'),food:attr(c,'food'),prosperity:attr(c,'prosperity'),stability:attr(c,'stability'),treasury:attr(c,'treasury',0),capital:attr(c,'capital'),conditions:[...attr(c,'conditions',[])],technologies:[...attr(c,'technologies',[])],innovations:[...attr(c,'innovations',[])].map(k=>attr(innovations.get(k),'name',k)),rulerName:full(archive.get(attr(c,'ruler')))}));
  const cures=a('cure_progress'),cureOf=n=>cures&&cures.has(n)?cures.get(n):0;
  let scientists=0,healers=0;for(const p of people.values()){if(attr(p,'age')>=18){const j=attr(p,'job');if(j==='scientist')scientists++;else if(j==='healer')healers++;}}
  const geoMod=$import('geography'),geo=buildGeo(sim,geoMod),devMod=$import('development');
  if(!buildingCatalog)buildingCatalog=js($get(devMod,'BUILDINGS'));
  if(!techTree){const tm=$import('technology');techTree={tree:js($get(tm,'TECH')),eras:js($get(tm,'ERAS')),branches:js($get(tm,'BRANCHES')),any:js($get(tm,'ANY')),units:js($get(tm,'UNIT_NAMES'))};}
  if(!govCatalog)govCatalog=js($get($import('governments'),'GOVERNMENTS'));
  const [landN,seaN]=$call($get(geoMod,'neighbors'),[sim]),ids=(d,k)=>d.has(k)?[...d.get(k)]:[];
  for(const c of cs){const pr=$call($get(geoMod,'profile'),[sim,c.id]);c.borders=ids(landN,c.id);c.seaNeighbors=ids(seaN,c.id);c.terrain={fertility:pr.get('fertility'),coastal:pr.get('coastal'),mountain:pr.get('mountain'),forest:pr.get('forest'),dry:pr.get('dry'),river:pr.get('river'),swamp:pr.get('swamp'),cold:pr.get('cold'),defense:$call($get(geoMod,'defense'),[sim,c.id])};}
  const bump=(m,k,i)=>{let r=m.get(k);if(!r){r=[0,0,0,0];m.set(k,r);}r[i]++;},byDisease=new Map(),byCountry=new Map(),yearly=new Map(),byDiseaseYear=new Map(),totals=[0,0,0,0];
  for(const p of archive.values())for(const h of attr(p,'infection_history',[])){const ev=h.get('event'),d=h.get('disease'),yr=h.get('year'),i=ev==='infected'||ev==='variant'?0:ev==='recovered'?1:ev==='died'?2:ev==='vaccinated'?3:-1;if(i<0)continue;totals[i]++;bump(byDisease,d,i);bump(byCountry,attr(p,'country'),i);bump(yearly,yr,i);bump(byDiseaseYear,d+'\u0000'+yr,i);}
  const rows=m=>[...m.entries()].map(([k,r])=>[k,...r]).sort((a,b)=>a[0]-b[0]);
  const healthStats={totals,yearly:rows(yearly),countries:Object.fromEntries([...byCountry.entries()].map(([k,r])=>[k,r])),diseases:Object.fromEntries([...byDisease.entries()].map(([k,r])=>[k,{counts:r,timeline:rows(new Map([...byDiseaseYear.entries()].filter(([key])=>key.startsWith(k+'\u0000')).map(([key,v])=>[Number(key.split('\u0000')[1]),v])))}]))};
  for(const [i,c] of vals(countries).entries())Object.assign(cs[i],{research:attr(c,'research',0),capacity:attr(c,'capacity'),quarantine:!!attr(c,'quarantine'),ended:attr(c,'ended'),founded:attr(c,'founded')});
  if(!discoveryNames)discoveryNames=[...$get($import('society'),'TECHNOLOGIES').keys(),...[...innovations.values()].map(v=>attr(v,'name'))];
  const depState=a('deposit_state'),depositState=depState?[...depState.entries()].map(([idx,v])=>[(idx>>2)%geo.w,Math.floor((idx>>2)/geo.w),idx&3,v[0],v[1]]):[];
  const stCache=a('systems_state'),stYear=a('year'),stMap=stCache&&stCache.get('year')===stYear?stCache.get('countries'):null;
  for(const [i,c] of vals(countries).entries()){if(attr(c,'ended')!==null){cs[i].systems=null;continue;}const cid=attr(c,'id');cs[i].systems=js(stMap&&stMap.has(cid)?stMap.get(cid):$call($get($import('systems'),'analyze'),[sim,cid]));const un=js($call($get($import('technology'),'units'),[attr(c,'technologies')]));cs[i].units=un;cs[i].era=un.era;cs[i].age=un.age;cs[i].eraName=techTree.eras[un.era];cs[i].researchProject=attr(c,'research_project',null);cs[i].insight=js(attr(c,'insight',null))||{};cs[i].boosted=js(attr(c,'boosted',null))||[];cs[i].pacts=js(attr(c,'pacts',null))||[];const ec=a('econ');cs[i].economy=ec&&ec.has(cid)?js(ec.get(cid)):null;cs[i].stock=js(attr(c,'stock',null));cs[i].culture=attr(c,'culture',0);cs[i].lastExpansion=attr(c,'last_expansion',null);}
  const roadMap=a('roads'),roads=roadMap?[...roadMap.entries()].map(([k,v])=>[k%geo.w,Math.floor(k/geo.w),v]):[];
  const placeName=id=>attr(settlements.get(id),'name','Unknown');
  const expeditions=a('expeditions',[]).map(e=>{const o=js(e);o.originName=placeName(o.origin);o.leaderName=full(archive.get(o.leader));o.people=o.people.length;o.countryName=attr(countries.get(o.country),'name','Unknown');if(o.target_settlement!=null)o.targetName=placeName(o.target_settlement);return o;});
  const cname=id=>attr(countries.get(id),'name','Unknown');
  const armies=a('armies',[]).map(x=>{const o=js(x);o.countryName=cname(o.country);o.enemyName=cname(o.enemy);o.objectiveName=placeName(o.objective);o.originName=placeName(o.origin);return o;});
  const caravans=a('caravans',[]).map(x=>{const o=js(x);o.countryName=cname(o.country);o.partnerName=cname(o.partner);o.originName=placeName(o.origin);o.destName=placeName(o.dest);return o;});
  const projects=a('projects',[]).map(p=>{const o=js(p);o.settlementName=placeName(o.settlement);o.countryName=attr(countries.get(attr(settlements.get(o.settlement),'country')),'name','Unknown');return o;});
  const contestedMap=$call($get(geoMod,'contested_cells'),[sim]),contested=[...contestedMap.entries()].map(([k,v])=>[k%geo.w,Math.floor(k/geo.w),v[0],v[1]]);
  return {year:a('year'),contested,depositState,tradeFlows:js(a('trade_flows',[])),depositStats:js(a('deposit_stats',null)),governments:govCatalog,tech:techTree,resourceInfo:js($get(geoMod,'RESOURCE_INFO')),population:people.size,geoSeed:attr(sim,'geo_seed',0),roads,expeditions,armies,caravans,projects,disasters:js(a('disaster_log',[])),buildingCatalog,births:latest.births,deaths:latest.deaths,countries:cs,geo,healthStats,researchers:{scientists,healers},eradicated:vals(a('retired_sicknesses')).map(d=>({name:attr(d,'name'),course:attr(d,'course'),cure:cureOf(attr(d,'name'))})),
   settings:{war_chance:a('war_chance'),country_chance:a('country_chance'),lineage_chance:a('lineage_chance'),disaster_chance:a('disaster_chance')},
   lineages:vals(lineages).map(l=>attr(l,'surname')),discoveryNames,
   settlements:vals(settlements).map(s=>({id:attr(s,'id'),name:attr(s,'name'),country:attr(s,'country'),countryName:attr(countries.get(attr(s,'country')),'name','Unknown'),population:residents.get(attr(s,'id'))||0,kind:attr(s,'kind'),gx:attr(s,'gx'),gy:attr(s,'gy'),terrainText:describeCell(geo,attr(s,'gx'),attr(s,'gy')),buildings:(b=>b?Object.fromEntries([...b.entries()].map(([k,v])=>[k,v])):{})(attr(s,'buildings')),sick:sickBy.get(attr(s,'id'))||{},hazards:attr(s,'gx')==null?{}:js($call($get(geoMod,'hazards_at'),[sim,attr(s,'gx'),attr(s,'gy')])),capital:attr(countries.get(attr(s,'country')),'capital')===attr(s,'id'),abandoned:attr(s,'abandoned')!==null,founderName:full(archive.get(attr(s,'founder')))})),
   people:vals(archive).map(p=>({id:attr(p,'id'),name:full(p),first:attr(p,'first'),age:attr(p,'age'),country:attr(p,'country'),countryName:attr(countries.get(attr(p,'country')),'name','Unknown'),settlement:attr(p,'settlement'),settlementName:attr(settlements.get(attr(p,'settlement')),'name','Unsettled'),lineageName:attr(lineages.get(attr(p,'lineage')),'surname','Unknown'),wealth:attr(p,'wealth',0),job:attr(p,'job','resident'),role:attr(p,'public_role'),fame:attr(p,'fame',0),infection:attr(p,'infection'),alive:people.has(attr(p,'id')),born:attr(p,'born'),died:attr(p,'died'),causeOfDeath:attr(p,'cause_of_death'),parents:[...attr(p,'parents',[])]})),
   diseases:vals(a('sicknesses')).map(d=>({name:attr(d,'name'),course:attr(d,'course'),active:ill.get(attr(d,'name'))||0,deathChance:attr(d,'death_chance'),infectionChance:attr(d,'infection_chance'),recoveryChance:attr(d,'recovery_chance'),transmission:attr(d,'transmission'),immunityYears:attr(d,'immunity_years'),cure:cureOf(attr(d,'name')),firstYear:(h=>h&&h.timeline.length?h.timeline[0][0]:null)(healthStats.diseases[attr(d,'name')]),retired:false})),
   wars:[...a('wars').entries()].map(([pair,started])=>({countries:[...pair],names:pair.map(id=>attr(countries.get(id),'name','Unknown')),started,detail:'Inspect armies, supply, morale, wounds, and territorial objectives in the war report.'})),
   events:(()=>{const cats=a('history_categories',[]),render=$get(sim,'render_history');const seen=new Map();for(const l of vals(lineages)){const s=attr(l,'surname');seen.set(s,(seen.get(s)||0)+1);}let shared=0;for(const n of seen.values())if(n>1)shared+=n;if(shared!==eventStamp){eventCache.clear();eventStamp=shared;}/* a new namesake renumbers older entries (Ku -> Ku I), so cached text is only valid while the namesakes are unchanged */return a('history',[]).map(([year,message],i)=>{const key=typeof message==='string'?message:null;let m=key===null?undefined:eventCache.get(key);if(m===undefined){m=$call(render,[message]);if(key!==null)eventCache.set(key,m);}return {year,category:cats[i]||'world',message:m};});})(),reports,
   catalog:{foundations:$get($import('society'),'TECHNOLOGIES').size,innovations:innovations.size,events:$get($import('society'),'EVENT_CATALOG').length},canUndo:!!a('_command_undo')};
 }
}
