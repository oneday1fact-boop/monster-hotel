import type {Save} from '../platform/save';
import {openCommission,readCommissions,type Commissions} from './commissions';
import {commissionRecipe,commissionSolved,type JobKey} from './commissionPuzzles';
import {completeEpisode} from './campaign';
export const cloudTasks={
 'cloud-courier':{key:'maze:1' as JobKey,serial:5},
 'cloud-lanterns':{key:'mirrors:1' as JobKey,serial:6}
} as const;
export type CloudTaskId=keyof typeof cloudTasks;
export const isCloudTask=(id:string):id is CloudTaskId=>Object.hasOwn(cloudTasks,id);
export function cloudTaskSave(save:Save,id:CloudTaskId):Save{const c=cloudTasks[id];return {...save,commissions:save.cloudTasks?.[id]??{version:1,counts:{[c.key]:c.serial},drafts:{}}};}
export function storeCloudTask(save:Save,id:CloudTaskId,virtual:Save):Save{return {...save,cloudTasks:{...save.cloudTasks,[id]:virtual.commissions}};}
export function claimCloudTask(save:Save,id:CloudTaskId){const c=cloudTasks[id],virtual=cloudTaskSave(save,id),d=virtual.commissions?.drafts[c.key];if(!d||d.serial!==c.serial||!commissionSolved(commissionRecipe(c.key,c.serial),d.step))return {save,reward:0,status:'incomplete'};const r=completeEpisode(save,id);if(!r.save.episodes?.includes(id)||!Number.isSafeInteger(r.save.coins))return {save,reward:0,status:'locked'};return {...r,status:'paid'};}
export function readCloudTasks(v:unknown){const out:Partial<Record<CloudTaskId,Commissions>>={};if(v&&typeof v==='object')for(const id of Object.keys(cloudTasks)as CloudTaskId[]){const a=readCommissions((v as Record<string,unknown>)[id]),c=cloudTasks[id];if(a?.counts[c.key]===c.serial)out[id]=a;}return out;}
