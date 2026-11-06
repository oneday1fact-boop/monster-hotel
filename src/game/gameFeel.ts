/** Shared mobile interaction polish. No game state, awards or storage are changed here. */
export const prefersQuietMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
const running=new Set<Animation>();
export function motion(element:HTMLElement,frames:Keyframe[],duration=140,options:KeyframeAnimationOptions={}){
 if(prefersQuietMotion()||typeof element.animate!=='function')return undefined;
 const a=element.animate(frames,{duration,easing:'cubic-bezier(.2,.8,.2,1)',...options});running.add(a);void a.finished.then(()=>running.delete(a),()=>running.delete(a));return a;
}
const taps=new Set<()=>void>();
export function tapShimmer(x:number,y:number){
 if(prefersQuietMotion())return;
 if(taps.size>=4)taps.values().next().value?.();
 const glow=document.createElement('span');glow.className='touch-glint';glow.setAttribute('aria-hidden','true');glow.style.left=x+'px';glow.style.top=y+'px';glow.innerHTML='<span class="touch-ring"></span><i>✦</i><i>✦</i><i>✦</i>';document.body.append(glow);
 let timer:ReturnType<typeof setTimeout>;const dispose=()=>{clearTimeout(timer);glow.remove();taps.delete(dispose);};taps.add(dispose);timer=setTimeout(dispose,360);
}
function surface(target:EventTarget|null,forClick=false):HTMLElement|undefined{
 if(!(target instanceof Element))return;
 const button=target.closest<HTMLButtonElement>('button');if(button)return button.disabled||button.getAttribute('aria-disabled')==='true'?undefined:button;
 const input=target.closest<HTMLInputElement>('input[type=checkbox],input[type=radio]');if(input)return input.disabled?undefined:input.closest<HTMLElement>('.setting-tile')??input;
 if(!forClick){const label=target.closest<HTMLElement>('.setting-tile');if(label&&!label.querySelector<HTMLInputElement>('input')?.disabled)return label;}
}
/** Capture listeners still work when game overlays intentionally stop event bubbling. */
export function installButtonFeel(onActivate:()=>void){
 const abort=new AbortController(),cancelled=new WeakMap<HTMLElement,number>(),presses=new Map<number,{element:HTMLElement;rect:DOMRect}>(),keys=new Set<HTMLElement>();
 const clear=()=>{presses.forEach(p=>p.element.classList.remove('is-pressed'));presses.clear();keys.forEach(e=>e.classList.remove('is-pressed'));keys.clear();};
 const on=(name:string,fn:EventListener)=>window.addEventListener(name,fn,{capture:true,signal:abort.signal});
 on('pointerdown',event=>{const e=event as PointerEvent;if(e.button!==0)return;const element=surface(e.target);if(!element)return;const rect=element.getBoundingClientRect();cancelled.delete(element);element.classList.add('is-pressed');presses.set(e.pointerId,{element,rect});try{element.setPointerCapture(e.pointerId);}catch{/* Pointer capture is optional on older WebViews. */}});
 on('pointermove',event=>{const e=event as PointerEvent,p=presses.get(e.pointerId);if(!p)return;const r=p.rect,inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;p.element.classList.toggle('is-pressed',inside);});
 const release=(event:Event)=>{const e=event as PointerEvent,p=presses.get(e.pointerId);if(p){p.element.classList.remove('is-pressed');const r=p.rect;if(e.type==='pointercancel'||e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)cancelled.set(p.element,performance.now()+400);try{p.element.releasePointerCapture(e.pointerId);}catch{}}presses.delete(e.pointerId);};on('pointerup',release);on('pointercancel',release);
 on('keydown',event=>{const e=event as KeyboardEvent;if(e.repeat||!['Enter',' '].includes(e.key))return;const element=surface(e.target);if(element){keys.add(element);element.classList.add('is-pressed');}});
 on('keyup',()=>{keys.forEach(e=>e.classList.remove('is-pressed'));keys.clear();});on('blur',clear);
 on('click',event=>{const e=event as MouseEvent,element=surface(e.target,true),pressedSurface=element??surface(e.target);if(pressedSurface&&e.detail&&((cancelled.get(pressedSurface)??0)>performance.now())){e.preventDefault();e.stopImmediatePropagation();return;}if(!element)return;if(e.detail&&((cancelled.get(element)??0)>performance.now())){e.preventDefault();e.stopImmediatePropagation();return;}element.classList.remove('is-pressed');onActivate();const r=element.getBoundingClientRect();tapShimmer(e.detail?e.clientX:r.x+r.width/2,e.detail?e.clientY:r.y+r.height/2);motion(element,[{scale:'.965'},{scale:'1.025',offset:.6},{scale:'1'}],170);});
 document.addEventListener('visibilitychange',clear,{signal:abort.signal});
 return()=>{abort.abort();clear();taps.forEach(dispose=>dispose());running.forEach(a=>a.cancel());running.clear();};
}
export function enterSheet(overlay:HTMLElement,dialog:HTMLElement){motion(overlay,[{opacity:0},{opacity:1}],120);motion(dialog,[{opacity:.35,scale:'.992'},{opacity:1,scale:'1'}],180);}
export function revealCollection(root:HTMLElement){if(prefersQuietMotion())return;Array.from(root.children).slice(0,6).forEach((e,i)=>{if(e instanceof HTMLElement)motion(e,[{opacity:.3,translate:'0 3px'},{opacity:1,translate:'0 0'}],140,{delay:i*16});});}
export function revealFeedback(element:HTMLElement|undefined){if(element)motion(element,[{opacity:.45},{opacity:1}],140);}
export function closeSheet(overlay:HTMLElement,done:()=>void){
 if(prefersQuietMotion()||typeof overlay.animate!=='function'){done();return()=>{};}
 overlay.inert=true;const a=motion(overlay,[{opacity:1},{opacity:0}],120);let finished=false;const finish=()=>{if(finished)return;finished=true;clearTimeout(timer);done();};const timer=setTimeout(finish,150);void a?.finished.then(finish,()=>{});return()=>{finished=true;clearTimeout(timer);a?.cancel();};
}

