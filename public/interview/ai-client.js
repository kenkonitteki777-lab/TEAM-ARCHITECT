// No API key, password, or token is persisted by this client.
export function createCoachClient({url,publishableKey,fetcher=fetch}){
 const origin=new URL(url);if(origin.protocol!=='https:'||!origin.hostname.endsWith('.supabase.co'))throw new Error('面接サーバーのURLを確認してください。');
 async function request(action,token,body={},signal){
  if(!token)throw new Error('面接用アカウントでのログインが必要です。');
  const response=await fetcher(origin.origin+'/functions/v1/interview-coach',{method:'POST',headers:{apikey:publishableKey,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({...body,action}),signal});
  let data;try{data=await response.json()}catch{throw new Error('サーバー応答を確認できません。回答は保持してください。')}
  if(!response.ok)throw new Error(data.error||'AI接続を確認できません。回答は保持してください。');return data;
 }
 return {status:(token,signal)=>request('status',token,{},signal),async coach({token,consent,question,answer,prompt,conversation=[],facts={},modelAnswer='',seconds=0,signal}){
  if(consent!==true)throw new Error('回答文をGroqへ送信する同意が必要です。');
  if(!answer.trim()||answer.length>2400)throw new Error('回答を1〜2,400字で確認してください。');
  const data=await request('coach',token,{consent:true,questionId:question.id,mode:question.m==='pres'?'pres':'take',prompt,answer,conversation,facts,modelAnswer,seconds},signal);
  if(typeof data.quote!=='string'||!data.quote.trim()||!answer.includes(data.quote)||typeof data.nextFix!=='string'||!data.nextFix.trim()||typeof data.followup!=='string'||!data.followup.trim())throw new Error('AIの根拠を確認できません。回答は保持してください。');
  return data;
 }};
}
