import { motion } from './gameFeel';
/** Small compositor animations preserve an item's identity across DOM rerenders. */
const tracked = ['data-road-tile','data-laundry-piece', 'data-event', 'data-gift-cell', 'data-mirror', 'data-pipe', 'data-photo-figure'];
export function capturePuzzle(root?: HTMLElement) { const positions = new Map<string, DOMRect>(); if (root)
    for (const attr of tracked)
        for (const e of Array.from(root.querySelectorAll<HTMLElement>(`[${attr}]`)))
            positions.set(`${attr}:${e.getAttribute(attr)}`, e.getBoundingClientRect()); const beam = root?.querySelector<HTMLElement>('.lift-beam')?.style.transform; const pans = Array.from(root?.querySelectorAll<HTMLElement>('.lift-pan') ?? []).map(e => e.style.transform); const states=new Map<string,string>();if(root)for(const e of Array.from(root.querySelectorAll<HTMLElement>('button[data-scent-bottle],button[data-code-slot],button[data-photo-guest],button[data-rune],button[data-mirror],button[data-pipe],button[data-gift-cell]'))){const key=Array.from(e.attributes).filter(a=>a.name.startsWith('data-')).map(a=>a.name+':'+a.value).join('|');states.set(key,e.className+e.innerHTML);}return { positions, beam, pans, states }; }
export function animatePuzzle(root: HTMLElement, old: ReturnType<typeof capturePuzzle>) {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || typeof Element.prototype.animate !== 'function')
        return;
    for(const e of Array.from(root.querySelectorAll<HTMLElement>('button[data-scent-bottle],button[data-code-slot],button[data-photo-guest],button[data-rune],button[data-mirror],button[data-pipe],button[data-gift-cell]'))){const key=Array.from(e.attributes).filter(a=>a.name.startsWith('data-')).map(a=>a.name+':'+a.value).join('|');const before=old.states.get(key);if(before!==undefined&&before!==e.className+e.innerHTML)motion(e,[{opacity:.65,filter:'brightness(1.18)'},{opacity:1,filter:'brightness(1)'}],150);}
    for (const attr of tracked)
        for (const e of Array.from(root.querySelectorAll<HTMLElement>(`[${attr}]`))) {
            const before = old.positions.get(`${attr}:${e.getAttribute(attr)}`);
            if (!before)
                continue;
            const now = e.getBoundingClientRect(), dx = before.x - now.x, dy = before.y - now.y;
            if (Math.abs(dx) + Math.abs(dy) > 2 && before.width === now.width && before.height === now.height)
                { const base=getComputedStyle(e).transform;const suffix=base==='none'?'':base;
                if(attr==='data-laundry-piece'){
                    e.animate([{transform:`translate(${dx}px,${dy}px) ${suffix}`,filter:'brightness(1)'},{transform:`translate(${-dx*.035}px,${-dy*.035}px) ${suffix}`,filter:'brightness(1.15)',offset:.8},{transform:`translate(0,0) ${suffix}`,filter:'brightness(1)'}],{duration:390,easing:'cubic-bezier(.18,.75,.3,1)'});
                    const cloth=e.querySelector<HTMLElement>('.laundry-art,.quilt-stars');if(cloth)motion(cloth,[{rotate:'-3deg'},{rotate:'2deg',offset:.65},{rotate:'0deg'}],440);
                    const puff=document.createElement('span');puff.className='laundry-puff';puff.setAttribute('aria-hidden','true');puff.textContent='✦ · ✧';e.append(puff);setTimeout(()=>puff.remove(),500);
                }else e.animate([{ transform: `translate(${dx}px,${dy}px) ${suffix}` }, { transform: `translate(0,0) ${suffix}` }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' }); }
        }
    const beam = root.querySelector<HTMLElement>('.lift-beam');
    if (beam && old.beam && old.beam !== beam.style.transform)
        beam.animate([{ transform: old.beam }, { transform: beam.style.transform }], { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)' });
    root.querySelectorAll<HTMLElement>('.lift-pan').forEach((e, i) => { if (old.pans[i] && old.pans[i] !== e.style.transform)
        e.animate([{ transform: old.pans[i] }, { transform: e.style.transform }], { duration: 360, easing: 'ease-out' }); });
}
export const episodeHosts: Record<string, {
    kind: string;
    name: [
        string,
        string
    ];
    activity: string;
}> = {
    'scent-room':{kind:'lantern',name:['燈燈','Ember'],activity:'steam'},'key-cabinet':{kind:'mummy',name:['卷卷','Rollo'],activity:'listen'},'group-photo':{kind:'fox',name:['小柚','Yuzu'],activity:'wave'},'cake-case': { kind: 'jiangshi', name: ['小豆', 'Dou'], activity: 'fold' }, 'luggage-run': { kind: 'fox', name: ['小柚', 'Yuzu'], activity: 'walk' }, 'dream-door': { kind: 'baku', name: ['夢夢', 'Nemu'], activity: 'dream' }, 'lift-balance': { kind: 'mummy', name: ['卷卷', 'Rollo'], activity: 'lift' }, 'moon-mirrors': { kind: 'werewolf', name: ['月毛', 'Luno'], activity: 'moon' }, 'gift-box': { kind: 'fox', name: ['小柚', 'Yuzu'], activity: 'wrap' }, 'midnight-knock': { kind: 'mummy', name: ['卷卷', 'Rollo'], activity: 'listen' }, 'spring-pipes': { kind: 'lantern', name: ['燈燈', 'Ember'], activity: 'steam' }, 'lost-letters': { kind: 'fox', name: ['小柚', 'Yuzu'], activity: 'wave' }
};
export function episodeCompanion(id: string, english: boolean) { const host = episodeHosts[id], span = document.createElement('span'); span.className = 'episode-companion'; span.dataset.activity = host.activity; span.style.setProperty('--companion-art', `url('/art/${host.kind}-poses.png')`); span.setAttribute('role', 'img'); span.setAttribute('aria-label', host.name[english ? 1 : 0]); span.style.setProperty('--pose-phase',`${-performance.now()%3600}ms`);span.innerHTML = '<span class="companion-shadow"></span><span class="companion-body"></span><span class="companion-spark" aria-hidden="true">✦</span>'; return span; }
