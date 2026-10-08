import { validateExecution } from './execution';
import { people, type Level } from './data';
import { specs, validateMission, type Mission, type Overrides } from './mission';
export const STORE_KEY='team-architect-v2';
export const BACKUP_KEY='team-architect-legacy-backup-v1';
export type Legacy={history:string|null;capabilities:string|null};
export type Store={schemaVersion:2;missions:Mission[];overrides:Overrides;legacy:Legacy};
export type StorageLike=Pick<Storage,'getItem'|'setItem'>;
const levels=['strong','standard','growth','unknown'];
const object=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const strings=(x:unknown):x is string[]=>Array.isArray(x)&&x.every(y=>typeof y==='string');
const strFields=(x:Record<string,unknown>,keys:string[])=>keys.every(k=>typeof x[k]==='string');
export function parseStore(raw:string):Store {
 const x:unknown=JSON.parse(raw);
 if(!object(x)||x.schemaVersion!==2||!Array.isArray(x.missions)||!object(x.overrides)||!object(x.legacy))throw new Error('対応していない保存形式です。元データを保持しています。');
 if(![x.legacy.history,x.legacy.capabilities].every(v=>v===null||typeof v==='string'))throw new Error('旧データの形式が不正です。');
 for(const [k,v] of Object.entries(x.overrides)){const [id,n]=k.split(':');if(!people.some(p=>p.id===id)||!/^([1-9]|1[0-8])$/.test(n)||!levels.includes(String(v)))throw new Error('能力設定が不正です。');}
 const seen=new Set<string>();
 for(const m of x.missions){
 if(!object(m)||!strFields(m,['id','createdAt','updatedAt','notes'])||m.engine!=='rules-b1'||!Number.isInteger(m.version)||Number(m.version)<1||!['draft','active'].includes(String(m.state))||!['sales','machine','promo','people','service'].includes(String(m.kind))||!object(m.brief)||!object(m.analysis)||!Array.isArray(m.team)||!Array.isArray(m.commands))throw new Error('ミッションの形式が不正です。');
 if(seen.has(String(m.id)))throw new Error('ミッションIDが重複しています。');seen.add(String(m.id));
 if(!strFields(m.brief,['issue','goal','constraints','deadline','kpi','baseline','target','source','period','checkpoint'])||!strings(m.brief.excluded)||m.brief.excluded.some(id=>!people.some(p=>p.id===id))||!strFields(m.analysis,['hypothesis','success'])||!strings(m.analysis.unknowns)||!strings(m.analysis.risks))throw new Error('分析・入力の形式が不正です。');
 if(!m.team.length||!m.commands.length)throw new Error('組織・指示が空です。');
 for(const t of m.team){if(!object(t)||typeof t.memberId!=='string'||!['COMMANDER','LEADER','MEMBER'].includes(String(t.role))||!(t.reportsTo===null||typeof t.reportsTo==='string')||!strings(t.functions)||t.functions.some(f=>!Object.prototype.hasOwnProperty.call(specs,f)))throw new Error('組織の形式が不正です。');}
 for(const c of m.commands){if(!object(c)||!strFields(c,['id','fn','owner','issuer','reportTo','purpose','due','done','output','reportWhen','discretion','consult','immediate','priority','status','evidence','style','reason','alternative'])||!Object.prototype.hasOwnProperty.call(specs,String(c.fn))||!strings(c.actions)||!strings(c.dependsOn)||!['todo','doing','blocked','done'].includes(String(c.status))||!Number.isInteger(c.version)||Number(c.version)<1)throw new Error('指示の形式が不正です。');}
 const errors=[...validateMission(m as unknown as Mission),...validateExecution(m as unknown as Mission)];if(errors.length)throw new Error(errors.join('／'));
 }
 return x as unknown as Store;
}
export function loadStore(storage:StorageLike):Store {
 const raw=storage.getItem(STORE_KEY);if(raw!==null)return parseStore(raw);
 const legacy={history:storage.getItem('team-architect-history'),capabilities:storage.getItem('team-architect-capabilities')};
 const overrides:Overrides={};
 if(legacy.capabilities!==null){const x:unknown=JSON.parse(legacy.capabilities);if(!object(x))throw new Error('旧能力データが不正です。書出して確認してください。');for(const [key,value] of Object.entries(x)){const match=/^(\d+)-(\d+)$/.exec(key);if(!match||!people[Number(match[1])]||Number(match[2])<1||Number(match[2])>18||!levels.includes(String(value)))throw new Error('旧能力データに未知の設定があります。元データを保持しています。');overrides[people[Number(match[1])].id+':'+match[2]]=value as Level;}}
 if(legacy.history!==null&&!Array.isArray(JSON.parse(legacy.history)))throw new Error('旧履歴データが不正です。元データを保持しています。');
 return {schemaVersion:2,missions:[],overrides,legacy};
}
export function saveStore(storage:StorageLike,store:Store):void {
 parseStore(JSON.stringify(store));
 if(storage.getItem(STORE_KEY)!==null)parseStore(storage.getItem(STORE_KEY)!);
 if(storage.getItem(BACKUP_KEY)===null)storage.setItem(BACKUP_KEY,JSON.stringify(store.legacy));
 storage.setItem(STORE_KEY,JSON.stringify(store));
}
export function mergeStore(current:Store,incoming:Store):Store {
 const ids=new Set(current.missions.map(m=>m.id));
 if(incoming.missions.some(m=>ids.has(m.id)))throw new Error('同じミッションが既にあります。既存データを上書きしないため読込みを中止しました。');
 // Existing capability settings take priority; incoming missions are appended.
 const merged={...current,missions:[...incoming.missions,...current.missions],overrides:{...incoming.overrides,...current.overrides},legacy:{history:current.legacy.history??incoming.legacy.history,capabilities:current.legacy.capabilities??incoming.legacy.capabilities}};
 return parseStore(JSON.stringify(merged));
}

