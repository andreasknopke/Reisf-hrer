export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Attraction {
  id: string | number;
  name: string;
  latitude: number;
  longitude: number;
  type: string;
  distance: number;
  rating: number;
  description?: string;
  interestScore?: number;
  interestReason?: string;
  savedAt?: string;
}

export interface CityInfo {
  city: string;
  country: string;
  state?: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
}

export interface WikitravelData {
  title: string;
  extract: string;
  coordinates: {
    lat: number;
    lon: number;
  } | null;
}

export interface SearchResult {
  title: string;
  description: string;
  url: string;
}

export interface Interest {
  id: string;
  label: string;
  icon: string;
}

export interface AttractionScore {
  name: string;
  score: number;
  reason: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

export interface MapData {
  location: Coordinates;
  attractions: Attraction[];
  useGPS: boolean;
}

export type Language = 'en' | 'de';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}
