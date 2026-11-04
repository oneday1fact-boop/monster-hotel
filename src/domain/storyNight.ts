import { guests, place, validate, type Assignment, type Level } from './puzzle';
import { chapterLevels, chapterRewards, type ChapterId } from './storyChapters';
import type { Save } from '../platform/save';
export type StoryChoice = 'play' | 'together';
export type Tool = 'curtain' | 'moonLamp';
export interface Equipment { curtain?: string; moonLamp?: string }
export interface StoryDraft { assignment: Assignment; equipment: Equipment; phase: 'arranging' | 'event' | 'settled'; introduced: boolean }
export const storyLevel = chapterLevels[1];
export function effectiveStoryLevel(equipment: Equipment, chapter: ChapterId = 1): Level {
  return { ...chapterLevels[chapter], rooms: chapterLevels[chapter].rooms.map(room => ({ ...room, features: [...new Set([...(room.features ?? []), ...(equipment.moonLamp === room.id ? ['moonlight' as const] : []), ...(equipment.curtain === room.id ? ['quiet' as const] : [])])].filter(c => c !== room.condition) })) };
}
export function storyValidation(assignment: Assignment, equipment: Equipment, chapter: ChapterId = 1) {
  const basic = validate(effectiveStoryLevel(equipment, chapter), assignment);
  if (!basic.valid) return basic;
  if (hasNoiseConflict(assignment, equipment)) return { valid: false, reason: 'noise' as const };
  const rooms = chapterLevels[chapter].rooms;
  const sameFloor = (a: string, b: string) => rooms.find(r => r.id === assignment[a])?.floor === rooms.find(r => r.id === assignment[b])?.floor;
  if (chapter === 2 && !sameFloor('ember', 'luno')) return { valid: false, reason: 'path' as const };
  if (chapter === 3 && !sameFloor('dou', 'rollo')) return { valid: false, reason: 'buddy' as const };
  return basic;
}
export function hasNoiseConflict(assignment: Assignment, equipment: Equipment) {
  const wolf = storyLevel.rooms.find(r => r.id === assignment.luno); const dou = storyLevel.rooms.find(r => r.id === assignment.dou);
  return !!wolf && !!dou && wolf.floor === dou.floor && Math.abs(wolf.position! - dou.position!) === 1 && equipment.curtain !== wolf.id && equipment.curtain !== dou.id;
}
export function emptyStory(): StoryDraft { return { assignment: {}, equipment: {}, phase: 'arranging', introduced: false }; }
export function putTool(equipment: Equipment, tool: Tool, room: string): Equipment {
  return storyLevel.rooms.some(r => r.id === room) ? { ...equipment, [tool]: room } : equipment;
}
export function readDraftValue(raw: unknown, chapter: ChapterId = 1): StoryDraft {
  if (!raw || typeof raw !== 'object') return emptyStory();
  const value = raw as Partial<StoryDraft>; let assignment: Assignment = {};
  for (const guest of guests) {
    const room = value.assignment?.[guest.id];
    if (storyLevel.rooms.some(r => r.id === room)) assignment = place(assignment, guest.id, room!);
  }
  const equipment: Equipment = {};
  for (const tool of ['curtain', 'moonLamp'] as const) {
    const room = value.equipment?.[tool]; if (storyLevel.rooms.some(r => r.id === room)) equipment[tool] = room;
  }
  return { assignment, equipment, introduced: value.introduced === true, phase: (value.phase === 'event' || value.phase === 'settled') && storyValidation(assignment, equipment, chapter).valid ? value.phase : 'arranging' };
}
/** One atomic wallet update; replaying either ending cannot farm coins or friendship. */
export function settleStory(save: Save, outcome: StoryChoice, chapter: ChapterId = 1): { save: Save; reward: number } {
  if (!storyUnlocked(save, chapter) || storyOutcome(save, chapter)) return { save, reward: 0 };
  const reward = chapterRewards[chapter];
  return { save: { ...save, coins: save.coins + reward, ...(chapter === 1 ? { storyNight: { outcome } } : { stories: { ...save.stories, [chapter]: { outcome } } }) }, reward };
}
export function storyOutcome(save: Save, chapter: ChapterId) { return chapter === 1 ? save.storyNight?.outcome : save.stories?.[chapter]?.outcome; }
export function storyUnlocked(save: Save, chapter: ChapterId) { return chapter === 1 || (chapter === 2 ? !!save.storyNight : !!save.storyNight && !!save.stories?.[2]); }
export function chapterBonds(save: Save, chapter: ChapterId): Record<string, number> {
  const outcome = storyOutcome(save, chapter); const pair = chapter === 1 ? ['luno', 'rollo'] : chapter === 2 ? ['ember', 'luno'] : ['dou', 'rollo'];
  return { [pair[0]]: outcome ? outcome === 'play' ? 2 : 1 : 0, [pair[1]]: outcome ? outcome === 'together' ? 2 : 1 : 0 };
}
export function storyBonds(save: Save) {
  if (!save.storyNight) return { luno: 0, rollo: 0 };
  return save.storyNight.outcome === 'play' ? { luno: 2, rollo: 1 } : { luno: 1, rollo: 2 };
}
