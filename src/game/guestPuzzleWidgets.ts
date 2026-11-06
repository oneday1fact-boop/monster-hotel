import { pourScent, scentSolved, runeIds, codeFeedback, codeSolved, possibleCodes, photoGuests, photoActor, photoVisible, photoRequests, photoSolved, type ScentBoard, type Rune, type PhotoState, type PhotoGuest } from '../domain/guestPuzzles';
interface UI {
    button(label: string, run: () => void, primary?: boolean): HTMLButtonElement;
    t(zh: string, en: string): string;
}
const node = (tag: string, cls: string, text?: string) => {
    const e = document.createElement(tag);
    e.className = cls;
    if (text)
        e.textContent = text;
    return e;
};
export const scentColors = ['#8fc9b0', '#b6a0df', '#efbe78'];
export function scentWidget(stage: HTMLElement, panel: HTMLElement, ui: UI, board: ScentBoard, selected: number | undefined, pick: (n: number | undefined) => void, pour: (board: ScentBoard, from: number, to: number) => void, notice: (m: string) => void, undo: () => void, canUndo: boolean, finish: () => void) {
    const bottles = node('div', 'scent-bottles');
    board.forEach((layers, i) => {
        const b = ui.button('', () => {
            if (selected === undefined) {
                if (!layers.length) {
                    notice(ui.t('先揀有香氛嘅瓶。', 'Select a bottle with perfume first.'));
                    return;
                }
                pick(i);
                return;
            }
            if (selected === i) {
                pick(undefined);
                return;
            }
            const next = pourScent(board, selected, i);
            if (JSON.stringify(next) === JSON.stringify(board)) {
                notice(ui.t('只可倒入空瓶，或者頂層同一香味嘅瓶。', 'Pour into an empty bottle, or onto the same scent.'));
                return;
            }
            pour(next, selected, i);
        });
        b.className = `scent-bottle ${selected === i ? 'is-selected' : ''} ${layers.length === 4 && layers.every(x => x === layers[0]) ? 'is-sorted' : ''}`;
        b.dataset.scentBottle = String(i);
        b.setAttribute('aria-label', ui.t('香氛瓶', 'Perfume bottle') + ` ${i + 1}`);
        b.setAttribute('aria-pressed', String(selected === i));
        const glass = node('span', 'scent-glass');
        for (let level = 3; level >= 0; level--) {
            const c = layers[level], layer = node('span', `scent-layer ${c === undefined ? 'is-empty' : ''}`);
            if (c !== undefined) {
                layer.style.setProperty('--scent-color', scentColors[c]);
                layer.textContent = ['❧', '✦', '◒'][c];
            }
            glass.append(layer);
        }
        b.append(glass, node('strong', 'scent-number', String(i + 1)));
        bottles.append(b);
    });
    stage.append(bottles);
    const legend = node('div', 'scent-legend');
    [['薄荷', 'Mint', '❧'], ['薰衣', 'Lavender', '✦'], ['柑橘', 'Citrus', '◒']].forEach(([zh, en, symbol], i) => { const item = node('span', '', symbol + ' ' + ui.t(zh, en)); item.style.color = scentColors[i]; legend.append(item); });
    panel.append(legend);
    panel.append(node('p', 'widget-note', ui.t('每瓶最多四層；頂層同味會一齊倒。留空瓶做周轉，最後每瓶只留同一味。', 'Four layers per bottle. Matching top layers pour together. Keep spare space; finish with one scent per full bottle.')));
    const controls = node('div', 'scent-actions'), back = ui.button(ui.t('撤回一步', 'Undo pour'), undo);
    back.dataset.action = 'undo-scent';
    back.disabled = !canUndo;
    const done = ui.button(ui.t('封好香氛', 'Seal perfumes'), () => {
        if (scentSolved(board))
            finish();
        else
            notice(ui.t('每種香味要集中裝滿一瓶，唔可以混味。', 'Fill one bottle per scent without mixing.'));
    }, true);
    done.dataset.action = 'check-scent';
    controls.append(back, done);
    panel.append(controls);
}
export function scentPourEffect(root: HTMLElement, from: number, to: number, color: number) {
    const a = root.querySelector<HTMLElement>(`[data-scent-bottle="${from}"]`)!, b = root.querySelector<HTMLElement>(`[data-scent-bottle="${to}"]`)!, box = root.querySelector('.episode-stage')!.getBoundingClientRect(), r = a.getBoundingClientRect(), s = b.getBoundingClientRect();
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
        return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('scent-stream');
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    const x = r.x + r.width / 2 - box.x, y = r.y + 20 - box.y, tx = s.x + s.width / 2 - box.x, ty = s.y + 20 - box.y;
    svg.innerHTML = `<path d="M${x} ${y}Q${(x + tx) / 2} ${Math.min(y, ty) - 28} ${tx} ${ty}" fill="none" stroke="${scentColors[color]}" stroke-width="7" stroke-linecap="round"/>`;
    root.querySelector('.episode-stage')!.append(svg);
    a.animate?.([{ transform: 'rotate(0deg)' }, { transform: `rotate(${tx > x ? 12 : -12}deg)` }, { transform: 'rotate(0deg)' }], { duration: 550 });
}
export const runeNames: Record<Rune, [
    string,
    string
]> = { moon: ['月', 'Moon'], leaf: ['葉', 'Leaf'], star: ['星', 'Star'], flame: ['火', 'Fire'], flower: ['花', 'Bloom'] };
export function runeArt(id: Rune) { const shapes = { moon: 'M38 8A30 30 0 1 0 58 51A27 27 0 0 1 38 8Z', leaf: 'M10 55Q4 8 59 7Q61 57 10 55M12 53L48 19', star: 'M32 5L40 22L59 24L45 38L49 58L32 48L15 58L19 38L5 24L24 22Z', flame: 'M34 4Q44 25 25 34Q18 24 19 18Q1 46 21 58Q46 71 56 47Q62 32 47 19Q49 37 39 40Q47 20 34 4Z', flower: 'M32 21C15 -4 0 23 21 32C-4 47 23 68 32 43C47 68 68 41 43 32C68 15 41 -4 32 21Z' }; return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="${shapes[id]}" fill="#f5d38a" stroke="#714257" stroke-width="3"/>${id === 'flower' ? '<circle cx="32" cy="32" r="8" fill="#ba8ab3"/>' : ''}</svg>`; }
export function codeWidget(stage: HTMLElement, panel: HTMLElement, ui: UI, input: (Rune | null)[], history: Rune[][], active: number, page: number, pickSlot: (n: number) => void, setRune: (r: Rune) => void, setPage: (n: number) => void, submit: () => void) {
    const board = node('div', 'code-workbench'), entry = node('div', 'code-entry'), slots = node('div', 'code-slots');
    input.forEach((r, i) => { const b = ui.button('', () => pickSlot(i)); b.dataset.codeSlot = String(i); b.className = `code-slot ${active === i ? 'is-selected' : ''}`; b.setAttribute('aria-label', ui.t('鎖孔', 'Lock slot') + ` ${i + 1}`); b.innerHTML = r ? runeArt(r) : '<span>?</span>'; slots.append(b); });
    entry.append(slots);
    const keys = node('div', 'code-keys');
    for (const r of runeIds) {
        const b = ui.button('', () => setRune(r));
        b.className = 'code-key';
        b.dataset.rune = r;
        b.innerHTML = runeArt(r);
        b.append(node('span', '', ui.t(...runeNames[r])));
        keys.append(b);
    }
    entry.append(keys, node('p', 'code-note', ui.t('每款鎖匙只用一次。金色：放啱位；紫色：圖案啱但位置錯。', 'Use each key once. Gold = right place; violet = right symbol, wrong place.')));
    board.append(entry);
    const log = node('div', 'code-log'), rows = node('div', 'code-history');
    const pages = Math.max(1, Math.ceil(history.length / 2)), shown = page < 0 ? pages - 1 : Math.min(page, pages - 1);
    if (!history.length)
        rows.append(node('p', '', ui.t('試一組，記低結果，再排除唔可能嘅組合。', 'Try a code, then use its feedback to eliminate possibilities.')));
    for (let n = shown * 2; n < Math.min(history.length, shown * 2 + 2); n++) {
        const g = history[n], f = codeFeedback(g), row = node('div', 'code-attempt');
        const symbols = node('div', 'code-symbols');
        symbols.innerHTML = g.map(runeArt).join('');
        row.append(symbols, node('span', 'code-exact', ui.t('啱位', 'Exact') + ` ${f.exact}`), node('span', 'code-misplaced', ui.t('錯位', 'Misplaced') + ` ${f.misplaced}`));
        rows.append(row);
    }
    log.append(rows);
    const nav = node('div', 'code-pages'), prev = ui.button('‹', () => setPage(shown - 1)), next = ui.button('›', () => setPage(shown + 1));
    prev.dataset.codePage = 'prev';
    next.dataset.codePage = 'next';
    prev.setAttribute('aria-label', ui.t('較早試過嘅組合', 'Earlier attempts'));
    next.setAttribute('aria-label', ui.t('較新試過嘅組合', 'Later attempts'));
    prev.disabled = shown === 0;
    next.disabled = shown === pages - 1;
    nav.append(prev, node('span', '', `${shown + 1}/${pages} · ${ui.t('可能', 'Possible')} ${possibleCodes(history).length}`), next);
    log.append(nav);
    board.append(log);
    stage.append(board);
    const done = ui.button(ui.t('試開鎖匙櫃', 'Try the cabinet'), submit, true);
    done.dataset.action = 'check-code';
    done.disabled = input.some(r => r === null);
    panel.append(done);
}
export const guestNames: Record<PhotoGuest, [
    string,
    string
]> = { luno: ['月毛', 'Luno'], dou: ['小豆', 'Dou'], ember: ['燈燈', 'Ember'], rollo: ['卷卷', 'Rollo'], yuzu: ['小柚', 'Yuzu'], nemu: ['夢夢', 'Nemu'] };
export const guestKinds: Record<PhotoGuest, string> = { luno: 'werewolf', dou: 'jiangshi', ember: 'lantern', rollo: 'mummy', yuzu: 'fox', nemu: 'baku' };
export function photoPicture(state: PhotoState, markers = true) {
    const canvas = node('div', 'photo-canvas');
    canvas.setAttribute('aria-label', 'Monster Hotel group photograph');
    const visible = photoVisible(state);
    state.order.forEach((id, i) => {
        const a = photoActor(state, i), body = node('div', `photo-figure ${markers && !visible.includes(id) ? 'is-obscured' : ''}`);
        body.dataset.photoFigure = id;
    body.style.transform=`translateX(-50%) rotate(${state.poses[id]*3}deg)`;
        body.style.left = a.x + '%';
        body.style.bottom = (100 - a.feet) + '%';
        body.style.width = a.width + '%';
        body.style.height = a.height + '%';
        body.style.zIndex = String(i + 1);
        body.style.backgroundImage = `url('/art/${guestKinds[id]}-poses.png')`;
        canvas.append(body);
        if (markers) {
            const face = node('span', `photo-face ${visible.includes(id) ? 'is-clear' : 'is-hidden'}`, visible.includes(id) ? '✓' : '!');
            face.style.left = a.face.x + '%';
            face.style.top = a.face.y + '%';
            face.style.width = a.face.r * 2 + '%';
            face.style.height = a.face.ry * 2 + '%';
            face.setAttribute('aria-label', guestNames[id][0] + (visible.includes(id) ? ' ✓' : ' !'));
            canvas.append(face);
        }
    });
    return canvas;
}
export function fitPhotoFrames(root: HTMLElement) {
    root.querySelectorAll<HTMLElement>('.photo-frame-wrap').forEach(w => {
        const c = w.querySelector<HTMLElement>('.photo-canvas');
        if (!c)
            return;
        const r = w.getBoundingClientRect(), width = Math.min(r.width, r.height * 1.8);
        c.style.width = width + 'px';
        c.style.height = (width / 1.8) + 'px';
    });
}
export function photoWidget(stage: HTMLElement, panel: HTMLElement, ui: UI, state: PhotoState, selected: PhotoGuest | undefined, pick: (id: PhotoGuest) => void, pose: () => void, finish: () => void) {
    const layout = node('div', 'photo-layout'), wrap = node('div', 'photo-frame-wrap');
    wrap.append(photoPicture(state));
    layout.append(wrap);
    const requests = node('aside', 'photo-requests'), rules = photoRequests(state);
    [ui.t('小豆：後排中間。', 'Dou: back centre.'), ui.t('月毛左前、小柚右前。', 'Luno: front L. Yuzu: front R.'), ui.t('卷卷前中，姿勢見上方。', 'Rollo front centre; poses above.')].forEach((t, i) => requests.append(node('p', rules[i] ? 'is-met' : '', (rules[i] ? '✓ ' : '○ ') + t)));
    const visible = photoVisible(state);
    requests.append(node('strong', 'photo-count', ui.t('面孔可見', 'Faces visible') + ` ${visible.length}/6`), node('p', '', ui.t('紅圈＝遮面，換姿勢避開。', 'Red = hidden. Change pose.')));
    layout.append(requests);
    const names = node('div', 'photo-names');
    state.order.forEach(id => { const b = ui.button(ui.t(...guestNames[id]), () => pick(id)); b.className = `photo-name ${selected === id ? 'is-selected' : ''}`; b.dataset.photoGuest = id; b.setAttribute('aria-pressed', String(selected === id)); names.append(b); });
    stage.append(layout, names);
    const controls = node('div', 'photo-actions'), turn = ui.button(ui.t(selected ? ['左傾', '正面', '右傾'][state.poses[selected] + 1] : '換姿勢', selected ? ['Lean left', 'Face front', 'Lean right'][state.poses[selected] + 1] : 'Change pose'), pose), shutter = ui.button(ui.t('拍張合照', 'Take photo'), () => {
        if (photoSolved(state))
            finish();
    }, true);
    turn.dataset.action = 'turn-photo';
    turn.disabled = !selected;
    shutter.dataset.action = 'shoot-photo';
    shutter.disabled = !photoSolved(state);
    controls.append(turn, shutter);
    panel.append(controls);
}
