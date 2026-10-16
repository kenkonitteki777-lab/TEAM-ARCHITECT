export function scopedQuestions(questions,scope,state,role='all'){
 return questions.filter(q=>(role==='all'||(role==='president'||role==='pres'?q.m==='pres':q.m!=='pres'))&&(scope.type==='all'||scope.type==='past'&&q.kind==='past'||scope.type==='personal'&&q.id.startsWith('u-')||scope.type==='weak'&&(state.records[q.id]?.grade==='weak'||state.records[q.id]?.weaknesses?.length)||scope.type==='selection'&&scope.ids.includes(q.id)));
}
