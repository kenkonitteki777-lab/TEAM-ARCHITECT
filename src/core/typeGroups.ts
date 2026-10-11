// 16Personalities' four colour groups, used for presentation only.
export const typeGroups = [
 {id:'analysts',name:'分析家',colour:'紫',accent:'#c4a5ed',types:['INTJ','INTP','ENTJ','ENTP']},
 {id:'diplomats',name:'外交官',colour:'緑',accent:'#85d3ab',types:['INFJ','INFP','ENFJ','ENFP']},
 {id:'sentinels',name:'番人',colour:'青',accent:'#88c5ef',types:['ISTJ','ISFJ','ESTJ','ESFJ']},
 {id:'explorers',name:'探検家',colour:'黄',accent:'#edce75',types:['ISTP','ISFP','ESTP','ESFP']},
] as const;
export function typeGroup(type:string){return typeGroups.find(g=>g.types.some(t=>t===type));}
export function typeTheme(type:string){return 'mbti-theme '+(typeGroup(type)?'mbti-'+typeGroup(type)!.id:'');}
export const personalityTestUrl='https://www.16personalities.com/ja/性格診断テスト';
