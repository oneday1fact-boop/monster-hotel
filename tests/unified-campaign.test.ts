import { afterEach, expect, it, vi } from 'vitest';
import { challenges, challengeUnlocked, nextChallenge, afterChallenge, challengeProgress, completeEpisode } from '../src/domain/campaign';
import { episodeIds, accusation, evidenceIds, initialRoad, roadReviewSolution, slideRoad, roadPath, validRoad, differences, markDifference, differencesComplete } from '../src/domain/episodes';
import { complete, readSave, type Save } from '../src/platform/save';
import { buyScene, ownedScenes } from '../src/domain/sceneryShop';
import { decorations, purchase } from '../src/domain/decorations';
afterEach(() => vi.unstubAllGlobals());
it('opens the hotel with one room puzzle, followed by the three hotel events', () => { expect(challenges.map(n => n.id)).toEqual(['puzzle-1', ...episodeIds]); expect(afterChallenge('puzzle-1')?.id).toBe('cake-case'); expect(afterChallenge('dream-door')?.id).toBe('lift-balance'); const s: Save = { version: 1, completed: [], coins: 0 }; expect(nextChallenge(s).id).toBe('puzzle-1'); expect(challengeUnlocked(s, 'cake-case')).toBe(false); });
it('retains legacy achievements and awards only the new first completions', () => {
    vi.stubGlobal('localStorage', { setItem: () => { } });
    let s: Save = { version: 1, completed: [1, 2, 20], coins: 999, storyNight: { outcome: 'play' } };
    for (const id of episodeIds) {
        expect(nextChallenge(s).id).toBe(id);
        s = completeEpisode(s, id).save;
        expect(completeEpisode(s, id).reward).toBe(0);
    }
    expect(s.completed).toEqual([1, 2, 20]);
    expect(s.coins).toBe(6999);
    expect(challengeProgress(s)).toBe(13);
    expect(challengeUnlocked(s, 'puzzle-20')).toBe(false);
    expect(complete(s, 1).coins).toBe(6999);
});
it('filters unknown saved stage IDs without clearing old progress', () => { const s: Save = { version: 1, completed: [], coins: 0 }; expect(completeEpisode(s, 'dream-door').reward).toBe(0); vi.stubGlobal('localStorage', { getItem: () => JSON.stringify({ ...s, episodes: ['cake-case', 'unknown', 'cake-case'], completed: [1, 20] }) }); expect(readSave()).toMatchObject({ episodes: ['cake-case'], completed: [1, 20] }); });
it('requires the actual complete evidence set and supported suspect', () => { expect(accusation(['footprints'], 'rollo')).toBe(false); expect(accusation(evidenceIds, 'yuzu')).toBe(false); expect(accusation([...evidenceIds].reverse(), 'rollo')).toBe(true); });
it('keeps exactly one blank; allows one adjacent slide without rotation or jumping', () => { expect(validRoad([...initialRoad])).toBe(true); expect(initialRoad.filter(x => x === -1)).toHaveLength(1); expect(slideRoad(initialRoad, 0)).toEqual(initialRoad); expect(slideRoad(initialRoad, 14)).toEqual(initialRoad); const moved = slideRoad(initialRoad, 8); expect(moved[initialRoad.indexOf(-1)]).toBe(initialRoad[8]); expect(moved[8]).toBe(-1); expect([...moved].sort()).toEqual([...initialRoad].sort()); expect(validRoad([0, 0, 1, 2, 3, 4, 5, 6, -1])).toBe(false); });
it('requires connected reciprocal road ends; the authored scramble has an authored reversible eight-slide solution', () => {
    expect(roadPath(initialRoad)).toEqual([]);
    let board: number[] = [...initialRoad];
    for (const i of roadReviewSolution)
        board = slideRoad(board, i);
    expect(roadPath(board)).toEqual([0, 1, 5, 9, 10, 11, 15]);
    expect(board.filter(x => x === -1)).toHaveLength(1);
    expect(roadPath([0, 2, 5, 4, 1, -1, 3, 7, 6])).toEqual([]);
});
it('comparison only counts five authored regions, once each, and never random background taps', () => {
    let found = markDifference([], 'unknown');
    expect(found).toEqual([]);
    for (const d of differences) {
        found = markDifference(found, d.id);
        expect(markDifference(found, d.id)).toEqual(found);
    }
    expect(found).toHaveLength(5);
    expect(differencesComplete(found)).toBe(true);
    expect(differencesComplete(found.slice(1))).toBe(false);
});
it('the route funds some cosmetic choices and preserves legacy scenery ownership', () => {
    let s: Save = { version: 1, completed: [1], coins: 50 };
    for (const id of episodeIds)
        s = completeEpisode(s, id).save;
    for (const item of decorations)
        s = purchase(s, item.id).wallet;
    for (const scene of ['night', 'autumn', 'winter'] as const)
        s = buyScene(s, scene).wallet;
    expect(s.coins).toBeGreaterThanOrEqual(0); expect(s.decorations!.length).toBeLessThan(decorations.length); expect(s.decorations!.length).toBeGreaterThan(0);
    expect(ownedScenes({ coins: 0, ambience: 'winter' })).toContain('winter');
});
