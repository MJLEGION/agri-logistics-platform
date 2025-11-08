// src/services/authService.ts
import api, { setAuthToken, clearAuth } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginCredentials, RegisterData, User } from '../types';
import { STORAGE_TOKEN_KEY, ERROR_REGISTRATION_FAILED, ERROR_LOGIN_FAILED } from '../constants';
import { logger } from '../utils/logger';

/**
 * Backend Auth Response Type
 * Matches: Node.js + Express backend response format
 */
interface BackendAuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

/**
 * Internal Auth Response Type (for compatibility)
 */
interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

/**
 * Map frontend role to backend role
 * Frontend uses: 'shipper' | 'transporter'
 * Backend expects: 'farmer' | 'buyer' | 'transporter'
 */
const mapFrontendRoleToBackend = (role: string): string => {
  if (role === 'shipper') {
    return 'farmer'; // Map shipper to farmer in backend
  }
  return role; // transporter stays the same
};

/**
 * Map backend role to frontend role
 * Backend returns: 'farmer' | 'buyer' | 'transporter'
 * Frontend uses: 'shipper' | 'transporter'
 */
const mapBackendRoleToFrontend = (role: string): string => {
  if (role === 'farmer' || role === 'buyer') {
    return 'shipper'; // Map farmer/buyer to shipper in frontend
  }
  return role; // transporter stays the same
};

/**
 * Register user - connects to real backend API
 */
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    logger.info('Registering user', { phone: userData.phone, role: userData.role });

    // Map frontend role to backend role
    const backendRole = mapFrontendRoleToBackend(userData.role);

    const payload = {
      ...userData,
      role: backendRole,
    };

    const response = await api.post<BackendAuthResponse>('/auth/register', payload);

    if (!response.data.success) {
      throw new Error(response.data.message || ERROR_REGISTRATION_FAILED);
    }

    if (response.data.token) {
      await setAuthToken(response.data.token);
      logger.info('Registration successful', { userId: response.data.user._id });
    }

    // Map backend role to frontend role
    const user = {
      ...response.data.user,
      role: mapBackendRoleToFrontend(response.data.user.role) as any,
    };

    // Return in compatible format
    return {
      token: response.data.token,
      user,
    };
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || ERROR_REGISTRATION_FAILED;
    logger.error('Registration failed', error);
    throw new Error(errorMessage);
  }
};

/**
 * Login user - connects to real backend API
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    logger.info('Logging in user', { phone: credentials.phone });

    // Only send phone and password - NOT role (backend determines role from user record)
    const response = await api.post<BackendAuthResponse>('/auth/login', {
      phone: credentials.phone,
      password: credentials.password,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || ERROR_LOGIN_FAILED);
    }

    if (response.data.token) {
      await setAuthToken(response.data.token);
      logger.info('Login successful', { userId: response.data.user._id, role: response.data.user.role });
    }

    // Map backend role to frontend role
    const user = {
      ...response.data.user,
      role: mapBackendRoleToFrontend(response.data.user.role) as any,
    };

    // Return in compatible format
    return {
      token: response.data.token,
      user,
    };
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || ERROR_LOGIN_FAILED;
    logger.error('Login failed', error);
    throw new Error(errorMessage);
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  logger.info('Logging out user');
  await clearAuth();
};

/**
 * Get current user - fetches from real backend API
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    logger.debug('Fetching current user from API');
    const response = await api.get<User>('/auth/me');
    logger.debug('Current user fetched successfully');

    // Map backend role to frontend role
    const user = {
      ...response.data,
      role: mapBackendRoleToFrontend(response.data.role) as any,
    };

    return user;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to get current user';
    logger.error('Failed to fetch current user', error);
    throw new Error(errorMessage);
  }
};

/**
 * Refresh authentication token
 */
export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
  try {
    logger.debug('Refreshing authentication token');
    const response = await api.post<BackendAuthResponse>('/auth/refresh', { refreshToken });

    if (response.data.token) {
      await setAuthToken(response.data.token);
      logger.info('Token refreshed successfully');
    }

    // Map backend role to frontend role
    const user = {
      ...response.data.user,
      role: mapBackendRoleToFrontend(response.data.user.role) as any,
    };

    return {
      token: response.data.token,
      user,
    };
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to refresh token';
    logger.error('Token refresh failed', error);
    throw new Error(errorMessage);
  }
};