import { test, expect, type Page } from '@playwright/test';
import { ready, saved, saveKey, assign } from './helpers';
const episodes = ['cake-case', 'luggage-run', 'dream-door', 'lift-balance', 'moon-mirrors', 'gift-box'];
const roadMoves = [15, 11, 7, 6, 10, 14, 13, 12, 8, 4, 0, 1, 5, 9, 13, 14];
const caseSave = { version: 1, coins: 50, completed: [1] };
async function boot(p: Page, seed: object | null = caseSave) {
    if (seed)
        await p.addInitScript(({ key, seed }) => {
            if (!localStorage.getItem(key))
                localStorage.setItem(key, JSON.stringify(seed));
        }, { key: saveKey, seed });
    await p.emulateMedia({ reducedMotion: 'reduce' });
    await p.goto('/');
    await ready(p);
}
async function lobby(p: Page) { const s = p.viewportSize()!; await p.mouse.click(590 * s.width / 844, 330 * s.height / 480); await expect(p.locator('.lobby-menu')).toBeVisible(); }
async function choose(p: Page, id: string) { const target = p.locator(`.challenge-node[data-challenge="${id}"]`); if (!await target.count())
    await p.getByRole('button', { name: ['puzzle-1', ...episodes].indexOf(id) >= 4 ? '下一頁' : '上一頁', exact: true }).click(); await target.click(); await ready(p); }
