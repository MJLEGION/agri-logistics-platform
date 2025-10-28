// src/services/matchingService.ts
/**
 * Real-Time Stakeholder Matching Service
 * Intelligently matches users requesting transport with available transporters
 * Considers: proximity, vehicle type, capacity, and produce type compatibility
 */

import { distanceService } from './distanceService';
import { Transporter } from './transporterService';

export interface UserLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export interface MatchingRequest {
  userId: string;
  pickupLocation: UserLocation;
  deliveryLocation: UserLocation;
  produceType: string; // e.g., "maize", "beans", "potatoes"
  quantity: number;
  unit: 'kg' | 'tons' | 'bags';
  requiredCapacity: number; // in kg
}

export interface MatchedTransporter {
  transporter: Transporter;
  distance: number; // km
  eta: number; // minutes
  cost: number; // estimated cost in RWF
  score: number; // matching score 0-100
  reasonsForMatch: string[];
  isAutoMatch: boolean; // true if this is the best match
}

export interface MatchingResult {
  requestId: string;
  userLocation: UserLocation;
  matches: MatchedTransporter[];
  bestMatch: MatchedTransporter | null;
  totalDistance: number;
}

/**
 * Produce type to vehicle type mapping
 * Defines which vehicle types are suitable for which produce
 */
const PRODUCE_VEHICLE_MAPPING: Record<string, string[]> = {
  // Grains
  maize: ['truck', 'van', 'pickup'],
  wheat: ['truck', 'van', 'pickup'],
  rice: ['truck', 'van', 'pickup'],

  // Legumes
  beans: ['truck', 'van', 'pickup'],
  peas: ['truck', 'van', 'pickup'],
  lentils: ['truck', 'van', 'pickup'],

  // Vegetables
  tomatoes: ['van', 'pickup'], // Fragile, prefers smaller vehicles
  onions: ['truck', 'van', 'pickup'],
  potatoes: ['truck', 'van', 'pickup'],
  cabbage: ['truck', 'van', 'pickup'],

  // Fruits
  bananas: ['van', 'pickup'], // Fragile
  avocado: ['van', 'pickup'], // Fragile
  passion_fruit: ['van', 'pickup'], // Fragile
  mangoes: ['van', 'pickup'], // Fragile

  // Default - accepts all vehicle types
  other: ['truck', 'van', 'pickup', 'motorcycle'],
};

/**
 * Minimum capacity requirements per produce type (in kg)
 */
const MIN_CAPACITY_REQUIREMENTS: Record<string, number> = {
  // Bulk items
  maize: 500,
  wheat: 500,
  rice: 500,
  potatoes: 500,
  onions: 500,

  // Less bulk
  tomatoes: 100,
  beans: 200,
  peas: 200,
  cabbage: 300,

  // Delicate items
  bananas: 100,
  avocado: 100,
  mangoes: 100,
  passion_fruit: 100,

  // Default
  other: 50,
};

