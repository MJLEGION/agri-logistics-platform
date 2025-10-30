/**
 * NearbySearch Component
 * Search for nearby cargo, transporters, and orders
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  Picker,
} from 'react-native';
import { useNearbySearch } from '../utils/useNearbySearch';

interface Location {
  latitude: number;
  longitude: number;
}

interface NearbySearchProps {
  userLocation?: Location | null;
  onSelectItem?: (item: any) => void;
}

type SearchType = 'cargo' | 'transporters' | 'orders';

export const NearbySearch: React.FC<NearbySearchProps> = ({
  userLocation,
  onSelectItem,
}) => {
  const { results, loading, error, searchNearby, clearResults } = useNearbySearch();
  const [searchType, setSearchType] = useState<SearchType>('cargo');
  const [radiusKm, setRadiusKm] = useState('50');

  const handleSearch = () => {
    if (!userLocation) {
      alert('User location not available');
      return;
    }

    searchNearby(
      searchType,
      userLocation.latitude,
      userLocation.longitude,
      parseInt(radiusKm) || 50
    );
  };

  const handleClear = () => {
    clearResults();
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => onSelectItem && onSelectItem(item)}
    >
      <View>
        <Text style={styles.itemTitle}>{item.name || item.title}</Text>
        <Text style={styles.itemDescription}>
          {item.distance ? `${item.distance.toFixed(1)} km away` : ''}
        </Text>
        {item.price && <Text style={styles.itemPrice}>₦{item.price}</Text>}
        {item.rating && (
          <Text style={styles.itemRating}>⭐ {item.rating.toFixed(1)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Nearby</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.controlsContainer}>
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Type:</Text>
          <Picker
            selectedValue={searchType}
            onValueChange={(value: any) => setSearchType(value)}
            style={styles.picker}
          >
            <Picker.Item label="Cargo" value="cargo" />
            <Picker.Item label="Transporters" value="transporters" />
            <Picker.Item label="Orders" value="orders" />
          </Picker>
        </View>

        <View style={styles.radiusContainer}>
          <Text style={styles.label}>Radius (km):</Text>
          <TextInput
            style={styles.radiusInput}
            value={radiusKm}
            onChangeText={setRadiusKm}
            keyboardType="numeric"
            placeholder="50"
          />
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={handleSearch}
          disabled={!userLocation}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Searching...' : 'Search'}
          </Text>
        </TouchableOpacity>

        {results.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id || String(index)}
        scrollEnabled={false}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>
              {results.length === 0 ? 'No results found' : ''}
            </Text>
          ) : null
        }
        style={styles.resultsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderRadius: 4,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
  },
  controlsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  pickerContainer: {
    flex: 1,
  },
  radiusContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  picker: {
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  radiusInput: {
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  searchBtn: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  clearBtn: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: '#0c5460',
    fontSize: 14,
    marginTop: 8,
  },
  resultsList: {
    marginTop: 12,
  },
  resultItem: {
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 2,
  },
  itemRating: {
    fontSize: 12,
    color: '#ffa500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 20,
  },
});