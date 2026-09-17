/** Local camera paths. No images, face landmarks or credentials are retained. */
const bound = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const finite = (v, fallback = 0) => Number.isFinite(v) ? v : fallback;
export const DURATION = 5000;
export const SAMPLE_INTERVAL = 1000 / 30;
export function inputPose(input) {
  return {azimuth: bound(finite(input.x), -1, 1) * 55,
    elevation: bound(finite(input.y), -1, 1) * 20,
    distance: bound(finite(input.distance, 1), .75, 1.25)};
}
export function validatePath(path) {
  if (!Array.isArray(path) || path.length < 2 || path.length > 12) throw Error('Use 2–12 keyframes.');
  let previous = -1;
  const result = path.map(p => {
    if (!p || !['time', 'azimuth', 'elevation', 'distance'].every(k => Number.isFinite(p[k]))) throw Error('All keyframe values must be finite numbers.');
    if (p.time < 0 || p.time > 1 || p.time <= previous || Math.abs(p.elevation) > 90 || p.distance < .1 || p.distance > 10 || Math.abs(p.azimuth) > 180) throw Error('Invalid keyframe bounds or time order.');
    previous = p.time;
    return {time:p.time, azimuth:p.azimuth, elevation:p.elevation, distance:p.distance};
  });
  if (result[0].time !== 0 || result.at(-1).time !== 1) throw Error('The path must start at 0 and end at 1.');
  return result;
}
export function interpolatePath(path, time) {
  const t = bound(time, 0, 1);
  let i = 1;
  while (i < path.length - 1 && path[i].time < t) i++;
  const a = path[i-1], b = path[i];
  const f = bound((t-a.time)/(b.time-a.time), 0, 1);
  return {azimuth:a.azimuth+(b.azimuth-a.azimuth)*f,
    elevation:a.elevation+(b.elevation-a.elevation)*f,
    distance:a.distance+(b.distance-a.distance)*f};
}
/** Preserve endpoints and choose the point with the largest interpolation error. */
export function simplifyPath(samples, limit = 12) {
  if (samples.length < 2) throw Error('Record a complete take first.');
  const selected = [0, samples.length-1];
  while (selected.length < Math.min(limit, samples.length)) {
    let best = -1, error = 1e-9;
    for (let n=1; n<selected.length; n++) {
      const start=selected[n-1], end=selected[n];
      for (let i=start+1; i<end; i++) {
        const estimate=interpolatePath([samples[start],samples[end]], samples[i].time);
        const p=samples[i];
        const e=((p.azimuth-estimate.azimuth)/55)**2 + ((p.elevation-estimate.elevation)/20)**2 + ((p.distance-estimate.distance)/.25)**2;
        if (e>error) {error=e;best=i;}
      }
    }
    if (best<0) break;
    selected.push(best);selected.sort((a,b)=>a-b);
  }
  return validatePath(selected.map(i=>samples[i]));
}
export function falRecipe(path) {
  return {endpoint:'minimax/h3-max/camera-controls', input:{image_url:'REPLACE_WITH_PUBLIC_SCENE_STILL_URL', duration:5, resolution:'768P', prompt_expansion_mode:'disabled', camera_trajectory:validatePath(path)}};
}
export function createOrbitRecorder() {
  let phase='idle', started=null, lastSample=0, samples=[], path=[], pose=null, elapsed=0, lastNotify=0;
  const listeners=new Set();
  const snapshot=()=>({phase,elapsed,path:path.map(p=>({...p})),sampleCount:samples.length});
  const emit=()=>listeners.forEach(fn=>fn(snapshot()));
  const reset=()=>{phase='idle';started=null;pose=null;elapsed=0;emit();};
  return {
    subscribe(fn){listeners.add(fn);fn(snapshot());return()=>{listeners.delete(fn);};},
    snapshot,
    start(){samples=[];phase='recording';started=null;lastSample=0;elapsed=0;pose=null;emit();},
    play(){if(path.length<2)return;phase='playing';started=null;elapsed=0;emit();},
    stop:reset,
    setPath(value){path=validatePath(value);reset();},
    clear(){path=[];samples=[];reset();},
    tick(now,input){
      if(phase==='idle')return null;
      if(started===null){started=now;lastSample=now-SAMPLE_INTERVAL;lastNotify=now;}
      elapsed=Math.min(now-started,DURATION);
      if(phase==='recording') {
        const target=inputPose(input);
        // Input is already calibrated; retain the same path used for the preview.
        pose=target;
        if(now-lastSample>=SAMPLE_INTERVAL-0.01 || elapsed===DURATION) {
          samples.push({time:elapsed/DURATION,...pose});lastSample=now;
        }
        if(elapsed===DURATION){path=simplifyPath(samples);phase='idle';emit();return pose;}
      } else {
        pose=interpolatePath(path,elapsed/DURATION);
        if(elapsed===DURATION){phase='idle';emit();return pose;}
      }
      if(now-lastNotify>=100){lastNotify=now;emit();}
      return pose;
    }
  };
}
