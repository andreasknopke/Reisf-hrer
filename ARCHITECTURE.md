# Travel Guide App - TypeScript Architecture

## Overview

This document describes the modernized TypeScript architecture of the Travel Guide App, following industry best practices and modern design principles.

## Project Structure

```
src/
├── types/              # TypeScript type definitions
│   ├── index.ts       # Core types (Attraction, Coordinates, etc.)
│   └── navigation.ts  # Navigation types
├── services/          # Business logic layer
│   ├── storage.service.ts      # Generic storage operations
│   ├── favorites.service.ts    # Favorites management
│   ├── interests.service.ts    # User interests
│   ├── location.service.ts     # GPS and geocoding
│   ├── attractions.service.ts  # Fetch attractions
│   ├── openai.service.ts       # AI classification
│   ├── wiki.service.ts         # Wikipedia/Wikitravel
│   └── index.ts               # Service exports
├── hooks/             # Custom React hooks
│   ├── useLocation.ts         # Location state management
│   ├── useFavorites.ts        # Favorites state management
│   ├── useAttractions.ts      # Attractions state management
│   └── index.ts               # Hook exports
├── screens/           # Screen components
│   ├── HomeScreen.tsx
│   ├── MapScreen.tsx
│   ├── FavoritesScreen.tsx
│   ├── DetailsScreen.tsx
│   ├── SettingsScreen.tsx
│   └── WebViewScreen.tsx
├── components/        # Reusable UI components (future)
├── utils/            # Utility functions
│   └── distance.ts   # Distance calculations
├── config/           # Configuration files
│   ├── openai.ts     # OpenAI configuration
│   └── i18n.ts       # Internationalization
├── constants/        # Application constants
│   └── index.ts      # API endpoints, cache durations, etc.
└── App.tsx           # Root application component
```

## Design Principles

### 1. Separation of Concerns

- **Services Layer**: All business logic and API calls are isolated in service classes
- **Hooks Layer**: State management and side effects are encapsulated in custom hooks
- **Screens Layer**: UI components focus purely on rendering and user interaction
- **Types Layer**: Comprehensive TypeScript types ensure type safety

### 2. Single Responsibility Principle

Each service has a single, well-defined responsibility:
- `StorageService`: Generic AsyncStorage operations
- `FavoritesService`: Favorites management only
- `LocationService`: GPS and geocoding operations
- `AttractionsService`: Attraction data fetching and caching
- `OpenAIService`: AI-powered classification and descriptions
- `WikiService`: Wikipedia/Wikitravel data

### 3. Dependency Inversion

- Services depend on abstractions (interfaces/types), not concrete implementations
- Easy to mock for testing
- Services can be swapped without changing consumer code

### 4. DRY (Don't Repeat Yourself)

- Reusable utility functions (e.g., `calculateDistance`)
- Generic storage service with caching capabilities
- Custom hooks encapsulate common state patterns

### 5. Type Safety

- Comprehensive TypeScript types throughout
- Navigation types for type-safe routing
- Service method signatures with proper types
- No `any` types (except for error handling where appropriate)

## Service Layer Pattern

### Service Classes

All services are implemented as singleton classes with static methods or instance methods:

```typescript
class FavoritesService {
  async getFavorites(): Promise<Attraction[]> { ... }
  async addFavorite(attraction: Attraction): Promise<Attraction[]> { ... }
  async removeFavorite(id: string | number): Promise<Attraction[]> { ... }
}

export default new FavoritesService();
```

### Benefits

- **Testability**: Easy to mock and test
- **State Isolation**: Each service manages its own concerns
- **Reusability**: Services can be used across multiple components
- **Maintainability**: Changes to business logic are localized

## Custom Hooks Pattern

### Hook Implementation

Custom hooks encapsulate state and side effects:

```typescript
export const useFavorites = (): UseFavoritesResult => {
  const [favorites, setFavorites] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, []);
  
  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  };
};
```

### Benefits

- **Reusability**: Hooks can be shared across screens
- **Testability**: Hook logic can be tested independently
- **Cleaner Components**: UI components remain focused on rendering
- **Composability**: Hooks can be combined

## Type System

### Core Types

```typescript
interface Attraction {
  id: string | number;
  name: string;
  latitude: number;
  longitude: number;
  type: string;
  distance: number;
  rating: number;
  interestScore?: number;
  interestReason?: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}
```

### Navigation Types

Type-safe navigation using React Navigation:

```typescript
type RootStackParamList = {
  Home: NavigatorScreenParams<TabParamList>;
  Details: { location: string; coordinates?: Coordinates };
  WebView: { name: string };
};
```

## Caching Strategy

### Generic Cache Implementation

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

async getCached<T>(key: string): Promise<T | null> {
  const cached = await this.get<CacheEntry<T>>(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > cached.expiresIn) {
    await this.remove(key);
    return null;
  }
  
  return cached.data;
}
```

### Cache Durations

Defined in constants:
- Attractions: 30 minutes
- AI Descriptions: 7 days
- City Images: 7 days

## Error Handling

### Service Level

Services catch and log errors, returning sensible defaults:

```typescript
async getFavorites(): Promise<Attraction[]> {
  try {
    const favorites = await storageService.get<Attraction[]>(STORAGE_KEYS.FAVORITES);
    return favorites || [];
  } catch (error) {
    console.error('Error loading favorites:', error);
    return [];
  }
}
```

### Hook Level

Hooks expose error state to UI:

```typescript
const [error, setError] = useState<string | null>(null);

try {
  // operation
} catch (err: any) {
  setError(err.message || 'Operation failed');
}
```

## Constants Management

All magic numbers and strings are defined in constants:

```typescript
export const STORAGE_KEYS = {
  FAVORITES: '@travel_guide_favorites',
  INTERESTS: '@travel_guide_interests',
  // ...
} as const;

export const API_ENDPOINTS = {
  OVERPASS: 'https://overpass-api.de/api/interpreter',
  // ...
} as const;

export const CACHE_DURATION = {
  ATTRACTIONS: 30 * 60 * 1000,
  // ...
} as const;
```

## Testing Strategy

### Unit Tests (Future)

- Services can be tested independently
- Mock storage and API calls
- Test error handling and edge cases

### Integration Tests (Future)

- Test hooks with `@testing-library/react-hooks`
- Test component integration with hooks

### Type Checking

Run type checking:
```bash
npm run typecheck
```

## Migration Path

The app is now structured for easy migration:

1. **Old JavaScript files** remain in root directory
2. **New TypeScript code** in `src/` directory
3. **Entry point** (`index.js`) updated to import from `src/App.tsx`
4. **Screens** can be migrated incrementally to TypeScript

## Best Practices Applied

1. **Immutability**: State updates use immutable patterns
2. **Functional Programming**: Prefer pure functions where possible
3. **Async/Await**: Consistent async error handling
4. **Naming Conventions**: Clear, descriptive names
5. **Code Organization**: Logical file and folder structure
6. **Documentation**: Inline comments for complex logic
7. **Type Safety**: Strict TypeScript configuration

## Future Improvements

1. Add unit and integration tests
2. Implement React Context for global state
3. Add more reusable UI components
4. Implement proper error boundaries
5. Add performance monitoring
6. Implement offline-first strategy
7. Add Redux or Zustand for complex state management