async function open(p: Page, id: string) { await lobby(p); await p.locator('[data-action=challenges]').click(); await choose(p, id); }
async function firstNight(p: Page) {
    await open(p, 'puzzle-1');
    await expect(p.locator('.arrival-opening')).toContainText('四位新住客');
    await expect(p.locator('.arrival-guest')).toHaveCount(4);
    await p.locator('[data-action=welcome-guests]').click();
    await ready(p);
    for (let i = 0; i < 4; i++)
        await assign(p, i);
    await p.locator('[data-action=check-in]').click();
    await p.mouse.click(422, 398);
    await ready(p);
}
async function solve(p: Page, id: string) {
    if (id === 'cake-case') {
        for (const c of ['footprints', 'icing', 'ribbon'])
            await p.locator(`[data-evidence=${c}]`).click();
        await fits(p);
        await p.locator('[data-suspect=rollo]').click();
    }
    else if (id === 'luggage-run') {
        for (const i of roadMoves)
            await p.locator(`[data-tile="${i}"]`).click();
        await p.locator('[data-action=send-luggage]').click();
        await ready(p);
    }
    else if (id === 'dream-door') {
        for (const d of ['lamp', 'crest', 'key', 'rug', 'parcel'])
            await p.locator(`[data-world=dream] [data-difference=${d}]`).click();
    }
    else if (id === 'lift-balance') {
        for (const [id, side] of [['b', 'left'], ['d', 'left'], ['e', 'left'], ['a', 'right'], ['c', 'right'], ['f', 'right']]) {
            await p.locator(`[data-bag=${id}]`).click();
            await p.locator(`[data-pan=${side}]`).click();
        }
        await expect(p.locator('[data-weight=left]')).toContainText('17kg');
        await expect(p.locator('[data-weight=right]')).toContainText('17kg');
        await p.locator('[data-action=check-lift]').click();
    }
    else if (id === 'moon-mirrors') {
        for (const i of [0, 1, 2, 3, 4])
            await p.locator(`[data-mirror="${i}"]`).click();
        await expect(p.locator('.moon-status')).toContainText('3/3');
        await p.locator('[data-action=check-mirrors]').click();
    }
    else {
        for (const [id, cell, r] of [['a', 0, 0], ['b', 5, 0], ['c', 1, 0], ['d', 11, 3], ['e', 12, 0]] as const) {
            await p.locator(`[data-gift=${id}]`).click();
            for (let n = 0; n < r; n++)
                await p.locator('[data-action=rotate-gift]').click();
            await p.locator(`[data-gift-cell="${cell}"]`).click();
        }
        await expect(p.locator('.gift-cell.is-packed')).toHaveCount(16);
        await p.locator('[data-action=check-gifts]').click();
    }
    await expect(p.locator('.episode-finish')).toBeVisible();
}
async function fits(p: Page) {
    expect(await p.evaluate(() => {
        const bad: string[] = [];
        for (const el of document.querySelectorAll<HTMLElement>('.arrival-introduction,.arrival-guests,.arrival-guest,.classic-wishes,.episode-screen,.episode-panel,.episode-finish,.episode-footer,.comparison-stage,.comparison-picture,.road-board,.lift-stock,.lift-machine,.lift-pan,.moon-board,.gift-board,.gift-palette,.gift-actions,.sheet-body,.boutique,.challenge-map')) {
            if (!el.getClientRects().length)
                continue;
            if (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2)
                bad.push(`${el.className}: ${el.scrollWidth}x${el.scrollHeight}/${el.clientWidth}x${el.clientHeight}`);
        }
        for (const b of document.querySelectorAll<HTMLElement>('.episode-screen button,.details-overlay button')) {
            const r = b.getBoundingClientRect();
            if (b.getClientRects().length && (r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1))
                bad.push(b.getAttribute('aria-label') || b.textContent || 'button');
        }
        return bad;
    })).toEqual([]);
}
test('opening-night room assignment introduces guests first, then all six events award once', async ({ page }) => {
    test.setTimeout(150000);
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await boot(page, null);
    await firstNight(page);
    expect((await saved(page)).coins).toBe(50);
    for (let i = 0; i < episodes.length; i++) {
        await expect(page.locator('.episode-screen')).toHaveAttribute('data-episode', episodes[i]);
        await solve(page, episodes[i]);
        expect((await saved(page)).coins).toBe(50 + (i + 1) * 500);
        await page.getByRole('button', { name: episodes[i] === 'gift-box' ? '返回旅館' : '下一關', exact: true }).click();
        await ready(page);
    }
    await page.locator('[data-action=challenges]').click();
    await expect(page.locator('.challenge-node')).toHaveCount(3);
    await page.getByRole('button', { name: '上一頁', exact: true }).click();
    await expect(page.locator('.challenge-node').first()).toHaveAttribute('data-challenge', 'puzzle-1');
    await page.locator('[data-challenge=cake-case]').click();
    await solve(page, 'cake-case');
    expect((await saved(page)).coins).toBe(3050);
    expect(errors).toEqual([]);
});
test('physical clues are illustrated room objects; collected art and partial investigation persist', async ({ page }) => {
    await boot(page);
    await open(page, 'cake-case');
    await expect(page.locator('.evidence-object')).toHaveCount(3);
    await expect(page.locator('[data-suspect=rollo]')).toBeDisabled();
    for (const id of ['footprints', 'icing', 'ribbon']) {
        const item = page.locator(`[data-evidence=${id}]`);
        await expect(item).toBeVisible();
        expect(await item.evaluate(e => getComputedStyle(e).backgroundImage)).toContain('evidence-props.png');
    }
    await page.locator('[data-evidence=icing]').click();
    await expect(page.locator('.evidence-thumb')).toHaveCount(1);
    await fits(page);
    await page.reload();
    await ready(page);
    await open(page, 'cake-case');
    await expect(page.locator('[data-evidence=icing]')).toHaveClass(/is-collected/);
    await page.locator('[data-evidence=footprints]').click();
    await page.locator('[data-evidence=ribbon]').click();
    await fits(page);
    await page.locator('[data-suspect=yuzu]').click();
    await expect(page.getByRole('status')).toContainText('再比較證據');
    await page.locator('[data-suspect=rollo]').click();
    expect((await saved(page)).coins).toBe(550);
});
test('larger roads keep fifteen visible pieces and one gap, reject jumps and resume legal moves', async ({ page }) => { test.setTimeout(90000); await boot(page, { ...caseSave, coins: 550, episodes: ['cake-case'] }); await open(page, 'luggage-run'); await expect(page.locator('.road-tile')).toHaveCount(16); await expect(page.locator('.road-art')).toHaveCount(15); await expect(page.locator('.road-blank')).toHaveCount(1); await page.locator('[data-action=send-luggage]').click(); await expect(page.getByRole('status')).toContainText('未接通'); await page.locator('[data-tile="0"]').click(); await expect(page.getByRole('status')).toContainText('空位上下左右'); await page.locator('[data-tile="15"]').click(); await ready(page); await page.reload(); await ready(page); await open(page, 'luggage-run'); await expect(page.locator('[data-tile="15"]')).toHaveClass(/road-blank/); for (const i of roadMoves.slice(1))
    await page.locator(`[data-tile="${i}"]`).click(); await page.locator('[data-action=send-luggage]').click(); await ready(page); await expect(page.locator('.episode-finish')).toBeVisible(); expect((await saved(page)).coins).toBe(1050); });
