import { test, expect, type Page } from '@playwright/test';
import { ready, saved, saveKey, assign } from './helpers';
const episodes = ['cake-case', 'luggage-run', 'dream-door'];
const caseSave = { version: 1, coins: 50, completed: [1] };
async function boot(p: Page, seed: object | null = caseSave) { if (seed)
    await p.addInitScript(({ key, seed }) => { if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(seed)); }, { key: saveKey, seed }); await p.emulateMedia({ reducedMotion: 'reduce' }); await p.goto('/'); await ready(p); }
async function lobby(p: Page) { const s = p.viewportSize()!; await p.mouse.click(590 * s.width / 844, 330 * s.height / 480); await expect(p.locator('.lobby-menu')).toBeVisible(); }
async function open(p: Page, id: string) { await lobby(p); await p.locator('[data-action=challenges]').click(); await p.locator(`[data-challenge="${id}"]`).click(); await ready(p); }
async function firstNight(p: Page) { await open(p, 'puzzle-1'); await expect(p.locator('.arrival-opening')).toContainText('四位新住客'); await expect(p.locator('.arrival-guest')).toHaveCount(4); await p.locator('[data-action=welcome-guests]').click(); await ready(p); for (let i = 0; i < 4; i++)
    await assign(p, i); await p.locator('[data-action=check-in]').click(); await p.mouse.click(422, 398); await ready(p); }
