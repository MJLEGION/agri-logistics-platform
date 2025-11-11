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
import { getApiUrl, getApiTimeout, log, logError } from '../utils/platformUtils';
import { getErrorMessage, isNetworkError, isTimeoutError, isAuthError } from '../utils/errorHandler';

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

const API_URL = getApiUrl();

// Log the API URL for debugging
log(`API URL (${Platform.OS}):`, API_URL);

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: getApiTimeout(),
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
    log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    logError(error, 'Request Error');
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors and token refresh
 */
api.interceptors.response.use(
  (response) => {
    log(
      `API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`
    );
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response) {
      // Server responded with error
      const errorMessage = getErrorMessage(error);
      logError(error, `API Error: ${error.response.status} - ${errorMessage}`);

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
            // If refresh fails, let the caller handle it (e.g., fall back to mock service)
            logError(error, 'Token refresh failed - caller will handle fallback');
            return Promise.reject(error);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await AsyncStorage.getItem(STORAGE_REFRESH_TOKEN_KEY);
          console.log('🔍 Attempting token refresh - refreshToken exists:', !!refreshToken);
          
          if (!refreshToken) {
            console.error('❌ NO REFRESH TOKEN STORED! Token refresh impossible. User must log in again.');
            logError(error, 'No refresh token available - letting mock service handle this');
            isRefreshing = false;
            return Promise.reject(error);
          }

          console.log('🔄 Calling /auth/refresh with stored refresh token...');
          const response = await axios.post(
            `${API_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
            { refreshToken },
            { timeout: API_TIMEOUT }
          );

          console.log('✅ Token refresh response:', response.data);
          
          const data = response.data.data || response.data;
          const newToken = data.token || response.data.token;
          const newRefreshToken = data.refreshToken || response.data.refreshToken;
          
          if (newToken) {
            console.log('💾 Storing new access token');
            await AsyncStorage.setItem(STORAGE_TOKEN_KEY, newToken);
            
            if (newRefreshToken) {
              console.log('💾 Storing new refresh token');
              await AsyncStorage.setItem(STORAGE_REFRESH_TOKEN_KEY, newRefreshToken);
            }
            
            api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            console.log('✅ Token refreshed successfully, retrying original request');
            processQueue(newToken);
            return api(originalRequest);
          } else {
            console.error('❌ Token refresh response missing token:', response.data);
            return Promise.reject(new Error('Token refresh response missing token'));
          }
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          logError(error, 'Token refresh attempt failed');
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Handle other error codes
      if (error.response.status === 403) {
        logError(error, 'Forbidden - access denied');
      }

      if (error.response.status === 500) {
        logError(error, 'Server error - please try again later');
      }
    } else if (error.request) {
      // Request made but no response
      if (isNetworkError(error)) {
        logError(error, 'Network Error: No response from server');
      } else if (isTimeoutError(error)) {
        logError(error, 'Request timeout');
      } else {
        logError(error, 'Request Error');
      }
    } else {
      // Something else happened
      logError(error, 'Unknown Error');
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
    log('Cleared auth tokens - user should be logged out');
  } catch (error) {
    logError(error, 'Error clearing tokens');
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