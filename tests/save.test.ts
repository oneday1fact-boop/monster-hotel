import { afterEach, describe, expect, it, vi } from 'vitest';
import { complete, readSave } from '../src/platform/save';
import { isUnlocked } from '../src/domain/levels';
afterEach(() => vi.unstubAllGlobals());
describe('campaign saves and compatibility', () => {
  it('retains a milestone-one save and unlocks night two', () => {
    vi.stubGlobal('localStorage', { getItem: () => JSON.stringify({ version: 1, completed: [1], coins: 50 }) });
    const save = readSave(); expect(save).toEqual({ version: 1, completed: [1], coins: 50 }); expect(isUnlocked(2, save.completed)).toBe(true);
  });
  it('deduplicates completion IDs and removes unknown nights', () => {
    vi.stubGlobal('localStorage', { getItem: () => JSON.stringify({ version: 1, completed: [1, 1, 999], coins: 50 }) });
    expect(readSave().completed).toEqual([1]);
  });
  it('rejects corrupt data without breaking startup', () => {
    vi.stubGlobal('localStorage', { getItem: () => '{corrupt' }); expect(readSave().completed).toEqual([]);
  });
  it('does not reward locked or invalid nights', () => {
    const save = { version: 1 as const, completed: [], coins: 0 };
    for (const id of [0, 2, 20, 21, 1.5]) expect(complete(save, id)).toBe(save);
  });
  it('awards each of twenty nights exactly once and survives a reload', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => store.set(key, value) });
    let save = readSave();
    for (let id = 1; id <= 20; id++) { save = complete(save, id); save = complete(save, id); }
    expect(save.coins).toBe(1000); expect(save.completed).toHaveLength(20); expect(readSave()).toEqual(save);
  });
});
