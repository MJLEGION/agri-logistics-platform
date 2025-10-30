/**
 * Location Service
 * Handles all location tracking and geospatial operations
 */

import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

interface LocationMetadata {
  address?: string;
  speed?: number;
  accuracy?: number;
  heading?: number;
  orderId?: string;
}

interface LocationData extends LocationCoordinates {
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp?: Date;
  address?: string;
}

interface NearbySearchFilters {
  limit?: number;
  offset?: number;
  orderId?: string;
  radiusKm?: number;
  minPrice?: number;
  maxPrice?: number;
  cropType?: string;
}

interface CargoSearchFilters {
  radiusKm?: number;
  minPrice?: number;
  maxPrice?: number;
  cropType?: string;
}

class LocationService {
  private apiClient: AxiosInstance;
  private token: string | null = null;

  constructor() {
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

    this.apiClient = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth interceptor
    this.apiClient.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired
          await AsyncStorage.removeItem('authToken');
        }
        return Promise.reject(error);
      }
    );

    this.initializeToken();
  }

  private async initializeToken() {
    this.token = await AsyncStorage.getItem('authToken');
  }

  public setToken(token: string) {
    this.token = token;
    this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // ===== Location Tracking =====

  /**
   * Update user location on backend
   */
  async updateLocation(
    latitude: number,
    longitude: number,
    metadata: LocationMetadata = {}
  ) {
    try {
      const response = await this.apiClient.post('/location/update-location', {
        latitude,
        longitude,
        address: metadata.address,
        speed: metadata.speed,
        accuracy: metadata.accuracy,
        heading: metadata.heading,
        orderId: metadata.orderId,
      });

      return response.data;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }

  /**
   * Get location history for a transporter
   */
  async getLocationHistory(transporterId: string, filters: NearbySearchFilters = {}) {
    try {
      const params = new URLSearchParams();
      params.append('limit', String(filters.limit || 100));
      params.append('offset', String(filters.offset || 0));

      if (filters.orderId) {
        params.append('orderId', filters.orderId);
      }

      const response = await this.apiClient.get(
        `/location/history/${transporterId}?${params}`
      );

      return response.data;
    } catch (error) {
      console.error('Error getting location history:', error);
      throw error;
    }
  }

  /**
   * Get all active locations
   */
  async getActiveLocations() {
    try {
      const response = await this.apiClient.get('/location/active');
      return response.data;
    } catch (error) {
      console.error('Error getting active locations:', error);
      throw error;
    }
  }

  /**
   * Stop tracking for a transporter
   */
  async stopTracking(transporterId: string) {
    try {
      const response = await this.apiClient.post('/location/stop-tracking', {
        transporterId,
      });

      return response.data;
    } catch (error) {
      console.error('Error stopping tracking:', error);
      throw error;
    }
  }

  // ===== Nearby Search =====

  /**
   * Find nearby cargo
   */
  async findNearbyCargo(
    latitude: number,
    longitude: number,
    radiusKm: number = 50
  ) {
    try {
      const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        radiusKm: String(radiusKm),
      });

      const response = await this.apiClient.get(
        `/location/nearby-cargo?${params}`
      );

      return response.data;
    } catch (error) {
      console.error('Error finding nearby cargo:', error);
      throw error;
    }
  }

  /**
   * Find nearby transporters
   */
  async findNearbyTransporters(
    latitude: number,
    longitude: number,
    radiusKm: number = 50
  ) {
    try {
      const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        radiusKm: String(radiusKm),
      });

      const response = await this.apiClient.get(
        `/location/nearby-transporters?${params}`
      );

      return response.data;
    } catch (error) {
      console.error('Error finding nearby transporters:', error);
      throw error;
    }
  }

  /**
   * Find nearby orders
   */
  async findNearbyOrders(
    latitude: number,
    longitude: number,
    radiusKm: number = 50
  ) {
    try {
      const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        radiusKm: String(radiusKm),
      });

      const response = await this.apiClient.get(
        `/location/nearby-orders?${params}`
      );

      return response.data;
    } catch (error) {
      console.error('Error finding nearby orders:', error);
      throw error;
    }
  }

  /**
   * Search cargo with filters
   */
  async searchCargo(
    latitude: number,
    longitude: number,
    filters: CargoSearchFilters = {}
  ) {
    try {
      const response = await this.apiClient.post('/location/search-cargo', {
        latitude,
        longitude,
        radiusKm: filters.radiusKm || 50,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        cropType: filters.cropType,
      });

      return response.data;
    } catch (error) {
      console.error('Error searching cargo:', error);
      throw error;
    }
  }

  // ===== Distance & Calculations =====

  /**
   * Calculate distance between two points
   */
  async calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) {
    try {
      const response = await this.apiClient.post('/location/distance', {
        lat1,
        lon1,
        lat2,
        lon2,
      });

      return response.data;
    } catch (error) {
      console.error('Error calculating distance:', error);
      throw error;
    }
  }

  /**
   * Get bounds for a location and radius
   */
  async getBounds(latitude: number, longitude: number, radiusKm: number) {
    try {
      const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        radiusKm: String(radiusKm),
      });

      const response = await this.apiClient.get(
        `/location/bounds?${params}`
      );

      return response.data;
    } catch (error) {
      console.error('Error getting bounds:', error);
      throw error;
    }
  }
}

export default new LocationService();