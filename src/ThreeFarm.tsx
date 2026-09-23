import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import type {GameState} from './types';
import {CROPS,formatNumber,plotCost,plotYield,upgradeCost,workerCost,tractorCapacity,tractorDuration,tractorUpgradeCost,truckCapacity,truckUpgradeCost} from './game';
import {DEPOT,parcelLayout,routeToDepot,pointOnRoute} from './layout';
import {createBarn,createTractor,createTruck,createFarmer,createPlant,createCrates,createTree} from './threeModels';
import './ThreeFarm.css';

type Props={game:GameState;onHarvest:(i:number)=>void;onUpgrade:(i:number)=>void;onHire:(i:number)=>void;onExpand:()=>void;onTractorUpgrade:(kind:'capacity'|'speed')=>void;onTruckUpgrade:()=>void};
type SceneApi={zoom:(factor:number)=>void;home:()=>void;focus:(index:number)=>void};
const vec=(p:{x:number;y:number},height=0)=>new THREE.Vector3(p.x/40,height,p.y/40);
export default function ThreeFarm(props:Props){
 const {game}=props,farm=game.farms[game.selectedCrop],crop=CROPS.find(c=>c.id===game.selectedCrop)!;
 const [selected,setSelected]=useState<number|null>(null),[error,setError]=useState(''),[fleetOpen,setFleetOpen]=useState(false);
 const mount=useRef<HTMLDivElement>(null),labels=useRef(new Map<number,HTMLDivElement>()),panel=useRef<HTMLDivElement>(null),fleetAnchor=useRef<HTMLDivElement>(null);
 const api=useRef<SceneApi|null>(null),live=useRef(props),selection=useRef(selected);live.current=props;selection.current=selected;
 useEffect(()=>{
  const host=mount.current;if(!host)return;
  let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch{setError('3D sahne açılamadı. Tarayıcıda donanım hızlandırmasını açıp sayfayı yenile.');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.setClearColor('#b9d59b');renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  renderer.domElement.setAttribute('aria-label','3D çiftlik sahnesi');host.appendChild(renderer.domElement);
  const scene=new THREE.Scene();scene.background=new THREE.Color('#b9d59b');
  const hemi=new THREE.HemisphereLight('#fffae3','#63864d',2.4);scene.add(hemi);
  const sun=new THREE.DirectionalLight('#fff0cd',3.2);sun.position.set(7,30,12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-45;sun.shadow.camera.right=45;sun.shadow.camera.top=35;sun.shadow.camera.bottom=-35;sun.shadow.normalBias=.025;sun.shadow.bias=-.0003;scene.add(sun);
  const camera=new THREE.OrthographicCamera(-25,25,15,-15,.1,350);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.12;controls.screenSpacePanning=false;controls.minZoom=.35;controls.maxZoom=3.8;controls.minPolarAngle=.35;controls.maxPolarAngle=1.22;controls.mouseButtons={LEFT:THREE.MOUSE.PAN,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.ROTATE};controls.touches={ONE:THREE.TOUCH.PAN,TWO:THREE.TOUCH.DOLLY_ROTATE};
  const initialFocus=Math.min(18,10+Math.floor(farm.plots.length/2)*1.8);
  const home=()=>{controls.target.set(initialFocus,0,12.6);camera.position.set(initialFocus+8,25,36);camera.zoom=1;camera.updateProjectionMatrix();controls.update();};home();
  api.current={zoom:factor=>{camera.zoom=THREE.MathUtils.clamp(camera.zoom*factor,.35,3.8);camera.updateProjectionMatrix();},home,focus:index=>{const p=parcelLayout(index),delta=new THREE.Vector3(p.x/40+2,0,15).sub(controls.target);camera.position.add(delta);controls.target.add(delta);controls.update();}};
  const materials=new Map<string,THREE.MeshStandardMaterial>();
  const material=(color:string)=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.94,flatShading:true}));return materials.get(color)!;};
  const box=(w:number,h:number,d:number,x:number,y:number,z:number,color:string,parent:THREE.Object3D=scene)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
  const end=Math.max(34,parcelLayout(Math.min(35,farm.plots.length)).x/40+9);
  box(end+24,.5,44,(end-8)/2,-.4,13,'#a9c97e');
  // One shared field road; both rows use the same collection stop per column.
  box(end-4,.12,1.8,(end+4)/2,.005,15,'#d8bf8d');box(1.8,.12,11,4,.006,9.5,'#d8bf8d');box(end-4,.12,1.9,(end+4)/2,.007,4,'#d8bf8d');
  for(let x=5;x<end;x+=1.6){box(.55,.012,.055,x,.075,15,'#f4e0b5');box(.55,.012,.055,x,.077,4,'#f4e0b5');}
  for(let z=5;z<15;z+=1.6)box(.055,.012,.55,4,.078,z,'#f4e0b5');
  const barn=createBarn();barn.position.set(3.1,.08,.9);scene.add(barn);
  for(let i=0;i<Math.ceil(end/5);i++){const tree=createTree();tree.position.set(i*5-1,.02,i%2?-2.8:27);tree.scale.setScalar(.85+(i%3)*.12);scene.add(tree);}
  const pond=new THREE.Mesh(new THREE.CylinderGeometry(2.3,2.5,.05,32),material('#77babe'));pond.scale.z=.68;pond.position.set(-1,.03,10);pond.receiveShadow=true;scene.add(pond);
  const flowerMat=material('#f0d27c');for(let i=0;i<35;i++){const flower=new THREE.Mesh(new THREE.IcosahedronGeometry(.055,0),flowerMat);flower.position.set(-3+(i*1.91)%7,.1,18+(i*1.37)%6);scene.add(flower);}
  const plantTemplate=createPlant(crop.color,crop.id==='honey');
 const plantBatches=plantTemplate.children.map(child=>{const m=child as THREE.Mesh;m.updateMatrix();const batch=new THREE.InstancedMesh(m.geometry,m.material,farm.plots.length*16);batch.castShadow=true;batch.receiveShadow=true;batch.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(batch);return batch;});
 const dummy=new THREE.Object3D(),plantMatrix=new THREE.Matrix4();
 const fields:THREE.Group[]=[],plants:THREE.Vector3[][]=[],farmers:THREE.Group[]=[],crates:THREE.Group[]=[],pickables:THREE.Object3D[]=[];
  const selectedOutline=new THREE.Mesh(new THREE.BoxGeometry(4.35,.06,4.35),new THREE.MeshBasicMaterial({color:'#f6dc84',transparent:true,opacity:.8}));selectedOutline.visible=false;scene.add(selectedOutline);
  for(let i=0;i<farm.plots.length;i++){
   const p=parcelLayout(i),group=new THREE.Group();group.position.set(p.x/40,0,p.y/40);scene.add(group);fields.push(group);
   const border=box(4.1,.26,4.1,2,.1,2,'#bc9c6b',group);border.userData.plot=i;pickables.push(border);
   const patchPlants:THREE.Vector3[]=[];
   for(let r=0;r<2;r++)for(let c=0;c<2;c++){
    const soil=box(1.87,.16,1.87,c*2+1,.3,r*2+1,'#806043',group);soil.userData.plot=i;pickables.push(soil);
    for(let n=0;n<3;n++)box(1.68,.03,.075,c*2+1,.395,r*2+.45+n*.55,'#a2784d',group);
    for(let u=0;u<4;u++){patchPlants.push(new THREE.Vector3(p.x/40+c*2+.5+(u%2),.4,p.y/40+r*2+.5+Math.floor(u/2)));}
   }
   plants.push(patchPlants);
   const worker=createFarmer();scene.add(worker);farmers.push(worker);
   const crate=createCrates(crop.color);crate.position.copy(vec(p.crate,.1));scene.add(crate);crates.push(crate);
   // A short path links the crate dock to the field without crossing the road.
   const edge=p.lower?p.y/40:p.y/40+4,cz=p.crate.y/40;
   box(.8,.025,Math.abs(edge-cz),p.crate.x/40,.025,(edge+cz)/2,'#cfc38e');
  }
  const ghostIndex=farm.plots.length;
  if(ghostIndex<36){const p=parcelLayout(ghostIndex);const ghost=box(4.1,.09,4.1,p.x/40+2,.015,p.y/40+2,'#c9da9e');ghost.userData.plot=ghostIndex;pickables.push(ghost);for(let j=0;j<4;j++){box(.14,.25,.14,p.x/40+(j%2)*4,.2,p.y/40+Math.floor(j/2)*4,'#f2e5b1');}}
  const tractor=createTractor(),truck=createTruck();scene.add(tractor,truck);
  const cargo=createCrates(crop.color);cargo.scale.setScalar(.55);tractor.add(cargo);cargo.position.set(-.65,.63,0);
  const vector=new THREE.Vector3(),raycaster=new THREE.Raycaster();let down={x:0,y:0};
  const pointerDown=(e:PointerEvent)=>{down={x:e.clientX,y:e.clientY}};
  const pointerUp=(e:PointerEvent)=>{if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>5||e.button!==0)return;const b=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1),camera);const hit=raycaster.intersectObjects(pickables,false)[0];if(hit){const i=hit.object.userData.plot as number;if(i===live.current.game.farms[live.current.game.selectedCrop].plots.length)live.current.onExpand();else setSelected(s=>s===i?null:i);}};
  renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',pointerUp);
  const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);const half=15.3;camera.left=-half*w/h;camera.right=half*w/h;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();};
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const anchor=(el:HTMLElement|null|undefined,x:number,y:number,z:number,clampPanel=false)=>{if(!el)return;vector.set(x,y,z).project(camera);const w=host.clientWidth,h=host.clientHeight;let sx=(vector.x+1)*w/2,sy=(1-vector.y)*h/2;const visible=vector.z<1&&sx>-50&&sx<w+50&&sy>70&&sy<h-90;el.style.visibility=visible||clampPanel?'visible':'hidden';if(clampPanel){sx=THREE.MathUtils.clamp(sx,125,w-125);sy=THREE.MathUtils.clamp(sy,140,h-160);}el.style.transform=`translate(${sx}px,${sy}px) translate(-50%,-100%)`;};
  let raf=0,lastFrame=0;
  const frame=(time=0)=>{
   if(time-lastFrame<33){raf=requestAnimationFrame(frame);return;}lastFrame=time;
   const s=live.current.game,f=s.farms[s.selectedCrop];controls.update();
   for(let i=0;i<fields.length;i++){
    const p=parcelLayout(i),plot=f.plots[i];if(!plot)continue;
    plants[i].forEach((position,j)=>{dummy.position.copy(position);dummy.scale.setScalar(.3+.7*(plot.ready?1:plot.progress));dummy.updateMatrix();plantBatches.forEach((batch,k)=>{plantMatrix.multiplyMatrices(dummy.matrix,plantTemplate.children[k].matrix);batch.setMatrixAt(i*16+j,plantMatrix);});});
    crates[i].scale.setScalar(plot.waiting>0?1:.65);
    const worker=farmers[i];worker.visible=plot.worker;const basket=worker.getObjectByName('basket');if(basket)basket.visible=plot.carrying>0;
    const v=plot.workerPhase==='carrying'?plot.workerProgress:plot.workerPhase==='returning'?1-plot.workerProgress:0;
    const path=[{x:p.x+80,y:p.y+80},{x:p.x+190,y:p.y+80},{x:p.x+190,y:p.crate.y},p.crate];const at=pointOnRoute(path,v),next=pointOnRoute(path,Math.min(1,v+.01));worker.position.copy(vec(at,.35+(reduced?0:Math.abs(Math.sin(s.elapsed*10))*.035)));
    if(v>0&&v<1)worker.rotation.y=-Math.atan2(next.y-at.y,next.x-at.x)+(plot.workerPhase==='returning'?Math.PI:0);
    anchor(labels.current.get(i),p.x/40+2,.65,p.lower?p.y/40+4.8:p.y/40-.4);
   }
   if(ghostIndex<36){const p=parcelLayout(ghostIndex);anchor(labels.current.get(ghostIndex),p.x/40+2,.3,p.y/40+2.8);}
   const si=selection.current;if(si!==null&&f.plots[si]){const p=parcelLayout(si);selectedOutline.visible=true;selectedOutline.position.set(p.x/40+2,.03,p.y/40+2);anchor(panel.current,p.x/40+2,3,p.y/40+1,true);}else selectedOutline.visible=false;
   anchor(fleetAnchor.current,3.1,3.5,1);
   const t=s.tractor,r=routeToDepot(t.plotIndex),u=t.phase==='outbound'?t.progress:t.phase==='returning'?1-t.progress:0;
   const at=pointOnRoute(r,u),next=pointOnRoute(r,Math.min(1,u+.01));tractor.position.copy(vec(at,.12));tractor.visible=t.cropId===s.selectedCrop;tractor.rotation.y=-Math.atan2(next.y-at.y,next.x-at.x)+(t.phase==='returning'?Math.PI:0);cargo.visible=t.cargo>0;
   const v=s.truck.phase==='outbound'?s.truck.progress:s.truck.phase==='returning'?1-s.truck.progress:0;truck.position.set(DEPOT.x/40+3+v*(end-9),.13,DEPOT.y/40);truck.rotation.y=s.truck.phase==='returning'?Math.PI:0;
   plantBatches.forEach(batch=>{batch.instanceMatrix.needsUpdate=true;batch.computeBoundingSphere();});renderer.render(scene,camera);raf=requestAnimationFrame(frame);
  };frame();
  return ()=>{cancelAnimationFrame(raf);observer.disconnect();controls.dispose();renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointerup',pointerUp);const geometries=new Set<THREE.BufferGeometry>(),mats=new Set<THREE.Material>();scene.traverse(o=>{if(o instanceof THREE.Mesh){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>mats.add(m));}});geometries.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();api.current=null;};
 },[farm.plots.length,crop.id]);
 const plot=selected===null?null:farm.plots[selected];
 return <div className="three-farm"><div ref={mount} className="three-canvas"/>{error&&<div className="three-error">{error}</div>}
  <div className="three-labels">{farm.plots.map((p,i)=><div key={i} className={`three-label ${selected===i?'chosen':''}`} ref={el=>{if(el)labels.current.set(i,el);else labels.current.delete(i);}}><button onClick={()=>setSelected(s=>s===i?null:i)} aria-label={`Parsel ${i+1} yönet`}>Parsel {i+1} <span>Sv. {p.level}</span><small>{formatNumber(p.waiting)} ürün kolide {p.worker?'· 👨‍🌾':''}</small></button></div>)}{farm.plots.length<36&&<div className="three-label expand-label" ref={el=>{if(el)labels.current.set(farm.plots.length,el);}}><button onClick={props.onExpand} disabled={game.coins<plotCost(game,crop.id)}>＋ Yeni parsel<small>{formatNumber(plotCost(game,crop.id))} altın</small></button></div>}
   <div className="three-label barn-label" ref={fleetAnchor}><button onClick={()=>setFleetOpen(v=>!v)}>▥ Depo & araçlar<small>{formatNumber(CROPS.reduce((n,c)=>n+game.farms[c.id].stock,0))} ürün</small></button></div>
   {plot&&selected!==null&&<div ref={panel} className="three-plot-panel"><button className="three-close" aria-label="Parsel kontrolünü kapat" onClick={()=>setSelected(null)}>×</button><strong>Parsel {selected+1} <span>2 × 2 · Seviye {plot.level}</span></strong><div className="three-growth"><i style={{width:`${plot.progress*100}%`}}/></div><button className="three-harvest" disabled={!plot.ready||plot.workerPhase==='harvesting'} onClick={()=>props.onHarvest(selected)}>{plot.ready?`Hasat et · ${formatNumber(plot.ready)} ürün`:`Büyüyor · ${formatNumber(plotYield(game,crop.id,selected))} ürün`}</button><div className="three-action-row"><button disabled={plot.level>=1000||game.coins<upgradeCost(game,crop.id,selected)} onClick={()=>props.onUpgrade(selected)}>↑ Geliştir<small>{formatNumber(upgradeCost(game,crop.id,selected))} altın</small></button>{plot.worker?<div>✓ Çiftçi<small>Otomatik topluyor</small></div>:<button disabled={game.coins<workerCost(game,crop.id,selected)} onClick={()=>props.onHire(selected)}>＋ Çiftçi<small>{formatNumber(workerCost(game,crop.id,selected))} altın</small></button>}</div></div>}
  </div>
  {fleetOpen&&<section className="three-fleet"><button className="three-close" aria-label="Araç kontrolünü kapat" onClick={()=>setFleetOpen(false)}>×</button><h3>Depo & araçlar</h3><p>Traktör iki sıranın kolilerini aynı durakta toplar.</p><button disabled={game.coins<tractorUpgradeCost(game,'capacity')||game.tractor.capacityLevel>=1000} onClick={()=>props.onTractorUpgrade('capacity')}>Traktör kasası · {formatNumber(tractorCapacity(game))}<small>↑ {formatNumber(tractorUpgradeCost(game,'capacity'))} altın</small></button><button disabled={game.coins<tractorUpgradeCost(game,'speed')||game.tractor.speedLevel>=14} onClick={()=>props.onTractorUpgrade('speed')}>Traktör hızı · {tractorDuration(game).toFixed(1)} sn<small>↑ {formatNumber(tractorUpgradeCost(game,'speed'))} altın</small></button><button disabled={game.coins<truckUpgradeCost(game)||game.truck.level>=100} onClick={props.onTruckUpgrade}>Kamyon kasası · {formatNumber(truckCapacity(game))}<small>↑ {formatNumber(truckUpgradeCost(game))} altın</small></button><small>Traktör şu an: {CROPS.find(c=>c.id===game.tractor.cropId)?.name}</small></section>}
  <div className="three-camera"><button aria-label="Depo ve araçları yönet" onClick={()=>setFleetOpen(v=>!v)}>▥</button><button aria-label="Sola kaydır" onClick={()=>api.current?.focus(Math.max(0,(selected??0)-2))}>←</button><button aria-label="Uzaklaştır" onClick={()=>api.current?.zoom(.8)}>−</button><button aria-label="Başlangıç görünümü" onClick={()=>api.current?.home()}>⌖</button><button aria-label="Yakınlaştır" onClick={()=>api.current?.zoom(1.25)}>＋</button><button aria-label="Yeni alana git" onClick={()=>api.current?.focus(Math.min(35,farm.plots.length))}>→</button></div><span className="three-hint">3D · Sürükle: kaydır · Sağ tuş: döndür · Tekerlek: yakınlaştır</span>
 </div>;
}
