import { useState, type FormEvent } from 'react';
import { executionOf, kpiComparison } from '../core/execution';
import { nameOf, specs, type Mission } from '../core/mission';
import { recordReview, reviewSummary, type Review } from '../core/review';

export function ReviewPanel({mission:m,onSave}:{mission:Mission;onSave:(m:Mission)=>boolean}){
 const last=m.reviews?.slice(-1)[0];
 const [input,setInput]=useState<Omit<Review,'id'|'at'>>(()=>({actor:m.team.find(t=>t.role==='COMMANDER')!.memberId,result:last?.result||'',evidence:last?.evidence||'',cause:last?.cause||'',nextAction:last?.nextAction||'',condition:last?.condition||'',fn:last?.fn||m.commands[0].fn,outcome:last?.outcome||'adjust'}));
 const [error,setError]=useState('');const [notice,setNotice]=useState('');const [memo,setMemo]=useState('');
 const kpi=kpiComparison(m);const unfinished=m.commands.filter(c=>c.status!=='done').length;
 function save(ev:FormEvent){ev.preventDefault();try{if(onSave(recordReview(m,input))){setError('');setNotice('根拠と次回の改善を保存しました。以前の振り返りも残しています。');setMemo('');}}catch(err){setError(err instanceof Error?err.message:String(err));}}
 return <section className="panel review-panel" aria-label="成果と次回の改善"><div className="section-title"><div><small>REVIEW → NEXT MISSION</small><h2>やりっぱなしにしない。</h2></div><span>{m.reviews?.length||0}件の振り返り</span></div><p className="subtle">成果の根拠と、次回変える具体的な行動を残します。途中の振り返りも可能です。人の能力やMBTI評価は変更しません。</p>
 <div className="work-metrics"><span>KPI <b>{kpi.achieved===null?'未確認':kpi.achieved?'達成':'未達'}</b></span><span>未完了 <b>{unfinished}件</b></span><span>判断待ち <b>{executionOf(m).decisions.filter(d=>d.status==='open').length}件</b></span></div>
 {last&&<div className="saved-learning"><b>最新の振り返り：{{continue:'継続',adjust:'修正',stop:'中止'}[last.outcome]}</b><p>{last.result}</p><small>根拠：{last.evidence}</small><p>次回の{specs[last.fn].name}：{last.nextAction}</p><small>適用条件：{last.condition}</small></div>}
 {error&&<p role="alert" className="execution-error">{error}</p>}{notice&&<p role="status">{notice}</p>}
 <details><summary>{last?'振り返りを追記・訂正する':'成果と次回の改善を記録する'}</summary><form onSubmit={save}>
 <div className="field-grid"><label className="field">継続・修正・中止の判断<select value={input.outcome} onChange={ev=>setInput({...input,outcome:ev.target.value as Review['outcome']})}><option value="continue">継続</option><option value="adjust">修正</option><option value="stop">中止</option></select></label><label className="field">振り返りの記録者<select value={input.actor} onChange={ev=>setInput({...input,actor:ev.target.value})}>{m.team.map(t=><option key={t.memberId} value={t.memberId}>{nameOf(t.memberId)}</option>)}</select></label></div>
 {([['result','実際に出た結果','例：夜稼働は改善したが、平日の伸びが弱かった'],['evidence','結果の根拠・確認できる資料','例：10/7〜13の時間帯別集計、施策実施チェック表'],['cause','成功・失敗の要因と不明点','例：告知の開始が遅れた。競合の影響は未検証']] as const).map(([key,label,placeholder])=><label className="field" key={key}>{label}<textarea required maxLength={10000} rows={2} value={input[key]} placeholder={placeholder} onChange={ev=>setInput({...input,[key]:ev.target.value})}/></label>)}
 <label className="field">次回変える仕事<select value={input.fn} onChange={ev=>setInput({...input,fn:ev.target.value as Review['fn']})}>{m.commands.map(c=><option key={c.id} value={c.fn}>{specs[c.fn].name}</option>)}</select></label>
 <label className="field">次回の具体的な改善行動<textarea required maxLength={10000} rows={2} value={input.nextAction} placeholder="例：告知開始の3日前に設置場所と文言を店長へ確認する" onChange={ev=>setInput({...input,nextAction:ev.target.value})}/></label>
 <label className="field">この学びを使ってよい条件<textarea required maxLength={10000} rows={2} value={input.condition} placeholder="例：同じ時間帯・対象客層で、POPを使用する施策の場合" onChange={ev=>setInput({...input,condition:ev.target.value})}/></label>
 <p className="subtle">この判断は記録です。中止を選んでも指示を自動停止せず、未完了の仕事は残します。必要な再指示は別途更新してください。</p><button className="primary">根拠と次回の改善を保存</button></form></details>
 {last&&<><button className="secondary" onClick={()=>setMemo(reviewSummary(m))}>振り返りの共有メモを作る</button>{memo&&<label className="field briefing">振り返りの共有メモ<textarea readOnly rows={10} value={memo} onFocus={ev=>ev.target.select()}/></label>}<details><summary>過去の振り返り（{m.reviews!.length}件）</summary>{[...m.reviews!].reverse().map(r=><article className="saved-learning" key={r.id}><b>{new Date(r.at).toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'})} / {nameOf(r.actor)}</b><p>{r.result}</p><small>根拠：{r.evidence}</small><p>要因：{r.cause}</p><p>次回：{r.nextAction}</p><small>適用条件：{r.condition}</small></article>)}</details></>}
 </section>;
}
