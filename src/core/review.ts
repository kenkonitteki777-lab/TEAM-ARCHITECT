import { executionOf, kpiComparison, reviseCommand } from './execution';
import { specs, type FunctionKey, type Mission } from './mission';

export type Review={id:string;at:string;actor:string;result:string;evidence:string;cause:string;nextAction:string;condition:string;fn:FunctionKey;outcome:'continue'|'adjust'|'stop'};
export type LearningApplication={sourceMissionId:string;sourceIssue:string;sourceReviewId:string;appliedAt:string;fn:FunctionKey;action:string;condition:string;evidence:string;before:string[];after:string[]};
const object=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const text=(x:unknown)=>typeof x==='string'&&!!x.trim()&&x.length<=10000;
const date=(x:unknown)=>typeof x==='string'&&Number.isFinite(Date.parse(x));
export function validateReview(m:Mission):string[]{
 const errors:string[]=[];
 if(m.reviews!==undefined){
  if(!Array.isArray(m.reviews))return ['振り返りの形式が不正です'];
  const ids=new Set<string>();
  for(const r of m.reviews){if(!object(r)||!(['id','result','evidence','cause','nextAction','condition'] as const).every(k=>text(r[k]))||!date(r.at)||!m.team.some(t=>t.memberId===r.actor)||!m.commands.some(c=>c.fn===r.fn)||!['continue','adjust','stop'].includes(String(r.outcome))||ids.has(String(r.id)))errors.push('振り返りの根拠・適用条件・記録者が不正です');if(object(r))ids.add(String(r.id));}
 }
 if(m.learning!==undefined){const l:unknown=m.learning;if(!object(l)||!['sourceMissionId','sourceIssue','sourceReviewId','action','condition','evidence'].every(k=>text(l[k]))||l.sourceMissionId===m.id||!date(l.appliedAt)||!m.commands.some(c=>c.fn===l.fn)||!Array.isArray(l.before)||!Array.isArray(l.after)||!l.before.length||!l.before.every(text)||!l.after.every(text)||l.after.length!==l.before.length+1||l.after[0]!==l.action||l.before.some((x,i)=>x!==(l.after as unknown[])[i+1]))errors.push('学びの反映履歴が不正です');}
 return errors;
}
export function recordReview(m:Mission,input:Omit<Review,'id'|'at'>,now=new Date()):Mission{
 const r={...input,id:crypto.randomUUID(),at:now.toISOString()};
 const next={...m,reviews:[...(m.reviews||[]),r]};const errors=validateReview(next);if(errors.length)throw new Error(errors.join('／'));return next;
}
export function applyLearning(m:Mission,source:Mission,reviewId:string,confirmed:boolean,now=new Date()):Mission{
 const r=source.reviews?.find(r=>r.id===reviewId);
 if(!confirmed)throw new Error('今回も適用条件に合うことを確認してください。');
 if(!r||validateReview(source).length||source.kind!==m.kind||source.id===m.id)throw new Error('同じ課題分類の、根拠付き振り返りを選んでください。');
 if(m.state!=='draft'||m.learning)throw new Error('学びは新しい初稿に1件だけ反映できます。実行中の指示は変更しません。');
 const c=m.commands.find(c=>c.fn===r.fn);if(!c)throw new Error('今回の編成に対象の仕事がありません。');
 const action='前回の学びを踏まえた確認・行動：'+r.nextAction;
 const actor=m.team.find(t=>t.role==='COMMANDER')!.memberId;
 const next=reviseCommand(m,{...c,actions:[action,...c.actions]},actor,'前回の学びを初稿へ反映：'+source.brief.issue,now);
 return {...next,learning:{sourceMissionId:source.id,sourceIssue:source.brief.issue,sourceReviewId:r.id,appliedAt:now.toISOString(),fn:r.fn,action,condition:r.condition,evidence:r.evidence,before:[...c.actions],after:[action,...c.actions]}};
}
export function reviewSummary(m:Mission):string{
 const r=m.reviews?.slice(-1)[0];if(!r)return '';
 const kpi=kpiComparison(m);
 return [`振り返り：${m.brief.issue}`,`判断：${{continue:'継続',adjust:'修正',stop:'中止'}[r.outcome]}`,`結果：${r.result}`,`根拠：${r.evidence}`,`要因（記録者の判断）：${r.cause}`,`次回の${specs[r.fn].name}：${r.nextAction}`,`適用条件：${r.condition}`,`KPI判定：${kpi.achieved===null?'未確認':kpi.achieved?'達成':'未達'}`,`未完了の指示：${m.commands.filter(c=>c.status!=='done').length}件 / 判断待ち：${executionOf(m).decisions.filter(d=>d.status==='open').length}件`].join('\n');
}
