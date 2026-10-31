import { describe, expect, it } from 'vitest';
import { firstLevel, place, validate } from '../src/domain/puzzle';
import { complete, readSave } from '../src/platform/save';
const solved = { pip: '201', momo: '202', bramble: '203' };
describe('night one puzzle', () => {
  it('accepts the matching rooms', () => expect(validate(firstLevel, solved).valid).toBe(true));
  it('rejects incomplete assignments', () => expect(validate(firstLevel, {}).reason).toBe('incomplete'));
  it('rejects duplicate occupants', () => expect(validate(firstLevel, { ...solved, momo: '201' }).reason).toBe('occupied'));
  it('rejects unmet wishes', () => expect(validate(firstLevel, { pip: '202', momo: '201', bramble: '203' }).reason).toBe('requirement'));
  it('rejects unknown rooms and guests', () => {
    expect(validate(firstLevel, { ...solved, pip: '404' }).reason).toBe('unknown');
    expect(validate(firstLevel, { ...solved, intruder: '201' }).reason).toBe('unknown');
  });
  it('has exactly one solution across all possible complete assignments', () => {
    const solutions = [];
    for (const a of firstLevel.rooms) for (const b of firstLevel.rooms) for (const c of firstLevel.rooms) {
      const assignment = { pip: a.id, momo: b.id, bramble: c.id };
      if (validate(firstLevel, assignment).valid) solutions.push(assignment);
    }
    expect(solutions).toEqual([solved]);
  });
  it('moves a guest and returns displaced guests to the queue', () => {
    expect(place(solved, 'pip', '202')).toEqual({ pip: '202', bramble: '203' });
    expect(solved.momo).toBe('202');
  });
});
describe('progression', () => {
  it('awards coins only on first completion', () => {
    const once = complete({ version: 1, completed: [], coins: 0 }, 1);
    expect(once.coins).toBe(50);
    expect(complete(once, 1)).toEqual(once);
  });
  it('falls back safely when storage is unavailable', () => expect(readSave()).toEqual({ version: 1, completed: [], coins: 0 }));
});
