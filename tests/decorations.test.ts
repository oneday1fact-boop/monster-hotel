import { describe, expect, it } from 'vitest';
import { decorations, purchase, toggleDecoration } from '../src/domain/decorations';
import { decorationCopy } from '../src/i18n/hotel';
describe('cosmetic economy', () => {
  it('spends the exact price, equips the item and preserves campaign progress', () => {
    const save = { version: 1, coins: 1200, completed: [1, 2] };
    const result = purchase(save, 'moon-lamps');
    expect(result.status).toBe('bought'); expect(result.wallet).toEqual({ ...save, coins: 0, decorations: ['moon-lamps'], equipped: ['moon-lamps'] });
    expect(save.coins).toBe(1200);
  });
  it('blocks duplicate, unaffordable and unknown purchases without mutation', () => {
    const save = { coins: 1200 }; const owned = purchase(save, 'moon-lamps').wallet;
    expect(purchase(owned, 'moon-lamps').wallet).toBe(owned);
    expect(purchase(save, 'velvet-rug')).toEqual({ wallet: save, status: 'insufficient' });
    expect(purchase(save, 'unknown')).toEqual({ wallet: save, status: 'unknown' });
  });
  it('can put away and redisplay owned decorations for free', () => {
    const owned = purchase({ coins: 1200 }, 'moon-lamps').wallet;
    const hidden = toggleDecoration(owned, 'moon-lamps'); expect(hidden.equipped).toEqual([]); expect(hidden.coins).toBe(0);
    expect(toggleDecoration(hidden, 'moon-lamps').equipped).toEqual(['moon-lamps']);
    expect(toggleDecoration(hidden, 'star-sign')).toBe(hidden);
  });
  it('makes a small collection affordable while requiring meaningful purchase choices', () => {
    let save: { coins: number; decorations?: ('moon-lamps' | 'velvet-rug' | 'star-sign')[] } = { coins: 6050 };
    for (const item of decorations) save = purchase(save, item.id).wallet;
    expect(save.coins).toBeGreaterThanOrEqual(0); expect(save.decorations!.length).toBeGreaterThan(1); expect(save.decorations!.length).toBeLessThan(6);
    for (const locale of ['en', 'zh-Hant'] as const) for (const item of decorations) expect(decorationCopy[locale][item.id].name).not.toBe('');
  });
});
