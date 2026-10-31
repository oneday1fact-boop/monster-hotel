const key = 'midnight-check-in.tutorial.v1';
export function readTutorialDone(): boolean {
  try { return localStorage.getItem(key) === 'done'; } catch { return false; }
}
export function saveTutorialDone(): boolean {
  try { localStorage.setItem(key, 'done'); return true; } catch { return false; }
}
