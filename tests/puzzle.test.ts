import { describe, expect, it } from 'vitest';
import { firstLevel, place, validate } from '../src/domain/puzzle';
import { complete, readSave } from '../src/platform/save';
const solved = { luno: '201', dou: '202', ember: '203', rollo: '204' };
describe('night one puzzle', () => {
  it('accepts the matching rooms', () => expect(validate(firstLevel, solved).valid).toBe(true));
  it('requires the fourth guest to be placed', () => expect(validate(firstLevel, { luno: '201', dou: '202', ember: '203' }).reason).toBe('incomplete'));
  it('checks the fourth guest’s dry requirement', () => expect(validate(firstLevel, { ...solved, ember: '204', rollo: '203' }).reason).toBe('requirement'));
  it('rejects incomplete assignments', () => expect(validate(firstLevel, {}).reason).toBe('incomplete'));
  it('rejects duplicate occupants', () => expect(validate(firstLevel, { ...solved, dou: '201' }).reason).toBe('occupied'));
  it('rejects unmet wishes', () => expect(validate(firstLevel, { luno: '202', dou: '201', ember: '203', rollo: '204' }).reason).toBe('requirement'));
  it('rejects unknown rooms and guests', () => {
    expect(validate(firstLevel, { ...solved, luno: '404' }).reason).toBe('unknown');
    expect(validate(firstLevel, { ...solved, intruder: '201' }).reason).toBe('unknown');
  });
  it('has exactly one solution across all possible complete assignments', () => {
    const solutions = [];
    for (const a of firstLevel.rooms) for (const b of firstLevel.rooms) for (const c of firstLevel.rooms) for (const d of firstLevel.rooms) {
      const assignment = { luno: a.id, dou: b.id, ember: c.id, rollo: d.id };
      if (validate(firstLevel, assignment).valid) solutions.push(assignment);
    }
    expect(solutions).toEqual([solved]);
  });
  it('moves a guest and returns displaced guests to the queue', () => {
    expect(place(solved, 'luno', '202')).toEqual({ luno: '202', ember: '203', rollo: '204' });
    expect(solved.dou).toBe('202');
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
