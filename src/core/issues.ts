import { people } from './data';
import { blankBrief, type Brief, type Mission } from './mission';
export type Development={memberId:string;supporterId:string;ability:number;goal:string;observation:string;nextCheck:string};
export type Issue={id:string;createdAt:string;updatedAt:string;brief:Brief;priority:'high'|'normal'|'later';state:'open'|'hold'|'resolved';missionId?:string;result:string;learning:string;development?:Development};
export function newIssue(brief:Brief,now=new Date()):Issue{
 if(!brief.issue.trim())throw new Error('課題を一言入力してください。');
 return {id:crypto.randomUUID(),createdAt:now.toISOString(),updatedAt:now.toISOString(),brief:{...blankBrief,...brief,issue:brief.issue.trim(),excluded:[...brief.excluded]},priority:'normal',state:'open',result:'',learning:''};
}
export function issueStage(issue:Issue,missions:Mission[]):string{
 if(issue.state==='resolved')return '結果確認済';if(issue.state==='hold')return '保留';
 const m=missions.find(m=>m.id===issue.missionId);if(!m)return '未対応';
 return m.commands.every(c=>c.status==='done')?'結果待ち':m.state==='active'?'対応中':'指示書の確認待ち';
}
export function validateIssues(value:unknown,missions:Mission[]):void{
 if(!Array.isArray(value))throw new Error('課題一覧の形式が不正です。');
 const ids=new Set<string>();for(const x of value){
 if(!x||typeof x!=='object'||['id','createdAt','updatedAt','result','learning'].some(k=>typeof x[k]!=='string')||!x.id||!x.brief||Object.keys(blankBrief).some(k=>k==='excluded'?!Array.isArray(x.brief[k])||x.brief[k].some((id:unknown)=>typeof id!=='string'||!people.some(p=>p.id===id)):typeof x.brief[k]!=='string')||!x.brief.issue.trim()||!['high','normal','later'].includes(x.priority)||!['open','hold','resolved'].includes(x.state)||ids.has(x.id))throw new Error('課題の形式が不正、またはIDが重複しています。');
 if(x.development!==undefined){const d=x.development;if(!d||!people.some(p=>p.id===d.memberId)||!(d.supporterId===''||people.some(p=>p.id===d.supporterId&&p.id!==d.memberId))||!Number.isInteger(d.ability)||d.ability<1||d.ability>18||['goal','observation','nextCheck'].some(k=>typeof d[k]!=='string')||!d.goal.trim()||(d.nextCheck&&!Number.isFinite(Date.parse(d.nextCheck+'+09:00'))))throw new Error('育成記録の対象・目標・確認日時を見直してください。');}
 ids.add(x.id);if(x.state==='resolved'&&!x.result.trim())throw new Error('課題を解決済みにするには確認結果を残してください。');
 if(x.missionId!==undefined&&(typeof x.missionId!=='string'||!missions.some(m=>m.id===x.missionId)))throw new Error('課題に紐づく指示書が見つかりません。');
 }
}
