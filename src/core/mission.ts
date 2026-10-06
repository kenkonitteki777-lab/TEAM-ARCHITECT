import { abilityNames, people, type Level, type Member } from './data';
export type Kind='sales'|'machine'|'promo'|'people'|'service';
export type FunctionKey='ANALYZE'|'DESIGN'|'CREATE'|'TRANSLATE'|'FIELD'|'OPERATE'|'SCOUT'|'REVIEW'|'COACH';
export type Status='todo'|'doing'|'blocked'|'done';
export type Brief={issue:string;goal:string;constraints:string;deadline:string;kpi:string;baseline:string;target:string;source:string;period:string;checkpoint:string;excluded:string[]};
export type Overrides=Record<string,Level>;
export type Command={id:string;fn:FunctionKey;owner:string;issuer:string;reportTo:string;purpose:string;actions:string[];due:string;done:string;output:string;reportWhen:string;discretion:string;consult:string;immediate:string;dependsOn:string[];priority:string;status:Status;evidence:string;style:string;reason:string;alternative:string;version:number};
export type Assignment={memberId:string;role:'COMMANDER'|'LEADER'|'MEMBER';reportsTo:string|null;functions:FunctionKey[]};
export type Mission={id:string;version:number;engine:'rules-b1';createdAt:string;updatedAt:string;state:'draft'|'active';kind:Kind;brief:Brief;analysis:{hypothesis:string;success:string;unknowns:string[];risks:string[]};team:Assignment[];commands:Command[];notes:string};
export const blankBrief:Brief={issue:'',goal:'',constraints:'',deadline:'',kpi:'',baseline:'',target:'',source:'',period:'',checkpoint:'',excluded:[]};
export const kindLabels:Record<Kind,string>={sales:'稼働・営業改善',machine:'新台・入替',promo:'販促・集客',people:'育成・組織',service:'接客品質'};
export const classify=(x:string):Kind=>/育成|スタッフ|人材|面談/.test(x)?'people':/接客|CS|クレーム/.test(x)?'service':/新台|入替|遊技機/.test(x)?'machine':/販促|POP|SNS|広告/.test(x)?'promo':'sales';
export const specs:Record<FunctionKey,{name:string;abilities:number[];experts:string[];output:string;done:string}>= {
 ANALYZE:{name:'現状分析',abilities:[2,3,4],experts:['matsuo'],output:'比較表と主要論点（1ページ）',done:'比較期間・データ出所・不明事項が明記され、根拠付きの論点が3点以内に整理されている'},
 DESIGN:{name:'対策設計',abilities:[1,4,13,17],experts:['matsuo'],output:'対策3案の比較表と推奨案',done:'各案の効果仮説・必要資源・リスク・担当・期限を同じ軸で比較できる'},
 CREATE:{name:'販促表現',abilities:[5,12,13],experts:['hattori'],output:'POP・告知案と設置位置の一覧',done:'訴求対象・伝える内容・設置箇所が明記され、表現と使用条件を責任者が確認している'},
 TRANSLATE:{name:'組織浸透',abilities:[8,9,10],experts:['yasaka'],output:'朝礼用の説明とスタッフ別行動一覧',done:'対象スタッフが目的・自分の行動・相談先を説明でき、不明点の対応担当が決まっている'},
 FIELD:{name:'現場実行',abilities:[7,8,12,16],experts:['miyamoto'],output:'現場実施チェック表と改善点',done:'実施場所・実施者・確認時刻・未実施事項を記録し、責任者が実行状態を確認している'},
 OPERATE:{name:'進行管理',abilities:[12,13,14,17],experts:['tatsuno'],output:'担当・期限・確認時刻の進行表',done:'全タスクの担当・期限・状態・報告先が記録され、遅延や担当不在が相談先へ共有されている'},
 SCOUT:{name:'顧客反応',abilities:[8,9,16],experts:['asano'],output:'顧客反応・現場事実の観察記録',done:'観察時間・場所・件数を記録し、実際に見聞きした事実と解釈を分けて共有している'},
 REVIEW:{name:'結果検証',abilities:[2,3,4,17],experts:['matsuo'],output:'KPI比較と継続・修正・中止の提案',done:'目標と実績の比較・成功失敗の根拠・次の一手を記載し、最終判断者へ提出している'},
 COACH:{name:'育成支援',abilities:[8,9,11,12],experts:['miyamoto','yasaka'],output:'本人合意のOJT行動と確認日',done:'観察した行動・フィードバック・次回の具体行動・確認日を本人と共有している'}
};
const required:Record<Kind,FunctionKey[]>={sales:['ANALYZE','DESIGN','CREATE','TRANSLATE','FIELD','SCOUT','REVIEW'],machine:['ANALYZE','DESIGN','OPERATE','CREATE','FIELD','SCOUT','REVIEW'],promo:['ANALYZE','DESIGN','CREATE','TRANSLATE','OPERATE','SCOUT','REVIEW'],people:['ANALYZE','DESIGN','TRANSLATE','COACH','OPERATE','REVIEW'],service:['ANALYZE','DESIGN','TRANSLATE','FIELD','SCOUT','OPERATE','REVIEW']};
export function assessment(m:Member,n:number,overrides:Overrides):Level {return overrides[m.id+':'+n]??(m.strong.includes(n)?'strong':m.growth.includes(n)?'growth':'standard');}
export function fit(m:Member,fn:FunctionKey,overrides:Overrides):number {
 const values={strong:3,standard:2,growth:1,unknown:2};
 return specs[fn].abilities.reduce((v,n)=>v+values[assessment(m,n,overrides)],0)/specs[fn].abilities.length*10+(specs[fn].experts.includes(m.id)?2:0);
}
export function instructionStyle(issuerType:string,receiverType:string):string {
 const recipient=receiverType;
 const parts=[recipient[1]==='S'?'現場事実・具体例から説明':'全体目的・背景から説明',recipient[2]==='T'?'判断基準と根拠を先に共有':'人への影響と守る価値を先に共有',recipient[3]==='J'?'手順・節目を先に合意':'成果物の境界を固定し方法には裁量',recipient[0]==='I'?'文章で共有し整理時間を確保':'対話で認識を確認'];
 if(issuerType[2]!==recipient[2])parts.push('成果と人への影響の両方を添える');
 if(issuerType[1]!==recipient[1])parts.push('具体例と全体像をセットにする');
 return parts.join('。')+'。本人の希望を優先する。';
}
function actionsFor(fn:FunctionKey,b:Brief,kind:Kind):string[] {
 const scope=kind==='sales'?'夜時間帯の稼働':kind==='machine'?'入替対象と導入後の稼働':kind==='promo'?'販促対象と顧客反応':kind==='people'?'対象スタッフの現在の行動':'接客場面と顧客の反応';
 const map:Record<FunctionKey,string[]>={
 ANALYZE:[`${scope}の取得可能な記録と比較期間を確認し、未取得データを一覧にする`,`${b.source||'確認したデータ出所'}を明記し、曜日・場所・対象別に現状を比較する`,'低下・未達の要因を事実と仮説に分け、主要論点を3点以内にまとめる'],
 DESIGN:[`分析資料を読み、ミッション「${b.issue}」に対する打ち手を3案作る`,'各案の必要人員・費用・期限・顧客への影響・リスクを比較する','推奨案と継続・中止の判断条件を店長へ提出する。未承認の予算・配置変更は実施しない'],
 CREATE:['承認済みの対象・訴求軸・使用条件を確認する','告知の文言とビジュアル案を作成し、使用場所・日時を添える','責任者の確認後に設置・公開する。不明な表現や条件は確認へ戻す'],
 TRANSLATE:['決定した目的と実行内容を朝礼用に短く整理する','誰が・どこで・何をするかをスタッフ別に伝え、理解を本人の説明で確認する','不明点・抵抗・負荷を記録し、対応担当と回答タイミングを決める'],
 FIELD:['実施する場所・対象・接客手順を確認し、開始前の障害を報告する','承認された施策を現場で実施し、担当者・時刻・実施状況をチェック表に残す','実施できなかった事項と顧客への影響を整理し、改善案をリーダーへ報告する'],
 OPERATE:['各担当の期限・成果物・依存タスクを進行表へまとめる','合意したチェック時刻に状態を確認し、遅延・不在・詰まりを抽出する','優先順位が競合する場合は店長へ判断材料を提出し、変更後の担当・期限を共有する'],
 SCOUT:['観察する場所・時間帯・反応の項目をリーダーと決める','個人を特定しない形で顧客反応と現場変化を観察し、時間・場所・件数を記録する','事実と解釈を分け、反応の良い点・悪い点・追加確認点を共有する'],
 REVIEW:['目標・実績・観測期間・データ取得元を確認する','達成度と実施状況を照合し、成功・失敗要因を根拠付きで整理する','継続・修正・中止案と次回の確認事項を店長へ提出する'],
 COACH:['対象者と期待行動を確認し、現場で実際の行動を観察する','具体的な行動を一緒に練習し、できた点と改善点を本人へ伝える','次回の行動と確認日時を本人と合意し、支援が必要な点を報告する']};
 return map[fn];
}
export function createMission(brief:Brief,overrides:Overrides={},now=new Date()):Mission {
 if(!brief.issue.trim())throw new Error('ミッションを入力してください。');
 if(brief.excluded.includes('maesaki'))throw new Error('店長不在時の代理決裁権限は未設定です。店長を最終判断者として残し、実行担当のみ調整してください。');
 const b={...brief,issue:brief.issue.trim(),excluded:[...brief.excluded]};
 const kind=classify(b.issue);const fns=required[kind];const candidates=people.filter(p=>p.id!=='maesaki'&&!b.excluded.includes(p.id));
 if(!candidates.length)throw new Error('実行担当がいません。少なくとも1名を選んでください。');
 const count:Record<string,number>={};
 const assigned=fns.map(fn=>{
 const ranked=[...candidates].sort((a,b)=> (fit(b,fn,overrides)-(count[b.id]||0)*2)-(fit(a,fn,overrides)-(count[a.id]||0)*2));
 const owner=ranked[0];count[owner.id]=(count[owner.id]||0)+1;return {fn,owner,alternative:ranked[1]};
 });
 const assignedIds=[...new Set(assigned.map(x=>x.owner.id))];
 const leader=[...people.filter(p=>assignedIds.includes(p.id))].sort((a,b)=>{
 const val=(m:Member)=>fit(m,'OPERATE',overrides)+(['sales','machine','promo'].includes(kind)&&m.id==='matsuo'?4:kind==='service'&&m.id==='miyamoto'?4:kind==='people'&&m.id==='yasaka'?4:0);
 return val(b)-val(a);
 })[0];
 const id=globalThis.crypto.randomUUID();
 const team:Assignment[]=[{memberId:'maesaki',role:'COMMANDER',reportsTo:null,functions:[]},...assignedIds.map(memberId=>({memberId,role:memberId===leader.id?'LEADER' as const:'MEMBER' as const,reportsTo:memberId===leader.id?'maesaki':leader.id,functions:assigned.filter(x=>x.owner.id===memberId).map(x=>x.fn)}))];
 const commands:Command[]=assigned.map(({fn,owner,alternative},i)=>{
 const issuer=owner.id===leader.id?'maesaki':leader.id;const boss=people.find(p=>p.id===issuer)!;
 const abilities=specs[fn].abilities.map(n=>abilityNames[n-1]+'：'+({strong:'強い',standard:'標準',growth:'支援前提',unknown:'未評価'}[assessment(owner,n,overrides)]));
 return {id:id+':'+fn,fn,owner:owner.id,issuer,reportTo:issuer,purpose:b.goal||b.issue,actions:actionsFor(fn,b,kind),due:b.deadline,done:specs[fn].done,output:specs[fn].output,reportWhen:b.checkpoint?`中間報告：${b.checkpoint}（日本時間）。完了時にも報告。`:'中間報告日時を開始前に合意する。着手時・完了時・遅延見込み時に報告。',discretion:'承認済みの目的・予算・人員・期限の範囲内で、手順と資料形式を判断してよい。',consult:'データ不足、期限遅延見込み、他タスクとの優先順位競合、予算・人員・営業方針の変更が必要な場合は報告先へ相談。',immediate:'安全問題・重大クレーム・機密情報の問題は直ちに前﨑店長へ報告。緊急時は現場の安全手順を優先。',dependsOn:i===0?[]:fn==='REVIEW'?assigned.slice(0,i).map(x=>id+':'+x.fn):[id+':'+assigned[i-1].fn],priority:i===0?'最優先の初動':'先行成果物を確認して開始',status:'todo',evidence:'',style:instructionStyle(boss.mbti,owner.mbti),reason:`登録評価：${abilities.join('／')}。専門領域：${owner.specialty}。担当集中を抑えて配置。実績と稼働量は未確認。`,alternative:alternative?`${alternative.name}（${alternative.specialty}）。交代時は負荷・期限・権限を再確認。`:'代替担当なし。支援人員の確保が必要。',version:1};
 });
 const unknowns=[!b.goal&&'最終的に達成したい状態',!b.deadline&&'具体的な期限',!b.kpi&&'KPIの定義・単位',!b.baseline&&'KPIの現状値',!b.target&&'KPIの目標値',!b.source&&'データ取得元',!b.period&&'観測期間',!b.checkpoint&&'次回チェックポイント','メンバーの実際の稼働余力と関連実績'].filter((x):x is string=>!!x);
 return {id,version:1,engine:'rules-b1',createdAt:now.toISOString(),updatedAt:now.toISOString(),state:'draft',kind,brief:b,team,commands,analysis:{hypothesis:`${kindLabels[kind]}として一次分類。${/競合|リニューアル/.test(b.issue)?'競合変化と自店の時間帯別実績を比較する。':'現状の事実を収集し、原因と打ち手を分けて検討する。'}分類・要因は仮説です。`,success:b.goal||'成功条件は未設定。目的・KPI目標・期限を開始前に確定してください。',unknowns,risks:['データ不足のまま対策を決める','担当集中と実際の稼働余力の未確認','期限・予算・営業方針の認識違い']},notes:''};
}
export function validateMission(m:Mission):string[] {
 const issues:string[]=[];const ids=new Set(people.map(p=>p.id));
 const teamIds=m.team.map(t=>t.memberId);if(new Set(teamIds).size!==teamIds.length)issues.push('組織に重複した人物があります');
 const commanders=m.team.filter(x=>x.role==='COMMANDER');if(commanders.length!==1)issues.push('最終判断者は1名必要です');
 for(const t of m.team){if(!ids.has(t.memberId))issues.push('未登録人物があります');if(t.role==='COMMANDER'&&t.reportsTo!==null)issues.push('最終判断者に報告先は設定できません');if(t.role!=='COMMANDER'&&(!t.reportsTo||!teamIds.includes(t.reportsTo)))issues.push('報告先が不明です');const visited=new Set<string>();let current:Assignment|undefined=t;while(current){if(visited.has(current.memberId)){issues.push('指揮系統に循環があります');break;}visited.add(current.memberId);current=m.team.find(x=>x.memberId===current?.reportsTo);}}
 const cids=m.commands.map(c=>c.id);if(new Set(cids).size!==cids.length)issues.push('指示IDが重複しています');
 for(const c of m.commands){const t=m.team.find(t=>t.memberId===c.owner);if(!t||!ids.has(c.issuer)||!ids.has(c.reportTo)||c.issuer===c.owner||c.reportTo!==t.reportsTo||c.issuer!==t.reportsTo)issues.push('指示・報告先が指揮系統と一致しません');if(!c.actions.length||!c.actions.every(x=>x.trim())||![c.purpose,c.done,c.output,c.reportWhen,c.discretion,c.consult,c.immediate,c.reason,c.style].every(x=>x.trim()))issues.push('指示に必須情報が不足しています');if(c.dependsOn.some(x=>!cids.includes(x)||x===c.id))issues.push('工程依存が不正です');if(c.due&&!Number.isFinite(Date.parse(c.due+'+09:00')))issues.push('期限が不正です');if(m.state==='active'&&!c.due)issues.push('実行開始には全指示の期限が必要です');}
 for(const c of m.commands){const walk=(id:string,path:Set<string>):boolean=>{if(path.has(id))return true;const next=new Set(path).add(id);return (m.commands.find(x=>x.id===id)?.dependsOn||[]).some(x=>walk(x,next));};if(walk(c.id,new Set())){issues.push('工程依存に循環があります');break;}}
 return [...new Set(issues)];
}
export function activationIssues(m:Mission):string[]{return [...validateMission(m),...(!m.brief.goal?['目的を設定してください']:[]),...(!m.brief.deadline||m.commands.some(c=>!c.due)?['期限を設定してください']:[]),...(!m.brief.checkpoint?['チェックポイントを設定してください']:[])];}
export const nameOf=(id:string)=>people.find(p=>p.id===id)?.name||'未設定';
export function commandText(c:Command):string {return `${nameOf(c.issuer)} → ${nameOf(c.owner)}｜${specs[c.fn].name}\n目的：${c.purpose}\n${c.actions.map((x,i)=>`${i+1}. ${x}`).join('\n')}\n期限：${c.due||'未設定'}（日本時間）\n完了条件：${c.done}\n成果物：${c.output}\n報告先：${nameOf(c.reportTo)}\n報告：${c.reportWhen}\n裁量：${c.discretion}\n相談：${c.consult}\n即時報告：${c.immediate}\n伝え方：${c.style}`;}
