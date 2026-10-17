import {resume,method,role,scope,library,settings} from './interview-helpers';
import {test,expect} from '@playwright/test';
test('login opens immediately even when AI readiness fails and password reset is reachable',async({page})=>{
 await page.route('**/functions/v1/interview-coach',route=>route.abort());
 await page.goto('/interview/?login=1');
 await expect(page.locator('#aiInterview')).toBeVisible();await expect(page.locator('#aiLogin')).toBeVisible();
 await page.locator('#aiPassword').fill('test-password');await page.locator('#aiPasswordToggle').click();await expect(page.locator('#aiPassword')).toHaveAttribute('type','text');
 await page.getByRole('link',{name:'パスワードを忘れた・再設定'}).click();await expect(page.locator('#requestReset')).toBeVisible();
 await page.route('**/auth/v1/recover?*',async route=>{expect(route.request().postDataJSON()).toEqual({email:'test@example.com'});expect(new URL(route.request().url()).searchParams.get('redirect_to')).toMatch(/\/interview\/password-reset.html$/);await route.fulfill({json:{}})});
 await page.locator('#resetEmail').fill('test@example.com');await page.locator('#sendReset').click();await expect(page.locator('#resetStatus')).toContainText('登録済みのメールアドレス');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('verified recovery updates password once, scrubs token URL and returns to login',async({page})=>{
 let updates=0;
 await page.route('**/auth/v1/user',async route=>{
  expect(route.request().headers().authorization).toBe('Bearer test-recovery');
  if(route.request().method()==='PUT'){updates++;expect(route.request().postDataJSON()).toEqual({password:'new-password'});}
  await route.fulfill({json:{id:'test-account',is_anonymous:false}});
 });
 await page.route('**/auth/v1/logout?*',route=>route.fulfill({json:{}}));
 await page.goto('/interview/password-reset.html#access_token=test-recovery&type=recovery&refresh_token=test-refresh');
 await expect(page.locator('#changePassword')).toBeVisible();expect(new URL(page.url()).hash).toBe('');
 await page.locator('#newPassword').fill('new-password');await page.locator('#confirmPassword').fill('different-password');await page.locator('#savePassword').click();await expect(page.locator('#resetStatus')).toContainText('一致していません');expect(updates).toBe(0);
 await page.locator('#confirmPassword').fill('new-password');await page.locator('#savePassword').click();await expect(page.locator('#resetStatus')).toContainText('パスワードを変更しました');expect(updates).toBe(1);
 const saved=await page.evaluate(()=>JSON.stringify({...localStorage,...sessionStorage}));expect(saved).not.toMatch(/test-recovery|test-refresh|new-password/);await expect(page.locator('#newPassword')).toHaveValue('');
 await page.route('**/functions/v1/interview-coach',route=>route.fulfill({json:{aiConfigured:true}}));
 await page.getByRole('link',{name:'面接のログインへ戻る →'}).click();await expect(page.locator('#aiLogin')).toBeVisible();
});
test('expired reset link never permits password change and offers a new email',async({page})=>{
 await page.route('**/auth/v1/user',route=>route.fulfill({status:401,json:{}}));
 await page.goto('/interview/password-reset.html#access_token=expired&type=recovery');
 await expect(page.locator('#resetStatus')).toContainText('期限切れ');await expect(page.locator('#changePassword')).toBeHidden();await expect(page.locator('#requestReset')).toBeVisible();expect(new URL(page.url()).hash).toBe('');
});
test('interviewer voice presets are distinct and can be previewed and retained',async({page})=>{
 await page.addInitScript(()=>{
  const spoken:any[]=[];(window as any).testSpoken=spoken;
  Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[{voiceURI:'ja-test',lang:'ja-JP',name:'Japanese',default:true}],cancel(){},speak(u:any){spoken.push({rate:u.rate,pitch:u.pitch,text:u.text})},addEventListener(){}}});
  Object.defineProperty(window,'SpeechSynthesisUtterance',{value:class{constructor(public text:string){}}});
  Object.defineProperty(window,'Audio',{value:class{pause(){}load(){}play(){return Promise.reject(new Error('recordings unavailable in this device fallback test'))}}});
 });
 await page.goto('/interview/');await resume(page);await page.locator('#openVoice').click();await page.locator('#previewDepartment').click();await page.locator('#previewPresident').click();
 const spoken=await page.evaluate(()=>(window as any).testSpoken);expect(spoken[0].pitch).toBeLessThan(spoken[1].pitch);expect(spoken[0].rate).toBeLessThan(spoken[1].rate);
 await page.locator('#departmentPitch').selectOption('0.96');await page.reload();await resume(page);await page.locator('#openVoice').click();await expect(page.locator('#departmentPitch')).toHaveValue('0.96');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
