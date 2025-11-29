import axios from 'axios';

const WIKITRAVEL_API = 'https://wikitravel.org/wiki/en/api.php';

export const fetchWikitravelData = async (location, language = 'en') => {
  try {
    const baseUrl = `https://wikitravel.org/wiki/${language}/api.php`;
    
    const response = await axios.get(baseUrl, {
      params: {
        action: 'query',
        format: 'json',
        prop: 'extracts|coordinates',
        exintro: true,
        explaintext: true,
        titles: location,
        redirects: 1
      }
    });

    const pages = response.data.query.pages;
    const pageId = Object.keys(pages)[0];
    
    if (pageId === '-1') {
      return null;
    }

    return {
      title: pages[pageId].title,
      extract: pages[pageId].extract,
      coordinates: pages[pageId].coordinates?.[0]
    };
  } catch (error) {
    console.error('Error fetching Wikitravel data:', error);
    return null;
  }
};

export const searchWikitravelLocations = async (searchTerm, language = 'en') => {
  try {
    const baseUrl = `https://wikitravel.org/wiki/${language}/api.php`;
    
    const response = await axios.get(baseUrl, {
      params: {
        action: 'opensearch',
        format: 'json',
        search: searchTerm,
        limit: 10
      }
    });

    return response.data[1].map((title, index) => ({
      title: title,
      description: response.data[2][index],
      url: response.data[3][index]
    }));
  } catch (error) {
    console.error('Error searching Wikitravel:', error);
    return [];
  }
};

// Simulierte LLM-Integration (hier würde eine echte API wie OpenAI eingebunden werden)
export const fetchLLMDescription = async (location, context = '') => {
  try {
    // Hier würde die echte LLM API Integration erfolgen
    // Beispiel für OpenAI:
    // const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    //   model: 'gpt-3.5-turbo',
    //   messages: [
    //     {
    //       role: 'user',
    //       content: `Tell me about ${location}. ${context}`
    //     }
    //   ]
    // }, {
    //   headers: {
    //     'Authorization': `Bearer YOUR_API_KEY`,
    //     'Content-Type': 'application/json'
    //   }
    // });
    // return response.data.choices[0].message.content;
    
    // Platzhalter für Demo
    return `AI-generierte Beschreibung für ${location}. Diese würde von einem LLM wie GPT-4 kommen und interessante Fakten, Geschichte und Reisetipps enthalten.`;
  } catch (error) {
    console.error('Error fetching LLM description:', error);
    return null;
  }
};

// Funktion zum Abrufen von Sehenswürdigkeiten in der Nähe
export const getNearbyAttractions = async (latitude, longitude, radius = 5000) => {
  try {
    // Hier würde eine Geo-API verwendet werden (z.B. Overpass API für OSM-Daten)
    // oder eine eigene Backend-API
    
    // Beispiel-Daten für die Demo
    const mockAttractions = [
      {
        id: 1,
        name: 'Historisches Museum',
        latitude: latitude + 0.01,
        longitude: longitude + 0.01,
        type: 'museum',
        distance: 850,
        rating: 4.5
      },
      {
        id: 2,
        name: 'Stadtpark',
        latitude: latitude - 0.015,
        longitude: longitude + 0.02,
        type: 'park',
        distance: 1200,
        rating: 4.2
      },
      {
        id: 3,
        name: 'Alte Kirche',
        latitude: latitude + 0.008,
        longitude: longitude - 0.012,
        type: 'church',
        distance: 650,
        rating: 4.7
      }
    ];

    return mockAttractions;
  } catch (error) {
    console.error('Error fetching nearby attractions:', error);
    return [];
  }
};
