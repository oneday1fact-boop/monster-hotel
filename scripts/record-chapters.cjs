#!/usr/bin/env node
// Actual offline gameplay, seeded after the first story to review its two follow-ups.
const fs=require('node:fs'); const path=require('node:path'); const {execFileSync}=require('node:child_process'); const {chromium}=require('@playwright/test');
(async()=>{
 const out=path.resolve(__dirname,'../artifacts'); fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}); const errors=[];
 const fallback=c=>c.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.includes('webgl')?null:get.call(this,type,...args);};});
 try {
  const context=await browser.newContext({viewport:{width:1280,height:576},reducedMotion:'no-preference',recordVideo:{dir:path.join(out,'chapters-source'),size:{width:1280,height:576}}}); await fallback(context);
  await context.addInitScript(()=>{if(!localStorage.getItem('midnight-check-in.save.v1'))localStorage.setItem('midnight-check-in.save.v1',JSON.stringify({version:1,completed:[],coins:50,storyNight:{outcome:'together'}}));});
  const page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message)); const started=Date.now();
  const ready=()=>page.waitForFunction(()=>document.querySelector('canvas')?.getAttribute('aria-busy')==='false');
  const screenshot=name=>page.screenshot({path:path.join(out,`expanded-${name}.png`)});
  const lobby=()=>page.mouse.click(590*1280/844,330*576/480);
  const assign=async rooms=>{for(const[g,r]of Object.entries(rooms)){await page.locator(`[data-guest="${g}"]`).click();await page.locator(`[data-room="${r}"]`).click();await ready();}};
  await page.goto(process.env.REVIEW_URL||'http://127.0.0.1:5173');await page.waitForFunction(()=>document.documentElement.lang==='zh-Hant');await lobby();await page.getByRole('button',{name:'住客故事簿',exact:true}).click();await screenshot('storybook');
  await page.locator('[data-chapter="2"]').click();await ready();const begin=Math.max(0,(Date.now()-started)/1000-.4);
  await assign({luno:'101',ember:'102',dou:'B01',rollo:'B02'});await page.waitForTimeout(4600);await screenshot('hotel');
  await page.getByRole('button',{name:'安頓好喇'}).click();await ready();await screenshot('fireflies');await page.getByRole('button',{name:'大家一齊點亮走廊'}).click();await ready();await screenshot('second-ending');
  await page.getByRole('button',{name:'下一個故事'}).click();await ready();await assign({luno:'B02',ember:'B01',dou:'102',rollo:'101'});
  await page.locator('[data-tool="moonLamp"]').click();await page.locator('[data-room="B02"]').click();await page.waitForTimeout(4600);await screenshot('third-hotel');
  const draft=await page.evaluate(()=>localStorage.getItem('midnight-check-in.story-night.v1.chapter-3'));const save=await page.evaluate(()=>localStorage.getItem('midnight-check-in.save.v1'));
  await page.locator('[data-focus="102"]').click();await page.waitForTimeout(600);await screenshot('closeup');await page.getByRole('button',{name:'全間酒店'}).click();await page.getByRole('button',{name:'安頓好喇'}).click();await ready();await screenshot('dance');const eventAt=(Date.now()-started)/1000;
  await page.getByRole('button',{name:'邀請大家一齊跳'}).click();await ready();await screenshot('third-ending');
  await page.getByRole('button',{name:'返回大廳',exact:true}).first().click();await page.mouse.click(590*1280/844,390*576/480);await page.waitForTimeout(400);await screenshot('decorations');await page.locator('[data-decoration="moon-lamps"] [data-action="preview"]').click();await screenshot('decoration-preview');await page.getByRole('button',{name:'買入並擺放 · 100'}).click();await page.waitForTimeout(600);await screenshot('decorated-lobby');
  const video=page.video();await context.close();const source=await video.path();const mp4=path.join(out,'expanded-stories.mp4');execFileSync('ffmpeg',['-y','-loglevel','error','-ss',String(begin),'-i',source,'-an','-c:v','libx264','-vf','scale=in_range=pc:out_range=tv,format=yuv420p','-color_range','tv','-pix_fmt','yuv420p','-crf','19','-movflags','+faststart',mp4]);
  execFileSync('ffmpeg',['-y','-loglevel','error','-ss',String(Math.max(0,eventAt-begin-.2)),'-i',mp4,'-t','6','-filter_complex','fps=20,scale=900:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=3','-loop','0',path.join(out,'expanded-stories.gif')]);
  const retina=await browser.newContext({viewport:{width:915,height:412},deviceScaleFactor:3,reducedMotion:'reduce'});await fallback(retina);await retina.addInitScript(({save,draft})=>{localStorage.setItem('midnight-check-in.save.v1',save);localStorage.setItem('midnight-check-in.story-night.v1.chapter-3',draft);},{save,draft});const p=await retina.newPage();await p.goto(process.env.REVIEW_URL||'http://127.0.0.1:5173');await p.waitForFunction(()=>document.documentElement.lang==='zh-Hant');await p.mouse.click(590*915/844,330*412/480);await p.getByRole('button',{name:'住客故事簿',exact:true}).click();await p.locator('[data-chapter="3"]').click();await p.waitForTimeout(5000);await p.screenshot({path:path.join(out,'expanded-retina-3x.png')});console.log(await p.locator('canvas').evaluate(c=>({width:c.width,height:c.height,cssWidth:c.getBoundingClientRect().width})));await retina.close();
  if(errors.length)throw Error(errors.join('\n'));console.log(execFileSync('ffprobe',['-v','error','-count_frames','-show_entries','stream=codec_name,pix_fmt,width,height,nb_read_frames','-of','json',mp4],{encoding:'utf8'}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
