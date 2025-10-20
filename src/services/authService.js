import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mockAuthService from './mockAuthService';

/**
 * Register user - tries real API first, falls back to mock
 */
export const register = async (userData) => {
  try {
    console.log('📝 Attempting registration with real API...');
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
    console.log('✅ Registration successful (Real API)');
    return response.data;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock auth service...');
    console.error('API Error:', error.message);
    
    // Fallback to mock auth service
    try {
      const result = await mockAuthService.register(userData);
      console.log('✅ Registration successful (Mock Service)');
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
    console.log('🔐 Attempting login with real API...');
    // Only send phone and password - NOT role
    const response = await api.post('/auth/login', {
      phone: credentials.phone,
      password: credentials.password
    });
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
    console.log('✅ Login successful (Real API)');
    return response.data;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock auth service...');
    console.error('API Error:', error.message);
    
    // Fallback to mock auth service
    try {
      const result = await mockAuthService.login(credentials);
      console.log('✅ Login successful (Mock Service)');
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
    console.log('⚠️ Real API failed, using mock service...');
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
    console.log('✅ Mock auth initialized');
  } catch (error) {
    console.error('❌ Error initializing mock auth:', error);
  }
};

/**
 * Initialize all mock services (auth, orders, crops)
 */
export const initializeAllServices = async () => {
  try {
    console.log('🚀 Initializing all mock services...');
    await mockAuthService.initializeMockUsers();
    // Note: mockOrderService and mockCropService don't need explicit initialization
    // as they use default data, but you can add them if needed
    console.log('✅ All mock services initialized');
  } catch (error) {
    console.error('❌ Error initializing mock services:', error);
  }
};