/**
 * Form Validation Utilities
 * Provides comprehensive validation functions for forms across the app
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate phone number (Rwandan format)
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove spaces and dashes
  const cleanPhone = phone.replace(/[\s\-]/g, '');

  // Rwandan format: 07XXXXXXXX (10 digits starting with 07)
  // Also accept international format: +25078XXXXXXX
  const rwandanRegex = /^(\+?250|0)?7[2-9]\d{7}$/;

  if (!rwandanRegex.test(cleanPhone)) {
    return {
      isValid: false,
      error: 'Please enter a valid Rwandan phone number (e.g., 0788000001)'
    };
  }

  return { isValid: true };
};

/**
 * Validate email address
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

/**
 * Validate name (min 2 characters, max 50)
 */
export const validateName = (name: string): ValidationResult => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Name is required' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }

  if (trimmedName.length > 50) {
    return { isValid: false, error: 'Name must not exceed 50 characters' };
  }

  // Only allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;

  if (!nameRegex.test(trimmedName)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true };
};

/**
 * Validate password (min 6 characters)
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.trim() === '') {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }

  return { isValid: true };
};

/**
 * Validate password match
 */
export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): ValidationResult => {
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true };
};

/**
 * Validate number (positive)
 */
export const validatePositiveNumber = (
  value: string | number,
  fieldName: string = 'Value'
): ValidationResult => {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }

  if (num <= 0) {
    return { isValid: false, error: `${fieldName} must be greater than 0` };
  }

  return { isValid: true };
};

/**
 * Validate price (positive, max 2 decimal places)
 */
export const validatePrice = (price: string | number): ValidationResult => {
  const priceStr = typeof price === 'number' ? price.toString() : price;

  if (!priceStr || priceStr.trim() === '') {
    return { isValid: false, error: 'Price is required' };
  }

  const num = parseFloat(priceStr);

  if (isNaN(num)) {
    return { isValid: false, error: 'Price must be a valid number' };
  }

  if (num <= 0) {
    return { isValid: false, error: 'Price must be greater than 0' };
  }

  // Check for max 2 decimal places
  const decimalPlaces = (priceStr.split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return { isValid: false, error: 'Price can have maximum 2 decimal places' };
  }

  return { isValid: true };
};

/**
 * Validate weight (positive number with optional 'kg' unit)
 */
export const validateWeight = (weight: string): ValidationResult => {
  if (!weight || weight.trim() === '') {
    return { isValid: false, error: 'Weight is required' };
  }

  // Remove 'kg' suffix if present
  const cleanWeight = weight.replace(/kg$/i, '').trim();
  const num = parseFloat(cleanWeight);

  if (isNaN(num)) {
    return { isValid: false, error: 'Weight must be a valid number' };
  }

  if (num <= 0) {
    return { isValid: false, error: 'Weight must be greater than 0' };
  }

  if (num > 100000) {
    return { isValid: false, error: 'Weight seems unrealistic (max 100,000 kg)' };
  }

  return { isValid: true };
};

/**
 * Validate text field (required, min/max length)
 */
export const validateTextField = (
  text: string,
  fieldName: string = 'Field',
  minLength: number = 1,
  maxLength: number = 500
): ValidationResult => {
  if (!text || text.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const trimmedText = text.trim();

  if (trimmedText.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} character${minLength > 1 ? 's' : ''}`
    };
  }

  if (trimmedText.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must not exceed ${maxLength} characters`
    };
  }

  return { isValid: true };
};

/**
 * Validate location/address
 */
export const validateLocation = (location: string): ValidationResult => {
  return validateTextField(location, 'Location', 3, 200);
};

/**
 * Validate age (must be 18 or older)
 */
export const validateAge = (age: string | number): ValidationResult => {
  const ageNum = typeof age === 'string' ? parseInt(age, 10) : age;

  if (isNaN(ageNum)) {
    return { isValid: false, error: 'Age must be a valid number' };
  }

  if (ageNum < 18) {
    return { isValid: false, error: 'You must be at least 18 years old' };
  }

  if (ageNum > 120) {
    return { isValid: false, error: 'Please enter a valid age' };
  }

  return { isValid: true };
};

/**
 * Validate rating (1-5 stars)
 */
export const validateRating = (rating: number): ValidationResult => {
  if (rating < 1 || rating > 5) {
    return { isValid: false, error: 'Rating must be between 1 and 5 stars' };
  }

  return { isValid: true };
};

/**
 * Validate date (must be in the future)
 */
export const validateFutureDate = (date: Date | string): ValidationResult => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'Invalid date' };
  }

  const now = new Date();
  if (dateObj < now) {
    return { isValid: false, error: 'Date must be in the future' };
  }

  return { isValid: true };
};

/**
 * Validate vehicle capacity
 */
export const validateCapacity = (capacity: string | number): ValidationResult => {
  const num = typeof capacity === 'string' ? parseFloat(capacity) : capacity;

  if (isNaN(num)) {
    return { isValid: false, error: 'Capacity must be a valid number' };
  }

  if (num <= 0) {
    return { isValid: false, error: 'Capacity must be greater than 0' };
  }

  if (num > 50000) {
    return { isValid: false, error: 'Capacity seems unrealistic (max 50,000 kg)' };
  }

  return { isValid: true };
};

/**
 * Validate all cargo form fields
 */
export interface CargoFormData {
  name: string;
  description: string;
  quantity: string | number;
  weight: string;
  pricePerUnit: string | number;
  pickupLocation: string;
  deliveryLocation: string;
  readyDate?: Date | string;
}

export const validateCargoForm = (data: CargoFormData): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  const nameResult = validateTextField(data.name, 'Cargo name', 2, 100);
  if (!nameResult.isValid) errors.name = nameResult.error!;

  const descResult = validateTextField(data.description, 'Description', 10, 500);
  if (!descResult.isValid) errors.description = descResult.error!;

  const quantityResult = validatePositiveNumber(data.quantity, 'Quantity');
  if (!quantityResult.isValid) errors.quantity = quantityResult.error!;

  const weightResult = validateWeight(data.weight.toString());
  if (!weightResult.isValid) errors.weight = weightResult.error!;

  const priceResult = validatePrice(data.pricePerUnit);
  if (!priceResult.isValid) errors.pricePerUnit = priceResult.error!;

  const pickupResult = validateLocation(data.pickupLocation);
  if (!pickupResult.isValid) errors.pickupLocation = pickupResult.error!;

  const deliveryResult = validateLocation(data.deliveryLocation);
  if (!deliveryResult.isValid) errors.deliveryLocation = deliveryResult.error!;

  if (data.readyDate) {
    const dateResult = validateFutureDate(data.readyDate);
    if (!dateResult.isValid) errors.readyDate = dateResult.error!;
  }

  return errors;
};

export default {
  validatePhone,
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordMatch,
  validatePositiveNumber,
  validatePrice,
  validateWeight,
  validateTextField,
  validateLocation,
  validateAge,
  validateRating,
  validateFutureDate,
  validateCapacity,
  validateCargoForm,
};
