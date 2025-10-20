// src/services/momoService.ts
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MomoPaymentRequest {
  amount: number;
  phoneNumber: string;
  orderId: string;
  currency?: string;
}

export interface MomoPaymentResponse {
  success: boolean;
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed';
  message: string;
  referenceId?: string;
}

/**
 * Initialize Mobile Money Payment
 * Supports MTN MoMo, Airtel Money for Rwanda/East Africa
 */
export const initiateMomoPayment = async (
  paymentData: MomoPaymentRequest
): Promise<MomoPaymentResponse> => {
  try {
    // Format phone number (remove spaces, ensure +250 prefix for Rwanda)
    const formattedPhone = formatPhoneNumber(paymentData.phoneNumber);
    
    const response = await api.post('/payments/momo/initiate', {
      ...paymentData,
      phoneNumber: formattedPhone,
      currency: paymentData.currency || 'RWF',
    });

    // Store transaction reference for tracking
    if (response.data.referenceId) {
      await AsyncStorage.setItem(
        `momo_tx_${paymentData.orderId}`,
        JSON.stringify(response.data)
      );
    }

    return response.data;
  } catch (error: any) {
    console.error('MoMo Payment Error:', error);
    return {
      success: false,
      status: 'failed',
      message: error.response?.data?.message || 'Payment failed. Please try again.',
    };
  }
};

/**
 * Check Mobile Money Payment Status
 */
export const checkMomoPaymentStatus = async (
  referenceId: string
): Promise<MomoPaymentResponse> => {
  try {
    const response = await api.get(`/payments/momo/status/${referenceId}`);
    return response.data;
  } catch (error: any) {
    console.error('MoMo Status Check Error:', error);
    return {
      success: false,
      status: 'failed',
      message: 'Failed to check payment status',
    };
  }
};

/**
 * Format phone number for MoMo (Rwanda format)
 * Accepts: 0788123456, 788123456, +250788123456
 * Returns: +250788123456
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all spaces and special characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If starts with 0, replace with +250
  if (cleaned.startsWith('0')) {
    cleaned = '+250' + cleaned.substring(1);
  }
  
  // If doesn't start with +, add +250
  if (!cleaned.startsWith('+')) {
    cleaned = '+250' + cleaned;
  }
  
  return cleaned;
};

/**
 * Validate phone number for MoMo
 * Rwanda: MTN (078, 079), Airtel (073, 072)
 */
export const validateMomoPhone = (phone: string): { valid: boolean; message?: string } => {
  const formatted = formatPhoneNumber(phone);
  
  // Check length (should be +250 + 9 digits = 13 characters)
  if (formatted.length !== 13) {
    return { valid: false, message: 'Phone number must be 9 digits' };
  }
  
  // Extract the operator prefix (078, 079, 073, 072)
  const prefix = formatted.substring(4, 7);
  
  const validPrefixes = ['078', '079', '073', '072', '075']; // MTN, Airtel
  
  if (!validPrefixes.includes(prefix)) {
    return { 
      valid: false, 
      message: 'Please use MTN (078/079) or Airtel (073/072) number' 
    };
  }
  
  return { valid: true };
};

/**
 * Get cached payment status (for offline scenarios)
 */
export const getCachedPaymentStatus = async (orderId: string): Promise<MomoPaymentResponse | null> => {
  try {
    const cached = await AsyncStorage.getItem(`momo_tx_${orderId}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error reading cached payment:', error);
    return null;
  }
};

/**
 * Mock MoMo payment for testing (when backend not available)
 */
export const mockMomoPayment = async (
  paymentData: MomoPaymentRequest
): Promise<MomoPaymentResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Validate phone
  const validation = validateMomoPhone(paymentData.phoneNumber);
  if (!validation.valid) {
    return {
      success: false,
      status: 'failed',
      message: validation.message || 'Invalid phone number',
    };
  }
  
  // Simulate 90% success rate
  const success = Math.random() > 0.1;
  
  if (success) {
    const mockTxId = `MOMO${Date.now()}${Math.floor(Math.random() * 1000)}`;
    return {
      success: true,
      transactionId: mockTxId,
      referenceId: mockTxId,
      status: 'completed',
      message: 'Payment successful! Check your phone for confirmation.',
    };
  } else {
    return {
      success: false,
      status: 'failed',
      message: 'Payment declined. Please check your balance and try again.',
    };
  }
};