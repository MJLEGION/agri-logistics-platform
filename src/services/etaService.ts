// ETA and Traffic Prediction Service
// Provides real-time ETA calculations with intelligent traffic prediction based on time of day and location

import { calculateDistance, calculateETA } from './routeOptimizationService';

export interface TrafficInfo {
  level: 'light' | 'moderate' | 'heavy' | 'congested';
  description: string;
  speedReduction: number; // percentage reduction from normal speed
  multiplier: number; // time multiplier
  color: string; // UI color indicator
  icon: string; // emoji icon
}

export interface ETAData {
  distanceKm: number;
  durationMinutes: number;
  arrivalTime: Date;
  currentSpeed: number; // km/h
  trafficInfo: TrafficInfo;
  confidence: number; // 0-100% confidence level
  lastUpdated: Date;
}

export interface RouteInfo {
  from: {
    latitude: number;
    longitude: number;
    address: string;
  };
  to: {
    latitude: number;
    longitude: number;
    address: string;
  };
  currentLocation?: {
    latitude: number;
    longitude: number;
    speed?: number;
  };
}

/**
 * Get traffic conditions based on time of day and location
 * Uses historical Rwanda traffic patterns
 */
export const getTrafficConditions = (
  hour: number = new Date().getHours(),
  dayOfWeek: number = new Date().getDay()
): TrafficInfo => {
  // Rwanda traffic patterns (empirical)
  // Peak hours: 7-9 AM, 11-1 PM, 4-6 PM
  
  const isPeakHour = (h: number) => {
    return (h >= 7 && h <= 9) || (h >= 11 && h <= 13) || (h >= 16 && h <= 18);
  };

  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isNight = hour < 6 || hour > 20;

  if (isNight) {
    return {
      level: 'light',
      description: 'Light traffic - Night time',
      speedReduction: 0,
      multiplier: 0.9,
      color: '#4CAF50',
      icon: '🌙',
    };
  }

  if (isWeekend && !isPeakHour(hour)) {
    return {
      level: 'light',
      description: 'Light traffic - Weekend',
      speedReduction: 0,
      multiplier: 1.0,
      color: '#4CAF50',
      icon: '😎',
    };
  }

  if (isPeakHour(hour)) {
    return {
      level: 'heavy',
      description: 'Heavy traffic - Peak hour',
      speedReduction: 40,
      multiplier: 1.6,
      color: '#FF6F00',
      icon: '🚗',
    };
  }

  if ((hour >= 14 && hour <= 15) || (hour >= 13 && hour <= 14)) {
    return {
      level: 'moderate',
      description: 'Moderate traffic - Lunch time',
      speedReduction: 20,
      multiplier: 1.25,
      color: '#FFC107',
      icon: '🍴',
    };
  }

  return {
    level: 'moderate',
    description: 'Moderate traffic',
    speedReduction: 15,
    multiplier: 1.15,
    color: '#FF9800',
    icon: '⚠️',
  };
};

/**
 * Calculate ETA from current location to destination
 * Takes into account distance, traffic, and current speed
 */
export const calculateRouteETA = (routeInfo: RouteInfo): ETAData => {
  const now = new Date();
  
  // Calculate distance
  const distance = calculateDistance(
    routeInfo.from.latitude,
    routeInfo.from.longitude,
    routeInfo.to.latitude,
    routeInfo.to.longitude
  );

  // Get current traffic conditions
  const trafficInfo = getTrafficConditions();

  // Get current speed (from GPS or assume standard)
  const currentSpeed = routeInfo.currentLocation?.speed || 50; // km/h

  // Calculate ETA
  const baseDuration = calculateETA(distance, trafficInfo as any, currentSpeed);

  // Calculate arrival time
  const arrivalTime = new Date(now.getTime() + baseDuration * 60000);

  return {
    distanceKm: Math.round(distance * 10) / 10,
    durationMinutes: baseDuration,
    arrivalTime,
    currentSpeed: Math.round(currentSpeed),
    trafficInfo,
    confidence: 85, // 85% confidence for Rwanda urban areas
    lastUpdated: now,
  };
};

/**
 * Calculate remaining time and distance to destination
 * For use when transporter is already in transit
 */
export const calculateRemainingETA = (
  currentLat: number,
  currentLng: number,
  destLat: number,
  destLng: number,
  currentSpeed: number = 50
): ETAData => {
  const now = new Date();
  
  // Calculate remaining distance
  const remainingDistance = calculateDistance(
    currentLat,
    currentLng,
    destLat,
    destLng
  );

  // Get traffic conditions
  const trafficInfo = getTrafficConditions();

  // Calculate remaining time
  const remainingMinutes = calculateETA(remainingDistance, trafficInfo as any, currentSpeed);

  // Calculate arrival time
  const arrivalTime = new Date(now.getTime() + remainingMinutes * 60000);

  return {
    distanceKm: Math.round(remainingDistance * 10) / 10,
    durationMinutes: remainingMinutes,
    arrivalTime,
    currentSpeed: Math.round(currentSpeed),
    trafficInfo,
    confidence: 80,
    lastUpdated: now,
  };
};

/**
 * Format arrival time for display
 */
export const formatArrivalTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Format ETA duration for display
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 1) return 'Less than 1 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${Math.round(mins)}m`;
};

/**
 * Get traffic alert message
 */
export const getTrafficAlert = (eta: ETAData): string | null => {
  if (eta.trafficInfo.level === 'congested') {
    return `⚠️ Heavy congestion detected! ETA may be delayed by ${Math.round(eta.durationMinutes * 0.3)} minutes`;
  }
  if (eta.trafficInfo.level === 'heavy') {
    return `🚗 Heavy traffic ahead. Route may take ${eta.durationMinutes} minutes`;
  }
  if (eta.durationMinutes > 60) {
    return `📍 Long route ahead - ${formatDuration(eta.durationMinutes)}`;
  }
  return null;
};

/**
 * Estimate multiple alternative ETAs with different speeds
 * Useful for showing best/worst case scenarios
 */
export const estimateETARange = (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): {
  bestCase: ETAData;
  normalCase: ETAData;
  worstCase: ETAData;
} => {
  const distance = calculateDistance(fromLat, fromLng, toLat, toLng);
  const now = new Date();

  const createETA = (speed: number, multiplier: number): ETAData => {
    const baseMinutes = (distance / speed) * 60;
    const adjustedMinutes = Math.ceil(baseMinutes * multiplier);
    const arrivalTime = new Date(now.getTime() + adjustedMinutes * 60000);

    return {
      distanceKm: Math.round(distance * 10) / 10,
      durationMinutes: adjustedMinutes,
      arrivalTime,
      currentSpeed: speed,
      trafficInfo: getTrafficConditions(),
      confidence: 75,
      lastUpdated: now,
    };
  };

  return {
    bestCase: createETA(70, 1.0), // Good conditions, 70 km/h
    normalCase: createETA(50, 1.2), // Normal conditions with traffic
    worstCase: createETA(30, 1.6), // Heavy traffic, 30 km/h
  };
};

/**
 * Export all ETA service functions
 */
export const etaService = {
  getTrafficConditions,
  calculateRouteETA,
  calculateRemainingETA,
  formatArrivalTime,
  formatDuration,
  getTrafficAlert,
  estimateETARange,
};

export default etaService;