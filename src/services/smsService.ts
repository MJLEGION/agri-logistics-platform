// src/services/smsService.ts
import api from './api';

export interface SMSNotification {
  to: string;
  message: string;
  type: 'order_created' | 'transporter_assigned' | 'delivery_completed' | 'payment_received';
}

/**
 * Send SMS notification
 * Integrates with Africa's Talking or similar SMS gateway
 */
export const sendSMS = async (notification: SMSNotification): Promise<boolean> => {
  try {
    const response = await api.post('/notifications/sms', notification);
        return true;
  } catch (error: any) {
    console.error('❌ SMS sending failed:', error);
    return false;
  }
};

/**
 * Send order created notification
 */
export const notifyOrderCreated = async (
  phoneNumber: string,
  orderDetails: {
    orderId: string;
    cropName: string;
    quantity: number;
    totalPrice: number;
  }
): Promise<boolean> => {
  const message = `Order #${orderDetails.orderId} created successfully! ${orderDetails.quantity} of ${orderDetails.cropName} for ${orderDetails.totalPrice} RWF. We'll notify you when a transporter is assigned.`;
  
  return sendSMS({
    to: phoneNumber,
    message,
    type: 'order_created',
  });
};

/**
 * Send transporter assigned notification
 */
export const notifyTransporterAssigned = async (
  phoneNumber: string,
  orderDetails: {
    orderId: string;
    transporterName: string;
    transporterPhone: string;
    vehicleType: string;
  }
): Promise<boolean> => {
  const message = `Transporter assigned to Order #${orderDetails.orderId}! ${orderDetails.transporterName} (${orderDetails.transporterPhone}) will deliver using ${orderDetails.vehicleType}. Track your order in the app.`;
  
  return sendSMS({
    to: phoneNumber,
    message,
    type: 'transporter_assigned',
  });
};

/**
 * Send delivery completed notification
 */
export const notifyDeliveryCompleted = async (
  phoneNumber: string,
  orderDetails: {
    orderId: string;
    deliveryTime: string;
  }
): Promise<boolean> => {
  const message = `Order #${orderDetails.orderId} delivered successfully at ${orderDetails.deliveryTime}! Thank you for using Agri-Logistics Platform. Rate your experience in the app.`;
  
  return sendSMS({
    to: phoneNumber,
    message,
    type: 'delivery_completed',
  });
};

/**
 * Send payment received notification (for farmers)
 */
export const notifyPaymentReceived = async (
  phoneNumber: string,
  paymentDetails: {
    orderId: string;
    amount: number;
    transactionId: string;
  }
): Promise<boolean> => {
  const message = `Payment received! ${paymentDetails.amount} RWF for Order #${paymentDetails.orderId}. Transaction ID: ${paymentDetails.transactionId}. Check your mobile money account.`;
  
  return sendSMS({
    to: phoneNumber,
    message,
    type: 'payment_received',
  });
};

/**
 * Mock SMS sending for testing
 */
export const mockSendSMS = async (notification: SMSNotification): Promise<boolean> => {
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return true;
};