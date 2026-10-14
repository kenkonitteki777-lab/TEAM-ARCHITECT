import {mountAiInterview} from './ai-interview.js?v=20261014-auth1';
import {FIXES,weakQuestions,selectPracticeQuestion,recordOralPractice,weaknessSummary} from './rehearsal.js?v=20261012-practice1';
import {createInterviewVoicePlayer as createVoicePlayer} from './interview-voice-player.js?v=20261014-distinct1';
import {VOICE_SAMPLE} from './voice-catalog.js?v=20261014-distinct1';
import {PRESIDENT_PROFILE} from './interviewer-profile.js';
import {QUESTIONS as Q} from './questions.js?v=20261007-profile2';
import {emptyState,validateBackup,mergeBackup,WEAKNESSES} from './engine.js';
import {MODEL_KEY,DRAFT_KEY,emptyModels,validateModels,mergeModels,setModel,persistModels} from './model-store.js';
const $=id=>document.getElementById(id),KEY='team_architect_interview_v3',POSITION='team_architect_reader_question';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let practice=null,practiceTimer=null,savingPractice=false;
let state=emptyState(),models=emptyModels(),idb=null,index=0,pool=Q,toastTimer,revealed=false,ready=false,editKey=null,modelDrafts={},damagedModels=null,interviewFilter='all';
function get(k){try{return localStorage.getItem(k)}catch{return null}}
function toast(text){$('toast').textContent=text;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,3500)}
function modelText(q,n=null){return models.entries[n===null?q.id:q.id+':f'+n]?.text??(n===null?q.answer:q.followups[n].answer)}
function answer(text){const filled=text.replace(/【要確認：([^】]+)】/g,(all,key)=>{const f=state.facts[key];return f?.value&&f.source&&f.date?f.value+'（本人登録・'+f.date+'）':all});return esc(filled).replace(/【要確認：[^】]+】/g,m=>`<span class="confirmation">${m}</span>`)}
const VOICE_KEY='team_architect_interview_voice_v1';
let voicePreferences={auto:false,department:'',president:'',rate:1,departmentPitch:.86,presidentPitch:.96};
try{const v=JSON.parse(get(VOICE_KEY)||'null');if(v&&typeof v==='object')voicePreferences={auto:v.auto===true,department:typeof v.department==='string'?v.department:'',president:typeof v.president==='string'?v.president:'',rate:[.85,1,1.15].includes(v.rate)?v.rate:1,departmentPitch:[.86,.96,1.08].includes(v.departmentPitch)?v.departmentPitch:.86,presidentPitch:[.86,.96,1.08].includes(v.presidentPitch)?v.presidentPitch:.96}}catch{}
const speech=createVoicePlayer({synth:window.speechSynthesis,Utterance:window.SpeechSynthesisUtterance,onError:toast,onChange:key=>{
 $('readQuestion').setAttribute('aria-pressed',String(key==='question'));$('readQuestion').innerHTML=key==='question'?'<span aria-hidden="true">■</span> 読み上げ停止':'<span aria-hidden="true">▷</span> 質問を聞く';
 $('readAnswer').setAttribute('aria-pressed',String(key==='answer'));$('readAnswer').textContent=key==='answer'?'停止する':'解答を聞く';
 document.querySelectorAll('[data-read-followup]').forEach(b=>{const playing=key==='followup'+b.dataset.readFollowup;b.setAttribute('aria-pressed',String(playing));b.textContent=playing?'停止する':'追撃を聞く'});
}});
function voiceOptions(key){const role=pool[index].m==='pres'?'president':'department';return {key,role,voiceURI:voicePreferences[role],rate:voicePreferences.rate,pitch:voicePreferences[role+'Pitch']}}
function saveVoice(){try{localStorage.setItem(VOICE_KEY,JSON.stringify(voicePreferences))}catch{toast('音声設定は今回のみ有効です。端末に保存できません。')}}
function updateVoices(){const voices=speech.voices();for(const role of ['department','president']){$(role+'Voice').innerHTML='<option value="">端末の標準音声</option>'+voices.map(v=>`<option value="${esc(v.voiceURI)}">${esc(v.name)}</option>`).join('');$(role+'Voice').value=voices.some(v=>v.voiceURI===voicePreferences[role])?voicePreferences[role]:''}
 $('voiceAvailability').textContent=speech.supported?(voices.length?'質問・想定追撃は面接官別の男性音声。自由なAI追撃・解答用の端末音声：'+voices.length+'種類。':'質問・想定追撃は専用音声で聞けます。自由なAI追撃・解答用の端末音声は読み込み待ち、または未インストールです。'):'このブラウザーでは読み上げを利用できません。';}
