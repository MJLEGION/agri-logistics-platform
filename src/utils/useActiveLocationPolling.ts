/**
 * useActiveLocationPolling Hook
 * Real-time polling of active transporter locations from backend
 * 
 * Usage:
 * const activeLocations = useActiveLocationPolling(enabled, 3000);
 */

import { useState, useEffect, useRef } from 'react';
import locationService from '../services/locationService';

interface ActiveLocation {
  transporterId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  address?: string;
  timestamp?: Date;
  [key: string]: any;
}

interface UseActiveLocationPollingOptions {
  enabled?: boolean;
  pollingInterval?: number; // milliseconds
  onError?: (error: Error) => void;
}

export const useActiveLocationPolling = (
  {
    enabled = false,
    pollingInterval = 3000, // Default: poll every 3 seconds
    onError,
  }: UseActiveLocationPollingOptions = {}
) => {
  const [activeLocations, setActiveLocations] = useState<ActiveLocation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    const pollLocations = async () => {
      try {
        setIsLoading(true);
        const response = await locationService.getActiveLocations();

        if (response?.data && Array.isArray(response.data)) {
          setActiveLocations(response.data);
          setError(null);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to poll locations';
        setError(errorMsg);
        console.error('❌ Error polling active locations:', err);
        
        if (onError && err instanceof Error) {
          onError(err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Poll immediately
    pollLocations();

    // Then set up interval
    pollingIntervalRef.current = setInterval(pollLocations, pollingInterval);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [enabled, pollingInterval, onError]);

  // Helper to find location by transporter ID
  const getLocationByTransporterId = (transporterId: string): ActiveLocation | undefined => {
    return activeLocations.find((loc) => loc.transporterId === transporterId);
  };

  // Helper to get all locations within a radius
  const getLocationsWithinRadius = (
    centerLat: number,
    centerLng: number,
    radiusKm: number
  ): ActiveLocation[] => {
    const earthRadiusKm = 6371;

    return activeLocations.filter((loc) => {
      const dLat = (loc.latitude - centerLat) * (Math.PI / 180);
      const dLng = (loc.longitude - centerLng) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(centerLat * (Math.PI / 180)) *
          Math.cos(loc.latitude * (Math.PI / 180)) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = earthRadiusKm * c;

      return distance <= radiusKm;
    });
  };

  return {
    activeLocations,
    error,
    isLoading,
    getLocationByTransporterId,
    getLocationsWithinRadius,
  };
};