import type { Assignment, Level } from './puzzle';
export type Hint = { type: 'strategy' } | { type: 'complete' } | { type: 'focus'; guestId: string } | { type: 'placement'; guestId: string; roomId: string };
/** Hints explain one unresolved wish at a time and never mutate the puzzle. */
export function getHint(level: Level, assignment: Assignment, stage: number): Hint {
  const unresolved = level.guests.find(g => {
    const room = level.rooms.find(r => r.id === assignment[g.id]);
    return room?.condition !== g.requirement;
  });
  if (!unresolved) return { type: 'complete' };
  if (stage <= 1) return { type: 'strategy' };
  const room = level.rooms.find(r => r.condition === unresolved.requirement);
  if (stage === 2 || !room) return { type: 'focus', guestId: unresolved.id };
  return { type: 'placement', guestId: unresolved.id, roomId: room.id };
}
