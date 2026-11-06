import { photoWallContent } from './photoWall';
import { fitPhotoFrames } from './guestPuzzleWidgets';
import { celebrateReward } from './rewardFx';
import Phaser from 'phaser';
import {arrivalIntroduction} from './arrivalIntro';
import { displayDensity } from './display';
import { drawToyBasket } from './storyProps';

import type { ChapterId } from '../domain/storyChapters';
import { storyBonds } from '../domain/storyNight';
import { showChallengeSelection } from './challengeSelection';
import { challenges, challengeUnlocked, challengeProgress, afterChallenge, type Challenge } from '../domain/campaign';
import { buyScene, ownedScenes, scenePrices } from '../domain/sceneryShop';
import { lobbyAmbience, type Ambience } from '../domain/ambience';
import { drawRoomDecorations } from './roomDecor';
import { chapterIds, chapterLevels } from '../domain/storyChapters';
import { drawReception, receptionFrame } from './reception';
import { tutorialView } from '../domain/tutorial';
import { readTutorialDone, saveTutorialDone } from '../platform/tutorial';
import { tutorialUI } from '../i18n/tutorial';
import { firstLevel, place, validate, type Assignment, type Guest, type Room, type Level } from '../domain/puzzle';
import { levels, levelTitle, isUnlocked } from '../domain/levels';
import { campaignUI, roomLabel, ruleText } from '../i18n/rules';

import { isDecoration, decorations, purchase, toggleDecoration } from '../domain/decorations';
import { hotelUI } from '../i18n/hotel';
import { shopContent, settingsContent, languageContent, type ShopTab } from './hotelMenus';
import { Feedback } from '../platform/feedback';
import { savePreferences } from '../platform/preferences';
import { createHUD } from './hud';
import { svgMarkup } from './icons';
import { roomConditions, type Condition } from '../domain/puzzle';
import { getHint } from '../domain/hints';
import { ui, conditions, characters, readLocale, saveLocale, type Locale } from '../i18n/catalog';
import { showDetails, type Details } from './details';
import { viewportMetrics } from './viewport';
import { drawRoomLife } from './roomLife';
import { queueX, queueY, roomPoint, residentPoint, roomStyle, floorName, roomWidth, roomHeight } from './layout';
import { roomDesign, dollhouseUI } from '../i18n/dollhouse';
import { registerArt, roomFrame, portrait, roomPortrait, reducedMotion } from './art';
import { drawMonster } from './drawMonster';
import { readSave, complete, writeSave, type Save } from '../platform/save';

