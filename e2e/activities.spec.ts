import { test, expect } from '@playwright/test';
import { firstLevel, solve } from '../src/domain/puzzle';
import { residentPoint } from '../src/game/layout';
import { load, enter, assign, saved } from './helpers';

test('all four residents keep performing their activities across a complete cycle', async ({ page }) => {
  // Include startup, guest introduction and software-rendered screenshots across full motion cycles.
  test.setTimeout(90_000);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await load(page); await enter(page);
  for (let i = 0; i < 4; i++) await assign(page, i);
  // Recreate residents with motion enabled, retaining their room assignments.
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('button', { name: '語言', exact: true }).click();
  await page.getByRole('button', { name: '繁體中文', exact: true }).click();
  const solution = solve(firstLevel)[0];
  const clips = firstLevel.guests.map(guest => {
    const point = residentPoint(firstLevel.rooms.find(room => room.id === solution[guest.id])!);
    return { x: point.x - 52, y: point.y - 40, width: 104, height: 82 };
  });
  const capture = async () => Promise.all(clips.map(clip => page.screenshot({ clip })));
  const first = await capture(); await page.waitForTimeout(700);
  const next = await capture();
  for (let i = 0; i < 4; i++) expect(first[i].equals(next[i]), `resident ${i} must move`).toBe(false);
  await page.waitForTimeout(6500); const later = await capture();
  for (let i = 0; i < 4; i++) expect(next[i].equals(later[i]), `resident ${i} must keep looping`).toBe(false);
  await page.getByRole('button', { name: '安排全部入住  ✦', exact: true }).click();
  expect((await saved(page)).coins).toBe(50); expect(errors).toEqual([]);
});
