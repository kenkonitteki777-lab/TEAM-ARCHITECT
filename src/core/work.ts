import { people } from './data';
import { actionable, executionOf, isOverdue, timestamp, waitingOn } from './execution';
import { nameOf, specs, type Command, type Mission } from './mission';

export type WorkItem={id:string;mission:Mission;owner:string;title:string;action:string;due:string;category:'decision'|'checkpoint'|'ready'|'waiting';urgent:boolean;overdue:boolean;command?:Command};
export function planningLoad(missions:Mission[]):Record<string,number>{
 const load:Record<string,number>={};
 for(const m of missions.filter(m=>m.state==='active'))for(const c of m.commands)if(c.status!=='done')load[c.owner]=(load[c.owner]||0)+1;
 return load;
}
export function workItems(missions:Mission[],now=Date.now()):WorkItem[]{
 const items:WorkItem[]=[];
 for(const m of missions.filter(m=>m.state==='active')){
  for(const d of executionOf(m).decisions.filter(d=>d.status==='open'))items.push({id:d.id,mission:m,owner:d.owner,title:d.title,action:d.detail,due:d.due,category:'decision',urgent:d.urgency==='immediate',overdue:Number.isFinite(timestamp(d.due))&&timestamp(d.due)<now});
  const commander=m.team.find(t=>t.role==='COMMANDER')!.memberId;
  if(m.commands.every(c=>c.status==='done')&&!m.reviews?.length)items.push({id:m.id+':review',mission:m,owner:commander,title:'成果の振り返りが未記録です',action:'KPIと成果物を確認し、結果の根拠と次回変える行動を記録する',due:'',category:'checkpoint',urgent:false,overdue:false});
  if(m.commands.some(c=>c.status!=='done')&&Number.isFinite(timestamp(m.brief.checkpoint))&&timestamp(m.brief.checkpoint)<=now)items.push({id:m.id+':checkpoint',mission:m,owner:commander,title:'状況確認の時刻を過ぎています',action:'担当の進捗・KPI・相談事項を確認し、次回確認日時を更新する',due:m.brief.checkpoint,category:'checkpoint',urgent:false,overdue:true});
  const readyIds=new Set(actionable(m).map(c=>c.id));
  for(const c of m.commands.filter(c=>c.status!=='done'))items.push({id:c.id,mission:m,owner:c.owner,title:specs[c.fn].name,action:c.status==='blocked'?'保留理由と再開条件を報告先と確認する':c.actions[0],due:c.due,category:readyIds.has(c.id)?'ready':'waiting',urgent:false,overdue:isOverdue(c,now),command:c});
 }
 const priority=(x:WorkItem)=>x.urgent?0:x.category==='decision'?1:x.category==='checkpoint'?2:x.overdue?3:x.command?.status==='doing'?4:5;
 return items.sort((a,b)=>priority(a)-priority(b)||(timestamp(a.due)||Infinity)-(timestamp(b.due)||Infinity)||a.id.localeCompare(b.id));
}
export function workBriefing(items:WorkItem[],owner:string,now=new Date()):string{
 const visible=items.filter(x=>owner==='all'||x.owner===owner);
 const sections:[string,WorkItem['category'][]][]=[['判断・状況確認',['decision','checkpoint']],['着手できる仕事',['ready']],['先行待ち・保留',['waiting']]];
 return [`仕事の共有メモ / ${owner==='all'?'全員':nameOf(owner)}`,now.toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'}),...sections.flatMap(([label,categories])=>[label,...visible.filter(x=>categories.includes(x.category)).map(x=>`${x.urgent?'【即時報告】':''}${x.overdue?'【期限超過】':''}${x.mission.brief.issue}\n担当：${nameOf(x.owner)} / ${x.title}\n次の行動：${x.action}\n期限：${x.due?x.due.replace('T',' ')+' JST':'未設定'}${x.command?'\n報告：'+nameOf(x.command.reportTo)+'\n先行待ち：'+(waitingOn(x.mission,x.command).map(id=>specs[x.mission.commands.find(c=>c.id===id)!.fn].name).join('・')||'なし'):''}`)]),'端末内の記録です。必要な連絡は直接行ってください。'].join('\n\n');
}
export const workOwners=people;
