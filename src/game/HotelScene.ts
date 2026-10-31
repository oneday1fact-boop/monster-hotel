import Phaser from 'phaser';
import { firstLevel, place, validate, type Assignment, type Guest, type Room } from '../domain/puzzle';
import { getHint } from '../domain/hints';
import { ui, conditions, characters, readLocale, saveLocale, type Locale } from '../i18n/catalog';
import { showDetails, type Details } from './details';
import { drawMonster } from './drawMonster';
import { readSave, complete, type Save } from '../platform/save';

const C = { ink: 0x100e25, panel: 0x24203e, gold: 0xf2cc83, muted: '#b9b0ce', white: '#fff3df' };
export class HotelScene extends Phaser.Scene {
  private save!: Save;
  private assignment: Assignment = {};
  private selected?: string;
  private message = '';
  private locale: Locale = readLocale();
  private screen: 'title' | 'lobby' | 'play' | 'win' = 'title';
  private hintStage = 0;
  private dismissDetails?: () => void;
  private get t() { return ui[this.locale]; }
  constructor() { super('hotel'); }
  create() { this.save = readSave(); this.title(); }
  private text(x: number, y: number, text: string, size = 20, color = C.white) {
    return this.add.text(x, y, text, { fontFamily: 'Georgia, "Noto Sans TC", serif', fontSize: size, color, align: 'center', lineSpacing: 6 }).setOrigin(.5);
  }
  private base(label: string) {
    this.dismissDetails?.(); this.dismissDetails = undefined;
    this.input.enabled = true;
    this.tweens.killAll(); this.children.removeAll(true);
    this.cameras.main.setBackgroundColor(C.ink);
    const g = this.add.graphics();
    g.fillStyle(0x191630).fillRoundedRect(12, 12, 820, 456, 28);
    for (let i = 0; i < 32; i++) { g.fillStyle(C.gold, .15 + (i % 3) * .12).fillCircle(25 + (i * 67) % 790, 35 + (i * 113) % 420, i % 2 + 1); }
    this.text(422, 22, this.t.brand, 12, '#f2cc83');
    this.text(422, 58, label, 29);
    document.documentElement.lang = this.locale;
    this.text(765, 26, this.locale === 'en' ? '繁體中文' : 'English', 13, '#f2cc83').setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.locale = this.locale === 'en' ? 'zh-Hant' : 'en'; saveLocale(this.locale); this.message = ''; this[this.screen]();
    });
  }
  private button(y: number, label: string, callback: () => void, width = 310, x = 422) {
    const bg = this.add.rectangle(x, y, width, 48, C.gold).setStrokeStyle(1, 0xffe7b5).setInteractive({ useHandCursor: true });
    this.text(x, y, label, 18, '#292039');
    bg.on('pointerdown', callback);
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
    g.fillStyle(0x15132b).fillRoundedRect(166, y + 173, 58, 62, { tl: 29, tr: 29, bl: 0, br: 0 });
    this.text(195, y + 160, this.t.hotel, 13, '#f2cc83');
  }
  private title() {
    this.screen = 'title';
    this.base(this.t.title);
    this.text(422, 98, this.t.tagline, 15, C.muted);
    this.hotel(190);
    const moon = this.add.circle(300, 140, 25, C.gold);
    this.tweens.add({ targets: moon, y: 130, alpha: .6, duration: 2200, yoyo: true, repeat: -1 });
    this.text(590, 215, this.t.promise, 26);
    this.button(330, this.t.open, () => this.lobby(), 310, 590);
    this.text(590, 385, this.t.adventure, 14, C.muted);
  }
  private lobby() {
    this.screen = 'lobby';
    this.base(this.t.welcome);
    this.text(422, 98, `${this.save.coins} ${this.t.coins}  ·  ${this.save.completed.length}/1 ${this.t.progress}`, 14, '#f2cc83');
    this.hotel(190);
    this.text(590, 180, this.t.arrivals, 26);
    this.text(590, 235, this.t.intro, 16, C.muted);
    this.button(325, this.save.completed.includes(1) ? this.t.replay : this.t.begin, () => { this.assignment = {}; this.message = ''; this.selected = undefined; this.hintStage = 0; this.play(); }, 310, 590);
    this.button(390, this.t.titleBack, () => this.title(), 250, 590);
  }
  private monster(x: number, y: number, guest: Guest) {
    return drawMonster(this, x, y, guest);
  }

  private play() {
    this.screen = 'play';
    this.base(this.t.puzzle);
    const status = this.text(422, 122, this.message || this.t.ready, 14, '#f2cc83');
    this.text(422, 92, this.t.instructions, 15, C.muted);
    this.text(74, 26, this.t.hint + ' ✦', 14, '#f2cc83').setInteractive({ useHandCursor: true }).on('pointerdown', () => this.hint());
    firstLevel.rooms.forEach((room, i) => {
      const x = 140 + i * 188;
      const zone = this.add.rectangle(x, 220, 160, 138, C.panel).setStrokeStyle(1, C.gold, .6).setInteractive({ useHandCursor: true });
      const drop = this.add.zone(x, 220, 160, 138).setRectangleDropZone(160, 138);
      drop.setData('room', room.id);
      drop.on('pointerdown', () => { if (this.selected) this.assign(this.selected, room.id); });
      this.text(x, 165, room.id, 13, '#f2cc83');
      this.text(x, 270, conditions[this.locale][room.condition].name, 13);
      const guest = firstLevel.guests.find(g => this.assignment[g.id] === room.id);
      if (guest) this.monster(x, 220, guest).setScale(.65);
      zone.on('pointerdown', () => { if (this.selected) this.assign(this.selected, room.id); });
      this.text(x + 60, 166, 'ⓘ', 20, '#f2cc83').setPadding(5).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.roomCard(room));
    });
    firstLevel.guests.forEach((guest, i) => {
      const x = 140 + i * 188;
      const avatar = this.monster(x, 340, guest).setScale(.8).setInteractive({ useHandCursor: true });
      avatar.setData('guest', guest.id);
      this.input.setDraggable(avatar);
      avatar.on('pointerdown', () => { this.selected = guest.id; status.setText(`${this.t.select} ${characters[this.locale][guest.kind].name} · ${conditions[this.locale][guest.requirement].name}`); });
      this.text(x, 382, `${characters[this.locale][guest.kind].name} · ${characters[this.locale][guest.kind].species} ⓘ`, 14, this.selected === guest.id ? '#f2cc83' : C.white).setPadding(3).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.guestCard(guest));
      this.text(x, 406, `${this.t.needs} ${conditions[this.locale][guest.requirement].name}`, 11, C.muted);
    });
    this.input.removeAllListeners('drag'); this.input.removeAllListeners('drop'); this.input.removeAllListeners('dragend');
    this.input.on('drag', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container, x: number, y: number) => { obj.setPosition(x, y); obj.setDepth(10); });
    this.input.on('drop', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container, target: Phaser.GameObjects.Zone) => this.assign(obj.getData('guest'), target.getData('room')));
    this.input.on('dragend', (_p: Phaser.Input.Pointer, _obj: Phaser.GameObjects.Container, dropped: boolean) => { if (!dropped) this.play(); });
    this.button(442, this.t.check, () => {
      const result = validate(firstLevel, this.assignment);
      if (result.valid) { this.save = complete(this.save, 1); this.win(); }
      else { this.message = result.reason === 'incomplete' ? this.t.incomplete : this.t.mismatch; this.play(); }
    });
    this.text(105, 442, this.t.lobby, 15, C.muted).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.lobby());
    this.text(739, 442, this.t.reset, 15, C.muted).setInteractive({ useHandCursor: true }).on('pointerdown', () => { this.assignment = {}; this.selected = undefined; this.message = ''; this.hintStage = 0; this.play(); });
  }
  private details(data: Details) {
    this.dismissDetails?.();
    this.input.enabled = false;
    this.dismissDetails = showDetails(data, () => { this.input.enabled = true; this.dismissDetails = undefined; });
  }
  private guestCard(guest: Guest) {
    const c = characters[this.locale][guest.kind];
    this.details({ eyebrow: this.t.guestCard, title: `${c.name} · ${c.species}`, close: this.t.close, sections: [
      { title: this.t.personality, body: c.personality }, { title: this.t.wish, body: c.wish }, { title: '', body: c.quote },
    ] });
  }
  private roomCard(room: Room) {
    const c = conditions[this.locale][room.condition];
    this.details({ eyebrow: this.t.roomCard, title: `${room.id} · ${c.room}`, close: this.t.close, sections: [
      { title: this.t.condition, body: c.name }, { title: '', body: c.description }, { title: '', body: this.t.occupancy },
    ] });
  }
  private hint() {
    this.hintStage = Math.min(this.hintStage + 1, 3);
    const hint = getHint(firstLevel, this.assignment, this.hintStage);
    let body: string = this.t.hintStrategy;
    if (hint.type === 'complete') body = this.t.hintDone;
    if (hint.type === 'focus' || hint.type === 'placement') {
      const guest = firstLevel.guests.find(g => g.id === hint.guestId)!;
      const c = characters[this.locale][guest.kind];
      body = `${this.t.hintFocus} ${c.name}\n${c.wish}`;
      if (hint.type === 'placement') {
        const room = firstLevel.rooms.find(r => r.id === hint.roomId)!;
        body += `\n\n${this.t.hintSolution} ${room.id} · ${conditions[this.locale][room.condition].room}`;
      }
    }
    this.details({ eyebrow: `${this.t.hintStage} ${this.hintStage}/3`, title: this.t.hintTitle, close: this.t.close,
      sections: [{ title: '', body }], next: this.hintStage < 3 && hint.type !== 'complete' ? { label: this.t.nextHint, action: () => this.hint() } : undefined });
  }
  private assign(guest: string, room: string) { this.assignment = place(this.assignment, guest, room); this.selected = undefined; this.message = ''; this.play(); }
  private win() {
    this.screen = 'win';
    this.base(this.t.win);
    this.text(422, 128, '✦  ✦  ✦', 38, '#f2cc83');
    firstLevel.guests.forEach((g, i) => { const avatar = this.monster(140 + i * 188, 230, g).setScale(.9); this.tweens.add({ targets: avatar, y: 218, duration: 650 + i * 100, repeat: -1, yoyo: true }); });
    this.text(422, 312, this.t.happy, 26);
    this.text(422, 359, this.t.reward, 16, C.muted);
    this.button(422, this.t.lobbyBack, () => this.lobby());
  }
}
