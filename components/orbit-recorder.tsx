"use client";
import {useEffect, useState} from 'react';
import {Circle, Play, Square, Download, RotateCcw} from 'lucide-react';
import {createOrbitRecorder, falRecipe} from '@/lib/orbit.mjs';

type Controller=ReturnType<typeof createOrbitRecorder>;
type Keyframe={time:number;azimuth:number;elevation:number;distance:number};
const fields=["azimuth","elevation","distance"] as const;

export function OrbitRecorder({controller, onPrepare, ready, distance, setDistance}: {controller:Controller; onPrepare:()=>void; ready:boolean; distance:number; setDistance:(n:number)=>void}) {
  const [take,setTake]=useState(controller.snapshot());
  const [error,setError]=useState('');
  useEffect(()=>controller.subscribe(setTake),[controller]);
  const active=take.phase!=='idle', hasTake=take.path.length>1;
  function download(recipe=false){
    const data=recipe?falRecipe(take.path):{version:1,duration:5,camera_trajectory:take.path};
    const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download=recipe?'noseflow-fal-recipe.json':'noseflow-orbit.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function edit(index:number,field:string,value:number){
    try{const path=take.path.map((p:Keyframe,i:number)=>i===index?{...p,[field]:value}:p);controller.setPath(path);setError('');}
    catch(e){setError(e instanceof Error?e.message:'Invalid keyframe.');}
  }
  return <section className="control-section orbit-controls" aria-label="Orbit Recorder">
    <div className="label-row"><h2>Orbit Recorder</h2><span>5 SECONDS</span></div>
    <p>Record 5 seconds with your nose, pointer or arrow keys. The scene freezes while the camera moves. Hiding the scene stops the take.</p>
    <label className="orbit-distance">Camera distance <output>{distance.toFixed(2)}×</output>
      <input aria-label="Camera distance" type="range" min="0.75" max="1.25" step="0.01" value={distance} onChange={e=>setDistance(Number(e.target.value))}/>
    </label>
    <div className="orbit-actions">
      <button className="generate" disabled={!ready||active} onClick={()=>{onPrepare();controller.start()}}><Circle size={14}/>Record take</button>
      <button className="camera-button" disabled={!ready||(!active&&!hasTake)} onClick={()=>{if(active)controller.stop();else{onPrepare();controller.play()}}}>{active?<Square size={14}/>:<Play size={14}/>} {active?'Stop':'Replay'}</button>
    </div>
    <progress aria-label="Take progress" max="5000" value={take.elapsed}/>
    <p className="note" role="status">{take.phase==='recording'?'Recording':take.phase==='playing'?'Replaying':hasTake?`${take.path.length} keyframes ready`:'Ready for your first take'} · {(take.elapsed/1000).toFixed(1)}s</p>
    {hasTake&&<>
      <div className="orbit-actions"><button className="camera-button" disabled={active} onClick={()=>download()}><Download size={14}/>Path JSON</button><button className="camera-button" disabled={active} onClick={()=>download(true)}><Download size={14}/>fal recipe</button></div>
      <details><summary>Edit keyframes</summary><div className="orbit-frames">{take.path.map((p:Keyframe,i:number)=><fieldset key={i} disabled={active}><legend>Frame {i+1} · {(p.time*5).toFixed(2)}s</legend>{fields.map(field=><label key={field}>{field}<input aria-label={`Frame ${i+1} ${field}`} type="number" step={field==='distance'?'.01':'1'} min={field==='distance'?'.1':field==='azimuth'?'-180':'-90'} max={field==='distance'?'10':field==='azimuth'?'180':'90'} value={Number(p[field].toFixed(3))} onChange={e=>edit(i,field,e.target.valueAsNumber)}/></label>)}{take.path.length>2&&i>0&&i<take.path.length-1&&<button type="button" onClick={()=>controller.setPath(take.path.filter((_:Keyframe,n:number)=>n!==i))}>Remove frame</button>}</fieldset>)}</div></details>
      <button className="clear" disabled={active} onClick={()=>{controller.clear();setError('')}}><RotateCcw size={13}/>Clear take</button>
    </>}
    {error&&<p role="alert" className="note">{error}</p>}
    <p className="note">Recording and downloads are free and stay local. The fal recipe needs a scene still URL and your own backend/key; downloading it does not generate or charge. AI video may differ from this preview. <a href="https://fal.ai/models/minimax/h3-max/camera-controls" target="_blank" rel="noreferrer">View current pricing</a>.</p>
  </section>;
}

export function OrbitStatus({controller}:{controller:Controller}) {
  const [take,setTake]=useState(controller.snapshot());
  useEffect(()=>controller.subscribe(setTake),[controller]);
  if(take.phase==='idle')return null;
  return <div className="orbit-hud"><span>{take.phase==='recording'?'Recording':'Replaying'} · {(take.elapsed/1000).toFixed(1)} / 5s</span><button onClick={()=>controller.stop()} aria-label="Stop camera take"><Square size={12}/>Stop</button></div>;
}
