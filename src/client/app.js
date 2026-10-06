import {copySampleIdea} from './sample-ideas.js';
import {businessGuides,guideContent,fieldGuide,appendGuideTemplate} from './business-guides.js';
import {initialState,daysLeft,matchNotice,createDraft,escapeHtml as e,ideaGroups,inspectIdea} from './domain.js';
import {notices,fields} from './notices.js';
import {icon} from './icons.js';
import * as views from './views.js';
const $=s=>document.querySelector(s),act=views.act;
let state=initialState(),revision=0,saveQueue=Promise.resolve(),mutationVersion=0,unsaved=false,saveTimer,toastTimer,pendingNotice=null,previousPath=null;
let profileForm={...state.profile},profileStep=1,calc={...state.profile};
const filters={query:'',category:'전체',region:'전체',savedOnly:false,openOnly:true,sort:'recommended',field:'',stage:'',deadline:'',matchOnly:false,ideaId:''};
function route(){const [path,params]=location.hash.slice(1).split('?');return {path:path||'home',params:new URLSearchParams(params||'')};}
function nav(path){closeModal();if(location.hash==='#'+path)render();else location.hash=path;}
function closeModal(){if($('#modal').open){$('#modal').close();pendingNotice=null;}}
function modal(content){$('#modal').innerHTML=`<div class="modal-content">${content}</div>`;if(!$('#modal').open)$('#modal').showModal();}
function modalHead(title){return `<div class="modal-top"><h2>${title}</h2><button class="icon-btn" type="button" aria-label="닫기" ${act('close')}>${icon('close')}</button></div>`;}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2600);}
function setSaveStatus(text){document.querySelectorAll('.save-status').forEach(el=>el.textContent=text);}
function persist(){const version=++mutationVersion;unsaved=true;setSaveStatus('저장 중…');
 saveQueue=saveQueue.catch(()=>{}).then(async()=>{const response=await fetch('/api/state',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({state:structuredClone(state),revision})});const body=await response.json();if(!response.ok)throw new Error(body.error||'저장하지 못했습니다.');revision=body.revision;if(version===mutationVersion){unsaved=false;setSaveStatus('모든 변경사항 저장됨');$('#save-error').hidden=true;}}).catch(error=>{unsaved=true;setSaveStatus('저장 필요');const box=$('#save-error');box.innerHTML=`${e(error.message)} 입력 내용은 이 화면에 유지됩니다. <button class="btn tiny" ${act('retry-save')}>다시 저장</button><button class="btn tiny" ${act('backup')}>내용 내보내기</button>`;box.hidden=false;throw error;});return saveQueue;}
