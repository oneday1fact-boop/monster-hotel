import { test, expect } from '@playwright/test';
import { load, ready } from './helpers';

test('illustrated reception is bundled offline and leads into the first-night guide', async ({ page, context }) => {
  const assets: string[] = []; const errors: string[] = [];
  page.on('response', r => { if (r.ok()) assets.push(r.url()); }); page.on('pageerror', e => errors.push(e.message));
  await load(page); expect(assets.some(url => url.endsWith('/art/reception.png'))).toBe(true);
  await expect(page.locator('canvas')).toHaveAttribute('aria-label', '怪物旅館');
  await context.setOffline(true); await page.mouse.click(590, 330);
  await expect(page.locator('canvas')).toHaveAttribute('aria-label', '店長，歡迎回來');
  await page.mouse.click(590, 325); await page.locator('[data-night="1"]').click(); await ready(page);
  await expect(page.getByRole('region', { name: '新手教學' })).toBeVisible(); expect(errors).toEqual([]);
});

test('reception stays full-screen after resizing, supports English and a guest greeting', async ({ page }) => {
  await load(page); await page.getByRole('button', { name: '語言', exact: true }).click(); await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.locator('canvas')).toHaveAttribute('aria-label', 'Monster Hotel');
  await page.setViewportSize({ width: 960, height: 432 });
  await expect.poll(async () => { const b = (await page.locator('canvas').boundingBox())!; return [Math.round(b.width), Math.round(b.height)]; }).toEqual([960, 432]);
  const before = await page.locator('canvas').screenshot();
  await page.mouse.click(100 * 960 / 844, 386 * 432 / 480);
  const after = await page.locator('canvas').screenshot(); expect(after.equals(before)).toBe(false);
  await page.mouse.click(590 * 960 / 844, 330 * 432 / 480); await expect(page.locator('canvas')).toHaveAttribute('aria-label', 'Welcome, keeper');
  await page.mouse.click(590 * 960 / 844, 450 * 432 / 480); await expect(page.locator('canvas')).toHaveAttribute('aria-label', 'Monster Hotel');
});
