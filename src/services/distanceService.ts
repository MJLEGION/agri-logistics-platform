// Distance calculation service with accurate formulas
// Uses Haversine formula for precise real-world distances

export const distanceService = {
  /**
   * Calculate distance between two coordinates using Haversine formula
   * More accurate than simple latitude/longitude math
   * @param lat1 - Pickup latitude
   * @param lon1 - Pickup longitude
   * @param lat2 - Delivery latitude
   * @param lon2 - Delivery longitude
   * @returns Distance in kilometers
   */
  calculateDistance: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in kilometers
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

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  },

  /**
   * Calculate earnings based on distance
   * Rwanda standard: 1,000 RWF per kilometer
   * @param distance - Distance in kilometers
   * @param ratePerKm - Rate per kilometer (default: 1000 RWF)
   * @returns Earnings in RWF
   */
  calculateEarnings: (
    distance: number,
    ratePerKm: number = 1000
  ): number => {
    return Math.round(distance * ratePerKm);
  },

  /**
   * Calculate ETA based on distance and speed
   * Rwanda average speed: 40-50 km/h
   * @param distance - Distance in kilometers
   * @param speedKmh - Speed in km/h (default: 45)
   * @param trafficFactor - Traffic congestion multiplier (default: 1.0)
   * @returns ETA in minutes
   */
  calculateETA: (distance: number, speedKmh: number = 45, trafficFactor: number = 1.0): number => {
    const adjustedSpeed = speedKmh / trafficFactor; // Slower in traffic
    const hours = distance / adjustedSpeed;
    const minutes = Math.ceil(hours * 60);
    return Math.max(5, minutes); // Minimum 5 minutes
  },

  /**
   * Calculate fuel cost
   * @param distance - Distance in kilometers
   * @param fuelConsumption - Liters per 100km (default: 10)
   * @param fuelPrice - Price per liter in RWF (default: 1000)
   * @returns Fuel cost in RWF
   */
  calculateFuelCost: (
    distance: number,
    fuelConsumption: number = 10,
    fuelPrice: number = 1000
  ): number => {
    const litersNeeded = (distance / 100) * fuelConsumption;
    return Math.round(litersNeeded * fuelPrice);
  },

  /**
   * Calculate net earnings (after fuel cost)
   * @param distance - Distance in kilometers
   * @param ratePerKm - Rate per kilometer (default: 1000 RWF)
   * @param fuelConsumption - Liters per 100km (default: 10)
   * @param fuelPrice - Price per liter in RWF (default: 1000)
   * @returns Net earnings in RWF
   */
  calculateNetEarnings: (
    distance: number,
    ratePerKm: number = 1000,
    fuelConsumption: number = 10,
    fuelPrice: number = 1000
  ): number => {
    const gross = distanceService.calculateEarnings(distance, ratePerKm);
    const fuelCost = distanceService.calculateFuelCost(distance, fuelConsumption, fuelPrice);
    return Math.max(0, gross - fuelCost); // Can't be negative
  },

  /**
   * Get distance category for route planning
   * @param distance - Distance in kilometers
   * @returns Route category
   */
  getRouteCategory: (distance: number): string => {
    if (distance < 10) return 'Short';
    if (distance < 50) return 'Medium';
    if (distance < 100) return 'Long';
    return 'Very Long';
  },

  /**
   * Validate coordinates
   * @param lat - Latitude
   * @param lon - Longitude
   * @returns Boolean indicating if coordinates are valid
   */
  isValidCoordinate: (lat: number, lon: number): boolean => {
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  },

  /**
   * Get Rwanda-specific route info
   * @param distance - Distance in kilometers
   * @returns Route info with recommendations
   */
  getRwandaRouteInfo: (distance: number) => {
    const category = distanceService.getRouteCategory(distance);
    const eta = distanceService.calculateETA(distance);
    const earnings = distanceService.calculateEarnings(distance);
    const netEarnings = distanceService.calculateNetEarnings(distance);

    return {
      category,
      eta,
      earnings,
      netEarnings,
      recommendation:
        category === 'Very Long'
          ? 'Consider multiple stops for fuel'
          : category === 'Long'
            ? 'Plan for rest stops'
            : 'Straightforward route',
    };
  },
};

// Helper function to convert degrees to radians
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export default distanceService;