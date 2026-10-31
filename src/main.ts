import Phaser from 'phaser';
import { HotelScene } from './game/HotelScene';
import './style.css';
new Phaser.Game({ type: Phaser.AUTO, parent: 'game', backgroundColor: '#100e25', scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight }, scene: [HotelScene], render: { antialias: true }, input: { activePointers: 2 } });
