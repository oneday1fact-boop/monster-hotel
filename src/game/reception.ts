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
export function drawReception(scene: Phaser.Scene, save: Save, menuPanel = true) {
  scene.add.image(422, 240, 'reception-art', receptionFrame(scene)).setDisplaySize(844, 480).setData('receptionPanel', true);
  if (menuPanel) {
    // The menu is part of the hotel wall; the artwork remains full bleed behind it.
    const panel = scene.add.graphics();
    panel.fillStyle(0x20172f, .84).fillRoundedRect(421, 74, 339, 393, 30);
    panel.lineStyle(2, 0xb88b68, .7).strokeRoundedRect(425, 78, 331, 385, 27);
    panel.lineStyle(1, 0xe4ba7d, .25).strokeRoundedRect(431, 84, 319, 373, 23);
  }
  if (scene.textures.exists('decor-art')) {
    if (save.equipped?.includes('velvet-rug')) scene.add.image(244, 440, 'decor-art', 'velvet-rug').setDisplaySize(330, 85);
    if (save.equipped?.includes('moon-lamps')) {
      const frame = scene.textures.get('decor-art').get('moon-lamps');
      for (const x of [48, 406]) scene.add.image(x, 386, 'decor-art', 'moon-lamps').setOrigin(.5, 1).setDisplaySize(118 * frame.width / frame.height, 118).setData('viewportAspect', true);
    }
    if (save.equipped?.includes('star-sign')) {
      const frame = scene.textures.get('decor-art').get('star-sign');
      scene.add.image(325, 126, 'decor-art', 'star-sign').setDisplaySize(180, 180 * frame.height / frame.width).setData('viewportAspect', true);
    }
  }
  if (save.stories?.[2]) {
    for (let i = 0; i < 7; i++) {
      const light = scene.add.star(125 + i * 55, 135 + Math.sin(i) * 24, 4, 2, 5, 0xffe39a).setData('viewportAspect', true);
      if (!reducedMotion()) scene.tweens.add({ targets: light, y: light.y - 12, alpha: .35, duration: 1200 + i * 90, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  }
  if (save.stories?.[3]) {
    for (let i = 0; i < 5; i++) scene.add.star(270 + i * 45, 410 + Math.sin(i) * 9, 5, 2, 7, 0xf1aaca, .8).setData('viewportAspect', true);
  }
  if (!reducedMotion()) {
    for (let i = 0; i < 5; i++) {
      const mote = scene.add.star(95 + i * 57, 106 + (i % 3) * 48, 4, 1, 3, 0xffe5ad, .5).setData('viewportAspect', true);
      scene.tweens.add({ targets: mote, alpha: .12, y: mote.y - 7, duration: 1600 + i * 170, delay: i * 180, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  }
}
