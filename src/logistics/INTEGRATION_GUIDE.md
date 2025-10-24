# Logistics Domain Integration Guide

## Overview

The new logistics domain provides a complete trip management system with proper Redux state management, mock services, and calculation utilities.

## Architecture

```
src/logistics/
├── types/
│   └── trip.ts              # Trip, TripStatus, Shipment, Location, Earnings types
├── services/
│   ├── tripService.ts       # Trip CRUD operations + mock data
│   └── earningsService.ts   # Earnings calculations and summaries
├── store/
│   └── tripsSlice.ts        # Redux slice for trip state management
├── utils/
│   └── tripCalculations.ts  # Utility functions for trip filtering, sorting, stats
└── INTEGRATION_GUIDE.md     # This file
```

## Quick Start

### 1. Import Trip Types and Utilities

```typescript
import { Trip, TripStatus, Shipment, Location, Earnings } from "../types/trip";
import {
  getActiveTripsForTransporter,
  getCompletedTripsForTransporter,
  calculateTotalEarnings,
  getTripStatusLabel,
} from "../utils/tripCalculations";
```

### 2. Use Redux Actions in Components

```typescript
import { useAppDispatch, useAppSelector } from "../store";
import {
  acceptTrip,
  completeTrip,
  fetchTransporterTrips,
  fetchPendingTrips,
} from "../logistics/store/tripsSlice";

// In your component:
const dispatch = useAppDispatch();
const trips = useAppSelector((state) => state.trips.trips);
const user = useAppSelector((state) => state.auth.user);

// Accept a trip
const handleAcceptTrip = async (tripId: string) => {
  try {
    const result = await dispatch(acceptTrip(tripId)).unwrap();
    console.log("✅ Trip accepted:", result);
  } catch (error) {
    console.error("❌ Failed to accept trip:", error);
  }
};

// Complete a trip
const handleCompleteTrip = async (tripId: string) => {
  try {
    const result = await dispatch(completeTrip(tripId)).unwrap();
    console.log("✅ Trip completed:", result);
  } catch (error) {
    console.error("❌ Failed to complete trip:", error);
  }
};
```

### 3. Filter Trips in Components

```typescript
import {
  getActiveTripsForTransporter,
  getCompletedTripsForTransporter,
} from "../utils/tripCalculations";

// Get active trips for current transporter
const activeTrips = getActiveTripsForTransporter(trips, user?.id || "");

// Get completed trips for earnings
const completedTrips = getCompletedTripsForTransporter(trips, user?.id || "");
```

### 4. Calculate Earnings

```typescript
import { calculateTotalEarnings } from "../utils/tripCalculations";

// Calculate total earnings from completed trips
const totalEarnings = calculateTotalEarnings(completedTrips);

// Or use the earnings service
import { getEarningsSummary } from "../services/earningsService";

const earningSummary = getEarningsSummary(trips, user?.id || "");
console.log("Total Earnings:", earningSummary.totalEarnings);
console.log("Pending Earnings:", earningSummary.pendingEarnings);
```

## Common Patterns

### Pattern 1: Display Active Trips

```typescript
export const ActiveTripsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const trips = useAppSelector((state) => state.trips.trips);
  const user = useAppSelector((state) => state.auth.user);
  const transporterId = user?._id || user?.id;

  const activeTrips = getActiveTripsForTransporter(trips, transporterId || "");

  useEffect(() => {
    if (transporterId) {
      dispatch(fetchTransporterTrips(transporterId));
    }
  }, [transporterId, dispatch]);

  return (
    <View>
      {activeTrips.map((trip) => (
        <TripCard key={trip._id} trip={trip} />
      ))}
    </View>
  );
};
```

### Pattern 2: Transporter Earnings Dashboard

```typescript
export const EarningsDashboardScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const trips = useAppSelector((state) => state.trips.trips);
  const user = useAppSelector((state) => state.auth.user);
  const transporterId = user?._id || user?.id;

  const { stats, summary } = getEarningsStats(trips, transporterId || "");
  const completedTrips = getCompletedTripsForTransporter(
    trips,
    transporterId || ""
  );

  return (
    <View>
      <Text>Total Earnings: ₨ {summary.totalEarnings}</Text>
      <Text>Pending: ₨ {summary.pendingEarnings}</Text>
      <Text>Completed Trips: {summary.completedTrips}</Text>

      {completedTrips.map((trip) => (
        <TripEarningsCard key={trip._id} trip={trip} />
      ))}
    </View>
  );
};
```

### Pattern 3: Accept Trip Flow

```typescript
const handleAcceptTrip = async (tripId: string) => {
  // Show loading
  setIsLoading(true);

  try {
    // Dispatch action (Redux thunk handles user ID extraction)
    const result = await dispatch(acceptTrip(tripId)).unwrap();

    // Show success
    showNotification({
      type: "success",
      message: `✅ Trip ${result.tripId} accepted!`,
    });

    // Navigation/refresh happens via Redux subscription
    navigation.navigate("ActiveTrips");
  } catch (error: any) {
    // Show error
    showNotification({
      type: "error",
      message: `❌ Failed: ${error.message}`,
    });
  } finally {
    setIsLoading(false);
  }
};
```

### Pattern 4: Trip Status Workflow

```typescript
const getTripActions = (trip: Trip) => {
  const actions = [];

  if (trip.status === "pending") {
    actions.push({
      label: "Accept Trip",
      onPress: () => handleAcceptTrip(trip._id),
    });
  }

  if (trip.status === "accepted") {
    actions.push({
      label: "Start Trip",
      onPress: () => handleStartTrip(trip._id),
    });
  }

  if (trip.status === "in_transit") {
    actions.push({
      label: "Complete Delivery",
      onPress: () => handleCompleteTrip(trip._id),
    });
  }

  return actions;
};
```

