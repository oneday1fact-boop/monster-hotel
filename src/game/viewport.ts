/** Design coordinates expand to the full viewport; text and actors retain isotropic scale. */
export function viewportMetrics(width: number, height: number) {
  const x = Math.max(1, width) / 844; const y = Math.max(1, height) / 480; const unit = Math.min(x, y);
  return { x, y, unit, aspectX: unit / x, aspectY: unit / y };
}

/** Cover a panel using a source crop, without changing the illustration's proportions. */
export function proportionalCrop(sourceWidth: number, sourceHeight: number, displayWidth: number, displayHeight: number) {
  const ratio = displayWidth / displayHeight;
  const width = Math.min(sourceWidth, sourceHeight * ratio); const height = width / ratio;
  return { x: (sourceWidth - width) / 2, y: (sourceHeight - height) * .6, width, height };
}

/** Preserve phone detail without allocating unbounded retina buffers on large displays. */
export function renderDensity(deviceRatio: number, width: number, height: number) {
  return Math.min(3, Math.max(1, deviceRatio || 1), Math.sqrt(8_400_000 / (Math.max(1, width) * Math.max(1, height))));
}
