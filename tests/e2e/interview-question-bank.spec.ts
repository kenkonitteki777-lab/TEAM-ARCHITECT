import {resume,method,role,scope,library,settings,filters} from './interview-helpers';
import {test,expect} from '@playwright/test';
async function openBank(page:any){await library(page);await expect(page.locator('#questionBank')).toBeVisible()}
async function addQuestion(page:any,date='2026-10-16'){
 await page.locator('#addQuestionDirect').click();await page.locator('#bankQuestion').fill('部下の成長をどう支援しましたか？');await page.locator('#bankAnswer').fill('対話で課題を確かめ、実践と振り返りを支援しました。');await page.locator('#bankMetadata summary').click();await page.locator('#bankEditDate').fill(date);await page.locator('#bankCategory').fill('育成');await page.locator('#bankSource').fill('本人の面接メモ');await page.locator('#bankSave').click();await expect(page.locator('#bankStatus')).toContainText('保存しました');
}
test('dated question creation, year/month/day lookup, edits, reload and practice work without losing answers',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/interview/');await resume(page);await expect(page.locator('#saveModel')).toBeEnabled();await openBank(page);await addQuestion(page);
 await filters(page);await page.locator('#bankYear').selectOption('2026');await page.locator('#bankMonth').selectOption('10');await page.locator('#bankDay').fill('2026-10-16');await expect(page.locator('#bankCount')).toHaveText('1問');await expect(page.locator('.bank-date')).toHaveText('2026-10-16');
 await page.locator('[data-use]').click();await expect(page.locator('#question')).toHaveText('部下の成長をどう支援しましたか？');await page.locator('#reveal').click();await expect(page.locator('#answer')).toContainText('対話で課題');
 await page.locator('#editAnswer').click();await page.locator('#modelText').fill('本人回答をさらに改善しました。');await page.locator('#saveModel').click();await page.locator('#editQuestion').click();await expect(page.locator('#bankAnswer')).toHaveValue('本人回答をさらに改善しました。');await page.locator('#bankQuestion').fill('部下を育てた経験を教えてください。');await page.locator('#bankSave').click();await page.locator('#appNav [data-view=practice]').click();await page.reload();await resume(page);await expect(page.locator('#question')).toHaveText('部下を育てた経験を教えてください。');await page.locator('#reveal').click();await expect(page.locator('#answer')).toHaveText('本人回答をさらに改善しました。');
 await method(page,'startPractice');await expect(page.locator('#question')).toHaveText('部下を育てた経験を教えてください。');await page.locator('#reveal').click();await page.locator('#reveal').click();await expect(page.locator('#practiceFeedback')).toBeVisible();await page.locator('[data-assessment=good]').click();await page.locator('#reveal').click();await page.locator('#endPractice').click();
 await openBank(page);await page.locator('#bankClear').click();await filters(page);await page.locator('#bankYear').selectOption('unknown');await expect(page.locator('.bank-date')).toHaveText('日付不明');expect(errors).toEqual([]);
});
test('question backup restores custom IDs, current answers and practice history in a fresh browser context',async({page,browser})=>{
 await page.goto('/interview/');await resume(page);await expect(page.locator('#saveModel')).toBeEnabled();await openBank(page);await addQuestion(page,'');await page.locator('[data-use^="u-"]').click();await method(page,'startPractice');await page.locator('#reveal').click();await page.locator('#reveal').click();await page.locator('[data-assessment=good]').click();await page.locator('#reveal').click();await page.locator('#endPractice').click();await settings(page);
 const downloadPromise=page.waitForEvent('download');await page.locator('#export').click();const download=await downloadPromise;const stream=await download.createReadStream();const chunks=[];for await(const chunk of stream!)chunks.push(chunk);const buffer=Buffer.concat(chunks),backup=JSON.parse(buffer.toString());expect(Object.keys(backup.questionLibrary.entries)).toHaveLength(1);expect(backup.history.some((h:any)=>h.questionId.startsWith('u-'))).toBe(true);
 const fresh=await browser.newContext({baseURL:new URL(page.url()).origin});try{const restored=await fresh.newPage();await restored.goto('/interview/');await expect(restored.locator('#saveModel')).toBeEnabled();await settings(restored);await restored.locator('#import').setInputFiles({name:'backup.json',mimeType:'application/json',buffer});await expect(restored.locator('#toast')).toContainText('保持して統合');await library(restored);await filters(restored);await restored.locator('#bankYear').selectOption('unknown');await restored.locator('[data-use^="u-"]').click();await expect(restored.locator('#question')).toHaveText('部下の成長をどう支援しましたか？');await restored.locator('#reveal').click();await expect(restored.locator('#answer')).toContainText('対話で課題');await restored.reload();await resume(restored);await expect(restored.locator('#question')).toHaveText('部下の成長をどう支援しましたか？')}finally{await fresh.close()}
});
test('storage failures keep the form open, retain input and never report a saved question',async({page})=>{
 await page.goto('/interview/');await resume(page);await expect(page.locator('#saveModel')).toBeEnabled();await openBank(page);await page.locator('#addQuestionDirect').click();await page.locator('#bankQuestion').fill('保存失敗でも残す質問');await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='team_architect_question_library_v1')throw new DOMException('quota','QuotaExceededError');return original.call(this,key,value)}});await page.locator('#bankSave').click();await expect(page.locator('#bankStatus')).toContainText('保存できません');await expect(page.locator('#bankQuestion')).toHaveValue('保存失敗でも残す質問');expect(await page.evaluate(()=>localStorage.getItem('team_architect_question_library_v1'))).toBeNull();
});

