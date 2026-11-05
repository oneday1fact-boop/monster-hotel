import Phaser from 'phaser';
import type { Save } from '../platform/save';
import { proportionalCrop } from './viewport';
import { lobbyAmbience, receptionKey, type Ambience } from '../domain/ambience';
import { drawLobbyDecorations } from './roomDecor';
import { reducedMotion } from './art';

/** Cover the physical viewport, so the illustrated furniture is never stretched. */
export function receptionFrame(scene: Phaser.Scene, key = 'reception-art') {
  const texture = scene.textures.get(key); const source = texture.source[0];
  const name = `reception-${Math.round(scene.scale.width / scene.scale.height * 10000)}`;
  if (!texture.has(name)) {
    const crop = proportionalCrop(source.width, source.height, scene.scale.width, scene.scale.height);
    texture.add(name, 0, Math.floor(crop.x), Math.floor(crop.y), Math.floor(crop.width), Math.floor(crop.height));
  }
  return name;
}
export function drawReception(scene: Phaser.Scene, save: Save, menuPanel = true, theme: Ambience = lobbyAmbience(save)) {
  const key = receptionKey(theme);
  scene.add.image(422, 240, key, receptionFrame(scene, key)).setDisplaySize(844, 480).setData('receptionPanel', true).setData('receptionKey', key);
  scene.game.canvas.dataset.ambience = theme;
  document.documentElement.style.setProperty('--hotel-backdrop', `url('/art/${theme === 'night' ? 'reception.png' : `seasons/reception-${theme}.png`}')`);
  if (theme !== 'night') for (let i=0;i<12;i++) {
    const x=22+(i*31)%100;const y=88+(i*47)%235;
    const particle = theme === 'autumn' ? scene.add.ellipse(x,y,4,7,0xe5a05d,.7) : theme === 'winter' ? scene.add.star(x,y,6,1,3,0xeafaff,.8) : scene.add.ellipse(x,y,5,3,0xffd6e3,.6);
    particle.setData('viewportAspect',true);
    if (!reducedMotion()) scene.tweens.add({targets:particle,x:x+9,y:Math.min(328,y+40),angle:theme==='winter'?90:35,alpha:0,duration:2400+i*90,delay:i*100,repeat:-1,ease:'Sine.easeInOut'});
  }
  drawLobbyDecorations(scene,save);
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
