import type { Locale } from '../i18n/catalog';
import { ambiences, lobbyAmbience, type Ambience } from '../domain/ambience';
import type { Save } from '../platform/save';
import { showDetails } from './details';
export const ambienceNames = { 'zh-Hant': { night:'午夜星光', autumn:'秋日黃昏', morning:'春日清晨', winter:'雪日午後' }, en:{night:'Midnight',autumn:'Autumn dusk',morning:'Spring morning',winter:'Snowy afternoon'} };
export function showAmbiencePicker(locale: Locale, save: Save, choose: (theme: Ambience) => void, back: () => void) {
  const content = document.createElement('div'); content.className='ambience-grid';
  for (const theme of ambiences) {
    const b=document.createElement('button');b.className=`ambience-tile ambience-tile--${theme}`; b.dataset.ambience=theme;b.setAttribute('aria-pressed',String(lobbyAmbience(save)===theme));
    const label=document.createElement('strong');label.textContent=ambienceNames[locale][theme];b.append(label);b.onclick=()=>choose(theme);content.append(b);
  }
  return showDetails({kind:'card',title:locale==='en'?'Hotel scenery':'酒店景色',eyebrow:'',close:locale==='en'?'Back':'返回',sections:[],content},back);
}
