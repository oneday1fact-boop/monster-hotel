import { afterEach, expect, it, vi } from 'vitest';
import { ambiences, chapterAmbience, lobbyAmbience } from '../src/domain/ambience';
import { allGuests } from '../src/domain/puzzle';
import { chapterLevels } from '../src/domain/storyChapters';
import { emptyStory, readDraftValue, storyValidation } from '../src/domain/storyNight';
import { characters } from '../src/i18n/catalog';
import { chapterUI } from '../src/i18n/storyNight';
import { readSave } from '../src/platform/save';
afterEach(()=>vi.unstubAllGlobals());
const fourth={luno:'B02',dou:'B01',ember:'102',yuzu:'101'};
const fifth={luno:'101',dou:'102',nemu:'B01',rollo:'B02'};
const sixth={yuzu:'101',nemu:'102',ember:'B02',rollo:'B01'};
it('introduces the guests in later chapters while preserving the four-guest hotel',()=>{
 expect(allGuests).toHaveLength(6);for(const level of Object.values(chapterLevels))expect(level.guests).toHaveLength(4);
 expect(chapterLevels[4].guests.some(g=>g.id==='yuzu')).toBe(true);expect(chapterLevels[5].guests.some(g=>g.id==='nemu')).toBe(true);
 for(const locale of ['zh-Hant','en'] as const){for(const guest of allGuests)for(const text of Object.values(characters[locale][guest.kind]))expect(text).not.toBe('');for(const id of [4,5,6] as const)expect(chapterUI(locale,id).title).not.toBe(chapterUI(locale,3).title);}
});
it('has playable seasonal puzzles and a genuine daytime moon-lamp requirement',()=>{
 expect(storyValidation(fourth,{},4).valid).toBe(false);expect(storyValidation(fourth,{curtain:'B01'},4).valid).toBe(true);
 expect(storyValidation(fifth,{curtain:'102'},5).valid).toBe(false);expect(storyValidation(fifth,{curtain:'102',moonLamp:'101'},5).valid).toBe(true);
 expect(storyValidation(sixth,{},6).valid).toBe(true);
 expect(readDraftValue({...emptyStory(),assignment:fourth,equipment:{curtain:'B01'},phase:'event'},4).assignment).toEqual(fourth);
 expect(readDraftValue({...emptyStory(),assignment:sixth,phase:'event'},6).phase).toBe('event');
});
it('maps story weather separately from the player’s saved lobby preference',()=>{
 expect([1,2,3,4,5,6].map(chapterAmbience)).toEqual(['night','night','night','autumn','morning','winter']);
 expect(lobbyAmbience({})).toBe('morning');expect(lobbyAmbience({stories:{5:{outcome:'play'}}})).toBe('morning');expect(lobbyAmbience({ambience:'autumn',stories:{6:{}}})).toBe('autumn');
 for(const ambience of ambiences){vi.stubGlobal('localStorage',{getItem:()=>JSON.stringify({version:1,completed:[1],coins:75,ambience})});expect(readSave()).toMatchObject({completed:[1],coins:75,ambience});}
 vi.stubGlobal('localStorage',{getItem:()=>JSON.stringify({version:1,completed:[],coins:0,ambience:'bad'})});expect(readSave().ambience).toBeUndefined();
});
