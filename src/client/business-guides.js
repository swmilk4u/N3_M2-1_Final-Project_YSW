import {escapeHtml as e} from './domain.js';
export const businessGuides = {
 market: {
  title:'TAM · SAM · SOM 시장 규모 가이드',
  summary:'전체 시장에서 시작해, 우리가 실제로 확보할 고객까지 범위를 좁혀보세요.',
  cards:[
   ['TAM · 전체 시장','우리 제품이 해결하는 문제를 가진 전체 고객의 시장입니다.','어떤 고객을 몇 명 또는 몇 개 기업으로 셀 수 있나요?'],
   ['SAM · 서비스 가능한 시장','지역·고객군·제품 범위·판매 채널을 고려해 실제 서비스할 수 있는 시장입니다.','TAM 중 지금 제품과 채널로 접근 가능한 고객은 누구인가요?'],
   ['SOM · 확보 가능한 시장','정한 기간 안에 영업·마케팅·공급 역량을 고려해 확보할 수 있는 시장입니다.','예를 들어 첫 1년 동안 유료 고객을 몇 명 확보할 수 있나요?']
  ],
  note:'같은 고객 기준·기간·통화로 비교하세요. 시장을 매출액으로 추정할 때는 고객 수 × 고객당 연간 매출을 사용할 수 있습니다. SOM을 단순히 “전체 시장의 1%”로 잡기보다 판매 채널·전환율·처리 가능한 고객 수로 설명하세요.',
  example:'가상의 구독 서비스 계산 예시: 연간 12만 원을 지불하는 고객을 가정하면, 전체 고객 10만 명의 TAM은 연 120억 원, 서비스 가능한 1만 명의 SAM은 연 12억 원, 첫 1년 확보 목표 100명의 SOM은 연 1,200만 원입니다. 실제 시장 통계나 나도사장의 매출 전망이 아닙니다.',
  sources:[['시장·고객 조사 참고 · SBA','https://www.sba.gov/counseling/plan-your-business/'],['시장 규모 개념 참고 · 미시간대학교','https://web.eecs.umich.edu/~sugih/courses/eecs441/f17/12-BMC.pdf']],
  template:'[TAM · SAM · SOM]\n시장 정의 / 고객 단위: \n기준 연도 / 추정 기간 / 통화: \nTAM · 전체 고객 수와 시장 규모: \nSAM · 서비스 가능 범위와 규모: \nSOM · 목표 기간 내 확보 고객과 규모: \n고객당 연간 매출 / 산식: \n판매 채널·전환율·공급 역량의 근거: \n자료 출처 / 발표일 / 확인일: \n확인한 사실과 아직 검증할 가정: '
 },
 swot: {
  title:'SWOT 분석 가이드',
  summary:'우리의 내부 역량과 외부 환경을 구분하고, 실제 실행 전략으로 연결하세요.',
  cards:[
   ['S · 강점 / 내부 요인','고객에게 가치를 주거나 경쟁 대안보다 유리한 보유 역량입니다.','이미 갖춘 기술·경험·고객 관계 중 어떤 강점을 증명할 수 있나요?'],
   ['W · 약점 / 내부 요인','목표를 달성하는 데 부족한 자원이나 역량입니다.','자금·인력·제품·판매 역량에서 무엇을 보완해야 하나요?'],
   ['O · 기회 / 외부 요인','시장이나 환경 변화가 만들어주는 유리한 조건입니다.','고객 수요·기술·제도·유통 변화 중 활용할 기회는 무엇인가요?'],
   ['T · 위협 / 외부 요인','사업에 불리하게 작용할 수 있는 외부 변화입니다.','경쟁 진입·규제·대체재·고객 행동 변화에 어떻게 대응할까요?']
  ],
  note:'강점·약점은 우리 내부, 기회·위협은 외부 환경입니다. 항목마다 근거를 적고, 강점으로 기회를 잡는 방법과 약점·위협을 줄이는 실행 계획을 연결하세요.',
  example:'가상의 지역 예약 서비스 예시: 강점은 팀의 업종 경험, 약점은 부족한 영업 인력, 기회는 해당 지역의 온라인 예약 수요 증가, 위협은 대형 플랫폼 진입입니다. 전략은 경험이 있는 업종부터 작은 실험을 하고 제휴 채널로 영업을 보완하는 것입니다. 수요 증가는 실제 조사로 확인해야 합니다.',
  sources:[['SWOT 개념과 전략 연결 참고 · BDC','https://www.bdc.ca/en/articles-tools/business-strategy-planning/define-strategy/swot-analysis-easy-tool-strategic-planning']],
  template:'[SWOT 분석]\nS · 강점 (내부 / 근거): \nW · 약점 (내부 / 근거): \nO · 기회 (외부 / 근거): \nT · 위협 (외부 / 근거): \n기회를 활용할 전략: \n약점·위협에 대응할 전략: \n우선 실행할 일 / 담당 / 일정: \n확인한 사실과 아직 검증할 가정: '
 }
};
export function guideForField(key){return key==='market'?'market':key==='competition'?'swot':null;}
export function appendGuideTemplate(value,kind){
 const current=String(value??''),guide=businessGuides[kind];
 if(!guide||current.includes(guide.template.split('\n')[0]))return current;
 const next=current+(current?'\n\n':'')+guide.template;
 return next.length<=10000?next:current;
}
export function guideContent(kind){
 const g=businessGuides[kind];if(!g)return '';
 return '<div class="business-guide"><p>'+e(g.summary)+'</p><div class="business-guide-grid">'+g.cards.map(([title,body,question])=>'<section><h3>'+e(title)+'</h3><p>'+e(body)+'</p><p class="guide-question">'+e(question)+'</p></section>').join('')+'</div><p class="guide-note">'+e(g.note)+'</p><details class="guide-example"><summary>가상의 작성 예시 보기</summary><p>'+e(g.example)+'</p></details><p class="source-note">공고에 이 분석이 필수인지, 실제 제출 양식에 어떻게 반영할지는 원문을 확인해주세요.</p><div class="guide-sources">'+g.sources.map(([label,url])=>'<a href="'+url+'" target="_blank" rel="noopener noreferrer">'+e(label)+' ↗</a>').join('')+'</div></div>';
}
export function fieldGuide(key){
 const kind=guideForField(key),g=businessGuides[kind];if(!g)return '';
 return '<details class="field-business-guide"><summary>'+e(g.title)+' · 작성 도움말</summary>'+guideContent(kind)+'<button type="button" class="btn light" data-action="insert-business-template" data-kind="'+kind+'">빈 작성 양식 추가</button><p class="source-note">현재 입력 내용 뒤에 빈 양식을 추가합니다. 저장 버튼을 눌러야 반영됩니다.</p></details>';
}
export function businessGuideLinks(){
 return '<aside class="idea-guide-links"><div><strong>사업계획서, 무엇부터 적을까요?</strong><p>시장 규모와 경쟁 환경을 질문에 따라 정리해보세요.</p></div><div><button type="button" class="btn" data-action="guide" data-kind="market">TAM · SAM · SOM 가이드</button><button type="button" class="btn" data-action="guide" data-kind="swot">SWOT 분석 가이드</button></div></aside>';
}
