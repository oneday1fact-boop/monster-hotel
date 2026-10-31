import { decorations, type DecoratedWallet } from '../domain/decorations';
import { decorationCopy, hotelUI } from '../i18n/hotel';
import type { Locale } from '../i18n/catalog';
import type { Preferences } from '../platform/preferences';

export function shopContent(locale: Locale, save: DecoratedWallet, action: (id: string, owned: boolean) => void): HTMLElement {
  const content = document.createElement('div'); content.className = 'shop-items'; const t = hotelUI[locale];
  for (const item of decorations) {
    const copy = decorationCopy[locale][item.id]; const owned = save.decorations?.includes(item.id) ?? false; const equipped = save.equipped?.includes(item.id) ?? false;
    const card = document.createElement('article'); card.dataset.decoration = item.id;
    const name = document.createElement('h3'); name.textContent = copy.name;
    const description = document.createElement('p'); description.textContent = copy.description;
    const price = document.createElement('p'); price.className = 'shop-price'; price.textContent = owned ? `${t.owned} · ${equipped ? t.equipped : t.hide}` : `${item.price} ${t.coins}`;
    const button = document.createElement('button'); button.textContent = owned ? (equipped ? t.hide : t.equip) : `${t.buy} · ${item.price} ${t.coins}`;
    button.disabled = !owned && save.coins < item.price; button.setAttribute('aria-label', `${copy.name} · ${button.textContent}`);
    button.onclick = () => action(item.id, owned); card.append(name, description, price, button); content.append(card);
  }
  return content;
}
export function settingsContent(locale: Locale, preferences: Preferences, update: (prefs: Preferences) => boolean, preview: () => void): HTMLElement {
  const content = document.createElement('div'); content.className = 'settings-controls'; const t = hotelUI[locale]; let current = { ...preferences };
  const status = document.createElement('p'); status.setAttribute('role', 'status');
  for (const key of ['music', 'sound', 'haptics'] as const) {
    const label = document.createElement('label'); const text = document.createElement('span'); text.textContent = t[key];
    const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = current[key]; checkbox.name = key;
    checkbox.onchange = () => { current = { ...current, [key]: checkbox.checked }; status.textContent = update(current) ? t.saved : t.session; };
    label.append(text, checkbox); content.append(label);
  }
  const note = document.createElement('p'); note.textContent = t.audioNote;
  const test = document.createElement('button'); test.textContent = t.test; test.onclick = preview;
  content.append(note, test, status); return content;
}
