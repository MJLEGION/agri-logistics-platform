/**
 * useLocation Hook
 * Real-time GPS tracking for React Native/Expo
 */

import { useState, useEffect, useRef, useCallback, DependencyList } from 'react';
import locationService from '../services/locationService';

interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp?: Date;
  transporterId?: string;
  [key: string]: any;
}

interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number | null;
  heading: number | null;
}

interface GeolocationPosition {
  coords: GeolocationCoordinates;
  timestamp: number;
}

export const useLocation = (enabled: boolean = false, orderId: string | null = null) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const startTracking = useCallback(() => {
    // Check if geolocation is available (for web)
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      setLoading(true);

      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position: GeolocationPosition) => {
          const { latitude, longitude, accuracy } = position.coords;
          const speed = position.coords.speed || 0;
          const heading = position.coords.heading || 0;

          try {
            // Update location on backend
            const response = await locationService.updateLocation(
              latitude,
              longitude,
              {
                accuracy,
                speed: speed * 3.6, // Convert m/s to km/h
                heading,
                orderId: orderId || undefined,
              }
            );

            setLocation({
              latitude,
              longitude,
              accuracy,
              speed: speed * 3.6,
              heading,
              timestamp: new Date(),
              ...response.data,
            });

            setError(null);
            setLoading(false);
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            setLoading(false);
            console.error('Error updating location:', err);
          }
        },
        (err) => {
          const errorMessage = err instanceof Error ? err.message : 'Geolocation error';
          setError(errorMessage);
          setLoading(false);
          console.error('Geolocation error:', err);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000, // Use cached position if < 5 seconds
          timeout: 10000,
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
    }
  }, [orderId]);

  const stopTracking = useCallback(async () => {
    if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (location?.transporterId) {
      try {
        await locationService.stopTracking(location.transporterId);
      } catch (err) {
        console.error('Error stopping tracking:', err);
      }
    }
  }, [location?.transporterId]);

  useEffect(() => {
    if (enabled) {
      startTracking();
    }

    return () => {
      if (
        watchIdRef.current !== null &&
        typeof navigator !== 'undefined' &&
        navigator.geolocation
      ) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [enabled, startTracking]);

  return {
    location,
    error,
    loading,
    startTracking,
    stopTracking,
  };
};