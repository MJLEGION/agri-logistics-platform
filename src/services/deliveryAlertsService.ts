// Delivery Alerts Service - Manages real-time notifications for farmers
// Sends alerts for: transporter en route, ETA updates, delays, delivery confirmations
import { EventEmitter } from 'events';
import { sendSMS, mockSendSMS } from './smsService';

export interface DeliveryAlert {
  id: string;
  orderId: string;
  farmerId: string;
  farmerPhone: string;
  transporterId: string;
  alertType: 'en_route' | 'eta_update' | 'arriving_soon' | 'delayed' | 'delivered' | 'address_confirmation';
  message: string;
  timestamp: Date;
  read: boolean;
  metadata?: {
    eta?: number; // minutes
    delay?: number; // minutes late
    distance?: number; // km remaining
    currentLocation?: { latitude: number; longitude: number };
    estimatedArrival?: Date;
  };
}

export interface DeliveryAlertConfig {
  sendSMS: boolean;
  sendPushNotification: boolean;
  delayThresholdMinutes: number; // Alert if delay > this (default: 15 minutes)
  etaUpdateFrequencyMinutes: number; // Update ETA every N minutes (default: 5)
}

const alertEmitter = new EventEmitter();
let alertHistory: Map<string, DeliveryAlert[]> = new Map();
let activeAlerts: Map<string, DeliveryAlert> = new Map();

/**
 * Send alert when transporter is en route to pickup
 */
export const notifyTransporterEnRoute = async (
  orderId: string,
  farmerInfo: {
    id: string;
    name: string;
    phone: string;
    pickupAddress: string;
  },
  transporterInfo: {
    id: string;
    name: string;
    vehicleType: string;
    registrationNumber?: string;
  },
  etaMinutes: number,
  config: DeliveryAlertConfig = getDefaultConfig()
): Promise<DeliveryAlert> => {
  const alert: DeliveryAlert = {
    id: `alert_${orderId}_enroute_${Date.now()}`,
    orderId,
    farmerId: farmerInfo.id,
    farmerPhone: farmerInfo.phone,
    transporterId: transporterInfo.id,
    alertType: 'en_route',
    message: `🚛 ${transporterInfo.name} is on the way to pick up your cargo! Expected arrival in ${etaMinutes} minutes. Vehicle: ${transporterInfo.vehicleType} (${transporterInfo.registrationNumber || 'N/A'})`,
    timestamp: new Date(),
    read: false,
    metadata: {
      eta: etaMinutes,
      estimatedArrival: new Date(Date.now() + etaMinutes * 60 * 1000),
    },
  };

  // Store alert
  storeAlert(alert);

  // Send SMS if enabled
  if (config.sendSMS) {
    await mockSendSMS({
      to: farmerInfo.phone,
      message: alert.message,
      type: 'transporter_assigned',
    });
  }

  // Emit event for real-time updates
  alertEmitter.emit('alert:en_route', alert);

  return alert;
};

/**
 * Send ETA update notification
 */
export const notifyETAUpdate = async (
  orderId: string,
  farmerPhone: string,
  farmerId: string,
  transporterId: string,
  newETA: number, // minutes
  currentLocation?: { latitude: number; longitude: number },
  distanceRemaining?: number, // km
  config: DeliveryAlertConfig = getDefaultConfig()
): Promise<DeliveryAlert> => {
  const alert: DeliveryAlert = {
    id: `alert_${orderId}_eta_${Date.now()}`,
    orderId,
    farmerId,
    farmerPhone,
    transporterId,
    alertType: 'eta_update',
    message: `⏱️ Updated arrival time: ${newETA} minutes away${distanceRemaining ? ` (${distanceRemaining.toFixed(1)} km remaining)` : ''}`,
    timestamp: new Date(),
    read: false,
    metadata: {
      eta: newETA,
      distance: distanceRemaining,
      currentLocation,
      estimatedArrival: new Date(Date.now() + newETA * 60 * 1000),
    },
  };

  storeAlert(alert);

  if (config.sendSMS && newETA % 10 === 0) {
    // Only send SMS every 10 minutes to avoid spam
    await mockSendSMS({
      to: farmerPhone,
      message: alert.message,
      type: 'transporter_assigned',
    });
  }

  alertEmitter.emit('alert:eta_update', alert);
  return alert;
};

