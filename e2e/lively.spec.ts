import { test, expect, type Page } from './browser';
import { ready, saveKey, assign, saved } from './helpers';
import { episodeIds, initialRoad, roadReviewSolution } from '../src/domain/episodes';
import { firstLevel, solve } from '../src/domain/puzzle';
import { echoRounds } from '../src/domain/liveGames';
const route = ['puzzle-1', ...episodeIds];
async function boot(p: Page, omit: string[] = []) { await p.addInitScript(({ key, ids }) => { const get = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t: string, ...args: any[]) { return t.includes('webgl') ? null : (get as any).call(this, t, ...args); }; if (!localStorage.getItem(key))
    localStorage.setItem(key, JSON.stringify({ version: 1, completed: [1], coins: 5550, episodes: ids })); }, { key: saveKey, ids: episodeIds.filter(id => id !== 'group-photo' && !omit.includes(id)) }); await p.emulateMedia({ reducedMotion: 'reduce' }); await p.goto('/'); await ready(p); await p.mouse.click(650, 365); await expect(p.locator('[data-action=challenges]')).toBeVisible(); }
async function choose(p: Page, id: string) { const map = p.locator('[data-action=challenges]'); if (await map.isVisible())
    await map.click();
else
    await p.getByRole('button', { name: '關卡地圖', exact: true }).click(); const want = Math.floor(route.indexOf(id) / 4), now = Number((await p.locator('.fixed-page-nav span').innerText()).split('/')[0]) - 1; for (let i = 0; i < Math.abs(want - now); i++)
    await p.getByRole('button', { name: want > now ? '下一頁' : '上一頁', exact: true }).click(); await p.locator(`[data-challenge="${id}"]`).click(); await ready(p); }
async function drag(p: Page, from: string, to: string) { const a = (await p.locator(from).boundingBox())!, b = (await p.locator(to).boundingBox())!; await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down(); await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 }); }
async function draft(p: Page, id: string, version = 1) { return p.evaluate(({ id, version }) => JSON.parse(localStorage.getItem(`midnight-check-in.episode.${id}.v${version}`) ?? '{}'), { id, version }); }
async function fits(p: Page) { expect(await p.evaluate(() => Array.from(document.querySelectorAll<HTMLElement>('.episode-panel,.episode-stage,.live-photo-board,.echo-board,.lobby-menu,.lift-machine,.lift-pan')).filter(e => e.scrollHeight > e.clientHeight + 2 || e.scrollWidth > e.clientWidth + 2).map(e => e.className))).toEqual([]); expect(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight)).toBe(true); }
test('first night requires relational deductions visible on the hotel screen', async ({ page }) => { await boot(page); await choose(page, 'puzzle-1'); await expect(page.locator('.classic-rules')).toContainText('卷卷避暖氣'); const alternative = solve({ ...firstLevel, rules: [] }).find(a => a.rollo !== '102')!; for (let i = 0; i < 4; i++)
    await assign(page, i, firstLevel, alternative[firstLevel.guests[i].id]); await page.locator('[data-action=check-in]').click(); await expect(page.locator('[data-action=check-in]')).toBeVisible(); await expect(page.locator('.hud-toast')).toBeVisible(); expect((await saved(page)).coins).toBe(5550); });
