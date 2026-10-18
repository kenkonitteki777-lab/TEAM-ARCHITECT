import {expect} from '@playwright/test';
export async function resume(page:any){await expect(page.locator('#readMode')).toBeEnabled();await expect(page.locator('#question')).not.toBeEmpty()}
export async function method(page:any,id:string){if(await page.locator('#aiInterview').isVisible()&&id!=='openAiInterview'){await page.locator('[data-ai-mode="'+(id==='startPractice'?'oral':'read')+'"]').click();return}await page.locator('#'+id).click()}
export async function role(page:any,value:string){await page.locator('[data-interviewer='+value+']').click()}
export async function scope(page:any,value:string){await page.locator('#questionScope').selectOption(value)}
export async function library(page:any){await page.locator('#appNav [data-view=library]').click()}
export async function settings(page:any){await page.locator('#appNav [data-view=settings]').click()}
export async function filters(page:any){if(!await page.locator('#bankMore').evaluate((e:HTMLDetailsElement)=>e.open))await page.locator('#bankMore>summary').click()}
