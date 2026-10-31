export type Condition = 'moonlight' | 'quiet' | 'warm' | 'dry';
export interface Room { id: string; condition: Condition }
export interface Guest { id: string; requirement: Condition; color: number; kind: 'werewolf' | 'jiangshi' | 'lantern' | 'mummy' }
export interface Level { id: number; rooms: readonly Room[]; guests: readonly Guest[] }
export type Assignment = Record<string, string>;
export const firstLevel: Level = {
  id: 1,
  rooms: [{ id: '201', condition: 'moonlight' }, { id: '202', condition: 'quiet' }, { id: '203', condition: 'warm' }, { id: '204', condition: 'dry' }],
  guests: [
    { id: 'luno', requirement: 'moonlight', color: 0xb5b5d9, kind: 'werewolf' },
    { id: 'dou', requirement: 'quiet', color: 0xa5d5cf, kind: 'jiangshi' },
    { id: 'ember', requirement: 'warm', color: 0xf4a265, kind: 'lantern' },
    { id: 'rollo', requirement: 'dry', color: 0xf3e6c9, kind: 'mummy' }
  ]
};
export function validate(level: Level, assignment: Assignment): { valid: boolean; reason: 'complete' | 'incomplete' | 'unknown' | 'occupied' | 'requirement' } {
  if (Object.keys(assignment).some(id => !level.guests.some(g => g.id === id))) return { valid: false, reason: 'unknown' };
  const used = new Set<string>();
  for (const guest of level.guests) {
    const id = assignment[guest.id];
    if (!id) return { valid: false, reason: 'incomplete' };
    const room = level.rooms.find(r => r.id === id);
    if (!room) return { valid: false, reason: 'unknown' };
    if (used.has(id)) return { valid: false, reason: 'occupied' };
    used.add(id);
  }
  if (level.guests.some(g => level.rooms.find(r => r.id === assignment[g.id])?.condition !== g.requirement)) return { valid: false, reason: 'requirement' };
  return { valid: true, reason: 'complete' };
}
export function place(assignment: Assignment, guest: string, room: string): Assignment {
  const next = { ...assignment };
  for (const id of Object.keys(next)) if (next[id] === room) delete next[id];
  next[guest] = room;
  return next;
}
