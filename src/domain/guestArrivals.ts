import type {Save} from '../platform/save';
import {episodeIds,type EpisodeId} from './episodes';
export const guestArrivals=[{id:'nimbus',episode:'storm-arrival',name:['小雷（小雲）','Nimbus'],kind:'stormling'},{id:'momo',episode:'clockwork-guest',name:['蜜寶','Momo'],kind:'pooh'}] as const;
export type GuestArrival=typeof guestArrivals[number];
export const arrivalFor=(id:string)=>guestArrivals.find(e=>e.episode===id);
/** A single queue; finishing the first welcome and intervening chapters precedes the second. */
export function pendingArrival(save:Save):GuestArrival|undefined{
 for(const e of guestArrivals){if(save.episodes?.includes(e.episode))continue;const before=episodeIds.slice(0,episodeIds.indexOf(e.episode));return save.completed.includes(1)&&before.every(id=>save.episodes?.includes(id))?e:undefined;}return undefined;
}
export function arrivalChapter(id:EpisodeId){return arrivalFor(id);}
