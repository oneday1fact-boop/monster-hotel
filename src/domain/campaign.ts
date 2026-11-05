import { levelTitle } from './levels';
import { episodeIds, type EpisodeId } from './episodes';
import { episodeCopy } from '../i18n/episodes';
import type { Locale } from '../i18n/catalog';
import type { Save } from '../platform/save';
export type Challenge = {
    id: string;
    kind: 'episode';
    episode: EpisodeId;
} | {
    id: string;
    kind: 'puzzle';
    puzzle: number;
};
// Previous puzzles/outcomes remain in the save, but repetitive stages leave the active route.
export const challenges: readonly Challenge[] = [...episodeIds.map(episode => ({ id: episode, kind: 'episode' as const, episode })), { id: 'puzzle-1', kind: 'puzzle', puzzle: 1 }];
export function challengeComplete(save: Save, node: Challenge) { return node.kind === 'puzzle' ? save.completed.includes(node.puzzle) : !!save.episodes?.includes(node.episode); }
export function challengeUnlocked(save: Save, id: string) { const i = challenges.findIndex(n => n.id === id); return i >= 0 && (challengeComplete(save, challenges[i]) || challenges.slice(0, i).every(n => challengeComplete(save, n))); }
export function nextChallenge(save: Save) { return challenges.find(n => !challengeComplete(save, n)) ?? challenges.at(-1)!; }
export function afterChallenge(id: string) { const i = challenges.findIndex(n => n.id === id); return i < 0 ? undefined : challenges[i + 1]; }
export function challengeTitle(node: Challenge, locale: Locale) { return node.kind === 'puzzle' ? levelTitle(node.puzzle, locale) : episodeCopy[locale][node.episode].title; }
export function challengeProgress(save: Save) { return challenges.filter(n => challengeComplete(save, n)).length; }
export function completeEpisode(save: Save, id: EpisodeId): {
    save: Save;
    reward: number;
} { if (save.episodes?.includes(id))
    return { save, reward: 0 }; if (!challengeUnlocked(save, id))
    return { save, reward: 0 }; return { save: { ...save, episodes: [...(save.episodes ?? []), id], coins: save.coins + 500 }, reward: 500 }; }
