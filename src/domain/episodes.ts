/** Pure rules for evidence, one-gap sliding roads and picture comparison. */
export const episodeIds = ['cake-case', 'luggage-run', 'dream-door', 'lift-balance', 'moon-mirrors', 'gift-box', 'midnight-knock', 'spring-pipes', 'lost-letters', 'scent-room', 'key-cabinet', 'group-photo', 'storm-arrival'] as const;
export type EpisodeId = typeof episodeIds[number];
export const isEpisode = (id: unknown): id is EpisodeId => episodeIds.some(x => x === id);
export const evidenceIds = ['footprints', 'icing', 'ribbon'] as const;
export type EvidenceId = typeof evidenceIds[number];
export function accusation(clues: readonly EvidenceId[], suspect: string) {
    return evidenceIds.every(id => clues.includes(id)) && suspect === 'rollo';
}
// A road tile has two ports: north=1, east=2, south=4, west=8.
export const roadSize = 4;
export const roadPorts = [10, 12, 5, 9, 3, 5, 10, 12, 3, 3, 10, 12, 5, 10, 3] as const;
export const initialRoad = [4, 0, 2, 3, 8, 1, 6, 7, 12, 5, 10, 11, -1, 9, 13, 14] as const;
export const roadReviewSolution = [8, 4, 0, 1, 5, 9, 13, 14] as const;
export const adjacentRoad = (a: number, b: number) => a >= 0 && a < 16 && b >= 0 && b < 16 && Math.abs(Math.floor(a / 4) - Math.floor(b / 4)) + Math.abs(a % 4 - b % 4) === 1;
export function validRoad(board: unknown): board is number[] {
    return Array.isArray(board) && board.length === 16 && new Set(board).size === 16 && board.every(n => Number.isInteger(n) && n >= -1 && n < 15);
}
/** Only a tile directly beside the single empty slot can slide. No rotations. */
export function slideRoad(board: readonly number[], index: number): number[] {
    const next = [...board], blank = board.indexOf(-1);
    if (validRoad(next) && adjacentRoad(index, blank)) {
        next[blank] = next[index];
        next[index] = -1;
    }
    return next;
}
export function roadPath(board: readonly number[]): number[] {
    if (!validRoad([...board]) || board[0] < 0 || !(roadPorts[board[0]] & 8))
        return [];
    const queue = [[0]], seen = new Set([0]);
    while (queue.length) {
        const path = queue.shift()!, at = path.at(-1)!;
        if (at === 15 && (roadPorts[board[at]] & 2))
            return path;
        for (const [delta, port, opposite] of [[-4, 1, 4], [1, 2, 8], [4, 4, 1], [-1, 8, 2]]) {
            const n = at + delta;
            if (adjacentRoad(at, n) && !seen.has(n) && board[n] >= 0 && (roadPorts[board[at]] & port) && (roadPorts[board[n]] & opposite)) {
                seen.add(n);
                queue.push([...path, n]);
            }
        }
    }
    return [];
}
/** All differences are explicit matching regions, drawn at the same position in both pictures. */
export const comparisonProps = [
    { id: 'lamp', x: 10, y: 17, w: 20, h: 24 }, { id: 'crest', x: 72, y: 17, w: 18, h: 22 },
    { id: 'key', x: 43, y: 48, w: 20, h: 23 }, { id: 'rug', x: 12, y: 71, w: 22, h: 22 }, { id: 'parcel', x: 73, y: 65, w: 22, h: 27 },
] as const;
export const differences = [
    { id: 'lamp', x: 17, y: 24, w: 12, h: 18 }, { id: 'crest', x: 75, y: 25, w: 12, h: 19 },
    { id: 'key', x: 43, y: 48, w: 20, h: 23 }, { id: 'rug', x: 14, y: 65, w: 14, h: 22 }, { id: 'parcel', x: 81, y: 65, w: 13, h: 24 },
] as const;
export type DifferenceId = typeof differences[number]['id'];
export function markDifference(found: readonly DifferenceId[], id: string): DifferenceId[] {
    return differences.some(d => d.id === id) && !found.includes(id as DifferenceId) ? [...found, id as DifferenceId] : [...found];
}
export function differencesComplete(found: readonly DifferenceId[]) { return differences.every(d => found.includes(d.id)); }
/** A persisted undo/redo stack must be a chain of real, reversible one-cell slides. */
export function validRoadStack(value:unknown,board:readonly number[]):value is number[][]{
 if(!Array.isArray(value)||value.length>512||!validRoad([...board]))return false;
 let current=[...board];for(let i=value.length-1;i>=0;i--){const previous=value[i];if(!validRoad(previous))return false;const next=slideRoad(current,previous.indexOf(-1));if(!next.every((x,j)=>x===previous[j]))return false;current=previous;}return true;
}
