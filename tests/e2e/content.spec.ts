import {test,expect} from '@playwright/test';
test('practical templates remove irrelevant steps and preserve complete recipient text and old records',async({page})=>{
 await page.goto('/');
 const cases=[{issue:'新人が一人でお客様をご案内できるようにしたい',label:'新人の案内練習',functions:['COACH','REVIEW']},{issue:'トイレの清掃漏れをなくす',label:'清掃・点検',functions:['FIELD','REVIEW']},{issue:'スタッフ間の引継ぎ漏れをなくす',label:'引継ぎ',functions:['TRANSLATE','OPERATE','REVIEW']},{issue:'会議を短くしたい',label:'既存の仕事分類に一致しません',functions:['ANALYZE','DESIGN','OPERATE','REVIEW']}];
 let previous:unknown[]=[];
 for(const input of cases){await page.getByRole('button',{name:'新しい指示書',exact:true}).click();await page.getByLabel('解決したい課題').fill(input.issue);await page.getByRole('button',{name:'指示書を作る',exact:true}).click();await expect(page.getByLabel('今回の進め方')).toContainText(input.label);
 const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('team-architect-v2')!));const mission=data.missions.find((m:{brief:{issue:string}})=>m.brief.issue===input.issue);if(input.label==='既存の仕事分類に一致しません'){expect(mission.kind).toBe('general');await expect(page.locator('.mission-heading')).toContainText('その他・内容確認');}expect(mission.commands.map((c:{fn:string})=>c.fn)).toEqual(input.functions);for(const old of previous)expect(data.missions).toContainEqual(old);previous=data.missions;
 const first=mission.commands[0];const card=page.locator('.recipient-card:visible').first();await card.getByRole('button',{name:/への文章を確認/}).click();const memo=page.getByLabel('そのまま伝える文章');for(const fact of [...first.actions,first.output,first.done,first.consult,first.discretion])expect(await memo.inputValue()).toContain(fact);
 }
 await page.reload();await page.getByRole('button',{name:'指示書一覧',exact:true}).click();await expect(page.locator('.mission-row')).toHaveCount(4);expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});
