import Phaser from 'phaser';
import { roomStyle } from './layout';
import type { Guest, Room } from '../domain/puzzle';
export const guestFrames: readonly Guest['kind'][] = ['werewolf', 'jiangshi', 'lantern', 'mummy'];
/** Runtime atlas frames preserve the original, unmodified artwork files. */
export function registerArt(scene: Phaser.Scene) {
  for (const [key, frames] of [['guests-art', guestFrames]] as const) {
    if (!scene.textures.exists(key)) continue;
    const texture = scene.textures.get(key); const source = texture.source[0];
    const w = source.width / 2; const h = source.height / 2;
    frames.forEach((name, i) => { if (!texture.has(name)) texture.add(name, 0, (i % 2) * w, Math.floor(i / 2) * h, w, h); });
  }
}
export function reducedMotion(): boolean { return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false; }
export function portrait(kind: Guest['kind']): HTMLElement {
  const index = guestFrames.indexOf(kind); const image = document.createElement('div'); image.className = 'guest-portrait';
  image.setAttribute('role', 'img'); image.setAttribute('aria-label', kind);
  image.style.backgroundPosition = `${index % 2 ? 100 : 0}% ${index >= 2 ? 100 : 0}%`;
  return image;
}

export function roomPortrait(room: Room): HTMLElement {
  const image = document.createElement('div'); image.className = 'room-portrait'; image.setAttribute('role', 'img');
  image.style.backgroundImage = `url('/art/rooms/${roomStyle(room)}.svg')`;
  return image;
}