function safeSave(message){persist().then(()=>message&&toast(message)).catch(()=>{});}
function debounceSave(){mutationVersion++;unsaved=true;setSaveStatus('저장 대기 중');clearTimeout(saveTimer);saveTimer=setTimeout(()=>safeSave(),600);}
function flushSave(){if(saveTimer){clearTimeout(saveTimer);saveTimer=null;safeSave();}}
function render(){const {path,params}=route();if(path==='profile'&&previousPath!=='profile'){profileForm={...state.profile};profileStep=1;}previousPath=path;
 const ctx={state,filters,calc,profileForm,profileStep,unsaved};const d=state.drafts.find(x=>x.id===params.get('id'))||state.drafts.at(-1),n=d&&notices.find(x=>x.id===d.noticeId),editing=path==='drafts'&&!!d;
 const handlers={home:()=>views.home(ctx),notices:()=>views.browse(ctx),notice:()=>views.noticeDetail(notices.find(n=>n.id===params.get('id')),ctx),ideas:()=>views.ideas(ctx,params),profile:()=>views.profile(ctx),drafts:()=>views.drafts(ctx,params),board:()=>views.board(ctx)};
 document.title=({'home':'아이디어에서 창업까지','notices':'공고 찾기','notice':'공고 상세','ideas':'MY아이디어','profile':'창업자 프로필','drafts':'지원서 작성','board':'지원 현황'}[path]||'홈')+' · 나도사장';
 $('#app').innerHTML=(editing?views.editorBar(d,n,unsaved):views.header(path,state))+`<main id="main" class="container ${editing?'editor-page':''}">${(handlers[path]||handlers.home)()}</main>`+(editing?'':views.footer());
}
function prepareDraft(noticeId){pendingNotice=noticeId;flushSave();if(!state.ideas.length){nav('ideas?new=1');toast('지원서에 사용할 아이디어를 먼저 저장해주세요.');return;}const n=notices.find(x=>x.id===noticeId);if(!n)return;modal(`${modalHead('어떤 아이템으로 지원할까요?')}<p class="small muted">${e(n.title)}</p>${state.ideas.map(i=>`<button class="select-idea" ${act('generate',`data-notice="${noticeId}" data-idea="${i.id}"`)}><strong>${icon('idea')} ${e(i.name)}</strong><span>${e(i.summary||'아이템 프로필 '+inspectIdea(i).score+'% 작성')}</span></button>`).join('')}<p class="source-note">저장한 프로필과 아이디어를 공통 PSST 항목에 정리합니다.</p>`);}
function generate(noticeId,ideaId){pendingNotice=null;const n=notices.find(x=>x.id===noticeId),idea=state.ideas.find(x=>x.id===ideaId);if(!n||!idea)return;const existing=state.drafts.find(d=>d.noticeId===noticeId&&d.ideaId===ideaId);if(existing){nav('drafts?id='+existing.id);toast('수정한 내용이 있는 기존 지원서를 열었어요.');return;}
 const draft=createDraft(n,idea,state.profile);state.drafts.push(draft);pendingNotice=null;nav('drafts?id='+draft.id);safeSave('아이템 프로필로 지원서 초안을 만들었어요.');}