test('paired pictures mark the matching region on both sides, ignore repeat and background taps, resume in English', async ({ page }) => {
    await boot(page, { ...caseSave, coins: 1050, episodes: ['cake-case', 'luggage-run'] });
    await open(page, 'dream-door');
    await expect(page.locator('.comparison-picture')).toHaveCount(2);
    const real = page.locator('[data-world=real]');
    await real.click({ position: { x: 10, y: 10 } });
    await expect(page.locator('.difference-count')).toHaveText('已找到 0 / 5');
    await page.locator('[data-world=dream] [data-difference=key]').click();
    await expect(page.locator('.difference-target.is-found')).toHaveCount(2);
    await page.locator('[data-world=real] [data-difference=key]').click();
    await expect(page.locator('.difference-count')).toHaveText('已找到 1 / 5');
    await page.getByRole('button', { name: '語言', exact: true }).click();
    await page.getByRole('button', { name: 'English', exact: true }).click();
    await page.reload();
    await ready(page);
    await page.mouse.click(590, 330);
    await page.locator('[data-action=challenges]').click();
    await page.locator('[data-challenge=dream-door]').click();
    await expect(page.locator('.difference-count')).toHaveText('Found 1 / 5');
    for (const id of ['lamp', 'crest', 'rug', 'parcel'])
        await page.locator(`[data-world=real] [data-difference=${id}]`).click();
    await expect(page.locator('.episode-finish')).toBeVisible();
    expect((await saved(page)).coins).toBe(1550);
});
for (const size of [{ width: 844, height: 480 }, { width: 915, height: 412 }, { width: 640, height: 320 }, { width: 390, height: 844 }])
    test(`visible clues, road tiles, paired pictures and endings fit without scroll ${size.width}x${size.height}`, async ({ page }) => {
        test.setTimeout(150000);
        await page.setViewportSize(size);
        await boot(page);
        await open(page, 'cake-case');
        for (const id of episodes) {
            await fits(page);
            await solve(page, id);
            await fits(page);
            await page.getByRole('button', { name: id === 'gift-box' ? '返回旅館' : '下一關', exact: true }).click();
            await ready(page);
        }
    });
for (const size of [{ width: 844, height: 480 }, { width: 915, height: 412 }, { width: 640, height: 320 }, { width: 390, height: 844 }])
    test(`first guest introduction fits ${size.width}x${size.height}`, async ({ page }) => { await page.setViewportSize(size); await boot(page, null); await open(page, 'puzzle-1'); await expect(page.locator('.arrival-guest')).toHaveCount(4); await fits(page); await page.locator('[data-action=welcome-guests]').click(); await ready(page); await expect(page.locator('.classic-wishes')).toContainText('月毛要月光'); await fits(page); });
