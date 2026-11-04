import { test, expect, type Page } from '@playwright/test';
import { load, ready, saved } from './helpers';
async function enterStory(page: Page) { await page.mouse.click(590, 330); await page.getByRole('button', { name: '故事夜：月光與繃帶', exact: true }).click(); await ready(page); }
async function assignStory(page: Page, guest: string, room: string) { await page.locator(`[data-guest="${guest}"]`).click(); await page.locator(`[data-room="${room}"]`).click(); await ready(page); }
async function natural(page: Page) { for (const [guest, room] of Object.entries({ luno: '101', dou: '102', ember: 'B02', rollo: 'B01' })) await assignStory(page, guest, room); }

test('curtain drag fixes noise, play ending persists reward, toy basket and friendship', async ({ page }) => {
  await load(page); await enterStory(page); await natural(page);
  await page.getByRole('button', { name: '安頓好喇' }).click(); await expect(page.getByRole('status')).toContainText('嚎叫');
  const from = (await page.locator('[data-tool="curtain"]').boundingBox())!; const to = (await page.locator('[data-room="102"]').boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2); await page.mouse.down(); await page.mouse.move(to.x + to.width / 2, to.y + to.height + 25, { steps: 15 }); await page.mouse.up();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('midnight-check-in.story-night.v1')!).equipment.curtain)).toBe('102');
  await page.getByRole('button', { name: '安頓好喇' }).click(); await ready(page);
  await expect(page.locator('.story-speaker')).toHaveText('月毛 & 卷卷');
  await expect(page.locator('.story-dialogue-portrait')).toBeVisible();
  expect(await page.evaluate(() => document.fonts.check('16px GameRounded', '月毛卷卷'))).toBe(true);
  await page.getByRole('button', { name: '用玩具陪月毛玩' }).click(); await ready(page);
  await expect(page.locator('.story-hud')).toHaveAttribute('data-phase', 'settled'); expect((await saved(page)).coins).toBe(50); expect((await saved(page)).storyNight.outcome).toBe('play');
  await expect(page.locator('[data-bond="luno"]')).toContainText('♥♥');
  await page.getByRole('button', { name: '重看小事件' }).click(); await ready(page); await page.getByRole('button', { name: '邀請卷卷一齊玩' }).click(); await ready(page);
  expect((await saved(page)).coins).toBe(50); expect((await saved(page)).storyNight.outcome).toBe('play');
  await page.getByRole('button', { name: '返回大廳', exact: true }).first().click(); await expect(page.locator('canvas')).toHaveAttribute('aria-label', '店長，歡迎回來');
  await page.reload(); await ready(page); await enterStory(page); await expect(page.locator('.story-hud')).toHaveAttribute('data-phase', 'settled');
});

test('moon lamp supports the alternative solution and the shared-play ending', async ({ page, context }) => {
  await load(page); await enterStory(page); await context.setOffline(true);
  for (const [guest, room] of Object.entries({ luno: 'B01', dou: '102', ember: 'B02', rollo: '101' })) await assignStory(page, guest, room);
  await page.locator('[data-tool="moonLamp"]').click(); await page.locator('[data-room="B01"]').click();
  await page.getByRole('button', { name: '安頓好喇' }).click(); await ready(page); await page.getByRole('button', { name: '邀請卷卷一齊玩' }).click(); await ready(page);
  expect((await saved(page)).storyNight.outcome).toBe('together'); await expect(page.locator('[data-bond="rollo"]')).toContainText('♥♥');
});

