// src/navigation/AppNavigator.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, useAppDispatch } from '../store';
import { clearCrops } from '../store/slices/cropsSlice';
import { clearOrders } from '../store/slices/ordersSlice';
import AuthNavigator from './AuthNavigator';
import FarmerHomeScreen from '../screens/farmer/FarmerHomeScreen';
import ListCropScreen from '../screens/farmer/ListCropScreen';
import MyListingsScreen from '../screens/farmer/MyListingsScreen';
import CropDetailsScreen from '../screens/farmer/CropDetailsScreen';
import EditCropScreen from '../screens/farmer/EditCropScreen';
import ActiveOrdersScreen from '../screens/farmer/ActiveOrdersScreen';
import TransporterHomeScreen from '../screens/transporter/TransporterHomeScreen';
import AvailableLoadsScreen from '../screens/transporter/AvailableLoadsScreen';
import ActiveTripsScreen from '../screens/transporter/ActiveTripsScreen';
import TripTrackingScreen from '../screens/transporter/TripTrackingScreen';
import BuyerHomeScreen from '../screens/buyer/BuyerHomeScreen';
import BrowseCropsScreen from '../screens/buyer/BrowseCropsScreen';
import PlaceOrderScreen from '../screens/buyer/PlaceOrderScreen';
import MyOrdersScreen from '../screens/buyer/MyOrdersScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';

const Stack = createNativeStackNavigator();

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
      dispatch(clearCrops());
      dispatch(clearOrders());
    }
    
    prevUserRef.current = currentUserId;
  }, [user, dispatch]);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            {user?.role === 'farmer' && (
              <>
                <Stack.Screen name="Home" component={FarmerHomeScreen} />
                <Stack.Screen name="ListCrop" component={ListCropScreen} />
                <Stack.Screen name="MyListings" component={MyListingsScreen} />
                <Stack.Screen name="CropDetails" component={CropDetailsScreen} />
                <Stack.Screen name="EditCrop" component={EditCropScreen} />
                <Stack.Screen name="ActiveOrders" component={ActiveOrdersScreen} />
              </>
            )}
            {user?.role === 'transporter' && (
              <>
                <Stack.Screen name="Home" component={TransporterHomeScreen} />
                <Stack.Screen name="AvailableLoads" component={AvailableLoadsScreen} />
                <Stack.Screen name="ActiveTrips" component={ActiveTripsScreen} />
                <Stack.Screen name="TripTracking" component={TripTrackingScreen} />
              </>
            )}
            {user?.role === 'buyer' && (
              <>
                <Stack.Screen name="Home" component={BuyerHomeScreen} />
                <Stack.Screen name="BrowseCrops" component={BrowseCropsScreen} />
                <Stack.Screen name="PlaceOrder" component={PlaceOrderScreen} />
                <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
                <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}