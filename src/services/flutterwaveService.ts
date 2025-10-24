// src/services/flutterwaveService.ts
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Flutterwave Payment Service - Live MoMo Integration
 * Supports: MTN MoMo, Airtel Money (Rwanda & East Africa)
 * 
 * Documentation: https://developer.flutterwave.com/docs/integration/standard/
 */

export interface FlutterwavePaymentRequest {
  amount: number;
  phoneNumber: string;
  orderId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  currency?: string;
  paymentMethod: 'momo' | 'airtel'; // 'momo' for MTN MoMo, 'airtel' for Airtel Money
}

export interface FlutterwavePaymentResponse {
  success: boolean;
  transactionId?: string;
  referenceId?: string;
  status: 'pending' | 'completed' | 'failed' | 'processing';
  message: string;
  flutterwaveRef?: string;
}

/**
 * Initiate payment through backend (secure approach)
 * Backend validates and uses Flutterwave API key
 */
export const initiateFlutterwavePayment = async (
  paymentData: FlutterwavePaymentRequest
): Promise<FlutterwavePaymentResponse> => {
  try {
    console.log('💳 Initiating Flutterwave payment...', {
      amount: paymentData.amount,
      method: paymentData.paymentMethod,
      orderId: paymentData.orderId,
    });

    // Format phone number
    const formattedPhone = formatPhoneNumber(paymentData.phoneNumber);

    // Validate input
    const validation = validatePaymentInput(paymentData, formattedPhone);
    if (!validation.valid) {
      return {
        success: false,
        status: 'failed',
        message: validation.message || 'Invalid payment data',
      };
    }

    // Send payment request to backend
    // Backend will securely handle Flutterwave API key
    const response = await api.post('/payments/flutterwave/initiate', {
      ...paymentData,
      phoneNumber: formattedPhone,
      currency: paymentData.currency || 'RWF',
    });

    console.log('✅ Flutterwave payment initiated:', response.data);

    // Cache transaction for reference
    if (response.data.referenceId) {
      await cacheTransaction({
        orderId: paymentData.orderId,
        referenceId: response.data.referenceId,
        flutterwaveRef: response.data.flutterwaveRef,
        amount: paymentData.amount,
        status: 'pending',
        timestamp: new Date().toISOString(),
      });
    }

    return response.data;
  } catch (error: any) {
    console.error('❌ Flutterwave payment error:', error);

    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Payment initiation failed';

    return {
      success: false,
      status: 'failed',
      message: errorMessage,
    };
  }
};

/**
 * Check payment status (for polling or manual checks)
 */
export const checkFlutterwavePaymentStatus = async (
  referenceId: string
): Promise<FlutterwavePaymentResponse> => {
  try {
    console.log('🔍 Checking payment status:', referenceId);

    const response = await api.get(`/payments/flutterwave/status/${referenceId}`);
    
    console.log('✅ Payment status:', response.data);

    return response.data;
  } catch (error: any) {
    console.error('❌ Status check failed:', error);

    return {
      success: false,
      status: 'failed',
      message: 'Failed to check payment status',
    };
  }
};

/**
 * Verify payment with Flutterwave (backend should do this)
 */
export const verifyFlutterwavePayment = async (
  transactionId: string,
  referenceId: string
): Promise<FlutterwavePaymentResponse> => {
  try {
    const response = await api.post('/payments/flutterwave/verify', {
      transactionId,
      referenceId,
    });

    return response.data;
  } catch (error: any) {
    console.error('Payment verification failed:', error);

    return {
      success: false,
      status: 'failed',
      message: 'Payment verification failed',
    };
  }
};

/**
 * Format phone number for Flutterwave/MoMo
 * Accepts: 0788123456, 788123456, +250788123456
 * Returns: +250788123456
 */
export const formatPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/[^\d+]/g, '');

  // If starts with 0, replace with country code
  if (cleaned.startsWith('0')) {
    cleaned = '+250' + cleaned.substring(1);
  }

  // If doesn't start with +, add country code
  if (!cleaned.startsWith('+')) {
    cleaned = '+250' + cleaned;
  }

  return cleaned;
};

/**
 * Validate payment input
 */
const validatePaymentInput = (
  data: FlutterwavePaymentRequest,
  formattedPhone: string
): { valid: boolean; message?: string } => {
  // Check amount
  if (!data.amount || data.amount <= 0) {
    return { valid: false, message: 'Invalid amount' };
  }

  // Check phone length
  if (formattedPhone.length !== 13) {
    return { valid: false, message: 'Phone number must be 9 digits' };
  }

  // Check valid operator (MTN: 078/079, Airtel: 073/072)
  const prefix = formattedPhone.substring(4, 7);
  const validPrefixes = ['078', '079', '073', '072', '075'];

  if (!validPrefixes.includes(prefix)) {
    return {
      valid: false,
      message: 'Please use MTN (078/079) or Airtel (073/072) number',
    };
  }

  // Check payment method
  if (!['momo', 'airtel'].includes(data.paymentMethod)) {
    return { valid: false, message: 'Invalid payment method' };
  }

  // Check email
  if (!data.email || !isValidEmail(data.email)) {
    return { valid: false, message: 'Invalid email address' };
  }

  return { valid: true };
};

/**
 * Email validation
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Cache transaction details locally
 */
interface CachedTransaction {
  orderId: string;
  referenceId: string;
  flutterwaveRef?: string;
  amount: number;
  status: string;
  timestamp: string;
}

const cacheTransaction = async (transaction: CachedTransaction): Promise<void> => {
  try {
    const key = `fw_tx_${transaction.orderId}`;
    await AsyncStorage.setItem(key, JSON.stringify(transaction));
    console.log('✅ Transaction cached:', key);
  } catch (error) {
    console.error('Failed to cache transaction:', error);
  }
};

/**
 * Get cached transaction
 */
export const getCachedTransaction = async (orderId: string): Promise<CachedTransaction | null> => {
  try {
    const key = `fw_tx_${orderId}`;
    const cached = await AsyncStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error reading cached transaction:', error);
    return null;
  }
};

/**
 * Clear cached transaction
 */
export const clearCachedTransaction = async (orderId: string): Promise<void> => {
  try {
    const key = `fw_tx_${orderId}`;
    await AsyncStorage.removeItem(key);
    console.log('✅ Transaction cache cleared:', key);
  } catch (error) {
    console.error('Error clearing transaction cache:', error);
  }
};

/**
 * Get payment methods for a phone number
 * Determines if phone is MTN or Airtel
 */
export const detectPaymentProvider = (phoneNumber: string): 'momo' | 'airtel' => {
  const formatted = formatPhoneNumber(phoneNumber);
  const prefix = formatted.substring(4, 7);

  // MTN: 078, 079
  if (['078', '079'].includes(prefix)) {
    return 'momo';
  }

  // Airtel: 072, 073, 075
  if (['072', '073', '075'].includes(prefix)) {
    return 'airtel';
  }

  // Default to momo if unsure
  return 'momo';
};

/**
 * Get provider display name
 */
export const getProviderName = (provider: 'momo' | 'airtel'): string => {
  return provider === 'momo' ? 'MTN MoMo' : 'Airtel Money';
};