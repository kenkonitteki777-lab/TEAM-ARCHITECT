import { useState } from 'react';
export function CopyButton({text,label='伝達文をコピー'}:{text:string;label?:string}){
 const [copied,setCopied]=useState(''),[fallback,setFallback]=useState(false);
 async function copy(){try{await navigator.clipboard.writeText(text);setCopied(text);setFallback(false);}catch{setFallback(true);setCopied('');}}
 return <div className="copy-control"><button className="secondary" onClick={()=>void copy()} aria-label={label}>{copied===text?'コピー済み':label}</button>{copied===text&&<small role="status">コピーしました</small>}{fallback&&<label className="field">このブラウザーでは直接コピーできません。文章を選択してください。<textarea aria-label="コピーする文章" readOnly rows={5} value={text} onFocus={e=>e.target.select()}/></label>}</div>;
}
