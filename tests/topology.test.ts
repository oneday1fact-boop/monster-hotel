import { expect, it } from 'vitest';
import { levels } from '../src/domain/levels';
import { satisfiesRule } from '../src/domain/puzzle';
import { roomPoint, residentPoint } from '../src/game/layout';
import { ruleText } from '../src/i18n/rules';
it('all campaign rooms occupy four distinct cutaway spaces and keep residents inside them', () => {
  for (const level of levels) {
    expect(new Set(level.rooms.map(r => JSON.stringify(roomPoint(r)))).size).toBe(4);
    for (const room of level.rooms) {
      const center = roomPoint(room); const actor = residentPoint(room);
      expect(Math.abs(actor.x - center.x)).toBeLessThan(181); expect(Math.abs(actor.y - center.y)).toBeLessThan(54);
      expect([0, 1]).toContain(room.floor);
    }
  }
});
it('adjacency and left-of rules agree with the rendered cutaway on every night', () => {
  for (const level of levels) for (const a of level.rooms) for (const b of level.rooms) {
    if (a.id === b.id) continue;
    const p = roomPoint(a); const q = roomPoint(b); const assignment = { luno: a.id, dou: b.id };
    expect(satisfiesRule(level, assignment, { type: 'adjacent', a: 'luno', b: 'dou' })).toBe(p.y === q.y);
    expect(satisfiesRule(level, assignment, { type: 'leftOf', a: 'luno', b: 'dou' })).toBe(p.y === q.y && p.x < q.x);
  }
});
it('floor clues describe basement and upper floor in both languages', () => {
  expect(ruleText(levels[0], { type: 'floor', guest: 'luno', floor: 0 }, 'zh-Hant')).toContain('地下層');
  expect(ruleText(levels[0], { type: 'floor', guest: 'luno', floor: 1 }, 'en')).toContain('upper floor');
});
