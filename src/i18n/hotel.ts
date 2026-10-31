import type { DecorationId } from '../domain/decorations';
import type { Locale } from './catalog';
export const hotelUI = {
  en: { shop: 'Decorate hotel', settings: 'Settings', owned: 'Owned', equipped: 'Displayed', buy: 'Buy', equip: 'Display', hide: 'Put away', coins: 'coins', back: 'Close', music: 'Music', sound: 'Sound effects', haptics: 'Haptics', test: 'Test sound & haptics', audioNote: 'Sound starts after you interact and pauses while the app is in the background. Haptics depend on your device.', saved: 'Settings saved.', session: 'Storage unavailable. Changes apply for this session only.', bought: 'Purchased and displayed in your hotel!', insufficient: 'Not enough coins. Complete more nights to earn coins.', already: 'You already own this decoration.', displayed: 'Hotel decoration updated.', intro: 'Earn coins by completing nights. Decorations change appearance only, never puzzle rules.', },
  'zh-Hant': { shop: '佈置旅館', settings: '設定', owned: '已擁有', equipped: '展示中', buy: '購買', equip: '擺放', hide: '收起', coins: '金幣', back: '關閉', music: '背景音樂', sound: '音效', haptics: '觸覺回饋', test: '測試音效與觸覺回饋', audioNote: '聲音會在你操作後開始，切到背景時暫停。觸覺回饋依裝置支援而定。', saved: '設定已儲存。', session: '目前無法儲存，只會在本次遊玩期間保留。', bought: '已購入，並擺放在旅館！', insufficient: '金幣不足，完成更多夜晚就能賺取金幣。', already: '你已擁有這件裝飾。', displayed: '旅館佈置已更新。', intro: '完成夜晚可賺取金幣。裝飾只改變外觀，不會影響解謎規則。', },
} as const;
export const decorationCopy: Record<Locale, Record<DecorationId, { name: string; description: string }>> = {
  en: {
    'moon-lamps': { name: 'Moon lanterns', description: 'Two glowing crescent lanterns welcome travelers beside the entrance.' },
    'velvet-rug': { name: 'Royal velvet rug', description: 'A plum velvet runner with golden trim leads guests to the front door.' },
    'star-sign': { name: 'Starlight crest', description: 'A golden star crest and tiny lights crown the hotel roof.' },
  },
  'zh-Hant': {
    'moon-lamps': { name: '月牙迎賓燈', description: '大門兩側亮起暖金月牙燈，迎接每位午夜旅客。' },
    'velvet-rug': { name: '皇家絲絨地毯', description: '梅紫絲絨搭配金色滾邊，為旅館大門添一點氣派。' },
    'star-sign': { name: '星光屋徽', description: '屋頂掛上金色星徽與小燈，讓遠方住客也看見旅館。' },
  },
};
