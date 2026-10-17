export const APP_PREF_KEY='team_architect_app_preferences_v1';
export const SESSION_KEY='team_architect_session_v1';
export const BACKUP_DATE_KEY='team_architect_backup_exported_at';
export const defaultAppPreferences=()=>({version:1,questionCount:5,departmentSeconds:60,presidentSeconds:30,textSize:'standard'});
export function validateAppPreferences(raw){
 if(!raw||raw.version!==1||![1,3,5,10].includes(raw.questionCount)||![30,45,60,90,120].includes(raw.departmentSeconds)||![30,45,60,90,120].includes(raw.presidentSeconds)||!['standard','large'].includes(raw.textSize))throw new Error('練習・表示設定の形式を確認してください。');
 return {version:1,questionCount:raw.questionCount,departmentSeconds:raw.departmentSeconds,presidentSeconds:raw.presidentSeconds,textSize:raw.textSize};
}
export function validateSession(raw){
 if(!raw||raw.version!==1||!['read','oral','ai'].includes(raw.method)||!['department','president'].includes(raw.role)||typeof raw.questionId!=='string'||raw.questionId.length>80||!raw.scope||!['all','past','personal','weak','selection'].includes(raw.scope.type)||!Array.isArray(raw.scope.ids)||raw.scope.ids.length>2000||!raw.scope.ids.every(id=>typeof id==='string'&&id.length<=80))throw new Error('前回設定の形式を確認してください。');
 return {version:1,method:raw.method,role:raw.role,questionId:raw.questionId,scope:{type:raw.scope.type,ids:[...new Set(raw.scope.ids)]}};
}
export function resolveSession(raw,questions,state,filter){
 const saved=validateSession(raw),ids=new Set(questions.map(q=>q.id));saved.scope.ids=saved.scope.ids.filter(id=>ids.has(id));let list=filter(questions,saved.scope,state);
 if(!list.length){saved.scope={type:'all',ids:[]};list=questions}
 let roleList=list.filter(q=>saved.role==='president'?q.m==='pres':q.m!=='pres');if(!roleList.length){saved.role=list[0]?.m==='pres'?'president':'department';roleList=list.filter(q=>saved.role==='president'?q.m==='pres':q.m!=='pres')}
 saved.questionId=roleList.some(q=>q.id===saved.questionId)?saved.questionId:roleList[0]?.id;return saved;
}
