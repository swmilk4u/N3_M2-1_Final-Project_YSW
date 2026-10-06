import test from 'node:test';
import assert from 'node:assert/strict';
import {appendGuideTemplate,guideForField} from '../src/client/business-guides.js';
test('작성한 내용을 유지하면서 빈 가이드 양식만 추가한다',()=>{
 const original='실제 고객 인터뷰 기록\n기존 수치: 12';
 const value=appendGuideTemplate(original,'market');
 assert.ok(value.startsWith(original+'\n\n'));
 assert.match(value,/TAM/);assert.match(value,/SAM/);assert.match(value,/SOM/);
 assert.match(value,/출처/);assert.match(value,/기준/);
 assert.equal(appendGuideTemplate(value,'market'),value);
});
test('SWOT은 내부 강약점과 외부 기회위협을 구분하고 모르는 가이드는 추가하지 않는다',()=>{
 const value=appendGuideTemplate('','swot');
 for(const label of ['강점','약점','기회','위협','전략'])assert.ok(value.includes(label));
 assert.equal(appendGuideTemplate('기존','unknown'),'기존');
 assert.equal(guideForField('market'),'market');assert.equal(guideForField('competition'),'swot');
 assert.equal(guideForField('name'),null);
});
test('입력 제한을 넘으면 기존 내용을 보존한다',()=>{
 const original='가'.repeat(9990);
 assert.equal(appendGuideTemplate(original,'market'),original);
});
