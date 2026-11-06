import { firstLevel, type Assignment } from '../domain/puzzle';
import type { TutorialView } from '../domain/tutorial';
import type { Locale } from '../i18n/catalog';
import { tutorialUI } from '../i18n/tutorial';
import { icon } from './icons';
import { queueX, queueY, residentPoint, roomPoint, roomWidth, roomHeight } from './layout';
/** Passive coaching leaves the hotel, all gestures and navigation available. */
export function createTutorialCoach(root: HTMLElement, locale: Locale, skip: () => void) {
  const t = tutorialUI[locale];
  const region = document.createElement('section'); region.className = 'tutorial-coach'; region.setAttribute('aria-label', t.title); region.hidden = true;
  const symbol = document.createElement('span'); symbol.className = 'tutorial-symbol';
  const message = document.createElement('p'); message.setAttribute('aria-live', 'polite'); message.setAttribute('aria-atomic', 'true');
  const button = document.createElement('button'); button.type = 'button'; button.className = 'tutorial-skip'; button.setAttribute('aria-label', t.skip); button.textContent = t.shortSkip; button.onclick = skip;
  region.append(symbol, message, button);
  const guest = document.createElement('div'); guest.className = 'tutorial-target tutorial-target--guest'; guest.hidden = true; guest.setAttribute('aria-hidden', 'true');
  const room = document.createElement('div'); room.className = 'tutorial-target tutorial-target--room'; room.hidden = true; room.setAttribute('aria-hidden', 'true'); root.append(guest, room, region);
  function box(element: HTMLElement, x: number, y: number, width: number, height: number) {
    Object.assign(element.style, { left: `${(x - width / 2) / 844 * 100}%`, top: `${(y - height / 2) / 480 * 100}%`, width: `${width / 844 * 100}%`, height: `${height / 480 * 100}%` });
  }
  return (view: TutorialView | undefined, assignment: Assignment) => {
    region.hidden = !view; guest.hidden = true; room.hidden = true; delete root.dataset.tutorial;
    if (!view) return;
    root.dataset.tutorial = view.step; region.dataset.step = view.step;
    message.textContent = view.correction ? t.correction : t[view.step];
    symbol.replaceChildren(icon(view.step === 'select' || view.step === 'place' ? 'moon' : view.step === 'free' ? 'bulb' : 'check'));
    if (view.step === 'select' || view.step === 'place') {
      const occupied = firstLevel.rooms.find(r => r.id === assignment[view.guestId]);
      const point = occupied ? residentPoint(occupied) : { x: queueX[firstLevel.guests.findIndex(g => g.id === view.guestId)], y: queueY };
      box(guest, point.x, point.y, 94, 86); guest.hidden = false;
    }
    // Teach the gesture without revealing the room assignment.

  };
}
