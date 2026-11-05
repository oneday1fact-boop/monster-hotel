import Phaser from 'phaser';
import type {DecoratedWallet,DecorationId} from '../domain/decorations';
export interface DecorPanel{x:number;y:number;width:number;height:number}
export function decorFrame(id:DecorationId):[string,string]{return id==='velvet-rug'||id==='rose-curtains'||id==='flower-box'||id==='tea-corner'?['decor-more',id]:['decor-art',id];}
function sprite(scene:Phaser.Scene,id:DecorationId,x:number,y:number,width:number,height?:number){const[key,frame]=decorFrame(id);const f=scene.textures.get(key).get(frame);return scene.add.image(x,y,key,frame).setDisplaySize(width,height??width*f.height/f.width);}
/** One purchase outfits every guest room; props are large, rendered behind guests and above room art. */
export function drawRoomDecorations(scene:Phaser.Scene,save:DecoratedWallet,p:DecorPanel){
 const sx=p.width/406,sy=p.height/160;const at=(id:DecorationId,x:number,y:number,w:number,h?:number)=>sprite(scene,id,p.x+x*sx,p.y+y*sy,w*sx,h===undefined?undefined:h*sy);
 for(const id of save.equipped??[]){
  if(id==='velvet-rug')at(id,25,54,205,48);
  if(id==='moon-lamps'){at(id,-173,18,43,110);const glow=scene.add.ellipse(p.x-173*sx,p.y-22*sy,60*sx,60*sy,0xffe3a0,.12);glow.setDepth(0);}
  if(id==='star-sign')at(id,60,-51,128,45);
  if(id==='rose-curtains')at(id,p.x<422?-74:93,-12,145,110);
  if(id==='flower-box')at(id,128,45,108,53);
  if(id==='tea-corner')at(id,-119,35,77,80);
 }
}
export function drawLobbyDecorations(scene:Phaser.Scene,save:DecoratedWallet){
 for(const id of save.equipped??[]){
  if(id==='velvet-rug')sprite(scene,id,270,430,370,112);
  if(id==='moon-lamps')for(const x of[48,406])sprite(scene,id,x,354,62,174);
  if(id==='star-sign')sprite(scene,id,325,124,250,100);
  if(id==='rose-curtains')sprite(scene,id,87,222,184,295);
  if(id==='flower-box')sprite(scene,id,348,333,180,91);
  if(id==='tea-corner')sprite(scene,id,90,395,155,166);
 }
}
