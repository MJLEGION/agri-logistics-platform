// src/screens/farmer/FarmerHomeScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';

export default function FarmerHomeScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {user?.name}!</Text>
        <Text style={styles.role}>Farmer Dashboard</Text>
      </View>

      <TouchableOpacity 
        style={styles.actionCard}
        onPress={() => navigation.navigate('ListCrop')}
      >
        <Text style={styles.cardIcon}>📝</Text>
        <Text style={styles.cardTitle}>List New Crop</Text>
        <Text style={styles.cardDesc}>Add crops available for sale</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionCard}
        onPress={() => navigation.navigate('MyListings')}
      >
        <Text style={styles.cardIcon}>📦</Text>
        <Text style={styles.cardTitle}>My Listings</Text>
        <Text style={styles.cardDesc}>View your active crop listings</Text>
      </TouchableOpacity>

      <TouchableOpacity 
           style={styles.actionCard}
             onPress={() => navigation.navigate('ActiveOrders')}
          >
          <Text style={styles.cardIcon}>🚚</Text>
          <Text style={styles.cardTitle}>Active Orders</Text>
          <Text style={styles.cardDesc}>Track your ongoing deliveries</Text>
          </TouchableOpacity>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => dispatch(logout())}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2E7D32',
    padding: 20,
    paddingTop: 50,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  role: {
    fontSize: 16,
    color: '#C8E6C9',
    marginTop: 5,
  },
  actionCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});