/** Five columns, four rows. Each item slides along its own axis, one cell per move. */
export const laundryPieces = [
    { id: 'quilt', axis: 'h', length: 2, fixed: 1 }, { id: 'rack', axis: 'h', length: 2, fixed: 0 },
    { id: 'basket', axis: 'h', length: 2, fixed: 2 }, { id: 'sheets', axis: 'h', length: 3, fixed: 3 },
    { id: 'towels', axis: 'v', length: 2, fixed: 0 }, { id: 'hamper', axis: 'v', length: 2, fixed: 4 },
    { id: 'coats', axis: 'v', length: 2, fixed: 3 },
] as const;
export const initialLaundry = [0, 1, 3, 1, 2, 0, 0] as const;
export const laundrySolution = [[0, 1], [2, -1], [2, -1], [4, -1], [3, -1], [5, 1], [5, 1], [6, 1], [6, 1], [0, 1], [0, 1]] as const;
export function laundryCells(state: readonly number[], index: number) { const p = laundryPieces[index]; return Array.from({ length: p.length }, (_, n) => p.axis === 'h' ? { x: state[index] + n, y: p.fixed } : { x: p.fixed, y: state[index] + n }); }
export function validLaundry(v: unknown): v is number[] { if (!Array.isArray(v) || v.length !== laundryPieces.length)
    return false; const occupied = new Set<number>(); for (let i = 0; i < v.length; i++) {
    const p = laundryPieces[i];
    if (!Number.isInteger(v[i]) || v[i] < 0 || v[i] + p.length > (p.axis === 'h' ? 5 : 4))
        return false;
    for (const c of laundryCells(v, i)) {
        const k = c.y * 5 + c.x;
        if (occupied.has(k))
            return false;
        occupied.add(k);
    }
} return true; }
export function slideLaundry(state: readonly number[], index: number, direction: number) { const next = [...state]; if (!validLaundry(next) || !Number.isInteger(index) || index < 0 || index >= 7 || ![-1, 1].includes(direction))
    return next; next[index] += direction; return validLaundry(next) ? next : [...state]; }
export function laundrySolved(state: readonly number[]) { return validLaundry([...state]) && state[0] === 3; }
