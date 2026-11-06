import { expect, type Page } from '@playwright/test';
import { firstLevel, solve, type Level } from '../src/domain/puzzle';
import { queueX, queueY, roomPoint } from '../src/game/layout';
export const saveKey = 'midnight-check-in.save.v1';
export async function ready(page: Page) { await page.waitForFunction(()=>!document.documentElement.dataset.navigationPhase);await expect(page.locator('canvas')).toHaveAttribute('aria-busy', 'false',{timeout:20000}); }
export async function load(page: Page) {
  // Legacy encounter completion isolates classic-room regression tests without awarding fixture coins.
  await page.addInitScript(key => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({version:1,coins:0,completed:[],storyNight:{outcome:'play'},episodes:['cake-case','luggage-run','dream-door']})); }, saveKey);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/'); await page.waitForFunction(() => document.documentElement.lang === 'zh-Hant'); await ready(page);
}
export async function enter(page: Page, id = 1) {
  await page.mouse.click(650, 365); await page.locator('[data-action=challenges]').click(); await page.locator(`[data-puzzle="${id}"]`).click();await page.waitForFunction(()=>!document.documentElement.dataset.navigationPhase); if(await page.locator('[data-action=welcome-guests]').isVisible())await page.locator('[data-action=welcome-guests]').click(); await ready(page);
}
export async function assign(page: Page, index: number, level: Level = firstLevel, roomId?: string) {
  const target = roomId ?? solve(level)[0][level.guests[index].id];
  const room = level.rooms.find(r => r.id === target)!; const p = roomPoint(room);
  await page.mouse.click(queueX[index], queueY); await page.mouse.click(p.x, p.y); await ready(page);
}
export async function saved(page: Page) { return page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? 'null'), saveKey); }
