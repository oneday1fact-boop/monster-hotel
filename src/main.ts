import Phaser from 'phaser';
import { HotelScene } from './game/HotelScene';
import './style.css';
new Phaser.Game({ type: Phaser.AUTO, parent: 'game', backgroundColor: '#100e25', scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 844, height: 480 }, scene: [HotelScene], render: { antialias: true }, input: { activePointers: 2 } });
