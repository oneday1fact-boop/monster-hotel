import Phaser from 'phaser';
import { place, roomConditions, type Guest, type Room } from '../domain/puzzle';
import { effectiveStoryLevel, emptyStory, hasNoiseConflict, putTool, settleStory, chapterBonds, storyOutcome, storyUnlocked, storyLevel, storyValidation, type StoryChoice, type StoryDraft, type Tool } from '../domain/storyNight';
import { readSave, writeSave, type Save } from '../platform/save';
import { readStoryDraft, writeStoryDraft } from '../platform/storyNight';
import { savePreferences } from '../platform/preferences';
import type { Feedback } from '../platform/feedback';
import { characters, conditions, saveLocale, type Locale } from '../i18n/catalog';
import { hotelUI } from '../i18n/hotel';
import { chapterLevels, chapterPairs, type ChapterId } from '../domain/storyChapters';
import { drawRoomDecorations } from './roomDecor';
import { seasonCinema } from './seasonCinema';
import { chapterCinema } from './chapterCinema';
import { chapterUI } from '../i18n/storyNight';
import { reducedMotion } from './art';
import { drawMonster } from './drawMonster';
import { chapterAmbience } from '../domain/ambience';
import { drawReception, receptionFrame } from './reception';
import { proportionalCrop, viewportMetrics } from './viewport';
import { displayDensity } from './display';
import { roomStyle } from './layout';
import { createStoryHUD } from './storyHud';
import { drawStorySupplies, drawToyBasket, celebrate } from './storyProps';
import { storyCinema } from './storyCinema';
import { showDetails } from './details';
import { settingsContent, languageContent } from './hotelMenus';

