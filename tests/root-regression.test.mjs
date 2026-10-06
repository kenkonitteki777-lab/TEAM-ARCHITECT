import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {build} from 'esbuild';
test('all five mission types produce a complete workflow including final handoff',async()=>{
 const source=fs.readFileSync('src/App.tsx','utf8')+'\nexport { buildFlow };';
 const bundle=await build({stdin:{contents:source,loader:'tsx',resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false});
 const {buildFlow}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
 for(const kind of ['sales','machine','promo','people','service']){const flow=buildFlow(kind,[0,1,2,3,4,5,6]);assert.ok(flow.length>0);assert.equal(flow.at(-1).handoff,'前﨑店長へ最終報告');assert.ok(flow.every(step=>Number.isInteger(step.owner)&&step.owner>=0&&step.owner<7&&step.handoff));}
});
