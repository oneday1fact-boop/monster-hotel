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
/** Five horizontal positions and three real projection depths; saved v1 boards migrate in the scene. */
export type ShadowBoard=number[];
export const shadowTarget=[12,2,10];
export const freshShadow=()=>[0,0,0];
export function validShadow(s:unknown):s is ShadowBoard{return Array.isArray(s)&&s.length===3&&s.every(n=>Number.isInteger(n)&&n>=0&&n<15);}
export function shadowProjection(prop:number,value:number){return {x:18+(value%5)*15+(prop-1)*4,y:57+Math.floor(value/5)*4.5,scale:1.5-Math.floor(value/5)*.25};}
export const shadowSolved=(s:ShadowBoard)=>validShadow(s)&&s.every((n,i)=>n===shadowTarget[i]);
export type BounceConfig={direction:number;power:number;pillows:number[]};
export const freshBounce=():BounceConfig=>({direction:1,power:1,pillows:[0,0]});
export function validBounce(v:unknown):v is BounceConfig{const s=v as BounceConfig;return !!s&&Number.isInteger(s.direction)&&s.direction>=0&&s.direction<6&&Number.isInteger(s.power)&&s.power>=0&&s.power<3&&Array.isArray(s.pillows)&&s.pillows.length===2&&s.pillows.every(n=>Number.isInteger(n)&&n>=0&&n<3);}
export const bouncePads=[{x:210,y:220},{x:370,y:220}];
export const bounceBells=[{x:280,y:145},{x:455,y:165}];
export const bounceBasket={x:540,y:275};
export type BallFrame={x:number;y:number;mask:number;pad:number};
export const bounceRadius=9;
export const bounceHalfWidth=48;
export const bouncePadAngle=(setting:number)=>-25+setting*15;
/** Specular reflection in the cushion's visible normal. No aiming at a hidden destination or resetting speed. */
export function reflectBounce(vx:number,vy:number,angle:number){const a=angle*Math.PI/180,nx=Math.sin(a),ny=-Math.cos(a),vn=vx*nx+vy*ny;return {vx:vx-2*vn*nx,vy:vy-2*vn*ny};}
/** Fixed 120Hz swept surface contact. Artwork and physics share the same angle, width and radius. */
export function simulateBounce(s:BounceConfig):{frames:BallFrame[];won:boolean;mask:number}{
 if(!validBounce(s))return {frames:[],won:false,mask:0};
 const angle=(-64+s.direction*6)*Math.PI/180,speed=230+s.power*15,dt=1/120;let x=55,y=255,vx=Math.cos(angle)*speed,vy=Math.sin(angle)*speed,mask=0,padMask=0;const frames:BallFrame[]=[];
 for(let i=0;i<1200;i++){
  const oldX=x,oldY=y;vy+=250*dt;x+=vx*dt;y+=vy*dt;let pad=-1;
  for(let j=0;j<2;j++){const p=bouncePads[j],a=bouncePadAngle(s.pillows[j])*Math.PI/180,tx=Math.cos(a),ty=Math.sin(a),nx=ty,ny=-tx;
   const before=(oldX-p.x)*nx+(oldY-p.y)*ny,dist=(x-p.x)*nx+(y-p.y)*ny,along=(x-p.x)*tx+(y-p.y)*ty,vn=vx*nx+vy*ny;
   if(before>=bounceRadius&&dist<=bounceRadius&&Math.abs(along)<bounceHalfWidth&&vn<0){x+=nx*(bounceRadius-dist);y+=ny*(bounceRadius-dist);({vx,vy}=reflectBounce(vx,vy,bouncePadAngle(s.pillows[j])));pad=j;padMask|=1<<j;}
  }
  bounceBells.forEach((b,j)=>{if(Math.hypot(x-b.x,y-b.y)<34)mask|=1<<j;});frames.push({x,y,mask,pad});
  // Catch only while crossing the visible basket mouth downwards, never on a near pass.
  if(vy>0&&oldY<bounceBasket.y-6&&y>=bounceBasket.y-6&&Math.abs(x-bounceBasket.x)<40)return {frames,won:mask===3&&padMask===3,mask};
  if(y>335||x>615||x<0)break;
 }
 return {frames,won:false,mask};
}
