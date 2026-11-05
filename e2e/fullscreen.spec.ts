import { test, expect, type Page } from '@playwright/test';
import { queueX, queueY, roomPoint } from '../src/game/layout';
import { firstLevel } from '../src/domain/puzzle';
import { load, enter, assign, saved } from './helpers';
async function point(page: Page, x: number, y: number) {
  const size = page.viewportSize()!; await page.mouse.click(x * size.width / 844, y * size.height / 480);
}
test('canvas fills wider phones and tablets, preserves placements and remains interactive after resizing', async ({ page }) => {
  await load(page); await enter(page); await assign(page, 0);
  for (const size of [{ width: 915, height: 412 }, { width: 1024, height: 768 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(size);
    await expect.poll(async () => { const b = (await page.locator('canvas').boundingBox())!; return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; }).toEqual([0, 0, size.width, size.height]);
  }
  await page.setViewportSize({ width: 915, height: 412 });
  await expect.poll(async () => Math.round((await page.locator('canvas').boundingBox())!.width)).toBe(915);
  const destinations = ['101', 'B01', 'B02', '102'];
  for (let i = 1; i < 4; i++) { await point(page, queueX[i], queueY); const p = roomPoint(firstLevel.rooms.find(room => room.id === destinations[i])!); await point(page, p.x, p.y); }
  await page.locator('[data-action="check-in"]').click(); expect((await saved(page))?.coins).toBe(50);
});
test('a living room continues animating after check-in while reduced motion stays optional', async ({ page }) => {
  await load(page); await page.emulateMedia({ reducedMotion: 'no-preference' }); await enter(page); await assign(page, 2);
  const canvas = page.locator('canvas'); const first = await canvas.screenshot(); await page.waitForTimeout(450); const next = await canvas.screenshot();
  expect(first.equals(next)).toBe(false);
  expect((await saved(page)).coins).toBe(0);
});
