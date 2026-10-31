/** Design coordinates expand to the full viewport; text and actors retain isotropic scale. */
export function viewportMetrics(width: number, height: number) {
  const x = Math.max(1, width) / 844; const y = Math.max(1, height) / 480; const unit = Math.min(x, y);
  return { x, y, unit, aspectX: unit / x, aspectY: unit / y };
}
