// Advanced Route Optimization Service for Logistics Platform
// Provides real distance calculation, route optimization, ETA calculation, and multi-stop routing

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Location extends Coordinates {
  address: string;
}

interface Waypoint extends Location {
  type: 'pickup' | 'delivery' | 'stop';
  sequence: number;
}

interface RouteSegment {
  from: Location;
  to: Location;
  distance: number; // in km
  duration: number; // in minutes
  estimatedFuelCost: number; // in RWF
}

interface OptimizedRoute {
  waypoints: Waypoint[];
  segments: RouteSegment[];
  totalDistance: number;
  totalDuration: number;
  totalFuelCost: number;
  estimatedEarnings: number;
  suggestedStops: Location[];
}

interface TrafficConditions {
  level: 'low' | 'moderate' | 'high' | 'severe';
  multiplier: number; // time multiplier (1.0 = normal)
}

// Rwanda major cities and common routes
const RWANDA_CITIES = {
  kigali: { latitude: -1.9706, longitude: 30.1044, name: 'Kigali' },
  butare: { latitude: -2.5974, longitude: 29.7399, name: 'Butare' },
  gisenyi: { latitude: -1.7039, longitude: 29.2562, name: 'Gisenyi' },
  ruhengeri: { latitude: -1.4989, longitude: 29.6330, name: 'Ruhengeri' },
  gitarama: { latitude: -2.0739, longitude: 29.7564, name: 'Gitarama' },
};

/**
 * Calculate accurate distance between two points using Haversine formula
 * @param lat1 - Latitude of point 1
 * @param lon1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lon2 - Longitude of point 2
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Calculate bearing (direction) between two points
 * @returns Bearing in degrees (0-360)
 */
export const calculateBearing = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);

  const bearing = Math.atan2(y, x);
  return ((bearing * 180) / Math.PI + 360) % 360; // Convert to degrees
};

/**
 * Calculate ETA based on distance and traffic conditions
 * @param distanceKm - Distance in kilometers
 * @param trafficConditions - Current traffic conditions
 * @param avgSpeedKmh - Average speed in km/h (default: 50 for city, 80 for highway)
 * @returns Duration in minutes
 */
export const calculateETA = (
  distanceKm: number,
  trafficConditions: TrafficConditions = { level: 'moderate', multiplier: 1.2 },
  avgSpeedKmh: number = 60
): number => {
  // Base time calculation
  const baseTimeHours = distanceKm / avgSpeedKmh;

  // Apply traffic multiplier
  const adjustedTimeHours = baseTimeHours * trafficConditions.multiplier;

  // Convert to minutes and round
  return Math.ceil(adjustedTimeHours * 60);
};

/**
 * Estimate fuel cost for a route
 * @param distanceKm - Distance in kilometers
 * @param fuelPricePerLiter - Current fuel price (default: 1500 RWF/liter)
 * @param avgConsumptionPer100Km - Vehicle fuel consumption (default: 12 liters/100km)
 * @returns Estimated fuel cost in RWF
 */
export const calculateFuelCost = (
  distanceKm: number,
  fuelPricePerLiter: number = 1500,
  avgConsumptionPer100Km: number = 12
): number => {
  const litersUsed = (distanceKm / 100) * avgConsumptionPer100Km;
  return Math.round(litersUsed * fuelPricePerLiter);
};

/**
 * Calculate earnings based on distance and rate
 * @param distanceKm - Distance in kilometers
 * @param ratePerKm - Rate per kilometer (default: 1200 RWF/km)
 * @returns Estimated earnings in RWF
 */
export const calculateEarnings = (
  distanceKm: number,
  ratePerKm: number = 1200
): number => {
  return Math.round(distanceKm * ratePerKm);
};

/**
 * Calculate profit margin (earnings - fuel cost)
 */
export const calculateProfit = (
  distanceKm: number,
  ratePerKm: number = 1200,
  fuelPricePerLiter: number = 1500,
  avgConsumptionPer100Km: number = 12
): number => {
  const earnings = calculateEarnings(distanceKm, ratePerKm);
  const fuelCost = calculateFuelCost(distanceKm, fuelPricePerLiter, avgConsumptionPer100Km);
  return earnings - fuelCost;
};

/**
 * Optimize multi-stop route using nearest neighbor algorithm
 * @param currentLocation - Starting point
 * @param destinations - Array of destinations to visit
 * @returns Optimized sequence of waypoints
 */
