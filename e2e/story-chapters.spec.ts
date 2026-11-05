import { test, expect, type Page } from '@playwright/test';
import { load, ready, saved } from './helpers';
async function openBook(page: Page) { await page.getByRole('button', { name: '住客故事簿', exact: true }).click(); }
async function arrange(page: Page, rooms: Record<string,string>) { for (const [guest, room] of Object.entries(rooms)) { await page.locator(`[data-guest="${guest}"]`).click(); await page.locator(`[data-room="${room}"]`).click(); await ready(page); } }
for (const path of ['play','together'] as const) test(`play both follow-up chapters, ${path} ending, resume and prevent duplicate rewards`, async ({ page }) => {
  test.setTimeout(60000);
  await page.addInitScript(() => { if (!localStorage.getItem('midnight-check-in.save.v1')) localStorage.setItem('midnight-check-in.save.v1',JSON.stringify({version:1,coins:50,completed:[],storyNight:{outcome:'together'}})); });
  await load(page); await page.mouse.click(590,330); await openBook(page);
  await expect(page.locator('[data-chapter="2"]')).toBeEnabled(); await expect(page.locator('[data-chapter="3"]')).toBeDisabled(); await page.locator('[data-chapter="2"]').click(); await ready(page);
  await arrange(page,{luno:'101',ember:'102',dou:'B01',rollo:'B02'});
  await page.getByRole('button',{name:'安頓好喇'}).click(); await ready(page);
  await expect(page.locator('.story-speaker')).toHaveText('燈燈 & 月毛');
  await page.getByRole('button',{name:path === 'play' ? '跟住螢火蟲探險' : '大家一齊點亮走廊'}).click(); await ready(page);
  expect((await saved(page)).stories['2'].outcome).toBe(path); expect((await saved(page)).coins).toBe(110);
  await page.getByRole('button',{name:'下一個故事'}).click(); await ready(page);
  await expect(page.locator('.story-goal')).toContainText('豆豆同卷卷');
  await arrange(page,{luno:'B02',ember:'B01',dou:'102',rollo:'101'});
  await page.getByRole('button',{name:'安頓好喇'}).click(); await expect(page.getByRole('status')).toContainText('未滿意');
  await page.locator('[data-tool="moonLamp"]').click(); await page.locator('[data-room="B02"]').click();
  await page.reload(); await ready(page); await page.mouse.click(590,330); await openBook(page); await page.locator('[data-chapter="3"]').click(); await ready(page);
  await page.getByRole('button',{name:'安頓好喇'}).click(); await ready(page); await expect(page.locator('.story-speaker')).toHaveText('豆豆 & 卷卷');
  await page.getByRole('button',{name:path === 'play' ? '拍手幫豆豆打拍子' : '邀請大家一齊跳'}).click(); await ready(page);
  expect((await saved(page)).coins).toBe(185); expect((await saved(page)).stories['3'].outcome).toBe(path);
  await page.getByRole('button',{name:'重看小事件'}).click(); await ready(page); await page.getByRole('button',{name:'邀請大家一齊跳'}).click(); await ready(page); expect((await saved(page)).coins).toBe(185);
  await page.getByRole('button',{name:'住客故事簿',exact:true}).last().click(); await expect(page.locator('.story-book button:enabled')).toHaveCount(4);
});
test('decoration preview shows real lobby, never charges on preview or cancel, and applies one purchase', async ({page}) => {
  await page.addInitScript(() => localStorage.setItem('midnight-check-in.save.v1',JSON.stringify({version:1,coins:100,completed:[]})));
  await load(page); await page.mouse.click(590,330); await page.mouse.click(590,390);
  await expect(page.locator('.shop-explainer')).toContainText('先睇大廳效果'); await expect(page.locator('.shop-wallet')).toContainText('100');
  await page.locator('[data-decoration="moon-lamps"] [data-action="preview"]').click(); await expect(page.locator('.decoration-demo')).toBeVisible(); expect((await saved(page)).coins).toBe(100); expect((await saved(page)).decorations).toBeUndefined();
  await page.getByRole('button',{name:'返回佈置'}).click(); expect((await saved(page)).coins).toBe(100);
  await page.locator('[data-decoration="moon-lamps"] [data-action="preview"]').click(); await page.getByRole('button',{name:'買入並擺放 · 100'}).click();
  expect((await saved(page)).coins).toBe(0); expect((await saved(page)).equipped).toContain('moon-lamps');
  await page.mouse.click(590,390); await page.locator('[data-decoration="moon-lamps"] [data-action="preview"]').click(); await page.getByRole('button',{name:'擺放喺大廳'}).click(); expect((await saved(page)).coins).toBe(0);
});
test('three-pixel mobile backing canvas, bundled playful numbers and full-bleed room layout', async ({browser}) => {
  const context=await browser.newContext({viewport:{width:915,height:412},deviceScaleFactor:3,reducedMotion:'reduce'}); const page=await context.newPage();
  try { await load(page); await page.mouse.click(590*915/844,330*412/480); await openBook(page); await page.locator('[data-chapter="1"]').click(); await ready(page);
    const canvas=await page.locator('canvas').evaluate(c=>({width:c.width,height:c.height,css:c.getBoundingClientRect().width})); expect(canvas).toEqual({width:2745,height:1236,css:915});
    expect(await page.evaluate(()=>document.fonts.check('18px GameNumbers','0123456789'))).toBe(true); await expect(page.locator('.story-hud [data-room]')).toHaveCount(4);
    const top=(await page.locator('[data-room="101"]').boundingBox())!; const lower=(await page.locator('[data-room="B01"]').boundingBox())!; expect(lower.y-top.y).toBeGreaterThan(412*.32);
  } finally {await context.close();}
});
test('storage blocked: chapter drafts and newly unlocked stories remain playable in the same session', async ({page}) => {
  await page.addInitScript(()=>{localStorage.setItem('midnight-check-in.save.v1',JSON.stringify({version:1,coins:50,completed:[],storyNight:{outcome:'play'}}));Storage.prototype.setItem=()=>{throw Error('blocked');};});
  await load(page); await page.mouse.click(590,330); await openBook(page); await page.locator('[data-chapter="2"]').click(); await ready(page);
  await arrange(page,{luno:'101',ember:'102'}); await page.getByRole('button',{name:'住客故事簿',exact:true}).first().click(); await page.locator('[data-chapter="1"]').click(); await ready(page);
  await page.getByRole('button',{name:'住客故事簿',exact:true}).first().click(); await page.locator('[data-chapter="2"]').click(); await ready(page);
  await arrange(page,{dou:'B01',rollo:'B02'}); await page.getByRole('button',{name:'安頓好喇'}).click(); await ready(page); await expect(page.locator('.story-hud')).toHaveAttribute('data-phase','event');
  await page.getByRole('button',{name:'大家一齊點亮走廊'}).click(); await ready(page); await expect(page.getByRole('status')).toContainText('未能儲存');
  await page.getByRole('button',{name:'下一個故事'}).click(); await ready(page); await expect(page.locator('.story-heading')).toContainText('豆豆的午夜舞步');
});
