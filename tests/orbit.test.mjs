import test from 'node:test';
import assert from 'node:assert/strict';
import {createOrbitRecorder,validatePath,interpolatePath,falRecipe,inputPose} from '../lib/orbit.mjs';
const path=[{time:0,azimuth:0,elevation:0,distance:1},{time:1,azimuth:50,elevation:20,distance:1.2}];

test('a five-second take retains the start, turns and end within twelve keyframes',()=>{
 const recorder=createOrbitRecorder();recorder.start();
 for(let n=0;n<=600;n++)recorder.tick(n*5000/600,{x:Math.sin(n/600*Math.PI*2),y:n/600,distance:1});
 const result=recorder.snapshot();
 assert.equal(result.phase,'idle');assert.equal(result.elapsed,5000);
 assert.ok(result.sampleCount>=120&&result.sampleCount<=152);
 assert.ok(result.path.length>=4&&result.path.length<=12);
 assert.equal(result.path[0].time,0);assert.equal(result.path.at(-1).time,1);
 assert.ok(result.path.some(p=>p.azimuth>54));assert.ok(result.path.some(p=>p.azimuth<-54));
 recorder.play();assert.deepEqual(recorder.tick(10000,{}),interpolatePath(result.path,0));
 assert.deepEqual(recorder.tick(12500,{}),interpolatePath(result.path,.5));
 assert.deepEqual(recorder.tick(15000,{}),interpolatePath(result.path,1));
 assert.equal(recorder.snapshot().phase,'idle');
});
test('cancelled take preserves previous complete path; restart discards partial samples',()=>{
 const r=createOrbitRecorder();r.setPath(path);r.start();r.tick(0,{x:1});r.tick(2000,{x:0});r.stop();
 assert.deepEqual(r.snapshot().path,path);assert.equal(r.tick(8000,{}),null);
 r.start();r.tick(9000,{});assert.equal(r.snapshot().sampleCount,1);
 r.clear();assert.equal(r.snapshot().path.length,0);
});
test('edits enforce finite ordered normalized frames and export only camera values',()=>{
 for(const bad of [[],[{...path[0],time:.1},path[1]],[path[0],{...path[1],time:0}],[path[0],{...path[1],distance:0}],[path[0],{...path[1],azimuth:NaN}]])assert.throws(()=>validatePath(bad));
 const recipe=falRecipe(path.map(p=>({...p,faceLandmarks:['private'],key:'private'})));
 assert.equal(recipe.endpoint,'minimax/h3-max/camera-controls');assert.equal(recipe.input.resolution,'768P');
 assert.deepEqual(recipe.input.camera_trajectory,path);assert.ok(!JSON.stringify(recipe).includes('private'));
 const r=createOrbitRecorder();r.setPath(path);r.snapshot().path[0].azimuth=99;assert.equal(r.snapshot().path[0].azimuth,0);
 assert.deepEqual(inputPose({x:10,y:-10,distance:NaN}),{azimuth:55,elevation:-20,distance:1});
});
