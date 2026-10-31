import { test, expect } from '@playwright/test';
import { levels } from '../src/domain/levels';
import { load, enter, assign, saved, ready } from './helpers';
test('complete the twenty-night campaign, persist unlocks and replay without rewards', async ({ page }) => {
  test.setTimeout(120_000); const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await load(page); await page.mouse.click(590, 330); await page.mouse.click(590, 325);
  await expect(page.locator('[data-night="1"]')).toBeEnabled(); await expect(page.locator('[data-night="2"]')).toBeDisabled(); await page.locator('[data-night="1"]').click(); await ready(page);
  for (const level of levels) {
    if (level.id === 3 || level.id === 20) { await page.getByRole('button', { name: '本晚線索', exact: true }).click(); await expect(page.getByRole('dialog')).toContainText('同層'); await page.keyboard.press('Escape'); }
    for (let i = 0; i < 4; i++) await assign(page, i, level);
    await page.mouse.click(422, 448); const save = await saved(page); expect(save.completed).toHaveLength(level.id); expect(save.coins).toBe(level.id * 50);
    if (level.id < 20) { await page.mouse.click(422, 398); await ready(page); }
  }
  await page.mouse.click(422, 450); await expect(page.locator('.night-cleared')).toHaveCount(20);
  await page.reload(); await page.waitForFunction(() => document.documentElement.lang === 'zh-Hant'); await ready(page);
  await page.mouse.click(590, 330); await page.mouse.click(590, 325); await expect(page.locator('.night-cleared')).toHaveCount(20);
  await page.locator('[data-night="20"]').click(); await ready(page); const level = levels[19];
  for (let i = 0; i < 4; i++) await assign(page, i, level, level.rooms[i].id);
  await page.mouse.click(422, 448); await page.getByRole('button', { name: '本晚線索', exact: true }).click(); await expect(page.getByRole('dialog')).toContainText('本晚線索'); await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '重設 ↻', exact: true }).click(); await ready(page);
  for (let i = 0; i < 4; i++) await assign(page, i, level);
  await page.mouse.click(422, 448); expect((await saved(page)).coins).toBe(1000); expect(errors).toEqual([]);
});
test('selection supports English, keyboard focus and narrow portrait screens', async ({ page }) => {
  await load(page); await page.mouse.click(590, 330); await page.mouse.click(590, 325); await page.getByRole('button', { name: '語言', exact: true }).click(); await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Choose a night' })).toBeVisible(); await expect(page.locator('[data-night="1"]')).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 }); await expect(page.locator('[data-night="20"]')).toBeDisabled(); await page.locator('[data-night="1"]').click(); await ready(page);
  expect((await page.locator('canvas').boundingBox())!.width).toBeLessThanOrEqual(390);
});
