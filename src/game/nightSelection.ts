import { levels, levelTitle, isUnlocked } from '../domain/levels';
import { campaignUI } from '../i18n/rules';
import { ui, type Locale } from '../i18n/catalog';
import { icon, iconButton } from './icons';
export function showNightSelection(locale: Locale, completed: readonly number[], select: (id: number) => void, back: () => void, language: () => void): () => void {
  const c = campaignUI[locale];
  const overlay = document.createElement('section'); overlay.className = 'night-overlay game-sheet'; overlay.setAttribute('aria-label', c.levels);
  const header = document.createElement('header'); header.className = 'sheet-header';
  const title = document.createElement('h1'); title.textContent = c.levels;
  const close = iconButton('back', ui[locale].lobbyBack, back); close.classList.add('sheet-back');
  const lang = iconButton('globe', locale === 'en' ? 'Language' : '語言', language); lang.classList.add('sheet-language'); header.append(close, title, lang);
  const grid = document.createElement('div'); grid.className = 'night-grid';
  for (const night of levels) {
    const unlocked = isUnlocked(night.id, completed); const cleared = completed.includes(night.id);
    const button = document.createElement('button'); button.disabled = !unlocked; button.dataset.night = String(night.id); button.className = cleared ? 'night-cleared' : '';
    const number = String(night.id).padStart(2, '0');
    button.setAttribute('aria-label', `${locale === 'en' ? `Night ${number}` : `第 ${number} 晚`} · ${levelTitle(night.id, locale)} · ${cleared ? c.cleared : unlocked ? c.unlocked : c.locked}`);
    const label = document.createElement('strong'); label.textContent = number;
    const state = document.createElement('span'); state.className = 'night-stars'; state.append(icon(cleared ? 'star' : unlocked ? 'moon' : 'lock'));
    button.append(label, state); button.onclick = () => select(night.id); grid.append(button);
  }
  const footer = document.createElement('footer'); footer.className = 'night-footer';
  const progress = document.createElement('span'); progress.append(icon('check'), document.createTextNode(`${completed.filter(id => levels.some(l => l.id === id)).length}/20`));
  const reward = document.createElement('span'); reward.append(icon('coin'), document.createTextNode('+50')); footer.append(progress, reward);
  overlay.append(header, grid, footer); document.body.append(overlay);
  const focus = grid.querySelector<HTMLButtonElement>('button:not(:disabled):not(.night-cleared)') ?? grid.querySelector<HTMLButtonElement>('button'); focus?.focus(); return () => overlay.remove();
}
