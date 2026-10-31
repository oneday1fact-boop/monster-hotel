import Phaser from 'phaser';
import { firstLevel, place, validate, type Assignment, type Guest } from '../domain/puzzle';
import { drawMonster } from './drawMonster';
import { readSave, complete, type Save } from '../platform/save';

const C = { ink: 0x100e25, panel: 0x24203e, gold: 0xf2cc83, muted: '#b9b0ce', white: '#fff3df' };
export class HotelScene extends Phaser.Scene {
  private save!: Save;
  private assignment: Assignment = {};
  private selected?: string;
  private message = '';
  constructor() { super('hotel'); }
  create() { this.save = readSave(); this.title(); }
  private text(x: number, y: number, text: string, size = 20, color = C.white) {
    return this.add.text(x, y, text, { fontFamily: 'Georgia, serif', fontSize: size, color, align: 'center', lineSpacing: 6 }).setOrigin(.5);
  }
  private base(label: string) {
    this.tweens.killAll(); this.children.removeAll(true);
    this.cameras.main.setBackgroundColor(C.ink);
    const g = this.add.graphics();
    g.fillStyle(0x191630).fillRoundedRect(12, 12, 820, 456, 28);
    for (let i = 0; i < 32; i++) { g.fillStyle(C.gold, .15 + (i % 3) * .12).fillCircle(25 + (i * 67) % 790, 35 + (i * 113) % 420, i % 2 + 1); }
    this.text(422, 22, '✦  MIDNIGHT CHECK-IN  ✦', 12, '#f2cc83');
    this.text(422, 58, label, 29);
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
    this.text(195, y + 160, 'HOTEL', 13, '#f2cc83');
  }
  private title() {
    this.base('Monster Hotel');
    this.text(422, 98, 'A little spooky. A lot of heart.', 15, C.muted);
    this.hotel(190);
    const moon = this.add.circle(300, 140, 25, C.gold);
    this.tweens.add({ targets: moon, y: 130, alpha: .6, duration: 2200, yoyo: true, repeat: -1 });
    this.text(590, 215, 'Every monster deserves\na room to call home.', 26);
    this.button(330, 'Open the doors  →', () => this.lobby(), 310, 590);
    this.text(590, 385, 'An original midnight puzzle adventure', 14, C.muted);
  }
  private lobby() {
    this.base('Welcome, keeper');
    this.text(422, 98, `${this.save.coins} coins  ·  ${this.save.completed.length}/1 nights complete`, 14, '#f2cc83');
    this.hotel(190);
    this.text(590, 180, 'Four guests are here.', 26);
    this.text(590, 235, 'Match their wishes to the perfect room.\nA peaceful night is in your hands.', 16, C.muted);
    this.button(325, `${this.save.completed.includes(1) ? 'Replay' : 'Begin'} night 01  →`, () => { this.assignment = {}; this.message = ''; this.selected = undefined; this.play(); }, 310, 590);
    this.button(390, 'Return to title', () => this.title(), 250, 590);
  }
  private monster(x: number, y: number, guest: Guest) {
    return drawMonster(this, x, y, guest);
  }

  private play() {
    this.base('A room for everyone');
    const status = this.text(422, 122, this.message || 'Four guests. Four perfect rooms.', 14, '#f2cc83');
    this.text(422, 92, 'Drag a guest into a room, or tap a guest and then a room.', 15, C.muted);
    const hints = ['Moonlight', 'Quiet', 'Warm', 'Dry'];
    firstLevel.rooms.forEach((room, i) => {
      const x = 140 + i * 188;
      const zone = this.add.rectangle(x, 220, 160, 138, C.panel).setStrokeStyle(1, C.gold, .6).setInteractive({ useHandCursor: true });
      const drop = this.add.zone(x, 220, 160, 138).setRectangleDropZone(160, 138);
      drop.setData('room', room.id);
      drop.on('pointerdown', () => { if (this.selected) this.assign(this.selected, room.id); });
      this.text(x, 165, room.id, 13, '#f2cc83');
      this.text(x, 270, hints[i], 13);
      const guest = firstLevel.guests.find(g => this.assignment[g.id] === room.id);
      if (guest) this.monster(x, 220, guest).setScale(.65);
      zone.on('pointerdown', () => { if (this.selected) this.assign(this.selected, room.id); });
    });
    firstLevel.guests.forEach((guest, i) => {
      const x = 140 + i * 188;
      const avatar = this.monster(x, 340, guest).setScale(.8).setInteractive({ useHandCursor: true });
      avatar.setData('guest', guest.id);
      this.input.setDraggable(avatar);
      avatar.on('pointerdown', () => { this.selected = guest.id; status.setText(`${guest.name} wants ${guest.requirement}. Tap a room.`); });
      this.text(x, 382, `${guest.name} · ${guest.species}`, 14, this.selected === guest.id ? '#f2cc83' : C.white);
      this.text(x, 406, `Needs ${guest.requirement}`, 11, C.muted);
    });
    this.input.removeAllListeners('drag'); this.input.removeAllListeners('drop'); this.input.removeAllListeners('dragend');
    this.input.on('drag', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container, x: number, y: number) => { obj.setPosition(x, y); obj.setDepth(10); });
    this.input.on('drop', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container, target: Phaser.GameObjects.Zone) => this.assign(obj.getData('guest'), target.getData('room')));
    this.input.on('dragend', (_p: Phaser.Input.Pointer, _obj: Phaser.GameObjects.Container, dropped: boolean) => { if (!dropped) this.play(); });
    this.button(442, 'Check in all guests  ✦', () => {
      const result = validate(firstLevel, this.assignment);
      if (result.valid) { this.save = complete(this.save, 1); this.win(); }
      else { this.message = result.reason === 'incomplete' ? 'Give every guest a room first.' : 'A guest’s wish is unmet. Try again!'; this.play(); }
    });
    this.text(105, 442, '← Lobby', 15, C.muted).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.lobby());
    this.text(739, 442, 'Reset ↻', 15, C.muted).setInteractive({ useHandCursor: true }).on('pointerdown', () => { this.assignment = {}; this.selected = undefined; this.message = ''; this.play(); });
  }
  private assign(guest: string, room: string) { this.assignment = place(this.assignment, guest, room); this.selected = undefined; this.message = ''; this.play(); }
  private win() {
    this.base('A perfectly spooky stay');
    this.text(422, 128, '✦  ✦  ✦', 38, '#f2cc83');
    firstLevel.guests.forEach((g, i) => { const avatar = this.monster(140 + i * 188, 230, g).setScale(.9); this.tweens.add({ targets: avatar, y: 218, duration: 650 + i * 100, repeat: -1, yoyo: true }); });
    this.text(422, 312, 'All four guests are happy!', 26);
    this.text(422, 359, 'Night 01 complete · 50 coins awarded once per night', 16, C.muted);
    this.button(422, 'Back to the lobby  →', () => this.lobby());
  }
}
