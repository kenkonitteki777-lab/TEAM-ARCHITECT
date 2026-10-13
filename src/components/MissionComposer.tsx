import type { FormEvent, ReactNode } from 'react';
import { ArrowRight, ChevronDown, Clipboard, Target } from 'lucide-react';
import { people } from '../core/data';
import { clarificationFor } from '../core/workPlan';
import type { Brief } from '../core/mission';
import { OperativePortrait } from './OperativePortrait';

const examples=[['夜稼働の改善','競合店のリニューアルに対抗して夜稼働を上げたい'],['スタッフ育成','スタッフ育成を進めたい'],['接客品質の改善','接客品質を改善したい']] as const;
export function MissionComposer({brief,onChange,onSubmit,children,onExplore}:{brief:Brief;onChange:(b:Brief)=>void;onSubmit:(e:FormEvent)=>void;children:ReactNode;onExplore:()=>void}){
 const question=clarificationFor(brief.issue);
 return <section className="mission-composer" aria-label="やりたいことから指示書を作る">
  <header className="composer-intro"><div><small>TEAM ARCHITECT / 新しい指示書</small><h1>やりたいことを、<br className="composer-break"/>チームの指示へ。</h1><p>一言入力するだけで、担当と「伝える文章」の初稿を整理します。</p></div><div className="composer-portrait" aria-hidden="true"><OperativePortrait memberId="matsuo"/></div></header>
  <div className="composer-layout"><section className="panel mission-input"><form onSubmit={onSubmit}>
   <div className="section-label"><Target size={18}/>まず、やりたいことを一言</div>
   <label className="field">解決したい課題<textarea required value={brief.issue} onChange={e=>onChange({...brief,issue:e.target.value})} placeholder="例：新人が一人でお客様をご案内できるようにしたい" rows={3} aria-describedby="composer-help"/></label>
   <p id="composer-help" className="composer-help">短くて大丈夫。困っていることでも、実現したいことでも。</p>
   <div className="preset-row" aria-label="入力例">{examples.map(([label,issue])=><button type="button" key={label} onClick={()=>onChange({...brief,issue})}>{label}</button>)}</div>

   <div className="composer-submit"><button className="primary" type="submit">指示書を作る<ArrowRight size={18}/></button><small>作成後に確認・修正できます。まだ実行は始まりません。</small></div>
   <details className="brief-details composer-details"><summary>目的・期限なども入力する（任意）<ChevronDown size={16}/></summary>
   {question&&<section className="composer-question" aria-label="必要なことを一問だけ確認"><label className="field">{question}<input aria-label="場面と変えたいこと" value={brief.goal} onChange={e=>onChange({...brief,goal:e.target.value})} placeholder="例：新人が、お客様を一人で案内できるように"/></label><small>任意です。答えると、担当と手順の提案に反映します。未入力でも初稿を作れます。</small></section>}
    <div className="field-grid"><label className="field">達成したい状態<input value={brief.goal} onChange={e=>onChange({...brief,goal:e.target.value})} placeholder="例：案内の手順を一人で説明できる"/></label><label className="field">指示書の期限（日本時間）<input type="datetime-local" value={brief.deadline} onChange={e=>onChange({...brief,deadline:e.target.value})}/></label></div>
    <label className="field">次回チェックポイント（日本時間）<input type="datetime-local" value={brief.checkpoint} onChange={e=>onChange({...brief,checkpoint:e.target.value})}/></label>
    <details className="brief-details"><summary>制約・KPI・参加メンバーを設定<ChevronDown size={16}/></summary><label className="field">制約・守る条件<textarea value={brief.constraints} onChange={e=>onChange({...brief,constraints:e.target.value})} placeholder="例：追加予算なし、通常営業の接客品質を維持" rows={2}/></label><div className="field-grid">{([['kpi','KPIの定義・単位','例：18〜22時の平均稼働率（%）'],['baseline','現状値','実測値を入力'],['target','目標値','目標を入力'],['source','データ取得元','例：日次稼働集計'],['period','観測期間','例：10月7日〜13日']] as const).map(([key,label,placeholder])=><label className="field" key={key}>{label}<input value={brief[key]} placeholder={placeholder} onChange={e=>onChange({...brief,[key]:e.target.value})}/></label>)}</div><fieldset className="availability"><legend>参加可能な実行担当</legend>{people.filter(p=>p.id!=='maesaki').map(p=><label key={p.id}><input type="checkbox" checked={!brief.excluded.includes(p.id)} onChange={e=>onChange({...brief,excluded:e.target.checked?brief.excluded.filter(id=>id!==p.id):[...brief.excluded,p.id]})}/>{p.name}</label>)}<p>前﨑店長を最終判断者として配置。実際の稼働余力は開始前に確認してください。</p></fieldset></details>
   </details>{children}
  </form></section><aside className="composer-outcome"><small><Clipboard size={16}/>できあがる指示書</small><h2>誰に。何を。<br/>いつまでに。</h2><dl><div><dt>担当</dt><dd>登録した能力・専門性から提案</dd></div><div><dt>お願いすること</dt><dd>具体的な行動と仕上げるもの</dd></div><div><dt>伝える文章</dt><dd>相手のMBTIを参考に整理</dd></div></dl><p>入力とルールに基づく初稿です。担当と内容を確認してから使えます。</p></aside></div>
  <button className="text-button composer-explore" onClick={onExplore}>MBTIの組み合わせを試す<ArrowRight size={15}/></button>
 </section>;
}
