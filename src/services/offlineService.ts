// src/services/offlineService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const OFFLINE_QUEUE_KEY = '@offline_queue';
const OFFLINE_ORDERS_KEY = '@offline_orders';
const OFFLINE_CROPS_KEY = '@offline_crops';

export interface OfflineRequest {
  id: string;
  type: 'order' | 'crop' | 'update';
  data: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
}

/**
 * Check if device is online
 */
export const checkConnectivity = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
};

/**
 * Save request to offline queue
 */
export const saveToOfflineQueue = async (
  type: 'order' | 'crop' | 'update',
  data: any
): Promise<string> => {
  try {
    const queue = await getOfflineQueue();
    
    const request: OfflineRequest = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    };
    
    queue.push(request);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    
    console.log(`✅ Saved ${type} to offline queue:`, request.id);
    return request.id;
  } catch (error) {
    console.error('Error saving to offline queue:', error);
    throw error;
  }
};

/**
 * Get all pending offline requests
 */
export const getOfflineQueue = async (): Promise<OfflineRequest[]> => {
  try {
    const queueJson = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error('Error reading offline queue:', error);
    return [];
  }
};

/**
 * Sync offline queue when connection is restored
 */
export const syncOfflineQueue = async (
  onProgress?: (current: number, total: number) => void
): Promise<{ success: number; failed: number }> => {
  const isOnline = await checkConnectivity();
  
  if (!isOnline) {
    console.log('⚠️ Device is offline, skipping sync');
    return { success: 0, failed: 0 };
  }
  
  const queue = await getOfflineQueue();
  const pendingRequests = queue.filter(req => req.status === 'pending');
  
  if (pendingRequests.length === 0) {
    console.log('✅ No pending requests to sync');
    return { success: 0, failed: 0 };
  }
  
  console.log(`🔄 Syncing ${pendingRequests.length} offline requests...`);
  
  let successCount = 0;
  let failedCount = 0;
  
  for (let i = 0; i < pendingRequests.length; i++) {
    const request = pendingRequests[i];
    
    if (onProgress) {
      onProgress(i + 1, pendingRequests.length);
    }
    
    try {
      // Update status to syncing
      await updateRequestStatus(request.id, 'syncing');
      
      // Attempt to sync based on type
      await syncRequest(request);
      
      // Remove from queue on success
      await removeFromQueue(request.id);
      successCount++;
      
      console.log(`✅ Synced request ${request.id}`);
    } catch (error) {
      console.error(`❌ Failed to sync request ${request.id}:`, error);
      
      // Increment retry count
      request.retryCount++;
      
      // Mark as failed if too many retries
      if (request.retryCount >= 3) {
        await updateRequestStatus(request.id, 'failed');
      } else {
        await updateRequestStatus(request.id, 'pending');
      }
      
      failedCount++;
    }
  }
  
  console.log(`✅ Sync complete: ${successCount} success, ${failedCount} failed`);
  return { success: successCount, failed: failedCount };
};

/**
 * Sync individual request
 */
const syncRequest = async (request: OfflineRequest): Promise<void> => {
  // Import services dynamically to avoid circular dependencies
  const { createOrder } = require('./orderService');
  const { createCargo } = require('./cargoService');
  
  switch (request.type) {
    case 'order':
      await createOrder(request.data);
      break;
    case 'cargo':
      await createCargo(request.data);
      break;
    case 'update':
      // Handle updates
      break;
    default:
      throw new Error(`Unknown request type: ${request.type}`);
  }
};

/**
 * Update request status in queue
 */
const updateRequestStatus = async (
  requestId: string,
  status: 'pending' | 'syncing' | 'failed'
): Promise<void> => {
  const queue = await getOfflineQueue();
  const updated = queue.map(req =>
    req.id === requestId ? { ...req, status } : req
  );
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated));
};

/**
 * Remove request from queue
 */
const removeFromQueue = async (requestId: string): Promise<void> => {
  const queue = await getOfflineQueue();
  const filtered = queue.filter(req => req.id !== requestId);
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
};

/**
 * Save order locally (for offline viewing)
 */
export const saveOrderLocally = async (order: any): Promise<void> => {
  try {
    const orders = await getLocalOrders();
    orders.push({ ...order, _offline: true, _savedAt: Date.now() });
    await AsyncStorage.setItem(OFFLINE_ORDERS_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error('Error saving order locally:', error);
  }
};

/**
 * Get locally saved orders
 */
export const getLocalOrders = async (): Promise<any[]> => {
  try {
    const ordersJson = await AsyncStorage.getItem(OFFLINE_ORDERS_KEY);
    return ordersJson ? JSON.parse(ordersJson) : [];
  } catch (error) {
    console.error('Error reading local orders:', error);
    return [];
  }
};

/**
 * Clear synced local data
 */
export const clearSyncedData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(OFFLINE_ORDERS_KEY);
    console.log('✅ Cleared synced local data');
  } catch (error) {
    console.error('Error clearing synced data:', error);
  }
};

/**
 * Get offline queue count
 */
export const getOfflineQueueCount = async (): Promise<number> => {
  const queue = await getOfflineQueue();
  return queue.filter(req => req.status === 'pending').length;
};

/**
 * Setup network listener for auto-sync
 */
export const setupNetworkListener = (
  onOnline: () => void,
  onOffline: () => void
): (() => void) => {
  const unsubscribe = NetInfo.addEventListener(state => {
    if (state.isConnected) {
      console.log('📶 Network connected');
      onOnline();
    } else {
      console.log('📵 Network disconnected');
      onOffline();
    }
  });
  
  return unsubscribe;
};