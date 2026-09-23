import type { CropId, Plot, GameState } from './types';
export type { CropId, Plot, Farm, Tractor, GameState } from './types';
/** Pure, event-driven simulation, shared independently of React. */
export const CROPS = [
  { id: 'tomato', name: 'Domates', emoji: '🍅', unlockCost: 0, basePrice: 10, baseDuration: 8, color: '#ed765e', description: 'Bir küçük fide, kocaman bir hayal.' },
  { id: 'pepper', name: 'Biber', emoji: '🫑', unlockCost: 2500, basePrice: 55, baseDuration: 10, color: '#79a75a', description: 'Bereketli vadide yeni bir başlangıç.' },
  { id: 'strawberry', name: 'Çilek', emoji: '🍓', unlockCost: 60000, basePrice: 260, baseDuration: 12, color: '#d96f8b', description: 'Tatlı hasatlar, daha büyük hayaller.' },
  { id: 'honey', name: 'Arıcılık', emoji: '🍯', unlockCost: 1200000, basePrice: 1800, baseDuration: 15, color: '#d7a943', description: 'Çiçekli tepelerden altın gibi bal.' },
] as const;
export const MAX_PLOTS = 36;
const MAX = 1e300, MAX_LEVEL = 1000, OFFLINE_CAP = 28800, EPS = 1e-9;
const clamp = (n:number, max=MAX) => Number.isNaN(n) ? 0 : Math.min(max, Math.max(0,n));
const data = (id:CropId) => CROPS.find(c => c.id === id)!;
const freshPlot = ():Plot => ({level:1,progress:0,ready:0,waiting:0,worker:false,workerPhase:'idle',workerProgress:0,carrying:0});
const copy = (s:GameState):GameState => ({...s, tractor:{...s.tractor},truck:{...s.truck},farms:Object.fromEntries(CROPS.map(({id})=>[id,{...s.farms[id],plots:s.farms[id].plots.map(p=>({...p}))}])) as GameState['farms']});
export function createGame():GameState {
  return {version:3,coins:100,totalEarned:0,totalSold:0,selectedCrop:'tomato',lastSaved:Date.now(),elapsed:0,tractor:{capacityLevel:1,speedLevel:1,phase:'loading',progress:0,cargo:0,cargoValue:0,cropId:'tomato',plotIndex:0},truck:{phase:'loading',progress:0,cargo:0,cargoValue:0,level:1},farms:Object.fromEntries(CROPS.map(({id})=>[id,{unlocked:id==='tomato',plots:id==='tomato'?[freshPlot()]:[],stock:0}])) as GameState['farms']};
}
export const plotYield = (s:GameState,id:CropId,index:number) => Math.floor(clamp(10*1.35**index*1.15**((s.farms[id].plots[index]?.level??1)-1)));
export const plotCost = (s:GameState,id:CropId) => Math.ceil(clamp(data(id).basePrice*18*1.65**Math.max(0,s.farms[id].plots.length-1)));
export const upgradeCost = (s:GameState,id:CropId,index:number) => Math.ceil(clamp(data(id).basePrice*6*1.35**index*1.23**((s.farms[id].plots[index]?.level??1)-1)));
export const workerCost = (_s:GameState,id:CropId,index:number) => Math.ceil(clamp(data(id).basePrice*15*1.5**index));
export const tractorCapacity = (s:GameState) => Math.floor(clamp(30*1.65**(s.tractor.capacityLevel-1)));
export const tractorDuration = (s:GameState) => Math.max(1,5*0.88**(s.tractor.speedLevel-1));
export const tractorUpgradeCost = (s:GameState,kind:'capacity'|'speed') => Math.ceil(clamp((kind==='capacity'?180:240)*1.8**(s.tractor[kind==='capacity'?'capacityLevel':'speedLevel']-1)));
/** Theoretical production value; transport capacity and manual harvesting can lower actual sales. */
export const productionRate = (s:GameState,id:CropId) => s.farms[id].unlocked ? clamp(s.farms[id].plots.reduce((sum,p,i)=>sum+plotYield(s,id,i)*data(id).basePrice/(data(id).baseDuration+(p.worker?2:0)),0)) : 0;
export function addPlot(s:GameState,id:CropId):GameState {
  const f=s.farms[id],cost=plotCost(s,id); if(!f.unlocked||f.plots.length>=MAX_PLOTS||s.coins<cost)return s;
  const n=copy(s);n.coins-=cost;n.farms[id].plots.push(freshPlot());return n;
}
export function upgrade(s:GameState,id:CropId,index:number):GameState {
  const p=s.farms[id].plots[index],cost=upgradeCost(s,id,index);if(!s.farms[id].unlocked||!p||p.level>=MAX_LEVEL||s.coins<cost)return s;
  const n=copy(s);n.coins-=cost;n.farms[id].plots[index].level++;return n;
}
export function hireWorker(s:GameState,id:CropId,index:number):GameState {
  const p=s.farms[id].plots[index],cost=workerCost(s,id,index);if(!s.farms[id].unlocked||!p||p.worker||s.coins<cost)return s;
  const n=copy(s);n.coins-=cost;n.farms[id].plots[index].worker=true;return n;
}
export function harvestPlot(s:GameState,id:CropId,index:number):GameState {
  const p=s.farms[id].plots[index];if(!s.farms[id].unlocked||!p||p.ready<=0||p.workerPhase==='harvesting')return s;
  const n=copy(s),q=n.farms[id].plots[index];q.waiting=clamp(q.waiting+q.ready);q.ready=0;q.progress=0;return n;
}
export function upgradeTractor(s:GameState,kind:'capacity'|'speed'):GameState {
  const key=kind==='capacity'?'capacityLevel':'speedLevel',cost=tractorUpgradeCost(s,kind);
  if(s.coins<cost||s.tractor[key]>=(kind==='speed'?14:MAX_LEVEL))return s;
  const n=copy(s);n.coins-=cost;n.tractor[key]++;return n;
}
export function unlockCrop(s:GameState,id:CropId):GameState {
  const index=CROPS.findIndex(c=>c.id===id);
  if(s.farms[id].unlocked||s.coins<data(id).unlockCost||(index>0&&!s.farms[CROPS[index-1].id].unlocked))return s;
  const n=copy(s);n.coins-=data(id).unlockCost;n.farms[id].unlocked=true;n.farms[id].plots=[freshPlot()];n.selectedCrop=id;return n;
}
export const truckCapacity = (s:GameState) => Math.floor(60*1.7**(s.truck.level-1));
export const truckUpgradeCost = (s:GameState) => Math.ceil(300*1.8**(s.truck.level-1));
export function upgradeTruck(s:GameState):GameState { if(s.coins<truckUpgradeCost(s)||s.truck.level>=100)return s;const n=copy(s);n.coins-=truckUpgradeCost(s);n.truck.level++;return n; }
function nextPickup(s:GameState) {
  const slots=CROPS.flatMap(({id})=>s.farms[id].unlocked?s.farms[id].plots.map((p,index)=>({id,index,p})):[]);
  const current=slots.findIndex(p=>p.id===s.tractor.cropId&&p.index===s.tractor.plotIndex);
  for(let offset=1;offset<=slots.length;offset++) {
    const slot=slots[(Math.max(0,current)+offset)%slots.length];
    if(slot.p.waiting>EPS||slot.p.carrying>EPS||slot.p.workerPhase==='harvesting')return slot;
  }
  return null;
}
/** Farmers load at their own plot. Tractor delivers to warehouse; only truck sales earn coins. */
function settle(s:GameState) {
  for(const {id} of CROPS){const f=s.farms[id];if(!f.unlocked)continue;
    f.plots.forEach((p,i)=>{
      if(p.ready===0&&p.progress>=1-EPS){p.ready=plotYield(s,id,i);p.progress=1;}
      if(p.worker&&p.workerPhase!=='idle'&&p.workerProgress>=1-EPS){
        if(p.workerPhase==='harvesting'){p.workerProgress=0;p.carrying=p.ready;p.ready=0;p.progress=0;p.workerPhase='carrying';}
        else if(p.workerPhase==='carrying'){p.waiting=clamp(p.waiting+p.carrying);p.carrying=0;p.workerProgress=0;p.workerPhase='returning';}
        else if(p.workerPhase==='returning'){p.workerProgress=0;p.workerPhase='idle';}
      }
      if(p.worker&&p.workerPhase==='idle'&&p.ready>0){p.workerPhase='harvesting';p.workerProgress=0;}
    });
  }
  const t=s.tractor;
  if(t.progress>=1-EPS){
    t.progress=0;
    if(t.phase==='loading')t.phase='outbound';
    else if(t.phase==='outbound'){
      s.farms[t.cropId].stock=clamp(s.farms[t.cropId].stock+t.cargo);t.cargo=0;t.cargoValue=0;t.phase='returning';
      const next=nextPickup(s);if(next){t.cropId=next.id;t.plotIndex=next.index;}
    }
    else t.phase='loading';
  }
  if(t.phase==='loading'){
    const p=s.farms[t.cropId].plots[t.plotIndex];
    let room=Math.max(0,tractorCapacity(s)-t.cargo);
    const manual=Math.min(p.waiting,room);p.waiting-=manual;room-=manual;t.cargo+=manual;
    if(p.workerPhase==='carrying'&&p.workerProgress>=1-EPS&&room>EPS){
      const take=Math.min(p.carrying,room);p.carrying-=take;t.cargo+=take;
      if(p.carrying<=EPS){p.carrying=0;p.workerPhase='returning';p.workerProgress=0;}
    }
    t.cargoValue=t.cargo*data(t.cropId).basePrice;
    if(t.cargo===0&&!(p.workerPhase==='carrying'||p.workerPhase==='harvesting')){
      const next=nextPickup(s);if(next&&(next.id!==t.cropId||next.index!==t.plotIndex)){t.phase='outbound';t.progress=0;}
    }
  }
  const truck=s.truck;
  if(truck.progress>=1-EPS){
    truck.progress=0;
    if(truck.phase==='loading')truck.phase='outbound';
    else if(truck.phase==='outbound'){s.coins=clamp(s.coins+truck.cargoValue);s.totalEarned=clamp(s.totalEarned+truck.cargoValue);s.totalSold=clamp(s.totalSold+truck.cargo);truck.cargo=0;truck.cargoValue=0;truck.phase='returning';}
    else truck.phase='loading';
  }
  if(truck.phase==='loading'){
    let waiting=CROPS.filter(({id})=>s.farms[id].unlocked&&s.farms[id].stock>0);
    let room=Math.max(0,truckCapacity(s)-truck.cargo);
    while(waiting.length&&room>EPS){
      const share=room/waiting.length;
      for(const {id,basePrice} of waiting){
        const f=s.farms[id],take=Math.min(f.stock,share);
        f.stock-=take;truck.cargo=clamp(truck.cargo+take);truck.cargoValue=clamp(truck.cargoValue+take*basePrice);room-=take;
      }
      waiting=waiting.filter(({id})=>s.farms[id].stock>EPS);
    }
  }
}
export function tick(state:GameState,seconds:number):GameState {
  if(!Number.isFinite(seconds)||seconds<=0)return state;
  const n=copy(state);let left=Math.min(seconds,OFFLINE_CAP);n.elapsed=clamp(n.elapsed+left);settle(n);
  while(left>EPS){
    let step=left;
    for(const {id,baseDuration} of CROPS){const f=n.farms[id];if(!f.unlocked)continue;
      for(const p of f.plots){if(p.ready===0)step=Math.min(step,(1-p.progress)*baseDuration);if(p.worker&&p.workerPhase!=='idle'&&p.workerProgress<1-EPS)step=Math.min(step,(1-p.workerProgress)*2);}
    }
    const t=n.tractor,travel=t.phase==='loading'?2:tractorDuration(n),moving=t.phase!=='loading'||t.cargo>0;
    if(moving)step=Math.min(step,(1-t.progress)*travel);
    const truck=n.truck,truckMoving=truck.phase!=='loading'||truck.cargo>0,truckDuration=truck.phase==='loading'?2:6;
    if(truckMoving)step=Math.min(step,(1-truck.progress)*truckDuration);
    if(step<=0)break;
    for(const {id,baseDuration} of CROPS){const f=n.farms[id];if(!f.unlocked)continue;
      for(const p of f.plots){if(p.ready===0)p.progress=Math.min(1,p.progress+step/baseDuration);if(p.worker&&p.workerPhase!=='idle')p.workerProgress=Math.min(1,p.workerProgress+step/2);}
    }
    if(moving)t.progress=Math.min(1,t.progress+step/travel);
    if(truckMoving)truck.progress=Math.min(1,truck.progress+step/truckDuration);
    left-=step;settle(n);
  }
  return n;
}
function letters(index:number):string {let result='';for(let v=index+1;v>0;v=Math.floor((v-1)/26))result=String.fromCharCode(97+(v-1)%26)+result;return result;}
export function formatNumber(value:number):string {
  if(!Number.isFinite(value))return value===Infinity?'∞':'0';const sign=value<0?'−':'',absolute=Math.abs(value);
  if(absolute<1000)return sign+Math.floor(absolute).toLocaleString('tr-TR');
  let tier=Math.floor(Math.log10(absolute)/3),scaled=absolute/10**(tier*3);
  if(Number(scaled.toFixed(scaled<10?2:1))>=1000){tier++;scaled/=1000;}
  return sign+scaled.toLocaleString('tr-TR',{maximumFractionDigits:scaled<10?2:1})+(tier<=4?['','K','M','B','T'][tier]:letters(tier-5));
}
export function serializeGame(state:GameState):string {return JSON.stringify({...state,version:3,lastSaved:Date.now()});}
const number=(v:unknown,fallback:number,max=MAX)=>typeof v==='number'&&Number.isFinite(v)&&v>=0?Math.min(v,max):fallback;
const record=(v:unknown):v is Record<string,unknown>=>typeof v==='object'&&v!==null&&!Array.isArray(v);
function readPlot(v:unknown):Plot {
  const p=freshPlot();if(!record(v))return p;
  p.level=Math.max(1,Math.floor(number(v.level,1,MAX_LEVEL)));p.progress=number(v.progress,0,1);p.ready=number(v.ready,0);p.worker=v.worker===true;
  if(p.worker&&['harvesting','carrying','returning'].includes(String(v.workerPhase)))p.workerPhase=v.workerPhase as Plot['workerPhase'];
  p.workerProgress=number(v.workerProgress,0,1);p.carrying=p.workerPhase==='carrying'?number(v.carrying,0):0;
  p.waiting=number(v.waiting,0);
  if(p.ready>0)p.progress=1;
  if(p.workerPhase==='harvesting'&&p.ready===0)p.workerPhase='idle';
  return p;
}
export function loadGame(raw:string|null):GameState {
  const fresh=createGame();if(!raw)return fresh;
  try{
    const v:unknown=JSON.parse(raw);if(!record(v)||![1,2,3].includes(Number(v.version))||!record(v.farms))return fresh;
    const n=copy(fresh);n.coins=number(v.coins,100);n.totalEarned=number(v.totalEarned,0);n.totalSold=number(v.totalSold,0);n.elapsed=number(v.elapsed,0);
    let previous=true;
    for(const {id}of CROPS){const f=v.farms[id];const unlocked:boolean=id==='tomato'||(previous&&record(f)&&f.unlocked===true);previous=unlocked;if(!unlocked||!record(f))continue;
      let plots:Plot[];
      if(v.version===1){const count=Math.max(1,Math.min(MAX_PLOTS,Math.ceil(number(f.level,1,MAX_LEVEL)/4),Math.max(1,number(f.workers,0,MAX_PLOTS))));plots=Array.from({length:count},(_,i)=>({...freshPlot(),level:Math.max(1,Math.ceil(number(f.level,1,MAX_LEVEL)/count)),worker:i<number(f.workers,0,MAX_PLOTS)}));}
      else plots=Array.isArray(f.plots)&&f.plots.length?f.plots.slice(0,MAX_PLOTS).map(readPlot):[freshPlot()];
      n.farms[id]={unlocked:true,plots,stock:number(f.stock,0)};
    }
    if(record(v.tractor)){
      const t=v.tractor;n.tractor.capacityLevel=Math.max(1,Math.floor(number(t.capacityLevel,1,MAX_LEVEL)));n.tractor.speedLevel=Math.max(1,Math.floor(number(t.speedLevel,1,14)));
      if(v.version===3){
        const id=CROPS.find(c=>c.id===t.cropId&&n.farms[c.id].unlocked)?.id??'tomato';
        n.tractor={...n.tractor,cropId:id,plotIndex:Math.floor(number(t.plotIndex,0,n.farms[id].plots.length-1)),phase:t.phase==='outbound'||t.phase==='returning'?t.phase:'loading',progress:number(t.progress,0,1),cargo:number(t.cargo,0,tractorCapacity(n)),cargoValue:0};
        if(n.tractor.phase==='returning')n.tractor.cargo=0;n.tractor.cargoValue=n.tractor.cargo*data(id).basePrice;
      }else if(number(t.cargo,0)>0){n.truck={...n.truck,cargo:number(t.cargo,0),cargoValue:number(t.cargoValue,0)};}
    }
    if(v.version===3&&record(v.truck)){const t=v.truck;n.truck={level:Math.max(1,Math.floor(number(t.level,1,100))),phase:t.phase==='outbound'||t.phase==='returning'?t.phase:'loading',progress:number(t.progress,0,1),cargo:number(t.cargo,0),cargoValue:number(t.cargoValue,0)};if(n.truck.phase==='returning'||n.truck.cargo===0){n.truck.cargo=0;n.truck.cargoValue=0;}}
    if(CROPS.some(({id})=>id===v.selectedCrop&&n.farms[id].unlocked))n.selectedCrop=v.selectedCrop as CropId;
    return {...tick(n,clamp((Date.now()-number(v.lastSaved,Date.now()))/1000,OFFLINE_CAP)),lastSaved:Date.now()};
  }catch{return fresh;}
}
