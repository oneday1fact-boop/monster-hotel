#!/usr/bin/env node
const fs = require('node:fs'); const path = require('node:path');
const { pathToFileURL } = require('node:url'); const { execFileSync } = require('node:child_process');
const { chromium } = require('@playwright/test');
(async () => {
  const root = path.resolve(__dirname, '..'); const out = path.join(root, 'artifacts'); fs.mkdirSync(out, { recursive: true });
  const { queueX, queueY, roomPoint } = await import(pathToFileURL(path.join(root, 'src/game/layout.ts')).href);
  const { firstLevel, solve } = await import(pathToFileURL(path.join(root, 'src/domain/puzzle.ts')).href);
  const browser = await chromium.launch(fs.existsSync('/usr/bin/chromium') ? { executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] } : {});
  try {
    const context = await browser.newContext({ viewport: { width: 960, height: 432 }, reducedMotion: 'no-preference', recordVideo: { dir: path.join(out, 'tutorial-source'), size: { width: 960, height: 432 } } });
    // Cloud recording only: exercise Phaser's normal Canvas fallback instead of slow software WebGL.
    await context.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (type, ...args) { return type.includes('webgl') ? null : original.call(this, type, ...args); }; });
    const page = await context.newPage(); const started = Date.now(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    const click = (x, y) => page.mouse.click(x * 960 / 844, y * 432 / 480);
    const ready = () => page.waitForFunction(() => document.querySelector('canvas').getAttribute('aria-busy') === 'false');
    await page.goto(process.env.REVIEW_URL || 'http://127.0.0.1:5173'); await page.waitForFunction(() => document.documentElement.lang === 'zh-Hant'); await ready();
    await click(590, 330); await page.waitForTimeout(250); await click(590, 325); await page.locator('[data-night="1"]').click(); await ready();
    await page.locator('.tutorial-coach[data-step="select"]').waitFor(); const trim = Math.max(0, (Date.now() - started) / 1000 - .3);
    await page.screenshot({ path: path.join(out, 'tutorial-select.png') }); await page.waitForTimeout(900);
    await click(queueX[0], queueY); await page.locator('.tutorial-coach[data-step="place"]').waitFor();
    await page.screenshot({ path: path.join(out, 'tutorial-room.png') }); await page.waitForTimeout(900);
    const solution = solve(firstLevel)[0]; const p = roomPoint(firstLevel.rooms.find(r => r.id === solution[firstLevel.guests[0].id]));
    await page.mouse.move(queueX[0] * 960 / 844, queueY * 432 / 480); await page.mouse.down(); await page.mouse.move(p.x * 960 / 844, p.y * 432 / 480, { steps: 18 }); await page.mouse.up(); await ready();
    await page.locator('.tutorial-coach[data-step="free"]').waitFor(); await page.screenshot({ path: path.join(out, 'tutorial-free.png') }); await page.waitForTimeout(1300);
    for (let i = 1; i < 4; i++) { const target = roomPoint(firstLevel.rooms.find(r => r.id === solution[firstLevel.guests[i].id])); await click(queueX[i], queueY); await click(target.x, target.y); await ready(); }
    await page.screenshot({ path: path.join(out, 'tutorial-check.png') }); await page.waitForTimeout(800);
    await page.getByRole('button', { name: '安排全部入住  ✦' }).click(); await page.waitForTimeout(1500); await page.screenshot({ path: path.join(out, 'tutorial-reward.png') });
    const video = page.video(); await context.close(); const source = await video.path(); if (errors.length) throw Error(errors.join('\n'));
    const mp4 = path.join(out, 'tutorial-walkthrough.mp4');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(trim), '-i', source, '-an', '-c:v', 'libx264', '-vf', 'scale=in_range=pc:out_range=tv,format=yuv420p', '-color_range', 'tv', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', mp4]);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', mp4, '-t', '7', '-filter_complex', 'fps=25,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=3', '-loop', '0', path.join(out, 'tutorial-walkthrough.gif')]);
    console.log(execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-show_entries', 'stream=codec_name,pix_fmt,avg_frame_rate,nb_read_frames', '-of', 'json', mp4], { encoding: 'utf8' }));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
