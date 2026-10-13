import {CLOUD} from './config.js';
import {createCoachClient} from './ai-client.js?v=20261014-auth1';
import {createSpeechInput} from './speech-input.js?v=20261012-aiui1';
const $=id=>document.getElementById(id),DRAFT='team_architect_ai_draft_v1';
export function mountAiInterview({getQuestion,getModel,getFacts,beforeOpen,nextQuestion,startOral,saveAttempt,speak,stopSpeech}){
 const client=createCoachClient({url:CLOUD.url,publishableKey:CLOUD.publishableKey});
 let token='',root=null,prompt='',turns=[],result=null,busy=false,epoch=0,controller=null,listening=false,started=null,seconds=0,clock=null,draftWritable=false;
 const message=text=>$('aiMessage').textContent=text;
 function draft(){if(!draftWritable||!root)return;try{localStorage.setItem(DRAFT,JSON.stringify({id:root.id,prompt,answer:$('aiAnswer').value,turns:turns.slice(-6),seconds}))}catch{message('下書きを保存できません。回答をコピーして保持してください。')}}
 function paintChars(){$('aiChars').textContent=$('aiAnswer').value.length+' / 2,400字';$('aiAnswer').disabled=busy;$('aiConsent').disabled=busy;$('aiEvaluate').disabled=busy||listening||!$('aiAnswer').value.trim()||!$('aiConsent').checked}
 const input=createSpeechInput({Recognition:window.SpeechRecognition||window.webkitSpeechRecognition,onText:text=>{draftWritable=true;$('aiAnswer').value=text.slice(0,2400);$('aiTranscript').open=true;draft();paintChars()},onState:value=>{listening=value;$('aiMic').textContent=value?'回答を終える':'声で答える';if(!value&&started!==null){seconds+=(performance.now()-started)/1000;started=null;draft()}paintChars()},onError:message});
 $('aiMic').disabled=!input.supported;
 function abort(){epoch++;controller?.abort();controller=null;busy=false;input.stop();stopSpeech();$('aiLoginSubmit').disabled=false;$('aiMic').disabled=!input.supported;paintChars()}
 function updatePrompt(){
  $('aiRole').textContent=(root.m==='pres'?'PRESIDENT · 社長':'DIRECTOR · 部長')+(turns.length?' / 追撃 '+turns.length:' / 本質問');$('aiPrompt').textContent=prompt;$('aiFeedback').hidden=true;result=null;seconds=0;started=null;$('aiElapsed').textContent='00:00';$('aiAnswer').value='';$('aiTranscript').open=false;message('');paintChars();
 }
 function restore(){try{const v=JSON.parse(localStorage.getItem(DRAFT)||'null');if(v?.id===root.id&&typeof v.prompt==='string'&&v.prompt.length<=1000&&typeof v.answer==='string'&&v.answer.length<=2400&&Array.isArray(v.turns)&&v.turns.length<=6&&v.turns.every(t=>typeof t.prompt==='string'&&typeof t.answer==='string'&&t.prompt.length<=1000&&t.answer.length<=2400)){prompt=v.prompt;turns=v.turns;updatePrompt();$('aiAnswer').value=v.answer;seconds=Math.max(0,Math.min(3600,Number(v.seconds)||0));$('aiTranscript').open=Boolean(v.answer);paintChars()}}catch{}}
 async function check(){
  abort();const id=epoch;controller=new AbortController();$('aiUnavailable').hidden=true;$('aiLogin').hidden=Boolean(token);$('aiLive').hidden=true;$('aiConnection').textContent='ログインできます。接続状態を確認しています。';
  try{const capabilities=await client.capabilities(AbortSignal.any([controller.signal,AbortSignal.timeout(12000)]));if(id!==epoch)return;
   if(capabilities.aiConfigured!==true){$('aiConnection').textContent='AI未接続 · 無料の実戦練習は利用できます';$('aiUnavailable').hidden=false;return}
   if(token){const status=await client.status(token,AbortSignal.any([controller.signal,AbortSignal.timeout(20000)]));if(id!==epoch)return;if(!status.aiEnabled)throw new Error('AI接続は準備中です。');$('aiLive').hidden=false;$('aiConnection').textContent='接続済み · 無料枠'}
   else{$('aiLogin').hidden=false;$('aiConnection').textContent='ログインして開始';}
  }catch(e){if(id!==epoch)return;token='';$('aiLogin').hidden=false;$('aiConnection').textContent='接続状態を確認できません。ログインを試すか、実戦5問で練習できます。';$('aiUnavailable').hidden=false}
 }
 $('openAiInterview').onclick=()=>{if(beforeOpen()===false)return;draftWritable=false;root=getQuestion();prompt=root.q;turns=[];updatePrompt();restore();$('aiInterview').showModal();clock=setInterval(()=>{const s=Math.floor(seconds+(started===null?0:(performance.now()-started)/1000));$('aiElapsed').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')},250);check()};
 $('closeAiInterview').onclick=()=>$('aiInterview').close();$('aiInterview').addEventListener('close',()=>{if(root)draft();abort();clearInterval(clock);clock=null;$('aiConsent').checked=false;$('aiPassword').value='';$('aiPassword').type='password';$('aiPasswordToggle').textContent='パスワードを表示';$('aiPasswordToggle').setAttribute('aria-pressed','false')});
 $('aiFallback').onclick=()=>{$('aiInterview').close();startOral()};$('aiRecheck').onclick=check;
 $('aiLogin').onsubmit=async e=>{e.preventDefault();if(busy)return;busy=true;const id=++epoch;controller=new AbortController();$('aiLoginSubmit').disabled=true;$('aiConnection').textContent='ログインを確認しています。';
  try{const r=await fetch(CLOUD.url+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:CLOUD.publishableKey,'Content-Type':'application/json'},body:JSON.stringify({email:$('aiEmail').value.trim(),password:$('aiPassword').value}),signal:AbortSignal.any([controller.signal,AbortSignal.timeout(15000)])});const auth=await r.json();if(id!==epoch)return;if(!r.ok||!auth.access_token)throw new Error('メールアドレス・パスワードを確認してください。');const status=await client.status(auth.access_token,AbortSignal.any([controller.signal,AbortSignal.timeout(20000)]));if(id!==epoch)return;if(!status.aiEnabled)throw new Error('AI接続は準備中です。');token=auth.access_token;$('aiLogin').hidden=true;$('aiLive').hidden=false;$('aiConnection').textContent='接続済み · 無料枠';
  }catch(e){if(id===epoch)$('aiConnection').textContent=e.message||'ログインできません。'}finally{if(id===epoch){busy=false;$('aiPassword').value='';$('aiLoginSubmit').disabled=false;paintChars()}}
 };
 $('aiAnswer').oninput=()=>{draftWritable=true;draft();paintChars()};$('aiConsent').onchange=paintChars;
 $('aiMic').onclick=()=>{if(listening){input.stop();return}stopSpeech();message('');if(input.start($('aiAnswer').value)){started=performance.now();$('aiTranscript').open=true}};
 $('aiRead').onclick=()=>{input.stop();speak(prompt)};
 $('aiEvaluate').onclick=async()=>{
  if(busy||listening||!$('aiConsent').checked||!$('aiAnswer').value.trim())return;
  const answer=$('aiAnswer').value,q=root,currentPrompt=prompt,previous=[...turns];draft();busy=true;const id=++epoch;controller=new AbortController();paintChars();$('aiMic').disabled=true;message('回答を確認しています…');
  try{const feedback=await client.coach({token,consent:true,question:q,answer,prompt:currentPrompt,conversation:previous,facts:getFacts(),modelAnswer:getModel(q),seconds,signal:AbortSignal.any([controller.signal,AbortSignal.timeout(45000)])});if(id!==epoch)return;
   await saveAttempt({question:q,prompt:currentPrompt,answer,seconds,feedback,followup:previous.length>0});if(id!==epoch)return;result={...feedback,answer,prompt:currentPrompt};
   $('aiQuote').textContent='「'+feedback.quote+'」';$('aiFix').textContent=feedback.nextFix;$('aiFeedbackText').textContent=feedback.feedback;$('aiTags').replaceChildren(...feedback.weaknesses.map(w=>{const b=document.createElement('span');b.className='ai-weakness';b.textContent=w;return b}));
   $('aiAxes').replaceChildren(...feedback.axes.map(a=>{const p=document.createElement('p');p.textContent=a.name+'：'+(a.score===null?'未判定':a.score+' / 4')+' · '+a.evidence;return p}));$('aiFeedback').hidden=false;message('評価と回答を端末に保存しました。');$('aiFeedback').scrollIntoView({block:'nearest',behavior:'instant'});
  }catch(e){if(id!==epoch)return;message(e.message||'評価できません。回答は保持しています。')}
  finally{if(id===epoch){busy=false;$('aiMic').disabled=!input.supported;paintChars()}}
 };
 $('aiFollow').onclick=()=>{if(!result||busy)return;turns.push({prompt:result.prompt,answer:result.answer});turns=turns.slice(-6);prompt=result.followup;input.stop();updatePrompt();draftWritable=true;draft();$('aiInterview').scrollTo({top:0,behavior:'instant'})};
 $('aiRetry').onclick=()=>{if(busy)return;input.stop();updatePrompt();draftWritable=true;draft();$('aiInterview').scrollTo({top:0,behavior:'instant'})};
 $('aiNext').onclick=()=>{if(busy)return;input.stop();nextQuestion();root=getQuestion();prompt=root.q;turns=[];updatePrompt();draftWritable=true;draft();$('aiInterview').scrollTo({top:0,behavior:'instant'})};
 $('aiLogout').onclick=()=>{const old=token;token='';abort();$('aiConsent').checked=false;if(old)fetch(CLOUD.url+'/auth/v1/logout?scope=local',{method:'POST',headers:{apikey:CLOUD.publishableKey,Authorization:'Bearer '+old}}).catch(()=>{});check()};
 $('aiPasswordToggle').onclick=()=>{const visible=$('aiPassword').type==='password';$('aiPassword').type=visible?'text':'password';$('aiPasswordToggle').textContent=visible?'パスワードを隠す':'パスワードを表示';$('aiPasswordToggle').setAttribute('aria-pressed',String(visible))};
 if(new URLSearchParams(window.location?.search||'').get('login')==='1')$('openAiInterview').click();
 document.addEventListener('visibilitychange',()=>{if(document.hidden)input.stop()});
}
