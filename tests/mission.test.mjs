import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSync } from 'esbuild';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const dir=mkdtempSync(join(tmpdir(),'team-architect-test-'));
buildSync({entryPoints:['src/core/mission.ts','src/core/storage.ts','src/core/data.ts','src/core/workPlan.ts'],bundle:true,platform:'node',format:'esm',outdir:dir});
const {createMission,blankBrief,validateMission,activationIssues,instructionStyle,classify,fit}=await import(pathToFileURL(join(dir,'mission.js')));
const {loadStore,saveStore,parseStore,mergeStore,STORE_KEY,BACKUP_KEY}=await import(pathToFileURL(join(dir,'storage.js')));
const {people,typeBook}=await import(pathToFileURL(join(dir,'data.js')));
process.on('exit',()=>rmSync(dir,{recursive:true,force:true}));
const brief={...blankBrief,issue:'競合店のリニューアルに対抗して夜稼働を上げたい'};
const storage=(initial={})=>{const data=new Map(Object.entries(initial));return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),data};};
const complete={...brief,goal:'夜の稼働低下を止める',deadline:'2026-10-13T18:00',checkpoint:'2026-10-07T12:00'};
const snapshot=m=>({schemaVersion:2,missions:[m],overrides:{},legacy:{history:null,capabilities:null}});
test('night mission preserves input, unknown values and meaningful commands',()=>{const m=createMission(brief);assert.equal(m.brief.issue,brief.issue);assert.equal(m.kind,'sales');assert.equal(m.brief.target,'');assert.ok(m.analysis.unknowns.includes('KPIの目標値'));assert.deepEqual(validateMission(m),[]);assert.ok(m.commands.every(c=>c.actions.length>=3&&c.due===''&&c.done&&c.output&&c.consult&&c.immediate));});
test('reporting hierarchy is independent of preceding workflow owner',()=>{const m=createMission(complete);const lead=m.team.find(x=>x.role==='LEADER');assert.equal(lead.reportsTo,'maesaki');assert.ok(m.team.filter(x=>x.role==='MEMBER').every(x=>x.reportsTo===lead.memberId));assert.ok(m.commands.some((c,i)=>i>0&&c.issuer!==m.commands[i-1].owner));assert.deepEqual(activationIssues(m),[]);});
test('incomplete draft cannot activate',()=>assert.ok(activationIssues(createMission(brief)).some(x=>x.includes('期限'))));
test('participation constraints exclude unavailable execution members',()=>{const m=createMission({...complete,excluded:['matsuo','hattori']});assert.ok(m.commands.every(c=>!['matsuo','hattori'].includes(c.owner)));assert.deepEqual(validateMission(m),[]);});
test('no implicit delegation if commander absent or all execution candidates unavailable',()=>{assert.throws(()=>createMission({...complete,excluded:['maesaki']}));assert.throws(()=>createMission({...complete,excluded:people.filter(x=>x.id!=='maesaki').map(x=>x.id)}));});
test('real ability overrides change assignment, independent of MBTI',()=>{const o={};for(const p of people.filter(x=>x.id!=='maesaki'))for(let n=1;n<=18;n++)o[p.id+':'+n]=p.id==='asano'?'strong':'growth';const m=createMission(complete,o);assert.equal(m.commands[0].owner,'asano');for(const p of people){assert.equal(fit(p,'ANALYZE',o),fit({...p,mbti:'ENTP'},'ANALYZE',o));}});
test('all 256 directed MBTI instruction combinations have usable non-scored guidance',()=>{for(const a of typeBook)for(const b of typeBook){const x=instructionStyle(a.mbti,b.mbti);assert.ok(x.includes('本人の希望'));assert.ok(x.length>30);assert.ok(!x.includes('%'));}assert.notEqual(instructionStyle('ENTJ','INFP'),instructionStyle('INFP','ENTJ'));});
test('classification covers diverse work and blank input rejected',()=>{assert.equal(classify('スタッフ育成'),'people');assert.equal(classify('重大クレーム'),'service');assert.equal(classify('大型新台入替'),'machine');assert.equal(classify('POP販促'),'promo');assert.throws(()=>createMission({...brief,issue:' '}));});
test('hierarchy cycles, self-report and unknown command people rejected',()=>{const m=createMission(complete);m.team.find(x=>x.role==='LEADER').reportsTo=m.team.find(x=>x.role==='LEADER').memberId;assert.ok(validateMission(m).some(x=>x.includes('循環')));const n=createMission(complete);n.commands[0].issuer='unknown';assert.throws(()=>parseStore(JSON.stringify(snapshot(n))));});
test('dependency cycle and malformed command data rejected without writes',()=>{const m=createMission(complete);m.commands[0].dependsOn=[m.commands.at(-1).id];assert.ok(validateMission(m).some(x=>x.includes('工程依存に循環')));const x=snapshot(createMission(complete));x.missions[0].commands[0].actions=null;assert.throws(()=>parseStore(JSON.stringify(x)));});
test('invalid dates and duplicate mission IDs rejected',()=>{const x=snapshot(createMission(complete));x.missions[0].commands[0].due='not-a-date';assert.throws(()=>parseStore(JSON.stringify(x)));const y=snapshot(createMission(complete));y.missions.push(y.missions[0]);assert.throws(()=>parseStore(JSON.stringify(y)));});
test('legacy history and overrides are copied with stable IDs and untouched original keys',()=>{const history=JSON.stringify(Array.from({length:35},(_,id)=>({id,issue:'旧記録'})));const caps='{"1-3":"growth"}';const s=storage({'team-architect-history':history,'team-architect-capabilities':caps});const next=loadStore(s);assert.equal(next.overrides['matsuo:3'],'growth');assert.equal(next.legacy.history,history);saveStore(s,next);assert.equal(s.getItem('team-architect-history'),history);assert.equal(s.getItem('team-architect-capabilities'),caps);assert.equal(JSON.parse(s.getItem(BACKUP_KEY)).history,history);});
test('mission and task state survive reload and JSON roundtrip',()=>{const m=createMission(complete);m.commands[0].status='done';m.commands[0].evidence='比較表を店長へ提出';m.notes='現場の反応を確認';const s=storage();saveStore(s,snapshot(m));assert.deepEqual(loadStore(s),snapshot(m));assert.deepEqual(parseStore(JSON.stringify(loadStore(s))),snapshot(m));});
test('corrupt saved data is never overwritten',()=>{const s=storage({[STORE_KEY]:'broken'});assert.throws(()=>loadStore(s));assert.throws(()=>saveStore(s,snapshot(createMission(complete))));assert.equal(s.getItem(STORE_KEY),'broken');});
test('quota failure propagates and previous snapshot is retained',()=>{const old=JSON.stringify(snapshot(createMission(complete)));const s=storage({[STORE_KEY]:old,[BACKUP_KEY]:'{}'});s.setItem=()=>{throw new Error('quota')};assert.throws(()=>saveStore(s,snapshot(createMission(complete))),/quota/);assert.equal(s.getItem(STORE_KEY),old);});
test('imports append missions, retain current assessments and reject duplicates',()=>{const a=snapshot(createMission(complete));a.overrides={'matsuo:3':'strong'};const b=snapshot(createMission(complete));b.overrides={'matsuo:3':'growth'};const x=mergeStore(a,b);assert.equal(x.missions.length,2);assert.equal(x.overrides['matsuo:3'],'strong');assert.throws(()=>mergeStore(a,a));});

