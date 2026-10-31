export type Condition = 'moonlight' | 'quiet' | 'warm' | 'dry';
export interface Room { id: string; condition: Condition; features?: readonly Condition[]; floor?: number; position?: number }
export interface Guest { id: string; requirement: Condition; color: number; kind: 'werewolf' | 'jiangshi' | 'lantern' | 'mummy' }
export type Rule =
  | { type: 'floor'; guest: string; floor: number }
  | { type: 'avoid'; guest: string; condition: Condition }
  | { type: 'adjacent' | 'apart' | 'sameFloor' | 'differentFloor' | 'leftOf'; a: string; b: string };
export interface Level { id: number; rooms: readonly Room[]; guests: readonly Guest[]; rules?: readonly Rule[] }
export type Assignment = Record<string, string>;
export const guests: readonly Guest[] = [
  { id: 'luno', requirement: 'moonlight', color: 0xb5b5d9, kind: 'werewolf' },
  { id: 'dou', requirement: 'quiet', color: 0xa5d5cf, kind: 'jiangshi' },
  { id: 'ember', requirement: 'warm', color: 0xf4a265, kind: 'lantern' },
  { id: 'rollo', requirement: 'dry', color: 0xf3e6c9, kind: 'mummy' },
];
export const firstLevel: Level = {
  id: 1, guests,
  rooms: [
    { id: 'B01', condition: 'quiet', floor: 0, position: 1 },
    { id: 'B02', condition: 'warm', floor: 0, position: 2 },
    { id: '101', condition: 'moonlight', floor: 1, position: 1 },
    { id: '102', condition: 'dry', floor: 1, position: 2 },
  ],
};
export function roomConditions(room: Room): readonly Condition[] { return [room.condition, ...(room.features ?? [])]; }
export function satisfiesRule(level: Level, assignment: Assignment, rule: Rule): boolean {
  const roomFor = (guest: string) => level.rooms.find(r => r.id === assignment[guest]);
  if (rule.type === 'floor') return roomFor(rule.guest)?.floor === rule.floor;
  if (rule.type === 'avoid') { const room = roomFor(rule.guest); return !!room && !roomConditions(room).includes(rule.condition); }
  const a = roomFor(rule.a); const b = roomFor(rule.b);
  if (!a || !b) return false;
  const sameFloor = a.floor !== undefined && a.floor === b.floor;
  const adjacent = sameFloor && a.position !== undefined && b.position !== undefined && Math.abs(a.position - b.position) === 1;
  switch (rule.type) {
    case 'adjacent': return adjacent;
    case 'apart': return !adjacent;
    case 'sameFloor': return sameFloor;
    case 'differentFloor': return !sameFloor;
    case 'leftOf': return sameFloor && a.position !== undefined && b.position !== undefined && a.position < b.position;
  }
}
export function validate(level: Level, assignment: Assignment): { valid: boolean; reason: 'complete' | 'incomplete' | 'unknown' | 'occupied' | 'requirement' | 'rule' } {
  if (Object.keys(assignment).some(id => !level.guests.some(g => g.id === id))) return { valid: false, reason: 'unknown' };
  const used = new Set<string>();
  for (const guest of level.guests) {
    const id = assignment[guest.id];
    if (!id) return { valid: false, reason: 'incomplete' };
    if (!level.rooms.some(r => r.id === id)) return { valid: false, reason: 'unknown' };
    if (used.has(id)) return { valid: false, reason: 'occupied' };
    used.add(id);
  }
  if (level.guests.some(g => !roomConditions(level.rooms.find(r => r.id === assignment[g.id])!).includes(g.requirement))) return { valid: false, reason: 'requirement' };
  if (level.rules?.some(rule => !satisfiesRule(level, assignment, rule))) return { valid: false, reason: 'rule' };
  return { valid: true, reason: 'complete' };
}
/** Exhaustive permutation search. Four guests require at most 24 complete checks. */
export function solve(level: Level): Assignment[] {
  const solutions: Assignment[] = [];
  function visit(index: number, assignment: Assignment, used: Set<string>) {
    if (index === level.guests.length) { if (validate(level, assignment).valid) solutions.push({ ...assignment }); return; }
    const guest = level.guests[index];
    for (const room of level.rooms) {
      if (used.has(room.id) || !roomConditions(room).includes(guest.requirement)) continue;
      assignment[guest.id] = room.id; used.add(room.id); visit(index + 1, assignment, used); used.delete(room.id); delete assignment[guest.id];
    }
  }
  visit(0, {}, new Set()); return solutions;
}
export function place(assignment: Assignment, guest: string, room: string): Assignment {
  const next = { ...assignment };
  for (const id of Object.keys(next)) if (next[id] === room) delete next[id];
  next[guest] = room;
  return next;
}
