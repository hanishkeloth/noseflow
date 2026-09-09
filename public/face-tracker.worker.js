// Classic worker: dynamic ESM import plus importScripts support for the WASM loader.
let tracker;
self.onmessage = async ({data}) => {
  if (data.type === 'init') {
    try {
      const {FaceLandmarker, FilesetResolver} = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/vision_bundle.mjs');
      const files = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm');
      tracker = await FaceLandmarker.createFromOptions(files, {
        baseOptions: {modelAssetPath:'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task', delegate:'CPU'},
        runningMode:'VIDEO', numFaces:1,
      });
      self.postMessage({type:'ready'});
    } catch { self.postMessage({type:'error'}); }
  } else if (data.type === 'frame') {
    try {
      const result = tracker.detectForVideo(data.bitmap, data.timestamp);
      const nose = result.faceLandmarks[0]?.[1];
      self.postMessage({type:'result', nose:nose ? {x:nose.x,y:nose.y} : null});
    } catch { self.postMessage({type:'error'}); }
    finally { data.bitmap.close(); }
  }
};
