import Phaser from 'phaser';
import { HotelScene } from './game/HotelScene';
import './style.css';
import { attachDisplay, displayDensity } from './game/display';
import { StoryScene } from './game/StoryScene';
function boot() {
const density = displayDensity();
const game = new Phaser.Game({ type: Phaser.AUTO, parent: 'game', backgroundColor: '#100e25', scale: { mode: Phaser.Scale.NONE, width: Math.round(window.innerWidth * density), height: Math.round(window.innerHeight * density), zoom: 1 / density }, scene: [HotelScene, StoryScene], render: { antialias: true }, input: { activePointers: 2 } });

if (game.isBooted) attachDisplay(game); else game.events.once(Phaser.Core.Events.READY, () => attachDisplay(game));

}
// Load bundled rounded glyphs before Phaser caches its text textures.
const skinsReady = ['frame', 'gold-button', 'nameplate'].map(name => { const skin = new Image(); skin.src = `/art/ui/${name}.png`; return skin.decode().catch(() => undefined); });
void Promise.all([document.fonts.load('18px GameNumbers', '0123456789').catch(() => []), document.fonts.load('16px GameRounded', '怪物旅館MONSTER HOTEL').catch(() => []), ...skinsReady]).then(boot);
