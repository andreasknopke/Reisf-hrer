import axios from 'axios';
import { Attraction, AttractionScore, ApiError } from '../types';
import { API_ENDPOINTS, APP_CONFIG, STORAGE_KEYS, CACHE_DURATION } from '../constants';
import storageService from './storage.service';
import config from '../config';

/**
 * Service for OpenAI API operations
 */
class OpenAIService {
  /**
   * Classify attractions by user interests
   */
  async classifyAttractions(
    attractions: Attraction[],
    userInterests: string[]
  ): Promise<Attraction[]> {

    const OPENAI_API_KEY = this.getOpenApiKey();

    if (!userInterests.length || !this.isValidApiKey(OPENAI_API_KEY)) {
      return attractions;
    }

    try {
      const attractionNames = attractions.map(a => a.name).join(', ');
      const interestsText = userInterests.join(', ');
      
      const response = await axios({
        method: 'post',
        url: API_ENDPOINTS.OPENAI,
        data: {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Du bist ein Reise-Experte. Bewerte Sehenswürdigkeiten basierend auf Benutzerinteressen. Antworte NUR mit einem JSON-Array ohne Markdown-Formatierung.',
            },
            {
              role: 'user',
              content: `Benutzerinteressen: ${interestsText}\n\nSehenswürdigkeiten: ${attractionNames}\n\nBewerte jede Sehenswürdigkeit mit einem Score von 0-10, wie gut sie zu den Interessen passt. Antworte im JSON-Format: [{"name": "Name", "score": 8, "reason": "kurze Begründung"}]`,
            },
          ],
          max_tokens: 1500,
          temperature: 0.3,
        },
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: APP_CONFIG.CLASSIFICATION_TIMEOUT,
      });
      
      const content = response.data.choices[0].message.content;
      const scores = this.parseScoresFromResponse(content);
      
      return this.mergeScoresWithAttractions(attractions, scores);
    } catch (error) {
      console.error('Classification error:', error);
      return attractions;
    }
  }

  private getOpenApiKey(): string {
    return config.get('openai_api_key');
  }

  private isValidApiKey(key: string) {
    if (!key.startsWith('sk')) return false;
    return true;
  }

  /**
   * Parse scores from OpenAI response (handles markdown code blocks)
   */
  private parseScoresFromResponse(content: string): AttractionScore[] {
    try {
      let jsonText = content;
      
      if (content.includes('```')) {
        const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match) {
          jsonText = match[1].trim();
        }
      }
      
      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Failed to parse scores:', error);
      return [];
    }
  }

  /**
   * Merge scores with attractions
   */
  private mergeScoresWithAttractions(
    attractions: Attraction[],
    scores: AttractionScore[]
  ): Attraction[] {
    return attractions.map(attraction => {
      const scoreData = scores.find(s => s.name === attraction.name);
      return {
        ...attraction,
        interestScore: scoreData?.score || 5,
        interestReason: scoreData?.reason || '',
      };
    });
  }

  /**
   * Get LLM description for a location
   */
  async getDescription(location: string, context: string = ''): Promise<string> {
    const OPENAI_API_KEY = this.getOpenApiKey();

    if (!this.isValidApiKey(OPENAI_API_KEY)) {
      return 'OpenAI API-Schlüssel nicht konfiguriert.';
    }

    try {
      const response = await axios.post(
        API_ENDPOINTS.OPENAI,
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Du bist ein hilfreicher Reiseführer-Assistent. Gib detaillierte, interessante und nützliche Informationen über Orte und Sehenswürdigkeiten auf Deutsch.',
            },
            {
              role: 'user',
              content: `Erzähle mir über ${location}. Gib Informationen über Geschichte, Sehenswürdigkeiten, kulturelle Bedeutung und praktische Reisetipps. ${context}`,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      return response.data.choices[0].message.content;
    } catch (error: any) {
      return this.handleDescriptionError(error, location);
    }
  }

  /**
   * Handle description errors
   */
  private handleDescriptionError(error: any, location: string): string {
    if (error.response?.status === 429) {
      return `⚠️ Momentan sind zu viele API-Anfragen aktiv. Bitte versuchen Sie es in ein paar Minuten erneut.`;
    }
    
    if (error.response?.status === 401) {
      return `⚠️ API-Schlüssel ungültig. Bitte überprüfen Sie Ihren OpenAI API-Schlüssel.`;
    }
    
    return `⚠️ Fehler beim Abrufen der AI-Beschreibung: ${error.response?.data?.error?.message || error.message}`;
  }

  /**
   * Get cached AI description
   */
  async getCachedDescription(location: string, interests: string[]): Promise<string | null> {
    const cacheKey = `${STORAGE_KEYS.AI_DESCRIPTIONS}_${location}_${interests.join(',')}`;
    return storageService.getCached<string>(cacheKey);
  }

  /**
   * Cache AI description
   */
  async cacheDescription(location: string, interests: string[], description: string): Promise<boolean> {
    const cacheKey = `${STORAGE_KEYS.AI_DESCRIPTIONS}_${location}_${interests.join(',')}`;
    return storageService.setCached(cacheKey, description, CACHE_DURATION.AI_DESCRIPTION);
  }
}

const openAIServiceInstance = new OpenAIService();

export default openAIServiceInstance;

// Export helper function for backward compatibility
export const fetchLLMDescription = (location: string, context: string = '') => 
  openAIServiceInstance.getDescription(location, context);
