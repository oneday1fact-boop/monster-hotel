import {afterEach,expect,it,vi} from 'vitest';
import {challenges,challengeComplete,challengeUnlocked,nextChallenge,afterChallenge,challengeProgress} from '../src/domain/campaign';
import {settleStory} from '../src/domain/storyNight';
import {complete,readSave,type Save} from '../src/platform/save';
import {buyScene,ownedScenes,scenePrices} from '../src/domain/sceneryShop';
import {decorations,purchase} from '../src/domain/decorations';
afterEach(()=>vi.unstubAllGlobals());
it('one growing route contains every existing puzzle and guest encounter with stable IDs',()=>{
 expect(challenges).toHaveLength(26);expect(new Set(challenges.map(n=>n.id)).size).toBe(challenges.length);expect(challenges.filter(n=>n.kind==='puzzle')).toHaveLength(20);expect(challenges.filter(n=>n.kind==='encounter')).toHaveLength(6);
 expect(challenges[0].id).toBe('encounter-1');expect(afterChallenge('puzzle-2')?.id).toBe('encounter-2');expect(afterChallenge('encounter-6')?.id).toBe('puzzle-17');
});
it('unlocks the entire integrated route and awards exactly once without creating a second wallet',()=>{
 vi.stubGlobal('localStorage',{setItem:()=>{}});let save:Save={version:1,coins:0,completed:[]};
 for(const node of challenges){expect(nextChallenge(save).id).toBe(node.id);expect(challengeUnlocked(save,node.id)).toBe(true);save=node.kind==='puzzle'?complete(save,node.puzzle):settleStory(save,'together',node.chapter).save;expect(challengeComplete(save,node)).toBe(true);const again=node.kind==='puzzle'?complete(save,node.puzzle):settleStory(save,'play',node.chapter).save;expect(again.coins).toBe(save.coins);}
 expect(save.coins).toBe(1455);expect(challengeProgress(save)).toBe(26);expect(challengeUnlocked(save,'unknown')).toBe(false);
});
it('retains completed legacy content as replayable even when the route now includes intervening encounters',()=>{
 const old:Save={version:1,coins:999,completed:[1,2,20],storyNight:{outcome:'play'},stories:{2:{outcome:'together'}}};expect(challengeUnlocked(old,'puzzle-20')).toBe(true);expect(challengeUnlocked(old,'puzzle-3')).toBe(true);expect(challengeUnlocked(old,'encounter-4')).toBe(false);expect(nextChallenge(old).id).toBe('puzzle-3');expect(old.coins).toBe(999);
});
it('sells scenes once and keeps old selected scenery without retroactive charges',()=>{
 const old:Save={version:1,coins:250,completed:[1],ambience:'winter'};expect(ownedScenes(old)).toEqual(['morning','winter']);const r=buyScene(old,'autumn');expect(r.wallet.coins).toBe(100);expect(ownedScenes(r.wallet)).toContain('winter');expect(buyScene(r.wallet,'autumn').wallet.coins).toBe(100);expect(buyScene(r.wallet,'night').status).toBe('insufficient');expect(old.coins).toBe(250);
 vi.stubGlobal('localStorage',{getItem:()=>JSON.stringify({...old,scenes:['morning'],ambience:'night'})});expect(readSave().ambience).toBeUndefined();
});
it('offers a real included spring scene and an affordable complete decoration/scenery collection',()=>{
 let save:Save={version:1,completed:[],coins:1455};expect(ownedScenes(save)).toEqual(['morning']);expect(buyScene(save,'morning').wallet.coins).toBe(1455);
 for(const item of decorations)save=purchase(save,item.id).wallet;for(const theme of ['night','autumn','winter'] as const)save=buyScene(save,theme).wallet;
 expect(save.coins).toBe(35);expect(save.decorations).toHaveLength(6);expect(save.scenes).toHaveLength(4);expect(scenePrices.morning).toBe(0);
});
