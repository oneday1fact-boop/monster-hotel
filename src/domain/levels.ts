import { firstLevel, guests, type Condition, type Level, type Rule } from './puzzle';
const feature: Record<string, Condition> = { M: 'moonlight', Q: 'quiet', W: 'warm', D: 'dry' };
const floor = (guest: string, value: number): Rule => ({ type: 'floor', guest, floor: value });
const pair = (type: 'adjacent' | 'apart' | 'sameFloor' | 'differentFloor' | 'leftOf', a: string, b: string): Rule => ({ type, a, b });
const avoid = (guest: string, condition: Condition): Rule => ({ type: 'avoid', guest, condition });
interface Night { id: number; title: [string, string]; rooms: [string, string, string, string]; rules: Rule[] }
// Explicit authored room amenities and clues. No random generation or hidden answer pins.
// Titles are [English, Traditional Chinese]. M/Q/W/D = moonlight/quiet/warm/dry.
const nights: Night[] = [
  { id: 2, title: ['A change of rooms', '換個房間'], rooms: ['D', 'M', 'Q', 'W'], rules: [] },
  { id: 3, title: ['Moonlit neighbors', '月下鄰居'], rooms: ['MQ', 'MQ', 'W', 'D'], rules: [pair('leftOf', 'luno', 'dou')] },
  { id: 4, title: ['Upstairs lantern', '樓上的燈火'], rooms: ['WD', 'Q', 'WD', 'M'], rules: [floor('ember', 1)] },
  { id: 5, title: ['A dry corner', '乾爽的角落'], rooms: ['MD', 'MDW', 'Q', 'W'], rules: [avoid('rollo', 'warm')] },
  { id: 6, title: ['Quiet company', '安靜的陪伴'], rooms: ['MQ', 'W', 'MQ', 'D'], rules: [pair('sameFloor', 'dou', 'rollo')] },
  { id: 7, title: ['Separate stories', '分層的故事'], rooms: ['M', 'QW', 'QW', 'D'], rules: [pair('differentFloor', 'dou', 'luno')] },
  { id: 8, title: ['A little distance', '留一點距離'], rooms: ['MW', 'Q', 'MW', 'D'], rules: [pair('apart', 'luno', 'dou')] },
  { id: 9, title: ['Bandage next door', '隔壁的繃帶'], rooms: ['M', 'QD', 'QD', 'W'], rules: [pair('adjacent', 'rollo', 'luno')] },
  { id: 10, title: ['Crossed wishes', '交錯的心願'], rooms: ['MQ', 'MQ', 'WD', 'WD'], rules: [pair('leftOf', 'dou', 'luno'), pair('leftOf', 'rollo', 'ember')] },
  { id: 11, title: ['Moon above the hearth', '壁爐之上的月光'], rooms: ['MW', 'QD', 'MW', 'QD'], rules: [floor('luno', 1), pair('sameFloor', 'rollo', 'luno')] },
  { id: 12, title: ['No warm bandages', '繃帶不要暖氣'], rooms: ['MQD', 'QW', 'MQWD', 'QD'], rules: [avoid('rollo', 'warm'), pair('leftOf', 'dou', 'rollo'), floor('ember', 0)] },
  { id: 13, title: ['A friendly corridor', '友善的走廊'], rooms: ['MQW', 'MQD', 'QWD', 'MWD'], rules: [pair('leftOf', 'luno', 'dou'), pair('leftOf', 'ember', 'rollo')] },
  { id: 14, title: ['Two quiet floors', '兩層好夢'], rooms: ['MQD', 'MQW', 'MWD', 'QWD'], rules: [pair('leftOf', 'rollo', 'dou'), pair('leftOf', 'luno', 'ember'), floor('luno', 1)] },
  { id: 15, title: ['Paper and moonlight', '紙符與月光'], rooms: ['MQWD', 'MQ', 'WD', 'MQWD'], rules: [pair('leftOf', 'ember', 'luno'), pair('leftOf', 'rollo', 'dou'), floor('ember', 0)] },
  { id: 16, title: ['The lantern’s guest', '燈火的客人'], rooms: ['MQWD', 'MQWD', 'MQWD', 'MQWD'], rules: [floor('ember', 0), pair('leftOf', 'ember', 'rollo'), pair('leftOf', 'dou', 'luno')] },
  { id: 17, title: ['An upstairs promise', '樓上的約定'], rooms: ['MQWD', 'MQWD', 'MQWD', 'MQWD'], rules: [floor('dou', 1), pair('leftOf', 'dou', 'ember'), pair('leftOf', 'luno', 'rollo')] },
  { id: 18, title: ['A shy welcome', '害羞的招呼'], rooms: ['MQWD', 'MQWD', 'MQWD', 'MQWD'], rules: [floor('rollo', 0), pair('leftOf', 'rollo', 'luno'), pair('leftOf', 'ember', 'dou')] },
  { id: 19, title: ['Midnight rendezvous', '午夜的相遇'], rooms: ['MQWD', 'MQWD', 'MQWD', 'MQWD'], rules: [floor('luno', 1), pair('leftOf', 'luno', 'dou'), pair('leftOf', 'ember', 'rollo')] },
  { id: 20, title: ['Everyone belongs', '每位住客都有家'], rooms: ['MQWD', 'MQWD', 'MQWD', 'MQWD'], rules: [floor('rollo', 1), pair('leftOf', 'rollo', 'ember'), pair('leftOf', 'dou', 'luno')] },
];
export const levels: readonly Level[] = [firstLevel, ...nights.map(n => ({
  id: n.id, guests, rules: n.rules,
  rooms: n.rooms.map((code, i) => {
    const amenities = [...code].map(key => feature[key]);
    return { id: ['B01', 'B02', '101', '102'][i], floor: i < 2 ? 0 : 1, position: i % 2 + 1, condition: amenities[0], features: amenities.slice(1) };
  }),
}))];
export function levelTitle(id: number, locale: 'en' | 'zh-Hant'): string {
  if (id === 1) return locale === 'en' ? 'The first check-in' : '第一次入住';
  return nights.find(n => n.id === id)?.title[locale === 'en' ? 0 : 1] ?? '';
}
export function isUnlocked(id: number, completed: readonly number[]): boolean {
  return Number.isInteger(id) && id >= 1 && id <= levels.length && levels.slice(0, id - 1).every(level => completed.includes(level.id));
}
export function nextNight(completed: readonly number[]): number { return levels.find(l => !completed.includes(l.id))?.id ?? levels.length; }
