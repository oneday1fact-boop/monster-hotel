import { caseObjects, casePhase, inspectCase, compareWheel, linkCase, solveCase, initialTimeline, swapEvents, timelineSolved, waterTrace, turnPipe, mailGuests, letterIds, mailProfiles, deliverLetter, letterMatches, mailSolved, type CakeState, type TimelineId, type MailState, type LetterId } from '../domain/mysteries';
interface UI {
    button(label: string, run: () => void, primary?: boolean): HTMLButtonElement;
    t(zh: string, en: string): string;
}
function el(tag: string, cls: string, text?: string) { const e = document.createElement(tag); e.className = cls; if (text)
    e.textContent = text; return e; }
export function treadSVG(pattern: string) {
    const tread = pattern === 'rollo' ? '<path d="M30 5V95M70 5V95" stroke-dasharray="12 5"/>' : pattern === 'luno' ? '<path d="M20 5L40 20L20 35L40 50L20 65L40 80L20 95M60 5L80 20L60 35L80 50L60 65L80 80L60 95"/>' : '<path d="M30 5V95M70 5V95" stroke-dasharray="1 15" stroke-linecap="round"/>';
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="#ebc993" stroke-width="9">${tread}</g></svg>`;
}
const proofSVG = (id: string) => id === 'heat' ? '<svg viewBox="0 0 100 100"><path d="M43 65V20a9 9 0 0118 0v45a18 18 0 11-18 0" fill="#eaceab" stroke="#4c3053" stroke-width="5"/><path d="M52 72V35" stroke="#d86272" stroke-width="9"/><circle cx="52" cy="78" r="11" fill="#d86272"/><text x="65" y="35" fill="#ffe4a1" font-size="22">32°</text></svg>' : '<span class="proof-icing evidence-art evidence-object--icing"></span>';
export function cakeWidget(stage: HTMLElement, panel: HTMLElement, ui: UI, s: CakeState, update: (s: CakeState, m?: string) => void, finish: () => void) {
    const phase = casePhase(s);
    stage.dataset.casePhase = phase;
    const step = el('strong', 'case-step', ui.t(phase === 'scene' ? '① 觀察現場' : phase === 'wheels' ? '② 比較輪紋' : '③ 解釋原因', phase === 'scene' ? '1 · Inspect' : phase === 'wheels' ? '2 · Compare tracks' : '3 · Explain why'));
    panel.append(step);
    if (phase === 'scene') {
        stage.append(el('span', 'case-trolley'));
        const box = ui.button('', () => update(s, ui.t('蛋糕盒空咗，但冇食剩嘅蛋糕屑。', 'An empty box, but no eaten cake crumbs.')));
        box.className = 'empty-cake-box evidence-art';
        box.setAttribute('aria-label', ui.t('查看空蛋糕盒', 'Inspect empty cake box'));
        stage.append(box);
        const names = [ui.t('推車輪印', 'Trolley tracks'), ui.t('融化嘅糖霜', 'Melting icing'), ui.t('繃帶絲帶', 'Bandage ribbon')];
        const clues = [ui.t('兩排平行短線；推車去咗走廊。', 'Twin dash tracks lead to the hall.'), ui.t('糖霜融咗流落布，附近冇咬痕。', 'Melted icing. No bite marks.'), ui.t('茶車絲帶纏住一小段繃帶。', 'Bandage caught on trolley ribbon.')];
        caseObjects.forEach((id, i) => { const b = ui.button('', () => update(inspectCase(s, id), names[i] + '：' + clues[i])); b.dataset.evidence = id; b.className = `evidence-object evidence-art evidence-object--${id} ${s.seen.includes(id) ? 'is-collected' : ''} ${s.seen.at(-1) === id ? 'is-inspected' : ''}`; b.setAttribute('aria-label', names[i]); if (id === 'footprints') {
            b.classList.add('case-tracks');
            b.innerHTML = treadSVG('rollo');
        } if (s.seen.includes(id))
            b.append(el('span', 'evidence-tick', '✓')); stage.append(b); });
        const window = ui.button('✦', () => update(s, ui.t('窗邊乾淨，冇搬運痕跡。', 'The window is clean; nothing was carried through.')));
        window.className = 'case-decoy';
        window.dataset.action = 'inspect-window';
        window.setAttribute('aria-label', ui.t('查看窗邊', 'Inspect window'));
        stage.append(window);
        panel.append(el('strong', 'evidence-count', ui.t('現場線索', 'Room clues') + ` ${s.seen.length}/3`));
        const list = el('div', 'case-observations');
        caseObjects.forEach((id, i) => { const row = el('p', ''); if (s.seen.includes(id)) {
            const thumb = el('span', `evidence-thumb evidence-art evidence-object--${id}`);
            if (id === 'footprints') {
                thumb.classList.add('case-tracks');
                thumb.innerHTML = treadSVG('rollo');
            }
            row.append(thumb, document.createTextNode(clues[i]));
        }
        else
            row.textContent = ui.t('仍有未調查嘅痕跡。', 'There are still traces to inspect.'); list.append(row); });
        panel.append(list);
        return;
    }
    if (phase === 'wheels') {
        const board = el('div', 'wheel-comparison');
        const trace = el('div', 'wheel-trace');
        trace.innerHTML = treadSVG('rollo');
        trace.append(el('strong', '', ui.t('地上輪印', 'Floor tracks')));
        board.append(trace);
        const choices = el('div', 'wheel-choices');
        for (const [id, zh, en] of [['luno', '月毛嘅行李車', 'Luno’s trolley'], ['rollo', '卷卷嘅茶車', 'Rollo’s tea trolley'], ['yuzu', '小柚嘅手推車', 'Yuzu’s cart']]) {
            const b = ui.button('', () => { const next = compareWheel(s, id); update(next, next === s ? ui.t('輪紋唔吻合：再比較短線、圓點同斜紋。', 'The tracks do not match. Compare dashes, dots and zigzags.') : ui.t('平行短線吻合！跟住茶車去陰涼地下室。', 'The parallel dashes match! Follow the tea trolley downstairs.')); });
            b.dataset.wheel = id;
            b.className = 'wheel-choice';
            b.innerHTML = treadSVG(id);
            b.append(el('span', '', ui.t(zh, en)));
            choices.append(b);
        }
        board.append(choices);
        stage.append(board);
        panel.append(el('p', 'widget-note', ui.t('比較每一排嘅形狀同間距。揀輪紋吻合嘅推車，先知道條路通去邊。', 'Compare the shape and spacing in both rows. Choose the matching trolley to follow its route.')));
        return;
    }
    const cake = el('div', 'case-found-cake');
    cake.append(el('span', 'case-cake-art'));
    cake.append(el('strong', '', ui.t('蛋糕喺陰涼地下室，完整無缺。', 'The cake is intact in the cool basement.')));
    stage.append(cake);
    const temp = el('div', 'case-temperature');
    temp.innerHTML = proofSVG('heat');
    temp.append(el('span', '', ui.t('樓上房間：32°C', 'Upstairs room: 32°C')));
    stage.append(temp);
    panel.append(el('p', 'widget-note', s.linked ? ui.t('熱房＋融化糖霜 → 搬去降溫。邊位用過茶車？', 'Hot room + melted icing → moved to cool down. Who used the tea trolley?') : ui.t('揀兩件證據，解釋「點解要搬蛋糕」。', 'Choose two clues that explain WHY the cake was moved.')));
    const proofs = el('div', 'case-proofs');
    for (const [id, zh, en] of [['heat', '房溫 32°C', 'Room: 32°C'], ['melt', '融化糖霜', 'Melted icing'], ['ribbon', '繃帶絲帶', 'Bandage ribbon']]) {
        const b = ui.button(ui.t(zh, en), () => { const pair = s.evidence.includes(id) ? s.evidence.filter(x => x !== id) : [...s.evidence.slice(-1), id]; update({ ...s, evidence: pair }); });
        b.dataset.proof = id;
        const art = el('span', 'proof-symbol');
        art.setAttribute('aria-hidden', 'true');
        if (id === 'heat')
            art.innerHTML = proofSVG('heat');
        else {
            const picture = el('span', `proof-cloth evidence-art evidence-object--${id === 'melt' ? 'icing' : 'ribbon'}`);
            art.append(picture);
        }
        b.prepend(art);
        b.setAttribute('aria-pressed', String(s.evidence.includes(id)));
        b.className = `case-proof ${s.evidence.includes(id) ? 'is-selected' : ''}`;
        proofs.append(b);
    }
    panel.append(proofs);
    const link = ui.button(s.linked ? ui.t('已連結：幫蛋糕降溫 ✓', 'Linked: cooling the cake ✓') : ui.t('連結證據', 'Link evidence'), () => { const next = linkCase(s, s.evidence); update(next, next === s ? ui.t('絲帶只講到邊位搬過，未解釋點解。比較溫度同蛋糕狀態。', 'The ribbon tells WHO, not WHY. Compare the temperature and cake condition.') : ui.t('熱房令糖霜融化，所以搬去地下室降溫！', 'The warm room melted the icing, so it was moved downstairs to cool!')); }, true);
    link.dataset.action = 'link-evidence';
    link.disabled = s.evidence.length !== 2 || s.linked;
    panel.append(link);
    const suspects = el('div', 'episode-suspects');
    for (const [id, zh, en] of [['luno', '月毛', 'Luno'], ['rollo', '卷卷', 'Rollo'], ['yuzu', '小柚', 'Yuzu']]) {
        const b = ui.button(ui.t(zh, en), () => { if (solveCase(s, id))
            finish();
        else
            update(s, ui.t('再對照茶車輪紋同繃帶，邊位先吻合？', 'Compare the tea trolley and bandage again. Who matches?')); });
        b.dataset.suspect = id;
        b.disabled = !s.linked;
        suspects.append(b);
    }
    panel.append(suspects);
}
const events = { tea: ['泡茶', 'Tea', '☕'], bell: ['鐘聲', 'Bell', '♬'], lights: ['熄燈', 'Lights out', '☾'], knock: ['敲門', 'Knock', '✦'], door: ['開門', 'Door opens', '⌂'] } as const;
export function timelineWidget(stage: HTMLElement, panel: HTMLElement, ui: UI, order: readonly TimelineId[], selected: string | undefined, pick: (id: string) => void, update: (s: TimelineId[], m?: string) => void, finish: () => void) {
    const board = el('div', 'timeline-board');
    order.forEach((id, i) => { const b = ui.button('', () => { if (selected) {
        update(swapEvents(order, selected as TimelineId, i));
        pick('');
    }
    else
        pick(id); }); b.className = `timeline-event ${selected === id ? 'is-selected' : ''}`; b.dataset.eventSlot = String(i); b.dataset.event = id; b.innerHTML = `<span class="event-number">${i + 1}</span><span class="event-symbol" aria-hidden="true">${events[id][2]}</span>`; b.append(el('strong', '', ui.t(events[id][0], events[id][1]))); board.append(b); });
    stage.append(board);
    const witnesses = el('div', 'witnesses');
    for (const [who, zh, en] of [['燈燈', '熄燈同鐘聲中間，剛好一件事。', 'One event between lights out and bell.'], ['小豆', '鐘聲之後，下一件就係敲門。', 'Knock immediately after bell.'], ['月毛', '泡茶喺熄燈後、敲門前。開門最後。', 'Tea: after lights out, before knock. Door last.']])
        witnesses.append(el('p', '', ui.t(who + '：' + zh, en)));
    panel.append(witnesses);
    const check = ui.button(ui.t('還原當晚', 'Reconstruct the night'), () => { if (timelineSolved(order))
        finish();
    else
        update([...order], ui.t('次序仲有矛盾；留意「剛好一件事」同「緊接」。', 'The order conflicts with a memory. Check “one between” and “immediately after”.')); }, true);
    check.dataset.action = 'check-timeline';
    panel.append(check);
}
export function pipesWidget(stage: HTMLElement, panel: HTMLElement, ui: UI, board: readonly number[], update: (s: number[], m?: string) => void, finish: () => void) {
    const trace = waterTrace(board), grid = el('div', 'spring-board');
    const points: Record<number, string> = { 1: '50 0', 2: '100 50', 4: '50 100', 8: '0 50' };
    board.forEach((ports, i) => { const b = ui.button('', () => update(turnPipe(board, i))); b.className = `spring-pipe ${trace.reached.includes(i) ? 'has-water' : ''}`; b.dataset.pipe = String(i); b.setAttribute('aria-label', ui.t('轉動水管', 'Turn pipe') + ` ${i + 1}`); const paths = [1, 2, 4, 8].filter(p => ports & p).map(p => `M50 50L${points[p]}`).join(' '); b.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${paths}" stroke="#472d42" stroke-width="32"/><path d="${paths}" stroke="#d1a877" stroke-width="24"/><path class="water-flow" d="${paths}" stroke="${trace.reached.includes(i) ? '#83cdd0' : '#72566d'}" stroke-width="12"/></svg>`; if (i === 0 || i === 2 || i === 8)
        b.append(el('span', 'pipe-terminal', ui.t(i === 0 ? '熱水 →' : i === 2 ? '→ 月池' : '→ 花池', i === 0 ? 'Hot →' : i === 2 ? '→ Moon bath' : '→ Flower bath'))); grid.append(b); });
    stage.append(grid);
    const baths = el('div', 'bath-status');
    for (const [n, zh, en] of [[2, '月池', 'Moon bath'], [8, '花池', 'Flower bath']] as const)
        baths.append(el('span', `bath ${trace.baths.includes(n) ? 'is-warm' : ''}`, ui.t(zh, en) + (trace.baths.includes(n) ? ' ♨' : ' ○')));
    panel.append(baths);
    panel.append(el('p', 'widget-note', ui.t('左上入水、右邊兩池出水。九塊管都要接通，開口唔可以向牆。', 'Connect all nine pipes. Feed both right exits; close every leak.')));
    const check = ui.button(ui.t('開水試溫泉', 'Open the valve'), () => { if (trace.solved)
        finish();
    else
        update([...board], ui.t(!trace.reached.length ? '入口未接到熱水，先轉左上水管。' : trace.leaks.length ? '水管有漏口，沿住藍色水路檢查每個接駁。' : '仲有浴池或水管未接通。', !trace.reached.length ? 'The inlet is closed. Turn the top-left pipe.' : trace.leaks.length ? 'There are leaks. Follow the blue water and check each connection.' : 'Some pipes or baths are not connected.')); }, true);
    check.dataset.action = 'check-pipes';
    panel.append(check);
}
const guestNames = { luno: ['月毛', 'Luno'], ember: ['燈燈', 'Ember'], nemu: ['夢夢', 'Nemu'], yuzu: ['小柚', 'Yuzu'] } as const;
const labels = { moon: ['月亮窗', 'Moon window'], sun: ['太陽窗', 'Sun window'], violet: ['紫窗簾', 'Violet curtains'], blue: ['藍窗簾', 'Blue curtains'], green: ['綠窗簾', 'Green curtains'], mint: ['薄荷茶', 'Mint tea'], black: ['紅茶', 'Black tea'], flower: ['花茶', 'Flower tea'] } as const;
export function mailWidget(stage: HTMLElement, panel: HTMLElement, ui: UI, s: MailState, selected: string | undefined, pick: (id: string) => void, update: (s: MailState, m?: string) => void, finish: () => void) {
    const text = (pair: readonly [
        string,
        string
    ]) => ui.t(pair[0], pair[1]);
    const board = el('div', 'mail-board'), letters = el('div', 'mail-letters'), guests = el('div', 'mail-guests');
    letterIds.forEach((id, i) => { const b = ui.button('', () => pick(id)); b.className = `mail-letter ${selected === id ? 'is-selected' : ''}`; b.dataset.letter = id; b.innerHTML = '<span class="envelope-art" aria-hidden="true">✉</span>'; b.append(el('strong', '', `${String.fromCharCode(65 + i)} · ${text(labels[id])}`), el('span', 'letter-assignment', s[id] ? text(guestNames[s[id]!]) : ui.t('未送出', 'Undelivered'))); letters.append(b); });
    mailGuests.forEach(id => { const b = ui.button('', () => { if (!selected) {
        update(s, ui.t('先揀一封信，再點收件人。', 'Select a letter first, then a recipient.'));
        return;
    } update(deliverLetter(s, selected as LetterId, id)); pick(''); }); b.className = 'mail-guest'; b.dataset.mailbox = id; const kind = { luno: 'werewolf', ember: 'lantern', nemu: 'baku', yuzu: 'fox' }[id]; b.style.setProperty('--mail-avatar', `url('/art/${kind}-poses.png')`); const p = mailProfiles[id]; b.append(el('strong', '', text(guestNames[id])), el('span', 'mail-profile', `${ui.t(labels[p.window][0], p.window === 'moon' ? 'Moon' : 'Sun')} · ${ui.t(labels[p.curtain][0], {blue:'Blue',violet:'Violet',green:'Green'}[p.curtain])}\n${text(labels[p.tea])}`)); const received = letterIds.find(k => s[k] === id); b.append(el('span', 'mail-received', received ? '✉ ' + String.fromCharCode(65 + letterIds.indexOf(received)) : ui.t('信箱空', 'Empty mailbox'))); guests.append(b); });
    board.append(letters, guests);
    stage.append(board);
    const check = ui.button(ui.t('確認派信', 'Check delivery'), () => { if (mailSolved(s))
        finish();
    else {
        const bad = letterIds.find(id => s[id] && !letterMatches(id, s[id]!));
        update(s, bad ? ui.t('有封信同收件人嘅物件唔吻合；比較窗紋、窗簾同茶。', 'A letter does not match its recipient. Compare windows, curtains and tea.') : ui.t('四位每人一封；先用最明確嘅線索，其他信再排除。', 'One letter each. Start with the most specific clue, then eliminate the other possibilities.'));
    } }, true);
    check.dataset.action = 'check-mail';
    panel.append(check);
}