test('task-specific plans distinguish staff guide training, queues, cleaning and handover',()=>{
 const training=createMission({...blankBrief,issue:'新人が一人でお客様をご案内できるようにしたい'});
 assert.equal(training.kind,'people');assert.deepEqual(training.commands.map(c=>c.fn),['COACH','REVIEW']);assert.match(training.commands.find(c=>c.fn==='COACH').actions.join(' '),/実際の案内手順/);assert.match(training.commands.find(c=>c.fn==='COACH').done,/実演/);
 const queue=createMission({...blankBrief,issue:'スタッフがお客様の案内待ちを減らしたい'});assert.equal(queue.kind,'service');assert.match(queue.commands[0].actions[0],/案内開始の時刻/);assert.ok(queue.commands.some(c=>c.fn==='FIELD'));assert.ok(!queue.commands.some(c=>c.fn==='COACH'));
 const cleaning=createMission({...blankBrief,issue:'トイレの清掃漏れをなくす'});assert.deepEqual(cleaning.commands.map(c=>c.fn),['FIELD','REVIEW']);assert.match(cleaning.commands[0].actions[0],/便器周辺・洗面台・床/);assert.match(cleaning.commands[0].actions.join(' '),/清掃・備品補充・終了点検/);assert.ok(!cleaning.commands.some(c=>c.fn==='CREATE'));
 const handover=createMission({...blankBrief,issue:'スタッフ間の引継ぎ漏れをなくす'});assert.deepEqual(handover.commands.map(c=>c.fn),['TRANSLATE','OPERATE','REVIEW']);assert.match(handover.commands[0].actions.join(' '),/未完了事項/);
 for(const m of [training,queue,cleaning,handover]){assert.deepEqual(validateMission(m),[]);assert.equal(m.brief.deadline,'');assert.deepEqual(parseStore(JSON.stringify(snapshot(m))),snapshot(m));}
});
test('unsupported goals get a confirmation plan, never an invented sales or advertising campaign',()=>{
 const m=createMission({...blankBrief,issue:'会議を短くしたい',constraints:'追加予算なし、顧客対応を優先'});assert.equal(m.kind,'general');assert.match(m.analysis.hypothesis,/一致しません/);assert.deepEqual(parseStore(JSON.stringify(snapshot(m))),snapshot(m));assert.deepEqual(m.commands.map(c=>c.fn),['ANALYZE','DESIGN','OPERATE','REVIEW']);assert.ok(!m.commands.flatMap(c=>c.actions).join(' ').match(/稼働|POP|販促|売上/));assert.ok(m.commands.every(c=>c.discretion.includes(m.brief.constraints)));assert.ok(m.commands.find(c=>c.fn==='DESIGN').actions.includes('守る条件：追加予算なし、顧客対応を優先。条件と両立しない案は実行せず相談する'));assert.equal(m.brief.target,'');assert.deepEqual(validateMission(m),[]);
});
test('explicit goal helps select a template while source and user text remain intact',()=>{
 const b={...blankBrief,issue:'今の課題を改善したい',goal:'新人の案内を一人でできるようにする',source:'本人と現場責任者の観察メモ'};const m=createMission(b);assert.equal(m.kind,'people');assert.equal(m.brief.issue,b.issue);assert.ok(m.commands[0].actions.some(a=>a.includes(b.source)));assert.ok(m.commands.every(c=>c.purpose===b.goal));assert.equal(m.analysis.success,b.goal);
});

