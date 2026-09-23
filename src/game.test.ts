import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame,tick,harvestPlot,hireWorker,addPlot,upgrade,upgradeCost,unlockCrop,upgradeTractor,tractorCapacity,tractorDuration,loadGame,serializeGame,formatNumber,CROPS } from './game.ts';
import { parcelLayout,routeToDepot,pointOnRoute,DEPOT } from './layout.ts';

test('manual harvest waits at plot; tractor depot delivery earns nothing; truck sale pays',()=>{
 const start=createGame(),grown=tick(start,100);assert.equal(grown.farms.tomato.plots[0].ready,10);assert.equal(start.farms.tomato.plots[0].ready,0);
 const picked=harvestPlot(grown,'tomato',0);assert.equal(picked.coins,100);assert.equal(picked.farms.tomato.plots[0].waiting,10);assert.equal(picked.farms.tomato.stock,0);
 const outbound=tick(picked,2);assert.equal(outbound.tractor.phase,'outbound');assert.equal(outbound.coins,100);
 const depot=tick(outbound,5);assert.equal(depot.coins,100);assert.equal(depot.totalSold,0);assert.equal(depot.truck.cargo,10);assert.equal(depot.tractor.phase,'returning');
 const sold=tick(depot,8);assert.equal(sold.coins,200);assert.equal(sold.totalSold,10);assert.equal(sold.truck.phase,'returning');
});
test('worker really harvests, carries, deposits and returns',()=>{
 const hired=hireWorker({...createGame(),coins:1000},'tomato',0);
 const harvesting=tick(hired,8);assert.equal(harvesting.farms.tomato.plots[0].workerPhase,'harvesting');
 const carrying=tick(harvesting,2);assert.equal(carrying.farms.tomato.plots[0].carrying,10);assert.equal(carrying.farms.tomato.plots[0].workerPhase,'carrying');assert.equal(carrying.totalSold,0);
 const deposited=tick(carrying,2);assert.equal(deposited.farms.tomato.plots[0].workerPhase,'returning');assert.equal(deposited.tractor.cargo,10);
 assert.equal(tick(deposited,2).farms.tomato.plots[0].workerPhase,'idle');
 assert.equal(tick(deposited,7).totalSold,0);
 assert.equal(tick(deposited,15).totalSold,10);
});
test('partial loads and mixed crops conserve inventory and value',()=>{
 let s=unlockCrop({...createGame(),coins:1e6},'pepper');s.farms.tomato.plots[0].waiting=47;s.farms.pepper.plots[0].waiting=23;
 const budget=s.coins;
 const first=tick(s,7);assert.equal(first.totalSold,0);assert.equal(first.truck.cargo,30);assert.equal(first.truck.cargo+first.farms.tomato.plots[0].waiting+first.farms.pepper.plots[0].waiting,70);
 const finished=tick(s,200);assert.equal(finished.totalSold,70);assert.equal(finished.coins-budget,47*10+23*55);assert.equal(finished.farms.tomato.stock+finished.farms.pepper.stock+finished.tractor.cargo+finished.truck.cargo,0);
});
test('split frames and one long tick agree on all gameplay state',()=>{
 let s=hireWorker({...createGame(),coins:1e6},'tomato',0);s=addPlot(s,'tomato');s=hireWorker(s,'tomato',1);
 const whole=tick(s,123.45);let split=s;for(let i=0;i<12345;i++)split=tick(split,0.01);
 assert.equal(split.coins,whole.coins);assert.equal(split.totalSold,whole.totalSold);assert.equal(split.tractor.phase,whole.tractor.phase);assert.ok(Math.abs(split.tractor.progress-whole.tractor.progress)<1e-7);
 for(let i=0;i<2;i++){const a=split.farms.tomato.plots[i],b=whole.farms.tomato.plots[i];assert.equal(a.ready,b.ready);assert.equal(a.workerPhase,b.workerPhase);assert.ok(Math.abs(a.progress-b.progress)<1e-7);assert.ok(Math.abs(a.workerProgress-b.workerProgress)<1e-7);}
});
test('spending, sequential regions, plot and tractor upgrades',()=>{
 const initial=createGame(),better=upgrade(initial,'tomato',0);assert.equal(better.coins,100-upgradeCost(initial,'tomato',0));assert.equal(better.farms.tomato.plots[0].level,2);
 const rich={...initial,coins:1e9};assert.equal(unlockCrop(rich,'strawberry'),rich);const opened=unlockCrop(rich,'pepper');assert.equal(opened.farms.pepper.plots.length,1);assert.equal(unlockCrop(opened,'pepper'),opened);
 assert.equal(addPlot(rich,'tomato').farms.tomato.plots.length,2);assert.ok(tractorCapacity(upgradeTractor(rich,'capacity'))>tractorCapacity(rich));assert.ok(tractorDuration(upgradeTractor(rich,'speed'))<tractorDuration(rich));
});
test('offline cap, malformed state and version1 migration',()=>{
 const s=hireWorker({...createGame(),coins:1000},'tomato',0),payload=JSON.parse(serializeGame(s));payload.lastSaved=Date.now()-86400000;
 const loaded=loadGame(JSON.stringify(payload));assert.equal(loaded.elapsed,28800);assert.equal(loaded.totalSold,tick(s,28800).totalSold);
 assert.equal(loadGame('{bad').coins,100);payload.coins=-12;payload.farms.tomato.plots[0].level='bad';payload.lastSaved=Date.now()+100000;
 assert.equal(loadGame(JSON.stringify(payload)).coins,100);assert.equal(loadGame(JSON.stringify(payload)).farms.tomato.plots[0].level,1);
 const legacy=loadGame(JSON.stringify({version:1,coins:420,lastSaved:Date.now()+10000,farms:{tomato:{unlocked:true,level:8,workers:2,stock:19},pepper:{unlocked:true,level:1,workers:0,stock:7}}}));
 assert.equal(legacy.coins,420);assert.equal(legacy.farms.tomato.stock,19);assert.equal(legacy.farms.tomato.plots.length,2);assert.ok(legacy.farms.tomato.plots.every(p=>p.worker));assert.equal(legacy.farms.pepper.stock,7);
});
test('8h simulation of 144 workers remains practical and finite',()=>{
 let s={...createGame(),coins:1e100};for(const {id}of CROPS){s=unlockCrop(s,id);for(let i=1;i<36;i++)s=addPlot(s,id);for(let i=0;i<36;i++)s=hireWorker(s,id,i);}
 const before=performance.now(),done=tick(s,28800),ms=performance.now()-before;console.log(`144 workers / 8h: ${Math.round(ms)}ms`);assert.ok(ms<5000);assert.ok(Number.isFinite(done.coins));assert.ok(done.totalSold>0);
});
test('idle suffix sequence and rounding',()=>{for(const [n,v]of [[1e3,'1K'],[1e6,'1M'],[1e9,'1B'],[1e12,'1T'],[1e15,'1a'],[1e90,'1z'],[1e93,'1aa'],[999999,'1M']] as const)assert.equal(formatNumber(n),v);});

