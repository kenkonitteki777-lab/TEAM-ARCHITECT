import test from 'node:test';
import assert from 'node:assert/strict';
import {createRecoveryClient,takeRecoveryToken} from '../public/interview/password-reset.js';
test('recovery token is accepted only for recovery and removed from browser URL',()=>{
 const replaced=[];const history={replaceState:(...args)=>replaced.push(args)};
 const location={hash:'#access_token=test-recovery&type=recovery&refresh_token=not-stored',pathname:'/interview/password-reset.html',search:''};
 assert.equal(takeRecoveryToken(location,history),'test-recovery');assert.equal(replaced[0][2],'/interview/password-reset.html');
 assert.equal(takeRecoveryToken({...location,hash:'#access_token=other&type=signup'},history),null);
});
test('reset request uses email and fixed HTTPS destination without any credential',async()=>{
 const calls=[];const c=createRecoveryClient({url:'https://example.supabase.co',publishableKey:'public',fetcher:async(url,options)=>{calls.push({url,options});return Response.json({})}});
 await c.send('person@example.com','https://example.com/interview/password-reset.html');
 assert.equal(calls[0].url,'https://example.supabase.co/auth/v1/recover?redirect_to=https%3A%2F%2Fexample.com%2Finterview%2Fpassword-reset.html');assert.deepEqual(JSON.parse(calls[0].options.body),{email:'person@example.com'});assert.equal(calls[0].options.headers.Authorization,undefined);
 await assert.rejects(()=>c.send('bad','https://example.com/reset'),/メール/);assert.equal(calls.length,1);
});
test('password change requires recovery authentication and updates only the authenticated user',async()=>{
 const calls=[];const c=createRecoveryClient({url:'https://example.supabase.co',publishableKey:'public',fetcher:async(url,options)=>{calls.push({url,options});return Response.json({id:'verified-user'})}});
 await assert.rejects(()=>c.update('', 'long-password'),/リンク/);await assert.rejects(()=>c.update('recovery','short'),/8文字/);assert.equal(calls.length,0);
 assert.equal((await c.verify('recovery')).id,'verified-user');await c.update('recovery','new-password');
 assert.equal(calls[1].options.method,'PUT');assert.equal(calls[1].url,'https://example.supabase.co/auth/v1/user');assert.equal(calls[1].options.headers.Authorization,'Bearer recovery');assert.deepEqual(JSON.parse(calls[1].options.body),{password:'new-password'});
});
test('expired recovery and sending limits are explained without exposing server responses',async()=>{
 const c=createRecoveryClient({url:'https://example.supabase.co',publishableKey:'public',fetcher:async()=>Response.json({message:'sensitive internal detail'},{status:401})});await assert.rejects(()=>c.verify('expired'),/期限切れ/);
 const limited=createRecoveryClient({url:'https://example.supabase.co',publishableKey:'public',fetcher:async()=>Response.json({},{status:429})});await assert.rejects(()=>limited.send('person@example.com','https://example.com/reset'),/送信回数/);
});
