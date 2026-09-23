import * as THREE from 'three';
const mat=(color:string)=>new THREE.MeshStandardMaterial({color,roughness:.85,flatShading:true});
function mesh(g:THREE.BufferGeometry,color:string,x:number,y:number,z:number,parent:THREE.Object3D){const m=new THREE.Mesh(g,mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
const box=(p:THREE.Object3D,c:string,w:number,h:number,d:number,x=0,y=0,z=0)=>mesh(new THREE.BoxGeometry(w,h,d),c,x,y,z,p);
const ball=(p:THREE.Object3D,c:string,r:number,x=0,y=0,z=0)=>mesh(new THREE.IcosahedronGeometry(r,1),c,x,y,z,p);
const cyl=(p:THREE.Object3D,c:string,r:number,h:number,x=0,y=0,z=0)=>mesh(new THREE.CylinderGeometry(r,r,h,12),c,x,y,z,p);
export function createBarn(){
 const g=new THREE.Group();box(g,'#ead8ae',3.5,1.8,2.8,0,.9,0);box(g,'#c6b68e',3.7,.18,3,0,.08,0);
 // Triangular prism roof with true pitched geometry.
 const roof=new THREE.Shape();roof.moveTo(-1.95,0);roof.lineTo(0,1.2);roof.lineTo(1.95,0);roof.closePath();const geometry=new THREE.ExtrudeGeometry(roof,{depth:3.15,bevelEnabled:false});const m=mesh(geometry,'#bf7955',0,1.8,-1.575,g);m.castShadow=true;
 box(g,'#8b7356',.95,1.35,.08,0,.75,1.43);box(g,'#e4c99a',.07,1.4,.09,-.5,.76,1.49);box(g,'#e4c99a',.07,1.4,.09,.5,.76,1.49);
 const cross=box(g,'#dbc195',.06,1.6,.05,0,.75,1.51);cross.rotation.z=.6;const cross2=cross.clone();cross2.rotation.z=-.6;g.add(cross2);
 for(const x of [-1.15,1.15]){box(g,'#fff0cc',.6,.65,.08,x,1.1,1.43);box(g,'#8eb9b6',.46,.5,.085,x,1.1,1.48);box(g,'#f8e5b8',.045,.5,.09,x,1.1,1.53);}
 box(g,'#ad7250',.38,1,.42,1.1,2.7,-.6);box(g,'#ddac7d',.48,.13,.52,1.1,3.24,-.6);
 const crates=createCrates('#cf7950');crates.position.set(-1.2,.05,2);g.add(crates);return g;
}
function wheel(g:THREE.Group,x:number,z:number,r:number){const tire=cyl(g,'#354a43',r,.19,x,r,z);tire.rotation.x=Math.PI/2;const hub=cyl(g,'#e4d2a2',r*.48,.21,x,r,z);hub.rotation.x=Math.PI/2;}
export function createTractor(){
 const g=new THREE.Group();box(g,'#ddaa4e',1.3,.35,.74,.35,.57,0);box(g,'#e3b650',.65,.7,.66,.05,.99,0);box(g,'#a7d1c7',.38,.49,.69,.07,1.02,0);box(g,'#eacc7e',.85,.12,.85,.03,1.43,0);box(g,'#d09239',.6,.42,.72,.75,.72,0);box(g,'#876740',.08,.55,.08,.74,1.18,.26);box(g,'#6d6550',.12,.15,.12,.74,1.5,.26);box(g,'#65715a',.35,.1,.12,-.58,.4,0);
 for(const z of [-.45,.45]){wheel(g,-.05,z,.36);wheel(g,.78,z,.25);}
 box(g,'#ad7d43',1,.16,.78,-1.15,.45,0);box(g,'#d5a55c',1,.36,.07,-1.15,.66,-.41);box(g,'#d5a55c',1,.36,.07,-1.15,.66,.41);box(g,'#c59651',.07,.36,.86,-1.65,.66,0);for(const z of [-.44,.44])wheel(g,-1.2,z,.24);return g;
}
export function createTruck(){const g=new THREE.Group();box(g,'#5b91a0',2.7,.22,1.08,0,.48,0);box(g,'#eeecd9',1.72,1.12,1.12,-.46,1.08,0);box(g,'#619caa',.8,.9,1.1,.82,.97,0);box(g,'#bedcd2',.065,.44,.85,1.24,1.16,0);box(g,'#bedcd2',.52,.43,.06,.88,1.16,.56);box(g,'#bedcd2',.52,.43,.06,.88,1.16,-.56);for(const z of [-.58,.58]){wheel(g,-.95,z,.3);wheel(g,.88,z,.3);}box(g,'#dde3c8',.12,.14,1.16,1.3,.55,0);return g;}
export function createFarmer(){const g=new THREE.Group();for(const x of [-.12,.12]){box(g,'#4a6670',.16,.3,.18,x,.18,0);box(g,'#645a44',.19,.09,.28,x,.045,.045);}box(g,'#749c87',.42,.4,.27,0,.51,0);ball(g,'#ebc497',.2,0,.88,0);cyl(g,'#e4c783',.33,.06,0,1.04,0);cyl(g,'#efd59a',.2,.17,0,1.13,0);for(const x of [-.27,.27]){const arm=box(g,'#e6b88b',.11,.33,.13,x,.54,0);arm.rotation.z=x>0?-.25:.25;}const basket=box(g,'#b88950',.25,.22,.25,.32,.43,.2);basket.name='basket';return g;}
export function createPlant(color:string,honey:boolean){const g=new THREE.Group();if(honey){box(g,'#dbb66b',.5,.5,.5,0,.28,0);box(g,'#f0d290',.56,.08,.56,0,.57,0);box(g,'#836a3d',.18,.08,.03,0,.19,.26);return g;}cyl(g,'#5f8649',.032,.5,0,.25,0);for(let i=0;i<3;i++){const a=i*Math.PI*2/3;const leaf=ball(g,'#6e9b50',.17,Math.cos(a)*.13,.28+i*.07,Math.sin(a)*.13);leaf.scale.set(1.5,.35,.7);}for(let i=0;i<3;i++){const a=i*2.1;ball(g,color,.12,Math.cos(a)*.15,.25+i*.045,Math.sin(a)*.15);}return g;}
export function createCrates(color:string){const g=new THREE.Group();for(let i=0;i<2;i++){const x=(i-.5)*.55;box(g,'#b6874a',.48,.12,.45,x,.08,0);for(const z of [-.23,.23])box(g,'#cc9c58',.5,.32,.055,x,.24,z);for(const a of [-.24,.24])box(g,'#c39755',.045,.32,.48,x+a,.24,0);for(let j=0;j<3;j++)ball(g,color,.09,x+(j-1)*.11,.35,j%2*.1);}return g;}
export function createTree(){const g=new THREE.Group();cyl(g,'#8e7951',.14,1.2,0,.6,0);ball(g,'#719955',.8,0,1.5,0);ball(g,'#91b36b',.64,-.2,1.92,.05);ball(g,'#a7bf7b',.4,-.3,2.18,.02);return g;}
