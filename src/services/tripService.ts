// Trip Service - Simulates driver location updates and trip management
import { EventEmitter } from 'events';

interface TripLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface ActiveTrip {
  orderId: string;
  driverId: string;
  status: 'coming' | 'arrived' | 'in_transit' | 'completed';
  driverLocation: TripLocation;
  eta: number; // in minutes
  distanceRemaining: number; // in km
}

// Global trip tracking
let activeTrips: Map<string, ActiveTrip> = new Map();
let tripUpdater: Map<string, NodeJS.Timeout> = new Map();
const tripEmitter = new EventEmitter();

// Haversine formula to calculate real distance between coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Simulate driver movement towards destination
const moveDriver = (
  orderId: string,
  currentLat: number,
  currentLon: number,
  destLat: number,
  destLon: number,
  speed: number = 40 // km/h
): { lat: number; lon: number } => {
  const distance = calculateDistance(currentLat, currentLon, destLat, destLon);
  const movePerUpdate = (speed / 3600) * 1; // Move based on speed (assuming 1s interval)

  if (distance < 0.05) {
    // Close enough, return destination
    return { lat: destLat, lon: destLon };
  }

  // Calculate direction
  const lat = currentLat + ((destLat - currentLat) / distance) * movePerUpdate;
  const lon = currentLon + ((destLon - currentLon) / distance) * movePerUpdate;

  return { lat, lon };
};

export const tripService = {
  // Start a new trip when driver accepts order
  startTrip: (orderId: string, driverId: string, startLat: number, startLon: number) => {
    const trip: ActiveTrip = {
      orderId,
      driverId,
      status: 'coming',
      driverLocation: {
        latitude: startLat,
        longitude: startLon,
        timestamp: Date.now(),
      },
      eta: 5, // 5 minutes initially
      distanceRemaining: 2, // 2 km initially
    };

    activeTrips.set(orderId, trip);
    tripEmitter.emit('trip_started', trip);
    console.log(`✅ Trip started for order ${orderId}`);

    return trip;
  },

  // Get active trip
  getTrip: (orderId: string): ActiveTrip | undefined => {
    return activeTrips.get(orderId);
  },

  // Simulate driver movement
  simulateDriverMovement: (
    orderId: string,
    destinationLat: number,
    destinationLon: number,
    onLocationUpdate?: (trip: ActiveTrip) => void
  ) => {
    // Clear any existing updater
    if (tripUpdater.has(orderId)) {
      clearInterval(tripUpdater.get(orderId)!);
    }

    let stepCount = 0;
    const maxSteps = 300; // Max 5 minutes at 1 second intervals

    const interval = setInterval(() => {
      const trip = activeTrips.get(orderId);
      if (!trip) {
        clearInterval(interval);
        tripUpdater.delete(orderId);
        return;
      }

      const currentLat = trip.driverLocation.latitude;
      const currentLon = trip.driverLocation.longitude;

      // Move driver
      const newPos = moveDriver(orderId, currentLat, currentLon, destinationLat, destinationLon, 40);

      // Update trip
      const distance = calculateDistance(newPos.lat, newPos.lon, destinationLat, destinationLon);
      const eta = Math.ceil((distance / 40) * 60); // 40 km/h

      trip.driverLocation = {
        latitude: newPos.lat,
        longitude: newPos.lon,
        timestamp: Date.now(),
      };
      trip.distanceRemaining = distance;
      trip.eta = Math.max(0, eta);

      // Check if arrived
      if (distance < 0.05) {
        trip.status = 'arrived';
        clearInterval(interval);
        tripUpdater.delete(orderId);
        tripEmitter.emit('trip_arrived', trip);
        console.log(`🎯 Driver arrived at destination for order ${orderId}`);
      }

      // Emit update
      onLocationUpdate?.(trip);
      tripEmitter.emit('trip_updated', trip);

      stepCount++;
      if (stepCount > maxSteps) {
        clearInterval(interval);
        tripUpdater.delete(orderId);
      }
    }, 1000); // Update every second

    tripUpdater.set(orderId, interval);
  },

  // Start delivering (in_transit)
  startDelivery: (orderId: string) => {
    const trip = activeTrips.get(orderId);
    if (trip) {
      trip.status = 'in_transit';
      tripEmitter.emit('trip_in_transit', trip);
      console.log(`🚚 Delivery started for order ${orderId}`);
    }
    return trip;
  },

  // Complete trip
  completeTrip: (orderId: string) => {
    const trip = activeTrips.get(orderId);
    if (trip) {
      trip.status = 'completed';
      if (tripUpdater.has(orderId)) {
        clearInterval(tripUpdater.get(orderId)!);
        tripUpdater.delete(orderId);
      }
      tripEmitter.emit('trip_completed', trip);
      console.log(`✅ Trip completed for order ${orderId}`);
    }
    return trip;
  },

  // Listen to trip events
  on: (event: string, callback: (trip: ActiveTrip) => void) => {
    tripEmitter.on(event, callback);
  },

  // Remove listener
  off: (event: string, callback: (trip: ActiveTrip) => void) => {
    tripEmitter.off(event, callback);
  },

  // Clean up trip
  cancelTrip: (orderId: string) => {
    if (tripUpdater.has(orderId)) {
      clearInterval(tripUpdater.get(orderId)!);
      tripUpdater.delete(orderId);
    }
    activeTrips.delete(orderId);
    tripEmitter.emit('trip_cancelled', { orderId });
  },

  // Calculate fare
  calculateFare: (distanceKm: number, ratePerKm: number = 1000): number => {
    return Math.round(distanceKm * ratePerKm);
  },
};

export default tripService;