export function initialState(){return {profile:{name:'',region:'전국',stage:'예비창업',field:'IT·서비스',age:'',experience:''},ideas:[],drafts:[],bookmarks:[]};}
export function todayKorea(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
export function daysLeft(date,today=todayKorea()){if(!date)return null;return Math.round((Date.parse(date+'T00:00:00Z')-Date.parse(today+'T00:00:00Z'))/86400000);}
export function deadlineLabel(notice){const d=daysLeft(notice.endDate);return d===null?'상시 접수':d<0?'접수 마감':d===0?'오늘 마감':`D-${d}`;}
export function matchNotice(n,p={},idea){
 const checks=[];const region=n.region==='전국'||p.region&&p.region!=='전국'&&(n.region.includes(p.region)||p.region.includes(n.region));
 checks.push({label:'지역',text:n.region,status:region?'match':!p.region||p.region==='전국'?'unknown':n.relocation?'unknown':'mismatch'});
 const stage=n.stages?.includes(p.stage);checks.push({label:'창업 단계',text:n.stages?.join(' · ')||'원문 확인',status:stage?'match':p.stage?'mismatch':'unknown'});
 if(n.ageRange){const a=Number(p.age);checks.push({label:'연령',text:`만 ${n.ageRange[0]}~${n.ageRange[1]}세`,status:!p.age?'unknown':a>=n.ageRange[0]&&a<=n.ageRange[1]?'match':'mismatch'});}
 checks.push({label:'세부 요건',text:n.conditions?.join(' / ')||n.target||'원문 확인 필요',status:'unknown'});
 const interest=n.fields?.includes(idea?.field||p.field);const reasons=[];
 if(region)reasons.push('활동 지역과 맞는 공고예요');if(stage)reasons.push(`${p.stage} 단계에서 검토할 수 있어요`);if(interest)reasons.push('관심 분야와 관련 있어요');
 return {eligible:!checks.some(x=>x.status==='mismatch'),checks,reasons,rank:(region?2:0)+(stage?2:0)+(interest?1:0),label:checks.some(x=>x.status==='mismatch')?'지원 조건 확인':'세부 요건 확인'};
}
export function filterNotices(list,f={},profile={},idea){let result=list.filter(n=>{
 const hay=[n.title,n.organization,n.summary,n.category,...(n.fields||[])].join(' ').toLowerCase();
 return (!f.query||hay.includes(f.query.trim().toLowerCase()))&&(!f.category||f.category==='전체'||n.category===f.category)&&(!f.region||f.region==='전체'||n.region==='전국'||n.region.includes(f.region))&&(!f.savedOnly||(f.saved||[]).includes(n.id))&&(!f.openOnly||daysLeft(n.endDate)===null||daysLeft(n.endDate)>=0);
 });if(f.sort==='deadline')result.sort((a,b)=>(daysLeft(a.endDate)??9999)-(daysLeft(b.endDate)??9999));else result.sort((a,b)=>matchNotice(b,profile,idea).rank-matchNotice(a,profile,idea).rank);return result;}
export const sectionTitles=['문제인식 (Problem)','실현가능성 (Solution)','성장전략 (Scale-up)','팀 구성 (Team)'];
export const ideaGroups=[
 {title:'기본',subtitle:'사업을 한 문장으로',code:'01',fields:[['summary','이름·한 줄 정의'],['field','분야·개발 단계']]},
 {title:'문제·고객',subtitle:'누구의 어떤 문제인가',code:'P',fields:[['problem','문제 정의'],['customer','첫 공략 고객'],['payer','쓰는 사람·돈 내는 사람'],['alternatives','지금 쓰는 대안']]},
 {title:'시장',subtitle:'돈 낼 곳은 얼마나 있나',code:'P',fields:[['market','시장 규모와 근거']]},
 {title:'경쟁·차별',subtitle:'왜 우리여야 하나',code:'S',fields:[['competition','주요 경쟁사·대안'],['difference','고유 가치·차별점']]},
 {title:'제품·실현',subtitle:'어떻게 해결하나',code:'S',fields:[['solution','제품과 해결 방법'],['plan','개발·추진 계획']]},
 {title:'수익모델',subtitle:'어떻게 수익을 만드나',code:'S',fields:[['revenue','수익 방식·가격']]},
 {title:'시장 진입·성장',subtitle:'첫 고객을 어떻게 만날까',code:'S',fields:[['acquisition','고객 확보·판매 채널']]},
 {title:'재무',subtitle:'얼마가 필요한가',code:'S',fields:[['budget','필요 자금·비용']]},
 {title:'팀',subtitle:'누가 함께 실행하나',code:'T',fields:[['team','팀 구성·보유 역량']]},
 {title:'리스크·검증',subtitle:'어떤 가정을 확인해야 하나',code:'V',fields:[['risks','핵심 가정과 검증 계획']]}
];
export function inspectIdea(idea={}){const checks=ideaGroups.flatMap(g=>g.fields.filter(([key])=>key!=='field').map(([key,label])=>({key,label,group:g.title,complete:!!idea[key]?.trim()})));const filled=checks.filter(c=>c.complete).length;return {checks,filled,total:checks.length,score:Math.round(filled/checks.length*100),missing:checks.filter(c=>!c.complete),groups:ideaGroups.map(g=>({title:g.title,filled:g.fields.filter(([key])=>!!idea[key]?.trim()).length,total:g.fields.length}))};}
export function createDraft(n,i,p={}){
 if(!i?.name?.trim())throw new Error('아이디어를 먼저 저장해주세요.');
 const value=(v,placeholder)=>{const text=v?.trim();if(!text)return `[${placeholder}을 입력해주세요]`;return text.length>2200?text.slice(0,2200)+'\n[긴 입력의 앞부분을 불러왔습니다. 전체 원문은 아이템 프로필에서 확인해 보완해주세요]':text;};
 const texts=[
 `사업 아이템: ${i.name}\n${value(i.summary,'사업 한 줄 소개')}\n\n해결하려는 문제\n${value(i.problem,'문제와 고객의 불편')}\n\n목표 고객\n${value(i.customer,'목표 고객')}\n\n현재 대안\n${value(i.alternatives,'고객이 현재 사용하는 대안')}\n\n[고객 인터뷰 또는 문제를 확인한 근거를 추가해주세요]`,
 `제품·서비스의 해결 방법\n${value(i.solution,'제품 또는 서비스')}\n\n차별성\n${value(i.difference,'기존 대안과 비교한 차별점')}\n\n추진 계획\n${value(i.plan,'개발 및 검증 일정')}\n\n[월별 마일스톤과 구현 가능성을 보여줄 근거를 추가해주세요]`,
 `시장과 고객 확보\n${value(i.market,'목표 시장과 근거')}\n${value(i.acquisition,'고객 확보 방법')}\n\n수익 모델\n${value(i.revenue,'수익 모델')}\n\n지원사업: ${n.title}\n지원 내용: ${n.support}\n사업 목적: ${n.summary}\n\n${value(i.budget,'필요 자금과 사용 계획')}\n\n[공고의 지원 목적에 맞춰 자금 활용과 성과 목표를 보완해주세요]`,
 `팀 구성\n${value(i.team,'팀 구성과 역할')}\n\n창업자 보유 역량\n${value(p.experience,'관련 경험과 역량')}\n\n[협력 인력, 부족한 역량의 확보 방법을 추가해주세요]`
 ];
 return {id:globalThis.crypto.randomUUID(),noticeId:n.id,ideaId:i.id,title:`${i.name} · ${n.shortTitle||n.title}`,status:'작성 중',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),sourceUrl:n.url,sections:sectionTitles.map((title,index)=>({title,text:texts[index]})),completed:[]};
}
export function validateState(s){
 if(!s||typeof s!=='object'||!s.profile||typeof s.profile!=='object'||Array.isArray(s.profile))return false;
 if(!['ideas','drafts','bookmarks'].every(k=>Array.isArray(s[k])&&s[k].length<=100))return false;
 if(!Object.values(s.profile).every(v=>typeof v==='string'&&v.length<=10000))return false;
 if(!s.ideas.every(i=>i&&typeof i.id==='string'&&typeof i.name==='string'&&Object.values(i).every(v=>typeof v==='string'&&v.length<=10000)))return false;
 if(!s.drafts.every(d=>d&&typeof d.id==='string'&&typeof d.noticeId==='string'&&typeof d.ideaId==='string'&&['작성 중','검토 중','제출 완료'].includes(d.status)&&Array.isArray(d.sections)&&[4,6].includes(d.sections.length)&&d.sections.every(t=>t&&typeof t==='object'&&typeof t.title==='string'&&typeof t.text==='string'&&t.text.length<=15000)))return false;
 return s.bookmarks.every(v=>typeof v==='string')&&JSON.stringify(s).length<1000000;
}
export function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
