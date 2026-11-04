import Phaser from 'phaser';
import { guests } from '../domain/puzzle';
import type { StoryChoice } from '../domain/storyNight';
import { drawMonster } from './drawMonster';
import { reducedMotion } from './art';
import { celebrate } from './storyProps';
/** Two guests, changing poses, a live linen curve and a bouncing toy share one scene clock. */
export function storyCinema(scene: Phaser.Scene, onIntroDone: () => void) {
  const wolfShadow = scene.add.ellipse(240, 298, 120, 19, 0x221329, .22).setData('viewportAspect', true);
  const mummyShadow = scene.add.ellipse(575, 298, 112, 18, 0x221329, .22).setData('viewportAspect', true);
  const wolf = drawMonster(scene, 240, 220, guests[0]).setScale(1.45).setData('viewportAspect', true);
  const mummy = drawMonster(scene, 575, 230, guests[3]).setScale(1.4).setData('viewportAspect', true);
  const watcher = drawMonster(scene, 745, 200, guests[2], 'room').setScale(.75).setData('viewportAspect', true);
  const dou = drawMonster(scene, 82, 242, guests[1], 'room').setScale(.8).setData('viewportAspect', true);
  (mummy.getData('body') as Phaser.GameObjects.Image)?.setFlipX(true);
  const linen = scene.add.graphics().setDepth(2); const rope = { retract: 0, wave: 0 };
  const repaint = () => {
    linen.clear(); wolfShadow.setX(wolf.x).setAlpha(.16 + (wolf.y - 198) / 250).setScale(.75 + (wolf.y - 198) / 180); mummyShadow.setX(mummy.x);
    const endX = wolf.x + 20; const endY = wolf.y - 35; const startX = mummy.x - 58; const startY = mummy.y + ((mummy.getData('body') as Phaser.GameObjects.Image).frame.name === '2' ? 25 : -14);
    const tx = endX + (startX - endX) * rope.retract; const ty = endY + (startY - endY) * rope.retract;
    for (const [width, color] of [[8, 0x8d6c71], [5, 0xffefd0]]) {
      linen.lineStyle(width, color as number, 1 - rope.retract * .75).beginPath().moveTo(startX, startY);
      for (let i = 1; i <= 28; i++) { const f = i / 28; linen.lineTo(startX + (tx - startX) * f, startY + (ty - startY) * f + Math.sin(f * Math.PI) * (23 + Math.sin(f * 13 + rope.wave) * 6) * (1 - rope.retract)); }
      linen.strokePath();
    }
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, repaint);
  linen.once(Phaser.GameObjects.Events.DESTROY, () => scene.events.off(Phaser.Scenes.Events.UPDATE, repaint));
  repaint();
  const pose = (actor: Phaser.GameObjects.Container, frame: number) => (actor.getData('setPose') as (p: number) => void)?.(frame);
  if (reducedMotion()) { pose(wolf, 3); pose(mummy, 1); onIntroDone(); }
  else {
    scene.tweens.add({ targets: rope, wave: Math.PI * 2, duration: 1600, repeat: -1 });
    pose(wolf, 2); pose(mummy, 1);
    scene.tweens.chain({ targets: wolf, tweens: [{ x: 340, y: 198, angle: -5, duration: 600, ease: 'Sine.easeInOut' }, { x: 258, y: 230, angle: 0, duration: 650, ease: 'Sine.easeInOut' }], onComplete: () => { pose(wolf, 3); onIntroDone(); } });
    scene.tweens.add({ targets: mummy, x: 548, y: 219, duration: 600, yoyo: true, ease: 'Sine.easeInOut' });
  }
  return {
    skipIntro() { scene.tweens.killTweensOf(wolf); scene.tweens.killTweensOf(mummy); wolf.setPosition(258, 230).setAngle(0); mummy.setPosition(575, 230); pose(wolf, 3); onIntroDone(); },
    choose(choice: StoryChoice, done: () => void) {
      if (reducedMotion()) { pose(wolf, 3); pose(mummy, 3); rope.retract = 1; repaint(); done(); return; }
      if (choice === 'play') {
        const ball = scene.add.container(410, 278, [scene.add.circle(0, 0, 17, 0xe0b168).setStrokeStyle(3, 0x684466), scene.add.star(0, 0, 5, 4, 9, 0x956fb0)]).setData('viewportAspect', true);
        scene.tweens.add({ targets: rope, retract: 1, duration: 1100, ease: 'Sine.easeInOut' }); pose(mummy, 2); pose(wolf, 1);
        scene.tweens.chain({ targets: ball, tweens: [{ x: 320, y: 170, angle: -150, duration: 650, ease: 'Sine.easeOut' }, { x: 190, y: 282, angle: -280, duration: 600, ease: 'Sine.easeIn' }, { x: 265, y: 235, angle: -360, duration: 400, ease: 'Sine.easeOut' }, { x: 310, y: 282, angle: -420, duration: 450, ease: 'Bounce.easeOut' }] });
        scene.tweens.chain({ targets: wolf, tweens: [{ x: 315, y: 201, duration: 600, onStart: () => pose(wolf, 2) }, { x: 190, y: 240, duration: 650, ease: 'Sine.easeInOut' }, { x: 310, y: 230, duration: 700, ease: 'Sine.easeInOut', onStart: () => pose(wolf, 2) }, { y: 245, duration: 300, ease: 'Bounce.easeOut' }], onComplete: () => { pose(wolf, 3); pose(mummy, 3); celebrate(scene, wolf.x, wolf.y - 55); celebrate(scene, mummy.x, mummy.y - 55); scene.time.delayedCall(1300, done); } });
      } else {
        pose(wolf, 1); pose(mummy, 1);
        scene.tweens.chain({ targets: wolf, tweens: [{ x: 320, y: 230, duration: 700, ease: 'Sine.easeInOut' }, { x: 285, y: 218, duration: 500, yoyo: true, repeat: 1, ease: 'Sine.easeInOut', onStart: () => pose(wolf, 2) }, { x: 345, y: 238, duration: 500, ease: 'Sine.easeInOut' }], onComplete: () => { pose(wolf, 3); pose(mummy, 3); rope.retract = 1; celebrate(scene, 405, 160); scene.time.delayedCall(1100, done); } });
        scene.tweens.chain({ targets: mummy, tweens: [{ x: 510, y: 230, duration: 700, ease: 'Sine.easeInOut' }, { x: 550, y: 220, duration: 500, yoyo: true, repeat: 1, ease: 'Sine.easeInOut', onStart: () => pose(mummy, 2) }, { x: 495, y: 238, duration: 500, ease: 'Sine.easeInOut' }] });
      }
      scene.tweens.add({ targets: watcher, y: 165, duration: 500, yoyo: true, repeat: 2, ease: 'Sine.easeInOut' });
      scene.tweens.add({ targets: dou, y: 220, duration: 300, yoyo: true, repeat: 2, ease: 'Sine.easeInOut' });
    },
  };
}
