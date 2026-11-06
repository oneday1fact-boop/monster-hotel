import { firstLevel, roomConditions, type Assignment } from './puzzle';
export type TutorialStep = 'select' | 'place' | 'free' | 'check';
export interface TutorialView { step: TutorialStep; guestId: string; roomId: string; correction: boolean }
/** Guidance follows the actual puzzle; it never assigns a room or blocks experimentation. */
export function tutorialView(night: number, completed: readonly number[], dismissed: boolean, assignment: Assignment, selected?: string): TutorialView | undefined {
  if (night !== 1 || completed.includes(1) || dismissed) return;
  const guest = firstLevel.guests.find(g => g.kind === 'werewolf')!;
  const room = firstLevel.rooms.find(r => r.id === assignment[guest.id]);
  const placed = !!room && roomConditions(room).includes(guest.requirement);
  const step = placed ? (firstLevel.guests.every(g => assignment[g.id]) ? 'check' : 'free') : selected === guest.id ? 'place' : 'select';
  return { step, guestId: guest.id, roomId: room?.id ?? '', correction: !!assignment[guest.id] && !placed };
}
