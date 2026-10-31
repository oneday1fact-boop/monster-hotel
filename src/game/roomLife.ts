import Phaser from 'phaser';
import type { Room } from '../domain/puzzle';
import { roomPoint, roomStyle } from './layout';
import { reducedMotion } from './art';
/** Tiny local animation layers bring each room to life without changing puzzle conditions. */
export function drawRoomLife(scene: Phaser.Scene, room: Room) {
  if (reducedMotion()) return;
  const p = roomPoint(room); const style = roomStyle(room);
  if (style === 'hearth') {
    const flame = scene.add.graphics();
    flame.fillStyle(0xffd56c, .8).fillTriangle(-8, 9, -3, -10, 8, 9);
    flame.fillStyle(0xfff0ac, .9).fillTriangle(-3, 8, 1, -3, 5, 8);
    const glow = scene.add.circle(0, 0, 15, 0xffb55b, .12);
    const fire = scene.add.container(p.x - 5, p.y + 15, [glow, flame]).setData('viewportAspect', true);
    scene.tweens.add({ targets: flame, scaleY: .72, angle: 3, duration: 370, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    scene.tweens.add({ targets: glow, alpha: .35, duration: 650, yoyo: true, repeat: -1 });
    fire.setAlpha(.9);
  } else if (style === 'elegant') {
    for (let i = 0; i < 3; i++) {
      const sparkle = scene.add.star(p.x - 45 + i * 14, p.y - 18 + i * 6, 4, 1, 3, 0xffecad, .6).setData('viewportAspect', true);
      scene.tweens.add({ targets: sparkle, alpha: .1, angle: 45, duration: 900 + i * 200, delay: i * 160, yoyo: true, repeat: -1 });
    }
  } else if (style === 'basement') {
    const wisp = scene.add.container(p.x - 23, p.y - 15, [scene.add.circle(0, 0, 8, 0xbbd6de, .12), scene.add.circle(0, 0, 2, 0xe3f7ef, .65)]).setData('viewportAspect', true);
    scene.tweens.add({ targets: wisp, x: p.x - 14, y: p.y - 20, alpha: .35, duration: 1900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  } else {
    const butterfly = scene.add.graphics(); butterfly.fillStyle(0xb69acb).fillEllipse(-3, 0, 6, 9).fillEllipse(3, 0, 6, 9);
    const flight = scene.add.container(p.x + 115, p.y - 9, [butterfly]).setData('viewportAspect', true);
    scene.tweens.add({ targets: butterfly, scaleX: .3, duration: 180, yoyo: true, repeat: -1 });
    scene.tweens.add({ targets: flight, x: p.x + 101, y: p.y - 20, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
}
