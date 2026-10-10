import { classify, specs, type Mission } from '../core/mission';
export type LearningChoice={missionId:string;reviewId:string;confirmed:boolean};
export const blankLearning:LearningChoice={missionId:'',reviewId:'',confirmed:false};
export function LearningPicker({missions,issue,choice,onChange}:{missions:Mission[];issue:string;choice:LearningChoice;onChange:(choice:LearningChoice)=>void}){
 const candidates=issue.trim()?missions.filter(m=>m.kind===classify(issue)&&m.reviews?.length):[];
 if(!candidates.length)return null;
 const selected=candidates.find(m=>m.id===choice.missionId);const review=selected?.reviews?.find(r=>r.id===choice.reviewId);
 return <div className="learning-picker"><label className="field">前回の学びを初稿に反映する<select value={choice.missionId} onChange={ev=>{const source=candidates.find(m=>m.id===ev.target.value);onChange(source?{missionId:source.id,reviewId:source.reviews!.slice(-1)[0]!.id,confirmed:false}:blankLearning);}}><option value="">今回は使わない</option>{candidates.map(m=><option key={m.id} value={m.id}>{m.brief.issue}</option>)}</select></label>{review&&<><b>次回の{specs[review.fn].name}：{review.nextAction}</b><p>根拠：{review.evidence}</p><p>適用条件：{review.condition}</p><small>1件の振り返りに基づく提案です。今回にも当てはまるか確認してください。</small><label className="hold-check"><input type="checkbox" checked={choice.confirmed} onChange={ev=>onChange({...choice,confirmed:ev.target.checked})}/>今回もこの適用条件に合うことを確認した</label></>}</div>;
}
