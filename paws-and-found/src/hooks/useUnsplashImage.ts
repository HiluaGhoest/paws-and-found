import { useState, useEffect } from 'react';
import { createApi } from 'unsplash-js';
import type { PhotoCredit, CachedImage } from '../types';

export const useUnsplashImage = () => {
  const [bgUrl, setBgUrl] = useState<string>('');
  const [photoCredit, setPhotoCredit] = useState<PhotoCredit | null>(null);

  const unsplash = createApi({
    accessKey: import.meta.env.VITE_UNSPLASH_ACCESS_KEY,
  });

  const getCachedImage = (): string | null => {
    const cached = localStorage.getItem('paws-bg-image');
    if (cached) {
      try {
        const { url, timestamp, photographer, photographerUrl, unsplashUrl }: CachedImage = JSON.parse(cached);
        const oneHour = 60 * 5 * 1000; // 5 minutes in milliseconds
        const now = Date.now();
        
        if (now - timestamp < oneHour) {
          console.log('Using cached image:', url);
          // Set photo credit if available
          if (photographer && photographerUrl && unsplashUrl) {
            setPhotoCredit({ photographer, photographerUrl, unsplashUrl });
          }
          return url;
        } else {
          console.log('Cache expired, will fetch new image');
          localStorage.removeItem('paws-bg-image'); // Clean up expired cache
        }
      } catch (error) {
        console.error('Error parsing cached image:', error);
        localStorage.removeItem('paws-bg-image'); // Clean up corrupted cache
      }
    }
    return null;
  };

  const setCachedImage = (url: string, photographer?: string, photographerUrl?: string, unsplashUrl?: string) => {
    const cacheData: CachedImage = {
      url,
      timestamp: Date.now(),
      photographer,
      photographerUrl,
      unsplashUrl
    };
    localStorage.setItem('paws-bg-image', JSON.stringify(cacheData));
  };
  const fetchNewImage = async () => {
    console.log('Fetching new image from Unsplash...');
    try {
      const result = await unsplash.photos.getRandom({ 
        query: 'pets', 
        orientation: 'landscape', 
        count: 1 
      });

      if (result.type === 'success') {
        const response = result.response;
        console.log('Unsplash API response:', response);
        
        const photo = Array.isArray(response) ? response[0] : response;
        
        // Trigger download endpoint as required by Unsplash API guidelines
        if (photo.links?.download_location) {
          console.log('Triggering download endpoint for photo:', photo.id);
          try {
            await unsplash.photos.trackDownload({ 
              downloadLocation: photo.links.download_location 
            });
            console.log('Download tracking successful');
          } catch (error) {
            console.error('Error tracking download:', error);
          }
        }
        
        setBgUrl(photo.urls.regular);
        
        // Set photo credit
        const credit: PhotoCredit = {
          photographer: photo.user.name,
          photographerUrl: photo.user.links.html,
          unsplashUrl: `https://unsplash.com/photos/${photo.id}`
        };
        console.log('Generated credit object:', credit);
        setPhotoCredit(credit);
        
        setCachedImage(photo.urls.regular, credit.photographer, credit.photographerUrl, credit.unsplashUrl);
      } else {
        console.error('Error fetching image:', result.errors);
        // Fallback to a default image
        setBgUrl('https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1920&h=1080&fit=crop');
      }
    } catch (error) {
      console.error('Network error fetching image:', error);
      // Fallback to a default image
      setBgUrl('https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1920&h=1080&fit=crop');
    }
  };

  const clearImageCache = () => {
    localStorage.removeItem('paws-bg-image');
    setBgUrl('');
    setPhotoCredit(null);
    console.log('Image cache cleared');
    // Trigger a new fetch
    window.location.reload();
  };

  useEffect(() => {
    // Check for cached image first
    const cachedUrl = getCachedImage();
    if (cachedUrl) {
      setBgUrl(cachedUrl);
    } else {
      fetchNewImage();
    }
  }, []);

  return {
    bgUrl,
    photoCredit,
    clearImageCache
  };
};
