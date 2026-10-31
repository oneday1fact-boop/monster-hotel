export type Condition = 'moonlight' | 'quiet' | 'warm' | 'water';
export interface Room { id: string; name: string; condition: Condition }
export interface Guest { id: string; name: string; species: string; requirement: Condition; description: string; color: number; kind: 'fox' | 'jiangshi' | 'lantern' | 'kappa' }
export interface Level { id: number; rooms: readonly Room[]; guests: readonly Guest[] }
export type Assignment = Record<string, string>;
export const firstLevel: Level = {
  id: 1,
  rooms: [{ id: '201', name: 'Moon suite', condition: 'moonlight' }, { id: '202', name: 'Whisper room', condition: 'quiet' }, { id: '203', name: 'Hearth room', condition: 'warm' }, { id: '204', name: 'Rain pool room', condition: 'water' }],
  guests: [
    { id: 'yue', name: 'Yue', species: 'Nine-tail fox', requirement: 'moonlight', description: 'A proud little fox who combs nine silver tails by moonlight.', color: 0xf6dfbd, kind: 'fox' },
    { id: 'dou', name: 'Dou', species: 'Jiangshi', requirement: 'quiet', description: 'A sleepy hopping traveler whose paper charm rustles at every sound.', color: 0xa5d5cf, kind: 'jiangshi' },
    { id: 'ember', name: 'Ember', species: 'Lantern spirit', requirement: 'warm', description: 'A mischievous old paper lantern who needs warmth for a steady glow.', color: 0xf4a265, kind: 'lantern' },
    { id: 'sumi', name: 'Sumi', species: 'Kappa', requirement: 'water', description: 'A polite river guest who needs a pool to refill the dish on their head.', color: 0xa9d795, kind: 'kappa' }

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
