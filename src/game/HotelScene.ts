import Phaser from 'phaser';
import { tutorialView } from '../domain/tutorial';
import { readTutorialDone, saveTutorialDone } from '../platform/tutorial';
import { tutorialUI } from '../i18n/tutorial';
import { firstLevel, place, validate, type Assignment, type Guest, type Room, type Level } from '../domain/puzzle';
import { levels, levelTitle, isUnlocked } from '../domain/levels';
import { campaignUI, roomLabel, ruleText } from '../i18n/rules';
import { showNightSelection } from './nightSelection';
import { purchase, toggleDecoration } from '../domain/decorations';
import { hotelUI } from '../i18n/hotel';
import { shopContent, settingsContent, languageContent } from './hotelMenus';
import { Feedback } from '../platform/feedback';
import { savePreferences } from '../platform/preferences';
import { createHUD } from './hud';
import { svgMarkup } from './icons';
import { roomConditions, type Condition } from '../domain/puzzle';
import { getHint } from '../domain/hints';
import { ui, conditions, characters, readLocale, saveLocale, type Locale } from '../i18n/catalog';
import { showDetails, type Details } from './details';
import { viewportMetrics } from './viewport';
import { drawRoomLife } from './roomLife';
import { queueX, queueY, roomPoint, residentPoint, roomStyle, floorName, roomWidth, roomHeight } from './layout';
import { roomDesign, dollhouseUI } from '../i18n/dollhouse';
import { registerArt, roomFrame, portrait, roomPortrait, reducedMotion } from './art';
import { drawMonster } from './drawMonster';
import { readSave, complete, writeSave, type Save } from '../platform/save';

