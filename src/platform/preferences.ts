export interface Preferences { music: boolean; sound: boolean; haptics: boolean }
export const defaultPreferences: Readonly<Preferences> = { music: true, sound: true, haptics: false };
const key = 'midnight-check-in.preferences.v1';
export function readPreferences(): Preferences {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? 'null');
    return { music: typeof value?.music === 'boolean' ? value.music : true, sound: typeof value?.sound === 'boolean' ? value.sound : true, haptics: typeof value?.haptics === 'boolean' ? value.haptics : false };
  } catch { return { ...defaultPreferences }; }
}
export function savePreferences(value: Preferences): boolean {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}
