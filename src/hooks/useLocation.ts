import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Coordinates, CityInfo } from '../types';
import { locationService } from '../services';
import { hasSignificantMovement } from '../utils/distance';

interface UseLocationResult {
  location: Coordinates | null;
  cityInfo: CityInfo | null;
  loading: boolean;
  error: string | null;
  refreshLocation: () => Promise<void>;
}

/**
 * Hook for managing location state
 */
export const useLocation = (enableTracking: boolean = true): UseLocationResult => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [cityInfo, setCityInfo] = useState<CityInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const currentLocation = await locationService.getCurrentLocation();
      if (currentLocation) {
        const coords = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };
        setLocation(coords);

        const city = await locationService.reverseGeocode(coords);
        setCityInfo(city);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocation();

    if (!enableTracking) return;

    let subscription: Location.LocationSubscription | null = null;

    const startTracking = async () => {
      subscription = await locationService.watchPosition((newLocation) => {
        const newCoords = {
          latitude: newLocation.coords.latitude,
          longitude: newLocation.coords.longitude,
        };

        if (hasSignificantMovement(location, newCoords)) {
          setLocation(newCoords);
          locationService.reverseGeocode(newCoords).then(setCityInfo);
        }
      });
    };

    startTracking();

    return () => {
      subscription?.remove();
    };
  }, [enableTracking, loadLocation]);

  return {
    location,
    cityInfo,
    loading,
    error,
    refreshLocation: loadLocation,
  };
};
