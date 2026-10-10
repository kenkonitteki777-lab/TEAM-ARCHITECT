import { executionOf, raiseDecision, reviseCommand, waitingOn } from './execution';
import { specs, type Mission } from './mission';
export function quickProgress(m:Mission,commandId:string,status:'doing'|'done'|'blocked',note:string,actor:string,immediate=false):Mission {
 if(!['doing','done','blocked'].includes(status))throw new Error('状態が不正です。');
 const c=m.commands.find(c=>c.id===commandId);
 if(m.state!=='active'||!c||c.status==='done')throw new Error('実行中の未完了指示を選んでください。');
 if(status!=='blocked'&&waitingOn(m,c).length)throw new Error('先行作業の完了後に着手してください。');
 if(status!=='blocked'&&executionOf(m).decisions.some(d=>d.commandId===c.id&&d.status==='open'))throw new Error('未解決の相談があります。判断結果を確認してください。');
 if(status==='doing')return reviseCommand(m,{...c,status},actor,'進行開始（簡易更新）');
 if(!note.trim())throw new Error(status==='done'?'成果物・確認結果を一言で記録してください。':'困っていることを一言で記録してください。');
 if(status==='blocked')return raiseDecision(m,{title:specs[c.fn].name+'の相談',detail:note.trim(),commandId:c.id,raisedBy:actor,urgency:immediate?'immediate':'normal',due:''},true);
 return reviseCommand(m,{...c,status,evidence:[c.evidence,note.trim()].filter(Boolean).join('\n')},actor,'完了確認：'+note.trim());
}
