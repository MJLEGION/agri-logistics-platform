// src/constants/index.ts

// API Configuration
export const API_TIMEOUT = 5000; // 5 seconds for faster fallback to mock service
export const API_RETRY_COUNT = 3;
export const TOKEN_REFRESH_THRESHOLD = 300000; // 5 minutes before expiry

// Validation Patterns
export const PHONE_REGEX = /^[0-9]{10,}$/; // Basic phone number validation
export const PASSWORD_MIN_LENGTH = 6;

// Storage Keys
export const STORAGE_TOKEN_KEY = 'token';
export const STORAGE_USER_KEY = 'user';
export const STORAGE_REFRESH_TOKEN_KEY = 'refreshToken';

// Error Messages
export const ERROR_NETWORK_TIMEOUT = 'Network request timed out';
export const ERROR_UNAUTHORIZED = 'Unauthorized - please login again';
export const ERROR_SERVER = 'Server error - please try again later';
export const ERROR_REGISTRATION_FAILED = 'Registration failed';
export const ERROR_LOGIN_FAILED = 'Login failed';

// Success Messages
export const SUCCESS_REGISTRATION = 'Registration successful';
export const SUCCESS_LOGIN = 'Login successful';
export const SUCCESS_LOGOUT = 'Logged out successfully';

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  CROPS: {
    LIST: '/crops',
    GET: (id: string) => `/crops/${id}`,
    CREATE: '/crops',
    UPDATE: (id: string) => `/crops/${id}`,
    DELETE: (id: string) => `/crops/${id}`,
  },
  ORDERS: {
    LIST: '/orders',
    MY_ORDERS: '/orders/my-orders',
    GET: (id: string) => `/orders/${id}`,
    CREATE: '/orders',
    UPDATE: (id: string) => `/orders/${id}`,
    ACCEPT: (id: string) => `/orders/${id}/accept`,
  },
};