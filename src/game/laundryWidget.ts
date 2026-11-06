import { laundryPieces, laundrySolved, slideLaundry } from '../domain/laundry';
function laundryArt(id:string){
 const ink='stroke="#573b53" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';
 let art='';
 if(id==='rack')art='<path d="M12 63V12H88V63M5 63H20M80 63H95" fill="none" stroke="#b89477" stroke-width="6"/><path d="M35 19V25L20 35H50L35 25M68 19V25L53 35H83L68 25" fill="none" stroke="#edc689" stroke-width="3"/><path d="M22 35L19 55H49L47 35M55 35L52 55H82L79 35" fill="var(--cloth)" '+ink+'/>';
 else if(id==='sheets')art='<rect x="7" y="18" width="80" height="42" rx="16" fill="var(--cloth)" '+ink+'/><ellipse cx="83" cy="39" rx="11" ry="21" fill="#f1dcb6" '+ink+'/><ellipse cx="83" cy="39" rx="5" ry="11" fill="var(--cloth-dark)"/><path d="M18 27H66M15 49H65" stroke="#fff0cf" stroke-width="4"/><path d="M47 17V61" stroke="#a17579" stroke-width="9"/>';
 else if(id==='towels')art='<rect x="17" y="43" width="68" height="18" rx="7" fill="var(--cloth-dark)" '+ink+'/><rect x="10" y="27" width="68" height="18" rx="7" fill="var(--cloth)" '+ink+'/><rect x="20" y="11" width="68" height="18" rx="7" fill="#e5d9ef" '+ink+'/><path d="M27 18H73M17 34H65M25 51H73" stroke="#fff0c9" stroke-width="3"/>';
 else if(id==='coats')art='<path d="M49 11Q63 0 59 13L49 20L21 32H79L51 20" fill="none" stroke="#d8b28c" stroke-width="4"/><path d="M36 26L20 32L10 48L23 54L31 43V65H70V43L78 54L91 48L80 32L65 26L51 35Z" fill="var(--cloth)" '+ink+'/><path d="M51 35V65M39 48H31M62 48H70" stroke="#8f6472" stroke-width="3"/>';
 else art='<path d="M13 25L23 61H77L87 25Z" fill="var(--cloth-dark)" '+ink+'/><path d="M22 29L29 56M40 29L42 56M60 29L58 56M78 29L71 56M18 39H82M21 49H79" stroke="#efc69a" stroke-width="3"/><path d="M21 24Q18 0 37 12Q53 -3 59 15Q83 0 80 24" fill="var(--cloth)" '+ink+'/>';
 return '<svg class="laundry-art" viewBox="0 0 100 70" aria-hidden="true">'+art+'</svg>';
}
interface UI {
    button(label: string, run: () => void, primary?: boolean): HTMLButtonElement;
    t(zh: string, en: string): string;
}
export function laundryWidget(stage: HTMLElement, panel: HTMLElement, ui: UI, state: readonly number[], selected: number, pick: (n: number) => void, update: (s: number[], m?: string) => void, finish: () => void) {
    const names = [['星星被單', 'Star quilt'], ['晾衣架', 'Drying rack'], ['衣籃', 'Laundry basket'], ['大被卷', 'Long duvet'], ['毛巾架', 'Towel rack'], ['洗衣籃', 'Tall hamper'], ['外套架', 'Coat rack']];
    const board = document.createElement('div');
    board.className = 'laundry-board';
    board.setAttribute('aria-label', ui.t('幽靈洗衣房，五列四行', 'Ghost laundry, five columns and four rows'));
    for (let i = 0; i < 20; i++) {
        const cell = document.createElement('span');
        cell.className = 'laundry-floor';
        board.append(cell);
    }
    laundryPieces.forEach((p, i) => { const b = ui.button('', () => pick(i)); b.className = `laundry-piece laundry-piece--${p.id} ${selected === i ? 'is-selected' : ''}`; b.dataset.laundryPiece = p.id; b.dataset.position = String(state[i]); b.setAttribute('aria-label', ui.t(names[i][0], names[i][1])); b.setAttribute('aria-pressed', String(selected === i)); const x = p.axis === 'h' ? state[i] : p.fixed, y = p.axis === 'h' ? p.fixed : state[i]; b.style.left = `calc(${x * 20}% + 3px)`; b.style.top = `calc(${y * 25}% + 3px)`; b.style.width = `calc(${(p.axis === 'h' ? p.length : 1) * 20}% - 6px)`; b.style.height = `calc(${(p.axis === 'v' ? p.length : 1) * 25}% - 6px)`; b.innerHTML = p.id === 'quilt' ? '<span class="quilt-stars" aria-hidden="true">✦ ✦</span>' : laundryArt(p.id); const label = document.createElement('span'); label.className = 'laundry-label'; label.textContent = ui.t(names[i][0], names[i][1]); b.append(label); board.append(b); });
    const exit = document.createElement('span');
    exit.className = 'laundry-exit';
    exit.textContent = ui.t('出口', 'EXIT');
    board.append(exit);
    stage.append(board);
    const note = document.createElement('p');
    note.className = 'widget-note';
    note.textContent = ui.t('先點物件，再按箭嘴。橫放只可左右移，直放只可上下移；每次一格，唔可以穿過其他物件。', 'Select an item, then an arrow. Horizontal items slide left/right; vertical items up/down. One cell per move, with no overlap.');
    panel.append(note);
    const controls = document.createElement('div');
    controls.className = 'laundry-controls';
    const item = laundryPieces[selected];
    for (const [label, d, axis] of [['←', -1, 'h'], ['→', 1, 'h'], ['↑', -1, 'v'], ['↓', 1, 'v']] as const) {
        const b = ui.button(label, () => { const next = slideLaundry(state, selected, d), moved = next.some((n, i) => n !== state[i]); update(next, moved ? ui.t('留意出口前面嘅空間。', 'Plan the space in front of the exit.') : ui.t('呢邊有物件擋住，先騰出空間。', 'Something blocks that direction. Make space first.')); });
        b.dataset.slide = label;
        b.disabled = item.axis !== axis;
        controls.append(b);
    }
    panel.append(controls);
    const check = ui.button(ui.t('送出星星被單', 'Send the quilt'), () => { if (laundrySolved(state))
        finish();
    else
        update([...state], ui.t('星星被單要移到右邊出口，先可以送出。', 'Move the star quilt to the right-hand exit first.')); }, true);
    check.dataset.action = 'check-laundry';
    panel.append(check);
}