export const matchingService = {
  /**
   * Find best matching transporters for a request
   * Uses multi-factor scoring: proximity (50%), capacity (30%), specialization (20%)
   */
  findMatchingTransporters: async (
    request: MatchingRequest,
    availableTransporters: Transporter[]
  ): Promise<MatchingResult> => {
    const requestId = `REQ-${Date.now()}`;

    if (!availableTransporters || availableTransporters.length === 0) {
      return {
        requestId,
        userLocation: request.pickupLocation,
        matches: [],
        bestMatch: null,
        totalDistance: 0,
      };
    }

    // Calculate distance from pickup to delivery
    const totalDistance = distanceService.calculateDistance(
      request.pickupLocation.latitude,
      request.pickupLocation.longitude,
      request.deliveryLocation.latitude,
      request.deliveryLocation.longitude
    );

    // Score each transporter
    const scoredMatches: MatchedTransporter[] = availableTransporters
      .map((transporter) => {
        // Calculate proximity score (distance from transporter to pickup)
        // Mock: assume transporter is at random distance 0-50km away
        const distanceToPickup = matchingService.calculateDistanceToTransporter(
          request.pickupLocation,
          transporter
        );

        const proximityScore = matchingService.scoreProximity(distanceToPickup);
        const capacityScore = matchingService.scoreCapacity(
          transporter.capacity,
          request.requiredCapacity,
          request.produceType
        );
        const specializationScore = matchingService.scoreSpecialization(
          transporter.vehicle_type,
          request.produceType
        );

        // Weighted score: proximity (50%) + capacity (30%) + specialization (20%)
        const totalScore =
          proximityScore * 0.5 + capacityScore * 0.3 + specializationScore * 0.2;

        // Calculate ETA (distance from transporter to pickup + pickup to delivery)
        const eta = distanceService.calculateETA(distanceToPickup + totalDistance, 60);

        // Estimate cost based on distance and rate
        const cost = Math.round(totalDistance * (transporter.rates || 1000));

        const reasonsForMatch: string[] = [];
        if (proximityScore > 80) reasonsForMatch.push('📍 Very close to pickup location');
        if (capacityScore > 80)
          reasonsForMatch.push('📦 Perfect capacity for this load');
        if (specializationScore > 80)
          reasonsForMatch.push('✅ Specialized in this produce type');
        if (transporter.rating && transporter.rating >= 4.5)
          reasonsForMatch.push('⭐ Highly rated (4.5+)');

        return {
          transporter,
          distance: distanceToPickup,
          eta,
          cost,
          score: Math.round(totalScore),
          reasonsForMatch,
          isAutoMatch: false,
        };
      })
      .filter((match) => match.score > 0) // Remove very poor matches
      .sort((a, b) => b.score - a.score); // Sort by score descending

    // Mark best match
    if (scoredMatches.length > 0) {
      scoredMatches[0].isAutoMatch = true;
    }

    return {
      requestId,
      userLocation: request.pickupLocation,
      matches: scoredMatches,
      bestMatch: scoredMatches.length > 0 ? scoredMatches[0] : null,
      totalDistance,
    };
  },

  /**
   * Calculate distance from pickup location to transporter
   * In production, this would use real GPS coordinates
   * For now, mock based on transporter location field
   */
  calculateDistanceToTransporter: (
    pickupLocation: UserLocation,
    transporter: Transporter
  ): number => {
    // Mock calculation: if location is set, calculate; otherwise random 5-30km
    if (transporter.location) {
      // In production: parse transporter.location as coordinates
      // For now, return mock distance
      return Math.random() * 25 + 5; // 5-30 km
    }
    return Math.random() * 25 + 5;
  },

  /**
   * Score proximity (0-100)
   * Closer = higher score
   * 0-5km = 100, 5-15km = 80, 15-30km = 60, 30+ = 40
   */
  scoreProximity: (distanceKm: number): number => {
    if (distanceKm <= 5) return 100;
    if (distanceKm <= 15) return 80;
    if (distanceKm <= 30) return 60;
    if (distanceKm <= 50) return 40;
    return 20;
  },

  /**
   * Score capacity match (0-100)
   * Perfect fit = 100, adequate = 80, tight = 60, insufficient = 0
   */
  scoreCapacity: (
    transporterCapacity: number,
    requiredCapacity: number,
    produceType: string
  ): number => {
    // Get minimum capacity for this produce type
    const minCapacity = MIN_CAPACITY_REQUIREMENTS[produceType.toLowerCase()] || 100;
    const requiredWithMinimum = Math.max(requiredCapacity, minCapacity);

    if (transporterCapacity >= requiredWithMinimum * 1.2) return 100; // 20% buffer
    if (transporterCapacity >= requiredWithMinimum) return 85; // Exact fit
    if (transporterCapacity >= requiredWithMinimum * 0.9) return 70; // Slight underage
    if (transporterCapacity >= requiredWithMinimum * 0.7) return 40; // Not ideal
    return 0; // Insufficient
  },

  /**
   * Score specialization for produce type (0-100)
   * Matching vehicle type = 100, compatible = 70, any = 50, unsuitable = 10
   */
  scoreSpecialization: (vehicleType: string, produceType: string): number => {
    const suitableVehicles = PRODUCE_VEHICLE_MAPPING[produceType.toLowerCase()] ||
      PRODUCE_VEHICLE_MAPPING.other;
    const normalizedVehicle = vehicleType.toLowerCase();

    if (suitableVehicles.includes(normalizedVehicle)) {
      // Further scoring based on suitability
      if (normalizedVehicle === 'truck') return 100;
      if (normalizedVehicle === 'van') return 90;
      if (normalizedVehicle === 'pickup') return 80;
      return 70;
    }

    // Vehicle type not in suitable list
    if (normalizedVehicle === 'motorcycle') return 10; // Can't handle most cargo
    return 50; // Default fallback
  },

  /**
   * Get estimated cost for transport
   * Based on distance and transporter's rate
   */
  estimateCost: (distance: number, ratePerKm: number = 1000): number => {
    return Math.round(distance * ratePerKm);
  },

  /**
   * Get estimated ETA
   * Includes time to pick up from transporter location
   */
  estimateETA: (
    distanceToTransporter: number,
    distanceToDeliver: number,
    speedKmh: number = 60
  ): number => {
    const totalDistance = distanceToTransporter + distanceToDeliver;
    return distanceService.calculateETA(totalDistance, speedKmh);
  },

  /**
   * Auto-assign: Select the best match and create a trip request
   * Returns the matched transporter details
   */
  autoAssignBestMatch: (matchingResult: MatchingResult): MatchedTransporter | null => {
    if (!matchingResult.bestMatch) {
      return null;
    }

    return matchingResult.bestMatch;
  },

  /**
   * Get available vehicle types
   */
  getVehicleTypes: (): string[] => {
    return ['motorcycle', 'pickup', 'van', 'truck'];
  },

  /**
   * Get all produce types we have mappings for
   */
  getProduceTypes: (): string[] => {
    return Object.keys(PRODUCE_VEHICLE_MAPPING);
  },

  /**
   * Check if a transporter is suitable for a produce type
   */
  isTransporterSuitable: (
    transporter: Transporter,
    produceType: string,
    requiredCapacity: number
  ): boolean => {
    const suitableVehicles = PRODUCE_VEHICLE_MAPPING[produceType.toLowerCase()] ||
      PRODUCE_VEHICLE_MAPPING.other;
    const minCapacity = MIN_CAPACITY_REQUIREMENTS[produceType.toLowerCase()] || 100;

    return (
      suitableVehicles.includes(transporter.vehicle_type.toLowerCase()) &&
      transporter.capacity >= minCapacity
    );
  },
};

export default matchingService;