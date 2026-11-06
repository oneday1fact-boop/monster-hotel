import { expect, it } from 'vitest';
import { laundryPieces, initialLaundry, validLaundry, slideLaundry, laundrySolution, laundrySolved } from '../src/domain/laundry';
it('laundry items cannot overlap, leave the room, jump or rotate', () => {
    expect(validLaundry([...initialLaundry])).toBe(true);
    expect(laundrySolved(initialLaundry)).toBe(false);
    expect(slideLaundry(initialLaundry, 0, -1)).toEqual(initialLaundry);
    expect(slideLaundry(initialLaundry, 0, 2)).toEqual(initialLaundry);
    expect(slideLaundry(initialLaundry, 9, 1)).toEqual(initialLaundry);
    expect(validLaundry([0, 1, 3, 1, 0, 0, 0])).toBe(false);
    expect(validLaundry([0, 1])).toBe(false);
});
it('the authored laundry board needs eleven single-cell slides at minimum', () => {
    const open: [
        number[],
        number
    ][] = [[[...initialLaundry], 0]], seen = new Set([JSON.stringify(initialLaundry)]);
    let distance = -1;
    while (open.length) {
        const [state, d] = open.shift()!;
        if (laundrySolved(state)) {
            distance = d;
            break;
        }
        for (let i = 0; i < laundryPieces.length; i++)
            for (const direction of [-1, 1]) {
                const next = slideLaundry(state, i, direction), key = JSON.stringify(next);
                if (!seen.has(key)) {
                    seen.add(key);
                    open.push([next, d + 1]);
                }
            }
    }
    expect(distance).toBe(11);
    let board: number[] = [...initialLaundry];
    for (const [i, d] of laundrySolution) {
        const next = slideLaundry(board, i, d);
        expect(next).not.toEqual(board);
        board = next;
    }
    expect(laundrySolved(board)).toBe(true);
});
