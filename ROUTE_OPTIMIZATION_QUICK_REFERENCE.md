# Route Optimization - Quick Reference Card

## 🚀 Quick Start (5 minutes)

### 1. Create Multi-Stop Route

```typescript
import {
  createOptimizedRoute,
  startRouteTracking,
} from "../services/smartRouteOptimizationService";

const route = createOptimizedRoute(
  "transporter_id",
  { latitude: -1.97, longitude: 30.1, address: "Hub" },
  [
    // Array of StopInfo objects with pickup/delivery locations
  ]
);

await startRouteTracking(route.routeId);
```

### 2. Send Delivery Alert

```typescript
import { notifyTransporterEnRoute } from "../services/deliveryAlertsService";

await notifyTransporterEnRoute(
  "order_123",
  {
    id: "farmer_1",
    name: "John",
    phone: "+250788123456",
    pickupAddress: "Farm A",
  },
  { id: "transporter_1", name: "Kamali Transport", vehicleType: "Truck" },
  25 // ETA in minutes
);
```

### 3. Display Alerts to Farmer

```typescript
import { DeliveryAlertsPanel } from "../components/DeliveryAlertsPanel";

<DeliveryAlertsPanel farmerId={user.id} />;
```

---

## 📋 Core Functions

### Route Optimization Service

| Function                   | Input                    | Output       | Use Case                      |
| -------------------------- | ------------------------ | ------------ | ----------------------------- |
| `calculateDistance()`      | lat1, lon1, lat2, lon2   | number (km)  | Get distance between 2 points |
| `calculateETA()`           | distance, traffic        | number (min) | Estimate arrival time         |
| `calculateEarnings()`      | distance                 | number (RWF) | Calculate driver earnings     |
| `optimizeMultiStopRoute()` | location, destinations[] | Waypoint[]   | Optimize stop order           |
| `calculateFuelCost()`      | distance                 | number (RWF) | Estimate fuel expenses        |

**Example:**

```typescript
import {
  calculateDistance,
  calculateETA,
} from "../services/routeOptimizationService";

const dist = calculateDistance(-1.97, 30.1, -1.95, 30.12);
const eta = calculateETA(dist); // Returns minutes
```

---

### Smart Route Optimization Service

| Function                  | Input                            | Output              | Purpose                  |
| ------------------------- | -------------------------------- | ------------------- | ------------------------ |
| `createOptimizedRoute()`  | transporterId, location, stops[] | OptimizedMultiRoute | Create efficient route   |
| `startRouteTracking()`    | routeId, interval                | void                | Start real-time tracking |
| `updateRouteLocation()`   | routeId, newLocation             | boolean             | Update GPS position      |
| `completeStop()`          | routeId, stopIndex               | boolean             | Mark stop done           |
| `getRouteSummary()`       | routeId                          | RouteSummary        | Get status snapshot      |
| `calculateRouteSavings()` | singleDist, optimizedDist        | Savings             | Compare efficiency       |

**Example:**

```typescript
import {
  createOptimizedRoute,
  getRouteSummary,
} from "../services/smartRouteOptimizationService";

const route = createOptimizedRoute("t1", loc, stops);
await startRouteTracking(route.routeId, 60); // Update every 60 sec

const summary = getRouteSummary(route.routeId);
// { totalStops: 3, completed: 1, pending: 2, isDelayed: false, ... }
```

---

### Delivery Alerts Service

| Function                       | Triggers             | SMS Sent        | When to Use         |
| ------------------------------ | -------------------- | --------------- | ------------------- |
| `notifyTransporterEnRoute()`   | Transporter assigned | ✅ Always       | When trip starts    |
| `notifyETAUpdate()`            | Every 5 min          | ✅ Every 10 min | During transit      |
| `notifyArrivingSoon()`         | <5km away            | ✅ Always       | Nearly at stop      |
| `notifyDelay()`                | >15 min late         | ✅ If delayed   | When running behind |
| `notifyDeliveryConfirmed()`    | Delivery complete    | ✅ Always       | After delivery      |
| `requestAddressConfirmation()` | Need confirmation    | ✅ Always       | Address unclear     |

**Example:**

