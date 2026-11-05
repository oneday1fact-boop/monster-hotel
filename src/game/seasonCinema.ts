import Phaser from 'phaser';
import { chapterLevels, chapterPairs, type ChapterId } from '../domain/storyChapters';
import { guestById } from '../domain/puzzle';
import type { StoryChoice } from '../domain/storyNight';
import { drawMonster } from './drawMonster';
import { reducedMotion } from './art';
import { celebrate } from './storyProps';
export function seasonCinema(scene: Phaser.Scene, chapter: 4|5|6, introDone: () => void) {
  const pair=chapterPairs[chapter];const ordered=[...pair,...chapterLevels[chapter].guests.map(g=>g.id).filter(id=>!pair.some(p=>p===id))];
  const actors=ordered.map((id,i)=>drawMonster(scene,[250,565,75,750][i],[220,220,245,235][i],guestById(id)).setScale(i<2?1.25:.72).setData('viewportAspect',true));
  const pose=(actor:Phaser.GameObjects.Container,p:number)=>(actor.getData('setPose') as (p:number)=>void)(p);
  actors.forEach((a,i)=>pose(a,i===0?0:1));
  const props=scene.add.graphics();const clock={t:0};let effect:StoryChoice|undefined;
  const paint=()=>{
    props.clear();if(!effect)return;const t=clock.t;
    if(chapter===4){
      if(effect==='play'){
        props.lineStyle(9,0x7c3850).beginPath().moveTo(actors[0].x+20,actors[0].y-5);
        for(let i=1;i<=30;i++)props.lineTo(actors[0].x+20+i*5,actors[0].y+Math.sin(i/6+t*9)*11+8);props.strokePath();
        for(let i=0;i<4;i++)props.fillStyle(0xffdfa2,.45).fillEllipse(405+i*19,245-((t*110+i*13)%75),4,12);
      }else{
        props.fillStyle(0x79424d).fillRoundedRect(325,270,180,10,5);
        for(const x of [355,410,465]){props.fillStyle(0xffdec1).fillRoundedRect(x-12,245,24,25,7);props.lineStyle(3,0xd5a86a).strokeCircle(x+13,255,7);props.fillStyle(0xa56a4a).fillEllipse(x,246,18,4);}
      }
    }else if(chapter===5){
      for(let i=0;i<7;i++){
        const angle=i*Math.PI*2/7+t*5;const spread=effect==='together'?40+t*130:28;
        const x=410+Math.cos(angle)*spread;const y=215+Math.sin(angle)*28-t*(effect==='together'?80:12);
        props.lineStyle(2,0xb2dced,.65).strokeCircle(x,y,10+i%3*3);props.fillStyle(0xffe2a0).fillTriangle(x,y-7,x-6,y+4,x+6,y+4);
      }
      if(effect==='play')props.lineStyle(5,0xf1b7d5).lineBetween(actors[1].x-30,actors[1].y,410,215+Math.sin(t*14)*9);
    }else if(effect==='together'){
      props.fillStyle(0xf1f7ff).fillCircle(420,264,38).fillCircle(420,219,26);props.lineStyle(3,0x665174).strokeCircle(420,264,38).strokeCircle(420,219,26);
      props.fillStyle(0x594366).fillCircle(412,216,3).fillCircle(429,216,3);props.fillStyle(0xe39a61).fillTriangle(419,222,419,229,434,226);props.lineStyle(8,0xcb6e75).lineBetween(397,241,444,241);
      props.fillStyle(0xffdf97).fillTriangle(420,173,412,188,429,188);
    }else{
      props.lineStyle(4,0xffe8b7,.8).strokeRoundedRect(175,115,500,170,22);
      props.fillStyle(0xffffff,Math.max(0,1-Math.abs(t-.6)*12)*.65).fillRect(175,115,500,170);
    }
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE,paint);props.once('destroy',()=>scene.events.off(Phaser.Scenes.Events.UPDATE,paint));
  let intro:Phaser.Time.TimerEvent|undefined;const ready=()=>{intro?.remove();introDone();};
  if(reducedMotion())ready();else intro=scene.time.delayedCall(1000,ready);
  return {skipIntro:ready,choose(choice:StoryChoice,done:()=>void){
    effect=choice;
    if(reducedMotion()){clock.t=.75;actors.forEach(a=>pose(a,3));paint();done();return;}
    scene.tweens.add({targets:clock,t:1,duration:4200,onUpdate:paint});
    actors.forEach((a,i)=>{pose(a,i<2?1:3);scene.tweens.add({targets:a,y:a.y-(chapter===5?7:14),angle:i%2?4:-4,duration:550+i*40,yoyo:true,repeat:2,ease:'Sine.easeInOut'});});
    if(chapter===4&&choice==='play')scene.tweens.add({targets:actors[0],x:300,duration:1300,yoyo:true,ease:'Sine.easeInOut'});
    if(chapter===5&&choice==='together')scene.tweens.add({targets:actors[0],y:200,duration:1200,yoyo:true,ease:'Sine.easeInOut'});
    if(chapter===6)actors.forEach((a,i)=>scene.tweens.add({targets:a,x:[290,540,210,630][i],duration:1000,ease:'Sine.easeInOut'}));
    scene.time.delayedCall(4200,()=>{actors.forEach(a=>{pose(a,3);celebrate(scene,a.x,a.y-50);});scene.time.delayedCall(700,done);});
  }};
}