interface StoryData { chapter?: ChapterId; locale: Locale; feedback: Feedback; save?: Save; onExit(save: Save, locale: Locale, destination?:'lobby'|'map'|'next'): void }
interface Panel { x: number; y: number; width: number; height: number }
const queue = [88, 210, 332, 454];
export class StoryScene extends Phaser.Scene {
  private chapter: ChapterId = 1;
  private drafts: Partial<Record<ChapterId, StoryDraft>> = {};
  private locale!: Locale; private feedback!: Feedback; private save!: Save; private state!: StoryDraft;
  private ui?: ReturnType<typeof createStoryHUD>; private cinema?: ReturnType<typeof storyCinema>;
  private onExit!: StoryData['onExit']; private selected?: string; private tool?: Tool; private focus?: string;
  private choice?: StoryChoice; private reward = 0; private busy = false; private width = 0; private height = 0;
  private modal?: () => void; private storageFailed = false;
  private get t() { return chapterUI(this.locale, this.chapter); }
  constructor() { super('story'); }
  init(data: StoryData) {
    this.locale = data.locale; this.feedback = data.feedback; this.onExit = data.onExit; this.save = data.save ?? readSave();
    this.chapter = data.chapter && storyUnlocked(this.save, data.chapter) ? data.chapter : 1;
    this.drafts = {}; this.state = readStoryDraft(this.chapter); this.selected = undefined; this.tool = undefined; this.focus = undefined; this.choice = undefined;
    this.reward = 0; this.busy = false; this.width = 0; this.height = 0; this.storageFailed = false;
    if (this.state.phase === 'settled' && !storyOutcome(this.save, this.chapter)) this.state = emptyStory();
    if (storyOutcome(this.save, this.chapter) && !this.state.introduced) this.state.phase = 'settled';
  }
  create() {
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.ui?.destroy(); this.modal?.(); this.input.removeAllListeners(); });
    this.render();
  }
  update() {
    const m = viewportMetrics(this.scale.width, this.scale.height);
    if (this.width !== this.scale.width || this.height !== this.scale.height) {
      this.width = this.scale.width; this.height = this.scale.height;
      this.cameras.main.setViewport(0, 0, this.width, this.height).setOrigin(0, 0).setScroll(0, 0).setZoom(m.x, m.y);
      for (const obj of this.children.list) {
        const data = obj.getData('storyPanel') as { key: string; width: number; height: number } | undefined;
        if (data && obj instanceof Phaser.GameObjects.Image) obj.setFrame(this.frame(data.key, data.width, data.height));
        else if (obj instanceof Phaser.GameObjects.Image && obj.getData('receptionPanel')) obj.setFrame(receptionFrame(this, obj.getData('receptionKey')));
      }
    }
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text) && !(object instanceof Phaser.GameObjects.Arc) && !object.getData('viewportAspect')) continue;
      const obj = object as Phaser.GameObjects.Container; let base = obj.getData('storyScale') as { x: number; y: number } | undefined;
      if (!base) { base = { x: obj.scaleX, y: obj.scaleY }; obj.setData('storyScale', base); }
      obj.setScale(base.x * m.aspectX, base.y * m.aspectY);
    }
  }
  private text(x: number, y: number, label: string, size = 17, color = '#fff0cc') {
    return this.add.text(x, y, label, { fontFamily: 'GameNumbers, GameRounded,"Noto Sans TC",sans-serif', fontSize: size, color, stroke: '#2d2039', strokeThickness: 3, align: 'center' }).setResolution(displayDensity()).setOrigin(.5);
  }
  private frame(key: string, width: number, height: number) {
    const texture = this.textures.get(key); const source = texture.source[0]; const m = viewportMetrics(this.scale.width, this.scale.height);
    const name = `story-${Math.round(width * m.x / (height * m.y) * 10000)}`;
    if (!texture.has(name)) { const c = proportionalCrop(source.width, source.height, width * m.x, height * m.y); texture.add(name, 0, Math.floor(c.x), Math.floor(c.y), Math.floor(c.width), Math.floor(c.height)); }
    return name;
  }
  private panel(room: Room): Panel {
    return this.focus ? { x: 422, y: 228, width: 844, height: 344 } : { x: room.position === 1 ? 203 : 641, y: room.floor === 1 ? 136 : 300, width: 406, height: 160 };
  }
  private persist() { this.drafts[this.chapter] = this.state; this.storageFailed = !writeStoryDraft(this.state, this.chapter) || this.storageFailed; }
  private setBusy(value: boolean) { this.busy = value; this.input.enabled = !value; this.ui?.busy(value); this.game.canvas.setAttribute('aria-busy', String(value)); }
  private render(arriving?: string) {
    this.ui?.destroy(); this.modal?.(); this.modal = undefined; this.tweens.killAll(); this.time.removeAllEvents(); this.children.removeAll(true);
    this.cinema = undefined; this.choice = undefined; this.width = 0; this.height = 0;
    this.cameras.main.setBackgroundColor('#19152c'); document.documentElement.lang = this.locale;
    this.game.canvas.setAttribute('aria-label', `${this.t.title} · ${this.state.phase}`);
    this.ui = createStoryHUD(this.locale, this.state, this.selected, this.tool, this.focus, {
      chapters: () => this.book(), next: () => this.exit('next'), home: () => this.exit(), language: () => this.language(), settings: () => this.settings(),
      reset: () => { this.state = { ...emptyStory(), introduced: true }; this.selected = undefined; this.tool = undefined; this.persist(); this.render(); },
      ready: () => this.ready(), guest: id => this.selectGuest(id), tool: tool => { this.tool = tool; this.selected = undefined; this.render(); this.ui?.show(`${this.t[tool]} — ${this.t.selected}`); },
      room: id => this.roomAction(id), focus: id => { this.focus = id; this.render(); }, dropTool: (tool, x, y) => this.dropTool(tool, x, y),
      choice: choice => this.choose(choice), skip: () => { if (this.choice) this.finishEvent(this.choice); else this.cinema?.skipIntro(); },
      replay: () => { this.state={...emptyStory(),introduced:true};this.selected=undefined;this.tool=undefined;this.focus=undefined;this.persist();this.render(); },
    }, this.chapter);
    this.setBusy(false);
    if (this.state.phase === 'arranging') this.drawHotel(arriving);
    else if (this.state.phase === 'event') { drawReception(this, this.save, false, chapterAmbience(this.chapter)); this.setBusy(true); this.cinema = this.chapter === 1 ? storyCinema(this, () => this.setBusy(false)) : this.chapter <= 3 ? chapterCinema(this, this.chapter as 2|3, () => this.setBusy(false)) : seasonCinema(this, this.chapter as 4|5|6, () => this.setBusy(false)); }
    else this.drawEnding();
    if (this.storageFailed) this.ui.show(this.t.session);
    this.update();
  }
  private book() { this.exit('map'); }
  private language() {
    this.modal?.(); this.input.enabled = false; this.ui!.root.hidden = true;
    this.modal = showDetails({ kind: 'language', title: this.locale === 'en' ? 'Language' : '語言', eyebrow: '', close: hotelUI[this.locale].back, sections: [], content: languageContent(this.locale, locale => { this.locale = locale; saveLocale(locale); this.render(); }) }, () => { this.modal = undefined; this.ui!.root.hidden = false; this.input.enabled = !this.busy; });
  }
  private settings() {
    this.input.enabled = false; this.ui!.root.hidden = true; const t = hotelUI[this.locale];
    this.modal = showDetails({ kind: 'settings', title: t.settings, eyebrow: '', close: t.back, sections: [], content: settingsContent(this.locale, this.feedback.preferences, p => { this.feedback.setPreferences(p); return savePreferences(p); }, () => { this.feedback.play('place'); void this.feedback.pulse('place'); }, () => this.language()) }, () => { this.modal = undefined; this.ui!.root.hidden = false; this.input.enabled = !this.busy; });
  }
  private drawHotel(arriving?: string) {
    const level = effectiveStoryLevel(this.state.equipment, this.chapter);
    const waiting = level.guests.filter(g => !this.state.assignment[g.id]);
    const entering = !this.state.introduced && !reducedMotion() && !this.focus && waiting.length > 0;
    if (entering) this.setBusy(true);
    drawReception(this, this.save, false, chapterAmbience(this.chapter));
    this.add.rectangle(422, 218, 32, 324, 0x36263e);
    const selection = this.add.ellipse(0, 0, 100, 96).setStrokeStyle(3, 0xffe1a0).setVisible(false).setData('viewportAspect', true).setDepth(20);
    const bind = (actor: Phaser.GameObjects.Container, guest: Guest) => {
      actor.setInteractive({ useHandCursor: true }).setData('guest', guest.id); this.input.setDraggable(actor);
      actor.on('pointerdown', () => { this.selected = guest.id; this.tool = undefined; selection.setPosition(actor.x, actor.y).setVisible(true); this.ui?.root.querySelectorAll<HTMLElement>('[data-guest]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.guest === guest.id))); this.ui?.show(`${characters[this.locale][guest.kind].name}：${this.t.need[guest.requirement]}`); });
      if (guest.id === this.selected) selection.setPosition(actor.x, actor.y).setVisible(true);
    };
    for (const room of level.rooms.filter(r => !this.focus || r.id === this.focus)) {
      const p = this.panel(room); const style = roomStyle(room); const theme = chapterAmbience(this.chapter); const key = style === 'elegant' && theme !== 'night' ? `room-elegant-${theme}` : style === 'linen' && (theme === 'autumn' || theme === 'winter') ? `room-linen-${theme}` : `room-${style}`;
      this.add.image(p.x, p.y, key, this.frame(key, p.width, p.height)).setDisplaySize(p.width, p.height).setData('storyPanel', { key, width: p.width, height: p.height });
      drawRoomDecorations(this,this.save,p);
      this.add.zone(p.x, p.y, p.width, p.height).setRectangleDropZone(p.width, p.height).setData('room', room.id).on('pointerdown', () => this.roomAction(room.id));
      const icons = roomConditions(room); icons.forEach((condition, i) => {
        this.add.rectangle(p.x - p.width / 2 + 25 + i * 27, p.y + p.height / 2 - 14, 24, 24, 0x2b1c34, .8);
        this.add.image(p.x - p.width / 2 + 25 + i * 27, p.y + p.height / 2 - 14, `condition-${condition}`).setDisplaySize(21, 21).setData('viewportAspect', true);
      });
      drawStorySupplies(this, room.id, this.state.equipment, p.x - (this.focus ? 170 : 77), p.y + 12, this.focus ? 1.35 : .72);
      const guest = level.guests.find(g => this.state.assignment[g.id] === room.id);
      if (guest) {
        const x = p.x + (this.focus ? 140 : 94); const y = p.y + 13;
        const actor = drawMonster(this, x, y, guest, 'room').setScale(this.focus ? 1.5 : 1.02).setData('viewportAspect', true); bind(actor, guest);
        let happy = roomConditions(room).includes(guest.requirement);
        if (guest.id === 'dou' && hasNoiseConflict(this.state.assignment, this.state.equipment)) happy = false;
        this.text(x - (this.focus ? 95 : 62), y - 21, happy ? '♥' : '?', this.focus ? 28 : 20, happy ? '#d5f0bd' : '#ffba97');
        if (guest.id === arriving && !reducedMotion() && !this.focus) {
          const start = queue[level.guests.findIndex(g => g.id === guest.id)]; actor.setPosition(start, 402).setDepth(10); (actor.getData('pauseActivity') as (v: boolean) => void)(true); this.setBusy(true);
          let last = 0;
          this.tweens.chain({ targets: actor, tweens: [{ x: 422, y: 350, duration: 260, ease: 'Sine.easeInOut' }, { x: 422, y, duration: 330, ease: 'Sine.easeInOut' }, { x, y, duration: 320, ease: 'Sine.easeInOut' }], onUpdate: () => {
            if (this.time.now - last > 130) { last = this.time.now; const step = this.add.ellipse(actor.x, actor.y + 25, 10, 4, 0xf7d694, .55); this.tweens.add({ targets: step, alpha: 0, duration: 600, onComplete: () => step.destroy() }); }
          }, onComplete: () => { actor.setDepth(0); (actor.getData('pauseActivity') as (v: boolean) => void)(false); celebrate(this, x, y - 25); this.setBusy(false); } });
        }
      }
    }
    if (!this.focus && !reducedMotion() && hasNoiseConflict(this.state.assignment, this.state.equipment)) {
      const wolfRoom = level.rooms.find(r => r.id === this.state.assignment.luno)!; const douRoom = level.rooms.find(r => r.id === this.state.assignment.dou)!;
      const p = this.panel(wolfRoom); const direction = douRoom.position! > wolfRoom.position! ? 1 : -1;
      for (let i = 0; i < 3; i++) {
        const wave = this.add.arc(p.x + direction * 175, p.y, 15 + i * 7, direction > 0 ? -50 : 130, direction > 0 ? 50 : 230, false, 0xffe3a0, 0).setStrokeStyle(2, 0xffe3a0, .7).setData('viewportAspect', true);
        this.tweens.add({ targets: wave, x: wave.x + direction * 75, alpha: 0, duration: 1300, delay: i * 170, repeat: -1, ease: 'Sine.easeOut' });
      }
    }
    if (!this.focus) {
      // The illustrated reception floor remains visible behind the waiting guests.
      level.guests.forEach((guest, i) => {
        if (!this.state.assignment[guest.id]) { const actor = drawMonster(this, queue[i], 402, guest).setScale(.68).setData('viewportAspect', true); bind(actor, guest); if (entering) { actor.setX(30).setAlpha(0); this.tweens.add({ targets: actor, x: queue[i], alpha: 1, duration: 550, delay: i * 160, ease: 'Sine.easeInOut', onComplete: () => { if (guest.id === waiting.at(-1)?.id) this.setBusy(false); } }); } }
        else this.text(queue[i], 402, '✓', 24, '#d3e9bc');
      });
    }
    this.input.removeAllListeners('drag'); this.input.removeAllListeners('drop'); this.input.removeAllListeners('dragend');
    this.input.on('drag', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container, x: number, y: number) => obj.setPosition(x, y).setDepth(15));
    this.input.on('drop', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container, target: Phaser.GameObjects.Zone) => this.assign(obj.getData('guest'), target.getData('room')));
    this.input.on('dragend', (_p: Phaser.Input.Pointer, _o: Phaser.GameObjects.Container, dropped: boolean) => { if (!dropped) this.render(); });
    if (!this.state.introduced) { this.state.introduced = true; this.persist(); this.ui!.show(this.t.intro); }
  }
  private selectGuest(id: string) {
    if (this.busy) return; this.selected = id; this.tool = undefined; this.feedback.play('tap'); this.render();
    const g = chapterLevels[this.chapter].guests.find(g => g.id === id)!; this.ui?.show(`${characters[this.locale][g.kind].name}：${this.t.need[g.requirement]}`);
  }
  private assign(id: string, room: string) {
    if (this.busy) return; this.state.assignment = place(this.state.assignment, id, room); this.selected = undefined; this.feedback.play('place'); void this.feedback.pulse('place'); this.persist(); this.render(id);
  }
  private roomAction(id: string) {
    if (this.busy) return;
    if (this.tool) { this.state.equipment = putTool(this.state.equipment, this.tool, id); this.tool = undefined; this.feedback.play('place'); this.persist(); this.render(); }
    else if (this.selected) this.assign(this.selected, id);
    else { const room = effectiveStoryLevel(this.state.equipment, this.chapter).rooms.find(r => r.id === id)!; this.ui?.show(`${id} · ${roomConditions(room).map(c => conditions[this.locale][c].name).join(' · ')}`); }
  }
  private dropTool(tool: Tool, clientX: number, clientY: number) {
    if (this.busy) return; const box = this.game.canvas.getBoundingClientRect(); const x = (clientX - box.x) / box.width * 844; const y = (clientY - box.y) / box.height * 480;
    const room = chapterLevels[this.chapter].rooms.filter(r => !this.focus || r.id === this.focus).find(r => { const p = this.panel(r); return Math.abs(x - p.x) <= p.width / 2 && Math.abs(y - p.y) <= p.height / 2; });
    if (room) { this.tool = tool; this.selected = undefined; this.roomAction(room.id); }
  }
  private ready() {
    const result = storyValidation(this.state.assignment, this.state.equipment, this.chapter);
    if (!result.valid) { this.feedback.play('error'); this.ui?.show(result.reason === 'noise' ? this.t.noise : result.reason === 'incomplete' ? this.t.incomplete : result.reason === 'path' || result.reason === 'buddy' ? this.t.rule : this.t.mismatch); return; }
    this.feedback.play('success'); this.state.phase = 'event'; this.focus = undefined; this.persist(); this.render();
  }
  private choose(choice: StoryChoice) {
    if (this.busy || this.state.phase !== 'event') return; this.cinema?.skipIntro(); this.choice = choice; this.setBusy(true); this.ui?.caption(choice === 'play' ? this.t.playing : this.t.joining);
    this.feedback.play('place'); this.cinema?.choose(choice, () => this.finishEvent(choice));
  }
  private finishEvent(choice: StoryChoice) {
    if (this.state.phase !== 'event') return;
    const settled = settleStory(this.save, choice, this.chapter); this.save = settled.save; this.reward = settled.reward;
    if (!writeSave(this.save)) this.storageFailed = true;
    this.state.phase = 'settled'; this.persist(); this.feedback.play('success'); void this.feedback.pulse('success'); this.render();
  }
  private drawEnding() {
    drawReception(this, this.save, false, chapterAmbience(this.chapter)); drawToyBasket(this, 246, 400, 1.2);
    const wolf = drawMonster(this, 150, 342, chapterLevels[this.chapter].guests.find(g => g.id === chapterPairs[this.chapter][0])!).setScale(1.05).setData('viewportAspect', true); (wolf.getData('setPose') as (p: number) => void)?.(3);
    const mummy = drawMonster(this, 345, 350, chapterLevels[this.chapter].guests.find(g => g.id === chapterPairs[this.chapter][1])!).setScale(1.05).setData('viewportAspect', true); (mummy.getData('setPose') as (p: number) => void)?.(3);
    this.ui?.ending(this.reward, chapterBonds(this.save, this.chapter), this.reward === 0); this.setBusy(false);
  }
  private exit(destination:'lobby'|'map'|'next'='lobby') {
    this.persist(); this.ui?.destroy(); this.ui = undefined; this.modal?.(); this.modal = undefined;
    const save = this.save; const locale = this.locale; this.scene.stop('story'); this.onExit(save, locale, destination);
  }
}
