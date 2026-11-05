import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('./dist/',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json'};
const server=http.createServer((req,res)=>{let filename;try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);filename=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!filename.startsWith(root)){res.writeHead(403);res.end();return;}const data=fs.readFileSync(filename);res.writeHead(200,{'Content-Type':types[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(data);}catch{res.writeHead(404);res.end('Not found');}});
server.listen(Number(process.env.CIVILIZATION_PORT||8765),'127.0.0.1',()=>console.log('Civilization: http://127.0.0.1:'+server.address().port));
