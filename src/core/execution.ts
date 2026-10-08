import { people } from './data';
import { commandText, instructionStyle, validateMission, type Command, type Mission } from './mission';

export type Observation = { id:string; value:number; observedAt:string; period:string; source:string; recordedBy:string; recordedAt:string };
export type Decision = { id:string; title:string; detail:string; commandId:string|null; raisedBy:string; owner:string; urgency:'normal'|'immediate'; due:string; status:'open'|'resolved'; resolution:string; resolvedBy:string; createdAt:string; resolvedAt:string };
export type Change = { id:string; commandId:string|null; actor:string; reason:string; before:string; after:string; at:string };
export type Execution = { version:1; direction:'increase'|'decrease'|null; observations:Observation[]; decisions:Decision[]; changes:Change[] };
export const executionOf=(m:Mission):Execution=>m.execution??{version:1,direction:null,observations:[],decisions:[],changes:[]};
export const timestamp=(x:string)=>x?Date.parse(x+'+09:00'):NaN;
export const isOverdue=(c:Command,now=Date.now())=>c.status!=='done'&&Number.isFinite(timestamp(c.due))&&timestamp(c.due)<now;
export const waitingOn=(m:Mission,c:Command)=>c.dependsOn.filter(id=>m.commands.find(p=>p.id===id)?.status!=='done');
export function actionable(m:Mission):Command[]{return m.commands.filter(c=>(c.status==='todo'||c.status==='doing')&&!waitingOn(m,c).length).sort((a,b)=>Number(b.status==='doing')-Number(a.status==='doing')||(timestamp(a.due)||Infinity)-(timestamp(b.due)||Infinity));}
export function numericTarget(x:string):number|null {const s=x.trim();const n=Number(s.replace(/[%％]/g,''));return /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)\s*[%％]?$/.test(s)&&Number.isFinite(n)?n:null;}
export function kpiComparison(m:Mission){const e=executionOf(m);const latest=[...e.observations].sort((a,b)=>timestamp(b.observedAt)-timestamp(a.observedAt)||Date.parse(b.recordedAt)-Date.parse(a.recordedAt))[0];const target=numericTarget(m.brief.target);if(!latest||target===null||!e.direction)return {latest,target,gap:null,achieved:null};return {latest,target,gap:latest.value-target,achieved:e.direction==='increase'?latest.value>=target:latest.value<=target};}
function withExecution(m:Mission,e:Execution):Mission{return {...m,execution:e};}
function id(){return globalThis.crypto.randomUUID();}
const hasPerson=(x:string)=>people.some(p=>p.id===x);
const hasTeam=(m:Mission,x:string)=>m.team.some(p=>p.memberId===x);
const required=(x:string)=>typeof x==='string'&&!!x.trim();
const date=(x:string)=>required(x)&&Number.isFinite(Date.parse(x));
const object=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
export function validateExecution(m:Mission):string[] {
 if(m.execution===undefined)return [];
 const e:unknown=m.execution;
 if(!object(e)||e.version!==1||![null,'increase','decrease'].includes(e.direction as null)||!Array.isArray(e.observations)||!Array.isArray(e.decisions)||!Array.isArray(e.changes))return ['実行記録の形式が不正です'];
 const errors:string[]=[];const ids=new Set<string>();
 const unique=(x:Record<string,unknown>)=>{if(!required(x.id as string)||ids.has(x.id as string))errors.push('実行記録IDが不正・重複しています');ids.add(x.id as string);};
 for(const x of e.observations){if(!object(x)){errors.push('KPI記録が不正です');continue;}unique(x);if(typeof x.value!=='number'||!Number.isFinite(x.value)||!Number.isFinite(timestamp(x.observedAt as string))||!required(x.period as string)||!required(x.source as string)||!hasPerson(x.recordedBy as string)||!date(x.recordedAt as string))errors.push('KPI記録の必須情報が不正です');}
 for(const x of e.decisions){if(!object(x)){errors.push('判断記録が不正です');continue;}unique(x);if(!required(x.title as string)||!required(x.detail as string)||!hasTeam(m,x.raisedBy as string)||!hasTeam(m,x.owner as string)||!['normal','immediate'].includes(x.urgency as string)||!['open','resolved'].includes(x.status as string)||typeof x.due!=='string'||(x.due&&!Number.isFinite(timestamp(x.due)))||!date(x.createdAt as string)||!(x.commandId===null||m.commands.some(c=>c.id===x.commandId))||typeof x.resolution!=='string'||typeof x.resolvedBy!=='string'||typeof x.resolvedAt!=='string'||(x.status==='resolved'&&(!required(x.resolution)||!hasTeam(m,x.resolvedBy)||!date(x.resolvedAt))))errors.push('判断記録の必須情報が不正です');}
 for(const x of e.changes){if(!object(x)){errors.push('変更履歴が不正です');continue;}unique(x);if(!hasTeam(m,x.actor as string)||!required(x.reason as string)||typeof x.before!=='string'||typeof x.after!=='string'||!date(x.at as string)||!(x.commandId===null||m.commands.some(c=>c.id===x.commandId)))errors.push('変更履歴の必須情報が不正です');}
 return [...new Set(errors)];
}
export function recordObservation(m:Mission,input:Omit<Observation,'id'|'recordedAt'>,direction:Execution['direction'],now=new Date()):Mission {if(!direction)throw new Error('KPIの達成方向を選んでください。');const e=executionOf(m);const next=withExecution(m,{...e,direction,observations:[...e.observations,{...input,id:id(),recordedAt:now.toISOString()}]});const errors=validateExecution(next);if(errors.length)throw new Error(errors.join('／'));return next;}
export function raiseDecision(m:Mission,input:Pick<Decision,'title'|'detail'|'commandId'|'raisedBy'|'urgency'|'due'>,hold:boolean,now=new Date()):Mission {
 const e=executionOf(m);const command=m.commands.find(c=>c.id===input.commandId);if(hold&&(!command||command.status==='done'))throw new Error('完了済みの指示は保留にできません。');
 const owner=input.urgency==='immediate'?m.team.find(t=>t.role==='COMMANDER')!.memberId:command?.reportTo||m.team.find(t=>t.role==='COMMANDER')!.memberId;
 let next=withExecution(m,{...e,decisions:[...e.decisions,{...input,id:id(),owner,status:'open',resolution:'',resolvedBy:'',createdAt:now.toISOString(),resolvedAt:''}]});
 if(hold&&command)next=reviseCommand(next,{...command,status:'blocked'},input.raisedBy,'相談により保留：'+input.title,now);
 const errors=validateExecution(next);if(errors.length)throw new Error(errors.join('／'));return next;
}
export function resolveDecision(m:Mission,decisionId:string,resolution:string,actor:string,now=new Date()):Mission {const e=executionOf(m);const d=e.decisions.find(x=>x.id===decisionId);if(!d||d.status!=='open'||!required(resolution)||actor!==d.owner)throw new Error('指定された判断者と、具体的な判断・次の行動を記録してください。');return withExecution(m,{...e,decisions:e.decisions.map(x=>x.id===decisionId?{...x,status:'resolved',resolution:resolution.trim(),resolvedBy:actor,resolvedAt:now.toISOString()}:x)});}
export function reviseCommand(m:Mission,edited:Command,actor:string,reason:string,now=new Date()):Mission {
 const old=m.commands.find(c=>c.id===edited.id);if(!old||!hasTeam(m,actor)||!required(reason))throw new Error('変更者と変更理由が必要です。');
 if(old.status==='done'&&old.owner!==edited.owner)throw new Error('完了済みの担当は変更できません。');
 const assignment=m.team.find(t=>t.memberId===edited.owner);if(!assignment?.reportsTo)throw new Error('実行担当を選んでください。');
 if(edited.status==='done'&&(!required(edited.evidence)||waitingOn(m,edited).length))throw new Error('完了には先行成果物の完了と成果物・確認結果が必要です。');
 if(edited.status==='doing'&&waitingOn(m,edited).length)throw new Error('先行成果物が未完了のため着手できません。');
 if(old.status==='done'&&edited.status!=='done'&&m.commands.some(c=>c.dependsOn.includes(old.id)&&['doing','done'].includes(c.status)))throw new Error('後続が実行・完了中です。先行指示を戻す前に後続を確認してください。');
 const owner=people.find(p=>p.id===edited.owner)!;const issuer=people.find(p=>p.id===assignment.reportsTo)!;
 const c={...edited,issuer:issuer.id,reportTo:issuer.id,style:old.owner===edited.owner?edited.style:instructionStyle(issuer.mbti,owner.mbti),reason:old.owner===edited.owner?edited.reason:'手動引継ぎ：'+reason+'。登録評価と稼働余力の確認が必要。',version:old.version+1};
 const commands=m.commands.map(x=>x.id===c.id?c:x);const team=m.team.map(t=>({...t,functions:commands.filter(c=>c.owner===t.memberId).map(c=>c.fn)}));
 const e=executionOf(m);const next={...m,commands,team,execution:{...e,changes:[...e.changes,{id:id(),commandId:c.id,actor,reason:reason.trim(),before:commandText(old)+'\n状態：'+old.status+'\n確認記録：'+old.evidence+'\n選定理由：'+old.reason+'\n先行指示：'+old.dependsOn.join('、')+'\n優先度：'+old.priority+'\n版：'+old.version,after:commandText(c)+'\n状態：'+c.status+'\n確認記録：'+c.evidence+'\n選定理由：'+c.reason+'\n先行指示：'+c.dependsOn.join('、')+'\n優先度：'+c.priority+'\n版：'+c.version,at:now.toISOString()}]}};
 const errors=[...validateMission(next),...validateExecution(next)];if(errors.length)throw new Error(errors.join('／'));return next;
}
export function updateConditions(m:Mission,brief:Mission['brief'],applyCommands:boolean,actor:string,reason:string,now=new Date()):Mission {
 if(!required(reason)||!hasTeam(m,actor))throw new Error('変更理由と記録者が必要です。');
 if(executionOf(m).observations.length&&m.brief.kpi!==brief.kpi)throw new Error('実績記録済みのKPI定義は変更できません。別ミッションで管理してください。');
 if(!required(brief.goal)||!Number.isFinite(timestamp(brief.deadline))||!Number.isFinite(timestamp(brief.checkpoint)))throw new Error('目的・期限・次回確認日時を設定してください。');
 const unknownFields:Record<string,keyof Mission['brief']>={'最終的に達成したい状態':'goal','具体的な期限':'deadline','KPIの定義・単位':'kpi','KPIの現状値':'baseline','KPIの目標値':'target','データ取得元':'source','観測期間':'period','次回チェックポイント':'checkpoint'};
 const e=executionOf(m);let next:Mission={...m,brief:{...brief,excluded:[...m.brief.excluded]},analysis:{...m.analysis,success:brief.goal,unknowns:[...Object.entries(unknownFields).filter(([,key])=>!brief[key]).map(([label])=>label),...m.analysis.unknowns.filter(x=>!(x in unknownFields))]},execution:{...e,changes:[...e.changes,{id:id(),commandId:null,actor,reason,before:JSON.stringify(m.brief,null,2),after:JSON.stringify(brief,null,2),at:now.toISOString()}]}};
 if(applyCommands){for(const c of m.commands.filter(c=>c.status!=='done'))next=reviseCommand(next,{...c,due:brief.deadline,purpose:brief.goal,reportWhen:`中間報告：${brief.checkpoint}（日本時間）。完了時・遅延見込み時にも報告。`},actor,reason,now);}
 const errors=[...validateMission(next),...validateExecution(next)];if(errors.length)throw new Error(errors.join('／'));return next;
}
