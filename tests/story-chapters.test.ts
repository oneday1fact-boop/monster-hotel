import { afterEach, expect, it, vi } from 'vitest';
import { chapterIds, chapterLevels } from '../src/domain/storyChapters';
import { chapterBonds, effectiveStoryLevel, emptyStory, readDraftValue, settleStory, storyOutcome, storyUnlocked, storyValidation } from '../src/domain/storyNight';
import { solve } from '../src/domain/puzzle';
import { readSave, type Save } from '../src/platform/save';
import { readStoryDraft, writeStoryDraft } from '../src/platform/storyNight';
const fresh: Save = { version: 1, completed: [], coins: 0 };
const second = { luno: '101', ember: '102', dou: 'B01', rollo: 'B02' };
const third = { luno: 'B02', ember: 'B01', dou: '102', rollo: '101' };
afterEach(() => vi.unstubAllGlobals());
it('follow-up room puzzles have real solutions and every accepted arrangement obeys the new story rule', () => {
  for (const id of chapterIds) {
    let count = 0;
    for (const curtain of [undefined, ...chapterLevels[id].rooms.map(r => r.id)]) for (const moonLamp of [undefined, ...chapterLevels[id].rooms.map(r => r.id)]) {
      for (const a of solve(effectiveStoryLevel({ curtain, moonLamp }, id))) {
        if (!storyValidation(a, { curtain, moonLamp }, id).valid) continue;
        count++;
        const floor = (guest: string) => chapterLevels[id].rooms.find(r => r.id === a[guest])!.floor;
        if (id === 2) expect(floor('ember')).toBe(floor('luno'));
        if (id === 3) expect(floor('dou')).toBe(floor('rollo'));
        if (id === 4) expect(floor('yuzu')).toBe(floor('ember'));
        if (id === 5) expect(floor('nemu')).toBe(floor('rollo'));
        if (id === 6) expect(floor('yuzu')).toBe(floor('nemu'));
      }
    }
    expect(count).toBeGreaterThan(0);
  }
  expect(storyValidation(second, {}, 2).valid).toBe(true);
  expect(storyValidation(third, {}, 3).valid).toBe(false);
  expect(storyValidation(third, { moonLamp: 'B02' }, 3).valid).toBe(true);
});
it('rejects ordinary comfortable arrangements when the follow-up story rule is broken', () => {
  expect(storyValidation({ luno:'B02', ember:'102', dou:'B01', rollo:'101' }, { moonLamp:'B02', curtain:'B01' }, 2).reason).toBe('path');
  expect(storyValidation({ luno:'101', ember:'B01', dou:'102', rollo:'B02' }, { curtain:'102' }, 3).reason).toBe('buddy');
  expect(readDraftValue({ assignment: third, equipment: {}, phase: 'event' }, 3).phase).toBe('arranging');
});
it('unlocks in order and pays exactly once per chapter even across both endings', () => {
  expect(settleStory(fresh, 'play', 2).save).toBe(fresh);
  let save = fresh;
  for (const chapter of chapterIds) {
    expect(storyUnlocked(save, chapter)).toBe(true);
    save = settleStory(save, 'together', chapter).save;
    expect(storyOutcome(save, chapter)).toBe('together');
    expect(settleStory(save, 'play', chapter)).toEqual({ save, reward: 0 });
  }
  expect(save.coins).toBe(455); expect(save.completed).toEqual([]);
  expect(chapterBonds(save, 2)).toEqual({ ember: 1, luno: 2 });
  expect(chapterBonds(save, 3)).toEqual({ dou: 1, rollo: 2 });
});
it('migrates old story saves, preserves follow-up choices, and rejects invalid or out-of-order records', () => {
  const load = (value: unknown) => { vi.stubGlobal('localStorage', { getItem: () => JSON.stringify(value) }); return readSave(); };
  expect(load({ ...fresh, storyNight: { outcome:'play' } }).stories).toBeUndefined();
  const save = chapterIds.reduce((s, id) => settleStory(s, 'play', id).save, fresh);
  expect(load(save)).toEqual(save);
  expect(load({ ...fresh, stories: { 2: { outcome:'play' } } }).stories).toBeUndefined();
  expect(load({ ...fresh, storyNight: { outcome:'play' }, stories: { 2:{outcome:'oops'},3:{outcome:'together'},99:{outcome:'play'} } }).stories).toBeUndefined();
});
it('keeps each chapter draft independent and validates it with that chapter’s room conditions', () => {
  const values = new Map<string,string>();
  vi.stubGlobal('localStorage', { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string,v: string) => values.set(k,v) });
  writeStoryDraft({ ...emptyStory(), assignment: second, phase:'event' }, 2);
  writeStoryDraft({ ...emptyStory(), assignment: third, equipment:{moonLamp:'B02'},phase:'event' }, 3);
  expect(readStoryDraft(1)).toEqual(emptyStory()); expect(readStoryDraft(2).assignment).toEqual(second); expect(readStoryDraft(3).assignment).toEqual(third);
  expect(readStoryDraft(2).phase).toBe('event'); expect(readStoryDraft(3).phase).toBe('event');
});
