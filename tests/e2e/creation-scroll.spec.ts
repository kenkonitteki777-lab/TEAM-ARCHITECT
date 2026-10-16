import {test,expect} from '@playwright/test';
test('creation stays at the document top after a scrolled form, Enter submission and layout growth',async({page})=>{
 await page.goto('/');await page.addStyleTag({content:'html{scroll-behavior:smooth}'});await page.getByLabel('解決したい課題').fill('新人が一人でお客様をご案内できるようにしたい');await page.getByText('目的・期限なども入力する（任意）',{exact:true}).click();await page.getByLabel('達成したい状態').fill('案内の手順を一人で説明できる');await page.getByLabel('達成したい状態').press('Enter');await expect(page.getByRole('heading',{name:'新人が一人でお客様をご案内できるようにしたい',exact:true})).toBeVisible();
 const positions=await page.evaluate(async()=>{const ys:number[]=[];for(let i=0;i<20;i++){await new Promise<void>(r=>requestAnimationFrame(()=>r()));ys.push(scrollY);}return ys;});expect(Math.max(...positions)).toBeLessThanOrEqual(1);expect(await page.evaluate(()=>document.activeElement?.tagName)).not.toBe('INPUT');await expect(page.locator('.short-command:visible')).toHaveCount(2);
 await page.getByRole('button',{name:'確認して実行を開始',exact:true}).click();await expect(page.getByLabel('この指示で目指すこと')).toBeFocused();await expect(page.getByRole('alert')).toContainText('期限');
});
