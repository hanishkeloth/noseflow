/** One scheduled frame; hidden or offscreen scenes have no polling loop. */
export function createFrameLoop(callback, {element, onSuspend=()=>{}}={}) {
  let frame=null, running=false, disposed=false, visible=true;
  const active=()=>running&&!disposed&&!document.hidden&&visible;
  function schedule(){if(active()&&frame===null)frame=requestAnimationFrame(tick);}
  function tick(now){frame=null;if(!active())return;schedule();callback(now);}
  function sync(){
    if(active())schedule();
    else {if(frame!==null)cancelAnimationFrame(frame);frame=null;onSuspend();}
  }
  const observer=element&&typeof IntersectionObserver!=='undefined'?new IntersectionObserver(entries=>{
    visible=entries.some(entry=>entry.isIntersecting);sync();
  }):null;
  observer?.observe(element);
  document.addEventListener('visibilitychange',sync);
  return {
    isVisible:()=>!document.hidden&&visible,
    start(){if(disposed)return;running=true;sync();},
    dispose(){running=false;disposed=true;sync();observer?.disconnect();document.removeEventListener('visibilitychange',sync);},
  };
}
