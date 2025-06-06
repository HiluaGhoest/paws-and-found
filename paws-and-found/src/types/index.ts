// Types for the application
export interface PhotoCredit {
  photographer: string;
  photographerUrl: string;
  unsplashUrl: string;
}

export interface CachedImage {
  url: string;
  timestamp: number;
  photographer?: string;
  photographerUrl?: string;
  unsplashUrl?: string;
}
