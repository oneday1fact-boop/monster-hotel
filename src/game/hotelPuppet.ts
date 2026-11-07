import type {ResidentState} from '../domain/hotelLife';
export interface Puppet{root:HTMLElement;body:HTMLElement;head?:HTMLElement;tail?:HTMLElement;legs:HTMLElement[];shadow:HTMLElement;prop:HTMLElement;foot:number}
const geometry:Record<string,{head:number;legs:number;left:number;right:number;tail?:string;eye:number[][];skin:string}>={
 werewolf:{head:59,legs:79,left:30,right:79,tail:'polygon(74% 59%,100% 59%,100% 93%,74% 93%)',eye:[[48,40,11,13],[65,38,11,13]],skin:'#eee0c5'},
 jiangshi:{head:57,legs:80,left:30,right:69,eye:[[57,43,10,12],[74,42,10,12]],skin:'#b4d9c6'},
 mummy:{head:58,legs:79,left:28,right:70,tail:'polygon(78% 57%,100% 57%,100% 91%,78% 91%)',eye:[[43,39,11,13],[62,43,11,13]],skin:'#3e2c3c'},
 fox:{head:61,legs:81,left:32,right:78,tail:'polygon(78% 60%,100% 60%,100% 91%,78% 91%)',eye:[[49,43,11,13],[65,40,10,13]],skin:'#f9e8cb'},
 baku:{head:61,legs:80,left:29,right:76,eye:[[43,44,11,13],[60,40,11,13]],skin:'#f4e5dc'},
 pooh:{head:64,legs:86,left:23,right:65,eye:[[36,40,5,8],[59,40,5,8]],skin:'#ffd650'},
 lantern:{head:0,legs:0,left:0,right:0,tail:'polygon(77% 38%,100% 38%,100% 100%,77% 100%)',eye:[[47,49,26,24]],skin:'#f7a047'},
 stormling:{head:0,legs:0,left:0,right:0,eye:[[37,49,12,16],[63,49,12,16]],skin:'#dfedf4'}
};
export const residentArt=(kind:string)=>`/art/${kind}-poses.${kind==='stormling'?'svg':'png'}`;
/** A single original pose is continuously articulated. No animation changes texture coordinates. */
export function hotelPuppet(kind:string,index=0):Puppet{
 const g=geometry[kind],root=document.createElement('span');root.className=`hotel-puppet hotel-puppet--${kind}`;root.setAttribute('aria-hidden','true');root.style.setProperty('--puppet-art',`url('${residentArt(kind)}')`);root.style.setProperty('--puppet-sheet',kind==='pooh'?'100% 100%':'200% 200%');root.style.setProperty('--blink-delay',`${-index*.71}s`);
 const shadow=document.createElement('i');shadow.className='hotel-foot-shadow';root.append(shadow);
 const skin=(part:string,clip?:string)=>{const e=document.createElement('span');e.className=`hotel-skin hotel-skin--${part}`;if(clip)e.style.clipPath=clip;root.append(e);return e;};
 const tail=g.tail?skin('tail',g.tail):undefined;
 const body=skin('body',g.head&&g.tail?`polygon(0% ${g.head-2}%,78% ${g.head-2}%,78% ${g.legs}%,${g.left}% ${g.legs}%,${g.left}% 100%,0% 100%)`:g.head?`polygon(0% ${g.head-2}%,100% ${g.head-2}%,100% 100%,${g.right}% 100%,${g.right}% ${g.legs}%,${g.left}% ${g.legs}%,${g.left}% 100%,0% 100%)`:kind==='lantern'?'polygon(0 0,100% 0,100% 38%,77% 38%,77% 100%,0 100%)':undefined);
 let head:HTMLElement|undefined;const legs:HTMLElement[]=[];
 if(g.head){const mid=(g.left+g.right)/2;legs.push(skin('leg',`polygon(${g.left}% ${g.legs-1}%,${mid}% ${g.legs-1}%,${mid}% 100%,${g.left}% 100%)`),skin('leg',`polygon(${mid}% ${g.legs-1}%,${g.right}% ${g.legs-1}%,${g.right}% 100%,${mid}% 100%)`));head=skin('head',`polygon(0 0,100% 0,100% ${g.head}%,0 ${g.head}%)`);head.style.transformOrigin=`53% ${g.head-3}%`;}
 const face=head??body;
 for(const[x,y,w,h]of g.eye){const lid=document.createElement('i');lid.className='hotel-eyelid';lid.style.cssText=`left:${x-w/2}%;top:${y-h/2}%;width:${w}%;height:${h}%;background:${g.skin}`;face.append(lid);}
 const prop=document.createElement('span');prop.className='hotel-activity-prop';prop.innerHTML='<svg class="hotel-prop-book" viewBox="0 0 100 70"><path d="M50 12Q25 0 3 10V57Q26 47 50 62Q75 47 97 57V10Q73 0 50 12Z" fill="#bd9acb" stroke="#674d72" stroke-width="4"/><path d="M50 12V60M12 20L39 23M12 31L39 34M62 23L88 20M62 34L88 31" fill="none" stroke="#ffebc6" stroke-width="3"/></svg><svg class="hotel-prop-cup" viewBox="0 0 100 80"><ellipse cx="47" cy="65" rx="37" ry="7" fill="#bc9fc9"/><path d="M18 28H70L65 56Q44 71 23 56Z" fill="#ffe8bd" stroke="#795771" stroke-width="4"/><path d="M70 33Q94 28 84 48Q80 56 67 50" fill="none" stroke="#795771" stroke-width="5"/><path class="hotel-cup-steam" d="M34 22Q24 13 34 4M52 22Q42 13 52 4" fill="none" stroke="#fff4d4" stroke-width="4"/></svg><svg class="hotel-prop-cloth" viewBox="0 0 100 70"><path d="M7 15Q48 5 93 15L87 59Q49 49 13 59Z" fill="#c4a4db" stroke="#6c507e" stroke-width="4"/><path d="M50 20L55 32L68 34L58 43L60 55L49 49L38 55L40 43L30 34L43 32Z" fill="#ffedb8"/></svg><svg class="hotel-prop-warm" viewBox="0 0 100 70"><path d="M46 5Q67 28 54 37Q88 27 80 55Q50 78 23 54Q15 38 34 24Q30 46 44 43Q57 34 46 5Z" fill="#ffcb79" opacity=".8"/></svg>';root.append(prop);
 return {root,body,head,tail,legs,shadow,prop,foot:kind==='mummy'?.84:kind==='jiangshi'?.87:kind==='stormling'?.94:.91};
}
export function posePuppet(p:Puppet,s:ResidentState,time:number,quiet:boolean){
 const walking=s.phase==='walk'&&s.speed>2,float=s.def.kind==='lantern'||s.def.kind==='stormling',gait=quiet?0:s.distance*.085,breath=quiet?0:Math.sin(time*1.55),stride=walking?Math.min(1,s.speed/s.def.speed):0;
 const social=s.phase==='react'||s.phase==='greet',elapsed=social?(s.phase==='react'?2.35:1.8)-s.remaining:0,nod=quiet?0:social?Math.sin(Math.max(0,elapsed)*6)*2.5:Math.sin(time*.8)*.65;
 const bob=quiet?0:float?Math.sin(time*2.05)*4.5:-Math.abs(Math.sin(gait))*1.6*stride;
 p.body.style.transform=`translate3d(0,${bob}px,0) rotate(${quiet?0:s.look*stride*1.4+breath*.35}deg) scale(${1+breath*.005},${1+breath*.008})`;
 if(p.head)p.head.style.transform=`translate3d(${quiet?0:s.look*1.25}px,${bob}px,0) rotate(${quiet?0:s.look*1.5+nod}deg)`;
 if(p.tail)p.tail.style.transform=`rotate(${quiet?0:Math.sin(time*(social?7:2.3))*(social?5:2.5)}deg)`;
 p.legs.forEach((leg,i)=>{const v=Math.sin(gait+i*Math.PI);leg.style.transform=`translate3d(${v*2.3*stride}px,${-Math.max(0,v)*5*stride}px,0) rotate(${v*2*stride}deg)`;});
 p.shadow.style.transform=`scale(${float?.82+breath*.035:1-stride*.04},1)`;
 p.prop.dataset.task=s.phase==='activity'?s.room:'none';const sip=s.room==='tea'?Math.max(0,Math.sin(time*.9)):0;
 p.prop.style.transform=`translate3d(0,${quiet?0:s.room==='laundry'?Math.sin(time*2)*1.4:-sip*5}px,0) rotate(${quiet?0:s.room==='laundry'?Math.sin(time*2)*2:-sip*6}deg)`;
}
