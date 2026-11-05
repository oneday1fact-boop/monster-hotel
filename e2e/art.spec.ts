import { test, expect } from '@playwright/test';
import { firstLevel } from '../src/domain/puzzle';
import { queueX, queueY, roomPoint, residentPoint } from '../src/game/layout';
import { enter, load, ready, assign, saved } from './helpers';
test('cartoon room sets and character cards are local and available offline', async ({ page, context }) => {
  const loaded: string[] = []; page.on('response', response => { if (response.url().includes('/art/') && response.ok()) loaded.push(response.url()); });
  await load(page); expect(loaded.some(url => url.endsWith('/guests-cartoon.png'))).toBe(true);
  for (const style of ['elegant', 'linen', 'basement', 'hearth']) expect(loaded.some(url => url.endsWith(`/rooms/${style}.png`))).toBe(true);
  await enter(page); await context.setOffline(true); await page.mouse.click(queueX[3], queueY + 31);
  await expect(page.getByRole('img', { name: '卷卷 · 小木乃伊' })).toBeVisible(); await page.keyboard.press('Escape');
  const p = roomPoint(firstLevel.rooms[0]); await page.mouse.click(p.x + 158, p.y - 42);
  await expect(page.getByRole('img', { name: '小墓穴地下室' })).toBeVisible(); await page.getByRole('button',{name:'下一頁',exact:true}).click(); await expect(page.getByRole('dialog')).toContainText('石拱牆');
});
test('reduced motion keeps the title and dollhouse stable without blocking play', async ({ page }) => {
  await load(page); const canvas = page.locator('canvas'); const first = await canvas.screenshot(); await page.waitForTimeout(300); expect(first.equals(await canvas.screenshot())).toBe(true);
  await enter(page); const puzzle = await canvas.screenshot(); await page.waitForTimeout(300); expect(puzzle.equals(await canvas.screenshot())).toBe(true);
  for (let i = 0; i < 4; i++) await assign(page, i);
  await page.locator('[data-action="check-in"]').click(); expect((await saved(page)).completed).toEqual([1]);
});
test('guests enter in a queue, walk upstairs, and can be dragged out of occupied rooms', async ({ page }) => {
  await load(page); await page.emulateMedia({ reducedMotion: 'no-preference' });
  await enter(page);
  await ready(page);
  await page.mouse.click(queueX[0], queueY); const upstairs = roomPoint(firstLevel.rooms[2]); await page.mouse.click(upstairs.x, upstairs.y);
  await expect(page.locator('canvas')).toHaveAttribute('aria-busy', 'true'); await ready(page);
  // Move the resident back into a basement room; assigning Dou there returns Luno to the queue.
  const actor = residentPoint(firstLevel.rooms[2]); const basement = roomPoint(firstLevel.rooms[0]);
  await page.mouse.move(actor.x, actor.y); await page.mouse.down(); await page.mouse.move(basement.x, basement.y, { steps: 10 }); await page.mouse.up(); await ready(page);
  await assign(page, 1); await assign(page, 0); await assign(page, 2); await assign(page, 3);
  await page.locator('[data-action="check-in"]').click(); expect((await saved(page)).coins).toBe(50);
});
