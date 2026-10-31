import { icon, iconButton } from './icons';
export interface DetailSection { title: string; body: string }
export interface Details { eyebrow: string; title: string; sections: DetailSection[]; close: string; content?: HTMLElement; contentFirst?: boolean; kind?: 'settings' | 'language' | 'shop' | 'card' | 'hints'; next?: { label: string; action: () => void } }
/** Full-screen game sheet; its disposer is silent so replacing screens cannot trigger navigation. */
export function showDetails(data: Details, onClose: () => void): () => void {
  const overlay = document.createElement('div'); overlay.className = 'details-overlay';
  const dialog = document.createElement('section'); dialog.className = `details-card game-sheet game-sheet--${data.kind ?? 'card'}`;
  dialog.setAttribute('role', 'dialog'); dialog.setAttribute('aria-modal', 'true'); dialog.setAttribute('aria-labelledby', 'details-title');
  const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const destroy = () => { document.removeEventListener('keydown', onKey); overlay.remove(); };
  const dismiss = () => { destroy(); previous?.focus(); onClose(); };
  const header = document.createElement('header'); header.className = 'sheet-header';
  const close = iconButton('back', data.close, dismiss); close.classList.add('sheet-back');
  const title = document.createElement('h2'); title.id = 'details-title'; title.append(icon(data.kind === 'settings' ? 'gear' : data.kind === 'language' ? 'globe' : data.kind === 'shop' ? 'rug' : 'book'), document.createTextNode(data.title));
  const eyebrow = document.createElement('span'); eyebrow.className = 'details-eyebrow'; eyebrow.textContent = data.eyebrow;
  header.append(close, title, eyebrow); dialog.append(header);
  const body = document.createElement('div'); body.className = 'sheet-body';
  if (data.content && data.contentFirst) body.append(data.content);
  for (const section of data.sections) {
    const heading = document.createElement('h3'); heading.textContent = section.title;
    const paragraph = document.createElement('p'); paragraph.textContent = section.body;
    if (section.title) body.append(heading); body.append(paragraph);
  }
  if (data.content && !data.contentFirst) body.append(data.content);
  if (data.next) {
    const footer = document.createElement('div'); footer.className = 'details-actions';
    const next = document.createElement('button'); next.className = 'game-primary-button'; next.textContent = data.next.label; next.onclick = () => { dismiss(); data.next?.action(); }; footer.append(next); body.append(footer);
  }
  dialog.append(body); overlay.append(dialog); document.body.append(overlay);
  function onKey(event: KeyboardEvent) {
    if (event.key === 'Escape') { event.preventDefault(); dismiss(); }
    if (event.key === 'Tab') {
      const controls = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)')); const first = controls[0]; const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }
  document.addEventListener('keydown', onKey); close.focus(); return destroy;
}
