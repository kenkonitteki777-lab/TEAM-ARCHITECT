import test from 'node:test';import assert from 'node:assert/strict';
import {defaultAppPreferences,validateAppPreferences,resolveSession} from '../public/interview/app-preferences.js';
import {scopedQuestions} from '../public/interview/study-scope.js';
test('preferences restrict duration, count and text size',()=>{const p=defaultAppPreferences();assert.deepEqual(validateAppPreferences(p),p);for(const field of ['questionCount','departmentSeconds','textSize'])assert.throws(()=>validateAppPreferences({...p,[field]:'bad'}))});
test('resume removes stale selections and falls back to an available role and question',()=>{const q=[{id:'q1',m:'take',kind:'past'}];const s=resolveSession({version:1,method:'oral',role:'president',questionId:'gone',scope:{type:'selection',ids:['gone']}},q,{records:{}},scopedQuestions);assert.equal(s.questionId,'q1');assert.equal(s.role,'department');assert.equal(s.scope.type,'all');assert.equal(s.method,'oral')});
