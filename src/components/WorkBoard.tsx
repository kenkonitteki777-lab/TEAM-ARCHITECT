import { useState } from 'react';
import { nameOf, type Command, type Mission } from '../core/mission';
import { workBriefing, workItems, workOwners } from '../core/work';

type Props={missions:Mission[];onOpen:(m:Mission,c?:Command)=>void;compact?:boolean};
export function WorkBoard({missions,onOpen,compact=false}:Props){
 const [owner,setOwner]=useState('all');const [category,setCategory]=useState('all');const [memo,setMemo]=useState('');
 const items=workItems(missions);const mine=items.filter(x=>owner==='all'||x.owner===owner);
 const visible=mine.filter(x=>category==='all'||(category==='decision'?['decision','checkpoint'].includes(x.category):category===x.category));
 const shown=compact?visible.slice(0,3):visible;
 return <section className="panel work-board" aria-label="全案件の仕事"><div className="section-title"><div><small>DAILY COMMAND</small><h2>今日、誰が何を動かすか。</h2></div><span>{missions.filter(m=>m.state==='active').length}件の実行中ミッション</span></div>
 <p className="subtle">判断を先に、着手可能な仕事を次に。先行待ち・保留は分けて確認します。件数は作業時間や空き時間を表しません。</p>
 <div className="work-filters"><label className="field">仕事の担当<select value={owner} onChange={ev=>{setOwner(ev.target.value);setMemo('');}}><option value="all">全員</option>{workOwners.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label className="field">確認する仕事<select value={category} onChange={ev=>setCategory(ev.target.value)}><option value="all">すべて</option><option value="decision">判断・状況確認</option><option value="ready">着手できる</option><option value="waiting">先行待ち・保留</option></select></label></div>
 <div className="work-metrics"><span>判断・確認 <b>{mine.filter(x=>['decision','checkpoint'].includes(x.category)).length}</b></span><span>着手可能 <b>{mine.filter(x=>x.category==='ready').length}</b></span><span>先行待ち・保留 <b>{mine.filter(x=>x.category==='waiting').length}</b></span></div>
 {!shown.length&&<p className="subtle">この条件の仕事はありません。初稿は実行開始後にここへ表示されます。</p>}
 <div className="work-list">{shown.map(x=><article className="work-item" key={x.id}><div><small>{x.urgent?'即時報告':x.category==='decision'?'要判断':x.category==='checkpoint'?'状況確認':x.category==='ready'?'着手可能':x.command?.status==='blocked'?'保留':'先行待ち'}{x.overdue?' ／ 期限超過':''}</small><h3>{nameOf(x.owner)} / {x.title}</h3><b className="work-mission">{x.mission.brief.issue}</b><p>{x.action}</p><small>期限：{x.due?x.due.replace('T',' ')+' JST':'未設定'}{x.command?' ／ 報告：'+nameOf(x.command.reportTo):''}</small></div><button className="secondary" onClick={()=>onOpen(x.mission,x.command)}>{x.command?'指示を開く':'判断・状況を確認'}</button></article>)}</div>
 {compact&&visible.length>3&&<p className="subtle">残り{visible.length-3}件は「今日の仕事」で確認できます。</p>}
 {!compact&&<><details className="work-load"><summary>担当別の未完了件数を見る</summary><div className="work-load-grid">{workOwners.map(p=><div key={p.id}><b>{p.name}</b><span>指示 {items.filter(x=>x.command&&x.owner===p.id).length}件</span><small>着手可能 {items.filter(x=>x.owner===p.id&&x.category==='ready').length} ／ 判断 {items.filter(x=>x.owner===p.id&&x.category==='decision').length}</small></div>)}</div></details><button className="secondary" onClick={()=>setMemo(workBriefing(items,owner))}>共有用の仕事メモを作る</button>{memo&&<label className="field briefing">共有用の仕事メモ<textarea readOnly rows={12} value={memo} onFocus={ev=>ev.target.select()}/><small>文章を選択してコピーできます。アプリから送信はしません。</small></label>}</>}
 </section>;
}
