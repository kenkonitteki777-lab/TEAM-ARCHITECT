// Generic device voices only. No impersonation, microphone, or paid service.
export function createVoicePlayer({synth,Utterance,onChange=()=>{},onError=()=>{}}) {
 let active=null,serial=0;
 const supported=Boolean(synth&&Utterance);
 function voices(){return supported?synth.getVoices().filter(v=>/^ja(?:-|_)/i.test(v.lang)):[]}
 function stop(){serial++;active=null;if(supported)synth.cancel();onChange(null)}
 function play(text,{role='department',voiceURI='',rate=1,pitch=null,key='question'}={}) {
  stop();if(!supported){onError('このブラウザーは読み上げに対応していません。');return false}
  if(!String(text).trim())return false;
  const available=voices();if(!available.length){onError('日本語の読み上げ音声が見つかりません。端末の音声設定を確認してください。');return false}
  const voice=available.find(v=>v.voiceURI===voiceURI)||available.find(v=>v.default)||available[0];
  const token=serial,utterance=new Utterance(String(text));utterance.lang='ja-JP';utterance.voice=voice;
  utterance.rate=Math.max(.65,Math.min(1.4,rate*(role==='president'?1.08:.92)));utterance.pitch=Math.max(.75,Math.min(1.15,Number.isFinite(pitch)?pitch:(role==='president'?.96:.86)));
  active={key,token};onChange(key);
  const finish=()=>{if(token===serial){active=null;onChange(null)}};
  utterance.onend=finish;utterance.onerror=e=>{if(token!==serial)return;finish();if(!['canceled','interrupted'].includes(e.error))onError('読み上げを開始できません。音量や端末設定を確認して、もう一度押してください。')};
  try{synth.speak(utterance);return true}catch{finish();onError('読み上げを開始できません。');return false}
 }
 return {supported,voices,play,stop,toggle(text,options){if(active?.key===options.key){stop();return false}return play(text,options)}};
}
