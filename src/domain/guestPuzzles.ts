/** Three original hotel puzzles; every action is deterministic and can be retried offline. */
export type ScentBoard = number[][];
export const initialScent: ScentBoard = [[0, 1, 2, 0], [1, 2, 0, 1], [2, 0, 1, 2], [], []];
export const scentReviewMoves = [[0, 3], [2, 0], [1, 2], [1, 3], [0, 1], [2, 0], [2, 3], [1, 2], [0, 1], [0, 3]] as const;
export function validScent(v: unknown): v is ScentBoard {
    if (!Array.isArray(v) || v.length !== 5 || !Array.from(v).every(b => Array.isArray(b) && b.length <= 4 && Array.from(b).every(x => Number.isInteger(x) && x >= 0 && x < 3)))
        return false;
    const all = v.flat();
    return all.length === 12 && [0, 1, 2].every(c => all.filter(x => x === c).length === 4);
}
export function pourScent(board: readonly (readonly number[])[], from: number, to: number): ScentBoard {
    const out = board.map(b => [...b]);
    if (!validScent(out) || !Number.isInteger(from) || !Number.isInteger(to) || from < 0 || from > 4 || to < 0 || to > 4 || from === to || !out[from].length || out[to].length === 4)
        return out;
    const color = out[from].at(-1)!;
    if (out[to].length && out[to].at(-1) !== color)
        return out;
    let n = 0;
    for (let i = out[from].length - 1; i >= 0 && out[from][i] === color; i--)
        n++;
    n = Math.min(n, 4 - out[to].length);
    out[from].splice(-n, n);
    out[to].push(...Array(n).fill(color));
    return out;
}
export function scentSolved(board: readonly (readonly number[])[]) { return validScent(board) && board.every(b => b.length === 0 || b.length === 4 && b.every(x => x === b[0])); }
export const runeIds = ['moon', 'leaf', 'star', 'flame', 'flower'] as const;
export type Rune = typeof runeIds[number];
const cabinetCode: readonly Rune[] = ['flower', 'moon', 'star'];
export function validPartialCode(v: unknown): v is (Rune | null)[] { return Array.isArray(v) && v.length === 3 && Array.from(v).every(x => x === null || runeIds.includes(x)) && new Set(v.filter(x => x !== null)).size === v.filter(x => x !== null).length; }
export function validCode(v: unknown): v is Rune[] { return Array.isArray(v) && v.length === 3 && new Set(v).size === 3 && Array.from(v).every(x => runeIds.includes(x)); }
export function codeFeedback(guess: readonly Rune[], answer: readonly Rune[] = cabinetCode) {
    if (!validCode(guess) || !validCode(answer))
        return { exact: 0, misplaced: 0 };
    const exact = guess.filter((x, i) => x === answer[i]).length;
    return { exact, misplaced: guess.filter(x => answer.includes(x)).length - exact };
}
export function codeSolved(guess: readonly Rune[]) { return codeFeedback(guess).exact === 3; }
export function validGuesses(v: unknown): v is Rune[][] { return Array.isArray(v) && v.length <= 60 && v.every(validCode) && new Set(v.map(x => x.join(','))).size === v.length; }
export function possibleCodes(history: readonly (readonly Rune[])[]) {
    const codes: Rune[][] = [];
    for (const a of runeIds)
        for (const b of runeIds)
            for (const c of runeIds) {
                const code = [a, b, c];
                if (!validCode(code))
                    continue;
                if (history.every(g => { const real = codeFeedback(g), test = codeFeedback(g, code); return real.exact === test.exact && real.misplaced === test.misplaced; }))
                    codes.push(code);
            }
    return codes;
}
export const photoGuests = ['luno', 'dou', 'ember', 'rollo', 'yuzu', 'nemu'] as const;
export type PhotoGuest = typeof photoGuests[number];
export interface PhotoState {
    order: PhotoGuest[];
    poses: Record<PhotoGuest, number>;
}
export const photoHeights: Record<PhotoGuest, number> = { luno: 65, dou: 60, ember: 45, rollo: 67, yuzu: 61, nemu: 49 };
export function freshPhoto(): PhotoState { return { order: ['luno', 'yuzu', 'rollo', 'ember', 'nemu', 'dou'], poses: { luno: 0, dou: 0, ember: 0, rollo: 0, yuzu: 0, nemu: 0 } }; }
export function validPhoto(v: unknown): v is PhotoState { const s = v as PhotoState; return !!s && Array.isArray(s.order) && s.order.length === 6 && new Set(s.order).size === 6 && s.order.every(x => photoGuests.includes(x)) && !!s.poses && typeof s.poses === 'object' && photoGuests.every(id => Number.isInteger(s.poses[id]) && [-1, 0, 1].includes(s.poses[id])); }
export function photoActor(s: PhotoState, index: number) { const id = s.order[index], height = photoHeights[id], x = [25, 50, 75][index % 3] + s.poses[id] * 8, feet = index < 3 ? 60 : 100, width = height / 1.8; return { id, x, feet, height, width, face: { x, y: feet - height * .65, r: width * .25, ry: height * .25 }, body: { left: x - width * .29, right: x + width * .29, top: feet - height * .75, bottom: feet } }; }
export function photoVisible(s: PhotoState) {
    if (!validPhoto(s))
        return [];
    return s.order.filter((id, i) => {
        const f = photoActor(s, i).face;
        if (f.x - f.r < 0 || f.x + f.r > 100 || f.y - f.ry < 0 || f.y + f.ry > 100)
            return false;
        for (let j = i + 1; j < 6; j++) {
            const b = photoActor(s, j).body;
            if (f.x + f.r > b.left && f.x - f.r < b.right && f.y + f.ry > b.top && f.y - f.ry < b.bottom)
                return false;
        }
        return true;
    });
}
export function photoRequests(s: PhotoState) { return [s.order[1] === 'dou', s.order[3] === 'luno' && s.order[5] === 'yuzu', s.order[4] === 'rollo' && s.poses.luno === -1 && s.poses.rollo === 0 && s.poses.yuzu === 1]; }
export function photoSolved(s: PhotoState) { return validPhoto(s) && photoVisible(s).length === 6 && photoRequests(s).every(Boolean); }
export function swapPhoto(s: PhotoState, a: number, b: number): PhotoState {
    const next = { order: [...s.order], poses: { ...s.poses } };
    if (Number.isInteger(a) && Number.isInteger(b) && a >= 0 && a < 6 && b >= 0 && b < 6)
        [next.order[a], next.order[b]] = [next.order[b], next.order[a]];
    return next;
}
export function turnPhoto(s: PhotoState, id: PhotoGuest): PhotoState { return photoGuests.includes(id) ? { order: [...s.order], poses: { ...s.poses, [id]: s.poses[id] === 1 ? -1 : s.poses[id] + 1 } } : s; }
export function placeRune(input: readonly (Rune | null)[], slot: number, rune: Rune): (Rune | null)[] { const next = [...input]; if (!validPartialCode(next) || !Number.isInteger(slot) || slot < 0 || slot > 2 || !runeIds.includes(rune))
    return next; const other = next.indexOf(rune); if (other >= 0 && other !== slot)
    next[other] = next[slot]; next[slot] = rune; return next; }
