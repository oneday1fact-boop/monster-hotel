import { test, expect } from '@playwright/test';
import { levels } from '../src/domain/levels';
import { solve } from '../src/domain/puzzle';
const xs = [140, 328, 516, 704];
test('complete the twenty-night campaign, persist unlocks and replay without rewards', async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/'); await page.waitForFunction(() => document.documentElement.lang === 'zh-Hant');
  await page.mouse.click(590, 330); await page.mouse.click(590, 325);
  await expect(page.locator('[data-night="1"]')).toBeEnabled(); await expect(page.locator('[data-night="2"]')).toBeDisabled();
  await page.locator('[data-night="1"]').click();
  for (const level of levels) {
    const solution = solve(level)[0];
    if (level.id === 3 || level.id === 20) {
      await page.mouse.click(190, 26); await expect(page.getByRole('dialog')).toContainText('同層'); await page.keyboard.press('Escape');
    }
    for (let i = 0; i < level.guests.length; i++) {
      const roomIndex = level.rooms.findIndex(room => room.id === solution[level.guests[i].id]);
      await page.mouse.click(xs[i], 340); await page.mouse.click(xs[roomIndex], 220);
    }
    await page.mouse.click(422, 442);
    const save = await page.evaluate(() => JSON.parse(localStorage.getItem('midnight-check-in.save.v1') ?? 'null'));
    expect(save.completed).toHaveLength(level.id); expect(save.coins).toBe(level.id * 50);
    if (level.id < 20) await page.mouse.click(422, 398);
  }
  await page.mouse.click(422, 450); await expect(page.locator('.night-cleared')).toHaveCount(20);
  await page.reload(); await page.waitForFunction(() => document.documentElement.lang === 'zh-Hant');
  await page.mouse.click(590, 330); await page.mouse.click(590, 325);
  await expect(page.locator('.night-cleared')).toHaveCount(20);
  await page.locator('[data-night="20"]').click();
  const level = levels[19]; const solution = solve(level)[0];
  // An amenity-valid but clue-invalid placement must not advance the campaign.
  for (let i = 0; i < 4; i++) { await page.mouse.click(xs[i], 340); await page.mouse.click(xs[i], 220); }
  await page.mouse.click(422, 442);
  await page.mouse.click(190, 26); await expect(page.getByRole('dialog')).toContainText('本晚線索'); await page.keyboard.press('Escape');
  for (let i = 0; i < 4; i++) {
    await page.mouse.click(xs[i], 340); await page.mouse.click(xs[level.rooms.findIndex(r => r.id === solution[level.guests[i].id])], 220);
  }
  await page.mouse.click(422, 442);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('midnight-check-in.save.v1')!).coins)).toBe(1000);
  expect(errors).toEqual([]);
});

test('selection supports English, keyboard focus and narrow portrait screens', async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => document.documentElement.lang === 'zh-Hant');
  await page.mouse.click(590, 330); await page.mouse.click(590, 325);
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Choose a night' })).toBeVisible();
  await expect(page.locator('[data-night="1"]')).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('[data-night="20"]')).toBeDisabled();
  await page.locator('[data-night="1"]').click();
  // Game remains landscape-fit inside a portrait viewport.
  const box = (await page.locator('canvas').boundingBox())!; expect(box.width).toBeLessThanOrEqual(390);
});
