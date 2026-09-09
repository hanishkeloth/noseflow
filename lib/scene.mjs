import {damp} from './motion.mjs';
import {createTiltStudio} from './tilt.mjs';
// Three is passed in so the renderer can be loaded only in the browser.
export function createScene(T, host, input, settings) {
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(42, 1, .1, 100);
  camera.position.z = 7;
  const renderer = new T.WebGLRenderer({alpha: true, antialias: true, preserveDrawingBuffer: true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  host.appendChild(renderer.domElement);
  const tilt=createTiltStudio(T,scene);
  const count = 18000;
  const geometry = new T.BufferGeometry();
  const seeds = Float32Array.from({length: count * 3}, () => Math.random());
  geometry.setAttribute('position', new T.BufferAttribute(new Float32Array(count * 3), 3));
  geometry.setAttribute('seed', new T.BufferAttribute(seeds, 3));
  const uniforms = {time: {value: 0}, preset: {value: 0}, spread: {value: 1}, pixelRatio: {value: renderer.getPixelRatio()}};
  const material = new T.ShaderMaterial({uniforms, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    vertexShader: `attribute vec3 seed; uniform float time, preset, spread, pixelRatio; varying vec3 tint;
      void main(){float a=seed.x*6.2831853,b=seed.y*6.2831853,r=seed.z;vec3 p;
      if(preset<.5){float radius=1.28+.32*sin(5.*a+time)+.2*cos(3.*b-time);p=vec3((radius+.5*cos(b))*cos(a),(radius+.5*cos(b))*sin(a),.63*sin(b)+.18*sin(a*4.+time));tint=mix(vec3(.1,.35,.03),vec3(.8,1.,.45),r);}
      else if(preset<1.5){float angle=a+time*.2,rad=.55+r*1.65;p=vec3(cos(angle)*rad,sin(angle)*rad*.38+sin(b+time)*.13,sin(angle)*rad*.7+cos(b)*.13);tint=mix(vec3(.2,.05,.6),vec3(.8,.6,1.),r);}
      else {float u=(r-.5)*5.;p=vec3(u,.62*sin(u*1.7+time+b*.13)+sin(a)*.27,.65*cos(u*1.4-time)+cos(a)*.35);tint=mix(vec3(.7,.1,.01),vec3(1.,.8,.3),r);}
      vec4 mv=modelViewMatrix*vec4(p*spread,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(12.*pixelRatio/-mv.z,1.,6.);}`,
    fragmentShader: `varying vec3 tint;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(tint,pow(1.-d*2.,1.5)*.85);}`});
  const points = new T.Points(geometry, material);points.frustumCulled=false;scene.add(points);
  const ribbons = new T.Group();scene.add(ribbons);
  const ribbonUniforms = {time:{value:0},spread:{value:1},steer:{value:new T.Vector2()}};
  for(let i=0;i<4;i++){
    const g=new T.PlaneGeometry(1,1,160,8);
    const m=new T.ShaderMaterial({side:T.DoubleSide,transparent:true,depthWrite:false,blending:T.AdditiveBlending,
      uniforms:{...ribbonUniforms,band:{value:i}},
      vertexShader:`uniform float time,band,spread;varying vec2 vUv;varying float depth;
      void main(){vUv=uv;float u=(uv.x-.5)*5.8;float a=u*.85+time*.3+band*.9;float w=(uv.y-.5)*.44;vec3 p=vec3(u,sin(a)*.9+w*cos(a*1.5)+(band-1.5)*.23,cos(a)*.65+w*sin(a*1.5)+(band-1.5)*.28);depth=p.z;gl_Position=projectionMatrix*modelViewMatrix*vec4(p*spread,1.);}`,
      fragmentShader:`uniform float band;uniform vec2 steer;varying vec2 vUv;varying float depth;
      void main(){float edge=pow(abs(vUv.y-.5)*2.,5.);float end=sin(vUv.x*3.1415926);vec3 c=mix(vec3(.08,.28,.2),vec3(.6,1.,.45),edge);if(band>1.5)c=mix(vec3(.06,.14,.32),vec3(.4,.78,1.),edge);float light=.75+.2*sin(depth*2.+steer.x*2.);gl_FragColor=vec4(c*light,(.18+edge*.65)*end);}`});
    ribbons.add(new T.Mesh(g,m));
  }
  let frame=0,last=performance.now(),time=0,disposed=false,slowFrames=0;
  const resize=()=>{const {width,height}=host.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/Math.max(1,height);camera.updateProjectionMatrix();};
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  function animate(now){if(disposed)return;frame=requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.05);last=now;if(document.hidden)return;
    const s=settings.current;if(!s.paused)time+=dt*s.speed;
    // Sustained slow frames trigger a one-way resolution reduction per session.
    slowFrames=dt>1/40?slowFrames+1:Math.max(0,slowFrames-1);
    if(slowFrames>90&&renderer.getPixelRatio()>1){renderer.setPixelRatio(1);uniforms.pixelRatio.value=1;resize();slowFrames=0;}
    uniforms.time.value=time;uniforms.preset.value=s.preset;uniforms.spread.value=s.spread;
    ribbonUniforms.time.value=time;ribbonUniforms.spread.value=s.spread;ribbonUniforms.steer.value.set(input.current.x,input.current.y);
    points.visible=s.preset<3;ribbons.visible=s.preset===3;
    tilt.update(s,input.current,time,dt);
    camera.position.x=damp(camera.position.x,input.current.x*s.sensitivity*.5,dt);camera.position.y=damp(camera.position.y,input.current.y*s.sensitivity*.35,dt);camera.lookAt(0,0,0);
    points.rotation.y=damp(points.rotation.y,input.current.x*.4,dt);points.rotation.z=time*.06;
    renderer.render(scene,camera);
  }
  frame=requestAnimationFrame(animate);
  return {renderer,dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();tilt.dispose();geometry.dispose();material.dispose();for(const mesh of ribbons.children){mesh.geometry.dispose();mesh.material.dispose();}renderer.dispose();renderer.domElement.remove();}};
}
