import { describe, expect, it } from 'vitest';
import { levels, levelTitle, isUnlocked, nextNight } from '../src/domain/levels';
import { solve, validate } from '../src/domain/puzzle';
import { getHint } from '../src/domain/hints';
describe('authored campaign', () => {
  for (const level of levels) it(`night ${level.id} has one complete solution and a correct final hint`, () => {
    const solutions = solve(level);
    expect(solutions).toHaveLength(1);
    expect(validate(level, solutions[0]).valid).toBe(true);
    const hint = getHint(level, {}, 3);
    expect(hint.type).toBe('placement');
    if (hint.type === 'placement') expect(hint.roomId).toBe(solutions[0][hint.guestId]);
  });
  it('contains twenty sequential authored entries with localized names', () => {
    expect(levels.map(l => l.id)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
    for (const l of levels) { expect(levelTitle(l.id, 'en')).not.toBe(''); expect(levelTitle(l.id, 'zh-Hant')).not.toBe(''); }
    expect(new Set(levels.map(l => JSON.stringify([l.rooms, l.rules ?? []]))).size).toBe(20);
  });
  it('unlocks in sequence and ignores noncontiguous completions', () => {
    expect(isUnlocked(1, [])).toBe(true); expect(isUnlocked(2, [])).toBe(false);
    expect(isUnlocked(2, [1])).toBe(true); expect(isUnlocked(4, [1, 3, 20])).toBe(false);
    expect(isUnlocked(21, levels.map(l => l.id))).toBe(false);
    expect(nextNight([1, 2])).toBe(3); expect(nextNight(levels.map(l => l.id))).toBe(20);
  });
});