## Key Differences from Order System

| Aspect                | Order System                    | Trip System                                 |
| --------------------- | ------------------------------- | ------------------------------------------- |
| **Primary Entity**    | Order (marketplace focused)     | Trip (logistics focused)                    |
| **User Context**      | Scattered, needs manual passing | Built-in, extracted from Redux state        |
| **Filter Predicates** | Mixed concerns                  | Centralized in `tripCalculations.ts`        |
| **Earnings**          | Calculated separately           | Part of trip lifecycle                      |
| **Status Lifecycle**  | pending → accepted → completed  | pending → accepted → in_transit → completed |
| **Data Flow**         | Orders → Screen logic           | Redux dispatch → Service → Reducer → Screen |

## Migration Checklist

When converting a screen from Order system to Trip system:

- [ ] Import `useAppDispatch`, `useAppSelector` from store
- [ ] Replace `state.orders.orders` with `state.trips.trips`
- [ ] Replace order filters with trip filters from `tripCalculations.ts`
- [ ] Replace `acceptOrder` with `acceptTrip`
- [ ] Replace `completeOrder` with `completeTrip`
- [ ] Update UI to show `trip.shipment` instead of `order`
- [ ] Update earnings display to use `trip.earnings`
- [ ] Test that Redux state updates properly in Redux DevTools

## Testing the Logistics System

### 1. Test Mock Data is Loaded

```typescript
// In Redux DevTools, check state.trips.trips
// Should see 4 mock trips in initial state
```

### 2. Test Accept Trip Flow

```
1. Dispatch acceptTrip('TRIP_003')
2. Redux extracts transporterId from state.auth.user
3. Service updates mock data: transporterId = '3', status = 'accepted'
4. Reducer updates state.trips.trips
5. Subscribe screens re-render with updated data
```

### 3. Test Complete Trip Flow

```
1. Dispatch completeTrip('TRIP_001')
2. Service: status = 'completed', earnings.status = 'earned'
3. Reducer updates state
4. EarningsDashboardScreen: calls calculateTotalEarnings()
5. Displays updated total earnings
```

## Common Issues and Solutions

### Issue: Earnings not appearing after completing trip

**Cause:** Screen is still using old filter predicates

**Solution:**

```typescript
// ❌ Wrong
const completedTrips = trips.filter((trip) => trip.status === "completed");

// ✅ Correct
import { getCompletedTripsForTransporter } from "../utils/tripCalculations";
const completedTrips = getCompletedTripsForTransporter(trips, transporterId);
```

### Issue: Active trips not showing after accepting

**Cause:** Screen filtering by `transporterId` mismatch

**Solution:**

```typescript
// ✅ Use centralized filter
const activeTrips = getActiveTripsForTransporter(trips, transporterId);
```

### Issue: TransporterId undefined in trip

**Cause:** acceptTrip was dispatched but user not in Redux state

**Solution:**
Check Redux DevTools:

- state.auth.user should exist
- state.auth.user.\_id or state.auth.user.id should be '3' (for test transporter)

## Redux DevTools Debugging

Monitor these state paths:

```
state.trips.trips              # Array of all trips
state.trips.isLoading          # Loading state
state.trips.error              # Error messages
state.trips.selectedTrip       # Currently selected trip

state.auth.user                # Current user (needed for transporterId)
state.auth.user.id             # Should be '3' for test transporter
```

## Next Steps

1. **Update PendingTripsScreen:** Display `state.trips.trips` filtered by pending status
2. **Update ActiveTripsScreen:** Show active trips for transporter
3. **Update EarningsDashboardScreen:** Display earnings from completed trips
4. **Update TripHistoryScreen:** Show completed and cancelled trips
5. **Add Real-time Updates:** Subscribe to trip changes

## Files Created

- ✅ `src/logistics/types/trip.ts`
- ✅ `src/logistics/services/tripService.ts`
- ✅ `src/logistics/services/earningsService.ts`
- ✅ `src/logistics/store/tripsSlice.ts`
- ✅ `src/logistics/utils/tripCalculations.ts`
- ✅ `src/store/index.ts` (updated to include tripsReducer)
- ✅ `src/types/index.ts` (updated to re-export Trip types)

## Support Functions Reference

### Filtering Functions

- `filterTripsByStatus(trips, status)` - Get trips with specific status
- `filterTripsByTransporter(trips, transporterId)` - Get trips for a transporter
- `getPendingTripsForTransporter(trips)` - Get available trips to accept
- `getActiveTripsForTransporter(trips, transporterId)` - Get active deliveries
- `getCompletedTripsForTransporter(trips, transporterId)` - Get completed trips
- `getTripHistoryForTransporter(trips, transporterId)` - Get trip history

### Calculation Functions

- `calculateTotalEarnings(trips)` - Sum of earned trips
- `calculatePendingEarnings(trips)` - Sum of pending earnings
- `calculatePaidEarnings(trips)` - Sum of paid earnings
- `getTransporterTripStats(trips, transporterId)` - Detailed statistics
- `getTripStatusColor(status)` - UI color for status badge
- `getTripStatusLabel(status)` - User-friendly status text

### Sorting Functions

- `sortTripsByDate(trips, descending)` - Sort by creation date
- `sortTripsByEarnings(trips, descending)` - Sort by earnings amount

---

For questions or issues, refer to the trip service mock data in `tripService.ts` to understand the data structure.
