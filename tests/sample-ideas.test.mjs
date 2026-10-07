import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleIdeas,copySampleIdea} from '../src/client/sample-ideas.js';
import {initialState,validateState,ideaGroups} from '../src/client/domain.js';
import {drafts as ideas} from '../src/client/views.js';
test('AI지원서 기본 화면은 작업 목록이며 샘플은 저장 데이터에 들어가지 않는다',()=>{
 const state=initialState();state.ideas.push({id:'saved',name:'기존 작업',summary:'내가 쓴 설명',updatedAt:'2026-10-07T00:00:00Z'});
 const html=ideas({state},new URLSearchParams());
 assert.match(html,/내 작업 목록/);assert.match(html,/기존 작업/);assert.match(html,/새 아이디어 작성/);assert.match(html,/작성 예시/);
 assert.doesNotMatch(html,/아이템 프로필 점검/);assert.equal(state.ideas.length,1);
});
test('샘플은 와이어프레임 아이디어와 시장·SWOT 예시를 포함한다',()=>{
 assert.equal(sampleIdeas.length,3);assert.equal(sampleIdeas[0].name,'다문화 아동 한국어 학습 SaaS');
 for(const sample of sampleIdeas){
  for(const label of ['TAM','SAM','SOM','가정'])assert.ok(sample.market.includes(label));
  for(const label of ['강점','약점','기회','위협','전략'])assert.ok(sample.competition.includes(label));
  for(const [key] of ideaGroups.flatMap(g=>g.fields))assert.ok(sample[key]);
 }
});
test('샘플 복사본은 독립적인 ID와 데이터를 갖고 저장 검증을 통과한다',()=>{
 const a=copySampleIdea(sampleIdeas[0].id),b=copySampleIdea(sampleIdeas[0].id);
 assert.notEqual(a.id,b.id);a.market='내 실제 조사';
 assert.notEqual(sampleIdeas[0].market,a.market);assert.notEqual(b.market,a.market);
 const state=initialState();state.ideas.push(a);assert.equal(validateState(state),true);
 assert.equal(copySampleIdea('unknown'),null);
 const html=ideas({state:initialState()},new URLSearchParams('sample='+sampleIdeas[0].id));
 assert.match(html,/이 샘플로 내 아이디어 시작/);assert.doesNotMatch(html,/data-action="edit-idea-field"/);
});
