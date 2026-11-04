export const iconPaths = {
  zoom: '<circle cx="10" cy="10" r="7"/><path d="m15 15 8 8M10 6v8M6 10h8"/>',
  gear: '<path d="m10 3 1-2h4l1 2 3 1 2-1 2 3-1 2v4l1 2-2 3-2-1-3 1-1 2h-4l-1-2-3-1-2 1-2-3 1-2V8L3 6l2-3 2 1z"/><circle cx="13" cy="10" r="4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6h14M5 18h14"/>',
  bulb: '<path d="M8 16c0-3-3-3-3-7a7 7 0 0 1 14 0c0 4-3 4-3 7zM8 19h8m-7 3h6M12 1v2"/>',
  book: '<path d="M12 5Q7 1 2 4v16q5-3 10 0 5-3 10 0V4q-5-3-10 1v15M5 8l4 1m6 0 4-1M5 12l4 1m6 0 4-1"/>',
  home: '<path d="m2 11 10-9 10 9M5 9v12h14V9M10 21v-7h4v7"/>',
  back: '<path d="m14 5-7 7 7 7"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  reset: '<path d="M4 7a9 9 0 1 1-1 9M3 2v6h6"/>',
  music: '<path d="M9 18V5l11-3v13M9 8l11-3"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="17" cy="15" rx="3" ry="3"/>',
  sound: '<path d="m3 9 5 0 6-5v16l-6-5H3zM18 8q5 4 0 8m2-11q8 7 0 14"/>',
  haptics: '<rect x="8" y="3" width="9" height="18" rx="2"/><path d="m4 6-2 3 2 3-2 3 2 3m16-12 2 3-2 3 2 3-2 3"/>',
  moon: '<path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12z"/>',
  quiet: '<path d="m3 9 5 0 5-4v14l-5-4H3zM17 9l5 6m0-6-5 6"/>',
  flame: '<path d="M12 2c1 6-6 7-6 13a6 6 0 0 0 12 0c0-3-1-5-3-7 0 4-3 4-3 4s3-5 0-10z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
  coin: '<ellipse cx="12" cy="12" rx="8" ry="10"/><path d="M12 6v12m3-10c-6-4-8 4-3 4s3 8-3 4"/>',
  star: '<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>',
  lock: '<rect x="5" y="10" width="14" height="12" rx="3"/><path d="M8 10V6a4 4 0 0 1 8 0v4M12 15v3"/>',
  rug: '<path d="m3 5 18 0-2 14H5zM7 9h10m-8 4h6M4 21v-2m4 2v-2m8 2v-2m4 2v-2"/>',
} as const;
export type IconName = keyof typeof iconPaths;
export function svgMarkup(name: IconName) { return `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name]}</svg>`; }
export function icon(name: IconName): HTMLElement {
  const span = document.createElement('span'); span.className = 'game-icon'; span.setAttribute('aria-hidden', 'true'); span.innerHTML = svgMarkup(name); return span;
}
export function iconButton(name: IconName, label: string, action: () => void): HTMLButtonElement {
  const button = document.createElement('button'); button.type = 'button'; button.className = 'game-icon-button'; button.setAttribute('aria-label', label); button.title = label;
  button.append(icon(name)); button.onclick = action; return button;
}
