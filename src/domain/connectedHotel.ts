import type {Save} from '../platform/save';
import {EstateLife,estateRooms,estateOpen,type EstateRoomId} from './hotelEstate';
import type {ResidentId,LifeEvent,Point} from './hotelLife';
export {hotelWorldWidth,wingOffset,connectedPoint,connectedRoute} from './connectedGeometry';
import {connectedPoint} from './connectedGeometry';
/** One resident simulation survives original/wing camera changes and purchases. */
export class ConnectedHotelLife{
 readonly estate:EstateLife;readonly residents;reactions=0;greetings=0;arrivals=0;visitorArrived=false;
 constructor(save:Save){this.estate=new EstateLife(save,'connected');this.residents=this.estate.residents.map(r=>r.rig);}
 get time(){return this.estate.time;}
 update(save:Save,welcome?:EstateRoomId){this.estate.update(save,welcome);}
 point(room:EstateRoomId){return connectedPoint(room);}
 roomOf(id:ResidentId){return this.estate.residents.find(r=>r.rig.def.id===id)!.room;}
 destinationOf(id:ResidentId){return this.estate.residents.find(r=>r.rig.def.id===id)!.destination;}
 react(id:ResidentId):LifeEvent|undefined{const r=this.residents.find(s=>s.def.id===id);if(!r)return;this.estate.react(id);r.cooldown=12;this.reactions++;return {type:'tap',ids:[id]};}
 tick(dt:number):LifeEvent[]{if(!Number.isFinite(dt)||dt<=0)return [];const before=this.estate.residents.map(r=>r.room),events:LifeEvent[]=[];this.estate.tick(dt);for(const[i,r]of this.estate.residents.entries()){if(before[i]!==r.room&&r.rig.phase==='activity'){this.arrivals++;events.push({type:'arrive',ids:[r.rig.def.id]});}r.rig.cooldown=Math.max(0,r.rig.cooldown-Math.min(.05,Math.max(0,dt)));}
  for(let i=0;i<this.residents.length;i++)for(let j=i+1;j<this.residents.length;j++){const a=this.residents[i],b=this.residents[j],d=Math.hypot(a.pos.x-b.pos.x,a.pos.y-b.pos.y);if(a.cooldown||b.cooldown||d<130||d>170||Math.abs(a.pos.y-b.pos.y)>40||a.pos.y>445&&a.pos.y<730||!['walk','activity'].includes(a.phase)||!['walk','activity'].includes(b.phase)||a.phase!=='walk'&&b.phase!=='walk')continue;this.estate.react(a.def.id);this.estate.react(b.def.id);a.cooldown=b.cooldown=15;this.greetings++;events.push({type:'greet',ids:[a.def.id,b.def.id]});}
  return events;
 }
}
