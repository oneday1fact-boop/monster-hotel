import { emptyStory, readDraftValue, type StoryDraft } from '../domain/storyNight';
const key = 'midnight-check-in.story-night.v1';
export function readStoryDraft(): StoryDraft { try { return readDraftValue(JSON.parse(localStorage.getItem(key) ?? 'null')); } catch { return emptyStory(); } }
export function writeStoryDraft(draft: StoryDraft): boolean { try { localStorage.setItem(key, JSON.stringify(draft)); return true; } catch { return false; } }
