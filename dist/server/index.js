import {handleApi} from './api.mjs';
import {assets} from './assets.mjs';
export default {async fetch(request,env){const url=new URL(request.url);
 if(url.pathname==='/api/state'){
 if(!env.DB)return new Response(JSON.stringify({error:'저장소를 연결하지 못했습니다.'}),{status:503,headers:{'Content-Type':'application/json'}});
 const store={async read(){const row=await env.DB.prepare('SELECT state, revision FROM workspace WHERE id = ?').bind('owner').first();return row?{state:JSON.parse(row.state),revision:row.revision}:null;},async write(state,revision){const payload=JSON.stringify(state);if(revision===0){const r=await env.DB.prepare('INSERT OR IGNORE INTO workspace (id,state,revision) VALUES (?,?,1)').bind('owner',payload).run();return r.meta.changes?1:null;}const r=await env.DB.prepare('UPDATE workspace SET state = ?, revision = revision + 1 WHERE id = ? AND revision = ?').bind(payload,'owner',revision).run();return r.meta.changes?revision+1:null;}};
 return handleApi(request,store);
 }
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
 const asset=assets[url.pathname==='/'?'/index.html':url.pathname];if(!asset)return new Response('Not found',{status:404});
 return new Response(request.method==='HEAD'?null:asset.content,{headers:{'Content-Type':asset.type+'; charset=utf-8','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'}});
}};
