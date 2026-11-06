/** Retryable live puzzles. Timing changes presentation; only explicit valid input advances progress. */
export const echoRounds: readonly (readonly number[])[] = [[0, 2, 1], [2, 0, 3, 1], [1, 3, 0, 2, 1]];
export interface EchoState {
    round: number;
    input: number[];
}
export const freshEcho = (): EchoState => ({ round: 0, input: [] });
export function validEcho(v: unknown): v is EchoState { const s = v as EchoState; return !!s && Number.isInteger(s.round) && s.round >= 0 && s.round <= 3 && Array.isArray(s.input) && s.input.length < (echoRounds[s.round]?.length ?? 1) && s.input.every((n, i) => n === echoRounds[s.round]?.[i]); }
export function echoTap(s: EchoState, n: number): {
    state: EchoState;
    wrong: boolean;
} { if (!validEcho(s) || s.round === 3 || !Number.isInteger(n) || n < 0 || n > 3)
    return { state: s, wrong: false }; if (echoRounds[s.round][s.input.length] !== n)
    return { state: { round: s.round, input: [] }, wrong: true }; const input = [...s.input, n]; return { state: input.length === echoRounds[s.round].length ? { round: s.round + 1, input: [] } : { round: s.round, input }, wrong: false }; }
export const cameraGuests = ['luno', 'dou', 'ember', 'rollo', 'yuzu', 'nemu'] as const;
export function cameraReady(index: number, elapsed: number) { const phase = ((elapsed + index * 479) % 3200 + 3200) % 3200; return phase >= 900 && phase < 1850; }
export function validCamera(v: unknown): v is string[] { return Array.isArray(v) && new Set(v).size === v.length && v.every(id => cameraGuests.some(g => g === id)); }
