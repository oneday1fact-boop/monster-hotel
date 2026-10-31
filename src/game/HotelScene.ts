import Phaser from 'phaser';
import { firstLevel, place, validate, type Assignment, type Guest, type Room, type Level } from '../domain/puzzle';
import { levels, levelTitle, isUnlocked } from '../domain/levels';
import { campaignUI, roomLabel, ruleText } from '../i18n/rules';
import { showNightSelection } from './nightSelection';
import { purchase, toggleDecoration } from '../domain/decorations';
import { hotelUI } from '../i18n/hotel';
import { shopContent, settingsContent } from './hotelMenus';
import { Feedback } from '../platform/feedback';
import { savePreferences } from '../platform/preferences';
import { getHint } from '../domain/hints';
import { ui, conditions, characters, readLocale, saveLocale, type Locale } from '../i18n/catalog';
import { showDetails, type Details } from './details';
import { viewportMetrics } from './viewport';
import { drawRoomLife } from './roomLife';
import { queueX, queueY, roomPoint, residentPoint, roomStyle, floorName } from './layout';
import { roomDesign, dollhouseUI } from '../i18n/dollhouse';
import { registerArt, portrait, roomPortrait, reducedMotion } from './art';
import { drawMonster } from './drawMonster';
import { readSave, complete, writeSave, type Save } from '../platform/save';

