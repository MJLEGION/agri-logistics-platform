import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Automatically detect platform and use correct API URL
const getApiUrl = () => {
  // For web, always use localhost
  if (Platform.OS === 'web') {
    return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
  }
  
  // For mobile (iOS/Android), use mobile IP or localhost
  return process.env.EXPO_PUBLIC_API_URL_MOBILE || 
         process.env.EXPO_PUBLIC_API_URL || 
         process.env.API_BASE_URL || 
         'http://192.168.1.64:5000/api';
};

const API_URL = getApiUrl();

// Log the API URL for debugging

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // 5 second timeout for faster fallback to mock service
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error logging
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error(`❌ API Error: ${error.response.status} - ${error.response.data?.message || error.message}`);
      console.error('Error details:', error.response.data);
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

export default api;