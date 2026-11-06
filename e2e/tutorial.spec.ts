import { test, expect } from './browser';
import { load, enter, assign, saved, ready } from './helpers';
import { queueX, queueY, roomPoint } from '../src/game/layout';
import { firstLevel } from '../src/domain/puzzle';

test('guide follows selection, wrong placement, drag correction and independent completion', async ({ page }) => {
  await load(page); await enter(page);
  const coach = page.getByRole('region', { name: '新手教學' });
  await expect(coach).toContainText('先點月毛');
  await page.mouse.click(queueX[0], queueY); await expect(coach).toContainText('月光');
  await expect(page.locator('.tutorial-target--room')).toBeHidden();
  await page.mouse.click(roomPoint(firstLevel.rooms[0]).x, roomPoint(firstLevel.rooms[0]).y); await ready(page);
  await expect(coach).toContainText('再選佢');
  const source = { x: roomPoint(firstLevel.rooms[0]).x + 90, y: roomPoint(firstLevel.rooms[0]).y + 18 }; const target = roomPoint(firstLevel.rooms[2]);
  await page.mouse.move(source.x, source.y); await page.mouse.down(); await page.mouse.move(target.x, target.y, { steps: 12 }); await page.mouse.up(); await ready(page);
  await expect(coach).toContainText('其餘三位'); await expect(page.locator('.tutorial-target--room')).toBeHidden();
  for (let i = 1; i < 4; i++) await assign(page, i);
  await expect(coach).toContainText('撳「入住」'); await page.getByRole('button', { name: '安排全部入住  ✦' }).click();
  expect((await saved(page)).coins).toBe(50); await expect(coach).toBeHidden();
  await page.mouse.click(422, 450);
  // The growing route opens at the next incomplete stage on page two.
  if (!await page.locator('[data-puzzle="1"]').count()) await page.getByRole('button', { name: '上一頁', exact: true }).click();
  await page.locator('[data-puzzle="1"]').click(); await ready(page); await expect(coach).toBeHidden();
});

test('skipping is saved and does not award coins or alter the puzzle', async ({ page }) => {
  await load(page); await enter(page); await assign(page, 0);
  await page.getByRole('button', { name: '跳過教學' }).click(); await expect(page.locator('.tutorial-coach')).toBeHidden();
  expect((await saved(page)).coins).toBe(0);
  await page.reload(); await ready(page); await enter(page); await expect(page.locator('.tutorial-coach')).toBeHidden();
  expect((await saved(page)).coins).toBe(0);
  for (let i = 0; i < 4; i++) await assign(page, i);
  await page.getByRole('button', { name: '安排全部入住  ✦' }).click(); expect((await saved(page)).coins).toBe(50);
});

test('language, dialogs, reset and viewport changes retain usable guidance', async ({ page }) => {
  await load(page); await enter(page); await page.mouse.click(queueX[0], queueY);
  await page.getByRole('button', { name: '設定', exact: true }).click(); await expect(page.locator('.tutorial-coach')).toBeHidden(); await page.keyboard.press('Escape');
  await expect(page.locator('.tutorial-coach')).toHaveAttribute('data-step', 'place');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.getByRole('region', { name: 'First-night guide' })).toContainText('moonlight');
  for (const size of [{ width: 915, height: 412 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(size); const box = (await page.locator('.tutorial-coach').boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(size.width);
    const skip = (await page.getByRole('button', { name: 'Skip tutorial' }).boundingBox())!; expect(skip.height).toBeGreaterThanOrEqual(44);
  }
  await page.setViewportSize({ width: 844, height: 480 }); await page.getByRole('button', { name: 'Reset ↻' }).click(); await ready(page);
  await expect(page.locator('.tutorial-coach')).toHaveAttribute('data-step', 'select');
});
