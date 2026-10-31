import { test, expect } from '@playwright/test';
import { firstLevel } from '../src/domain/puzzle';
import { queueX, queueY, roomPoint } from '../src/game/layout';
import { load, enter, assign, saved, ready } from './helpers';

test('Chinese room details and all four character cards preserve the puzzle', async ({ page }) => {
  await load(page); await enter(page);
  const rooms = ['小墓穴地下室', '暖爐工房', '月光貴賓房', '清風布草閣'];
  const guests = ['月毛 · 狼人', '豆豆 · 殭屍', '燈燈 · 提燈妖', '卷卷 · 小木乃伊'];
  for (let i = 0; i < 4; i++) {
    const p = roomPoint(firstLevel.rooms[i]); await page.mouse.click(p.x + 158, p.y - 42);
    await expect(page.getByRole('dialog')).toContainText(rooms[i]); await expect(page.getByRole('dialog')).toContainText('每個房間只可住一位');
    await page.keyboard.press('Escape'); await page.mouse.click(queueX[i], 412);
    await expect(page.getByRole('heading', { name: guests[i] })).toBeVisible(); await expect(page.getByRole('dialog')).toContainText('入住心願');
    await page.getByRole('button', { name: '返回關卡', exact: true }).click();
  }
  await page.mouse.click(queueX[0], queueY); const p = roomPoint(firstLevel.rooms[2]); await page.mouse.click(p.x + 158, p.y - 42);
  await page.getByRole('button', { name: '返回關卡', exact: true }).click(); await page.mouse.click(422, 448); expect(await saved(page)).toBeNull();
  for (let i = 0; i < 4; i++) await assign(page, i);
  await page.mouse.click(422, 448); expect((await saved(page))?.coins).toBe(50);
});

test('hints reveal strategy, a guest, then a room without placing anyone', async ({ page }) => {
  await load(page); await enter(page); await page.mouse.click(74, 26);
  await expect(page.getByRole('dialog')).toContainText('提示階段 1/3'); await expect(page.getByRole('dialog')).not.toContainText('101 ·');
  await page.getByRole('button', { name: '再給我一點提示' }).click(); await expect(page.getByRole('dialog')).toContainText('月毛'); await expect(page.getByRole('dialog')).not.toContainText('101 ·');
  await page.getByRole('button', { name: '再給我一點提示' }).click(); await expect(page.getByRole('dialog')).toContainText('101 · 月光貴賓房');
  await page.keyboard.press('Escape');
  for (let i = 1; i < 4; i++) await assign(page, i);
  await page.mouse.click(422, 448); expect(await saved(page)).toBeNull();
  await page.mouse.click(74, 26); await expect(page.getByRole('dialog')).toContainText('月毛'); await page.keyboard.press('Escape'); await assign(page, 0);
  await page.mouse.click(74, 26); await expect(page.getByRole('dialog')).toContainText('每位住客都有合適房間了');
});

test('language switches in place, persists after reload, and preserves completion rewards', async ({ page }) => {
  await load(page); await enter(page); await assign(page, 0);
  await page.mouse.click(765, 26); await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  const p = roomPoint(firstLevel.rooms[3]); await page.mouse.click(p.x + 158, p.y - 42); await expect(page.getByRole('dialog')).toContainText('102 · Breezy linen loft');
  await page.keyboard.press('Escape'); await page.mouse.click(queueX[3], 412); await expect(page.getByRole('dialog')).toContainText('Rollo · Mummy'); await page.keyboard.press('Escape');
  for (let i = 1; i < 4; i++) await assign(page, i);
  await page.mouse.click(422, 448); expect((await saved(page))?.coins).toBe(50);
  await page.reload(); await expect(page.locator('html')).toHaveAttribute('lang', 'en'); await ready(page); await enter(page);
  for (let i = 0; i < 4; i++) await assign(page, i);
  await page.mouse.click(422, 448); expect((await saved(page))?.coins).toBe(50);
});

test('offline drag completion, modal keyboard focus, and small screens', async ({ page, context }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await load(page); await enter(page); await context.setOffline(true); await page.mouse.click(queueX[0], 412);
  await expect(page.getByRole('button', { name: '返回關卡', exact: true })).toBeFocused(); await page.keyboard.press('Tab'); await expect(page.getByRole('button', { name: '返回關卡', exact: true })).toBeFocused(); await page.keyboard.press('Escape');
  const targets = ['101', 'B01', 'B02', '102'];
  for (let i = 0; i < 4; i++) {
    const p = roomPoint(firstLevel.rooms.find(r => r.id === targets[i])!);
    await page.mouse.move(queueX[i], queueY); await page.mouse.down(); await page.mouse.move(p.x, p.y, { steps: 10 }); await page.mouse.up(); await ready(page);
  }
  await page.mouse.click(422, 448); expect((await saved(page))?.coins).toBe(50);
  await page.mouse.click(422, 450); await page.locator('[data-night="1"]').click(); await ready(page);
  for (const viewport of [{ width: 740, height: 360 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport); const canvas = page.locator('canvas'); const box = (await canvas.boundingBox())!;
    expect(box.width).toBeLessThanOrEqual(viewport.width); expect(box.height).toBeLessThanOrEqual(viewport.height);
    await page.mouse.click(box.x + queueX[0] * box.width / 844, box.y + 412 * box.height / 480); await expect(page.getByRole('dialog')).toBeVisible();
    const card = (await page.getByRole('dialog').boundingBox())!; expect(card.x + card.width).toBeLessThanOrEqual(viewport.width);
    await page.getByRole('button', { name: '返回關卡', exact: true }).click();
  }
  expect(errors).toEqual([]);
});
