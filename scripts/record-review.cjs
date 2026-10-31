#!/usr/bin/env node
// Record actual gameplay, then encode universally supported review formats.
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { execFileSync } = require('node:child_process');
const { chromium } = require('@playwright/test');
(async () => {
  const root = path.resolve(__dirname, '..'); const output = path.join(root, 'artifacts'); fs.mkdirSync(output, { recursive: true });
  const { queueX, queueY, roomPoint } = await import(pathToFileURL(path.join(root, 'src/game/layout.ts')).href);
  const { firstLevel, solve } = await import(pathToFileURL(path.join(root, 'src/domain/puzzle.ts')).href);
  const browser = await chromium.launch(fs.existsSync('/usr/bin/chromium') ? { executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 960, height: 432 }, reducedMotion: 'no-preference' }); const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const click = (x, y) => page.mouse.click(x * 960 / 844, y * 432 / 480);
    await page.goto(process.env.REVIEW_URL || 'http://127.0.0.1:5173'); await page.waitForFunction(() => document.documentElement.lang === 'zh-Hant');
    await click(590, 330); await page.waitForTimeout(350); await click(590, 325); await page.locator('[data-night="1"]').waitFor();
    const frames = path.join(output, 'review-frames'); fs.mkdirSync(frames, { recursive: true });
    const cdp = await page.context().newCDPSession(page); const stamps = []; let frameIndex = 0;
    cdp.on('Page.screencastFrame', event => {
      const name = `frame-${String(frameIndex++).padStart(6, '0')}.jpg`;
      fs.writeFileSync(path.join(frames, name), Buffer.from(event.data, 'base64'));
      stamps.push({ name, time: event.metadata.timestamp });
      void cdp.send('Page.screencastFrameAck', { sessionId: event.sessionId });
    });
    await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 85, maxWidth: 960, maxHeight: 432, everyNthFrame: 3 });
    await page.locator('[data-night="1"]').click(); const ready = () => page.waitForFunction(() => document.querySelector('canvas').getAttribute('aria-busy') === 'false'); await ready();
    const solution = solve(firstLevel)[0];
    for (let i = 0; i < 4; i++) { const room = firstLevel.rooms.find(r => r.id === solution[firstLevel.guests[i].id]); const p = roomPoint(room); await click(queueX[i], queueY); await click(p.x, p.y); await ready(); }
    await page.waitForTimeout(9000); await page.screenshot({ path: path.join(output, 'hotel-review.png') });
    await cdp.send('Page.stopScreencast');
    await page.getByRole('button', { name: '設定', exact: true }).click(); await page.screenshot({ path: path.join(output, 'hotel-settings.png') });
    await page.getByRole('button', { name: '語言', exact: true }).click(); await page.screenshot({ path: path.join(output, 'hotel-language.png') });
    if (errors.length) throw new Error(errors.join('\n'));
    const source = path.join(frames, 'frames.ffconcat');
    fs.writeFileSync(source, 'ffconcat version 1.0\n' + stamps.map((f, i) => `file '${f.name}'\nduration ${Math.max(0.016, (stamps[i + 1]?.time ?? f.time + 0.1) - f.time)}\n`).join('') + `file '${stamps.at(-1).name}'\n`);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-safe', '0', '-i', source, '-r', '24', '-an', '-c:v', 'libx264', '-vf', 'scale=in_range=pc:out_range=tv,format=yuv420p', '-color_range', 'tv', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', path.join(output, 'hotel-review.mp4')]);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-sseof', '-7', '-i', path.join(output, 'hotel-review.mp4'), '-filter_complex', 'fps=10,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=3', '-loop', '0', path.join(output, 'hotel-review.gif')]);
    const metadata = execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-show_entries', 'stream=codec_name,pix_fmt,width,height,nb_read_frames', '-of', 'json', path.join(output, 'hotel-review.mp4')], { encoding: 'utf8' });
    const stream = JSON.parse(metadata).streams[0]; if (stream.codec_name !== 'h264' || Number(stream.nb_read_frames) < 24) throw new Error('Invalid review video');
    console.log('Saved actual screenshot, H.264 MP4 and animated GIF.', metadata);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