async function solve(p: Page, id: string) { if (id === 'cake-case') {
    for (const c of ['footprints', 'icing', 'ribbon'])
        await p.locator(`[data-evidence=${c}]`).click();
    await fits(p);
    await p.locator('[data-suspect=rollo]').click();
}
else if (id === 'luggage-run') {
    for (const i of [0, 3, 6, 7, 8, 5])
        await p.locator(`[data-tile="${i}"]`).click();
    await p.locator('[data-action=send-luggage]').click();
    await ready(p);
}
else {
    for (const d of ['lamp', 'crest', 'key', 'rug', 'parcel'])
        await p.locator(`[data-world=dream] [data-difference=${d}]`).click();
} await expect(p.locator('.episode-finish')).toBeVisible(); }
async function fits(p: Page) { expect(await p.evaluate(() => { const bad: string[] = []; for (const el of document.querySelectorAll<HTMLElement>('.arrival-introduction,.arrival-guests,.arrival-guest,.classic-wishes,.episode-screen,.episode-panel,.episode-finish,.episode-footer,.comparison-stage,.comparison-picture,.road-board,.sheet-body,.boutique,.challenge-map')) {
    if (!el.getClientRects().length)
        continue;
    if (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2)
        bad.push(`${el.className}: ${el.scrollWidth}x${el.scrollHeight}/${el.clientWidth}x${el.clientHeight}`);
} for (const b of document.querySelectorAll<HTMLElement>('.episode-screen button,.details-overlay button')) {
    const r = b.getBoundingClientRect();
    if (b.getClientRects().length && (r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1))
        bad.push(b.getAttribute('aria-label') || b.textContent || 'button');
} return bad; })).toEqual([]); }
test('opening-night room assignment introduces guests first, then all three events award once', async ({ page }) => { test.setTimeout(150000); const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); await boot(page, null); await firstNight(page); expect((await saved(page)).coins).toBe(50); for (let i = 0; i < episodes.length; i++) {
    await expect(page.locator('.episode-screen')).toHaveAttribute('data-episode', episodes[i]);
    await solve(page, episodes[i]);
    expect((await saved(page)).coins).toBe(50 + (i + 1) * 500);
    await page.getByRole('button', { name: episodes[i] === 'dream-door' ? '返回旅館' : '下一關', exact: true }).click();
    await ready(page);
} await page.locator('[data-action=challenges]').click(); await expect(page.locator('.challenge-node')).toHaveCount(4); await expect(page.locator('.challenge-node').first()).toHaveAttribute('data-challenge', 'puzzle-1'); await page.locator('[data-challenge=cake-case]').click(); await solve(page, 'cake-case'); expect((await saved(page)).coins).toBe(1550); expect(errors).toEqual([]); });
test('physical clues are illustrated room objects; collected art and partial investigation persist', async ({ page }) => { await boot(page); await open(page, 'cake-case'); await expect(page.locator('.evidence-object')).toHaveCount(3); await expect(page.locator('[data-suspect=rollo]')).toBeDisabled(); for (const id of ['footprints', 'icing', 'ribbon']) {
    const item = page.locator(`[data-evidence=${id}]`);
    await expect(item).toBeVisible();
    expect(await item.evaluate(e => getComputedStyle(e).backgroundImage)).toContain('evidence-props.png');
} await page.locator('[data-evidence=icing]').click(); await expect(page.locator('.evidence-thumb')).toHaveCount(1); await fits(page); await page.reload(); await ready(page); await open(page, 'cake-case'); await expect(page.locator('[data-evidence=icing]')).toHaveClass(/is-collected/); await page.locator('[data-evidence=footprints]').click(); await page.locator('[data-evidence=ribbon]').click(); await fits(page); await page.locator('[data-suspect=yuzu]').click(); await expect(page.getByRole('status')).toContainText('再比較證據'); await page.locator('[data-suspect=rollo]').click(); expect((await saved(page)).coins).toBe(550); });
test('sliding roads show road art, keep one blank, reject jumps and move the suitcase only on connected roads', async ({ page }) => { await boot(page, { ...caseSave, coins: 550, episodes: ['cake-case'] }); await open(page, 'luggage-run'); await expect(page.locator('.road-tile')).toHaveCount(9); await expect(page.locator('.road-blank')).toHaveCount(1); await expect(page.locator('.road-art')).toHaveCount(8); await page.locator('[data-action=send-luggage]').click(); await expect(page.getByRole('status')).toContainText('未接通'); await page.locator('[data-tile="8"]').click(); await expect(page.getByRole('status')).toContainText('空位上下左右'); await page.locator('[data-tile="0"]').click(); await expect(page.locator('[data-tile="0"]')).toHaveClass(/road-blank/); await page.reload(); await ready(page); await open(page, 'luggage-run'); await expect(page.locator('[data-tile="0"]')).toHaveClass(/road-blank/); for (const i of [3, 6, 7, 8, 5])
    await page.locator(`[data-tile="${i}"]`).click(); await page.locator('[data-action=send-luggage]').click(); await ready(page); await expect(page.locator('.episode-finish')).toBeVisible(); expect((await saved(page)).coins).toBe(1050); });
test('paired pictures mark the matching region on both sides, ignore repeat and background taps, resume in English', async ({ page }) => { await boot(page, { ...caseSave, coins: 1050, episodes: ['cake-case', 'luggage-run'] }); await open(page, 'dream-door'); await expect(page.locator('.comparison-picture')).toHaveCount(2); const real = page.locator('[data-world=real]'); await real.click({ position: { x: 10, y: 10 } }); await expect(page.locator('.difference-count')).toHaveText('已找到 0 / 5'); await page.locator('[data-world=dream] [data-difference=key]').click(); await expect(page.locator('.difference-target.is-found')).toHaveCount(2); await page.locator('[data-world=real] [data-difference=key]').click(); await expect(page.locator('.difference-count')).toHaveText('已找到 1 / 5'); await page.getByRole('button', { name: '語言', exact: true }).click(); await page.getByRole('button', { name: 'English', exact: true }).click(); await page.reload(); await ready(page); await page.mouse.click(590, 330); await page.locator('[data-action=challenges]').click(); await page.locator('[data-challenge=dream-door]').click(); await expect(page.locator('.difference-count')).toHaveText('Found 1 / 5'); for (const id of ['lamp', 'crest', 'rug', 'parcel'])
    await page.locator(`[data-world=real] [data-difference=${id}]`).click(); await expect(page.locator('.episode-finish')).toBeVisible(); expect((await saved(page)).coins).toBe(1550); });
