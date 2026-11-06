import {freshHoney,validHoney,stepHoney,honeySolved,freshShadow,validShadow,shadowSolved,freshBounce,validBounce,simulateBounce,type HoneyState,type ShadowBoard,type BounceConfig} from '../domain/teaGames';
import {honeyWidget,shadowWidget,bounceWidget,sampleBall} from './teaWidgets';
import {freshClocks,validClocks,turnClocks,clocksSolved,type ClockState} from '../domain/clockwork';
import {clockworkWidget} from './clockworkWidget';
import {languageToggle} from './languageToggle';
import { freshWind, validWind, windBells, glideWind, windSolved, type WindState } from '../domain/windGuest';
import { windGuestWidget } from './windGuestWidget';
import { completionTheatre } from './completionTheatre';
import { reactGuests } from './characterMotion';
import { echoWidget, livePhotoWidget, liveActor } from './liveWidgets';
import { echoRounds, freshEcho, validEcho, echoTap, cameraGuests, cameraReady, validCamera, type EchoState } from '../domain/liveGames';
import { navigate, navigationBusy, revealFeedback, motion as animateElement } from './gameFeel';
import { initialScent, validScent, validPartialCode, placeRune, validGuesses, codeSolved, validPhoto, freshPhoto, photoGuests, swapPhoto, turnPhoto, photoSolved, type ScentBoard, type Rune, type PhotoState, type PhotoGuest } from '../domain/guestPuzzles';
import { scentWidget, scentPourEffect, codeWidget, photoWidget, fitPhotoFrames } from './guestPuzzleWidgets';
import { initialLaundry, validLaundry, laundrySolved } from '../domain/laundry';
import { laundryWidget } from './laundryWidget';
import { celebrateReward } from './rewardFx';
import { capturePuzzle, animatePuzzle, episodeCompanion, episodeHosts } from './puzzleMotion';
import Phaser from 'phaser';
import { evidenceIds, accusation, initialRoad, validRoad, validRoadStack, slideRoad, roadPath, roadPorts, roadSize, comparisonProps, differences, markDifference, differencesComplete, type EpisodeId, type EvidenceId, type DifferenceId } from '../domain/episodes';
import { afterChallenge, completeEpisode } from '../domain/campaign';
import { episodeCopy } from '../i18n/episodes';
import { saveLocale, type Locale } from '../i18n/catalog';
import { writeSave, type Save } from '../platform/save';
import type { Feedback } from '../platform/feedback';
import { proportionalCrop, viewportMetrics } from './viewport';
import { drawReception } from './reception';
import { reducedMotion } from './art';
import { showDetails } from './details';
import { settingsContent, languageContent } from './hotelMenus';
import { savePreferences } from '../platform/preferences';
import { iconButton } from './icons';
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
    honey:HoneyState; shadow:ShadowBoard; shadowHistory:ShadowBoard[]; bounce:BounceConfig; bounceHistory:BounceConfig[]; bounceLast?:BounceConfig;
    clocks:ClockState;
    wind: WindState;
    clues: EvidenceId[];
    road: number[];
    roadPast: number[][]; roadFuture: number[][]; echo: EchoState; camera: string[];
    found: DifferenceId[];
    lift: LiftState;
    mirrors: number[];
    parcels: GiftPlacement[];
    laundry: number[];
    timeline: TimelineId[];
    pipes: number[];
    mail: MailState;
    scent: ScentBoard;
    scentHistory: ScentBoard[];
    lockInput: (Rune | null)[];
    lockGuesses: Rune[][];
    photo: PhotoState;
};
const fresh = (): Draft => ({ honey:freshHoney(),shadow:freshShadow(),shadowHistory:[],bounce:freshBounce(),bounceHistory:[], clocks:freshClocks(), wind:freshWind(), clues: [], roadPast: [], roadFuture: [], echo: freshEcho(), camera: [], road: [...initialRoad], found: [], lift: {}, mirrors: [...initialMirrors], parcels: [], laundry: [...initialLaundry], timeline: [...initialTimeline], pipes: [...initialPipes], mail: {}, scent: initialScent.map(b => [...b]), scentHistory: [], lockInput: [null, null, null], lockGuesses: [], photo: freshPhoto() });
export class EpisodeScene extends Phaser.Scene {
    private dataIn!: Data;
    private state = fresh();
    private root?: HTMLElement;
    private liveTick?: (now:number)=>void;
    private liveEpoch=0;
    private echoPlaying=false;
    private echoOpen=false;
    private echoTimers: Phaser.Time.TimerEvent[]=[];
    private modal?: () => void;
    private message = '';
    private won = false;
    private reward = 0;
    private rewardFx?: () => void;
    private moving = false;
    private storageFailed = false;
    private dimensions = '';
    private paintStamp='';
    private paintCount=0;
    private selectedItem?: string;
    private rotation = 0;
    private historyPage = -1;
    private hintTarget?: DifferenceId;
    constructor() { super('episode'); }
    init(data: Data) {
        this.dataIn = data;this.liveEpoch=performance.now();this.echoOpen=false;this.echoPlaying=false;this.liveTick=undefined;
        this.state = fresh();this.echoOpen=false;this.liveEpoch=performance.now();
        this.selectedItem = undefined;
        this.rotation = 0;
        this.hintTarget = undefined;
        this.historyPage = -1;
        this.message = '';
        this.won = false;
        this.reward = 0;
        this.moving = false;
        this.storageFailed = false;
        this.dimensions = '';this.paintStamp='';this.paintCount=0;
        try {
            const raw = localStorage.getItem(this.key);
            const d = JSON.parse(raw ?? 'null');
            if (d) {
                if(validHoney(d.honey))this.state.honey=d.honey;
                if(validShadow(d.shadow))this.state.shadow=d.shadow;
                if(Array.isArray(d.shadowHistory)&&d.shadowHistory.length<=40&&d.shadowHistory.every(validShadow))this.state.shadowHistory=d.shadowHistory;
                if(validBounce(d.bounce))this.state.bounce=d.bounce;
                if(validBounce(d.bounceLast))this.state.bounceLast=d.bounceLast;
                if(Array.isArray(d.bounceHistory)&&d.bounceHistory.length<=40&&d.bounceHistory.every(validBounce))this.state.bounceHistory=d.bounceHistory;
                if(validClocks(d.clocks))this.state.clocks=d.clocks;
                if(validWind(d.wind))this.state.wind=d.wind;
                if(validEcho(d.echo))this.state.echo=d.echo.round===3?freshEcho():d.echo;
                if(validCamera(d.camera))this.state.camera=d.camera;
                for(const field of ['roadPast','roadFuture'] as const)if(validRoad(d.road)&&validRoadStack(d[field],d.road))this.state[field]=d[field];

                if (validScent(d.scent))
                    this.state.scent = d.scent;
                if (Array.isArray(d.scentHistory) && d.scentHistory.length <= 40 && d.scentHistory.every(validScent))
                    this.state.scentHistory = d.scentHistory;
                if (validPartialCode(d.lockInput))
                    this.state.lockInput = d.lockInput;
                if (validGuesses(d.lockGuesses))
                    this.state.lockGuesses = d.lockGuesses;
                if (validPhoto(d.photo))
                    this.state.photo = d.photo;
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
        if(this.dataIn.episode==='storm-arrival'&&this.dataIn.save.episodes?.includes('storm-arrival')&&windSolved(this.state.wind))this.state.wind=freshWind();
        if(this.dataIn.episode==='clockwork-guest'&&this.dataIn.save.episodes?.includes('clockwork-guest')&&clocksSolved(this.state.clocks.hands))this.state.clocks=freshClocks();
        if(this.dataIn.episode==='honey-pots'&&this.dataIn.save.episodes?.includes('honey-pots')&&honeySolved(this.state.honey)){this.state.honey=freshHoney();this.persist();}
        if(this.dataIn.episode==='shadow-tea'&&this.dataIn.save.episodes?.includes('shadow-tea')&&shadowSolved(this.state.shadow)){this.state.shadow=freshShadow();this.state.shadowHistory=[];this.persist();}
        if(this.dataIn.episode==='cake-case'&&this.dataIn.save.episodes?.includes('cake-case')&&laundrySolved(this.state.laundry))this.state.laundry=[...initialLaundry];
    }
    private get key() { return `midnight-check-in.episode.${this.dataIn.episode}.v${this.dataIn.episode === 'lost-letters' || this.dataIn.episode === 'group-photo' ? 2 : this.dataIn.episode === 'cake-case' ? 4 : this.dataIn.episode === 'luggage-run' || this.dataIn.episode === 'dream-door' ? 3 : 1}`; }
    private get en() { return this.dataIn.locale === 'en'; }
    private t(zh: string, en: string) { return this.en ? en : zh; }
    create() { this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.rewardFx?.(); this.root?.remove(); this.modal?.(); this.time.removeAllEvents(); }); this.render(); }
    private recoverWind(){if(this.dataIn.episode==='storm-arrival'&&!this.won&&!this.moving&&windSolved(this.state.wind)&&!navigationBusy())this.finish();}
    private refreshLive(){this.liveTick?.(performance.now());}
    update() {
        this.refreshLive();this.recoverWind();
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
        if (this.root)
            fitPhotoFrames(this.root);
        const stamp=`${this.scale.width}:${this.scale.height}:${this.dataIn.episode}`;
        if(stamp===this.paintStamp)return;this.paintStamp=stamp;this.game.canvas.dataset.scenePaints=String(++this.paintCount);
        this.tweens.killAll();
        this.children.removeAll(true);
        const m = viewportMetrics(this.scale.width, this.scale.height);
        this.cameras.main.setViewport(0, 0, this.scale.width, this.scale.height).setOrigin(0, 0).setScroll(0, 0).setZoom(m.x, m.y);
        this.dimensions = `${this.scale.width}:${this.scale.height}`;
        const id = this.dataIn.episode;
        const theme = id === 'shadow-tea' || id === 'storm-arrival' || id === 'moon-mirrors' || id === 'midnight-knock' ? 'night' : id === 'luggage-run' || id === 'lost-letters' ? 'autumn' : 'morning';
        drawReception(this, this.dataIn.save, false, theme);

    }
    private button(label: string, action: () => void, primary = false) {
        const b = document.createElement('button');
        b.className = primary ? 'game-primary-button' : 'game-secondary-button';
        b.textContent = label;
        b.onclick = () => {
            if (this.moving)
                return;
            const before=JSON.stringify(this.state),oldMessage=this.message,oldSelection=this.selectedItem;
            action();
            if(!this.won&&this.root?.isConnected){const changed=before!==JSON.stringify(this.state);reactGuests(this.root,changed?'pleased':oldSelection!==this.selectedItem?'thinking':oldMessage!==this.message?'puzzled':'thinking');}
        };
        return b;
    }
    private exit(destination: 'lobby' | 'map' | 'next' = 'lobby') {
        if(this.moving)return;
        navigate(`episode:${this.dataIn.episode}:${destination}`,()=>{
            this.persist();this.rewardFx?.();this.root?.remove();this.modal?.();this.scene.stop();
            this.dataIn.onExit(this.dataIn.save,this.dataIn.locale,destination);
        });
    }
    private render() {
        this.liveTick=undefined;this.echoTimers.forEach(t=>t.remove(false));this.echoTimers=[];this.echoPlaying=false;
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
        top.append(iconButton('home', this.t('返回大廳', 'Lobby'), () => this.exit()), Object.assign(document.createElement('h1'), { textContent: copy.title }), iconButton('book', this.t('關卡地圖', 'Level map'), () => this.exit('map')), languageToggle(this.dataIn.locale,locale=>{if(this.moving||locale===this.dataIn.locale)return;this.dataIn.locale=locale;saveLocale(locale);this.render();}),iconButton('gear', this.t('設定', 'Settings'), () => this.settings()));
        root.append(top);
        const layout = document.createElement('div');
        layout.className = !this.won && (this.dataIn.episode === 'dream-door' || this.dataIn.episode === 'key-cabinet') ? 'episode-layout episode-layout--differences' : 'episode-layout';
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
        const mascot=liveActor(episodeHosts[this.dataIn.episode].kind);mascot.classList.add('goal-mascot');goal.prepend(mascot);panel.append(goal, how);
        layout.append(stage, panel);
        root.append(layout);
        if (this.won) {
            stage.classList.add('episode-celebrate');stage.append(completionTheatre(this.dataIn.episode));
            const finish = document.createElement('div');
            finish.className = 'episode-finish';
            finish.append(Object.assign(document.createElement('h2'), { textContent: this.t('事件解決！', 'Case closed!') }), Object.assign(document.createElement('p'), { textContent: copy.ending }), Object.assign(document.createElement('strong'), { textContent: `+${this.reward} ${this.t('金幣', 'coins')}` }), this.button(afterChallenge(this.dataIn.episode) ? this.t('下一關', 'Next challenge') : this.t('返回旅館', 'Return to hotel'), () => this.exit(afterChallenge(this.dataIn.episode) ? 'next' : 'lobby'), true), this.button(this.t('再玩本關', 'Replay'), () => { this.state = fresh();this.echoOpen=false;this.liveEpoch=performance.now(); this.won = false; this.selectedItem = undefined; this.rotation = 0; this.hintTarget = undefined; this.historyPage = -1; this.message = ''; this.persist(); this.render(); }));
            if(this.dataIn.episode==='group-photo'||this.dataIn.episode==='clockwork-guest'){const tools=document.createElement('div');tools.className='photo-finish-tools';tools.append(finish.lastElementChild!,this.button(this.t('返回旅館','Return to hotel'),()=>this.exit()));finish.append(tools);}
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
        footer.append(status, this.button(this.t('重新開始', 'Start over'), () => { this.state = fresh();this.echoOpen=false;this.liveEpoch=performance.now(); this.won = false; this.selectedItem = undefined; this.rotation = 0; this.hintTarget = undefined; this.historyPage = -1; this.message = ''; this.persist(); this.render(); }));
        root.append(footer);
        document.body.append(root);
        this.paint();
        this.refreshLive();
        animatePuzzle(root, motion);

        if(this.message)revealFeedback(root.querySelector<HTMLElement>('.episode-footer [role=status]>span:last-child')??undefined);
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
                this.state.roadPast=[...this.state.roadPast.slice(-511),[...this.state.road]];this.state.roadFuture=[];
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
        const undo=this.button(this.t('撤回','Undo'),()=>{const previous=this.state.roadPast.pop();if(previous){this.state.roadFuture.push([...this.state.road]);this.state.road=previous;this.persist();this.render();}});undo.dataset.action='undo-road';undo.disabled=!this.state.roadPast.length;const redo=this.button(this.t('重做','Redo'),()=>{const next=this.state.roadFuture.pop();if(next){this.state.roadPast=[...this.state.roadPast.slice(-511),[...this.state.road]];this.state.road=next;this.persist();this.render();}});redo.dataset.action='redo-road';redo.disabled=!this.state.roadFuture.length;const history=document.createElement('div');history.className='road-history';history.append(undo,redo);panel.append(note,history);
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
                if (status) {
                    const text = status.querySelector('span:last-child');
                    if (text)
                        text.textContent = this.message;
                }
            });
            stage.append(picture);
        }
    }
    private extraPuzzle(stage: HTMLElement, panel: HTMLElement) {
        const ui = { button: (label: string, run: () => void, primary = false) => this.button(label, run, primary), t: (zh: string, en: string) => this.t(zh, en),say:(message:string)=>{this.message=message;this.render();} };
        const update = () => { this.persist(); this.render(); };
        const pick = (id: string) => { this.selectedItem = id || undefined; this.render(); };
        if(this.dataIn.episode==='honey-pots'){
            honeyWidget(stage,panel,ui,this.state.honey,d=>{const old=this.state.honey,next=stepHoney(old,d);if(next.at===old.at){this.message=this.t('前面推唔郁，試吓繞去另一邊。','Blocked. Try walking around the pot.');this.render();return;}this.state.honey={...next,history:[...old.history.slice(-511),{at:old.at,pots:[...old.pots]}]};this.message='';update();},()=>{const old=this.state.honey.history.pop();if(old){this.state.honey={...old,history:this.state.honey.history};update();}},()=>{if(honeySolved(this.state.honey))this.finish();else{this.message=this.t('兩個金色杯墊都要放上蜜罐。','Put a pot on both gold coasters.');this.render();}});return;
        }
        if(this.dataIn.episode==='shadow-tea'){
            shadowWidget(stage,panel,ui,this.state.shadow,Math.max(0,Math.min(2,Number(this.selectedItem??0))),n=>{this.selectedItem=String(n);this.render();},(n,v)=>{if(this.state.shadow[n]!==v){this.state.shadowHistory=[...this.state.shadowHistory.slice(-39),[...this.state.shadow]];this.state.shadow=this.state.shadow.map((old,i)=>i===n?v:old);this.message='';}update();},()=>{const old=this.state.shadowHistory.pop();if(old){this.state.shadow=old;update();}},!!this.state.shadowHistory.length,()=>{if(shadowSolved(this.state.shadow))this.finish();else{this.message=this.t('留意耳朵、身形同尾巴嘅大小同重疊。','Compare the ears, body and tail: size and overlap both matter.');this.render();}});return;
        }
        if(this.dataIn.episode==='pillow-bounce'){
            bounceWidget(stage,panel,ui,this.state.bounce,this.state.bounceLast,next=>{this.state.bounceHistory=[...this.state.bounceHistory.slice(-39),{...this.state.bounce,pillows:[...this.state.bounce.pillows]}];this.state.bounce=next;this.message='';update();},()=>{const old=this.state.bounceHistory.pop();if(old){this.state.bounce=old;update();}},!!this.state.bounceHistory.length,(ball,board)=>{
                const config={...this.state.bounce,pillows:[...this.state.bounce.pillows]},result=simulateBounce(config);if(!result.frames.length)return;this.state.bounceLast=config;this.persist();const started=performance.now();let seenPads=0,scanned=0,heardMask=0;panel.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.disabled=true);board.classList.add('is-firing');
                this.liveTick=now=>{const elapsed=now-started,frame=sampleBall(result.frames,reducedMotion()?result.frames.length/0.12:elapsed);ball.setAttribute('cx',String(frame.x));ball.setAttribute('cy',String(frame.y));board.querySelectorAll('[data-bounce-bell]').forEach((e,i)=>e.classList.toggle('bell-rung',!!(frame.mask&(1<<i))));if(frame.mask!==heardMask){heardMask=frame.mask;this.dataIn.feedback.play('place');}for(;scanned<Math.min(result.frames.length,Math.floor(elapsed*.12)+1);scanned++){const hit=result.frames[scanned];if(hit.pad<0||(seenPads&(1<<hit.pad)))continue;seenPads|=1<<hit.pad;const pad=board.querySelector<SVGElement>(`[data-bounce-pad="${hit.pad}"]`);const cushion=pad?.querySelector('rect');if(cushion&&!reducedMotion())animateElement(cushion,[{scale:'1 .8'},{scale:'1 1'}],250);}
                    if(reducedMotion()?elapsed>220:elapsed>=result.frames.length/0.12+(result.won?300:180)){this.liveTick=undefined;if(result.won)this.finish();else{this.message=this.t('試調一個角度再發射；虛線係上一發。要用到兩個枕頭同敲齊兩個風鈴。','Try changing one angle. The dotted line shows your last try. Use both pillows and ring both chimes.');this.render();}}
                };
            });return;
        }
        if(this.dataIn.episode==='clockwork-guest'){
            clockworkWidget(stage,panel,ui,this.state.clocks,()=>{this.state.clocks.started=true;update();},knob=>{
                const old=[...this.state.clocks.hands];this.state.clocks.history=[...this.state.clocks.history.slice(-255),old];this.state.clocks.hands=turnClocks(old,knob);this.message='';this.persist();
                this.state.clocks.hands.forEach((n,i)=>{const house=stage.querySelector<HTMLElement>(`[data-clock="${i}"]`);if(!house)return;house.dataset.hand=String(n);house.classList.toggle('clock-aligned',n===0);house.setAttribute('aria-label',this.t(`鐘 ${i+1}：${n===0?12:n*3} 點`,`Clock ${i+1}: ${n===0?12:n*3} o'clock`));house.style.setProperty('--hand-angle',`${n*90}deg`);if(n!==old[i]){const hand=house.querySelector<HTMLElement>('.clock-hand')!;const delta=knob===0&&i===1||knob===2&&i===3?-90:90;animateElement(hand,[{transform:`rotate(${old[i]*90}deg)`},{transform:`rotate(${old[i]*90+delta}deg)`}],330,{easing:'cubic-bezier(.2,.8,.2,1)'});}});
                const gear=panel.querySelector<HTMLElement>(`[data-clock-knob="${knob}"] .brass-gear`);if(gear)animateElement(gear,[{rotate:'0deg'},{rotate:'90deg'}],330);panel.querySelectorAll('.clock-hint').forEach(e=>e.classList.remove('clock-hint'));panel.querySelector<HTMLButtonElement>('[data-action=undo-clocks]')!.disabled=false;stage.querySelectorAll('.clock-linked').forEach(e=>e.classList.remove('clock-linked'));
            },()=>{const before=this.state.clocks.history.pop();if(before){this.state.clocks.hands=before;this.message=this.t('已撤回，試另一個齒輪。','Undone. Try another gear.');update();}},()=>{if(clocksSolved(this.state.clocks.hands))this.finish();else{this.message=this.t('仲有指針未對準金星，留意兩隻鐘會一齊轉。','Some hands still miss the gold star. Each gear turns two clocks.');this.render();}});return;
        }
        if(this.dataIn.episode==='storm-arrival'){
            windGuestWidget(stage,panel,ui,this.state.wind,()=>{this.state.wind.started=true;update();},d=>{
                const old=this.state.wind,next=glideWind(old,d);if(!next.path.length){this.message=this.t('呢邊有牆擋住，試另一個風向。','A wall blocks that direction. Try another wind.');this.render();return;}
                this.state.wind={started:true,at:next.at,mask:next.mask,history:[...old.history.slice(-255),{at:old.at,mask:old.mask}]};this.persist();this.moving=true;this.game.canvas.setAttribute('aria-busy','true');
                const actor=stage.querySelector<HTMLElement>('.wind-traveler'),board=stage.querySelector<HTMLElement>('.wind-board');const duration=reducedMotion()?1:Math.min(650,200+next.path.length*85);
                if(actor&&board&&!reducedMotion()){const rect={width:board.clientWidth,height:board.clientHeight};animateElement(actor,[old.at,...next.path].map((at,i,all)=>({translate:`${((at%6)-(old.at%6))*rect.width/6}px ${(Math.floor(at/6)-Math.floor(old.at/6))*rect.height/5}px`,offset:i/(all.length-1)})),duration,{easing:'linear'});}
                next.path.forEach((at,i)=>{const bell=windBells.findIndex(b=>b===at);if(bell>=0&&!(old.mask&(1<<bell)))this.time.delayedCall(duration*(i+1)/next.path.length,()=>{const cell=board?.querySelector<HTMLElement>(`[data-wind-cell="${at}"]`);if(cell){cell.classList.add('is-collected');cell.textContent='✧';}this.dataIn.feedback.play('place');});});
                this.time.delayedCall(duration,()=>{this.moving=false;this.message=next.mask!==old.mask?this.t('收好風鈴碎片！小雷冇咁驚喇。','A chime piece! Nimbus feels a little braver.'):this.t('留意停點，搵齊風鈴再入大廳。','Plan your stopping points. Collect every piece before the lobby.');if(windSolved(this.state.wind))this.finish();else this.render();});
            },()=>{const before=this.state.wind.history.pop();if(before){this.state.wind={...this.state.wind,...before};this.message=this.t('已撤回，可以試另一條路。','Undone. Try a different route.');update();}});return;
        }
        if (this.dataIn.episode === 'scent-room') {
            scentWidget(stage, panel, ui, this.state.scent, this.selectedItem === undefined ? undefined : Number(this.selectedItem), n => { this.selectedItem = n === undefined ? undefined : String(n); this.render(); }, (board, from, to) => {
                const color = this.state.scent[from].at(-1)!;
                this.state.scentHistory = [...this.state.scentHistory.slice(-39), this.state.scent.map(b => [...b])];
                this.state.scent = board;
                this.selectedItem = undefined;
                this.persist();
                this.moving = true;
                this.game.canvas.setAttribute('aria-busy', 'true');
                this.root!.querySelectorAll('button').forEach(b => b.disabled = true);
                scentPourEffect(this.root!, from, to, color);
                this.time.delayedCall(reducedMotion() ? 1 : 580, () => { this.moving = false; this.render(); });
            }, m => { this.message = m; this.render(); }, () => {
                const old = this.state.scentHistory.pop();
                if (old) {
                    this.state.scent = old;
                    this.selectedItem = undefined;
                    this.message = this.t('已撤回上一步。', 'Last pour undone.');
                    update();
                }
            }, this.state.scentHistory.length > 0, () => this.finish());
            return;
        }
        if (this.dataIn.episode === 'key-cabinet') {
            codeWidget(stage, panel, ui, this.state.lockInput, this.state.lockGuesses, Number(this.selectedItem ?? 0), this.historyPage, n => pick(String(n)), r => {
                const at = Number(this.selectedItem ?? 0);
                this.state.lockInput = placeRune(this.state.lockInput, at, r);
                const next = this.state.lockInput.indexOf(null);
                this.selectedItem = String(next < 0 ? 0 : next);
                update();
            }, n => { this.historyPage = n; this.render(); }, () => {
                const guess = this.state.lockInput as Rune[];
                if (guess.some(x => x === null))
                    return;
                if (codeSolved(guess)) {
                    if (!this.state.lockGuesses.some(g => g.join() === guess.join()))
                        this.state.lockGuesses = [...this.state.lockGuesses, [...guess]];
                    this.finish();
                    return;
                }
                if (this.state.lockGuesses.some(g => g.join() === guess.join())) {
                    this.message = this.t('呢組已經試過，根據結果換一組。', 'Already tried. Use its feedback to choose another code.');
                    this.render();
                    return;
                }
                this.state.lockGuesses = [...this.state.lockGuesses, [...guess]];
                this.historyPage = -1;
                this.persist();
                if (codeSolved(guess))
                    this.finish();
                else {
                    this.message = this.t('結果已記低：分清圖案同位置，再排除。', 'Feedback saved. Compare symbols and positions to eliminate possibilities.');
                    this.render();
                }
            });
            return;
        }
        if(this.dataIn.episode==='group-photo'){
            this.liveTick=livePhotoWidget(stage,panel,ui,this.state.camera,id=>{const i=cameraGuests.findIndex(g=>g===id);if(i<0||this.state.camera.includes(id))return;if(cameraReady(i,performance.now()-this.liveEpoch)){this.state.camera.push(id);this.message=this.t('定格成功！其餘住客繼續郁，慢慢捉時機。','Pose held! The others keep moving. Take your time.');this.dataIn.feedback.play('place');}else{this.message=this.t('未望鏡頭，等綠圈再試，唔扣分。','Wait for the green ring and try again. No penalty.');}update();},()=>{if(this.state.camera.length!==6)return;if(!reducedMotion()){const flash=document.createElement('div');flash.className='camera-flash';flash.setAttribute('aria-hidden','true');document.body.append(flash);setTimeout(()=>flash.remove(),320);}this.state.photo={order:['ember','dou','nemu','luno','rollo','yuzu'],poses:{luno:-1,dou:0,ember:0,rollo:0,yuzu:1,nemu:0}};this.finish();},this.liveEpoch);return;
        }
        if (this.dataIn.episode === 'midnight-knock') {
            timelineWidget(stage, panel, ui, this.state.timeline, this.selectedItem, pick, (state, message) => { this.state.timeline = state; this.message = message ?? ''; update(); }, () => this.finish());
            return;
        }
        if (this.dataIn.episode === 'spring-pipes') {
            pipesWidget(stage, panel, ui, this.state.pipes, (state, message) => { this.state.pipes = state; this.message = message ?? ''; update(); }, () => this.finish());
            return;
        }
        if(this.dataIn.episode==='lost-letters'){
            const view=echoWidget(stage,panel,ui,this.state.echo,n=>{if(this.echoPlaying||!this.echoOpen)return;const old=this.state.echo.round,result=echoTap(this.state.echo,n);this.state.echo=result.state;this.message=result.wrong?this.t('次序未啱，今輪重新試，之前過咗嘅會保留。','Try this round again. Earlier rounds are safe.'):this.t('接到！繼續下一位。','Got it! Who comes next?');if(result.wrong)this.dataIn.feedback.play('error');else this.dataIn.feedback.play('place');if(this.state.echo.round!==old)this.echoOpen=false;if(this.state.echo.round===3)this.finish();else update();},()=>{if(this.echoPlaying)return;this.echoPlaying=true;this.echoOpen=false;this.state.echo.input=[];this.persist();view.phase('watching');const root=this.root;const notes=echoRounds[this.state.echo.round]??[];notes.forEach((n,i)=>{this.echoTimers.push(this.time.delayedCall(200+i*780,()=>{if(root!==this.root)return;view.flash(n,true);this.dataIn.feedback.play('place');}));this.echoTimers.push(this.time.delayedCall(720+i*780,()=>{if(root===this.root)view.flash(n,false);}));});this.echoTimers.push(this.time.delayedCall(250+notes.length*780,()=>{if(root!==this.root)return;this.echoPlaying=false;this.echoOpen=true;view.phase('answer');}));});view.phase(this.echoOpen?'answer':'idle');return;
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
                if (liftSolved(this.state.lift)){this.moving=true;stage.classList.add('lift-departing');this.game.canvas.setAttribute('aria-busy','true');this.time.delayedCall(reducedMotion()?1:1500,()=>{this.moving=false;this.finish();});}
                else {
                    this.message = this.t('要六件全裝好、兩邊重量一樣，而且易碎箱在左台。', 'Load all six, balance the weights and put the fragile bag on the left.');
                    this.render();
                    const lift=this.root?.querySelector<HTMLElement>('.lift-machine');if(lift)animateElement(lift,[{translate:'0 0'},{translate:'-5px 0',offset:.25},{translate:'4px 0',offset:.65},{translate:'0 0'}],300);
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
        },piece=>{this.state.parcels=placeGift(this.state.parcels,piece);this.selectedItem=undefined;this.message=this.t('放好手信！','Gift placed!');this.dataIn.feedback.play('place');update();reactGuests(this.root,'pleased');});
    }
    private finish() {
        if(this.won||navigationBusy())return;
        if(this.dataIn.episode==='group-photo'){
            if(!photoSolved(this.state.photo))return;
            this.dataIn.save={...this.dataIn.save,photos:{...this.dataIn.save.photos,party:{order:[...this.state.photo.order],poses:{...this.state.photo.poses}}}};
        }
        const result=completeEpisode(this.dataIn.save,this.dataIn.episode);this.dataIn.save=result.save;this.reward=result.reward;
        this.storageFailed=!writeSave(result.save)||this.storageFailed;this.won=true;this.moving=false;
        this.message=this.storageFailed?this.t('未能儲存，只限本次遊玩。','Not saved · This session only.'):this.t('首次完成獎勵已儲存；重玩唔會重複派獎。','First-completion reward saved. Replays do not award coins again.');
        if(!this.reward)this.dataIn.feedback.play('success');this.persist();
        navigate(`victory:${this.dataIn.episode}`,()=>{this.render();this.rewardFx?.();this.rewardFx=celebrateReward(this.reward,this.dataIn.save.coins,this.dataIn.locale,()=>{this.dataIn.feedback.play('harvest');void this.dataIn.feedback.pulse('purchase');});});
    }
    private language() { this.modal?.(); this.modal = showDetails({ kind: 'language', title: this.t('語言', 'Language'), eyebrow: '', close: this.t('返回', 'Back'), sections: [], content: languageContent(this.dataIn.locale, locale => { this.modal?.(); this.modal = undefined; this.dataIn.locale = locale; saveLocale(locale); this.render(); }) }, () => { this.modal = undefined; }); }
    private settings() { this.modal?.(); this.modal = showDetails({ kind: 'settings', title: this.t('設定', 'Settings'), eyebrow: '', close: this.t('返回', 'Back'), sections: [], content: settingsContent(this.dataIn.locale, this.dataIn.feedback.preferences, p => { this.dataIn.feedback.setPreferences(p); return savePreferences(p); }, () => this.dataIn.feedback.play('place'), () => this.language()) }, () => { this.modal = undefined; }); }
}
