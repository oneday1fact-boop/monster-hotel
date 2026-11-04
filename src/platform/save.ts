import { isDecoration, type DecorationId } from '../domain/decorations';
import { isUnlocked, levels } from '../domain/levels';
export interface Save { version: 1; completed: number[]; coins: number; decorations?: DecorationId[]; equipped?: DecorationId[]; storyNight?: { outcome: 'play' | 'together' } }
const key = 'midnight-check-in.save.v1';
export function readSave(): Save {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? 'null');
    if (value?.version === 1 && Array.isArray(value.completed) && value.completed.every((n: unknown) => Number.isInteger(n) && Number(n) > 0) && Number.isSafeInteger(value.coins) && value.coins >= 0) {
      const save: Save = { version: 1, completed: [...new Set<number>(value.completed.filter((id: number) => levels.some(l => l.id === id)))], coins: value.coins };
      if (Array.isArray(value.decorations)) {
        save.decorations = [...new Set<DecorationId>(value.decorations.filter(isDecoration))];
        save.equipped = Array.isArray(value.equipped) ? [...new Set<DecorationId>(value.equipped.filter((id: unknown) => isDecoration(id) && save.decorations!.includes(id)))] : [];
      }
      if (value.storyNight?.outcome === 'play' || value.storyNight?.outcome === 'together') save.storyNight = { outcome: value.storyNight.outcome };
      return save;
    }
  } catch { /* Storage unavailable or corrupt: continue offline in memory. */ }
  return { version: 1, completed: [], coins: 0 };
}
export function complete(save: Save, level: number): Save {
  if (save.completed.includes(level) || !isUnlocked(level, save.completed)) return save;
  const next: Save = { ...save, completed: [...save.completed, level], coins: save.coins + 50 };
  writeSave(next);
  return next;
}

export function writeSave(save: Save): boolean {
  try { localStorage.setItem(key, JSON.stringify(save)); return true; } catch { return false; }
}
