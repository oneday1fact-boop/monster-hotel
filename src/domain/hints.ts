import { solve, validate, type Assignment, type Level } from './puzzle';
export type Hint = { type: 'strategy' } | { type: 'complete' } | { type: 'focus'; guestId: string } | { type: 'placement'; guestId: string; roomId: string };
/** Solve all amenities and relational clues before explaining one unresolved placement. */
export function getHint(level: Level, assignment: Assignment, stage: number): Hint {
  if (validate(level, assignment).valid) return { type: 'complete' };
  if (stage <= 1) return { type: 'strategy' };
  const solutions = solve(level);
  if (solutions.length !== 1) return { type: 'strategy' };
  const target = solutions[0];
  const unresolved = level.guests.find(g => assignment[g.id] !== target[g.id]);
  if (!unresolved) return { type: 'strategy' };
  if (stage === 2) return { type: 'focus', guestId: unresolved.id };
  return { type: 'placement', guestId: unresolved.id, roomId: target[unresolved.id] };
}
