import type {Save} from '../platform/save';
export const visitorRooms=['moon','hearth','laundry','tea'] as const;
export type VisitorRoom=typeof visitorRooms[number];
export const dispatchWaves:readonly (readonly (readonly VisitorRoom[])[])[]=[
 [['moon'],['hearth'],['laundry'],['tea']],
 [['tea'],['moon'],['laundry'],['hearth'],['moon']],
 [['laundry','moon'],['tea','hearth'],['moon','tea']]
];
export const dispatchNodes={dock:{x:80,y:325},fork:{x:300,y:325},upper:{x:535,y:185},lower:{x:535,y:465},moon:{x:850,y:90},hearth:{x:850,y:255},laundry:{x:850,y:415},tea:{x:850,y:580}} as const;
export type DispatchNode=keyof typeof dispatchNodes;
export interface StarParcel{index:number;stop:number;from:DispatchNode;to:DispatchNode;t:number;phase:'travel'|'return'|'done'}
export interface DispatchState{wave:0|1|2;switches:[number,number,number];parcels:StarParcel[];next:number;spawnIn:number;running:boolean;returns:number}
export interface VisitorEvent{version:1;started:boolean;completed:boolean;resolved:boolean;dispatch:DispatchState}
export const freshDispatch=(wave:0|1|2=0):DispatchState=>({wave,switches:wave===1?[1,0,1]:wave===2?[0,1,0]:[1,1,1],parcels:[],next:0,spawnIn:0,running:false,returns:0});
export const freshVisitor=(completed=false):VisitorEvent=>({version:1,started:false,completed,resolved:false,dispatch:freshDispatch()});
/** Midnight follows both newcomer arrivals; legacy started/completed events remain accessible. */
export function visitorEligible(save:Pick<Save,'completed'|'episodes'|'visitorEvent'>){return save.completed.includes(1)&&(!!save.visitorEvent?.started||!!save.visitorEvent?.completed||(['storm-arrival','clockwork-guest','honey-pots','shadow-tea','pillow-bounce']as const).every(id=>save.episodes?.includes(id)));}
const isNode=(n:unknown):n is DispatchNode=>typeof n==='string'&&n in dispatchNodes;
const room=(n:unknown):n is VisitorRoom=>visitorRooms.includes(n as VisitorRoom);
export function validDispatch(v:unknown):v is DispatchState{const s=v as DispatchState;if(!s||![0,1,2].includes(s.wave)||!Array.isArray(s.switches)||s.switches.length!==3||!s.switches.every(n=>n===0||n===1)||!Number.isInteger(s.next)||s.next<0||s.next>dispatchWaves[s.wave].length||!Array.isArray(s.parcels)||s.parcels.length!==s.next||typeof s.running!=='boolean'||!Number.isFinite(s.spawnIn)||s.spawnIn < -1||s.spawnIn>5||!Number.isSafeInteger(s.returns)||s.returns<0)return false;const ids=new Set<number>();
 for(const p of s.parcels){if(!p||!Number.isInteger(p.index)||p.index<0||p.index>=s.next||ids.has(p.index)||!Number.isInteger(p.stop)||p.stop<0||p.stop>dispatchWaves[s.wave][p.index].length||!isNode(p.from)||!isNode(p.to)||!Number.isFinite(p.t)||p.t<0||p.t>1)return false;ids.add(p.index);if(p.phase==='done'){if(p.stop!==dispatchWaves[s.wave][p.index].length||p.to!==dispatchWaves[s.wave][p.index].at(-1))return false;}else if(p.phase==='return'){if(!room(p.from)||p.to!=='dock'||p.stop>=dispatchWaves[s.wave][p.index].length)return false;}else if(p.phase==='travel'){const targets:Partial<Record<DispatchNode,DispatchNode[]>>={dock:['fork'],fork:['upper','lower'],upper:['moon','hearth'],lower:['laundry','tea']};if(!targets[p.from]?.includes(p.to)||p.stop>=dispatchWaves[s.wave][p.index].length)return false;}else return false;
 }return true;
}
export function readVisitorEvent(v:unknown):VisitorEvent|undefined{const a=v as VisitorEvent;if(!a||a.version!==1||!validDispatch(a.dispatch))return;const s:VisitorEvent={version:1,started:a.started===true,completed:a.completed===true,resolved:false,dispatch:{...a.dispatch,running:false,switches:[...a.dispatch.switches],parcels:a.dispatch.parcels.map(p=>({...p}))}};s.resolved=a.resolved===true&&s.completed&&s.dispatch.wave===2&&dispatchComplete(s.dispatch);return s;}
export const dispatchComplete=(s:DispatchState)=>s.next===dispatchWaves[s.wave].length&&s.parcels.every(p=>p.phase==='done');
export const parcelTarget=(s:DispatchState,p:StarParcel)=>dispatchWaves[s.wave][p.index][p.stop];
export function flipDispatch(s:DispatchState,index:number):DispatchState{if(!Number.isInteger(index)||index<0||index>2)return s;const switches=[...s.switches]as DispatchState['switches'];switches[index]=1-switches[index];return {...s,switches};}
export function parcelPosition(p:StarParcel){const a=dispatchNodes[p.from],b=dispatchNodes[p.to],t=p.t;return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t+(p.phase==='return'?Math.sin(Math.PI*t)*(a.y<325?-100:85):0)};}
export interface DispatchResult{state:DispatchState;checkpoint:boolean;arrived:VisitorRoom[];wrong:boolean}
export function tickDispatch(s:DispatchState,delta:number):DispatchResult{const out:DispatchResult={state:s,checkpoint:false,arrived:[],wrong:false};if(!s.running||!Number.isFinite(delta)||delta<=0||dispatchComplete(s))return out;const dt=Math.min(.1,delta),next:DispatchState={...s,spawnIn:Math.max(-1,s.spawnIn-dt),parcels:s.parcels.map(p=>({...p}))};
 const cap=s.wave===0?1:s.wave===1?2:3;if(next.next<dispatchWaves[s.wave].length&&next.spawnIn<=0&&next.parcels.filter(p=>p.phase!=='done').length<cap){next.parcels.push({index:next.next++,stop:0,from:'dock',to:'fork',t:0,phase:'travel'});next.spawnIn=s.wave===0?3.8:3.2;out.checkpoint=true;}
 for(const p of next.parcels){if(p.phase==='done')continue;const a=dispatchNodes[p.from],b=dispatchNodes[p.to],duration=p.phase==='return'?1.6:Math.hypot(a.x-b.x,a.y-b.y)/145;p.t=Math.min(1,p.t+dt/duration);if(p.t<1)continue;out.checkpoint=true;
  if(p.phase==='return'){p.from='dock';p.to='fork';p.phase='travel';p.t=0;continue;}
  const at=p.to;if(room(at)){if(at===parcelTarget(next,p)){out.arrived.push(at);p.stop++;if(p.stop===dispatchWaves[s.wave][p.index].length){p.phase='done';continue;}}else{next.returns++;out.wrong=true;}p.from=at;p.to='dock';p.phase='return';p.t=0;}
  else{p.from=at;p.to=at==='fork'?(next.switches[0]?'lower':'upper'):at==='upper'?(next.switches[1]?'hearth':'moon'):at==='lower'?(next.switches[2]?'tea':'laundry'):'fork';p.t=0;}
 }
 if(dispatchComplete(next))next.running=false;out.state=next;return out;
}
export function nextVisitorWave(s:VisitorEvent):VisitorEvent{if(!dispatchComplete(s.dispatch)||s.dispatch.wave===2)return s;return {...s,dispatch:freshDispatch((s.dispatch.wave+1)as 1|2)};}
export function solveVisitor(save:Save):{save:Save;reward:number;status:'solved'|'locked'|'incomplete'|'overflow'}{const e=save.visitorEvent;if(!visitorEligible(save))return{save,reward:0,status:'locked'};if(!e||e.dispatch.wave!==2||!dispatchComplete(e.dispatch)||!validDispatch(e.dispatch))return{save,reward:0,status:'incomplete'};const reward=e.completed?0:600;if(!Number.isSafeInteger(save.coins)||save.coins<0||!Number.isSafeInteger(save.coins+reward))return{save,reward:0,status:'overflow'};return{save:{...save,coins:save.coins+reward,visitorEvent:{...e,started:true,completed:true,resolved:true,dispatch:{...e.dispatch,running:false}}},reward,status:'solved'};}