export const optimizeMultiStopRoute = (
  currentLocation: Location,
  destinations: Waypoint[]
): Waypoint[] => {
  if (destinations.length <= 1) return destinations;

  const unvisited = [...destinations];
  const optimized: Waypoint[] = [];
  let current = currentLocation;

  // Nearest neighbor algorithm
  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Number.MAX_VALUE;

    unvisited.forEach((dest, index) => {
      const distance = calculateDistance(
        current.latitude,
        current.longitude,
        dest.latitude,
        dest.longitude
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
 * Calculate route segments for a multi-stop journey
 */
export const calculateRouteSegments = (
  waypoints: Location[],
  trafficConditions?: TrafficConditions
): RouteSegment[] => {
  const segments: RouteSegment[] = [];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i];
    const to = waypoints[i + 1];

    const distance = calculateDistance(
      from.latitude,
      from.longitude,
      to.latitude,
      to.longitude
    );

    const duration = calculateETA(distance, trafficConditions);
    const fuelCost = calculateFuelCost(distance);

    segments.push({
      from,
      to,
      distance,
      duration,
      estimatedFuelCost: fuelCost,
    });
  }

  return segments;
};

/**
 * Find nearby loads within a specified radius
 * @param currentLocation - Transporter's current location
 * @param loads - Available loads
 * @param radiusKm - Search radius in kilometers (default: 50km)
 * @returns Array of nearby loads with distance
 */
export const findNearbyLoads = (
  currentLocation: Coordinates,
  loads: any[],
  radiusKm: number = 50
): Array<{ load: any; distance: number; estimatedEarnings: number }> => {
  return loads
    .map(load => {
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        load.pickupLocation.latitude,
        load.pickupLocation.longitude
      );

      const totalDistance = distance + calculateDistance(
        load.pickupLocation.latitude,
        load.pickupLocation.longitude,
        load.deliveryLocation.latitude,
        load.deliveryLocation.longitude
      );

      return {
        load,
        distance,
        totalDistance,
        estimatedEarnings: calculateEarnings(totalDistance),
      };
    })
    .filter(item => item.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
};

/**
 * Calculate optimal pickup time considering current location
 */
export const calculatePickupETA = (
  currentLocation: Coordinates,
  pickupLocation: Coordinates,
  trafficConditions?: TrafficConditions
): { distance: number; eta: number; arrivalTime: Date } => {
  const distance = calculateDistance(
    currentLocation.latitude,
    currentLocation.longitude,
    pickupLocation.latitude,
    pickupLocation.longitude
  );

  const eta = calculateETA(distance, trafficConditions);
  const arrivalTime = new Date(Date.now() + eta * 60 * 1000);

  return { distance, eta, arrivalTime };
};

/**
 * Suggest optimal rest stops along a route
 */
export const suggestRestStops = (
  segments: RouteSegment[],
  maxDrivingHours: number = 4
): Location[] => {
  const stops: Location[] = [];
  let accumulatedTime = 0;

  for (let i = 0; i < segments.length; i++) {
    accumulatedTime += segments[i].duration;

    // Suggest a rest stop every maxDrivingHours
    if (accumulatedTime >= maxDrivingHours * 60) {
      stops.push(segments[i].to);
      accumulatedTime = 0;
    }
  }

  return stops;
};

/**
 * Complete route optimization with all details
 */
export const optimizeCompleteRoute = (
  currentLocation: Location,
  pickups: Location[],
  deliveries: Location[],
  trafficConditions?: TrafficConditions
): OptimizedRoute => {
  // Create waypoints
  const pickupWaypoints: Waypoint[] = pickups.map((loc, idx) => ({
    ...loc,
    type: 'pickup',
    sequence: idx + 1,
  }));

  const deliveryWaypoints: Waypoint[] = deliveries.map((loc, idx) => ({
    ...loc,
    type: 'delivery',
    sequence: pickups.length + idx + 1,
  }));

  // Combine and optimize
  const allWaypoints = [...pickupWaypoints, ...deliveryWaypoints];
  const optimizedWaypoints = optimizeMultiStopRoute(currentLocation, allWaypoints);

  // Calculate segments
  const fullRoute = [currentLocation, ...optimizedWaypoints];
  const segments = calculateRouteSegments(fullRoute, trafficConditions);

  // Calculate totals
  const totalDistance = segments.reduce((sum, seg) => sum + seg.distance, 0);
  const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
  const totalFuelCost = segments.reduce((sum, seg) => sum + seg.estimatedFuelCost, 0);
  const estimatedEarnings = calculateEarnings(totalDistance);

  // Suggest rest stops
  const suggestedStops = suggestRestStops(segments);

  return {
    waypoints: optimizedWaypoints,
    segments,
    totalDistance,
    totalDuration,
    totalFuelCost,
    estimatedEarnings,
    suggestedStops,
  };
};

/**
 * Get current traffic conditions (mock implementation - can be replaced with real API)
 */
export const getCurrentTrafficConditions = (
  hour: number = new Date().getHours()
): TrafficConditions => {
  // Rush hours: 7-9 AM and 5-7 PM
  if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
    return { level: 'high', multiplier: 1.5 };
  }
  // Business hours
  if (hour >= 9 && hour <= 17) {
    return { level: 'moderate', multiplier: 1.2 };
  }
  // Night/early morning
  return { level: 'low', multiplier: 1.0 };
};

export default {
  calculateDistance,
  calculateBearing,
  calculateETA,
  calculateFuelCost,
  calculateEarnings,
  calculateProfit,
  optimizeMultiStopRoute,
  calculateRouteSegments,
  findNearbyLoads,
  calculatePickupETA,
  suggestRestStops,
  optimizeCompleteRoute,
  getCurrentTrafficConditions,
};
