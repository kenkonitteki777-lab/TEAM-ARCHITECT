import test from 'node:test';
import assert from 'node:assert/strict';
import {recordedVoice,voiceCatalog,VOICE_SAMPLE,VOICE_PROFILES} from '../public/interview/voice-catalog.js';
import {QUESTIONS} from '../public/interview/questions.js';
import {createInterviewVoicePlayer} from '../public/interview/interview-voice-player.js';
test('all fixed questions and followups have recordings assigned to their interviewer',()=>{
 assert.notEqual(VOICE_PROFILES.department.name,VOICE_PROFILES.president.name);
 for(const q of QUESTIONS){const role=q.m==='pres'?'president':'department';assert.ok(recordedVoice(q.q,role));for(const f of q.followups)assert.ok(recordedVoice(f.q,role))}
 const entries=voiceCatalog();assert.equal(new Set(entries.map(e=>e.path)).size,entries.length);assert.notEqual(recordedVoice(VOICE_SAMPLE,'department').path,recordedVoice(VOICE_SAMPLE,'president').path);assert.equal(recordedVoice('未登録の自由な質問','department'),undefined);
});
function fixture(fail=false){const recordings=[],spoken=[],changes=[],errors=[];class Audio{constructor(src){this.src=src;recordings.push(this)}play(){return fail?Promise.reject(new Error('missing')):Promise.resolve()}pause(){this.paused=true}load(){}removeAttribute(){}}class Utterance{constructor(text){this.text=text}}
 const player=createInterviewVoicePlayer({Audio,assetBase:'https://example.com/interview/',synth:{getVoices:()=>[{lang:'ja-JP',voiceURI:'device',default:true}],speak:u=>spoken.push(u),cancel(){}},Utterance,onChange:k=>changes.push(k),onError:e=>errors.push(e)});return {player,recordings,spoken,changes,errors};}
test('the same sentence plays two different voice assets without device TTS or pitch substitution',()=>{
 const f=fixture();f.player.play(VOICE_SAMPLE,{role:'department',key:'department'});const old=f.recordings[0].onended;f.player.play(VOICE_SAMPLE,{role:'president',key:'president'});
 assert.ok(f.recordings[0].src.includes('/department/'));assert.ok(f.recordings[1].src.includes('/president/'));assert.notEqual(f.recordings[0].src,f.recordings[1].src);assert.equal(f.spoken.length,0);assert.equal(f.recordings[0].paused,true);old();assert.equal(f.changes.at(-1),'president');f.player.stop();assert.equal(f.changes.at(-1),null);
});
test('missing clips explain fallback and stopped failed requests cannot start late device speech',async()=>{
 const f=fixture(true);f.player.play(VOICE_SAMPLE,{role:'department',key:'preview'});await new Promise(r=>setImmediate(r));assert.equal(f.spoken.length,1);assert.ok(f.errors[0].includes('端末音声'));
 const stopped=fixture(true);stopped.player.play(VOICE_SAMPLE,{role:'department',key:'preview'});stopped.player.stop();await new Promise(r=>setImmediate(r));assert.equal(stopped.spoken.length,0);
});
