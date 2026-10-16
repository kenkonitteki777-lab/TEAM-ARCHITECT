import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyLibrary,putQuestion,validateLibrary,mergeLibraries,materializeQuestions,filterQuestions,validQuestionDate} from '../public/interview/question-library.js';
import {validateBackup,emptyState} from '../public/interview/engine.js';
import {validateModels,emptyModels,setModel} from '../public/interview/model-store.js';
const base=[{id:'q001',q:'元の質問',answer:'元回答',m:'take',category:'人材',followups:[],priority:1}];
const id='u-11111111-1111-4111-8111-111111111111';
const entry={q:'追加質問',answer:'本人回答',m:'pres',kind:'past',askedOn:'2026-10-16',category:'利益',src:'本人記録'};
test('personal questions and original-question edits retain stable IDs and leave published source intact',()=>{
 let store=putQuestion(emptyLibrary(),base,id,entry,'2026-10-16T00:00:00Z');store=putQuestion(store,base,'q001',{...entry,q:'修正質問',askedOn:''},'2026-10-16T01:00:00Z');
 const list=materializeQuestions(base,store);assert.equal(list.length,2);assert.equal(list[0].id,'q001');assert.equal(list[0].q,'修正質問');assert.equal(base[0].q,'元の質問');assert.equal(list[1].answer,'本人回答');assert.equal(list[1].followups.length,0);
 assert.deepEqual(validateLibrary(JSON.parse(JSON.stringify(store)),base),store);
});
test('dates never normalize invalid days and undated source questions stay undated and unconfirmed',()=>{
 for(const v of ['2026-02-30','2026-13-01','2026-2-01','2025-02-29','junk'])assert.equal(validQuestionDate(v),false);
 assert.equal(validQuestionDate('2024-02-29'),true);assert.equal(validQuestionDate(''),true);
 const original=materializeQuestions(base,emptyLibrary())[0];assert.equal(original.askedOn,'');assert.equal(original.kind,'unconfirmed');
 assert.throws(()=>putQuestion(emptyLibrary(),base,id,{...entry,askedOn:'2026-02-30'}));assert.throws(()=>validateLibrary({version:1,entries:{__bad:entry}},base));
});
test('date filters use interview dates, sort newest first, and keep unknown dates separate',()=>{
 const questions=[{...entry,id:'a'},{...entry,id:'b',askedOn:'2025-10-01'},{...entry,id:'c',askedOn:'',kind:'assumed'}];
 assert.deepEqual(filterQuestions(questions).map(q=>q.id),['a','b','c']);assert.deepEqual(filterQuestions(questions,{year:'2026',month:'10',day:'2026-10-16',kind:'past',role:'pres',search:'本人回答'}).map(q=>q.id),['a']);
 assert.deepEqual(filterQuestions(questions,{year:'unknown'}).map(q=>q.id),['c']);assert.equal(filterQuestions(questions,{year:'2025',day:'2026-10-16'}).length,0);
});
test('backups restore custom questions before validating associated answers and attempt history',()=>{
 const library=putQuestion(emptyLibrary(),base,id,entry,'2026-10-16T00:00:00Z'),questions=materializeQuestions(base,library);
 const state=emptyState();state.records[id]={answer:'練習回答',updatedAt:'2026-10-16T01:00:00Z'};state.history=[{id:'attempt',questionId:id,answer:'練習回答'}];
 const models=setModel(emptyModels(),id,'編集回答');const backup=JSON.parse(JSON.stringify({...state,modelAnswers:models,questionLibrary:library}));
 const restored=materializeQuestions(base,validateLibrary(backup.questionLibrary,base));assert.equal(validateBackup(backup,restored).history[0].answer,'練習回答');assert.equal(validateModels(backup.modelAnswers,restored).entries[id].text,'編集回答');
 const newer=putQuestion(library,base,id,{...entry,answer:'更新回答'},'2026-10-16T02:00:00Z');assert.equal(mergeLibraries(newer,library).entries[id].answer,'更新回答');assert.equal(mergeLibraries(library,newer).entries[id].answer,'更新回答');
});
