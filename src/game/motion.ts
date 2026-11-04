export function smoothUnit(x: number) { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); }
export function windowPulse(t: number, start: number, end: number, fade: number) { return smoothUnit((t - start) / fade) * smoothUnit((end - t) / fade); }
export function hopPose(t: number) {
  const active = t < .78; const cycle = active ? (t / .78 * 3) % 1 : 0;
  return { active, cycle, height: active ? Math.max(0, Math.sin(smoothUnit(cycle / .75) * Math.PI)) : 0 };
}
