import type {Save} from '../platform/save';
import {jobKeys,validJobKey,jobRank,commissionRecipe,freshStep,validStep,applyPuzzleMove,commissionSolved,type JobKey,type PuzzleMove} from './commissionPuzzles';
export const commissionRewards=[320,480,720] as const;
export interface CommissionDraft{serial:number;step:number[];past:number[][];future:number[][];moves:number;hints:number}
export interface Commissions{version:1;counts:Partial<Record<JobKey,number>>;drafts:Partial<Record<JobKey,CommissionDraft>>}
export const freshCommissions=():Commissions=>({version:1,counts:{},drafts:{}});
export const jobSerial=(save:Save,key:JobKey)=>save.commissions?.counts[key]??0;
export const freshCommissionDraft=(key:JobKey,serial:number):CommissionDraft=>({serial,step:freshStep(commissionRecipe(key,serial)),past:[],future:[],moves:0,hints:0});
export function readCommissions(v:unknown):Commissions|undefined{
 if(!v||typeof v!=='object'||(v as Commissions).version!==1)return;const d=v as Commissions,out=freshCommissions();
 for(const key of jobKeys){const count=d.counts?.[key];if(Number.isSafeInteger(count)&&count!>=0&&count!<=1_000_000)out.counts[key]=count;const a=d.drafts?.[key],serial=out.counts[key]??0;if(!a||a.serial!==serial)continue;const p=commissionRecipe(key,serial);if(!validStep(p,a.step)||!Array.isArray(a.past)||!Array.isArray(a.future)||a.past.length>256||a.future.length>256||![...a.past,...a.future].every(s=>validStep(p,s))||![a.moves,a.hints].every(n=>Number.isSafeInteger(n)&&n>=0&&n<=1_000_000))continue;out.drafts[key]={serial,step:[...a.step],past:a.past.map(s=>[...s]),future:a.future.map(s=>[...s]),moves:a.moves,hints:a.hints};}return out;
}
export function openCommission(save:Save,key:JobKey):Save{if(!validJobKey(key))return save;const jobs=save.commissions??freshCommissions(),serial=jobSerial(save,key);if(jobs.drafts[key]?.serial===serial)return save;return {...save,commissions:{...jobs,drafts:{...jobs.drafts,[key]:freshCommissionDraft(key,serial)}}};}
export type CommissionAction=PuzzleMove|{type:'undo'}|{type:'redo'}|{type:'reset'}|{type:'hint'};
export function actCommission(save:Save,key:JobKey,serial:number,a:CommissionAction):Save{
 if(!validJobKey(key)||jobSerial(save,key)!==serial)return save;const opened=openCommission(save,key),jobs=opened.commissions!,old=jobs.drafts[key]!,p=commissionRecipe(key,serial);let next:CommissionDraft;
 if(a.type==='hint')next={...old,hints:Math.min(1_000_000,old.hints+1)};
 else if(a.type==='reset')next={...freshCommissionDraft(key,serial),hints:old.hints};
 else if(a.type==='undo'){if(!old.past.length)return save;next={...old,step:old.past.at(-1)!,past:old.past.slice(0,-1),future:[old.step,...old.future].slice(0,256),moves:Math.max(0,old.moves-1)};}
 else if(a.type==='redo'){if(!old.future.length)return save;next={...old,step:old.future[0],past:[...old.past,old.step].slice(-256),future:old.future.slice(1),moves:Math.min(1_000_000,old.moves+1)};}
 else{const step=applyPuzzleMove(p,old.step,a);if(step.every((n,i)=>n===old.step[i]))return save;next={...old,step,past:[...old.past,old.step].slice(-256),future:[],moves:Math.min(1_000_000,old.moves+1)};}
 return {...opened,commissions:{...jobs,drafts:{...jobs.drafts,[key]:next}}};
}
export function claimCommission(save:Save,key:JobKey,serial:number):{save:Save;reward:number;status:'paid'|'stale'|'incomplete'|'overflow'}{
 if(!validJobKey(key)||jobSerial(save,key)!==serial||serial>=1_000_000)return {save,reward:0,status:'stale'};const jobs=save.commissions,d=jobs?.drafts[key];if(!d||d.serial!==serial||!commissionSolved(commissionRecipe(key,serial),d.step))return {save,reward:0,status:'incomplete'};
 const reward=commissionRewards[jobRank(key)];if(!Number.isSafeInteger(save.coins)||save.coins<0||!Number.isSafeInteger(save.coins+reward))return {save,reward:0,status:'overflow'};const drafts={...jobs!.drafts};delete drafts[key];return {save:{...save,coins:save.coins+reward,commissions:{version:1,counts:{...jobs!.counts,[key]:serial+1},drafts}},reward,status:'paid'};
}
