import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: vi.fn(() => true) } }));
vi.mock('@capacitor/haptics', () => ({ Haptics: { impact: vi.fn(async () => {}), notification: vi.fn(async () => {}) }, ImpactStyle: { Light: 'LIGHT' }, NotificationType: { Success: 'SUCCESS', Warning: 'WARNING' } }));
import { Capacitor } from '@capacitor/core';
import { Haptics } from '@capacitor/haptics';
import { Feedback } from '../src/platform/feedback';
let starts = 0;
class FakeAudio {
  state = 'suspended'; currentTime = 0; destination = {};
  resume = vi.fn(async () => { this.state = 'running'; });
  suspend = vi.fn(async () => { this.state = 'suspended'; });
  close = vi.fn(async () => { this.state = 'closed'; });
  createGain() { return { gain: { value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), setTargetAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn() }; }
  createOscillator() { return { frequency: { value: 0 }, connect: vi.fn(), disconnect: vi.fn(), start: () => { starts++; }, stop: vi.fn(), type: 'sine', onended: null }; }
}
let instances: FakeAudio[];
let listeners: Map<string, Set<() => void>>;
let doc: { hidden: boolean; addEventListener: (type: string, cb: () => void) => void; removeEventListener: (type: string, cb: () => void) => void };
let feedback: Feedback;
const emit = (type: string) => listeners.get(type)?.forEach(fn => fn());
const settle = async () => { await Promise.resolve(); await Promise.resolve(); };
beforeEach(() => {
  vi.useFakeTimers(); starts = 0; instances = []; listeners = new Map();
  doc = { hidden: false, addEventListener: (type, cb) => { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type)!.add(cb); }, removeEventListener: (type, cb) => { listeners.get(type)?.delete(cb); } };
  vi.stubGlobal('document', doc);
  vi.stubGlobal('AudioContext', class extends FakeAudio { constructor() { super(); instances.push(this); } });
  vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
  feedback = new Feedback();
});
afterEach(() => { feedback.dispose(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.clearAllMocks(); });
describe('offline audio lifecycle', () => {
  it('does not create audio before a gesture and avoids duplicate music loops', async () => {
    expect(instances).toHaveLength(0); emit('pointerdown'); await settle(); expect(instances).toHaveLength(1);
    const initial = starts; emit('pointerdown'); emit('keydown'); await settle(); expect(starts).toBe(initial);
    vi.advanceTimersByTime(1400); expect(starts).toBe(initial + 2);
  });
  it('respects music and effects switches independently', async () => {
    emit('pointerdown'); await settle(); feedback.setPreferences({ music: false, sound: false, haptics: false });
    expect(instances[0].suspend).toHaveBeenCalled();
    const muted = starts; vi.advanceTimersByTime(5000); feedback.play('success'); expect(starts).toBe(muted);
    feedback.setPreferences({ music: false, sound: true, haptics: false }); await settle(); feedback.play('place'); expect(starts).toBeGreaterThan(muted);
    const after = starts; vi.advanceTimersByTime(5000); expect(starts).toBe(after);
  });
  it('pauses in the background, resumes once and releases resources', async () => {
    emit('pointerdown'); await settle(); doc.hidden = true; emit('visibilitychange');
    expect(instances[0].suspend).toHaveBeenCalled(); const paused = starts; vi.advanceTimersByTime(5000); expect(starts).toBe(paused);
    doc.hidden = false; emit('visibilitychange'); await settle(); expect(starts).toBeGreaterThan(paused);
    feedback.dispose(); const disposed = starts; vi.advanceTimersByTime(5000); emit('pointerdown'); expect(starts).toBe(disposed);
    expect(instances[0].close).toHaveBeenCalled(); expect(listeners.get('pointerdown')?.size).toBe(0);
  });
});
describe('haptic adapters', () => {
  it('uses native feedback only when enabled and tolerates device failure', async () => {
    await feedback.pulse('place'); expect(Haptics.impact).not.toHaveBeenCalled();
    feedback.setPreferences({ music: false, sound: false, haptics: true });
    await feedback.pulse('place'); expect(Haptics.impact).toHaveBeenCalledWith({ style: 'LIGHT' });
    await feedback.pulse('success'); expect(Haptics.notification).toHaveBeenCalledWith({ type: 'SUCCESS' });
    vi.mocked(Haptics.impact).mockRejectedValueOnce(new Error('unsupported')); await expect(feedback.pulse('place')).resolves.toBeUndefined();
    doc.hidden = true; await feedback.pulse('error'); expect(Haptics.notification).toHaveBeenCalledTimes(1);
  });
  it('falls back to browser vibration without requiring hardware', async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false); const vibrate = vi.fn(); vi.stubGlobal('navigator', { vibrate });
    feedback.setPreferences({ music: false, sound: false, haptics: true }); await feedback.pulse('place'); expect(vibrate).toHaveBeenCalledWith(12);
    await feedback.pulse('tap'); expect(vibrate).toHaveBeenCalledTimes(1);
    vi.stubGlobal('navigator', {}); await expect(feedback.pulse('success')).resolves.toBeUndefined();
  });
});