test('roads have eight authored moves and undo/redo survives reload and wrong turns', async ({ page }) => { await boot(page); await choose(page, 'luggage-run'); expect(roadReviewSolution).toHaveLength(8); await page.locator(`[data-tile="${roadReviewSolution[0]}"]`).click(); await ready(page); const changed = (await draft(page, 'luggage-run', 3)).road; expect(changed).not.toEqual(initialRoad); await page.locator('[data-action=undo-road]').click(); expect((await draft(page, 'luggage-run', 3)).road).toEqual(initialRoad); await page.locator('[data-action=redo-road]').click(); expect((await draft(page, 'luggage-run', 3)).road).toEqual(changed); await page.reload(); await ready(page); await page.mouse.click(650, 365); await choose(page, 'luggage-run'); await page.locator('[data-action=undo-road]').click(); expect((await draft(page, 'luggage-run', 3)).road).toEqual(initialRoad); await expect(page.locator('[data-action=undo-road]')).toBeDisabled(); });
test('gift drag previews without committing and rejects occupied or outside drops', async ({ page }) => { await boot(page); await choose(page, 'gift-box'); await drag(page, '[data-gift=a]', '[data-gift-cell="0"]'); await expect(page.locator('.is-drop-valid')).toHaveCount(4); expect((await draft(page, 'gift-box')).parcels ?? []).toEqual([]); await page.mouse.up(); await expect(page.locator('[data-owner=a]')).toHaveCount(4); expect((await draft(page, 'gift-box')).parcels).toEqual([{ id: 'a', rotation: 0, x: 0, y: 0 }]); await drag(page, '[data-gift=b]', '[data-gift-cell="0"]'); await expect(page.locator('.is-drop-invalid')).not.toHaveCount(0); await page.mouse.up(); expect((await draft(page, 'gift-box')).parcels).toHaveLength(1); await drag(page, '[data-gift=c]', '[data-gift-cell="15"]'); await expect(page.locator('.gift-drag-ghost')).toHaveAttribute('data-valid', 'false'); await page.mouse.move(3, 3); await page.mouse.up(); await expect(page.locator('.gift-drag-ghost')).toHaveCount(0); expect((await draft(page, 'gift-box')).parcels).toHaveLength(1); });
test('touch cancellation clears the gift preview without placing a piece', async ({ page }) => { await boot(page); await choose(page, 'gift-box'); const cdp = await page.context().newCDPSession(page); await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true }); const a = (await page.locator('[data-gift=a]').boundingBox())!, b = (await page.locator('[data-gift-cell="0"]').boundingBox())!; await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: a.x + a.width / 2, y: a.y + a.height / 2 }] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: b.x + b.width / 2, y: b.y + b.height / 2 }] }); await expect(page.locator('.gift-drag-ghost')).toHaveCount(1); await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] }); await expect(page.locator('.gift-drag-ghost')).toHaveCount(0); expect((await draft(page, 'gift-box')).parcels ?? []).toEqual([]); });
test('monster relay demonstrates three rounds; mistakes keep earlier progress and completion is saved', async ({ page }) => { await boot(page, ['lost-letters']); await choose(page, 'lost-letters'); await expect(page.locator('[data-mail]')).toHaveCount(0); for (let round = 0; round < 3; round++) {
    await page.locator('[data-action=play-echo]').click();
    await expect(page.locator('.echo-board')).toHaveAttribute('data-echo-phase', 'watching');
    await expect(page.locator('.echo-board')).toHaveAttribute('data-echo-phase', 'answer', { timeout: 8000 });
    if (round === 1) {
        await page.locator('[data-echo-note="3"]').click();
        expect((await draft(page, 'lost-letters', 2)).echo).toEqual({ round: 1, input: [] });
    }
    for (const n of echoRounds[round])
        await page.locator(`[data-echo-note="${n}"]`).click();
} await expect(page.getByRole('button', { name: '下一關', exact: true })).toBeVisible(); expect((await saved(page)).episodes).toContain('lost-letters'); expect((await saved(page)).coins).toBe(6050); });
test('live photograph catches six camera moments and only the shutter earns the persistent photo', async ({ page }) => { await boot(page); await choose(page, 'group-photo'); for (const id of ['luno', 'dou', 'ember', 'rollo', 'yuzu', 'nemu']) {
    const guest = page.locator(`[data-camera-guest=${id}]`);
    for (let attempt = 0; attempt < 4 && !await guest.isDisabled(); attempt++) {
        await expect(guest).toHaveAttribute('data-ready', 'true', { timeout: 5000 });
        await guest.click();
    }
    await expect(guest).toBeDisabled();
} expect((await saved(page)).photos).toBeUndefined(); await page.locator('[data-action=shoot-photo]').click(); await expect(page.getByRole('button', { name: '返回旅館', exact: true })).toBeVisible(); expect((await saved(page)).photos.party.order).toHaveLength(6); expect((await saved(page)).coins).toBe(6050); await page.getByRole('button', { name: '返回旅館', exact: true }).click(); await page.locator('[data-action=photos]').click(); await expect(page.locator('[data-saved-photo=party]')).toHaveCount(1); });
for (const size of [{ width: 844, height: 480 }, { width: 915, height: 412 }, { width: 640, height: 320 }, { width: 390, height: 844 }])
    test(`revised games fit fixed-screen ${size.width}x${size.height}`, async ({ page }) => { await boot(page); await page.setViewportSize(size); for (const id of ['cake-case', 'luggage-run', 'gift-box', 'lift-balance', 'lost-letters', 'group-photo']) {
        await choose(page, id);
        await fits(page);
    } });
