/**
 * useDistance Hook
 * Calculate distance between two points
 */

import { useState, useCallback } from 'react';
import locationService from '../services/locationService';

interface DistanceResult {
  distanceKm?: number;
  etaMinutes?: number;
  duration?: string;
  [key: string]: any;
}

export const useDistance = () => {
  const [distance, setDistance] = useState<DistanceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback(
    async (lat1: number, lon1: number, lat2: number, lon2: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await locationService.calculateDistance(
          lat1,
          lon1,
          lat2,
          lon2
        );

        setDistance(response.data || null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Calculation failed';
        setError(errorMessage);
        setDistance(null);
        console.error('Error calculating distance:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clear = useCallback(() => {
    setDistance(null);
    setError(null);
  }, []);

  return {
    distance,
    loading,
    error,
    calculate,
    clear,
  };
};