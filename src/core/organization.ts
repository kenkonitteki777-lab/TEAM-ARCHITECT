import { people } from './data';
export type Grade='unknown'|'storeManager'|'manager'|'employee'|'cs';
export type Position={grade:Grade;coach:boolean;hallMaster:boolean;reportsTo:string|null};
export type Organization=Record<string,Position>;
export const gradeNames:Record<Grade,string>={unknown:'未設定',storeManager:'店長',manager:'マネージャー',employee:'社員',cs:'CSキャスト'};
export function defaultOrganization():Organization{return Object.fromEntries(people.map(p=>[p.id,{grade:p.id==='maesaki'?'storeManager':'unknown',coach:false,hallMaster:false,reportsTo:null}])) as Organization;}
export function validateOrganization(value:unknown):string[]{
 const errors:string[]=[];
 if(!value||typeof value!=='object'||Array.isArray(value))return ['組織設定の形式が不正です'];
 const org=value as Organization;
 if(Object.keys(org).length!==people.length||people.some(p=>!Object.prototype.hasOwnProperty.call(org,p.id)))return ['組織設定は登録人材7名分が必要です'];
 for(const p of people){const x=org[p.id];if(!x||!Object.prototype.hasOwnProperty.call(gradeNames,x.grade)||typeof x.coach!=='boolean'||typeof x.hallMaster!=='boolean'||!(x.reportsTo===null||people.some(p=>p.id===x.reportsTo))){errors.push('役職・兼務・直属上司の形式が不正です');continue;}
 if(x.coach&&!['employee','cs'].includes(x.grade))errors.push(p.name+'：コーチは社員またはCSキャストに設定してください');
 if(x.hallMaster&&x.grade!=='employee')errors.push(p.name+'：ホールマスターは社員に設定してください');
 if(p.id==='maesaki'?(x.grade!=='storeManager'||x.reportsTo!==null):x.grade==='storeManager')errors.push('店長・最終判断者は前﨑店長です');
 if(x.grade==='manager'&&x.reportsTo&&org[x.reportsTo]?.grade!=='storeManager')errors.push(p.name+'：マネージャーの直属上司は店長です');
 if(x.grade==='unknown'&&x.reportsTo!==null)errors.push(p.name+'：先に役職を設定してください');
 const seen=new Set<string>();let id:string|null=p.id;while(id&&org[id]){if(seen.has(id)){errors.push('直属上司の設定に循環があります');break;}seen.add(id);id=org[id].reportsTo;}
 }
 // Employment grade and appointed duties are separate; neither coach nor hall master grants line authority.
 return [...new Set(errors)];
}
export function reportingPath(org:Organization,id:string):string[]{
 const path:string[]=[];let current:string|null=id;
 while(current&&org[current]&&org[current].grade!=='unknown'&&!path.includes(current)){path.push(current);if(current==='maesaki')return path;current=org[current].reportsTo;}
 return [];
}
