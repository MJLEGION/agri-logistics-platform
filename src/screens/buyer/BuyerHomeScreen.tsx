// src/screens/buyer/BuyerHomeScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { useEffect } from 'react';
import { fetchCrops } from '../../store/slices/cropsSlice';
import { fetchOrders } from '../../store/slices/ordersSlice';

export default function FarmerHomeScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { theme } = useTheme();

  // Add this useEffect to fetch data when screen loads
  useEffect(() => {
    dispatch(fetchCrops());
    dispatch(fetchOrders());
  }, [dispatch]);

export default function BuyerHomeScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        <View style={[styles.header, { backgroundColor: theme.secondary }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.greeting, { color: theme.card }]}>
                Welcome, {user?.name}!
              </Text>
              <Text style={[styles.role, { color: theme.card, opacity: 0.8 }]}>
                Buyer Dashboard
              </Text>
            </View>
            <ThemeToggle />
          </View>
        </View>

        <View style={styles.content}>
          <Card>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('BrowseCrops')}
            >
              <Text style={styles.cardIcon}>🔍</Text>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Browse Crops
              </Text>
              <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                Find fresh produce near you
              </Text>
            </TouchableOpacity>
          </Card>

          <Card>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.cardIcon}>🛒</Text>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Place Order
              </Text>
              <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                Buy crops from farmers
              </Text>
            </TouchableOpacity>
          </Card>

          <Card>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('MyOrders')}
            >
              <Text style={styles.cardIcon}>📋</Text>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                My Orders
              </Text>
              <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                Track your purchases
              </Text>
            </TouchableOpacity>
          </Card>

          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: theme.error }]}
            onPress={() => dispatch(logout())}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  role: {
    fontSize: 16,
    marginTop: 5,
  },
  content: {
    padding: 15,
  },
  actionCard: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDesc: {
    fontSize: 14,
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 10,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});