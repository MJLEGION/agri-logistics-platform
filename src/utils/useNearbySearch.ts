/**
 * useNearbySearch Hook
 * Search for nearby cargo, transporters, and orders
 */

import { useState, useCallback } from 'react';
import locationService from '../services/locationService';

interface SearchFilters {
  radiusKm?: number;
  minPrice?: number;
  maxPrice?: number;
  cropType?: string;
}

interface NearbyResult {
  id: string;
  [key: string]: any;
}

type SearchType = 'cargo' | 'transporters' | 'orders';

export const useNearbySearch = () => {
  const [results, setResults] = useState<NearbyResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchNearby = useCallback(
    async (
      type: SearchType = 'cargo',
      latitude: number,
      longitude: number,
      radiusKm: number = 50
    ) => {
      setLoading(true);
      setError(null);

      try {
        let response;

        switch (type) {
          case 'cargo':
            response = await locationService.findNearbyCargo(
              latitude,
              longitude,
              radiusKm
            );
            break;
          case 'transporters':
            response = await locationService.findNearbyTransporters(
              latitude,
              longitude,
              radiusKm
            );
            break;
          case 'orders':
            response = await locationService.findNearbyOrders(
              latitude,
              longitude,
              radiusKm
            );
            break;
          default:
            throw new Error('Invalid search type');
        }

        const data = response.data || [];
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Search failed';
        setError(errorMessage);
        setResults([]);
        console.error(`Error searching for nearby ${type}:`, err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const searchCargo = useCallback(
    async (
      latitude: number,
      longitude: number,
      filters: SearchFilters = {}
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response = await locationService.searchCargo(latitude, longitude, filters);
        const data = response.data || [];
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Search failed';
        setError(errorMessage);
        setResults([]);
        console.error('Error searching cargo:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    searchNearby,
    searchCargo,
    clearResults,
  };
};