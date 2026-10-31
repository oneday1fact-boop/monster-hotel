/** Future provider boundary. No SDK, network access, or ad placement in Milestone 1. */
export interface AdProvider { rewarded(): Promise<boolean>; interstitial(): Promise<void> }
export class OfflineAds implements AdProvider {
  async rewarded() { return false; }
  async interstitial() {}
}
