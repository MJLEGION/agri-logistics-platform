# 🚚 Two-Role Logistics System

## Overview

The platform has been simplified to a **direct shipper-transporter connection** model. This creates a pure logistics platform where:

1. **Shippers** list cargo and request transportation services
2. **Transporters** accept transport requests and deliver cargo

**No intermediary buyer/receiver role** - shippers directly work with transporters.

---

## 🎯 System Design

### Before (3-Role System)
```
Shipper → Lists Cargo → Receiver Orders → Transporter Delivers
```
- Complex workflow with 3 parties
- Receiver was unnecessary middleman
- Extra coordination overhead

### After (2-Role System)
```
Shipper → Requests Transport → Transporter Delivers
```
- Direct connection
- Simplified workflow
- Pure logistics focus

---

## 👥 User Roles

### 1. Shipper (Farmer)
**What they do:**
- List agricultural cargo (maize, coffee, etc.)
- Specify pickup and delivery locations
- Request transportation services
- Track shipment status
- Pay transportation fees

**Screens (7):**
1. Home Dashboard
2. List Cargo (create transport request)
3. My Listings (view cargo)
4. Cargo Details
5. Edit Cargo
6. Active Orders (transport requests)
7. Order Tracking (real-time GPS)

**Example Flow:**
```
1. Login as shipper
2. List cargo: "500 kg Maize, Kigali → Ruhengeri"
3. Set delivery location and contact
4. Submit transport request
5. Wait for transporter to accept
6. Track delivery in real-time
7. Confirm delivery completion
```

### 2. Transporter
**What they do:**
- View available transport requests
- Accept transport jobs
- Navigate to pickup location
- Deliver cargo to destination
- Earn transportation fees

**Screens (10):**
1. Enhanced Dashboard (available loads, earnings)
2. Transporter Home
3. Available Loads (pending transport requests)
4. Active Trips (accepted deliveries)
5. Trip Tracking (GPS navigation)
6. Route Planner (optimize multiple stops)
7. Earnings Dashboard (daily/weekly/monthly)
8. Trip History
9. Vehicle Profile
10. Logistics Test

**Example Flow:**
```
1. Login as transporter
2. View available loads
3. Accept "500 kg Maize, 45,000 RWF"
4. Navigate to pickup (Kigali)
5. Start trip → GPS tracking begins
6. Deliver to destination (Ruhengeri)
7. Complete trip → Earn 45,000 RWF
8. View in earnings dashboard
```

---

## 📦 Data Model

### TransportRequest (formerly Order/ShipmentOrder)
```typescript
interface TransportRequest {
  _id: string;
  cargoId: string;           // Reference to cargo
  shipperId: string;         // Shipper who created request
  transporterId?: string;    // Assigned transporter (after acceptance)
  tripId?: string;           // Link to trip
  quantity: number;
  unit: 'kg' | 'tons' | 'bags';
  transportFee: number;      // Payment to transporter
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
    contactName?: string;
    contactPhone?: string;
  };

  deliveryLocation: {
    latitude: number;
    longitude: number;
    address: string;
    contactName?: string;
    contactPhone?: string;
  };

  deliveryNotes?: string;
  createdAt?: Date;
  acceptedAt?: Date;
  completedAt?: Date;
}
```

### Cargo
```typescript
interface Cargo {
  _id: string;
  shipperId: string;         // Owner of cargo
  name: string;              // "Maize", "Coffee Beans"
  quantity: number;
  unit: 'kg' | 'tons' | 'bags';
  readyDate: string;         // When ready for pickup
  location: Location;
  status: 'listed' | 'matched' | 'picked_up' | 'in_transit' | 'delivered';
  pricePerUnit?: number;     // Optional pricing info
}
```

