import { levels, levelTitle } from './levels';
import { chapterIds, type ChapterId } from './storyChapters';
import { storyOutcome } from './storyNight';
import { chapterUI } from '../i18n/storyNight';
import type { Locale } from '../i18n/catalog';
import type { Save } from '../platform/save';
export type Challenge = { id:string; kind:'puzzle'; puzzle:number } | { id:string; kind:'encounter'; chapter:ChapterId };
const encountersAfter: Record<number,ChapterId> = {0:1,2:2,5:3,8:4,12:5,16:6};
/** Stable source IDs preserve older saves; visible numbering grows with the content list. */
export const challenges: readonly Challenge[] = [
 {id:'encounter-1',kind:'encounter',chapter:1},
 ...levels.flatMap(level=>{
  const nodes:Challenge[]=[{id:`puzzle-${level.id}`,kind:'puzzle',puzzle:level.id}];const chapter=encountersAfter[level.id];
  if(chapter&&chapterIds.includes(chapter))nodes.push({id:`encounter-${chapter}`,kind:'encounter',chapter});return nodes;
 }),
];
export function challengeComplete(save:Save,node:Challenge){return node.kind==='puzzle'?save.completed.includes(node.puzzle):!!storyOutcome(save,node.chapter);}
export function challengeUnlocked(save:Save,id:string){const index=challenges.findIndex(n=>n.id===id);return index>=0&&(challengeComplete(save,challenges[index])||challenges.slice(0,index).every(n=>challengeComplete(save,n)));}
export function nextChallenge(save:Save){return challenges.find(n=>!challengeComplete(save,n))??challenges.at(-1)!;}
export function afterChallenge(id:string){return challenges[challenges.findIndex(n=>n.id===id)+1];}
export function challengeTitle(node:Challenge,locale:Locale){return node.kind==='puzzle'?levelTitle(node.puzzle,locale):chapterUI(locale,node.chapter).title;}
export function challengeProgress(save:Save){return challenges.filter(n=>challengeComplete(save,n)).length;}
