import { people, typeBook } from './data';
import { nameOf, specs, type Command, type Mission } from './mission';
export type Scene='request'|'conflict'|'support';
export const scenes:Record<Scene,string>={request:'仕事を頼む',conflict:'意見が割れる',support:'困っている相手を助ける'};
// Editorial conversation prompts, not an assessment or a compatibility ranking.
export const typeQuestions:Record<string,string>={
 ENTJ:'何を達成する？ 誰が決める？',INTJ:'その方法で、目的に届く？',INTP:'なぜそうなる？ 前提は合っている？',ENTP:'別のやり方なら、もっと良くなる？',
 INFJ:'この先、どんな意味が残る？',INFP:'大切にしたいことを守れる？',ENFJ:'みんなが動ける形にできる？',ENFP:'どんな可能性が広がる？',
 ISTJ:'事実と手順を確認していい？',ISFJ:'いつもの安心を守れる？',ESTJ:'担当と期限を決めようか？',ESFJ:'誰を支えれば、全体が回る？',
 ISTP:'まず仕組みを触って確かめていい？',ISFP:'現場で違和感なく使える？',ESTP:'今、試せる一手は何？',ESFP:'みんなが参加したくなる？'
};
const axes=[
 {name:'会話のペース',index:0,values:{E:'話しながら考える',I:'考えてから話す'},bridge:'先に要点を渡し、考える時間を取ってから短く話す。'},
 {name:'欲しい情報',index:1,values:{S:'具体例・事実から',N:'目的・可能性から'},bridge:'目的を一言で示し、具体例を一つ添える。'},
 {name:'納得の入口',index:2,values:{T:'理由・判断基準',F:'人への影響・大切なこと'},bridge:'判断理由と、関わる人への配慮を両方伝える。'},
 {name:'進め方',index:3,values:{J:'段取りを決めたい',P:'試しながら調整したい'},bridge:'期限と成果物を合意し、方法は見直せる余地を残す。'}
] as const;
function checked(type:string){if(!typeBook.some(t=>t.mbti===type))throw new Error('未登録のMBTIタイプです');return type;}
export function pairReading(from:string,to:string,scene:Scene){
 checked(from);checked(to);if(!Object.keys(scenes).includes(scene))throw new Error('未登録の場面です');
 const differences=axes.filter(a=>from[a.index]!==to[a.index]);
 const shared=axes.filter(a=>from[a.index]===to[a.index]);
 const axisRows=axes.map(a=>({name:a.name,from:a.values[from[a.index] as keyof typeof a.values],to:a.values[to[a.index] as keyof typeof a.values],different:from[a.index]!==to[a.index],bridge:a.bridge}));
 const complement=differences.length?differences.slice(0,2).map(a=>`${a.name}：${a.values[from[a.index] as keyof typeof a.values]} × ${a.values[to[a.index] as keyof typeof a.values]}`).join('／'):`同じ入口で話しやすい。${shared.map(a=>a.values[from[a.index] as keyof typeof a.values]).join('・')}を共有。`;
 const friction=differences.length?`${axisRows.filter(a=>a.different).slice(0,1).map(a=>`${a.from}側の説明だけでは、${a.to}側が置いていかれやすい`).join('。')}。`:`話が通じたつもりで、別の見方を確認し忘れやすい。${from[1]==='N'?'具体的な事実・現場の例': '目的・新しい選択肢'}も一つ確認する。`;
 const opening=to[1]==='N'?'まず、目指す姿から共有していい？':'まず、今わかっている事実を共有していい？';
 const response=typeQuestions[to];
 const bridge=scene==='request'?`${opening} ${to[2]==='T'?'判断の理由も伝えるね。':'関わる人への影響も一緒に考えたい。'} ${to[3]==='J'?'期限と順番を一緒に決めよう。':'期限と仕上げるものを決めて、方法は相談しながら進めよう。'}`:scene==='conflict'?`${to[2]==='T'?'どの判断基準が違っているか、比べてみよう。':'何を大切にしたいか、互いに一つずつ出してみよう。'} ${to[1]==='S'?'具体例を一つ使って確認しよう。':'目指す姿に戻って、別案も考えよう。'}`:`${to[0]==='I'?'まずメモで整理しても大丈夫。':'短く話しながら整理してみよう。'} ${to[2]==='F'?'いちばん気になっていることは何？':'どこで止まっているか、一つ確認していい？'} ${to[3]==='P'?'次に試せる小さい一手を選ぼう。':'次の一手と確認する時刻を決めよう。'}`;
 return {complement,friction,axisRows,opening:scene==='request'?typeQuestions[from]:scene==='conflict'?`私は「${typeQuestions[from]}」が気になっている。`:`「${typeQuestions[from]}」から整理しようと思っていた。`,response,bridge};
}
export function deliveryMessage(mission:Mission,commands:Command[],adapt=true){
 const statusNames={todo:'未着手',doing:'進行中',blocked:'要相談',done:'完了'};
 return commands.map(c=>{
  const type=people.find(p=>p.id===c.owner)?.mbti;
  const context=adapt&&type?(type[1]==='N'?`目指すこと：${c.purpose}`:`今回の課題：${mission.brief.issue}`):'';
  const waiting=c.status!=='done'&&c.dependsOn.some(id=>mission.commands.find(x=>x.id===id)?.status!=='done');
  const invitation=c.status==='done'?'':c.status==='blocked'?'再開は相談してから決めましょう。':waiting?'確認したい点は先に共有してください。':adapt&&type?(type[0]==='I'?'一度読んでから、確認したい点を教えてください。':'確認したい点を短く話してから進めましょう。'):'';
  return [`${nameOf(c.owner)}さんへ｜${specs[c.fn].name}（${statusNames[c.status]}）`,context,c.actions[0],`仕上げるもの：${c.output}`,`期限：${c.due?c.due.replace('T',' ')+' JST':'未設定'} / 報告先：${nameOf(c.reportTo)}`,adapt&&type?(type[2]==='T'?`判断基準：${c.done}`:`気になる影響や相談事項：${c.consult}`):'',adapt&&type&&type[3]==='P'?`任せる範囲：${c.discretion}`:'',waiting?'先行作業の完了後に着手してください。':'',invitation].filter(Boolean).join('\n');
 }).join('\n\n');
}
