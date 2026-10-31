import Phaser from 'phaser';
import { firstLevel, place, validate, type Assignment, type Guest } from '../domain/puzzle';
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
    g.fillStyle(0x191630).fillRoundedRect(12, 12, 366, 820, 28);
    for (let i = 0; i < 32; i++) { g.fillStyle(C.gold, .15 + (i % 3) * .12).fillCircle(25 + (i * 67) % 340, 35 + (i * 113) % 740, i % 2 + 1); }
    this.text(195, 40, '✦  MIDNIGHT CHECK-IN  ✦', 12, '#f2cc83');
    this.text(195, 89, label, 29);
    this.text(195, 808, 'MONSTER HOTEL  /  NIGHT ONE', 10, C.muted);
  }
  private button(y: number, label: string, callback: () => void, width = 310) {
    const bg = this.add.rectangle(195, y, width, 52, C.gold).setStrokeStyle(1, 0xffe7b5).setInteractive({ useHandCursor: true });
    this.text(195, y, label, 18, '#292039');
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
    this.text(195, 130, 'A little spooky. A lot of heart.', 15, C.muted);
    this.hotel(285);
    const moon = this.add.circle(290, 202, 25, C.gold);
    this.tweens.add({ targets: moon, y: 192, alpha: .6, duration: 2200, yoyo: true, repeat: -1 });
    this.text(195, 579, 'Every monster deserves\na room to call home.', 22);
    this.button(687, 'Open the doors  →', () => this.lobby());
    this.text(195, 742, 'An original midnight puzzle adventure', 12, C.muted);
  }
  private lobby() {
    this.base('Welcome, keeper');
    this.text(195, 135, `${this.save.coins} coins  ·  ${this.save.completed.length}/1 nights complete`, 14, '#f2cc83');
    this.hotel(265);
    this.text(195, 552, 'Your first guests are here.', 23);
    this.text(195, 595, 'Match their wishes to the perfect room.\nA peaceful night is in your hands.', 15, C.muted);
    this.button(674, `${this.save.completed.includes(1) ? 'Replay' : 'Begin'} night 01  →`, () => { this.assignment = {}; this.message = ''; this.selected = undefined; this.play(); });
    this.button(741, 'Return to title', () => this.title(), 250);
  }
  private monster(x: number, y: number, guest: Guest) {
    const g = this.add.graphics();
    g.fillStyle(guest.color);
    if (guest.kind === 'bat') { g.fillTriangle(-30, -4, -56, -30, -52, 20); g.fillTriangle(30, -4, 56, -30, 52, 20); }
    if (guest.kind !== 'ghost') { g.fillTriangle(-25, -15, -23, -49, -4, -27); g.fillTriangle(25, -15, 23, -49, 4, -27); }
    g.fillRoundedRect(-31, -30, 62, 63, 26);
    if (guest.kind === 'ghost') for (let i = 0; i < 3; i++) g.fillCircle(-20 + i * 20, 28, 11);
    g.fillStyle(0x201b35).fillCircle(-11, -5, 4).fillCircle(11, -5, 4);
    g.fillStyle(0xfff6e5).fillCircle(-12, -6, 1.5).fillCircle(10, -6, 1.5);
    g.fillStyle(0xe884a6, .65).fillEllipse(-21, 7, 10, 5).fillEllipse(21, 7, 10, 5);
    g.lineStyle(2, 0x42314e).beginPath().arc(0, 7, 5, 0, Math.PI).strokePath();
    return this.add.container(x, y, [g]).setSize(100, 100);
  }
  private play() {
    this.base('A room for everyone');
    this.text(195, 132, 'NIGHT 01  ·  THE FIRST CHECK-IN', 12, '#f2cc83');
    this.text(195, 176, 'Drag a guest into a room, or tap\na guest and then a room.', 16, C.muted);
    const hints = ['Moonlight', 'Quiet', 'Warm'];
    firstLevel.rooms.forEach((room, i) => {
      const x = 77 + i * 118;
      const zone = this.add.rectangle(x, 320, 108, 170, C.panel).setStrokeStyle(1, C.gold, .6).setInteractive({ useHandCursor: true });
      const drop = this.add.zone(x, 320, 108, 170).setRectangleDropZone(108, 170);
      drop.setData('room', room.id);
      drop.on('pointerdown', () => { if (this.selected) this.assign(this.selected, room.id); });
      this.text(x, 254, room.id, 13, '#f2cc83');
      this.text(x, 382, hints[i], 13);
      const guest = firstLevel.guests.find(g => this.assignment[g.id] === room.id);
      if (guest) this.monster(x, 321, guest).setScale(.65);
      zone.on('pointerdown', () => { if (this.selected) this.assign(this.selected, room.id); });
    });
    firstLevel.guests.forEach((guest, i) => {
      const x = 77 + i * 118;
      const avatar = this.monster(x, 510, guest).setScale(.8).setInteractive({ useHandCursor: true });
      avatar.setData('guest', guest.id);
      this.input.setDraggable(avatar);
      avatar.on('pointerdown', () => { this.selected = guest.id; status.setText(`${guest.name} wants ${guest.requirement}. Tap a room.`); });
      this.text(x, 572, guest.name, 18, this.selected === guest.id ? '#f2cc83' : C.white);
      this.text(x, 603, `Wants ${guest.requirement}`, 11, C.muted);
    });
    const status = this.text(195, 654, this.message || 'Three guests. Three perfect rooms.', 14, '#f2cc83');
    this.input.removeAllListeners('drag'); this.input.removeAllListeners('drop'); this.input.removeAllListeners('dragend');
    this.input.on('drag', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container, x: number, y: number) => { obj.setPosition(x, y); obj.setDepth(10); });
    this.input.on('drop', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container, target: Phaser.GameObjects.Zone) => this.assign(obj.getData('guest'), target.getData('room')));
    this.input.on('dragend', (_p: Phaser.Input.Pointer, _obj: Phaser.GameObjects.Container, dropped: boolean) => { if (!dropped) this.play(); });
    this.button(710, 'Check in all guests  ✦', () => {
      const result = validate(firstLevel, this.assignment);
      if (result.valid) { this.save = complete(this.save, 1); this.win(); }
      else { this.message = result.reason === 'incomplete' ? 'Give every guest a room first.' : 'A guest’s wish is unmet. Try again!'; this.play(); }
    });
    this.text(96, 768, '← Lobby', 15, C.muted).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.lobby());
    this.text(294, 768, 'Reset ↻', 15, C.muted).setInteractive({ useHandCursor: true }).on('pointerdown', () => { this.assignment = {}; this.selected = undefined; this.message = ''; this.play(); });
  }
  private assign(guest: string, room: string) { this.assignment = place(this.assignment, guest, room); this.selected = undefined; this.message = ''; this.play(); }
  private win() {
    this.base('A perfectly spooky stay');
    this.text(195, 255, '✦  ✦  ✦', 45, '#f2cc83');
    firstLevel.guests.forEach((g, i) => { const avatar = this.monster(80 + i * 115, 407, g).setScale(.8); this.tweens.add({ targets: avatar, y: 395, duration: 650 + i * 100, repeat: -1, yoyo: true }); });
    this.text(195, 526, 'All your guests are happy!', 23);
    this.text(195, 584, 'Night 01 complete\n50 coins awarded once per night', 16, C.muted);
    this.button(700, 'Back to the lobby  →', () => this.lobby());
  }
}
