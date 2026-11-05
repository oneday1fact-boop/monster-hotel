import { expect, it } from 'vitest';
import { freshCake, inspectCase, compareWheel, linkCase, solveCase, validCake, casePhase, timelineIds, timelineSolved, initialTimeline, swapEvents, validTimeline, initialPipes, pipeSolution, waterTrace, turnPipe, validPipes, mailGuests, letterIds, mailSolved, deliverLetter, validMail, type TimelineId, type MailState } from '../src/domain/mysteries';
function permutations<T>(a: readonly T[]): T[][] { return a.length ? a.flatMap((x, i) => permutations(a.filter((_, j) => i !== j)).map(p => [x, ...p])) : [[]]; }
it('cake needs observation, matching tracks, a causal pair and the supported suspect', () => {
    let s = freshCake();
    expect(solveCase(s, 'rollo')).toBe(false);
    expect(compareWheel(s, 'rollo')).toEqual(s);
    for (const id of ['footprints', 'icing', 'ribbon'] as const)
        s = inspectCase(s, id);
    expect(casePhase(s)).toBe('wheels');
    expect(inspectCase(s, 'icing')).toEqual(s);
    expect(compareWheel(s, 'luno')).toEqual(s);
    s = compareWheel(s, 'rollo');
    expect(casePhase(s)).toBe('reason');
    expect(solveCase(s, 'rollo')).toBe(false);
    expect(linkCase(s, ['heat', 'ribbon'])).toEqual(s);
    expect(linkCase(s, ['heat', 'heat'])).toEqual(s);
    s = linkCase(s, ['heat', 'melt']);
    expect(validCake(s)).toBe(true);
    expect(solveCase(s, 'luno')).toBe(false);
    expect(solveCase(s, 'rollo')).toBe(true);
    expect(validCake({ ...freshCake(), wheel: 'rollo' })).toBe(false);
    expect(validCake({ ...s, seen: ['icing', 'icing', 'ribbon'] })).toBe(false);
});
it('five memories have one consistent order among all 120 permutations', () => {
    const solutions = permutations(timelineIds).filter(timelineSolved);
    expect(solutions).toEqual([['lights', 'tea', 'bell', 'knock', 'door']]);
    expect(timelineSolved(initialTimeline)).toBe(false);
    expect(validTimeline(['tea', 'tea', 'bell', 'knock', 'door'])).toBe(false);
    let s: TimelineId[] = [...initialTimeline];
    for (let i = 0; i < 5; i++)
        s = swapEvents(s, solutions[0][i], i);
    expect(timelineSolved(s)).toBe(true);
    expect(swapEvents(s, 'tea', 8)).toEqual(s);
});
it('spring pipes restore by legal turns and require both baths, all nine pipes and zero leaks', () => {
    let s = [...initialPipes];
    expect(validPipes(s)).toBe(true);
    expect(waterTrace(s).solved).toBe(false);
    for (let i = 0; i < 9; i++)
        for (let k = 0; k < 4 && s[i] !== pipeSolution[i]; k++)
            s = turnPipe(s, i);
    expect(s).toEqual(pipeSolution);
    expect(waterTrace(s)).toMatchObject({ solved: true, baths: [2, 8], leaks: [] });
    expect(waterTrace(s).reached).toHaveLength(9);
    expect(waterTrace(turnPipe(s, 8)).solved).toBe(false);
    expect(waterTrace(turnPipe(s, 0)).solved).toBe(false);
    expect(validPipes([...s.slice(0, 4), 15, ...s.slice(5)])).toBe(false);
    expect(turnPipe(s, 99)).toEqual(s);
});
it('four incomplete addresses need joint elimination and have exactly one one-to-one delivery', () => {
    const solutions = permutations(mailGuests).map(p => Object.fromEntries(letterIds.map((id, i) => [id, p[i]])) as MailState).filter(mailSolved);
    expect(solutions).toEqual([{ violet: 'ember', moon: 'luno', flower: 'nemu', mint: 'yuzu' }]);
    expect(mailSolved({ flower: 'nemu' })).toBe(false);
    let s: MailState = {};
    s = deliverLetter(s, 'moon', 'nemu');
    s = deliverLetter(s, 'flower', 'nemu');
    expect(s).toEqual({ flower: 'nemu' });
    expect(validMail({ moon: 'nemu', flower: 'nemu' })).toBe(false);
    expect(validMail({ unknown: 'luno' })).toBe(false);
});
