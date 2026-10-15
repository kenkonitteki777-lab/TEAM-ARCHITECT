import { useState } from 'react';
import { ArrowRight, Flag } from 'lucide-react';
import { kindLabels, nameOf, type Mission } from '../core/mission';

export function MissionList({missions,onOpen,onNew}:{missions:Mission[];onOpen:(mission:Mission)=>void;onNew:()=>void}){
 const [query,setQuery]=useState('');
 const normalize=(text:string)=>text.normalize('NFKC').toLocaleLowerCase('ja');
 const terms=normalize(query).trim().split(/\s+/).filter(Boolean);
 const visible=missions.filter(m=>{const text=normalize([m.brief.issue,m.brief.goal,kindLabels[m.kind],...m.commands.map(c=>nameOf(c.owner))].join(' '));return terms.every(term=>text.includes(term));});
 return <section aria-label="指示書一覧"><div className="page-heading"><div><small>INSTRUCTION LIBRARY</small><h1>指示書一覧</h1><p>保存した初稿・実行中の指示書を選んで、内容を確認・修正できます。</p></div><button className="primary" onClick={onNew}>新しい指示書を作る</button></div>
  {missions.length>0&&<div className="mission-search"><label className="field">指示書を検索<input type="search" aria-label="指示書を検索" placeholder="課題・目的・担当者名" value={query} onChange={e=>setQuery(e.target.value)}/></label><p role="status">{visible.length} / {missions.length}件</p>{query&&<button className="secondary" onClick={()=>setQuery('')}>検索をクリア</button>}</div>}
  {missions.length===0?<div className="empty large"><Flag size={32}/><h2>指示書はまだありません</h2><p>「新しい指示書」で、やりたいことを一言入力してください。</p></div>:visible.length===0?<div className="empty"><h2>一致する指示書がありません</h2><p>短い言葉や担当者名で検索してください。</p></div>:<div className="mission-list">{visible.map(m=><button className="mission-row" key={m.id} onClick={()=>onOpen(m)}><span className={'status '+m.state}>{m.state==='active'?'実行中':'初稿'}</span><div><b>{m.brief.issue}</b><small>{kindLabels[m.kind]} · {m.commands.filter(c=>c.status==='done').length}/{m.commands.length} 完了 · 期限：{m.brief.deadline?m.brief.deadline.replace('T',' ')+' JST':'未設定'}</small></div><ArrowRight size={18}/></button>)}</div>}
 </section>;
}
