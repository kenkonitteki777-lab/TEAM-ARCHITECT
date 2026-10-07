import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {QUESTIONS} from '../public/interview/questions.js';
import {diagnose,emptyState,validateBackup,mergeBackup,priority,weightedNext,AXES} from '../public/interview/engine.js';
test('all legacy questions have complete material and unknown numbers are explicit',()=>{assert.equal(QUESTIONS.length,66);assert.equal(new Set(QUESTIONS.map(q=>q.id)).size,66);for(const q of QUESTIONS){for(const key of ['answer','core','intent','status'])assert.ok(q[key],q.id+key);assert.equal(q.followups.length,2);assert.notEqual(q.answer,'未記録');assert.ok(q.followups.every(f=>f.q&&f.answer))}assert.ok(QUESTIONS.find(q=>q.id==='q034').answer.includes('要確認'));});
test('personal language and firm profit judgment are preserved',()=>{const full=JSON.stringify(QUESTIONS);for(const text of ['遠回りこそ最大の近道','ひよらない強さ','とる時にとる、出す時に出す','メイン機も強気で締めて','細かい機種の無駄玉'])assert.ok(full.includes(text));assert.ok(QUESTIONS.find(q=>q.id==='q028').status.includes('本人確認前'))});
test('short clear answers are not penalized solely for being short',()=>{const r=diagnose('はい、できます。現場で判断し、結果の責任を引き受けます。',QUESTIONS[20],'pres',15);assert.deepEqual(r.weaknesses,[])});
test('president mode requires a direct yes/no answer and flags excessive time',()=>{const r=diagnose('色々な経験をしてきたので、これから頑張ります。',QUESTIONS[20],'pres',80);assert.ok(r.weaknesses.includes('結論が遅い'));assert.ok(r.weaknesses.includes('長すぎる'))});
test('required numbers are not inferred from generic profit wording',()=>{assert.ok(diagnose('利益を残します。',QUESTIONS[33],'pres',12).weaknesses.includes('数字不足'));assert.ok(!diagnose('着地は100万円です。差を確認し判断します。',{...QUESTIONS[33]},'pres',12).weaknesses.includes('数字不足'));assert.ok(diagnose('100万円は要確認です。',QUESTIONS[33],'pres',12).weaknesses.includes('数字不足'))});
test('weak questions outrank mastered questions and avoid recent repeats',()=>{const state=emptyState();state.records.q001={grade:'good',weaknesses:[],updatedAt:new Date().toISOString()};state.records.q002={grade:'weak',weaknesses:['数字不足','結論が遅い'],updatedAt:new Date().toISOString()};assert.ok(priority(QUESTIONS[1],state)>priority(QUESTIONS[0],state));assert.notEqual(weightedNext(QUESTIONS,state,['q001','q002','q003'],()=>0).id,'q001');assert.equal(weightedNext([],state),null)});
test('backup merging never deletes historical attempts and deduplicates immutable IDs',()=>{const a=emptyState(),b=emptyState();a.history=[{id:'a'}];b.history=[{id:'a'},{id:'b'}];a.records.q001={updatedAt:'2026-10-02T00:00:00Z',answer:'old'};b.records.q001={updatedAt:'2026-10-06T00:00:00Z',answer:'new'};a.facts.x={value:'local'};b.facts.x={value:'incoming'};const merged=mergeBackup(a,b);assert.equal(merged.history.length,2);assert.equal(merged.records.q001.answer,'new');assert.equal(merged.facts.x.value,'local')});
test('malformed backup is rejected, invalid IDs and weakness tags are stripped',()=>{assert.throws(()=>validateBackup({version:1},QUESTIONS));const a=emptyState();a.records.q001={answer:'safe',weaknesses:['数字不足','bad'],grade:'admin',updatedAt:'bad'};a.records.unknown={answer:'bad'};const clean=validateBackup(a,QUESTIONS);assert.deepEqual(clean.records.q001.weaknesses,['数字不足']);assert.equal(clean.records.q001.grade,null);assert.equal(clean.records.unknown,undefined)});
test('new backup snapshot timestamp survives validation',()=>{const a=emptyState();a.savedAt='2026-10-06T00:00:00.000Z';assert.equal(validateBackup(a,QUESTIONS).savedAt,a.savedAt)});
test('free cloud uses only a publishable key; paid AI stays off',()=>{const config=fs.readFileSync('public/interview/config.js','utf8');assert.ok(config.includes('aiEnabled:false'));assert.ok(config.includes('sb_publishable_'));for(const file of fs.readdirSync('public/interview'))assert.ok(!/sk-[A-Za-z0-9_-]{20,}|sb_secret_[A-Za-z0-9_-]{20,}/.test(fs.readFileSync('public/interview/'+file,'utf8')))});
test('frontend and server shared engines/questions match exactly',()=>{for(const f of ['engine.js','questions.js'])assert.equal(fs.readFileSync('public/interview/'+f,'utf8'),fs.readFileSync('supabase/functions/interview-coach/'+f,'utf8'));assert.equal(AXES.length,15)});

