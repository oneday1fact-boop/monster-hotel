import { expect, it } from 'vitest';
import { echoRounds, freshEcho, echoTap, validEcho, cameraReady, validCamera } from '../src/domain/liveGames';
import { firstLevel, solve, validate } from '../src/domain/puzzle';
import { initialRoad, slideRoad, roadReviewSolution, roadPath, validRoadStack } from '../src/domain/episodes';
import { decorations, purchase } from '../src/domain/decorations';
import { scenePrices } from '../src/domain/sceneryShop';
it('requires relational deductions, has one answer, and accepts the same original room solution', () => { expect(solve({ ...firstLevel, rules: [] }).length).toBeGreaterThan(1); expect(solve(firstLevel)).toEqual([{ luno: '101', dou: 'B01', ember: 'B02', rollo: '102' }]); const alternative = solve({ ...firstLevel, rules: [] }).find(a => !validate(firstLevel, a).valid)!; expect(validate(firstLevel, alternative).reason).toBe('rule'); });
it('retains completed echo rounds and discards only an incorrect current-round attempt', () => { let s = freshEcho(); for (const n of echoRounds[0])
    s = echoTap(s, n).state; expect(s.round).toBe(1); s = echoTap(s, 2).state; const before = JSON.stringify(s), bad = echoTap(s, 3); expect(bad).toEqual({ wrong: true, state: { round: 1, input: [] } }); expect(JSON.stringify(s)).toBe(before); });
it('requires every note in all three echo rounds, with no repeated reward from extra input', () => { let s = freshEcho(); for (const notes of echoRounds)
    for (const n of notes)
        s = echoTap(s, n).state; expect(s).toEqual({ round: 3, input: [] }); expect(echoTap(s, 0).state).toBe(s); expect(validEcho({ round: 1, input: [0] })).toBe(false); expect(validEcho({ round: 9, input: [] })).toBe(false); });
it('camera windows repeat without an overall deadline; a missed moment always returns', () => { for (let i = 0; i < 6; i++) {
    expect(cameraReady(i, 1200 - i * 479)).toBe(true);
    expect(cameraReady(i, 1200 - i * 479 + 3200 * 100)).toBe(true);
    expect(cameraReady(i, 2000 - i * 479)).toBe(false);
} expect(validCamera(['luno', 'luno'])).toBe(false); expect(validCamera(['luno', 'dou'])).toBe(true); expect(validCamera(['unknown'])).toBe(false); });
it('every road step can be undone and redone after wrong turns, with corrupt histories rejected', () => { const start = [...initialRoad], first = slideRoad(start, roadReviewSolution[0]), second = slideRoad(first, roadReviewSolution[1]); expect(validRoadStack([start, first], second)).toBe(true); expect(validRoadStack([second, first], start)).toBe(true); expect(validRoadStack([start], second)).toBe(false); expect(validRoadStack([[...start].fill(0)], first)).toBe(false); let b: number[] = start; for (const m of roadReviewSolution)
    b = slideRoad(b, m); expect(roadPath(b).length).toBeGreaterThan(1); expect(roadReviewSolution.length).toBe(8); });
it('current rewards cannot buy the whole shop; existing coins and owned items are not confiscated', () => { const total = decorations.reduce((n, d) => n + d.price, 0) + scenePrices.night + scenePrices.autumn + scenePrices.winter; expect(total).toBeGreaterThan(6550 * 2); const wallet = { coins: 9000, decorations: ['moon-lamps'] as [
        'moon-lamps'
    ], equipped: ['moon-lamps'] as [
        'moon-lamps'
    ] }; expect(purchase(wallet, 'moon-lamps').wallet).toBe(wallet); expect(purchase({ coins: 550 }, 'flower-box').status).toBe('insufficient'); expect(purchase({ coins: 1050 }, 'flower-box').status).toBe('bought'); });
