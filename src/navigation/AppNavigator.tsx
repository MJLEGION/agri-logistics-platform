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
import TransporterHomeScreen from '../screens/transporter/TransporterHomeScreen';
import BuyerHomeScreen from '../screens/buyer/BuyerHomeScreen';

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
              </>
            )}
            {user?.role === 'transporter' && (
              <Stack.Screen name="Home" component={TransporterHomeScreen} />
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