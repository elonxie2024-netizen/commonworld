import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Engine} from '../dist/engine-api.js';
import {PD,PS,$get,serialize} from '../dist/python-runtime.js';
import {PythonRandom} from '../dist/python-random.js';
const ref=JSON.parse(fs.readFileSync(new URL('./reference.json',import.meta.url),'utf8'));
function sortkey(v){return JSON.stringify(v);}
function clean(v){if(v instanceof PythonRandom)return {random:clean(v.getstate())};if(v instanceof PD)return {dict:[...v.entries()].map(([k,x])=>[clean(k),clean(x)]).sort((a,b)=>sortkey(a[0])<sortkey(b[0])?-1:1)};if(v instanceof PS)return {set:[...v].map(clean).sort((a,b)=>sortkey(a)<sortkey(b)?-1:1)};if(Array.isArray(v))return v.map(clean);if(v?.cls)return {class:v.cls.name,attrs:clean(v.attrs)};return v;}
let checked=0;
function same(a,b,path='root'){if(typeof a==='number'&&typeof b==='number'){assert.ok(Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(b)),`${path}: ${a} != ${b}`);return;}if(Array.isArray(a)){assert.ok(Array.isArray(b),path);assert.equal(a.length,b.length,path);a.forEach((x,i)=>same(x,b[i],`${path}[${i}]`));return;}if(a&&typeof a==='object'){assert.deepEqual(Object.keys(a).sort(),Object.keys(b).sort(),path);for(const k of Object.keys(a))same(a[k],b[k],path+'.'+k);return;}assert.equal(a,b,path);}
const e=new Engine();e.create();same(clean(e.sim),ref.initial);checked++;
for(const test of ref.commands){const r=e.command(test.text);try{same([r.output.startsWith('Command error:')?r.output.replace(/(\d)\.0(?=\D|$)/g,'$1'):r.output,r.action],[test.result[0].startsWith('Command error:')?test.result[0].replace(/(\d)\.0(?=\D|$)/g,'$1'):test.result[0],test.result[1]],'command '+test.text);}catch(err){console.error('COMMAND MISMATCH',test.text);throw err;}checked++;}
same(clean(e.sim),ref.after_commands,'after commands');checked++;
e.create();for(let i=0;i<ref.annual.length;i++){const before=e.snapshot().population,s=e.step();assert.equal(s.population,before+s.births-s.deaths);assert.equal(s.population,ref.annual[i].population,'population year '+s.year);same(clean($get(e.sim,'rng')),ref.annual[i].rng,'RNG year '+s.year);same(clean($get(e.sim,'yearly_reports').at(-1)),ref.annual[i].report,'report year '+s.year);for(const p of s.people.filter(p=>p.alive)){const home=s.settlements.find(x=>x.id===p.settlement);assert.equal(p.country,home.country,'settlement ownership');assert.equal(home.abandoned,false);}checked++;}
same(clean(e.sim),ref.final,'final');checked++;
const save=e.exportSave();const next=e.step();e.importSave(save);assert.deepEqual(e.step(),next,'save/load preserves future and RNG');checked++;
const before=e.exportSave();e.command('demographics');assert.equal(e.exportSave(),before,'inspection is read only');e.command('add person 1 age=25');e.command('undo');assert.equal(e.exportSave(),before,'undo restores full state');checked++;
console.log(`PASS: ${checked} parity scenarios, full state + RNG, 20 years, ownership, accounting, save/load, and undo.`);
