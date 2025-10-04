// src/navigation/AuthNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
    </Stack.Navigator>
  );
}