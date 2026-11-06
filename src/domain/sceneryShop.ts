import { isAmbience, type Ambience } from './ambience';
export const scenePrices:Record<Ambience,number>={morning:0,night:1600,autumn:2200,winter:2800};
export interface SceneWallet {coins:number;ambience?:Ambience;scenes?:Ambience[]}
/** Preserve only a legacy player's currently selected free scenery, never charge retroactively. */
export function ownedScenes(wallet:SceneWallet):Ambience[]{return [...new Set<Ambience>(['morning',...(wallet.scenes??(isAmbience(wallet.ambience)?[wallet.ambience]:[]))])];}
export function buyScene<T extends SceneWallet>(wallet:T,scene:Ambience):{wallet:T;status:'bought'|'owned'|'insufficient'|'unknown'}{
 if(!isAmbience(scene))return{wallet,status:'unknown'};
 const owned=ownedScenes(wallet);if(owned.includes(scene))return{wallet:{...wallet,scenes:owned,ambience:scene},status:'owned'};
 if(!Number.isSafeInteger(wallet.coins)||wallet.coins<scenePrices[scene])return{wallet,status:'insufficient'};
 return{wallet:{...wallet,coins:wallet.coins-scenePrices[scene],scenes:[...owned,scene],ambience:scene},status:'bought'};
}
