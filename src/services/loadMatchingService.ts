// Load Matching Service - Smart algorithm to match transporters with optimal loads
// Considers distance, vehicle capacity, route optimization, and earnings potential

import { calculateDistance, calculateEarnings, calculateFuelCost, calculateProfit } from './routeOptimizationService';

interface Vehicle {
  id: string;
  type: 'pickup' | 'truck' | 'van' | 'semi';
  capacity: number; // in kg
  currentLoad: number; // current weight in kg
  availableCapacity: number;
}

interface Load {
  _id: string;
  id?: string;
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  deliveryLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  weight?: number;
  quantity: number;
  cropId?: { name: string };
  status: string;
  totalPrice: number;
  shippingCost?: number; // Actual transport fee calculated when cargo was created
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
  preferredPickupTime?: Date;
}

interface TransporterLocation {
  latitude: number;
  longitude: number;
}

interface MatchScore {
  load: Load;
  score: number;
  distance: number;
  routeDistance: number;
  estimatedEarnings: number;
  estimatedFuelCost: number;
  profit: number;
  eta: number;
  matchReasons: string[];
  priority: 'high' | 'medium' | 'low';
}

interface MatchFilters {
  maxDistance?: number; // Max distance to pickup (km)
  minProfit?: number; // Minimum profit threshold (RWF)
  vehicleCapacity?: number;
  urgencyPreference?: 'low' | 'medium' | 'high' | 'urgent';
  preferredRegions?: string[];
}

/**
 * Calculate match score between transporter and load
 * Higher score = better match
 */
const calculateMatchScore = (
  transporterLocation: TransporterLocation,
  load: Load,
  vehicle?: Vehicle
): MatchScore => {
  const matchReasons: string[] = [];
  let baseScore = 100;

  // 1. Calculate distances
  const distanceToPickup = calculateDistance(
    transporterLocation.latitude,
    transporterLocation.longitude,
    load.pickupLocation.latitude,
    load.pickupLocation.longitude
  );

  const routeDistance = calculateDistance(
    load.pickupLocation.latitude,
    load.pickupLocation.longitude,
    load.deliveryLocation.latitude,
    load.deliveryLocation.longitude
  );

  // 2. Distance scoring (closer is better)
  if (distanceToPickup < 5) {
    baseScore += 30;
    matchReasons.push('Very close to you');
  } else if (distanceToPickup < 15) {
    baseScore += 20;
    matchReasons.push('Close to you');
  } else if (distanceToPickup < 30) {
    baseScore += 10;
    matchReasons.push('Nearby');
  } else if (distanceToPickup > 50) {
    baseScore -= 20;
    matchReasons.push('Far from your location');
  }

  // 3. Route distance scoring (longer routes = more earnings)
  if (routeDistance > 50) {
    baseScore += 25;
    matchReasons.push('Long haul - High earnings');
  } else if (routeDistance > 20) {
    baseScore += 15;
    matchReasons.push('Good distance');
  } else if (routeDistance < 5) {
    baseScore -= 10;
    matchReasons.push('Short route');
  }

  // 4. Calculate financials
  // Use actual shippingCost if available (calculated at cargo creation with proper vehicle type & traffic)
  // Otherwise fall back to generic distance-based calculation
  const estimatedEarnings = load.shippingCost && load.shippingCost > 0
    ? load.shippingCost  // Real transport fee
    : calculateEarnings(routeDistance); // Fallback: only charge for delivery route, not pickup

  // Fuel cost includes both pickup drive and delivery route
  const totalDistance = distanceToPickup + routeDistance;
  const estimatedFuelCost = calculateFuelCost(totalDistance);
  const profit = estimatedEarnings - estimatedFuelCost;

  // 5. Profit margin scoring
  const profitMargin = (profit / estimatedEarnings) * 100;
  if (profitMargin > 50) {
    baseScore += 30;
    matchReasons.push('Excellent profit margin');
  } else if (profitMargin > 30) {
    baseScore += 20;
    matchReasons.push('Good profit margin');
  } else if (profitMargin < 15) {
    baseScore -= 15;
    matchReasons.push('Low profit margin');
  }

  // 6. Urgency scoring
  if (load.urgency === 'urgent') {
    baseScore += 40;
    matchReasons.push('URGENT - Premium pay');
  } else if (load.urgency === 'high') {
    baseScore += 20;
    matchReasons.push('High priority');
  }

  // 7. Vehicle capacity check
  if (vehicle) {
    const loadWeight = load.weight || load.quantity * 25; // Assume 25kg per unit if not specified
    if (loadWeight <= vehicle.availableCapacity) {
      baseScore += 15;
      matchReasons.push('Fits your vehicle');
    } else {
      baseScore -= 30;
      matchReasons.push('Exceeds vehicle capacity');
    }
  }

  // 8. ETA calculation
  const avgSpeed = 60; // km/h
  const eta = Math.ceil((distanceToPickup / avgSpeed) * 60); // minutes

  // 9. Time preference (pickup time)
  if (load.preferredPickupTime) {
    const pickupTime = new Date(load.preferredPickupTime).getTime();
    const possibleArrival = Date.now() + eta * 60 * 1000;
    const timeDiff = Math.abs(pickupTime - possibleArrival) / (1000 * 60); // minutes

    if (timeDiff < 30) {
      baseScore += 25;
      matchReasons.push('Perfect timing');
    } else if (timeDiff > 120) {
      baseScore -= 10;
    }
  }

  // 10. Determine priority
  let priority: 'high' | 'medium' | 'low' = 'medium';
  if (baseScore >= 140) priority = 'high';
  else if (baseScore < 100) priority = 'low';

  return {
    load,
    score: baseScore,
    distance: distanceToPickup,
    routeDistance,
    estimatedEarnings,
    estimatedFuelCost,
    profit,
    eta,
    matchReasons,
    priority,
  };
};

