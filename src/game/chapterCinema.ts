import Phaser from 'phaser';
import { guests } from '../domain/puzzle';
import type { StoryChoice } from '../domain/storyNight';
import { drawMonster } from './drawMonster';
import { reducedMotion } from './art';
import { celebrate } from './storyProps';
/** Each follow-up has its own actors, prop animation and two distinct choreographies. */
export function chapterCinema(scene: Phaser.Scene, chapter: 2 | 3, introDone: () => void) {
  const actors = guests.map((g, i) => drawMonster(scene, [190, 370, 650, 540][i], [235, 240, 210, 240][i], g).setScale(i === 1 || i === 2 ? 1.15 : .95).setData('viewportAspect', true));
  const [wolf, dou, ember, rollo] = actors;
  const pose = (actor: Phaser.GameObjects.Container, n: number) => (actor.getData('setPose') as (p: number) => void)(n);
  const lights = Array.from({ length: 9 }, (_, i) => scene.add.star(110 + i * 72, 180 + Math.sin(i) * 42, 4, 2, 5, chapter === 2 ? 0xffdb7c : 0xf3b9de).setAlpha(.3).setData('viewportAspect', true));
  if (chapter === 2) {
    const dark = scene.add.rectangle(422, 240, 844, 480, 0x11132e, .2).setDepth(-.1);
    if (!reducedMotion()) scene.tweens.add({ targets: dark, alpha: .04, duration: 900, yoyo: true, repeat: 1 });
    pose(ember, 1); pose(wolf, 1);
  } else { pose(dou, 1); pose(rollo, 2); }
  let timer: Phaser.Time.TimerEvent | undefined;
  const ready = () => { timer?.remove(); introDone(); };
  if (reducedMotion()) ready(); else timer = scene.time.delayedCall(950, ready);
  return {
    skipIntro: ready,
    choose(choice: StoryChoice, done: () => void) {
      if (reducedMotion()) { actors.forEach(a => pose(a, 3)); done(); return; }
      lights.forEach((light, i) => scene.tweens.add({ targets: light, y: light.y - 38, alpha: 1, angle: 90, duration: 700, delay: i * 90, yoyo: true, repeat: 1, ease: 'Sine.easeInOut' }));
      if (chapter === 2 && choice === 'play') {
        // Ember guides the path; Luno follows, with the other two waving goodbye.
        pose(ember, 2); pose(wolf, 2); pose(dou, 3); pose(rollo, 3);
        scene.tweens.chain({ targets: ember, tweens: [{ x: 450, y: 155, duration: 1100, ease: 'Sine.easeInOut' }, { x: 270, y: 200, duration: 1100, ease: 'Sine.easeInOut' }] });
        scene.tweens.chain({ targets: wolf, tweens: [{ x: 340, y: 245, duration: 1100, ease: 'Sine.easeInOut' }, { x: 430, y: 225, duration: 1100, ease: 'Sine.easeInOut' }] });
      } else if (chapter === 2) {
        // Four separate lights bloom from the guests and meet at the ceiling.
        actors.forEach((actor, i) => { pose(actor, 3); const star = scene.add.star(actor.x, actor.y - 35, 5, 7, 15, 0xffdda0).setData('viewportAspect', true); scene.tweens.add({ targets: star, x: 250 + i * 112, y: 130, angle: 180, scale: 1.35, duration: 1600, delay: i * 160, ease: 'Sine.easeInOut' }); scene.tweens.add({ targets: actor, y: actor.y - 12, duration: 450, yoyo: true, delay: i * 140, ease: 'Sine.easeInOut' }); });
      } else {
        const dancing = choice === 'play' ? [dou] : actors;
        const ribbon = scene.add.graphics(); const clock = { t: 0 };
        const paint = () => { ribbon.clear().lineStyle(5, 0xf3b2d4, .85).beginPath(); for (let i = 0; i <= 42; i++) { const x = rollo.x - 75 + i * 3; const y = rollo.y - 30 + Math.sin(i / 7 + clock.t) * 17; if (i === 0) ribbon.moveTo(x,y); else ribbon.lineTo(x,y); } ribbon.strokePath(); };
        scene.events.on(Phaser.Scenes.Events.UPDATE, paint); ribbon.once('destroy', () => scene.events.off(Phaser.Scenes.Events.UPDATE, paint));
        scene.tweens.add({ targets: clock, t: Math.PI * 5, duration: 3200 });
        dancing.forEach((actor, i) => { pose(actor, 2); scene.tweens.add({ targets: actor, y: actor.y - 30, angle: i % 2 ? 5 : -5, duration: 380, delay: i * 130, yoyo: true, repeat: 3, ease: 'Sine.easeInOut' }); });
        if (choice === 'play') { pose(rollo, 1); pose(wolf, 3); pose(ember, 3); }
      }
      scene.time.delayedCall(3500, () => { actors.forEach(a => { pose(a, 3); celebrate(scene, a.x, a.y - 50); }); scene.time.delayedCall(800, done); });
    },
  };
}