import {emptyModels,validateModels,mergeModels,setModel,persistModels,MODEL_KEY} from '../public/interview/model-store.js';
test('personal model answers and followups roundtrip without changing source questions',()=>{
 const original=QUESTIONS[0].answer;
 let store=setModel(emptyModels(),'q001','本人が編集した模範解答','2026-10-07T04:00:00Z');
 store=setModel(store,'q001:f0','追撃にも自分の回答を登録','2026-10-07T04:01:00Z');
 const saved=validateModels(JSON.parse(JSON.stringify(store)),QUESTIONS);
 assert.equal(saved.entries.q001.text,'本人が編集した模範解答');assert.equal(saved.entries['q001:f0'].text,'追撃にも自分の回答を登録');assert.equal(QUESTIONS[0].answer,original);
});
test('editing a model answer retains previous personal versions',()=>{
 const first=setModel(emptyModels(),'q001','初回の本人回答','2026-10-07T04:00:00Z');
 const second=setModel(first,'q001','改善した本人回答','2026-10-07T04:02:00Z');
 assert.equal(first.entries.q001.text,'初回の本人回答');assert.equal(second.entries.q001.revisions[0].text,'初回の本人回答');
});
test('merging model backups keeps newest answer and preserves differing older versions',()=>{
 const old=setModel(emptyModels(),'q001','前の回答','2026-10-07T04:00:00Z');
 const newer=setModel(emptyModels(),'q001','新しい回答','2026-10-07T05:00:00Z');
 const merged=mergeModels(newer,old);assert.equal(merged.entries.q001.text,'新しい回答');assert.ok(merged.entries.q001.revisions.some(r=>r.text==='前の回答'));assert.deepEqual(mergeModels(merged,old),merged);
});
test('model validation rejects malformed content and ignores unknown question IDs',()=>{
 assert.throws(()=>setModel(emptyModels(),'q001','   '));assert.throws(()=>setModel(emptyModels(),'q001','a'.repeat(12001)));
 assert.throws(()=>validateModels({version:1,entries:{q001:{text:'answer',updatedAt:'broken'}}},QUESTIONS));
 assert.deepEqual(validateModels({version:1,entries:{q999:{text:'unknown',updatedAt:'2026-10-07',revisions:[]}}},QUESTIONS),emptyModels());
});
test('quota errors retain active model answer instead of reporting a successful save',()=>{
 const current=setModel(emptyModels(),'q001','保存済み','2026-10-07T04:00:00Z'),next=setModel(current,'q001','新しい文章','2026-10-07T05:00:00Z');
 assert.throws(()=>persistModels({setItem(){throw new Error('QuotaExceededError')}},next));assert.equal(current.entries.q001.text,'保存済み');
 const storage=new Map();persistModels({setItem:(k,v)=>storage.set(k,v)},next);assert.equal(JSON.parse(storage.get(MODEL_KEY)).entries.q001.text,'新しい文章');
});
