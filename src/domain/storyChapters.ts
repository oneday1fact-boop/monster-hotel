import { guests, type Level } from './puzzle';
export type ChapterId = 1 | 2 | 3;
export const chapterIds: readonly ChapterId[] = [1, 2, 3];
export const chapterRewards: Record<ChapterId, number> = { 1: 50, 2: 60, 3: 75 };
export const chapterPairs = { 1: ['luno', 'rollo'], 2: ['ember', 'luno'], 3: ['dou', 'rollo'] } as const;
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
};
