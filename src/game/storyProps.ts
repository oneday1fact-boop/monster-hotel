import Phaser from 'phaser';
import type { Equipment } from '../domain/storyNight';
import { reducedMotion } from './art';
export function drawToyBasket(scene: Phaser.Scene, x: number, y: number, scale = 1) {
  const g = scene.add.graphics();
  g.fillStyle(0x9e6077).fillRoundedRect(-45, -10, 90, 36, 12); g.lineStyle(3, 0x4c2b4b).strokeRoundedRect(-45, -10, 90, 36, 12);
  for (let i = -32; i < 40; i += 12) g.lineStyle(2, 0xd6a978, .7).lineBetween(i, -3, i + 10, 22);
  g.fillStyle(0xe5b963).fillEllipse(-24, -13, 27, 27); g.fillStyle(0x9b7fca).fillEllipse(7, -17, 28, 28); g.fillStyle(0xd9879e).fillEllipse(29, -10, 22, 22);
  g.lineStyle(3, 0xf8dc99).strokeEllipse(7, -17, 27, 27); g.lineStyle(4, 0xe2b887).lineBetween(-43, -5, 43, -5);
  return scene.add.container(x, y, [g]).setScale(scale).setData('viewportAspect', true);
}
export function drawStorySupplies(scene: Phaser.Scene, id: string, equipment: Equipment, x: number, y: number, scale = 1) {
  const g = scene.add.graphics();
  if (equipment.curtain === id) {
    g.lineStyle(4, 0xf1c482).lineBetween(-40, -40, 40, -40);
    g.fillStyle(0x714c91, .97).fillRoundedRect(-38, -38, 29, 74, 8).fillRoundedRect(9, -38, 29, 74, 8);
    g.lineStyle(2, 0xb58dce).lineBetween(-27, -34, -27, 32).lineBetween(27, -34, 27, 32);
    g.lineStyle(3, 0xf1c482).lineBetween(-38, 12, -12, 17).lineBetween(12, 17, 38, 12);
  }
  if (equipment.moonLamp === id) {
    g.fillStyle(0xffe4a0, .12).fillCircle(0, -2, 49); g.lineStyle(5, 0xe8bb78).lineBetween(0, 11, 0, 41);
    g.fillStyle(0x765367).fillEllipse(0, 43, 44, 11); g.fillStyle(0xffedb6).fillCircle(0, -8, 21); g.fillStyle(0x513550).fillCircle(8, -15, 18);
  }
  const prop = scene.add.container(x, y, [g]).setScale(scale).setData('viewportAspect', true);
  if (!reducedMotion() && equipment.moonLamp === id) scene.tweens.add({ targets: g, alpha: .78, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  return prop;
}
export function celebrate(scene: Phaser.Scene, x: number, y: number) {
  if (reducedMotion()) return;
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * 2 * i / 9; const star = scene.add.star(x, y, 5, 2, 6, i % 2 ? 0xffdd9e : 0xf7a6bb).setData('viewportAspect', true);
    scene.tweens.add({ targets: star, x: x + Math.cos(a) * 58, y: y + Math.sin(a) * 42 - 12, angle: 100, alpha: 0, duration: 800, onComplete: () => star.destroy() });
  }
}
