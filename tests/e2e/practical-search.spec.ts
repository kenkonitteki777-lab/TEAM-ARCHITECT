import {test,expect} from '@playwright/test';
test('saved instructions can be found by topic, purpose and owner without changing saved data',async({page})=>{
 await page.goto('/');
 for(const [issue,goal] of [['新人の接客研修','ひとりでご案内できる'],['トイレ清掃の改善','備品切れをなくす']]){
  await page.getByLabel('解決したい課題',{exact:true}).fill(issue);await page.getByText('目的・期限なども入力する（任意）',{exact:true}).click();await page.getByLabel('達成したい状態',{exact:true}).fill(goal);await page.getByRole('button',{name:'指示書を作る',exact:true}).click();await page.getByRole('button',{name:'課題・指示書',exact:true}).click();
 }
 const raw=await page.evaluate(()=>localStorage.getItem('team-architect-v2'));const missions=JSON.parse(raw!).missions;
 await page.getByRole('button',{name:'指示書一覧',exact:true}).click();const input=page.getByRole('searchbox',{name:'指示書を検索'});
 await input.fill('新人');await expect(page.locator('.mission-row')).toHaveCount(1);await expect(page.locator('.mission-row')).toContainText('新人の接客研修');
 await input.fill('備品切れ');await expect(page.locator('.mission-row')).toHaveCount(1);await expect(page.locator('.mission-row')).toContainText('トイレ清掃');
 const names:Record<string,string>={matsuo:'松尾',miyamoto:'宮本',yasaka:'八阪',hattori:'服部',tatsuno:'達野',asano:'浅野'};const owner=missions[0].commands[0].owner;await input.fill(names[owner]);await expect(page.locator('.mission-row')).toHaveCount(missions.filter((m:any)=>m.commands.some((c:any)=>c.owner===owner)).length);
 await input.fill('存在しない言葉');await expect(page.getByRole('heading',{name:'一致する指示書がありません'})).toBeVisible();await page.getByRole('button',{name:'検索をクリア'}).click();await expect(page.locator('.mission-row')).toHaveCount(2);
 expect(await page.evaluate(()=>localStorage.getItem('team-architect-v2'))).toBe(raw);expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});
test('complete draft shows shared rules once and keeps custom rules beside the command',async({page})=>{
 await page.goto('/');await page.getByLabel('解決したい課題').fill('新人の接客研修');await page.getByRole('button',{name:'指示書を作る',exact:true}).click();await expect(page.getByRole('region',{name:'共通の報告・相談ルール'})).toBeVisible();await expect(page.locator('.short-command').getByText(/^相談：/)).toHaveCount(0);
 await page.locator('.short-command').first().getByRole('button',{name:'指示・状態を編集'}).click();await page.getByRole('textbox',{name:'相談すべき条件',exact:true}).fill('本人が困ったら宮本へ相談');await page.getByRole('button',{name:'変更を保存',exact:true}).click();await expect(page.locator('.short-command').first()).toContainText('本人が困ったら宮本へ相談');await expect(page.locator('.common-rules')).not.toContainText('本人が困ったら宮本へ相談');
});
