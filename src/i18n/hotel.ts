import type { DecorationId } from '../domain/decorations';
import type { Locale } from './catalog';
export const hotelUI = {
  en: { shop: 'Hotel boutique', settings: 'Settings', owned: 'Owned', equipped: 'Displayed', buy: 'Buy', equip: 'Display', hide: 'Put away', coins: 'coins', back: 'Close', music: 'Music', sound: 'Sound effects', haptics: 'Haptics', test: 'Test sound & haptics', audioNote: 'Sound starts after you interact and pauses while the app is in the background. Haptics depend on your device.', saved: 'Settings saved.', session: 'Storage unavailable. Changes apply for this session only.', bought: 'Purchased and displayed in your hotel!', insufficient: 'Not enough coins. Complete more challenges to earn coins.', already: 'You already own this decoration.', displayed: 'Hotel decoration updated.', intro: 'Earn coins by completing nights. Decorations change appearance only, never puzzle rules.', },
  'zh-Hant': { shop: '布置商店', settings: '設定', owned: '已擁有', equipped: '展示中', buy: '購買', equip: '擺放', hide: '收起', coins: '金幣', back: '關閉', music: '背景音樂', sound: '音效', haptics: '觸覺回饋', test: '測試音效與觸覺回饋', audioNote: '聲音會在你操作後開始，切到背景時暫停。觸覺回饋依裝置支援而定。', saved: '設定已儲存。', session: '目前無法儲存，只會在本次遊玩期間保留。', bought: '已購入，並擺放在旅館！', insufficient: '金幣不足，完成更多關卡就能賺取金幣。', already: '你已擁有這件裝飾。', displayed: '旅館佈置已更新。', intro: '完成關卡可賺取金幣。裝飾只改變外觀，不會影響解謎規則。', },
} as const;
export const decorationCopy: Record<Locale, Record<DecorationId, { name: string; description: string }>> = {
  en: {
    'flower-box': {name:'Blooming window boxes',description:'Big pink flowers brighten every guest room and the lobby.'},
    'rose-curtains': {name:'Rose velvet curtains',description:'A full window curtain set for all four guest rooms and the lobby.'},
    'tea-corner': {name:'Afternoon tea carts',description:'A golden tea trolley with pastries in every guest room and the lobby.'},
    'moon-lamps': { name: 'Moon lanterns', description: 'Warm crescent lanterns brighten all four guest rooms and the lobby.' },
    'velvet-rug': { name: 'Rose-heart carpets', description: 'Large rose-heart carpets with gold trim dress all four rooms and the lobby.' },
    'star-sign': { name: 'Starlight crest', description: 'Golden star garlands brighten the walls of all four rooms and the lobby.' },
  },
  'zh-Hant': {
    'flower-box': {name:'滿開窗台花箱',description:'四間客房同大廳一齊開滿大朵粉紅花。'},
    'rose-curtains': {name:'玫瑰絲絨窗簾',description:'整組玫瑰窗簾，套用四間客房同大廳。'},
    'tea-corner': {name:'甜點茶車套裝',description:'每間客房同大廳都有金色茶車同精緻甜點。'},
    'moon-lamps': { name: '月牙迎賓燈', description: '四間客房同大廳都亮起暖金月牙燈。' },
    'velvet-rug': { name: '心心迎賓地毯', description: '大張玫瑰心心地毯配金邊，鋪滿四間客房同大廳。' },
    'star-sign': { name: '星光屋徽', description: '四間客房同大廳掛上金色星徽燈串。' },
  },
};
