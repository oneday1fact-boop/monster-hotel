#!/usr/bin/env node
const fs = require('node:fs'); const path = require('node:path');
const { execFileSync } = require('node:child_process'); const { chromium } = require('@playwright/test');
(async () => {
  const out = path.resolve(__dirname, '../artifacts'); fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch(fs.existsSync('/usr/bin/chromium') ? { executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] } : {});
  const options = { viewport: { width: 960, height: 432 }, reducedMotion: 'no-preference' };
  async function canvasFallback(context) {
    await context.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (type, ...args) { return type.includes('webgl') ? null : original.call(this, type, ...args); }; });
  }
  try {
    const context = await browser.newContext({ ...options, recordVideo: { dir: path.join(out, 'reception-source'), size: options.viewport } }); await canvasFallback(context);
    const page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    const click = (x, y) => page.mouse.click(x * 960 / 844, y * 432 / 480);
    await page.goto(process.env.REVIEW_URL || 'http://127.0.0.1:5173'); await page.waitForFunction(() => document.documentElement.lang === 'zh-Hant');
    await page.screenshot({ path: path.join(out, 'reception-title.png') }); await page.waitForTimeout(2000);
    await click(590, 330); await page.waitForTimeout(1200); await page.screenshot({ path: path.join(out, 'reception-lobby.png') });
    await click(100, 386); await page.waitForTimeout(1500);
    await click(590, 325); await page.waitForTimeout(1300); await page.screenshot({ path: path.join(out, 'reception-nights.png') });
    const video = page.video(); await context.close(); const source = await video.path(); if (errors.length) throw Error(errors.join('\n'));
    const mp4 = path.join(out, 'reception-walkthrough.mp4');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', source, '-an', '-c:v', 'libx264', '-vf', 'scale=in_range=pc:out_range=tv,format=yuv420p', '-color_range', 'tv', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', mp4]);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', mp4, '-t', '7', '-filter_complex', 'fps=25,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=3', '-loop', '0', path.join(out, 'reception-walkthrough.gif')]);
    // Separate disposable profile: visual fixture showing all three legitimately purchasable cosmetics.
    const decorated = await browser.newContext(options); await canvasFallback(decorated);
    await decorated.addInitScript(() => localStorage.setItem('midnight-check-in.save.v1', JSON.stringify({ version: 1, completed: Array.from({ length: 12 }, (_, i) => i + 1), coins: 0, decorations: ['moon-lamps', 'velvet-rug', 'star-sign'], equipped: ['moon-lamps', 'velvet-rug', 'star-sign'] })));
    const preview = await decorated.newPage(); await preview.goto(process.env.REVIEW_URL || 'http://127.0.0.1:5173'); await preview.waitForFunction(() => document.documentElement.lang === 'zh-Hant');
    await preview.mouse.click(590 * 960 / 844, 330 * 432 / 480); await preview.screenshot({ path: path.join(out, 'reception-decorated.png') }); await decorated.close();
    console.log(execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-show_entries', 'stream=codec_name,pix_fmt,avg_frame_rate,nb_read_frames', '-of', 'json', mp4], { encoding: 'utf8' }));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
