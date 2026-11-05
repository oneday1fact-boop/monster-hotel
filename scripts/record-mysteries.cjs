#!/usr/bin/env node
// Real GUI capture. A documented returning-player save replays the redesigned case,
// then completes the three newly unlocked episodes. No puzzle state is injected.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process'),{chromium}=require('@playwright/test');
(async()=>{const out=path.resolve(__dirname,'../artifacts');fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const c=await browser.newContext({viewport:{width:1280,height:720},recordVideo:{dir:path.join(out,'revision17-source'),size:{width:1280,height:720}}});
 await c.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return t.includes('webgl')?null:get.call(this,t,...a);};localStorage.setItem('midnight-check-in.save.v1',JSON.stringify({version:1,completed:[1],coins:3050,episodes:['cake-case','luggage-run','dream-door','lift-balance','moon-mirrors','gift-box']}));});
 const p=await c.newPage();p.setDefaultTimeout(45000);const errors=[];p.on('pageerror',e=>errors.push(e.message));const began=Date.now(),ready=()=>p.waitForFunction(()=>document.querySelector('canvas')?.getAttribute('aria-busy')==='false'),pause=(n=500)=>p.waitForTimeout(n),shot=n=>p.screenshot({path:path.join(out,`revision17-${n}.png`)});
 const next=async()=>{await p.getByRole('button',{name:'下一關',exact:true}).click();await ready();};
 await p.goto(process.env.REVIEW_URL||'http://127.0.0.1:5175');await ready();await p.mouse.click(590*1280/844,330*720/480);await p.locator('[data-action=challenges]').click();await p.getByRole('button',{name:'上一頁',exact:true}).click();await p.locator('.challenge-node[data-challenge=cake-case]').click();await ready();await shot('scene');
 await p.locator('[data-action=inspect-window]').click();await pause();
 for(const id of['icing','footprints','ribbon']){await p.locator(`[data-evidence=${id}]`).click();await pause(800);}
 await shot('tracks');const trackAt=(Date.now()-began)/1000;
 await p.locator('[data-wheel=luno]').click();await pause(1000);await p.locator('[data-wheel=rollo]').click();await shot('reason');
 await p.locator('[data-proof=heat]').click();await p.locator('[data-proof=ribbon]').click();await p.locator('[data-action=link-evidence]').click();await pause(1000);
 await p.locator('[data-proof=ribbon]').click();await p.locator('[data-proof=melt]').click();await p.locator('[data-action=link-evidence]').click();await shot('linked');await pause(1000);await p.locator('[data-suspect=rollo]').click();
 await p.getByRole('button',{name:'關卡地圖',exact:true}).click();await p.locator('.challenge-node[data-challenge=midnight-knock]').click();await ready();await shot('timeline');
 for(const[i,id]of['lights','tea','bell','knock','door'].entries()){await p.locator(`[data-event=${id}]`).click();await pause(250);await p.locator(`[data-event-slot="${i}"]`).click();await pause();}
 await shot('sequence');await p.locator('[data-action=check-timeline]').click();await next();await shot('pipes');
 for(const[i,turns]of[3,2,1,1,2,3,2,3,1].entries())for(let n=0;n<turns;n++){await p.locator(`[data-pipe="${i}"]`).click();await pause(220);}
 await shot('warm-baths');await pause(1200);await p.locator('[data-action=check-pipes]').click();await next();await shot('letters');
 for(const[letter,guest]of[['flower','nemu'],['moon','luno'],['mint','yuzu'],['violet','ember']]){await p.locator(`[data-letter=${letter}]`).click();await pause(250);await p.locator(`[data-mailbox=${guest}]`).click();await pause(600);}
 await shot('delivered');await p.locator('[data-action=check-mail]').click();await shot('ending');
 const coins=await p.evaluate(()=>JSON.parse(localStorage.getItem('midnight-check-in.save.v1')).coins);if(coins!==4550)throw Error('Unexpected reward '+coins);
 const video=p.video();await c.close();const source=await video.path(),mp4=path.join(out,'revision17-gameplay.mp4');
 execFileSync('ffmpeg',['-y','-loglevel','error','-i',source,'-an','-c:v','libx264','-threads','2','-vf','scale=in_range=pc:out_range=tv,format=yuv420p','-color_range','tv','-crf','22','-movflags','+faststart',mp4]);
 execFileSync('ffmpeg',['-y','-loglevel','error','-ss',String(Math.max(0,trackAt-1)),'-i',mp4,'-t','10','-filter_complex','fps=15,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer','-loop','0',path.join(out,'revision17-gameplay.gif')]);
 console.log(execFileSync('ffprobe',['-v','error','-show_entries','stream=codec_name,pix_fmt,nb_frames','-show_entries','format=duration','-of','json',mp4],{encoding:'utf8'}));if(errors.length)throw Error(errors.join('\n'));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
