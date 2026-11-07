import type {Save} from '../platform/save';
export type ResidentId='luno'|'dou'|'ember'|'rollo'|'yuzu'|'nemu'|'nimbus'|'momo';
export type HotelRoom='moon'|'tea'|'laundry'|'hearth'|'reception';
export type LifePhase='activity'|'walk'|'greet'|'react';
export interface Point{x:number;y:number}
export interface ResidentDef{id:ResidentId;kind:string;name:[string,string];home:HotelRoom;speed:number;plan:HotelRoom[]}
export const residentDefs:readonly ResidentDef[]=[
 {id:'luno',kind:'werewolf',name:['月毛','Luno'],home:'moon',speed:70,plan:['moon','tea','hearth']},
 {id:'dou',kind:'jiangshi',name:['小豆','Dou'],home:'laundry',speed:58,plan:['laundry','reception','tea']},
 {id:'ember',kind:'lantern',name:['燈燈','Ember'],home:'tea',speed:60,plan:['tea','hearth','moon']},
 {id:'rollo',kind:'mummy',name:['卷卷','Rollo'],home:'hearth',speed:56,plan:['hearth','laundry','reception']},
 {id:'yuzu',kind:'fox',name:['小柚','Yuzu'],home:'tea',speed:76,plan:['tea','moon','reception']},
 {id:'nemu',kind:'baku',name:['夢夢','Nemu'],home:'moon',speed:49,plan:['moon','hearth','tea']},
 {id:'nimbus',kind:'stormling',name:['小雷','Nimbus'],home:'hearth',speed:54,plan:['hearth','tea','reception']},
 {id:'momo',kind:'pooh',name:['蜜寶','Momo'],home:'laundry',speed:53,plan:['laundry','hearth','tea']}
];
export function hotelResidents(save:Pick<Save,'episodes'>){return residentDefs.filter(d=>{const e=save.episodes??[];return d.id==='yuzu'?e.includes('luggage-run'):d.id==='nemu'?e.includes('dream-door'):d.id==='nimbus'?e.includes('storm-arrival'):d.id==='momo'?e.includes('clockwork-guest'):true;});}
export const hotelRooms:Record<HotelRoom,{point:Point;name:[string,string];upper:boolean}>={
 moon:{point:{x:355,y:424},name:['月光客房','Moon suite'],upper:true},tea:{point:{x:1240,y:424},name:['花窗茶室','Rose tea lounge'],upper:true},
 laundry:{point:{x:355,y:747},name:['幽靈洗衣房','Ghost laundry'],upper:false},hearth:{point:{x:1240,y:747},name:['暖爐休憩室','Hearth lounge'],upper:false},reception:{point:{x:805,y:747},name:['接待大廳','Reception'],upper:false}
};
export const hallY=(upper:boolean)=>upper?431:754;
// Straight down the painted central flight and its clear carpet landing; the podium is at the side.
const stair:readonly Point[]=[{x:805,y:431},{x:805,y:475},{x:805,y:540},{x:805,y:630},{x:805,y:704},{x:805,y:754}];
export function hotelRoute(from:Point,to:Point):Point[]{const upper=from.y<500,endUpper=to.y<500,approach={x:from.x,y:hallY(upper)},end={x:to.x,y:hallY(endUpper)};return [approach,...(upper===endUpper?[]:(upper?stair:[...stair].reverse()).map(p=>({...p}))),end,{...to}];}
export interface ResidentState{
 def:ResidentDef;pos:Point;room:HotelRoom;destination:HotelRoom;phase:LifePhase;remaining:number;route:Point[];speed:number;distance:number;look:number;lookTarget:number;cooldown:number;visits:number;reaction:number;lane:number;waitingSince?:number;buddy?:ResidentId;resume?:{phase:LifePhase;remaining:number};
}
export type LifeEvent={type:'greet';ids:[ResidentId,ResidentId]}|{type:'tap';ids:[ResidentId]}|{type:'arrive';ids:[ResidentId]};
const copyPos=(p:Point)=>({x:p.x,y:p.y});
/** Deterministic resident schedules with bounded velocity; hidden tabs never fast-forward inhabitants. */
export class HotelLife{
 readonly residents:ResidentState[];time=0;greetings=0;reactions=0;arrivals=0;private stairOwner?:ResidentId;
 constructor(defs:readonly ResidentDef[]){this.residents=defs.map((def,i)=>({def,pos:this.station(def.home,residentDefs.findIndex(d=>d.id===def.id)),room:def.home,destination:def.home,phase:'activity',remaining:2.6+i*1.35,route:[],speed:0,distance:i*17,look:0,lookTarget:0,cooldown:1+i,visits:0,reaction:0,lane:0}));}
 private station(room:HotelRoom,index:number):Point{const p=hotelRooms[room].point;const offset=room==='reception'?(index%2?-100:100):(index<4?-165:165);return {x:p.x+offset,y:p.y-28};}
 private journey(s:ResidentState){const i=residentDefs.findIndex(d=>d.id===s.def.id),destination=s.def.plan[(s.visits+1)%s.def.plan.length],upper=hotelRooms[s.room].upper,endUpper=hotelRooms[destination].upper,needed=upper===endUpper?[upper]:[true,false];
  if(this.residents.some(o=>o!==s&&o.route.length>0&&needed.some(floor=>hotelRooms[o.room].upper===floor||hotelRooms[o.destination].upper===floor)))return;
  const preferred=this.station(destination,i),center=hotelRooms[destination].point,candidates=destination==='reception'?[{x:705,y:preferred.y},{x:905,y:preferred.y}]:[preferred,{x:center.x-165,y:preferred.y},{x:center.x,y:preferred.y},{x:center.x+165,y:preferred.y}];
  const goal=candidates.find(p=>this.residents.every(other=>{if(other===s)return true;const at=other.route.at(-1)??other.pos;return Math.abs(at.y-p.y)>25||Math.abs(at.x-p.x)>=130;}));return goal?{destination,upper,endUpper,goal}:undefined;
 }
 private walk(s:ResidentState){s.waitingSince??=this.time;const journey=this.journey(s);
  // Oldest eligible request goes first; a full room cannot prevent other residents from leaving.
  const older=this.residents.some(o=>o!==s&&o.phase==='activity'&&o.waitingSince!==undefined&&o.waitingSince<s.waitingSince!&&this.journey(o));
  if(!journey||older){s.remaining=.35;return;}const {destination,upper,endUpper,goal}=journey;s.waitingSince=undefined;s.visits++;s.destination=destination;s.route=hotelRoute(s.pos,goal);if(upper!==endUpper)this.stairOwner=s.def.id;s.phase='walk';s.speed=0;
 }
 react(id:ResidentId):LifeEvent|undefined{const s=this.residents.find(r=>r.def.id===id);if(!s)return;if(s.phase!=='react'){s.resume=s.phase==='greet'&&s.resume?s.resume:{phase:s.phase,remaining:s.remaining};}s.phase='react';s.remaining=2.35;s.reaction++;s.cooldown=9;s.lookTarget=0;s.speed=0;this.reactions++;return {type:'tap',ids:[id]};}
 tick(delta:number):LifeEvent[]{const dt=Math.min(.05,Math.max(0,delta));if(!Number.isFinite(dt)||dt===0)return [];this.time+=dt;const events:LifeEvent[]=[];
 for(const s of this.residents){s.cooldown=Math.max(0,s.cooldown-dt);s.look+=(s.lookTarget-s.look)*(1-Math.exp(-dt*7));
  if(s.phase==='react'||s.phase==='greet'){s.remaining-=dt;if(s.remaining<=0){s.phase=s.resume?.phase==='walk'?'walk':'activity';s.remaining=Math.max(1,s.resume?.remaining??3);s.resume=undefined;s.buddy=undefined;}continue;}
  if(s.phase==='activity'){s.speed=Math.max(0,s.speed-dt*130);s.remaining-=dt;if(s.remaining<=0)this.walk(s);continue;}
  const target=s.route[0];if(!target){s.phase='activity';s.room=s.destination;s.remaining=7+(this.residents.indexOf(s)%4)*1.7;s.speed=0;s.lookTarget=0;this.arrivals++;events.push({type:'arrive',ids:[s.def.id]});continue;}
  const inStair=s.pos.y>445&&s.pos.y<730;const entering=hotelRooms[s.room].upper!==hotelRooms[s.destination].upper&&s.route.length>2;
  if(entering&&this.stairOwner&&this.stairOwner!==s.def.id){s.speed=Math.max(0,s.speed-150*dt);continue;}
  if(entering)this.stairOwner=s.def.id;if(this.stairOwner===s.def.id&&!entering)this.stairOwner=undefined;
  const dx=target.x-s.pos.x,dy=target.y-s.pos.y,dist=Math.hypot(dx,dy);if(dist<1.1){s.pos=copyPos(target);s.route.shift();continue;}
  const desired=Math.min(s.def.speed*(inStair?.72:1),Math.sqrt(2*100*dist));s.speed+=Math.max(-130*dt,Math.min(100*dt,desired-s.speed));const step=Math.min(dist,s.speed*dt);s.pos.x+=dx/dist*step;s.pos.y+=dy/dist*step;s.distance+=step;if(Math.abs(dx)>3)s.lookTarget=dx>0?1:-1;
 }
 // Greetings happen at personal-space distance, on a floor, with both guests able to stop.
 for(let i=0;i<this.residents.length;i++)for(let j=i+1;j<this.residents.length;j++){const a=this.residents[i],b=this.residents[j];if(a.cooldown||b.cooldown||!['walk','activity'].includes(a.phase)||!['walk','activity'].includes(b.phase)||a.phase!=='walk'&&b.phase!=='walk')continue;const d=Math.hypot(a.pos.x-b.pos.x,a.pos.y-b.pos.y);if(d<120||d>162||Math.abs(a.pos.y-b.pos.y)>45||a.pos.y>450&&a.pos.y<730)continue;if(this.residents.some(c=>c!==a&&c!==b&&c.speed<2&&(Math.hypot(c.pos.x-a.pos.x,c.pos.y-a.pos.y)<118||Math.hypot(c.pos.x-b.pos.x,c.pos.y-b.pos.y)<118)))continue;for(const[s,other]of[[a,b],[b,a]]){s.resume={phase:s.phase,remaining:s.remaining};s.phase='greet';s.remaining=1.8;s.cooldown=16;s.buddy=other.def.id;s.speed=0;s.lookTarget=other.pos.x>s.pos.x?1:-1;}this.greetings++;events.push({type:'greet',ids:[a.def.id,b.def.id]});}
 // Standing guests lean back into their room before a guest walks along the front corridor.
 // Depth is derived from the actual feet, so the nearer guest consistently occludes the farther one.
 for(const s of this.residents){const yielding=s.phase!=='walk'&&this.residents.some(o=>o!==s&&o.route.length>0&&Math.abs(o.pos.x-s.pos.x)<210&&Math.abs(o.pos.y-s.pos.y)<95);const lane=yielding?-24:0;s.lane+=Math.max(-35*dt,Math.min(35*dt,lane-s.lane));}

 return events;
 }
}
