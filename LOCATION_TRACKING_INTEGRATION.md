# Location Tracking & Geospatial Integration Guide

## ✅ What's Been Added

Your frontend now has complete location tracking and geospatial features integrated:

### 📁 New Files Created

```
src/
├── services/
│   └── locationService.ts          # Main location service with API calls
├── utils/
│   ├── useLocation.ts               # Hook for real-time GPS tracking
│   ├── useNearbySearch.ts           # Hook for nearby search
│   └── useDistance.ts               # Hook for distance calculations
├── components/
│   ├── RealTimeTracking.tsx         # UI for GPS tracking
│   ├── NearbySearch.tsx             # UI for searching nearby items
│   └── DeliveryMap.tsx              # UI for displaying delivery routes
```

### 🔧 Updated Files

- `.env.example` - Added `REACT_APP_API_URL` configuration

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Configure Environment

Copy `.env.example` to `.env` and update these values:

```bash
# Backend API URL
REACT_APP_API_URL=http://localhost:3000/api

# For physical devices, use your IP instead:
# REACT_APP_API_URL=http://192.168.1.100:3000/api

# Google Maps API Key (optional for basic features)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Step 2: Use Location Service in Your Screens

#### Example 1: Track Current Location

```typescript
import React, { useState } from "react";
import { RealTimeTracking } from "../components/RealTimeTracking";

export function DeliveryTrackingScreen({ orderId }) {
  const [location, setLocation] = useState(null);

  const handleLocationUpdate = (newLocation) => {
    console.log("Current location:", newLocation);
    setLocation(newLocation);
  };

  return (
    <RealTimeTracking
      orderId={orderId}
      onLocationUpdate={handleLocationUpdate}
    />
  );
}
```

#### Example 2: Search for Nearby Cargo

```typescript
import React, { useState } from "react";
import { NearbySearch } from "../components/NearbySearch";
import { useLocation } from "../utils/useLocation";

export function TransporterHomeScreen() {
  const { location } = useLocation(true); // Auto-start tracking
  const [selectedCargo, setSelectedCargo] = useState(null);

  return (
    <NearbySearch
      userLocation={location}
      onSelectItem={(cargo) => {
        console.log("Selected cargo:", cargo);
        setSelectedCargo(cargo);
      }}
    />
  );
}
```

#### Example 3: Calculate Distance & ETA

```typescript
import React from "react";
import { View, Text } from "react-native";
import { useDistance } from "../utils/useDistance";
import { useLocation } from "../utils/useLocation";

export function DeliveryEtaScreen({ destinationLat, destinationLon }) {
  const { location } = useLocation(true);
  const { distance, calculate } = useDistance();

  React.useEffect(() => {
    if (location) {
      calculate(
        location.latitude,
        location.longitude,
        destinationLat,
        destinationLon
      );
    }
  }, [location]);

  return (
    <View>
      <Text>Distance: {distance?.distanceKm?.toFixed(1)} km</Text>
      <Text>ETA: {distance?.etaMinutes?.toFixed(0)} minutes</Text>
    </View>
  );
}
```

---

## 📚 API Reference

### Location Service Methods

#### `updateLocation(latitude, longitude, metadata?)`

Update transporter's current location.

```typescript
import locationService from "../services/locationService";

const result = await locationService.updateLocation(1.9536, 29.8739, {
  speed: 45, // km/h
  accuracy: 10, // meters
  heading: 270, // degrees
  orderId: "order123",
});
```

#### `getLocationHistory(transporterId, filters?)`

Get location history for a transporter.

```typescript
const history = await locationService.getLocationHistory("transporter123", {
  limit: 100,
  offset: 0,
  orderId: "order123",
});
```

#### `getActiveLocations()`

Get all active locations for connected transporters.

```typescript
const activeLocations = await locationService.getActiveLocations();
```

#### `stopTracking(transporterId)`

Stop tracking a transporter.

```typescript
await locationService.stopTracking("transporter123");
```

#### `findNearbyCargo(latitude, longitude, radiusKm?)`

Find cargo near a location.

```typescript
const nearbyCargo = await locationService.findNearbyCargo(
  1.9536,
  29.8739,
  50 // search radius in km
);
```

#### `findNearbyTransporters(latitude, longitude, radiusKm?)`

Find available transporters near a location.

```typescript
const transporters = await locationService.findNearbyTransporters(
  1.9536,
  29.8739,
  50
);
```

#### `findNearbyOrders(latitude, longitude, radiusKm?)`

Find orders near a location.

```typescript
const orders = await locationService.findNearbyOrders(1.9536, 29.8739, 50);
```

#### `searchCargo(latitude, longitude, filters?)`

Search cargo with specific filters.

```typescript
const cargo = await locationService.searchCargo(1.9536, 29.8739, {
  radiusKm: 50,
  minPrice: 10000,
  maxPrice: 500000,
  cropType: "maize",
});
```

#### `calculateDistance(lat1, lon1, lat2, lon2)`

Calculate distance and ETA between two points.

```typescript
const result = await locationService.calculateDistance(
  1.9536,
  29.8739,
  1.9366,
  29.8512
);

