// src/screens/buyer/BuyerHomeScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';

export default function BuyerHomeScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {user?.name}!</Text>
        <Text style={styles.role}>Buyer Dashboard</Text>
      </View>

      <TouchableOpacity style={styles.actionCard}>
        <Text style={styles.cardIcon}>🔍</Text>
        <Text style={styles.cardTitle}>Browse Crops</Text>
        <Text style={styles.cardDesc}>Find fresh produce near you</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard}>
        <Text style={styles.cardIcon}>🛒</Text>
        <Text style={styles.cardTitle}>Place Order</Text>
        <Text style={styles.cardDesc}>Buy crops from farmers</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard}>
        <Text style={styles.cardIcon}>📋</Text>
        <Text style={styles.cardTitle}>My Orders</Text>
        <Text style={styles.cardDesc}>Track your purchases</Text>
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
    backgroundColor: '#FF9800',
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
    color: '#FFE0B2',
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