/** One transferable frame in flight. No camera data leaves the browser. */
export function createFaceTracker(video, {onNose, onError}) {
  const worker = new Worker(new URL('./face-tracker.worker.js', document.baseURI));
  let closed=false, pending=false, running=false, frame=0, last=0, watchdog, rejectReady;
  const ready = new Promise((resolve,reject) => {
    rejectReady=reject;
    watchdog=setTimeout(()=>fail(),25000);
    worker.onmessage=({data})=>{
      if(closed)return;
      if(data.type==='ready'){clearTimeout(watchdog);resolve();}
      if(data.type==='result'){clearTimeout(watchdog);pending=false;if(!document.hidden)onNose(data.nose);}
      if(data.type==='error')fail();
    };
    worker.onerror=()=>fail();
    worker.onmessageerror=()=>fail();
  });
  function close(){if(closed)return;closed=true;cancelAnimationFrame(frame);clearTimeout(watchdog);worker.terminate();rejectReady(new Error('Tracking stopped'));}
  function fail(){if(closed)return;close();onError();}
  async function tick(now){
    if(closed)return;
    frame=requestAnimationFrame(tick);
    if(document.hidden||pending||now-last<83||video.readyState<2)return;
    pending=true;last=now;
    try {
      const bitmap=await createImageBitmap(video,{resizeWidth:320,resizeHeight:240});
      if(closed||document.hidden){bitmap.close();pending=false;return;}
      watchdog=setTimeout(()=>fail(),8000);
      worker.postMessage({type:'frame',bitmap,timestamp:now},[bitmap]);
    } catch { fail(); }
  }
  worker.postMessage({type:'init'});
  return {ready, start(){if(!closed&&!running){running=true;frame=requestAnimationFrame(tick);}}, close};
}
