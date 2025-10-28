// src/services/authService.ts
import api, { setAuthToken, clearAuth } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mockAuthService from './mockAuthService';
import { LoginCredentials, RegisterData, User } from '../types';
import { STORAGE_TOKEN_KEY, ERROR_REGISTRATION_FAILED, ERROR_LOGIN_FAILED } from '../constants';

/**
 * Auth Response Type
 */
interface AuthResponse {
  token: string;
  refreshToken?: string;
  user?: User;
}

/**
 * Check if mock auth is forced (useful for testing without backend)
 */
const isMockAuthForced = (): boolean => {
  const forceMock = process.env.FORCE_MOCK_AUTH || process.env.EXPO_PUBLIC_FORCE_MOCK_AUTH;
  return forceMock === 'true';
};

/**
 * Register user - tries real API first, falls back to mock
 */
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  // Check if mock auth is forced
  if (isMockAuthForced()) {
    console.log('🔧 FORCE_MOCK_AUTH is enabled - using mock service only');
    try {
      await mockAuthService.initializeMockUsers();
      const result = await mockAuthService.register(userData);
      
      if (result.token) {
        await setAuthToken(result.token);
        console.log('🔑 Auth token stored from mock service');
      }
      
      console.log('✅ Registration successful (Mock Service)');
      return result;
    } catch (mockError) {
      const errorMessage = mockError instanceof Error ? mockError.message : ERROR_REGISTRATION_FAILED;
      console.error('❌ Mock registration failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  try {
    console.log('📝 Attempting registration with real API...');
    const response = await api.post<AuthResponse>('/auth/register', userData);

    if (response.data.token) {
      await setAuthToken(response.data.token);
    }

    console.log('✅ Registration successful (Real API)');
    return response.data;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock auth service...');
    console.error('API Error:', error instanceof Error ? error.message : 'Unknown error');

    // Fallback to mock auth service
    try {
      // ⚠️ CRITICAL: Ensure mock users are initialized before registration
      console.log('🔄 Ensuring mock users are initialized...');
      await mockAuthService.initializeMockUsers();
      
      const result = await mockAuthService.register(userData);
      
      // ⚠️ CRITICAL: Store token from mock service as well
      if (result.token) {
        await setAuthToken(result.token);
        console.log('🔑 Auth token stored from mock service');
      }
      
      console.log('✅ Registration successful (Mock Service)');
      return result;
    } catch (mockError) {
      const errorMessage = mockError instanceof Error ? mockError.message : ERROR_REGISTRATION_FAILED;
      console.error('❌ Mock registration failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }
};

/**
 * Login user - tries real API first, falls back to mock
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  // Check if mock auth is forced
  if (isMockAuthForced()) {
    console.log('🔧 FORCE_MOCK_AUTH is enabled - using mock service only');
    try {
      await mockAuthService.initializeMockUsers();
      const result = await mockAuthService.login(credentials);
      
      if (result.token) {
        await setAuthToken(result.token);
        console.log('🔑 Auth token stored from mock service');
      }
      
      console.log('✅ Login successful (Mock Service)');
      return result;
    } catch (mockError) {
      const errorMessage = mockError instanceof Error ? mockError.message : ERROR_LOGIN_FAILED;
      console.error('❌ Mock login failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  try {
    console.log('🔐 Attempting login with real API...');
    // Only send phone and password - NOT role
    const response = await api.post<AuthResponse>('/auth/login', {
      phone: credentials.phone,
      password: credentials.password,
    });

    if (response.data.token) {
      await setAuthToken(response.data.token);
    }

    console.log('✅ Login successful (Real API)');
    return response.data;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock auth service...');
    console.error('API Error:', error instanceof Error ? error.message : 'Unknown error');

    // Fallback to mock auth service
    try {
      // ⚠️ CRITICAL: Ensure mock users are initialized before login
      console.log('🔄 Ensuring mock users are initialized...');
      await mockAuthService.initializeMockUsers();
      
      const result = await mockAuthService.login(credentials);
      
      // ⚠️ CRITICAL: Store token from mock service as well
      if (result.token) {
        await setAuthToken(result.token);
        console.log('🔑 Auth token stored from mock service');
      }
      
      console.log('✅ Login successful (Mock Service)');
      return result;
    } catch (mockError) {
      const errorMessage = mockError instanceof Error ? mockError.message : ERROR_LOGIN_FAILED;
      console.error('❌ Mock login failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  await clearAuth();
  await mockAuthService.logout();
};

/**
 * Get current user - tries real API first, falls back to mock
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await api.get<User>('/auth/me');
    return response.data;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock service...');
    // Fallback to mock auth service
    return await mockAuthService.getCurrentUser();
  }
};

/**
 * Initialize mock users on app start
 */
export const initializeAuth = async (): Promise<void> => {
  try {
    console.log('🔄 Initializing mock auth service...');
    await mockAuthService.initializeMockUsers();
    console.log('✅ Mock auth initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing mock auth:', error instanceof Error ? error.message : 'Unknown error');
  }
};

/**
 * Initialize all mock services (auth, orders, crops)
 */
export const initializeAllServices = async (): Promise<void> => {
  try {
    console.log('🚀 Initializing all mock services...');
    
    // Initialize auth first - this loads/resets mock users
    console.log('  → Initializing mock auth...');
    await mockAuthService.initializeMockUsers();
    console.log('  ✅ Mock auth initialized');
    
    // Initialize cargo service to load persisted data from AsyncStorage
    console.log('  → Initializing mock cargo service...');
    const mockCargoService = await import('./mockCargoService').then(m => m.default);
    if (mockCargoService?.initializeMockCargo) {
      await mockCargoService.initializeMockCargo();
      console.log('  ✅ Mock cargo service initialized');
    }
    
    console.log('✅ All mock services initialized successfully');
  } catch (error) {
    console.error(
      '❌ Error initializing mock services:',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};