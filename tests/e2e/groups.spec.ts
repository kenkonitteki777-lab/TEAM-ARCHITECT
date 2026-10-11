import {test,expect} from '@playwright/test';
const groups=[['analysts','紫 · 分析家',['INTJ','INTP','ENTJ','ENTP'],'rgb(196, 165, 237)'],['diplomats','緑 · 外交官',['INFJ','INFP','ENFJ','ENFP'],'rgb(133, 211, 171)'],['sentinels','青 · 番人',['ISTJ','ISFJ','ESTJ','ESFJ'],'rgb(136, 197, 239)'],['explorers','黄 · 探検家',['ISTP','ISFP','ESTP','ESFP'],'rgb(237, 206, 117)']] as const;
test('sixteen people types form complete equal rows without a lone last option',async({page})=>{
 for(const width of [360,390,430,768,1000,1440]){
  await page.setViewportSize({width,height:844});await page.goto('/');await page.getByRole('button',{name:'人材・MBTI',exact:true}).click();await expect(page.locator('.type-selector button')).toHaveCount(16);
  const options=await page.locator('.type-selector button').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};}));
  expect(options).toHaveLength(16);
  for(let row=0;row<4;row++){const cells=options.slice(row*4,row*4+4);expect(new Set(cells.map(c=>c.y)).size).toBe(1);expect(Math.max(...cells.map(c=>c.width))-Math.min(...cells.map(c=>c.width))).toBeLessThan(1);expect(Math.min(...cells.map(c=>c.height))).toBeGreaterThanOrEqual(44);}
  expect(options[12].x).toBe(options[0].x);expect(options[15].x).toBe(options[3].x);
  await page.goto('/?view=characters');await expect(page.locator('.type-card')).toHaveCount(16);const cards=await page.locator('.type-card').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return{y:r.y,height:r.height};}));
  const columns=width<=1000?2:4;for(let i=0;i<16;i+=columns){const row=cards.slice(i,i+columns);expect(new Set(row.map(c=>c.y)).size).toBe(1);expect(Math.max(...row.map(c=>c.height))-Math.min(...row.map(c=>c.height))).toBeLessThan(1);}
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 }
});
test('all sixteen types share four group colours; filters and detail return retain the selected person',async({page})=>{
 await page.goto('/?view=characters');await expect(page.locator('.type-card')).toHaveCount(16);
 for(const [id,label,types,colour] of groups){const filter=page.getByRole('button',{name:label,exact:true});await filter.click();await expect(filter).toHaveAttribute('aria-pressed','true');const cards=page.locator('.type-card');await expect(cards).toHaveCount(4);expect(await cards.locator('small').allTextContents()).toEqual([...types]);for(const type of types){const card=page.locator(`.type-card[data-type="${type}"]`);await expect(card).toHaveClass(new RegExp('mbti-'+id));expect(await card.locator('small').evaluate(el=>getComputedStyle(el).color)).toBe(colour);}
 const last=page.locator(`.type-card[data-type="${types[3]}"]`);await last.click();await expect(page.locator('#character-detail')).toBeFocused();await expect(page.locator('#character-detail')).toContainText(types[3]);await page.getByRole('button',{name:'図鑑に戻る',exact:true}).click();await expect(last).toBeFocused();}
 await page.getByRole('button',{name:'全16タイプ',exact:true}).click();await expect(page.locator('.type-card')).toHaveCount(16);await page.getByLabel('話す側のタイプ').selectOption('ISFP');await expect(page.locator('.lab-person').first()).toHaveClass(/mbti-explorers/);await page.getByLabel('受け取る側のタイプ').selectOption('ESFJ');await expect(page.locator('.lab-person').last()).toHaveClass(/mbti-sentinels/);
 for(const width of [360,390,430,1440]){await page.setViewportSize({width,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);}
});
test('diagnosis remains accessible on every view, opens separately, and navigation resets scrolling without losing input',async({page,context})=>{
 await page.goto('/');await page.getByLabel('解決したい課題').fill('ナビ確認用の入力');const raw=await page.evaluate(()=>localStorage.getItem('team-architect-v2'));
 for(const name of ['16タイプ図鑑','人材・MBTI','バックアップ','今日の仕事','指示書一覧','新しい指示書']){await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await page.getByRole('button',{name,exact:true}).click();await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBe(0);const link=page.locator('.topbar').getByRole('link',{name:'性格診断（16Personalities・外部サイト・別タブ）'});await expect(link).toBeVisible();await expect(link).toHaveAttribute('href','https://www.16personalities.com/ja/性格診断テスト');await expect(link).toHaveAttribute('target','_blank');await expect(link).toHaveAttribute('rel','noopener noreferrer');await expect(page.getByRole('button',{name,exact:true})).toHaveAttribute('aria-current','page');}
 await expect(page.getByLabel('解決したい課題')).toHaveValue('ナビ確認用の入力');expect(await page.evaluate(()=>localStorage.getItem('team-architect-v2'))).toBe(raw);
 const link=page.locator('.topbar .diagnosis-link');await context.route('https://www.16personalities.com/**',route=>route.fulfill({contentType:'text/html',body:'<title>External test destination</title>'}));const popup=page.waitForEvent('popup');await link.click();const external=await popup;await expect(external).toHaveURL(/16personalities.com/);await external.close();await expect(page.getByLabel('解決したい課題')).toHaveValue('ナビ確認用の入力');
});
