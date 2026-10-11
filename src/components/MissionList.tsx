import { ArrowRight, Flag } from 'lucide-react';
import { kindLabels, type Mission } from '../core/mission';

export function MissionList({missions,onOpen,onNew}:{missions:Mission[];onOpen:(mission:Mission)=>void;onNew:()=>void}){
 return <section aria-label="指示書一覧"><div className="page-heading"><div><small>INSTRUCTION LIBRARY</small><h1>指示書一覧</h1><p>保存した初稿・実行中の指示書を選んで、内容を確認・修正できます。</p></div><button className="primary" onClick={onNew}>新しい指示書を作る</button></div>
  {missions.length===0?<div className="empty large"><Flag size={32}/><h2>指示書はまだありません</h2><p>「新しい指示書」で、やりたいことを一言入力してください。</p></div>:<div className="mission-list">{missions.map(m=><button className="mission-row" key={m.id} onClick={()=>onOpen(m)}><span className={'status '+m.state}>{m.state==='active'?'実行中':'初稿'}</span><div><b>{m.brief.issue}</b><small>{kindLabels[m.kind]} · {m.commands.filter(c=>c.status==='done').length}/{m.commands.length} 完了 · 期限：{m.brief.deadline?m.brief.deadline.replace('T',' ')+' JST':'未設定'}</small></div><ArrowRight size={18}/></button>)}</div>}
 </section>;
}