test('clarification is optional only for vague topics and never modifies supplied instructions',async()=>{
 const {clarificationFor,shortAction}=await import(pathToFileURL(join(dir,'workPlan.js')));
 assert.ok(clarificationFor('今の課題を改善したい'));assert.ok(clarificationFor('スタッフ育成を進めたい'));assert.equal(clarificationFor('新人が一人でお客様をご案内できるようにしたい'),'');assert.equal(clarificationFor('トイレの清掃漏れをなくす'),'');assert.equal(clarificationFor(''),'');
 assert.equal(shortAction('「清掃漏れをなくす」：終了点検をする','清掃漏れをなくす'),'終了点検をする');assert.equal(shortAction('本人が書き直した指示','清掃漏れをなくす'),'本人が書き直した指示');
});

test('two-step routine plans retain conditions and checks while broad work keeps coordination',()=>{
 for(const issue of ['新人の案内練習','トイレの清掃漏れをなくす']){
  const m=createMission({...blankBrief,issue,goal:'本人と実施結果を確認する',constraints:'追加予算なし',deadline:'2026-11-01T18:00',checkpoint:'2026-10-31T12:00'});
  assert.equal(m.commands.length,2);assert.equal(m.commands[0].dependsOn.length,0);assert.deepEqual(m.commands[1].dependsOn,[m.commands[0].id]);assert.deepEqual(validateMission(m),[]);
  assert.match(m.analysis.hypothesis,/2工程/);assert.ok(!m.commands.some(c=>c.fn==='OPERATE'));assert.match(m.commands[1].actions.join(' '),/未確認|確認していない/);
  for(const c of m.commands){assert.equal(c.due,m.brief.deadline);assert.match(c.discretion,/追加予算なし/);assert.ok(c.reportWhen.includes(m.brief.checkpoint));assert.ok(c.done&&c.consult&&c.immediate);}
  assert.deepEqual(parseStore(JSON.stringify(snapshot(m))),snapshot(m));
 }
 for(const issue of ['新人の接客研修の全体計画','スタッフ育成','新人の案内手順を分析したい'])assert.equal(createMission({...blankBrief,issue}).commands.length,4);
 for(const issue of ['トイレ清掃の人員配置を見直したい','複数箇所の清掃計画','清掃業務を改善したい'])assert.equal(createMission({...blankBrief,issue}).commands.length,3);
});
test('loading a saved four-step training plan never regenerates it as a routine',()=>{const old=createMission({...blankBrief,issue:'新人の案内研修の全体計画'});old.brief.issue='新人の案内練習';old.commands[0].evidence='既存の観察記録';const data=snapshot(old);const loaded=parseStore(JSON.stringify(data));assert.deepEqual(loaded,data);assert.equal(loaded.missions[0].commands.length,4);});
test('directives name observable work and submission fields instead of only asking for coordination',()=>{
 const training=createMission({...blankBrief,issue:'新人の案内練習'});assert.match(training.commands[0].actions.join(' '),/お客様役|声かけ→行き先の確認→案内/);assert.match(training.commands[0].output,/自力でできたこと.*助けが必要なこと/);
 const cleaning=createMission({...blankBrief,issue:'トイレ清掃'});assert.match(cleaning.commands[0].actions[0],/便器周辺・洗面台・床/);assert.match(cleaning.commands[0].output,/終了時刻.*残った問題/);
 const sales=createMission({...blankBrief,issue:'朝稼働の改善',source:'社内の日別実績表',period:'10月1日〜7日',constraints:'追加予算なし'});assert.match(sales.commands[0].actions.join(' '),/社内の日別実績表.*10月1日〜7日/);assert.match(sales.commands[0].output,/曜日.*時間帯.*今回実績.*比較実績.*出所/);assert.match(sales.commands[1].output,/人手・費用/);assert.match(sales.commands[1].actions.join(' '),/追加予算なし/);assert.ok(!sales.commands[0].actions[0].includes('夜'));
 const handover=createMission({...blankBrief,issue:'引継ぎ漏れ'});assert.match(handover.commands[0].output,/次の担当.*期限.*相談先.*受領確認/);
 for(const m of [training,cleaning,sales,handover]){assert.deepEqual(validateMission(m),[]);assert.equal(m.brief.deadline,'');assert.deepEqual(parseStore(JSON.stringify(snapshot(m))),snapshot(m));}
});
test('capability changes alter selection and add support without judging ability from MBTI',()=>{
 const b={...blankBrief,issue:'新人の案内練習'};const override=Object.fromEntries(people.filter(p=>p.id!=='maesaki').flatMap(p=>Array.from({length:18},(_,i)=>[p.id+':'+(i+1),'growth'])));
 const supported=createMission(b,override);assert.ok(supported.commands.every(c=>c.actions.some(a=>a.includes('支援前提の能力項目'))));
 for(let n=1;n<=18;n++)override['miyamoto:'+n]='strong';const skilled=createMission(b,override);assert.equal(skilled.commands.find(c=>c.fn==='COACH').owner,'miyamoto');assert.ok(skilled.commands.every(c=>!c.actions.some(a=>a.includes('支援前提の能力項目'))));
 const unknown=Object.fromEntries(Object.keys(override).map(key=>[key,'unknown']));assert.ok(createMission(b,unknown).commands.every(c=>c.actions.some(a=>a.includes('未評価の項目'))));
 const p=people.find(p=>p.id==='miyamoto');assert.equal(fit({...p,mbti:'INTJ'},'COACH',override),fit({...p,mbti:'ESFP'},'COACH',override));assert.deepEqual(validateMission(supported),[]);
});
