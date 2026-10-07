import {PRESIDENT_PROFILE} from './interviewer-profile.js';
import {QUESTIONS as Q} from './questions.js?v=20261007-profile2';
import {emptyState,validateBackup,mergeBackup} from './engine.js';
import {MODEL_KEY,DRAFT_KEY,emptyModels,validateModels,mergeModels,setModel,persistModels} from './model-store.js';
const $=id=>document.getElementById(id),KEY='team_architect_interview_v3',POSITION='team_architect_reader_question';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state=emptyState(),models=emptyModels(),idb=null,index=0,pool=Q,toastTimer,revealed=false,ready=false,editKey=null,modelDrafts={},damagedModels=null,interviewFilter='all';
function get(k){try{return localStorage.getItem(k)}catch{return null}}
function toast(text){$('toast').textContent=text;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,3500)}
function modelText(q,n=null){return models.entries[n===null?q.id:q.id+':f'+n]?.text??(n===null?q.answer:q.followups[n].answer)}
function answer(text){const filled=text.replace(/【要確認：([^】]+)】/g,(all,key)=>{const f=state.facts[key];return f?.value&&f.source&&f.date?f.value+'（本人登録・'+f.date+'）':all});return esc(filled).replace(/【要確認：[^】]+】/g,m=>`<span class="confirmation">${m}</span>`)}
function paintAnswer(){
 const q=pool[index];$('answer').innerHTML=answer(modelText(q));$('answerOrigin').textContent=models.entries[q.id]?'本人登録':'回答案';
 $('followups').innerHTML=q.followups.map((f,i)=>`<details><summary>追撃：${esc(f.q)}</summary><p>${answer(modelText(q,i))}</p><button class="edit-button" data-followup="${i}">この追撃回答を編集 ↗</button></details>`).join('');
 $('followups').querySelectorAll('[data-followup]').forEach(b=>b.onclick=()=>openEditor(Number(b.dataset.followup)));
 $('answerCore').textContent='回答の核：'+q.core;$('answerIntent').textContent='確認される点：'+q.intent;
 $('provenance').textContent=models.entries[q.id]?'本人登録 · '+new Date(models.entries[q.id].updatedAt).toLocaleDateString('ja-JP'):q.status+' · '+q.src;
}
function toggleAnswer(value=!revealed){revealed=value;$('modelPanel').hidden=!revealed;$('recallHint').hidden=revealed;$('reveal').setAttribute('aria-expanded',String(revealed));$('reveal').innerHTML=revealed?'解答を隠す <span aria-hidden="true">−</span>':'模範解答を見る <span aria-hidden="true">＋</span>';}
function render(){
 const q=pool[index];$('category').textContent=q.category;$('position').textContent=String(index+1).padStart(2,'0')+' / '+String(pool.length).padStart(2,'0');$('questionId').textContent=q.id.slice(1);$('question').textContent=q.q;$('progressBar').style.width=((index+1)/pool.length*100)+'%';
 const president=q.m==='pres';document.querySelectorAll('button[data-interviewer]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.interviewer===(president?'president':'department'))));$('practiceHint').textContent=president?'社長面接 · 結論 → 根拠 → 行動':'部長面接 · 経験 → 学び → 店長としての行動';document.body.dataset.interviewer=president?'president':'department';
 $('interviewerLabel').textContent=president?'社長面接':'部長面接';$('coach').setAttribute('aria-label',president?'韓浩社長をイメージした面接キャラクター':'部長面接のオリジナルコーチ');
 const source=president?'./assets/president-koh-han-v1.webp':'./assets/interview-coach-v1.webp';if($('coachImage').getAttribute('src')!==source)$('coachImage').src=source;
 $('coachImage').alt=president?'韓浩社長を参考にしたイメージイラスト':'銀髪と黒いジャケットのオリジナル面接コーチ';
 $('coachName').textContent=president?'韓 浩 ／ 社長面接':'ARCH ／ 部長面接';$('coachMotto').textContent=president?'結論から、短く、強く。':'ひよらない強さ。';$('coach').title=president?'公開プロフィール写真を参考にした練習用イラスト':'実在の部長の似顔絵ではないオリジナルコーチ';
 paintAnswer();toggleAnswer(false);$('prev').disabled=index===0;$('next').setAttribute('aria-label',index===pool.length-1?'最初の質問へ':'次の質問');$('next').innerHTML=index===pool.length-1?'<span>最初へ</span><span aria-hidden="true">↻</span>':'<span>次へ</span><span aria-hidden="true">→</span>';try{localStorage.setItem(POSITION,q.id);localStorage.setItem(POSITION+'_'+(president?'president':'department'),q.id)}catch{}
}
function selectInterviewer(mode){
 interviewFilter=mode;$('search').value='';$('categoryFilter').value='';pool=Q.filter(q=>mode==='president'?q.m==='pres':q.m!=='pres');const previous=get(POSITION+'_'+mode);index=Math.max(0,pool.findIndex(q=>q.id===previous));document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));render();renderList();window.scrollTo({top:0,behavior:'instant'});
}
document.querySelectorAll('button[data-interviewer]').forEach(b=>b.onclick=()=>selectInterviewer(b.dataset.interviewer));
$('profileContent').innerHTML=`<p class="profile-note">${esc(PRESIDENT_PROFILE.note)}</p><h3>公開発言で確認できる経営姿勢</h3>${PRESIDENT_PROFILE.evidence.map(e=>`<article class="profile-axis"><strong>${esc(e.axis)}</strong><p>${esc(e.detail)}</p><a href="${PRESIDENT_PROFILE.sources[e.source].url}" target="_blank" rel="noopener noreferrer">公式資料 ↗</a></article>`).join('')}<h3>あなたが指定した練習条件</h3><p>${esc(PRESIDENT_PROFILE.training)}</p><h3>問答への落とし込み</h3><p>${esc(PRESIDENT_PROFILE.inference)}</p><p class="muted">資料確認日：${PRESIDENT_PROFILE.checkedAt} · 本人登録の模範解答は優先して表示します。</p>`;
$('openProfile').onclick=()=>$('profile').showModal();$('closeProfile').onclick=()=>$('profile').close();
function move(step){if(step<0&&index===0)return;index=(index+step+pool.length)%pool.length;render();window.scrollTo({top:0,behavior:'instant'})}
function filtered(){const term=$('search').value.trim().toLocaleLowerCase(),cat=$('categoryFilter').value;return Q.filter(q=>(interviewFilter==='all'||(interviewFilter==='president'?q.m==='pres':q.m!=='pres'))&&(!cat||q.category===cat)&&(!term||(q.q+' '+modelText(q)+' '+q.core).toLocaleLowerCase().includes(term)))}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{interviewFilter=b.dataset.mode;document.querySelectorAll('[data-mode]').forEach(tab=>tab.setAttribute('aria-pressed',String(tab===b)));renderList()});
function renderList(){const list=filtered();$('resultCount').textContent=`${list.length}問`;$('questionList').innerHTML=list.length?list.map(q=>`<button class="question-row" data-id="${q.id}" aria-current="${q.id===pool[index].id}"><span class="index">${q.id.slice(1)}</span><span>${esc(q.q)}<small>${esc(q.category)}${models.entries[q.id]?' · 本人登録':''}</small></span></button>`).join(''):'<p class="muted">一致する質問がありません。</p>';$('questionList').querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{pool=list;index=pool.findIndex(q=>q.id===b.dataset.id);render();$('navigation').close();window.scrollTo({top:0,behavior:'instant'})})}
function history(){$('storageDetail').textContent=`本人登録 ${Object.keys(models.entries).length}件 · 過去の回答履歴 ${state.history.length}件。バックアップには編集した模範解答も含まれます。`;$('history').innerHTML=state.history.length?state.history.slice(-100).reverse().map(r=>`<article class="history-entry"><small>${esc(new Date(r.updatedAt).toLocaleString('ja-JP'))}</small><h3>${esc(r.prompt||Q.find(q=>q.id===r.questionId)?.q)}</h3><p>${esc(r.answer)}</p></article>`).join(''):'<p class="muted">保存された回答履歴はありません。</p>'}
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
 const q=pool[index];editKey=n===null?q.id:q.id+':f'+n;$('editorQuestion').textContent=n===null?q.q:q.followups[n].q;$('modelText').value=modelDrafts[editKey]??modelText(q,n);$('draftStatus').textContent=Object.hasOwn(modelDrafts,editKey)?'編集中の下書きを復元':'元の回答案も保持されます';$('editChars').textContent=$('modelText').value.length+' / 12,000字';$('editor').showModal();
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
  paintAnswer();toggleAnswer(true);history();$('editor').close();toast(duplicate?'模範解答を保存しました。':'端末には保存済み。追加保存に失敗したためバックアップを推奨します。');
 }catch(e){toast('保存できません：'+(e.message||'コピーして保持してください。'))}finally{$('saveModel').disabled=false}
};
$('closeEditor').onclick=()=>$('editor').close();$('editAnswer').onclick=()=>openEditor();$('reveal').onclick=()=>toggleAnswer();$('prev').onclick=()=>move(-1);$('next').onclick=()=>move(1);
$('openMenu').onclick=()=>{renderList();history();$('navigation').showModal()};$('closeMenu').onclick=()=>$('navigation').close();
$('navigation').addEventListener('click',e=>{if(e.target===$('navigation')){const r=$('navigation').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('navigation').close()}});
$('categoryFilter').innerHTML+=[...new Set(Q.map(q=>q.category))].map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');['search','categoryFilter'].forEach(id=>$(id).oninput=renderList);
window.addEventListener('keydown',e=>{
 if(e.isComposing||e.altKey)return;
 if($('editor').open){if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();$('saveModel').click()}return}
 if($('navigation').open||e.ctrlKey||e.metaKey||/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName))return;
 if(e.key==='ArrowRight'){e.preventDefault();move(1)}if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}if(e.code==='Space'){e.preventDefault();toggleAnswer()}
});
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
