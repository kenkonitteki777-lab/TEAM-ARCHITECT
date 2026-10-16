// Personal question edits remain on this device; the published source stays intact.
export const QUESTION_KEY='team_architect_question_library_v1';
export const emptyLibrary=()=>({version:1,entries:{}});
const stamp=v=>typeof v==='string'&&Number.isFinite(Date.parse(v));
export function validQuestionDate(v){if(v==='')return true;if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)||v<'1900-01-01'||v>'2199-12-31')return false;const time=Date.parse(v+'T00:00:00Z');return Number.isFinite(time)&&new Date(time).toISOString().slice(0,10)===v}
function clean(entry){
 const text=(key,max,required=false)=>{const v=entry[key];if(typeof v!=='string'||v.length>max||(required&&!v.trim()))throw new Error('質問・回答・分類の入力内容を確認してください。');return v.trim()};
 if(!validQuestionDate(entry.askedOn)||!['past','assumed','unconfirmed'].includes(entry.kind)||!['take','pres'].includes(entry.m)||!stamp(entry.updatedAt))throw new Error('出題日・面接官・質問の区分を確認してください。');
 return {q:text('q',2000,true),answer:text('answer',12000),category:text('category',80,true),src:text('src',300),askedOn:entry.askedOn,kind:entry.kind,m:entry.m,updatedAt:entry.updatedAt};
}
export function validateLibrary(raw,base){
 if(!raw||raw.version!==1||!raw.entries||typeof raw.entries!=='object'||Array.isArray(raw.entries))throw new Error('追加した質問の保存形式を確認してください。');
 const allowed=new Set(base.map(q=>q.id)),out=emptyLibrary(),entries=Object.entries(raw.entries);
 if(entries.length>2000)throw new Error('追加・編集できる質問は2,000件までです。');
 for(const [id,e]of entries){if(!allowed.has(id)&&!/^u-[a-f0-9-]{36}$/.test(id))throw new Error('質問IDが不正です。');if(!e||typeof e!=='object')throw new Error('質問の内容が不正です。');out.entries[id]=clean(e)}
 return out;
}
export function mergeLibraries(a,b){const out=structuredClone(a);for(const [id,e]of Object.entries(b.entries))if(!out.entries[id]||Date.parse(e.updatedAt)>Date.parse(out.entries[id].updatedAt))out.entries[id]=structuredClone(e);return out}
export function putQuestion(library,base,id,fields,now=new Date().toISOString()){
 const out=structuredClone(library);out.entries[id]={...fields,updatedAt:now};return validateLibrary(out,base);
}
export function materializeQuestions(base,library){
 const ids=new Set(base.map(q=>q.id));
 const apply=(q,e)=>e?{...q,...e,t:e.q,personal:true,status:e.kind==='past'?'本人登録の過去問':e.kind==='assumed'?'本人登録の想定質問':'出題状況未確認'}:{...q,askedOn:'',kind:'unconfirmed'};
 return [...base.map(q=>apply(q,library.entries[q.id])),...Object.entries(library.entries).filter(([id])=>!ids.has(id)).map(([id,e])=>apply({id,followups:[],core:'自分の言葉で結論・根拠・行動を整理',intent:'本人が登録した質問',priority:1,requiresNumber:false,requiresExperience:false},e))];
}
export function filterQuestions(questions,{search='',year='',month='',day='',kind='',role=''}={}){
 const term=search.trim().toLocaleLowerCase();
 return questions.filter(q=>(!term||[q.q,q.answer,q.src,q.category].join(' ').toLocaleLowerCase().includes(term))&&(!year||(year==='unknown'?!q.askedOn:q.askedOn.startsWith(year+'-')))&&(!month||q.askedOn?.slice(5,7)===month)&&(!day||q.askedOn===day)&&(!kind||q.kind===kind)&&(!role||q.m===role)).sort((a,b)=>(b.askedOn||'').localeCompare(a.askedOn||'')||a.id.localeCompare(b.id));
}
