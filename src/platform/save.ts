import { isUnlocked, levels } from '../domain/levels';
export interface Save { version: 1; completed: number[]; coins: number }
const key = 'midnight-check-in.save.v1';
export function readSave(): Save {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? 'null');
    if (value?.version === 1 && Array.isArray(value.completed) && value.completed.every((n: unknown) => Number.isInteger(n) && Number(n) > 0) && Number.isInteger(value.coins) && value.coins >= 0) return { version: 1, completed: [...new Set<number>(value.completed.filter((id: number) => levels.some(l => l.id === id)))], coins: value.coins };
  } catch { /* Storage unavailable or corrupt: continue offline in memory. */ }
  return { version: 1, completed: [], coins: 0 };
}
export function complete(save: Save, level: number): Save {
  if (save.completed.includes(level) || !isUnlocked(level, save.completed)) return save;
  const next: Save = { ...save, completed: [...save.completed, level], coins: save.coins + 50 };
  try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* Gameplay remains usable without persistent storage. */ }
  return next;
}
