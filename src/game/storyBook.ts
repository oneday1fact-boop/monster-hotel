import type { Save } from '../platform/save';
import { chapterIds, chapterRewards, type ChapterId } from '../domain/storyChapters';
import { storyOutcome, storyUnlocked } from '../domain/storyNight';
import { chapterUI } from '../i18n/storyNight';
import type { Locale } from '../i18n/catalog';
import { showDetails } from './details';
import { icon } from './icons';
export function showStoryBook(locale: Locale, save: Save, choose: (id: ChapterId) => void, back: () => void) {
  const content = document.createElement('div'); content.className = 'story-book';
  for (const id of chapterIds) {
    const t = chapterUI(locale, id); const unlocked = storyUnlocked(save, id); const finished = !!storyOutcome(save, id);
    const b = document.createElement('button'); b.className = `story-chapter story-chapter--${id}`; b.dataset.chapter = String(id); b.disabled = !unlocked;
    const number = document.createElement('span'); number.className = 'chapter-number'; number.textContent = String(id).padStart(2, '0');
    const title = document.createElement('strong'); title.textContent = t.title;
    const note = document.createElement('span'); note.textContent = !unlocked ? t.locked : finished ? (locale === 'en' ? 'Completed · Replay' : '已完成 · 可以重看') : `${locale === 'en' ? 'First reward' : '首次獎勵'} +${chapterRewards[id]}`;
    b.append(number, icon(finished ? 'check' : unlocked ? 'star' : 'moon'), title, note); b.onclick = () => choose(id); content.append(b);
  }
  return showDetails({ kind: 'card', title: chapterUI(locale, 1).chapters, eyebrow: '', close: locale === 'en' ? 'Back' : '返回', sections: [], content }, back);
}
