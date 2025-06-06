// Location management for local storage
// Since location is mutable and personal preference, we store it locally

export interface UserLocation {
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  timestamp: number;
}

const LOCATION_STORAGE_KEY = 'paws_and_found_user_location';

// Save user location to local storage
export const saveUserLocation = (location: string, coordinates?: { latitude: number; longitude: number }) => {
  try {
    const locationData: UserLocation = {
      address: location,
      coordinates,
      timestamp: Date.now()
    };
    
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationData));
    return true;
  } catch (error) {
    console.error('Error saving location to local storage:', error);
    return false;
  }
};

// Get user location from local storage
export const getUserLocation = (): UserLocation | null => {
  try {
    const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!stored) return null;
    
    const locationData: UserLocation = JSON.parse(stored);
    
    // Check if location is older than 24 hours (optional expiry)
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (Date.now() - locationData.timestamp > twentyFourHours) {
      // Location is old, but we don't auto-delete it - user can update if needed
    }
    
    return locationData;
  } catch (error) {
    console.error('Error reading location from local storage:', error);
    return null;
  }
};

// Clear user location from local storage
export const clearUserLocation = () => {
  try {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing location from local storage:', error);
    return false;
  }
};

// Auto-detect and save current location with optimization
export const detectAndSaveLocation = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by this browser');
      resolve(false);
      return;
    }

    // Set a timeout for the entire operation
    const timeout = setTimeout(() => {
      console.log('Location detection timed out');
      resolve(false);
    }, 10000); // 10 second timeout

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        clearTimeout(timeout);
        
        const { latitude, longitude } = position.coords;
        
        // First, save coordinates immediately as fallback
        const coordinatesLocation = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        saveUserLocation(coordinatesLocation, { latitude, longitude });
        
        try {
          // Try reverse geocoding with a timeout
          const controller = new AbortController();
          const geocodingTimeout = setTimeout(() => controller.abort(), 3000); // 3 second timeout for API
          
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
            { 
              signal: controller.signal,
              cache: 'default' // Use browser cache if available
            }
          );
          
          clearTimeout(geocodingTimeout);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          const data = await response.json();
          
          // Format a nice location string
          const locationString = [
            data.locality || data.city,
            data.principalSubdivision || data.countryName
          ].filter(Boolean).join(', ');
          
          if (locationString) {
            // Update with human-readable location
            saveUserLocation(locationString, { latitude, longitude });
          }
          
          resolve(true);
        } catch (error) {
          // If reverse geocoding fails, we already saved coordinates as fallback
          console.log('Reverse geocoding failed, using coordinates:', error);
          resolve(true); // Still success because we have coordinates
        }
      },
      (error) => {
        clearTimeout(timeout);
        console.log('Location access denied or unavailable:', error);
        resolve(false);
      },
      {
        enableHighAccuracy: false, // Faster, less accurate location
        timeout: 8000, // 8 second timeout for geolocation
        maximumAge: 300000 // Use cached location if less than 5 minutes old
      }
    );
  });
};

// Quick location detection that shows coordinates immediately
export const detectLocationQuick = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    const timeout = setTimeout(() => {
      resolve(null);
    }, 5000); // 5 second timeout

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeout);
        const { latitude, longitude } = position.coords;
        const coordinatesLocation = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        resolve(coordinatesLocation);
      },
      () => {
        clearTimeout(timeout);
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 4000,
        maximumAge: 300000
      }
    );
  });
};

// Background function to improve location with reverse geocoding
export const improveLocationInBackground = async (coordinates: { latitude: number; longitude: number }) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&localityLanguage=en`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeout);
    
    if (!response.ok) return false;
    
    const data = await response.json();
    const locationString = [
      data.locality || data.city,
      data.principalSubdivision || data.countryName
    ].filter(Boolean).join(', ');
    
    if (locationString) {
      saveUserLocation(locationString, coordinates);
      return locationString;
    }
    
    return false;
  } catch (error) {
    console.log('Background geocoding failed:', error);
    return false;
  }
};

// Get location for display (returns address string)
export const getLocationForDisplay = (): string => {
  const location = getUserLocation();
  return location?.address || '';
};