test('AI next skips edited question text while retaining it for normal practice',async({page})=>{
 await page.addInitScript(()=>{localStorage.setItem('team_architect_reader_question','q001');localStorage.setItem('team_architect_question_library_v1',JSON.stringify({version:1,entries:{q002:{q:'本人が編集した別の質問',answer:'本人回答',m:'take',kind:'past',askedOn:'',category:'その他',src:'本人登録',updatedAt:'2026-10-16T00:00:00Z'}}}))});
 await page.route('**/functions/v1/interview-coach',route=>route.fulfill({json:{aiConfigured:false}}));await page.goto('/interview/');await resume(page);await expect(page.locator('#saveModel')).toBeEnabled();await method(page,'openAiInterview');await expect(page.locator('#aiUnavailable')).toBeVisible();await page.locator('#aiNext').evaluate((el:HTMLButtonElement)=>el.click());expect(await page.locator('#questionId').textContent()).toBe('003');
});

test('answer-readiness shortcuts support editing and remain correct after reload',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/interview/');await resume(page);
 await expect(page.locator('#pendingAnswerCount')).not.toHaveText('0');
 await expect(page.locator('#readinessFill')).toHaveAttribute('style',/width:/);
 await page.locator('#pendingAnswers').click();
 await expect(page.locator('#libraryView')).toBeVisible();
 await expect(page.locator('[data-bank-quick="pending"]')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('[data-bank-stat="total"]')).toHaveText('74');
 await page.locator('#addQuestionDirect').click();
 await page.locator('#bankQuestion').fill('新しく登録した面接質問ですか？');
 await page.locator('#bankAnswer').fill('成果は【要確認：数字】です。');
 await page.locator('#bankSave').click();
 await expect(page.locator('#bankStatus')).toContainText('保存しました');
 const item=page.locator('.bank-row').filter({hasText:'新しく登録した面接質問ですか？'});
 await expect(item).toBeVisible();
 await expect(item.locator('.bank-state')).toHaveText('要確認あり');
 await item.locator('[data-edit]').click();
 await page.locator('#bankAnswer').fill('成果の根拠を確認した後、具体例と行動で答えます。');
 await page.locator('#bankSave').click();
 await expect(item).toHaveCount(0);
 await page.locator('[data-bank-quick="filled"]').click();
 await expect(item).toBeVisible();
 await expect(item.locator('.bank-state')).toHaveText('記入済');
 await page.reload();await resume(page);await library(page);
 await expect(page.locator('[data-bank-stat="total"]')).toHaveText('75');
 await expect(page.locator('.bank-row').filter({hasText:'新しく登録した面接質問ですか？'})).toBeVisible();
 expect(errors).toEqual([]);
});


