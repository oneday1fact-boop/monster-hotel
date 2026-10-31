import { expect, it } from 'vitest';
import { viewportMetrics } from '../src/game/viewport';
it.each([[844, 480], [915, 412], [1024, 768], [390, 844]])('fills %i × %i without distorting actor/text proportions', (width, height) => {
  const m = viewportMetrics(width, height);
  expect(844 * m.x).toBeCloseTo(width); expect(480 * m.y).toBeCloseTo(height);
  expect(m.x * m.aspectX).toBeCloseTo(m.y * m.aspectY);
  expect(m.x * m.aspectX).toBeCloseTo(m.unit);
});
