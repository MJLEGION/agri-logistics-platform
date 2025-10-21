// Platform-specific utilities
import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

/**
 * Get platform-specific styles
 */
export const getPlatformSpecificStyles = (web: any, mobile: any) => {
  return isWeb ? web : mobile;
};

/**
 * Get platform-specific value
 */
export const getPlatformValue = <T>(web: T, mobile: T): T => {
  return isWeb ? web : mobile;
};

/**
 * Check if feature is supported on current platform
 */
export const isFeatureSupported = (feature: 'maps' | 'camera' | 'location' | 'notifications'): boolean => {
  switch (feature) {
    case 'maps':
      return true; // Both web and mobile support maps
    case 'camera':
      return isMobile; // Camera only available on mobile
    case 'location':
      return isMobile; // GPS location only available on mobile
    case 'notifications':
      return isMobile; // Push notifications only available on mobile
    default:
      return false;
  }
};

/**
 * Get platform-specific API URL
 */
export const getApiUrl = (): string => {
  if (isWeb) {
    return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
  }
  
  return process.env.EXPO_PUBLIC_API_URL_MOBILE || 
         process.env.EXPO_PUBLIC_API_URL || 
         'http://192.168.1.64:5000/api';
};

/**
 * Get platform-specific timeout
 */
export const getApiTimeout = (): number => {
  return isWeb ? 10000 : 30000; // Shorter timeout for web
};

/**
 * Check if running in development
 */
export const isDevelopment = (): boolean => {
  return __DEV__ || process.env.NODE_ENV === 'development';
};

/**
 * Get platform-specific user agent
 */
export const getUserAgent = (): string => {
  if (isWeb) {
    return 'AgriLogistics-Web';
  }
  if (isIOS) {
    return 'AgriLogistics-iOS';
  }
  if (isAndroid) {
    return 'AgriLogistics-Android';
  }
  return 'AgriLogistics-Unknown';
};

/**
 * Platform-specific console logging
 */
export const log = (message: string, ...args: any[]): void => {
  if (isDevelopment()) {
    console.log(`[${getUserAgent()}] ${message}`, ...args);
  }
};

/**
 * Platform-specific error logging
 */
export const logError = (error: any, context?: string): void => {
  if (isDevelopment()) {
    console.error(`[${getUserAgent()}] ${context || 'Error'}:`, error);
  }
};
