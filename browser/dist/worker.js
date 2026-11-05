import {Engine} from './engine-api.js';
const engine=new Engine();
self.onmessage=({data:{id,method,args}})=>{try{if(!['create','step','command','getSnapshot','hazardMap','exportSave','importSave'].includes(method))throw Error('Unknown engine operation');const result=engine[method](...args);self.postMessage({id,result});}catch(error){self.postMessage({id,error:error.message,stack:error.stack});}};
