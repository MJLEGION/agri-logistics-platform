# Navigation Setup Guide

## Quick Setup - Add All New Features to Navigation

### Step 1: Update Transporter Navigation

Find your transporter navigation stack (usually in `src/navigation/AppNavigator.tsx`).

**Add these imports:**
```typescript
import EnhancedTransporterDashboard from '../screens/transporter/EnhancedTransporterDashboard';
import RoutePlannerScreen from '../screens/transporter/RoutePlannerScreen';
import TestScreen from '../screens/TestScreen';
```

**Update your transporter stack:**
```typescript
function TransporterStack() {
  return (
    <Stack.Navigator>
      {/* Use Enhanced Dashboard as Home */}
      <Stack.Screen
        name="Home"
        component={EnhancedTransporterDashboard}
        options={{ headerShown: false }}
      />

      {/* Existing screens */}
      <Stack.Screen
        name="AvailableLoads"
        component={AvailableLoadsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ActiveTrips"
        component={ActiveTripsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TripTracking"
        component={TripTrackingScreen}
        options={{ headerShown: false }}
      />

      {/* NEW: Route Planner */}
      <Stack.Screen
        name="RoutePlanner"
        component={RoutePlannerScreen}
        options={{ headerShown: false }}
      />

      {/* Existing screens */}
      <Stack.Screen
        name="EarningsDashboard"
        component={EarningsDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TripHistory"
        component={TripHistoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VehicleProfile"
        component={VehicleProfileScreen}
        options={{ headerShown: false }}
      />

      {/* NEW: Test Screen (optional - for development) */}
      <Stack.Screen
        name="LogisticsTest"
        component={TestScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
```

---

### Step 2: Update TransporterHomeScreen Quick Actions

If you want to keep using the original TransporterHomeScreen, update the Route Planner action:

**Find this code in TransporterHomeScreen.tsx:**
```typescript
{/* Route Planner */}
<TouchableOpacity
  style={[styles.actionCard, { backgroundColor: theme.card }]}
  onPress={() => alert('Route optimization coming soon!')} // OLD
>
```

**Replace with:**
```typescript
{/* Route Planner */}
<TouchableOpacity
  style={[styles.actionCard, { backgroundColor: theme.card }]}
  onPress={() => navigation.navigate('RoutePlanner')} // NEW!
>
```

**Do the same for Earnings and Vehicle Info:**
```typescript
{/* Earnings */}
<TouchableOpacity
  style={[styles.actionCard, { backgroundColor: theme.card }]}
  onPress={() => navigation.navigate('EarningsDashboard')} // Was: alert
>

{/* Vehicle Info */}
<TouchableOpacity
  style={[styles.actionCard, { backgroundColor: theme.card }]}
  onPress={() => navigation.navigate('VehicleProfile')} // Was: alert
>

{/* Trip History */}
<TouchableOpacity
  style={[styles.actionCard, { backgroundColor: theme.card }]}
  onPress={() => navigation.navigate('TripHistory')} // Was: alert
>
```

---

### Step 3: Verify All Screens Are Imported

Make sure your navigator file has all these imports:

```typescript
// Transporter Screens
import TransporterHomeScreen from '../screens/transporter/TransporterHomeScreen';
import EnhancedTransporterDashboard from '../screens/transporter/EnhancedTransporterDashboard';
import AvailableLoadsScreen from '../screens/transporter/AvailableLoadsScreen';
import ActiveTripsScreen from '../screens/transporter/ActiveTripsScreen';
import TripTrackingScreen from '../screens/transporter/TripTrackingScreen';
import RoutePlannerScreen from '../screens/transporter/RoutePlannerScreen';
import EarningsDashboardScreen from '../screens/transporter/EarningsDashboardScreen';
import TripHistoryScreen from '../screens/transporter/TripHistoryScreen';
import VehicleProfileScreen from '../screens/transporter/VehicleProfileScreen';

// Farmer Screens
import FarmerHomeScreen from '../screens/farmer/FarmerHomeScreen';
import ListCropScreen from '../screens/farmer/ListCropScreen';
import MyListingsScreen from '../screens/farmer/MyListingsScreen';
import EditCropScreen from '../screens/farmer/EditCropScreen';
import CropDetailsScreen from '../screens/farmer/CropDetailsScreen';
import ActiveOrdersScreen from '../screens/farmer/ActiveOrdersScreen';

// Buyer Screens
import BuyerHomeScreen from '../screens/buyer/BuyerHomeScreen';
import BrowseCropsScreen from '../screens/buyer/BrowseCropsScreen';
import PlaceOrderScreen from '../screens/buyer/PlaceOrderScreen';
import MyOrdersScreen from '../screens/buyer/MyOrdersScreen';

// Common Screens
import OrderTrackingScreen from '../screens/OrderTrackingScreen';

// Testing (Optional)
import TestScreen from '../screens/TestScreen';
```