function draftText(d){return `${d.title}\n공고 원문: ${d.sourceUrl}\n\n${d.sections.map((s,i)=>`${i+1}. ${s.title}\n\n${s.text}`).join('\n\n────────────────────\n\n')}`;}
function download(text,name,type='text/plain;charset=utf-8'){const blob=new Blob(['\ufeff',text],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function copy(text){try{await navigator.clipboard.writeText(text);toast('복사했어요.');}catch{modal(`${modalHead('내용 복사')}<p class="small muted">아래 내용을 선택해 복사해주세요.</p><textarea class="copy-area" readonly>${e(text)}</textarea>`);$('#modal textarea').select();}}
function editIdeaField(id,key){const idea=state.ideas.find(i=>i.id===id);if(!idea)return;const label=ideaGroups.flatMap(g=>g.fields).find(([k])=>k===key)?.[1]||'아이디어 이름';modal(`${modalHead(label)}<form id="idea-field-form" data-id="${id}" data-key="${key}">${fieldGuide(key)}<div class="field">${key==='field'?`<select name="value" aria-label="창업 분야">${views.opts(fields,idea.field)}</select>`:`<textarea name="value" maxlength="${key==='name'?100:10000}" rows="7" aria-label="${e(label)}" placeholder="직접 확인한 내용과 근거를 적어주세요.">${e(idea[key]||'')}</textarea>`}</div><p class="source-note">변경한 내용은 다음 지원서를 만들 때 활용합니다. 이미 작성한 지원서는 유지됩니다.</p><div class="form-actions"><button type="button" class="btn" ${act('close')}>취소</button><button class="btn primary" type="submit">저장</button></div></form>`);}
const checklist='나도사장 · 지원서 제출 전 체크리스트\n\n□ 신청 기간과 마감 시각 확인\n□ 지역·연령·업력·사업자 요건 확인\n□ 중복 수혜와 제외 대상 확인\n□ 공고 지정 양식과 실제 평가 항목 확인\n□ 문항별 글자 수·페이지 제한 준수\n□ 사업계획의 고객·문제·해결책 일관성 확인\n□ 시장·매출·경력 등의 사실과 출처 확인\n□ 지원금 활용 계획과 예산 기준 확인\n□ 필수 서류와 가점 증빙 준비\n□ 접수 경로·파일 형식·파일명 확인\n□ 기관에 실제 접수 후 접수 완료 기록 보관';
function showGuide(kind){if(businessGuides[kind]){modal(`${modalHead(businessGuides[kind].title)}${guideContent(kind)}`);return;}if(kind==='checklist')modal(`${modalHead('지원서 제출 전 체크리스트')}<div class="guide-text">${e(checklist).replaceAll('\n','<br>')}</div><div class="form-actions"><button class="btn primary" ${act('download-checklist')}>다운로드</button></div>`);else modal(`${modalHead('PSST 사업계획서 작성 가이드')}<div class="guide-text">${[['P · Problem','누구의 어떤 문제인지, 기존 대안은 왜 충분하지 않은지 적습니다. 인터뷰·통계 등 확인한 근거를 붙여주세요.'],['S · Solution','제품과 핵심 기능, 개발 방법, 차별성과 일정·목표를 구체화합니다. 현재 구현한 것과 계획을 구분하세요.'],['S · Scale-up','목표 시장, 수익 방식, 고객 확보 계획과 지원금 사용 계획을 연결합니다. 숫자에는 산출 근거가 필요합니다.'],['T · Team','역할별 경험과 보유 역량, 협력 인력과 부족한 역량의 확보 계획을 정리합니다.']].map(([t,b])=>`<h3>${t}</h3><p>${b}</p>`).join('')}<p class="source-note">이 안내는 공통 작성 가이드입니다. 실제 공고의 지정 양식과 평가기준을 우선하세요.</p></div>`);}
function updateCounts(text){if($('#count-with'))$('#count-with').textContent=text.length.toLocaleString();if($('#count-without'))$('#count-without').textContent=text.replace(/\s/g,'').length.toLocaleString();if($('#placeholder-count'))$('#placeholder-count').textContent=(text.match(/\[[^\]]+\]/g)||[]).length+'곳';}
document.addEventListener('click',event=>{const el=event.target.closest('[data-action]');if(!el)return;event.preventDefault();const name=el.dataset.action,id=el.dataset.id;
 if(name==='nav'){flushSave();nav(el.dataset.path);}else if(name==='close')closeModal();else if(name==='new-idea')nav('ideas?new=1');
 else if(name==='use-sample'){if(state.ideas.length>=100){toast('아이디어는 최대 100개까지 저장할 수 있어요.');return;}const idea=copySampleIdea(id);if(!idea)return;state.ideas.push(idea);persist().then(()=>{nav('ideas?id='+idea.id);toast('샘플을 내 초안으로 복사했어요. 예시 내용을 수정해주세요.');}).catch(()=>{});}
 else if(name==='bookmark'){state.bookmarks=state.bookmarks.includes(id)?state.bookmarks.filter(x=>x!==id):[...state.bookmarks,id];safeSave();render();}
 else if(name==='category'){filters.category=el.dataset.value;render();}else if(name==='reset-filters'){Object.assign(filters,{query:'',category:'전체',region:'전체',savedOnly:false,openOnly:true,sort:'recommended',field:'',stage:'',deadline:'',matchOnly:false,ideaId:''});render();}
 else if(name==='notice-mode'){filters.savedOnly=el.dataset.saved==='1';filters.matchOnly=false;render();}
 else if(name==='calculator-results'){filters.matchOnly=true;filters.savedOnly=false;filters.query='';nav('notices');}
 else if(name==='idea-notices'){filters.ideaId=id;filters.sort='recommended';filters.matchOnly=false;filters.savedOnly=false;nav('notices');}
 else if(name==='prepare-draft')prepareDraft(id);else if(name==='generate')generate(el.dataset.notice,el.dataset.idea);else if(name==='edit-idea-field')editIdeaField(id,el.dataset.key);
 else if(name==='profile-prev'){Object.assign(profileForm,Object.fromEntries(new FormData($('#profile-form'))));profileStep=Math.max(1,profileStep-1);render();}
 else if(name==='editor-section'){flushSave();nav(`drafts?id=${id}&section=${el.dataset.index}`);}
 else if(name==='complete-section'){const d=state.drafts.find(x=>x.id===id),index=Number(el.dataset.index);d.completed=[...new Set([...(d.completed||[]),index])];d.updatedAt=new Date().toISOString();clearTimeout(saveTimer);if(index===d.sections.length-1)d.status='검토 중';safeSave();nav(index===d.sections.length-1?'board':`drafts?id=${id}&section=${index+1}`);toast(index===d.sections.length-1?'지원서를 검토 중으로 옮겼어요.':'문항을 완료로 표시했어요.');}
 else if(name==='insert-checklist'){const d=state.drafts.find(x=>x.id===id),index=Number(el.dataset.index);const note='\n\n[보완 점검]\n□ 공고 원문의 문항과 분량 확인\n□ 수치·실적·경력의 근거 확인\n□ 고객과 추진 계획의 일관성 확인';if(d.sections[index].text.length+note.length>15000){toast('문항은 15,000자까지 저장할 수 있어요. 내용을 줄인 뒤 추가해주세요.');return;}d.sections[index].text+=note;$('#draft-text').value=d.sections[index].text;d.updatedAt=new Date().toISOString();updateCounts(d.sections[index].text);debounceSave();toast('문항 끝에 보완 체크리스트를 추가했어요.');}
 else if(name==='save-draft'){clearTimeout(saveTimer);safeSave('지원서를 저장했어요.');}else if(name==='retry-save')safeSave('변경사항을 저장했어요.');
 else if(name==='backup')download(JSON.stringify(state,null,2),'나도사장_백업.json','application/json');
 else if(name==='copy-section'){const d=state.drafts.find(x=>x.id===id);copy(d.sections[Number(el.dataset.index)].text);}
 else if(name==='copy-draft')copy(draftText(state.drafts.find(x=>x.id===id)));
 else if(name==='download-draft'){const d=state.drafts.find(x=>x.id===id);download(draftText(d),d.title.replace(/[\\/:*?"<>|]/g,'_')+'.txt');toast('지원서를 다운로드했어요.');}
 else if(name==='insert-business-template'){const area=$('#idea-field-form textarea');if(!area)return;const next=appendGuideTemplate(area.value,el.dataset.kind);if(next===area.value){toast('양식이 이미 있거나 입력 가능한 길이를 초과합니다.');return;}area.value=next;el.closest('details').open=false;area.focus();toast('빈 작성 양식을 추가했어요. 내용을 채운 뒤 저장해주세요.');}
 else if(name==='guide')showGuide(el.dataset.kind);else if(name==='download-checklist'){download(checklist,'나도사장_지원서_체크리스트.txt');toast('체크리스트를 다운로드했어요.');}
});
document.addEventListener('submit',async event=>{const form=event.target;
 if(form.id==='search-form'){event.preventDefault();filters.query=new FormData(form).get('query').trim();render();}
 if(form.id==='profile-form'){event.preventDefault();Object.assign(profileForm,Object.fromEntries(new FormData(form)));if(profileStep<3){profileStep++;render();return;}state.profile={...profileForm};await persist().then(()=>{calc={...state.profile};toast('창업자 프로필을 저장했어요.');nav('ideas');}).catch(()=>{});}
 if(form.id==='new-idea-form'){event.preventDefault();const values=Object.fromEntries(new FormData(form));if(!values.name.trim()){toast('아이디어 이름을 입력해주세요.');return;}const now=new Date().toISOString();const idea={...Object.fromEntries(ideaGroups.flatMap(g=>g.fields.map(([key])=>[key,'']))),...values,name:values.name.trim(),field:state.profile.field,id:crypto.randomUUID(),createdAt:now,updatedAt:now};state.ideas.push(idea);await persist().then(()=>{toast('아이템 프로필을 만들었어요.');if(pendingNotice)prepareDraft(pendingNotice);else nav('ideas?id='+idea.id);}).catch(()=>{});}
 if(form.id==='idea-field-form'){event.preventDefault();const idea=state.ideas.find(i=>i.id===form.dataset.id);idea[form.dataset.key]=String(new FormData(form).get('value')).trim();idea.updatedAt=new Date().toISOString();await persist().then(()=>{closeModal();render();toast('아이템 프로필을 수정했어요.');}).catch(()=>{});}
});
document.addEventListener('change',async event=>{const t=event.target;
 const map={'filter-region':'region','filter-sort':'sort','filter-field':'field','filter-stage':'stage','filter-deadline':'deadline'};if(map[t.id]){filters[map[t.id]]=['전체',''].includes(t.value)?t.id==='filter-region'?'전체':'':t.value;render();}
 if(t.id==='filter-open'){filters.openOnly=t.checked;render();}
 if(t.id==='calc-region'||t.id==='calc-stage'){calc[t.id==='calc-region'?'region':'stage']=t.value;$('#calc-count').innerHTML=notices.filter(n=>matchNotice(n,calc).eligible&&!(daysLeft(n.endDate)<0)).length+'<small>개</small>';}
 if(t.id==='select-draft'){flushSave();nav('drafts?id='+t.value);}
 if(t.id==='draft-status'||t.dataset.boardStatus){const d=state.drafts.find(x=>x.id===(t.dataset.id||t.dataset.boardStatus));d.status=t.value;d.updatedAt=new Date().toISOString();safeSave('지원 준비 상태를 변경했어요.');if(t.dataset.boardStatus)render();}
 if(t.id==='idea-import'){const file=t.files[0];if(!file)return;if(file.size>100000){toast('100KB 이하의 텍스트 파일을 선택해주세요.');return;}try{$('#idea-description').value=(await file.text()).slice(0,5000);document.querySelector('[data-count-for="idea-description"]').textContent=$('#idea-description').value.length+' / 5,000자';toast('메모 내용을 불러왔어요.');}catch{toast('파일을 읽지 못했습니다.');}}
});
document.addEventListener('input',event=>{const t=event.target;if(t.id==='calc-age'){calc.age=t.value;if($('#calc-count'))$('#calc-count').innerHTML=notices.filter(n=>matchNotice(n,calc).eligible&&!(daysLeft(n.endDate)<0)).length+'<small>개</small>';}
 if(t.id==='idea-description')document.querySelector('[data-count-for="idea-description"]').textContent=t.value.length+' / 5,000자';
 if(t.dataset.draft){const d=state.drafts.find(x=>x.id===t.dataset.draft),index=Number(t.dataset.section);d.sections[index].text=t.value;d.completed=(d.completed||[]).filter(x=>x!==index);d.updatedAt=new Date().toISOString();updateCounts(t.value);debounceSave();}
});
$('#modal').addEventListener('click',event=>{if(event.target!==$('#modal'))return;const r=$('#modal').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeModal();});
window.addEventListener('hashchange',()=>{flushSave();closeModal();render();window.scrollTo(0,0);});window.addEventListener('beforeunload',event=>{if(unsaved){event.preventDefault();event.returnValue='';}});
async function init(){try{const response=await fetch('/api/state');if(!response.ok)throw new Error('저장한 정보를 불러오지 못했습니다.');const data=await response.json();state=data.state;revision=data.revision;calc={...state.profile};profileForm={...state.profile};render();}catch(error){$('#app').innerHTML=views.header('',state)+`<main class="container">${views.empty('잠시 연결을 확인해주세요',e(error.message),'data-action="reload"','다시 불러오기','clock')}</main>`;document.querySelector('[data-action="reload"]').onclick=()=>location.reload();}}
init();