console.log(result.data);
// {
//   distanceKm: 4.5,
//   etaMinutes: 12,
//   duration: "12 mins"
// }
```

#### `getBounds(latitude, longitude, radiusKm)`

Get map bounds for a location and radius.

```typescript
const bounds = await locationService.getBounds(1.9536, 29.8739, 50);
```

---

## 🪝 Hooks Reference

### useLocation(enabled?, orderId?)

Real-time GPS tracking hook.

```typescript
import { useLocation } from "../utils/useLocation";

const {
  location, // Current location or null
  error, // Error message or null
  loading, // Is tracking starting
  startTracking, // Function to start tracking
  stopTracking, // Function to stop tracking
} = useLocation(false, "order123");

// location returns:
// {
//   latitude: 1.9536,
//   longitude: 29.8739,
//   accuracy: 10,      // meters
//   speed: 45,         // km/h
//   heading: 270,      // degrees
//   timestamp: Date
// }
```

### useNearbySearch()

Search for nearby items hook.

```typescript
import { useNearbySearch } from "../utils/useNearbySearch";

const {
  results, // Array of search results
  loading, // Is searching
  error, // Error message or null
  searchNearby, // Function: (type, lat, lon, radiusKm) => Promise
  searchCargo, // Function: (lat, lon, filters) => Promise
  clearResults, // Function to clear results
} = useNearbySearch();

// Search types: 'cargo' | 'transporters' | 'orders'
```

### useDistance()

Distance calculation hook.

```typescript
import { useDistance } from "../utils/useDistance";

const {
  distance, // Distance result or null
  loading, // Is calculating
  error, // Error message or null
  calculate, // Function: (lat1, lon1, lat2, lon2) => Promise
  clear, // Function to clear results
} = useDistance();

// distance returns:
// {
//   distanceKm: 4.5,
//   etaMinutes: 12,
//   duration: "12 mins"
// }
```

---

## 🎨 Components

### RealTimeTracking

Displays real-time GPS tracking UI with start/stop controls.

**Props:**

```typescript
interface RealTimeTrackingProps {
  orderId?: string; // Order ID for tracking
  onLocationUpdate?: (location) => void; // Callback when location updates
}
```

**Usage:**

```typescript
<RealTimeTracking
  orderId="order123"
  onLocationUpdate={(location) => console.log(location)}
/>
```

### NearbySearch

Search for nearby cargo, transporters, or orders with filters.

**Props:**

```typescript
interface NearbySearchProps {
  userLocation?: Location | null; // Current user location
  onSelectItem?: (item) => void; // Callback when item selected
}
```

**Usage:**

```typescript
<NearbySearch
  userLocation={{ latitude: 1.9536, longitude: 29.8739 }}
  onSelectItem={(cargo) => console.log(cargo)}
/>
```

### DeliveryMap

Display delivery route with transporter and delivery locations.

**Props:**

```typescript
interface DeliveryMapProps {
  transporterLocation?: Location | null;
  pickupLocation?: Location;
  deliveryLocation?: Location;
  mapKey?: string;
}
```

**Usage:**

```typescript
<DeliveryMap
  transporterLocation={{ latitude: 1.9536, longitude: 29.8739 }}
  pickupLocation={{ latitude: 1.9366, longitude: 29.8512 }}
  deliveryLocation={{ latitude: 1.94, longitude: 29.86 }}
/>
```

---

## 🔐 Authentication

All location API calls automatically include the JWT token from AsyncStorage:

```typescript
// Automatically added to all requests:
Authorization: Bearer<authToken>;
```

If you need to manually set the token:

```typescript
import locationService from "../services/locationService";

locationService.setToken("your_jwt_token");
```

---

## ⚠️ Error Handling

All hooks and service methods return errors via the `error` state:

```typescript
const { location, error } = useLocation(true);

