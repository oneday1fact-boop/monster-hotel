import {commissionData} from './commissionData';
export const commissionKinds=['maze','laundry','mirrors'] as const;
export type CommissionKind=typeof commissionKinds[number];
export type Rank=0|1|2;
export type JobKey=`${CommissionKind}:${Rank}`;
export interface MazeRecipe{kind:'maze';w:number;h:number;walls:number[];keys:number[];start:number;goal:number;minimum:number}
export interface ClothPiece{axis:'h'|'v';length:number;fixed:number}
export interface LaundryRecipe{kind:'laundry';w:number;h:number;pieces:ClothPiece[];start:number[];minimum:number}
export interface MirrorRecipe{kind:'mirrors';w:number;h:number;positions:number[];sources:number[][];goals:number[][];crystals:number[][];start:number[];answer:number[];minimum:number}
export type Recipe=MazeRecipe|LaundryRecipe|MirrorRecipe;
export const directions=[[0,-1],[1,0],[0,1],[-1,0]] as const;
export const jobKeys=commissionKinds.flatMap(k=>([0,1,2] as const).map(r=>`${k}:${r}` as JobKey));
export const validJobKey=(v:unknown):v is JobKey=>jobKeys.includes(v as JobKey);
export const jobRank=(key:JobKey)=>Number(key.split(':')[1]) as Rank;
export const jobKind=(key:JobKey)=>key.split(':')[0] as CommissionKind;
/** Eight distinct solver-verified base layouts per rank, then alternate reflections. */
export function commissionRecipe(key:JobKey,serial:number):Recipe{
 const kind=jobKind(key),rank=jobRank(key),p=JSON.parse(JSON.stringify(commissionData[kind][rank][serial%8])) as Recipe;p.kind=kind;
 const flip=Math.floor(serial/8)%4,hx=flip===1||flip===3,vy=flip===2||flip===3;
 const cell=(at:number)=>(vy?p.h-1-Math.floor(at/p.w):Math.floor(at/p.w))*p.w+(hx?p.w-1-at%p.w:at%p.w);
 if(p.kind==='maze'){p.walls=p.walls.map(cell);p.keys=p.keys.map(cell);p.start=cell(p.start);p.goal=cell(p.goal);}
 if(p.kind==='laundry'&&vy){p.pieces.forEach((piece,i)=>{if(piece.axis==='h')piece.fixed=p.h-1-piece.fixed;else p.start[i]=p.h-piece.length-p.start[i];});}
 if(p.kind==='mirrors'){
  p.positions=p.positions.map(cell);p.crystals=p.crystals.map(a=>a.map(cell));
  const edge=(a:number[])=>{let[x,y,d]=a;if(hx){x=p.w-1-x;d=[0,3,2,1][d];}if(vy){y=p.h-1-y;d=[2,1,0,3][d];}return[x,y,d];};p.sources=p.sources.map(edge);p.goals=p.goals.map(edge);
  if(hx!==vy){p.start=p.start.map(a=>1-a);p.answer=p.answer.map(a=>1-a);}
 }
 return p;
}
export function freshStep(p:Recipe){return p.kind==='maze'?[p.start,0]:[...p.start];}
export function clothCells(p:LaundryRecipe,s:readonly number[],i:number){const a=p.pieces[i];return Array.from({length:a.length},(_,n)=>a.axis==='h'?{x:s[i]+n,y:a.fixed}:{x:a.fixed,y:s[i]+n});}
export function validStep(p:Recipe,s:unknown):s is number[]{
 if(!Array.isArray(s)||!s.every(Number.isInteger))return false;
 if(p.kind==='maze')return s.length===2&&s[0]>=0&&s[0]<p.w*p.h&&!p.walls.includes(s[0])&&s[1]>=0&&s[1]<(1<<p.keys.length);
 if(p.kind==='mirrors')return s.length===p.positions.length&&s.every(n=>n===0||n===1);
 if(s.length!==p.pieces.length)return false;const used=new Set<number>();
 for(let i=0;i<s.length;i++){const a=p.pieces[i];if(s[i]<0||s[i]+a.length>(a.axis==='h'?p.w:p.h))return false;for(const c of clothCells(p,s,i)){const k=c.y*p.w+c.x;if(used.has(k))return false;used.add(k);}}return true;
}
export function glideMaze(p:MazeRecipe,s:readonly number[],d:number){let[at,mask]=s;const path:number[]=[];if(!validStep(p,s)||!Number.isInteger(d)||d<0||d>3)return{step:[...s],path};let x=at%p.w,y=Math.floor(at/p.w);const[dx,dy]=directions[d];
 while(x+dx>=0&&x+dx<p.w&&y+dy>=0&&y+dy<p.h&&!p.walls.includes((y+dy)*p.w+x+dx)){x+=dx;y+=dy;at=y*p.w+x;path.push(at);const i=p.keys.indexOf(at);if(i>=0)mask|=1<<i;}return{step:[at,mask],path};
}
export function slideCloth(p:LaundryRecipe,s:readonly number[],i:number,delta:number){const next=[...s];if(!validStep(p,s)||!Number.isInteger(i)||i<0||i>=p.pieces.length||!Number.isInteger(delta)||Math.abs(delta)>6)return next;const d=Math.sign(delta);for(let n=0;n<Math.abs(delta);n++){const candidate=[...next];candidate[i]+=d;if(!validStep(p,candidate))break;next[i]+=d;}return next;}
export interface Beam{cells:number[];points:{x:number;y:number}[];lit:number[];exit:number[];loop:boolean;solved:boolean}
export function traceCommission(p:MirrorRecipe,s:readonly number[],source:number):Beam{
 let[x,y,d]=p.sources[source];const out:Beam={cells:[],points:[{x:x+.5,y:y+.5}],lit:[],exit:[],loop:false,solved:false};if(!validStep(p,s))return out;const seen=new Set<string>();
 for(let n=0;n<=p.w*p.h*4;n++){const[dx,dy]=directions[d];x+=dx;y+=dy;if(x<0||x>=p.w||y<0||y>=p.h){out.exit=[x,y,d];out.points.push({x:x+.5,y:y+.5});break;}const at=y*p.w+x,k=`${at}:${d}`;if(seen.has(k)){out.loop=true;break;}seen.add(k);out.cells.push(at);out.points.push({x:x+.5,y:y+.5});if(p.crystals[source].includes(at)&&!out.lit.includes(at))out.lit.push(at);const i=p.positions.indexOf(at);if(i>=0)d=(s[i]===0?[1,0,3,2]:[3,2,1,0])[d];}
 out.solved=!out.loop&&out.exit[0]===p.goals[source][0]&&out.exit[1]===p.goals[source][1]&&out.lit.length===p.crystals[source].length;return out;
}
export function commissionSolved(p:Recipe,s:readonly number[]){if(!validStep(p,s))return false;if(p.kind==='maze')return s[0]===p.goal&&s[1]===(1<<p.keys.length)-1;if(p.kind==='laundry')return s[0]===p.w-p.pieces[0].length;return [0,1].every(i=>traceCommission(p,s,i).solved);}
export type PuzzleMove={type:'glide';direction:number}|{type:'slide';index:number;delta:number}|{type:'turn';index:number};
export function applyPuzzleMove(p:Recipe,s:readonly number[],a:PuzzleMove){if(a.type==='glide'&&p.kind==='maze')return glideMaze(p,s,a.direction).step;if(a.type==='slide'&&p.kind==='laundry')return slideCloth(p,s,a.index,a.delta);if(a.type==='turn'&&p.kind==='mirrors'&&Number.isInteger(a.index)&&a.index>=0&&a.index<s.length){const next=[...s];next[a.index]=1-next[a.index];return next;}return [...s];}
/** Breadth-first shortest route. Cloth neighbours inspect just the entering cell, not the whole board. */
export function puzzleSolution(p:Recipe,s:readonly number[]):PuzzleMove[]|undefined{
 if(!validStep(p,s))return;
 if(p.kind==='mirrors')return p.answer.flatMap((v,i)=>v===s[i]?[]:[{type:'turn',index:i} as PuzzleMove]);
 const q:{s:number[];parent:number;move?:PuzzleMove}[]=[{s:[...s],parent:-1}],seen=new Set([s.join(',')]);
 for(let n=0;n<q.length&&n<60000;n++){const node=q[n],solved=p.kind==='maze'?node.s[0]===p.goal&&node.s[1]===(1<<p.keys.length)-1:node.s[0]===p.w-p.pieces[0].length;
  if(solved){const route:PuzzleMove[]=[];let at=n;while(q[at].parent>=0){route.push(q[at].move!);at=q[at].parent;}return route.reverse();}
  const neighbours:{step:number[];move:PuzzleMove}[]=[];
  if(p.kind==='maze'){for(let d=0;d<4;d++){const next=glideMaze(p,node.s,d);if(next.path.length)neighbours.push({step:next.step,move:{type:'glide',direction:d}});}}
  else{const used=new Int16Array(p.w*p.h).fill(-1);p.pieces.forEach((_,i)=>clothCells(p,node.s,i).forEach(c=>used[c.y*p.w+c.x]=i));
   p.pieces.forEach((piece,index)=>{for(const delta of [-1,1]){const enter=node.s[index]+(delta<0?-1:piece.length);if(enter<0||enter>=(piece.axis==='h'?p.w:p.h))continue;const cell=piece.axis==='h'?piece.fixed*p.w+enter:enter*p.w+piece.fixed;if(used[cell]>=0)continue;const step=[...node.s];step[index]+=delta;neighbours.push({step,move:{type:'slide',index,delta}});}});
  }
  for(const next of neighbours){const k=next.step.join(',');if(seen.has(k))continue;seen.add(k);q.push({s:next.step,parent:n,move:next.move});}
 }return;
}
export function puzzleHint(p:Recipe,s:readonly number[]){return puzzleSolution(p,s)?.[0];}
