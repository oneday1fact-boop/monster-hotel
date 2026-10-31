import { expect, it } from 'vitest';
import { campaignUI, roomLabel, ruleText } from '../src/i18n/rules';
import { levels } from '../src/domain/levels';
it('localizes every campaign clue and combined room label in both languages', () => {
  expect(Object.keys(campaignUI.en).sort()).toEqual(Object.keys(campaignUI['zh-Hant']).sort());
  for (const locale of ['en', 'zh-Hant'] as const) for (const level of levels) {
    for (const rule of level.rules ?? []) { const text = ruleText(level, rule, locale); expect(text).not.toContain('undefined'); expect(text.length).toBeGreaterThan(5); }
    for (const room of level.rooms) { expect(roomLabel(room, locale)).not.toBe(''); expect(roomLabel(room, locale)).not.toContain('undefined'); }
  }
});