### Trip (Transporter's View)
```typescript
interface Trip {
  _id: string;
  tripId: string;            // TRIP-20250101-001
  orderId?: string;          // Link to transport request
  transporterId?: string;    // Assigned transporter
  status: TripStatus;

  shipment: {
    cropId: string;
    farmerId: string;        // Shipper ID
    quantity: number;
    unit: string;
    cropName: string;
    totalValue?: number;
  };

  pickup: Location;
  delivery: Location;
  waypoints?: Location[];    // Multi-stop support

  earnings: {
    ratePerUnit: number;
    totalRate: number;
    status: 'pending' | 'earned' | 'paid';
  };

  createdAt: Date;
  acceptedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration?: number;
  actualDuration?: number;
  distance?: number;

  vehicleType?: string;
  vehicleCapacity?: number;
}
```

---

## 🔄 Workflow

### Complete Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    1. SHIPPER CREATES REQUEST                │
├─────────────────────────────────────────────────────────────┤
│ Shipper lists cargo: "500 kg Maize"                         │
│ Sets pickup: Kigali Market                                  │
│ Sets delivery: Ruhengeri Store                              │
│ Sets transport fee: 45,000 RWF                              │
│                                                              │
│ → TransportRequest created (status: pending)                │
│ → Trip automatically created by sync service                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                 2. TRANSPORTER VIEWS & ACCEPTS               │
├─────────────────────────────────────────────────────────────┤
│ Transporter sees in "Available Loads":                      │
│   "500 kg Maize, Kigali → Ruhengeri, 45,000 RWF"           │
│                                                              │
│ Transporter taps "Accept"                                   │
│                                                              │
│ → Trip.status = 'accepted'                                  │
│ → Trip.transporterId = '3'                                  │
│ → TransportRequest synced (status: 'accepted')              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                     3. TRANSPORTER STARTS                    │
├─────────────────────────────────────────────────────────────┤
│ Transporter navigates to pickup location                    │
│ Loads cargo                                                  │
│ Taps "Start Trip"                                            │
│                                                              │
│ → Trip.status = 'in_transit'                                │
│ → GPS tracking begins                                        │
│ → TransportRequest synced (status: 'in_progress')           │
│ → Shipper can track in real-time                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   4. TRANSPORTER DELIVERS                    │
├─────────────────────────────────────────────────────────────┤
│ Transporter arrives at delivery location                    │
│ Unloads cargo                                                │
│ Taps "Complete Trip"                                         │
│                                                              │
│ → Trip.status = 'completed'                                 │
│ → Earnings.status = 'earned' (45,000 RWF)                   │
│ → TransportRequest synced (status: 'completed')             │
│ → Shipper notified of delivery                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                      5. PAYMENT PROCESSED                    │
├─────────────────────────────────────────────────────────────┤
│ Payment system processes 45,000 RWF to transporter          │
│                                                              │
│ → Earnings.status = 'paid'                                  │
│ → Shows in transporter's earnings dashboard                 │
│ → Trip moves to history                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 Synchronization

### How Transport Requests and Trips Stay Synced

**Sync Service**: `src/logistics/services/logisticsSyncService.ts`

#### Automatic Synchronization

1. **Shipper creates transport request**
   ```typescript
   const request = await createTransportRequest(data);
   const trip = await logisticsSyncService.createTripFromOrder(request);
   // Trip automatically created for transporters to see
   ```

2. **Transporter accepts trip**
   ```typescript
   await tripService.acceptTrip(tripId);
   const requestUpdate = logisticsSyncService.syncOrderFromTrip(trip);
   await updateTransportRequest(orderId, requestUpdate);
   // Shipper's request status automatically updated
   ```

3. **Status changes propagate**
   ```
   Trip: pending → accepted → in_transit → completed
   Request: pending → accepted → in_progress → completed

   Always synchronized automatically!
   ```

---

## 🧪 Testing

### Test Users

**Shipper**
```
Phone: +250700000001
Password: password123
Name: John Farmer (Shipper)
ID: '1'
```

**Transporter**
```
Phone: +250700000003
Password: password123
Name: Mike Transporter
ID: '3'
```

### Test Scenario

**Step 1: Login as Shipper**
```bash
npm start
# Login: +250700000001 / password123
```

**Step 2: Create Transport Request**
- Navigate to "List Cargo"
- Fill in cargo details (e.g., "Maize, 500 kg")
- Set pickup location: Kigali Market
- Set delivery location: Ruhengeri Store
- Set transport fee: 45,000 RWF
- Submit

