import { expect, it, vi, afterEach } from 'vitest';
import { initialScent, pourScent, validScent, scentSolved, scentReviewMoves, runeIds, codeFeedback, codeSolved, validCode, validPartialCode,placeRune, validGuesses, possibleCodes, freshPhoto, photoGuests, photoSolved, photoVisible, photoRequests, swapPhoto, turnPhoto, validPhoto, type PhotoState } from '../src/domain/guestPuzzles';
import { readSave } from '../src/platform/save';
afterEach(() => vi.unstubAllGlobals());
it('perfume pouring preserves scent counts and rejects mixing, overflow and invalid bottles', () => {
    const s = initialScent.map(b => [...b]);
    expect(validScent(s)).toBe(true);
    expect(pourScent(s, 0, 1)).toEqual(s);
    expect(pourScent(s, 0, 0)).toEqual(s);
    expect(pourScent(s, -1, 3)).toEqual(s);
    let board = s;
    for (const [a, b] of scentReviewMoves) {
        const next = pourScent(board, a, b);
        expect(next).not.toEqual(board);
        expect(validScent(next)).toBe(true);
        board = next;
    }
    expect(scentSolved(board)).toBe(true);
    expect(scentSolved(s)).toBe(false);
    expect(validScent([[0, 0, 0, 0], [], [], [], []])).toBe(false);
});
it('the authored perfume arrangement has a ten-pour minimum solution', () => {
    const queue: [
        number[][],
        number
    ][] = [[initialScent.map(b => [...b]), 0]], seen = new Set([JSON.stringify(initialScent)]);
    let answer = -1;
    while (queue.length) {
        const [s, d] = queue.shift()!;
        if (scentSolved(s)) {
            answer = d;
            break;
        }
        for (let a = 0; a < 5; a++)
            for (let b = 0; b < 5; b++) {
                const n = pourScent(s, a, b), k = JSON.stringify(n);
                if (!seen.has(k)) {
                    seen.add(k);
                    queue.push([n, d + 1]);
                }
            }
    }
    expect(answer).toBe(10);
});
it('cabinet feedback distinguishes exact and misplaced symbols without duplicate scoring', () => {
    expect(codeFeedback(['flower', 'star', 'moon'])).toEqual({ exact: 1, misplaced: 2 });
    expect(codeFeedback(['leaf', 'flame', 'star'])).toEqual({ exact: 1, misplaced: 0 });
    expect(codeSolved(['flower', 'moon', 'star'])).toBe(true);
    expect(validCode(['moon', 'moon', 'star'])).toBe(false);
    expect(validPartialCode(['moon', null, 'star'])).toBe(true);
    expect(validPartialCode(['moon', null, 'moon'])).toBe(false);
    expect(validGuesses([['moon', 'leaf', 'star'], ['moon', 'leaf', 'star']])).toBe(false);
    const history = [['flower', 'star', 'moon'], ['moon', 'leaf', 'star'], ['leaf', 'moon', 'flame']] as const;
    let previous = 60;
    for (let i = 0; i <= history.length; i++) {
        const candidates = possibleCodes(history.slice(0, i));
        expect(candidates).toContainEqual(['flower', 'moon', 'star']);
        expect(candidates.length).toBeLessThanOrEqual(previous);
        previous = candidates.length;
    }
});
const goodPhoto: PhotoState = { order: ['ember', 'dou', 'nemu', 'luno', 'rollo', 'yuzu'], poses: { luno: -1, dou: 0, ember: 0, rollo: 0, yuzu: 1, nemu: 0 } };
it('photo needs both guest requests and unoccluded faces; valid poses stay attached to each guest', () => {
    const s = freshPhoto();
    expect(validPhoto(s)).toBe(true);
    expect(photoSolved(s)).toBe(false);
    expect(photoVisible(s)).not.toContain('rollo');
    expect(photoRequests(goodPhoto)).toEqual([true, true, true]);
    expect(photoVisible(goodPhoto)).toHaveLength(6);
    expect(photoSolved(goodPhoto)).toBe(true);
    expect(photoSolved({ ...goodPhoto, poses: Object.fromEntries(photoGuests.map(id => [id, 0])) as PhotoState['poses'] })).toBe(false);
    expect(photoSolved(swapPhoto(goodPhoto, 1, 4))).toBe(false);
    let turn = goodPhoto;
    for (let i = 0; i < 3; i++)
        turn = turnPhoto(turn, 'luno');
    expect(turn).toEqual(goodPhoto);
    expect(validPhoto({ ...s, order: ['luno', 'luno', ...s.order.slice(2)] })).toBe(false);
});
it('completed photo collection survives reload while invalid portraits cannot replace it', () => {
    const base = { version: 1, coins: 6050, completed: [1], episodes: ['group-photo'], photos: { party: goodPhoto } };
    vi.stubGlobal('localStorage', { getItem: () => JSON.stringify(base) });
    expect(readSave().photos?.party).toEqual(goodPhoto);
    vi.stubGlobal('localStorage', { getItem: () => JSON.stringify({ ...base, photos: { party: freshPhoto() } }) });
    expect(readSave().photos).toBeUndefined();
    expect(readSave().coins).toBe(6050);
});

it('cabinet keys exchange occupied slots rather than requiring a throwaway symbol',()=>{expect(placeRune(['moon','leaf',null],1,'moon')).toEqual(['leaf','moon',null]);expect(validCode(new Array(3))).toBe(false);});
