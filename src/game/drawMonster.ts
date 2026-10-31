import Phaser from 'phaser';
import type { Guest } from '../domain/puzzle';

/** Original geometric silhouettes inspired by folklore, with no external art dependencies. */
export function drawMonster(scene: Phaser.Scene, x: number, y: number, guest: Guest) {
  const g = scene.add.graphics();
  const ink = 0x29203c;
  if (guest.kind === 'werewolf') {
    // A single fluffy tail, pointed ears, muzzle and two small fangs.
    g.fillStyle(0x8b87b6).fillEllipse(30, 22, 38, 23);
    g.fillStyle(0xe6e4f4).fillEllipse(43, 18, 16, 18);
    g.fillStyle(guest.color).fillRoundedRect(-27, -9, 54, 48, 19);
    g.fillTriangle(-28, -12, -28, -47, -6, -28).fillTriangle(28, -12, 28, -47, 6, -28);
    g.fillRoundedRect(-31, -29, 62, 55, 22);
    g.fillStyle(0xd698b1).fillTriangle(-22, -27, -23, -39, -13, -27).fillTriangle(22, -27, 23, -39, 13, -27);
    g.fillStyle(0xe6e4f4).fillTriangle(-8, -28, 0, -15, 8, -28).fillEllipse(0, 12, 41, 25).fillEllipse(0, 29, 26, 18);
    g.fillStyle(0x575172).fillTriangle(-5, 3, 5, 3, 0, 9);
    g.fillStyle(0xffffff).fillTriangle(-13, 12, -7, 12, -10, 20).fillTriangle(7, 12, 13, 12, 10, 20);
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
    // Rounded linen wraps, an oversized eye opening and a loose bow-tied strip.
    g.fillStyle(0xe4cfab).fillRoundedRect(23, 19, 27, 11, 5);
    g.fillStyle(guest.color).fillEllipse(-18, 37, 23, 13).fillEllipse(18, 37, 23, 13);
    g.fillRoundedRect(-28, 0, 56, 38, 17).fillRoundedRect(-33, -36, 66, 61, 25);
    g.lineStyle(2, 0xc8b495);
    for (const yy of [-27, -18, 20, 29]) g.lineBetween(-25, yy, 25, yy + 3);
    g.lineBetween(-22, -34, 19, -19).lineBetween(-23, 23, 21, 9);
    g.fillStyle(ink).fillRoundedRect(-26, -16, 52, 24, 11);
    g.fillStyle(0xc1a2cf).fillTriangle(35, 23, 49, 13, 48, 32).fillTriangle(35, 23, 23, 13, 23, 32);
    g.fillStyle(0xf2cc83).fillCircle(35, 23, 4);
  }
  if (guest.kind !== 'lantern') {
    if (guest.kind === 'mummy') {
      g.fillStyle(0xfff8e6).fillEllipse(-11, -5, 17, 19).fillEllipse(11, -5, 17, 19);
      g.fillStyle(ink).fillCircle(-10, -4, 5).fillCircle(12, -4, 5);
    } else g.fillStyle(ink).fillCircle(-11, -5, 4).fillCircle(11, -5, 4);
    g.fillStyle(0xfff6e5).fillCircle(-12, -6, 1.5).fillCircle(10, -6, 1.5);
    g.fillStyle(0xe884a6, .65).fillEllipse(-21, 7, 10, 5).fillEllipse(21, 7, 10, 5);
    g.lineStyle(2, 0x42314e).beginPath().arc(0, 7, 5, 0, Math.PI).strokePath();
  }
  return scene.add.container(x, y, [g]).setSize(110, 110);
}
