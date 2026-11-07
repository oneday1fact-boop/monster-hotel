const {spawnSync}=require('node:child_process');const fs=require('node:fs');const path=require('node:path');
function run(cmd,args){const r=spawnSync(cmd,args,{stdio:'inherit',env:process.env});if(r.status)process.exit(r.status||1);}
run('npx',['playwright','test','--config','scripts/review-arrivals.config.ts']);
function videos(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?videos(path.join(dir,d.name)):d.name.endsWith('.webm')?[path.join(dir,d.name)]:[]);}
const video=videos('artifacts/arrivals-recording')[0];if(!video)throw Error('No real recording produced');
run('ffmpeg',['-y','-i',video,'-c:v','libx264','-preset','fast','-crf','24','-vf','scale=in_range=pc:out_range=tv','-color_range','tv','-pix_fmt','yuv420p','-movflags','+faststart','artifacts/version126-arrivals-and-chapters.mp4']);
run('ffmpeg',['-y','-ss','3','-t','5','-i','artifacts/version126-arrivals-and-chapters.mp4','-vf','fps=12,scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse','artifacts/version126-arrivals.gif']);
