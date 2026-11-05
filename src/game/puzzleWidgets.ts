import { liftBags, liftWeight, mirrorPositions, lightStars, traceMoon, gifts, giftShape, giftCells, type LiftState, type LiftSide, type GiftPlacement } from '../domain/hotelPuzzles';
interface UI {
    button(label: string, run: () => void, primary?: boolean): HTMLButtonElement;
    t(zh: string, en: string): string;
}
export function balanceWidget(stage: HTMLElement, panel: HTMLElement, ui: UI, state: LiftState, selected: string | undefined, select: (id: string) => void, put: (side: LiftSide) => void, remove: (id: string) => void, check: () => void) {
    const stock = document.createElement('div');
    stock.className = 'lift-stock';
    for (const b of liftBags) {
        const button = ui.button(`${'fragile' in b ? ui.t('易碎 ', 'Fragile ') : ''}${b.weight}kg`, () => select(b.id));
        button.className = `lift-bag ${selected === b.id ? 'is-selected' : ''} ${state[b.id] ? 'is-loaded' : ''}`;
        button.dataset.bag = b.id;
        button.style.setProperty('--bag-hue', String((b.weight - 3) * 21));
        const art = document.createElement('span');
        art.className = 'lift-bag-art';
        art.setAttribute('aria-hidden', 'true');
        button.prepend(art);
        stock.append(button);
    }
    stage.append(stock);
    const machine = document.createElement('div');
    machine.className = 'lift-machine';
    const beam = document.createElement('div');
    beam.className = 'lift-beam';
    beam.style.transform = `rotate(${Math.max(-9, Math.min(9, (liftWeight(state, 'right') - liftWeight(state, 'left')) * .7))}deg)`;
    machine.append(beam);
    for (const side of ['left', 'right'] as const) {
        const pan = document.createElement('div');
        pan.className = `lift-pan lift-pan--${side}`;
        pan.style.transform = `translateY(${Math.max(-8, Math.min(8, (liftWeight(state, side) - liftWeight(state, side === 'left' ? 'right' : 'left')) * .55))}px)`;
        const load = ui.button(ui.t(side === 'left' ? '放入左台' : '放入右台', side === 'left' ? 'Load left' : 'Load right'), () => put(side), true);
        load.dataset.pan = side;
        const slots = document.createElement('div');
        slots.className = 'lift-slots';
        for (const b of liftBags.filter(b => state[b.id] === side)) {
            const item = ui.button(`${b.weight}kg`, () => remove(b.id));
            item.className = 'lift-loaded-item';
            item.dataset.loaded = b.id;
            const art = document.createElement('span');
            art.className = 'lift-bag-art';
            item.prepend(art);
            slots.append(item);
        }
        const total = document.createElement('strong');
        total.className = 'lift-total';
        total.dataset.weight = side;
        total.textContent = `${liftWeight(state, side)}kg · ${Object.values(state).filter(s => s === side).length}/3`;
        pan.append(load, slots, total);
        machine.append(pan);
    }
    stage.append(machine);
    const note = document.createElement('p');
    note.className = 'widget-note';
    note.textContent = ui.t('每邊三件、重量相同；6kg 易碎箱一定要放左邊緩衝台。', 'Three bags per side, equal weight. The fragile 6kg bag must use the cushioned left platform.');
    const done = ui.button(ui.t('啟動升降機', 'Start the lift'), check, true);
    done.dataset.action = 'check-lift';
    panel.append(note, done);
}
export function mirrorsWidget(stage: HTMLElement, panel: HTMLElement, ui: UI, state: readonly number[], turn: (index: number) => void, check: () => void) {
    const trace = traceMoon(state), board = document.createElement('div');
    board.className = 'moon-board';
    board.setAttribute('aria-label', ui.t('月光鏡子反射盤', 'Moonlight mirror board'));
    for (let i = 0; i < 20; i++) {
        const index = mirrorPositions.findIndex(n => n === i), lit = trace.stars.includes(i);
        const cell = ui.button('', () => turn(index));
        cell.className = `moon-cell ${index >= 0 ? 'moon-mirror' : ''} ${lit ? 'is-lit' : ''}`;
        cell.disabled = index < 0;
        if (index >= 0) {
            cell.dataset.mirror = String(index);
            cell.setAttribute('aria-label', ui.t('轉動鏡子', 'Turn mirror') + ` ${index + 1}`);
            const path = state[index] === 0 ? 'M24 76L76 24' : 'M24 24L76 76';
            cell.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="${path}" stroke="#361b41" stroke-width="24"/><path d="${path}" stroke="#efc47b" stroke-width="17"/><path d="${path}" stroke="#add8df" stroke-width="9"/></svg><span>${ui.t('鏡', 'Mirror')}</span>`;
        }
        else if (lightStars.some(n => n === i)) {
            cell.dataset.star = String(i);
            cell.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 12L60 37L88 40L66 58L73 86L50 70L27 86L34 58L12 40L40 37Z" fill="${lit ? '#fff0a0' : '#6f6089'}" stroke="#d6ac73" stroke-width="4"/></svg>`;
        }
        if (i === 10 || i === 9) {
            const label = document.createElement('span');
            label.className = 'moon-terminal';
            label.textContent = i === 10 ? ui.t('月燈 →', 'Light →') : ui.t('月窗 →', 'Window →');
            cell.append(label);
        }
        board.append(cell);
    }
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('moon-ray');
    svg.setAttribute('viewBox', '0 0 500 400');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(svg.namespaceURI, 'polyline');
    path.setAttribute('points', trace.points.map(p => `${p.x},${p.y}`).join(' '));
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#fff3a5');
    path.setAttribute('stroke-width', '5');
    path.setAttribute('stroke-linejoin', 'round');
    svg.append(path);
    board.append(svg);
    stage.append(board);
    const status = document.createElement('strong');
    status.className = 'moon-status';
    status.textContent = ui.t('星石', 'Stars') + ` ${trace.stars.length}/3 · ` + ui.t(trace.window ? '月窗已亮' : '月窗未亮', trace.window ? 'Window lit' : 'Window dark');
    const done = ui.button(ui.t('確認照明', 'Check the lights'), check, true);
    done.dataset.action = 'check-mirrors';
    panel.append(status, done);
}
export function shapeSVG(id: string, rotation: number) { const color = gifts.find(g => g.id === id)?.color ?? '#ddd', points = giftShape(id, rotation), minX = Math.min(...points.map(p => p.x)), minY = Math.min(...points.map(p => p.y)); return `<svg viewBox="0 0 96 96" aria-hidden="true">${points.map(c => `<rect x="${5 + (c.x - minX) * 28}" y="${5 + (c.y - minY) * 28}" width="25" height="25" rx="5" fill="${color}" stroke="#674052" stroke-width="2"/><path d="M${17.5 + (c.x - minX) * 28} ${5 + (c.y - minY) * 28}v25M${5 + (c.x - minX) * 28} ${17.5 + (c.y - minY) * 28}h25" stroke="#ffe3a1" stroke-width="3"/>`).join('')}<circle cx="${17.5 - minX * 28}" cy="${17.5 - minY * 28}" r="6" fill="#fff8d7" stroke="#593449" stroke-width="2"/></svg>`; }
export function giftsWidget(stage: HTMLElement, panel: HTMLElement, ui: UI, state: readonly GiftPlacement[], selected: string | undefined, rotation: number, pick: (id: string) => void, cell: (x: number, y: number) => void, rotate: () => void, check: () => void) {
    const board = document.createElement('div');
    board.className = 'gift-board';
    board.setAttribute('aria-label', ui.t('四乘四手信禮盒', 'Four by four gift box'));
    for (let y = 0; y < 4; y++)
        for (let x = 0; x < 4; x++) {
            const owner = state.find(p => giftCells(p).some(c => c.x === x && c.y === y)), item = gifts.find(g => g.id === owner?.id);
            const b = ui.button('', () => cell(x, y));
            b.className = `gift-cell ${owner ? 'is-packed' : ''}`;
            b.dataset.giftCell = String(y * 4 + x);
            b.setAttribute('aria-label', ui.t('盒內格子', 'Box cell') + ` ${y * 4 + x + 1}`);
            if (item) {
                b.style.setProperty('--gift-color', item.color);
                b.dataset.owner = item.id;
                const ribbon = document.createElement('span');
                ribbon.className = 'gift-ribbon';
                b.append(ribbon);
            }
            board.append(b);
        }
    stage.append(board);
    const palette = document.createElement('div');
    palette.className = 'gift-palette';
    gifts.forEach((g, i) => { const b = ui.button('', () => pick(g.id)); b.className = `gift-piece ${selected === g.id ? 'is-selected' : ''} ${state.some(p => p.id === g.id) ? 'is-packed' : ''}`; b.dataset.gift = g.id; b.setAttribute('aria-label', ui.t('選手信', 'Select gift') + ` ${i + 1}`); b.innerHTML = shapeSVG(g.id, selected === g.id ? rotation : 0) + `<span>${state.some(p => p.id === g.id) ? '✓ ' : ''}${i + 1}</span>`; palette.append(b); });
    panel.append(palette);
    const actions = document.createElement('div');
    actions.className = 'gift-actions';
    const r = ui.button(ui.t('旋轉手信', 'Rotate gift'), rotate);
    r.dataset.action = 'rotate-gift';
    r.disabled = !selected;
    const done = ui.button(ui.t('裝好送出', 'Pack & send') + ` ${state.length}/5`, check, true);
    done.dataset.action = 'check-gifts';
    actions.append(r, done);
    panel.append(actions);
}
