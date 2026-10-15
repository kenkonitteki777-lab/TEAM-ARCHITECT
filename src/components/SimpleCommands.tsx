import { useState } from 'react';
import { typeTheme } from '../core/typeGroups';
import { sharedRules, ruleKeys, ruleLabels } from '../core/commandRules';
import { shortAction } from '../core/workPlan';
import { people, typeBook } from '../core/data';
import { nameOf, specs, type Command, type Mission } from '../core/mission';
import { waitingOn } from '../core/execution';
import { deliveryMessage } from '../core/mbti';
import { OperativePortrait } from './OperativePortrait';
import { CopyButton } from './CopyButton';
import { QuickProgress } from './QuickProgress';
const statusNames={todo:'未着手',doing:'進行中',blocked:'要相談',done:'完了'};
export function SimpleCommands({mission,onEdit,onSave,onDetails}:{mission:Mission;onEdit:(c:Command)=>void;onSave:(m:Mission)=>boolean;onDetails:()=>void}){
 const [owner,setOwner]=useState('all'),[memoIds,setMemo]=useState<string[]>([]),[adapt,setAdapt]=useState(true);
 const sheet=mission.state==='draft';
 const selected=mission.commands.filter(c=>owner==='all'||c.owner===owner);
 const now=selected.filter(c=>c.status!=='done'&&(c.status==='blocked'||!waitingOn(mission,c).length));
 const waiting=selected.filter(c=>c.status!=='done'&&c.status!=='blocked'&&waitingOn(mission,c).length);
 const done=selected.filter(c=>c.status==='done');
 const common=sharedRules(selected);
 const memo=memoIds.length?deliveryMessage(mission,mission.commands.filter(c=>memoIds.includes(c.id)),adapt):'';
 const recipients=people.filter(p=>mission.commands.some(c=>c.owner===p.id)).sort((a,b)=>mission.commands.findIndex(c=>c.owner===a.id)-mission.commands.findIndex(c=>c.owner===b.id));
 function cards(list:Command[]){return <div className="recipient-grid">{recipients.filter(p=>list.some(c=>c.owner===p.id)).map(p=>{const commands=list.filter(c=>c.owner===p.id);return <article className={"panel recipient-card "+typeTheme(p.mbti)} key={p.id}><header><OperativePortrait memberId={p.id}/><div><h3>{p.name}さんへ</h3><small>{p.mbti} · {commands.length}件</small></div></header>{commands.map(c=><div className="short-command" key={c.id}><div className="short-label"><b>{specs[c.fn].name}</b><small>{statusNames[c.status]}{waitingOn(mission,c).length&&c.status!=='done'?' · 先行待ち':''}</small></div><p>{shortAction(c.actions[0],mission.brief.issue)}</p><small>仕上げるもの：{c.output}</small><small>期限：{c.due?c.due.replace('T',' ')+' JST':'未設定'} · 報告：{nameOf(c.reportTo)}</small><QuickProgress mission={mission} command={c} onSave={onSave} onDetails={onDetails}/><details open={sheet}><summary>指示の続きを見る・変更する</summary><ol>{c.actions.slice(1).map((x,i)=><li key={i}>{x}</li>)}</ol><p>完了条件：{c.done}</p>{ruleKeys.filter(key=>!common.includes(key)).map(key=><p key={key}>{ruleLabels[key]}：{c[key]}</p>)}<button className="secondary" onClick={()=>onEdit(c)}>指示・状態を編集</button></details>{c.evidence&&<p className="subtle">記録：{c.evidence}</p>}</div>)}{adapt&&<details className="mbti-work-tip"><summary>{p.mbti}への伝え方</summary><p>{typeBook.find(t=>t.mbti===p.mbti)?.request}。本人の希望と反応に合わせて調整してください。</p></details>}<CopyButton text={deliveryMessage(mission,commands,adapt)} label={`${p.name}への伝達文をコピー`}/><button className="text-button" onClick={()=>setMemo(commands.map(c=>c.id))}>{p.name}への文章を確認</button></article>;})}</div>;}
 return <section className={'simple-commands'+(sheet?' instruction-sheet':'')} aria-label="誰に何を伝えるか"><div className="simple-toolbar"><h2>誰に、何を伝える？</h2><label>伝える相手<select aria-label="伝える相手" value={owner} onChange={e=>{setOwner(e.target.value);setMemo([]);}}><option value="all">全員</option>{recipients.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label></div>{sheet&&<div className="sheet-tools"><CopyButton text={deliveryMessage(mission,mission.commands,adapt)} label="指示書をまとめてコピー"/></div>}{sheet?cards(selected):now.length?cards(now):<p className="empty-now">今、動かせる指示はありません。{waiting.length?'先行作業や相談の判断を確認してください。':'完了済みの記録は下で確認できます。'}</p>}{!sheet&&waiting.length>0&&<details className="command-archive"><summary>先行待ちの指示（{waiting.length}件）</summary>{cards(waiting)}</details>}{!sheet&&done.length>0&&<details className="command-archive"><summary>完了済みの指示（{done.length}件）</summary>{cards(done)}</details>}{common.length>0&&<section className="panel common-rules" aria-label="共通の報告・相談ルール"><h3>表示中の指示に共通するルール</h3>{common.map(key=><p key={key}><b>{ruleLabels[key]}：</b>{selected[0][key]}</p>)}</section>}<details className="simple-options"><summary>伝達文の設定</summary><label className="mbti-adapt"><input type="checkbox" checked={adapt} onChange={e=>{setAdapt(e.target.checked);setMemo([]);}}/>MBTIを参考に、相手が受け取りやすい伝達文にする</label></details>{memo&&<section className="panel delivery-memo"><label className="field">そのまま伝える文章<textarea aria-label="そのまま伝える文章" readOnly rows={6} value={memo} onFocus={e=>e.target.select()}/></label><CopyButton text={memo}/></section>}</section>;
}