const C = { ink: 0x100e25, panel: 0x24203e, gold: 0xf2cc83, muted: '#b9b0ce', white: '#fff3df' };
export class HotelScene extends Phaser.Scene {
  private save!: Save;
  private hud?: ReturnType<typeof createHUD>;
  private earnedCoins = 0;
  private tutorialDismissed = readTutorialDone();
  private viewportWidth = 0;
  private viewportHeight = 0;
  private feedback = new Feedback();
  private get ht() { return hotelUI[this.locale]; }
  private assignment: Assignment = {};
  private selected?: string;
  private message = '';
  private locale: Locale = readLocale();
  private albumRoot?: HTMLElement;
  private rewardFx?: () => void;
  private screen: 'title' | 'lobby' | 'play' | 'win' | 'selection' = 'title';
  private hintStage = 0;
  private arriving?: string;
  private queueArrival = false;
  private level: Level = firstLevel;
  private get ct() { return campaignUI[this.locale]; }
  private dismissDetails?: () => void;
  private get t() { return ui[this.locale]; }
  constructor() { super('hotel'); }
  preload() {
    this.game.canvas.setAttribute('aria-busy','true');
    this.text(422, 230, this.locale === 'en' ? 'Lighting the hotel…' : '正在點亮旅館…', 24);
    for (const [condition, symbol] of Object.entries({ moonlight: 'moon', quiet: 'quiet', warm: 'flame', dry: 'sun' } as const)) {
      this.load.svg(`condition-${condition}`, `data:image/svg+xml;base64,${btoa(svgMarkup(symbol).replaceAll('currentColor', '#ffe3a4'))}`);
    }
    this.load.image('evidence-props','/art/evidence-props.png');
    this.load.image('episode-props','/art/episode-props.png');
    this.load.image('decor-more','/art/decor-more.png');
    this.load.image('decor-art', '/art/decorations.png');
    this.load.image('ui-gold-button', '/art/ui/gold-button.png');
    this.load.image('guests-art', '/art/guests-cartoon.png');
    for (const kind of ['werewolf', 'jiangshi', 'lantern', 'mummy', 'fox', 'baku']) this.load.image(`pose-${kind}`, `/art/${kind}-poses.png`);
    for (const theme of ['autumn','morning','winter']) { this.load.image(`reception-${theme}`, `/art/seasons/reception-${theme}.png`); this.load.image(`room-elegant-${theme}`, `/art/seasons/elegant-${theme}.png`); }
    for (const theme of ['autumn','winter']) this.load.image(`room-linen-${theme}`, `/art/seasons/linen-${theme}.png`);
    this.load.image('reception-art', '/art/reception.png');
    for (const style of ['elegant', 'linen', 'basement', 'hearth']) this.load.image(`room-${style}`, `/art/rooms/${style}.png`);
  }
  create() { registerArt(this); this.save = readSave(); this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.rewardFx?.(); this.feedback.dispose(); this.hud?.destroy(); this.dismissDetails?.(); }); this.title(); }
  update() {
    this.resizeViewport();
    const m = viewportMetrics(this.scale.width, this.scale.height);
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text) && !(object instanceof Phaser.GameObjects.Arc) && !object.getData('viewportAspect')) continue;
      const obj = object as Phaser.GameObjects.Text | Phaser.GameObjects.Container | Phaser.GameObjects.Arc;
      let base = obj.getData('viewportScale') as { x: number; y: number } | undefined;
      if (!base) { base = { x: obj.scaleX, y: obj.scaleY }; obj.setData('viewportScale', base); }
      obj.setScale(base.x * m.aspectX, base.y * m.aspectY);
    }
  }
  private resizeViewport() {
    const width = this.scale.width; const height = this.scale.height;
    if (width === this.viewportWidth && height === this.viewportHeight) return;
    if(this.albumRoot?.isConnected)fitPhotoFrames(this.albumRoot);
    this.viewportWidth = width; this.viewportHeight = height;
    const m = viewportMetrics(width, height);
    this.cameras.main.setViewport(0, 0, width, height).setOrigin(0, 0).setScroll(0, 0).setZoom(m.x, m.y);
    for (const object of this.children.list) {
      if (object.getData('receptionPanel') && object instanceof Phaser.GameObjects.Image) object.setFrame(receptionFrame(this, object.getData('receptionKey'))).setDisplaySize(844, 480);
      const key = object.getData('roomPanel') as string | undefined;
      if (key && object instanceof Phaser.GameObjects.Image) object.setFrame(roomFrame(this, key)).setDisplaySize(roomWidth, roomHeight);
    }
  }
  private text(x: number, y: number, text: string, size = 20, color = C.white) {
    return this.add.text(x, y, text, { fontFamily: 'GameNumbers, GameRounded, "Noto Sans TC", sans-serif', fontSize: size, color, align: 'center', lineSpacing: 6 }).setResolution(displayDensity()).setOrigin(.5);
  }
  private base(label: string) {
    this.albumRoot=undefined;
    this.rewardFx?.(); this.rewardFx = undefined;
    this.hud?.destroy(); this.hud = undefined;
    this.dismissDetails?.(); this.dismissDetails = undefined;
    this.setBusy(false);
    this.tweens.killAll(); this.children.removeAll(true);
    this.resizeViewport();
    this.cameras.main.setBackgroundColor(C.ink);
    const g = this.add.graphics();
    if (this.screen === 'play') g.fillStyle(0x191630).fillRect(0, 0, 844, 480);
    else g.fillStyle(0x191630).fillRoundedRect(12, 12, 820, 456, 28);
    for (let i = 0; i < 32; i++) { g.fillStyle(C.gold, .15 + (i % 3) * .12).fillCircle(25 + (i * 67) % 790, 35 + (i * 113) % 420, i % 2 + 1); }
    if (this.screen !== 'play' && this.screen !== 'title' && this.screen !== 'lobby') { this.text(422, 22, this.t.brand, 12, '#f2cc83'); this.text(422, 58, label, 29); }
    document.documentElement.lang = this.locale;
    this.hud = createHUD({ locale: this.locale, playing: this.screen === 'play', night: challenges.findIndex(n=>n.id===`puzzle-${this.level.id}`)+1,
      settings: () => this.settings(), language: () => this.language(), home: () => this.selection(), hint: () => this.hint(), clues: () => this.clues(),
      skipTutorial: () => this.finishTutorial(),
      check: () => this.checkGuests(), reset: () => { this.assignment = {}; this.selected = undefined; this.message = ''; this.hintStage = 0; this.queueArrival = true; this.play(); },
    });
    this.game.canvas.setAttribute('aria-label', this.screen === 'play' ? `${levelTitle(this.level.id, this.locale)}. ${dollhouseUI[this.locale].instructions}` : label);
  }
  private button(y: number, label: string, callback: () => void, width = 310, x = 422) {
    this.add.image(x, y, 'ui-gold-button').setDisplaySize(width, 64);
    this.text(x, y - 2, label, this.screen === 'title' ? 27 : 22, '#553047');
    this.add.zone(x, y, width, 48).setInteractive({ useHandCursor: true }).on('pointerdown', () => { this.feedback.play('tap'); callback(); });
  }

  private reception() {
    drawReception(this, this.screen==='title'?{...this.save,equipped:[]}:this.save, false, this.screen==='title'?'morning':lobbyAmbience(this.save));
    if (this.save.storyNight) drawToyBasket(this, 258, 436, .85);
    const latest = [...chapterIds].reverse().find(id => id >= 4 && this.save.stories?.[id as 4|5|6]);
    const arrivals = this.screen === 'lobby' && latest ? chapterLevels[latest].guests : this.level.guests;
    arrivals.forEach((guest, index) => {
      const x = [100, 201, 303, 390][index]; const y = [386, 396, 382, 402][index];
      const actor = this.monster(x, y, guest).setScale(index === 2 ? .69 : .78);
      if (this.save.storyNight && guest.kind === 'werewolf' && !reducedMotion()) {
        const ball = this.add.container(256, 417, [this.add.circle(0, 0, 10, 0xf2cc83).setStrokeStyle(2, 0x67405b), this.add.star(0, 0, 5, 2, 5, 0x9b7ec7)]).setData('viewportAspect', true);
        const pose = (p: number) => (actor.getData('setPose') as (pose: number) => void)?.(p);
        this.tweens.chain({ targets: actor, loop: -1, loopDelay: 2200, tweens: [
          { x: 220, y: 394, duration: 850, delay: 1400, ease: 'Sine.easeInOut', onStart: () => pose(2) },
          { x: 238, y: 397, duration: 350, hold: 450, ease: 'Sine.easeInOut', onStart: () => {
            pose(1); this.tweens.chain({ targets: ball, tweens: [{ x: 202, y: 375, angle: -100, duration: 400, ease: 'Sine.easeOut' }, { x: 172, y: 416, angle: -190, duration: 450, ease: 'Bounce.easeOut' }, { x: 256, y: 417, angle: 0, duration: 750, ease: 'Sine.easeInOut' }] });
          } },
          { x: 170, y: 390, duration: 600, ease: 'Sine.easeInOut', onStart: () => pose(2) },
          { x, y, duration: 650, hold: 900, ease: 'Sine.easeInOut', onComplete: () => pose(3) },
        ] });
      }
      actor.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
        this.feedback.play('tap');
        const bond = storyBonds(this.save); const amount = guest.id === 'luno' ? bond.luno : guest.id === 'rollo' ? bond.rollo : 0;
        const heart = this.text(actor.x, actor.y - 45, amount ? `♥ ${amount}/5` : '♥', 20, '#ffc3d4').setDepth(10);
        if (reducedMotion()) this.time.delayedCall(650, () => heart.destroy());
        else this.tweens.add({ targets: heart, y: actor.y - 68, alpha: 0, duration: 850, onComplete: () => heart.destroy() });
      });
    });
  }
  private title() {
    this.screen = 'title'; this.base(this.t.title); this.reception();
    this.hud?.coverLogo();
    this.button(330, this.locale === 'en' ? 'Play' : '開始遊戲', () => this.lobby(), 210, 590);
  }
  private lobby() {
    this.screen='lobby';this.base(this.t.welcome);this.reception();
    this.text(590,133,this.t.welcome,27,'#fff0c6');this.text(590,181,`${this.save.coins} ${this.t.coins}  ·  ${this.locale==='en'?'Cleared':'已完成'} ${challengeProgress(this.save)}`,18,'#fff0c6');
    const menu=document.createElement('nav');menu.className='lobby-menu';
    const add=(label:string,action:string,callback:()=>void,primary=false)=>{const b=document.createElement('button');b.className=primary?'game-primary-button':'game-secondary-button';b.dataset.action=action;b.textContent=label;b.onclick=callback;menu.append(b);};
    add(this.locale==='en'?'Puzzles':'解謎挑戰','challenges',()=>this.selection(),true);
    add(this.locale==='en'?'Shop':this.ht.shop,'shop',()=>this.shop());add(this.locale==='en'?'Cover':'返回封面','cover',()=>this.title());add(this.locale==='en'?'Memories':'酒店相牆','photos',()=>this.photoWall());this.hud?.append(menu);
  }
  private photoWall(){
    const root=photoWallContent(this.save,this.locale);this.albumRoot=root;
    this.details({kind:'card',title:this.locale==='en'?'Hotel memory wall':'酒店相牆',eyebrow:'',sections:[],close:this.ht.back,content:root},()=>{this.albumRoot=undefined;});fitPhotoFrames(root);
  }
  private launchChallenge(node:Challenge) {
    if(!challengeUnlocked(this.save,node.id))return;this.game.canvas.dataset.challenge=node.id;this.dismissDetails?.();this.dismissDetails=undefined;
    if(node.kind==='puzzle'){this.startNight(node.puzzle);return;}
    this.hud?.visible(false);this.scene.launch('episode',{episode:node.episode,locale:this.locale,feedback:this.feedback,save:this.save,onExit:(save:Save,locale:Locale,destination='lobby')=>{
      this.scene.wake('hotel');this.save=save;this.locale=locale;
      if(destination==='next'){const next=afterChallenge(node.id);if(next){this.launchChallenge(next);return;}}
      if(destination==='map'){this.lobby();this.selection();}else this.lobby();
    }});this.scene.sleep('hotel');
  }
  private selection() {
    this.input.enabled=false;this.hud?.visible(false);this.dismissDetails?.();
    this.dismissDetails=showChallengeSelection(this.locale,this.save,node=>this.launchChallenge(node),()=>this.lobby());
  }
  private startNight(id: number) {
    if (!challengeUnlocked(this.save,`puzzle-${id}`)) return;
    const level = levels.find(l => l.id === id); if (!level) return;
    this.level = level; this.assignment = {}; this.message = ''; this.selected = undefined; this.hintStage = 0; this.queueArrival = true;
    if(id===1&&!this.save.completed.includes(1)){this.lobby();this.input.enabled=false;this.hud?.visible(false);this.dismissDetails=showDetails({kind:'card',title:this.locale==='en'?'The hotel’s opening night':'旅館開門第一晚',eyebrow:'',close:this.locale==='en'?'Back':'返回',sections:[],content:arrivalIntroduction(this.locale,()=>{this.dismissDetails?.();this.dismissDetails=undefined;this.play();})},()=>{this.lobby();this.selection();});return;}this.play();
  }
  private monster(x: number, y: number, guest: Guest, activity: 'queue' | 'room' = 'queue') {
    return drawMonster(this, x, y, guest, activity).setData('viewportAspect', true);
  }

  private setBusy(busy: boolean) {
    this.input.enabled = !busy; this.hud?.busy(busy);
    this.game.canvas.setAttribute('aria-busy', String(busy));
    if (busy) this.hud?.tutorial(undefined, this.assignment); else if (this.screen === 'play') this.updateTutorial();
  }
  private play() {
    this.screen = 'play';
    this.base(`${String(this.level.id).padStart(2, '0')} · ${levelTitle(this.level.id, this.locale)}`);
    if (this.message) this.hud?.show(this.message);
    const status = { setText: (message: string) => this.hud?.show(message) };
    drawReception(this, this.save, false,lobbyAmbience(this.save));
    const frame = this.add.graphics();
    frame.fillStyle(0x574057).fillRect(0, 56, 844, 324);
    frame.lineStyle(3, 0xb18a70).strokeRect(0, 56, 844, 324);
    frame.fillStyle(0x3d2a43).fillRect(406, 56, 32, 324).fillRect(0, 216, 844, 4);
    frame.lineStyle(2, 0xb28c72);
    for (let y = 88; y < 337; y += 17) frame.lineBetween(413, y, 431, y - 10);
    const wishes=document.createElement('div');wishes.className='classic-wishes';wishes.setAttribute('aria-label',this.locale==='en'?'Tap a guest, then a room':'點住客，再點房間');for(const label of (this.locale==='en'?['Luno: moonlight','Dou: quiet','Ember: warm','Rollo: dry']:['月毛要月光','豆豆要安靜','燈燈要溫暖','卷卷要乾爽'])){const tag=document.createElement('span');tag.textContent=label;wishes.append(tag);}this.hud?.append(wishes);
    const selection = this.add.ellipse(0, 0, 76, 72).setStrokeStyle(2, C.gold, .8).setVisible(false).setDepth(5).setData('viewportAspect', true);
    const bindGuest = (avatar: Phaser.GameObjects.Container, guest: Guest) => {
      avatar.setInteractive({ useHandCursor: true }).setData('guest', guest.id); this.input.setDraggable(avatar);
      avatar.on('pointerdown', () => {
        this.selected = guest.id; selection.setPosition(avatar.x, avatar.y).setVisible(true); this.updateTutorial();
        if (this.assignment[guest.id] && !reducedMotion()) {
          const heart = this.text(avatar.x, avatar.y - 30, '♥', 17, '#ef9bb4').setDepth(12);
          this.tweens.add({ targets: heart, y: avatar.y - 48, alpha: 0, duration: 650, onComplete: () => heart.destroy() });
        }
        const guided = guest.kind === 'werewolf' && tutorialView(this.level.id, this.save.completed, this.tutorialDismissed, this.assignment, this.selected);
        if (guided) status.setText(''); else status.setText(`${characters[this.locale][guest.kind].name} · ${conditions[this.locale][guest.requirement].name}`);
      });
      if (this.selected === guest.id) selection.setPosition(avatar.x, avatar.y).setVisible(true);
    };
    const entering = this.queueArrival && !reducedMotion(); this.queueArrival = false;
    if (entering) this.setBusy(true);
    for (const room of this.level.rooms) {
      const p = roomPoint(room); const style = roomStyle(room);const theme=lobbyAmbience(this.save);const roomKey=style==='elegant'&&theme!=='night'?`room-elegant-${theme}`:style==='linen'&&(theme==='autumn'||theme==='winter')?`room-linen-${theme}`:`room-${style}`;
      this.add.rectangle(p.x, p.y, roomWidth, roomHeight, C.panel);
      if (this.textures.exists(roomKey)) this.add.image(p.x, p.y, roomKey, roomFrame(this, roomKey)).setDisplaySize(roomWidth, roomHeight).setData('roomPanel', roomKey);
      drawRoomDecorations(this,this.save,{x:p.x,y:p.y,width:roomWidth,height:roomHeight});
      drawRoomLife(this, room);
      this.add.rectangle(p.x,p.y-54,154,24,0x28152e,.86);
      this.text(p.x,p.y-54,roomConditions(room).map(c=>conditions[this.locale][c].name).join(' · '),15,'#fff0c6');
      this.add.rectangle(p.x - 174, p.y - 54, 54, 23, 0x34243e, .85).setStrokeStyle(1, 0xc89d6e);
      this.add.rectangle(p.x - 142, p.y + 56, 118, 22, 0x251c32, .75);
      const drop = this.add.zone(p.x, p.y, roomWidth, roomHeight).setRectangleDropZone(roomWidth, roomHeight).setData('room', room.id);
      drop.on('pointerdown', () => { if (this.selected) this.assign(this.selected, room.id); });
      this.text(p.x - 174, p.y - 54, room.id, 12, '#ffdea0');
      roomConditions(room).forEach((condition, index) => this.add.image(p.x - 180 + index * 25, p.y + 56, `condition-${condition}`).setDisplaySize(18, 18).setData('viewportAspect', true));
      this.add.circle(p.x + 158, p.y - 54, 17, 0x4e3556, .95).setStrokeStyle(2, 0xcfa66e);
      this.text(p.x + 158, p.y - 54, 'ⓘ', 18, '#f2cc83').setPadding(5).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.roomCard(room));
      const guest = this.level.guests.find(g => this.assignment[g.id] === room.id);
      if (guest) {
        const point = residentPoint(room); const actor = this.monster(point.x, point.y, guest, 'room').setScale(.94);
        bindGuest(actor, guest);
        if (this.arriving === guest.id && !reducedMotion()) {
          const index = this.level.guests.indexOf(guest); actor.setPosition(queueX[index], queueY).setDepth(10); (actor.getData('pauseActivity') as (v: boolean) => void)?.(true); this.setBusy(true);
          status.setText('');
          this.tweens.chain({ targets: actor, tweens: [
            { x: 422, y: 349, duration: 160 }, { x: 422, y: point.y, duration: 200 }, { x: point.x, y: point.y, duration: 180 },
          ], onComplete: () => { actor.setDepth(0); (actor.getData('pauseActivity') as (v: boolean) => void)?.(false); this.setBusy(false); status.setText(''); } });
        }
      }
    }
    this.arriving = undefined;
    this.level.guests.forEach((guest, i) => {
      const x = queueX[i]; const placed = !!this.assignment[guest.id];
      if (!placed) {
        this.add.ellipse(x, 433, 60, 7, 0x0a0817, .4);
        const avatar = this.monster(x, queueY, guest).setScale(.62); bindGuest(avatar, guest);
        if (entering) {
          avatar.setX(63).setAlpha(0);
          this.tweens.add({ targets: avatar, x, alpha: 1, duration: 450 + i * 80, delay: i * 150, ease: 'Sine.easeInOut', onComplete: () => { if (i === this.level.guests.length - 1) this.setBusy(false); } });
        }
      } else this.text(x, queueY, '✓', 23, '#b8cfbc');
      const c = characters[this.locale][guest.kind];
      this.text(x, queueY + 31, `${c.name} ⓘ`, 12, C.white).setPadding(2).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.guestCard(guest));
    });
    this.input.removeAllListeners('drag'); this.input.removeAllListeners('drop'); this.input.removeAllListeners('dragend');
    this.input.on('drag', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container, x: number, y: number) => { obj.setPosition(x, y); obj.setDepth(10); });
    this.input.on('drop', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container, target: Phaser.GameObjects.Zone) => this.assign(obj.getData('guest'), target.getData('room')));
    this.input.on('dragend', (_p: Phaser.Input.Pointer, _obj: Phaser.GameObjects.Container, dropped: boolean) => { if (!dropped) this.play(); });
    if (this.game.canvas.getAttribute('aria-busy') === 'false') this.updateTutorial();
  }
  private updateTutorial() {
    this.hud?.tutorial(this.screen === 'play' ? tutorialView(this.level.id, this.save.completed, this.tutorialDismissed, this.assignment, this.selected) : undefined, this.assignment);
  }
  private finishTutorial() {
    this.tutorialDismissed = true; const saved = saveTutorialDone(); this.updateTutorial();
    if (!saved) this.hud?.show(tutorialUI[this.locale].session);
  }
  private checkGuests() {
    const result = validate(this.level, this.assignment);
    if (result.valid) {
      if (this.level.id === 1 && !this.tutorialDismissed) this.finishTutorial();
      this.feedback.play('success'); void this.feedback.pulse('success'); const before = this.save.coins;
      this.save = complete(this.save, this.level.id); this.earnedCoins = this.save.coins - before; this.win();
    } else {
      this.feedback.play('error'); void this.feedback.pulse('error'); this.message = result.reason === 'incomplete' ? this.t.incomplete : result.reason === 'rule' ? this.ct.retry : this.t.mismatch; this.play();
    }
  }
  private details(data: Details, onClose?: () => void) {
    this.dismissDetails?.(); this.input.enabled = false; this.hud?.visible(false);
    this.dismissDetails = showDetails(data, () => {
      this.dismissDetails = undefined; this.input.enabled = this.screen !== 'selection'; this.hud?.visible(this.screen !== 'selection'); onClose?.();
    });
  }
  private language(fromSettings = false) {
    const title = this.locale === 'en' ? 'Language' : '語言';
    this.details({ kind: 'language', eyebrow: '', title, close: this.ht.back, sections: [], content: languageContent(this.locale, locale => {
      this.dismissDetails?.(); this.dismissDetails = undefined; this.locale = locale; saveLocale(locale); this.message = ''; this[this.screen]();
      if (fromSettings) this.settings();
    }) }, () => { if (fromSettings) this.settings(); else if (this.screen === 'selection') this.selection(); });
  }
  private settings() {
    this.details({ kind: 'settings', eyebrow: this.t.brand, title: this.ht.settings, close: this.ht.back, sections: [],
      content: settingsContent(this.locale, this.feedback.preferences, preferences => {
        this.feedback.setPreferences(preferences); return savePreferences(preferences);
      }, () => { this.feedback.play('place'); void this.feedback.pulse('place'); }, () => this.language(true)) });
  }
  private shop(message='',tab:ShopTab='decor',page=0) {
    this.details({kind:'shop',eyebrow:'',title:this.ht.shop,close:this.ht.back,sections:[],content:shopContent(this.locale,this.save,{
      page:(nextTab,nextPage)=>this.shop('',nextTab,nextPage),preview:id=>this.previewItem(id,'decor',page),scene:theme=>this.previewItem(theme,'scenes',page),
      buy:(id,owned)=>{let status=this.ht.displayed as string;if(owned)this.save=toggleDecoration(this.save,id);else{const result=purchase(this.save,id);this.save=result.wallet;status=result.status==='bought'?this.ht.bought:this.ht.insufficient;}if(!writeSave(this.save))status=this.ht.session;this.feedback.play('purchase');this.lobby();this.shop(status,tab,page);},
    },tab,page,message)});
  }
  private previewItem(id:string,tab:ShopTab,page:number) {
    this.base(this.ht.shop);this.hud?.visible(false);this.input.enabled=false;
    const root=document.createElement('nav');root.className='decoration-demo';for(const name of['pointerdown','pointerup','mousedown','mouseup','touchstart','touchend','click'])root.addEventListener(name,e=>e.stopPropagation());
    const title=document.createElement('strong');title.className='decoration-demo-title';title.textContent=this.locale==='en'?'Preview · Nothing charged':'效果預覽 · 未扣金幣';
    let shown=true;const paint=()=>{this.tweens.killAll();this.children.removeAll(true);
      const preview=tab==='decor'&&isDecoration(id)?{...this.save,equipped:shown?[...new Set([...(this.save.equipped??[]),id])]:this.save.equipped?.filter(d=>d!==id)}:this.save;
      drawReception(this,tab==='decor'?{...preview,equipped:[]}:preview,false,tab==='scenes'&&shown?id as Ambience:lobbyAmbience(this.save));
      if(tab==='decor')for(const room of firstLevel.rooms){const p=roomPoint(room),key=`room-${roomStyle(room)}`;this.add.image(p.x,p.y,key,roomFrame(this,key)).setDisplaySize(roomWidth,roomHeight).setData('roomPanel',key);drawRoomDecorations(this,preview,{...p,width:roomWidth,height:roomHeight});this.text(p.x-174,p.y-54,room.id,17,'#ffe7b7');}
    };paint();
    const controls=document.createElement('div');controls.className='decoration-demo-actions';const back=document.createElement('button');back.className='game-secondary-button';back.textContent=this.locale==='en'?'Back':'返回商店';back.onclick=()=>{this.lobby();this.shop('',tab,page);};
    const compare=document.createElement('button');compare.className='game-secondary-button';compare.dataset.action='compare';compare.textContent=this.locale==='en'?'See original':'睇原本';compare.onclick=()=>{shown=!shown;compare.textContent=shown?(this.locale==='en'?'See original':'睇原本'):(this.locale==='en'?'See preview':'睇效果');paint();};
    const apply=document.createElement('button');apply.className='game-primary-button';apply.dataset.action='confirm';const owned=tab==='decor'?isDecoration(id)&&this.save.decorations?.includes(id):ownedScenes(this.save).includes(id as Ambience);const price=tab==='decor'?decorations.find(d=>d.id===id)!.price:scenePrices[id as Ambience];apply.textContent=owned?(this.locale==='en'?'Apply':'套用'):`${this.locale==='en'?'Buy & apply':'買入並套用'} ${price}`;apply.disabled=!owned&&this.save.coins<price;
    apply.onclick=()=>{if(tab==='scenes'){const result=buyScene(this.save,id as Ambience);if(result.status==='insufficient')return;this.save=result.wallet;}else if(isDecoration(id)){if(owned){if(!this.save.equipped?.includes(id))this.save=toggleDecoration(this.save,id);}else{const result=purchase(this.save,id);if(result.status!=='bought')return;this.save=result.wallet;}}const stored=writeSave(this.save);this.feedback.play('purchase');this.lobby();this.hud?.show(stored?this.ht.bought:this.ht.session);};
    const note=document.createElement('small');note.className='preview-note';note.textContent=tab==='decor'?(this.locale==='en'?'All four rooms · Appearance only':'四間客房一齊擺放 · 不改解謎條件'):(this.locale==='en'?'Unlock a permanent hotel theme':'解鎖可自由套用嘅酒店場景');controls.append(back,compare,apply);root.append(title,note,controls);document.body.append(root);this.dismissDetails=()=>root.remove();
  }
  private guestCard(guest: Guest) {
    const c = characters[this.locale][guest.kind];
    const image = portrait(guest.kind); image.setAttribute('aria-label', `${c.name} · ${c.species}`);
    this.details({ eyebrow: this.t.guestCard, title: `${c.name} · ${c.species}`, close: this.t.close, content: image, contentFirst: true, sections: [
      { title: this.t.personality, body: c.personality }, { title: this.t.wish, body: c.wish }, { title: '', body: c.quote },
      { title: this.ct.tonight, body: this.guestRules(guest.id).map(rule => ruleText(this.level, rule, this.locale)).join('\n') || this.ct.noRules },
    ] });
  }
  private roomCard(room: Room) {
    const c = roomDesign[this.locale][roomStyle(room)];
    const image = roomPortrait(room); image.setAttribute('aria-label', c.name);
    this.details({ eyebrow: this.t.roomCard, title: `${room.id} · ${c.name}`, close: this.t.close, content: image, contentFirst: true, sections: [
      { title: this.t.condition, body: roomLabel(room, this.locale) },
      { title: '', body: c.description },
      { title: this.ct.floor, body: `${floorName(room.floor, this.locale)} · ${room.position}` }, { title: '', body: this.t.occupancy },
    ] });
  }
  private guestRules(id: string) {
    return (this.level.rules ?? []).filter(rule => 'guest' in rule ? rule.guest === id : rule.a === id || rule.b === id);
  }
  private clues() {
    this.details({ kind: 'hints', eyebrow: `${String(this.level.id).padStart(2, '0')} · ${levelTitle(this.level.id, this.locale)}`, title: this.ct.clues, close: this.t.close,
      sections: [
        { title: this.t.wish, body: this.level.guests.map(g => `${characters[this.locale][g.kind].name} · ${conditions[this.locale][g.requirement].name}`).join('\n') },
        { title: this.ct.tonight, body: this.level.rules?.length ? this.level.rules.map(rule => ruleText(this.level, rule, this.locale)).join('\n') : this.ct.noRules },
        { title: '', body: this.ct.map },
      ] });
  }
  private hint() {
    this.hintStage = Math.min(this.hintStage + 1, 3);
    const hint = getHint(this.level, this.assignment, this.hintStage);
    let body: string = this.t.hintStrategy + (this.level.rules?.length ? `\n\n${this.ct.rulesReminder}\n${this.ct.map}` : '');
    if (hint.type === 'complete') body = this.t.hintDone;
    if (hint.type === 'focus' || hint.type === 'placement') {
      const guest = this.level.guests.find(g => g.id === hint.guestId)!;
      const c = characters[this.locale][guest.kind];
      body = `${this.t.hintFocus} ${c.name}\n${c.wish}`;
      const rules = this.guestRules(guest.id);
      if (rules.length) body += `\n\n${rules.map(rule => ruleText(this.level, rule, this.locale)).join('\n')}`;
      if (hint.type === 'placement') {
        const room = this.level.rooms.find(r => r.id === hint.roomId)!;
        body += `\n\n${this.t.hintSolution} ${room.id} · ${roomDesign[this.locale][roomStyle(room)].name}`;
      }
    }
    this.details({ kind: 'hints', eyebrow: `${this.t.hintStage} ${this.hintStage}/3`, title: this.t.hintTitle, close: this.t.close,
      sections: [{ title: '', body }], next: this.hintStage < 3 && hint.type !== 'complete' ? { label: this.t.nextHint, action: () => this.hint() } : undefined });
  }
  private assign(guest: string, room: string) { this.arriving = guest; this.feedback.play('place'); void this.feedback.pulse('place'); this.assignment = place(this.assignment, guest, room); this.selected = undefined; this.message = ''; this.play(); }
  private win() {
    this.rewardFx?.();
    this.screen = 'win';
    this.base(this.t.win);
    this.text(422, 128, '✦  ✦  ✦', 38, '#f2cc83');
    this.level.guests.forEach((g, i) => { const avatar = this.monster(140 + i * 188, 230, g).setScale(.9); if (!reducedMotion()) this.tweens.add({ targets: avatar, y: 218, duration: 650 + i * 100, repeat: reducedMotion() ? 0 : -1, yoyo: true }); });
    this.text(422, 312, this.t.happy, 26);
    this.text(422, 348, `+${this.earnedCoins} ${this.t.coins}`, 21, '#f2cc83');
    const next=afterChallenge(`puzzle-${this.level.id}`);
    if(next)this.button(398,this.locale==='en'?'Next challenge':'下一關',()=>this.launchChallenge(next));
    else this.text(422,395,this.locale==='en'?'More challenges are on the way!':'更多關卡陸續加入！',20,'#f2cc83');
    this.button(450, this.ct.return, () => this.selection(), 210);
    this.rewardFx = celebrateReward(this.earnedCoins, this.save.coins, this.locale, () => { this.feedback.play('harvest'); void this.feedback.pulse('purchase'); });
  }
}
