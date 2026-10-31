import type { Room } from '../domain/puzzle';
/** Shared dollhouse geometry: two upper rooms, two basement rooms and a ground-level queue. */
export const queueX = [180, 330, 480, 630] as const;
export const queueY = 379;
export function roomPoint(room: Room) { return { x: room.position === 1 ? 225 : 619, y: room.floor === 1 ? 162 : 282 }; }
export function residentPoint(room: Room) { const p = roomPoint(room); return { x: p.x + 90, y: p.y + 18 }; }
export function floorName(floor: number | undefined, locale: 'en' | 'zh-Hant') { return floor === 0 ? (locale === 'en' ? 'Basement' : '地下層') : (locale === 'en' ? 'Upper floor' : '一樓'); }

export function roomStyle(room: Room): 'elegant' | 'linen' | 'basement' | 'hearth' {
  if (room.floor === 1) return room.position === 1 ? 'elegant' : 'linen';
  return room.position === 1 ? 'basement' : 'hearth';
}
