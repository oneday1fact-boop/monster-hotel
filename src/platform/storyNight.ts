import { emptyStory, readDraftValue, type StoryDraft } from '../domain/storyNight';
import type { ChapterId } from '../domain/storyChapters';
const key = 'midnight-check-in.story-night.v1';
export function readStoryDraft(chapter: ChapterId = 1): StoryDraft { try { return readDraftValue(JSON.parse(localStorage.getItem(chapter === 1 ? key : `${key}.chapter-${chapter}`) ?? 'null'), chapter); } catch { return emptyStory(); } }
export function writeStoryDraft(draft: StoryDraft, chapter: ChapterId = 1): boolean { try { localStorage.setItem(chapter === 1 ? key : `${key}.chapter-${chapter}`, JSON.stringify(draft)); return true; } catch { return false; } }
