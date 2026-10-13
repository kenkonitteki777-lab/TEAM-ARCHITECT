import type { Brief, FunctionKey, Kind } from './mission';

type Profile={id:string;label:string;kind:Kind;functions:FunctionKey[];focus:string;observe:string;trial:string;field:string;result:string;done:string};
// Transparent editorial templates. Matching is a candidate, not free-text AI understanding.
export function workProfile(b:Pick<Brief,'issue'|'goal'>):Profile {
 const x=b.issue+' '+b.goal;
 const plan=(id:string,label:string,kind:Kind,functions:FunctionKey[],focus:string,observe:string,trial:string,field:string,result:string,done:string):Profile=>({id,label,kind,functions,focus,observe,trial,field,result,done});
 if(/引き継|引継|申し送り|申送り|伝達漏れ/.test(x))return plan('handover','引継ぎ','people',['TRANSLATE','OPERATE','REVIEW'],'交代時の引継ぎ','未完了の仕事・注意事項・判断待ち・次の担当','担当・期限・相談先を一つの引継ぎメモにまとめる','交代する相手に未完了事項を説明し、受け取った内容を確認する','未完了事項・次の担当・期限・相談先の引継ぎメモ','次の担当が残作業と相談先を説明でき、受領が確認できる');
 if(/清掃|掃除|汚れ|トイレ/.test(x))return plan('cleaning','清掃・点検','service',['FIELD','OPERATE','REVIEW'],'清掃・点検の対象箇所','箇所別の汚れ・備品不足・利用への支障','優先箇所と担当を決め、通常業務への影響を確認する','対象箇所を確認し、店舗の手順に沿って清掃・備品補充・終了点検を行う','箇所・担当・確認時刻・残った問題の点検表','対象箇所の終了点検と残った問題・対応担当が記録されている');
 if(/育成|人材|面談|新人|OJT|研修|教育/i.test(x)){
  const guide=/案内|接客|接遇/.test(x);
  return plan('training',guide?'新人の案内練習':'スタッフ育成','people',['ANALYZE','COACH','OPERATE','REVIEW'],guide?'対象者のご案内手順':'対象者に身につけてほしい行動',guide?'声かけ・要望の確認・案内・困った時の相談':'できている行動・つまずく場面・本人の希望','一度に練習する行動を一つ選び、実演→本人の練習→振り返りで確認する',guide?'実際の案内手順を見せ、対象者に同じ場面を練習してもらう':'期待する行動を実演し、対象者に練習してもらう','観察した行動・練習した内容・本人の次の行動・確認日のOJTメモ','本人が手順と困った時の相談先を説明・実演でき、次回の確認日が合意されている');
 }
 if(/接客|CS|クレーム|案内待ち|ご案内|接遇|待ち時間/.test(x)){
  const wait=/待ち|呼出|呼び出し/.test(x);
  return plan('service',wait?'案内待ちの改善':'接客品質の改善','service',['ANALYZE','DESIGN','TRANSLATE','FIELD','SCOUT','OPERATE','REVIEW'],wait?'お客様の案内待ち':'対象の接客場面',wait?'呼出・声かけ・案内開始の時刻、待ちが発生した場所と状況':'お客様の要望・対応した行動・反応・未解決事項',wait?'待ちが発生する場面を一つ選び、声かけと担当間の連絡方法を決める':'困っている場面を一つ選び、対応手順と相談先を決める',wait?'承認された声かけ・担当間連絡を試し、案内開始までの時間を記録する':'合意した対応手順を現場で試し、お客様の反応と未解決事項を記録する','場面・対応・顧客反応・未解決事項の記録','対応前後の事実が同じ観察条件で比較でき、残った問題と次の対応が明記されている');
 }
 if(/新台|入替|遊技機/.test(x))return plan('machine','新台・入替','machine',['ANALYZE','DESIGN','OPERATE','CREATE','FIELD','SCOUT','REVIEW'],'入替対象と導入後の稼働','対象機種・設置場所・導入前後の実績・未確認事項','対象と営業上の制約を確認し、実施順序と告知を比較する','店舗の承認済み入替・点検手順を確認し、担当範囲の実施状態を記録する','対象・担当・点検結果・未実施事項の一覧','承認済み手順の実施と点検が確認され、未実施事項の担当が決まっている');
 if(/販促|POP|SNS|広告|告知/i.test(x))return plan('promo','販促・告知','promo',['ANALYZE','DESIGN','CREATE','TRANSLATE','OPERATE','SCOUT','REVIEW'],'告知の対象と伝えたい内容','現在の告知内容・掲載場所・反応・使用条件','訴求対象と伝える内容を一つに絞り、表現案を比較する','承認済みの告知を使用場所・日時に合わせて設置・公開する','告知文・表現案・使用場所と日時の一覧','対象・内容・使用場所・日時が一致し、責任者の確認を受けている');
 if(/稼働|売上|粗利|利益|集客|競合/.test(x))return plan('sales','稼働・営業改善','sales',['ANALYZE','DESIGN','CREATE','TRANSLATE','FIELD','SCOUT','REVIEW'],/夜/.test(x)?'夜時間帯の稼働':/朝|午前/.test(x)?'朝時間帯の稼働':/売上|粗利|利益/.test(x)?'売上・利益の実績':'対象時間帯の営業実績','同じ曜日・時間帯・対象の実績と比較条件','低下要因の仮説に対する打ち手を3案に整理する','承認された施策を対象場所・時間帯で実施し、実施状態を記録する','対象場所・時間帯・施策・実施状態の記録','承認された施策の実施と未実施事項が記録され、結果比較の条件がそろっている');
 if(/スタッフ|組織|チーム/.test(x))return plan('team','チームの仕事整理','people',['ANALYZE','DESIGN','TRANSLATE','OPERATE','REVIEW'],'チームの対象業務','担当・作業量・詰まっている場面・本人の意見','役割の重複と不足を整理し、担当の変更案を比較する','合意した担当と相談先を対象者に伝え、認識を確認する','対象者別の仕事・担当・相談先の一覧','対象者が自分の仕事と相談先を説明でき、未決事項の判断者が決まっている');
 return plan('general','内容を確認して進める課題','general',['ANALYZE','DESIGN','OPERATE','REVIEW'],'入力した課題','起きている事実・対象・困っている場面・希望する結果','実施できる小さな一手を一つ提案し、対象・成果物・守る条件を責任者と確認する','合意した一手を対象範囲で実施し、結果を記録する','実施案・成果物・守る条件・確認事項のメモ','対象・最初の一手・成果物・守る条件が確認され、未確認事項が区別されている');
}
export function workInstruction(fn:FunctionKey,b:Brief,p:Profile){
 const topic=`「${b.issue}」`;
 const rules=b.constraints.trim()?`守る条件：${b.constraints.trim()}。条件と両立しない案は実行せず相談する`:'追加予算・配置・営業方針の変更は承認を受ける';
 const map:Record<FunctionKey,{actions:string[];output:string;done:string}>={
 ANALYZE:{actions:[`${topic}の${p.focus}について、${p.observe}を確認する`,`${b.source.trim()||'確認した記録の出所'}と観察条件を明記し、事実・仮説・不明事項を分ける`,'次に確認することを3点以内に整理し、報告先に共有する'],output:`${p.focus}の事実・仮説・不明事項のメモ`,done:'対象・記録の出所・確認条件が明記され、事実と仮説を区別して次の確認事項を説明できる'},
 DESIGN:{actions:[`${topic}の確認結果をもとに、${p.trial}`,rules,'実施案の担当・仕上げるもの・確認時期を責任者と合意する'],output:`${p.focus}の実施案と確認事項`,done:'実施する対象・行動・成果物・守る条件・確認時期が提案に明記され、責任者が実施可否を判断できる'},
 CREATE:{actions:[`${topic}で伝えたい対象・内容・使用条件を確認する`,'告知の文言と表現案を作成し、使用場所・日時を添える','責任者の確認後に使用する。不明な表現や条件は確認へ戻す'],output:'告知文・表現案・使用場所と日時の一覧',done:'対象・内容・使用場所・日時が一致し、責任者が表現と使用条件を確認している'},
 TRANSLATE:{actions:[`${topic}の担当・やること・相談先を、対象者ごとに短く伝える`,`${p.field}ための手順と確認事項を説明する`,'相手に自分の行動を説明してもらい、不明点と回答担当をメモする'],output:'対象者別のやること・手順・相談先の共有メモ',done:'対象者が自分の行動と相談先を説明でき、不明点の回答担当が決まっている'},
 FIELD:{actions:[`${topic}：${p.field}`,rules,'実施場所・担当・確認時刻・残った問題を記録し、報告先へ共有する'],output:p.result,done:p.done},
 OPERATE:{actions:[`${topic}の担当・期限・仕上げるもの・確認時刻を一覧にする`,'合意した確認時刻に未完了・不在・詰まりを確認する','優先順位が競合する場合は報告先へ相談し、決まった担当と期限を共有する'],output:'担当・期限・確認時刻・未完了事項の進行メモ',done:'対象の仕事に担当・期限・状態・相談先があり、詰まっている仕事の次の対応が決まっている'},
 SCOUT:{actions:[`${topic}について、${p.observe}を実施前後で観察する`,'個人を特定しない形で場所・時刻・件数と実際の反応を記録する','事実と解釈を分け、良かった点・残る問題を報告先に共有する'],output:`${p.focus}の観察記録`,done:'場所・時刻・観察条件が記録され、実際の反応と解釈が区別されている'},
 REVIEW:{actions:[`${topic}の実施前後を、同じ確認条件で比較する`,'目標・実績・実施記録を照合する。未測定の効果は未確認とする','継続・修正・中止の提案と根拠を最終判断者へ共有する'],output:`${p.focus}の結果と次の一手`,done:'実施した内容・確認できた結果・未確認事項・次の一手を根拠付きで説明できる'},
 COACH:{actions:[`${topic}：${p.field}`,p.trial,'できた点・つまずいた点を本人と振り返り、次の行動と確認日時を合意する'],output:p.result,done:p.done}
 };
 return map[fn];
}

// Optional clarification: no inferred answer, deadline or new persistent field.
export function clarificationFor(issue:string):string {
 if(!issue.trim())return '';
 const p=workProfile({issue,goal:''});
 if(p.id==='general'||/^(スタッフ育成を進めたい|接客品質を改善したい|チームを良くしたい)[。！!]?$/u.test(issue.trim()))return 'どの場面を、どう変えたい？';
 return '';
}
export function shortAction(action:string,issue:string):string {
 const prefix=`「${issue}」`;
 if(action.startsWith(prefix+'の'))return action.slice(prefix.length+1);
 if(action.startsWith(prefix+'：'))return action.slice(prefix.length+1);
 return action;
}
