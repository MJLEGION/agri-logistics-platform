import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mockAuthService from './mockAuthService';

/**
 * Register user - tries real API first, falls back to mock
 */
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
        return response.data;
  } catch (error) {
        console.error('API Error:', error.message);
    
    // Fallback to mock auth service
    try {
      const result = await mockAuthService.register(userData);
            return result;
    } catch (mockError) {
      console.error('❌ Mock registration failed:', mockError.message);
      throw new Error(mockError.message);
    }
  }
};

/**
 * Login user - tries real API first, falls back to mock
 */
export const login = async (credentials) => {
  try {
    // Only send phone and password - NOT role
    const response = await api.post('/auth/login', {
      phone: credentials.phone,
      password: credentials.password
    });
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
        return response.data;
  } catch (error) {
        console.error('API Error:', error.message);
    
    // Fallback to mock auth service
    try {
      const result = await mockAuthService.login(credentials);
            return result;
    } catch (mockError) {
      console.error('❌ Mock login failed:', mockError.message);
      throw new Error(mockError.message);
    }
  }
};

/**
 * Logout user
 */
export const logout = async () => {
  await AsyncStorage.removeItem('token');
  await mockAuthService.logout();
};

/**
 * Get current user - tries real API first, falls back to mock
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
        // Fallback to mock auth service
    return await mockAuthService.getCurrentUser();
  }
};

/**
 * Initialize mock users on app start
 */
export const initializeAuth = async () => {
  try {
    await mockAuthService.initializeMockUsers();
      } catch (error) {
    console.error('❌ Error initializing mock auth:', error);
  }
};

/**
 * Initialize all mock services (auth, orders, crops)
 */
export const initializeAllServices = async () => {
  try {
    await mockAuthService.initializeMockUsers();
    // Note: mockOrderService and mockCropService don't need explicit initialization
    // as they use default data, but you can add them if needed
      } catch (error) {
    console.error('❌ Error initializing mock services:', error);
  }
};