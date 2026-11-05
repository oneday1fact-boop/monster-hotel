import { test, expect, type Page } from '@playwright/test';
import { ready, saved, saveKey, assign } from './helpers';
const episodes = ['cake-case', 'luggage-run', 'dream-door'];
async function boot(p: Page, seed?: object) { if (seed)
    await p.addInitScript(({ key, seed }) => { if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(seed)); }, { key: saveKey, seed }); await p.emulateMedia({ reducedMotion: 'reduce' }); await p.goto('/'); await ready(p); }
async function lobby(p: Page) { const s = p.viewportSize()!; await p.mouse.click(590 * s.width / 844, 330 * s.height / 480); await expect(p.locator('.lobby-menu')).toBeVisible(); }
async function open(p: Page, id: string) { await lobby(p); await p.locator('[data-action=challenges]').click(); await p.locator(`[data-challenge="${id}"]`).click(); await ready(p); }
async function solve(p: Page, id: string) { if (id === 'cake-case') {
    for (const clue of ['footprints', 'icing', 'ribbon'])
        await p.locator(`[data-evidence=${clue}]`).click();
    await p.locator('[data-suspect=rollo]').click();
}
else if (id === 'luggage-run') {
    for (const [a, b] of [[2, 3], [1, 2], [2, 6], [6, 7]]) {
        await p.locator(`[data-tile="${a}"]`).click();
        await p.locator(`[data-tile="${b}"]`).click();
    }
    await p.locator('[data-action=send-luggage]').click();
    await ready(p);
}
else {
    for (const a of ['seed', 'switch-world', 'water', 'switch-world', 'key', 'switch-world', 'door'])
        await p.locator(a === 'switch-world' ? '[data-action=switch-world]' : `[data-dream-action=${a}]`).click();
} await expect(p.locator('.episode-finish')).toBeVisible(); }
async function fits(p: Page) { expect(await p.evaluate(() => { const errors: string[] = []; for (const el of document.querySelectorAll<HTMLElement>('.classic-wishes,.classic-wishes span,.episode-screen,.episode-panel,.episode-finish,.episode-footer,.sheet-body,.boutique,.boutique-cards,.challenge-map,.settings-controls,.language-tiles')) {
    if (!el.getClientRects().length)
        continue;
    if (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2)
        errors.push(`${el.className}: ${el.scrollWidth}x${el.scrollHeight}/${el.clientWidth}x${el.clientHeight}`);
} for (const b of document.querySelectorAll<HTMLElement>('.episode-screen button,.details-overlay button')) {
    const r = b.getBoundingClientRect();
    if (b.getClientRects().length && (r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1))
        errors.push(b.textContent || 'button');
} return errors; })).toEqual([]); }
test('four-stage route plays three distinct mechanics and exactly one room puzzle, with first rewards only', async ({ page }) => { test.setTimeout(150000); const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); await boot(page); await open(page, episodes[0]); for (let i = 0; i < episodes.length; i++) {
    await expect(page.locator('.episode-screen')).toHaveAttribute('data-episode', episodes[i]);
    await expect(page.locator('.episode-how')).toBeVisible();
    await solve(page, episodes[i]);
    expect((await saved(page)).coins).toBe((i + 1) * 500);
    await page.getByRole('button', { name: '下一關', exact: true }).click();
    await ready(page);
} await expect(page.locator('.classic-wishes')).toContainText('月毛要月光'); await expect(page.locator('.classic-wishes')).toContainText('卷卷要乾爽'); for (let i = 0; i < 4; i++)
    await assign(page, i); await page.locator('[data-action=check-in]').click(); expect((await saved(page)).coins).toBe(1550); await page.mouse.click(422, 450); await expect(page.locator('.challenge-node')).toHaveCount(4); await expect(page.locator('[data-kind=puzzle]')).toHaveCount(1); await page.locator('[data-challenge=cake-case]').click(); await ready(page); await solve(page, 'cake-case'); expect((await saved(page)).coins).toBe(1550); expect(errors).toEqual([]); });
