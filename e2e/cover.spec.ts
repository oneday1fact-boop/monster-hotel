import { test, expect } from './browser';
import { load } from './helpers';

test('bilingual rounded cover logo stays upper-centred and loads offline', async ({ page, context }) => {
  const fonts: string[] = []; page.on('response', r => { if (r.ok() && r.url().includes('monster-cover.woff')) fonts.push(r.url()); });
  await load(page); await page.evaluate(() => document.fonts.ready);
  const logo = page.locator('.cover-logo');
  await expect(page.locator('.cover-logo-zh')).toHaveText('怪物旅館');
  await expect(page.locator('.cover-logo-en')).toHaveText('MONSTER HOTEL');
  expect(fonts).toHaveLength(1);
  expect(await page.evaluate(() => document.fonts.check('900 60px MonsterCover', '怪物旅館'))).toBe(true);
  for (const size of [{ width: 844, height: 480 }, { width: 960, height: 432 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(size); const b = (await logo.boundingBox())!;
    expect(Math.abs(b.x + b.width / 2 - size.width / 2)).toBeLessThan(1);
    expect(b.y).toBeGreaterThanOrEqual(0); expect(b.y + b.height).toBeLessThan(size.height * .25);
    expect(b.x).toBeGreaterThanOrEqual(0); expect(b.x + b.width).toBeLessThan(size.width);
  }
  await page.setViewportSize({ width: 844, height: 480 }); await context.setOffline(true);
  await page.getByRole('button', { name: '語言', exact: true }).click(); await expect(logo).toBeHidden();
  await page.getByRole('button', { name: 'English', exact: true }).click(); await expect(logo).toBeVisible();
  await expect(page.locator('.cover-logo')).toHaveCount(1);
  await page.mouse.click(650, 365); await expect(page.locator('canvas')).toHaveAttribute('aria-label', 'Welcome, keeper');
  await expect(logo).toHaveCount(0);
  await page.locator('[data-action=cover]').click(); await expect(logo).toHaveCount(1);
});
