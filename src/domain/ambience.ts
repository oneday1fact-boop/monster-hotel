export const ambiences = ['night', 'autumn', 'morning', 'winter'] as const;
export type Ambience = typeof ambiences[number];
export function isAmbience(value: unknown): value is Ambience { return ambiences.some(a => a === value); }
export function chapterAmbience(chapter: number): Ambience { return chapter === 4 ? 'autumn' : chapter === 5 ? 'morning' : chapter === 6 ? 'winter' : 'night'; }
export function lobbyAmbience(save: { ambience?: Ambience; stories?: Partial<Record<number, unknown>> }): Ambience {
  return save.ambience ?? (save.stories?.[6] ? 'winter' : save.stories?.[5] ? 'morning' : save.stories?.[4] ? 'autumn' : 'night');
}
export function receptionKey(theme: Ambience) { return theme === 'night' ? 'reception-art' : `reception-${theme}`; }
