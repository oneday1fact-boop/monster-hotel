import { afterEach, describe, expect, it, vi } from 'vitest';
import { characters, conditions, readLocale, saveLocale, ui } from '../src/i18n/catalog';
import { firstLevel } from '../src/domain/puzzle';
afterEach(() => vi.unstubAllGlobals());
describe('offline bilingual catalog', () => {
  it('has matching nonempty interface keys', () => {
    expect(Object.keys(ui.en).sort()).toEqual(Object.keys(ui['zh-Hant']).sort());
    for (const catalog of Object.values(ui)) for (const value of Object.values(catalog)) expect(value.trim()).not.toBe('');
  });
  it('covers every playable guest and room in both languages', () => {
    for (const locale of ['en', 'zh-Hant'] as const) {
      for (const guest of firstLevel.guests) for (const text of Object.values(characters[locale][guest.kind])) expect(text.trim()).not.toBe('');
      for (const room of firstLevel.rooms) for (const text of Object.values(conditions[locale][room.condition])) expect(text.trim()).not.toBe('');
    }
  });
  it('defaults safely with unavailable or invalid storage', () => {
    expect(readLocale()).toBe('zh-Hant');
    vi.stubGlobal('localStorage', { getItem: () => 'invalid' });
    expect(readLocale()).toBe('zh-Hant');
  });
  it('persists the language independently of progress', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => store.set(key, value) });
    saveLocale('en'); expect(readLocale()).toBe('en');
    saveLocale('zh-Hant'); expect(readLocale()).toBe('zh-Hant');
    expect(store.size).toBe(1);
  });
});