test('detective requires evidence, rejects unsupported accusation, and resumes clues after reload', async ({ page }) => { await boot(page); await open(page, 'cake-case'); await expect(page.locator('[data-suspect=rollo]')).toBeDisabled(); await page.locator('[data-evidence=icing]').click(); await page.reload(); await ready(page); await open(page, 'cake-case'); await expect(page.locator('[data-evidence=icing]')).toContainText('✓'); await page.locator('[data-evidence=footprints]').click(); await page.locator('[data-evidence=ribbon]').click(); await page.locator('[data-suspect=yuzu]').click(); await expect(page.getByRole('status')).toContainText('再比較證據'); expect((await saved(page))?.coins ?? 0).toBe(0); await page.locator('[data-suspect=rollo]').click(); expect((await saved(page)).coins).toBe(500); });
test('luggage rejects a blocked path and illegal move; valid route actually animates to the guest', async ({ page }) => { await boot(page, { version: 1, coins: 500, completed: [], episodes: ['cake-case'] }); await open(page, 'luggage-run'); await page.locator('[data-action=send-luggage]').click(); await expect(page.getByRole('status')).toContainText('先幫旅行箱開路'); await page.locator('[data-tile="1"]').click(); await page.locator('[data-tile="11"]').click(); await expect(page.getByRole('status')).toContainText('相鄰'); await solve(page, 'luggage-run'); expect((await saved(page)).coins).toBe(1000); });
test('dream worlds preserve causality and partial state across language change and reload', async ({ page }) => { await boot(page, { version: 1, coins: 1000, completed: [], episodes: ['cake-case', 'luggage-run'] }); await open(page, 'dream-door'); await page.locator('[data-dream-action=key]').click(); await expect(page.getByRole('status')).toContainText('未夠高'); await page.locator('[data-dream-action=seed]').click(); await page.getByRole('button', { name: '語言', exact: true }).click(); await page.getByRole('button', { name: 'English', exact: true }).click(); await expect(page.locator('.dream-progress')).toContainText('✓ Seed'); await page.reload(); await ready(page); await page.mouse.click(590, 330); await page.locator('[data-action=challenges]').click(); await page.locator('[data-challenge=dream-door]').click(); await ready(page); await expect(page.locator('.dream-progress')).toContainText('✓ Seed'); await page.locator('[data-action=switch-world]').click(); await page.locator('[data-dream-action=door]').click(); await expect(page.getByRole('status')).toContainText('need the key'); });
for (const size of [{ width: 844, height: 480 }, { width: 915, height: 412 }, { width: 640, height: 320 }, { width: 390, height: 844 }])
    test(`visible goals, mechanics and endings fit without scrolling ${size.width}x${size.height}`, async ({ page }) => { test.setTimeout(150000); await page.setViewportSize(size); await boot(page); await open(page, 'cake-case'); for (const id of episodes) {
        await fits(page);
        await solve(page, id);
        await fits(page);
        await page.getByRole('button', { name: '下一關', exact: true }).click();
        await ready(page);
    } await fits(page); });
test('legacy coins, cosmetic ownership, selected weather and old completed IDs survive the new route', async ({ page }) => { await boot(page, { version: 1, coins: 123, completed: [1, 2, 20], storyNight: { outcome: 'together' }, stories: { 2: { outcome: 'play' } }, ambience: 'winter', decorations: ['moon-lamps'], equipped: ['moon-lamps'] }); await open(page, 'cake-case'); await solve(page, 'cake-case'); expect(await saved(page)).toMatchObject({ coins: 623, completed: [1, 2, 20], storyNight: { outcome: 'together' }, ambience: 'winter', decorations: ['moon-lamps'], episodes: ['cake-case'] }); });
test('settings, shop previews, paid scenery and fixed pages remain usable', async ({ page }) => { await boot(page, { version: 1, coins: 1000, completed: [] }); await lobby(page); await page.getByRole('button', { name: '設定', exact: true }).click(); await page.getByRole('checkbox', { name: '音效', exact: true }).uncheck(); await fits(page); await page.keyboard.press('Escape'); await page.locator('[data-action=shop]').click(); await fits(page); await page.locator('[data-decoration=moon-lamps] [data-action=preview]').click(); expect((await saved(page)).coins).toBe(1000); await page.getByRole('button', { name: '返回商店' }).click(); expect((await saved(page)).coins).toBe(1000); await page.locator('[data-decoration=moon-lamps] [data-action=buy]').click(); expect((await saved(page)).coins).toBe(900); await page.locator('[data-tab=scenes]').click(); await page.getByRole('button', { name: '下一頁', exact: true }).click(); await page.locator('[data-scene=winter] [data-action=scene]').click(); await page.locator('[data-action=confirm]').click(); expect((await saved(page)).coins).toBe(700); });
test('offline play and storage failure still allow progression during the current session', async ({ page, context }) => { await page.addInitScript(() => { Storage.prototype.setItem = () => { throw Error('blocked'); }; }); await boot(page); await context.setOffline(true); await open(page, 'cake-case'); await solve(page, 'cake-case'); await expect(page.getByRole('status')).toContainText('未能儲存'); await page.getByRole('button', { name: '下一關', exact: true }).click(); await expect(page.locator('.episode-screen')).toHaveAttribute('data-episode', 'luggage-run'); });