/**
 * Find best matching loads for a transporter
 * @param transporterLocation - Current transporter location
 * @param availableLoads - All available loads
 * @param filters - Optional filters for matching
 * @param vehicle - Vehicle details for capacity checking
 * @returns Sorted array of matched loads with scores
 */
export const findBestMatches = (
  transporterLocation: TransporterLocation,
  availableLoads: Load[],
  filters?: MatchFilters,
  vehicle?: Vehicle
): MatchScore[] => {
  // Calculate match scores for all loads
  let matches = availableLoads.map(load =>
    calculateMatchScore(transporterLocation, load, vehicle)
  );

  // Apply filters
  if (filters) {
    if (filters.maxDistance) {
      matches = matches.filter(m => m.distance <= filters.maxDistance!);
    }

    if (filters.minProfit) {
      matches = matches.filter(m => m.profit >= filters.minProfit!);
    }

    if (filters.urgencyPreference) {
      matches = matches.filter(m => m.load.urgency === filters.urgencyPreference);
    }
  }

  // Sort by score (highest first)
  matches.sort((a, b) => b.score - a.score);

  return matches;
};

/**
 * Find loads along a route (for multi-load optimization)
 * @param currentLocation - Starting point
 * @param destination - Final destination
 * @param availableLoads - All available loads
 * @param deviationKm - Max deviation from direct route (default: 20km)
 * @returns Loads that are along the route
 */
export const findLoadsAlongRoute = (
  currentLocation: TransporterLocation,
  destination: TransporterLocation,
  availableLoads: Load[],
  deviationKm: number = 20
): Load[] => {
  const directDistance = calculateDistance(
    currentLocation.latitude,
    currentLocation.longitude,
    destination.latitude,
    destination.longitude
  );

  return availableLoads.filter(load => {
    // Calculate distance with this load
    const withLoadDistance =
      calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        load.pickupLocation.latitude,
        load.pickupLocation.longitude
      ) +
      calculateDistance(
        load.pickupLocation.latitude,
        load.pickupLocation.longitude,
        load.deliveryLocation.latitude,
        load.deliveryLocation.longitude
      ) +
      calculateDistance(
        load.deliveryLocation.latitude,
        load.deliveryLocation.longitude,
        destination.latitude,
        destination.longitude
      );

    // Check if deviation is acceptable
    const deviation = withLoadDistance - directDistance;
    return deviation <= deviationKm;
  });
};

/**
 * Calculate batch earnings for multiple loads
 */
