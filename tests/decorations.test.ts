import { describe, expect, it } from 'vitest';
import { decorations, purchase, toggleDecoration } from '../src/domain/decorations';
import { decorationCopy } from '../src/i18n/hotel';
describe('cosmetic economy', () => {
  it('spends the exact price, equips the item and preserves campaign progress', () => {
    const save = { version: 1, coins: 100, completed: [1, 2] };
    const result = purchase(save, 'moon-lamps');
    expect(result.status).toBe('bought'); expect(result.wallet).toEqual({ ...save, coins: 0, decorations: ['moon-lamps'], equipped: ['moon-lamps'] });
    expect(save.coins).toBe(100);
  });
  it('blocks duplicate, unaffordable and unknown purchases without mutation', () => {
    const save = { coins: 100 }; const owned = purchase(save, 'moon-lamps').wallet;
    expect(purchase(owned, 'moon-lamps').wallet).toBe(owned);
    expect(purchase(save, 'velvet-rug')).toEqual({ wallet: save, status: 'insufficient' });
    expect(purchase(save, 'unknown')).toEqual({ wallet: save, status: 'unknown' });
  });
  it('can put away and redisplay owned decorations for free', () => {
    const owned = purchase({ coins: 100 }, 'moon-lamps').wallet;
    const hidden = toggleDecoration(owned, 'moon-lamps'); expect(hidden.equipped).toEqual([]); expect(hidden.coins).toBe(0);
    expect(toggleDecoration(hidden, 'moon-lamps').equipped).toEqual(['moon-lamps']);
    expect(toggleDecoration(hidden, 'star-sign')).toBe(hidden);
  });
  it('makes the entire collection affordable within the campaign', () => {
    let save: { coins: number; decorations?: ('moon-lamps' | 'velvet-rug' | 'star-sign')[] } = { coins: 1000 };
    for (const item of decorations) save = purchase(save, item.id).wallet;
    expect(save.coins).toBe(50); expect(save.decorations).toHaveLength(6);
    for (const locale of ['en', 'zh-Hant'] as const) for (const item of decorations) expect(decorationCopy[locale][item.id].name).not.toBe('');
  });
});
