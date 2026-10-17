import {resume,method,role,scope,library,settings} from './interview-helpers';
import {test,expect} from '@playwright/test';
test('default previews use separate interviewer audio files and question playback uses a recording',async({page})=>{
 await page.addInitScript(()=>{
  const played:string[]=[];(window as any).recordedPlayed=played;
  Object.defineProperty(window,'Audio',{value:class{constructor(public src:string){}play(){played.push(this.src);return Promise.resolve()}pause(){}load(){}removeAttribute(){}}});
 });
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/interview/');await resume(page);await page.locator('#readQuestion').click();
 await page.locator('#openVoice').click();await page.locator('#previewDepartment').click();await page.locator('#previewPresident').click();
 const played=await page.evaluate(()=>(window as any).recordedPlayed);
 expect(played[0]).toMatch(/\/audio\/(department|president)\/q/);expect(played[1]).toContain('/audio/department/preview-');expect(played[2]).toContain('/audio/president/preview-');expect(played[1]).not.toBe(played[2]);
 await expect(page.locator('#voiceSettings')).toContainText('VOICEVOX:玄野武宏');await expect(page.locator('#voiceSettings')).toContainText('VOICEVOX:麒ヶ島宗麟');expect(errors).toEqual([]);
});
