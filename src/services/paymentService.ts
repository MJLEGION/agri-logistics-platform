// src/services/paymentService.ts
import api from './api';

export interface PaymentInitiation {
  order_id: string;
  amount: number;
  method: 'momo' | 'bank_transfer' | 'card';
}

export interface PaymentStatus {
  _id: string;
  order_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  method: string;
  transaction_id?: string;
  created_at: string;
}

/**
 * Initiate payment for an order
 */
export const initiatePayment = async (
  paymentData: PaymentInitiation
): Promise<PaymentStatus> => {
  try {
    const response = await api.post<PaymentStatus>('/payments/initiate', {
      order_id: paymentData.order_id,
      amount: paymentData.amount,
      method: paymentData.method,
    });
    return response.data;
  } catch (error) {
    console.error('❌ Failed to initiate payment:', error);
    throw error;
  }
};

/**
 * Get payment status
 */
export const getPaymentStatus = async (paymentId: string): Promise<PaymentStatus> => {
  try {
    const response = await api.get<PaymentStatus>(`/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch payment status:', error);
    throw error;
  }
};

/**
 * Confirm payment completion
 */
export const confirmPayment = async (
  transactionId: string,
  orderId: string
): Promise<PaymentStatus> => {
  try {
    const response = await api.post<PaymentStatus>('/payments/confirm', {
      transaction_id: transactionId,
      order_id: orderId,
    });
    return response.data;
  } catch (error) {
    console.error('❌ Failed to confirm payment:', error);
    throw error;
  }
};

export default {
  initiatePayment,
  getPaymentStatus,
  confirmPayment,
};