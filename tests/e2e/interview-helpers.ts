import {expect} from '@playwright/test';
export async function resume(page:any){await expect(page.locator('#resumeStudy')).toBeEnabled();await page.locator('#resumeStudy').click()}
export async function options(page:any){if(await page.locator('#sessionOptions').isVisible())return;if(await page.locator('#sessionChange').isVisible())await page.locator('#sessionChange').click();else await page.locator('#openSessionOptions').click()}
export async function method(page:any,id:string){await options(page);await page.locator('#'+id).click();await page.locator('#applySession').click()}
export async function role(page:any,value:string){await options(page);await page.locator('[data-interviewer='+value+']').click();await page.locator('#closeSessionOptions').click()}
export async function scope(page:any,value:string){await options(page);await page.locator('#questionScope').selectOption(value);await page.locator('#closeSessionOptions').click()}
export async function library(page:any){await page.locator('#appNav [data-view=library]').click()}
export async function settings(page:any){await page.locator('#appNav [data-view=settings]').click()}
