// Only the public Supabase key is used. Passwords and recovery tokens stay in memory.
export function takeRecoveryToken(location,history){
 const values=new URLSearchParams(location.hash.slice(1));
 const token=values.get('type')==='recovery'?values.get('access_token'):null;
 if(location.hash)history.replaceState(null,'',location.pathname+location.search);
 return typeof token==='string'&&token.length>0&&token.length<=8192?token:null;
}
export function createRecoveryClient({url,publishableKey,fetcher=fetch}){
 const origin=new URL(url);if(origin.protocol!=='https:'||!origin.hostname.endsWith('.supabase.co'))throw new Error('接続先を確認してください。');
 async function call(path,{method='GET',token,body}={}){
  const headers={apikey:publishableKey,'Content-Type':'application/json'};if(token)headers.Authorization='Bearer '+token;
  const r=await fetcher(origin.origin+'/auth/v1/'+path,{method,headers,body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(20000)});
  let data;try{data=await r.json()}catch{throw new Error('サーバーの応答を確認できません。時間を置いて再度お試しください。')}
  if(!r.ok){if(r.status===429)throw new Error('送信回数の制限です。時間を置いて再度お試しください。');if(r.status===401||r.status===403)throw new Error('再設定リンクが無効、または期限切れです。メールを再送してください。');if(data?.error_code==='weak_password'||data?.code==='weak_password')throw new Error('パスワードの条件を満たしていません。文字数と文字の種類を増やしてください。');throw new Error('処理できませんでした。接続やメール設定を確認し、再度お試しください。')}
  return data;
 }
 return {
  async send(email,redirectTo){if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('メールアドレスを確認してください。');const target=new URL(redirectTo);if(target.protocol!=='https:')throw new Error('再設定画面のURLを確認してください。');return call('recover?redirect_to='+encodeURIComponent(target.href),{method:'POST',body:{email}})},
  async verify(token){if(!token)throw new Error('メールの再設定リンクから開いてください。');const user=await call('user',{token});if(!user?.id||user.is_anonymous)throw new Error('本人アカウントを確認できません。メールを再送してください。');return user},
  async update(token,password){if(!token)throw new Error('メールの再設定リンクから開いてください。');if(password.length<8)throw new Error('パスワードは8文字以上で入力してください。');return call('user',{method:'PUT',token,body:{password}})},
  async signOut(token){if(token)try{await call('logout?scope=local',{method:'POST',token})}catch{}}
 };
}