test('draft resumes after reload, language and room close-up retain arrangements', async ({ page }) => {
  await load(page); await enterStory(page); await assignStory(page, 'luno', '101');
  await page.locator('[data-tool="curtain"]').click(); await page.locator('[data-room="102"]').click();
  await page.reload(); await ready(page); await enterStory(page);
  await page.locator('[data-focus="101"]').click(); await expect(page.getByRole('button', { name: '全間酒店' })).toBeVisible();
  await page.getByRole('button', { name: '全間酒店' }).click();
  await page.getByRole('button', { name: '切換語言' }).click(); await page.getByRole('button', { name: 'English', exact: true }).click(); await expect(page.getByRole('button', { name: 'Settle in' })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('midnight-check-in.story-night.v1')!).assignment.luno)).toBe('101');
  await page.getByRole('button', { name: 'Arrange again' }).click(); expect(await page.evaluate(() => JSON.parse(localStorage.getItem('midnight-check-in.story-night.v1')!).assignment)).toEqual({});
});

test('cinematic is skippable and cannot issue duplicate rewards', async ({ page }) => {
  await load(page); await enterStory(page); await natural(page); await page.locator('[data-tool="curtain"]').click(); await page.locator('[data-room="102"]').click();
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await page.getByRole('button', { name: '安頓好喇' }).click();
  await page.getByRole('button', { name: '跳過演出' }).click(); await ready(page); await page.getByRole('button', { name: '用玩具陪月毛玩' }).click();
  await page.locator('.story-hud[data-phase="settled"]').waitFor(); await ready(page); expect((await saved(page)).coins).toBe(50);
  await page.getByRole('button', { name: '重看小事件' }).click(); await page.getByRole('button', { name: '跳過演出' }).click(); await ready(page);
  await page.getByRole('button', { name: '邀請卷卷一齊玩' }).click(); await page.getByRole('button', { name: '跳過演出' }).click(); await ready(page); expect((await saved(page)).coins).toBe(50);
  await expect(page.locator('.story-hud')).toHaveAttribute('data-phase', 'settled');
});

test('retina canvas renders two device pixels per CSS pixel and keeps input accurate after resizing', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, reducedMotion: 'reduce' }); const page = await context.newPage();
  try {
    await page.goto('http://127.0.0.1:5175'); await page.waitForFunction(() => document.documentElement.lang === 'zh-Hant'); await ready(page);
    await expect.poll(() => page.locator('canvas').evaluate(c => [c.width, c.height])).toEqual([1830, 824]);
    const b = (await page.locator('canvas').boundingBox())!; expect([Math.round(b.width), Math.round(b.height)]).toEqual([915, 412]);
    await page.mouse.click(590 * 915 / 844, 330 * 412 / 480); await page.getByRole('button', { name: '故事夜：月光與繃帶' }).click(); await ready(page);
    await assignStory(page, 'luno', '101'); await page.setViewportSize({ width: 844, height: 480 });
    await expect.poll(() => page.locator('canvas').evaluate(c => [c.width, c.height])).toEqual([1688, 960]);
    await assignStory(page, 'dou', '102');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('midnight-check-in.story-night.v1')!).assignment)).toEqual({ luno: '101', dou: '102' });
    await page.mouse.move(332, 378); await page.mouse.down(); await page.mouse.move(641, 264, { steps: 15 }); await page.mouse.up(); await ready(page);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('midnight-check-in.story-night.v1')!).assignment.ember)).toBe('B02');
  } finally { await context.close(); }
});

 test('blocked storage reports session-only rewards and keeps them while returning to the lobby', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw Error('blocked'); }; });
  await load(page); await enterStory(page); await natural(page); await page.locator('[data-tool="curtain"]').click(); await page.locator('[data-room="102"]').click();
  await page.getByRole('button', { name: '安頓好喇' }).click(); await ready(page); await page.getByRole('button', { name: '用玩具陪月毛玩' }).click(); await ready(page);
  await expect(page.getByRole('status')).toContainText('未能儲存'); expect(await saved(page)).toBeNull();
  await page.getByRole('button', { name: '返回大廳', exact: true }).first().click(); await page.getByRole('button', { name: '故事夜：月光與繃帶' }).click(); await ready(page);
  await expect(page.locator('.story-hud')).toHaveAttribute('data-phase', 'settled');
 });
