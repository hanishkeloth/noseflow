import test from 'node:test';
import assert from 'node:assert/strict';
import {damp,faceInput,safeFalUrl} from '../lib/motion.mjs';
test('smoothing converges equally at 30 and 60 fps',()=>{
 let a=0,b=0;for(let i=0;i<30;i++)a=damp(a,1,1/30);for(let i=0;i<60;i++)b=damp(b,1,1/60);
 assert.ok(Math.abs(a-b)<1e-10);assert.ok(a<1&&a>.99);
});
test('calibration removes offset, ignores jitter and bounds extreme motion',()=>{
 const center={x:.4,y:.6};assert.deepEqual(faceInput(center,center),{x:0,y:0});
 assert.deepEqual(faceInput({x:.401,y:.599},center),{x:0,y:0});
 assert.deepEqual(faceInput({x:-10,y:10},center),{x:1,y:-1});
});
test('fal credentials cannot be forwarded to a different origin',()=>{
 for(const url of ['http://queue.fal.run/x','https://queue.fal.run.evil.example/x','https://evil.example/x','https://user:pass@queue.fal.run/x'])assert.throws(()=>safeFalUrl(url));
 assert.equal(safeFalUrl('https://queue.fal.run/model/requests/abc/status'),'https://queue.fal.run/model/requests/abc/status');
});
