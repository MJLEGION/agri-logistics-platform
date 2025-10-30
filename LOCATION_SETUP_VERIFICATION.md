# Location Tracking Setup Verification Checklist

Use this checklist to verify that all location features are properly installed and configured.

---

## ✅ Phase 1: Files Verification

Check that all files have been created:

### Services

- [ ] `src/services/locationService.ts` exists
  - [ ] Has `updateLocation()` method
  - [ ] Has `findNearbyCargo()` method
  - [ ] Has `calculateDistance()` method
  - [ ] Has proper error handling

### Hooks

- [ ] `src/utils/useLocation.ts` exists

  - [ ] Exports `useLocation` hook
  - [ ] Has proper TypeScript types

- [ ] `src/utils/useNearbySearch.ts` exists

  - [ ] Exports `useNearbySearch` hook
  - [ ] Has `clearResults` method

- [ ] `src/utils/useDistance.ts` exists
  - [ ] Exports `useDistance` hook
  - [ ] Has `clear` method

### Components

- [ ] `src/components/RealTimeTracking.tsx` exists

  - [ ] Has proper StyleSheet
  - [ ] Exports component

- [ ] `src/components/NearbySearch.tsx` exists

  - [ ] Has proper StyleSheet
  - [ ] Has Picker component

- [ ] `src/components/DeliveryMap.tsx` exists
  - [ ] Has proper StyleSheet
  - [ ] Has legend section

### Configuration

- [ ] `.env.example` updated with `REACT_APP_API_URL`
- [ ] `.env` file created from `.env.example`

### Documentation

- [ ] `LOCATION_TRACKING_INTEGRATION.md` exists
- [ ] `LOCATION_INTEGRATION_SUMMARY.md` exists
- [ ] `LOCATION_USAGE_EXAMPLES.md` exists
- [ ] `LOCATION_SETUP_VERIFICATION.md` exists (this file)

---

## ✅ Phase 2: Configuration Verification

### Environment Variables

Check `.env` file:

```bash
# Should contain:
REACT_APP_API_URL=http://localhost:3000/api  ✅ or ❌
GOOGLE_MAPS_API_KEY=xxx (optional)           ✅ or ❌
```

### Backend API URL

- [ ] Backend is running on configured URL
- [ ] API is accessible from your device/emulator
- [ ] Test with: `curl http://localhost:3000/api/location/active`

### Authentication

- [ ] JWT token is stored in AsyncStorage
- [ ] Token is valid and not expired
- [ ] Token can be retrieved: `await AsyncStorage.getItem('authToken')`

---

## ✅ Phase 3: Dependencies Verification

Check that all dependencies are installed:

```bash
npm list @react-native-async-storage/async-storage
npm list axios
npm list react-native
```

All should show versions. If missing:

```bash
npm install @react-native-async-storage/async-storage
npm install axios
```

---

## ✅ Phase 4: Code Integration Verification

### Import Statements

In your screens, you should be able to import:

```typescript
✅ import { RealTimeTracking } from '../components/RealTimeTracking';
✅ import { NearbySearch } from '../components/NearbySearch';
✅ import { DeliveryMap } from '../components/DeliveryMap';
✅ import { useLocation } from '../utils/useLocation';
✅ import { useNearbySearch } from '../utils/useNearbySearch';
✅ import { useDistance } from '../utils/useDistance';
✅ import locationService from '../services/locationService';
```

Run this test:

```typescript
// Test file: src/tests/locationIntegration.test.ts
import { render } from "@testing-library/react-native";
import { RealTimeTracking } from "../components/RealTimeTracking";

describe("Location Components", () => {
  it("renders RealTimeTracking", () => {
    const { getByText } = render(<RealTimeTracking />);
    expect(getByText("Real-Time Tracking")).toBeTruthy();
  });
});
```

---

## ✅ Phase 5: Component Rendering Test

Try adding a component to your screen temporarily:

```typescript
// In a test screen
import { RealTimeTracking } from "../components/RealTimeTracking";

export function TestLocationScreen() {
  return <RealTimeTracking />;
}

// Can it render without errors? ✅ Yes / ❌ No
```

Check for errors:

- [ ] No import errors
- [ ] No TypeScript errors
- [ ] No runtime errors in console

