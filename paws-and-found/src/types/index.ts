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

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  telephone: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
