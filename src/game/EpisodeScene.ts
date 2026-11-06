import { initialLaundry, validLaundry } from '../domain/laundry';
import { laundryWidget } from './laundryWidget';
import { celebrateReward } from './rewardFx';
import { capturePuzzle, animatePuzzle, episodeCompanion } from './puzzleMotion';
import Phaser from 'phaser';
import { evidenceIds, accusation, initialRoad, validRoad, slideRoad, roadPath, roadPorts, roadSize, comparisonProps, differences, markDifference, differencesComplete, type EpisodeId, type EvidenceId, type DifferenceId } from '../domain/episodes';
import { afterChallenge, completeEpisode } from '../domain/campaign';
import { episodeCopy } from '../i18n/episodes';
import { saveLocale, type Locale } from '../i18n/catalog';
import { writeSave, type Save } from '../platform/save';
import type { Feedback } from '../platform/feedback';
import { proportionalCrop, viewportMetrics } from './viewport';
import { drawReception } from './reception';
import { drawMonster } from './drawMonster';
import { reducedMotion } from './art';
import { showDetails } from './details';
import { settingsContent, languageContent } from './hotelMenus';
import { savePreferences } from '../platform/preferences';
import { iconButton } from './icons';
import { guestById } from '../domain/puzzle';
import { liftBags, validLift, loadBag, unloadBag, liftWeight, liftSolved, initialMirrors, validMirrors, turnMirror, traceMoon, gifts, giftShape, giftCells, validGifts, placeGift, giftsSolved, type LiftState, type GiftPlacement } from '../domain/hotelPuzzles';
import { initialTimeline, validTimeline, initialPipes, validPipes, validMail, type TimelineId, type MailState } from '../domain/mysteries';
import { timelineWidget, pipesWidget, mailWidget } from './mysteryWidgets';
import { balanceWidget, mirrorsWidget, giftsWidget } from './puzzleWidgets';
type Data = {
    episode: EpisodeId;
    locale: Locale;
    save: Save;
    feedback: Feedback;
    onExit(save: Save, locale: Locale, destination?: 'lobby' | 'map' | 'next'): void;
};
type Draft = {
    clues: EvidenceId[];
    road: number[];
    found: DifferenceId[];
    lift: LiftState;
    mirrors: number[];
    parcels: GiftPlacement[];
    laundry: number[];
    timeline: TimelineId[];
    pipes: number[];
    mail: MailState;
};
const fresh = (): Draft => ({ clues: [], road: [...initialRoad], found: [], lift: {}, mirrors: [...initialMirrors], parcels: [], laundry: [...initialLaundry], timeline: [...initialTimeline], pipes: [...initialPipes], mail: {} });
export class EpisodeScene extends Phaser.Scene {
    private dataIn!: Data;
    private state = fresh();
    private root?: HTMLElement;
    private modal?: () => void;
    private message = '';
    private won = false;
    private reward = 0;
    private rewardFx?: () => void;
    private moving = false;
    private storageFailed = false;
    private dimensions = '';
    private selectedItem?: string;
    private rotation = 0;
    private roadHistory: number[][] = [];
    private hintTarget?: DifferenceId;
    constructor() { super('episode'); }
    init(data: Data) {
        this.dataIn = data;
        this.state = fresh();
        this.selectedItem = undefined;
        this.rotation = 0;
        this.roadHistory = [];
        this.hintTarget = undefined;
        this.message = '';
        this.won = false;
        this.reward = 0;
        this.moving = false;
        this.storageFailed = false;
        this.dimensions = '';
        try {
            const raw = localStorage.getItem(this.key);
            const d = JSON.parse(raw ?? 'null');
            if (d) {
                if (validLaundry(d.laundry))
                    this.state.laundry = d.laundry;
                if (validTimeline(d.timeline))
                    this.state.timeline = d.timeline;
                if (validPipes(d.pipes))
                    this.state.pipes = d.pipes;
                if (validMail(d.mail))
                    this.state.mail = d.mail;
                if (validLift(d.lift))
                    this.state.lift = { ...d.lift };
                if (validMirrors(d.mirrors))
                    this.state.mirrors = [...d.mirrors];
                if (validGifts(d.parcels))
                    this.state.parcels = d.parcels;
                if (validRoad(d.road))
                    this.state.road = d.road;
                if (Array.isArray(d.clues))
                    this.state.clues = [...new Set<EvidenceId>(d.clues.filter((x: EvidenceId) => evidenceIds.includes(x)))];
                if (Array.isArray(d.found))
                    for (const id of d.found)
                        this.state.found = markDifference(this.state.found, id);
            }
        }
        catch { /* A changed or corrupt puzzle draft never clears the wallet. */ }
    }
    private get key() { return `midnight-check-in.episode.${this.dataIn.episode}.v${this.dataIn.episode === 'cake-case' ? 4 : this.dataIn.episode === 'luggage-run' || this.dataIn.episode === 'dream-door' ? 3 : 1}`; }
    private get en() { return this.dataIn.locale === 'en'; }
    private t(zh: string, en: string) { return this.en ? en : zh; }
    create() { this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.rewardFx?.(); this.root?.remove(); this.modal?.(); this.time.removeAllEvents(); }); this.render(); }
    update() {
        const d = `${this.scale.width}:${this.scale.height}`;
        if (d !== this.dimensions) {
            this.dimensions = d;
            this.paint();
        }
        const m = viewportMetrics(this.scale.width, this.scale.height);
        for (const o of this.children.list)
            if (o.getData('viewportAspect')) {
                const a = o as Phaser.GameObjects.Container;
                let s = a.getData('baseScale');
                if (!s) {
                    s = { x: a.scaleX, y: a.scaleY };
                    a.setData('baseScale', s);
                }
                a.setScale(s.x * m.aspectX, s.y * m.aspectY);
            }
    }
    private persist() {
        try {
            localStorage.setItem(this.key, JSON.stringify(this.state));
        }
        catch {
            this.storageFailed = true;
        }
    }
    private paint() {
        this.tweens.killAll();
        this.children.removeAll(true);
        const m = viewportMetrics(this.scale.width, this.scale.height);
        this.cameras.main.setViewport(0, 0, this.scale.width, this.scale.height).setOrigin(0, 0).setScroll(0, 0).setZoom(m.x, m.y);
        this.dimensions = `${this.scale.width}:${this.scale.height}`;
        const rect = this.root?.querySelector('.episode-stage')?.getBoundingClientRect();
        const box = rect && rect.width && rect.height ? { x: rect.x * 844 / window.innerWidth, y: rect.y * 480 / window.innerHeight, w: rect.width * 844 / window.innerWidth, h: rect.height * 480 / window.innerHeight } : { x: 12, y: 74, w: 510, h: 336 };
        const id = this.dataIn.episode;
        const theme = id === 'moon-mirrors' || id === 'midnight-knock' ? 'night' : id === 'luggage-run' || id === 'lost-letters' ? 'autumn' : 'morning';
        drawReception(this, this.dataIn.save, false, theme);
        const host = id === 'cake-case' ? 'dou' : id === 'luggage-run' || id === 'gift-box' || id === 'lost-letters' ? 'yuzu' : id === 'moon-mirrors' ? 'luno' : id === 'lift-balance' || id === 'midnight-knock' ? 'rollo' : id === 'spring-pipes' ? 'ember' : 'nemu';
        const guests = [guestById(host)];
        if (this.won)
            guests.forEach((g, i) => drawMonster(this, box.x + box.w * .5, box.y + box.h * .75, g, 'room').setScale(.85).setData('viewportAspect', true));
    }
    private button(label: string, action: () => void, primary = false) {
        const b = document.createElement('button');
        b.className = primary ? 'game-primary-button' : 'game-secondary-button';
        b.textContent = label;
        b.onclick = () => {
            if (this.moving)
                return;
            this.dataIn.feedback.play('tap');
            action();
        };
        return b;
    }
    private exit(destination: 'lobby' | 'map' | 'next' = 'lobby') {
        if (this.moving)
            return;
        this.persist();
        this.rewardFx?.();
        this.root?.remove();
        this.modal?.();
        this.scene.stop();
        this.dataIn.onExit(this.dataIn.save, this.dataIn.locale, destination);
    }
    private render() {
        const motion = capturePuzzle(this.root);
        this.root?.remove();
        document.documentElement.lang = this.dataIn.locale;
        this.game.canvas.setAttribute('aria-busy', 'false');
        this.game.canvas.dataset.challenge = this.dataIn.episode;
        this.game.canvas.setAttribute('aria-label', episodeCopy[this.dataIn.locale][this.dataIn.episode].title);
        const root = document.createElement('main');
        root.className = 'episode-screen';
        root.dataset.episode = this.dataIn.episode;
        for (const e of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'click'])
            root.addEventListener(e, event => event.stopPropagation());
        this.root = root;
        const copy = episodeCopy[this.dataIn.locale][this.dataIn.episode];
        const top = document.createElement('header');
        top.className = 'episode-top';
        top.append(iconButton('home', this.t('返回大廳', 'Lobby'), () => this.exit()), Object.assign(document.createElement('h1'), { textContent: copy.title }), iconButton('book', this.t('關卡地圖', 'Level map'), () => this.exit('map')), iconButton('globe', this.t('語言', 'Language'), () => this.language()), iconButton('gear', this.t('設定', 'Settings'), () => this.settings()));
        root.append(top);
        const layout = document.createElement('div');
        layout.className = !this.won && (this.dataIn.episode === 'dream-door' || this.dataIn.episode === 'lost-letters') ? 'episode-layout episode-layout--differences' : 'episode-layout';
        const stage = document.createElement('section');
        stage.className = 'episode-stage';
        stage.setAttribute('aria-label', this.t('解謎現場', 'Puzzle scene'));
        const panel = document.createElement('aside');
        panel.className = 'episode-panel';
        const goal = document.createElement('h2');
        goal.textContent = this.t('目標：', 'Goal: ') + copy.goal;
        const how = document.createElement('p');
        how.className = 'episode-how';
        how.textContent = copy.instruction;
        panel.append(goal, how);
        layout.append(stage, panel);
        root.append(layout);
        if (this.won) {
            stage.classList.add('episode-celebrate');
            const finish = document.createElement('div');
            finish.className = 'episode-finish';
            finish.append(Object.assign(document.createElement('h2'), { textContent: this.t('事件解決！', 'Case closed!') }), Object.assign(document.createElement('p'), { textContent: copy.ending }), Object.assign(document.createElement('strong'), { textContent: `+${this.reward} ${this.t('金幣', 'coins')}` }), this.button(afterChallenge(this.dataIn.episode) ? this.t('下一關', 'Next challenge') : this.t('返回旅館', 'Return to hotel'), () => this.exit(afterChallenge(this.dataIn.episode) ? 'next' : 'lobby'), true), this.button(this.t('再玩本關', 'Replay'), () => { this.state = fresh(); this.roadHistory = []; this.won = false; this.selectedItem = undefined; this.rotation = 0; this.hintTarget = undefined; this.message = ''; this.persist(); this.render(); }));
            panel.replaceChildren(finish);
        }
        else if (this.dataIn.episode === 'cake-case')
            this.laundry(stage, panel);
        else if (this.dataIn.episode === 'luggage-run')
            this.routing(stage, panel);
        else if (this.dataIn.episode === 'dream-door')
            this.dream(stage, panel);
        else
            this.extraPuzzle(stage, panel);
        const footer = document.createElement('footer');
        footer.className = 'episode-footer';
        const status = document.createElement('p');
        status.setAttribute('role', 'status');
        const message = document.createElement('span');
        message.textContent = this.message || (this.storageFailed ? this.t('未能儲存，只限本次遊玩。', 'Not saved · This session only.') : this.t('可以慢慢諗，唔使鬥快。', 'Take your time. There is no timer.'));
        status.append(episodeCompanion(this.dataIn.episode, this.en), message);
        footer.append(status, this.button(this.t('重新開始', 'Start over'), () => { this.state = fresh(); this.won = false; this.selectedItem = undefined; this.rotation = 0; this.hintTarget = undefined; this.message = ''; this.persist(); this.render(); }));
        root.append(footer);
        document.body.append(root);
        this.paint();
        animatePuzzle(root, motion);
    }
    private laundry(stage: HTMLElement, panel: HTMLElement) {
        const ui = { button: (label: string, run: () => void, primary = false) => this.button(label, run, primary), t: (zh: string, en: string) => this.t(zh, en) };
        laundryWidget(stage, panel, ui, this.state.laundry, Number(this.selectedItem ?? 0), n => { this.selectedItem = String(n); this.render(); }, (state, message) => { this.state.laundry = state; this.message = message ?? ''; this.persist(); this.render(); }, () => this.finish());
    }
    private routing(stage: HTMLElement, panel: HTMLElement) {
        const board = document.createElement('div');
        board.className = 'road-board';
        board.setAttribute('aria-label', this.t('四乘四道路滑塊，一格空位', 'Four by four sliding roads, one empty slot'));
        const points: Record<number, string> = { 1: '50 0', 2: '100 50', 4: '50 100', 8: '0 50' };
        for (let i = 0; i < roadSize * roadSize; i++) {
            const tile = this.state.road[i];
            const b = this.button('', () => {
                const next = slideRoad(this.state.road, i);
                const moved = next.some((n, k) => n !== this.state.road[k]);
                this.message = moved ? this.t('路磚滑好！繼續接通入口同出口。', 'Tile moved. Connect the entrance to the exit.') : this.t('只可以點空位上下左右旁邊嘅路磚。', 'Tap a road tile directly beside the empty slot.');
                if (!moved) {
                    this.render();
                    return;
                }
                const blank = board.querySelector<HTMLElement>(`[data-tile="${this.state.road.indexOf(-1)}"]`)!;
                this.roadHistory.push([...this.state.road]);
                this.state.road = next;
                this.persist();
                this.moving = true;
                this.game.canvas.setAttribute('aria-busy', 'true');
                this.root!.querySelectorAll('button').forEach(button => button.disabled = true);
                b.style.zIndex = '5';
                b.style.transition = reducedMotion() ? 'none' : 'transform 180ms ease-in-out';
                b.style.transform = `translate(${blank.offsetLeft - b.offsetLeft}px,${blank.offsetTop - b.offsetTop}px)`;
                this.time.delayedCall(reducedMotion() ? 1 : 200, () => { this.moving = false; this.render(); });
            });
            b.dataset.tile = String(i);
            b.dataset.roadTile = String(tile);
            b.className = `road-tile ${tile < 0 ? 'road-blank' : ''}`;
            b.setAttribute('aria-label', tile < 0 ? this.t('空位', 'Empty slot') : this.t(`第 ${i + 1} 格路磚`, `Road tile at position ${i + 1}`));
            if (tile >= 0) {
                const ports = [1, 2, 4, 8].filter(p => roadPorts[tile] & p);
                const d = `M${points[ports[0]]} L50 50 L${points[ports[1]]}`;
                b.innerHTML = `<svg class="road-art" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" fill="none" stroke="#542638" stroke-width="46"/><path d="${d}" fill="none" stroke="#efc57c" stroke-width="36"/><path d="${d}" fill="none" stroke="#fff1c5" stroke-width="23"/><path d="${d}" fill="none" stroke="#c79559" stroke-width="2" stroke-dasharray="3 7"/></svg>`;
            }
            else
                b.textContent = this.t('空位', 'Empty');
            if (i === 0 || i === roadSize * roadSize - 1) {
                const label = document.createElement('span');
                label.className = 'road-terminal';
                label.textContent = i === 0 ? this.t('入口 →', 'IN →') : this.t('→ 出口', '→ OUT');
                b.append(label);
            }
            board.append(b);
        }
        const start = document.createElement('span');
        start.className = 'road-start-avatar';
        start.setAttribute('aria-hidden', 'true');
        const goal = document.createElement('span');
        goal.className = 'road-goal-avatar';
        goal.setAttribute('aria-hidden', 'true');
        board.append(start, goal);
        stage.append(board);
        const note = document.createElement('p');
        note.textContent = this.t('每塊路磚唔會旋轉，只有空位旁邊嘅一塊可以滑動。路口要真正相接先行到。', 'Tiles do not rotate. Slide one neighboring tile into the gap. Road ends must actually meet.');
        panel.append(note);
        const undo = this.button(this.t('↶ 撤銷上一步', '↶ Undo last move'), () => {
            const previous = this.roadHistory.pop();
            if (!previous) return;
            this.state.road = previous;
            this.message = this.t('已撤銷，可以重新諗條路。', 'Move undone. Try another route.');
            this.persist();
            this.render();
        });
        undo.dataset.action = 'undo-road';
        undo.disabled = this.roadHistory.length === 0;
        panel.append(undo);
        const go = this.button(this.t('行李出發！', 'Send luggage!'), () => {
            const path = roadPath(this.state.road);
            if (!path.length) {
                this.message = this.t('道路仲未接通！由入口沿住路睇吓邊個路口斷開。', 'The roads are not connected. Follow the road from the entrance to find the gap.');
                this.render();
                return;
            }
            this.moving = true;
            this.game.canvas.setAttribute('aria-busy', 'true');
            this.root!.querySelectorAll('button').forEach(b => b.disabled = true);
            const traveler = document.createElement('div');
            traveler.className = 'luggage-traveler road-traveler';
            board.classList.add('is-running');
            board.append(traveler);
            path.forEach((at, index) => this.time.delayedCall(reducedMotion() ? index : index * 440, () => {
                const cell = board.querySelector<HTMLElement>(`[data-tile="${at}"]`)!;
                cell.classList.add('road-connected');
                traveler.style.width = `${cell.clientWidth * .4}px`;
                traveler.style.height = `${cell.clientHeight * .46}px`;
                traveler.style.transition = index && !reducedMotion() ? 'transform 410ms linear' : 'none';
                traveler.style.transform = `translate(${cell.offsetLeft + cell.clientWidth * .3}px,${cell.offsetTop + cell.clientHeight * .27}px)`;
                if (index === path.length - 1)
                    this.time.delayedCall(reducedMotion() ? 1 : 460, () => { this.moving = false; this.finish(); });
            }));
        }, true);
        go.dataset.action = 'send-luggage';
        panel.append(go);
    }
    private dream(stage: HTMLElement, panel: HTMLElement) {
        stage.classList.add('comparison-stage');
        const count = document.createElement('strong');
        count.className = 'difference-count';
        count.textContent = this.t('已找到', 'Found') + ` ${this.state.found.length} / ${differences.length}`;
        panel.append(count);
        const hint = this.button(this.t('提示', 'Hint'), () => {
            const d = differences.find(d => !this.state.found.includes(d.id));
            if (!d)
                return;
            this.hintTarget = d.id;
            this.message = this.t('留意發光位置嘅細節，提示唔會代你答。', 'Compare the highlighted detail; the hint does not collect it.');
            this.render();
            this.time.delayedCall(1800, () => { this.hintTarget = undefined; this.root?.querySelectorAll('.is-hint').forEach(e => e.classList.remove('is-hint')); });
        });
        hint.dataset.action = 'difference-hint';
        panel.append(hint);
        for (const world of ['real', 'dream'] as const) {
            const picture = document.createElement('div');
            picture.className = 'comparison-picture';
            picture.dataset.world = world;
            picture.setAttribute('aria-label', this.t(world === 'real' ? '現實圖片' : '夢境圖片', world === 'real' ? 'Reality picture' : 'Dream picture'));
            const label = document.createElement('strong');
            label.className = 'comparison-label';
            label.textContent = this.t(world === 'real' ? '現實' : '夢境', world === 'real' ? 'Reality' : 'Dream');
            picture.append(label);
            for (const object of comparisonProps) {
                const prop = document.createElement('span');
                prop.className = `comparison-object difference-prop difference-prop--${object.id} difference-prop--${world}`;
                prop.style.left = object.x + '%';
                prop.style.top = object.y + '%';
                prop.style.width = object.w + '%';
                prop.style.height = object.h + '%';
                prop.setAttribute('aria-hidden', 'true');
                if (object.id !== 'key') {
                    const detail = document.createElement('span');
                    detail.className = `comparison-detail detail-${object.id}`;
                    if (object.id === 'rug')
                        detail.innerHTML = world === 'real' ? '<svg viewBox="0 0 24 24"><path d="M12 21L3 12C-2 5 6 0 12 7C18 0 26 5 21 12Z" fill="#ffdb8f" stroke="#70405b" stroke-width="2"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M12 1L15 8L23 9L17 15L19 23L12 19L5 23L7 15L1 9L9 8Z" fill="#ffdb8f" stroke="#70405b" stroke-width="2"/></svg>';
                    if (object.id === 'crest')
                        detail.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 1L15 8L23 9L17 15L19 23L12 19L5 23L7 15L1 9L9 8Z" fill="#ffe09a" stroke="#79445c" stroke-width="2"/></svg>';
                    if (object.id === 'parcel')
                        detail.innerHTML = world === 'real' ? '<svg viewBox="0 0 24 28"><path d="M8 8Q2 16 13 21Q5 27 2 17Q0 8 8 8" fill="#ffe09a"/></svg>' : '<svg viewBox="0 0 24 28"><path d="M12 6L15 12L22 13L17 18L18 25L12 22L6 25L7 18L2 13L9 12Z" fill="#ffe09a"/></svg>';
                    prop.append(detail);
                }
                picture.append(prop);
            }
            for (const d of differences) {
                const target = this.button('', () => {
                    const next = markDifference(this.state.found, d.id);
                    const added = next.length > this.state.found.length;
                    this.state.found = next;
                    this.message = added ? this.t('找到一個不同！兩邊已經一齊標記。', 'Difference found! Both pictures are marked.') : this.t('呢一個已經搵到，再比較其他位置。', 'Already found. Compare the other objects.');
                    this.persist();
                    if (differencesComplete(next))
                        this.finish();
                    else
                        this.render();
                });
                target.className = `difference-target ${this.state.found.includes(d.id) ? 'is-found' : ''} ${this.hintTarget === d.id ? 'is-hint' : ''}`;
                target.dataset.difference = d.id;
                target.style.left = d.x + '%';
                target.style.top = d.y + '%';
                target.style.width = d.w + '%';
                target.style.height = d.h + '%';
                target.setAttribute('aria-label', this.t('比較物件', 'Compare object') + ` ${differences.findIndex(x => x.id === d.id) + 1}`);
                if (this.state.found.includes(d.id)) {
                    const tick = document.createElement('span');
                    tick.className = 'difference-tick';
                    tick.textContent = '✓';
                    target.append(tick);
                }
                picture.append(target);
            }
            picture.addEventListener('click', e => {
                if ((e.target as HTMLElement).closest('.difference-target'))
                    return;
                this.message = this.t('呢度兩邊一樣，試吓比較其他物件。', 'This area matches. Try comparing another object.');
                const status = this.root?.querySelector('[role=status]');
                if (status)
                    status.textContent = this.message;
            });
            stage.append(picture);
        }
    }
    private extraPuzzle(stage: HTMLElement, panel: HTMLElement) {
        const ui = { button: (label: string, run: () => void, primary = false) => this.button(label, run, primary), t: (zh: string, en: string) => this.t(zh, en) };
        const update = () => { this.persist(); this.render(); };
        const pick = (id: string) => { this.selectedItem = id || undefined; this.render(); };
        if (this.dataIn.episode === 'midnight-knock') {
            timelineWidget(stage, panel, ui, this.state.timeline, this.selectedItem, pick, (state, message) => { this.state.timeline = state; this.message = message ?? ''; update(); }, () => this.finish());
            return;
        }
        if (this.dataIn.episode === 'spring-pipes') {
            pipesWidget(stage, panel, ui, this.state.pipes, (state, message) => { this.state.pipes = state; this.message = message ?? ''; update(); }, () => this.finish());
            return;
        }
        if (this.dataIn.episode === 'lost-letters') {
            mailWidget(stage, panel, ui, this.state.mail, this.selectedItem, pick, (state, message) => { this.state.mail = state; this.message = message ?? ''; update(); }, () => this.finish());
            return;
        }
        if (this.dataIn.episode === 'lift-balance') {
            balanceWidget(stage, panel, ui, this.state.lift, this.selectedItem, id => { this.selectedItem = id; this.message = this.t('已選行李，再點左右台。', 'Bag selected. Choose a platform.'); this.render(); }, side => {
                if (!this.selectedItem) {
                    this.message = this.t('先揀一件行李。', 'Select a bag first.');
                    this.render();
                    return;
                }
                const next = loadBag(this.state.lift, this.selectedItem, side);
                const changed = JSON.stringify(next) !== JSON.stringify(this.state.lift);
                this.state.lift = next;
                this.message = changed ? this.t('留意重量同每邊件數。', 'Check the weight and bag count on each side.') : this.t('每邊最多三件，先取回一件。', 'A platform holds three bags. Take one back first.');
                if (changed)
                    this.selectedItem = undefined;
                update();
            }, id => { this.state.lift = unloadBag(this.state.lift, id); this.selectedItem = id; update(); }, () => {
                if (liftSolved(this.state.lift))
                    this.finish();
                else {
                    this.message = this.t('要六件全裝好、兩邊重量一樣，而且易碎箱在左台。', 'Load all six, balance the weights and put the fragile bag on the left.');
                    this.render();
                }
            });
            return;
        }
        if (this.dataIn.episode === 'moon-mirrors') {
            mirrorsWidget(stage, panel, ui, this.state.mirrors, index => { this.state.mirrors = turnMirror(this.state.mirrors, index); this.message = this.t('光線已改變，跟住光路觀察。', 'The beam changed. Follow its path.'); update(); }, () => {
                if (traceMoon(this.state.mirrors).solved)
                    this.finish();
                else {
                    this.message = this.t('三粒星石同月窗都要同時亮起。', 'All three stars and the window must shine together.');
                    this.render();
                }
            });
            return;
        }
        giftsWidget(stage, panel, ui, this.state.parcels, this.selectedItem, this.rotation, id => { this.selectedItem = id; this.rotation = this.state.parcels.find(p => p.id === id)?.rotation ?? 0; this.render(); }, (x, y) => {
            const owner = this.state.parcels.find(p => giftCells(p).some(c => c.x === x && c.y === y));
            if (owner && (!this.selectedItem || this.selectedItem === owner.id)) {
                this.state.parcels = this.state.parcels.filter(p => p.id !== owner.id);
                this.selectedItem = owner.id;
                this.rotation = owner.rotation;
                update();
                return;
            }
            if (!this.selectedItem) {
                this.message = this.t('先揀下面嘅手信。', 'Choose a gift first.');
                this.render();
                return;
            }
            const next = placeGift(this.state.parcels, { id: this.selectedItem, x, y, rotation: this.rotation });
            const changed = JSON.stringify(next) !== JSON.stringify(this.state.parcels);
            this.state.parcels = next;
            this.message = changed ? this.t('放好一份，留意剩餘空間。', 'Gift placed. Plan the remaining space.') : this.t('放唔落，試吓旋轉或者換位置。', 'It does not fit. Rotate it or try another spot.');
            if (changed)
                this.selectedItem = undefined;
            update();
        }, () => { this.rotation = (this.rotation + 1) % 4; this.render(); }, () => {
            if (giftsSolved(this.state.parcels))
                this.finish();
            else {
                this.message = this.t('五份都要放入去，唔可以重疊。', 'Fit all five gifts without overlap.');
                this.render();
            }
        });
    }
    private finish() { const result = completeEpisode(this.dataIn.save, this.dataIn.episode); this.dataIn.save = result.save; this.reward = result.reward; this.storageFailed = !writeSave(result.save) || this.storageFailed; this.won = true; this.moving = false; this.message = this.storageFailed ? this.t('未能儲存，只限本次遊玩。', 'Not saved · This session only.') : this.t('首次完成獎勵已儲存；重玩唔會重複派獎。', 'First-completion reward saved. Replays do not award coins again.'); if (!this.reward)
        this.dataIn.feedback.play('success'); this.persist(); this.render(); this.rewardFx?.(); this.rewardFx = celebrateReward(this.reward, this.dataIn.save.coins, this.dataIn.locale, () => { this.dataIn.feedback.play('harvest'); void this.dataIn.feedback.pulse('purchase'); }); }
    private language() { this.modal?.(); this.modal = showDetails({ kind: 'language', title: this.t('語言', 'Language'), eyebrow: '', close: this.t('返回', 'Back'), sections: [], content: languageContent(this.dataIn.locale, locale => { this.modal?.(); this.modal = undefined; this.dataIn.locale = locale; saveLocale(locale); this.render(); }) }, () => { this.modal = undefined; }); }
    private settings() { this.modal?.(); this.modal = showDetails({ kind: 'settings', title: this.t('設定', 'Settings'), eyebrow: '', close: this.t('返回', 'Back'), sections: [], content: settingsContent(this.dataIn.locale, this.dataIn.feedback.preferences, p => { this.dataIn.feedback.setPreferences(p); return savePreferences(p); }, () => this.dataIn.feedback.play('place'), () => this.language()) }, () => { this.modal = undefined; }); }
}
