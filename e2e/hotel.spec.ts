import { test, expect } from '@playwright/test';
const saveKey = 'midnight-check-in.save.v1';
async function lobby(page: import('@playwright/test').Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/'); await page.waitForFunction(() => document.documentElement.lang === 'zh-Hant'); await page.mouse.click(590, 330);
}

test('buy, display and put away decorations without duplicate charges; retain after reload', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('midnight-check-in.save.v1')) localStorage.setItem('midnight-check-in.save.v1', JSON.stringify({ version: 1, completed: Array.from({ length: 12 }, (_, i) => i + 1), coins: 600 }));
  });
  await lobby(page); await page.mouse.click(590, 390);
  await expect(page.getByRole('dialog')).toContainText('600 金幣');
  await page.locator('[data-decoration="moon-lamps"] [data-action="buy"]').click();
  await expect(page.getByRole('dialog')).toContainText('500 金幣');
  await page.locator('[data-decoration="velvet-rug"] [data-action="buy"]').click();
  await page.locator('[data-decoration="star-sign"] [data-action="buy"]').click();
  await page.getByRole('button', { name: '關閉', exact: true }).click();
  const displayed = await page.locator('canvas').screenshot();
  await page.mouse.click(590, 390); await page.locator('[data-decoration="moon-lamps"] [data-action="buy"]').click();
  await page.getByRole('button', { name: '關閉', exact: true }).click();
  const hidden = await page.locator('canvas').screenshot(); expect(displayed.equals(hidden)).toBe(false);
  let save = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), saveKey);
  expect(save.coins).toBe(0); expect(save.decorations).toEqual(['moon-lamps', 'velvet-rug', 'star-sign']); expect(save.equipped).toEqual(['velvet-rug', 'star-sign']);
  await page.mouse.click(590, 390); await page.locator('[data-decoration="moon-lamps"] [data-action="buy"]').click();
  await page.getByRole('button', { name: '關閉', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => document.documentElement.lang === 'zh-Hant'); await page.mouse.click(590, 330); await page.mouse.click(590, 390);
  await expect(page.locator('[data-decoration="moon-lamps"]')).toContainText('展示中');
  await expect(page.locator('[data-decoration="velvet-rug"]')).toContainText('展示中');
  await expect(page.locator('[data-decoration="star-sign"]')).toContainText('展示中');
  save = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), saveKey); expect(save.coins).toBe(0); expect(save.completed).toHaveLength(12);
});

test('new wallets cannot buy upgrades and shop remains usable in English and portrait', async ({ page }) => {
  await lobby(page); await page.mouse.click(590, 390);
  await expect(page.locator('.shop-items button:disabled')).toHaveCount(3);
  await page.getByRole('button', { name: '關閉', exact: true }).click(); await page.getByRole('button', { name: '語言', exact: true }).click(); await page.getByRole('button', { name: 'English', exact: true }).click(); await page.mouse.click(590, 390);
  await expect(page.getByRole('heading', { name: 'Lobby decorations' })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('[data-decoration="star-sign"]')).toContainText('Starlight crest');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
});

test('audio and haptic settings affect feedback independently and persist', async ({ page }) => {
  await page.addInitScript(() => {
    const metrics = { tones: 0, vibrations: 0 };
    (window as unknown as { feedbackMetrics: typeof metrics }).feedbackMetrics = metrics;
    const create = AudioContext.prototype.createOscillator;
    AudioContext.prototype.createOscillator = function () { metrics.tones++; return create.call(this); };
    Object.defineProperty(navigator, 'vibrate', { configurable: true, writable: true, value: () => { metrics.vibrations++; return true; } });
  });
  const tones = () => page.evaluate(() => (window as unknown as { feedbackMetrics: { tones: number } }).feedbackMetrics.tones);
  await lobby(page); await page.getByRole('button', { name: /^(設定|Settings)$/ }).click();
  await page.getByRole('checkbox', { name: '背景音樂' }).uncheck(); await page.getByRole('checkbox', { name: '音效' }).uncheck();
  const muted = await tones(); await page.getByRole('button', { name: '測試音效與觸覺回饋' }).click(); expect(await tones()).toBe(muted);
  await page.getByRole('checkbox', { name: '音效' }).check(); await page.getByRole('button', { name: '測試音效與觸覺回饋' }).click(); expect(await tones()).toBeGreaterThan(muted);
  await page.getByRole('checkbox', { name: '音效' }).uncheck(); await page.getByRole('checkbox', { name: '觸覺回饋' }).check();
  await page.getByRole('button', { name: '測試音效與觸覺回饋' }).click();
  expect(await page.evaluate(() => (window as unknown as { feedbackMetrics: { vibrations: number } }).feedbackMetrics.vibrations)).toBe(1);
  await page.reload(); await page.waitForFunction(() => document.documentElement.lang === 'zh-Hant'); await page.getByRole('button', { name: /^(設定|Settings)$/ }).click();
  await expect(page.getByRole('checkbox', { name: '背景音樂' })).not.toBeChecked(); await expect(page.getByRole('checkbox', { name: '音效' })).not.toBeChecked(); await expect(page.getByRole('checkbox', { name: '觸覺回饋' })).toBeChecked();
  await page.getByRole('button', { name: '關閉', exact: true }).focus(); await page.keyboard.press('Tab'); await expect(page.getByRole('checkbox', { name: '背景音樂' })).toBeFocused();
});

test('blocked storage reports session-only settings and puzzle remains playable', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('storage blocked'); }; });
  await lobby(page); await page.getByRole('button', { name: /^(設定|Settings)$/ }).click(); await page.getByRole('checkbox', { name: '觸覺回饋' }).check();
  await expect(page.getByRole('status')).toContainText('只會在本次遊玩期間保留');
  await page.keyboard.press('Escape'); await page.mouse.click(590, 325); await page.locator('[data-night="1"]').click();
  await page.getByRole('button', { name: /^(設定|Settings)$/ }).click(); await expect(page.getByRole('checkbox', { name: '觸覺回饋' })).toBeChecked();
});
