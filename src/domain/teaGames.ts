/** Fixed-step, offline rules for the afternoon-tea chapters. No Phaser/DOM dependencies. */
export const honeyRows=['######','#..gg#','#..#.#','#.$$.#','#@...#','######'] as const;
export const honeyFloor=honeyRows.flatMap((row,r)=>Array.from(row,(v,c)=>v==='#'?-1:r*6+c)).filter(n=>n>=0);
export const honeyGoals=[9,10];
export const teaDirections=['up','right','down','left'] as const;
export type TeaDirection=typeof teaDirections[number];
export type HoneyPosition={at:number;pots:number[]};
export type HoneyState=HoneyPosition&{history:HoneyPosition[]};
export const freshHoney=():HoneyState=>({at:25,pots:[20,21],history:[]});
function validPosition(v:unknown):v is HoneyPosition{const s=v as HoneyPosition;return !!s&&honeyFloor.includes(s.at)&&Array.isArray(s.pots)&&s.pots.length===2&&new Set(s.pots).size===2&&s.pots.every(n=>honeyFloor.includes(n)&&n!==s.at);}
export function stepHoney(s:HoneyPosition,d:TeaDirection):HoneyPosition{
 if(!validPosition(s)||!teaDirections.includes(d))return {at:s.at,pots:[...s.pots]};
 const delta=[-6,1,6,-1][teaDirections.indexOf(d)],at=s.at+delta,pots=[...s.pots];
 if(!honeyFloor.includes(at))return {at:s.at,pots};
 const i=pots.indexOf(at);if(i>=0){if(!honeyFloor.includes(at+delta)||pots.includes(at+delta))return {at:s.at,pots};pots[i]=at+delta;}
 return {at,pots};
}
export const honeySolved=(s:HoneyPosition)=>validPosition(s)&&honeyGoals.every(n=>s.pots.includes(n));
export function validHoney(v:unknown):v is HoneyState{const s=v as HoneyState;if(!validPosition(s)||!Array.isArray(s.history)||s.history.length>512||!s.history.every(validPosition))return false;let next:HoneyPosition=s;for(let i=s.history.length-1;i>=0;i--){const old=s.history[i];if(!teaDirections.some(d=>JSON.stringify(stepHoney(old,d))===JSON.stringify({at:next.at,pots:next.pots})))return false;next=old;}return true;}
export function honeyHint(s:HoneyPosition):TeaDirection|undefined{
 if(!validPosition(s)||honeySolved(s))return;const queue=[{...s,first:undefined as TeaDirection|undefined}],key=(s:HoneyPosition)=>`${s.at}:${[...s.pots].sort((a,b)=>a-b)}`,seen=new Set([key(s)]);
 for(let i=0;i<queue.length;i++)for(const d of teaDirections){const n=stepHoney(queue[i],d),first=queue[i].first??d;if(honeySolved(n))return first;const k=key(n);if(!seen.has(k)){seen.add(k);queue.push({...n,first});}}
}
/** Each prop has 3 horizontal snaps and 2 depth tracks. Targets are rendered from these same projections. */
export type ShadowBoard=number[];
export const shadowTarget=[4,1,3];
export const freshShadow=()=>[0,0,0];
export function validShadow(s:unknown):s is ShadowBoard{return Array.isArray(s)&&s.length===3&&s.every(n=>Number.isInteger(n)&&n>=0&&n<6);}
export function shadowProjection(prop:number,value:number){return {x:18+(value%3)*30+(prop-1)*4,y:64+(Math.floor(value/3)?2:-7),scale:Math.floor(value/3)?1:1.5};}
export const shadowSolved=(s:ShadowBoard)=>validShadow(s)&&s.every((n,i)=>n===shadowTarget[i]);
export type BounceConfig={direction:number;power:number;pillows:number[]};
export const freshBounce=():BounceConfig=>({direction:1,power:1,pillows:[0,0]});
export function validBounce(v:unknown):v is BounceConfig{const s=v as BounceConfig;return !!s&&Number.isInteger(s.direction)&&s.direction>=0&&s.direction<6&&Number.isInteger(s.power)&&s.power>=0&&s.power<3&&Array.isArray(s.pillows)&&s.pillows.length===2&&s.pillows.every(n=>Number.isInteger(n)&&n>=0&&n<3);}
export const bouncePads=[{x:210,y:220},{x:370,y:220}];
export const bounceBells=[{x:280,y:210},{x:455,y:245}];
export const bounceBasket={x:540,y:275};
export type BallFrame={x:number;y:number;mask:number;pad:number};
/** Fixed 120Hz integration; presentation samples the returned trajectory, never changes its outcome. */
export function simulateBounce(s:BounceConfig):{frames:BallFrame[];won:boolean;mask:number}{
 if(!validBounce(s))return {frames:[],won:false,mask:0};
 const angle=(-64+s.direction*6)*Math.PI/180,speed=220+s.power*35,dt=1/120;let x=55,y=255,vx=Math.cos(angle)*speed,vy=Math.sin(angle)*speed,mask=0,padMask=0,cooldown=0;const frames:BallFrame[]=[];
 for(let i=0;i<1200;i++){
  x+=vx*dt;vy+=250*dt;y+=vy*dt;cooldown--;let pad=-1;
  for(let j=0;j<2;j++){const p=bouncePads[j];if(cooldown<=0&&vy>0&&Math.abs(x-p.x)<32&&Math.abs(y-p.y)<10){const a=((j===0?-35:-5)+s.pillows[j]*15)*Math.PI/180;const v=300;vx=Math.cos(a)*v;vy=Math.sin(a)*v;y=p.y-11;cooldown=18;pad=j;padMask|=1<<j;}}
  bounceBells.forEach((b,j)=>{if(Math.hypot(x-b.x,y-b.y)<22)mask|=1<<j;});frames.push({x,y,mask,pad});
  if(vy>0&&Math.abs(x-bounceBasket.x)<27&&Math.abs(y-bounceBasket.y)<18)return {frames,won:mask===3&&padMask===3,mask};
  if(y>335||x>615||x<0)break;
 }
 return {frames,won:false,mask};
}