---

### Step 4: Test Navigation

Run your app and test each navigation path:

**Transporter:**
```
Home → Available Loads → Accept Load → Active Trips → Trip Tracking
Home → Route Planner → Select Loads → Optimize
Home → Earnings Dashboard → View Stats
Home → Vehicle Profile → Edit Info
Home → Trip History → View Past Trips
```

**Farmer:**
```
Home → List Crop → Fill Form → Submit
Home → My Listings → View/Edit/Delete
Home → Active Orders → Track Delivery
```

**Buyer:**
```
Home → Browse Crops → Place Order → Fill Form → Submit
Home → My Orders → Track Order
```

---

## Complete Example: Full Navigator

Here's a complete example of how your AppNavigator.tsx should look:

```typescript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '../store';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';
import LandingScreen from '../screens/LandingScreen';

// Transporter Screens
import EnhancedTransporterDashboard from '../screens/transporter/EnhancedTransporterDashboard';
import AvailableLoadsScreen from '../screens/transporter/AvailableLoadsScreen';
import ActiveTripsScreen from '../screens/transporter/ActiveTripsScreen';
import TripTrackingScreen from '../screens/transporter/TripTrackingScreen';
import RoutePlannerScreen from '../screens/transporter/RoutePlannerScreen';
import EarningsDashboardScreen from '../screens/transporter/EarningsDashboardScreen';
import TripHistoryScreen from '../screens/transporter/TripHistoryScreen';
import VehicleProfileScreen from '../screens/transporter/VehicleProfileScreen';

// Farmer Screens
import FarmerHomeScreen from '../screens/farmer/FarmerHomeScreen';
import ListCropScreen from '../screens/farmer/ListCropScreen';
import MyListingsScreen from '../screens/farmer/MyListingsScreen';
import EditCropScreen from '../screens/farmer/EditCropScreen';
import CropDetailsScreen from '../screens/farmer/CropDetailsScreen';
import ActiveOrdersScreen from '../screens/farmer/ActiveOrdersScreen';

// Buyer Screens
import BuyerHomeScreen from '../screens/buyer/BuyerHomeScreen';
import BrowseCropsScreen from '../screens/buyer/BrowseCropsScreen';
import PlaceOrderScreen from '../screens/buyer/PlaceOrderScreen';
import MyOrdersScreen from '../screens/buyer/MyOrdersScreen';

// Common
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import TestScreen from '../screens/TestScreen';

const Stack = createNativeStackNavigator();

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Transporter Stack
function TransporterStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={EnhancedTransporterDashboard} />
      <Stack.Screen name="AvailableLoads" component={AvailableLoadsScreen} />
      <Stack.Screen name="ActiveTrips" component={ActiveTripsScreen} />
      <Stack.Screen name="TripTracking" component={TripTrackingScreen} />
      <Stack.Screen name="RoutePlanner" component={RoutePlannerScreen} />
      <Stack.Screen name="EarningsDashboard" component={EarningsDashboardScreen} />
      <Stack.Screen name="TripHistory" component={TripHistoryScreen} />
      <Stack.Screen name="VehicleProfile" component={VehicleProfileScreen} />
      <Stack.Screen name="LogisticsTest" component={TestScreen} />
      <Stack.Screen name="ActiveTripScreen" component={ActiveTripScreen} />
    </Stack.Navigator>
  );
}

// Farmer Stack
function FarmerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={FarmerHomeScreen} />
      <Stack.Screen name="ListCrop" component={ListCropScreen} />
      <Stack.Screen name="MyListings" component={MyListingsScreen} />
      <Stack.Screen name="EditCrop" component={EditCropScreen} />
      <Stack.Screen name="CropDetails" component={CropDetailsScreen} />
      <Stack.Screen name="ActiveOrders" component={ActiveOrdersScreen} />
    </Stack.Navigator>
  );
}

// Buyer Stack
function BuyerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={BuyerHomeScreen} />
      <Stack.Screen name="BrowseCrops" component={BrowseCropsScreen} />
      <Stack.Screen name="PlaceOrder" component={PlaceOrderScreen} />
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
    </Stack.Navigator>
  );
}

// Main Navigator
export default function AppNavigator() {
  const { user, isAuthenticated } = useAppSelector(state => state.auth);

  if (!isAuthenticated) {
    return <AuthStack />;
  }

  // Route based on user role
  switch (user?.role) {
    case 'transporter':
      return <TransporterStack />;
    case 'farmer':
      return <FarmerStack />;
    case 'buyer':
      return <BuyerStack />;
    default:
      return <AuthStack />;
  }
}
```

