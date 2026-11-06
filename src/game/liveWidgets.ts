import { cameraGuests, cameraReady, echoRounds, type EchoState } from '../domain/liveGames';
const guests = [['luno', 'werewolf', '月毛', 'Luno'], ['dou', 'jiangshi', '小豆', 'Dou'], ['ember', 'lantern', '燈燈', 'Ember'], ['rollo', 'mummy', '卷卷', 'Rollo'], ['yuzu', 'fox', '小柚', 'Yuzu'], ['nemu', 'baku', '夢夢', 'Nemu']] as const;
interface UI {
    button(label: string, run: () => void, primary?: boolean): HTMLButtonElement;
    t(zh: string, en: string): string;
}
export function liveActor(kind: string) { const e = document.createElement('span'); e.className = 'live-actor';e.dataset.kind=kind;e.setAttribute('aria-hidden','true'); e.style.setProperty('--live-phase', `${-(performance.now()%2900)}ms`);e.style.setProperty('--idle-phase',`${-(performance.now()%(kind==='pooh'?5800:4200))}ms`); e.style.setProperty('--actor-art', `url('/art/${kind}-poses.${kind==='stormling'?'svg':'png'}')`); e.innerHTML = '<span class="live-shadow"></span><span class="live-body"></span><span class="live-spark">✦</span>'; return e; }
export function echoWidget(stage: HTMLElement, panel: HTMLElement, ui: UI, state: EchoState, tap: (n: number) => void, watch: () => void) {
    const board = document.createElement('div');
    board.className = 'echo-board';
    board.dataset.echoPhase = 'idle';
    guests.slice(0, 4).forEach((g, i) => { const b = ui.button('', () => tap(i)); b.className = 'echo-pad'; b.dataset.echoNote = String(i); b.setAttribute('aria-label', ui.t(g[2], g[3])); b.append(liveActor(g[1]), Object.assign(document.createElement('strong'), { textContent: ui.t(g[2], g[3]) })); board.append(b); });
    stage.append(board);
    const count = document.createElement('strong');
    count.className = 'echo-progress';
    count.textContent = ui.t('接力', 'Relay') + ` ${Math.min(3, state.round + 1)} / 3 · ${state.input.length} / ${echoRounds[state.round]?.length ?? 0}`;
    panel.append(count);
    const note = document.createElement('p');
    note.className = 'widget-note';
    note.textContent = ui.t('先睇四位住客輪流跳起，再按相同次序點佢哋。答錯只重試今輪，可以無限重播。', 'Watch who jumps, then tap the same sequence. A mistake retries this round only. Replay freely.');
    const replay = ui.button(ui.t('睇示範／重播', 'Watch / replay'), watch, true);
    replay.dataset.action = 'play-echo';
    const turn = document.createElement('p');
    turn.className = 'echo-turn';
    turn.setAttribute('aria-live', 'polite');
    panel.append(note, turn, replay);
    return { flash: (n: number, on: boolean) => board.querySelector(`[data-echo-note="${n}"]`)?.classList.toggle('is-calling', on), phase: (phase: string) => { board.dataset.echoPhase = phase;board.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.disabled=phase!=='answer'); replay.disabled = phase === 'watching'; turn.textContent = phase === 'watching' ? ui.t('睇住示範，先唔好撳住客。', 'Watch first. Wait for your turn.') : phase === 'answer' ? ui.t('輪到你！點返相同次序。', 'Your turn! Repeat the sequence.') : ui.t('先撳睇示範。', 'Press Watch to begin.'); } };
}
export function livePhotoWidget(stage: HTMLElement, panel: HTMLElement, ui: UI, locked: readonly string[], tap: (id: string) => void, shutter: () => void, epoch: number) {
    const board = document.createElement('div');
    board.className = 'live-photo-board';
    const caption = document.createElement('strong');
    caption.className = 'live-photo-caption';
    caption.textContent = ui.t('望鏡頭！一、二、三！', 'Eyes on the camera!');
    board.append(caption);
    const order = ['ember', 'dou', 'nemu', 'luno', 'rollo', 'yuzu'];
    const buttons: HTMLButtonElement[] = [];
    order.forEach(id => { const g = guests.find(g => g[0] === id)!; const b = ui.button('', () => tap(id)); b.className = 'live-photo-guest'; b.dataset.cameraGuest = id; b.disabled = locked.includes(id); b.classList.toggle('is-locked', b.disabled); b.append(liveActor(g[1]), Object.assign(document.createElement('span'), { className: 'camera-label', textContent: ui.t(g[2], g[3]) }), Object.assign(document.createElement('strong'), { className: 'camera-state', textContent: b.disabled ? '✓' : ui.t('等一等', 'Wait') })); board.append(b); buttons.push(b); });
    stage.append(board);
    const count = document.createElement('strong');
    count.className = 'camera-count';
    count.textContent = ui.t('定格住客', 'Ready guests') + ` ${locked.length} / 6`;
    const note = document.createElement('p');
    note.className = 'widget-note';
    note.textContent = ui.t('綠色光圈出現、住客望鏡頭時點佢定格。錯過唔扣分，等下一次。六位定格後按快門。', 'Tap a guest during the green camera moment to hold their pose. Missed it? Wait for the next one. Freeze all six, then shoot.');
    const shoot = ui.button(ui.t('拍張合照', 'Take photo'), shutter, true);
    shoot.dataset.action = 'shoot-photo';
    shoot.disabled = locked.length !== 6;
    panel.append(count, note, shoot);
    return (now: number) => { for (const b of buttons) {
        if (b.disabled)
            continue;
        const i = cameraGuests.findIndex(id => id === b.dataset.cameraGuest), ready = cameraReady(i, now - epoch);
        if (b.dataset.ready === String(ready))
            continue;
        b.dataset.ready = String(ready);
        b.classList.toggle('is-ready', ready);
        b.querySelector('.camera-state')!.textContent = ready ? ui.t('望鏡頭！', 'Now!') : ui.t('等一等', 'Wait');
    } };
}
