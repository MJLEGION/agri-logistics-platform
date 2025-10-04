// src/api/axios.config.ts
import axios from 'axios';
import { API_BASE_URL } from '@env';

const api = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    // Token will be added here later from AsyncStorage
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;