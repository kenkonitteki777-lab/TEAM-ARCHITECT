import {test,expect} from '@playwright/test';
for(const [issue,firstFn] of [['新人の案内練習','COACH'],['トイレの清掃漏れをなくす','FIELD']])test(`${issue}: two-step sheet completes through recorded verification`,async({page})=>{
 await page.goto('/');await page.getByLabel('解決したい課題').fill(issue);await page.getByText('目的・期限なども入力する（任意）',{exact:true}).click();await page.getByLabel('達成したい状態').fill('実施結果と残った問題を確認できる');const future=(days:number)=>new Date(Date.now()+days*86400000).toISOString().slice(0,16);await page.getByLabel('指示書の期限（日本時間）',{exact:true}).fill(future(4));await page.getByLabel('次回チェックポイント（日本時間）',{exact:true}).fill(future(2));await page.getByRole('button',{name:'指示書を作る',exact:true}).click();
 await expect(page.locator('.short-command:visible')).toHaveCount(2);await expect(page.getByLabel('今回の進め方')).toContainText('2工程');await expect(page.locator('.short-command').nth(1)).toContainText('先行待ち');await page.getByRole('button',{name:'確認して実行を開始',exact:true}).click();await expect(page.locator('.short-command:visible')).toHaveCount(1);
 for(const note of ['実施記録を共有し、未確認事項も記載','成果物と現場を照合し、残った問題と次回確認を合意']){
  const item=page.locator('.short-command:visible').first();await item.getByRole('button',{name:'完了',exact:true}).click();await item.getByLabel('成果物・確認結果を一言').fill(note);await item.getByRole('button',{name:'完了を保存',exact:true}).click();
 }
 await page.reload();const m=await page.evaluate(()=>JSON.parse(localStorage.getItem('team-architect-v2')!).missions[0]);expect(m.commands.map((c:any)=>c.fn)).toEqual([firstFn,'REVIEW']);expect(m.commands.every((c:any)=>c.status==='done'&&c.evidence)).toBe(true);expect(m.execution.changes).toHaveLength(2);expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});
