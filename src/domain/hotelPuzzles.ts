/** Modest, deterministic hotel puzzles; no timers, random guesses or paid supplies. */
export const liftBags = [{ id: 'a', weight: 3 }, { id: 'b', weight: 4 }, { id: 'c', weight: 5 }, { id: 'd', weight: 6, fragile: true }, { id: 'e', weight: 7 }, { id: 'f', weight: 9 }] as const;
export type LiftSide = 'left' | 'right';
export type LiftState = Partial<Record<string, LiftSide>>;
export function validLift(value: unknown): value is LiftState { return !!value && typeof value === 'object' && !Array.isArray(value) && Object.entries(value).every(([id, side]) => liftBags.some(b => b.id === id) && (side === 'left' || side === 'right')) && ['left', 'right'].every(s => Object.values(value).filter(v => v === s).length <= 3); }
export function loadBag(state: LiftState, id: string, side: LiftSide): LiftState { if (!liftBags.some(b => b.id === id) || Object.entries(state).filter(([key, s]) => key !== id && s === side).length >= 3)
    return { ...state }; return { ...state, [id]: side }; }
export function unloadBag(state: LiftState, id: string): LiftState { const next = { ...state }; delete next[id]; return next; }
export function liftWeight(state: LiftState, side: LiftSide) { return liftBags.reduce((n, b) => n + (state[b.id] === side ? b.weight : 0), 0); }
export function liftSolved(state: LiftState) { return validLift(state) && liftBags.every(b => !!state[b.id]) && state.d === 'left' && liftWeight(state, 'left') === liftWeight(state, 'right'); }
export const mirrorPositions = [12, 2, 4, 19, 16, 6] as const;
export const lightStars = [7, 3, 18] as const;
export const initialMirrors = [1, 1, 0, 1, 0, 0] as const;
export function validMirrors(a: unknown): a is number[] { return Array.isArray(a) && a.length === 6 && a.every(x => x === 0 || x === 1); }
export function turnMirror(a: readonly number[], index: number) { const next = [...a]; if (validMirrors(next) && Number.isInteger(index) && index >= 0 && index < 6)
    next[index] = 1 - next[index]; return next; }
export interface LightTrace {
    cells: number[];
    points: {
        x: number;
        y: number;
    }[];
    stars: number[];
    window: boolean;
    loop: boolean;
    solved: boolean;
}
/** Ray direction E,S,W,N. A repeated cell+direction terminates a loop safely. */
export function traceMoon(mirrors: readonly number[]): LightTrace { const out: LightTrace = { cells: [], points: [{ x: 0, y: 250 }], stars: [], window: false, loop: false, solved: false }; if (!validMirrors([...mirrors]))
    return out; let x = -1, y = 2, d = 0; const seen = new Set<string>(); for (let step = 0; step < 100; step++) {
    const [dx, dy] = [[1, 0], [0, 1], [-1, 0], [0, -1]][d];
    x += dx;
    y += dy;
    if (x < 0 || x >= 5 || y < 0 || y >= 4) {
        out.points.push({ x: Math.max(0, Math.min(500, x * 100 + 50)), y: Math.max(0, Math.min(400, y * 100 + 50)) });
        out.window = x === 5 && y === 1;
        break;
    }
    const cell = y * 5 + x, key = `${cell}:${d}`;
    if (seen.has(key)) {
        out.loop = true;
        break;
    }
    seen.add(key);
    out.cells.push(cell);
    out.points.push({ x: x * 100 + 50, y: y * 100 + 50 });
    if (lightStars.some(s => s === cell) && !out.stars.includes(cell))
        out.stars.push(cell);
    const i = mirrorPositions.findIndex(p => p === cell);
    if (i >= 0)
        d = (mirrors[i] === 0 ? 3 - d : 5 - d) % 4;
} out.solved = out.window && out.stars.length === lightStars.length; return out; }
export type Point = {
    x: number;
    y: number;
};
export const gifts = [
    { id: 'a', color: '#e6a3bd', cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }] },
    { id: 'b', color: '#9bcaba', cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }] },
    { id: 'c', color: '#c6b0e7', cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }] },
    { id: 'd', color: '#e8bd77', cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] },
    { id: 'e', color: '#9ebee0', cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }] },
] as const;
export interface GiftPlacement {
    id: string;
    x: number;
    y: number;
    rotation: number;
}
export function giftShape(id: string, rotation: number): Point[] { const item = gifts.find(g => g.id === id); if (!item || !Number.isInteger(rotation))
    return []; let p: Point[] = item.cells.map(c => ({ ...c })); for (let i = 0; i < ((rotation % 4) + 4) % 4; i++)
    p = p.map(c => ({ x: -c.y, y: c.x })); const anchor = [...p].sort((a, b) => a.y - b.y || a.x - b.x)[0]; return p.map(c => ({ x: c.x - anchor.x, y: c.y - anchor.y })); }
export function giftCells(p: GiftPlacement) { return giftShape(p.id, p.rotation).map(c => ({ x: c.x + p.x, y: c.y + p.y })); }
export function validGifts(value: unknown): value is GiftPlacement[] { if (!Array.isArray(value) || value.length > 5)
    return false; const ids = new Set<string>(), used = new Set<number>(); for (const p of value) {
    if (!p || !gifts.some(g => g.id === p.id) || ids.has(p.id) || !Number.isInteger(p.x) || !Number.isInteger(p.y) || !Number.isInteger(p.rotation) || p.rotation < 0 || p.rotation > 3)
        return false;
    ids.add(p.id);
    for (const c of giftCells(p)) {
        const k = c.y * 4 + c.x;
        if (c.x < 0 || c.x >= 4 || c.y < 0 || c.y >= 4 || used.has(k))
            return false;
        used.add(k);
    }
} return true; }
export function placeGift(state: readonly GiftPlacement[], piece: GiftPlacement): GiftPlacement[] { const next = [...state.filter(p => p.id !== piece.id), piece]; return validGifts(next) ? next : state.map(p => ({ ...p })); }
export function giftsSolved(state: readonly GiftPlacement[]) { return state.length === 5 && validGifts([...state]) && state.reduce((n, p) => n + giftCells(p).length, 0) === 16; }
