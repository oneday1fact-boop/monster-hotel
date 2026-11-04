import Phaser from 'phaser';
/** Render up to two device pixels per CSS pixel without changing pointer coordinates. */
export function displayDensity() { return Math.max(1, Math.min(2, window.devicePixelRatio || 1)); }
export function attachDisplay(game: Phaser.Game) {
  const parent = document.getElementById('game')!;
  let width = 0; let height = 0; let density = 0;
  const resize = () => {
    const box = parent.getBoundingClientRect(); const ratio = displayDensity();
    const w = Math.max(1, Math.round(box.width * ratio)); const h = Math.max(1, Math.round(box.height * ratio));
    if (w === width && h === height && density === ratio) return;
    width = w; height = h; density = ratio;
    game.scale.zoom = 1 / ratio; game.scale.resize(w, h);
  };
  const observer = new ResizeObserver(resize); observer.observe(parent); window.addEventListener('resize', resize); resize();
  game.events.once(Phaser.Core.Events.DESTROY, () => { observer.disconnect(); window.removeEventListener('resize', resize); });
}
