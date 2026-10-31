import { describe, expect, it } from 'vitest';
import { guests, satisfiesRule, validate, type Level, type Rule } from '../src/domain/puzzle';
import { levels } from '../src/domain/levels';
const level: Level = { id: 99, guests, rooms: [
  { id: '201', floor: 2, position: 1, condition: 'moonlight', features: ['quiet', 'warm', 'dry'] },
  { id: '202', floor: 2, position: 2, condition: 'quiet', features: ['warm', 'dry', 'moonlight'] },
  { id: '301', floor: 3, position: 1, condition: 'warm', features: ['quiet', 'dry', 'moonlight'] },
  { id: '302', floor: 3, position: 2, condition: 'dry', features: ['quiet', 'warm', 'moonlight'] },
] };
const ordered = { luno: '201', dou: '202', ember: '301', rollo: '302' };
describe('relational rules', () => {
  it.each([
    [{ type: 'floor', guest: 'luno', floor: 2 }, true], [{ type: 'floor', guest: 'luno', floor: 3 }, false],
    [{ type: 'adjacent', a: 'luno', b: 'dou' }, true], [{ type: 'adjacent', a: 'luno', b: 'ember' }, false],
    [{ type: 'apart', a: 'luno', b: 'dou' }, false], [{ type: 'apart', a: 'luno', b: 'ember' }, true],
    [{ type: 'sameFloor', a: 'luno', b: 'dou' }, true], [{ type: 'sameFloor', a: 'luno', b: 'ember' }, false],
    [{ type: 'differentFloor', a: 'luno', b: 'dou' }, false], [{ type: 'differentFloor', a: 'luno', b: 'ember' }, true],
    [{ type: 'leftOf', a: 'luno', b: 'dou' }, true], [{ type: 'leftOf', a: 'dou', b: 'luno' }, false],
    [{ type: 'leftOf', a: 'luno', b: 'rollo' }, false], [{ type: 'avoid', guest: 'rollo', condition: 'warm' }, false],
  ] as [Rule, boolean][])('%j evaluates to %s', (rule, expected) => expect(satisfiesRule(level, ordered, rule)).toBe(expected));
  it('rejects relational failure even when every amenity matches', () => {
    expect(validate({ ...level, rules: [{ type: 'leftOf', a: 'dou', b: 'luno' }] }, ordered).reason).toBe('rule');
    expect(validate(level, ordered).valid).toBe(true);
  });
  it('checks exclusions against secondary amenities too', () => {
    expect(satisfiesRule(level, ordered, { type: 'avoid', guest: 'luno', condition: 'warm' })).toBe(false);
    expect(satisfiesRule(levels[0], { luno: '201' }, { type: 'avoid', guest: 'luno', condition: 'warm' })).toBe(true);
  });
});

it('distinguishes nonadjacent rooms on one long corridor from separate floors', () => {
  const assignment = { luno: '201', ember: '203' };
  expect(satisfiesRule(levels[0], assignment, { type: 'sameFloor', a: 'luno', b: 'ember' })).toBe(true);
  expect(satisfiesRule(levels[0], assignment, { type: 'adjacent', a: 'luno', b: 'ember' })).toBe(false);
  expect(satisfiesRule(levels[0], assignment, { type: 'apart', a: 'luno', b: 'ember' })).toBe(true);
});
