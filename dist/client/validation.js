import {escapeHtml as e,inspectIdea} from './domain.js';
import {sampleIdeas} from './sample-ideas.js';
const block=(title,body)=>'<section class="panel validation-panel"><h2>'+title+'</h2>'+body+'</section>';
const text=v=>e(v||'아직 기록하지 않았어요.').replaceAll('\n','<br>');
const hypotheses=[
 ['H2 · 학교 예산으로 도입할 의향이 있는가?','다문화 담당 교사 5명에게 예산 사용 방식과 도입 조건을 인터뷰합니다.'],
 ['H4 · 아동이 스스로 사용할 수 있는가?','초등 2~3학년 아동 3~5명의 10분 사용 과정을 관찰합니다. 기관 협의와 동의를 먼저 준비합니다.'],
 ['H3 · 교과 어휘 학습이 도움이 되는가?','교과 단어와 일상 단어의 샘플 학습지를 교사에게 보여주고 반응을 비교합니다.']
];
const steps=['담당 교사 5명 인터뷰로 학교 도입 조건 확인','외국 출신 보호자 5명 인터뷰로 반복되는 불편 확인','한 학교에서 소규모 파일럿을 준비하고 학습 완료율·교사 반응 확인','교육청 담당자와 구독 서비스에 사용할 수 있는 예산 항목 확인','소개서로 신청 의향을 확인하고 실제 구매와 구분해 기록'];
export function validationPage(ctx,params){
 const saved=ctx.state.ideas.find(i=>i.id===params.get('id'));
 const sample=sampleIdeas.find(i=>i.id===params.get('sample'))||(!saved?sampleIdeas[0]:null);
 const i=saved||sample,reference=!saved&&i.id==='multicultural-learning',report=inspectIdea(i);
 const query=saved?'id='+encodeURIComponent(i.id):'sample='+i.id;
 const tab=params.get('tab')||'diagnosis',focus=params.get('focus')||'customer';
 const edit=saved?'#drafts?idea='+i.id:'#drafts?sample='+i.id;
 const categories=[['customer','고객'],['model','수익 모델'],['market','시장'],['competition','경쟁'],['finance','재무'],['risks','리스크'],['legal','법·규제']];
 const link=(t,f='')=>'#ideas?'+query+'&tab='+t+(f?'&focus='+f:'');
 const options=ctx.state.ideas.map(x=>'<option value="saved:'+e(x.id)+'" '+(saved?.id===x.id?'selected':'')+'>'+e(x.name)+'</option>').join('');
 const sampleOptions=sampleIdeas.map(x=>'<option value="sample:'+x.id+'" '+(!saved&&i.id===x.id?'selected':'')+'>'+e(x.name)+'</option>').join('');
 const summary=reference?'다문화 아동의 교과 어휘 학습과 보호자의 학습 지원 부담을 문제로 보고, 가정 구독보다 학교·교육지원청의 기관 구독을 먼저 검증하는 방향입니다.':'기록한 고객의 문제와 비용 지불 주체를 연결해 검증하세요. 현재 입력 내용만으로 사업 가능성을 확정하지 않습니다.';
 const diagnosis=block('종합 판정 · 근거 확인','<div class="verdict-options"><span>No-go</span><span>Pivot</span><span>Go</span></div><h3>판정 준비 중</h3><p>고객의 구매 의사와 시장·경쟁·비용 근거를 확인한 뒤 판단합니다.</p><div class="validation-summary"><strong>지금까지의 결론</strong><p>'+summary+'</p></div>'+
 (reference?'<p class="source-note">와이어프레임 참고값: 고객 신뢰도 0.45 · 수익 모델 0.46. 이 서비스에서 새로 분석하거나 검증한 값이 아닙니다.</p>':'<p class="source-note">정리한 항목 '+report.filled+'/'+report.total+'개 · 입력 충실도이며 사업성 점수가 아닙니다.</p>'))+
 '<div class="validation-facts">'+[
 ['돈 내는 쪽',reference?'학교·교육청 (B2B)':i.payer||'미입력'],
 ['가격 후보',reference?'연 180만 원 / 학교 1곳 · 와이어프레임의 검증 전 후보':i.revenue||'미입력'],
 ['목표 시장 (SAM)','자료와 산출 근거 검증 필요'],
 ['손익분기·초기 자본','고객 수·비용·자금 근거 확인 필요']
 ].map(([t,b])=>'<section class="panel"><h3>'+t+'</h3><p>'+text(b)+'</p></section>').join('')+'</div>'+
 block('지금 확인해야 할 것',reference?hypotheses.map(([t,b])=>'<div class="validation-task"><span class="badge">검증할 가정</span><h3>'+t+'</h3><p>'+b+'</p></div>').join(''):'<p>'+text(i.risks)+'</p><div class="validation-task"><h3>구매 의사와 실행 가능성을 확인하세요.</h3><p>첫 고객 인터뷰, 기존 대안 비교, 최소 기능 사용 관찰, 가격·예산 확인을 계획하세요.</p></div>')+
 block('분야별 검증 상태','<div class="validation-agents">'+categories.map(([key,t])=>'<a href="'+link('analysis',key)+'"><strong>'+t+'</strong><span>'+(reference&&['customer','model'].includes(key)?'참고 분석 있음':'검증 준비')+'</span><b>→</b></a>').join('')+'</div>')+
 block('다음 행동',reference?'<ol class="validation-steps">'+steps.map(t=>'<li>'+t+'</li>').join(''):'<p>'+text(i.plan)+'</p><a class="btn" href="'+edit+'">실행 계획 정리하기</a>');
 let detail;
 if(focus==='customer'){
 detail=block('고객 분석 · 누가, 어떤 상황에서 필요한가?','<p>'+text(i.problem)+'</p><div class="validation-facts">'+[['첫 공략 고객',i.customer],['쓰는 사람과 돈 내는 사람',i.payer],['지금 쓰는 대안',i.alternatives]].map(([t,b])=>'<section><h3>'+t+'</h3><p>'+text(b)+'</p></section>').join('')+'</div>')+
 (reference?block('해결하려는 일 · JTBD','<p><strong>상황:</strong> 숙제나 시험을 앞두고 모르는 교과 단어가 생겼을 때</p><p><strong>원함:</strong> 아이 스스로 교과 내용을 이해하고 싶다.</p><p><strong>기대 변화:</strong> 학교 수업을 따라가고 자신감을 얻는다.</p>')+
 block('고객 세그먼트 비교','<p class="source-note">와이어프레임의 비교 예시입니다. 실제 고객 조사 결과로 확인해야 합니다.</p><div class="validation-table-wrap"><table><thead><tr><th>고객 후보</th><th>규모</th><th>고통</th><th>지불</th><th>도달</th><th>합계</th></tr></thead><tbody>'+[['초등학교·교육지원청',3,4,4,4,15],['초등 저학년 다문화 가정',4,5,2,3,14],['맞벌이 다문화 가정',2,4,4,2,12],['다문화가족지원센터',2,3,3,3,11]].map(row=>'<tr>'+row.map(v=>'<td>'+v+'</td>').join('')+'</tr>').join('')+'</tbody></table></div><p>기관이 실제로 비용을 지불할 수 있는지와 도입 절차를 우선 확인합니다.</p>')+
 block('대표 고객 · 가상 인물','<div class="validation-facts"><section><h3>지아 · 초등 저학년 아동</h3><p>수업의 교과 어휘 이해와 스스로 하는 짧은 학습이 필요하다는 가정입니다.</p></section><section><h3>민정 · 초등학교 담임 교사</h3><p>개별 지도 시간이 부족하고 학습 현황을 확인하고 싶다는 가정입니다. 학교 예산 신청 절차를 확인합니다.</p></section></div>'):'');
 }else{
 const details={model:['수익 모델',i.revenue],market:['시장 규모·근거',i.market],competition:['경쟁·차별과 SWOT',i.competition+'\n\n'+i.difference],finance:['필요 자금·비용',i.budget],risks:['핵심 가정과 검증 계획',i.risks],legal:['법·규제 확인','서비스의 대상·수집 데이터·운영 방식에 따라 관련 요건을 확인하세요. 아동 대상 서비스라면 기관 협의와 동의, 데이터 수집 범위를 먼저 검토합니다.']};
 const [t,b]=details[focus]||details.model;detail=block(t,'<p>'+text(b)+'</p><p class="source-note">기록한 내용과 참고 예시입니다. 외부 근거와 실제 고객 확인으로 검증하세요.</p>');
 }
 const analysis='<nav class="validation-category-tabs" aria-label="분석 분야">'+categories.map(([key,t])=>'<a class="'+(focus===key?'active':'')+'" href="'+link('analysis',key)+'">'+t+'</a>').join('')+'</nav>'+detail;
 return '<div class="page-intro"><div><span class="eyebrow">MY IDEA VALIDATION</span><h1>내 아이디어, 검증해볼까요?</h1><p>문제와 고객, 수익 방식의 가정을 확인하고 다음 행동을 정리해요.</p></div><a class="btn" href="'+edit+'">AI지원서에서 내용 정리</a></div>'+
 '<div class="validation-selector panel"><label for="validation-idea">검증할 아이디어</label><select id="validation-idea">'+(options?'<optgroup label="내 아이디어">'+options+'</optgroup>':'')+'<optgroup label="작성 예시">'+sampleOptions+'</optgroup></select><span class="badge blue">'+(saved?'내 기록 기준':'와이어프레임 참고 · 작성 예시')+'</span></div>'+
 '<div class="validation-heading"><h2>'+e(i.name)+'</h2><p>'+(saved?'저장한 내용에서 확인할 가정을 정리합니다.':'참고 분석은 검증 전 가정입니다. 실제 조사·AI 분석 결과와 구분해 확인하세요.')+'</p></div>'+
 '<nav class="tabs"><a class="'+(tab!=='analysis'?'active':'')+'" href="'+link('diagnosis')+'">진단</a><a class="'+(tab==='analysis'?'active':'')+'" href="'+link('analysis')+'">분석 상세</a></nav><div class="validation-content">'+(tab==='analysis'?analysis:diagnosis)+'</div>';
}
