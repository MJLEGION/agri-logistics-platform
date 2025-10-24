# Phase 2: Screen Updates - Migrating from Orders to Trips

Now that the Logistics Domain is created, we need to update the transporter screens to use the new Trip system instead of Orders.

## Overview

This phase migrates 4 key screens from using `state.orders` to using `state.trips`.

## Screens to Update

### 1. ActiveTripsScreen.tsx → Show trips in 'accepted' and 'in_transit' status

**Current Issues:**

- Uses `state.orders.orders`
- Filters by `transporterId` but mismatch causes empty results
- Doesn't have proper trip context

**What to Update:**

```typescript
// OLD
import { useAppSelector, useAppDispatch } from "../store";
const dispatch = useAppDispatch();
const orders = useAppSelector((state) => state.orders.orders);

// NEW
import { useAppSelector, useAppDispatch } from "../../store";
import { getActiveTripsForTransporter } from "../../logistics/utils/tripCalculations";
const dispatch = useAppDispatch();
const trips = useAppSelector((state) => state.trips.trips);
const activeTrips = getActiveTripsForTransporter(trips, user?.id || "");
```

**Updated Flow:**

1. Component loads
2. Redux selector returns `state.trips.trips` (already includes test data)
3. Filter using `getActiveTripsForTransporter(trips, transporterId)`
4. Display trips where `status === 'accepted' || status === 'in_transit'`
5. When user taps "Complete Delivery": `dispatch(completeTrip(tripId))`

**Code Changes:**

- Import: Add `{ getActiveTripsForTransporter }` from logistics utils
- State: Change `orders` selector to `trips` selector
- Filter: Use `getActiveTripsForTransporter(trips, userId)`
- Display: Use `trip.shipment` instead of `order`
- Button: Replace `completeOrder` with `completeTrip`
- Earnings: Use `trip.earnings.totalRate` instead of `order.totalPrice`

---

### 2. EarningsDashboardScreen.tsx → Show earnings from completed trips

**Current Issues:**

- Manually calculates earnings from orders
- Filter never matches because of `transporterId` mismatch
- Doesn't show trip-specific information

**What to Update:**

```typescript
// OLD
const completedOrders = orders.filter(
  (o) => o.status === "completed" && o.transporterId === user?.id
);

// NEW
import {
  getCompletedTripsForTransporter,
  calculateTotalEarnings,
} from "../../logistics/utils/tripCalculations";
const completedTrips = getCompletedTripsForTransporter(trips, user?.id || "");
const totalEarnings = calculateTotalEarnings(completedTrips);
```

**Updated Flow:**

1. Component loads
2. Redux selector returns `state.trips.trips`
3. Filter using `getCompletedTripsForTransporter(trips, transporterId)`
4. Calculate earnings: `calculateTotalEarnings(completedTrips)`
5. Display trip cards with earnings breakdown

**Code Changes:**

- Import: Add logistics utilities and services
- State: Change selector from orders to trips
- Filter: Use `getCompletedTripsForTransporter()`
- Calculation: Use `calculateTotalEarnings()` or `getEarningsSummary()`
- Display: Show `trip.shipment.cropName`, `trip.earnings.totalRate`, `trip.completedAt`
- Cards: Create trip-specific cards showing shipment details

---

### 3. AvailableLoadsScreen.tsx → Show pending trips available to accept

**Current Issues:**

- Uses orders with 'accepted' status (incorrect)
- Should show 'pending' trips that haven't been assigned
- Naming doesn't reflect logistics terminology

**What to Update:**

```typescript
// OLD
const availableOrders = orders.filter(
  (o) => o.status === "accepted" && !o.transporterId
);

// NEW
import { getPendingTripsForTransporter } from "../../logistics/utils/tripCalculations";
const pendingTrips = getPendingTripsForTransporter(trips);
```

**Updated Flow:**

1. Component loads
2. Redux selector returns `state.trips.trips`
3. Filter using `getPendingTripsForTransporter(trips)` (gets trips with status='pending' and no transporterId)
4. Display trip cards with shipment details
5. When user taps "Accept": `dispatch(acceptTrip(tripId))` (Redux extracts transporterId automatically)

**Code Changes:**

- Import: Add `{ getPendingTripsForTransporter, acceptTrip }`
- State: Change selector from orders to trips
- Filter: Use `getPendingTripsForTransporter(trips)`
- Display: Show `trip.shipment`, `trip.pickup`, `trip.delivery`, `trip.earnings.totalRate`
- Button: Replace `acceptOrder` with `acceptTrip`
- Status: All trips here have `status='pending'`

---

### 4. TripHistoryScreen.tsx → Show completed trip history

**Current Issues:**

- May not exist yet or use orders
- Should show historical trips for earnings reference

**What to Update:**

```typescript
// NEW - Create this from scratch if it doesn't exist
import {
  getTripHistoryForTransporter,
  sortTripsByDate,
} from "../../logistics/utils/tripCalculations";

const tripHistory = getTripHistoryForTransporter(trips, transporterId || "");
const sortedHistory = sortTripsByDate(tripHistory); // newest first
```

**Code Changes:**

- Create if doesn't exist
- Filter: Use `getTripHistoryForTransporter()`
- Sort: Use `sortTripsByDate()` for chronological order
- Display: Show `trip.tripId`, `trip.shipment`, `trip.completedAt`, `trip.earnings.totalRate`
- Sections: Group by completed/cancelled status

---

## Step-by-Step Update Guide

### For Each Screen:

1. **Open the file** (e.g., `ActiveTripsScreen.tsx`)

2. **Update imports:**

   ```typescript
   // Add these imports
   import {
     getActiveTripsForTransporter, // or getCompletedTripsForTransporter, etc.
   } from "../../logistics/utils/tripCalculations";
   import { acceptTrip, completeTrip } from "../../logistics/store/tripsSlice";
   ```

