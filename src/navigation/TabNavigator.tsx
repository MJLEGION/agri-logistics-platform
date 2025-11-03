// src/navigation/TabNavigator.tsx - Premium Tab-Based Navigation
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Shipper Screens
import ShipperHomeScreen from '../screens/shipper/ShipperHomeScreen';
import ListCargoScreen from '../screens/shipper/ListCargoScreen';
import MyCargoScreen from '../screens/shipper/MyCargoScreen';
import ShipperActiveOrdersScreen from '../screens/shipper/ShipperActiveOrdersScreen';

// Transporter Screens
import EnhancedTransporterDashboard from '../screens/transporter/EnhancedTransporterDashboard';
import AvailableLoadsScreen from '../screens/transporter/AvailableLoadsScreen';
import ActiveTripsScreen from '../screens/transporter/ActiveTripsScreen';
import EarningsDashboardScreen from '../screens/transporter/EarningsDashboardScreen';

const Tab = createBottomTabNavigator();

// Tab icon component with gradient background
function TabIcon({
  name,
  color,
  size,
  focused,
}: {
  name: string;
  color: string;
  size: number;
  focused: boolean;
}) {
  return (
    <View
      style={{
        width: size + 16,
        height: size + 16,
        borderRadius: (size + 16) / 2,
        backgroundColor: focused ? 'rgba(14, 165, 233, 0.15)' : 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'all 0.3s ease',
      }}
    >
      <MaterialCommunityIcons name={name} color={color} size={size} />
    </View>
  );
}

// Shipper Tab Navigator
export function ShipperTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F1419',
          borderTopWidth: 1,
          borderTopColor: 'rgba(14, 165, 233, 0.2)',
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -5 },
          shadowOpacity: 0.3,
          shadowRadius: 15,
        },
        tabBarActiveTintColor: '#0EA5E9',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: 4,
        },
        tabBarIconStyle: {
          width: 40,
          height: 40,
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
    >
      <Tab.Screen
        name="ShipperHome"
        component={ShipperHomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? 'home' : 'home-outline'}
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ListCargo"
        component={ListCargoScreen}
        options={{
          tabBarLabel: 'New Cargo',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? 'plus-box' : 'plus-box-outline'}
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="MyCargo"
        component={MyCargoScreen}
        options={{
          tabBarLabel: 'My Cargo',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? 'package-variant' : 'package-variant-closed'}
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ShipperOrders"
        component={ShipperActiveOrdersScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? 'clipboard-check' : 'clipboard-check-outline'}
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Transporter Tab Navigator
export function TransporterTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F1419',
          borderTopWidth: 1,
          borderTopColor: 'rgba(14, 165, 233, 0.2)',
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -5 },
          shadowOpacity: 0.3,
          shadowRadius: 15,
        },
        tabBarActiveTintColor: '#0EA5E9',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: 4,
        },
        tabBarIconStyle: {
          width: 40,
          height: 40,
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
    >
      <Tab.Screen
        name="TransporterHome"
        component={EnhancedTransporterDashboard}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? 'speedometer' : 'speedometer'}
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="AvailableLoads"
        component={AvailableLoadsScreen}
        options={{
          tabBarLabel: 'Available',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? 'briefcase-search' : 'briefcase-search'}
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ActiveTrips"
        component={ActiveTripsScreen}
        options={{
          tabBarLabel: 'Active',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? 'map-marker-radius' : 'map-marker-radius'}
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Earnings"
        component={EarningsDashboardScreen}
        options={{
          tabBarLabel: 'Earnings',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? 'cash-multiple' : 'cash-multiple'}
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}