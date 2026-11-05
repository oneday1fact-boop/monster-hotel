import type { Level, Room, Rule } from '../domain/puzzle';
import { floorName } from '../game/layout';
import { roomConditions } from '../domain/puzzle';
import { characters, conditions, type Locale } from './catalog';
export function roomLabel(room: Room, locale: Locale): string {
  const names = roomConditions(room).map(c => conditions[locale][c].name);
  return names.length === 4 ? (locale === 'en' ? 'All amenities' : '四種設施齊備') : names.join(' · ');
}
export function ruleText(level: Level, rule: Rule, locale: Locale): string {
  const name = (id: string) => characters[locale][level.guests.find(g => g.id === id)!.kind].name;
  if (rule.type === 'floor') return locale === 'en' ? `${name(rule.guest)} must stay on the ${floorName(rule.floor, locale).toLowerCase()}.` : `${name(rule.guest)}必須住在${floorName(rule.floor, locale)}。`;
  if (rule.type === 'avoid') return locale === 'en' ? `${name(rule.guest)} must avoid ${conditions[locale][rule.condition].name.toLowerCase()} rooms.` : `${name(rule.guest)}不能住有「${conditions[locale][rule.condition].name}」條件的房間。`;
  const a = name(rule.a); const b = name(rule.b);
  const templates = locale === 'en' ? {
    adjacent: `${a} and ${b} must be next door on the same floor.`, apart: `${a} and ${b} must not be next-door neighbors.`,
    sameFloor: `${a} and ${b} must stay on the same floor.`, differentFloor: `${a} and ${b} must stay on different floors.`,
    leftOf: `${a} must stay to the left of ${b}, on the same floor.`,
  } : {
    adjacent: `${a}和${b}必須同層相鄰。`, apart: `${a}和${b}不能同層相鄰。`,
    sameFloor: `${a}和${b}必須住在同一樓層。`, differentFloor: `${a}和${b}必須住在不同樓層。`,
    leftOf: `${a}必須住在${b}的同層左邊。`,
  };
  return templates[rule.type];
}
export const campaignUI = {
  en: { levels: 'Puzzle challenges', choose: 'Choose a night  →', locked: 'Locked', cleared: 'Complete', play: 'Play', night: 'Night', next: 'Next challenge  →', clues: 'Night clues', map: 'Upper floor: 101 / 102. Basement: B01 / B02. Only rooms side by side on the same floor are neighbors. Left/right follows the cutaway view.', noRules: 'Tonight, matching each guest’s usual wish is enough.', rulesReminder: 'Check the night clues as well as each guest’s wish.', retry: 'An extra clue is unmet. Open “Night clues” and compare the rooms.', floor: 'Floor', unlocked: 'Unlocked', finished: 'More challenges are on the way!', reward: '50 coins for first completion only', tonight: 'Tonight’s extra clues', return: 'Back to nights', },
  'zh-Hant': { levels: '解謎挑戰', choose: '選擇關卡  →', locked: '未解鎖', cleared: '已完成', play: '開始', night: '第', next: '下一關  →', clues: '本晚線索', map: '一樓是 101／102，地下層是 B01／B02。同層左右兩房才算相鄰；上下層不算相鄰。', noRules: '這晚只需滿足每位住客原本的入住心願。', rulesReminder: '除了入住心願，也要留意「本晚線索」。', retry: '還有本晚線索未符合，打開線索再比較房間吧。', floor: '樓層', unlocked: '已解鎖', finished: '更多關卡陸續加入！', reward: '每晚首次完成可獲 50 金幣', tonight: '今晚的額外線索', return: '返回關卡選擇', },
} as const;
