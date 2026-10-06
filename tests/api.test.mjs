import test from 'node:test';
import assert from 'node:assert/strict';
import {handleApi} from '../src/server/api.mjs';
import {initialState,createDraft} from '../src/client/domain.js';

const apiUrl='https://nadosajang.example/api/state';
const origin=new URL(apiUrl).origin;

function createStore(){
 let saved=null;
 const calls={reads:0,writes:[]};
 return {
  calls,
  async read(){calls.reads++;return structuredClone(saved);},
  async write(state,revision){
   calls.writes.push({state:structuredClone(state),revision});
   if((saved?.revision??0)!==revision)return null;
   saved={state:structuredClone(state),revision:revision+1};
   return saved.revision;
  },
  snapshot(){return structuredClone(saved);}
 };
}

function putRequest(state,revision,headers={}){
 return new Request(apiUrl,{method:'PUT',headers:{'Content-Type':'application/json',Origin:origin,...headers},body:JSON.stringify({state,revision})});
}

function populatedState(){
 const state=initialState();
 state.profile={...state.profile,name:'예비 사장',region:'서울',age:'29',experience:'서비스 개발 경험'};
 const idea={id:'idea-1',name:'창업 준비 서비스',summary:'저장한 정보를 지원서에 재사용',problem:'반복 입력',customer:'예비 창업자',solution:'아이템 프로필',team:'개발자 1명'};
 const notice={id:'notice-1',title:'창업 지원사업',summary:'고객 검증 지원',support:'사업화 지원',url:'https://www.k-startup.go.kr/'};
 state.ideas.push(idea);
 const draft=createDraft(notice,idea,state.profile);
 draft.sections[0].text='직접 다듬은 문제인식';
 draft.completed=[0];
 draft.status='검토 중';
 state.drafts.push(draft);
 state.bookmarks.push(notice.id);
 return state;
}

test('빈 저장소를 읽으면 초기 작업실과 revision 0을 반환한다',async()=>{
 const store=createStore();
 const response=await handleApi(new Request(apiUrl),store);
 assert.equal(response.status,200);
 assert.deepEqual(await response.json(),{state:initialState(),revision:0});
 assert.equal(response.headers.get('Cache-Control'),'no-store');
 assert.match(response.headers.get('Content-Type'),/^application\/json/);
 assert.equal(store.calls.writes.length,0);
});

test('프로필·아이디어·수정한 PSST4·스크랩을 저장하고 다음 요청에서 그대로 읽는다',async()=>{
 const store=createStore(),state=populatedState();
 const saved=await handleApi(putRequest(state,0),store);
 assert.equal(saved.status,200);
 assert.deepEqual(await saved.json(),{revision:1});
 assert.equal(store.calls.writes[0].revision,0);
 const loaded=await handleApi(new Request(apiUrl),store);
 assert.equal(loaded.status,200);
 assert.deepEqual(await loaded.json(),{state,revision:1});
 const changed=structuredClone(state);
 changed.drafts[0].sections[1].text='다음 요청에서 보완한 실현가능성';
 changed.drafts[0].status='제출 완료';
 const updated=await handleApi(putRequest(changed,1),store);
 assert.equal(updated.status,200);
 assert.deepEqual(await updated.json(),{revision:2});
 assert.deepEqual(store.snapshot(),{state:changed,revision:2});
});

test('이전 revision으로 저장하면 409를 반환하고 최신 작업실을 덮어쓰지 않는다',async()=>{
 const store=createStore(),latest=populatedState();
 await handleApi(putRequest(latest,0),store);
 const stale=structuredClone(latest);
 stale.profile.name='이전 탭';
 const response=await handleApi(putRequest(stale,0),store);
 assert.equal(response.status,409);
 assert.match((await response.json()).error,/다른 창/);
 assert.deepEqual(store.snapshot(),{state:latest,revision:1});
});

test('두 요청이 같은 revision을 쓰면 하나만 저장되고 나머지는 충돌한다',async()=>{
 const store=createStore(),first=initialState(),second=initialState();
 first.profile.name='첫 번째 창';second.profile.name='두 번째 창';
 const responses=await Promise.all([handleApi(putRequest(first,0),store),handleApi(putRequest(second,0),store)]);
 assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);
 const winner=responses[0].status===200?first:second;
 assert.deepEqual(store.snapshot(),{state:winner,revision:1});
});

