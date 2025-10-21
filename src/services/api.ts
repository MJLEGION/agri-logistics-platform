// src/services/api.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  API_TIMEOUT,
  STORAGE_TOKEN_KEY,
  STORAGE_REFRESH_TOKEN_KEY,
  API_ENDPOINTS,
} from '../constants';

/**
 * API Response Types
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface AuthResponse {
  token: string;
  refreshToken?: string;
  user?: any;
}

/**
 * Automatically detect platform and use correct API URL
 */
const getApiUrl = (): string => {
  // For web, always use localhost
  if (Platform.OS === 'web') {
    return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
  }

  // For mobile (iOS/Android), use mobile IP or localhost
  return (
    process.env.EXPO_PUBLIC_API_URL_MOBILE ||
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.API_BASE_URL ||
    'http://192.168.1.64:5000/api'
  );
};

const API_URL = getApiUrl();

// Log the API URL for debugging
console.log(`🌐 API URL (${Platform.OS}):`, API_URL);

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_TIMEOUT,
});

/**
 * Flag to prevent multiple refresh attempts
 */
let isRefreshing = false;
let failedQueue: Array<(token: string) => void> = [];

/**
 * Process the queue of failed requests after token refresh
 */
const processQueue = (token: string): void => {
  failedQueue.forEach((callback) => callback(token));
  failedQueue = [];
};

/**
 * Request interceptor - Add token to requests
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem(STORAGE_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error.message);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors and token refresh
 */
api.interceptors.response.use(
  (response) => {
    console.log(
      `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`
    );
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response) {
      // Server responded with error
      console.error(
        `❌ API Error: ${error.response.status} - ${
          (error.response.data as any)?.message || error.message
        }`
      );
      console.error('Error details:', error.response.data);

      // Handle 401 Unauthorized - attempt token refresh
      if (error.response.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Queue the request to be retried after refresh
          return new Promise((resolve, reject) => {
            failedQueue.push((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            });
          }).catch(() => {
            // If refresh fails, redirect to login
            handleTokenRefreshFailure();
            return Promise.reject(error);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await AsyncStorage.getItem(STORAGE_REFRESH_TOKEN_KEY);
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Attempt to refresh token
          const response = await axios.post(
            `${API_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
            { refreshToken },
            { timeout: API_TIMEOUT }
          );

          const newToken = response.data.token;
          if (newToken) {
            await AsyncStorage.setItem(STORAGE_TOKEN_KEY, newToken);
            api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            processQueue(newToken);
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          handleTokenRefreshFailure();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Handle other error codes
      if (error.response.status === 403) {
        console.error('❌ Forbidden - access denied');
      }

      if (error.response.status === 500) {
        console.error('❌ Server error - please try again later');
      }
    } else if (error.request) {
      // Request made but no response
      console.error('❌ Network Error: No response from server');
      console.error('Request:', error.request);
    } else {
      // Something else happened
      console.error('❌ Error:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * Handle token refresh failure - clear auth state and redirect to login
 */
const handleTokenRefreshFailure = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_TOKEN_KEY);
    await AsyncStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
    // Note: Navigation to login screen should be handled by Redux auth state
    console.log('🔐 Cleared auth tokens - user should be logged out');
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

/**
 * Helper to get the auth token
 */
export const getAuthToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(STORAGE_TOKEN_KEY);
};

/**
 * Helper to set the auth token
 */
export const setAuthToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_TOKEN_KEY, token);
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
};

/**
 * Helper to clear auth
 */
export const clearAuth = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_TOKEN_KEY);
  await AsyncStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
  delete api.defaults.headers.common.Authorization;
};

export default api;