test('legacy coins and achievements survive changed puzzle drafts and new stage order', async ({ page }) => { await page.addInitScript(() => localStorage.setItem('midnight-check-in.episode.dream-door.v1', JSON.stringify({ dream: { world: 'dream', seed: true, grown: true, key: true, open: false } }))); await boot(page, { version: 1, coins: 123, completed: [1, 2, 20], storyNight: { outcome: 'together' }, ambience: 'winter', decorations: ['moon-lamps'], episodes: ['cake-case', 'luggage-run'] }); await open(page, 'dream-door'); await expect(page.locator('.difference-count')).toHaveText('已找到 0 / 5'); await solve(page, 'dream-door'); expect(await saved(page)).toMatchObject({ coins: 623, completed: [1, 2, 20], storyNight: { outcome: 'together' }, ambience: 'winter', decorations: ['moon-lamps'] }); });
test('settings, shop previews and purchased weather remain usable', async ({ page }) => { await boot(page, { ...caseSave, coins: 1000 }); await lobby(page); await page.getByRole('button', { name: '設定', exact: true }).click(); await page.getByRole('checkbox', { name: '音效', exact: true }).uncheck(); await fits(page); await page.keyboard.press('Escape'); await page.locator('[data-action=shop]').click(); await page.locator('[data-decoration=moon-lamps] [data-action=preview]').click(); expect((await saved(page)).coins).toBe(1000); await page.getByRole('button', { name: '返回商店' }).click(); await page.locator('[data-decoration=moon-lamps] [data-action=buy]').click(); expect((await saved(page)).coins).toBe(900); await page.locator('[data-tab=scenes]').click(); await page.getByRole('button', { name: '下一頁', exact: true }).click(); await page.locator('[data-scene=winter] [data-action=scene]').click(); await page.locator('[data-action=confirm]').click(); expect((await saved(page)).coins).toBe(700); });
test('offline play with blocked storage still carries opening-night progress into the case', async ({ page, context }) => { test.setTimeout(90000); await page.addInitScript(() => { Storage.prototype.setItem = () => { throw Error('blocked'); }; }); await boot(page, null); await context.setOffline(true); await firstNight(page); await solve(page, 'cake-case'); await expect(page.getByRole('status')).toContainText('未能儲存'); await page.getByRole('button', { name: '下一關', exact: true }).click(); await expect(page.locator('.episode-screen')).toHaveAttribute('data-episode', 'luggage-run'); });
test('balance rejects empty and unequal loads, and restores partially loaded bags', async ({ page }) => { await boot(page, { ...caseSave, episodes: episodes.slice(0, 3), coins: 1550 }); await open(page, 'lift-balance'); await page.locator('[data-action=check-lift]').click(); await expect(page.getByRole('status')).toContainText('六件全裝好'); await page.locator('[data-bag=b]').click(); await page.locator('[data-pan=left]').click(); await page.reload(); await ready(page); await open(page, 'lift-balance'); await expect(page.locator('[data-weight=left]')).toContainText('4kg'); await page.locator('[data-loaded=b]').click(); await solve(page, 'lift-balance'); expect((await saved(page)).coins).toBe(2050); });
test('mirror rays update live, incorrect lighting does not win, and all targets must be lit', async ({ page }) => { await boot(page, { ...caseSave, episodes: episodes.slice(0, 4), coins: 2050 }); await open(page, 'moon-mirrors'); await page.locator('[data-action=check-mirrors]').click(); await expect(page.getByRole('status')).toContainText('同時亮起'); const ray = await page.locator('.moon-ray polyline').getAttribute('points'); await page.locator('[data-mirror="0"]').click(); const changedRay = await page.locator('.moon-ray polyline').getAttribute('points'); expect(changedRay).not.toBe(ray); await page.reload(); await ready(page); await open(page, 'moon-mirrors'); await expect(page.locator('.moon-ray polyline')).toHaveAttribute('points', changedRay!); await page.locator('[data-mirror="0"]').click(); await solve(page, 'moon-mirrors'); expect((await saved(page)).coins).toBe(2550); });
test('gift shapes rotate, refuse overlap and out-of-box placements, and fill the entire box', async ({ page }) => { await boot(page, { ...caseSave, episodes: episodes.slice(0, 5), coins: 2550 }); await open(page, 'gift-box'); await page.locator('[data-action=check-gifts]').click(); await expect(page.getByRole('status')).toContainText('五份'); await page.locator('[data-gift=c]').click(); await page.locator('[data-gift-cell="15"]').click(); await expect(page.getByRole('status')).toContainText('放唔落'); await expect(page.locator('.gift-cell.is-packed')).toHaveCount(0); await page.locator('[data-gift-cell="1"]').click(); await expect(page.locator('.gift-cell.is-packed')).toHaveCount(3); await page.reload(); await ready(page); await open(page, 'gift-box'); await expect(page.locator('.gift-cell.is-packed')).toHaveCount(3); await page.locator('[data-gift-cell="1"]').click(); await expect(page.locator('.gift-cell.is-packed')).toHaveCount(0); await solve(page, 'gift-box'); expect((await saved(page)).coins).toBe(3050); });
test('subtle comparison retains matching objects; hints never collect a difference', async ({ page }) => { await boot(page, { ...caseSave, episodes: episodes.slice(0, 2) }); await open(page, 'dream-door'); for (const id of ['crest', 'key'])
    expect(await page.locator(`[data-world=real] .comparison-object.difference-prop--${id}`).evaluate(e => getComputedStyle(e).opacity)).toBe('1'); expect(await page.locator('[data-world=dream] .difference-prop--parcel').evaluate(e => getComputedStyle(e).backgroundPosition)).toBe(await page.locator('[data-world=real] .difference-prop--parcel').evaluate(e => getComputedStyle(e).backgroundPosition)); await page.locator('[data-action=difference-hint]').click(); await expect(page.locator('.difference-count')).toHaveText('已找到 0 / 5'); await expect(page.locator('.difference-target.is-hint')).toHaveCount(2); });
