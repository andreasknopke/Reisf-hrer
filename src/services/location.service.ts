import * as Location from 'expo-location';
import axios from 'axios';
import { Coordinates, CityInfo } from '../types';
import { API_ENDPOINTS, APP_CONFIG } from '../constants';

/**
 * Service for location-related operations
 */
class LocationService {
  /**
   * Request location permissions
   */
  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Get current location
   */
  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      const location = await Location.getCurrentPositionAsync({});
      return location;
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  /**
   * Watch position changes
   */
  async watchPosition(
    callback: (location: Location.LocationObject) => void,
    options?: Location.LocationOptions
  ): Promise<Location.LocationSubscription | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      return await Location.watchPositionAsync(
        options || {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 500,
          timeInterval: 120000,
        },
        callback
      );
    } catch (error) {
      console.error('Error watching position:', error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to city info
   */
  async reverseGeocode(coordinates: Coordinates): Promise<CityInfo | null> {
    try {
      const response = await axios.get(`${API_ENDPOINTS.NOMINATIM}/reverse`, {
        params: {
          lat: coordinates.latitude,
          lon: coordinates.longitude,
          format: 'json',
          'accept-language': 'de',
        },
        headers: {
          'User-Agent': APP_CONFIG.USER_AGENT,
        },
      });

      if (response.data) {
        const address = response.data.address;
        
        const cityName =
          address.city ||
          address.town ||
          address.village ||
          address.municipality ||
          address.county ||
          response.data.display_name.split(',')[0];
        
        return {
          city: cityName,
          country: address.country,
          state: address.state,
          fullAddress: response.data.display_name,
          latitude: parseFloat(response.data.lat),
          longitude: parseFloat(response.data.lon),
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  /**
   * Search location by name
   */
  async searchLocation(locationName: string): Promise<Coordinates | null> {
    try {
      const response = await axios.get(`${API_ENDPOINTS.NOMINATIM}/search`, {
        params: {
          q: locationName,
          format: 'json',
          limit: 1,
          'accept-language': 'de',
        },
        headers: {
          'User-Agent': APP_CONFIG.USER_AGENT,
        },
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error searching location:', error);
      return null;
    }
  }
}

export default new LocationService();
