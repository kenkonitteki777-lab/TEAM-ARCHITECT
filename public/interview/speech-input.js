export function createSpeechInput({Recognition,onText=()=>{},onState=()=>{},onError=()=>{}}){
 let active=null,epoch=0;
 function stop(){epoch++;const old=active;active=null;if(old){old.onresult=null;old.onerror=null;old.onend=null;try{old.abort()}catch{}}onState(false)}
 function start(base=''){
  stop();if(!Recognition){onError('このブラウザーでは音声入力を使えません。文字で回答できます。');return false}
  const id=epoch,r=new Recognition();active=r;r.lang='ja-JP';r.continuous=true;r.interimResults=true;
  r.onresult=e=>{if(id!==epoch)return;let text='';for(let i=0;i<e.results.length;i++)text+=e.results[i][0].transcript;onText(base+(base&&text?'\n':'')+text)};
  r.onerror=e=>{if(id!==epoch)return;active=null;epoch++;try{r.abort()}catch{}onState(false);onError(e.error==='not-allowed'?'マイクの利用が許可されていません。文字で回答するか、ブラウザーの設定を確認してください。':e.error==='no-speech'?'声を聞き取れませんでした。もう一度答えてください。':'音声入力を続けられません。聞き取った文章は保持しています。')};
  r.onend=()=>{if(id!==epoch)return;active=null;onState(false)};
  try{r.start();onState(true);return true}catch{active=null;onState(false);onError('音声入力を開始できません。文字で回答できます。');return false}
 }
 return {supported:Boolean(Recognition),start,stop};
}