```typescript
import {
  notifyDelay,
  getFarmerAlerts,
  onAlertReceived,
} from "../services/deliveryAlertsService";

// Send delay alert
await notifyDelay(orderId, farmerInfo, transporterInfo, 20, "Heavy traffic");

// Get alert history
const alerts = getFarmerAlerts(farmerId);

// Listen for new alerts
onAlertReceived((alert) => {
  console.log(alert.message);
});
```

---

## 🎯 Common Scenarios

### Scenario 1: Farmer Dashboard with Real-Time Alerts

```typescript
export function FarmerDashboard() {
  const { user } = useAuth();

  return (
    <View>
      <Text>My Orders</Text>
      {/* Shows all alerts with unread count badge */}
      <DeliveryAlertsPanel farmerId={user.id} />
    </View>
  );
}
```

### Scenario 2: Transporter Accepts Multiple Orders

```typescript
async function assignMultipleOrdersToTransporter(
  orders: Order[],
  transporterId: string
) {
  // Convert orders to stops
  const stops: StopInfo[] = orders.map((order, idx) => ({
    orderId: order.id,
    farmerId: order.farmerId,
    farmerName: order.farmerName,
    farmerPhone: order.farmerPhone,
    type: order.type, // 'pickup' or 'delivery'
    cropType: order.cropType,
    quantity: order.quantity,
    latitude: order.location.latitude,
    longitude: order.location.longitude,
    address: order.location.address,
    sequence: idx + 1,
    status: "pending",
  }));

  // Create optimized route (auto reorders stops for efficiency)
  const route = createOptimizedRoute(
    transporterId,
    transporterCurrentLocation,
    stops
  );

  // Start tracking
  await startRouteTracking(route.routeId);

  // Notify all farmers
  for (const stop of route.stops) {
    if (stop.type === "pickup") {
      await notifyTransporterEnRoute(
        stop.orderId,
        {
          id: stop.farmerId,
          name: stop.farmerName,
          phone: stop.farmerPhone,
          pickupAddress: stop.address,
        },
        { id: transporterId, name: "Driver", vehicleType: "Truck" },
        route.totalDuration
      );
    }
  }
}
```

### Scenario 3: Monitor Route and Auto-Respond to Delays

```typescript
async function monitorRoute(routeId: string) {
  const interval = setInterval(async () => {
    const summary = getRouteSummary(routeId);

    if (summary.isDelayed && summary.delayMinutes > 30) {
      // Auto-cancel and find alternative
      console.log("Route critically delayed, initiating recovery...");
      // Notify admin or customer
      clearInterval(interval);
    }
  }, 60000); // Check every minute
}
```

---

## 📊 Data Structures

### OptimizedMultiRoute

```typescript
{
  routeId: string;
  transporterId: string;
  stops: StopInfo[]; // Reordered for efficiency
  totalDistance: number; // km
  totalDuration: number; // minutes
  totalEarnings: number; // RWF
  estimatedCompletionTime: Date;
  alerts: string[];
}
```

### DeliveryAlert

```typescript
{
  id: string;
  orderId: string;
  farmerId: string;
  farmerPhone: string;
  alertType: 'en_route' | 'eta_update' | 'arriving_soon' | 'delayed' | 'delivered';
  message: string;
  timestamp: Date;
  read: boolean;
  metadata?: {
    eta?: number;
    delay?: number;
    distance?: number;
    estimatedArrival?: Date;
  };
}
```

### StopInfo

```typescript
{
  orderId: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  type: 'pickup' | 'delivery';
  quantity?: string;
  cropType?: string;
  latitude: number;
  longitude: number;
  address: string;
  sequence: number;
  status: 'pending' | 'arrived' | 'completed';
  estimatedArrival?: Date;
  actualArrival?: Date;
}
```

---

## 🔧 Configuration

### Default Alert Config

```typescript
{
  sendSMS: true,
  sendPushNotification: true,
  delayThresholdMinutes: 15,
  etaUpdateFrequencyMinutes: 5
}
```

### Custom Config

```typescript
const customConfig = {
  sendSMS: false, // Don't send SMS
  sendPushNotification: true,
  delayThresholdMinutes: 30, // Alert if >30 min late
  etaUpdateFrequencyMinutes: 10
};

await notifyTransporterEnRoute(..., customConfig);
```