---

## Quick Navigation Calls

### From Any Transporter Screen:

```typescript
// Go to route planner
navigation.navigate('RoutePlanner');

// Go to earnings
navigation.navigate('EarningsDashboard');

// Go to vehicle profile
navigation.navigate('VehicleProfile');

// Go to trip history
navigation.navigate('TripHistory');

// Go to available loads
navigation.navigate('AvailableLoads');

// Go to active trips
navigation.navigate('ActiveTrips');

// Go to trip tracking (with trip data)
navigation.navigate('TripTracking', { trip: tripObject });

// Run tests
navigation.navigate('LogisticsTest');
```

### From Any Farmer Screen:

```typescript
// List new crop
navigation.navigate('ListCrop');

// View my listings
navigation.navigate('MyListings');

// Edit crop
navigation.navigate('EditCrop', { crop: cropObject });

// View crop details
navigation.navigate('CropDetails', { crop: cropObject });

// View active orders
navigation.navigate('ActiveOrders');
```

### From Any Buyer Screen:

```typescript
// Browse crops
navigation.navigate('BrowseCrops');

// Place order
navigation.navigate('PlaceOrder', { crop: cropObject });

// View my orders
navigation.navigate('MyOrders');

// Track order
navigation.navigate('OrderTracking', { order: orderObject });
```

---

## Common Issues & Solutions

### Issue: "Can't find screen RoutePlanner"
**Solution:** Make sure you added the import and screen to your stack:
```typescript
import RoutePlannerScreen from '../screens/transporter/RoutePlannerScreen';
<Stack.Screen name="RoutePlanner" component={RoutePlannerScreen} />
```

### Issue: "undefined is not an object (evaluating 'navigation.navigate')"
**Solution:** Make sure your component receives navigation prop:
```typescript
export default function MyScreen({ navigation }: any) {
  // Now you can use navigation.navigate()
}
```

### Issue: Alert still showing instead of navigating
**Solution:** Replace `alert()` with `navigation.navigate()`:
```typescript
// OLD:
onPress={() => alert('Coming soon!')}

// NEW:
onPress={() => navigation.navigate('RoutePlanner')}
```

---

## Testing Checklist

After setup, test these flows:

### Transporter:
- [ ] Home → Available Loads works
- [ ] Accept Load → Active Trips works
- [ ] Active Trips → Trip Tracking works
- [ ] Home → Route Planner works
- [ ] Route Planner → Select loads → Optimize works
- [ ] Home → Earnings Dashboard works
- [ ] Home → Vehicle Profile works
- [ ] Home → Trip History works

### Farmer:
- [ ] Home → List Crop works
- [ ] List Crop → Submit → My Listings works
- [ ] My Listings → Edit works
- [ ] My Listings → Delete works
- [ ] Home → Active Orders works

### Buyer:
- [ ] Home → Browse Crops works
- [ ] Browse Crops → Place Order works
- [ ] Place Order → Submit → My Orders works
- [ ] My Orders → Track works

---

## Done! 🎉

Your navigation is now fully set up with all features accessible!

**Next Steps:**
1. Test all navigation paths
2. Verify data flow between screens
3. Check that all features work end-to-end
4. Deploy to device for real testing

---

**Need Help?**
- Check COMPLETE_FEATURE_STATUS.md for feature details
- See HOW_TO_TEST.md for testing guide
- Review LOGISTICS_UPGRADE_SUMMARY.md for technical docs