if (error) {
  console.error("Tracking error:", error);
  // Handle error - show user message, etc.
}
```

**Common Errors:**

- `"Geolocation is not supported"` - Browser doesn't support geolocation
- `"Geolocation permission denied"` - User didn't grant location permission
- `"API Error"` - Backend API returned an error
- `"401 Unauthorized"` - Token expired or invalid

---

## 🧪 Testing

### Test with Mock Location

For development, you can mock location data:

```typescript
import { useLocation } from "../utils/useLocation";

// Mock location hook for testing
const mockLocation = {
  latitude: 1.9536,
  longitude: 29.8739,
  accuracy: 10,
  speed: 45,
  heading: 270,
  timestamp: new Date(),
};

// Use in tests or dev mode
```

### API Testing

Test endpoints directly with curl:

```bash
# Update location
curl -X POST http://localhost:3000/api/location/update-location \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude":1.9536,"longitude":29.8739,"speed":45}'

# Find nearby cargo
curl "http://localhost:3000/api/location/nearby-cargo?latitude=1.9536&longitude=29.8739&radiusKm=50" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Calculate distance
curl -X POST http://localhost:3000/api/location/distance \
  -H "Content-Type: application/json" \
  -d '{"lat1":1.9536,"lon1":29.8739,"lat2":1.9366,"lon2":29.8512}'
```

---

## 🐛 Troubleshooting

### "Location permission denied"

The user needs to grant location permission in the device settings:

- **Android:** Settings > Apps > Agri Logistics > Permissions > Location
- **iOS:** Settings > Agri Logistics > Location > Always or While Using App

### "Cannot find module '@react-native-async-storage/async-storage'"

Install the dependency:

```bash
npm install @react-native-async-storage/async-storage
```

### "GOOGLE_MAPS_API_KEY is undefined"

Add your Google Maps API key to `.env`:

```bash
GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Map not displaying

1. Verify Google Maps API key is valid
2. Enable these APIs in Google Cloud Console:
   - Maps SDK for Android (if mobile)
   - Maps SDK for iOS (if iOS)
   - Static Maps API

### Distance calculation returns null

Make sure both locations are provided:

```typescript
if (location && deliveryLocation) {
  calculate(
    location.latitude,
    location.longitude,
    deliveryLocation.latitude,
    deliveryLocation.longitude
  );
}
```

---

## 📊 Integration Examples

### Complete Delivery Tracking Screen

```typescript
import React, { useState } from "react";
import { View, ScrollView, Text, StyleSheet } from "react-native";
import { RealTimeTracking } from "../components/RealTimeTracking";
import { DeliveryMap } from "../components/DeliveryMap";
import { useDistance } from "../utils/useDistance";

export function DeliveryTrackingScreen({ orderId, destination }) {
  const [location, setLocation] = useState(null);
  const { distance, calculate } = useDistance();

  const handleLocationUpdate = (newLoc) => {
    setLocation(newLoc);
    if (destination) {
      calculate(
        newLoc.latitude,
        newLoc.longitude,
        destination.lat,
        destination.lon
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <RealTimeTracking
        orderId={orderId}
        onLocationUpdate={handleLocationUpdate}
      />

      <DeliveryMap
        transporterLocation={location}
        deliveryLocation={destination}
      />

      {distance && (
        <View style={styles.etaContainer}>
          <Text style={styles.etaLabel}>
            Distance: {distance.distanceKm?.toFixed(1)} km
          </Text>
          <Text style={styles.etaLabel}>
            ETA: {distance.etaMinutes?.toFixed(0)} mins
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  etaContainer: {
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginTop: 16,
  },
  etaLabel: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
});
```

### Transporter Home with Nearby Cargo

```typescript
import React, { useState } from "react";
import { View } from "react-native";
import { NearbySearch } from "../components/NearbySearch";
import { useLocation } from "../utils/useLocation";

export function TransporterHomeScreen() {
  const { location } = useLocation(true); // Auto-track

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <NearbySearch
        userLocation={location}
        onSelectItem={(cargo) => {
          // Navigate to cargo details or accept cargo
          console.log("Selected cargo:", cargo);
        }}
      />
    </View>
  );
}
```

---

## 🚀 Next Steps

1. **Integrate into existing screens** - Use components in your current screens
2. **Test with backend** - Ensure backend location endpoints are working
3. **Handle permissions** - Request location permissions before tracking
4. **Store location history** - Use `getLocationHistory()` for analytics
5. **Real-time updates** - Consider WebSocket for live tracking updates

---

## 📞 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review backend documentation in `agri-logistics-backend`
3. Check console logs for detailed error messages
4. Verify all API endpoints are accessible

---

**Last Updated:** 2024
**Version:** 1.0
