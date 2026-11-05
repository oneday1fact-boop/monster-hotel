import Phaser from 'phaser';
import { evidenceIds, accusation, initialFurniture, moveFurniture, luggagePath, routeWalls, emptyDream, dreamAction, type EpisodeId, type EvidenceId, type DreamState } from '../domain/episodes';
import { completeEpisode } from '../domain/campaign';
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
type Data = {
    episode: EpisodeId;
    locale: Locale;
    save: Save;
    feedback: Feedback;
    onExit(save: Save, locale: Locale, destination?: 'lobby' | 'map' | 'next'): void;
};
type Draft = {
    clues: EvidenceId[];
    furniture: number[];
    dream: DreamState;
};
const fresh = (): Draft => ({ clues: [], furniture: [...initialFurniture], dream: emptyDream() });
export class EpisodeScene extends Phaser.Scene {
    private dataIn!: Data;
    private state = fresh();
    private root?: HTMLElement;
    private modal?: () => void;
    private message = '';
    private won = false;
    private reward = 0;
    private selected?: number;
    private moving = false;
    private storageFailed = false;
    private dimensions = '';
    constructor() { super('episode'); }
    init(data: Data) { this.dataIn = data; this.state = fresh(); this.message = ''; this.won = false; this.reward = 0; this.selected = undefined; this.moving = false; this.storageFailed = false; this.dimensions = ''; try {
        const d = JSON.parse(localStorage.getItem(this.key) ?? 'null');
        if (d) {
            const f = d.furniture;
            if (Array.isArray(f) && f.length === 3 && new Set(f).size === 3 && f.every((n: unknown) => Number.isInteger(n) && Number(n) > 0 && Number(n) < 12 && !routeWalls.some(w => w === n)))
                this.state.furniture = f;
            if (Array.isArray(d.clues))
                this.state.clues = [...new Set<EvidenceId>(d.clues.filter((x: EvidenceId) => evidenceIds.includes(x)))];
            const s = d.dream;
            if (s && ['real', 'dream'].includes(s.world) && ['seed', 'grown', 'key', 'open'].every(k => typeof s[k] === 'boolean') && (!s.grown || s.seed) && (!s.key || s.grown) && (!s.open || s.key))
                this.state.dream = s;
        }
    }
    catch { /* Use a fresh puzzle if storage is unavailable or corrupt. */ } }
    private get key() { return `midnight-check-in.episode.${this.dataIn.episode}.v1`; }
    private get en() { return this.dataIn.locale === 'en'; }
    private t(zh: string, en: string) { return this.en ? en : zh; }
    create() { this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.root?.remove(); this.modal?.(); this.time.removeAllEvents(); }); this.render(); }
    update() { const d = `${this.scale.width}:${this.scale.height}`; if (d !== this.dimensions) {
        this.dimensions = d;
        this.paint();
    } const m = viewportMetrics(this.scale.width, this.scale.height); for (const o of this.children.list)
        if (o.getData('viewportAspect')) {
            const a = o as Phaser.GameObjects.Container;
            let s = a.getData('baseScale');
            if (!s) {
                s = { x: a.scaleX, y: a.scaleY };
                a.setData('baseScale', s);
            }
            a.setScale(s.x * m.aspectX, s.y * m.aspectY);
        } }
    private persist() { try {
        localStorage.setItem(this.key, JSON.stringify(this.state));
    }
    catch {
        this.storageFailed = true;
    } }
    private paint() {
        this.tweens.killAll();
        this.children.removeAll(true);
        const m = viewportMetrics(this.scale.width, this.scale.height);
        this.cameras.main.setViewport(0, 0, this.scale.width, this.scale.height).setOrigin(0, 0).setScroll(0, 0).setZoom(m.x, m.y);
        const id = this.dataIn.episode;
        const theme = id === 'dream-door' ? (this.state.dream.world === 'dream' ? 'night' : 'morning') : id === 'luggage-run' ? 'autumn' : 'morning';
        drawReception(this, this.dataIn.save, false, theme);
        if (id !== 'luggage-run') {
            const key = id === 'cake-case' ? 'room-hearth' : this.state.dream.world === 'dream' ? 'room-elegant' : 'room-elegant-morning';
            const texture = this.textures.get(key), source = texture.source[0], frame = `episode-${Math.round(m.x / m.y * 10000)}`;
            if (!texture.has(frame)) {
                const crop = proportionalCrop(source.width, source.height, 510 * m.x, 310 * m.y);
                texture.add(frame, 0, Math.floor(crop.x), Math.floor(crop.y), Math.floor(crop.width), Math.floor(crop.height));
            }
            this.add.image(267, 254, key, frame).setDisplaySize(510, 310);
        }
        const guests = id === 'cake-case' ? [{ id: 'rollo', kind: 'mummy' as const, requirement: 'dry' as const }, { id: 'ember', kind: 'lantern' as const, requirement: 'warm' as const }] : id === 'luggage-run' ? [{ id: 'yuzu', kind: 'fox' as const, requirement: 'dry' as const }] : [{ id: 'nemu', kind: 'baku' as const, requirement: 'quiet' as const }];
        if (id !== 'luggage-run' || this.won)
            guests.forEach((g, i) => drawMonster(this, id === 'luggage-run' ? 267 : id === 'dream-door' ? 265 : 130 + i * 235, id === 'luggage-run' ? 300 : id === 'dream-door' ? 170 : 345, { ...g, color: 0xffddaa }, 'room').setScale(.85).setData('viewportAspect', true));
        if (id === 'cake-case' && this.won)
            this.add.image(310, 250, 'episode-props', 'cake').setDisplaySize(110, 125);
        if (id === 'cake-case')
            this.add.image(445, 263, 'decor-more', 'tea-corner').setDisplaySize(90, 98);
        if (id === 'dream-door' && this.state.dream.seed)
            this.add.image(300, this.state.dream.grown ? 200 : 290, 'episode-props', 'vine').setDisplaySize(this.state.dream.grown ? 120 : 45, this.state.dream.grown ? 185 : 70);
    }
    private button(label: string, action: () => void, primary = false) { const b = document.createElement('button'); b.className = primary ? 'game-primary-button' : 'game-secondary-button'; b.textContent = label; b.onclick = () => { if (this.moving)
        return; this.dataIn.feedback.play('tap'); action(); }; return b; }
    private exit(destination: 'lobby' | 'map' | 'next' = 'lobby') { if (this.moving)
        return; this.persist(); this.root?.remove(); this.modal?.(); this.scene.stop(); this.dataIn.onExit(this.dataIn.save, this.dataIn.locale, destination); }
    private render() {
        this.root?.remove();
        this.paint();
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
        layout.className = 'episode-layout';
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
            finish.append(Object.assign(document.createElement('h2'), { textContent: this.t('事件解決！', 'Case closed!') }), Object.assign(document.createElement('p'), { textContent: copy.ending }), Object.assign(document.createElement('strong'), { textContent: `+${this.reward} ${this.t('金幣', 'coins')}` }), this.button(this.t('下一關', 'Next challenge'), () => this.exit('next'), true), this.button(this.t('再玩本關', 'Replay'), () => { this.state = fresh(); this.won = false; this.message = ''; this.persist(); this.render(); }));
            panel.replaceChildren(finish);
        }
        else if (this.dataIn.episode === 'cake-case')
            this.detective(stage, panel);
        else if (this.dataIn.episode === 'luggage-run')
            this.routing(stage, panel);
        else
            this.dream(stage, panel);
        const footer = document.createElement('footer');
        footer.className = 'episode-footer';
        const status = document.createElement('p');
        status.setAttribute('role', 'status');
        status.textContent = this.message || (this.storageFailed ? this.t('未能儲存，只限本次遊玩。', 'Not saved · This session only.') : this.t('可以慢慢諗，唔使鬥快。', 'Take your time. There is no timer.'));
        footer.append(status, this.button(this.t('重新開始', 'Start over'), () => { this.state = fresh(); this.won = false; this.selected = undefined; this.message = ''; this.persist(); this.render(); }));
        root.append(footer);
        document.body.append(root);
    }
    private detective(stage: HTMLElement, panel: HTMLElement) { const descriptions = this.en ? ['Broad bandage prints lead towards the basement.', 'Cool icing on a cloth: the cake was moved, not eaten.', 'A ribbon on Rollo’s trolley matches the cake box.'] : ['繃帶腳印一路通去地下室。', '布上有完整糖霜：蛋糕被搬走，唔係被食咗。', '卷卷茶車上嘅絲帶，同蛋糕盒一樣。']; const names = this.en ? ['Inspect footprints', 'Inspect icing', 'Inspect trolley'] : ['調查地上腳印', '調查糖霜', '調查茶車絲帶']; evidenceIds.forEach((id, i) => { const b = this.button((this.state.clues.includes(id) ? '✓ ' : '') + names[i], () => { if (!this.state.clues.includes(id))
        this.state.clues.push(id); this.message = descriptions[i]; this.persist(); this.render(); }); b.dataset.evidence = id; b.classList.add('evidence-spot'); b.style.left = `${5 + i * 30}%`; b.style.top = '5%'; stage.append(b); }); const clues = document.createElement('div'); clues.className = 'evidence-list'; evidenceIds.forEach((id, i) => { const p = document.createElement('p'); p.textContent = this.state.clues.includes(id) ? descriptions[i] : this.t(`線索 ${i + 1}：未調查`, `Clue ${i + 1}: not inspected`); clues.append(p); }); panel.append(clues); const question = document.createElement('strong'); question.textContent = this.t('邊位搬走咗蛋糕？', 'Who moved the cake?'); panel.append(question); const suspects = document.createElement('div'); suspects.className = 'episode-suspects'; for (const [id, zh, en] of [['luno', '月毛', 'Luno'], ['rollo', '卷卷', 'Rollo'], ['yuzu', '小柚', 'Yuzu']]) {
        const b = this.button(this.t(zh, en), () => { if (accusation(this.state.clues, id))
            this.finish();
        else {
            this.message = this.t('腳印同絲帶指向另一位住客，再比較證據。', 'The prints and ribbon point to someone else. Compare the evidence.');
            this.render();
        } });
        b.dataset.suspect = id;
        b.disabled = this.state.clues.length < 3;
        suspects.append(b);
    } panel.append(suspects); }
    private routing(stage: HTMLElement, panel: HTMLElement) { const board = document.createElement('div'); board.className = 'luggage-board'; for (let i = 0; i < 12; i++) {
        const furniture = this.state.furniture.includes(i), wall = routeWalls.some(x => x === i);
        const b = this.button(wall ? this.t('柱', 'Pillar') : i === 0 ? this.t('旅行箱', 'Suitcase') : i === 11 ? this.t('小柚', 'Yuzu') : furniture ? this.t('搬家具', 'Move') : this.t('空格', 'Empty'), () => { if (furniture) {
            this.selected = i;
            this.message = this.t('再點相鄰空格搬過去。', 'Choose an adjacent empty tile.');
        }
        else if (this.selected !== undefined) {
            const next = moveFurniture(this.state.furniture, this.selected, i);
            const moved = next.some((n, k) => n !== this.state.furniture[k]);
            this.state.furniture = next;
            this.message = moved ? this.t('家具搬好！可以再移動，或者試行路線。', 'Moved! Adjust more furniture or try the route.') : this.t('只可以搬去上下左右相鄰嘅空格。', 'Move only to an empty tile directly beside the furniture.');
            if (moved)
                this.selected = undefined;
            this.persist();
        } this.render(); });
        b.dataset.tile = String(i);
        b.className = `luggage-tile ${wall ? 'is-wall' : ''} ${furniture ? 'is-furniture' : ''} ${i === 0 ? 'is-luggage' : ''} ${i === 11 ? 'is-goal' : ''} ${this.selected === i ? 'is-selected' : ''}`;
        b.disabled = wall;
        board.append(b);
    } stage.append(board); const note = document.createElement('p'); note.textContent = this.t('柱唔可以搬。箱只會沿上下左右空格走；你可以無限次調整。', 'Pillars stay put. The suitcase follows empty tiles horizontally or vertically. Retry freely.'); const go = this.button(this.t('出發！', 'Go!'), () => { const path = luggagePath(this.state.furniture); if (!path.length) {
        this.message = this.t('入口被家具阻住，先幫旅行箱開路。', 'Furniture blocks the route. Clear a path first.');
        this.render();
        return;
    } this.moving = true; this.game.canvas.setAttribute('aria-busy', 'true'); this.root!.querySelectorAll('button').forEach(b => b.disabled = true); const traveler = document.createElement('div'); traveler.className = 'luggage-traveler'; board.classList.add('is-running'); board.append(traveler); path.forEach((at, index) => this.time.delayedCall(reducedMotion() ? index : index * 330, () => { const tile = board.querySelector<HTMLElement>(`[data-tile="${at}"]`)!; tile.classList.add('route-visited'); traveler.style.width = `${tile.clientWidth * .7}px`; traveler.style.height = `${tile.clientHeight * .75}px`; traveler.style.transition = index && !reducedMotion() ? 'transform 300ms linear' : 'none'; traveler.style.transform = `translate(${tile.offsetLeft + tile.clientWidth * .15}px,${tile.offsetTop + tile.clientHeight * .08}px)`; if (index === path.length - 1)
        this.time.delayedCall(reducedMotion() ? 1 : 340, () => { this.moving = false; this.finish(); }); })); }, true); go.dataset.action = 'send-luggage'; panel.append(note, go); }
    private dream(stage: HTMLElement, panel: HTMLElement) { const s = this.state.dream; const world = document.createElement('strong'); world.className = 'dream-world'; world.textContent = this.t(s.world === 'real' ? '而家係：現實清晨' : '而家係：夢境夜晚', s.world === 'real' ? 'Now: waking morning' : 'Now: dream night'); const toggle = this.button(this.t(s.world === 'real' ? '入夢境' : '返現實', s.world === 'real' ? 'Enter dream' : 'Wake up'), () => { this.state.dream = dreamAction(s, 'switch'); this.message = this.t('留意同一個窗台有咩變化。', 'Notice what changed on the same windowsill.'); this.persist(); this.render(); }, true); toggle.dataset.action = 'switch-world'; panel.append(world, toggle); const actions = s.world === 'real' ? [['seed', s.seed ? this.t('已種下種子', 'Seed planted') : this.t('種下種子', 'Plant seed')], ['key', s.key ? this.t('已取得鎖匙', 'Key collected') : this.t('攀藤取鎖匙', 'Climb for key')]] : [['water', s.grown ? this.t('藤蔓已長高', 'Vine has grown') : this.t('用夢之雨澆水', 'Water with dream rain')], ['door', this.t('用鎖匙開夢境門', 'Unlock dream door')]]; const objects = document.createElement('div'); objects.className = 'dream-objects'; for (const [action, label] of actions) {
        const b = this.button(label, () => { const next = dreamAction(s, action as 'seed' | 'key' | 'water' | 'door'); const changed = JSON.stringify(next) !== JSON.stringify(s); this.state.dream = next; this.message = changed ? this.t('成功！切換時段，睇吓另一邊有咩變化。', 'It worked! Switch worlds to see what changed.') : this.t(action === 'key' ? '藤蔓未夠高，去夢境幫佢澆水。' : action === 'door' ? '仲未有鎖匙，返現實攀藤去拎。' : '先返現實種下種子。', action === 'key' ? 'The vine is too short. Water it in the dream.' : action === 'door' ? 'You need the key. Climb the vine in reality.' : 'Plant a seed in reality first.'); this.persist(); if (next.open)
            this.finish();
        else
            this.render(); });
        b.dataset.dreamAction = action;
        b.disabled = (action === 'seed' && s.seed) || (action === 'water' && s.grown) || (action === 'key' && s.key);
        b.classList.add(`dream-object`, `dream-object--${action}`);
        objects.append(b);
    } stage.append(objects); const progress = document.createElement('p'); progress.className = 'dream-progress'; progress.textContent = [this.t('種子', 'Seed'), this.t('藤蔓', 'Vine'), this.t('鎖匙', 'Key')].map((name, i) => `${[s.seed, s.grown, s.key][i] ? '✓' : '○'} ${name}`).join(' → '); panel.append(progress); }
    private finish() { const result = completeEpisode(this.dataIn.save, this.dataIn.episode); this.dataIn.save = result.save; this.reward = result.reward; this.storageFailed = !writeSave(result.save) || this.storageFailed; this.won = true; this.moving = false; this.message = this.storageFailed ? this.t('未能儲存，只限本次遊玩。', 'Not saved · This session only.') : this.t('首次完成獎勵已儲存；重玩唔會重複派獎。', 'First-completion reward saved. Replays do not award coins again.'); this.dataIn.feedback.play('purchase'); this.persist(); this.render(); }
    private language() { this.modal?.(); this.modal = showDetails({ kind: 'language', title: this.t('語言', 'Language'), eyebrow: '', close: this.t('返回', 'Back'), sections: [], content: languageContent(this.dataIn.locale, locale => { this.modal?.(); this.modal = undefined; this.dataIn.locale = locale; saveLocale(locale); this.render(); }) }, () => { this.modal = undefined; }); }
    private settings() { this.modal?.(); this.modal = showDetails({ kind: 'settings', title: this.t('設定', 'Settings'), eyebrow: '', close: this.t('返回', 'Back'), sections: [], content: settingsContent(this.dataIn.locale, this.dataIn.feedback.preferences, p => { this.dataIn.feedback.setPreferences(p); return savePreferences(p); }, () => this.dataIn.feedback.play('place'), () => this.language()) }, () => { this.modal = undefined; }); }
}
