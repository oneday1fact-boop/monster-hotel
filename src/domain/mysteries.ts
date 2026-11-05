/** Deterministic inference puzzles. All feedback follows visible evidence. */
export const caseObjects = ['footprints', 'icing', 'ribbon'] as const;
export type CaseObject = typeof caseObjects[number];
export interface CakeState {
    seen: CaseObject[];
    wheel?: string;
    evidence: string[];
    linked: boolean;
}
export const freshCake = (): CakeState => ({ seen: [], evidence: [], linked: false });
export function validCake(v: unknown): v is CakeState {
    const s = v as CakeState;
    return !!s && Array.isArray(s.seen) && new Set(s.seen).size === s.seen.length && s.seen.every(x => caseObjects.includes(x)) && (s.wheel === undefined || s.wheel === 'rollo') && (!s.wheel || s.seen.length === 3) && Array.isArray(s.evidence) && new Set(s.evidence).size === s.evidence.length && s.evidence.every(x => ['heat', 'melt', 'ribbon'].includes(x)) && typeof s.linked === 'boolean' && (!s.linked || s.wheel === 'rollo');
}
export function casePhase(s: CakeState) { return s.wheel ? 'reason' : s.seen.length === 3 ? 'wheels' : 'scene'; }
export function inspectCase(s: CakeState, id: CaseObject): CakeState { return caseObjects.includes(id) && !s.seen.includes(id) ? { ...s, seen: [...s.seen, id] } : s; }
export function compareWheel(s: CakeState, id: string): CakeState { return s.seen.length === 3 && id === 'rollo' ? { ...s, wheel: id } : s; }
export function linkCase(s: CakeState, pair: readonly string[]): CakeState { return s.wheel && pair.length === 2 && new Set(pair).size === 2 && pair.includes('heat') && pair.includes('melt') ? { ...s, linked: true } : s; }
export function solveCase(s: CakeState, suspect: string) { return validCake(s) && s.seen.length === 3 && s.wheel === 'rollo' && s.linked && suspect === 'rollo'; }
export const timelineIds = ['tea', 'bell', 'lights', 'knock', 'door'] as const;
export type TimelineId = typeof timelineIds[number];
export const initialTimeline: TimelineId[] = ['knock', 'door', 'bell', 'tea', 'lights'];
export function validTimeline(v: unknown): v is TimelineId[] { return Array.isArray(v) && v.length === 5 && new Set(v).size === 5 && v.every(x => timelineIds.includes(x)); }
export function timelineSolved(order: readonly TimelineId[]) { if (!validTimeline(order))
    return false; const at = (id: TimelineId) => order.indexOf(id); return at('bell') - at('lights') === 2 && at('knock') === at('bell') + 1 && at('tea') > at('lights') && at('tea') < at('knock') && at('door') === 4; }
export function swapEvents(order: readonly TimelineId[], selected: TimelineId, slot: number): TimelineId[] { const next = [...order], from = next.indexOf(selected); if (from >= 0 && Number.isInteger(slot) && slot >= 0 && slot < 5)
    [next[from], next[slot]] = [next[slot], next[from]]; return next; }
// Ports N,E,S,W. A single T-junction splits water between two baths.
export const pipeSolution = [12, 6, 10, 5, 7, 12, 3, 9, 3] as const;
export function rotatePipe(port: number) { return ((port << 1) & 15) | ((port >> 3) & 1); }
export const initialPipes = pipeSolution.map((p, i) => { let n: number = p; for (let k = 0; k < [1, 2, 1, 1, 2, 1, 2, 1, 3][i]; k++)
    n = rotatePipe(n); return n; });
function orientations(p: number) { return [p, rotatePipe(p), rotatePipe(rotatePipe(p)), rotatePipe(rotatePipe(rotatePipe(p)))]; }
export function validPipes(v: unknown): v is number[] { return Array.isArray(v) && v.length === 9 && v.every((p, i) => Number.isInteger(p) && orientations(pipeSolution[i]).includes(p)); }
export function turnPipe(board: readonly number[], index: number) { const next = [...board]; if (validPipes(next) && Number.isInteger(index) && index >= 0 && index < 9)
    next[index] = rotatePipe(next[index]); return next; }
export function waterTrace(board: readonly number[]) {
    const reached: number[] = [], leaks: number[] = [];
    if (!validPipes(board) || !(board[0] & 8))
        return { reached, leaks, baths: [], solved: false };
    const queue = [0], seen = new Set([0]);
    while (queue.length) {
        const at = queue.shift()!;
        reached.push(at);
        for (const [dx, dy, port, opposite] of [[0, -1, 1, 4], [1, 0, 2, 8], [0, 1, 4, 1], [-1, 0, 8, 2]]) {
            if (!(board[at] & port))
                continue;
            if ((at === 0 && port === 8) || (at === 2 && port === 2) || (at === 8 && port === 2))
                continue;
            const x = at % 3 + dx, y = Math.floor(at / 3) + dy, n = y * 3 + x;
            if (x < 0 || x > 2 || y < 0 || y > 2 || !(board[n] & opposite)) {
                if (!leaks.includes(at))
                    leaks.push(at);
                continue;
            }
            if (!seen.has(n)) {
                seen.add(n);
                queue.push(n);
            }
        }
    }
    const baths = [2, 8].filter(n => seen.has(n) && !!(board[n] & 2));
    return { reached, leaks, baths, solved: reached.length === 9 && baths.length === 2 && leaks.length === 0 };
}
export const mailGuests = ['luno', 'ember', 'nemu', 'yuzu'] as const;
export type MailGuest = typeof mailGuests[number];
export const letterIds = ['violet', 'moon', 'flower', 'mint'] as const;
export type LetterId = typeof letterIds[number];
export type MailState = Partial<Record<LetterId, MailGuest>>;
export const mailProfiles = { luno: { window: 'moon', curtain: 'blue', tea: 'mint' }, ember: { window: 'sun', curtain: 'violet', tea: 'black' }, nemu: { window: 'moon', curtain: 'violet', tea: 'flower' }, yuzu: { window: 'sun', curtain: 'green', tea: 'mint' } } as const;
export function validMail(v: unknown): v is MailState { return !!v && typeof v === 'object' && !Array.isArray(v) && Object.entries(v).every(([k, x]) => letterIds.includes(k as LetterId) && mailGuests.includes(x as MailGuest)) && new Set(Object.values(v)).size === Object.values(v).length; }
export function deliverLetter(s: MailState, id: LetterId, guest: MailGuest): MailState { const next = { ...s }; for (const key of letterIds)
    if (next[key] === guest)
        delete next[key]; next[id] = guest; return next; }
export function letterMatches(id: LetterId, guest: MailGuest) { const p = mailProfiles[guest]; return id === 'violet' ? p.curtain === 'violet' : id === 'moon' ? p.window === 'moon' : id === 'flower' ? p.tea === 'flower' : p.tea === 'mint'; }
export function mailSolved(s: MailState) { return validMail(s) && letterIds.every(id => !!s[id] && letterMatches(id, s[id]!)); }
