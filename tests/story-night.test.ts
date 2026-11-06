import { afterEach, expect, it, vi } from 'vitest';
import { effectiveStoryLevel, emptyStory, putTool, readDraftValue, settleStory, storyBonds, storyLevel, storyValidation } from '../src/domain/storyNight';
import { purchase } from '../src/domain/decorations';
import { complete, readSave } from '../src/platform/save';
import { hopPose } from '../src/game/motion';
afterEach(() => vi.unstubAllGlobals());
const natural = { luno: '101', dou: '102', ember: 'B02', rollo: 'B01' };
it('the natural arrangement is disturbed by howling, and either neighbouring curtain can fix it', () => {
  expect(storyValidation(natural, {}).reason).toBe('noise');
  expect(storyValidation(natural, { curtain: '102' }).valid).toBe(true);
  expect(storyValidation(natural, { curtain: '101' }).valid).toBe(true);
});
it('a moon lamp offers a different complete arrangement without a curtain', () => {
  const a = { luno: 'B01', dou: '102', ember: 'B02', rollo: '101' };
  expect(storyValidation(a, {}).valid).toBe(false);
  expect(storyValidation(a, { moonLamp: 'B01' }).valid).toBe(true);
});
it('curtains can create another quiet room, leaving multiple genuine solutions', () => {
  expect(storyValidation({ luno: '101', dou: 'B01', ember: 'B02', rollo: '102' }, { curtain: 'B01' }).valid).toBe(true);
});
it('supplies move rather than duplicate, reject unknown rooms and leave room definitions unchanged', () => {
  const before = JSON.stringify(storyLevel); const first = putTool({}, 'moonLamp', 'B01');
  const moved = putTool(first, 'moonLamp', '101'); expect(moved).toEqual({ moonLamp: '101' });
  expect(putTool(moved, 'curtain', 'invalid')).toBe(moved);
  effectiveStoryLevel({ curtain: '101', moonLamp: '102' }); expect(JSON.stringify(storyLevel)).toBe(before);
});
it('cannot settle incomplete, duplicate or unknown assignments', () => {
  for (const a of [{}, { ...natural, rollo: '101' }, { ...natural, extra: '101' }, { ...natural, luno: 'unknown' }]) expect(storyValidation(a, { curtain: '102' }).valid).toBe(false);
});
it('awards one atomic first-story reward without completing a classic puzzle', () => {
  const save = { version: 1 as const, completed: [1, 2], coins: 100, decorations: [], equipped: [] };
  const result = settleStory(save, 'play'); expect(result.reward).toBe(50); expect(result.save.coins).toBe(150); expect(result.save.completed).toEqual([1, 2]); expect(save.coins).toBe(100);
  expect(settleStory(result.save, 'play')).toEqual({ save: result.save, reward: 0 });
  expect(settleStory(result.save, 'together')).toEqual({ save: result.save, reward: 0 });
});
it('both gentle outcomes give different friendship results and unlock a stored ending', () => {
  const save = { version: 1 as const, completed: [], coins: 0 };
  expect(storyBonds(save)).toEqual({ luno: 0, rollo: 0 });
  expect(storyBonds(settleStory(save, 'play').save)).toEqual({ luno: 2, rollo: 1 });
  expect(storyBonds(settleStory(save, 'together').save)).toEqual({ luno: 1, rollo: 2 });
});
it('sanitizes story drafts and never resumes an invalid event', () => {
  expect(readDraftValue(null)).toEqual(emptyStory());
  const draft = readDraftValue({ assignment: { ...natural, bad: '101' }, equipment: { curtain: '102', moonLamp: 'invalid' }, phase: 'event', introduced: true });
  expect(draft).toMatchObject({ assignment: natural, equipment: { curtain: '102' }, phase: 'event' });
  expect(readDraftValue({ assignment: natural, equipment: {}, phase: 'settled' }).phase).toBe('arranging');
});
it('old saves remain compatible, and valid story endings survive a reload', () => {
  vi.stubGlobal('localStorage', { getItem: () => JSON.stringify({ version: 1, completed: [1], coins: 50 }) });
  expect(readSave()).toEqual({ version: 1, completed: [1], coins: 50 });
  vi.stubGlobal('localStorage', { getItem: () => JSON.stringify({ version: 1, completed: [1], coins: 100, storyNight: { outcome: 'together' } }) });
  expect(readSave().storyNight).toEqual({ outcome: 'together' });
  vi.stubGlobal('localStorage', { getItem: () => JSON.stringify({ version: 1, completed: [1], coins: 50, storyNight: { outcome: 'invalid' } }) });
  expect(readSave().storyNight).toBeUndefined();
});
it('three hops land smoothly before resting, without a mid-air snap at 60 Hz', () => {
  for (const t of [.195, .26, .455, .52, .715, .78, 1]) expect(hopPose(t).height).toBeCloseTo(0);
  const samples = Array.from({ length: 265 }, (_, i) => hopPose(i / 264).height * 29);
  for (let i = 1; i < samples.length; i++) expect(Math.abs(samples[i] - samples[i - 1])).toBeLessThan(3);
});

it('story progress survives classic rewards and cosmetic transactions', () => {
  vi.stubGlobal('localStorage', { setItem: () => {} });
  const story = settleStory({ version: 1, completed: [], coins: 1100 }, 'together').save;
  const classic = complete(story, 1); const bought = purchase(classic, 'moon-lamps').wallet;
  expect(bought.storyNight).toEqual({ outcome: 'together' }); expect(bought.completed).toEqual([1]); expect(bought.coins).toBe(0);
});