3. **Update Redux selector:**

   ```typescript
   // Change from:
   const orders = useAppSelector((state) => state.orders.orders);

   // To:
   const trips = useAppSelector((state) => state.trips.trips);
   ```

4. **Update filter:**

   ```typescript
   // Change from:
   const filtered = orders.filter(o => /* custom logic */);

   // To:
   const filtered = getActiveTripsForTransporter(trips, userId); // or appropriate function
   ```

5. **Update display:**

   ```typescript
   // Change from:
   <Text>{order.quantity} kg</Text>

   // To:
   <Text>{trip.shipment.quantity} ${trip.shipment.unit}</Text>
   ```

6. **Update action handlers:**

   ```typescript
   // Change from:
   const handleComplete = async () => {
     dispatch(completeOrder(orderId));
   };

   // To:
   const handleComplete = async () => {
     dispatch(completeTrip(tripId));
   };
   ```

7. **Test the changes:**
   - Check Redux DevTools to see `state.trips.trips` populated
   - Verify filter returns correct trips
   - Test accept/complete actions update Redux state
   - Verify UI re-renders with updated data

---

## Test Scenarios After Each Update

### For ActiveTripsScreen:

```
1. Load app as transporter (ID: '3')
2. Navigate to Active Trips
3. Should see TRIP_001 (status: in_transit, transporterId: '3')
4. Tap "Complete Delivery"
5. Trip should move to completed
6. Earnings should update
```

### For EarningsDashboardScreen:

```
1. Load app as transporter
2. Navigate to Earnings
3. Should show:
   - TRIP_002 (completed, earnings: 45000)
   - Total Earnings: 45000
4. After completing TRIP_001:
   - TRIP_001 should appear in list
   - Total Earnings: 70000 (45000 + 25000)
```

### For AvailableLoadsScreen:

```
1. Load app as transporter
2. Navigate to Available Loads
3. Should see TRIP_003 and TRIP_004 (status: pending, no transporterId)
4. Tap "Accept Trip" on TRIP_003
5. Redux:
   - Extracts transporterId: '3' from state.auth.user
   - Updates TRIP_003: transporterId: '3', status: 'accepted'
6. Navigation to Active Trips
7. TRIP_003 should now be visible in active trips
```

---

## Redux State Flow Example

**Before accepting a trip:**

```json
{
  "trips": {
    "trips": [
      {
        "_id": "TRIP_003",
        "tripId": "TRIP-20250101-003",
        "status": "pending",
        "transporterId": null,
        "shipment": {
          /* ... */
        }
      }
    ]
  },
  "auth": {
    "user": {
      "_id": "3",
      "name": "Test Transporter"
    }
  }
}
```

**After dispatching acceptTrip('TRIP_003'):**

```json
{
  "trips": {
    "trips": [
      {
        "_id": "TRIP_003",
        "tripId": "TRIP-20250101-003",
        "status": "accepted",
        "transporterId": "3",
        "shipment": {
          /* ... */
        },
        "acceptedAt": "2025-01-01T12:30:00"
      }
    ]
  }
}
```

---

## Debugging Commands

If a screen isn't showing data:

1. **Check Redux state:**

   - Open Redux DevTools
   - Look for `state.trips.trips`
   - Should be array of Trip objects

2. **Check filter logic:**

   - Add console.log before filter
   - Verify trips are in correct status
   - Verify transporterId matches user ID

3. **Check dispatch:**
   - Add console.log in action handler
   - Verify action dispatched successfully
   - Check for errors in Redux error state

---

## Implementation Order

**Recommended order (easiest to hardest):**

1. ✅ **EarningsDashboardScreen** - Just filters and calculates
2. ✅ **AvailableLoadsScreen** - Simple filter and button
3. ✅ **ActiveTripsScreen** - More complex state management
4. ✅ **TripHistoryScreen** - Create new if needed

---

## Common Pitfalls to Avoid

- ❌ Mixing `state.orders` and `state.trips` selectors
- ❌ Forgetting to import filter utilities
- ❌ Using custom filters instead of centralized ones
- ❌ Not updating display from `order` to `trip.shipment`
- ❌ Dispatching old order actions instead of new trip actions
- ❌ Not checking Redux DevTools to verify state updates

---

## Verification Checklist

After updating each screen:

- [ ] Redux selector changed to `state.trips.trips`
- [ ] Import includes proper filter functions
- [ ] Filter logic uses centralized utility function
- [ ] Component displays trip data (not order data)
- [ ] Actions dispatch correct Redux thunk
- [ ] Loading and error states handled
- [ ] Redux DevTools shows correct state after actions
- [ ] UI updates when Redux state changes
- [ ] No console errors
- [ ] Tested with Redux DevTools

---

## Next Phase

Once all 4 screens are updated:

1. ✅ All transporter flows use trips
2. ✅ Earnings calculated correctly in real-time
3. ✅ Accept and complete flows work end-to-end
4. ✅ Redux state is source of truth

Then we can proceed to Phase 3: Order ↔ Trip synchronization for farmers/buyers.

---

## Files to Modify

1. `src/screens/transporter/ActiveTripsScreen.tsx`
2. `src/screens/transporter/EarningsDashboardScreen.tsx`
3. `src/screens/transporter/AvailableLoadsScreen.tsx`
4. `src/screens/transporter/TripHistoryScreen.tsx` (create if needed)

---

## Support

If a screen breaks:

1. Check Redux DevTools state.trips
2. Compare with test data in tripService.ts
3. Review filter logic against tripCalculations.ts
4. Add console.logs to trace data flow