---

## ✅ Phase 6: Backend Integration Test

Test each endpoint:

### Test 1: Update Location

```bash
curl -X POST http://localhost:3000/api/location/update-location \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 1.9536,
    "longitude": 29.8739,
    "speed": 45,
    "accuracy": 10
  }'
```

Expected response:

```json
{
  "success": true,
  "data": { "id": "...", "latitude": 1.9536, ... }
}
```

- [ ] Request succeeds (200 OK)
- [ ] Returns location data

### Test 2: Find Nearby Cargo

```bash
curl "http://localhost:3000/api/location/nearby-cargo?latitude=1.9536&longitude=29.8739&radiusKm=50" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response:

```json
{
  "success": true,
  "data": [ { "id": "...", "name": "...", "price": ... } ]
}
```

- [ ] Request succeeds
- [ ] Returns array of cargo

### Test 3: Calculate Distance

```bash
curl -X POST http://localhost:3000/api/location/distance \
  -H "Content-Type: application/json" \
  -d '{
    "lat1": 1.9536,
    "lon1": 29.8739,
    "lat2": 1.9366,
    "lon2": 29.8512
  }'
```

Expected response:

```json
{
  "success": true,
  "data": {
    "distanceKm": 4.5,
    "etaMinutes": 12,
    "duration": "12 mins"
  }
}
```

- [ ] Request succeeds
- [ ] Returns distance calculations

---

## ✅ Phase 7: Device/Emulator Verification

### Device Permissions

#### Android

- [ ] Location permission granted in app settings
- [ ] Test: Settings > Apps > Your App > Permissions > Location

#### iOS

- [ ] Location permission granted
- [ ] Test: Settings > Your App > Location

#### Web Browser

- [ ] Browser supports geolocation
- [ ] Permission prompt appears when needed

### GPS/Location Data

- [ ] Device has GPS enabled
- [ ] Device has location services on
- [ ] Current location is accessible

Test command:

```typescript
const testLocation = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => console.log("Location:", position.coords),
    (error) => console.error("Error:", error)
  );
};
```

- [ ] Returns current coordinates

---

## ✅ Phase 8: Hook Functionality Test

Create a test screen:

```typescript
import { useLocation } from "../utils/useLocation";

export function TestHooks() {
  const { location, error, loading, startTracking, stopTracking } =
    useLocation(false);

  return (
    <View>
      <Text>{loading ? "Loading..." : "Ready"}</Text>
      <Text>{location ? `Lat: ${location.latitude}` : "No location"}</Text>
      <Button title="Start" onPress={startTracking} />
      <Button title="Stop" onPress={stopTracking} />
      {error && <Text>{error}</Text>}
    </View>
  );
}
```

Test results:

- [ ] Clicking "Start" triggers tracking
- [ ] Location updates appear
- [ ] Clicking "Stop" stops tracking
- [ ] Errors display properly

---

## ✅ Phase 9: Component Visual Test

Render each component in isolation:

```typescript
// Test RealTimeTracking
<RealTimeTracking orderId="test" />
// Expected: Shows title, buttons, and location info when tracking

// Test NearbySearch
<NearbySearch userLocation={{ latitude: 1.95, longitude: 29.87 }} />
// Expected: Shows search controls and results

// Test DeliveryMap
<DeliveryMap
  transporterLocation={{ latitude: 1.95, longitude: 29.87 }}
  deliveryLocation={{ latitude: 1.94, longitude: 29.88 }}
/>
// Expected: Shows map placeholder and legend
```

Checklist:

- [ ] RealTimeTracking displays correctly
- [ ] NearbySearch displays correctly
- [ ] DeliveryMap displays correctly
- [ ] All buttons are clickable
- [ ] No layout issues

---

## ✅ Phase 10: Error Handling Test

Test error scenarios:

```typescript
// Test 1: No location permission
// Expected: Error message displayed
- [ ] Error displays: "Geolocation permission denied"

// Test 2: No API connectivity
// Expected: API error shown
- [ ] Error displays: "API Error" or similar

// Test 3: Invalid coordinates
// Expected: Validation error
- [ ] Error displays: "Invalid coordinates"

