// Error handling utilities for consistent error management

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

/**
 * Extract error message from various error formats
 */
export const getErrorMessage = (error: any): string => {
  // Axios error
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Standard error object
  if (error?.message) {
    return error.message;
  }
  
  // String error
  if (typeof error === 'string') {
    return error;
  }
  
  // Network error
  if (error?.code === 'NETWORK_ERROR') {
    return 'Network connection failed. Please check your internet connection.';
  }
  
  // Timeout error
  if (error?.code === 'TIMEOUT') {
    return 'Request timed out. Please try again.';
  }
  
  // Default fallback
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Extract error details for logging
 */
export const getErrorDetails = (error: any): ApiError => {
  return {
    message: getErrorMessage(error),
    status: error?.response?.status,
    code: error?.code,
    details: error?.response?.data || error,
  };
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: any): boolean => {
  return (
    error?.code === 'NETWORK_ERROR' ||
    error?.message?.includes('Network Error') ||
    !navigator.onLine
  );
};

/**
 * Check if error is a timeout error
 */
export const isTimeoutError = (error: any): boolean => {
  return (
    error?.code === 'TIMEOUT' ||
    error?.message?.includes('timeout') ||
    error?.message?.includes('TIMEOUT')
  );
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: any): boolean => {
  return error?.response?.status === 401 || error?.response?.status === 403;
};

/**
 * Get user-friendly error message based on error type
 */
export const getUserFriendlyMessage = (error: any): string => {
  if (isNetworkError(error)) {
    return 'Please check your internet connection and try again.';
  }
  
  if (isTimeoutError(error)) {
    return 'The request is taking too long. Please try again.';
  }
  
  if (isAuthError(error)) {
    return 'Your session has expired. Please log in again.';
  }
  
  return getErrorMessage(error);
};

/**
 * Log error for debugging (in development)
 */
export const logError = (error: any, context?: string): void => {
  if (__DEV__) {
    const errorDetails = getErrorDetails(error);
    console.error(`[${context || 'Error'}]`, errorDetails);
  }
};

/**
 * Create a standardized error object
 */
export const createError = (message: string, code?: string, status?: number): ApiError => {
  return {
    message,
    code,
    status,
  };
};
