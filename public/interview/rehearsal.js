import {WEAKNESSES,weightedNext} from './engine.js';
export const FIXES={
 '回答できない':'模範解答の核を一つだけ選び、自分の言葉で最初の一文を言い直す。',
 '数字不足':'何の数字・対象期間・目標との差かを確認する。分からない実績は「要確認」のまま残す。',
 '具体例不足':'いつ・どこで・自分が何を変え・何が変わったかを一つの経験で答える。',
 '長すぎる':'結論・根拠・行動を一文ずつに絞り、同じ質問にもう一度答える。',
 '結論が遅い':'質問への答えを最初の一文で返す。可否なら「はい、できます。」から始める。',
 '店長視点不足':'自分が何を決め、誰に任せ、何で結果を確かめるかまで答える。',
 '利益視点不足':'変更する項目、利益への影響、顧客への影響、見直す条件をつなげる。',
 '人材視点不足':'誰に・何を任せ・どう支援し・何を見て成長を確かめるかを答える。',
 'イズム理解不足':'イズムの言葉を一つ選び、営業判断か育成の具体的な行動に結びつける。'
};
export function weakQuestions(questions,state){return questions.filter(q=>state.records[q.id]?.grade==='weak'||state.records[q.id]?.weaknesses?.length)}
export function selectPracticeQuestion(questions,state,recent=[],random=Math.random){
 const unseen=questions.filter(q=>!recent.includes(q.id));return weightedNext(unseen,state,[],random);
}
export function recordOralPractice(current,q,steps,weaknesses,now=new Date().toISOString(),id=crypto.randomUUID()){
 if(!steps.length||steps.some(s=>typeof s.prompt!=='string'||!Number.isFinite(s.seconds)||s.seconds<0))throw new Error('練習の計測結果を確認できません。');
 const out=structuredClone(current),tags=[...new Set(weaknesses)].filter(w=>WEAKNESSES.includes(w)),grade=tags.length?'weak':'good';
 // Oral practice has no transcript. Keep earlier written answers intact.
 out.records[q.id]={...out.records[q.id],answer:out.records[q.id]?.answer||'',grade,weaknesses:tags,updatedAt:now};
 out.history.push(...steps.map((s,i)=>({id:id+'-'+i,questionId:q.id,prompt:s.prompt,answer:'',grade,weaknesses:tags,updatedAt:now,mode:q.m==='pres'?'pres':'take',seconds:Math.min(3600,Math.round(s.seconds)),kind:i?'followup':'answer'})));
 out.history=out.history.slice(-5000);out.savedAt=now;return out;
}
export function weaknessSummary(state,questions){const counts=new Map();for(const q of weakQuestions(questions,state))for(const w of state.records[q.id].weaknesses||[])counts.set(w,(counts.get(w)||0)+1);return [...counts].sort((a,b)=>b[1]-a[1]);}
