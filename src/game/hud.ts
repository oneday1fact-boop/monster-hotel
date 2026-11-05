import { createTutorialCoach } from './tutorialCoach';
import { icon, iconButton } from './icons';
import { ui, type Locale } from '../i18n/catalog';
import { campaignUI } from '../i18n/rules';
import { hotelUI } from '../i18n/hotel';
export function createHUD(options: { locale: Locale; playing: boolean; night: number; settings: () => void; language: () => void; home: () => void; hint: () => void; clues: () => void; check: () => void; reset: () => void; skipTutorial: () => void }) {
  const t = ui[options.locale]; const c = campaignUI[options.locale];
  const root = document.createElement('nav'); root.className = 'game-hud'; root.setAttribute('aria-label', options.locale === 'en' ? 'Game controls' : '遊戲操作');
  // Keep overlay gestures out of Phaser's window-level mouse/touch listeners.
  for (const event of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'click']) root.addEventListener(event, e => e.stopPropagation());
  const top = document.createElement('div'); top.className = 'hud-top';
  const left = document.createElement('div'); left.className = 'hud-cluster';
  if (options.playing) { const hint = iconButton('bulb', t.hint, options.hint); hint.dataset.action = 'hint'; left.append(iconButton('home', c.return, options.home), hint, iconButton('book', c.clues, options.clues)); }
  const right = document.createElement('div'); right.className = 'hud-cluster';
  right.append(iconButton('globe', options.locale === 'en' ? 'Language' : '語言', options.language), iconButton('gear', hotelUI[options.locale].settings, options.settings));
  const badge = document.createElement('div'); badge.className = 'night-badge';
  if (options.playing) { badge.append(icon('moon'), document.createTextNode(String(options.night).padStart(2, '0'))); }
  top.append(left, badge, right); root.append(top);
  const toast = document.createElement('div'); toast.className = 'hud-toast'; toast.setAttribute('role', 'status'); toast.hidden = true; root.append(toast);
  if (options.playing) {
    const bottom = document.createElement('div'); bottom.className = 'hud-bottom';
    const check = document.createElement('button'); check.className = 'game-primary-button'; check.type = 'button'; check.setAttribute('aria-label', t.check); check.dataset.action = 'check-in'; check.append(icon('check'), document.createTextNode(options.locale === 'en' ? 'Check in' : '入住')); check.onclick = options.check;
    const reset = iconButton('reset', t.reset, options.reset); reset.classList.add('hud-reset'); bottom.append(check, reset); root.append(bottom);
  }
  const tutorial = createTutorialCoach(root, options.locale, options.skipTutorial);
  document.body.append(root); let timeout: ReturnType<typeof setTimeout> | undefined;
  return {
    tutorial,
    append(element: HTMLElement) { root.append(element); },
    storyEntry(label: string, action: () => void) {
      const button = document.createElement('button'); button.className = 'game-primary-button story-entry'; button.textContent = label; button.onclick = action; root.append(button);
    },
    coverLogo() {
      const logo = document.createElement('header'); logo.className = 'cover-logo'; logo.setAttribute('aria-label', '怪物旅館 — Monster Hotel');
      const chinese = document.createElement('h1'); chinese.className = 'cover-logo-zh'; chinese.lang = 'zh-Hant';
      for (const glyph of '怪物旅館') { const letter = document.createElement('span'); letter.textContent = glyph; chinese.append(letter); }
      const english = document.createElement('div'); english.className = 'cover-logo-en'; english.lang = 'en'; english.textContent = 'MONSTER HOTEL';
      logo.append(chinese, english); root.append(logo);
    },
    show(message: string) { clearTimeout(timeout); toast.textContent = message; toast.hidden = !message; if (message) timeout = setTimeout(() => { toast.hidden = true; }, 2800); },
    visible(show: boolean) { root.hidden = !show; },
    busy(busy: boolean) { root.querySelectorAll('button').forEach(button => { button.disabled = busy; }); },
    destroy() { clearTimeout(timeout); root.remove(); },
  };
}
