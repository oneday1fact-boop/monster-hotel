import { guests, guestById, type Level } from './puzzle';
export type ChapterId = 1 | 2 | 3 | 4 | 5 | 6;
export const chapterIds: readonly ChapterId[] = [1, 2, 3, 4, 5, 6];
export const chapterRewards: Record<ChapterId, number> = { 1: 50, 2: 60, 3: 75, 4: 80, 5: 90, 6: 100 };
export const chapterPairs = { 1: ['luno', 'rollo'], 2: ['ember', 'luno'], 3: ['dou', 'rollo'], 4: ['yuzu', 'ember'], 5: ['nemu', 'rollo'], 6: ['yuzu', 'nemu'] } as const;
export const chapterLevels: Record<ChapterId, Level> = {
  1: { id: 1, guests, rooms: [
    { id: '101', floor: 1, position: 1, condition: 'moonlight', features: ['dry'] },
    { id: '102', floor: 1, position: 2, condition: 'quiet', features: ['dry'] },
    { id: 'B01', floor: 0, position: 1, condition: 'dry' },
    { id: 'B02', floor: 0, position: 2, condition: 'warm' },
  ] },
  2: { id: 2, guests, rooms: [
    { id: '101', floor: 1, position: 1, condition: 'moonlight', features: ['dry'] },
    { id: '102', floor: 1, position: 2, condition: 'warm', features: ['dry'] },
    { id: 'B01', floor: 0, position: 1, condition: 'quiet', features: ['dry'] },
    { id: 'B02', floor: 0, position: 2, condition: 'dry' },
  ] },
  3: { id: 3, guests, rooms: [
    { id: '101', floor: 1, position: 1, condition: 'moonlight', features: ['dry'] },
    { id: '102', floor: 1, position: 2, condition: 'quiet', features: ['dry'] },
    { id: 'B01', floor: 0, position: 1, condition: 'warm', features: ['dry'] },
    { id: 'B02', floor: 0, position: 2, condition: 'dry' },
  ] },
  4: { id: 4, guests: ['luno','dou','ember','yuzu'].map(guestById), rooms: [
    { id:'101', floor:1, position:1, condition:'warm', features:['dry'] },
    { id:'102', floor:1, position:2, condition:'warm', features:['dry'] },
    { id:'B01', floor:0, position:1, condition:'quiet', features:['dry'] },
    { id:'B02', floor:0, position:2, condition:'moonlight', features:['dry'] },
  ] },
  5: { id: 5, guests: ['luno','dou','nemu','rollo'].map(guestById), rooms: [
    { id:'101', floor:1, position:1, condition:'dry' },
    { id:'102', floor:1, position:2, condition:'quiet', features:['dry'] },
    { id:'B01', floor:0, position:1, condition:'quiet', features:['dry'] },
    { id:'B02', floor:0, position:2, condition:'dry' },
  ] },
  6: { id: 6, guests: ['yuzu','nemu','ember','rollo'].map(guestById), rooms: [
    { id:'101', floor:1, position:1, condition:'warm', features:['dry'] },
    { id:'102', floor:1, position:2, condition:'quiet', features:['dry'] },
    { id:'B01', floor:0, position:1, condition:'dry' },
    { id:'B02', floor:0, position:2, condition:'warm', features:['dry'] },
  ] },
};
