import { decorations, type DecoratedWallet } from '../domain/decorations';
import { decorationCopy, hotelUI } from '../i18n/hotel';
import type { Locale } from '../i18n/catalog';
import type { Preferences } from '../platform/preferences';
import { icon, type IconName } from './icons';

export function shopContent(locale: Locale, save: DecoratedWallet, action: (id: string, owned: boolean) => void): HTMLElement {
  const content = document.createElement('div'); content.className = 'shop-items'; const t = hotelUI[locale];
  const artwork: IconName[] = ['moon', 'rug', 'star'];
  decorations.forEach((item, i) => {
    const copy = decorationCopy[locale][item.id]; const owned = save.decorations?.includes(item.id) ?? false; const equipped = save.equipped?.includes(item.id) ?? false;
    const card = document.createElement('article'); card.dataset.decoration = item.id;
    const preview = document.createElement('div'); preview.className = `decoration-preview decoration-preview--${i}`; preview.append(icon(artwork[i]));
    const name = document.createElement('h3'); name.textContent = copy.name;
    const description = document.createElement('p'); description.className = 'visually-hidden'; description.textContent = copy.description;
    const price = document.createElement('p'); price.className = 'shop-price'; price.textContent = owned ? `${t.owned} · ${equipped ? t.equipped : t.hide}` : `${item.price} ${t.coins}`;
    const button = document.createElement('button'); button.className = 'game-primary-button'; button.textContent = owned ? (equipped ? t.hide : t.equip) : `${item.price}`;
    button.prepend(icon(owned ? 'check' : 'coin')); button.disabled = !owned && save.coins < item.price;
    button.setAttribute('aria-label', `${copy.name} · ${owned ? button.textContent : `${t.buy} · ${item.price} ${t.coins}`}`);
    button.onclick = () => action(item.id, owned); card.append(preview, name, description, price, button); content.append(card);
  });
  return content;
}
export function settingsContent(locale: Locale, preferences: Preferences, update: (prefs: Preferences) => boolean, preview: () => void, language: () => void): HTMLElement {
  const content = document.createElement('div'); content.className = 'settings-controls'; const t = hotelUI[locale]; let current = { ...preferences };
  const tiles = document.createElement('div'); tiles.className = 'settings-tiles';
  for (const key of ['music', 'sound', 'haptics'] as const) {
    const label = document.createElement('label'); label.className = 'setting-tile'; label.append(icon(key));
    const text = document.createElement('span'); text.className = 'setting-name'; text.textContent = t[key];
    const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = current[key]; checkbox.name = key; checkbox.className = 'game-switch-input';
    const toggle = document.createElement('span'); toggle.className = 'game-switch'; toggle.setAttribute('aria-hidden', 'true');
    checkbox.onchange = () => { current = { ...current, [key]: checkbox.checked }; status.textContent = update(current) ? t.saved : t.session; };
    label.append(text, checkbox, toggle); tiles.append(label);
  }
  const actions = document.createElement('div'); actions.className = 'settings-actions';
  const lang = document.createElement('button'); lang.className = 'game-secondary-button'; lang.append(icon('globe'), document.createTextNode(locale === 'en' ? 'Language' : '語言')); lang.onclick = language;
  const test = document.createElement('button'); test.className = 'game-secondary-button'; test.append(icon('sound'), document.createTextNode(locale === 'en' ? 'Preview' : '試聽')); test.setAttribute('aria-label', t.test); test.onclick = preview;
  const note = document.createElement('p'); note.className = 'visually-hidden'; note.textContent = t.audioNote;
  const status = document.createElement('p'); status.className = 'settings-status'; status.setAttribute('role', 'status'); actions.append(lang, test); content.append(tiles, actions, note, status); return content;
}
export function languageContent(locale: Locale, choose: (locale: Locale) => void): HTMLElement {
  const content = document.createElement('div'); content.className = 'language-tiles';
  for (const choice of ['zh-Hant', 'en'] as const) {
    const button = document.createElement('button'); button.className = `language-tile ${choice === locale ? 'is-selected' : ''}`; button.setAttribute('aria-pressed', String(choice === locale));
    const glyph = document.createElement('span'); glyph.className = 'language-glyph'; glyph.textContent = choice === 'en' ? 'A' : '漢'; glyph.setAttribute('aria-hidden', 'true');
    const name = document.createElement('strong'); name.textContent = choice === 'en' ? 'English' : '繁體中文';
    button.append(glyph, name); if (choice === locale) button.append(icon('check')); button.onclick = () => choose(choice); content.append(button);
  }
  return content;
}
