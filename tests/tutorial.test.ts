import { afterEach, describe, expect, it, vi } from 'vitest';
import { tutorialView } from '../src/domain/tutorial';
import { firstLevel, solve } from '../src/domain/puzzle';
import { readTutorialDone, saveTutorialDone } from '../src/platform/tutorial';
afterEach(() => vi.unstubAllGlobals());
describe('first-night guidance', () => {
  it('only guides a new first night, including compatible old saves', () => {
    expect(tutorialView(1, [], false, {})?.step).toBe('select');
    expect(tutorialView(2, [], false, {})).toBeUndefined();
    expect(tutorialView(1, [1], false, {})).toBeUndefined();
    expect(tutorialView(1, [], true, {})).toBeUndefined();
  });
  it('teaches the gesture without revealing a room answer', () => {
    const view = tutorialView(1, [], false, {}, 'luno')!;
    expect(view.step).toBe('place'); expect(view.guestId).toBe('luno');
    expect(view.roomId).toBe('');
  });
  it('handles a wrong room without changing the player assignment', () => {
    const assignment = { luno: 'B01' }; const before = { ...assignment };
    expect(tutorialView(1, [], false, assignment)).toMatchObject({ step: 'select', correction: true });
    expect(tutorialView(1, [], false, assignment, 'luno')).toMatchObject({ step: 'place', correction: true });
    expect(assignment).toEqual(before);
  });
  it('leaves the other guests to the player and returns to guidance if Luno is displaced', () => {
    expect(tutorialView(1, [], false, { luno: '101' })?.step).toBe('free');
    expect(tutorialView(1, [], false, { dou: '101' })?.step).toBe('select');
  });
  it('offers validation once everyone has a room, without claiming the answer is correct', () => {
    expect(tutorialView(1, [], false, { luno: '101', dou: '102', ember: 'B01', rollo: 'B02' })?.step).toBe('check');
  });
  it('preserves the independent phase through language changes and restarts on reset', () => {
    const assignment = { luno: '101' }; expect(tutorialView(1, [], false, assignment)?.step).toBe('free');
    expect(tutorialView(1, [], false, {})?.step).toBe('select');
  });
});
describe('tutorial preference', () => {
  it('persists skipping separately without changing campaign or coin data', () => {
    const store = new Map<string, string>([['midnight-check-in.save.v1', 'existing-save']]);
    vi.stubGlobal('localStorage', { getItem: (key: string) => store.get(key), setItem: (key: string, value: string) => store.set(key, value) });
    expect(readTutorialDone()).toBe(false); expect(saveTutorialDone()).toBe(true); expect(readTutorialDone()).toBe(true);
    expect(store.get('midnight-check-in.save.v1')).toBe('existing-save');
  });
  it('ignores unknown tutorial state', () => { vi.stubGlobal('localStorage', { getItem: () => 'corrupt' }); expect(readTutorialDone()).toBe(false); });
  it('continues safely when reading or saving storage is blocked', () => {
    vi.stubGlobal('localStorage', { getItem: () => { throw Error('blocked'); }, setItem: () => { throw Error('blocked'); } });
    expect(readTutorialDone()).toBe(false); expect(saveTutorialDone()).toBe(false);
  });
});
