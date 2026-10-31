import Phaser from 'phaser';
import type { Guest } from '../domain/puzzle';

const TAU = Math.PI * 2;
/** Room-local props and choreography. Only children move: the draggable root stays put. */
export function roomActivity(scene: Phaser.Scene, image: Phaser.GameObjects.Image, guest: Guest) {
  const shadow = scene.add.ellipse(0, 44, 72, 14, 0x22172f, .24);
  const behind = scene.add.graphics(); const front = scene.add.graphics();
  const sx = image.scaleX; const sy = image.scaleY;
  const clock = { phase: 0 };
  const star = (g: Phaser.GameObjects.Graphics, x: number, y: number, size: number, color = 0xffe6a0) => {
    g.fillStyle(color).fillTriangle(x, y - size, x - size * .35, y, x + size * .35, y)
      .fillTriangle(x, y + size, x - size * .35, y, x + size * .35, y)
      .fillTriangle(x - size, y, x, y - size * .35, x, y + size * .35)
      .fillTriangle(x + size, y, x, y - size * .35, x, y + size * .35);
  };
  const render = () => {
    const t = clock.phase; const wave = Math.sin(t * TAU); behind.clear(); front.clear();
    image.setPosition(0, 0).setAngle(0).setScale(sx, sy); shadow.setPosition(0, 44).setScale(1).setAlpha(.24);
    if (guest.kind === 'werewolf') {
      // Watch a wandering moonbeam, crouch, pounce, land, then shake off moon dust.
      const chase = Math.max(0, Math.sin(Math.max(0, Math.min(1, (t - .18) / .58)) * Math.PI));
      const leap = Math.max(0, Math.sin(Math.max(0, Math.min(1, (t - .34) / .3)) * Math.PI));
      const crouch = t > .22 && t < .34 ? Math.sin((t - .22) / .12 * Math.PI) : 0;
      image.setPosition(-38 * chase, -27 * leap + 5 * crouch).setAngle(-11 * leap + (t > .8 ? Math.sin(t * TAU * 12) * 3 : 0)).setScale(sx * (1 + crouch * .08), sy * (1 - crouch * .1));
      shadow.setX(image.x).setScale(1 - leap * .3).setAlpha(.24 - leap * .1);
      const lightX = -62 + wave * 13;
      behind.fillStyle(0xffedb2, .14).fillEllipse(lightX, 44, 47, 16);
      behind.fillStyle(0xffefc8, .5).fillEllipse(lightX, 43, 26, 7);
      star(front, lightX, 30, 6 + wave * 2);
      if (t > .55 && t < .85) for (let i = 0; i < 3; i++) star(front, image.x - 23 + i * 23, -15 - (t - .55) * 55, 3, 0xffe9b5);
    } else if (guest.kind === 'jiangshi') {
      // Three little practice hops, with a paper charm flutter and landing ripples.
      const cycle = (t * 3) % 1; const hopping = t < .8;
      const jump = hopping ? Math.sin(Math.min(1, cycle / .75) * Math.PI) : 0;
      image.setPosition(wave * 8, -29 * jump).setAngle(hopping ? Math.sin(cycle * TAU) * 4 : wave * 2);
      shadow.setScale(1 - jump * .28).setAlpha(.24 - jump * .1);
      behind.lineStyle(2, 0xe6ca8d, .38).strokeEllipse(0, 46, 82, 18);
      if (hopping && cycle > .75) behind.lineStyle(2, 0xd7e8c1, 1 - (cycle - .75) * 4).strokeEllipse(image.x, 45, 65 + cycle * 25, 12 + cycle * 8);
      front.fillStyle(0xffdf8d).fillPoints([{ x: image.x - 5, y: image.y - 29 }, { x: image.x + 7, y: image.y - 29 }, { x: image.x + 10 + jump * 8, y: image.y - 10 }, { x: image.x - 3 + jump * 8, y: image.y - 8 }], true);
      front.lineStyle(2, 0xa65c6a).lineBetween(image.x + 1, image.y - 25, image.x + 5 + jump * 4, image.y - 17);
      if (!hopping) star(front, 35, -25, 5);
    } else if (guest.kind === 'lantern') {
      // Catch and release three warm fireflies, then twirl in their glow.
      image.setPosition(wave * 9, -10 + Math.cos(t * TAU * 2) * 8).setAngle(wave * 13);
      behind.fillStyle(0xffc269, .12 + (wave + 1) * .045).fillCircle(image.x, image.y, 55);
      shadow.setScale(.8 + wave * .1).setAlpha(.15);
      for (let i = 0; i < 3; i++) {
        const a = t * TAU + i * TAU / 3; const x = Math.cos(a) * 64; const y = -16 + Math.sin(a) * 39;
        const layer = Math.sin(a) < 0 ? behind : front;
        layer.fillStyle(0xffc865, .18).fillCircle(x, y, 11);
        layer.fillStyle(0xffe5a0).fillEllipse(x, y, 7, 11).fillStyle(0xfffbda).fillCircle(x, y - 2, 2);
        layer.lineStyle(2, 0xffc16f, .45).lineBetween(x - Math.cos(a - .3) * 8, y - Math.sin(a - .3) * 8, x, y);
      }
    } else {
      // Pull a loose linen strip from a spool, wind it up, and admire the neat bow.
      const pull = (1 - Math.cos(t * TAU)) / 2;
      image.setPosition(9 * pull, -3 * Math.sin(t * TAU * 2)).setAngle(-7 * wave);
      const spoolX = -64 + pull * 9; const spoolY = 33;
      behind.lineStyle(6, 0xc9ae85).lineBetween(spoolX, spoolY - 13, spoolX, spoolY + 10);
      behind.fillStyle(0xffedc6).fillRoundedRect(spoolX - 11, spoolY - 10, 22, 20, 5);
      behind.lineStyle(2, 0xc6ab87).lineBetween(spoolX - 9, spoolY - 3, spoolX + 9, spoolY - 3).lineBetween(spoolX - 9, spoolY + 3, spoolX + 9, spoolY + 3);
      front.lineStyle(6, 0xc3a582).beginPath().moveTo(spoolX + 10, spoolY).lineTo(-24, 38 + pull * 9).lineTo(16 + pull * 12, 19).strokePath();
      front.lineStyle(4, 0xfff0cf).beginPath().moveTo(spoolX + 10, spoolY - 1).lineTo(-24, 37 + pull * 9).lineTo(16 + pull * 12, 18).strokePath();
      if (t > .75) { const x = 29; const y = 17; front.fillStyle(0xc3a1d6).fillTriangle(x, y, x - 13, y - 8, x - 13, y + 8).fillTriangle(x, y, x + 13, y - 8, x + 13, y + 8); front.fillStyle(0xffd887).fillCircle(x, y, 4); star(front, 47, 1, 4); }
    }
  };
  render();
  const tween = scene.tweens.add({ targets: clock, phase: 1, duration: { werewolf: 5600, jiangshi: 4400, lantern: 6200, mummy: 5800 }[guest.kind], repeat: -1, onUpdate: render });
  // Scene redraws and dragging destroy the actor; never retain its graphics in a timer.
  image.once(Phaser.GameObjects.Events.DESTROY, () => tween.remove());
  return [shadow, behind, image, front];
}
