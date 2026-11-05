import {test,expect,type Page} from '@playwright/test';
import {load,ready,saved} from './helpers';
const saveKey='midnight-check-in.save.v1';
async function book(page:Page,id:number){await page.mouse.click(590,330);await page.getByRole('button',{name:'住客故事簿',exact:true}).click();await page.locator(`[data-chapter="${id}"]`).click();await ready(page);}
async function assign(page:Page,rooms:Record<string,string>){for(const[g,r]of Object.entries(rooms)){await page.locator(`[data-guest="${g}"]`).click();await page.locator(`[data-room="${r}"]`).click();await ready(page);}}
async function tool(page:Page,key:string,room:string){await page.locator(`[data-tool="${key}"]`).click();await page.locator(`[data-room="${room}"]`).click();}
for(const path of ['play','together'] as const)test(`new guests play all three seasonal stories, ${path}, resume and replay`,async({page})=>{
 test.setTimeout(120000);
 await page.addInitScript(k=>{if(!localStorage.getItem(k))localStorage.setItem(k,JSON.stringify({version:1,completed:[],coins:185,storyNight:{outcome:'together'},stories:{2:{outcome:'together'},3:{outcome:'play'}}}));},saveKey);
 await load(page);await book(page,4);await expect(page.locator('canvas')).toHaveAttribute('data-ambience','autumn');
 await assign(page,{yuzu:'101'});await page.reload();await ready(page);await book(page,4);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('midnight-check-in.story-night.v1.chapter-4')!).assignment.yuzu)).toBe('101');
 await assign(page,{luno:'B02',dou:'B01',ember:'102'});await tool(page,'curtain','B01');await page.getByRole('button',{name:'安頓好喇'}).click();await ready(page);await expect(page.locator('.story-speaker')).toHaveText('小柚 & 燈燈');
 await page.getByRole('button',{name:path==='play'?'陪小柚晾乾頸巾':'大家一齊飲暖茶'}).click();await ready(page);expect((await saved(page)).coins).toBe(265);
 await page.getByRole('button',{name:'下一個故事'}).click();await ready(page);await expect(page.locator('canvas')).toHaveAttribute('data-ambience','morning');
 await assign(page,{luno:'101',dou:'102',nemu:'B01',rollo:'B02'});await tool(page,'curtain','102');await page.getByRole('button',{name:'安頓好喇'}).click();await expect(page.getByRole('status')).toContainText('未滿意');await tool(page,'moonLamp','101');
 await page.getByRole('button',{name:'安頓好喇'}).click();await ready(page);await expect(page.locator('.story-speaker')).toHaveText('夢夢 & 卷卷');await page.getByRole('button',{name:path==='play'?'幫夢夢解開夢結':'放走夢裡的小星星'}).click();await ready(page);expect((await saved(page)).coins).toBe(355);
 await page.getByRole('button',{name:'下一個故事'}).click();await ready(page);await expect(page.locator('canvas')).toHaveAttribute('data-ambience','winter');await assign(page,{yuzu:'101',nemu:'102',ember:'B02',rollo:'B01'});await page.getByRole('button',{name:'安頓好喇'}).click();await ready(page);await expect(page.locator('.story-speaker')).toHaveText('小柚 & 夢夢');await page.getByRole('button',{name:path==='play'?'排好隊影合照':'一齊砌雪朋友'}).click();await ready(page);
 expect((await saved(page)).coins).toBe(455);for(const id of ['4','5','6'])expect((await saved(page)).stories[id].outcome).toBe(path);
 await page.getByRole('button',{name:'重看小事件'}).click();await ready(page);await page.getByRole('button',{name:'一齊砌雪朋友'}).click();await ready(page);expect((await saved(page)).coins).toBe(455);
 await page.getByRole('button',{name:'住客故事簿',exact:true}).first().click();await expect(page.locator('.story-book button:enabled')).toHaveCount(6);
});
test('lobby scenery changes actual art, persists without spending coins, and survives English settings',async({page})=>{
 await load(page);await page.mouse.click(590,330);
 for(const theme of ['autumn','winter','morning']){await page.getByRole('button',{name:'景色',exact:true}).click();await page.locator(`.ambience-tile[data-ambience="${theme}"]`).click();await expect(page.locator('canvas')).toHaveAttribute('data-ambience',theme);expect((await saved(page)).ambience).toBe(theme);expect((await saved(page)).coins).toBe(0);}
 await page.reload();await ready(page);await expect(page.locator('canvas')).toHaveAttribute('data-ambience','morning');await page.mouse.click(590,330);await page.getByRole('button',{name:'語言',exact:true}).click();await page.getByRole('button',{name:'English',exact:true}).click();await expect(page.getByRole('button',{name:'Scenery',exact:true})).toBeVisible();await expect(page.locator('canvas')).toHaveAttribute('data-ambience','morning');
});
test('new guest animation runs and can be skipped without duplicate rewards',async({page})=>{
 await page.addInitScript(k=>{localStorage.setItem(k,JSON.stringify({version:1,completed:[],coins:185,storyNight:{outcome:'play'},stories:{2:{outcome:'play'},3:{outcome:'play'}}}));localStorage.setItem('midnight-check-in.story-night.v1.chapter-4',JSON.stringify({assignment:{yuzu:'101',ember:'102',luno:'B02',dou:'B01'},equipment:{curtain:'B01'},phase:'event',introduced:true}));},saveKey);
 await load(page);await page.emulateMedia({reducedMotion:'no-preference'});await book(page,4);await page.getByRole('button',{name:'大家一齊飲暖茶'}).click();const a=await page.locator('canvas').screenshot();await page.waitForTimeout(350);expect(a.equals(await page.locator('canvas').screenshot())).toBe(false);await page.getByRole('button',{name:'跳過演出'}).click();await ready(page);expect((await saved(page)).coins).toBe(265);await page.getByRole('button',{name:'重看小事件'}).click();await ready(page);await page.getByRole('button',{name:'陪小柚晾乾頸巾'}).click();await page.getByRole('button',{name:'跳過演出'}).click();await ready(page);expect((await saved(page)).coins).toBe(265);
});
test('storybook opens on the new guest chapter and page controls expose old and new stories',async({page})=>{
 await page.addInitScript(k=>localStorage.setItem(k,JSON.stringify({version:1,completed:[],coins:185,storyNight:{outcome:'play'},stories:{2:{outcome:'play'},3:{outcome:'play'}}})),saveKey);
 await load(page);await page.mouse.click(590,330);await page.getByRole('button',{name:'住客故事簿',exact:true}).click();await expect(page.locator('[data-chapter="4"]')).toBeInViewport({ratio:.95});await page.getByRole('button',{name:'前面故事',exact:true}).click();await expect(page.locator('[data-chapter="1"]')).toBeInViewport({ratio:.95});await page.getByRole('button',{name:'後續故事',exact:true}).click();await expect(page.locator('[data-chapter="6"]')).toBeInViewport({ratio:.95});
});
