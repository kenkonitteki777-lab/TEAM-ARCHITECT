import { useState, type FormEvent } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { activationIssues, nameOf, specs, type Mission } from '../core/mission';
import { updateConditions } from '../core/execution';

export function DraftGuide({mission,onSave}:{mission:Mission;onSave:(m:Mission)=>boolean}){
 const [goal,setGoal]=useState(mission.brief.goal||mission.brief.issue),[deadline,setDeadline]=useState(mission.brief.deadline),[checkpoint,setCheckpoint]=useState(mission.brief.checkpoint),[error,setError]=useState('');
 const needs=activationIssues(mission).length>0;
 function save(e:FormEvent){e.preventDefault();try{const next=updateConditions(mission,{...mission.brief,goal,deadline,checkpoint},true,mission.team.find(t=>t.role==='COMMANDER')!.memberId,'実行前に目的・期限・確認日時を確認');if(onSave(next))setError('');else setError('保存できませんでした。入力は保持しています。');}catch(e){setError(e instanceof Error?e.message:String(e));}}
 return <section className="draft-guide panel" aria-label="指示書の確認"><div className="draft-ready"><Check size={20}/><div><h2>指示書の初稿ができました。</h2><p>担当と内容を確認し、そのまま伝える文章をコピーできます。</p></div></div>
  <details className="draft-team"><summary>全体の役割を見る · {new Set(mission.commands.map(c=>c.owner)).size}人／{mission.commands.length}工程<ChevronDown size={16}/></summary><ol>{mission.commands.map(c=><li key={c.id}><b>{nameOf(c.owner)}さん</b><span>{specs[c.fn].name} · {c.output}</span></li>)}</ol></details>
  {needs?<details className="draft-setup"><summary>実行する前に、目的と日時を確認</summary><p>下の担当・内容を確認したら、目的と日時を保存して「確認して実行を開始」へ。</p><form onSubmit={save}><label className="field">この指示で目指すこと<input required value={goal} onChange={e=>setGoal(e.target.value)}/></label>{!mission.brief.goal&&<small>入力した課題を候補として表示しています。目指す状態に直してください。</small>}<div className="field-grid"><label className="field">いつまでに終える？（日本時間）<input required type="datetime-local" value={deadline} onChange={e=>setDeadline(e.target.value)}/></label><label className="field">いつ状況を確認する？（日本時間）<input required type="datetime-local" value={checkpoint} onChange={e=>setCheckpoint(e.target.value)}/></label></div>{error&&<p role="alert">{error}</p>}<button className="secondary" type="submit">目的と日時を保存</button></form></details>:<p className="draft-confirmed">目的と日時は設定済みです。担当・内容を確認したら「確認して実行を開始」へ。</p>}
 </section>;
}