for (const size of [{ width: 844, height: 480 }, { width: 915, height: 412 }, { width: 640, height: 320 }, { width: 390, height: 844 }])
    test(`visible clues, road tiles, paired pictures and endings fit without scroll ${size.width}x${size.height}`, async ({ page }) => { test.setTimeout(150000); await page.setViewportSize(size); await boot(page); await open(page, 'cake-case'); for (const id of episodes) {
        await fits(page);
        await solve(page, id);
        await fits(page);
        await page.getByRole('button', { name: id === 'dream-door' ? '返回旅館' : '下一關', exact: true }).click();
        await ready(page);
    } });
for (const size of [{ width: 844, height: 480 }, { width: 915, height: 412 }, { width: 640, height: 320 }, { width: 390, height: 844 }])
    test(`first guest introduction fits ${size.width}x${size.height}`, async ({ page }) => { await page.setViewportSize(size); await boot(page, null); await open(page, 'puzzle-1'); await expect(page.locator('.arrival-guest')).toHaveCount(4); await fits(page); await page.locator('[data-action=welcome-guests]').click(); await ready(page); await expect(page.locator('.classic-wishes')).toContainText('月毛要月光'); await fits(page); });
test('legacy coins and achievements survive changed puzzle drafts and new stage order', async ({ page }) => { await page.addInitScript(() => localStorage.setItem('midnight-check-in.episode.dream-door.v1', JSON.stringify({ dream: { world: 'dream', seed: true, grown: true, key: true, open: false } }))); await boot(page, { version: 1, coins: 123, completed: [1, 2, 20], storyNight: { outcome: 'together' }, ambience: 'winter', decorations: ['moon-lamps'], episodes: ['cake-case', 'luggage-run'] }); await open(page, 'dream-door'); await expect(page.locator('.difference-count')).toHaveText('已找到 0 / 5'); await solve(page, 'dream-door'); expect(await saved(page)).toMatchObject({ coins: 623, completed: [1, 2, 20], storyNight: { outcome: 'together' }, ambience: 'winter', decorations: ['moon-lamps'] }); });
test('settings, shop previews and purchased weather remain usable', async ({ page }) => { await boot(page, { ...caseSave, coins: 1000 }); await lobby(page); await page.getByRole('button', { name: '設定', exact: true }).click(); await page.getByRole('checkbox', { name: '音效', exact: true }).uncheck(); await fits(page); await page.keyboard.press('Escape'); await page.locator('[data-action=shop]').click(); await page.locator('[data-decoration=moon-lamps] [data-action=preview]').click(); expect((await saved(page)).coins).toBe(1000); await page.getByRole('button', { name: '返回商店' }).click(); await page.locator('[data-decoration=moon-lamps] [data-action=buy]').click(); expect((await saved(page)).coins).toBe(900); await page.locator('[data-tab=scenes]').click(); await page.getByRole('button', { name: '下一頁', exact: true }).click(); await page.locator('[data-scene=winter] [data-action=scene]').click(); await page.locator('[data-action=confirm]').click(); expect((await saved(page)).coins).toBe(700); });
test('offline play with blocked storage still carries opening-night progress into the case', async ({ page, context }) => { test.setTimeout(90000); await page.addInitScript(() => { Storage.prototype.setItem = () => { throw Error('blocked'); }; }); await boot(page, null); await context.setOffline(true); await firstNight(page); await solve(page, 'cake-case'); await expect(page.getByRole('status')).toContainText('未能儲存'); await page.getByRole('button', { name: '下一關', exact: true }).click(); await expect(page.locator('.episode-screen')).toHaveAttribute('data-episode', 'luggage-run'); });
