#!/usr/bin/env node
// Capture the real, fresh-save seven-stage route, including all puzzle interactions.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process'),{chromium}=require('@playwright/test');
(async()=>{
 const out=path.resolve(__dirname,'../artifacts');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const c=await browser.newContext({viewport:{width:1280,height:720},recordVideo:{dir:path.join(out,'revision16-source'),size:{width:1280,height:720}}});
  await c.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return t.includes('webgl')?null:get.call(this,t,...a);};});
  const p=await c.newPage();p.setDefaultTimeout(45000);const errors=[];p.on('pageerror',e=>errors.push(e.message));const began=Date.now();
  const ready=()=>p.waitForFunction(()=>document.querySelector('canvas')?.getAttribute('aria-busy')==='false');
  const shot=n=>p.screenshot({path:path.join(out,`revision16-${n}.png`)});
  const click=(x,y)=>p.mouse.click(x*1280/844,y*720/480);
  const next=async()=>{await p.getByRole('button',{name:'下一關',exact:true}).click();await ready();};
  const pause=()=>p.waitForTimeout(220);
  await p.goto(process.env.REVIEW_URL||'http://127.0.0.1:5175');await ready();await click(590,330);
  await p.locator('[data-action=challenges]').click();await shot('map');await p.locator('.challenge-node[data-challenge=puzzle-1]').click();
  await p.locator('[data-action=welcome-guests]').click();await ready();await p.waitForTimeout(600);
  for(const[i,target]of[[0,[203,136]],[1,[203,300]],[2,[641,300]],[3,[641,136]]]){await click([88,210,332,454][i],407);await click(...target);await ready();}
  await p.locator('[data-action=check-in]').click();await click(422,398);await ready();
  for(const id of['footprints','icing','ribbon']){await p.locator(`[data-evidence=${id}]`).click();await pause();}
  await p.locator('[data-suspect=rollo]').click();await next();await shot('roads');
  for(const i of[15,11,7,6,10,14,13,12,8,4,0,1,5,9,13,14]){await p.locator(`[data-tile="${i}"]`).click();await pause();}
  await shot('joined-road');await p.locator('[data-action=send-luggage]').click();await ready();await next();await shot('comparison');
  for(const id of['lamp','crest','key','rug','parcel']){await p.locator(`[data-world=dream] [data-difference=${id}]`).click();await pause();}
  await next();await shot('lift');
  for(const[id,side]of[['b','left'],['d','left'],['e','left'],['a','right'],['c','right'],['f','right']]){await p.locator(`[data-bag=${id}]`).click();await p.locator(`[data-pan=${side}]`).click();await pause();}
  await shot('balanced');await p.locator('[data-action=check-lift]').click();await next();await shot('mirrors');
  const mirrorAt=(Date.now()-began)/1000;
  for(const i of[0,1,2,3,4]){await p.locator(`[data-mirror="${i}"]`).click();await p.waitForTimeout(800);}
  await shot('moonlight');await p.locator('[data-action=check-mirrors]').click();await next();await shot('gifts');
  for(const[id,cell,r]of[['a',0,0],['b',5,0],['c',1,0],['d',11,3],['e',12,0]]){await p.locator(`[data-gift=${id}]`).click();for(let n=0;n<r;n++)await p.locator('[data-action=rotate-gift]').click();await p.locator(`[data-gift-cell="${cell}"]`).click();await p.waitForTimeout(500);}
  await shot('packed');await p.locator('[data-action=check-gifts]').click();await shot('ending');
  const coins=await p.evaluate(()=>JSON.parse(localStorage.getItem('midnight-check-in.save.v1')).coins);if(coins!==3050)throw Error(`Unexpected rewards ${coins}`);
  const video=p.video();await c.close();const source=await video.path(),mp4=path.join(out,'revision16-gameplay.mp4');
  execFileSync('ffmpeg',['-y','-loglevel','error','-i',source,'-an','-c:v','libx264','-threads','2','-vf','scale=in_range=pc:out_range=tv,format=yuv420p','-color_range','tv','-crf','22','-movflags','+faststart',mp4]);
  execFileSync('ffmpeg',['-y','-loglevel','error','-ss',String(Math.max(0,mirrorAt-1)),'-i',mp4,'-t','9','-filter_complex','fps=15,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer','-loop','0',path.join(out,'revision16-gameplay.gif')]);
  console.log(execFileSync('ffprobe',['-v','error','-count_frames','-show_entries','stream=codec_name,width,height,nb_read_frames','-of','json',mp4],{encoding:'utf8'}));if(errors.length)throw Error(errors.join('\n'));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
