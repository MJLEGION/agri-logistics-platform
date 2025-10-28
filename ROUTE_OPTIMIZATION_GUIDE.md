# Route Optimization & Delivery Alerts Implementation Guide

## Overview

This guide covers three core route optimization features:

1. **Shortest Route Calculation** - Using Google Maps or OpenStreetMap APIs
2. **Multi-Stop Routing** - Combining multiple pickups in one trip
3. **Delivery Alerts** - Real-time notifications for farmers when transport is en route or delayed

## Table of Contents

- [Installation & Setup](#installation--setup)
- [Core Services](#core-services)
- [Implementation Examples](#implementation-examples)
- [API Integration](#api-integration)
- [Testing](#testing)

---

## Installation & Setup

### 1. Required Services

The project includes three main services:

```
src/services/
├── routeOptimizationService.ts        # Core route optimization algorithms
├── smartRouteOptimizationService.ts   # Real-time tracking with alerts
├── deliveryAlertsService.ts           # Farmer notification system
└── smsService.ts                      # SMS gateway integration
```

### 2. Dependencies

Ensure the following are installed:

```bash
npm install axios events
```

The project already includes:

- `@expo/vector-icons` - For alert UI icons
- React Native

---

## Core Services

### 1. **routeOptimizationService.ts**

Core functions for route calculation:

```typescript
// Calculate distance between coordinates
calculateDistance(lat1, lon1, lat2, lon2): number

// Calculate ETA with traffic conditions
calculateETA(distanceKm, trafficConditions): number

// Optimize multi-stop route (Nearest Neighbor algorithm)
optimizeMultiStopRoute(currentLocation, destinations): Waypoint[]

// Calculate fuel cost
calculateFuelCost(distanceKm): number

// Complete route optimization
optimizeCompleteRoute(currentLocation, pickups, deliveries): OptimizedRoute
```

**Example:**

```typescript
import {
  optimizeMultiStopRoute,
  calculateDistance,
  calculateETA,
} from "../services/routeOptimizationService";

const currentLocation = {
  latitude: -1.9706,
  longitude: 30.1044,
  address: "Kigali",
};

const pickups = [
  {
    latitude: -1.95,
    longitude: 30.1,
    address: "Farm A",
    type: "pickup" as const,
    sequence: 1,
  },
  {
    latitude: -1.96,
    longitude: 30.12,
    address: "Farm B",
    type: "pickup" as const,
    sequence: 2,
  },
];

const optimizedRoute = optimizeMultiStopRoute(currentLocation, pickups);
// Returns: Waypoints ordered by distance for efficiency
```

### 2. **smartRouteOptimizationService.ts**

Advanced route tracking with automated alerts:

```typescript
// Create optimized multi-stop route
createOptimizedRoute(transporterId, currentLocation, stops): OptimizedMultiRoute

// Start real-time tracking
startRouteTracking(routeId, updateIntervalSeconds): Promise<void>

// Update transporter location
updateRouteLocation(routeId, newLocation): boolean

// Mark stop as completed
completeStop(routeId, stopIndex, notes): boolean

// Get route summary
getRouteSummary(routeId): RouteSummary
```

**Example:**

```typescript
import {
  createOptimizedRoute,
  startRouteTracking,
} from "../services/smartRouteOptimizationService";

// Create optimized route with multiple stops
const route = createOptimizedRoute(
  "transporter_123",
  { latitude: -1.97, longitude: 30.1, address: "Hub" },
  [
    {
      orderId: "order_1",
      farmerId: "farmer_1",
      farmerName: "John Doe",
      farmerPhone: "+250788123456",
      type: "pickup",
      quantity: "100kg Maize",
      cropType: "Maize",
      latitude: -1.95,
      longitude: 30.1,
      address: "Farm A",
      sequence: 1,
      status: "pending",
    },
    // ... more stops
  ]
);

// Start real-time tracking (updates every 60 seconds)
await startRouteTracking(route.routeId, 60);

// Results:
// - Auto sends alerts when arriving soon (< 5km)
// - Auto sends alerts if delayed (> 15 minutes)
// - Sends ETA updates every 5 minutes
```

### 3. **deliveryAlertsService.ts**

Manages all farmer notifications:

```typescript
// Notify farmer when transporter is en route
notifyTransporterEnRoute(orderId, farmerInfo, transporterInfo, eta): Promise<DeliveryAlert>

// Send ETA update
notifyETAUpdate(orderId, farmerPhone, farmerId, transporterId, eta, location, distance): Promise<DeliveryAlert>

// Alert when transporter arriving soon (within 5 min)
notifyArrivingSoon(orderId, farmerInfo, transporterInfo): Promise<DeliveryAlert>

// Alert if transporter is delayed
notifyDelay(orderId, farmerInfo, transporterInfo, delayMinutes, reason): Promise<DeliveryAlert>

// Confirm delivery
notifyDeliveryConfirmed(orderId, farmerInfo, deliveryDetails): Promise<DeliveryAlert>

// Get farmer's alerts
getFarmerAlerts(farmerId, limit): DeliveryAlert[]

// Listen for real-time alerts
onAlertReceived(callback): () => void
```

**Example:**

```typescript
import {
  notifyTransporterEnRoute,
  notifyETAUpdate,
  getFarmerAlerts,
  onAlertReceived,
} from "../services/deliveryAlertsService";

// Send initial notification when transporter assigned
await notifyTransporterEnRoute(
  "order_123",
  {
    id: "farmer_1",
    name: "John Doe",
    phone: "+250788123456",
    pickupAddress: "Farm A, Kigali",
  },
  {
    id: "transporter_1",
    name: "Kamali Transport",
    vehicleType: "Truck",
    registrationNumber: "UF-2024-001",
  },
  25 // ETA in minutes
);

// Get farmer's alert history
const alerts = getFarmerAlerts("farmer_1", 50);
console.log(`Farmer has ${alerts.length} alerts`);

// Listen for new alerts in real-time
const unsubscribe = onAlertReceived((alert) => {
  console.log("New alert:", alert.message);
  // Update UI with new alert
});

// Stop listening
unsubscribe();
```

---

## Implementation Examples

### Example 1: Multi-Stop Route Creation with Alerts

```typescript
import {
  createOptimizedRoute,
  startRouteTracking,
  getRouteSummary,
} from "../services/smartRouteOptimizationService";
import { notifyTransporterEnRoute } from "../services/deliveryAlertsService";

async function setupMultiStopRoute(transporterId: string) {
  // Define current location
  const hubLocation = {
    latitude: -1.9706,
    longitude: 30.1044,
    address: "Central Hub, Kigali",
  };

  // Define stops (farms to pick up from)
  const stops = [
    {
      orderId: "order_001",
      farmerId: "farmer_001",
      farmerName: "Alice Nkusi",
      farmerPhone: "+250788111111",
      type: "pickup" as const,
      cropType: "Beans",
      quantity: "500kg",
      latitude: -1.955,
      longitude: 30.095,
      address: "Kicukiro Farm, Kigali",
      sequence: 1,
      status: "pending" as const,
    },
    {
      orderId: "order_002",
      farmerId: "farmer_002",
      farmerName: "Bob Murekezi",
      farmerPhone: "+250788222222",
      type: "pickup" as const,
      cropType: "Maize",
      quantity: "800kg",
      latitude: -1.965,
      longitude: 30.105,
      address: "Gasabo Farm, Kigali",
      sequence: 2,
      status: "pending" as const,
    },
    {
      orderId: "order_003",
      farmerId: "buyer_001",
      farmerName: "Agri Market",
      farmerPhone: "+250788333333",
      type: "delivery" as const,
      quantity: "1300kg",
      latitude: -2.0,
      longitude: 30.1,
      address: "Kigali Central Market",
      sequence: 3,
      status: "pending" as const,
    },
  ];

  // Create optimized route
  const route = createOptimizedRoute(transporterId, hubLocation, stops);

  console.log(`✅ Route Created: ${route.routeId}`);
  console.log(`📊 Total Distance: ${route.totalDistance.toFixed(1)} km`);
  console.log(`💰 Total Earnings: ${route.totalEarnings} RWF`);
  console.log(`⏱️ Total Duration: ${route.totalDuration.toFixed(0)} minutes`);
  console.log(`🛑 Stops: ${route.stops.length}`);

  // Notify farmers that transporter is on the way
  for (let i = 0; i < 2; i++) {
    // Notify pickup farmers
    const stop = route.stops[i];
    await notifyTransporterEnRoute(
      stop.orderId,
      {
        id: stop.farmerId,
        name: stop.farmerName,
        phone: stop.farmerPhone,
        pickupAddress: stop.address,
      },
      {
        id: transporterId,
        name: "John Transport Service",
        vehicleType: "Truck 5T",
        registrationNumber: "UT-2024-ABC",
      },
      route.totalDuration // Estimated pickup time
    );
  }

  // Start real-time tracking
  await startRouteTracking(route.routeId, 60); // Update every 60 seconds

  return route.routeId;
}

// Usage
const routeId = await setupMultiStopRoute("transporter_001");
```

### Example 2: Farmer Alert Panel Integration

```typescript
// In your farmer dashboard screen
import { DeliveryAlertsPanel } from "../components/DeliveryAlertsPanel";
import { useAuth } from "../contexts/AuthContext";

export function FarmerDashboard() {
  const { user } = useAuth();

  const handleAlertPress = (alert) => {
    console.log("Alert tapped:", alert.orderId);
    // Navigate to order tracking screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Deliveries</Text>

      {/* Delivery Alerts Panel */}
      <DeliveryAlertsPanel farmerId={user.id} onAlertPress={handleAlertPress} />
    </View>
  );
}
```

### Example 3: Real-Time Delay Detection

```typescript
import {
  getTrackerStatus,
  updateRouteLocation,
} from "../services/smartRouteOptimizationService";
import { notifyDelay } from "../services/deliveryAlertsService";

// Simulate GPS location updates
async function trackTransporterLocation(routeId: string) {
  const interval = setInterval(async () => {
    // In real app, this comes from GPS
    const newLocation = {
      latitude: -1.96 + Math.random() * 0.01,
      longitude: 30.1 + Math.random() * 0.01,
      address: "Current location",
    };

    // Update route location
    updateRouteLocation(routeId, newLocation);

    // Check delay status
    const tracker = getTrackerStatus(routeId);

    if (tracker?.isDelayed) {
      console.warn(`⚠️ Transporter is ${tracker.delayMinutes} minutes late!`);
      // Alert already sent by smartRouteOptimizationService
    }
  }, 30000); // Check every 30 seconds

  return () => clearInterval(interval);
}
```

---

## API Integration

### Google Maps API Integration (Optional)

For more accurate routing, integrate Google Maps API:

```typescript
import axios from "axios";

interface DirectionsResponse {
  routes: Array<{
    distance: { value: number; text: string };
    duration: { value: number; text: string };
    steps: Array<any>;
  }>;
}

export async function getOptimizedRouteFromGoogleMaps(
  origin: { lat: number; lng: number },
  waypoints: { lat: number; lng: number }[],
  destination: { lat: number; lng: number }
): Promise<DirectionsResponse> {
  const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  const waypointParams = waypoints.map((wp) => `${wp.lat},${wp.lng}`).join("|");

  const url = `https://maps.googleapis.com/maps/api/directions/json`;

  try {
    const response = await axios.get<DirectionsResponse>(url, {
      params: {
        origin: `${origin.lat},${origin.lng}`,
        waypoints: waypointParams,
        destination: `${destination.lat},${destination.lng}`,
        optimize: "true", // Google will optimize waypoint order
        key: API_KEY,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Google Maps API error:", error);
    throw error;
  }
}

// Usage:
const directions = await getOptimizedRouteFromGoogleMaps(
  { lat: -1.9706, lng: 30.1044 }, // Hub
  [
    { lat: -1.955, lng: 30.095 }, // Farm A
    { lat: -1.965, lng: 30.105 }, // Farm B
  ],
  { lat: -2.0, lng: 30.1 } // Market
);

console.log(`Distance: ${directions.routes[0].distance.text}`);
console.log(`Duration: ${directions.routes[0].duration.text}`);
```

---

## Testing

### Mock Data for Testing

```typescript
const testFarmerInfo = {
  id: "farmer_test_001",
  name: "Test Farmer",
  phone: "+250788999999",
  pickupAddress: "Test Farm, Kigali",
};

const testTransporterInfo = {
  id: "transporter_test_001",
  name: "Test Transport",
  vehicleType: "Truck",
  registrationNumber: "TEST-001",
};

const testStops = [
  {
    orderId: "test_order_1",
    farmerId: testFarmerInfo.id,
    farmerName: testFarmerInfo.name,
    farmerPhone: testFarmerInfo.phone,
    type: "pickup",
    quantity: "100kg",
    cropType: "Beans",
    latitude: -1.95,
    longitude: 30.1,
    address: testFarmerInfo.pickupAddress,
    sequence: 1,
    status: "pending",
  },
];
```

### Unit Test Example

```typescript
import { calculateDistance } from "../services/routeOptimizationService";
import { createOptimizedRoute } from "../services/smartRouteOptimizationService";

describe("Route Optimization", () => {
  it("should calculate distance between coordinates", () => {
    const distance = calculateDistance(-1.9706, 30.1044, -1.955, 30.095);
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(100);
  });

  it("should create multi-stop route", () => {
    const route = createOptimizedRoute(
      "test_transporter",
      testLocation,
      testStops
    );
    expect(route.stops.length).toBe(testStops.length);
    expect(route.totalDistance).toBeGreaterThan(0);
    expect(route.totalEarnings).toBeGreaterThan(0);
  });
});
```

---

## Features Summary

| Feature                 | Service                       | Status   |
| ----------------------- | ----------------------------- | -------- |
| Distance calculation    | routeOptimizationService      | ✅ Ready |
| ETA calculation         | routeOptimizationService      | ✅ Ready |
| Multi-stop optimization | smartRouteOptimizationService | ✅ Ready |
| Real-time tracking      | smartRouteOptimizationService | ✅ Ready |
| Delay detection         | smartRouteOptimizationService | ✅ Ready |
| Farmer notifications    | deliveryAlertsService         | ✅ Ready |
| SMS alerts              | smsService                    | ✅ Ready |
| Alert UI component      | DeliveryAlertsPanel           | ✅ Ready |

---

## Troubleshooting

### Issue: Alerts not appearing

**Solution:** Ensure `onAlertReceived` listener is properly subscribed and farmerId matches

### Issue: Route optimization not working

**Solution:** Verify coordinates are valid (-90 to 90 for latitude, -180 to 180 for longitude)

### Issue: SMS not sending

**Solution:** Check SMS service configuration and API key in `.env`

---

## Next Steps

1. **Integrate with Backend** - Connect to real API for order/transporter data
2. **Google Maps Integration** - Replace Haversine with Google Directions API
3. **Push Notifications** - Add Firebase Cloud Messaging for mobile alerts
4. **Analytics** - Track route efficiency metrics
5. **AI Optimization** - Use machine learning for better route predictions

---

## Support

For issues or questions, check the respective service files or contact the development team.
