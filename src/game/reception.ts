import Phaser from 'phaser';
import type { Save } from '../platform/save';
import { proportionalCrop } from './viewport';
import { reducedMotion } from './art';

/** Cover the physical viewport, so the illustrated furniture is never stretched. */
export function receptionFrame(scene: Phaser.Scene) {
  const texture = scene.textures.get('reception-art'); const source = texture.source[0];
  const name = `reception-${Math.round(scene.scale.width / scene.scale.height * 10000)}`;
  if (!texture.has(name)) {
    const crop = proportionalCrop(source.width, source.height, scene.scale.width, scene.scale.height);
    texture.add(name, 0, Math.floor(crop.x), Math.floor(crop.y), Math.floor(crop.width), Math.floor(crop.height));
  }
  return name;
}
export function drawReception(scene: Phaser.Scene, save: Save) {
  scene.add.image(422, 240, 'reception-art', receptionFrame(scene)).setDisplaySize(844, 480).setData('receptionPanel', true);
  // The menu is part of the hotel wall; the artwork remains full bleed behind it.
  const panel = scene.add.graphics();
  panel.fillStyle(0x20172f, .84).fillRoundedRect(421, 74, 339, 393, 30);
  panel.lineStyle(2, 0xb88b68, .7).strokeRoundedRect(425, 78, 331, 385, 27);
  panel.lineStyle(1, 0xe4ba7d, .25).strokeRoundedRect(431, 84, 319, 373, 23);
  if (save.equipped?.includes('velvet-rug')) {
    const rug = scene.add.graphics(); rug.fillStyle(0x793250, .95).fillEllipse(244, 441, 360, 67);
    rug.lineStyle(3, 0xedc483).strokeEllipse(244, 441, 340, 52);
    rug.lineStyle(1, 0xcf849a).strokeEllipse(244, 441, 315, 41);
    rug.fillStyle(0xedc483).fillTriangle(244, 426, 231, 441, 244, 456).fillTriangle(244, 426, 257, 441, 244, 456);
  }
  if (save.equipped?.includes('moon-lamps')) {
    for (const x of [48, 406]) {
      const lamp = scene.add.graphics();
      lamp.lineStyle(4, 0xb88765).lineBetween(0, 12, 0, 83);
      lamp.fillStyle(0x6e435d).fillEllipse(0, 86, 34, 9);
      lamp.fillStyle(0xffd77c, .13).fillCircle(0, 0, 29);
      lamp.fillStyle(0xffe2a0).fillCircle(0, 0, 16);
      lamp.fillStyle(0x53384e).fillCircle(6, -5, 13);
      scene.add.container(x, 298, [lamp]).setData('viewportAspect', true);
    }
  }
  if (save.equipped?.includes('star-sign')) {
    const cord = scene.add.graphics(); cord.lineStyle(2, 0xe7ba79).lineBetween(242, 98, 400, 108);
    for (let i = 0; i < 5; i++) scene.add.star(250 + i * 34, 113 + i * 2, 5, 3, i === 2 ? 12 : 7, 0xffdfa0).setStrokeStyle(1, 0x8f5c60).setData('viewportAspect', true);
  }
  if (!reducedMotion()) {
    for (let i = 0; i < 5; i++) {
      const mote = scene.add.star(95 + i * 57, 106 + (i % 3) * 48, 4, 1, 3, 0xffe5ad, .5).setData('viewportAspect', true);
      scene.tweens.add({ targets: mote, alpha: .12, y: mote.y - 7, duration: 1600 + i * 170, delay: i * 180, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  }
}
