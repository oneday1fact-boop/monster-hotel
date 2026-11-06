import {languageToggle} from './languageToggle';
import type {Save} from '../platform/save';
import {ambiences,type Ambience} from '../domain/ambience';
import {ownedScenes,scenePrices} from '../domain/sceneryShop';
import {ambienceNames} from './ambiencePicker';
import { decorations, type DecoratedWallet } from '../domain/decorations';
import { decorationCopy, hotelUI } from '../i18n/hotel';
import type { Locale } from '../i18n/catalog';
import type { Preferences } from '../platform/preferences';
import { icon, type IconName } from './icons';

export type ShopTab='decor'|'scenes';
export interface ShopActions{buy(id:string,owned:boolean):void;preview(id:string):void;scene(theme:Ambience):void;page(tab:ShopTab,page:number):void}
export function shopContent(locale:Locale,save:Save,actions:ShopActions,tab:ShopTab='decor',page=0,message=''):HTMLElement{
 const root=document.createElement('div');root.className='boutique';const tabs=document.createElement('div');tabs.className='boutique-tabs';
 for(const key of ['decor','scenes'] as const){const b=document.createElement('button');b.className=key===tab?'game-primary-button':'game-secondary-button';b.textContent=key==='decor'?(locale==='en'?'Room sets':'客房布置'):(locale==='en'?'Hotel scenes':'酒店場景');b.dataset.tab=key;b.setAttribute('aria-pressed',String(key===tab));b.onclick=()=>actions.page(key,0);tabs.append(b);}
 const wallet=document.createElement('span');wallet.className='boutique-wallet';wallet.append(icon('coin'),document.createTextNode(String(save.coins)));tabs.append(wallet);
 const cards=document.createElement('div');cards.className=`boutique-cards boutique-cards--${tab}`;const size=tab==='decor'?3:2;const items=tab==='decor'?decorations:ambiences;const pages=Math.ceil(items.length/size);page=Math.min(page,pages-1);
 if(tab==='decor')decorations.slice(page*size,(page+1)*size).forEach(item=>{const card=document.createElement('article');card.className='boutique-item';card.dataset.decoration=item.id;const owned=save.decorations?.includes(item.id)??false;const equipped=save.equipped?.includes(item.id)??false;const see=document.createElement('button');see.className='boutique-preview';see.dataset.action='preview';see.setAttribute('aria-label',`${locale==='en'?'Preview':'預覽'} ${decorationCopy[locale][item.id].name}`);const art=document.createElement('span');art.className=`boutique-art boutique-art--${item.id}`;const name=document.createElement('strong');name.textContent=decorationCopy[locale][item.id].name;see.append(art,name);see.onclick=()=>actions.preview(item.id);const buy=document.createElement('button');buy.className='game-primary-button';buy.dataset.action='buy';buy.textContent=owned?(equipped?(locale==='en'?'Put away':'收起'):(locale==='en'?'Place':'擺放')):`${locale==='en'?'Buy':'買入'} ${item.price}`;buy.disabled=!owned&&save.coins<item.price;buy.onclick=()=>actions.buy(item.id,owned);card.append(see,buy);cards.append(card);});
 else ambiences.slice(page*size,(page+1)*size).forEach(theme=>{const card=document.createElement('article');card.className='boutique-item';card.dataset.scene=theme;const owned=ownedScenes(save).includes(theme);const see=document.createElement('button');see.className=`boutique-preview scene-art scene-art--${theme}`;see.dataset.action='preview';const name=document.createElement('strong');name.textContent=ambienceNames[locale][theme];see.append(name);see.onclick=()=>actions.scene(theme);const buy=document.createElement('button');buy.className='game-primary-button';buy.dataset.action='scene';buy.textContent=owned?(save.ambience===theme||(!save.ambience&&theme==='morning')?(locale==='en'?'In use':'使用中'):(locale==='en'?'Use':'套用')):`${locale==='en'?'Buy':'買入'} ${scenePrices[theme]}`;buy.disabled=!owned&&save.coins<scenePrices[theme];buy.onclick=()=>actions.scene(theme);card.append(see,buy);cards.append(card);});
 const nav=document.createElement('div');nav.className='fixed-page-nav';const previous=document.createElement('button');previous.className='game-secondary-button';previous.textContent=locale==='en'?'Previous':'上一頁';previous.disabled=page===0;previous.onclick=()=>actions.page(tab,page-1);const next=document.createElement('button');next.className='game-secondary-button';next.textContent=locale==='en'?'Next':'下一頁';next.disabled=page===pages-1;next.onclick=()=>actions.page(tab,page+1);const status=document.createElement('span');status.setAttribute('role','status');status.textContent=message||`${page+1} / ${pages} · ${locale==='en'?'Preview before buying':'先預覽，再擺放'}`;nav.append(previous,status,next);root.append(tabs,cards,nav);return root;
}
export function settingsContent(locale: Locale, preferences: Preferences, update: (prefs: Preferences) => boolean, preview: () => void, language: () => void): HTMLElement {
  const content = document.createElement('div'); content.className = 'settings-controls'; const t = hotelUI[locale]; let current = { ...preferences };
  const tiles = document.createElement('div'); tiles.className = 'settings-tiles';
  for (const key of ['music', 'sound', 'haptics'] as const) {
    const label = document.createElement('label'); label.className = 'setting-tile'; label.append(icon(key));
    const text = document.createElement('span'); text.className = 'setting-name'; text.textContent = t[key];
    const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = current[key]; checkbox.name = key; checkbox.className = 'game-switch-input';
    const toggle = document.createElement('span'); toggle.className = 'game-switch'; toggle.setAttribute('aria-hidden', 'true');
    checkbox.onchange = () => { current = { ...current, [key]: checkbox.checked }; status.textContent = update(current) ? t.saved : t.session; };
    label.append(text, checkbox, toggle); tiles.append(label);
  }
  const actions = document.createElement('div'); actions.className = 'settings-actions';
  const lang = document.createElement('button'); lang.className = 'game-secondary-button'; lang.append(icon('globe'), document.createTextNode(locale === 'en' ? 'Language' : '語言')); lang.onclick = language;
  const test = document.createElement('button'); test.className = 'game-secondary-button'; test.append(icon('sound'), document.createTextNode(locale === 'en' ? 'Preview' : '試聽')); test.setAttribute('aria-label', t.test); test.onclick = preview;
  const note = document.createElement('p'); note.className = 'visually-hidden'; note.textContent = t.audioNote;
  const status = document.createElement('p'); status.className = 'settings-status'; status.setAttribute('role', 'status'); actions.append(lang, test); content.append(tiles, actions, note, status); return content;
}
export function languageContent(locale:Locale,choose:(locale:Locale)=>void):HTMLElement{
 const content=document.createElement('div');content.className='language-tiles language-choice';content.append(languageToggle(locale,choose));return content;
}
