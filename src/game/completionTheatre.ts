import type {EpisodeId} from '../domain/episodes';
import {liveActor} from './liveWidgets';
const guests={pooh:'pooh',nimbus:'stormling',luno:'werewolf',dou:'jiangshi',ember:'lantern',rollo:'mummy',yuzu:'fox',nemu:'baku'} as const;
type GuestId=keyof typeof guests;
const stories:Record<EpisodeId,{act:string;cast:GuestId[];room:string;prop:string}>={
 'cloud-courier':{act:'delivery',cast:['nimbus','yuzu'],room:'hearth',prop:'luggage'},
 'cloud-lanterns':{act:'moon',cast:['nimbus','ember'],room:'elegant',prop:'moon'},
 'honey-pots':{act:'honey',cast:['pooh','rollo','nimbus'],room:'basement',prop:'tea'},
 'shadow-tea':{act:'shadow',cast:['pooh','ember','nimbus'],room:'elegant',prop:'moon'},
 'pillow-bounce':{act:'picnic',cast:['pooh','luno','nimbus'],room:'hearth',prop:'star'},
 'clockwork-guest':{act:'welcome',cast:['pooh','nimbus','rollo'],room:'elegant',prop:'key'},
 'storm-arrival':{act:'tea',cast:['nimbus','ember'],room:'hearth',prop:'tea'},
 'cake-case':{act:'laundry',cast:['dou','rollo'],room:'linen',prop:'quilt'},
 'luggage-run':{act:'arrival',cast:['yuzu','rollo'],room:'elegant',prop:'luggage'},
 'dream-door':{act:'dream',cast:['nemu','yuzu'],room:'linen',prop:'cloud'},
 'lift-balance':{act:'delivery',cast:['rollo','dou'],room:'basement',prop:'luggage'},
 'moon-mirrors':{act:'moon',cast:['luno','ember'],room:'elegant',prop:'moon'},
 'gift-box':{act:'gift',cast:['yuzu','ember'],room:'hearth',prop:'gift'},
 'midnight-knock':{act:'tea',cast:['rollo','dou'],room:'basement',prop:'tea'},
 'spring-pipes':{act:'spa',cast:['ember','nemu'],room:'hearth',prop:'steam'},
 'lost-letters':{act:'dance',cast:['luno','dou','ember','rollo'],room:'elegant',prop:'star'},
 'scent-room':{act:'perfume',cast:['ember','yuzu'],room:'hearth',prop:'bottle'},
 'key-cabinet':{act:'unlock',cast:['rollo','yuzu'],room:'linen',prop:'key'},
 'group-photo':{act:'portrait',cast:['ember','dou','nemu','luno','rollo','yuzu'],room:'elegant',prop:'camera'}
};
const shapes:Record<string,string>={
 quilt:'<path d="M12 18Q48 10 88 18L85 76Q48 68 15 76Z" fill="#c9a4df"/><path d="M20 20V72M80 20V72" stroke="#ffe4aa" stroke-width="6"/><path d="M47 29L52 40L65 42L56 50L58 63L47 57L36 63L38 50L29 42L42 40Z" fill="#fff0ae"/>',
 luggage:'<rect x="30" y="7" width="40" height="20" rx="8" fill="none"/><rect x="16" y="23" width="68" height="58" rx="14" fill="#c58d6b"/><path d="M32 26V78M68 26V78" stroke="#ffe2a4" stroke-width="8"/><circle cx="30" cy="86" r="6" fill="#754c69"/><circle cx="70" cy="86" r="6" fill="#754c69"/>',
 gift:'<rect x="15" y="34" width="70" height="50" rx="7" fill="#d994b2"/><path d="M50 34V84" stroke="#ffe2a4" stroke-width="13"/><g class="theatre-gift-lid"><rect x="10" y="25" width="80" height="17" rx="6" fill="#b894db"/><path d="M50 27Q15 30 28 12Q39 3 50 27Q62 3 74 13Q84 31 50 27" fill="#ffe2a4"/></g>',
 moon:'<path d="M69 10A38 38 0 1 0 84 69A32 32 0 0 1 69 10Z" fill="#ffe49b"/><path d="M70 37L75 46L85 48L77 55L79 66L70 61L60 66L62 55L54 48L65 46Z" fill="#fff3bb"/>',
 tea:'<ellipse cx="50" cy="81" rx="40" ry="8" fill="#c9aad7"/><path d="M20 34H73L68 70Q46 86 25 70Z" fill="#ffe4bd"/><path d="M74 40Q101 38 89 59Q83 67 70 61" fill="none"/><path class="theatre-steam" d="M34 25Q21 14 36 4M55 25Q42 14 57 4" fill="none" stroke="#fff3cf" stroke-width="5"/>',
 steam:'<ellipse cx="50" cy="70" rx="42" ry="14" fill="#a4d7d3"/><ellipse class="theatre-ripple" cx="50" cy="70" rx="28" ry="8" fill="none" stroke="#fff2bd"/><path class="theatre-steam" d="M25 55Q10 37 30 18M50 54Q35 35 55 15M75 55Q59 36 78 18" fill="none" stroke="#ffe8c3" stroke-width="7"/>',
 bottle:'<rect x="37" y="10" width="26" height="15" rx="5" fill="#e9bf70"/><path d="M39 25V35Q12 38 20 79Q50 93 80 79Q88 38 61 35V25" fill="#b5a2db"/><path d="M23 60Q50 50 77 60L75 78Q50 89 25 78Z" fill="#b7dec4"/><path d="M49 42Q31 44 39 60Q50 61 49 42Q68 44 60 60Q48 62 49 42" fill="#eff2be"/>',
 key:'<circle cx="32" cy="30" r="19" fill="#f5ce7d"/><circle cx="32" cy="30" r="7" fill="#9470a7"/><path d="M44 44L81 81M66 64L77 54M76 74L87 64" stroke="#ffdf92" stroke-width="12"/>',
 camera:'<path d="M29 27L36 15H64L71 27" fill="#c7a8d9"/><rect x="10" y="27" width="80" height="53" rx="12" fill="#9971b3"/><circle cx="50" cy="53" r="19" fill="#bde0db"/><circle cx="50" cy="53" r="10" fill="#5e527b"/><circle cx="77" cy="38" r="4" fill="#ffe2a4"/>',
 cloud:'<path d="M18 72Q0 55 20 43Q15 15 43 20Q64 3 77 31Q106 35 88 64Q76 84 18 72Z" fill="#d7c7e8"/><path d="M35 47L48 47L35 62H49M59 33H71L59 47H72" stroke="#ffe8ad" stroke-width="5" fill="none"/>',
 star:'<path d="M50 8L62 35L92 39L70 59L76 89L50 75L24 89L30 59L8 39L38 35Z" fill="#ffe6a1"/>'
};
/** Presentation only. Completion/rewards are committed before this runs; navigation never waits for it. */
export function completionTheatre(id:EpisodeId){
 const story=stories[id],root=document.createElement('div');root.className='completion-theatre';root.dataset.act=story.act;root.dataset.castCount=String(story.cast.length);root.setAttribute('aria-hidden','true');root.style.setProperty('--theatre-room',`url('/art/rooms/${story.room}.png')`);
 const backdrop=document.createElement('div');backdrop.className='theatre-backdrop';root.append(backdrop);
 const path=document.createElement('span');path.className='theatre-path';root.append(path);
 story.cast.forEach((id,i)=>{const place=document.createElement('div');place.className='theatre-guest';place.dataset.guest=id;place.style.setProperty('--cast-index',String(i));place.style.setProperty('--cast-left',`${4+(i%3)*32}%`);place.style.setProperty('--cast-bottom',`${7+(i<3?36:0)}%`);place.append(liveActor(guests[id]));root.append(place);});
 const prop=document.createElement('div');prop.className='theatre-prop';prop.dataset.prop=story.prop;prop.innerHTML=`<svg viewBox="0 0 100 100" fill="none" stroke="#62405e" stroke-width="3" stroke-linejoin="round" aria-hidden="true">${shapes[story.prop]}</svg>`;root.append(prop);
 const lights=document.createElement('div');lights.className='theatre-lights';for(let i=0;i<8;i++){const light=document.createElement('i');light.textContent='✦';light.style.setProperty('--spark-index',String(i));light.style.setProperty('--spark-top',`${10+(i%3)*11}%`);lights.append(light);}root.append(lights);return root;
}
