import { describe, expect, it } from 'vitest';
import { getHint } from '../src/domain/hints';
import { firstLevel } from '../src/domain/puzzle';
const solved = { luno: '201', dou: '202', ember: '203', rollo: '204' };
describe('progressive hints', () => {
  it('starts with strategy without revealing a placement', () => expect(getHint(firstLevel, {}, 1)).toEqual({ type: 'strategy' }));
  it('then identifies one unresolved guest', () => expect(getHint(firstLevel, {}, 2)).toEqual({ type: 'focus', guestId: 'luno' }));
  it('finally gives a matching room for that guest', () => expect(getHint(firstLevel, {}, 3)).toEqual({ type: 'placement', guestId: 'luno', roomId: '201' }));
  it('skips correctly placed guests', () => expect(getHint(firstLevel, { luno: '201' }, 3)).toEqual({ type: 'placement', guestId: 'dou', roomId: '202' }));
  it('helps a misplaced guest without changing the assignment', () => {
    const assignment = { ...solved, luno: '202', dou: '201' };
    const before = { ...assignment };
    expect(getHint(firstLevel, assignment, 3)).toEqual({ type: 'placement', guestId: 'luno', roomId: '201' });
    expect(assignment).toEqual(before);
  });
  it('recognizes a complete arrangement at every hint stage', () => {
    for (const stage of [1, 2, 3]) expect(getHint(firstLevel, solved, stage)).toEqual({ type: 'complete' });
  });
});