const C = { ink: 0x100e25, panel: 0x24203e, gold: 0xf2cc83, muted: '#b9b0ce', white: '#fff3df' };
export class HotelScene extends Phaser.Scene {
  private save!: Save;
  private hud?: ReturnType<typeof createHUD>;
  private earnedCoins = 0;
  private tutorialDismissed = readTutorialDone();
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
    for (const [condition, symbol] of Object.entries({ moonlight: 'moon', quiet: 'quiet', warm: 'flame', dry: 'sun' } as const)) {
      this.load.svg(`condition-${condition}`, `data:image/svg+xml;base64,${btoa(svgMarkup(symbol).replaceAll('currentColor', '#ffe3a4'))}`);
    }
    this.load.image('guests-art', '/art/guests-cartoon.png');
    for (const style of ['elegant', 'linen', 'basement', 'hearth']) this.load.image(`room-${style}`, `/art/rooms/${style}.png`);
  }
  create() { registerArt(this); this.save = readSave(); this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.feedback.dispose(); this.hud?.destroy(); this.dismissDetails?.(); }); this.title(); }
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
    for (const object of this.children.list) {
      const key = object.getData('roomPanel') as string | undefined;
      if (key && object instanceof Phaser.GameObjects.Image) object.setFrame(roomFrame(this, key)).setDisplaySize(roomWidth, roomHeight);
    }
  }
  private text(x: number, y: number, text: string, size = 20, color = C.white) {
    return this.add.text(x, y, text, { fontFamily: 'Georgia, "Noto Sans TC", serif', fontSize: size, color, align: 'center', lineSpacing: 6 }).setOrigin(.5);
  }
  private base(label: string) {
    this.hud?.destroy(); this.hud = undefined;
    this.dismissDetails?.(); this.dismissDetails = undefined;
    this.setBusy(false);
    this.tweens.killAll(); this.children.removeAll(true);
    this.resizeViewport();
    this.cameras.main.setBackgroundColor(C.ink);
    const g = this.add.graphics();
    if (this.screen === 'play') g.fillStyle(0x191630).fillRect(0, 0, 844, 480);
    else g.fillStyle(0x191630).fillRoundedRect(12, 12, 820, 456, 28);
    for (let i = 0; i < 32; i++) { g.fillStyle(C.gold, .15 + (i % 3) * .12).fillCircle(25 + (i * 67) % 790, 35 + (i * 113) % 420, i % 2 + 1); }
    if (this.screen !== 'play') { this.text(422, 22, this.t.brand, 12, '#f2cc83'); this.text(422, 58, label, 29); }
    document.documentElement.lang = this.locale;
    this.hud = createHUD({ locale: this.locale, playing: this.screen === 'play', night: this.level.id,
      settings: () => this.settings(), language: () => this.language(), home: () => this.selection(), hint: () => this.hint(), clues: () => this.clues(),
      skipTutorial: () => this.finishTutorial(),
      check: () => this.checkGuests(), reset: () => { this.assignment = {}; this.selected = undefined; this.message = ''; this.hintStage = 0; this.queueArrival = true; this.play(); },
    });
    this.game.canvas.setAttribute('aria-label', this.screen === 'play' ? `${levelTitle(this.level.id, this.locale)}. ${dollhouseUI[this.locale].instructions}` : label);
  }
  private button(y: number, label: string, callback: () => void, width = 310, x = 422) {
    const g = this.add.graphics();
    g.fillStyle(0x503044).fillRoundedRect(x - width / 2, y - 20, width, 48, 16);
    g.fillStyle(0xe0ac68).fillRoundedRect(x - width / 2, y - 24, width, 46, 16);
    g.fillStyle(C.gold).fillRoundedRect(x - width / 2 + 3, y - 22, width - 6, 37, 13);
    g.lineStyle(2, 0xffedbd).strokeRoundedRect(x - width / 2 + 1, y - 24, width - 2, 44, 16);
    this.text(x, y - 2, label, 18, '#553047');
    this.add.zone(x, y, width, 48).setInteractive({ useHandCursor: true }).on('pointerdown', () => { this.feedback.play('tap'); callback(); });
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
    this.button(450, this.t.titleBack, () => this.title(), 180, 590);
  }
  private selection() {
    this.screen = 'selection'; this.base(this.ct.levels); this.input.enabled = false;
    this.hud?.visible(false);
    this.dismissDetails = showNightSelection(this.locale, this.save.completed, id => this.startNight(id), () => this.lobby(), () => this.language());
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
    this.input.enabled = !busy; this.hud?.busy(busy);
    this.game.canvas.setAttribute('aria-busy', String(busy));
    if (busy) this.hud?.tutorial(undefined, this.assignment); else if (this.screen === 'play') this.updateTutorial();
  }
  private play() {
    this.screen = 'play';
    this.base(`${String(this.level.id).padStart(2, '0')} · ${levelTitle(this.level.id, this.locale)}`);
    if (this.message) this.hud?.show(this.message);
    const status = { setText: (message: string) => this.hud?.show(message) };
    const frame = this.add.graphics();
    frame.fillStyle(0x574057).fillRect(0, 66, 844, 276);
    frame.lineStyle(3, 0xb18a70).strokeRect(0, 66, 844, 276);
    frame.fillStyle(0x3d2a43).fillRect(406, 68, 32, 272).fillRect(0, 200, 844, 8);
    frame.lineStyle(2, 0xb28c72);
    for (let y = 88; y < 337; y += 17) frame.lineBetween(413, y, 431, y - 10);
    frame.fillStyle(0x33273f).fillRoundedRect(100, 345, 666, 75, 15);
    frame.fillStyle(0x5a425c).fillRoundedRect(30, 348, 66, 67, 10);
    frame.lineStyle(2, C.gold, .5).strokeRoundedRect(43, 355, 40, 45, 16);
    this.text(63, 407, dollhouseUI[this.locale].waiting, 9, '#f2cc83');
    const selection = this.add.ellipse(0, 0, 76, 72).setStrokeStyle(2, C.gold, .8).setVisible(false).setDepth(5).setData('viewportAspect', true);
    const bindGuest = (avatar: Phaser.GameObjects.Container, guest: Guest) => {
      avatar.setInteractive({ useHandCursor: true }).setData('guest', guest.id); this.input.setDraggable(avatar);
      avatar.on('pointerdown', () => {
        this.selected = guest.id; selection.setPosition(avatar.x, avatar.y).setVisible(true); this.updateTutorial();
        if (this.assignment[guest.id] && !reducedMotion()) {
          const heart = this.text(avatar.x, avatar.y - 30, '♥', 17, '#ef9bb4').setDepth(12);
          this.tweens.add({ targets: heart, y: avatar.y - 48, alpha: 0, duration: 650, onComplete: () => heart.destroy() });
        }
        const guided = guest.kind === 'werewolf' && tutorialView(this.level.id, this.save.completed, this.tutorialDismissed, this.assignment, this.selected);
        if (guided) status.setText(''); else status.setText(`${characters[this.locale][guest.kind].name} · ${conditions[this.locale][guest.requirement].name}`);
      });
      if (this.selected === guest.id) selection.setPosition(avatar.x, avatar.y).setVisible(true);
    };
    const entering = this.queueArrival && !reducedMotion(); this.queueArrival = false;
    if (entering) this.setBusy(true);
    for (const room of this.level.rooms) {
      const p = roomPoint(room); const style = roomStyle(room);
      this.add.rectangle(p.x, p.y, roomWidth, roomHeight, C.panel);
      if (this.textures.exists(`room-${style}`)) this.add.image(p.x, p.y, `room-${style}`, roomFrame(this, `room-${style}`)).setDisplaySize(roomWidth, roomHeight).setData('roomPanel', `room-${style}`);
      drawRoomLife(this, room);
      this.add.rectangle(p.x - 174, p.y - 54, 54, 23, 0x34243e, .85).setStrokeStyle(1, 0xc89d6e);
      this.add.rectangle(p.x - 142, p.y + 56, 118, 22, 0x251c32, .75);
      const drop = this.add.zone(p.x, p.y, roomWidth, roomHeight).setRectangleDropZone(roomWidth, roomHeight).setData('room', room.id);
      drop.on('pointerdown', () => { if (this.selected) this.assign(this.selected, room.id); });
      this.text(p.x - 174, p.y - 54, room.id, 12, '#ffdea0');
      roomConditions(room).forEach((condition, index) => this.add.image(p.x - 180 + index * 25, p.y + 56, `condition-${condition}`).setDisplaySize(18, 18).setData('viewportAspect', true));
      this.add.circle(p.x + 158, p.y - 54, 17, 0x4e3556, .95).setStrokeStyle(2, 0xcfa66e);
      this.text(p.x + 158, p.y - 54, 'ⓘ', 18, '#f2cc83').setPadding(5).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.roomCard(room));
      const guest = this.level.guests.find(g => this.assignment[g.id] === room.id);
      if (guest) {
        const point = residentPoint(room); const actor = this.monster(point.x, point.y, guest, 'room').setScale(.72);
        bindGuest(actor, guest);
        if (this.arriving === guest.id && !reducedMotion()) {
          const index = this.level.guests.indexOf(guest); actor.setPosition(queueX[index], queueY).setDepth(10); this.setBusy(true);
          status.setText('');
          this.tweens.chain({ targets: actor, tweens: [
            { x: 422, y: 349, duration: 160 }, { x: 422, y: point.y, duration: 200 }, { x: point.x, y: point.y, duration: 180 },
          ], onComplete: () => { actor.setDepth(0); this.setBusy(false); status.setText(''); } });
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
      } else this.text(x, queueY, '✓', 23, '#b8cfbc');
      const c = characters[this.locale][guest.kind];
      this.text(x, 412, `${c.name} ⓘ`, 12, C.white).setPadding(2).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.guestCard(guest));
    });
    this.input.removeAllListeners('drag'); this.input.removeAllListeners('drop'); this.input.removeAllListeners('dragend');
    this.input.on('drag', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container, x: number, y: number) => { obj.setPosition(x, y); obj.setDepth(10); });
    this.input.on('drop', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container, target: Phaser.GameObjects.Zone) => this.assign(obj.getData('guest'), target.getData('room')));
    this.input.on('dragend', (_p: Phaser.Input.Pointer, _obj: Phaser.GameObjects.Container, dropped: boolean) => { if (!dropped) this.play(); });
    if (this.game.canvas.getAttribute('aria-busy') === 'false') this.updateTutorial();
  }
  private updateTutorial() {
    this.hud?.tutorial(this.screen === 'play' ? tutorialView(this.level.id, this.save.completed, this.tutorialDismissed, this.assignment, this.selected) : undefined, this.assignment);
  }
  private finishTutorial() {
    this.tutorialDismissed = true; const saved = saveTutorialDone(); this.updateTutorial();
    if (!saved) this.hud?.show(tutorialUI[this.locale].session);
  }
  private checkGuests() {
    const result = validate(this.level, this.assignment);
    if (result.valid) {
      if (this.level.id === 1 && !this.tutorialDismissed) this.finishTutorial();
      this.feedback.play('success'); void this.feedback.pulse('success'); const before = this.save.coins;
      this.save = complete(this.save, this.level.id); this.earnedCoins = this.save.coins - before; this.win();
    } else {
      this.feedback.play('error'); void this.feedback.pulse('error'); this.message = result.reason === 'incomplete' ? this.t.incomplete : result.reason === 'rule' ? this.ct.retry : this.t.mismatch; this.play();
    }
  }
  private details(data: Details, onClose?: () => void) {
    this.dismissDetails?.(); this.input.enabled = false; this.hud?.visible(false);
    this.dismissDetails = showDetails(data, () => {
      this.dismissDetails = undefined; this.input.enabled = this.screen !== 'selection'; this.hud?.visible(this.screen !== 'selection'); onClose?.();
    });
  }
  private language(fromSettings = false) {
    const title = this.locale === 'en' ? 'Language' : '語言';
    this.details({ kind: 'language', eyebrow: '', title, close: this.ht.back, sections: [], content: languageContent(this.locale, locale => {
      this.dismissDetails?.(); this.dismissDetails = undefined; this.locale = locale; saveLocale(locale); this.message = ''; this[this.screen]();
      if (fromSettings) this.settings();
    }) }, () => { if (fromSettings) this.settings(); else if (this.screen === 'selection') this.selection(); });
  }
  private settings() {
    this.details({ kind: 'settings', eyebrow: this.t.brand, title: this.ht.settings, close: this.ht.back, sections: [],
      content: settingsContent(this.locale, this.feedback.preferences, preferences => {
        this.feedback.setPreferences(preferences); return savePreferences(preferences);
      }, () => { this.feedback.play('place'); void this.feedback.pulse('place'); }, () => this.language(true)) });
  }
  private shop(message = '') {
    this.details({ kind: 'shop', eyebrow: `${this.save.coins} ${this.ht.coins}`, title: this.ht.shop, close: this.ht.back,
      sections: message ? [{ title: '', body: message }] : [],
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
    this.details({ kind: 'hints', eyebrow: `${String(this.level.id).padStart(2, '0')} · ${levelTitle(this.level.id, this.locale)}`, title: this.ct.clues, close: this.t.close,
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
    this.details({ kind: 'hints', eyebrow: `${this.t.hintStage} ${this.hintStage}/3`, title: this.t.hintTitle, close: this.t.close,
      sections: [{ title: '', body }], next: this.hintStage < 3 && hint.type !== 'complete' ? { label: this.t.nextHint, action: () => this.hint() } : undefined });
  }
  private assign(guest: string, room: string) { this.arriving = guest; this.feedback.play('place'); void this.feedback.pulse('place'); this.assignment = place(this.assignment, guest, room); this.selected = undefined; this.message = ''; this.play(); }
  private win() {
    this.screen = 'win';
    this.base(this.t.win);
    this.text(422, 128, '✦  ✦  ✦', 38, '#f2cc83');
    this.level.guests.forEach((g, i) => { const avatar = this.monster(140 + i * 188, 230, g).setScale(.9); if (!reducedMotion()) this.tweens.add({ targets: avatar, y: 218, duration: 650 + i * 100, repeat: reducedMotion() ? 0 : -1, yoyo: true }); });
    this.text(422, 312, this.t.happy, 26);
    this.text(422, 348, `+${this.earnedCoins} ${this.t.coins}`, 21, '#f2cc83');
    if (this.level.id < levels.length) this.button(398, this.ct.next, () => this.startNight(this.level.id + 1));
    else this.text(422, 395, this.ct.finished, 20, '#f2cc83');
    this.button(450, this.ct.return, () => this.selection(), 210);
  }
}
