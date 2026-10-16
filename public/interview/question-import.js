import {validQuestionDate,validateLibrary} from './question-library.js?v=20261016-bank2';
export const IMPORT_LIMIT=300;
const normalize=s=>String(s??'').normalize('NFKC').replace(/\s+/g,'').toLowerCase();
export const importKey=q=>[normalize(q.q),q.m==='pres'?'pres':'take',q.askedOn||''].join('|');
const aliases={q:['質問','question','q','過去問'],answer:['回答','解答','答え','answer','a'],askedOn:['出題日','日付','date','askedon'],m:['面接官','interviewer','m'],category:['テーマ','カテゴリー','category'],src:['出典','メモ','source','src'],kind:['区分','種別','kind']};
export function parseQuestionDate(value){
 const s=String(value??'').trim();if(!s)return '';
 const m=s.match(/^(\d{4})[年/.-](\d{1,2})[月/.-](\d{1,2})日?$/);const result=m?`${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`:s;
 if(!validQuestionDate(result))throw new Error('出題日は年月日まで入力してください。不明な場合は空欄にできます。');return result;
}
const role=v=>!String(v??'').trim()?'':/社長|pres/i.test(v)?'pres':/部長|take|department/i.test(v)?'take':'invalid';
const kind=v=>!String(v??'').trim()?'':/想定|assumed/i.test(v)?'assumed':/未確認|unconfirmed/i.test(v)?'unconfirmed':/過去|past/i.test(v)?'past':'invalid';
function fields(raw,defaults){return {q:String(raw.q??'').trim(),answer:String(raw.answer??'').trim(),askedOn:String(raw.askedOn||defaults.askedOn||'').trim(),m:role(raw.m)||defaults.m||'take',kind:kind(raw.kind)||defaults.kind||'past',category:String(raw.category||defaults.category||'その他').trim(),src:String(raw.src||defaults.src||'').trim()}}
export function parseDelimited(text,delimiter){
 const rows=[];let row=[],cell='',quoted=false,closed=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++}else{quoted=false;closed=true}}else cell+=c;continue}
  if(c==='"'&&!cell&&!closed){quoted=true;continue}if(c===delimiter){row.push(cell);cell='';closed=false;continue}if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell='';closed=false;continue}if(closed&&c.trim())throw new Error('CSVの引用符の後を確認してください。');cell+=c;
 }
 if(quoted)throw new Error('CSVの引用符が閉じていません。');row.push(cell);if(row.some(v=>v.trim()))rows.push(row);return rows;
}
function structured(text,delimiter,defaults){const rows=parseDelimited(text,delimiter);if(!rows.length)return [];const keys=rows[0].map(h=>Object.entries(aliases).find(([,names])=>names.includes(normalize(h)))?.[0]);const header=keys.includes('q');const columns=header?keys:['q','answer','askedOn','m','category','src','kind'];return rows.slice(header?1:0).map(row=>{const raw={};columns.forEach((k,i)=>{if(k)raw[k]=row[i]??''});return fields(raw,defaults)})}
export function parseQuestionImport(input,defaults={},format='auto'){
 const text=String(input).replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').trim();if(!text)throw new Error('質問を貼り付けるか、テキスト・CSVファイルを選んでください。');if(text.length>1_000_000)throw new Error('一度に取り込める文章は100万文字までです。');if(/^[{[]/.test(text))throw new Error('バックアップJSONは「保存データ・バックアップ」から復元してください。');
 let entries;
 if(format==='csv'||format==='tsv'||(format==='auto'&&text.includes('\t')))entries=structured(text,format==='tsv'||text.includes('\t')?'\t':',',defaults);
 else if(/^(?:"?質問"?|question|q),/i.test(text))entries=structured(text,',',defaults);
 else{
  const labelled=/^(?:(?:Q|Ｑ|質問|問|A|Ａ|回答|解答|答え|答)\s*\d*\s*[:：.．)）]|\d+\s*[.．、)）]|[・●])/im.test(text);
  entries=[];let current=null,answerMode=false,meta={...defaults};const finish=()=>{if(current)entries.push(fields(current,meta));current=null;answerMode=false};
  for(const original of text.split('\n')){const line=original.trim();if(!line)continue;
   const metadata=line.match(/^(日付|出題日|面接官|出典|テーマ)\s*[:：]\s*(.*)$/);if(metadata){finish();const key={日付:'askedOn',出題日:'askedOn',面接官:'m',出典:'src',テーマ:'category'}[metadata[1]];meta[key]=metadata[2];continue}
   if(/^\d{4}[年/.-]\d{1,2}[月/.-]\d{1,2}日?$/.test(line)){finish();meta.askedOn=line;continue}
   const a=line.match(/^(?:A|Ａ|回答|解答|答え|答)\s*\d*\s*[:：.．)）]\s*(.*)$/i);if(a){if(!current)throw new Error('回答の前に「Q：質問」を置いてください。');current.answer+=(current.answer?'\n':'')+a[1];answerMode=true;continue}
   const q=line.match(/^(?:(?:Q|Ｑ|質問|問)\s*\d*\s*[:：.．)）]|\d+\s*[.．、)）]|[・●])\s*(.*)$/i);
   if(q){finish();current={...meta,q:q[1],answer:''};continue}
   if(!current||(!answerMode&&(!labelled||/[？?]$/.test(current.q)))){finish();current={...meta,q:line,answer:''}}else if(answerMode)current.answer+='\n'+line;else current.q+='\n'+line;
  }finish();
 }
 if(!entries.length)throw new Error('質問が見つかりません。');if(entries.length>IMPORT_LIMIT)throw new Error(`一度に取り込める質問は${IMPORT_LIMIT}問までです。`);
 return entries.map(e=>{try{return {...e,askedOn:parseQuestionDate(e.askedOn)}}catch{return e}});
}
export function validateImportEntry(e){if(!e.q?.trim()||e.q.length>2000)return '質問は1〜2,000文字で入力してください。';if(e.answer.length>12000)return '回答は12,000文字以内にしてください。';if(!validQuestionDate(e.askedOn))return '出題日を修正するか、空欄にしてください。';if(!['take','pres'].includes(e.m))return '面接官を選んでください。';if(!['past','assumed','unconfirmed'].includes(e.kind))return '区分を選んでください。';if(!e.category?.trim()||e.category.length>80||e.src.length>300)return 'テーマ・出典の長さを確認してください。';return ''}
export function planQuestionImport(entries,questions){const existing=new Map(questions.map(q=>[importKey(q),q.id])),seen=new Set();return entries.map(e=>{const key=importKey(e),duplicate=seen.has(key),existingId=existing.get(key);seen.add(key);return {...e,existingId,duplicate,selected:!duplicate&&!existingId,error:validateImportEntry(e)}})}
export function applyQuestionImport(library,base,questions,entries,now=new Date().toISOString(),newId=()=>crypto.randomUUID()){
 const selected=entries.filter(e=>e.selected);if(!selected.length)throw new Error('取り込む質問を選んでください。');if(selected.length>IMPORT_LIMIT)throw new Error('取り込む件数が多すぎます。');const next=structuredClone(library);const seen=new Set(),existing=new Map(questions.map(q=>[importKey(q),q.id])),ids=[];
 for(const e of selected){const error=validateImportEntry(e);if(error)throw new Error(error);const key=importKey(e);if(seen.has(key))throw new Error('同じ質問・面接官・出題日の行が重複しています。片方のチェックを外してください。');seen.add(key);const match=existing.get(key);if(match&&e.existingId!==match)throw new Error('別の画面で同じ質問が追加されています。貼り付けに戻り、もう一度内容を確認してください。');const id=match||'u-'+newId();next.entries[id]={...e,updatedAt:now};ids.push(id)}
 return {library:validateLibrary(next,base),ids};
}
export async function readQuestionFile(file){if(!/\.(txt|csv|tsv)$/i.test(file.name))throw new Error('対応形式はTXT・CSV・TSVです。PDFやWord、Excelは文章・セルをコピーして貼り付けてください。');if(file.size>2_000_000)throw new Error('ファイルは2MB以内で選んでください。');const bytes=await file.arrayBuffer();try{return new TextDecoder('utf-8',{fatal:true}).decode(bytes)}catch{return new TextDecoder('shift_jis').decode(bytes)}}
