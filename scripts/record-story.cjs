#!/usr/bin/env node
const fs = require('node:fs'); const path = require('node:path'); const { execFileSync } = require('node:child_process'); const { chromium } = require('@playwright/test');
(async () => {
  const out = path.resolve(__dirname, '../artifacts'); fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch(fs.existsSync('/usr/bin/chromium') ? { executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] } : {}); const errors = [];
  const fallback = c => c.addInitScript(() => { const get = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (type, ...args) { return type.includes('webgl') ? null : get.call(this, type, ...args); }; });
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, reducedMotion: 'no-preference', recordVideo: { dir: path.join(out, 'story-source'), size: { width: 1280, height: 720 } } }); await fallback(context);
    const page = await context.newPage(); page.setDefaultTimeout(20000); const started = Date.now(); page.on('pageerror', e => errors.push(e.message));
    const ready = () => page.waitForFunction(() => document.querySelector('canvas').getAttribute('aria-busy') === 'false');
    const enter = async p => { await p.goto(process.env.REVIEW_URL || 'http://127.0.0.1:5173'); await p.waitForFunction(() => document.documentElement.lang === 'zh-Hant'); const box = await p.locator('canvas').boundingBox(); await p.mouse.click(box.x + 590 / 844 * box.width, box.y + 330 / 480 * box.height); await p.getByRole('button', { name: '住客故事簿' }).click(); await p.locator('[data-chapter="1"]').click(); };
    await enter(page); await ready(); await page.getByRole('button', { name: '設定', exact: true }).click(); await page.screenshot({ path: path.join(out, 'native-ui-settings.png') }); await page.keyboard.press('Escape'); await ready(); const begin = Math.max(0, (Date.now() - started) / 1000 - .4);
    await page.screenshot({ path: path.join(out, 'story-overview.png') });
    for (const [guest, room] of Object.entries({ luno: '101', dou: '102', ember: 'B02', rollo: 'B01' })) { await page.locator(`[data-guest="${guest}"]`).click(); await page.locator(`[data-room="${room}"]`).click(); await ready(); }
    await page.getByRole('button', { name: '安頓好喇' }).click(); await page.screenshot({ path: path.join(out, 'story-noise.png') });
    const from = await page.locator('[data-tool="curtain"]').boundingBox(); const to = await page.locator('[data-room="102"]').boundingBox();
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2); await page.mouse.down(); await page.mouse.move(to.x + 50, to.y + 65, { steps: 20 }); await page.mouse.up();
    const draft = await page.evaluate(() => localStorage.getItem('midnight-check-in.story-night.v1'));
    await page.locator('[data-focus="101"]').click(); await page.waitForTimeout(900); await page.screenshot({ path: path.join(out, 'story-closeup.png') }); await page.getByRole('button', { name: '全間酒店' }).click();
    await page.getByRole('button', { name: '安頓好喇' }).click(); await ready(); await page.screenshot({ path: path.join(out, 'story-event.png') }); const eventAt = (Date.now() - started) / 1000;
    await page.getByRole('button', { name: '邀請卷卷一齊玩' }).click(); await page.locator('.story-hud[data-phase="settled"]').waitFor({ timeout: 20000 }); await page.screenshot({ path: path.join(out, 'story-ending.png') }); await page.waitForTimeout(1000);
    await page.getByRole('button', { name: '返回大廳', exact: true }).first().click(); await page.waitForTimeout(2400); await page.screenshot({ path: path.join(out, 'story-lobby-toys.png') });
    const video = page.video(); await context.close(); const source = await video.path();
    const mp4 = path.join(out, 'story-night.mp4'); execFileSync('ffmpeg', ['-y','-loglevel','error','-ss',String(begin),'-i',source,'-an','-c:v','libx264','-vf','scale=in_range=pc:out_range=tv,format=yuv420p','-color_range','tv','-pix_fmt','yuv420p','-crf','19','-movflags','+faststart',mp4]);
    execFileSync('ffmpeg', ['-y','-loglevel','error','-ss',String(Math.max(0,eventAt - begin - .2)),'-i',mp4,'-t','6','-filter_complex','fps=20,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=3','-loop','0',path.join(out,'story-night.gif')]);
    const retina = await browser.newContext({ viewport: { width: 960, height: 432 }, deviceScaleFactor: 2, reducedMotion: 'no-preference' }); await fallback(retina); await retina.addInitScript(d => localStorage.setItem('midnight-check-in.story-night.v1', d), draft);
    const detail = await retina.newPage(); await enter(detail); await detail.locator('[data-focus="101"]').click(); await detail.waitForTimeout(500); await detail.screenshot({ path: path.join(out,'story-retina-2x.png') });
    console.log(await detail.locator('canvas').evaluate(c => ({ backingWidth: c.width, backingHeight: c.height, cssWidth: c.getBoundingClientRect().width, cssHeight: c.getBoundingClientRect().height })));
    await retina.close(); if (errors.length) throw Error(errors.join('\n'));
    console.log(execFileSync('ffprobe',['-v','error','-count_frames','-show_entries','stream=codec_name,pix_fmt,width,height,nb_read_frames','-of','json',mp4],{encoding:'utf8'}));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
