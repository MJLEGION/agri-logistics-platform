// Smart Route Optimization Service with Real-Time Tracking
// Handles multi-stop routing, delay detection, and automated alerts

import { calculateDistance, calculateETA, calculateEarnings, optimizeMultiStopRoute } from './routeOptimizationService';
import {
  notifyTransporterEnRoute,
  notifyETAUpdate,
  notifyArrivingSoon,
  notifyDelay,
  getDefaultConfig,
} from './deliveryAlertsService';

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface StopInfo extends Location {
  orderId: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  type: 'pickup' | 'delivery';
  quantity?: string;
  cropType?: string;
  sequence: number;
  estimatedArrival?: Date;
  actualArrival?: Date;
  status: 'pending' | 'arrived' | 'completed';
}

export interface OptimizedMultiRoute {
  routeId: string;
  transporterId: string;
  currentLocation: Location;
  stops: StopInfo[];
  totalDistance: number;
  totalDuration: number;
  totalEarnings: number;
  estimatedCompletionTime: Date;
  alerts: string[];
}

export interface RouteTracker {
  routeId: string;
  startTime: Date;
  lastUpdateTime: Date;
  currentLocation: Location;
  currentStopIndex: number;
  isDelayed: boolean;
  delayMinutes: number;
  alertsSent: string[];
  completedStops: number;
}

const activeRoutes: Map<string, OptimizedMultiRoute> = new Map();
const routeTrackers: Map<string, RouteTracker> = new Map();
const trackingIntervals: Map<string, NodeJS.Timeout> = new Map();

/**
 * Create optimized multi-stop route combining multiple pickup/delivery points
 * Uses nearest neighbor algorithm for efficiency
 */
export const createOptimizedRoute = (
  transporterId: string,
  currentLocation: Location,
  stops: StopInfo[]
): OptimizedMultiRoute => {
  if (stops.length === 0) {
    throw new Error('No stops provided for route optimization');
  }

  // Separate pickups and deliveries
  const pickups = stops.filter(s => s.type === 'pickup');
  const deliveries = stops.filter(s => s.type === 'delivery');

  // Optimize pickup points first (nearest neighbor)
  const optimizedPickups = optimizeSequence(currentLocation, pickups);
  const optimizedDeliveries = optimizeSequence(
    optimizedPickups[optimizedPickups.length - 1],
    deliveries
  );

  // Combine optimized stops
  const optimizedStops = [...optimizedPickups, ...optimizedDeliveries];

  // Calculate route metrics
  let totalDistance = 0;
  let currentLoc = currentLocation;

  optimizedStops.forEach((stop, index) => {
    const distance = calculateDistance(
      currentLoc.latitude,
      currentLoc.longitude,
      stop.latitude,
      stop.longitude
    );

    totalDistance += distance;
    stop.estimatedArrival = new Date(
      Date.now() + totalDistance * 60 * 1000 // Simplified: 1 min per km
    );
    currentLoc = stop;
  });

  const totalDuration = totalDistance * 1.2; // Approximate: 1.2 minutes per km
  const totalEarnings = calculateEarnings(totalDistance);

  const route: OptimizedMultiRoute = {
    routeId: `route_${transporterId}_${Date.now()}`,
    transporterId,
    currentLocation,
    stops: optimizedStops,
    totalDistance,
    totalDuration,
    totalEarnings,
    estimatedCompletionTime: new Date(Date.now() + totalDuration * 60 * 1000),
    alerts: [],
  };

  activeRoutes.set(route.routeId, route);

  return route;
};

/**
 * Optimize sequence of stops using nearest neighbor algorithm
 */
