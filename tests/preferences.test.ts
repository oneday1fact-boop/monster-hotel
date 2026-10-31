import { afterEach, expect, it, vi } from 'vitest';
import { readPreferences, savePreferences } from '../src/platform/preferences';
afterEach(() => vi.unstubAllGlobals());
it('defaults safely when preference storage is missing or corrupt', () => {
  expect(readPreferences()).toEqual({ music: true, sound: true, haptics: false });
  vi.stubGlobal('localStorage', { getItem: () => '{' }); expect(readPreferences().haptics).toBe(false);
});
it('preserves valid individual preferences while rejecting nonboolean values', () => {
  vi.stubGlobal('localStorage', { getItem: () => JSON.stringify({ music: false, sound: 'off', haptics: true }) });
  expect(readPreferences()).toEqual({ music: false, sound: true, haptics: true });
});
it('persists all controls and reports storage failures', () => {
  let stored = ''; vi.stubGlobal('localStorage', { getItem: () => stored, setItem: (_key: string, value: string) => { stored = value; } });
  expect(savePreferences({ music: false, sound: false, haptics: true })).toBe(true);
  expect(readPreferences()).toEqual({ music: false, sound: false, haptics: true });
  vi.stubGlobal('localStorage', { setItem: () => { throw new Error('blocked'); } });
  expect(savePreferences({ music: true, sound: true, haptics: false })).toBe(false);
});
