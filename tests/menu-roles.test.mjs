import test from 'node:test';
import assert from 'node:assert/strict';
import {ideas,drafts} from '../src/client/views.js';
import {initialState} from '../src/client/domain.js';
test('MY아이디어는 검증 화면이며 와이어프레임 참고 분석을 보여준다',()=>{
 const state=initialState();const html=ideas({state},new URLSearchParams());
 assert.match(html,/종합 판정/);assert.match(html,/지금 확인해야 할 것/);assert.match(html,/다문화 아동 한국어 학습 SaaS/);
 assert.doesNotMatch(html,/idea-work-grid/);assert.equal(state.ideas.length,0);
});
test('AI지원서 루트는 저장된 지원서가 있어도 작업 목록을 연다',()=>{
 const state=initialState();state.drafts=[{id:'d',title:'기존 지원서',ideaId:'i',sections:[{title:'문항',text:'수정본'}],completed:[]}];
 const html=drafts({state},new URLSearchParams());
 assert.match(html,/내 작업 목록/);assert.doesNotMatch(html,/id="draft-text"/);
 assert.equal(state.drafts[0].sections[0].text,'수정본');
});
