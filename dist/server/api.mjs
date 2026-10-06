import {initialState,validateState} from '../client/domain.js';
export function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});}
export async function handleApi(request,store){
 try{
 if(request.method==='GET'){const saved=await store.read();return json({state:saved?.state??initialState(),revision:saved?.revision??0});}
 if(request.method!=='PUT')return json({error:'지원하지 않는 요청입니다.'},405);
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return json({error:'요청 출처를 확인해주세요.'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'JSON 형식이 필요합니다.'},415);
 const text=await request.text();if(text.length>1000000)return json({error:'저장할 내용이 너무 큽니다.'},413);
 let body;try{body=JSON.parse(text);}catch{return json({error:'데이터 형식이 올바르지 않습니다.'},400);}
 if(!body||typeof body!=='object'||Array.isArray(body)||!validateState(body.state)||!Number.isInteger(body.revision)||body.revision<0)return json({error:'저장할 내용을 확인해주세요.'},400);
 const revision=await store.write(body.state,body.revision);if(revision===null)return json({error:'다른 창에서 내용이 변경되었습니다. 현재 내용을 내보낸 뒤 새로고침해주세요.'},409);
 return json({revision});
 }catch(error){console.error('State API:',error.message);return json({error:'저장소에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.'},503);}
}
