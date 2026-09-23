/** Hidden 40px tile grid: buildings, fields, crate stops and roads share these coordinates. */
export const TILE=40;
export const DEPOT={x:4*TILE,y:4*TILE};
export type Point={x:number;y:number};
export function parcelLayout(index:number){
  const pair=0,column=Math.floor(index/2),lower=index%2===1;
  const roadY=15*TILE;
  const x=(8+column*6)*TILE,y=roadY+(lower?4:-7)*TILE;
  return {x,y,width:4*TILE,height:4*TILE,roadY,lower,column,pair,stop:{x:x+2*TILE,y:roadY},crate:{x:x+2*TILE,y:roadY+(lower?1.6:-1.1)*TILE}};
}
export function routeToDepot(index:number):Point[]{const p=parcelLayout(index);return [p.stop,{x:DEPOT.x,y:p.roadY},DEPOT];}
export function pointOnRoute(route:Point[],progress:number):Point{
  const distances=route.slice(1).map((p,i)=>Math.hypot(p.x-route[i].x,p.y-route[i].y));
  let left=Math.max(0,Math.min(1,progress))*distances.reduce((a,b)=>a+b,0),i=0;
  while(i<distances.length-1&&left>distances[i])left-=distances[i++];
  const f=distances[i]?left/distances[i]:0;
  return {x:route[i].x+(route[i+1].x-route[i].x)*f,y:route[i].y+(route[i+1].y-route[i].y)*f};
}
