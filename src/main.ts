import Phaser from 'phaser';
import { HotelScene } from './game/HotelScene';
import './style.css';
import { attachDisplay, displayDensity } from './game/display';
import { StoryScene } from './game/StoryScene';
const density = displayDensity();
const game = new Phaser.Game({ type: Phaser.AUTO, parent: 'game', backgroundColor: '#100e25', scale: { mode: Phaser.Scale.NONE, width: Math.round(window.innerWidth * density), height: Math.round(window.innerHeight * density), zoom: 1 / density }, scene: [HotelScene, StoryScene], render: { antialias: true }, input: { activePointers: 2 } });

if (game.isBooted) attachDisplay(game); else game.events.once(Phaser.Core.Events.READY, () => attachDisplay(game));
