import { expect, it } from 'vitest';
import { viewportMetrics, proportionalCrop } from '../src/game/viewport';
it.each([[844, 480], [915, 412], [1024, 768], [390, 844]])('fills %i × %i without distorting actor/text proportions', (width, height) => {
  const m = viewportMetrics(width, height);
  expect(844 * m.x).toBeCloseTo(width); expect(480 * m.y).toBeCloseTo(height);
  expect(m.x * m.aspectX).toBeCloseTo(m.y * m.aspectY);
  expect(m.x * m.aspectX).toBeCloseTo(m.unit);
});

it.each([[844, 480], [960, 432], [1024, 768]])('preserves furniture proportions when covering a %i × %i viewport', (width, height) => {
  const m = viewportMetrics(width, height); const panelWidth = 406 * m.x; const panelHeight = 132 * m.y;
  const crop = proportionalCrop(2172, 724, panelWidth, panelHeight);
  expect(panelWidth / crop.width).toBeCloseTo(panelHeight / crop.height);
  expect(crop.x).toBeGreaterThanOrEqual(0); expect(crop.y).toBeGreaterThanOrEqual(0);
  expect(crop.x + crop.width).toBeLessThanOrEqual(2172); expect(crop.y + crop.height).toBeLessThanOrEqual(724);
});

it('keeps three-pixel phone detail but caps large-screen backing buffers', async () => {
  const { renderDensity } = await import('../src/game/viewport');
  expect(renderDensity(3,915,412)).toBe(3);
  expect(renderDensity(2,844,480)).toBe(2);
  expect(renderDensity(0,844,480)).toBe(1);
  for (const [width,height] of [[1920,1080],[5120,2880],[7680,4320]]) {
    const density=renderDensity(4,width,height); expect(width*height*density*density).toBeLessThanOrEqual(8_400_001); expect(density).toBeGreaterThan(0);
  }
});