/**
 * Send alert when transporter is arriving soon (within 5 minutes)
 */
export const notifyArrivingSoon = async (
  orderId: string,
  farmerInfo: {
    id: string;
    name: string;
    phone: string;
    pickupAddress: string;
  },
  transporterInfo: {
    id: string;
    name: string;
  },
  config: DeliveryAlertConfig = getDefaultConfig()
): Promise<DeliveryAlert> => {
  const alert: DeliveryAlert = {
    id: `alert_${orderId}_arriving_${Date.now()}`,
    orderId,
    farmerId: farmerInfo.id,
    farmerPhone: farmerInfo.phone,
    transporterId: transporterInfo.id,
    alertType: 'arriving_soon',
    message: `✅ ${transporterInfo.name} is arriving in the next 5 minutes! Please have your cargo ready at: ${farmerInfo.pickupAddress}`,
    timestamp: new Date(),
    read: false,
  };

  storeAlert(alert);

  if (config.sendSMS) {
    await mockSendSMS({
      to: farmerInfo.phone,
      message: alert.message,
      type: 'transporter_assigned',
    });
  }

  alertEmitter.emit('alert:arriving_soon', alert);
  return alert;
};

/**
 * Send delay alert if transporter is running late
 */
export const notifyDelay = async (
  orderId: string,
  farmerInfo: {
    id: string;
    phone: string;
  },
  transporterInfo: {
    id: string;
    name: string;
  },
  delayMinutes: number,
  reason?: string,
  config: DeliveryAlertConfig = getDefaultConfig()
): Promise<DeliveryAlert> => {
  const alert: DeliveryAlert = {
    id: `alert_${orderId}_delay_${Date.now()}`,
    orderId,
    farmerId: farmerInfo.id,
    farmerPhone: farmerInfo.phone,
    transporterId: transporterInfo.id,
    alertType: 'delayed',
    message: `⚠️ ${transporterInfo.name} is running ${delayMinutes} minutes late.${reason ? ` Reason: ${reason}` : ''} We apologize for the inconvenience.`,
    timestamp: new Date(),
    read: false,
    metadata: {
      delay: delayMinutes,
    },
  };

  storeAlert(alert);

  if (config.sendSMS && delayMinutes >= config.delayThresholdMinutes) {
    await mockSendSMS({
      to: farmerInfo.phone,
      message: alert.message,
      type: 'transporter_assigned',
    });
  }

  alertEmitter.emit('alert:delayed', alert);
  return alert;
};

/**
 * Send delivery confirmation alert
 */
export const notifyDeliveryConfirmed = async (
  orderId: string,
  farmerInfo: {
    id: string;
    phone: string;
    name: string;
  },
  deliveryDetails: {
    quantity: string;
    condition: 'good' | 'fair' | 'damaged';
    signature?: string;
    photosCount?: number;
  },
  config: DeliveryAlertConfig = getDefaultConfig()
): Promise<DeliveryAlert> => {
  const alert: DeliveryAlert = {
    id: `alert_${orderId}_delivered_${Date.now()}`,
    orderId,
    farmerId: farmerInfo.id,
    farmerPhone: farmerInfo.phone,
    transporterId: '',
    alertType: 'delivered',
    message: `✅ Your cargo has been delivered! Condition: ${deliveryDetails.condition}. Quantity confirmed: ${deliveryDetails.quantity}. Thank you for using Agri-Logistics Platform!`,
    timestamp: new Date(),
    read: false,
    metadata: deliveryDetails as any,
  };

  storeAlert(alert);

  if (config.sendSMS) {
    await mockSendSMS({
      to: farmerInfo.phone,
      message: alert.message,
      type: 'delivery_completed',
    });
  }

  alertEmitter.emit('alert:delivered', alert);
  return alert;
};

/**
 * Request address confirmation from farmer
 */
