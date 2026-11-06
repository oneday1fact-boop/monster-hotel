import type { Save } from '../platform/save';
import type { Locale } from '../i18n/catalog';
import { photoPicture } from './guestPuzzleWidgets';
export function photoWallContent(save: Save, locale: Locale) { const root = document.createElement('div'); root.className = 'memory-wall'; const frame = document.createElement('div'); frame.className = 'photo-frame-wrap memory-frame'; const p = document.createElement('p'); p.className = 'memory-caption'; if (save.photos?.party) {
    frame.append(photoPicture(save.photos.party, false));
    root.dataset.savedPhoto = 'party';
    p.textContent = locale === 'en' ? 'Our first hotel family photo · Kept in this hotel' : '旅館第一張大合照 · 呢份回憶已保存';
}
else {
    const empty = document.createElement('div');
    empty.className = 'memory-locked';
    empty.innerHTML = '<span aria-hidden="true">✧　♡　✧</span>';
    const text = document.createElement('strong');
    text.textContent = locale === 'en' ? 'A space for our hotel memories' : '留一個位，收藏大家嘅回憶';
    empty.append(text);
    frame.append(empty);
    p.textContent = locale === 'en' ? 'Complete “The monster group photo” to hang your first picture.' : '完成「怪物大合照」，就可以掛上第一張住客合照。';
} root.append(frame, p); return root; }