const optimizeSequence = (startLocation: Location, stops: StopInfo[]): StopInfo[] => {
  if (stops.length <= 1) return stops;

  const unvisited = [...stops];
  const optimized: StopInfo[] = [];
  let current = startLocation;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Number.MAX_VALUE;

    unvisited.forEach((stop, index) => {
      const distance = calculateDistance(
        current.latitude,
        current.longitude,
        stop.latitude,
        stop.longitude
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    const nearest = unvisited.splice(nearestIndex, 1)[0];
    nearest.sequence = optimized.length + 1;
    optimized.push(nearest);
    current = nearest;
  }

  return optimized;
};

/**
 * Start real-time tracking of a route with automated alerts
 */
export const startRouteTracking = async (
  routeId: string,
  updateIntervalSeconds: number = 60
): Promise<void> => {
  const route = activeRoutes.get(routeId);
  if (!route) {
    throw new Error(`Route ${routeId} not found`);
  }

  const tracker: RouteTracker = {
    routeId,
    startTime: new Date(),
    lastUpdateTime: new Date(),
    currentLocation: route.currentLocation,
    currentStopIndex: 0,
    isDelayed: false,
    delayMinutes: 0,
    alertsSent: [],
    completedStops: 0,
  };

  routeTrackers.set(routeId, tracker);

  // Start periodic tracking
  const interval = setInterval(() => {
    updateRouteTracking(routeId, tracker);
  }, updateIntervalSeconds * 1000);

  trackingIntervals.set(routeId, interval);
};

/**
 * Update route tracking and send alerts if needed
 */
const updateRouteTracking = async (
  routeId: string,
  tracker: RouteTracker
): Promise<void> => {
  const route = activeRoutes.get(routeId);
  if (!route) return;

  const currentStop = route.stops[tracker.currentStopIndex];
  if (!currentStop) return;

  // Simulate movement towards current stop
  const distanceToStop = calculateDistance(
    tracker.currentLocation.latitude,
    tracker.currentLocation.longitude,
    currentStop.latitude,
    currentStop.longitude
  );

  const etaToStop = calculateETA(distanceToStop);
  tracker.lastUpdateTime = new Date();

  // Check for delay
  const expectedArrivalTime = currentStop.estimatedArrival?.getTime() || 0;
  const currentTime = Date.now();
  const delayMinutes = Math.max(0, Math.floor((currentTime - expectedArrivalTime) / 60000));

  tracker.isDelayed = delayMinutes > 15; // Alert if 15+ minutes late
  tracker.delayMinutes = delayMinutes;

  // Send appropriate alerts
  if (distanceToStop < 5 && !tracker.alertsSent.includes('arriving_soon')) {
    // Transporter arriving soon (within 5km)
    await notifyArrivingSoon(
      currentStop.orderId,
      {
        id: currentStop.farmerId,
        name: currentStop.farmerName,
        phone: currentStop.farmerPhone,
        pickupAddress: currentStop.address,
      },
      {
        id: route.transporterId,
        name: `Transporter ${route.transporterId.slice(-4)}`,
      },
      getDefaultConfig()
    );

    tracker.alertsSent.push('arriving_soon');
    route.alerts.push(`Arriving soon alert sent for stop ${tracker.currentStopIndex + 1}`);
  }

  // Send delay alert if necessary
  if (tracker.isDelayed && !tracker.alertsSent.includes('delayed')) {
    const reasons = [
      'Heavy traffic',
      'Vehicle maintenance',
      'Weather conditions',
      'Route adjustment',
    ];
    const reason = reasons[Math.floor(Math.random() * reasons.length)];

    await notifyDelay(
      currentStop.orderId,
      {
        id: currentStop.farmerId,
        phone: currentStop.farmerPhone,
      },
      {
        id: route.transporterId,
        name: `Transporter ${route.transporterId.slice(-4)}`,
      },
      tracker.delayMinutes,
      reason,
      getDefaultConfig()
    );

    tracker.alertsSent.push('delayed');
    route.alerts.push(`Delay alert sent: ${delayMinutes} minutes late`);
  }

  // Send ETA update (every 5 minutes)
  if (tracker.lastUpdateTime.getMinutes() % 5 === 0) {
    await notifyETAUpdate(
      currentStop.orderId,
      currentStop.farmerPhone,
      currentStop.farmerId,
      route.transporterId,
      etaToStop,
      tracker.currentLocation,
      distanceToStop,
      getDefaultConfig()
    );

    route.alerts.push(`ETA update: ${etaToStop} minutes to stop ${tracker.currentStopIndex + 1}`);
  }

  // Check if arrived at current stop
  if (distanceToStop < 0.1) {
    // Arrived
    currentStop.actualArrival = new Date();
    currentStop.status = 'arrived';
    tracker.completedStops++;

    if (tracker.currentStopIndex < route.stops.length - 1) {
      tracker.currentStopIndex++;
      tracker.alertsSent = [];
    }

    route.alerts.push(`Arrived at stop ${tracker.currentStopIndex}: ${currentStop.address}`);
  }
};

/**
 * Mark stop as completed
 */
export const completeStop = (
  routeId: string,
  stopIndex: number,
  notes?: string
): boolean => {
  const route = activeRoutes.get(routeId);
  if (!route || stopIndex >= route.stops.length) {
    return false;
  }

  const stop = route.stops[stopIndex];
  stop.status = 'completed';
  stop.actualArrival = new Date();

  return true;
};

/**
 * Stop route tracking
 */
export const stopRouteTracking = (routeId: string): void => {
  const interval = trackingIntervals.get(routeId);
  if (interval) {
    clearInterval(interval);
    trackingIntervals.delete(routeId);
  }

  const tracker = routeTrackers.get(routeId);
  if (tracker) {
    routeTrackers.delete(routeId);
  }
};

/**
 * Get active route
 */
export const getRoute = (routeId: string): OptimizedMultiRoute | undefined => {
  return activeRoutes.get(routeId);
};

/**
 * Get route tracker status
 */
export const getTrackerStatus = (routeId: string): RouteTracker | undefined => {
  return routeTrackers.get(routeId);
};

/**
 * Get all active routes for transporter
 */
export const getTransporterRoutes = (transporterId: string): OptimizedMultiRoute[] => {
  return Array.from(activeRoutes.values()).filter(
    route => route.transporterId === transporterId
  );
};

/**
 * Update current location during route
 */
export const updateRouteLocation = (
  routeId: string,
  newLocation: Location
): boolean => {
  const route = activeRoutes.get(routeId);
  const tracker = routeTrackers.get(routeId);

  if (!route || !tracker) {
    return false;
  }

  tracker.currentLocation = newLocation;
  return true;
};

/**
 * Calculate savings from multi-stop optimization
 */
export const calculateRouteSavings = (
  singleRoutesDistance: number,
  optimizedRouteDistance: number
): { distanceSaved: number; percentageSaved: number; costSaved: number } => {
  const distanceSaved = singleRoutesDistance - optimizedRouteDistance;
  const percentageSaved = (distanceSaved / singleRoutesDistance) * 100;
  const costSaved = distanceSaved * 1200; // 1200 RWF per km saved

  return {
    distanceSaved: Math.round(distanceSaved * 100) / 100,
    percentageSaved: Math.round(percentageSaved * 100) / 100,
    costSaved: Math.round(costSaved),
  };
};

/**
 * Get route summary
 */
export const getRouteSummary = (routeId: string) => {
  const route = activeRoutes.get(routeId);
  const tracker = routeTrackers.get(routeId);

  if (!route || !tracker) {
    return null;
  }

  const completedStops = route.stops.filter(s => s.status === 'completed').length;
  const pendingStops = route.stops.filter(s => s.status === 'pending').length;

  return {
    routeId,
    transporterId: route.transporterId,
    totalStops: route.stops.length,
    completedStops,
    pendingStops,
    currentStopIndex: tracker.currentStopIndex,
    totalDistance: route.totalDistance,
    totalEarnings: route.totalEarnings,
    isDelayed: tracker.isDelayed,
    delayMinutes: tracker.delayMinutes,
    alertsSent: tracker.alertsSent.length,
    estimatedCompletionTime: route.estimatedCompletionTime,
    startTime: tracker.startTime,
  };
};

export default {
  createOptimizedRoute,
  startRouteTracking,
  stopRouteTracking,
  completeStop,
  getRoute,
  getTrackerStatus,
  getTransporterRoutes,
  updateRouteLocation,
  calculateRouteSavings,
  getRouteSummary,
};