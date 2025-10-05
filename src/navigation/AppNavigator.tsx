// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import AuthNavigator from './AuthNavigator';
import FarmerHomeScreen from '../screens/farmer/FarmerHomeScreen';
import ListCropScreen from '../screens/farmer/ListCropScreen';
import MyListingsScreen from '../screens/farmer/MyListingsScreen';
import CropDetailsScreen from '../screens/farmer/CropDetailsScreen';
import EditCropScreen from '../screens/farmer/EditCropScreen';
import ActiveOrdersScreen from '../screens/farmer/ActiveOrdersScreen';
import TransporterHomeScreen from '../screens/transporter/TransporterHomeScreen';
import AvailableLoadsScreen from '../screens/transporter/AvailableLoadsScreen';
import BuyerHomeScreen from '../screens/buyer/BuyerHomeScreen';
import ActiveTripsScreen from '../screens/transporter/ActiveTripsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

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
                <Stack.Screen name="Home" component={TransporterHomeScreen} />
                <Stack.Screen name="AvailableLoads" component={AvailableLoadsScreen} />
                <Stack.Screen name="ActiveTrips" component={ActiveTripsScreen} />
              </>
            )}
            {user?.role === 'transporter' && (
              <>
                <Stack.Screen name="Home" component={TransporterHomeScreen} />
                <Stack.Screen name="AvailableLoads" component={AvailableLoadsScreen} />
              </>
            )}
            {user?.role === 'buyer' && (
              <Stack.Screen name="Home" component={BuyerHomeScreen} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}