$('readQuestion').disabled=!speech.supported;$('readAnswer').disabled=!speech.supported;$('autoVoice').disabled=!speech.supported;$('previewVoice').disabled=!speech.supported;
$('autoVoice').checked=voicePreferences.auto;
$('readQuestion').onclick=()=>speech.toggle($('question').textContent,voiceOptions('question'));
$('readAnswer').onclick=()=>speech.toggle($('answer').textContent.replace(/【要確認：([^】]+)】/g,'要確認、$1'),voiceOptions('answer'));
$('autoVoice').onchange=()=>{voicePreferences.auto=$('autoVoice').checked;saveVoice();if(voicePreferences.auto)speech.play($('question').textContent,voiceOptions('question'));else speech.stop()};
$('openVoice').onclick=()=>{speech.stop();updateVoices();$('voiceRate').value=String(voicePreferences.rate);for(const role of ['department','president'])$(role+'Pitch').value=String(voicePreferences[role+'Pitch']);$('voiceSettings').showModal()};$('closeVoice').onclick=()=>$('voiceSettings').close();$('voiceSettings').addEventListener('close',()=>speech.stop());
for(const role of ['department','president'])$(role+'Voice').onchange=()=>{speech.stop();voicePreferences[role]=$(role+'Voice').value;saveVoice()};
$('voiceRate').onchange=()=>{speech.stop();voicePreferences.rate=Number($('voiceRate').value);saveVoice()};$('previewVoice').onclick=()=>speech.toggle(pool[index].q,voiceOptions('preview'));
for(const role of ['department','president']){$(role+'Pitch').onchange=()=>{speech.stop();voicePreferences[role+'Pitch']=Number($(role+'Pitch').value);saveVoice()};$('preview'+(role==='department'?'Department':'President')).onclick=()=>speech.toggle(VOICE_SAMPLE,{key:'preview-'+role,role,voiceURI:voicePreferences[role],rate:voicePreferences.rate,pitch:voicePreferences[role+'Pitch']})}
window.speechSynthesis?.addEventListener('voiceschanged',updateVoices);
document.addEventListener('visibilitychange',()=>{if(document.hidden)speech.stop()});window.addEventListener('pagehide',()=>speech.stop());
function paintAnswer(){
 const q=pool[index];$('answer').innerHTML=answer(modelText(q));$('answerOrigin').textContent=models.entries[q.id]?'本人登録':'回答案';
 $('followups').innerHTML=q.followups.map((f,i)=>`<details><summary>追撃：${esc(f.q)}</summary><p>${answer(modelText(q,i))}</p><button class="edit-button read-followup" data-read-followup="${i}" aria-pressed="false" ${speech.supported?'':'disabled'}>追撃を聞く</button><button class="edit-button" data-followup="${i}">この追撃回答を編集 ↗</button></details>`).join('');
 $('followups').querySelectorAll('[data-read-followup]').forEach(b=>b.onclick=()=>speech.toggle(q.followups[Number(b.dataset.readFollowup)].q,voiceOptions('followup'+b.dataset.readFollowup)));
 $('followups').querySelectorAll('[data-followup]').forEach(b=>b.onclick=()=>openEditor(Number(b.dataset.followup)));
 $('answerCore').textContent='回答の核：'+q.core;$('answerIntent').textContent='確認される点：'+q.intent;
 $('provenance').textContent=models.entries[q.id]?'本人登録 · '+new Date(models.entries[q.id].updatedAt).toLocaleDateString('ja-JP'):q.status+' · '+q.src;
}
function toggleAnswer(value=!revealed){if(!value)speech.stop();revealed=value;$('modelPanel').hidden=!revealed;$('recallHint').hidden=revealed;$('reveal').setAttribute('aria-expanded',String(revealed));$('reveal').innerHTML=revealed?'<span class="action-label">解答を隠す<small aria-hidden="true">HIDE ANSWER</small></span><span aria-hidden="true">−</span>':'<span class="action-label">模範解答を見る<small aria-hidden="true">REVEAL ANSWER</small></span><span aria-hidden="true">＋</span>';}
function render(){
 speech.stop();$('stageLabel').innerHTML='QUESTION <span id="questionId"></span>';
 const q=pool[index];$('category').textContent=q.category;$('position').textContent=String(index+1).padStart(2,'0')+' / '+String(pool.length).padStart(2,'0');$('questionId').textContent=q.id.slice(1);$('question').textContent=q.q;$('progressBar').style.width=((index+1)/pool.length*100)+'%';
 const president=q.m==='pres';document.querySelectorAll('button[data-interviewer]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.interviewer===(president?'president':'department'))));$('practiceHint').textContent=president?'社長面接 · 結論 → 根拠 → 行動':'部長面接 · 経験 → 学び → 店長としての行動';document.body.dataset.interviewer=president?'president':'department';
 $('interviewerLabel').textContent=president?'社長面接':'部長面接';$('coach').setAttribute('aria-label',president?'社長をイメージした面接キャラクター':'部長面接のシルエット');
 const source=president?'./assets/president-koh-han-v1.webp':'./assets/department-noir-v1.webp';if($('coachImage').getAttribute('src')!==source)$('coachImage').src=source;
 $('coachImage').alt=president?'社長を参考にしたイメージイラスト':'部長面接のシルエット';
 $('coachRole').textContent=president?'PRESIDENT':'DIRECTOR';$('coachName').textContent=president?'社長':'部長';$('coachMotto').textContent=president?'結論から、短く、強く。':'ひよらない強さ。';$('coach').title=president?'公開プロフィール写真を参考にした練習用イラスト':'部長面接の練習用シルエット';
 paintAnswer();toggleAnswer(false);$('prev').disabled=index===0;$('next').setAttribute('aria-label',index===pool.length-1?'最初の質問へ':'次の質問');$('next').innerHTML=index===pool.length-1?'<span>最初へ</span><span aria-hidden="true">↻</span>':'<span>次へ</span><span aria-hidden="true">→</span>';try{localStorage.setItem(POSITION,q.id);localStorage.setItem(POSITION+'_'+(president?'president':'department'),q.id)}catch{}
}
function selectInterviewer(mode){
 if(savingPractice)return;endPractice();
 interviewFilter=mode;$('search').value='';$('categoryFilter').value='';pool=Q.filter(q=>mode==='president'?q.m==='pres':q.m!=='pres');const previous=get(POSITION+'_'+mode);index=Math.max(0,pool.findIndex(q=>q.id===previous));document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));render();if(voicePreferences.auto)speech.play(pool[index].q,voiceOptions('question'));renderList();window.scrollTo({top:0,behavior:'instant'});
}
document.querySelectorAll('button[data-interviewer]').forEach(b=>b.onclick=()=>selectInterviewer(b.dataset.interviewer));
$('profileContent').innerHTML=`<p class="profile-note">${esc(PRESIDENT_PROFILE.note)}</p><h3>公開発言で確認できる経営姿勢</h3>${PRESIDENT_PROFILE.evidence.map(e=>`<article class="profile-axis"><strong>${esc(e.axis)}</strong><p>${esc(e.detail)}</p><a href="${PRESIDENT_PROFILE.sources[e.source].url}" target="_blank" rel="noopener noreferrer">公式資料 ↗</a></article>`).join('')}<h3>あなたが指定した練習条件</h3><p>${esc(PRESIDENT_PROFILE.training)}</p><h3>問答への落とし込み</h3><p>${esc(PRESIDENT_PROFILE.inference)}</p><p class="muted">資料確認日：${PRESIDENT_PROFILE.checkedAt} · 本人登録の模範解答は優先して表示します。</p>`;
$('openProfile').onclick=()=>(speech.stop(),$('profile').showModal());$('closeProfile').onclick=()=>$('profile').close();
function move(step){if(practice)return;if(step<0&&index===0)return;index=(index+step+pool.length)%pool.length;render();if(voicePreferences.auto)speech.play(pool[index].q,voiceOptions('question'));window.scrollTo({top:0,behavior:'instant'})}
function filtered(){const term=$('search').value.trim().toLocaleLowerCase(),cat=$('categoryFilter').value;return Q.filter(q=>(interviewFilter==='all'||(interviewFilter==='president'?q.m==='pres':q.m!=='pres'))&&(!cat||q.category===cat)&&(!term||(q.q+' '+modelText(q)+' '+q.core).toLocaleLowerCase().includes(term)))}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{interviewFilter=b.dataset.mode;document.querySelectorAll('[data-mode]').forEach(tab=>tab.setAttribute('aria-pressed',String(tab===b)));renderList()});
function renderList(){const weak=weakQuestions(Q,state);$('weakCount').textContent='苦手 '+weak.length+'問';$('startReview').disabled=!weak.length;const list=filtered();$('resultCount').textContent=`${list.length}問`;$('questionList').innerHTML=list.length?list.map(q=>`<button class="question-row" data-id="${q.id}" aria-current="${q.id===pool[index].id}"><span class="index">${q.id.slice(1)}</span><span>${esc(q.q)}<small>${esc(q.category)}${models.entries[q.id]?' · 本人登録':''}${state.records[q.id]?.grade==='weak'?' · 要復習':''}</small></span></button>`).join(''):'<p class="muted">一致する質問がありません。</p>';$('questionList').querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{endPractice();pool=list;index=pool.findIndex(q=>q.id===b.dataset.id);render();$('navigation').close();window.scrollTo({top:0,behavior:'instant'})})}
function history(){$('storageDetail').textContent=`本人登録 ${Object.keys(models.entries).length}件 · 過去の回答履歴 ${state.history.length}件。バックアップには編集した模範解答も含まれます。`;$('history').innerHTML=state.history.length?state.history.slice(-100).reverse().map(r=>`<article class="history-entry"><small>${esc(new Date(r.updatedAt).toLocaleString('ja-JP'))}</small><h3>${esc(r.prompt||Q.find(q=>q.id===r.questionId)?.q)}</h3><p>${r.answer?esc(r.answer):'口頭練習 · 自己評価：'+(r.grade==='good'?'できた':esc((r.weaknesses||[]).join('・')))+' · '+r.seconds+'秒（手動計測）'}</p></article>`).join(''):'<p class="muted">保存された回答履歴はありません。</p>'}
function snapshot(key,value){return new Promise((resolve,reject)=>{if(!idb){resolve();return}const tx=idb.transaction('snapshots','readwrite');tx.objectStore('snapshots').put(structuredClone(value),key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}
function readSnapshot(key){return new Promise((resolve,reject)=>{const r=idb.transaction('snapshots','readonly').objectStore('snapshots').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function init(){
 try{const raw=get(KEY);if(raw)state=validateBackup(JSON.parse(raw),Q)}catch{toast('既存履歴を読み取れません。保存内容はそのまま保持しています。')}
 for(const q of Q){const a=get('interview_actual_'+q.q),g=get('interview_grade_'+q.q);if((a||g)&&!state.records[q.id]){const now=new Date(0).toISOString();state.records[q.id]={answer:a||'',grade:g||null,weaknesses:[],updatedAt:now};if(a)state.history.push({id:'legacy-'+q.id,questionId:q.id,prompt:q.q,answer:a,mode:q.m,seconds:0,updatedAt:now,kind:'answer',weaknesses:[]})}}
 try{const raw=get(MODEL_KEY);if(raw)models=validateModels(JSON.parse(raw),Q)}catch{damagedModels=get(MODEL_KEY);toast('模範解答の保存データを読み取れません。元データを保持しています。')}
 try{const raw=JSON.parse(get(DRAFT_KEY)||'{}');if(raw&&typeof raw==='object'&&!Array.isArray(raw))for(const [k,v]of Object.entries(raw))if(/^q\d{3}(?::f\d)?$/.test(k)&&typeof v==='string'&&v.length<=12000)modelDrafts[k]=v}catch{}
 paintAnswer();history();
 try{idb=await new Promise((resolve,reject)=>{const r=indexedDB.open('team-architect-interview',1);r.onupgradeneeded=()=>r.result.createObjectStore('snapshots');r.onerror=()=>reject(r.error);r.onsuccess=()=>resolve(r.result)});const copies=await Promise.allSettled([readSnapshot('current'),readSnapshot('modelAnswers')]);try{if(copies[0].status==='fulfilled'&&copies[0].value)state=mergeBackup(state,validateBackup(copies[0].value,Q))}catch{}try{if(copies[1].status==='fulfilled'&&copies[1].value)models=mergeModels(models,validateModels(copies[1].value,Q))}catch{}}catch{}
 ready=true;$('saveModel').disabled=false;paintAnswer();history();
}
function openEditor(n=null){
 if(!ready){toast('保存データを読み込み中です。少しお待ちください。');return}
 const q=pool[index];editKey=n===null?q.id:q.id+':f'+n;$('editorQuestion').textContent=n===null?q.q:q.followups[n].q;$('modelText').value=modelDrafts[editKey]??modelText(q,n);$('draftStatus').textContent=Object.hasOwn(modelDrafts,editKey)?'編集中の下書きを復元':'元の回答案も保持されます';$('editChars').textContent=$('modelText').value.length+' / 12,000字';speech.stop();$('editor').showModal();
}
$('modelText').oninput=()=>{modelDrafts[editKey]=$('modelText').value;try{localStorage.setItem(DRAFT_KEY,JSON.stringify(modelDrafts));$('draftStatus').textContent='下書き保存済み'}catch{$('draftStatus').textContent='下書き保存不可：保存またはコピーしてください'}$('editChars').textContent=$('modelText').value.length+' / 12,000字'};
$('saveModel').onclick=async()=>{
 if(!ready||!editKey)return;const key=editKey,value=$('modelText').value;$('saveModel').disabled=true;
 try{
  let current=models;const raw=get(MODEL_KEY);
  if(raw){try{current=mergeModels(models,validateModels(JSON.parse(raw),Q))}catch{damagedModels=raw}}
  if(damagedModels){localStorage.setItem(MODEL_KEY+'_recovery_'+Date.now(),damagedModels)}
  const next=setModel(current,key,value);persistModels(localStorage,next);models=next;damagedModels=null;
  delete modelDrafts[key];try{localStorage.setItem(DRAFT_KEY,JSON.stringify(modelDrafts))}catch{}
  let duplicate=true;try{await snapshot('modelAnswers',models)}catch{duplicate=false}
  paintAnswer();toggleAnswer(true);if(practice)paintPractice();history();$('editor').close();toast(duplicate?'模範解答を保存しました。':'端末には保存済み。追加保存に失敗したためバックアップを推奨します。');
 }catch(e){toast('保存できません：'+(e.message||'コピーして保持してください。'))}finally{$('saveModel').disabled=false}
};
$('closeEditor').onclick=()=>$('editor').close();$('editAnswer').onclick=()=>openEditor();$('reveal').onclick=()=>practice?advancePractice():toggleAnswer();$('prev').onclick=()=>move(-1);$('next').onclick=()=>move(1);
$('openMenu').onclick=()=>{if(savingPractice)return;renderList();history();(speech.stop(),$('navigation').showModal())};$('closeMenu').onclick=()=>$('navigation').close();
$('navigation').addEventListener('click',e=>{if(e.target===$('navigation')){const r=$('navigation').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('navigation').close()}});
$('categoryFilter').innerHTML+=[...new Set(Q.map(q=>q.category))].map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');['search','categoryFilter'].forEach(id=>$(id).oninput=renderList);
window.addEventListener('keydown',e=>{
 if(e.isComposing||e.altKey)return;
 if($('editor').open){if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();$('saveModel').click()}return}
 if($('navigation').open||$('aiInterview').open||$('voiceSettings').open||$('profile').open||e.ctrlKey||e.metaKey||/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName))return;
 if(practice){if(e.code==='Space'&&document.activeElement?.tagName!=='BUTTON'){e.preventDefault();advancePractice()}return}
 if(e.code==='Space'&&document.activeElement?.tagName==='BUTTON')return;
 if(e.key==='ArrowRight'){e.preventDefault();move(1)}if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}if(e.code==='Space'){e.preventDefault();toggleAnswer()}
});
function practicePrompt(){const q=pool[index];return practice.stage===0?q.q:q.followups[practice.stage-1].q}
function clockText(seconds){const s=Math.max(0,Math.floor(seconds));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
function paintPracticeClock(){if(!practice)return;const seconds=practice.phase==='feedback'?practice.steps.reduce((sum,s)=>sum+s.seconds,0):practice.started===null?0:(performance.now()-practice.started)/1000;$('practiceClock').textContent=clockText(seconds);$('practiceClock').classList.toggle('over-goal',seconds>(pool[index].m==='pres'?30:60))}
function practiceAction(label,english){$('reveal').removeAttribute('aria-controls');$('reveal').removeAttribute('aria-expanded');$('reveal').innerHTML=`<span class="action-label">${label}<small aria-hidden="true">${english}</small></span><span aria-hidden="true">→</span>`}
function paintPractice(){
 if(!practice)return;
 speech.stop();$('practicePanel').hidden=practice.phase==='complete';$('practiceSummary').hidden=practice.phase!=='complete';$('practiceFeedback').hidden=practice.phase!=='feedback';
 $('stageLabel').innerHTML=practice.stage===0?'QUESTION <span id="questionId">'+pool[index].id.slice(1)+'</span>':'FOLLOW-UP <span id="questionId">'+practice.stage+' / 2</span>';
 $('question').textContent=practicePrompt();$('position').textContent=(practice.done+1)+' / '+practice.target+'問';$('progressBar').style.width=(practice.done/practice.target*100)+'%';
 $('practiceStep').textContent=practice.stage===0?'本質問':('想定追撃 '+practice.stage+' / 2');$('practiceGoal').textContent=practice.phase==='feedback'?'3回答の合計':'目安 '+(pool[index].m==='pres'?30:60)+'秒';
 $('practiceInstruction').textContent=practice.phase==='ready'?'解答を見ず、声に出して答える。':practice.phase==='speaking'?'回答が終わったら、下のボタンで進む。':'本質問と追撃を振り返る。録音・回答本文の保存はしません。';
 if(practice.phase==='ready')practiceAction('回答を始める','START ANSWER');
 if(practice.phase==='speaking')practiceAction(practice.stage<2?'追撃へ':'振り返る',practice.stage<2?'FOLLOW-UP':'REVIEW');
 if(practice.phase==='feedback'){
  practiceAction(practice.tags.length?'保存して次へ':'できた・次へ','SAVE & NEXT');
  $('practiceFix').textContent=practice.tags.length?'次に直す一つ：'+FIXES[practice.tags[0]]:'結論・根拠・行動を言えたら、そのまま次へ。';
 }
 paintPracticeClock();
}
function resetPracticeQuestion(){practice.phase='ready';practice.stage=0;practice.started=null;practice.steps=[];practice.tags=[];$('weaknessChoices').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed','false'));render();paintPractice();if(voicePreferences.auto)speech.play(practicePrompt(),voiceOptions('question'));window.scrollTo({top:0,behavior:'instant'})}
function startPractice(review=false){
 if(!ready){toast('保存データを読み込み中です。');return}
 const mode=pool[index].m==='pres'?'pres':'take';let candidates=Q.filter(q=>mode==='pres'?q.m==='pres':q.m!=='pres');
 if(review)candidates=weakQuestions(candidates,state);if(!candidates.length){toast('この面接官の苦手問題はありません。');return}
 endPractice();pool=candidates;if(review)index=pool.findIndex(q=>q.id===selectPracticeQuestion(pool,state,[],()=>.2).id);
 // Preserve the currently displayed question on a normal start.
 if(!review){const saved=get(POSITION);index=Math.max(0,pool.findIndex(q=>q.id===saved))}
 practice={phase:'ready',stage:0,done:0,target:Math.min(5,pool.length),started:null,steps:[],tags:[],recent:[],weak:0,totalSeconds:0};
 document.body.dataset.practice='true';document.querySelector('.keyhint').textContent='SPACE 次の操作へ';$('startPractice').hidden=true;$('endPractice').hidden=false;$('openProfile').hidden=true;$('navigation').close();practiceTimer=setInterval(paintPracticeClock,250);resetPracticeQuestion();
}
function endPractice(){
 if(!practice)return;const current=pool[index];practice=null;pool=Q.filter(q=>current.m==='pres'?q.m==='pres':q.m!=='pres');index=Math.max(0,pool.findIndex(q=>q.id===current.id));clearInterval(practiceTimer);practiceTimer=null;document.body.dataset.practice='false';document.querySelector('.keyhint').innerHTML='← → 質問を移動 <span>SPACE 解答を表示</span>';$('practicePanel').hidden=true;$('practiceSummary').hidden=true;$('startPractice').hidden=false;$('endPractice').hidden=true;$('openProfile').hidden=false;$('reveal').disabled=false;$('reveal').setAttribute('aria-controls','modelPanel');render();
}
async function advancePractice(){
 if(!practice||savingPractice)return;
 if(practice.phase==='complete'){endPractice();return}
 if(practice.phase==='ready'){speech.stop();practice.phase='speaking';practice.started=performance.now();paintPractice();return}
 if(practice.phase==='speaking'){
  practice.steps.push({prompt:practicePrompt(),seconds:(performance.now()-practice.started)/1000});practice.started=null;
  if(practice.stage<2){practice.stage++;practice.phase='ready';toggleAnswer(false);paintPractice();if(voicePreferences.auto)speech.play(practicePrompt(),voiceOptions('question'))}
  else{practice.phase='feedback';paintPractice();$('practicePanel').scrollIntoView({block:'start',behavior:'instant'})}
  return;
 }
 savingPractice=true;$('reveal').disabled=true;
 try{
  let current=state;const raw=get(KEY);if(raw){try{current=mergeBackup(state,validateBackup(JSON.parse(raw),Q))}catch{localStorage.setItem(KEY+'_recovery_'+Date.now(),raw)}}
  const next=recordOralPractice(current,pool[index],practice.steps,practice.tags);localStorage.setItem(KEY,JSON.stringify(next));state=next;
  let duplicate=true;try{await snapshot('current',state)}catch{duplicate=false}
  practice.done++;practice.weak+=practice.tags.length?1:0;practice.totalSeconds+=practice.steps.reduce((sum,s)=>sum+s.seconds,0);practice.recent.push(pool[index].id);history();
  if(practice.done>=practice.target){
   practice.phase='complete';practice.started=null;toggleAnswer(false);paintPractice();$('practiceSummaryTitle').textContent=practice.target+'問完了';$('practiceResult').textContent='できた '+(practice.done-practice.weak)+'問 · 要復習 '+practice.weak+'問 · 回答合計 '+clockText(practice.totalSeconds)+'（手動計測）';
   $('practiceSummaryWeaknesses').innerHTML=weaknessSummary(state,pool).slice(0,3).map(([w,n])=>`<p class="summary-weakness">${esc(w)} <span>${n}問</span></p>`).join('');$('reviewPractice').disabled=!weakQuestions(pool,state).length;practiceAction('通常画面に戻る','BACK TO QUESTIONS');$('position').textContent=practice.target+' / '+practice.target+'問';$('progressBar').style.width='100%';$('practiceSummary').scrollIntoView({block:'start',behavior:'instant'});
  }else{const nextQuestion=selectPracticeQuestion(pool,state,practice.recent);index=pool.findIndex(q=>q.id===nextQuestion.id);resetPracticeQuestion()}
  if(!duplicate)toast('端末に保存済み。バックアップを書き出すと安心です。');
 }catch(e){toast('保存できません。次へ進まず、この画面を保持しています。'+(e.message||''))}finally{savingPractice=false;$('reveal').disabled=false}
}
$('weaknessChoices').innerHTML=WEAKNESSES.map(w=>`<button type="button" aria-pressed="false" data-weakness="${esc(w)}">${esc(w)}</button>`).join('');
$('weaknessChoices').querySelectorAll('button').forEach(b=>b.onclick=()=>{if(!practice||savingPractice)return;const w=b.dataset.weakness;practice.tags=practice.tags.includes(w)?practice.tags.filter(t=>t!==w):[...practice.tags,w];b.setAttribute('aria-pressed',String(practice.tags.includes(w)));paintPractice()});
$('startPractice').onclick=()=>startPractice();$('endPractice').onclick=()=>{if(!savingPractice)endPractice()};$('retryPractice').onclick=()=>{if(!savingPractice)resetPracticeQuestion()};$('practiceModel').onclick=()=>{toggleAnswer();paintPractice()};$('startReview').onclick=()=>startPractice(true);$('restartPractice').onclick=()=>startPractice();$('reviewPractice').onclick=()=>startPractice(true);
window.addEventListener('storage',e=>{
 try{if(e.key===KEY&&e.newValue){state=mergeBackup(state,validateBackup(JSON.parse(e.newValue),Q));paintAnswer();history()}
 if(e.key===MODEL_KEY&&e.newValue){models=mergeModels(models,validateModels(JSON.parse(e.newValue),Q));paintAnswer();history();if($('editor').open)toast('別タブの更新を反映しました。編集中の文章は保持しています。')}}catch{}
});
$('export').onclick=()=>{if(!ready){toast('保存データの読み込み中です。');return}const url=URL.createObjectURL(new Blob([JSON.stringify({...state,modelAnswers:models},null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`team-architect-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('模範解答を含むバックアップを書き出しました。')};
$('import').onchange=async e=>{
 const file=e.target.files[0];if(!file)return;if(!ready){toast('保存データの読み込み中です。');e.target.value='';return}
 try{
  if(file.size>10*1024*1024)throw new Error('10MB以内のファイルを選んでください。');
  const raw=JSON.parse(await file.text()),incoming=validateBackup(raw,Q),incomingModels=raw.modelAnswers?validateModels(raw.modelAnswers,Q):emptyModels();
  const merged=mergeBackup(state,incoming),mergedModels=mergeModels(models,incomingModels);merged.savedAt=new Date().toISOString();
  // Write answers first; no success is reported unless both primary snapshots persist.
  if(damagedModels)localStorage.setItem(MODEL_KEY+'_recovery_'+Date.now(),damagedModels);
  persistModels(localStorage,mergedModels);models=mergedModels;damagedModels=null;
  const old=get(KEY);if(old){try{validateBackup(JSON.parse(old),Q)}catch{localStorage.setItem(KEY+'_recovery_'+Date.now(),old)}}
  localStorage.setItem(KEY,JSON.stringify(merged));state=merged;
  await snapshot('modelAnswers',models);await snapshot('current',state);paintAnswer();history();toast('既存の回答と模範解答を保持して統合しました。');
 }catch(error){paintAnswer();history();toast('読み込み未完了：'+(error.message||'保存容量を確認してください。'))}e.target.value='';
};
const saved=get(POSITION);interviewFilter=Q.find(q=>q.id===saved)?.m==='pres'?'president':'department';pool=Q.filter(q=>interviewFilter==='president'?q.m==='pres':q.m!=='pres');index=Math.max(0,pool.findIndex(q=>q.id===saved));document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===interviewFilter)));render();init();

mountAiInterview({getQuestion:()=>pool[index],getModel:q=>modelText(q),getFacts:()=>state.facts,beforeOpen:()=>{if(savingPractice)return false;endPractice();speech.stop();return true},nextQuestion:()=>move(1),startOral:()=>startPractice(),speak:text=>speech.play(text,voiceOptions('aiQuestion')),stopSpeech:()=>speech.stop(),saveAttempt:async({question,prompt,answer,seconds,feedback,followup})=>{
 if(!ready)throw new Error('保存データを読み込み中です。回答は保持しています。');
 let current=state;const raw=get(KEY);if(raw){try{current=mergeBackup(state,validateBackup(JSON.parse(raw),Q))}catch{localStorage.setItem(KEY+'_recovery_'+Date.now(),raw)}}
 const next=structuredClone(current),now=new Date().toISOString(),weaknesses=feedback.weaknesses.filter(w=>WEAKNESSES.includes(w));
 next.records[question.id]={answer,weaknesses,grade:weaknesses.length?'weak':'good',updatedAt:now};next.history.push({id:crypto.randomUUID(),questionId:question.id,prompt,answer,seconds,weaknesses,grade:weaknesses.length?'weak':'good',updatedAt:now,kind:followup?'followup':'answer',mode:question.m==='pres'?'pres':'take'});next.history=next.history.slice(-5000);next.savedAt=now;
 localStorage.setItem(KEY,JSON.stringify(next));state=next;try{await snapshot('current',state)}catch{toast('回答は端末に保存済みです。バックアップを推奨します。')}history();
}});
