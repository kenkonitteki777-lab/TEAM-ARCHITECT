import type { Page } from '@playwright/test';
// Synthetic organization for existing execution regression scenarios, never production data.
export async function confirmTestOrganization(page:Page){
 const overview=await page.getByRole('tab',{name:'進捗・詳細'}).getAttribute('aria-selected')==='true';
 await page.evaluate(()=>{
  const key='team-architect-v2',store=JSON.parse(localStorage.getItem(key)!);if(store.organization)return;
  const m=store.missions[0],leader=m.team.find((x:{role:string})=>x.role==='LEADER')?.memberId||'matsuo';
  store.organization=Object.fromEntries(['maesaki','matsuo','yasaka','miyamoto','hattori','tatsuno','asano'].map(id=>[id,{grade:id==='maesaki'?'storeManager':id===leader?'manager':'employee',coach:false,hallMaster:false,reportsTo:id==='maesaki'?null:id===leader?'maesaki':leader}]));
  localStorage.setItem(key,JSON.stringify(store));
 });
 await page.reload();await page.getByRole('button',{name:'指示書一覧',exact:true}).click();await page.locator('.mission-row').first().click();
 const apply=page.getByRole('button',{name:'保存した指示系統をこの初稿に反映'});if(await page.locator('.authority-notice').count()){await page.locator('.authority-notice summary').click();await apply.click();}
 if(overview)await page.getByRole('tab',{name:'進捗・詳細'}).click();
}
