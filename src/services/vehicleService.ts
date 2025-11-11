// Vehicle pricing and capacity service
// Defines vehicle types, weight limits, and pricing

export interface VehicleType {
  id: string;
  name: string;
  icon: string;
  minWeight: number;
  maxWeight: number;
  baseRatePerKm: number;
  description: string;
  capacity: string;
}

export const VEHICLE_TYPES: Record<string, VehicleType> = {
  moto: {
    id: 'moto',
    name: '🏍️ Motorcycle/Moto',
    icon: '🏍️',
    minWeight: 0,
    maxWeight: 50,
    baseRatePerKm: 425,
    description: 'Fast delivery for small items',
    capacity: 'Up to 50 kg',
  },
  van: {
    id: 'van',
    name: '🚐 Van/Pickup',
    icon: '🚐',
    minWeight: 50,
    maxWeight: 500,
    baseRatePerKm: 1000,
    description: 'Medium-sized cargo, general purpose',
    capacity: '50 - 500 kg',
  },
  truck: {
    id: 'truck',
    name: '🚚 Truck',
    icon: '🚚',
    minWeight: 500,
    maxWeight: 5000,
    baseRatePerKm: 1400,
    description: 'Large bulk shipments',
    capacity: '500 kg - 5 tons',
  },
};

/**
 * Suggest vehicle type based on cargo weight
 */
export const suggestVehicleType = (weightInKg: number): string => {
  if (weightInKg <= 50) return 'moto';
  if (weightInKg <= 500) return 'van';
  return 'truck';
};

/**
 * Get vehicle type details
 */
export const getVehicleType = (vehicleId: string): VehicleType | null => {
  return VEHICLE_TYPES[vehicleId] || null;
};

/**
 * Calculate shipping cost with traffic factor
 * @param distance - Distance in km
 * @param vehicleId - Vehicle type ID
 * @param trafficFactor - Congestion multiplier (1.0 = normal, 1.2 = 20% congestion)
 * @returns Shipping cost in RWF
 */
export const calculateShippingCost = (
  distance: number,
  vehicleId: string,
  trafficFactor: number = 1.0
): number => {
  const vehicle = VEHICLE_TYPES[vehicleId];
  if (!vehicle) return 0;

  const baseCost = distance * vehicle.baseRatePerKm;
  const costWithTraffic = baseCost * trafficFactor;

  // No minimum charges - show exact calculated amount
  return Math.round(costWithTraffic);
};

/**
 * Get traffic congestion factor based on time of day
 * Peak hours: 7-9am (+30%), 12-1pm (+20%), 5-7pm (+40%)
 */
export const getTrafficFactor = (date: Date = new Date()): number => {
  const hour = date.getHours();
  const minute = date.getMinutes();

  // Morning rush (7-9am)
  if (hour >= 7 && hour < 9) {
    return 1.3; // +30%
  }

  // Noon (12-1pm)
  if (hour >= 12 && hour < 13) {
    return 1.2; // +20%
  }

  // Evening rush (5-7pm)
  if (hour >= 17 && hour < 19) {
    return 1.4; // +40%
  }

  // Off-peak
  return 1.0;
};

/**
 * Get traffic description
 */
export const getTrafficDescription = (factor: number): string => {
  if (factor > 1.3) return '🔴 Heavy Traffic';
  if (factor > 1.1) return '🟡 Moderate Traffic';
  return '🟢 Light Traffic';
};

/**
 * Validate if cargo weight is suitable for vehicle
 */
export const isWeightSuitable = (weightInKg: number, vehicleId: string): boolean => {
  const vehicle = VEHICLE_TYPES[vehicleId];
  if (!vehicle) return false;
  return weightInKg >= vehicle.minWeight && weightInKg <= vehicle.maxWeight;
};

/**
 * Get compatible vehicles for a cargo weight
 */
export const getCompatibleVehicles = (weightInKg: number): VehicleType[] => {
  return Object.values(VEHICLE_TYPES).filter(
    (v) => weightInKg >= v.minWeight && weightInKg <= v.maxWeight
  );
};

export default {
  VEHICLE_TYPES,
  suggestVehicleType,
  getVehicleType,
  calculateShippingCost,
  getTrafficFactor,
  getTrafficDescription,
  isWeightSuitable,
  getCompatibleVehicles,
};