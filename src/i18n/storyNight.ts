export const storyUI = {
  'zh-Hant': {
    title: '月光與繃帶', home: '返回大廳', language: '切換語言', reset: '重新安排', ready: '安頓好喇', curtain: '隔音窗簾', moonLamp: '月亮燈', look: '睇房間', back: '全間酒店',
    intro: '先認識住客；用品可以拖入房間，亦可以先選用品再點房號。', selected: '再點房號，或拖入房間。', incomplete: '四位住客都想有個房間。', mismatch: '有位住客未滿意，睇吓佢嘅心願，再換房或用用品。', noise: '月毛嘅嚎叫會嘈醒豆豆！窗簾可以隔音，亦可以換間月光房。',
    event: '月毛叼住繃帶走出嚟！卷卷追住佢，原來月毛想搵人玩。', play: '用玩具陪月毛玩', together: '邀請卷卷一齊玩', playing: '月毛追住玩具，卷卷慢慢收好繃帶。', joining: '兩位一齊玩拉繩，卷卷都笑咗！', done: '旅館多咗一個玩具籃', luno: '月毛', rollo: '卷卷', bond: '熟悉度', reward: '首次收入', replay: '重看小事件', replayNote: '重看不重複派獎，好感保留首次結局。', session: '未能儲存；目前進度只保留當次遊玩。', story: '住客故事', allGood: '大家都舒服喇！安頓之後，睇吓今晚會發生咩事。', need: { moonlight: '想睇月光', quiet: '想靜靜哋', warm: '想暖笠笠', dry: '想乾爽啲' },
  },
  en: {
    title: 'Moonlight & Linen', home: 'Back to lobby', language: 'Change language', reset: 'Arrange again', ready: 'Settle in', curtain: 'Quiet curtains', moonLamp: 'Moon lamp', look: 'Look inside', back: 'Whole hotel',
    intro: 'Meet the guests. Drag a supply into a room, or select it then tap a room number.', selected: 'Tap a room number, or drag into the room.', incomplete: 'Every guest needs a room.', mismatch: 'Someone is not comfortable yet. Check their wish, swap rooms or use a supply.', noise: 'Luno’s howling wakes Dou! Curtains block sound, or try another moonlit room.',
    event: 'Luno has run out with Rollo’s linen! He is looking for someone to play with.', play: 'Play fetch with Luno', together: 'Invite Rollo to play', playing: 'Luno follows the toy while Rollo gently winds the linen.', joining: 'They play a gentle tug game. Even Rollo is laughing!', done: 'A new toy basket for the lobby', luno: 'Luno', rollo: 'Rollo', bond: 'Friendship', reward: 'First-stay income', replay: 'Replay the little story', replayNote: 'Replays give no extra rewards; friendship keeps your first ending.', session: 'Storage is unavailable; progress lasts only this session.', story: 'Guest story', allGood: 'Everyone is comfortable! Settle in and discover tonight’s little story.', need: { moonlight: 'Wants moonlight', quiet: 'Wants quiet', warm: 'Wants warmth', dry: 'Wants dry air' },
  },
} as const;

import type { ChapterId } from '../domain/storyChapters';
import type { Locale } from './catalog';
export function chapterUI(locale: Locale, chapter: ChapterId) {
  const base = storyUI[locale];
  const extra = locale === 'en' ? {
    goal: chapter === 1 ? 'Keep Dou away from howling, or use curtains.' : chapter === 2 ? 'Ember and Luno need the same floor for their night walk.' : 'Dou and Rollo practise on the same floor. Move the moonlight!',
    rule: chapter === 2 ? 'Place Ember and Luno on the same floor.' : 'Dou needs Rollo on the same floor to practise together.',
    next: 'Next story', chapters: 'Storybook', locked: 'Finish the previous story first.',
    title: chapter === 1 ? base.title : chapter === 2 ? 'Ember’s firefly trail' : 'Dou’s midnight dance',
    event: chapter === 1 ? base.event : chapter === 2 ? 'The corridor goes dark! Ember has found a shy trail of fireflies. Luno wants to follow.' : 'Dou’s charm keeps slipping during practice. Rollo has brought a soft ribbon to help!',
    play: chapter === 1 ? base.play : chapter === 2 ? 'Follow the fireflies' : 'Clap a little rhythm',
    together: chapter === 1 ? base.together : chapter === 2 ? 'Light the path together' : 'Invite everyone to dance',
    playing: chapter === 1 ? base.playing : chapter === 2 ? 'Ember guides the fireflies; Luno follows their golden trail.' : 'Dou finds the beat, one little hop at a time.',
    joining: chapter === 1 ? base.joining : chapter === 2 ? 'Everyone lights a star. The corridor feels safe again!' : 'Rollo waves the ribbon and all four friends join in!',
    done: chapter === 1 ? base.done : chapter === 2 ? 'A firefly welcome for the lobby' : 'The midnight dance club is open!',
  } : {
    goal: chapter === 1 ? '豆豆怕嘈；試吓換房或用窗簾。' : chapter === 2 ? '燈燈要同月毛住同一層，方便帶路。' : '豆豆同卷卷要住同一層練舞；月燈可以搬。',
    rule: chapter === 2 ? '燈燈同月毛要住同一層先可以夜遊。' : '豆豆想同卷卷住同一層，一齊練舞。',
    next: '下一個故事', chapters: '住客故事簿', locked: '完成上一個故事就會開放。',
    title: chapter === 1 ? base.title : chapter === 2 ? '燈燈的螢火小徑' : '豆豆的午夜舞步',
    event: chapter === 1 ? base.event : chapter === 2 ? '走廊突然暗咗！燈燈發現一群怕醜嘅螢火蟲，月毛好想跟住睇。' : '豆豆練舞時，額頭張符成日跌！卷卷帶嚟軟絲帶，想幫佢搵返節奏。',
    play: chapter === 1 ? base.play : chapter === 2 ? '跟住螢火蟲探險' : '拍手幫豆豆打拍子',
    together: chapter === 1 ? base.together : chapter === 2 ? '大家一齊點亮走廊' : '邀請大家一齊跳',
    playing: chapter === 1 ? base.playing : chapter === 2 ? '燈燈帶住螢火蟲飛，月毛沿住金光慢慢行。' : '一步、兩步！豆豆跟到拍子，終於跳得穩喇。',
    joining: chapter === 1 ? base.joining : chapter === 2 ? '每位住客都點亮一粒星，走廊暖返晒！' : '卷卷揮動絲帶，四位熟客都一齊跳起嚟！',
    done: chapter === 1 ? base.done : chapter === 2 ? '大廳多咗螢火迎賓燈' : '午夜舞蹈小隊成立喇！',
  };
  return { ...base, ...extra, ...(chapter >= 4 ? seasonalCopy[locale][chapter as 4 | 5 | 6] : {}), chapters:locale==='en'?'Challenge map':'關卡地圖',next:locale==='en'?'Next challenge':'下一關',replay:locale==='en'?'Replay level':'再玩本關',story:locale==='en'?'Check-in challenge':'入住挑戰' };
}