export const calculateBatchEarnings = (
  transporterLocation: TransporterLocation,
  loads: Load[]
): {
  totalDistance: number;
  totalEarnings: number;
  totalFuelCost: number;
  netProfit: number;
  timeRequired: number;
} => {
  let totalDistance = 0;
  let currentLoc = transporterLocation;

  // Calculate distance for all loads
  for (const load of loads) {
    totalDistance += calculateDistance(
      currentLoc.latitude,
      currentLoc.longitude,
      load.pickupLocation.latitude,
      load.pickupLocation.longitude
    );

    totalDistance += calculateDistance(
      load.pickupLocation.latitude,
      load.pickupLocation.longitude,
      load.deliveryLocation.latitude,
      load.deliveryLocation.longitude
    );

    currentLoc = load.deliveryLocation;
  }

  const totalEarnings = calculateEarnings(totalDistance);
  const totalFuelCost = calculateFuelCost(totalDistance);
  const netProfit = totalEarnings - totalFuelCost;
  const timeRequired = Math.ceil((totalDistance / 60) * 60); // minutes at 60km/h

  return {
    totalDistance,
    totalEarnings,
    totalFuelCost,
    netProfit,
    timeRequired,
  };
};

/**
 * Group loads by region for area-based matching
 */
export const groupLoadsByRegion = (
  loads: Load[],
  regionCenters: { name: string; latitude: number; longitude: number }[]
): Map<string, Load[]> => {
  const regionMap = new Map<string, Load[]>();

  loads.forEach(load => {
    let closestRegion = 'Other';
    let minDistance = Number.MAX_VALUE;

    regionCenters.forEach(region => {
      const distance = calculateDistance(
        load.pickupLocation.latitude,
        load.pickupLocation.longitude,
        region.latitude,
        region.longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestRegion = region.name;
      }
    });

    if (!regionMap.has(closestRegion)) {
      regionMap.set(closestRegion, []);
    }
    regionMap.get(closestRegion)!.push(load);
  });

  return regionMap;
};

/**
 * Calculate daily earning potential for a transporter
 */
export const calculateDailyEarningPotential = (
  transporterLocation: TransporterLocation,
  availableLoads: Load[],
  workingHours: number = 8
): {
  possibleLoads: number;
  estimatedEarnings: number;
  estimatedProfit: number;
  averagePerHour: number;
} => {
  const matches = findBestMatches(transporterLocation, availableLoads);

  let totalTime = 0;
  let totalEarnings = 0;
  let totalFuelCost = 0;
  let loadsCount = 0;

  for (const match of matches) {
    const loadTime = match.eta + (match.routeDistance / 60) * 60; // minutes

    if (totalTime + loadTime <= workingHours * 60) {
      totalTime += loadTime;
      totalEarnings += match.estimatedEarnings;
      totalFuelCost += match.estimatedFuelCost;
      loadsCount++;
    } else {
      break;
    }
  }

  const estimatedProfit = totalEarnings - totalFuelCost;
  const averagePerHour = estimatedProfit / workingHours;

  return {
    possibleLoads: loadsCount,
    estimatedEarnings: totalEarnings,
    estimatedProfit,
    averagePerHour,
  };
};

/**
 * Suggest optimal waiting location to maximize load opportunities
 */
export const suggestOptimalWaitingLocation = (
  availableLoads: Load[]
): {
  latitude: number;
  longitude: number;
  nearbyLoads: number;
  reason: string;
} => {
  if (availableLoads.length === 0) {
    return {
      latitude: -1.9706,
      longitude: 30.1044,
      nearbyLoads: 0,
      reason: 'Kigali city center (default)',
    };
  }

  // Calculate centroid of all load pickup locations
  const sumLat = availableLoads.reduce((sum, load) => sum + load.pickupLocation.latitude, 0);
  const sumLon = availableLoads.reduce((sum, load) => sum + load.pickupLocation.longitude, 0);

  const centroidLat = sumLat / availableLoads.length;
  const centroidLon = sumLon / availableLoads.length;

  // Count nearby loads (within 10km)
  const nearbyLoads = availableLoads.filter(load => {
    const distance = calculateDistance(
      centroidLat,
      centroidLon,
      load.pickupLocation.latitude,
      load.pickupLocation.longitude
    );
    return distance <= 10;
  }).length;

  return {
    latitude: centroidLat,
    longitude: centroidLon,
    nearbyLoads,
    reason: `Optimal location with ${nearbyLoads} loads within 10km`,
  };
};

export default {
  findBestMatches,
  findLoadsAlongRoute,
  calculateBatchEarnings,
  groupLoadsByRegion,
  calculateDailyEarningPotential,
  suggestOptimalWaitingLocation,
};
