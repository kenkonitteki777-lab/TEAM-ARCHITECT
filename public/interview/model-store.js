// Personal model answers are kept separate from interview attempts and source material.
export const MODEL_KEY='team_architect_model_answers_v1';
export const DRAFT_KEY='team_architect_model_drafts_v1';
export function emptyModels(){return {version:1,entries:{}}}
const date=v=>typeof v==='string'&&Number.isFinite(Date.parse(v));
const text=v=>typeof v==='string'&&v.trim().length>0&&v.length<=12000;
function history(items){return [...new Map(items.map(r=>[r.updatedAt+'\n'+r.text,r])).values()].sort((a,b)=>Date.parse(a.updatedAt)-Date.parse(b.updatedAt)).slice(-20)}
export function validateModels(raw,questions){
 if(!raw||raw.version!==1||!raw.entries||typeof raw.entries!=='object'||Array.isArray(raw.entries))throw new Error('模範解答の保存形式を確認してください。');
 const allowed=new Set(questions.flatMap(q=>[q.id,...q.followups.map((_,i)=>q.id+':f'+i)])),out=emptyModels();
 for(const [key,e]of Object.entries(raw.entries)){
  if(!allowed.has(key))continue;
  if(!e||!text(e.text)||!date(e.updatedAt)||!Array.isArray(e.revisions??[]))throw new Error('模範解答の内容または更新日時が不正です。');
  out.entries[key]={text:e.text,updatedAt:e.updatedAt,revisions:history((e.revisions??[]).filter(r=>r&&text(r.text)&&date(r.updatedAt)).map(r=>({text:r.text,updatedAt:r.updatedAt})))};
 }
 return out;
}
export function mergeModels(current,incoming){
 const out=structuredClone(current);
 for(const [key,b]of Object.entries(incoming.entries)){
  const a=out.entries[key];if(!a){out.entries[key]=structuredClone(b);continue}
  const newer=Date.parse(b.updatedAt)>Date.parse(a.updatedAt)?b:a,older=newer===b?a:b;
  out.entries[key]={...newer,revisions:history([...a.revisions,...b.revisions,...(older.text!==newer.text?[{text:older.text,updatedAt:older.updatedAt}]:[])])};
 }
 return out;
}
export function setModel(store,key,value,now=new Date().toISOString()){
 if(!text(value)||!date(now))throw new Error('模範解答を1〜12,000文字で入力してください。');
 const out=structuredClone(store),old=out.entries[key];
 out.entries[key]={text:value.trim(),updatedAt:now,revisions:history([...(old?.revisions??[]),...(old&&old.text!==value.trim()?[{text:old.text,updatedAt:old.updatedAt}]:[])])};return out;
}
// Transactional primary write: quota errors never mutate the caller's active store.
export function persistModels(storage,store){storage.setItem(MODEL_KEY,JSON.stringify(store));return store}
