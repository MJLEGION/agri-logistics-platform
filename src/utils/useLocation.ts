/**
 * useLocation Hook
 * Real-time GPS tracking with continuous updates to backend
 * Supports both watchPosition and interval-based polling
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import locationService from '../services/locationService';

interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp?: Date;
  transporterId?: string;
  address?: string;
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

interface UseLocationOptions {
  enabled?: boolean;
  orderId?: string | null;
  updateInterval?: number; // Interval in ms for sending updates to backend (default: 5000ms)
  watchOptions?: PositionOptions;
}

export const useLocation = ({
  enabled = false,
  orderId = null,
  updateInterval = 5000, // Send updates every 5 seconds
  watchOptions = {
    enableHighAccuracy: true,
    maximumAge: 3000, // Use cached position if < 3 seconds
    timeout: 10000,
  },
}: UseLocationOptions) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastLocationRef = useRef<GeolocationPosition | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  // Send location update to backend
  const sendLocationToBackend = useCallback(async (loc: Location) => {
    try {
      const response = await locationService.updateLocation(
        loc.latitude,
        loc.longitude,
        {
          accuracy: loc.accuracy,
          speed: loc.speed,
          heading: loc.heading,
          orderId: orderId || undefined,
          address: loc.address,
        }
      );

      console.log('✅ Location sent to backend:', { lat: loc.latitude, lng: loc.longitude });
      return response.data;
    } catch (err) {
      console.error('❌ Error sending location to backend:', err);
      throw err;
    }
  }, [orderId]);

  const startTracking = useCallback(() => {
    if (isTracking) return; // Already tracking

    // Check if geolocation is available
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      const err = 'Geolocation is not supported by this browser';
      setError(err);
      console.error(err);
      return;
    }

    setLoading(true);
    setIsTracking(true);
    console.log('📍 Starting real-time GPS tracking with', updateInterval, 'ms interval');

    // Watch position continuously
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position: GeolocationPosition) => {
        const { latitude, longitude, accuracy } = position.coords;
        const speed = (position.coords.speed || 0) * 3.6; // Convert m/s to km/h
        const heading = position.coords.heading || 0;

        lastLocationRef.current = position;
        const now = Date.now();

        const newLocation: Location = {
          latitude,
          longitude,
          accuracy,
          speed,
          heading,
          timestamp: new Date(),
        };

        setLocation(newLocation);
        setError(null);
        setLoading(false);

        // Send to backend if enough time has passed
        if (now - lastUpdateTimeRef.current >= updateInterval) {
          lastUpdateTimeRef.current = now;
          try {
            await sendLocationToBackend(newLocation);
          } catch (err) {
            console.error('Failed to update backend:', err);
          }
        }
      },
      (err) => {
        const errorMessage = err.message || 'Geolocation error';
        setError(errorMessage);
        setLoading(false);
        console.error('❌ Geolocation error:', errorMessage);
      },
      watchOptions
    );

    // Additional interval-based backup to ensure backend updates even if position doesn't change
    updateIntervalRef.current = setInterval(async () => {
      if (lastLocationRef.current) {
        const pos = lastLocationRef.current;
        const { latitude, longitude, accuracy } = pos.coords;
        const speed = (pos.coords.speed || 0) * 3.6;
        const heading = pos.coords.heading || 0;

        const locToSend: Location = {
          latitude,
          longitude,
          accuracy,
          speed,
          heading,
          timestamp: new Date(),
        };

        try {
          await sendLocationToBackend(locToSend);
        } catch (err) {
          console.error('Interval update failed:', err);
        }
      }
    }, updateInterval);

  }, [isTracking, updateInterval, watchOptions, sendLocationToBackend]);

  const stopTracking = useCallback(async () => {
    console.log('🛑 Stopping GPS tracking');
    
    // Clear watch
    if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // Clear interval
    if (updateIntervalRef.current !== null) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }

    setIsTracking(false);
    lastLocationRef.current = null;

    // Notify backend that tracking stopped
    if (location?.transporterId) {
      try {
        await locationService.stopTracking(location.transporterId);
      } catch (err) {
        console.error('Error stopping tracking on backend:', err);
      }
    }
  }, [location?.transporterId]);

  useEffect(() => {
    if (enabled) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      // Cleanup
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (updateIntervalRef.current !== null) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [enabled, startTracking, stopTracking]);

  return {
    location,
    error,
    loading,
    isTracking,
    startTracking,
    stopTracking,
  };
};