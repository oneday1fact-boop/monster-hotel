import type { Assignment } from '../domain/puzzle';
import { storyLevel, type StoryChoice, type StoryDraft, type Tool } from '../domain/storyNight';
import { characters, type Locale } from '../i18n/catalog';
import { storyUI } from '../i18n/storyNight';
import { icon, iconButton } from './icons';
export interface StoryActions {
  home(): void; language(): void; settings(): void; reset(): void; ready(): void;
  guest(id: string): void; tool(tool: Tool): void; room(id: string): void;
  focus(id?: string): void; dropTool(tool: Tool, x: number, y: number): void;
  choice(choice: StoryChoice): void; skip(): void; replay(): void;
}
export function createStoryHUD(locale: Locale, draft: StoryDraft, selected: string | undefined, tool: Tool | undefined, focus: string | undefined, actions: StoryActions) {
  const t = storyUI[locale]; const root = document.createElement('nav'); root.className = 'story-hud'; root.dataset.phase = draft.phase; root.setAttribute('aria-label', t.story);
  for (const name of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'click']) root.addEventListener(name, e => e.stopPropagation());
  const top = document.createElement('div'); top.className = 'story-top';
  const home = iconButton('home', t.home, actions.home); home.dataset.escape = 'true';
  const title = document.createElement('div'); title.className = 'story-heading'; const label = document.createElement('strong'); label.textContent = t.title;
  const progress = document.createElement('span'); progress.className = 'story-progress'; progress.textContent = locale === 'en' ? 'Settle  ·  Play  ·  Friends' : '安頓  ·  小事件  ·  熟客'; title.append(label, progress);
  const right = document.createElement('div'); right.className = 'hud-cluster'; right.append(iconButton('globe', t.language, actions.language), iconButton('gear', locale === 'en' ? 'Settings' : '設定', actions.settings)); top.append(home, title, right); root.append(top);
  const notice = document.createElement('div'); notice.className = 'story-notice'; notice.setAttribute('role', 'status'); notice.hidden = true; root.append(notice);
  let disposeDrag: (() => void) | undefined; let noticeTimer: ReturnType<typeof setTimeout> | undefined;
  function button(text: string, callback: () => void, primary = false) { const b = document.createElement('button'); b.type = 'button'; b.className = primary ? 'game-primary-button' : 'game-secondary-button'; b.textContent = text; b.onclick = callback; return b; }
  if (draft.phase === 'arranging') {
    for (const room of storyLevel.rooms.filter(r => !focus || r.id === focus)) {
      const left = focus ? 20 : room.position === 1 ? 8 : 446; const top = focus ? 86 : room.floor === 1 ? 70 : 204;
      const target = button(room.id, () => actions.room(room.id)); target.className = 'story-room-label'; target.dataset.room = room.id; target.setAttribute('aria-label', locale === 'en' ? `Room ${room.id}` : `房間 ${room.id}`); target.style.left = `${left / 844 * 100}%`; target.style.top = `${top / 480 * 100}%`; root.append(target);
      if (!focus) { const zoom = iconButton('zoom', `${t.look} ${room.id}`, () => actions.focus(room.id)); zoom.classList.add('story-room-focus'); zoom.dataset.focus = room.id; zoom.style.left = `${(left + 342) / 844 * 100}%`; zoom.style.top = `${top / 480 * 100}%`; root.append(zoom); }
    }
    if (focus) { const back = button(t.back, () => actions.focus()); back.classList.add('story-focus-back'); root.append(back); }
    const dock = document.createElement('div'); dock.className = 'story-dock';
    for (const guest of storyLevel.guests) {
      const name = characters[locale][guest.kind].name; const b = button(name, () => actions.guest(guest.id)); b.classList.add('story-guest'); b.dataset.guest = guest.id; b.setAttribute('aria-label', locale === 'en' ? `Select ${name}` : `選擇${name}`); b.setAttribute('aria-pressed', String(selected === guest.id));
      const portrait = document.createElement('span'); portrait.className = `story-face story-face--${guest.kind}`; b.prepend(portrait); dock.append(b);
    }
    for (const key of ['curtain', 'moonLamp'] as const) {
      const b = button(locale === 'en' ? (key === 'curtain' ? 'Curtain' : 'Moon') : (key === 'curtain' ? '窗簾' : '月燈'), () => actions.tool(key)); b.classList.add('story-tool'); b.dataset.tool = key; b.prepend(icon(key === 'curtain' ? 'quiet' : 'moon')); b.setAttribute('aria-label', t[key]); b.setAttribute('aria-pressed', String(tool === key));
      let start: { x: number; y: number; id: number } | undefined; let moved = false; let ghost: HTMLElement | undefined; let suppress = false;
      const cleanup = () => { document.removeEventListener('pointermove', move, true); document.removeEventListener('pointerup', up, true); document.removeEventListener('pointercancel', cancel, true); ghost?.remove(); ghost = undefined; start = undefined; };
      const move = (event: PointerEvent) => { if (!start || event.pointerId !== start.id) return; if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 9) moved = true; if (!moved) return; event.preventDefault(); if (!ghost) { ghost = document.createElement('div'); ghost.className = 'story-tool-ghost'; ghost.append(icon(key === 'curtain' ? 'quiet' : 'moon')); document.body.append(ghost); } ghost.style.left = `${event.clientX}px`; ghost.style.top = `${event.clientY}px`; };
      const up = (event: PointerEvent) => { if (!start || event.pointerId !== start.id) return; const dragged = moved; cleanup(); if (dragged) { suppress = true; actions.dropTool(key, event.clientX, event.clientY); } };
      const cancel = () => cleanup();
      b.onpointerdown = event => { if (b.disabled) return; disposeDrag?.(); moved = false; suppress = false; start = { x: event.clientX, y: event.clientY, id: event.pointerId }; document.addEventListener('pointermove', move, true); document.addEventListener('pointerup', up, true); document.addEventListener('pointercancel', cancel, true); disposeDrag = cleanup; };
      b.onclick = () => { if (suppress) { suppress = false; return; } actions.tool(key); }; dock.append(b);
    }
    const ready = button(t.ready, actions.ready, true); ready.dataset.action = 'settle'; ready.prepend(icon('check')); dock.append(ready, iconButton('reset', t.reset, actions.reset)); root.append(dock);
  } else if (draft.phase === 'event') {
    const caption = document.createElement('section'); caption.className = 'story-event-copy';
    const face = document.createElement('span'); face.className = 'story-dialogue-portrait story-face story-face--werewolf'; face.setAttribute('aria-hidden', 'true');
    const content = document.createElement('div'); content.className = 'story-dialogue-content';
    const speaker = document.createElement('strong'); speaker.className = 'story-speaker'; speaker.textContent = `${t.luno} & ${t.rollo}`;
    const message = document.createElement('p'); message.className = 'story-message'; message.textContent = t.event;
    content.append(speaker, message); caption.append(face, content); root.append(caption);
    const choices = document.createElement('div'); choices.className = 'story-choices'; choices.append(button(t.play, () => actions.choice('play'), true), button(t.together, () => actions.choice('together'), true)); root.append(choices);
    const skip = button(locale === 'en' ? 'Skip scene' : '跳過演出', actions.skip); skip.classList.add('story-skip'); skip.dataset.escape = 'true'; root.append(skip);
  }
  document.body.append(root);
  return {
    root,
    show(message: string) { clearTimeout(noticeTimer); notice.hidden = !message; notice.textContent = message; if (message) noticeTimer = setTimeout(() => { notice.hidden = true; }, 4500); },
    busy(value: boolean) { root.querySelectorAll<HTMLButtonElement>('button').forEach(b => { if (!b.dataset.escape) b.disabled = value; }); },
    caption(text: string) { const p = root.querySelector('.story-message'); if (p) p.textContent = text; },
    ending(reward: number, bonds: { luno: number; rollo: number }, replayed: boolean) {
      const panel = document.createElement('section'); panel.className = 'story-ending'; panel.setAttribute('aria-label', t.done);
      const title = document.createElement('h2'); title.textContent = t.done; const coins = document.createElement('p'); coins.className = 'story-coins'; coins.textContent = `${t.reward} +${reward}`; coins.prepend(icon('coin')); panel.append(title, coins);
      for (const id of ['luno', 'rollo'] as const) { const row = document.createElement('p'); row.className = 'story-bond'; row.dataset.bond = id; row.textContent = `${t[id]}  ${'♥'.repeat(bonds[id])}${'♡'.repeat(5 - bonds[id])}`; panel.append(row); }
      const note = document.createElement('small'); note.textContent = t.replayNote; panel.append(note, button(t.home, actions.home, true), button(t.replay, actions.replay)); root.append(panel);
    },
    destroy() { clearTimeout(noticeTimer); disposeDrag?.(); root.remove(); },
  };
}
