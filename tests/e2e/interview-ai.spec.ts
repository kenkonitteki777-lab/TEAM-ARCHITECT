import {resume,method,role,scope,library,settings} from './interview-helpers';
import {test,expect} from '@playwright/test';
import {AXES} from '../../public/interview/engine.js';

const draftKey='team_architect_ai_draft_v1';
const endpoint='**/functions/v1/interview-coach';
test('unconfigured AI and connection failures preserve an existing answer draft',async({page})=>{
 await page.goto('/interview/');await resume(page);
 await method(page,'openAiInterview');
 await page.locator('#closeAiInterview').click();
 const draft=await page.evaluate(key=>{
  const id=localStorage.getItem('team_architect_reader_question');
  const value={id,prompt:'以前の追撃質問',answer:'スタッフ育成を優先して実行します。',turns:[],seconds:18};
  localStorage.setItem(key,JSON.stringify(value));return JSON.stringify(value);
 },draftKey);
 await page.route(endpoint,route=>route.fulfill({json:{aiConfigured:false}}));
 await method(page,'openAiInterview');
 await expect(page.locator('#aiUnavailable')).toBeVisible();
 await expect(page.locator('#aiAnswer')).toHaveValue('スタッフ育成を優先して実行します。');
 await page.locator('#closeAiInterview').click();
 expect(await page.evaluate(key=>localStorage.getItem(key),draftKey)).toBe(draft);
 await page.unroute(endpoint);
 await page.route(endpoint,route=>route.abort());
 await method(page,'openAiInterview');
 await expect(page.locator('#aiConnection')).toContainText('接続状態を確認できません');
 await page.locator('#aiFallback').click();
 await expect(page.locator('#practicePanel')).toBeVisible();
 expect(await page.evaluate(key=>localStorage.getItem(key),draftKey)).toBe(draft);
});

test('opening another question does not overwrite a previous question draft',async({page})=>{
 await page.goto('/interview/');await resume(page);
 const original=await page.evaluate(key=>{
  const value=JSON.stringify({id:'other-question',prompt:'以前の質問',answer:'保持する回答',turns:[],seconds:10});
  localStorage.setItem(key,value);return value;
 },draftKey);
 await page.route(endpoint,route=>route.fulfill({json:{aiConfigured:false}}));
 await method(page,'openAiInterview');
 await expect(page.locator('#aiUnavailable')).toBeVisible();
 await page.locator('#closeAiInterview').click();
 expect(await page.evaluate(key=>localStorage.getItem(key),draftKey)).toBe(original);
});

test('AI dialog saves reviewed text, follows up, restores it, and retains it after request failure',async({page})=>{
 const sent:any[]=[];
 let fail=false;
 await page.route('**/auth/v1/token?*',route=>route.fulfill({json:{access_token:'test-session'}}));
 await page.route(endpoint,async route=>{
  const body=route.request().postDataJSON();
  if(route.request().method()==='GET')return route.fulfill({json:{aiConfigured:true}});
  if(body.action==='status')return route.fulfill({json:{aiEnabled:true}});
  sent.push(body);
  if(fail)return route.fulfill({status:429,json:{error:'無料枠に達しました。'}});
  return route.fulfill({json:{axes:AXES.map(name=>({name,score:null,evidence:'練習用の応答'})),weaknesses:['具体例不足'],feedback:'実例を補いましょう。',quote:body.answer,nextFix:'自分が実行した行動を一つ伝える。',followup:'実際に何をしましたか？'}});
 });
 await page.goto('/interview/');await resume(page);
 await method(page,'openAiInterview');
 await page.locator('#aiEmail').fill('test@example.com');
 await page.locator('#aiPassword').fill('test-password');
 await page.locator('#aiLoginSubmit').click();
 await expect(page.locator('#aiLive')).toBeVisible();
 await page.locator('#aiTranscript summary').click();
 await page.locator('#aiAnswer').fill('店長として育成を実行します。');
 await expect(page.locator('#aiEvaluate')).toBeDisabled();
 await page.locator('#aiConsent').check();
 await page.locator('#aiEvaluate').click();
 await expect(page.locator('#aiFeedback')).toBeVisible();
 expect(sent[0].answer).toBe('店長として育成を実行します。');
 expect(sent[0].consent).toBe(true);
 const history=await page.evaluate(()=>JSON.parse(localStorage.getItem('team_architect_interview_v3')!).history);
 expect(history.at(-1).answer).toBe(sent[0].answer);
 await page.locator('#aiFollow').click();
 await expect(page.locator('#aiPrompt')).toHaveText('実際に何をしましたか？');
 await page.locator('#aiTranscript summary').click();
 await page.locator('#aiAnswer').fill('毎日の振り返りを行いました。');
 await page.locator('#closeAiInterview').click();
 await method(page,'openAiInterview');
 await expect(page.locator('#aiLive')).toBeVisible();
 await expect(page.locator('#aiAnswer')).toHaveValue('毎日の振り返りを行いました。');
 await expect(page.locator('#aiConsent')).not.toBeChecked();
 await page.locator('#aiRecheck').evaluate((el:HTMLButtonElement)=>el.click());
 await expect(page.locator('#aiLive')).toBeVisible();
 await expect(page.locator('#aiAnswer')).toHaveValue('毎日の振り返りを行いました。');
 fail=true;
 await page.locator('#aiConsent').check();
 await page.locator('#aiEvaluate').click();
 await expect(page.locator('#aiMessage')).toContainText('無料枠に達しました');
 await expect(page.locator('#aiAnswer')).toHaveValue('毎日の振り返りを行いました。');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('team_architect_interview_v3')!).history.length)).toBe(history.length);
 const stored=await page.evaluate(()=>JSON.stringify({...localStorage,...sessionStorage}));
 expect(stored).not.toContain('test-session');expect(stored).not.toContain('test-password');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