export const requestAddressConfirmation = async (
  orderId: string,
  farmerInfo: {
    id: string;
    phone: string;
  },
  deliveryAddress: string,
  config: DeliveryAlertConfig = getDefaultConfig()
): Promise<DeliveryAlert> => {
  const alert: DeliveryAlert = {
    id: `alert_${orderId}_address_confirm_${Date.now()}`,
    orderId,
    farmerId: farmerInfo.id,
    farmerPhone: farmerInfo.phone,
    transporterId: '',
    alertType: 'address_confirmation',
    message: `📍 Please confirm delivery address: ${deliveryAddress}. Reply with YES to confirm or provide correct address.`,
    timestamp: new Date(),
    read: false,
  };

  storeAlert(alert);

  if (config.sendSMS) {
    await mockSendSMS({
      to: farmerInfo.phone,
      message: alert.message,
      type: 'transporter_assigned',
    });
  }

  alertEmitter.emit('alert:address_confirm', alert);
  return alert;
};

/**
 * Store alert in history
 */
const storeAlert = (alert: DeliveryAlert): void => {
  const key = alert.farmerId;

  if (!alertHistory.has(key)) {
    alertHistory.set(key, []);
  }

  alertHistory.get(key)!.push(alert);

  // Keep only last 100 alerts per farmer
  const farmerAlerts = alertHistory.get(key)!;
  if (farmerAlerts.length > 100) {
    alertHistory.set(key, farmerAlerts.slice(-100));
  }

  activeAlerts.set(alert.id, alert);
};

/**
 * Get alerts for a farmer
 */
export const getFarmerAlerts = (farmerId: string, limit: number = 50): DeliveryAlert[] => {
  const alerts = alertHistory.get(farmerId) || [];
  return alerts.slice(-limit).reverse();
};

/**
 * Get active alerts for an order
 */
export const getOrderAlerts = (orderId: string): DeliveryAlert[] => {
  return Array.from(activeAlerts.values()).filter(alert => alert.orderId === orderId);
};

/**
 * Mark alert as read
 */
export const markAlertAsRead = (alertId: string): boolean => {
  const alert = activeAlerts.get(alertId);
  if (alert) {
    alert.read = true;
    return true;
  }
  return false;
};

/**
 * Get unread alerts count for farmer
 */
export const getUnreadAlertsCount = (farmerId: string): number => {
  return (alertHistory.get(farmerId) || []).filter(alert => !alert.read).length;
};

/**
 * Setup real-time alert listener
 */
export const onAlertReceived = (
  callback: (alert: DeliveryAlert) => void
): (() => void) => {
  const handler = (alert: DeliveryAlert) => callback(alert);

  alertEmitter.on('alert:*', handler);
  alertEmitter.on('alert:en_route', handler);
  alertEmitter.on('alert:eta_update', handler);
  alertEmitter.on('alert:arriving_soon', handler);
  alertEmitter.on('alert:delayed', handler);
  alertEmitter.on('alert:delivered', handler);
  alertEmitter.on('alert:address_confirm', handler);

  // Return cleanup function
  return () => {
    alertEmitter.off('alert:*', handler);
    alertEmitter.off('alert:en_route', handler);
    alertEmitter.off('alert:eta_update', handler);
    alertEmitter.off('alert:arriving_soon', handler);
    alertEmitter.off('alert:delayed', handler);
    alertEmitter.off('alert:delivered', handler);
    alertEmitter.off('alert:address_confirm', handler);
  };
};

/**
 * Get default alert configuration
 */
export const getDefaultConfig = (): DeliveryAlertConfig => ({
  sendSMS: true,
  sendPushNotification: true,
  delayThresholdMinutes: 15,
  etaUpdateFrequencyMinutes: 5,
});

/**
 * Clear all alerts (for testing)
 */
export const clearAllAlerts = (): void => {
  alertHistory.clear();
  activeAlerts.clear();
};

export default {
  notifyTransporterEnRoute,
  notifyETAUpdate,
  notifyArrivingSoon,
  notifyDelay,
  notifyDeliveryConfirmed,
  requestAddressConfirmation,
  getFarmerAlerts,
  getOrderAlerts,
  markAlertAsRead,
  getUnreadAlertsCount,
  onAlertReceived,
  getDefaultConfig,
  clearAllAlerts,
};