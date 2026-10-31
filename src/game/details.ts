export interface DetailSection { title: string; body: string }
export interface Details { eyebrow: string; title: string; sections: DetailSection[]; close: string; content?: HTMLElement; next?: { label: string; action: () => void } }
/** Accessible DOM dialog above the canvas; caller disables Phaser input while open. */
export function showDetails(data: Details, onClose: () => void): () => void {
  const overlay = document.createElement('div'); overlay.className = 'details-overlay';
  const dialog = document.createElement('section'); dialog.className = 'details-card';
  dialog.setAttribute('role', 'dialog'); dialog.setAttribute('aria-modal', 'true'); dialog.setAttribute('aria-labelledby', 'details-title');
  const eyebrow = document.createElement('p'); eyebrow.className = 'details-eyebrow'; eyebrow.textContent = data.eyebrow;
  const title = document.createElement('h2'); title.id = 'details-title'; title.textContent = data.title;
  dialog.append(eyebrow, title);
  for (const section of data.sections) {
    const heading = document.createElement('h3'); heading.textContent = section.title;
    const body = document.createElement('p'); body.textContent = section.body;
    if (section.title) dialog.append(heading);
    dialog.append(body);
  }
  if (data.content) dialog.append(data.content);
  const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const dismiss = () => { document.removeEventListener('keydown', onKey); overlay.remove(); previous?.focus(); onClose(); };
  const footer = document.createElement('div'); footer.className = 'details-actions';
  if (data.next) { const next = document.createElement('button'); next.textContent = data.next.label; next.onclick = () => { dismiss(); data.next?.action(); }; footer.append(next); }
  const close = document.createElement('button'); close.textContent = data.close; close.onclick = dismiss; footer.append(close);
  dialog.append(footer); overlay.append(dialog);
  function onKey(event: KeyboardEvent) {
    if (event.key === 'Escape') { event.preventDefault(); dismiss(); }
    if (event.key === 'Tab') {
      const buttons = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)')); const first = buttons[0]; const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }
  document.addEventListener('keydown', onKey); document.body.append(overlay); close.focus();
  return dismiss;
}
