#!/usr/bin/env node
// Real UI play. Only pre-existing progress/coins are fixtures; job progress and payments are earned through input.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const {chromium}=require('@playwright/test');
const out=path.resolve('artifacts');fs.mkdirSync(out,{recursive:true});
require('esbuild').buildSync({entryPoints:['src/domain/commissionPuzzles.ts'],bundle:true,platform:'node',format:'cjs',outfile:path.join(out,'commission-review-domain.cjs')});
const {commissionRecipe,puzzleSolution}=require(path.join(out,'commission-review-domain.cjs'));
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const c=await b.newContext({viewport:{width:1280,height:720},recordVideo:{dir:path.join(out,'commissions124-source'),size:{width:1280,height:720}}});
  await c.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return t.includes('webgl')?null:get.call(this,t,...a);};localStorage.setItem('midnight-check-in.save.v1',JSON.stringify({version:1,completed:[1],coins:4000,episodes:['cake-case']}));});
  const p=await c.newPage(),errors=[];p.setDefaultTimeout(25000);p.on('pageerror',e=>errors.push(e.message));const began=Date.now(),at=()=> (Date.now()-began)/1000,wait=n=>p.waitForTimeout(n),shot=n=>p.screenshot({path:path.join(out,`version124-${n}.png`)});
  await p.goto(process.env.REVIEW_URL||'http://127.0.0.1:5204');await p.waitForFunction(()=>document.querySelector('#game canvas')?.getAttribute('aria-busy')==='false');await p.locator('[data-action=start-game]').click();await p.locator('[data-action=my-hotel]').click();await p.locator('.my-hotel[data-ready=true]').waitFor();await wait(1400);await shot('hotel-commissions-entry');await p.locator('[data-action=hotel-commissions]').click();await wait(800);await shot('commission-board');await wait(1200);
  let clothAt=0,mirrorAt=0;const routes={};
  for(const key of ['maze:2','laundry:1','mirrors:2']){
   await p.locator(`[data-rank="${key.split(':')[1]}"]`).click();await wait(350);await p.locator(`[data-commission="${key}"]`).click();await wait(800);const recipe=commissionRecipe(key,0),route=puzzleSolution(recipe,recipe.kind==='maze'?[recipe.start,0]:recipe.start);routes[key]=route.length;await shot(recipe.kind+'-start');await wait(700);
   for(let i=0;i<route.length;i++){
    const a=route[i];
    if(a.type==='glide'){await p.locator(`[data-job-direction="${a.direction}"]`).click();await wait(220);if(i===0)await shot('maze-gliding');await wait(550);}
    else if(a.type==='turn'){if(i===0)mirrorAt=at();await p.locator(`[data-job-mirror="${a.index}"]`).click();await wait(450);}
    else{
     const item=p.locator(`[data-cloth="${a.index}"]`);await item.click();
     if(i<4){if(i===0)clothAt=at();const box=await item.boundingBox(),board=await p.locator('.commission-board').boundingBox(),horizontal=recipe.pieces[a.index].axis==='h',unit=(horizontal?board.width-18:board.height-18)/6,x=box.x+box.width/2,y=box.y+box.height/2;await p.mouse.move(x,y);await p.mouse.down();for(let n=1;n<=12;n++){await p.mouse.move(x+(horizontal?a.delta*unit*n/12:0),y+(horizontal?0:a.delta*unit*n/12));await wait(22);}if(i===0)await shot('cloth-dragging');await p.mouse.up();await wait(330);}
     else{const d=recipe.pieces[a.index].axis==='h'?(a.delta<0?3:1):(a.delta<0?0:2);await p.locator(`[data-job-direction="${d}"]`).click();await wait(280);}
    }
   }
   if(await p.locator('[data-action=commission-claim]').isDisabled())throw Error(`${key}: actual UI did not solve`);await shot(recipe.kind+'-solved');await wait(650);await p.locator('[data-action=commission-claim]').click();await p.locator('.commission-finish').waitFor();await wait(1200);await shot(recipe.kind+'-coin-harvest');await wait(2400);
   if(key==='maze:2'){await p.locator('[data-action=commission-next]').click();await wait(700);if(await p.locator('.commission-view').getAttribute('data-serial')!=='1')throw Error('No next commission');if(await p.locator('[data-action=commission-claim]').isEnabled())throw Error('Next contract was already solved');await shot('maze-next-layout');await wait(700);await p.locator('[data-action=commission-back]').click();}
   else await p.locator('[data-action=commission-selection]').click();await wait(400);
   console.log('Completed real job:',key);
  }
  await p.locator('[data-action=commission-back]').click();await p.locator('.my-hotel[data-ready=true]').waitFor();await p.locator('[data-action=hotel-estate]').click();await p.locator('.hotel-wing[data-ready=true]').waitFor();await wait(700);await shot('higher-room-prices');await p.locator('[data-estate-room=library]').click();await wait(600);await p.locator('[data-action=estate-buy]').click();await wait(1700);await p.locator('[data-action=estate-all]').click();await wait(650);await shot('earned-room-unlock');
  const save=await p.evaluate(()=>JSON.parse(localStorage.getItem('midnight-check-in.save.v1')));if(save.coins!==1120||save.hotelRooms.join()!=='library'||['maze:2','laundry:1','mirrors:2'].some(k=>save.commissions.counts[k]!==1)||save.episodes.join()!=='cake-case')throw Error('Incorrect actual payout/purchase or lost progress');if(errors.length)throw Error(errors.join('\n'));
  const video=p.video();await c.close();const mp4=path.join(out,'version124-commissions-and-hotel.mp4');execFileSync('ffmpeg',['-y','-loglevel','error','-i',await video.path(),'-c:v','libx264','-threads','2','-vf','scale=in_range=pc:out_range=tv,format=yuv420p','-color_range','tv','-crf','25','-movflags','+faststart',mp4]);
  for(const[name,time]of [['cloth-drag',clothAt],['dual-light',mirrorAt]])execFileSync('ffmpeg',['-y','-loglevel','error','-ss',String(Math.max(0,time-.2)),'-t','5','-i',mp4,'-filter_threads','2','-vf','fps=12,scale=640:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer','-loop','0',path.join(out,`version124-${name}.gif`)]);
  fs.writeFileSync(path.join(out,'version124-review.json'),JSON.stringify({save:{coins:save.coins,rooms:save.hotelRooms,counts:save.commissions.counts,episodes:save.episodes},routes,errors},null,2));console.log('Recorded:',mp4);
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
