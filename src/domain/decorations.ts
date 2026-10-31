export const decorations = [
  { id: 'moon-lamps', price: 100 },
  { id: 'velvet-rug', price: 200 },
  { id: 'star-sign', price: 300 },
] as const;
export type DecorationId = typeof decorations[number]['id'];
export interface DecoratedWallet { coins: number; decorations?: DecorationId[]; equipped?: DecorationId[] }
export function isDecoration(id: unknown): id is DecorationId { return decorations.some(item => item.id === id); }
export function purchase<T extends DecoratedWallet>(wallet: T, id: string): { wallet: T & DecoratedWallet; status: 'bought' | 'owned' | 'insufficient' | 'unknown' } {
  const item = decorations.find(item => item.id === id);
  if (!item) return { wallet, status: 'unknown' };
  if (wallet.decorations?.includes(item.id)) return { wallet, status: 'owned' };
  if (wallet.coins < item.price || !Number.isSafeInteger(wallet.coins)) return { wallet, status: 'insufficient' };
  return { wallet: { ...wallet, coins: wallet.coins - item.price, decorations: [...(wallet.decorations ?? []), item.id], equipped: [...(wallet.equipped ?? []), item.id] }, status: 'bought' };
}
export function toggleDecoration<T extends DecoratedWallet>(wallet: T, id: string): T & DecoratedWallet {
  if (!isDecoration(id) || !wallet.decorations?.includes(id)) return wallet;
  const current = wallet.equipped ?? [];
  return { ...wallet, equipped: current.includes(id) ? current.filter(item => item !== id) : [...current, id] };
}