**Step 3: Login as Transporter** (different device/browser)
```bash
# Login: +250700000003 / password123
```

**Step 4: Accept Request**
- View "Available Loads"
- See the 500 kg Maize request
- Tap "Accept"
- Request moves to "Active Trips"

**Step 5: Complete Delivery**
- Start trip (GPS tracking begins)
- Navigate to pickup
- Navigate to delivery
- Complete trip
- View earnings: +45,000 RWF

**Step 6: Verify Sync** (switch back to shipper)
- Check "Active Orders"
- Status should show "Completed"
- Can view trip history and details

---

## 📊 Benefits of Two-Role System

### Simplicity
✅ Fewer roles to manage
✅ Clearer responsibilities
✅ Easier to understand

### Direct Connection
✅ Shipper directly contacts transporter
✅ No middleman
✅ Faster communication

### Pure Logistics Focus
✅ Centered on transportation
✅ Optimized for cargo delivery
✅ Clear value proposition

### Scalability
✅ Easy to add features
✅ Fleet management ready
✅ Multi-stop optimization possible
✅ Load consolidation supported

---

## 🚀 Future Enhancements

### Phase 2: Enhanced Features
- [ ] In-app messaging (shipper ↔ transporter)
- [ ] Real-time GPS updates via WebSockets
- [ ] Push notifications for status changes
- [ ] Photo proof of delivery
- [ ] Digital signatures
- [ ] Rating system (both directions)

### Phase 3: Advanced Logistics
- [ ] Multi-stop route optimization
- [ ] Load consolidation (multiple shippers → one trip)
- [ ] Fleet management (multiple vehicles)
- [ ] Vehicle tracking dashboard
- [ ] Fuel cost calculations
- [ ] Automated pricing based on distance
- [ ] Insurance options

### Phase 4: Platform Growth
- [ ] Verified transporter badges
- [ ] Premium shipper features
- [ ] Bulk transport contracts
- [ ] Scheduled recurring deliveries
- [ ] Analytics dashboard
- [ ] API for third-party integrations

---

## 💡 Key Concepts

### Direct Logistics Model
> Shippers and transporters work together directly without intermediaries. This creates a efficient, transparent platform focused purely on cargo transportation.

### TransportRequest = Trip
> Each transport request automatically becomes a trip. They're two views of the same delivery:
> - **Shipper's view**: TransportRequest (focus on cargo getting delivered)
> - **Transporter's view**: Trip (focus on driving route and earnings)

### Synchronization
> All status changes sync automatically. When a transporter updates a trip, the shipper's request updates instantly. No manual coordination needed.

### Earnings-Driven
> Transporters are motivated by clear, upfront earnings. Each available load shows exactly how much they'll earn, encouraging quick acceptance and reliable delivery.

---

## 📚 Related Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get started in 30 seconds
- **[RESTRUCTURE_SUMMARY.md](./RESTRUCTURE_SUMMARY.md)** - What changed
- **[ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md)** - Visual architecture
- **[LOGISTICS_RESTRUCTURE.md](./LOGISTICS_RESTRUCTURE.md)** - Complete technical guide

---

## 🔍 FAQ

**Q: Can a shipper also be a transporter?**
A: Not with the same account. Each user has one role. However, a person could create two separate accounts.

**Q: What happens if no transporter accepts?**
A: The transport request stays in "Available Loads" until a transporter accepts. Shippers can cancel if needed.

**Q: Can shippers track deliveries in real-time?**
A: Yes! Once a transporter starts the trip, shippers can track via GPS in the Order Tracking screen.

**Q: How are transport fees determined?**
A: Currently shippers set the fee. Future versions will include automated pricing based on distance, cargo weight, and market rates.

**Q: Can one transporter handle multiple trips?**
A: Yes! Transporters can accept multiple trips and the Route Planner will optimize the route.

**Q: What if cargo is damaged during transport?**
A: Future version will include insurance options and dispute resolution. For now, handle via direct communication.

---

**Version**: 2.1.0 (Two-Role System)
**Date**: October 24, 2025
**Status**: ✅ Implementation Complete