const C = { ink: 0x100e25, panel: 0x24203e, gold: 0xf2cc83, muted: '#b9b0ce', white: '#fff3df' };
export class HotelScene extends Phaser.Scene {
  private save!: Save;
  private viewportWidth = 0;
  private viewportHeight = 0;
  private feedback = new Feedback();
  private get ht() { return hotelUI[this.locale]; }
  private assignment: Assignment = {};
  private selected?: string;
  private message = '';
  private locale: Locale = readLocale();
  private screen: 'title' | 'lobby' | 'play' | 'win' | 'selection' = 'title';
  private hintStage = 0;
  private arriving?: string;
  private queueArrival = false;
  private level: Level = firstLevel;
  private get ct() { return campaignUI[this.locale]; }
  private dismissDetails?: () => void;
  private get t() { return ui[this.locale]; }
  constructor() { super('hotel'); }
  preload() {
    this.text(422, 230, this.locale === 'en' ? 'Lighting the hotel…' : '正在點亮旅館…', 24);
    this.load.image('guests-art', '/art/guests-cartoon.png');
    for (const style of ['elegant', 'linen', 'basement', 'hearth']) this.load.svg(`room-${style}`, `/art/rooms/${style}.svg`);
  }
  create() { registerArt(this); this.save = readSave(); this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.feedback.dispose(); this.dismissDetails?.(); }); this.title(); }
  update() {
    this.resizeViewport();
    const m = viewportMetrics(this.scale.width, this.scale.height);
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text) && !(object instanceof Phaser.GameObjects.Arc) && !object.getData('viewportAspect')) continue;
      const obj = object as Phaser.GameObjects.Text | Phaser.GameObjects.Container | Phaser.GameObjects.Arc;
      let base = obj.getData('viewportScale') as { x: number; y: number } | undefined;
      if (!base) { base = { x: obj.scaleX, y: obj.scaleY }; obj.setData('viewportScale', base); }
      obj.setScale(base.x * m.aspectX, base.y * m.aspectY);
    }
  }
  private resizeViewport() {
    const width = this.scale.width; const height = this.scale.height;
    if (width === this.viewportWidth && height === this.viewportHeight) return;
    this.viewportWidth = width; this.viewportHeight = height;
    const m = viewportMetrics(width, height);
    this.cameras.main.setViewport(0, 0, width, height).setOrigin(0, 0).setScroll(0, 0).setZoom(m.x, m.y);
  }
  private text(x: number, y: number, text: string, size = 20, color = C.white) {
    return this.add.text(x, y, text, { fontFamily: 'Georgia, "Noto Sans TC", serif', fontSize: size, color, align: 'center', lineSpacing: 6 }).setOrigin(.5);
  }
  private base(label: string) {
    this.dismissDetails?.(); this.dismissDetails = undefined;
    this.setBusy(false);
    this.tweens.killAll(); this.children.removeAll(true);
    this.resizeViewport();
    this.cameras.main.setBackgroundColor(C.ink);
    const g = this.add.graphics();
    g.fillStyle(0x191630).fillRoundedRect(12, 12, 820, 456, 28);
    for (let i = 0; i < 32; i++) { g.fillStyle(C.gold, .15 + (i % 3) * .12).fillCircle(25 + (i * 67) % 790, 35 + (i * 113) % 420, i % 2 + 1); }
    this.text(422, 22, this.t.brand, 12, '#f2cc83');
    this.text(422, 58, label, 29);
    this.text(650, 26, this.ht.settings, 13, '#f2cc83').setPadding(5).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.settings());
    document.documentElement.lang = this.locale;
    this.text(765, 26, this.locale === 'en' ? '繁體中文' : 'English', 13, '#f2cc83').setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.locale = this.locale === 'en' ? 'zh-Hant' : 'en'; saveLocale(this.locale); this.message = ''; this[this.screen]();
    });
  }
  private button(y: number, label: string, callback: () => void, width = 310, x = 422) {
    const bg = this.add.rectangle(x, y, width, 48, C.gold).setStrokeStyle(1, 0xffe7b5).setInteractive({ useHandCursor: true });
    this.text(x, y, label, 18, '#292039');
    bg.on('pointerdown', () => { this.feedback.play('tap'); callback(); });
  }
  private hotel(y: number) {
    const g = this.add.graphics();
    g.fillStyle(0x352b50).fillRoundedRect(72, y, 246, 235, 12);
    g.fillStyle(0x554064).fillTriangle(51, y + 12, 195, y - 72, 339, y + 12);
    g.lineStyle(2, C.gold, .6).strokeTriangle(51, y + 12, 195, y - 72, 339, y + 12);
    for (const x of [112, 174, 236]) for (const dy of [35, 102]) {
      g.fillStyle(0xf2cc83).fillRoundedRect(x, y + dy, 40, 48, { tl: 20, tr: 20, bl: 2, br: 2 });
      g.lineStyle(3, 0x56405d).lineBetween(x + 20, y + dy, x + 20, y + dy + 48);
    }
    if (this.save.equipped?.includes('velvet-rug')) {
      g.fillStyle(0x864068).fillRoundedRect(137, y + 225, 116, 32, 5);
      g.lineStyle(2, C.gold).strokeRoundedRect(143, y + 230, 104, 21, 3);
    }
    if (this.save.equipped?.includes('moon-lamps')) {
      for (const x of [58, 332]) {
        g.lineStyle(3, 0x8f6e72).lineBetween(x, y + 166, x, y + 230);
        g.fillStyle(C.gold, 0.15).fillCircle(x, y + 160, 21);
        g.fillStyle(C.gold).fillCircle(x, y + 160, 12);
        g.fillStyle(0x191630).fillCircle(x + 5, y + 156, 10);
      }
    }
    if (this.save.equipped?.includes('star-sign')) {
      const points = Array.from({ length: 10 }, (_, i) => {
        const angle = i * Math.PI / 5 - Math.PI / 2; const radius = i % 2 ? 9 : 20;
        return new Phaser.Geom.Point(195 + Math.cos(angle) * radius, y - 35 + Math.sin(angle) * radius);
      });
      g.fillStyle(C.gold).fillPoints(points, true);
      g.lineStyle(1, C.gold, 0.5).lineBetween(105, y + 5, 285, y + 5);
      for (const x of [115, 155, 195, 235, 275]) g.fillStyle(C.gold).fillCircle(x, y + 8, 3);
    }
    g.fillStyle(0x15132b).fillRoundedRect(166, y + 173, 58, 62, { tl: 29, tr: 29, bl: 0, br: 0 });
    this.text(195, y + 160, this.t.hotel, 13, '#f2cc83');
  }
  private title() {
    this.screen = 'title';
    this.base(this.t.title);
    this.text(422, 98, this.t.tagline, 15, C.muted);
    this.hotel(190);
    const moon = this.add.circle(300, 140, 25, C.gold);
    if (!reducedMotion()) this.tweens.add({ targets: moon, y: 130, alpha: .6, duration: 2200, yoyo: true, repeat: -1 });
    this.text(590, 215, this.t.promise, 26);
    this.button(330, this.t.open, () => this.lobby(), 310, 590);
    this.text(590, 385, this.t.adventure, 14, C.muted);
  }
  private lobby() {
    this.screen = 'lobby';
    this.base(this.t.welcome);
    this.text(422, 98, `${this.save.coins} ${this.t.coins}  ·  ${this.save.completed.length}/20 ${this.t.progress}`, 14, '#f2cc83');
    this.hotel(190);
    this.text(590, 180, this.t.arrivals, 26);
    this.text(590, 235, this.t.intro, 16, C.muted);
    this.button(325, this.ct.choose, () => this.selection(), 310, 590);
    this.button(390, this.ht.shop, () => this.shop(), 310, 590);
    this.text(590, 450, this.t.titleBack, 15, C.muted).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.title());
  }
  private selection() {
    this.screen = 'selection'; this.base(this.ct.levels); this.input.enabled = false;
    this.dismissDetails = showNightSelection(this.locale, this.save.completed, id => this.startNight(id), () => this.lobby(), () => {
      this.locale = this.locale === 'en' ? 'zh-Hant' : 'en'; saveLocale(this.locale); this.selection();
    });
  }
  private startNight(id: number) {
    if (!isUnlocked(id, this.save.completed)) return;
    const level = levels.find(l => l.id === id); if (!level) return;
    this.level = level; this.assignment = {}; this.message = ''; this.selected = undefined; this.hintStage = 0; this.queueArrival = true; this.play();
  }
  private monster(x: number, y: number, guest: Guest, activity: 'queue' | 'room' = 'queue') {
    return drawMonster(this, x, y, guest, activity).setData('viewportAspect', true);
  }

  private setBusy(busy: boolean) {
    this.input.enabled = !busy;
    this.game.canvas.setAttribute('aria-busy', String(busy));
  }
  private play() {
    this.screen = 'play';
    this.base(`${String(this.level.id).padStart(2, '0')} · ${levelTitle(this.level.id, this.locale)}`);
    this.text(422, 80, dollhouseUI[this.locale].instructions, 12, C.muted);
    const status = this.text(422, 96, this.message || this.t.ready, 12, '#f2cc83');
    this.text(74, 26, this.t.hint + ' ✦', 14, '#f2cc83').setInteractive({ useHandCursor: true }).on('pointerdown', () => this.hint());
    this.text(190, 26, this.ct.clues + ' ⓘ', 13, '#f2cc83').setInteractive({ useHandCursor: true }).on('pointerdown', () => this.clues());
    const frame = this.add.graphics();
    frame.fillStyle(0x574057).fillRoundedRect(34, 102, 776, 240, 9);
    frame.lineStyle(3, 0xb18a70).strokeRoundedRect(34, 102, 776, 240, 9);
    frame.fillStyle(0x3d2a43).fillRect(409, 106, 26, 232).fillRect(40, 216, 764, 12);
    frame.lineStyle(2, 0xb28c72);
    for (let y = 126; y < 337; y += 17) frame.lineBetween(413, y, 431, y - 10);
    frame.fillStyle(0x33273f).fillRoundedRect(100, 345, 666, 75, 15);
    frame.fillStyle(0x5a425c).fillRoundedRect(30, 348, 66, 67, 10);
    frame.lineStyle(2, C.gold, .5).strokeRoundedRect(43, 355, 40, 45, 16);
    this.text(63, 407, dollhouseUI[this.locale].waiting, 9, '#f2cc83');
    const selection = this.add.ellipse(0, 0, 76, 72).setStrokeStyle(2, C.gold, .8).setVisible(false).setDepth(5).setData('viewportAspect', true);
    const bindGuest = (avatar: Phaser.GameObjects.Container, guest: Guest) => {
      avatar.setInteractive({ useHandCursor: true }).setData('guest', guest.id); this.input.setDraggable(avatar);
      avatar.on('pointerdown', () => {
        this.selected = guest.id; selection.setPosition(avatar.x, avatar.y).setVisible(true);
        if (this.assignment[guest.id] && !reducedMotion()) {
          const heart = this.text(avatar.x, avatar.y - 30, '♥', 17, '#ef9bb4').setDepth(12);
          this.tweens.add({ targets: heart, y: avatar.y - 48, alpha: 0, duration: 650, onComplete: () => heart.destroy() });
        }
        status.setText(`${this.t.select} ${characters[this.locale][guest.kind].name} · ${conditions[this.locale][guest.requirement].name}`);
      });
      if (this.selected === guest.id) selection.setPosition(avatar.x, avatar.y).setVisible(true);
    };
    const entering = this.queueArrival && !reducedMotion(); this.queueArrival = false;
    if (entering) this.setBusy(true);
    for (const room of this.level.rooms) {
      const p = roomPoint(room); const style = roomStyle(room);
      this.add.rectangle(p.x, p.y, 362, 108, C.panel);
      if (this.textures.exists(`room-${style}`)) this.add.image(p.x, p.y, `room-${style}`).setDisplaySize(362, 108);
      drawRoomLife(this, room);
      this.add.rectangle(p.x, p.y - 43, 358, 22, 0x251c32, .75);
      this.add.rectangle(p.x - 73, p.y + 43, 212, 22, 0x251c32, .82);
      const drop = this.add.zone(p.x, p.y, 362, 108).setRectangleDropZone(362, 108).setData('room', room.id);
      drop.on('pointerdown', () => { if (this.selected) this.assign(this.selected, room.id); });
      this.text(p.x - 24, p.y - 43, `${room.id} · ${roomDesign[this.locale][style].name}`, 12, C.white);
      this.text(p.x - 73, p.y + 43, roomLabel(room, this.locale), 10, '#fff0cf');
      this.text(p.x + 158, p.y - 42, 'ⓘ', 18, '#f2cc83').setPadding(5).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.roomCard(room));
      const guest = this.level.guests.find(g => this.assignment[g.id] === room.id);
      if (guest) {
        const point = residentPoint(room); const actor = this.monster(point.x, point.y, guest, 'room').setScale(.6);
        bindGuest(actor, guest);
        if (this.arriving === guest.id && !reducedMotion()) {
          const index = this.level.guests.indexOf(guest); actor.setPosition(queueX[index], queueY).setDepth(10); this.setBusy(true);
          status.setText(dollhouseUI[this.locale].moving);
          this.tweens.chain({ targets: actor, tweens: [
            { x: 422, y: 349, duration: 160 }, { x: 422, y: point.y, duration: 200 }, { x: point.x, y: point.y, duration: 180 },
          ], onComplete: () => { actor.setDepth(0); this.setBusy(false); status.setText(this.t.ready); } });
        }
      }
    }
    this.arriving = undefined;
    this.level.guests.forEach((guest, i) => {
      const x = queueX[i]; const placed = !!this.assignment[guest.id];
      if (!placed) {
        this.add.ellipse(x, 404, 60, 7, 0x0a0817, .4);
        const avatar = this.monster(x, queueY, guest).setScale(.62); bindGuest(avatar, guest);
        if (entering) {
          avatar.setX(63).setAlpha(0);
          this.tweens.add({ targets: avatar, x, alpha: 1, duration: 450 + i * 80, delay: i * 150, ease: 'Sine.easeInOut', onComplete: () => { if (i === this.level.guests.length - 1) this.setBusy(false); } });
        }
      } else this.text(x, queueY, `✓ ${dollhouseUI[this.locale].arrived}`, 12, '#b8cfbc');
      const c = characters[this.locale][guest.kind];
      this.text(x, 412, `${c.name} · ${c.species} ⓘ`, 11, C.white).setPadding(2).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.guestCard(guest));
    });
    this.input.removeAllListeners('drag'); this.input.removeAllListeners('drop'); this.input.removeAllListeners('dragend');
    this.input.on('drag', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container, x: number, y: number) => { obj.setPosition(x, y); obj.setDepth(10); });
    this.input.on('drop', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container, target: Phaser.GameObjects.Zone) => this.assign(obj.getData('guest'), target.getData('room')));
    this.input.on('dragend', (_p: Phaser.Input.Pointer, _obj: Phaser.GameObjects.Container, dropped: boolean) => { if (!dropped) this.play(); });
    this.button(448, this.t.check, () => {
      const result = validate(this.level, this.assignment);
      if (result.valid) { this.feedback.play('success'); void this.feedback.pulse('success'); this.save = complete(this.save, this.level.id); this.win(); }
      else { this.feedback.play('error'); void this.feedback.pulse('error'); this.message = result.reason === 'incomplete' ? this.t.incomplete : result.reason === 'rule' ? this.ct.retry : this.t.mismatch; this.play(); }
    });
    this.text(105, 448, this.ct.return, 13, C.muted).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.selection());
    this.text(739, 448, this.t.reset, 15, C.muted).setInteractive({ useHandCursor: true }).on('pointerdown', () => { this.assignment = {}; this.selected = undefined; this.message = ''; this.hintStage = 0; this.queueArrival = true; this.play(); });
  }
  private details(data: Details) {
    this.dismissDetails?.();
    this.input.enabled = false;
    this.dismissDetails = showDetails(data, () => { this.input.enabled = true; this.dismissDetails = undefined; });
  }
  private settings() {
    this.details({ eyebrow: this.t.brand, title: this.ht.settings, close: this.ht.back, sections: [],
      content: settingsContent(this.locale, this.feedback.preferences, preferences => {
        this.feedback.setPreferences(preferences); return savePreferences(preferences);
      }, () => { this.feedback.play('place'); void this.feedback.pulse('place'); }) });
  }
  private shop(message = '') {
    this.details({ eyebrow: `${this.save.coins} ${this.ht.coins}`, title: this.ht.shop, close: this.ht.back,
      sections: [{ title: '', body: message || this.ht.intro }],
      content: shopContent(this.locale, this.save, (id, owned) => {
        let status: string = this.ht.displayed;
        if (owned) this.save = toggleDecoration(this.save, id);
        else {
          const result = purchase(this.save, id); this.save = result.wallet;
          if (result.status === 'bought') { status = this.ht.bought; this.feedback.play('purchase'); void this.feedback.pulse('purchase'); }
          else status = result.status === 'insufficient' ? this.ht.insufficient : this.ht.already;
        }
        if (!writeSave(this.save)) status += `\n${this.ht.session}`;
        this.lobby(); this.shop(status);
      }) });
  }
  private guestCard(guest: Guest) {
    const c = characters[this.locale][guest.kind];
    const image = portrait(guest.kind); image.setAttribute('aria-label', `${c.name} · ${c.species}`);
    this.details({ eyebrow: this.t.guestCard, title: `${c.name} · ${c.species}`, close: this.t.close, content: image, contentFirst: true, sections: [
      { title: this.t.personality, body: c.personality }, { title: this.t.wish, body: c.wish }, { title: '', body: c.quote },
      { title: this.ct.tonight, body: this.guestRules(guest.id).map(rule => ruleText(this.level, rule, this.locale)).join('\n') || this.ct.noRules },
    ] });
  }
  private roomCard(room: Room) {
    const c = roomDesign[this.locale][roomStyle(room)];
    const image = roomPortrait(room); image.setAttribute('aria-label', c.name);
    this.details({ eyebrow: this.t.roomCard, title: `${room.id} · ${c.name}`, close: this.t.close, content: image, contentFirst: true, sections: [
      { title: this.t.condition, body: roomLabel(room, this.locale) },
      { title: '', body: c.description },
      { title: this.ct.floor, body: `${floorName(room.floor, this.locale)} · ${room.position}` }, { title: '', body: this.t.occupancy },
    ] });
  }
  private guestRules(id: string) {
    return (this.level.rules ?? []).filter(rule => 'guest' in rule ? rule.guest === id : rule.a === id || rule.b === id);
  }
  private clues() {
    this.details({ eyebrow: `${String(this.level.id).padStart(2, '0')} · ${levelTitle(this.level.id, this.locale)}`, title: this.ct.clues, close: this.t.close,
      sections: [
        { title: this.t.wish, body: this.level.guests.map(g => `${characters[this.locale][g.kind].name} · ${conditions[this.locale][g.requirement].name}`).join('\n') },
        { title: this.ct.tonight, body: this.level.rules?.length ? this.level.rules.map(rule => ruleText(this.level, rule, this.locale)).join('\n') : this.ct.noRules },
        { title: '', body: this.ct.map },
      ] });
  }
  private hint() {
    this.hintStage = Math.min(this.hintStage + 1, 3);
    const hint = getHint(this.level, this.assignment, this.hintStage);
    let body: string = this.t.hintStrategy + (this.level.rules?.length ? `\n\n${this.ct.rulesReminder}\n${this.ct.map}` : '');
    if (hint.type === 'complete') body = this.t.hintDone;
    if (hint.type === 'focus' || hint.type === 'placement') {
      const guest = this.level.guests.find(g => g.id === hint.guestId)!;
      const c = characters[this.locale][guest.kind];
      body = `${this.t.hintFocus} ${c.name}\n${c.wish}`;
      const rules = this.guestRules(guest.id);
      if (rules.length) body += `\n\n${rules.map(rule => ruleText(this.level, rule, this.locale)).join('\n')}`;
      if (hint.type === 'placement') {
        const room = this.level.rooms.find(r => r.id === hint.roomId)!;
        body += `\n\n${this.t.hintSolution} ${room.id} · ${roomDesign[this.locale][roomStyle(room)].name}`;
      }
    }
    this.details({ eyebrow: `${this.t.hintStage} ${this.hintStage}/3`, title: this.t.hintTitle, close: this.t.close,
      sections: [{ title: '', body }], next: this.hintStage < 3 && hint.type !== 'complete' ? { label: this.t.nextHint, action: () => this.hint() } : undefined });
  }
  private assign(guest: string, room: string) { this.arriving = guest; this.feedback.play('place'); void this.feedback.pulse('place'); this.assignment = place(this.assignment, guest, room); this.selected = undefined; this.message = ''; this.play(); }
  private win() {
    this.screen = 'win';
    this.base(this.t.win);
    this.text(422, 128, '✦  ✦  ✦', 38, '#f2cc83');
    this.level.guests.forEach((g, i) => { const avatar = this.monster(140 + i * 188, 230, g).setScale(.9); if (!reducedMotion()) this.tweens.add({ targets: avatar, y: 218, duration: 650 + i * 100, repeat: reducedMotion() ? 0 : -1, yoyo: true }); });
    this.text(422, 312, this.t.happy, 26);
    this.text(422, 348, `${String(this.level.id).padStart(2, '0')} · ${levelTitle(this.level.id, this.locale)}\n${this.ct.reward}`, 15, C.muted);
    if (this.level.id < levels.length) this.button(398, this.ct.next, () => this.startNight(this.level.id + 1));
    else this.text(422, 395, this.ct.finished, 20, '#f2cc83');
    this.text(422, 450, this.ct.return, 16, '#f2cc83').setInteractive({ useHandCursor: true }).on('pointerdown', () => this.selection());
  }
}
