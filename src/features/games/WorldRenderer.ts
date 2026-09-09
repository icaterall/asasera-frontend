import * as THREE from 'three'
import {movingBlock,runnerRow,treasureGems,TREASURE_WALLS,TREASURE_MINES,RUNNER_ROW_MS,RUNNER_ROWS,type ArcadeState} from '@/shared/arcade'

/** A disposable game renderer. Game rules live in the shared server contract. */
export function createWorld(canvas:HTMLCanvasElement,read:()=>{state:ArcadeState;now:number;reduced:boolean},onFailure:()=>void){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'})
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0x000000,0)
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,.1,160)
 scene.add(new THREE.HemisphereLight(0xc9edff,0x35472c,2.4))
 const sun=new THREE.DirectionalLight(0xfff0d3,3);sun.position.set(-7,15,8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-14,right:14,top:14,bottom:-14});sun.shadow.bias=-.001;scene.add(sun)
 const resources=new Set<THREE.BufferGeometry|THREE.Material>(),materials=new Map<string,THREE.MeshStandardMaterial>()
 const material=(color:string)=>{let m=materials.get(color);if(!m){m=new THREE.MeshStandardMaterial({color,roughness:.72,metalness:.05});materials.set(color,m);resources.add(m)}return m}
 const boxGeometry=new THREE.BoxGeometry(1,1,1),gemGeometry=new THREE.OctahedronGeometry(.43),rockGeometry=new THREE.DodecahedronGeometry(1,0)
 resources.add(boxGeometry);resources.add(gemGeometry);resources.add(rockGeometry)
 const box=(parent:THREE.Object3D,color:string,x:number,y:number,z:number,w=1,h=1,d=1)=>{const m=new THREE.Mesh(boxGeometry,material(color));m.position.set(x,y,z);m.scale.set(w,h,d);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
 const gem=(parent:THREE.Object3D,x:number,y:number,z:number)=>{const m=new THREE.Mesh(gemGeometry,material('#55e6ff'));m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m}
 const terrain=new THREE.Group(),objects=new THREE.Group(),avatar=new THREE.Group();scene.add(terrain,objects,avatar)
 // The explorer is an articulated toy robot with a visor, backpack and feet.
 box(avatar,'#004ccc',0,.82,0,.62,.65,.43);box(avatar,'#ffcf36',0,1.4,0,.73,.6,.54);box(avatar,'#13364c',0,1.4,.28,.57,.26,.06)
 box(avatar,'#ffffff',-.16,1.43,.32,.09,.09,.03);box(avatar,'#ffffff',.16,1.43,.32,.09,.09,.03)
 box(avatar,'#ffcf36',-.45,.8,0,.18,.53,.22);box(avatar,'#ffcf36',.45,.8,0,.18,.53,.22)
 const feet=[box(avatar,'#f5f8ff',-.2,.25,.08,.26,.5,.4),box(avatar,'#f5f8ff',.2,.25,.08,.26,.5,.4)]
 box(avatar,'#14bf96',0,.87,-.3,.45,.47,.2)
 const tree=(x:number,z:number,scale=1)=>{const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);terrain.add(g);box(g,'#866342',0,1.3,0,.35,2.6,.35);for(let i=0;i<3;i++){const leaf=new THREE.Mesh(rockGeometry,material(i%2?'#38a75d':'#247b49'));leaf.scale.set(1.2-i*.18,.7,1.1-i*.15);leaf.position.y=2.3+i*.45;g.add(leaf)}}
 const initial=read().state,mode=initial.mode
 let runnerObjects:{mesh:THREE.Object3D;row:number;kind:string}[]=[],blocks:THREE.Mesh[]=[],moving:THREE.Mesh|null=null,crystals:Map<number,THREE.Mesh>=new Map(),chest:THREE.Group|null=null
 if(mode==='runner'){
  box(terrain,'#a88754',0,-.27,-12,8,.5,48)
  for(const x of [-2.8,0,2.8])for(let z=-32;z<=8;z+=4)box(terrain,'#d7b475',x,-.005,z,.05,.035,1.8)
  for(let i=0;i<20;i++){tree((i%2?-1:1)*(5.2+i%3),-i*2.3,1+(i%4)*.15)}
  runnerObjects=Array.from({length:RUNNER_ROWS},(_,row)=>{const item=runnerRow(initial.seed,row);const mesh=item.kind==='gem'?gem(objects,(item.lane-1)*2.8,.85,0):box(objects,'#986237',(item.lane-1)*2.8,.45,0,1.8,.8,.7);if(item.kind==='obstacle'){box(mesh,'#d7b475',-.44,0,0,.06,.85,1.05);box(mesh,'#d7b475',.44,0,0,.06,.85,1.05)}return {mesh,row,kind:item.kind}})
  camera.position.set(0,7.5,13);camera.lookAt(0,.2,-9)
 }else if(mode==='tower'){
  avatar.visible=false;box(terrain,'#5793c0',0,-.7,0,7,1.2,7);box(terrain,'#d7f2ff',0,-.03,0,7.15,.15,7.15)
  const island=new THREE.Mesh(rockGeometry,material('#94b5c8'));island.scale.set(4,3,4);island.position.y=-2;terrain.add(island)
  for(let i=0;i<9;i++){const cloud=new THREE.Mesh(rockGeometry,material('#f4fbff'));cloud.scale.set(2+i%2,.7,1.7);cloud.position.set((i%2?-1:1)*(5+i%3),-1+i%3,-8+i*1.7);terrain.add(cloud)}
  moving=box(objects,'#ffcf36',0,1,0,2.8,.62,2.8)
  camera.position.set(10,9,12);camera.lookAt(0,1.8,0)
 }else{
  box(terrain,'#b68a58',0,-.6,0,14.5,1.2,14.5)
  for(let z=0;z<7;z++)for(let x=0;x<7;x++){const tile=z*7+x;box(terrain,(x+z)%2?'#78b965':'#8bc77a',(x-3)*1.9,0,(z-3)*1.9,1.84,.2,1.84);if(TREASURE_WALLS.includes(tile))tree((x-3)*1.9,(z-3)*1.9,.78);if(TREASURE_MINES.includes(tile)){box(terrain,'#b51a3b',(x-3)*1.9,.2,(z-3)*1.9,1.3,.2,1.3);const spike=gem(terrain,(x-3)*1.9,.48,(z-3)*1.9);spike.material=material('#ff9b9f');spike.scale.setScalar(.7)}}
  for(const tile of treasureGems(initial.seed))crystals.set(tile,gem(objects,(tile%7-3)*1.9,.7,(Math.floor(tile/7)-3)*1.9))
  chest=new THREE.Group();chest.position.set(0,.3,-5.7);objects.add(chest);box(chest,'#b37022',0,.32,0,1.3,.7,.9);box(chest,'#ffcf36',0,.75,0,1.4,.25,1);box(chest,'#ffe9a1',0,.43,.49,.2,.3,.08)
  camera.position.set(0,17,13);camera.lookAt(0,0,0)
 }
 const resize=()=>{const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=mode==='treasure'?(w/h<1?65:45):(w/h<1?58:42);camera.updateProjectionMatrix()}
 const observer=new ResizeObserver(resize);observer.observe(canvas);resize()
 let disposed=false,last=performance.now(),visible=true,slowFrames=0,qualityReduced=false
 const intersection=new IntersectionObserver(([e])=>{visible=e?.isIntersecting??true});intersection.observe(canvas)
 const lost=(e:Event)=>{e.preventDefault();onFailure()};canvas.addEventListener('webglcontextlost',lost)
 renderer.setAnimationLoop(()=>{
  if(disposed||document.hidden||!visible)return
  const {state:s,now,reduced}=read(),dt=Math.min(.1,(performance.now()-last)/1000);last=performance.now()
  if(dt>.035)slowFrames++;else slowFrames=Math.max(0,slowFrames-1)
  if(slowFrames>40&&!qualityReduced){qualityReduced=true;renderer.setPixelRatio(1);renderer.shadowMap.enabled=false;resize()}
  const active=now>=s.startedAt&&!s.finished
  if(mode==='runner'){
   const target=(s.x-1)*2.8;avatar.position.x=THREE.MathUtils.damp(avatar.position.x,target,18,dt)
   const jump=now-s.jumpAt;avatar.position.y=jump>=0&&jump<850?Math.sin(jump/850*Math.PI)*2:0
   feet.forEach((foot,i)=>foot.rotation.x=active&&!reduced?Math.sin(now/90+i*Math.PI)*.55:0)
   runnerObjects.forEach(({mesh,row,kind})=>{mesh.position.z=(Math.max(0,Math.min(now,s.endsAt)-s.startedAt)/RUNNER_ROW_MS-(row+2))*5;mesh.visible=row>s.lastRow&&mesh.position.z<3&&mesh.position.z>-42;if(kind==='gem'&&!reduced)mesh.rotation.y=now/650})
  }else if(mode==='tower'){
   while(blocks.length<s.blocks.length){const index=blocks.length;blocks.push(box(objects,['#1368ce','#14bf96','#faab31','#f27575'][index%4]!,0,0,0))}
   s.blocks.forEach((b,i)=>{const mesh=blocks[i]!;mesh.position.set(b.x,.35+i*.65,b.z);mesh.scale.set(b.w,.62,b.d)})
   if(moving){const b=movingBlock(s,now);moving.visible=!s.finished&&s.power>0;moving.position.set(b.x,.35+s.blocks.length*.65,b.z);moving.scale.set(b.w,.62,b.d)}
   const height=s.blocks.length*.65;camera.position.y=THREE.MathUtils.damp(camera.position.y,9+height*.35,5,dt);camera.lookAt(0,1+height*.4,0)
  }else{
   avatar.scale.setScalar(.8);avatar.position.x=THREE.MathUtils.damp(avatar.position.x,(s.x-3)*1.9,18,dt);avatar.position.z=THREE.MathUtils.damp(avatar.position.z,(s.z-3)*1.9,18,dt);avatar.position.y=.1
   for(const [tile,mesh]of crystals){mesh.visible=!s.collected.includes(tile);if(!reduced){mesh.rotation.y=now/850;mesh.position.y=.75+Math.sin(now/500+tile)*.08}}
   if(chest&&s.event==='chest')chest.rotation.y=reduced?0:Math.sin(now/250)*.1
  }
  if(s.event==='hit'&&now-s.eventAt<450&&!reduced)avatar.rotation.z=Math.sin(now/30)*.08;else avatar.rotation.z=0
  renderer.render(scene,camera)
  canvas.dataset.ready='true'
 })
 return ()=>{disposed=true;observer.disconnect();intersection.disconnect();canvas.removeEventListener('webglcontextlost',lost);renderer.setAnimationLoop(null);for(const resource of resources)resource.dispose();renderer.dispose();renderer.forceContextLoss();scene.clear()}
}
