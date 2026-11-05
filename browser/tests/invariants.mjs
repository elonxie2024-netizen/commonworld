import assert from 'node:assert/strict';
import {Engine} from '../dist/engine-api.js';
import {$import,$call,$get} from '../dist/engine.js';
import {PD,$set,$tuple} from '../dist/python-runtime.js';
let checks=0;
const edit=(e,text)=>{const year=$get(e.sim,'year'),r=e.command(text);assert.equal(r.action,'edit',text+': '+r.output);assert.equal($get(e.sim,'year'),year);checks++;return r;};
for(const course of ['acute','chronic','endemic']){
 const e=new Engine();e.create({population:1,seed:19});
 edit(e,`add disease Testfever course=${course} infection=0 death=0 recovery=${course==='chronic'?0:1}`);edit(e,'infect 1 Testfever');
 const p=$get(e.sim,'people').get(1),c=$get(e.sim,'countries').get(1);$set(p,'infection_steps',1);$set(c,'sickness','Testfever');
 $call($get($import('epidemiology'),'resolve_disease'),[e.sim,c,[p]]);
 assert.equal($get(p,'infection'),course==='chronic'?'Testfever':null);checks++;
}
for(let seed=0;seed<3;seed++){
 const e=new Engine();e.create({population:800,seed});edit(e,'add disease Wave infection=0.55 death=0.04 recovery=0.85');
 const c=$get(e.sim,'countries').get(1),d=$get(e.sim,'sicknesses').get('Wave');$set(d,'mutation_chance',0);$set(c,'sickness','Wave');
 for(let year=1;year<=12;year++){$set(e.sim,'year',year);const before=$get(e.sim,'people').size;const deaths=$call($get($import('epidemiology'),'resolve_disease'),[e.sim,c,[...$get(e.sim,'people').values()]]);assert.equal(before-$get(e.sim,'people').size,deaths);}
 const annual=$get(c,'disease_outbreaks').get('Wave').get('annual'),cases=annual.map(r=>r.get('infections'));assert.ok(Math.max(...cases)>cases[0]*1.4);assert.ok(cases.at(-1)<Math.max(...cases)*.4);checks++;
}
{
 const e=new Engine();e.create({population:1000,seed:23});edit(e,'trigger 1 Famine');const c=$get(e.sim,'countries').get(1);const until=$get(c,'crisis_until').get('Famine');assert.ok(until<=4);
 for(let year=1;year<=until;year++)e.step();assert.equal($get(c,'conditions').has('Famine'),false);assert.ok($get(c,'crisis_cooldown').get('Famine')>$get(e.sim,'year'));checks++;
}
{
 const e=new Engine();e.create({population:1000,seed:25});const sim=e.sim,places=$get(sim,'settlements'),people=$get(sim,'people'),target=[...places.values()].find(s=>$get(s,'country')===2);const before=people.size;
 $call($get($import('warfare'),'_transfer'),[sim,1,2,target]);assert.equal($get(target,'country'),1);for(const p of people.values())assert.equal($get(p,'country'),$get(places.get($get(p,'settlement')),'country'));assert.equal(people.size,before);
 $call($get($import('warfare'),'_transfer'),[sim,1,2]);assert.equal(people.size,before);assert.equal($get($get(sim,'countries').get(2),'ended'),0);checks++;
}
{
 const e=new Engine();e.create({population:1000,seed:23});for(const text of ['set person 999999 wealth 3','set person 1 wealth nan','set person 1 wealth -2','set person 1 age -1','set country 1 food inf','set country 1 economy nonsense','set simulation war_chance 1.1','add person 99999','add disease Bad infection=2','add settlement 1 residents=99999','move person 1 999999','delete country 1 to=1','war 1 1']){const before=e.exportSave();assert.equal(e.command(text).action,'inspect',text);assert.equal(e.exportSave(),before,text);checks++;}
 edit(e,'set person 1 name Marcus');edit(e,'set person 2 name Marcus');const name=e.snapshot().people[0].name;const second=e.snapshot().people[1].name;assert.ok(second.includes(' II of '));assert.equal(e.command('person "'+name+'"').action,'inspect');assert.ok(e.command('person "'+second+'"').output.includes(second));checks++;
}
console.log(`PASS: ${checks} disease courses/waves, famine bounds/cooldown, conquest ownership, invalid edit atomicity, and Roman-name checks.`);
