import { test, expect } from '@playwright/test';
import { load, enter, assign, saved } from './helpers';

test('minimal icon HUD and full-screen settings use touch-sized game controls', async ({ page }) => {
  await load(page); await enter(page);
  await expect(page.locator('.game-hud')).toBeVisible();
  for (const name of ['提示', '本晚線索', '語言', '設定']) {
    const button = page.getByRole('button', { name, exact: true }); const box = (await button.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44);
    expect((await button.innerText()).trim()).toBe('');
  }
  await page.getByRole('button', { name: '設定', exact: true }).click();
  const dialog = page.getByRole('dialog'); const box = (await dialog.boundingBox())!;
  expect([box.x, box.y, box.width, box.height]).toEqual([0, 0, 844, 480]);
  await expect(page.locator('.setting-tile')).toHaveCount(3);
  await page.getByRole('checkbox', { name: '音效', exact: true }).uncheck(); await expect(page.getByRole('status')).toContainText('已儲存');
  await page.getByRole('button', { name: '語言', exact: true }).click();
  await expect(page.locator('.language-tile')).toHaveCount(2);
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Sound effects' })).not.toBeChecked();
  await page.keyboard.press('Escape'); await expect(page.locator('.game-hud')).toBeVisible();
});

test('language cards retain a partial puzzle and support full-screen portrait menus', async ({ page }) => {
  await load(page); await enter(page); await assign(page, 0);
  await page.getByRole('button', { name: '語言', exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  const dialog = page.getByRole('dialog'); const box = (await dialog.boundingBox())!;
  expect([box.x, box.y, box.width, box.height]).toEqual([0, 0, 390, 844]);
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await page.setViewportSize({ width: 844, height: 480 });
  for (let i = 1; i < 4; i++) await assign(page, i);
  await page.getByRole('button', { name: 'Check in all guests  ✦', exact: true }).click(); expect((await saved(page)).coins).toBe(50);
});
