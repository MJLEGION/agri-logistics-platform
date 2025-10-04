// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import AuthNavigator from './AuthNavigator';
import FarmerHomeScreen from '../screens/farmer/FarmerHomeScreen';
import TransporterHomeScreen from '../screens/transporter/TransporterHomeScreen';
import BuyerHomeScreen from '../screens/buyer/BuyerHomeScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const getHomeScreen = () => {
    switch (user?.role) {
      case 'farmer':
        return FarmerHomeScreen;
      case 'transporter':
        return TransporterHomeScreen;
      case 'buyer':
        return BuyerHomeScreen;
      default:
        return FarmerHomeScreen;
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Screen name="Home" component={getHomeScreen()} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}