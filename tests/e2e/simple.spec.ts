import {test,expect} from '@playwright/test';
test('mission opens short person-first instructions, offers complete details and copyable message',async({page})=>{
 await page.goto('/');await page.getByLabel('解決したい課題').fill('朝の接客品質を改善したい');await page.getByRole('button',{name:'編成と指示の初稿を作る'}).click();
 await expect(page.getByRole('tab',{name:/個別指示/})).toHaveAttribute('aria-selected','true');await expect(page.getByRole('heading',{name:'誰に、何を伝える？'})).toBeVisible();await expect(page.getByRole('region',{name:'成果と次回の改善'})).toHaveCount(0);
 const card=page.locator('.recipient-card').first();const name=await card.locator('h3').innerText();await page.getByLabel('伝える相手').selectOption({label:name.replace('さんへ','')});await expect(page.locator('.recipient-card')).toHaveCount(1);
 const action=await card.locator('.short-command>p').first().innerText();await card.getByRole('button',{name:/への伝達文を作る/}).click();await expect(page.getByLabel('そのまま伝える文章')).toHaveValue(new RegExp(action));
 await card.getByText('指示の続きを見る').first().click();await expect(card.locator('details').first()).toContainText('完了条件');
 for(const width of [360,390,430,1440]){await page.setViewportSize({width,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);}
 await card.getByRole('button',{name:'指示・状態を編集'}).first().click();await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'閉じる',exact:true}).click();await page.getByRole('tab',{name:'進捗・詳細'}).click();await expect(page.getByRole('region',{name:'成果と次回の改善'})).toBeVisible();
});
