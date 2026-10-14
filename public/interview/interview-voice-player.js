import {createVoicePlayer} from './voice-player.js';
import {recordedVoice} from './voice-catalog.js';
export function createInterviewVoicePlayer({Audio=globalThis.Audio,assetBase=new URL('./',import.meta.url),onChange=()=>{},onError=()=>{},...options}){
 let activeKey=null,audio=null,serial=0;
 const device=createVoicePlayer({...options,onError,onChange:key=>{activeKey=key;onChange(key)}});
 function stop(){serial++;const old=audio;audio=null;if(old){old.onended=null;old.onerror=null;old.pause();old.removeAttribute?.('src');old.load?.()}device.stop();activeKey=null}
 function play(text,settings={}){
  stop();const entry=recordedVoice(text,settings.role||'department');
  if(!entry||!Audio){if(entry)onError('専用音声を利用できません。端末音声で読み上げます。');else onError('この文章は端末音声で読み上げます。');return device.play(text,settings)}
  const id=serial,key=settings.key||'question',player=new Audio(new URL(entry.path,assetBase).href);audio=player;player.preload='none';player.playbackRate=Math.max(.65,Math.min(1.4,settings.rate||1));activeKey=key;onChange(key);
  let failed=false;
  const finish=()=>{if(id!==serial)return;audio=null;activeKey=null;onChange(null)};
  const fail=error=>{if(id!==serial||failed)return;failed=true;serial++;player.onended=null;player.onerror=null;player.pause();audio=null;activeKey=null;if(error?.name==='NotAllowedError'){onChange(null);onError('音声再生が許可されていません。もう一度「質問を聞く」を押してください。');return}onError('専用音声を読み込めません。端末音声で読み上げます。');device.play(text,settings)};
  player.onended=finish;player.onerror=fail;
  try{const playing=player.play();playing?.catch(fail)}catch(e){fail(e)}
  return true;
 }
 return {supported:Boolean(Audio)||device.supported,voices:device.voices,play,stop,toggle(text,settings){if(activeKey===settings.key){stop();return false}return play(text,settings)}};
}
