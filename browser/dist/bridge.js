export class BrowserSimulation {
 constructor(){this.worker=new Worker(new URL('./worker.js',import.meta.url),{type:'module'});this.pending=new Map();this.serial=0;this.worker.onmessage=({data})=>{const request=this.pending.get(data.id);if(!request)return;this.pending.delete(data.id);if(data.error){console.error(data.stack);request.reject(Error(data.error));}else request.resolve(data.result);};this.worker.onerror=event=>{for(const request of this.pending.values())request.reject(Error(event.message||'Simulation worker could not load.'));this.pending.clear();};}
 request(method,...args){return new Promise((resolve,reject)=>{const id=++this.serial;this.pending.set(id,{resolve,reject});this.worker.postMessage({id,method,args});});}
 create(options){return this.request('create',options);}
 step(count=1){return this.request('step',count);}
 command(text){return this.request('command',text);}
 getSnapshot(){return this.request('getSnapshot');}
 hazardMap(){return this.request('hazardMap');}
 exportSave(){return this.request('exportSave');}
 importSave(text){return this.request('importSave',text);}
 lifeStory(id){return this.request('lifeStory',id);}
 playAs(id){return this.request('playAs',id);}
 stopPlaying(){return this.request('stopPlaying');}
 playSeason(act,arg){return this.request('playSeason',act,arg);}
 choose(option){return this.request('choose',option);}
 succeed(pick){return this.request('succeed',pick);}
 setFocus(id){return this.request('setFocus',id);}
 queueAct(act,arg){return this.request('queueAct',act,arg);}
}
