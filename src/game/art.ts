import Phaser from 'phaser';
import { viewportMetrics, proportionalCrop } from './viewport';
import { roomStyle, roomWidth, roomHeight } from './layout';
import type { Guest, Room } from '../domain/puzzle';
export const guestFrames: readonly Guest['kind'][] = ['werewolf', 'jiangshi', 'lantern', 'mummy'];
/** Runtime atlas frames preserve the original, unmodified artwork files. */
export function registerArt(scene: Phaser.Scene) {
  for (const [key, frames] of [['guests-art', guestFrames]] as const) {
    if (!scene.textures.exists(key)) continue;
    const texture = scene.textures.get(key); const source = texture.source[0];
    const w = source.width / 2; const h = source.height / 2;
    const canvas = document.createElement('canvas'); canvas.width = source.width; canvas.height = source.height;
    const context = canvas.getContext('2d', { willReadFrequently: true })!;
    context.drawImage(source.image as HTMLImageElement, 0, 0);
    const pixels = context.getImageData(0, 0, source.width, source.height).data;
    frames.forEach((name, i) => {
      const left = (i % 2) * w; const top = Math.floor(i / 2) * h;
      if (!texture.has(name)) texture.add(name, 0, left, top, w, h);
      let x0 = w, y0 = h, x1 = 0, y1 = 0;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (pixels[((top + y) * source.width + left + x) * 4 + 3] > 128) {
        x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
      }
      if (!texture.has(`${name}-tight`) && x1 > x0) texture.add(`${name}-tight`, 0, left + x0, top + y0, x1 - x0 + 1, y1 - y0 + 1);
    });
  }
  for (const kind of [...guestFrames, 'fox', 'baku']) {
    const key = `pose-${kind}`; if (!scene.textures.exists(key)) continue;
    const texture = scene.textures.get(key); const source = texture.source[0]; const w = source.width / 2; const h = source.height / 2;
    const canvas = document.createElement('canvas'); canvas.width = source.width; canvas.height = source.height;
    const context = canvas.getContext('2d', { willReadFrequently: true })!; context.drawImage(source.image as HTMLImageElement, 0, 0);
    const pixels = context.getImageData(0, 0, source.width, source.height).data;
    for (let pose = 0; pose < 4; pose++) {
      const name = String(pose); if (texture.has(name)) continue;
      const left = pose % 2 * w; const top = Math.floor(pose / 2) * h; let foot = h - 1;
      outer: for (let y = h - 1; y >= 0; y--) for (let x = 0; x < w; x++) if (pixels[((top + y) * source.width + left + x) * 4 + 3] > 192) { foot = y; break outer; }
      const frame = texture.add(name, 0, left, top, w, h); if (frame) frame.customData = { foot: (foot + 1) / h };
    }
  }
  if (scene.textures.exists('decor-art')) {
    const texture = scene.textures.get('decor-art'); const source = texture.source[0];
    const canvas = document.createElement('canvas'); canvas.width = source.width; canvas.height = source.height;
    const context = canvas.getContext('2d', { willReadFrequently: true })!; context.drawImage(source.image as HTMLImageElement, 0, 0);
    const pixels = context.getImageData(0, 0, source.width, source.height).data; const w = Math.floor(source.width / 3);
    ['moon-lamps', 'velvet-rug', 'star-sign'].forEach((id, i) => {
      if (texture.has(id)) return;
      let x0 = w, y0 = source.height, x1 = 0, y1 = 0;
      for (let y = 0; y < source.height; y++) for (let x = 0; x < w; x++) if (pixels[(y * source.width + i * w + x) * 4 + 3] > 128) { x0 = Math.min(x0,x); y0 = Math.min(y0,y); x1 = Math.max(x1,x); y1 = Math.max(y1,y); }
      if (x1 > x0) texture.add(id, 0, i * w + x0, y0, x1 - x0 + 1, y1 - y0 + 1);
    });
  }
  for (const style of ['elegant', 'linen', 'basement', 'hearth']) {
    const key = `room-${style}`; if (scene.textures.exists(key)) roomFrame(scene, key);
  }
}
export function roomFrame(scene: Phaser.Scene, key: string): string {
  const texture = scene.textures.get(key); const source = texture.source[0];
  const m = viewportMetrics(scene.scale.width, scene.scale.height);
  const physicalWidth = roomWidth * m.x; const physicalHeight = roomHeight * m.y;
  const name = `panel-${Math.round(physicalWidth / physicalHeight * 10000)}`;
  if (!texture.has(name)) {
    const crop = proportionalCrop(source.width, source.height, physicalWidth, physicalHeight);
    texture.add(name, 0, Math.floor(crop.x), Math.floor(crop.y), Math.floor(crop.width), Math.floor(crop.height));
  }
  return name;
}
export function reducedMotion(): boolean { return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false; }
export function portrait(kind: Guest['kind']): HTMLElement {
  const index = guestFrames.indexOf(kind); const image = document.createElement('div'); image.className = 'guest-portrait';
  image.setAttribute('role', 'img'); image.setAttribute('aria-label', kind);
  if (kind === 'fox' || kind === 'baku') { image.style.backgroundImage = `url('/art/${kind}-poses.png')`; image.style.backgroundSize = '200% 200%'; image.style.backgroundPosition = 'left top'; return image; }
  image.style.backgroundPosition = `${index % 2 ? 87.5 : 12.5}% ${index >= 2 ? 87.5 : 12.5}%`;
  return image;
}

export function roomPortrait(room: Room): HTMLElement {
  const image = document.createElement('div'); image.className = 'room-portrait'; image.setAttribute('role', 'img');
  image.style.backgroundImage = `url('/art/rooms/${roomStyle(room)}.png')`;
  return image;
}
