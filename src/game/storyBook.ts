import type { Save } from '../platform/save';
import { chapterIds, chapterRewards, chapterPairs, type ChapterId } from '../domain/storyChapters';
import { storyOutcome, storyUnlocked } from '../domain/storyNight';
import { chapterUI } from '../i18n/storyNight';
import type { Locale } from '../i18n/catalog';
import { showDetails } from './details';
import { guestById } from '../domain/puzzle';
import { characters } from '../i18n/catalog';
import { icon } from './icons';
export function showStoryBook(locale: Locale, save: Save, choose: (id: ChapterId) => void, back: () => void) {
  const content = document.createElement('div'); content.className = 'story-book';
  for (const id of chapterIds) {
    const t = chapterUI(locale, id); const unlocked = storyUnlocked(save, id); const finished = !!storyOutcome(save, id);
    const b = document.createElement('button'); b.className = `story-chapter story-chapter--${id}`; b.dataset.chapter = String(id); b.disabled = !unlocked;
    const number = document.createElement('span'); number.className = 'chapter-number'; number.textContent = String(id).padStart(2, '0');
    const title = document.createElement('strong'); title.textContent = t.title;
    const note = document.createElement('span'); note.textContent = !unlocked ? t.locked : finished ? (locale === 'en' ? 'Completed · Replay' : '已完成 · 可以重看') : `${locale === 'en' ? 'First reward' : '首次獎勵'} +${chapterRewards[id]}`;
    b.append(number, icon(finished ? 'check' : unlocked ? 'star' : 'moon'), title, note); if (id >= 4) { const newcomer=document.createElement('span');newcomer.className=`chapter-newcomer story-face story-face--${guestById(chapterPairs[id][0]).kind}`;newcomer.setAttribute('aria-hidden','true'); b.prepend(newcomer); b.setAttribute('aria-label',`${t.title} · ${characters[locale][guestById(chapterPairs[id][0]).kind].name}`); } b.onclick = () => choose(id); content.append(b);
  }
  const wrapper=document.createElement('div');wrapper.className='story-book-shell';
  const nav=document.createElement('div');nav.className='story-book-nav';
  const previous=document.createElement('button');previous.className='game-secondary-button';previous.textContent=locale==='en'?'Earlier stories':'前面故事';
  const next=document.createElement('button');next.className='game-primary-button';next.textContent=locale==='en'?'More stories':'後續故事';
  const sync=()=>{previous.disabled=content.scrollLeft<5;next.disabled=content.scrollLeft>=content.scrollWidth-content.clientWidth-5;};
  const turn=(direction:number)=>{const first=content.children[0] as HTMLElement;const second=content.children[1] as HTMLElement;const stride=second.offsetLeft-first.offsetLeft;const count=Math.max(1,Math.round(content.clientWidth/first.offsetWidth));content.scrollBy({left:direction*count*stride,behavior:'auto'});sync();};
  previous.onclick=()=>turn(-1);next.onclick=()=>turn(1);content.addEventListener('scroll',sync);nav.append(previous,next);wrapper.append(content,nav);
  const dispose=showDetails({kind:'card',title:chapterUI(locale,1).chapters,eyebrow:'',close:locale==='en'?'Back':'返回',sections:[],content:wrapper},back);
  const active=chapterIds.find(id=>storyUnlocked(save,id)&&!storyOutcome(save,id))??6;
  requestAnimationFrame(()=>{if(!content.isConnected)return;const card=content.children[active-1] as HTMLElement;content.scrollLeft=card.offsetLeft-content.offsetLeft;sync();});return dispose;
}
