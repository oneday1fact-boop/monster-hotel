import {connectedPoint,connectedRoute} from './connectedGeometry';
import type {Save} from '../platform/save';
import {HotelLife,hotelResidents,type ResidentState,type Point} from './hotelLife';
export const estateRooms=[
 {id:'library',name:['樹屋書室','Woodland library'],col:0,row:0,price:4800,task:'moon',description:['樹影、書香同暖笠笠嘅閱讀角。','A leafy reading retreat with warm little lamps.']},
 {id:'moon',name:['月光客房','Moon suite'],col:1,row:0,price:0,task:'moon',description:['月毛最鍾意嘅月光小天地。','Luno’s cosy moonlit retreat.']},
 {id:'tea',name:['花窗茶室','Rose tea lounge'],col:2,row:0,price:0,task:'tea',description:['泡壺暖茶，同住客傾吓偈。','Warm tea and good company.']},
 {id:'observatory',name:['星空觀測室','Star observatory'],col:3,row:0,price:7200,task:'moon',description:['望遠鏡、星圖同會發光嘅小星球。','A brass telescope, star charts and a glowing globe.']},
 {id:'music',name:['月影音樂室','Moonlit music room'],col:0,row:1,price:10800,requires:'library',task:'hearth',description:['一間可以靜靜欣賞音樂嘅新房間。','A new room for little melodies and cosy company.']},
 {id:'laundry',name:['幽靈洗衣房','Ghost laundry'],col:1,row:1,price:0,task:'laundry',description:['星星被單洗完，摺好再送去客房。','Fresh star quilts, folded for the guest rooms.']},
 {id:'hearth',name:['暖爐休憩室','Hearth lounge'],col:2,row:1,price:0,task:'hearth',description:['暖火、梳化同放鬆嘅小浴池。','Warm fires, soft chairs and a soothing little bath.']},
 {id:'bakery',name:['蜜糖烘焙房','Honey bakery'],col:3,row:1,price:15600,requires:'observatory',task:'tea',description:['蜜糖茶、熊仔曲奇，準備下午茶。','Honey tea and bear biscuits for afternoon tea.']}
] as const;
export type EstateRoomId=typeof estateRooms[number]['id'];
export type ExpansionId='library'|'observatory'|'music'|'bakery';
export const isExpansion=(v:unknown):v is ExpansionId=>estateRooms.some(r=>r.price>0&&r.id===v);
export const estatePoint=(id:EstateRoomId)=>{const r=estateRooms.find(r=>r.id===id)!;return {x:[200,560,1040,1400][r.col],y:r.row?736:413};};
export const wingPoint=(id:EstateRoomId)=>({x:id==='library'||id==='music'?355:1240,y:id==='library'||id==='observatory'?413:736});
export const estateOpen=(save:Pick<Save,'hotelRooms'>,id:EstateRoomId)=>estateRooms.some(r=>r.id===id&&(r.price===0||save.hotelRooms?.includes(r.id as ExpansionId)));
export type ExpansionResult={save:Save;status:'bought'|'owned'|'insufficient'|'prerequisite'|'unknown'};
export function buyExpansion(save:Save,id:string):ExpansionResult{
 const room=estateRooms.find(r=>r.id===id);if(!room||!isExpansion(id))return {save,status:'unknown'};
 if(estateOpen(save,room.id))return {save,status:'owned'};
 if('requires' in room&&!estateOpen(save,room.requires))return {save,status:'prerequisite'};
 if(!Number.isSafeInteger(save.coins)||save.coins<room.price)return {save,status:'insufficient'};
 return {save:{...save,coins:save.coins-room.price,hotelRooms:[...(save.hotelRooms??[]),id]},status:'bought'};
}
export interface EstateResident{rig:ResidentState;room:EstateRoomId;destination:EstateRoomId;visits:number;wanted?:EstateRoomId}
const lane=(y:number)=>y<500?443:771;
export function estateRoute(from:Point,to:Point){const cross=(from.y<500)!==(to.y<500),stairs=[{x:800,y:443},{x:800,y:495},{x:800,y:565},{x:800,y:640},{x:800,y:710},{x:800,y:771}];return [{x:from.x,y:lane(from.y)},...(cross?(from.y<500?stairs:[...stairs].reverse()):[]).map(p=>({...p})),{x:to.x,y:lane(to.y)},{...to}];}
/** The overview has its own routes: buying a wing never rebuilds the existing four-room life. */
export class EstateLife{
 readonly residents:EstateResident[];time=0;private open:EstateRoomId[];
 readonly layout:'estate'|'wing'|'connected';
 point(id:EstateRoomId){return this.layout==='connected'?connectedPoint(id):this.layout==='wing'?wingPoint(id):estatePoint(id);}
 private available(save:Save){return estateRooms.filter(r=>(this.layout!=='wing'||r.price>0)&&estateOpen(save,r.id)).map(r=>r.id);}
 constructor(save:Save,layout:'estate'|'wing'|'connected'='estate'){this.layout=layout;this.open=this.available(save);const original=new HotelLife(hotelResidents(save));this.residents=layout==='wing'?[]:original.residents.map((rig,i)=>{const room=this.layout==='connected'?(rig.room==='reception'?'hearth':rig.room):this.open.length>4?this.open[i%this.open.length]:rig.room==='reception'?'hearth':rig.room;const p=this.point(room);rig.pos={x:p.x+(i<4?(this.layout==='connected'?-165:-65):(this.layout==='connected'?165:65)),y:p.y};rig.room=estateRooms.find(r=>r.id===room)!.task;rig.route=[];rig.remaining=3+i*.9;rig.phase='activity';return {rig,room,destination:room,visits:0};});this.update(save);}
 update(save:Save,welcome?:EstateRoomId){this.open=this.available(save);if(this.layout==='wing'){const defs=hotelResidents(save);while(this.residents.length<this.open.length){const i=this.residents.length,room=this.open[i],rig=new HotelLife([defs[i]]).residents[0];rig.pos=this.point(room);rig.room=estateRooms.find(r=>r.id===room)!.task;rig.phase='activity';rig.route=[];rig.remaining=3+i;this.residents.push({rig,room,destination:room,visits:0});}}if(welcome){const visitor=this.residents.filter(r=>!r.rig.route.length).sort((a,b)=>Math.hypot(a.rig.pos.x-this.point(welcome).x,a.rig.pos.y-this.point(welcome).y)-Math.hypot(b.rig.pos.x-this.point(welcome).x,b.rig.pos.y-this.point(welcome).y))[0];if(visitor&&visitor.room!==welcome){visitor.wanted=welcome;visitor.rig.remaining=.3;}}}
 private start(s:EstateResident){if(this.layout==='connected'&&!s.wanted&&this.residents.some(o=>o!==s&&o.wanted)){s.rig.remaining=.35;return;}const dest=s.wanted??this.open[(this.residents.indexOf(s)+s.visits+1)%this.open.length];if(dest===s.room){s.visits++;s.rig.remaining=1;return;}const p=this.point(dest),floor=s.rig.pos.y<500,endFloor=p.y<500,needed=floor===endFloor?[floor]:[true,false];if(this.residents.some(o=>o!==s&&o.rig.route.length&&needed.some(f=>(this.point(o.room).y<500)===f||(this.point(o.destination).y<500)===f))){s.rig.remaining=.5;return;}const goal=(this.layout==='connected'?[-165,165,0]:[-65,65]).map(dx=>({x:p.x+dx,y:p.y})).find(at=>this.residents.every(o=>o===s||Math.abs((o.rig.route.at(-1)??o.rig.pos).y-at.y)>25||Math.abs((o.rig.route.at(-1)??o.rig.pos).x-at.x)>=100));if(!goal){s.visits++;s.rig.remaining=1;return;}s.destination=dest;s.rig.route=this.layout==='connected'?connectedRoute(s.rig.pos,goal):estateRoute(s.rig.pos,goal);s.rig.phase='walk';s.rig.speed=0;s.visits++;s.wanted=undefined;}
 react(id:string){const r=this.residents.find(s=>s.rig.def.id===id);if(r){const s=r.rig;if(s.phase!=='react')s.resume={phase:s.phase,remaining:s.remaining};s.phase='react';s.remaining=1.8;s.speed=0;s.reaction++;}}
 tick(delta:number){const dt=Math.min(.05,Math.max(0,delta));if(!Number.isFinite(dt))return;this.time+=dt;for(const r of this.residents){const s=r.rig;s.look+=(s.lookTarget-s.look)*Math.min(1,dt*7);if(s.phase==='react'){s.remaining-=dt;if(s.remaining<=0){s.phase=s.resume?.phase==='walk'?'walk':'activity';s.remaining=s.resume?.remaining??4;s.resume=undefined;}continue;}
 if(s.phase==='activity'){s.remaining-=dt;if(s.remaining<=0)this.start(r);}else{const p=s.route[0];if(!p){r.room=r.destination;s.room=estateRooms.find(x=>x.id===r.room)!.task;s.phase='activity';s.remaining=5+this.residents.indexOf(r)%3;s.speed=0;}else{const dx=p.x-s.pos.x,dy=p.y-s.pos.y,d=Math.hypot(dx,dy),speed=Math.min(95,Math.sqrt(d*200));s.speed+=Math.max(-150*dt,Math.min(120*dt,speed-s.speed));const step=Math.min(d,s.speed*dt);if(d<.8){s.pos={...p};s.route.shift();}else{s.pos.x+=dx/d*step;s.pos.y+=dy/d*step;s.distance+=step;if(Math.abs(dx)>2)s.lookTarget=dx>0?1:-1;}}}
 const yielding=s.phase!=='walk'&&this.residents.some(o=>o!==r&&o.rig.route.length&&Math.abs(o.rig.pos.x-s.pos.x)<175&&Math.abs(o.rig.pos.y-s.pos.y)<85);const offset=yielding?-24:0;s.lane+=Math.max(-35*dt,Math.min(35*dt,offset-s.lane));}}
}
