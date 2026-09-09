import {damp} from './motion.mjs';

/** Procedural materials, not scanned or physically measured fabric. */
export function createTiltStudio(T, scene) {
  const group=new T.Group();scene.add(group);group.position.set(.65,-.15,0);
  const shape=new T.Shape(),w=1.35,h=1.7,r=.22;
  shape.moveTo(-w+r,-h);shape.lineTo(w-r,-h);shape.quadraticCurveTo(w,-h,w,-h+r);
  shape.lineTo(w,h-r);shape.quadraticCurveTo(w,h,w-r,h);shape.lineTo(-w+r,h);
  shape.quadraticCurveTo(-w,h,-w,h-r);shape.lineTo(-w,-h+r);shape.quadraticCurveTo(-w,-h,-w+r,-h);
  const geometry=new T.ExtrudeGeometry(shape,{depth:.065,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:.045,bevelThickness:.04,curveSegments:16});
  const bytes=new Uint8Array(64*64*4);
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){const i=(y*64+x)*4;bytes[i]=x%2?145:110;bytes[i+1]=y%2?140:115;bytes[i+2]=250;bytes[i+3]=255;}
  const weave=new T.DataTexture(bytes,64,64,T.RGBAFormat);weave.wrapS=weave.wrapT=T.RepeatWrapping;weave.repeat.set(12,12);weave.needsUpdate=true;
  const materials=[
    new T.MeshPhysicalMaterial({color:'#96ad69',roughness:.48,sheen:1,sheenColor:'#e9ffc5',sheenRoughness:.35,normalMap:weave,normalScale:new T.Vector2(.15,.15)}),
    new T.MeshPhysicalMaterial({color:'#a1b8cb',roughness:.2,metalness:.2,iridescence:1,iridescenceIOR:1.5,iridescenceThicknessRange:[100,500],clearcoat:1}),
    new T.MeshPhysicalMaterial({color:'#c4d0c0',roughness:.32,retroreflectivity:1,metalness:.05}),
  ];
  const card=new T.Mesh(geometry,materials[0]);group.add(card);
  const trim=new T.Mesh(new T.TorusGeometry(.18,.018,8,48),new T.MeshStandardMaterial({color:'#e6edd8',metalness:.25,roughness:.3}));trim.position.set(.91,-1.2,.13);group.add(trim);
  const lights=new T.Group();scene.add(lights);
  lights.add(new T.HemisphereLight('#f5f7ff','#686756',2.5));
  const key=new T.PointLight('#fff5df',100,30,2);key.position.set(1.8,2.5,4);lights.add(key);
  const rim=new T.DirectionalLight('#c7d9ff',3);rim.position.set(-3,1,-2);lights.add(rim);
  return {
    update(s,input,time,dt){
      const active=s.preset===4;group.visible=lights.visible=active;if(!active)return;
      card.material=materials[s.finish??0];
      group.scale.setScalar(s.spread);
      group.rotation.x=damp(group.rotation.x,-.08-input.y*.18,dt);
      group.rotation.y=damp(group.rotation.y,-.25+input.x*.32,dt);
      group.rotation.z=Math.sin(time*.6)*.035;
      key.position.x=1.8+(s.light??0)*3;
    },
    dispose(){geometry.dispose();materials.forEach(m=>m.dispose());weave.dispose();trim.geometry.dispose();trim.material.dispose();scene.remove(group,lights);},
  };
}
