import test from 'node:test';import assert from 'node:assert/strict';
import {parseQuestionImport,parseDelimited,planQuestionImport,applyQuestionImport,parseQuestionDate,validateImportEntry,readQuestionFile} from '../public/interview/question-import.js';
import {emptyLibrary,materializeQuestions} from '../public/interview/question-library.js';
import {scopedQuestions} from '../public/interview/study-scope.js';
const base=[{id:'q001',q:'店長とは？',answer:'元の回答',m:'take',askedOn:'',followups:[]}];
const defaults={m:'take',kind:'past',askedOn:'',category:'その他',src:''};
test('Q/A text preserves multiline answers and handles per-interview date, role and source metadata',()=>{
 const entries=parseQuestionImport('出典：面接メモ\n2026年10月16日\n面接官：武山部長\nQ1：店長とは？\nA1：結果と人です。\n具体的な行動を続けます。\n\nQ2：なぜですか？\nA：経験からです。\n日付：2025/5/3\n面接官：社長\nQ：利益は？',defaults);
 assert.equal(entries.length,3);assert.equal(entries[0].askedOn,'2026-10-16');assert.equal(entries[0].answer,'結果と人です。\n具体的な行動を続けます。');assert.equal(entries[0].src,'面接メモ');assert.equal(entries[2].m,'pres');assert.equal(entries[2].askedOn,'2025-05-03');assert.equal(entries[2].answer,'');
});
test('CSV and Excel paste preserve quoted commas, quotes, embedded newlines and Japanese columns',()=>{
 const csv='質問,回答,出題日,面接官\n"どの数字？","利益,稼働\n""両方""です",2026/10/16,社長';const e=parseQuestionImport(csv,defaults,'csv')[0];assert.equal(e.answer,'利益,稼働\n"両方"です');assert.equal(e.m,'pres');assert.equal(e.askedOn,'2026-10-16');
 assert.equal(parseQuestionImport('質問\t回答\n質問1\t答え1\n質問2\t答え2',defaults).length,2);assert.equal(parseQuestionImport('質問1\t回答1\n質問2\t回答2',defaults)[1].answer,'回答2');assert.equal(parseQuestionImport('質問1,回答1',defaults,'csv')[0].q,'質問1');assert.throws(()=>parseDelimited('"閉じていない',','));
});
test('numbered and one-question-per-line lists keep separate questions without inventing answers or dates',()=>{
 assert.equal(parseQuestionImport('1. 店長の役割\n2. 部下の育成',defaults).length,2);const items=parseQuestionImport('店長の役割\n部下の育成',defaults);assert.equal(items.length,2);assert.equal(items[1].answer,'');assert.equal(items[1].askedOn,'');assert.throws(()=>parseQuestionImport('A：質問がない回答',defaults));
});
test('invalid dates and unknown roles are visible validation failures; partial dates never become invented days',()=>{
 assert.equal(parseQuestionDate('2024年2月29日'),'2024-02-29');for(const s of ['2026/2/30','2026年10月','2026'])assert.throws(()=>parseQuestionDate(s));const e=parseQuestionImport('質問,回答,出題日,面接官\n内容,回答,2026/2/30,役員',defaults,'csv')[0];assert.ok(validateImportEntry(e));assert.equal(e.askedOn,'2026/2/30');assert.equal(e.m,'invalid');
});
test('matching records and duplicates default to unchecked; explicit updates preserve IDs and source base',()=>{
 const raw=parseQuestionImport('Q：店長とは？\nA：新回答\nQ：新しい質問？\nA：答え\nQ：新しい質問？\nA：重複',defaults),plan=planQuestionImport(raw,base);assert.equal(plan[0].selected,false);assert.equal(plan[1].selected,true);assert.equal(plan[2].selected,false);
 plan[0].selected=true;const result=applyQuestionImport(emptyLibrary(),base,base,plan,'2026-10-16T12:00:00Z',()=> '11111111-1111-4111-8111-111111111111');assert.equal(result.ids[0],'q001');assert.equal(result.library.entries.q001.answer,'新回答');assert.equal(base[0].answer,'元の回答');assert.equal(result.ids.length,2);
 const repeated=planQuestionImport(raw,materializeQuestions(base,result.library));assert.equal(repeated.filter(e=>e.selected).length,0);
});
test('invalid or colliding rows reject the whole batch without mutating earlier answers; concurrent matches need a new review',()=>{
 const library=emptyLibrary(),plan=planQuestionImport(parseQuestionImport('質問1\n質問2',defaults),base);plan[1].askedOn='bad';assert.throws(()=>applyQuestionImport(library,base,base,plan));assert.deepEqual(library,emptyLibrary());
 const duplicates=planQuestionImport(parseQuestionImport('Q：同じ質問\nQ：同じ質問',defaults),base);duplicates[1].selected=true;assert.throws(()=>applyQuestionImport(library,base,base,duplicates));
 const fresh=planQuestionImport(parseQuestionImport('Q：店長とは？',defaults),[]);assert.throws(()=>applyQuestionImport(library,base,base,fresh),/別の画面/);
});
test('batch limits and file types fail clearly; UTF-8 BOM and Shift-JIS CSV decode locally',async()=>{
 assert.throws(()=>parseQuestionImport(Array.from({length:301},(_,i)=>`Q：質問${i}`).join('\n'),defaults));assert.throws(()=>parseQuestionImport('{"version":3}',defaults),/バックアップ/);
 const utf8=new TextEncoder().encode('\uFEFF質問,回答');assert.equal((await readQuestionFile({name:'list.csv',size:utf8.length,arrayBuffer:async()=>utf8.buffer})).replace(/^\uFEFF/,''),'質問,回答');
 const sjis=Uint8Array.from([0x8e,0xbf,0x96,0xe2]);assert.equal(await readQuestionFile({name:'list.csv',size:4,arrayBuffer:async()=>sjis.buffer}),'質問');await assert.rejects(()=>readQuestionFile({name:'questions.pdf',size:10}),/PDF/);
});
test('scope and role selection separates past, personal and weak questions, including newly imported batches',()=>{
 const q=[{id:'q001',m:'take',kind:'unconfirmed'},{id:'u-new',m:'pres',kind:'past'},{id:'q003',m:'pres',kind:'assumed'}],state={records:{q003:{grade:'weak'}}};assert.equal(scopedQuestions(q,{type:'all',ids:[]},state,'president').length,2);assert.equal(scopedQuestions(q,{type:'past',ids:[]},state)[0].id,'u-new');assert.equal(scopedQuestions(q,{type:'personal',ids:[]},state)[0].id,'u-new');assert.equal(scopedQuestions(q,{type:'weak',ids:[]},state)[0].id,'q003');assert.equal(scopedQuestions(q,{type:'selection',ids:['q001']},state,'president').length,0);
});