test('다른 origin의 변경 요청은 저장소에 전달하지 않는다',async()=>{
 const store=createStore();
 const response=await handleApi(putRequest(initialState(),0,{Origin:'https://foreign.example'}),store);
 assert.equal(response.status,403);
 assert.equal(store.calls.writes.length,0);
 assert.equal(store.snapshot(),null);
});

test('JSON이 아닌 Content-Type의 변경 요청을 거부한다',async()=>{
 const store=createStore();
 const response=await handleApi(putRequest(initialState(),0,{'Content-Type':'text/plain'}),store);
 assert.equal(response.status,415);
 assert.equal(store.calls.writes.length,0);
});

test('파싱할 수 없는 JSON은 400이며 저장소를 변경하지 않는다',async()=>{
 const store=createStore();
 const request=new Request(apiUrl,{method:'PUT',headers:{'Content-Type':'application/json',Origin:origin},body:'{"state":'});
 const response=await handleApi(request,store);
 assert.equal(response.status,400);
 assert.equal(store.calls.writes.length,0);
});

test('누락되거나 음수·소수·문자열인 revision을 400으로 거부한다',async()=>{
 for(const revision of [undefined,-1,0.5,'0']){
  const store=createStore();
  const response=await handleApi(putRequest(initialState(),revision),store);
  assert.equal(response.status,400,`revision=${String(revision)}`);
  assert.equal(store.calls.writes.length,0);
 }
});

test('유효하지 않은 작업실 또는 문항 개수는 400이며 기존 데이터를 유지한다',async()=>{
 const store=createStore(),valid=populatedState();
 await handleApi(putRequest(valid,0),store);
 const invalid=structuredClone(valid);
 invalid.drafts[0].sections.pop();
 for(const state of [{ideas:'invalid'},invalid]){
  const response=await handleApi(putRequest(state,1),store);
  assert.equal(response.status,400);
 }
 assert.equal(store.calls.writes.length,1);
 assert.deepEqual(store.snapshot(),{state:valid,revision:1});
});

test('null 요청이나 null 문항은 저장소 장애로 오인하지 않고 400으로 거부한다',async t=>{
 t.mock.method(console,'error',()=>{});
 const malformed=populatedState();malformed.drafts[0].sections[0]=null;
 const bodies=[null,{state:null,revision:0},{state:malformed,revision:0}];
 for(const body of bodies){
  const store=createStore();
  const response=await handleApi(new Request(apiUrl,{method:'PUT',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)}),store);
  assert.equal(response.status,400,`body=${JSON.stringify(body).slice(0,100)}`);
  assert.equal(store.calls.writes.length,0);
 }
});

test('요청 크기 제한을 넘으면 파싱이나 저장 전에 413으로 거부한다',async()=>{
 const store=createStore();
 const request=new Request(apiUrl,{method:'PUT',headers:{'Content-Type':'application/json',Origin:origin},body:' '.repeat(1000001)});
 const response=await handleApi(request,store);
 assert.equal(response.status,413);
 assert.equal(store.calls.writes.length,0);
});

test('지원하지 않는 변경 메서드는 405이며 저장소를 호출하지 않는다',async()=>{
 const store=createStore();
 for(const method of ['POST','DELETE','PATCH']){
  const response=await handleApi(new Request(apiUrl,{method}),store);
  assert.equal(response.status,405);
 }
 assert.equal(store.calls.reads,0);
 assert.equal(store.calls.writes.length,0);
});

test('저장소 읽기 실패는 내부 오류 내용 없이 503으로 안내한다',async t=>{
 t.mock.method(console,'error',()=>{});
 const store={async read(){throw new Error('private-storage-details');}};
 const response=await handleApi(new Request(apiUrl),store);
 assert.equal(response.status,503);
 const body=await response.json();
 assert.match(body.error,/저장소/);
 assert.ok(!body.error.includes('private-storage-details'));
});

test('저장소 쓰기 실패는 성공 revision을 반환하지 않고 503으로 안내한다',async t=>{
 t.mock.method(console,'error',()=>{});
 const store={async write(){throw new Error('private-storage-details');}};
 const response=await handleApi(putRequest(initialState(),0),store);
 assert.equal(response.status,503);
 const body=await response.json();
 assert.match(body.error,/저장소/);
 assert.equal(body.revision,undefined);
 assert.ok(!body.error.includes('private-storage-details'));
});
