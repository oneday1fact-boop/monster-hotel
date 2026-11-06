import { giftShape, validGifts, type GiftPlacement } from '../domain/hotelPuzzles';
/** Pointer-based drag keeps the existing layout alive until release. Invalid drops never mutate storage. */
export function attachGiftDrag(board: HTMLElement, palette: HTMLElement, state: readonly GiftPlacement[], selected: string | undefined, rotation: number, drop: (piece: GiftPlacement) => void, shapeSVG: (id: string, rotation: number) => string) {
    const sources = [...Array.from(palette.querySelectorAll<HTMLElement>('[data-gift]')), ...Array.from(board.querySelectorAll<HTMLElement>('[data-owner]'))];
    for (const source of sources)
        source.addEventListener('pointerdown', e => {
            if (e.button !== 0)
                return;
            const id = source.dataset.gift ?? source.dataset.owner!, turn = source.dataset.owner ? state.find(p => p.id === id)!.rotation : selected === id ? rotation : 0;
            const start = { x: e.clientX, y: e.clientY };
            let dragging = false, last: GiftPlacement | undefined, allowed = false, ghost: HTMLElement | undefined;
            const abort = new AbortController();
            const clear = () => { abort.abort(); ghost?.remove(); board.querySelectorAll('.is-drop-valid,.is-drop-invalid').forEach(c => c.classList.remove('is-drop-valid', 'is-drop-invalid')); source.classList.remove('is-dragging'); };
            const move = (ev: PointerEvent) => { if (ev.pointerId !== e.pointerId)
                return; if (!board.isConnected) {
                clear();
                return;
            } if (!dragging && Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < 7)
                return; dragging = true; ev.preventDefault(); if (!ghost) {
                ghost = document.createElement('div');
                ghost.className = 'gift-drag-ghost';
                ghost.setAttribute('aria-hidden', 'true');
                ghost.innerHTML = shapeSVG(id, turn);
                document.body.append(ghost);
                source.classList.add('is-dragging');
            } ghost.style.left = ev.clientX + 14 + 'px'; ghost.style.top = ev.clientY - 45 + 'px'; const r = board.getBoundingClientRect(), x = Math.floor((ev.clientX - r.left) / r.width * 4), y = Math.floor((ev.clientY - r.top) / r.height * 4); last = { id, rotation: turn, x, y }; allowed = x >= 0 && x < 4 && y >= 0 && y < 4 && validGifts([...state.filter(p => p.id !== id), last]); board.querySelectorAll('.is-drop-valid,.is-drop-invalid').forEach(c => c.classList.remove('is-drop-valid', 'is-drop-invalid')); for (const c of giftShape(id, turn)) {
                const a = x + c.x, b = y + c.y;
                if (a >= 0 && a < 4 && b >= 0 && b < 4)
                    board.querySelector(`[data-gift-cell="${b * 4 + a}"]`)?.classList.add(allowed ? 'is-drop-valid' : 'is-drop-invalid');
            } ghost.dataset.valid = String(allowed); };
            window.addEventListener('pointermove', move, { capture: true, passive: false, signal: abort.signal });
            window.addEventListener('pointerup', ev => { if (ev.pointerId !== e.pointerId)
                return; const commit = dragging && allowed && last; clear(); if (dragging) {
                const suppress = (click: MouseEvent) => { click.preventDefault(); click.stopImmediatePropagation(); };
                window.addEventListener('click', suppress, { capture: true, once: true });
                setTimeout(() => window.removeEventListener('click', suppress, true), 0);
                if (commit)
                    drop(commit);
            } }, { capture: true, signal: abort.signal });
            window.addEventListener('pointercancel', clear, { once: true, signal: abort.signal });
            window.addEventListener('blur', clear, { once: true, signal: abort.signal });
        });
}
