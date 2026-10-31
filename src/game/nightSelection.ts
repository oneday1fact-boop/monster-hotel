import { levels, levelTitle, isUnlocked } from '../domain/levels';
import { campaignUI } from '../i18n/rules';
import { ui, type Locale } from '../i18n/catalog';
export function showNightSelection(locale: Locale, completed: readonly number[], select: (id: number) => void, back: () => void, language: () => void): () => void {
  const c = campaignUI[locale];
  const overlay = document.createElement('section'); overlay.className = 'night-overlay'; overlay.setAttribute('aria-label', c.levels);
  const header = document.createElement('header');
  const title = document.createElement('h1'); title.textContent = c.levels;
  const summary = document.createElement('p'); summary.textContent = `${completed.filter(id => levels.some(l => l.id === id)).length}/20 ${ui[locale].progress}`;
  const lang = document.createElement('button'); lang.textContent = locale === 'en' ? '繁體中文' : 'English'; lang.onclick = language;
  header.append(title, summary, lang);
  const grid = document.createElement('div'); grid.className = 'night-grid';
  for (const night of levels) {
    const unlocked = isUnlocked(night.id, completed); const cleared = completed.includes(night.id);
    const button = document.createElement('button'); button.disabled = !unlocked; button.dataset.night = String(night.id);
    button.className = cleared ? 'night-cleared' : '';
    const number = String(night.id).padStart(2, '0');
    const label = document.createElement('strong'); label.textContent = locale === 'en' ? `Night ${number}` : `第 ${number} 晚`;
    const name = document.createElement('span'); name.textContent = levelTitle(night.id, locale);
    const state = document.createElement('small'); state.textContent = cleared ? `✓ ${c.cleared}` : unlocked ? c.unlocked : c.locked;
    button.append(label, name, state); button.onclick = () => select(night.id); grid.append(button);
  }
  const footer = document.createElement('footer');
  const close = document.createElement('button'); close.textContent = ui[locale].lobbyBack; close.onclick = back;
  const note = document.createElement('p'); note.textContent = c.reward;
  footer.append(close, note); overlay.append(header, grid, footer); document.body.append(overlay);
  const focus = grid.querySelector<HTMLButtonElement>('button:not(:disabled):not(.night-cleared)') ?? grid.querySelector<HTMLButtonElement>('button'); focus?.focus();
  return () => overlay.remove();
}
