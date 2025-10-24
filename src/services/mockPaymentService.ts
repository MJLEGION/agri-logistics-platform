// src/services/mockPaymentService.ts
/**
 * Mock Payment Service for Demo/Testing
 * Simulates realistic payment processing without real API credentials
 * Perfect for final projects and demonstrations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MockPaymentRequest {
  amount: number;
  phoneNumber: string;
  orderId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  currency?: string;
  paymentMethod?: 'momo' | 'airtel';
}

export interface MockPaymentResponse {
  success: boolean;
  transactionId?: string;
  referenceId?: string;
  status: 'pending' | 'completed' | 'failed' | 'processing';
  message: string;
  timestamp: string;
  amount?: number;
  phoneNumber?: string;
}

// In-memory transaction store for demo
const transactionStore = new Map<string, any>();

/**
 * Format phone number for validation
 */
export const formatPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('0')) {
    cleaned = '+250' + cleaned.substring(1);
  }

  if (!cleaned.startsWith('+')) {
    cleaned = '+250' + cleaned;
  }

  return cleaned;
};

/**
 * Validate phone number
 */
export const validatePhoneNumber = (phone: string): { valid: boolean; message?: string } => {
  const formatted = formatPhoneNumber(phone);

  // Check length
  if (formatted.length !== 13) {
    return { valid: false, message: 'Phone number must be 9 digits' };
  }

  // Check operator (MTN: 078/079, Airtel: 072/073/075)
  const prefix = formatted.substring(4, 7);
  const validPrefixes = ['078', '079', '072', '073', '075'];

  if (!validPrefixes.includes(prefix)) {
    return { 
      valid: false, 
      message: 'Please use MTN (078/079) or Airtel (072/073/075) number' 
    };
  }

  return { valid: true };
};

/**
 * Detect payment provider from phone number
 */
export const detectPaymentProvider = (phoneNumber: string): 'momo' | 'airtel' => {
  const formatted = formatPhoneNumber(phoneNumber);
  const prefix = formatted.substring(4, 7);

  if (['078', '079'].includes(prefix)) {
    return 'momo';
  }

  return 'airtel';
};

/**
 * Initiate mock payment - simulates real payment flow
 * Realistic delays and success/failure scenarios
 */
