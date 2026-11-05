import { afterEach, expect, it, vi } from 'vitest';
import { challenges, challengeComplete, challengeUnlocked, nextChallenge, afterChallenge, challengeProgress, completeEpisode } from '../src/domain/campaign';
import { episodeIds, accusation, initialFurniture, moveFurniture, luggagePath, emptyDream, dreamAction, evidenceIds } from '../src/domain/episodes';
import { complete, readSave, type Save } from '../src/platform/save';
import { buyScene, ownedScenes } from '../src/domain/sceneryShop';
import { decorations, purchase } from '../src/domain/decorations';
afterEach(() => vi.unstubAllGlobals());
it('keeps exactly one room-assignment puzzle and three genuinely different episode types', () => { expect(challenges.map(n => n.id)).toEqual([...episodeIds, 'puzzle-1']); expect(afterChallenge('dream-door')?.id).toBe('puzzle-1'); expect(afterChallenge('unknown')).toBeUndefined(); });
it('new progression awards once and retains all legacy achievements and coins', () => { vi.stubGlobal('localStorage', { setItem: () => { } }); let save: Save = { version: 1, completed: [1, 2, 20], coins: 999, storyNight: { outcome: 'play' } }; for (const id of episodeIds) {
    expect(nextChallenge(save).id).toBe(id);
    expect(challengeUnlocked(save, id)).toBe(true);
    save = completeEpisode(save, id).save;
    expect(completeEpisode(save, id).reward).toBe(0);
} expect(save.completed).toEqual([1, 2, 20]); expect(save.coins).toBe(2499); expect(challengeProgress(save)).toBe(4); expect(challengeUnlocked(save, 'puzzle-20')).toBe(false); expect(complete(save, 1).coins).toBe(2499); });
it('locks future episodes and filters unknown saved IDs', () => { const save: Save = { version: 1, completed: [], coins: 0 }; expect(completeEpisode(save, 'dream-door').reward).toBe(0); vi.stubGlobal('localStorage', { getItem: () => JSON.stringify({ ...save, episodes: ['cake-case', 'unknown', 'cake-case'], completed: [1, 20] }) }); expect(readSave()).toMatchObject({ episodes: ['cake-case'], completed: [1, 20] }); });
it('requires all evidence and the supported suspect; evidence order is free', () => { expect(accusation(['footprints'], 'rollo')).toBe(false); expect(accusation(evidenceIds, 'yuzu')).toBe(false); expect(accusation([...evidenceIds].reverse(), 'rollo')).toBe(true); });
it('furniture obeys adjacency and occupancy and the puzzle has a reachable solution', () => { expect(luggagePath(initialFurniture)).toEqual([]); expect(moveFurniture(initialFurniture, 1, 4)).toEqual(initialFurniture); expect(moveFurniture(initialFurniture, 1, 2)).toEqual(initialFurniture); const queue = [initialFurniture], seen = new Set<string>(); let solution: number[] = []; while (queue.length) {
    const state = queue.shift()!, key = [...state].sort((a, b) => a - b).join();
    if (seen.has(key))
        continue;
    seen.add(key);
    if (luggagePath(state).length) {
        solution = state;
        break;
    }
    for (const from of state)
        for (let to = 0; to < 12; to++) {
            const next = moveFurniture(state, from, to);
            if (next.some((x, i) => x !== state[i]))
                queue.push(next);
        }
} expect(solution.length).toBe(3); const path = luggagePath(solution); expect(path[0]).toBe(0); expect(path.at(-1)).toBe(11); });
it('dream objects require cross-world causality, not just tapping every button', () => { let s = emptyDream(); expect(dreamAction(s, 'door').open).toBe(false); expect(dreamAction(s, 'water').grown).toBe(false); s = dreamAction(s, 'seed'); s = dreamAction(s, 'switch'); expect(dreamAction(s, 'key').key).toBe(false); s = dreamAction(s, 'water'); s = dreamAction(s, 'switch'); s = dreamAction(s, 'key'); expect(dreamAction(s, 'door').open).toBe(false); s = dreamAction(s, 'switch'); s = dreamAction(s, 'door'); expect(s.open).toBe(true); });
it('new first rewards can fund all cosmetics and legacy scenery stays owned', () => { let s: Save = { version: 1, completed: [], coins: 0 }; for (const id of episodeIds)
    s = completeEpisode(s, id).save; for (const item of decorations)
    s = purchase(s, item.id).wallet; for (const scene of ['night', 'autumn', 'winter'] as const)
    s = buyScene(s, scene).wallet; expect(s.coins).toBe(80); expect(ownedScenes({ coins: 0, ambience: 'winter' })).toContain('winter'); });
