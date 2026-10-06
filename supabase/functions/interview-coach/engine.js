export const WEAKNESSES = ['回答できない','数字不足','具体例不足','長すぎる','結論が遅い','店長視点不足','利益視点不足','人材視点不足','イズム理解不足'];
export const AXES = ['結論の速さ','直接回答','論理性','具体性','実体験','数字','利益視点','現場視点','人材視点','イズムとの整合','店長としての視座','覚悟','言い訳の少なさ','回答時間','冗長性'];
const number = /[0-9０-９]+(?:[.,．][0-9０-９]+)?\s*(?:%|％|万円|億円|円|台|人|店舗|件|ポイント)/;
export function diagnose(text, question, mode, seconds, firstSeconds = null) {
 const v=text.trim(), first=v.split(/[。\n]/)[0]||'', weaknesses=[], evidence=[];
 const add=(w,e)=>{weaknesses.push(w);evidence.push(e)};
 if(!v) add('回答できない','回答が空欄です。');
 else {
  if(question.requiresNumber && (!number.test(v)||/要確認/.test(v))) add('数字不足','必要な数字が未確認、または単位付きで提示されていません。');
  if(question.requiresExperience&&!/しました|していた|経験|当時|実際|実践|南宮崎|羽曳野|前崎/.test(v)) add('具体例不足','本人の経験を示す表現が見つかりません。');
  if(/^(えー|えっと|そうですね|難しい|色々|いろいろ|まず前提)/.test(first)||(firstSeconds!==null&&firstSeconds>8)) add('結論が遅い','前置き、または入力開始まで8秒超。発話の結論速度は未判定です。');
  if(mode==='pres'&&/できますか|できるのか|大丈夫か/.test(question.q)&&!/^はい[、。\s]/.test(v)) add('結論が遅い','可否を聞かれたら、冒頭で「はい、できます。」など結論を返してください。');
  if(v.length>(mode==='pres'?220:400)||seconds>(mode==='pres'?60:100)) add('長すぎる','回答の文字数または計測時間が目安を超えています。');
  if(!/します|変え|判断|責任|決め|徹底|実行|確認|育て|引き受け/.test(v)) add('店長視点不足','自分が判断・実行する行動表現が見つかりません。');
  if(question.category==='利益'&&!/利益|入金|採算|赤字|黒字|とる|取る/.test(v)) add('利益視点不足','質問に必要な利益・採算の視点が見つかりません。');
  if(question.category==='人材'&&!/人|スタッフ|部下|聞|対話|育成|育て/.test(v)) add('人材視点不足','人との対話・育成の表現が見つかりません。');
  if(question.category==='イズム'&&!/お客様|接客|営業|判断|行動|現場|スタッフ/.test(v)) add('イズム理解不足','イズムを現場の行動に結びつける表現が見つかりません。');
 }
 return {weaknesses:[...new Set(weaknesses)],evidence,characters:v.length,seconds,firstSeconds,kind:'local',note:'ローカル診断は確認候補です。意味・真偽・合否の判定ではありません。手動で修正できます。'};
}
export function priority(question, state, now=Date.now()) {
 const r=state.records[question.id];
 if(!r) return 4+question.priority;
 const age=Math.max(0,(now-Date.parse(r.updatedAt))/86400000);
 return 1+question.priority+(r.grade==='weak'?5:0)+(r.weaknesses?.length||0)*2+(r.grade==='good'?-2:0)+Math.min(age,7);
}
export function weightedNext(pool,state,recent=[],random=Math.random) {
 let candidates=pool.filter(q=>!recent.slice(-3).includes(q.id));if(!candidates.length)candidates=pool;
 if(!candidates.length)return null;
 const weights=candidates.map(q=>Math.max(.25,priority(q,state))),sum=weights.reduce((a,b)=>a+b,0);let n=random()*sum;
 for(let i=0;i<candidates.length;i++){n-=weights[i];if(n<0)return candidates[i]}return candidates.at(-1);
}
export function emptyState(){return {version:3,records:{},history:[],facts:{},drafts:{},preferences:{mode:'take'}}}
export function validateBackup(raw,questions) {
 if(!raw||raw.version!==3||!raw.records||typeof raw.records!=='object'||!Array.isArray(raw.history))throw new Error('対応するバックアップではありません。');
 const ids=new Set(questions.map(q=>q.id)), out=emptyState();out.savedAt=Number.isFinite(Date.parse(raw.savedAt))?raw.savedAt:new Date(0).toISOString();
 const cleanText=v=>typeof v==='string'?v.slice(0,12000):'';
 const cleanRecord=r=>({answer:cleanText(r.answer),grade:['good','weak'].includes(r.grade)?r.grade:null,weaknesses:Array.isArray(r.weaknesses)?r.weaknesses.filter(w=>WEAKNESSES.includes(w)):[],updatedAt:Number.isFinite(Date.parse(r.updatedAt))?r.updatedAt:new Date().toISOString()});
 for(const [id,r] of Object.entries(raw.records)){if(ids.has(id)&&r&&typeof r==='object')out.records[id]=cleanRecord(r)}
 out.history=raw.history.slice(-5000).filter(r=>r&&ids.has(r.questionId)).map(r=>({...cleanRecord(r),id:cleanText(r.id)||crypto.randomUUID(),questionId:r.questionId,prompt:cleanText(r.prompt),mode:['take','pres','west','today','all'].includes(r.mode)?r.mode:'take',seconds:Math.max(0,Math.min(3600,Number(r.seconds)||0)),kind:r.kind==='followup'?'followup':'answer'}));
 if(raw.facts&&typeof raw.facts==='object')for(const [k,v]of Object.entries(raw.facts)){if(k.length<150&&v&&typeof v==='object')out.facts[k]={value:cleanText(v.value),source:cleanText(v.source),date:cleanText(v.date),updatedAt:Number.isFinite(Date.parse(v.updatedAt))?v.updatedAt:''}}
 if(raw.drafts&&typeof raw.drafts==='object')for(const [id,v]of Object.entries(raw.drafts)){if(ids.has(id))out.drafts[id]=cleanText(v)}
 if(raw.preferences&&['take','pres'].includes(raw.preferences.mode))out.preferences.mode=raw.preferences.mode;
 return out;
}
export function mergeBackup(current,incoming){
 const out=structuredClone(current);
 for(const [id,r]of Object.entries(incoming.records))if(!out.records[id]||Date.parse(r.updatedAt)>Date.parse(out.records[id].updatedAt))out.records[id]=r;
 out.history=[...new Map([...current.history,...incoming.history].map(r=>[r.id,r])).values()].slice(-5000);
 out.facts={...incoming.facts,...current.facts};for(const [key,f]of Object.entries(incoming.facts))if(f.updatedAt&&(!current.facts[key]?.updatedAt||Date.parse(f.updatedAt)>Date.parse(current.facts[key].updatedAt)))out.facts[key]=f;out.drafts={...incoming.drafts,...current.drafts};return out;
}
