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
  return { ...base, ...extra };
}