export const initiateMockPayment = async (
  paymentData: MockPaymentRequest
): Promise<MockPaymentResponse> => {
  try {
    // Validate phone
    const validation = validatePhoneNumber(paymentData.phoneNumber);
    if (!validation.valid) {
      return {
        success: false,
        status: 'failed',
        message: validation.message || 'Invalid phone number',
        timestamp: new Date().toISOString(),
      };
    }

    // Validate amount
    if (!paymentData.amount || paymentData.amount <= 0) {
      return {
        success: false,
        status: 'failed',
        message: 'Amount must be greater than 0',
        timestamp: new Date().toISOString(),
      };
    }

    // Generate reference ID
    const referenceId = `MOCK_${paymentData.orderId}_${Date.now()}`;
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`;

    // Simulate network delay (1-2 seconds)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Store transaction in memory
    const transaction = {
      referenceId,
      transactionId,
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      phoneNumber: formatPhoneNumber(paymentData.phoneNumber),
      provider: detectPaymentProvider(paymentData.phoneNumber),
      status: 'processing',
      timestamp: new Date().toISOString(),
      initiatedAt: new Date().toISOString(),
      currency: paymentData.currency || 'RWF',
    };

    transactionStore.set(referenceId, transaction);

    // Also save to AsyncStorage for persistence
    try {
      const key = `mock_payment_${paymentData.orderId}`;
      await AsyncStorage.setItem(key, JSON.stringify(transaction));
    } catch (e) {
      console.log('AsyncStorage not available (web app)');
    }

    return {
      success: true,
      transactionId,
      referenceId,
      status: 'processing',
      message: `Payment initiated. Waiting for confirmation on ${formatPhoneNumber(paymentData.phoneNumber)}`,
      timestamp: new Date().toISOString(),
      amount: paymentData.amount,
      phoneNumber: formatPhoneNumber(paymentData.phoneNumber),
    };
  } catch (error: any) {
    console.error('Mock payment initiation error:', error);
    return {
      success: false,
      status: 'failed',
      message: error.message || 'Payment initiation failed',
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Check payment status - simulates polling
 * After ~5-10 seconds, marks as completed
 */
export const checkMockPaymentStatus = async (
  referenceId: string
): Promise<MockPaymentResponse> => {
  try {
    const transaction = transactionStore.get(referenceId);

    if (!transaction) {
      // Try to get from AsyncStorage
      try {
        const stored = await AsyncStorage.getItem(`mock_payment_ref_${referenceId}`);
        if (stored) {
          const tx = JSON.parse(stored);
          transactionStore.set(referenceId, tx);
        }
      } catch (e) {
        console.log('AsyncStorage not available');
      }
    }

    if (!transaction) {
      return {
        success: false,
        status: 'failed',
        message: 'Transaction not found',
        timestamp: new Date().toISOString(),
      };
    }

    // Simulate processing -> completed transition
    const elapsedSeconds = (new Date().getTime() - new Date(transaction.initiatedAt).getTime()) / 1000;

    // After 3-8 seconds, mark as completed (randomly)
    if (elapsedSeconds > 3) {
      // 85% success rate for demo
      const isSuccess = Math.random() > 0.15;

      if (isSuccess) {
        transaction.status = 'completed';
        transaction.completedAt = new Date().toISOString();
      } else {
        transaction.status = 'failed';
        transaction.failureReason = 'Insufficient funds';
        transaction.completedAt = new Date().toISOString();
      }

      transactionStore.set(referenceId, transaction);
    }

    if (transaction.status === 'completed') {
      return {
        success: true,
        transactionId: transaction.transactionId,
        referenceId,
        status: 'completed',
        message: `Payment successful! Amount: ${transaction.currency} ${transaction.amount}`,
        timestamp: transaction.completedAt || new Date().toISOString(),
        amount: transaction.amount,
        phoneNumber: transaction.phoneNumber,
      };
    } else if (transaction.status === 'failed') {
      return {
        success: false,
        transactionId: transaction.transactionId,
        referenceId,
        status: 'failed',
        message: `Payment failed: ${transaction.failureReason || 'Unknown error'}`,
        timestamp: transaction.completedAt || new Date().toISOString(),
        amount: transaction.amount,
        phoneNumber: transaction.phoneNumber,
      };
    } else {
      return {
        success: false,
        transactionId: transaction.transactionId,
        referenceId,
        status: 'processing',
        message: `Payment is processing... (${Math.round(elapsedSeconds)}s)`,
        timestamp: new Date().toISOString(),
        amount: transaction.amount,
        phoneNumber: transaction.phoneNumber,
      };
    }
  } catch (error: any) {
    console.error('Mock payment status check error:', error);
    return {
      success: false,
      status: 'failed',
      message: 'Failed to check payment status',
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Get transaction history
 */
export const getMockPaymentHistory = async (): Promise<any[]> => {
  try {
    return Array.from(transactionStore.values());
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return [];
  }
};

/**
 * Verify payment (immediate confirmation)
 */
export const verifyMockPayment = async (
  transactionId: string,
  referenceId: string
): Promise<MockPaymentResponse> => {
  try {
    const transaction = transactionStore.get(referenceId);

    if (!transaction) {
      return {
        success: false,
        status: 'failed',
        message: 'Transaction not found',
        timestamp: new Date().toISOString(),
      };
    }

    if (transaction.status === 'completed') {
      return {
        success: true,
        transactionId,
        referenceId,
        status: 'completed',
        message: 'Payment verified successfully',
        timestamp: new Date().toISOString(),
        amount: transaction.amount,
        phoneNumber: transaction.phoneNumber,
      };
    }

    return {
      success: false,
      transactionId,
      referenceId,
      status: transaction.status,
      message: 'Payment is still processing or has failed',
      timestamp: new Date().toISOString(),
      amount: transaction.amount,
      phoneNumber: transaction.phoneNumber,
    };
  } catch (error: any) {
    console.error('Mock payment verification error:', error);
    return {
      success: false,
      status: 'failed',
      message: 'Verification failed',
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Get cached payment (for offline)
 */
export const getCachedMockPayment = async (orderId: string): Promise<any> => {
  try {
    const cached = await AsyncStorage.getItem(`mock_payment_${orderId}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.log('No cached payment found');
    return null;
  }
};

/**
 * Clear all transactions (for testing)
 */
export const clearMockPaymentHistory = async (): Promise<void> => {
  try {
    transactionStore.clear();
    console.log('✅ Payment history cleared');
  } catch (error) {
    console.error('Error clearing payment history:', error);
  }
};

/**
 * Get provider display name
 */
export const getProviderName = (provider: 'momo' | 'airtel'): string => {
  return provider === 'momo' ? 'MTN MoMo' : 'Airtel Money';
};