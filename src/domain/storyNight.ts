import { guests, place, validate, type Assignment, type Level } from './puzzle';
import type { Save } from '../platform/save';
export type StoryChoice = 'play' | 'together';
export type Tool = 'curtain' | 'moonLamp';
export interface Equipment { curtain?: string; moonLamp?: string }
export interface StoryDraft { assignment: Assignment; equipment: Equipment; phase: 'arranging' | 'event' | 'settled'; introduced: boolean }
export const storyLevel: Level = { id: 1, guests, rooms: [
  { id: '101', floor: 1, position: 1, condition: 'moonlight', features: ['dry'] },
  { id: '102', floor: 1, position: 2, condition: 'quiet', features: ['dry'] },
  { id: 'B01', floor: 0, position: 1, condition: 'dry' },
  { id: 'B02', floor: 0, position: 2, condition: 'warm' },
] };
export function effectiveStoryLevel(equipment: Equipment): Level {
  return { ...storyLevel, rooms: storyLevel.rooms.map(room => ({ ...room, features: [...new Set([...(room.features ?? []), ...(equipment.moonLamp === room.id ? ['moonlight' as const] : []), ...(equipment.curtain === room.id ? ['quiet' as const] : [])])].filter(c => c !== room.condition) })) };
}
export function storyValidation(assignment: Assignment, equipment: Equipment) {
  const basic = validate(effectiveStoryLevel(equipment), assignment);
  if (!basic.valid) return basic;
  if (hasNoiseConflict(assignment, equipment)) return { valid: false, reason: 'noise' as const };
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
export function readDraftValue(raw: unknown): StoryDraft {
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
  return { assignment, equipment, introduced: value.introduced === true, phase: (value.phase === 'event' || value.phase === 'settled') && storyValidation(assignment, equipment).valid ? value.phase : 'arranging' };
}
/** One atomic wallet update; replaying either ending cannot farm coins or friendship. */
export function settleStory(save: Save, outcome: StoryChoice): { save: Save; reward: number } {
  if (save.storyNight) return { save, reward: 0 };
  return { save: { ...save, coins: save.coins + 50, storyNight: { outcome } }, reward: 50 };
}
export function storyBonds(save: Save) {
  if (!save.storyNight) return { luno: 0, rollo: 0 };
  return save.storyNight.outcome === 'play' ? { luno: 2, rollo: 1 } : { luno: 1, rollo: 2 };
}
