import {test,expect} from '@playwright/test';
const first='夜稼働改善を検証する';
async function create(page:import('@playwright/test').Page,issue=first){await page.getByLabel('解決したい課題').fill(issue);await page.getByLabel('達成したい状態').fill('平日夜稼働を上げる');await page.getByLabel('ミッション期限（日本時間）',{exact:true}).fill('2026-10-15T22:00');await page.getByText('制約・KPI・参加メンバーを設定',{exact:true}).click();await page.getByLabel('次回チェックポイント（日本時間）',{exact:true}).fill('2026-10-13T12:00');await page.getByRole('button',{name:'編成と指示の初稿を作る'}).click();await page.getByRole('tab',{name:'進捗・詳細'}).click();}
test('daily work opens the right mission and directive, preserves waiting states and produces personal memo',async({page})=>{
 await page.goto('/');await create(page);await page.getByRole('button',{name:'確認して実行を開始'}).click();
 await page.getByRole('button',{name:'今日の仕事',exact:true}).click();const board=page.getByRole('region',{name:'全案件の仕事'}).or(page.locator('.work-board'));
 await expect(board).toContainText('着手可能 1');await expect(board).toContainText('先行待ち・保留 6');
 await page.getByLabel('仕事の担当').selectOption('matsuo');await page.getByRole('button',{name:'共有用の仕事メモを作る'}).click();await expect(page.getByLabel('共有用の仕事メモ')).toContainText('仕事の共有メモ / 松尾');
 await page.getByLabel('確認する仕事').selectOption('ready');await page.getByRole('button',{name:'指示を開く'}).first().click();await expect(page.getByRole('dialog')).toBeVisible();await expect(page.getByRole('dialog')).toContainText('現状分析');await page.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('button',{name:'今日の仕事',exact:true}).click();
 for(const width of [360,390,430,1440]){await page.setViewportSize({width,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);}
});
test('review → explicit learning → changed draft → reload and backup preserves source and evidence',async({page,context})=>{
 test.setTimeout(60000);
 await page.goto('/');await create(page);
 await page.getByText('成果と次回の改善を記録する',{exact:true}).click();
 await page.getByLabel('実際に出た結果').fill('平日の改善が限定的');await page.getByLabel('結果の根拠・確認できる資料').fill('時間帯別の集計表');await page.getByLabel('成功・失敗の要因と不明点').fill('告知の開始が遅れた。競合影響は未検証');await page.getByLabel('次回変える仕事').selectOption('CREATE');await page.getByLabel('次回の具体的な改善行動').fill('告知開始3日前に店長へ設置場所を確認する');await page.getByLabel('この学びを使ってよい条件').fill('同じ時間帯でPOPを使う施策');await page.getByRole('button',{name:'根拠と次回の改善を保存'}).click();await expect(page.getByRole('region',{name:'成果と次回の改善'}).or(page.locator('.review-panel'))).toContainText('時間帯別の集計表');
 const source=await page.evaluate(()=>JSON.parse(localStorage.getItem('team-architect-v2')!).missions[0]);
 await page.getByRole('button',{name:'司令室',exact:true}).click();await page.getByLabel('解決したい課題').fill('夜稼働改善の第2回');await page.getByLabel('前回の学びを初稿に反映する').selectOption(source.id);await page.getByRole('button',{name:'編成と指示の初稿を作る'}).click();await expect(page.getByRole('alert')).toContainText('適用条件に合う');
 await page.getByLabel('今回もこの適用条件に合うことを確認した').check();await page.getByRole('button',{name:'編成と指示の初稿を作る'}).click();await page.getByRole('tab',{name:'進捗・詳細'}).click();await expect(page.locator('.learning-applied')).toContainText('時間帯別の集計表');await page.getByText('変更前後の行動を確認',{exact:true}).click();await expect(page.locator('.learning-applied')).toContainText('前回の学びを踏まえた確認・行動');
 const store=await page.evaluate(()=>JSON.parse(localStorage.getItem('team-architect-v2')!));expect(store.missions.find((m:{id:string})=>m.id===source.id)).toEqual(source);expect(store.missions[0].commands.find((c:{fn:string})=>c.fn==='CREATE').actions).toHaveLength(4);
 for(const width of [360,390,430,1440]){await page.setViewportSize({width,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);}
 await page.reload();await page.getByRole('button',{name:/初稿.*夜稼働改善の第2回/}).click();await page.getByRole('tab',{name:'進捗・詳細'}).click();await expect(page.locator('.learning-applied')).toContainText('告知開始3日前');
 await page.getByRole('button',{name:'保存・履歴',exact:true}).click();const pending=page.waitForEvent('download');await page.getByRole('button',{name:'全データを書き出す'}).click();const file=await (await pending).path();const clean=await context.browser()!.newContext();const p=await clean.newPage();await p.goto('/');await p.getByRole('button',{name:'保存・履歴',exact:true}).click();await p.locator('input[type=file]').setInputFiles(file!);await p.getByRole('button',{name:/初稿.*夜稼働改善の第2回/}).click();await p.getByRole('tab',{name:'進捗・詳細'}).click();await expect(p.locator('.learning-applied')).toContainText('時間帯別の集計表');await clean.close();
});
