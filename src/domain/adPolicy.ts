/** Placement planning only. The shipped offline game has no ad SDK, tracking or live ad requests. */
export type AdPlacement='completion-bonus'|'hotel-supplies'|'lobby-break';
export interface AdContext{enabled:boolean;online:boolean;foreground:boolean;providerReady:boolean;consent:'unknown'|'allowed'|'denied';surface:'completion'|'lobby'|'hotel'|'puzzle';completed:number;completedSinceInterstitial:number;secondsSinceInterstitial:number;rewardedToday:number;firstCompletion:boolean;playerOptedIn:boolean}
export const adPlacements={
 'completion-bonus':{format:'rewarded',coins:100,dailyCap:2},
 'hotel-supplies':{format:'rewarded',coins:100,dailyCap:2},
 'lobby-break':{format:'interstitial',minimumCompleted:3,minimumSinceLast:3,cooldownSeconds:180}
} as const;
export function mayOfferAd(placement:AdPlacement,c:AdContext):boolean{
 if(!c.enabled||!c.online||!c.foreground||!c.providerReady||c.consent!=='allowed'||!Number.isSafeInteger(c.completed)||c.completed<0)return false;
 if(placement==='lobby-break')return c.surface==='lobby'&&c.completed>=3&&c.completedSinceInterstitial>=3&&c.secondsSinceInterstitial>=180;
 if(!c.playerOptedIn||!Number.isSafeInteger(c.rewardedToday)||c.rewardedToday<0||c.rewardedToday>=2)return false;
 return placement==='completion-bonus'?c.surface==='completion'&&c.firstCompletion&&c.completed>1:c.surface==='hotel'&&c.completed>=3;
}