test('bank edits keep the visible answer and the answer editor in sync across reloads',async({page})=>{
 await page.goto('/interview/');await resume(page);await openBank(page);await addQuestion(page,'');
 const item=page.locator('.bank-row').filter({hasText:'部下の成長をどう支援しましたか？'});
 await item.locator('[data-edit]').click();
 await page.locator('#bankAnswer').fill('結果・根拠・行動を端的に説明します。');
 await page.locator('#bankSave').click();
 await expect(page.locator('#bankStatus')).toContainText('保存しました');
 await item.locator('[data-use]').click();
 await page.locator('#reveal').click();
 await expect(page.locator('#answer')).toHaveText('結果・根拠・行動を端的に説明します。');
 await page.locator('#editAnswer').click();
 await expect(page.locator('#modelText')).toHaveValue('結果・根拠・行動を端的に説明します。');
 await page.locator('#closeEditor').click();
 const before=await page.evaluate(()=>{
  const store=JSON.parse(localStorage.getItem('team_architect_model_answers_v1')||'{}');
  const entry=Object.values(store.entries||{}).find((item:any)=>item.text==='結果・根拠・行動を端的に説明します。') as any;
  return {current:entry?.text,older:entry?.revisions?.some((r:any)=>r.text.includes('対話で課題'))};
 });
 expect(before).toEqual({current:'結果・根拠・行動を端的に説明します。',older:true});
 await page.reload();await resume(page);await page.locator('#reveal').click();
 await expect(page.locator('#answer')).toHaveText('結果・根拠・行動を端的に説明します。');
});

test('failed question write does not silently overwrite an existing model answer',async({page})=>{
 await page.goto('/interview/');await resume(page);await openBank(page);await addQuestion(page,'');
 const item=page.locator('.bank-row').filter({hasText:'部下の成長をどう支援しましたか？'});
 await item.locator('[data-edit]').click();
 await page.locator('#bankAnswer').fill('不意の保存エラー後も元の回答を守る。');
 await page.evaluate(()=>{
  const original=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){
   if(key==='team_architect_question_library_v1')throw new DOMException('quota','QuotaExceededError');
   return original.call(this,key,value);
  };
 });
 await page.locator('#bankSave').click();
 await expect(page.locator('#bankStatus')).toContainText('保存できません');
 const values=await page.evaluate(()=>{
  const models=JSON.parse(localStorage.getItem('team_architect_model_answers_v1')||'{}');
  return Object.values(models.entries||{}).map((entry:any)=>entry.text);
 });
 expect(values).toContain('対話で課題を確かめ、実践と振り返りを支援しました。');
 expect(values).not.toContain('不意の保存エラー後も元の回答を守る。');
});

test('clearing a custom answer persists as empty after refresh',async({page})=>{
 await page.goto('/interview/');await resume(page);await openBank(page);await addQuestion(page,'');
 const item=page.locator('.bank-row').filter({hasText:'部下の成長をどう支援しましたか？'});
 await item.locator('[data-edit]').click();
 await page.locator('#bankAnswer').fill('');
 await page.locator('#bankSave').click();
 await item.locator('[data-use]').click();
 await page.locator('#reveal').click();
 await expect(page.locator('#answer')).toContainText('回答はまだ登録されていません');
 await page.reload();await resume(page);await page.locator('#reveal').click();
 await expect(page.locator('#answer')).toContainText('回答はまだ登録されていません');
});
