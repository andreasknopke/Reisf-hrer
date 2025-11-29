import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { getNearbyAttractions, searchWikitravelLocations } from '../api';

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const [location, setLocation] = useState(null);
  const [attractions, setAttractions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert(t('locationPermissionDenied'));
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      loadNearbyAttractions(currentLocation.coords.latitude, currentLocation.coords.longitude);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadNearbyAttractions = async (lat, lng) => {
    setLoading(true);
    try {
      const nearby = await getNearbyAttractions(lat, lng);
      setAttractions(nearby);
    } catch (error) {
      console.error('Error loading attractions:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getCurrentLocation();
    setRefreshing(false);
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.length > 2) {
      setLoading(true);
      const results = await searchWikitravelLocations(text);
      setSearchResults(results);
      setLoading(false);
    } else {
      setSearchResults([]);
    }
  };

  const selectLocation = (item) => {
    navigation.navigate('Details', { location: item.title });
    setSearchQuery('');
    setSearchResults([]);
  };

  const renderAttraction = ({ item }) => (
    <TouchableOpacity
      style={styles.attractionCard}
      onPress={() => navigation.navigate('Details', { location: item.name, coordinates: { lat: item.latitude, lng: item.longitude } })}
    >
      <View style={styles.attractionInfo}>
        <Text style={styles.attractionName}>{item.name}</Text>
        <Text style={styles.attractionType}>{item.type}</Text>
        <Text style={styles.attractionDistance}>
          {t('distance')}: {item.distance}m
        </Text>
      </View>
      <View style={styles.ratingContainer}>
        <Text style={styles.rating}>⭐ {item.rating}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => selectLocation(item)}
    >
      <Text style={styles.searchResultTitle}>{item.title}</Text>
      <Text style={styles.searchResultDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item, index) => index.toString()}
          style={styles.searchResultsList}
        />
      )}

      {searchResults.length === 0 && (
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>{t('nearbyAttractions')}</Text>
            {location && (
              <Text style={styles.locationText}>
                📍 {t('currentLocation')}: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            )}
          </View>

          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
          ) : (
            <FlatList
              data={attractions}
              renderItem={renderAttraction}
              keyExtractor={(item) => item.id.toString()}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListEmptyComponent={
                <Text style={styles.emptyText}>{t('noAttractionsFound')}</Text>
              }
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  headerContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  attractionCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  attractionInfo: {
    flex: 1,
  },
  attractionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  attractionType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  attractionDistance: {
    fontSize: 14,
    color: '#999',
  },
  ratingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
  searchResultsList: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchResultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  searchResultDescription: {
    fontSize: 14,
    color: '#666',
  },
});