test('one stop shares limited tractor space across both sides and preserves value',()=>{
 let s=addPlot({...createGame(),coins:1000},'tomato');
 s.farms.tomato.plots[0].waiting=40;s.farms.tomato.plots[1].waiting=50;
 const loaded=tick(s,1);
 assert.equal(loaded.tractor.cargo,30);assert.equal(loaded.tractor.cargoValue,300);
 assert.equal(loaded.farms.tomato.plots[0].waiting,25);assert.equal(loaded.farms.tomato.plots[1].waiting,35);
 const sold=tick(s,100);assert.equal(sold.totalSold,90);assert.equal(sold.coins-s.coins,900);
 s.farms.tomato.plots[0].waiting=3;s.farms.tomato.plots[1].waiting=50;
 const redistributed=tick(s,1);assert.equal(redistributed.tractor.cargo,30);
 assert.equal(redistributed.farms.tomato.plots[0].waiting,0);assert.equal(redistributed.farms.tomato.plots[1].waiting,23);
});

test('tractor rotates by column and handles a lower-side legacy stop',()=>{
 let s={...createGame(),coins:10000};for(let i=1;i<4;i++)s=addPlot(s,'tomato');
 for(const p of s.farms.tomato.plots)p.waiting=100;
 s.tractor.plotIndex=1;
 const delivered=tick(s,7);assert.equal(delivered.tractor.plotIndex,2);
 assert.equal(delivered.farms.tomato.plots[0].waiting,85);assert.equal(delivered.farms.tomato.plots[1].waiting,85);
 const nextLoaded=tick(delivered,5);assert.equal(nextLoaded.farms.tomato.plots[2].waiting,85);assert.equal(nextLoaded.farms.tomato.plots[3].waiting,85);
});

test('36 parcels stay in two rows and extend horizontally along one road',()=>{
 const plots=Array.from({length:36},(_,i)=>parcelLayout(i));
 assert.equal(new Set(plots.map(p=>p.y)).size,2);assert.equal(new Set(plots.map(p=>p.roadY)).size,1);
 for(let i=0;i<plots.length;i+=2){assert.equal(plots[i].x,plots[i+1].x);assert.deepEqual(plots[i].stop,plots[i+1].stop);if(i>0)assert.ok(plots[i].x>plots[i-2].x);}
 assert.ok(plots[34].x>plots[6].x);
});

test('all 36 parcels reserve disjoint drawing/control footprints and orthogonal roads',()=>{
 const plots=Array.from({length:36},(_,i)=>parcelLayout(i));
 for(let i=0;i<plots.length;i++){
  const p=plots[i],route=routeToDepot(i);assert.deepEqual(pointOnRoute(route,0),p.stop);assert.deepEqual(pointOnRoute(route,1),DEPOT);
  for(let j=1;j<route.length;j++)assert.ok(route[j].x===route[j-1].x||route[j].y===route[j-1].y);
  for(let j=i+1;j<plots.length;j++){const q=plots[j];assert.ok(p.x+180<=q.x-20||q.x+180<=p.x-20||p.y+213<=q.y-85||q.y+213<=p.y-85,`parcel ${i} overlaps ${j}`);}
 }
});

test('farmer leaves crates even when tractor is elsewhere; old version2 cargo survives',()=>{
 let s=unlockCrop({...createGame(),coins:1e6},'pepper');s=hireWorker(s,'tomato',0);s.tractor.cropId='pepper';s.tractor.phase='outbound';
 const grown=tick(s,12);assert.ok(grown.farms.tomato.plots[0].waiting>0||grown.tractor.cargo>0);assert.equal(grown.farms.tomato.plots[0].workerPhase,'returning');
 const v2=JSON.parse(serializeGame(createGame()));v2.version=2;delete v2.truck;v2.tractor.cargo=7;v2.tractor.cargoValue=70;v2.lastSaved=Date.now()+10000;
 const migrated=loadGame(JSON.stringify(v2));assert.equal(migrated.version,3);assert.equal(migrated.truck.cargoValue,70);assert.equal(migrated.coins,100);
});
