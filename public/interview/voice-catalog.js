import {QUESTIONS} from './questions.js';
export const VOICE_REVISION='natural2';
export const VOICE_PROFILES={department:{name:'玄野武宏',style:'ノーマル',speed:1.0,intonation:1.12,commaPause:.18,sentencePause:.36,credit:'VOICEVOX:玄野武宏'},president:{name:'麒ヶ島宗麟',style:'ノーマル',speed:1.0,intonation:1.08,commaPause:.22,sentencePause:.42,credit:'VOICEVOX:麒ヶ島宗麟'}};
export const VOICE_SAMPLE='店長として、何を実行しますか。具体的に教えてください。';
export const voiceText=text=>String(text).replace(/\s+/g,'').trim();
function hash(text){let h=2166136261;for(const c of text){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(16)}
export function voiceCatalog(questions=QUESTIONS){
 const entries=[],seen=new Set();
 function add(role,id,text){const normalized=voiceText(text),key=role+'|'+normalized;if(!normalized||seen.has(key))return;seen.add(key);entries.push({role,text,normalized,path:'audio/'+role+'/'+id+'-'+hash(normalized+'|'+VOICE_REVISION)+'.mp3'})}
 for(const q of questions){const role=q.m==='pres'?'president':'department';add(role,q.id,q.q);q.followups.forEach((f,i)=>add(role,q.id+'-f'+i,f.q))}
 for(const role of Object.keys(VOICE_PROFILES))add(role,'preview',VOICE_SAMPLE);
 return entries;
}
const lookup=new Map(voiceCatalog().map(e=>[e.role+'|'+e.normalized,e]));
export const recordedVoice=(text,role)=>lookup.get(role+'|'+voiceText(text));
