export function mountInterviewShell({getInfo,onHome,onFirst,onLibrary,onPause,canLeave,onSettings,onPreferences}){
 const $=id=>document.getElementById(id),main=$('reader');let view='practice';
 const entry=main.querySelector('.question-entry'),role=main.querySelector('.practice-switch'),setup=main.querySelector('.study-setup');
 entry.remove();role.remove();setup.remove();
 const content=document.createElement('section');content.id='sessionContent';
 while(main.firstChild)content.append(main.firstChild);
 const controls=document.createElement('section');controls.id='practiceControls';controls.setAttribute('aria-label','面接のモードと出題設定');
 controls.innerHTML='<div class="workspace-heading"><div><p class="section-label">INTERVIEW PRACTICE</p><h2>面接の練習</h2></div><button id="practiceLibrary" class="text-link">質問を探す →</button></div>';
 controls.append(setup);setup.querySelector('.setup-label').remove();setup.querySelector('.study-range').before(role);
 content.prepend(controls);
 const toolbar=document.createElement('div');toolbar.className='session-toolbar';toolbar.innerHTML='<button id="firstQuestion" class="text-link">1問目へ戻る</button>';
 toolbar.prepend(content.querySelector('#endPractice'));content.querySelector('.eyebrow').before(toolbar);
 const library=document.createElement('section');library.id='libraryView';library.hidden=true;
 library.innerHTML='<div class="view-heading"><p class="section-label">QUESTION LIBRARY</p><h1>過去問・回答</h1><p>日付やキーワードで探す。質問も回答も、ここで編集。</p></div>';
 library.append(entry);entry.querySelector('#browseQuestionsDirect')?.remove();
 const bankRoot=document.createElement('section');bankRoot.id='questionBank';library.append(bankRoot);
 const settings=document.createElement('section');settings.id='settingsView';settings.hidden=true;settings.innerHTML=`<div class="view-heading"><span class="section-label">PREFERENCES</span><h1>設定</h1><p>練習しやすい時間・表示・音声に整える。</p></div><section class="settings-card"><h2>練習</h2><div class="settings-grid"><label>1回の出題数<select id="settingCount">${[1,3,5,10].map(n=>`<option value="${n}">${n}問</option>`).join('')}</select></label><label>文字の大きさ<select id="settingText"><option value="standard">標準</option><option value="large">大きく</option></select></label><label>部長の回答目安<select id="settingDepartment">${[30,45,60,90,120].map(n=>`<option value="${n}">${n}秒</option>`).join('')}</select></label><label>社長の回答目安<select id="settingPresident">${[30,45,60,90,120].map(n=>`<option value="${n}">${n}秒</option>`).join('')}</select></label></div><p id="settingsStatus" class="muted" role="status">変更すると保存されます。</p></section><section id="soundCard" class="settings-card"></section><section id="storageCard" class="settings-card"><h2>保存とバックアップ</h2><p class="muted">保存先はこの端末です。別の端末へはバックアップで移せます。自動同期は未対応です。</p><p id="lastBackup" class="storage-stamp"></p></section><section class="settings-card"><h2>面接の参考情報</h2><button id="settingsProfile" class="secondary">社長の評価軸を見る ↗</button></section>`;
 main.append(content,library,settings);
 const voice=$('voiceSettings'),voiceSection=document.createElement('section');voiceSection.id='voiceSettings';voiceSection.innerHTML=voice.innerHTML;voice.replaceWith(voiceSection);$('soundCard').append(voiceSection);$('closeVoice').textContent='練習へ戻る';const auto=$('autoVoice').closest('label');auto.classList.add('settings-auto');voiceSection.querySelector('.voice-form').before(auto);
 const backup=$('navigation').querySelector('.backup');backup.open=true;$('storageCard').append(backup);backup.id='backupArea';

 $('openVoice').removeAttribute('aria-haspopup');$('openVoice').setAttribute('aria-controls','settingsView');
 $('openImportQuestions').textContent='ファイル・文章から取り込む';
 $('addQuestionDirect').textContent='＋ 質問・回答を追加';
 const modes=[['readMode','質問・回答','見て覚える・編集'],['startPractice','声で練習','時間を測って答える'],['openAiInterview','AI面接','評価・追加質問']];
 for(const [id,title,description] of modes){$(id).querySelector('strong').textContent=title;$(id).querySelector('small').textContent=description}
 role.querySelectorAll('small').forEach(el=>el.remove());
 document.body.insertAdjacentHTML('beforeend','<nav id="appNav" class="app-nav" aria-label="アプリの画面"><button data-view="practice" aria-current="page"><span aria-hidden="true">▷</span>練習</button><button data-view="library"><span aria-hidden="true">▤</span>過去問・回答</button><button data-view="settings"><span aria-hidden="true">⚙</span>設定</button></nav>');
 const back=document.createElement('button');back.id='backHome';back.className='quiet';back.textContent='最初に戻る';document.querySelector('.header-inner').insertBefore(back,$('openMenu'));
 document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();goHome()});back.onclick=goHome;
 function show(next){
  if(canLeave()===false)return false;
  view=next;content.hidden=view!=='practice';library.hidden=view!=='library';settings.hidden=view!=='settings';
  document.querySelector('.dock').hidden=view!=='practice';document.body.dataset.appView=view;document.body.dataset.session='true';
  document.querySelectorAll('#appNav [data-view]').forEach(b=>{if(b.dataset.view===view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  onPause(view!=='practice');if(view==='settings')onSettings();refresh();window.scrollTo({top:0,behavior:'instant'});return true;
 }
 function openSession(){return show('practice')}
 function goHome(){
  if(canLeave()===false)return false;
  for(const d of document.querySelectorAll('dialog[open]'))if(!d.dispatchEvent(new Event('cancel',{cancelable:true})))return false;
  for(const d of document.querySelectorAll('dialog[open]'))d.close();
  onHome();show('practice');$('readMode').focus({preventScroll:true});return true;
 }
 function refresh(){
  const info=getInfo();$('startPractice').querySelector('small').textContent=info.preferences.questionCount+'問・時間を測る';
  $('lastBackup').textContent=info.lastBackup?'最終書き出し：'+new Date(info.lastBackup).toLocaleString('ja-JP'):'バックアップはまだ書き出していません。';
  for(const [id,key]of [['settingCount','questionCount'],['settingText','textSize'],['settingDepartment','departmentSeconds'],['settingPresident','presidentSeconds']])$(id).value=String(info.preferences[key]);
  for(const id of ['readMode','startPractice'])$(id).disabled=!info.ready;
 }
 $('firstQuestion').onclick=onFirst;$('practiceLibrary').onclick=onLibrary;$('settingsProfile').onclick=()=>$('openProfile').click();
 document.querySelectorAll('#appNav [data-view]').forEach(b=>b.onclick=()=>b.dataset.view==='library'?onLibrary():show(b.dataset.view));
 for(const id of ['settingCount','settingText','settingDepartment','settingPresident'])$(id).onchange=()=>onPreferences({version:1,questionCount:Number($('settingCount').value),textSize:$('settingText').value,departmentSeconds:Number($('settingDepartment').value),presidentSeconds:Number($('settingPresident').value)});
 // AI mode keeps the same direct switches inside its dialog.
 const aiModes=document.createElement('div');aiModes.className='ai-mode-switch';aiModes.setAttribute('role','group');aiModes.setAttribute('aria-label','面接モードを切り替える');
 aiModes.innerHTML='<button data-ai-mode="read" class="secondary">質問・回答</button><button data-ai-mode="oral" class="secondary">声で練習</button><span aria-current="true">AI面接</span>';
 $('aiConnection').before(aiModes);
 aiModes.querySelectorAll('button').forEach(b=>b.onclick=()=>{$('aiInterview').close();$(b.dataset.aiMode==='oral'?'startPractice':'readMode').click()});
 content.hidden=false;document.body.dataset.appView='practice';document.body.dataset.session='true';refresh();
 return {show,openSession,goHome,refresh,get view(){return view},get inSession(){return true},addDialogHomeButtons(){
  // One primary add action; import and search stay alongside it.
  const bankAdd=$('bankAdd');bankAdd.hidden=true;
  for(const d of document.querySelectorAll('dialog')){const head=d.querySelector('.dialog-head');if(head&&!head.querySelector('.dialog-home')){const b=document.createElement('button');b.type='button';b.className='dialog-home edit-button';b.textContent='最初に戻る';b.onclick=goHome;head.append(b)}}
 }};
}
