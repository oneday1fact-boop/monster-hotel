import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { readPreferences, type Preferences } from './preferences';
export type Cue = 'tap' | 'place' | 'error' | 'success' | 'purchase' | 'harvest' | 'ui';
const melody = [246.94, 293.66, 369.99, 440, 369.99, 293.66, 220, 293.66];
/** Original offline score and cues. Audio starts only in response to a user gesture. */
export class Feedback {
  preferences: Preferences = readPreferences();
  private context?: AudioContext;
  private musicGain?: GainNode;
  private effectsGain?: GainNode;
  private timer?: ReturnType<typeof setInterval>;
  private beat = 0;
  private disposed = false;
  private active = new Set<OscillatorNode>();
  constructor() {
    document.addEventListener('pointerdown', this.unlock, true);
    document.addEventListener('keydown', this.unlock, true);
    document.addEventListener('visibilitychange', this.visibility);
  }
  private unlock = () => {
    if (this.disposed || document.hidden || (!this.preferences.music && !this.preferences.sound)) return;
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.musicGain = this.context.createGain(); this.musicGain.gain.value = 0.055; this.musicGain.connect(this.context.destination);
        this.effectsGain = this.context.createGain(); this.effectsGain.gain.value = this.preferences.sound ? 0.16 : 0; this.effectsGain.connect(this.context.destination);
      }
      void this.context.resume().then(() => { if (!this.disposed && !document.hidden) this.startMusic(); }).catch(() => {});
    } catch { /* Audio unavailable: the puzzle remains fully playable. */ }
  };
  private tone(frequency: number, duration: number, delay: number, bus: GainNode, type: OscillatorType = 'sine') {
    const context = this.context; if (!context || context.state !== 'running') return;
    const oscillator = context.createOscillator(); const envelope = context.createGain(); const start = context.currentTime + delay;
    oscillator.type = type; oscillator.frequency.value = frequency;
    envelope.gain.setValueAtTime(0, start); envelope.gain.linearRampToValueAtTime(0.55, start + 0.025); envelope.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(envelope); envelope.connect(bus); this.active.add(oscillator);
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); this.active.delete(oscillator); };
    oscillator.start(start); oscillator.stop(start + duration + 0.02);
  }
  private startMusic() {
    if (!this.preferences.music || this.timer || document.hidden || this.context?.state !== 'running' || !this.musicGain) return;
    const note = () => {
      if (!this.musicGain) return;
      this.tone(melody[this.beat % melody.length], 1.1, 0, this.musicGain, 'triangle');
      if (this.beat % 4 === 0) this.tone(123.47, 1.8, 0, this.musicGain);
      this.beat++;
    };
    note(); this.timer = setInterval(note, 700);
  }
  private stopMusic() { if (this.timer) clearInterval(this.timer); this.timer = undefined; }
  private visibility = () => {
    if (document.hidden) {
      this.stopMusic();
      // Remove scheduled cues so backgrounding cannot replay stale success sounds.
      for (const oscillator of this.active) { try { oscillator.stop(); } catch { /* Already stopped. */ } }
      if (this.context) void this.context.suspend().catch(() => {});
    } else if (this.context && (this.preferences.music || this.preferences.sound)) this.unlock();
  };
  setPreferences(preferences: Preferences) {
    this.preferences = { ...preferences };
    if (this.context) {
      this.musicGain?.gain.setTargetAtTime(preferences.music ? 0.055 : 0, this.context.currentTime, 0.015);
      this.effectsGain?.gain.setTargetAtTime(preferences.sound ? 0.16 : 0, this.context.currentTime, 0.015);
    }
    if (!preferences.music) this.stopMusic();
    if (preferences.music || preferences.sound) this.unlock();
    else if (this.context) {
      for (const oscillator of this.active) { try { oscillator.stop(); } catch { /* Already stopped. */ } }
      void this.context.suspend().catch(() => {});
    }
  }
  play(cue: Cue) {
    if (!this.preferences.sound || document.hidden || !this.effectsGain || !this.context) return;
    const notes = { tap: [440], place: [523.25, 659.25], error: [220, 164.81], success: [523.25, 659.25, 783.99, 1046.5], purchase: [659.25, 880, 1046.5], harvest: [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98], ui: [392] }[cue];
    notes.forEach((frequency, index) => this.tone(frequency, cue === 'tap' ? 0.09 : 0.22, index * 0.1, this.effectsGain!));
  }
  async pulse(cue: Cue) {
    if (!this.preferences.haptics || document.hidden || cue === 'tap') return;
    try {
      if (Capacitor.isNativePlatform()) {
        if (cue === 'success' || cue === 'purchase') await Haptics.notification({ type: NotificationType.Success });
        else if (cue === 'error') await Haptics.notification({ type: NotificationType.Warning });
        else await Haptics.impact({ style: ImpactStyle.Light });
      } else if (typeof navigator.vibrate === 'function') navigator.vibrate(cue === 'success' || cue === 'purchase' ? [15, 40, 20] : 12);
    } catch { /* Unsupported hardware or browser policy: graceful no-op. */ }
  }
  dispose() {
    this.disposed = true; this.stopMusic();
    document.removeEventListener('pointerdown', this.unlock, true); document.removeEventListener('keydown', this.unlock, true); document.removeEventListener('visibilitychange', this.visibility);
    if (this.context) void this.context.close().catch(() => {});
  }
}
