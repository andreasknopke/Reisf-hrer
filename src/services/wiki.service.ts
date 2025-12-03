import axios from 'axios';
import { WikitravelData, SearchResult, Language } from '../types';
import { APP_CONFIG } from '../constants';

/**
 * Service for Wikipedia/Wikitravel API operations
 */
class WikiService {
  /**
   * Fetch data from Wikipedia
   */
  async fetchWikipediaData(location: string, language: Language = 'de'): Promise<WikitravelData> {
    try {
      const baseUrl = `https://${language}.wikipedia.org/w/api.php`;
      
      const response = await axios.get(baseUrl, {
        params: {
          action: 'query',
          format: 'json',
          prop: 'extracts|pageimages|coordinates',
          exintro: true,
          explaintext: true,
          titles: location,
          redirects: 1,
          origin: '*',
        },
        headers: {
          'User-Agent': APP_CONFIG.USER_AGENT,
        },
      });

      const pages = response.data.query.pages;
      const pageId = Object.keys(pages)[0];
      
      if (pageId === '-1') {
        return {
          title: location,
          extract: 'Für diesen Ort sind aktuell keine detaillierten Informationen verfügbar.',
          coordinates: null,
        };
      }

      const page = pages[pageId];
      return {
        title: page.title,
        extract: page.extract || 'Keine Beschreibung verfügbar.',
        coordinates: page.coordinates
          ? {
              lat: page.coordinates[0].lat,
              lon: page.coordinates[0].lon,
            }
          : null,
      };
    } catch (error) {
      console.error('Error fetching Wikipedia data:', error);
      return {
        title: location,
        extract: `Informationen für "${location}" konnten nicht geladen werden.`,
        coordinates: null,
      };
    }
  }

  /**
   * Search Wikipedia locations
   */
  async searchLocations(searchTerm: string, language: Language = 'de'): Promise<SearchResult[]> {
    try {
      const baseUrl = `https://${language}.wikipedia.org/w/api.php`;
      
      const response = await axios.get(baseUrl, {
        params: {
          action: 'opensearch',
          format: 'json',
          search: searchTerm,
          limit: 10,
          origin: '*',
        },
        headers: {
          'User-Agent': APP_CONFIG.USER_AGENT,
        },
      });

      if (response.data && response.data[1]) {
        return response.data[1].map((title: string, index: number) => ({
          title,
          description: response.data[2][index] || 'Keine Beschreibung',
          url: response.data[3][index],
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error searching Wikipedia:', error);
      return [];
    }
  }

  /**
   * Get city image from Wikipedia
   */
  async getCityImage(cityName: string, language: Language = 'de'): Promise<string | null> {
    try {
      const baseUrl = `https://${language}.wikipedia.org/w/api.php`;
      
      const response = await axios.get(baseUrl, {
        params: {
          action: 'query',
          format: 'json',
          titles: cityName,
          prop: 'pageimages',
          piprop: 'original',
          origin: '*',
        },
        headers: {
          'User-Agent': APP_CONFIG.USER_AGENT,
        },
        timeout: 8000,
      });

      const pages = response.data?.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        if (pageId !== '-1' && pages[pageId].original) {
          return pages[pageId].original.source;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching city image:', error);
      return null;
    }
  }
}

const wikiServiceInstance = new WikiService();

export default wikiServiceInstance;

// Export helper functions for backward compatibility
export const fetchWikitravelData = (location: string, language: string = 'de') => 
  wikiServiceInstance.fetchWikipediaData(location, language as Language);
export const getCityImage = (cityName: string) => 
  wikiServiceInstance.getCityImage(cityName);