// Test 4: Expired token
// Expected: 401 error handled
- [ ] Error displays or user redirected to login
```

---

## ✅ Phase 11: Performance Check

```typescript
// Monitor console for:
✅ No excessive re-renders (should re-render only when needed)
✅ No memory leaks (check DevTools)
✅ Location updates smooth (not stuttering)
✅ API calls complete in reasonable time
✅ No console warnings or errors
```

---

## ✅ Phase 12: Complete Integration Test

Create a full-page test with all components:

```typescript
import React, { useState } from "react";
import { View, ScrollView, Text, Button } from "react-native";
import { RealTimeTracking } from "../components/RealTimeTracking";
import { NearbySearch } from "../components/NearbySearch";
import { DeliveryMap } from "../components/DeliveryMap";
import { useLocation } from "../utils/useLocation";
import { useDistance } from "../utils/useDistance";

export function FullLocationTest() {
  const [location, setLocation] = useState(null);
  const { distance, calculate } = useDistance();

  const handleLocationUpdate = (loc) => {
    setLocation(loc);
    calculate(loc.latitude, loc.longitude, 1.94, 29.88);
  };

  return (
    <ScrollView>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        Location Integration Test
      </Text>

      <RealTimeTracking onLocationUpdate={handleLocationUpdate} />

      {location && <NearbySearch userLocation={location} />}

      {location && (
        <DeliveryMap
          transporterLocation={location}
          deliveryLocation={{ latitude: 1.94, longitude: 29.88 }}
        />
      )}

      {distance && (
        <View style={{ padding: 16 }}>
          <Text>Distance: {distance.distanceKm?.toFixed(1)} km</Text>
          <Text>ETA: {distance.etaMinutes?.toFixed(0)} mins</Text>
        </View>
      )}
    </ScrollView>
  );
}
```

Run test:

- [ ] Renders without errors
- [ ] All components display
- [ ] Interactions work
- [ ] Data flows correctly
- [ ] No console errors

---

## 🏁 Verification Summary

### How to Know Everything is Working

**If you can do these, you're good to go:**

1. ✅ Import all components and hooks without errors
2. ✅ Render components in a screen without crashes
3. ✅ Get location updates when tracking is enabled
4. ✅ See nearby cargo in search results
5. ✅ Calculate distance between two points
6. ✅ Handle errors gracefully
7. ✅ All API endpoints respond correctly

---

## 📋 Final Checklist

- [ ] All files created successfully
- [ ] Dependencies installed (`npm install`)
- [ ] Environment configured (`.env`)
- [ ] Imports working
- [ ] Components render
- [ ] Backend endpoints accessible
- [ ] Location permissions granted
- [ ] Hooks working properly
- [ ] Error handling tested
- [ ] Full integration test passed
- [ ] No console errors

---

## ✅ If All Checks Pass

Congratulations! 🎉

Your location tracking and geospatial features are properly integrated. You can now:

1. ✅ Use `RealTimeTracking` in delivery screens
2. ✅ Use `NearbySearch` in transporter home
3. ✅ Use `DeliveryMap` for route display
4. ✅ Use hooks for custom implementations

---

## ❌ If Something Fails

### Troubleshooting by Error

| Error                           | Solution                                     |
| ------------------------------- | -------------------------------------------- |
| "Cannot find module"            | Run `npm install`                            |
| "Import errors"                 | Check file paths are correct                 |
| "API 401 error"                 | Check token in `.env` is valid               |
| "API 404 error"                 | Check backend URL in `.env`                  |
| "Geolocation permission denied" | Grant location permission in device settings |
| "blank/white screen"            | Check console for JavaScript errors          |
| "Slow performance"              | Reduce location update frequency             |

### Debug Steps

1. **Check console**: `adb logcat` (Android) or Safari DevTools (iOS)
2. **Verify network**: Test API with curl
3. **Check permissions**: Verify location permission is granted
4. **Validate config**: Print `process.env.REACT_APP_API_URL`
5. **Test in isolation**: Render component alone first

---

## 📞 Need Help?

1. Read: `LOCATION_TRACKING_INTEGRATION.md`
2. Check: `LOCATION_USAGE_EXAMPLES.md`
3. Review: Console logs and error messages
4. Test: API endpoints with curl commands

---

**Last Updated:** 2024
**Status:** Ready for Production ✅
