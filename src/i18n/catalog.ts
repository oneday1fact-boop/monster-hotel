import type { Condition, Guest } from '../domain/puzzle';
export type Locale = 'en' | 'zh-Hant';
export const ui = {
  en: {
    brand: '✦  MIDNIGHT CHECK-IN  ✦', title: 'Monster Hotel', tagline: 'A little spooky. A lot of heart.',
    welcome: 'Welcome, keeper', promise: 'Every monster deserves\na room to call home.', open: 'Open the doors  →', adventure: 'An original midnight puzzle adventure', hotel: 'HOTEL',
    coins: 'coins', progress: 'nights complete', arrivals: 'Four guests are here.', intro: 'Match their wishes to the perfect room.\nA peaceful night is in your hands.', begin: 'Begin night 01  →', replay: 'Replay night 01  →', titleBack: 'Return to title',
    puzzle: 'A room for everyone', instructions: 'Drag to assign. Tap names for guest cards; tap ⓘ for room details.', ready: 'Four guests. Four perfect rooms.', select: 'Select a room for', needs: 'Needs', check: 'Check in all guests  ✦', lobby: '← Lobby', reset: 'Reset ↻', hint: 'Hint',
    incomplete: 'Give every guest a room first.', mismatch: 'A guest’s wish is unmet. Read their card and try again!',
    win: 'A perfectly spooky stay', happy: 'All four guests are happy!', reward: 'Night 01 complete · 50 coins awarded once per night', lobbyBack: 'Back to the lobby  →',
    close: 'Back to puzzle', guestCard: 'Guest card', roomCard: 'Room details', personality: 'Personality', wish: 'Room wish', condition: 'Room condition', occupancy: 'One guest per room.',
    hintTitle: 'Keeper’s notebook', nextHint: 'More help', hintStrategy: 'Read each guest’s wish, then compare it with the room conditions. Each room holds one guest.', hintFocus: 'Start with this guest:', hintSolution: 'A matching room is:', hintDone: 'Every guest has a matching room. Press “Check in all guests” to finish.', hintStage: 'Hint stage',
  },
  'zh-Hant': {
    brand: '✦  午夜入住  ✦', title: '怪物旅館', tagline: '有一點神秘，有滿滿溫暖。',
    welcome: '店長，歡迎回來', promise: '每位小怪物，\n都值得有個安心的房間。', open: '打開旅館大門  →', adventure: '一場原創的午夜解謎旅程', hotel: '旅館',
    coins: '金幣', progress: '晚已完成', arrivals: '四位住客到了！', intro: '讀懂住客的心願，安排合適房間。\n今晚的好夢，就交給你。', begin: '開始第 01 晚  →', replay: '重玩第 01 晚  →', titleBack: '返回標題',
    puzzle: '為每位住客找個家', instructions: '拖放分房；點角色名字看介紹，點房間 ⓘ 看詳情。', ready: '四位住客，四個合適的房間。', select: '請為這位住客選房：', needs: '需要', check: '安排全部入住  ✦', lobby: '← 大廳', reset: '重設 ↻', hint: '提示',
    incomplete: '先幫每位住客安排房間吧。', mismatch: '有住客的心願未滿足，再看看角色卡吧！',
    win: '今晚，每位住客都安心了', happy: '四位住客都很滿意！', reward: '第 01 晚完成 · 首次通關獲得 50 金幣', lobbyBack: '返回旅館大廳  →',
    close: '返回關卡', guestCard: '住客角色卡', roomCard: '房間詳情', personality: '角色個性', wish: '入住心願', condition: '房間條件', occupancy: '每個房間只可住一位住客。',
    hintTitle: '店長的小筆記', nextHint: '再給我一點提示', hintStrategy: '先讀住客的心願，再比較房間條件。每個房間只能住一位，不用急著猜答案。', hintFocus: '可以先留意這位住客：', hintSolution: '符合心願的房間是：', hintDone: '每位住客都有合適房間了，按「安排全部入住」完成這一晚吧。', hintStage: '提示階段',
  },
} as const;
export const conditions: Record<Locale, Record<Condition, { name: string; room: string; description: string }>> = {
  en: {
    moonlight: { name: 'Moonlight', room: 'Moon suite', description: 'An arched window lets silver moonlight reach the bedside. Violet curtains frame an unobstructed view of the night sky.' },
    quiet: { name: 'Quiet', room: 'Whisper room', description: 'Thick rugs, padded curtains and a sheltered window soften outside noise. A peaceful corner for a light sleeper.' },
    warm: { name: 'Warm', room: 'Hearth room', description: 'A golden fireplace and knitted blankets keep this room warm. Amber light glows across the wooden furniture.' },
    dry: { name: 'Dry', room: 'Linen room', description: 'Fresh air, dry linen and sealed windows keep dampness out. A comfortable place for delicate paper and bandages.' },
  },
  'zh-Hant': {
    moonlight: { name: '月光', room: '月光套房', description: '銀色月光穿過高拱窗，灑落床邊。紫色窗簾兩側拉開，讓住客能安心望著夜空。' },
    quiet: { name: '安靜', room: '細語客房', description: '厚地毯、柔軟窗簾與隔音窗減少外面的聲響。這個安靜角落，適合容易被吵醒的住客。' },
    warm: { name: '溫暖', room: '壁爐客房', description: '金色壁爐與針織毛毯讓室內保持溫暖。橘金燈光映著木家具，適合喜歡暖意的住客。' },
    dry: { name: '乾爽', room: '乾爽客房', description: '乾淨床單、通風設計和密封窗讓室內遠離潮氣。細緻的紙張與繃帶，都能在這裡保持乾爽。' },
  },
};
export const characters: Record<Locale, Record<Guest['kind'], { name: string; species: string; personality: string; wish: string; quote: string }>> = {
  en: {
    werewolf: { name: 'Luno', species: 'Werewolf', personality: 'Looks brave, but is a cuddly little traveler who is secretly afraid of the dark.', wish: 'A moonlit window helps me sleep peacefully.', quote: 'I am not afraid of the dark. I am waiting for the moon!' },
    jiangshi: { name: 'Dou', species: 'Jiangshi', personality: 'A careful rule-follower who keeps nodding off while checking in.', wish: 'Please keep my room quiet so I do not wake with a startled hop.', quote: 'Just one little hop… I promise.' },
    lantern: { name: 'Ember', species: 'Lantern spirit', personality: 'An enthusiastic old lantern full of hotel stories and a little mischief.', wish: 'A warm room keeps my little light glowing steadily.', quote: 'Tonight’s story will make you glow!' },
    mummy: { name: 'Rollo', species: 'Mummy', personality: 'A sweet, slow-paced traveler who steps on a loose bandage when nervous.', wish: 'A dry room, please. I do not want damp bandages.', quote: 'One moment… my bandage is tangled again.' },
  },
  'zh-Hant': {
    werewolf: { name: '月毛', species: '狼人', personality: '看起來威風，其實怕黑又愛撒嬌；只要看見月亮，就能安心入睡。', wish: '想住看得到月光的房間。', quote: '「我不是怕黑，我是在等月亮！」' },
    jiangshi: { name: '豆豆', species: '殭屍', personality: '認真守規矩，卻總在登記時打瞌睡；被吵醒時會嚇得跳一下。', wish: '需要安靜的房間，好好睡一覺。', quote: '「我只跳一下……真的一下。」' },
    lantern: { name: '燈燈', species: '提燈妖', personality: '熱情的老燈籠，喜歡講旅館往事，偶爾也會開個小玩笑。', wish: '想住溫暖的房間，讓燈光穩穩亮著。', quote: '「今晚的故事，包你聽到發光。」' },
    mummy: { name: '卷卷', species: '小木乃伊', personality: '反應慢半拍，做事認真又怕添麻煩；緊張時會不小心踩到自己的繃帶。', wish: '需要乾爽房，避免繃帶受潮。', quote: '「等陣……我條繃帶又打結喇。」' },
  },
};
const localeKey = 'midnight-check-in.locale';
export function readLocale(): Locale {
  try { const stored = localStorage.getItem(localeKey); if (stored === 'en' || stored === 'zh-Hant') return stored; } catch { /* Session-only preference if storage is unavailable. */ }
  return 'zh-Hant';
}
export function saveLocale(locale: Locale) { try { localStorage.setItem(localeKey, locale); } catch { /* Keep the active session usable. */ } }
