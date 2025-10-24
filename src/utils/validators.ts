// Input validation utilities

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate phone number (Rwandan format)
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  // Remove spaces and special characters
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check if it starts with +250 or 0
  if (!cleanPhone.match(/^(\+250|0)/)) {
    return { isValid: false, error: 'Phone number must start with +250 or 0' };
  }
  
  // Check length (should be 12 digits for +250 or 10 digits for 0)
  if (cleanPhone.startsWith('+250') && cleanPhone.length !== 12) {
    return { isValid: false, error: 'Phone number must be 12 digits (including +250)' };
  }
  
  if (cleanPhone.startsWith('0') && cleanPhone.length !== 10) {
    return { isValid: false, error: 'Phone number must be 10 digits (including 0)' };
  }
  
  // Check if all characters after prefix are digits
  const digits = cleanPhone.startsWith('+250') ? cleanPhone.slice(4) : cleanPhone.slice(1);
  if (!/^\d+$/.test(digits)) {
    return { isValid: false, error: 'Phone number must contain only digits' };
  }
  
  return { isValid: true };
};

/**
 * Validate password
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }
  
  if (password.length > 50) {
    return { isValid: false, error: 'Password must be less than 50 characters' };
  }
  
  return { isValid: true };
};

/**
 * Validate name
 */
export const validateName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, error: 'Name is required' };
  }
  
  if (name.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }
  
  if (name.length > 50) {
    return { isValid: false, error: 'Name must be less than 50 characters' };
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s\-']+$/.test(name)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  return { isValid: true };
};

/**
 * Validate email
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

/**
 * Validate crop name
 */
export const validateCropName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, error: 'Crop name is required' };
  }
  
  if (name.length < 2) {
    return { isValid: false, error: 'Crop name must be at least 2 characters' };
  }
  
  if (name.length > 100) {
    return { isValid: false, error: 'Crop name must be less than 100 characters' };
  }
  
  return { isValid: true };
};

/**
 * Validate quantity
 */
export const validateQuantity = (quantity: string | number): ValidationResult => {
  const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Quantity must be a valid number' };
  }
  
  if (num <= 0) {
    return { isValid: false, error: 'Quantity must be greater than 0' };
  }
  
  if (num > 10000) {
    return { isValid: false, error: 'Quantity must be less than 10,000' };
  }
  
  return { isValid: true };
};

/**
 * Validate price
 */
export const validatePrice = (price: string | number): ValidationResult => {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Price must be a valid number' };
  }
  
  if (num < 0) {
    return { isValid: false, error: 'Price cannot be negative' };
  }
  
  if (num > 1000000) {
    return { isValid: false, error: 'Price must be less than 1,000,000 RWF' };
  }
  
  return { isValid: true };
};

/**
 * Validate coordinates
 */
export const validateCoordinates = (lat: number, lng: number): ValidationResult => {
  if (isNaN(lat) || isNaN(lng)) {
    return { isValid: false, error: 'Invalid coordinates' };
  }
  
  if (lat < -90 || lat > 90) {
    return { isValid: false, error: 'Latitude must be between -90 and 90' };
  }
  
  if (lng < -180 || lng > 180) {
    return { isValid: false, error: 'Longitude must be between -180 and 180' };
  }
  
  return { isValid: true };
};

/**
 * Validate form data
 */
export const validateForm = (data: Record<string, any>, rules: Record<string, (value: any) => ValidationResult>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];
    const result = rule(value);
    
    if (!result.isValid && result.error) {
      errors[field] = result.error;
    }
  });
  
  return errors;
};
