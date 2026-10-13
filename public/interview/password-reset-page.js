import {CLOUD} from './config.js';
import {createRecoveryClient,takeRecoveryToken} from './password-reset.js?v=20261014-auth1';
const $=id=>document.getElementById(id),client=createRecoveryClient({url:CLOUD.url,publishableKey:CLOUD.publishableKey});
let token=takeRecoveryToken(location,history),busy=false,ready=false;
const status=text=>$('resetStatus').textContent=text;
const redirectTo='https://kenkonitteki777-lab.github.io/TEAM-ARCHITECT/interview/password-reset.html';
if(token){$('requestReset').hidden=true;status('再設定リンクを確認しています。');client.verify(token).then(()=>{ready=true;$('changePassword').hidden=false;status('新しいパスワードを入力できます。')}).catch(e=>{token=null;$('requestReset').hidden=false;status(e.message)})}
$('requestReset').onsubmit=async e=>{e.preventDefault();if(busy)return;busy=true;$('sendReset').disabled=true;status('再設定メールを送信しています。');try{await client.send($('resetEmail').value.trim(),redirectTo);status('登録済みのメールアドレスに再設定リンクを送ります。メールのリンクを開いてください。迷惑メールも確認してください。')}catch(e){status(e.message||'送信できません。時間を置いて再度お試しください。')}finally{busy=false;$('sendReset').disabled=false}};
$('changePassword').onsubmit=async e=>{e.preventDefault();if(busy||!ready)return;if($('newPassword').value!==$('confirmPassword').value){status('2つのパスワードが一致していません。');return}busy=true;$('savePassword').disabled=true;status('パスワードを更新しています。');try{await client.update(token,$('newPassword').value);ready=false;$('changePassword').hidden=true;$('newPassword').value='';$('confirmPassword').value='';status('パスワードを変更しました。下のリンクから新しいパスワードでログインしてください。');const old=token;token=null;await client.signOut(old)}catch(e){status(e.message||'更新できません。もう一度お試しください。')}finally{busy=false;$('savePassword').disabled=false}};
$('resetPasswordToggle').onclick=()=>{const visible=$('newPassword').type==='password';for(const id of ['newPassword','confirmPassword'])$(id).type=visible?'text':'password';$('resetPasswordToggle').textContent=visible?'パスワードを隠す':'パスワードを表示';$('resetPasswordToggle').setAttribute('aria-pressed',String(visible))};
window.addEventListener('pagehide',()=>{token=null;ready=false;$('newPassword').value='';$('confirmPassword').value=''});
