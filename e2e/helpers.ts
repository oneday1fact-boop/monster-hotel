import { expect, type Page } from '@playwright/test';
import { firstLevel, solve, type Level } from '../src/domain/puzzle';
import { queueX, queueY, roomPoint } from '../src/game/layout';
export const saveKey = 'midnight-check-in.save.v1';
export async function ready(page: Page) { await expect(page.locator('canvas')).toHaveAttribute('aria-busy', 'false'); }
export async function load(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/'); await page.waitForFunction(() => document.documentElement.lang === 'zh-Hant'); await ready(page);
}
export async function enter(page: Page, id = 1) {
  await page.mouse.click(590, 330); await page.mouse.click(590, 325); await page.locator(`[data-night="${id}"]`).click(); await ready(page);
}
export async function assign(page: Page, index: number, level: Level = firstLevel, roomId?: string) {
  const target = roomId ?? solve(level)[0][level.guests[index].id];
  const room = level.rooms.find(r => r.id === target)!; const p = roomPoint(room);
  await page.mouse.click(queueX[index], queueY); await page.mouse.click(p.x, p.y); await ready(page);
}
export async function saved(page: Page) { return page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? 'null'), saveKey); }
