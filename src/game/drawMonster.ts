import Phaser from 'phaser';
import type { Guest } from '../domain/puzzle';

/** Original geometric silhouettes inspired by folklore, with no external art dependencies. */
export function drawMonster(scene: Phaser.Scene, x: number, y: number, guest: Guest) {
  const g = scene.add.graphics();
  const ink = 0x29203c;
  if (guest.kind === 'fox') {
    // Nine individual tails fan around the face, remaining readable at room scale.
    for (let i = 0; i < 9; i++) {
      const angle = Math.PI + (i / 8) * Math.PI;
      const tx = Math.cos(angle) * 36;
      const ty = Math.sin(angle) * 22 + 8;
      g.fillStyle(i % 2 ? 0xd3b6e3 : 0xf6dfbd).fillEllipse(tx, ty, 20, 51);
      g.fillStyle(0xfff5e5).fillEllipse(tx, ty - 17, 12, 19);
    }
    g.fillStyle(guest.color).fillTriangle(-26, -12, -28, -48, -5, -28).fillTriangle(26, -12, 28, -48, 5, -28);
    g.fillRoundedRect(-27, -28, 54, 60, 24);
    g.fillStyle(0xe5a5b5).fillTriangle(-22, -26, -23, -40, -12, -28).fillTriangle(22, -26, 23, -40, 12, -28);
    g.fillStyle(0xfff5e5).fillEllipse(0, 12, 40, 26);
    g.fillStyle(0xa85d89).fillTriangle(-5, -18, 0, -10, 5, -18);
  } else if (guest.kind === 'jiangshi') {
    g.fillStyle(0x69538a).fillRoundedRect(-26, 0, 52, 38, 9);
    g.fillStyle(guest.color).fillRoundedRect(-28, -28, 56, 51, 20);
    g.fillStyle(0x3c335c).fillRoundedRect(-29, -44, 58, 23, 8).fillRect(-36, -28, 72, 7);
    g.fillStyle(0xe2b96f).fillCircle(0, -35, 5).fillRect(-6, -22, 12, 25);
    g.lineStyle(2, 0x9e5864).lineBetween(-3, -17, 3, -12).lineBetween(3, -12, -3, -7);
    g.fillStyle(0x69538a).fillRoundedRect(-43, 11, 27, 12, 4).fillRoundedRect(16, 11, 27, 12, 4);
    g.fillStyle(guest.color).fillCircle(-41, 17, 6).fillCircle(41, 17, 6);
    g.fillStyle(0xe2b96f).fillCircle(0, 28, 3);
  } else if (guest.kind === 'lantern') {
    g.lineStyle(4, 0xd5ad73).beginPath().arc(0, -30, 15, Math.PI, Math.PI * 2).strokePath();
    g.fillStyle(guest.color).fillRoundedRect(-33, -31, 66, 64, 24);
    g.lineStyle(2, 0xb05b54, .7);
    for (const yy of [-19, -6, 7, 20]) g.lineBetween(-29, yy, 29, yy);
    g.fillStyle(0x73506a).fillRoundedRect(-20, -35, 40, 7, 3).fillRoundedRect(-20, 28, 40, 7, 3);
    g.fillStyle(0xfff2cd).fillEllipse(0, -7, 26, 25);
    g.fillStyle(ink).fillCircle(0, -7, 7);
    g.fillStyle(0xffffff).fillCircle(-2, -10, 2);
    g.fillStyle(ink).fillEllipse(0, 15, 18, 12);
    g.fillStyle(0xe889a4).fillRoundedRect(0, 15, 8, 16, 4);
    g.lineStyle(3, 0xd5ad73).lineBetween(0, 35, 0, 43);
    g.fillStyle(0xe889a4).fillTriangle(-7, 47, 0, 38, 7, 47);
  } else {
    g.fillStyle(0x4b7f65).fillEllipse(20, 12, 53, 58);
    g.lineStyle(2, 0x31554c).strokeEllipse(20, 12, 43, 48).lineBetween(20, -10, 20, 34);
    g.fillStyle(guest.color).fillRoundedRect(-30, -27, 58, 62, 23);
    g.fillStyle(0xe1d09b).fillEllipse(-1, 20, 30, 23);
    g.fillStyle(0x4b7f65).fillTriangle(-31, -16, -21, -38, -10, -19).fillTriangle(10, -19, 21, -38, 29, -16);
    g.fillStyle(0xe1d09b).fillEllipse(0, -28, 43, 15);
    g.fillStyle(0x83d5e1).fillEllipse(0, -30, 31, 8);
  }
  if (guest.kind !== 'lantern') {
    g.fillStyle(ink).fillCircle(-11, -5, 4).fillCircle(11, -5, 4);
    g.fillStyle(0xfff6e5).fillCircle(-12, -6, 1.5).fillCircle(10, -6, 1.5);
    g.fillStyle(0xe884a6, .65).fillEllipse(-21, 7, 10, 5).fillEllipse(21, 7, 10, 5);
    if (guest.kind === 'kappa') g.fillStyle(0xe9bf6d).fillEllipse(0, 8, 20, 11);
    else g.lineStyle(2, 0x42314e).beginPath().arc(0, 7, 5, 0, Math.PI).strokePath();
  }
  return scene.add.container(x, y, [g]).setSize(110, 110);
}
