import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {handleApi} from '../src/server/api.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const stateFile=process.env.NADOSAJANG_STATE_FILE||path.join(root,'.local','state.json');
let queue=Promise.resolve();
const store={async read(){try{return JSON.parse(await fs.readFile(stateFile,'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw e;}},write(state,revision){const job=queue.then(async()=>{const old=await this.read();if((old?.revision??0)!==revision)return null;await fs.mkdir(path.dirname(stateFile),{recursive:true});const next={state,revision:revision+1};await fs.writeFile(stateFile+'.tmp',JSON.stringify(next));await fs.rename(stateFile+'.tmp',stateFile);return next.revision;});queue=job.catch(()=>{});return job;}};
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 try{
 const url=new URL(req.url,'http://'+req.headers.host);
 if(url.pathname==='/api/state'){
 let length=0;const chunks=[];for await(const chunk of req){length+=chunk.length;if(length>1000000){res.writeHead(413);res.end('Payload too large');return;}chunks.push(chunk);}
 const request=new Request(url,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})});const response=await handleApi(request,store);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());return;
 }
 const clientRoot=path.join(root,'src/client');const pathname=url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname);const target=path.resolve(clientRoot,'.'+pathname);
 if(!target.startsWith(clientRoot+path.sep)){res.writeHead(403);res.end();return;}
 const bytes=await fs.readFile(target);res.writeHead(200,{'Content-Type':(types[path.extname(target)]||'application/octet-stream')+'; charset=utf-8','Cache-Control':'no-cache'});res.end(bytes);
 }catch(e){res.writeHead(e.code==='ENOENT'?404:500);res.end(e.code==='ENOENT'?'Not found':'Server error');}
});
const port=Number(process.env.PORT||4173);server.listen(port,'127.0.0.1',()=>console.log(`나도사장 Local URL: http://127.0.0.1:${port}`));

