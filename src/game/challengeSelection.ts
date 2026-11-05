import {challenges,challengeComplete,challengeUnlocked,challengeProgress,challengeTitle,nextChallenge,type Challenge} from '../domain/campaign';
import type {Save} from '../platform/save';
import type {Locale} from '../i18n/catalog';
import {showDetails} from './details';
export function showChallengeSelection(locale:Locale,save:Save,choose:(node:Challenge)=>void,back:()=>void){
 const root=document.createElement('div');root.className='challenge-map';const grid=document.createElement('div');grid.className='challenge-grid';
 const nav=document.createElement('div');nav.className='fixed-page-nav';const prev=document.createElement('button');prev.className='game-secondary-button';prev.textContent=locale==='en'?'Previous':'上一頁';const next=document.createElement('button');next.className='game-primary-button';next.textContent=locale==='en'?'Next':'下一頁';const info=document.createElement('span');
 const capacity=12;let page=Math.floor(challenges.indexOf(nextChallenge(save))/capacity);
 const render=()=>{grid.replaceChildren();for(const node of challenges.slice(page*capacity,(page+1)*capacity)){
  const b=document.createElement('button');b.className='challenge-node';b.dataset.challenge=node.id;b.dataset.kind=node.kind;if(node.kind==='puzzle')b.dataset.puzzle=String(node.puzzle);
  b.disabled=!challengeUnlocked(save,node.id);b.setAttribute('aria-label',`${locale==='en'?'Level':'第'} ${challenges.indexOf(node)+1}${locale==='en'?'':'關'} · ${challengeTitle(node,locale)}`);
  const number=document.createElement('strong');number.textContent=String(challenges.indexOf(node)+1).padStart(2,'0');const label=document.createElement('span');label.textContent=challengeTitle(node,locale);const state=document.createElement('small');state.textContent=challengeComplete(save,node)?'★':b.disabled?'🔒':node.kind==='encounter'?'♥':'✦';b.append(number,label,state);b.onclick=()=>choose(node);grid.append(b);
 }prev.disabled=page===0;next.disabled=(page+1)*capacity>=challenges.length;info.textContent=`${page+1} / ${Math.ceil(challenges.length/capacity)} · ${locale==='en'?'Cleared':'已完成'} ${challengeProgress(save)}`;};
 prev.onclick=()=>{page--;render();};next.onclick=()=>{page++;render();};nav.append(prev,info,next);root.append(grid,nav);render();
 return showDetails({kind:'card',title:locale==='en'?'Puzzle challenges':'解謎挑戰',eyebrow:'',close:locale==='en'?'Back':'返回',sections:[],content:root},back);
}
