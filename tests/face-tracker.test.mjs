import test from 'node:test';
import assert from 'node:assert/strict';
import {createFaceTracker} from '../lib/face-tracker.mjs';

function environment(t){
  const names=['Worker','document','createImageBitmap','requestAnimationFrame','cancelAnimationFrame'];
  const saved=names.map(name=>Object.getOwnPropertyDescriptor(globalThis,name));
  t.after(()=>names.forEach((name,i)=>saved[i]?Object.defineProperty(globalThis,name,saved[i]):delete globalThis[name]));
  let worker, callback;
  globalThis.document={baseURI:'https://example.com/noseflow/',hidden:false};
  globalThis.Worker=class{constructor(url){this.url=url;this.sent=[];worker=this;}postMessage(data){this.sent.push(data);}terminate(){this.terminated=true;}};
  globalThis.createImageBitmap=async()=>({close(){this.closed=true;}});
  globalThis.requestAnimationFrame=fn=>{callback=fn;return 1;};
  globalThis.cancelAnimationFrame=()=>{};
  return {get worker(){return worker;},tick:now=>callback(now)};
}
test('worker tracking limits frames in flight and respects hidden tabs',async t=>{
  const env=environment(t), noses=[];
  const controller=createFaceTracker({readyState:4},{onNose:n=>noses.push(n),onError:()=>assert.fail('Unexpected tracking failure')});
  assert.equal(env.worker.url.href,'https://example.com/noseflow/face-tracker.worker.js');
  env.worker.onmessage({data:{type:'ready'}});await controller.ready;controller.start();
  await env.tick(100);await env.tick(200);
  assert.equal(env.worker.sent.filter(x=>x.type==='frame').length,1);
  env.worker.onmessage({data:{type:'result',nose:{x:.5,y:.4}}});assert.equal(noses.length,1);
  document.hidden=true;await env.tick(300);assert.equal(env.worker.sent.length,2);
  document.hidden=false;await env.tick(400);assert.equal(env.worker.sent.length,3);
  controller.close();assert.equal(env.worker.terminated,true);
});
test('cancelled initialization rejects readiness and terminates the worker',async t=>{
  const env=environment(t);
  const controller=createFaceTracker({readyState:0},{onNose(){},onError(){}});
  const rejected=assert.rejects(controller.ready,/Tracking stopped/);
  controller.close();await rejected;assert.equal(env.worker.terminated,true);
});