type Flight={key:string;phase:'capture'|'enter';queued?:{key:string;action:()=>void};cancel?:()=>void};
let flight:Flight|undefined;
let committing=false;
export function navigationBusy(){return !!flight;}
function frames(){return new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));}
/** Fast taps on the next screen queue once; duplicate taps on the leaving action do not run twice. */
export function navigate(key:string,action:()=>void){
 if(committing||prefersQuietMotion()){action();return true;}
 if(flight){if(flight.key!==key&&flight.phase==='enter')flight.queued={key,action};return false;}
 const task:Flight={key,phase:'capture'};flight=task;document.documentElement.dataset.navigationPhase='leaving';let applied=false;
 const commit=()=>{if(flight!==task||applied)return;applied=true;committing=true;try{action();}finally{committing=false;task.phase='enter';document.documentElement.dataset.navigationPhase='entering';}};
 const finish=()=>{if(flight!==task)return;const queued=task.queued;flight=undefined;delete document.documentElement.dataset.navigationPhase;if(queued)navigate(queued.key,queued.action);};
 const start=document.startViewTransition?.bind(document);
 if(typeof start==='function'){
  try{const view=start(async()=>{commit();await frames();});task.cancel=()=>view.skipTransition();void view.ready.catch(()=>{});void view.updateCallbackDone.catch(()=>{});void view.finished.then(finish,()=>{commit();finish();});return true;}catch{/* Older WebViews use a short fade-through below. */}
 }
 void(async()=>{let out:Animation|undefined;try{out=motion(document.body,[{opacity:1},{opacity:.55}],65,{fill:'forwards'});task.cancel=()=>out?.cancel();await out?.finished;if(flight!==task)return;commit();await frames();out?.cancel();const incoming=motion(document.body,[{opacity:.55},{opacity:1}],125);task.cancel=()=>incoming?.cancel();await incoming?.finished;}catch{commit();}finally{out?.cancel();finish();}})();return true;
}
export function cancelNavigation(){const active=flight;flight=undefined;delete document.documentElement.dataset.navigationPhase;active?.cancel?.();}
