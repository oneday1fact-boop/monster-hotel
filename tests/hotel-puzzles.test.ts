import { expect, it } from 'vitest';
import { liftBags, loadBag, unloadBag, liftWeight, liftSolved, validLift, traceMoon, initialMirrors, turnMirror, validMirrors, giftShape, giftCells, placeGift, validGifts, giftsSolved, type LiftState, type GiftPlacement } from '../src/domain/hotelPuzzles';
it('a balanced empty lift is not a win; capacity and fragile-side rules matter', () => { let s: LiftState = {}; expect(liftSolved(s)).toBe(false); for (const id of ['b', 'd', 'e'])
    s = loadBag(s, id, 'left'); expect(loadBag(s, 'f', 'left')).toEqual(s); for (const id of ['a', 'c', 'f'])
    s = loadBag(s, id, 'right'); expect(liftWeight(s, 'left')).toBe(17); expect(liftWeight(s, 'right')).toBe(17); expect(liftSolved(s)).toBe(true); expect(liftSolved(Object.fromEntries(Object.entries(s).map(([id, side]) => [id, side === 'left' ? 'right' : 'left'])))).toBe(false); expect(liftSolved(unloadBag(s, 'a'))).toBe(false); expect(validLift({ unknown: 'left' })).toBe(false); });
it('the six-bag lift has exactly one valid loading, so random equal-looking loads do not all pass', () => { let solutions = 0; for (let mask = 0; mask < 64; mask++) {
    const s: LiftState = {};
    liftBags.forEach((b, i) => s[b.id] = mask & (1 << i) ? 'left' : 'right');
    if (liftSolved(s))
        solutions++;
} expect(solutions).toBe(1); });
it('moon mirrors have a unique solution among all sixty-four orientations and require the entire route', () => { expect(traceMoon(initialMirrors).solved).toBe(false); const solutions: number[][] = []; for (let mask = 0; mask < 64; mask++) {
    const a = Array.from({ length: 6 }, (_, i) => (mask >> i) & 1), t = traceMoon(a);
    expect(t.cells.length).toBeLessThan(100);
    if (t.solved)
        solutions.push(a);
} expect(solutions).toEqual([[0, 0, 1, 0, 1, 0]]); const t = traceMoon(solutions[0]); expect(t.stars.sort()).toEqual([3, 7, 18].sort()); expect(t.window).toBe(true); expect(t.cells.filter(n => n === 7).length).toBeGreaterThan(1); expect(turnMirror(initialMirrors, 99)).toEqual(initialMirrors); expect(validMirrors([0, 1])).toBe(false); });
it('gift rotations preserve shape size and four turns restore the original shape', () => { for (const id of ['a', 'b', 'c', 'd', 'e']) {
    expect(giftShape(id, 4)).toEqual(giftShape(id, 0));
    expect(giftShape(id, 3)).toHaveLength(giftShape(id, 0).length);
} expect(giftShape('unknown', 0)).toEqual([]); });
it('all five shapes can fill sixteen cells; overlaps, out-of-box placements and duplicate IDs are rejected', () => { let s: GiftPlacement[] = []; for (const p of [{ id: 'a', x: 0, y: 0, rotation: 0 }, { id: 'b', x: 1, y: 1, rotation: 0 }, { id: 'c', x: 1, y: 0, rotation: 0 }, { id: 'd', x: 3, y: 2, rotation: 3 }, { id: 'e', x: 0, y: 3, rotation: 0 }])
    s = placeGift(s, p); expect(giftsSolved(s)).toBe(true); expect(new Set(s.flatMap(p => giftCells(p).map(c => `${c.x},${c.y}`))).size).toBe(16); expect(placeGift(s, { id: 'e', x: 0, y: 0, rotation: 0 })).toEqual(s); expect(validGifts([...s, s[0]])).toBe(false); expect(validGifts([{ id: 'c', x: 3, y: 3, rotation: 0 }])).toBe(false); expect(giftsSolved(s.slice(1))).toBe(false); });
