/** Offline provider boundary. Placement plans are separate; no SDK or ad network requests are shipped. */
export interface AdProvider { rewarded(): Promise<boolean>; interstitial(): Promise<void> }
export class OfflineAds implements AdProvider {
  async rewarded() { return false; }
  async interstitial() {}
}
