// src/utils/validation.ts
// Centralized form validation utilities

export interface ValidationRule {
  required?: boolean | string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  min?: { value: number; message: string };
  max?: { value: number; message: string };
  custom?: (value: any) => string | undefined;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate a single field value against rules
 */
export const validateField = (
  value: any,
  rules: ValidationRule
): string | undefined => {
  // Required validation
  if (rules.required) {
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      return typeof rules.required === 'string' ? rules.required : 'This field is required';
    }
  }

  // If value is empty and not required, skip other validations
  if (!value && !rules.required) {
    return undefined;
  }

  const stringValue = String(value);

  // Min length validation
  if (rules.minLength && stringValue.length < rules.minLength.value) {
    return rules.minLength.message;
  }

  // Max length validation
  if (rules.maxLength && stringValue.length > rules.maxLength.message) {
    return rules.maxLength.message;
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.value.test(stringValue)) {
    return rules.pattern.message;
  }

  // Min value validation (for numbers)
  if (rules.min !== undefined) {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue < rules.min.value) {
      return rules.min.message;
    }
  }

  // Max value validation (for numbers)
  if (rules.max !== undefined) {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue > rules.max.value) {
      return rules.max.message;
    }
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return undefined;
};

/**
 * Validate multiple fields at once
 */
export const validateForm = (
  values: Record<string, any>,
  rules: Record<string, ValidationRule>
): ValidationResult => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach((fieldName) => {
    const error = validateField(values[fieldName], rules[fieldName]);
    if (error) {
      errors[fieldName] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Common validation patterns
export const ValidationPatterns = {
  email: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  phone: {
    value: /^\+?[\d\s\-()]+$/,
    message: 'Please enter a valid phone number',
  },
  phoneRwanda: {
    value: /^(\+250|0)?[7][0-9]{8}$/,
    message: 'Please enter a valid Rwandan phone number',
  },
  password: {
    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  },
  passwordSimple: {
    value: /.{6,}$/,
    message: 'Password must be at least 6 characters',
  },
  url: {
    value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    message: 'Please enter a valid URL',
  },
  number: {
    value: /^\d+$/,
    message: 'Please enter a valid number',
  },
  decimal: {
    value: /^\d+(\.\d{1,2})?$/,
    message: 'Please enter a valid decimal number',
  },
  alphanumeric: {
    value: /^[a-zA-Z0-9]+$/,
    message: 'Only letters and numbers are allowed',
  },
};

// Common validation rules
export const CommonRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    required: message,
  }),

  email: (): ValidationRule => ({
    required: 'Email is required',
    pattern: ValidationPatterns.email,
  }),

  phone: (): ValidationRule => ({
    required: 'Phone number is required',
    pattern: ValidationPatterns.phone,
  }),

  phoneRwanda: (): ValidationRule => ({
    required: 'Phone number is required',
    pattern: ValidationPatterns.phoneRwanda,
  }),

  password: (): ValidationRule => ({
    required: 'Password is required',
    pattern: ValidationPatterns.passwordSimple,
  }),

  passwordStrong: (): ValidationRule => ({
    required: 'Password is required',
    pattern: ValidationPatterns.password,
  }),

  confirmPassword: (passwordValue: string): ValidationRule => ({
    required: 'Please confirm your password',
    custom: (value) => {
      if (value !== passwordValue) {
        return 'Passwords do not match';
      }
      return undefined;
    },
  }),

  minLength: (length: number, fieldName = 'Field'): ValidationRule => ({
    minLength: {
      value: length,
      message: `${fieldName} must be at least ${length} characters`,
    },
  }),

  maxLength: (length: number, fieldName = 'Field'): ValidationRule => ({
    maxLength: {
      value: length,
      message: `${fieldName} must not exceed ${length} characters`,
    },
  }),

  minValue: (value: number, fieldName = 'Value'): ValidationRule => ({
    min: {
      value,
      message: `${fieldName} must be at least ${value}`,
    },
  }),

  maxValue: (value: number, fieldName = 'Value'): ValidationRule => ({
    max: {
      value,
      message: `${fieldName} must not exceed ${value}`,
    },
  }),

  number: (fieldName = 'Field'): ValidationRule => ({
    required: `${fieldName} is required`,
    pattern: ValidationPatterns.number,
  }),

  decimal: (fieldName = 'Field'): ValidationRule => ({
    required: `${fieldName} is required`,
    pattern: ValidationPatterns.decimal,
  }),
};

/**
 * Hook-like utility for form validation in components
 */
export const useFormValidation = () => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validate = (
    values: Record<string, any>,
    rules: Record<string, ValidationRule>
  ): boolean => {
    const result = validateForm(values, rules);
    setErrors(result.errors);
    return result.isValid;
  };

  const clearError = (fieldName: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  const setError = (fieldName: string, message: string) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: message,
    }));
  };

  return {
    errors,
    validate,
    clearError,
    clearAllErrors,
    setError,
  };
};

// React import for the hook
import React from 'react';

export default {
  validateField,
  validateForm,
  ValidationPatterns,
  CommonRules,
  useFormValidation,
};