---

## 🐛 Debugging

### Check Route Status

```typescript
const route = getRoute(routeId);
const tracker = getTrackerStatus(routeId);

console.log("Route:", route);
console.log("Tracker:", {
  currentStop: route?.stops[tracker?.currentStopIndex],
  isDelayed: tracker?.isDelayed,
  delayMinutes: tracker?.delayMinutes,
  completedStops: tracker?.completedStops,
});
```

### View Farmer Alerts

```typescript
const alerts = getFarmerAlerts(farmerId);
alerts.forEach((alert) => {
  console.log(`[${alert.alertType}] ${alert.message}`);
  console.log(`  Read: ${alert.read}, Time: ${alert.timestamp}`);
});
```

### Test SMS Alerts

```typescript
import { mockSendSMS } from "../services/smsService";

await mockSendSMS({
  to: "+250788123456",
  message: "Test alert",
  type: "transporter_assigned",
});
```

---

## ⚡ Performance Tips

1. **Update Frequency**: Balance between real-time accuracy and battery/data usage

   ```typescript
   startRouteTracking(routeId, 60); // 60 sec = good balance
   ```

2. **Limit Alert History**: Service auto-keeps last 100 alerts per farmer

3. **Clean Up**: Stop tracking when route completes

   ```typescript
   stopRouteTracking(routeId);
   ```

4. **Batch Updates**: Group multiple alerts instead of individual ones

---

## 🔐 Security Notes

- Phone numbers stored in alerts - handle with care
- SMS gateway requires API key in `.env`
- Validate coordinates before processing
- Implement rate limiting on alert endpoints

---

## 📱 UI Components Available

- **DeliveryAlertsPanel** - Full alert display with history
  - Shows all alert types with icons
  - Expandable details
  - Unread badge
  - Stats bar

---

## 🔗 Related Files

- `src/services/routeOptimizationService.ts` - Core algorithms
- `src/services/smartRouteOptimizationService.ts` - Real-time tracking
- `src/services/deliveryAlertsService.ts` - Notifications
- `src/services/smsService.ts` - SMS integration
- `src/components/DeliveryAlertsPanel.tsx` - UI component
- `ROUTE_OPTIMIZATION_GUIDE.md` - Full documentation

---

## 🆘 Common Errors

| Error               | Cause                | Fix                                |
| ------------------- | -------------------- | ---------------------------------- |
| Route not found     | Invalid routeId      | Check `activeRoutes.get(routeId)`  |
| Invalid coordinates | Lat/Lon out of range | Validate: -90≤lat≤90, -180≤lon≤180 |
| SMS not sending     | API key missing      | Check `.env` AFRICAS_TALKING_KEY   |
| No alerts shown     | Wrong farmerId       | Verify farmerId matches            |

---

## 📞 Version Info

- **Status**: ✅ Production Ready
- **Last Updated**: 2024
- **Services**: 3 (optimization, tracking, alerts)
- **Components**: 1 (DeliveryAlertsPanel)
- **Test Coverage**: Alert scenarios

---

## 💡 Quick Copy-Paste Templates

### Template 1: Send Route with Alerts

```typescript
async function executeRoute(orders: Order[], transporterId: string) {
  const route = createOptimizedRoute(transporterId, currentLoc, stops);
  await startRouteTracking(route.routeId);
  for (const stop of route.stops) {
    if (stop.type === "pickup") {
      await notifyTransporterEnRoute(
        stop.orderId,
        farmerInfo,
        transporterInfo,
        route.totalDuration
      );
    }
  }
  return route.routeId;
}
```

### Template 2: Monitor and Alert

```typescript
const summary = getRouteSummary(routeId);
if (summary.isDelayed) {
  await notifyDelay(
    currentStop.orderId,
    farmerInfo,
    transporterInfo,
    summary.delayMinutes
  );
}
```

### Template 3: Farmer UI

```typescript
<DeliveryAlertsPanel
  farmerId={user.id}
  onAlertPress={(alert) => navigate(`/order/${alert.orderId}`)}
/>
```
