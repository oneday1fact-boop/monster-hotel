/** Four ratchet clocks. Each brass knob visibly couples two clock hands. */
export const clockStart = [1, 1, 3, 3] as const;
export const clockLinks = [[1,-1,0,0],[0,1,1,0],[0,0,1,-1]] as const;
export type ClockState = { started:boolean; hands:number[]; history:number[][] };
export const freshClocks = ():ClockState => ({started:false,hands:[...clockStart],history:[]});
export function validHands(v:unknown):v is number[]{return Array.isArray(v)&&v.length===4&&v.every(n=>Number.isInteger(n)&&n>=0&&n<4);}
export function turnClocks(hands:readonly number[],knob:number):number[]{if(!validHands(hands)||!Number.isInteger(knob)||!clockLinks[knob])return [...hands];return hands.map((n,i)=>(n+clockLinks[knob][i]+4)%4);}
export const clocksSolved=(hands:readonly number[])=>validHands(hands)&&hands.every(n=>n===0);
export function validClocks(v:unknown):v is ClockState{
 if(!v||typeof v!=='object')return false;const s=v as ClockState;
 if(typeof s.started!=='boolean'||!validHands(s.hands)||!Array.isArray(s.history)||s.history.length>256||!s.history.every(validHands))return false;
 let current=s.hands;for(let i=s.history.length-1;i>=0;i--){const old=s.history[i];if(!clockLinks.some((_,k)=>turnClocks(old,k).every((n,j)=>n===current[j])))return false;current=old;}return true;
}
/** Adaptive shortest-path hint from the actual board, never a fixed answer sequence. */
export function clockHint(hands:readonly number[]):number|undefined{
 if(!validHands(hands)||clocksSolved(hands))return;
 const queue=[{hands:[...hands],first:-1}],seen=new Set([hands.join()]);
 for(let i=0;i<queue.length;i++)for(let k=0;k<3;k++){
  const next=turnClocks(queue[i].hands,k),first=queue[i].first<0?k:queue[i].first;
  if(clocksSolved(next))return first;const key=next.join();if(!seen.has(key)){seen.add(key);queue.push({hands:next,first});}
 }
}
