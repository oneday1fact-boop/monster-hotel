export const windWalls=[0,2,6,10,12,17,23,28] as const;
export const windBells=[11,15,13] as const;
export const windDirections=['up','right','down','left'] as const;
export type WindDirection=typeof windDirections[number];
export interface WindStep{at:number;mask:number}
export interface WindState extends WindStep{started:boolean;history:WindStep[]}
export const freshWind=():WindState=>({started:false,at:24,mask:0,history:[]});
export function validWindStep(v:unknown):v is WindStep{const s=v as WindStep;return !!s&&Number.isInteger(s.at)&&s.at>=0&&s.at<30&&!windWalls.some(x=>x===s.at)&&Number.isInteger(s.mask)&&s.mask>=0&&s.mask<8;}
export function validWind(v:unknown):v is WindState{const s=v as WindState;return validWindStep(s)&&typeof s.started==='boolean'&&Array.isArray(s.history)&&s.history.length<=256&&s.history.every(validWindStep);}
export function glideWind(s:WindStep,d:WindDirection){const index=windDirections.indexOf(d);if(!validWindStep(s)||index<0)return{at:s.at,mask:s.mask,path:[] as number[]};const[dx,dy]=[[0,-1],[1,0],[0,1],[-1,0]][index];let x=s.at%6,y=Math.floor(s.at/6),mask=s.mask;const path:number[]=[];while(x+dx>=0&&x+dx<6&&y+dy>=0&&y+dy<5&&!windWalls.some(w=>w===(y+dy)*6+x+dx)){x+=dx;y+=dy;const at=y*6+x;path.push(at);const bell=windBells.findIndex(n=>n===at);if(bell>=0)mask|=1<<bell;}return{at:y*6+x,mask,path};}
export const windSolved=(s:WindStep)=>validWindStep(s)&&s.at===5&&s.mask===7;
/** Free BFS hint follows the player's current state, including detours, rather than a canned answer. */
export function windHint(s:WindStep):WindDirection|undefined{const q=[{at:s.at,mask:s.mask,first:undefined as WindDirection|undefined}],seen=new Set([`${s.at}:${s.mask}`]);for(let n=0;n<q.length;n++){const p=q[n];if(windSolved(p))return p.first;for(const d of windDirections){const next=glideWind(p,d),key=`${next.at}:${next.mask}`;if(!next.path.length||seen.has(key))continue;seen.add(key);q.push({at:next.at,mask:next.mask,first:p.first??d});}}return undefined;}
