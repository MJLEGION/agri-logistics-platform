// src/api/axios.config.ts
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { getApiUrl, getApiTimeout } from '../utils/platformUtils';

const api = axios.create({
  baseURL: API_BASE_URL || getApiUrl(),
  timeout: getApiTimeout(),
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