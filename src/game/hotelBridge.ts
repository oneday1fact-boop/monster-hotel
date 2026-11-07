/** Painted gallery is clipped into a back layer and low front rails, so guests walk inside it. */
export function hotelBridge(){
 const sprite='<img class="hotel-gallery-art" src="/art/hotel/glass-gallery.png" alt="" draggable="false">';
 const back=document.createElement('div');back.className='hotel-bridge';back.setAttribute('aria-hidden','true');back.innerHTML=sprite;
 const rails=[431,754].map(y=>{const rail=document.createElement('div');rail.className='hotel-bridge-rail';rail.style.top=(y-35)+'px';rail.style.zIndex=String(y+15);rail.innerHTML=sprite;rail.querySelector<HTMLElement>('img')!.style.top=(-19-(y-35))+'px';return rail;});
 const gate=document.createElement('div');gate.className='hotel-bridge-gate';gate.innerHTML='<span>✦</span>';gate.setAttribute('aria-hidden','true');return{back,rails,gate};
}
