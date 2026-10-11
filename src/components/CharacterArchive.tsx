import { useEffect, useRef, useState } from 'react';
import { typeBook, functionStack } from '../core/data';
import { typeTraits } from '../core/typeTraits';
import { typeGroups, typeGroup, typeTheme } from '../core/typeGroups';
import { TypePortrait } from './TypePortrait';
import { TypeTraits } from './TypeTraits';
import { MbtiLab } from './MbtiLab';
import { DiagnosisLink } from './DiagnosisLink';
export function CharacterArchive({type,onSelect}:{type:string;onSelect:(type:string)=>void}){
 const [group,setGroup]=useState('all'),[request,setRequest]=useState(0);
 const detail=useRef<HTMLElement>(null),cards=useRef<HTMLDivElement>(null);
 const visible=typeBook.filter(t=>group==='all'||typeGroup(t.mbti)?.id===group);
 const chosen=typeBook.find(t=>t.mbti===type)!;
 useEffect(()=>{if(request){detail.current?.scrollIntoView({block:'start'});detail.current?.focus({preventScroll:true});}},[type,request]);
 function filter(id:string){setGroup(id);setRequest(0);if(id!=='all'&&typeGroup(type)?.id!==id)onSelect(typeGroups.find(g=>g.id===id)!.types[0]);}
 function back(){setRequest(0);const card=cards.current?.querySelector<HTMLButtonElement>(`[data-type="${type}"]`);card?.scrollIntoView({block:'center'});card?.focus({preventScroll:true});}
 return <><div className="page-heading"><div><small>CHARACTER ARCHIVE / 16 PERSONALITIES</small><h1>16の個性。ひとつのチーム。</h1><p>人物を選んで強みや苦手を確認。2人の組み合わせも試せます。</p></div><DiagnosisLink/></div><MbtiLab/><section className="archive-browser" aria-label="グループからタイプを探す"><div className="group-filters" role="group" aria-label="MBTIの色グループ"><button className="secondary" aria-pressed={group==='all'} onClick={()=>filter('all')}>全16タイプ</button>{typeGroups.map(g=><button key={g.id} className={'secondary mbti-theme mbti-'+g.id} aria-pressed={group===g.id} onClick={()=>filter(g.id)}><i aria-hidden="true"/>{g.colour} · {g.name}</button>)}</div><div ref={cards} className="character-gallery" aria-label="16タイプのキャラクター">{visible.map(t=><button key={t.mbti} data-type={t.mbti} className={'type-card '+typeTheme(t.mbti)+(type===t.mbti?' selected':'')} aria-pressed={type===t.mbti} onClick={()=>{onSelect(t.mbti);setRequest(n=>n+1);}}><TypePortrait type={t.mbti}/><div><small>{t.mbti}</small><span className="type-group-label">{typeGroup(t.mbti)!.colour}グループ · {typeGroup(t.mbti)!.name}</span><b>{t.jp}</b><span>{t.catch}</span><dl className="type-card-facts"><div><dt>強み</dt><dd>{typeTraits[t.mbti].strength}</dd></div><div><dt>弱み</dt><dd>{typeTraits[t.mbti].weakness}</dd></div><div><dt>得意</dt><dd>{typeTraits[t.mbti].good}</dd></div><div><dt>不得意</dt><dd>{typeTraits[t.mbti].hard}</dd></div></dl></div></button>)}</div></section><section ref={detail} className={'panel character-detail '+typeTheme(type)} id="character-detail" tabIndex={-1} aria-label={`${type}の仕事特性`}><TypePortrait type={type} large eager/><div><div className="detail-tools"><span className="type-group-label">{typeGroup(type)!.colour}グループ · {typeGroup(type)!.name}</span><button className="secondary" onClick={back}>図鑑に戻る</button></div><small>WORK STYLE / {type}</small><h2>{chosen.jp}</h2><h3>{chosen.catch}</h3><TypeTraits type={type}/><dl className="analysis-list"><dt>伝え方の参考</dt><dd>{chosen.request}</dd><dt>観察して調整する点</dt><dd>{chosen.watch}</dd><dt>認知機能（参考モデル）</dt><dd>{functionStack[type]}</dd></dl><p className="portrait-note">外見・性別・年齢は創作です。本人の希望と実際の行動を優先してください。</p></div></section></>;
}
