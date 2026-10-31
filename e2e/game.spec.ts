import { test, expect, type Page } from '@playwright/test';
const xs = [140, 328, 516, 704];
const saveKey = 'midnight-check-in.save.v1';
async function load(page: Page) {
  await page.goto('/'); await expect(page.locator('canvas')).toBeVisible();
  // The Phaser canvas exists before scene creation completes.
  await page.waitForFunction(() => !!document.querySelector('canvas')?.getAttribute('style') && document.documentElement.lang === 'zh-Hant');
}
async function enter(page: Page) {
  await page.mouse.click(590, 330); await page.mouse.click(590, 325);
}
async function assign(page: Page, x: number) { await page.mouse.click(x, 340); await page.mouse.click(x, 220); }
async function saved(page: Page) { return page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? 'null'), saveKey); }

test('Chinese room details and all four character cards preserve the puzzle', async ({ page }) => {
  await load(page); await enter(page);
  const rooms = ['月光套房', '細語客房', '壁爐客房', '乾爽客房'];
  const guests = ['月毛 · 狼人', '豆豆 · 殭屍', '燈燈 · 提燈妖', '卷卷 · 小木乃伊'];
  for (let i = 0; i < 4; i++) {
    await page.mouse.click(xs[i] + 60, 166);
    await expect(page.getByRole('dialog')).toContainText(rooms[i]);
    await expect(page.getByRole('dialog')).toContainText('每個房間只可住一位');
    await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.mouse.click(xs[i], 382);
    await expect(page.getByRole('heading', { name: guests[i] })).toBeVisible();
    await expect(page.getByRole('dialog')).toContainText('入住心願');
    await page.getByRole('button', { name: '返回關卡', exact: true }).click();
  }
  // Looking up a room after selecting a guest must not place that guest.
  await page.mouse.click(140, 340); await page.mouse.click(200, 166);
  await page.getByRole('button', { name: '返回關卡', exact: true }).click();
  await page.mouse.click(422, 442); expect(await saved(page)).toBeNull();
  for (const x of xs) await assign(page, x);
  await page.mouse.click(422, 442); expect((await saved(page))?.coins).toBe(50);
});

test('hints reveal strategy, a guest, then a room without placing anyone', async ({ page }) => {
  await load(page); await enter(page); await page.mouse.click(74, 26);
  await expect(page.getByRole('dialog')).toContainText('提示階段 1/3');
  await expect(page.getByRole('dialog')).not.toContainText('201');
  await page.getByRole('button', { name: '再給我一點提示' }).click();
  await expect(page.getByRole('dialog')).toContainText('月毛');
  await expect(page.getByRole('dialog')).not.toContainText('201');
  await page.getByRole('button', { name: '再給我一點提示' }).click();
  await expect(page.getByRole('dialog')).toContainText('201 · 月光套房');
  await page.getByRole('button', { name: '返回關卡', exact: true }).click();
  for (const x of xs.slice(1)) await assign(page, x);
  await page.mouse.click(422, 442); expect(await saved(page)).toBeNull();
  await page.mouse.click(74, 26); await expect(page.getByRole('dialog')).toContainText('月毛');
  await page.keyboard.press('Escape'); await assign(page, xs[0]);
  await page.mouse.click(74, 26); await expect(page.getByRole('dialog')).toContainText('每位住客都有合適房間了');
});

test('language switches in place, persists after reload, and preserves completion rewards', async ({ page }) => {
  await load(page); await enter(page); await assign(page, xs[0]);
  await page.mouse.click(765, 26); await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.mouse.click(764, 166); await expect(page.getByRole('dialog')).toContainText('204 · Linen room');
  await page.getByRole('button', { name: 'Back to puzzle', exact: true }).click();
  await page.mouse.click(704, 382); await expect(page.getByRole('dialog')).toContainText('Rollo · Mummy');
  await page.keyboard.press('Escape');
  for (const x of xs.slice(1)) await assign(page, x);
  await page.mouse.click(422, 442); expect((await saved(page))?.coins).toBe(50);
  await page.reload(); await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.waitForTimeout(200); await enter(page);
  for (const x of xs) await assign(page, x);
  await page.mouse.click(422, 442); expect((await saved(page))?.coins).toBe(50);
});

test('offline drag completion, modal keyboard focus, and small screens', async ({ page, context }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await load(page); await enter(page); await context.setOffline(true);
  await page.mouse.click(140, 382);
  await expect(page.getByRole('button', { name: '返回關卡', exact: true })).toBeFocused();
  await page.keyboard.press('Tab'); await expect(page.getByRole('button', { name: '返回關卡', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  for (const x of xs) { await page.mouse.move(x, 340); await page.mouse.down(); await page.mouse.move(x, 220, { steps: 10 }); await page.mouse.up(); }
  await page.mouse.click(422, 442); expect((await saved(page))?.coins).toBe(50);
  await page.mouse.click(422, 422); await page.mouse.click(590, 325);
  for (const viewport of [{ width: 740, height: 360 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    const canvas = page.locator('canvas'); await expect(canvas).toBeVisible();
    const box = (await canvas.boundingBox())!;
    expect(box.width).toBeLessThanOrEqual(viewport.width); expect(box.height).toBeLessThanOrEqual(viewport.height);
    await page.mouse.click(box.x + 140 * box.width / 844, box.y + 382 * box.height / 480);
    await expect(page.getByRole('dialog')).toBeVisible();
    const card = (await page.getByRole('dialog').boundingBox())!;
    expect(card.x).toBeGreaterThanOrEqual(0); expect(card.x + card.width).toBeLessThanOrEqual(viewport.width);
    await page.getByRole('button', { name: '返回關卡', exact: true }).click();
  }
  expect(errors).toEqual([]);
});
