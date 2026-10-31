export type Condition = 'moonlight' | 'quiet' | 'warm';
export interface Room { id: string; name: string; condition: Condition }
export interface Guest { id: string; name: string; requirement: Condition; description: string; color: number; kind: 'bat' | 'ghost' | 'wolf' }
export interface Level { id: number; rooms: readonly Room[]; guests: readonly Guest[] }
export type Assignment = Record<string, string>;
export const firstLevel: Level = {
  id: 1,
  rooms: [{ id: '201', name: 'Moon suite', condition: 'moonlight' }, { id: '202', name: 'Whisper room', condition: 'quiet' }, { id: '203', name: 'Hearth room', condition: 'warm' }],
  guests: [
    { id: 'pip', name: 'Pip', requirement: 'moonlight', description: 'A tiny night-wing who loves moonlight.', color: 0xb49aff, kind: 'bat' },
    { id: 'momo', name: 'Momo', requirement: 'quiet', description: 'A shy spirit who needs a quiet room.', color: 0x9ee8df, kind: 'ghost' },
    { id: 'bramble', name: 'Bramble', requirement: 'warm', description: 'A little woodland wolf who likes warmth.', color: 0xf3b68d, kind: 'wolf' }
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
