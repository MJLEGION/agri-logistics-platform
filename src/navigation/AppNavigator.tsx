// src/navigation/AppNavigator.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, useAppDispatch } from '../store';
import { clearOrders } from '../store/slices/ordersSlice';
import AuthNavigator from './AuthNavigator';
import ShipperHomeScreen from '../screens/shipper/ShipperHomeScreen';
import ListCargoScreen from '../screens/shipper/ListCargoScreen.enhanced';
import MyCargoScreen from '../screens/shipper/MyCargoScreen';
import CargoDetailsScreen from '../screens/shipper/CargoDetailsScreen';
import EditCargoScreen from '../screens/shipper/EditCargoScreen';
import ShipperActiveOrdersScreen from '../screens/shipper/ShipperActiveOrdersScreen';
import RateTransporterScreen from '../screens/shipper/RateTransporterScreen';
import TransporterHomeScreen from '../screens/transporter/TransporterHomeScreen';
import EnhancedTransporterDashboard from '../screens/transporter/EnhancedTransporterDashboard';
import AvailableLoadsScreen from '../screens/transporter/AvailableLoadsScreen';
import ActiveTripsScreen from '../screens/transporter/ActiveTripsScreen';
import TripTrackingScreen from '../screens/transporter/TripTrackingScreen';
import RoutePlannerScreen from '../screens/transporter/RoutePlannerScreen';
import EarningsDashboardScreen from '../screens/transporter/EarningsDashboardScreen';
import TripHistoryScreen from '../screens/transporter/TripHistoryScreen';
import VehicleProfileScreen from '../screens/transporter/VehicleProfileScreen';
import TestScreen from '../screens/TestScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import TransportRequestScreen from '../screens/TransportRequestScreen';
import ProfileSettingsScreen from '../screens/common/ProfileSettingsScreen';

const Stack = createNativeStackNavigator();

// Helper function to normalize role for navigation
// Two-role system: shipper (requests transport) and transporter (delivers)
const normalizeRole = (role: string | undefined): string | undefined => {
  if (!role) return undefined;

  // Map legacy roles to new logistics roles
  const roleMap: Record<string, string> = {
    'farmer': 'shipper',
    'buyer': 'shipper',  // Buyers are now also shippers
    'shipper': 'shipper',
    'receiver': 'shipper', // Receivers are now shippers
    'transporter': 'transporter',
  };

  return roleMap[role] || role;
};

export default function AppNavigator() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const prevUserRef = React.useRef<string | null>(null);

  // Clear user-specific data when user changes or logs out
  useEffect(() => {
    const currentUserId = user?._id || user?.id || null;

    // Check if user has changed (login with different user) or logged out
    if (prevUserRef.current !== null && currentUserId !== prevUserRef.current) {
      // User changed - clear previous user's data
      dispatch(clearOrders());
    }

    prevUserRef.current = currentUserId;
  }, [user, dispatch]);

  const userRole = normalizeRole(user?.role);
  console.log('🚚 AppNavigator - isAuthenticated:', isAuthenticated, 'role:', user?.role, 'normalized:', userRole);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : userRole === 'transporter' ? (
          // TRANSPORTER FLOW - Accept transport requests and deliver cargo
          <>
            <Stack.Screen name="Home" component={EnhancedTransporterDashboard} />
            <Stack.Screen name="TransporterHome" component={TransporterHomeScreen} />
            <Stack.Screen name="AvailableLoads" component={AvailableLoadsScreen} />
            <Stack.Screen name="ActiveTrips" component={ActiveTripsScreen} />
            <Stack.Screen name="TripTracking" component={TripTrackingScreen} />
            <Stack.Screen name="RoutePlanner" component={RoutePlannerScreen} />
            <Stack.Screen name="EarningsDashboard" component={EarningsDashboardScreen} />
            <Stack.Screen name="TripHistory" component={TripHistoryScreen} />
            <Stack.Screen name="VehicleProfile" component={VehicleProfileScreen} />
            <Stack.Screen name="LogisticsTest" component={TestScreen} />
            <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
          </>
        ) : userRole === 'shipper' ? (
          // SHIPPER FLOW - Request transportation services for cargo
          // Shippers can list cargo and request transport directly from transporters
          <>
            <Stack.Screen name="Home" component={ShipperHomeScreen} />
            <Stack.Screen name="ListCargo" component={ListCargoScreen} />
            <Stack.Screen name="MyCargo" component={MyCargoScreen} />
            <Stack.Screen name="CargoDetails" component={CargoDetailsScreen} />
            <Stack.Screen name="EditCargo" component={EditCargoScreen} />
            <Stack.Screen name="ShipperActiveOrders" component={ShipperActiveOrdersScreen} />
            <Stack.Screen name="RateTransporter" component={RateTransporterScreen} />
            <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
            <Stack.Screen name="TransportRequest" component={TransportRequestScreen} />
            <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}