/** Three different puzzle systems, independent of presentation and storage. */
export const episodeIds = ['cake-case', 'luggage-run', 'dream-door'] as const;
export type EpisodeId = typeof episodeIds[number];
export const isEpisode = (id: unknown): id is EpisodeId => episodeIds.some(x => x === id);
export const evidenceIds = ['footprints', 'icing', 'ribbon'] as const;
export type EvidenceId = typeof evidenceIds[number];
export function accusation(clues: readonly EvidenceId[], suspect: string) { return evidenceIds.every(id => clues.includes(id)) && suspect === 'rollo'; }
export const routeWalls = [4, 9] as const;
export const initialFurniture = [1, 2, 5];
export const adjacent = (a: number, b: number) => a >= 0 && a < 12 && b >= 0 && b < 12 && Math.abs(Math.floor(a / 4) - Math.floor(b / 4)) + Math.abs(a % 4 - b % 4) === 1;
export function moveFurniture(items: readonly number[], from: number, to: number) { return items.includes(from) && adjacent(from, to) && to !== 0 && !routeWalls.some(x => x === to) && !items.includes(to) ? items.map(x => x === from ? to : x) : [...items]; }
export function luggagePath(items: readonly number[]): number[] { const queue = [[0]], seen = new Set([0]); while (queue.length) {
    const path = queue.shift()!, at = path.at(-1)!;
    if (at === 11)
        return path;
    for (let n = 0; n < 12; n++)
        if (adjacent(at, n) && !seen.has(n) && !items.includes(n) && !routeWalls.some(x => x === n)) {
            seen.add(n);
            queue.push([...path, n]);
        }
} return []; }
export type DreamState = {
    world: 'real' | 'dream';
    seed: boolean;
    grown: boolean;
    key: boolean;
    open: boolean;
};
export const emptyDream = (): DreamState => ({ world: 'real', seed: false, grown: false, key: false, open: false });
export function dreamAction(state: DreamState, action: 'switch' | 'seed' | 'water' | 'key' | 'door'): DreamState {
    const next = { ...state };
    if (action === 'switch')
        next.world = state.world === 'real' ? 'dream' : 'real';
    if (action === 'seed' && state.world === 'real')
        next.seed = true;
    if (action === 'water' && state.world === 'dream' && state.seed)
        next.grown = true;
    if (action === 'key' && state.world === 'real' && state.grown)
        next.key = true;
    if (action === 'door' && state.world === 'dream' && state.key)
        next.open = true;
    return next;
}