const seasonalCopy = {
  'zh-Hant': {
    4: { title:'秋雨裡的新住客', goal:'小柚同燈燈要住同一層，方便晾乾頸巾。', rule:'小柚想同燈燈住同一層。記得豆豆怕嘈！', event:'秋雨停喇，小柚第一次行入旅館，濕咗嘅頸巾一直滴水。燈燈輕輕亮起暖光。', play:'陪小柚晾乾頸巾', together:'大家一齊飲暖茶', playing:'頸巾暖返，小柚個小鈴噹開心響起。', joining:'一杯暖茶、一個新朋友，秋夜都唔凍喇。', done:'小柚成為旅館新熟客！' },
    5: { title:'清晨的夢袋', goal:'夢夢同卷卷要住同一層；日頭記得幫月毛搬月燈。', rule:'夢夢想同卷卷住同一層，慢慢整理夢袋。', event:'陽光照入大廳，夢夢抱住裝滿打結夢境嘅披肩。卷卷認真地遞上軟絲帶。', play:'幫夢夢解開夢結', together:'放走夢裡的小星星', playing:'卷卷輕輕拉開絲帶，夢夢終於可以安心瞓喇。', joining:'小星星飛入晨光，夢夢送咗個好夢俾大家。', done:'夢夢帶住好夢留下來！' },
    6: { title:'雪日的第一張合照', goal:'小柚同夢夢要住同一層，準備第一次雪日聚會。', rule:'兩位新朋友想住同一層，一齊準備雪日聚會。', event:'窗外落雪喇！小柚想留低第一張旅館合照，夢夢就帶嚟一個圓碌碌嘅雪朋友。', play:'排好隊影合照', together:'一齊砌雪朋友', playing:'一、二、三！新舊朋友一齊笑，留下第一張合照。', joining:'小柚加條頸巾，夢夢加粒星，雪朋友都似有好夢。', done:'新舊朋友的雪日回憶！' },
  },
  en: {
    4: { title:'A guest in the autumn rain', goal:'Yuzu and Ember need the same floor to dry her scarf.', rule:'Yuzu wants Ember on the same floor. Dou still needs quiet!', event:'The rain stops as Yuzu steps inside for the first time, her scarf dripping. Ember offers a gentle glow.', play:'Help dry Yuzu’s scarf', together:'Welcome her with warm tea', playing:'The scarf is warm again, and Yuzu’s little bell rings happily.', joining:'Warm tea and a new friend make the autumn evening cozy.', done:'Yuzu becomes a hotel regular!' },
    5: { title:'The morning dream bag', goal:'Nemu and Rollo share a floor. Luno needs a moon lamp by day.', rule:'Nemu wants Rollo on the same floor to untangle the dreams.', event:'Sunlight fills the lobby. Nemu arrives with tangled dreams in a quilt cape; Rollo offers a soft ribbon.', play:'Untangle Nemu’s dreams', together:'Release the dream stars', playing:'Rollo loosens the ribbon. Nemu can finally rest.', joining:'Little stars drift into the sunrise, carrying gentle dreams.', done:'Nemu brings sweet dreams to the hotel!' },
    6: { title:'Our first snowy-day photo', goal:'Yuzu and Nemu need the same floor for their snowy gathering.', rule:'The two new friends want rooms on the same floor.', event:'Snow is falling! Yuzu wants a first hotel photo, while Nemu has brought a round little snow friend.', play:'Pose for a group photo', together:'Build a snow friend', playing:'One, two, three! Old and new friends share a happy photograph.', joining:'A scarf from Yuzu and a star from Nemu bring their snow friend to life.', done:'A snowy memory for all the guests!' },
  },
};
