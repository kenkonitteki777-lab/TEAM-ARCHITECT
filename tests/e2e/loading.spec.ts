import { test, expect } from '@playwright/test';

test('unavailable entry never leaves a blank page and retry preserves URL state',async({page})=>{
 await page.route('**/assets/team-architect.js*',route=>route.fulfill({status:404,body:'missing'}));
 await page.goto('/?view=characters');
 await expect(page.locator('#startup')).toBeVisible();
 await expect(page.locator('#startup-code')).toContainText('JS取得失敗');
 const retry=await page.locator('#startup-retry').getAttribute('href');
 expect(retry).toContain('view=characters');expect(retry).toContain('reload=');
 await page.unroute('**/assets/team-architect.js*');
 await page.locator('#startup-retry').click();
 await expect(page.getByRole('heading',{name:'16の個性。ひとつのチーム。'})).toBeVisible();
 await expect(page.locator('#startup')).toBeHidden();
});

test('storage access denied still opens UI and explains saving failure',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('denied','SecurityError');}}));
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'今回のミッションは？'})).toBeVisible();
 await expect(page.getByRole('alert')).toContainText('元データの上書きを止め');
 await expect(page.locator('#startup')).toBeHidden();
});

test('diagnostic works without application JS and does not mutate either app data',async({page})=>{
 await page.goto('/recovery.html');
 const original=await page.evaluate(()=>{
  localStorage.setItem('team-architect-v2','broken');localStorage.setItem('interview-test-preserve','interview history');
  return Object.entries(localStorage);
 });
 await page.getByRole('button',{name:'読込診断を実行'}).click();
 await expect(page.getByRole('status')).toContainText('診断版：R2');
 await expect(page.getByRole('status')).toContainText('JS：取得成功');
 await expect(page.getByRole('status')).toContainText('CSS：取得成功');
 expect(await page.evaluate(()=>Object.entries(localStorage))).toEqual(original);
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:'TEAM ARCHITECTの原データを書き出す'}).click();await pending;
 expect(await page.evaluate(()=>Object.entries(localStorage))).toEqual(original);
 await page.getByRole('link',{name:'最新版を開く'}).click();
 await expect(page.getByRole('alert')).toContainText('元データの上書きを止め');
});

test('cached HTML entry and CSS URLs survive next build instead of disappearing',async({page,request})=>{
 const html=await (await request.get('/')).text();
 expect(html).toContain('./assets/team-architect.js');expect(html).toContain('./assets/team-architect.css');
 await page.goto('/');await expect(page.getByRole('heading',{name:'今回のミッションは？'})).toBeVisible();
 await page.getByLabel('解決したい課題').fill('夜稼働の改善');
 await page.getByRole('button',{name:'編成と指示の初稿を作る'}).click();
 const data=await page.evaluate(()=>localStorage.getItem('team-architect-v2'));
 await page.goto('/recovery.html');await page.getByRole('link',{name:'最新版を開く'}).click();
 expect(await page.evaluate(()=>localStorage.getItem('team-architect-v2'))).toBe(data);
 await expect(page.getByRole('button',{name:/初稿.*夜稼働の改善/})).toBeVisible();
});
