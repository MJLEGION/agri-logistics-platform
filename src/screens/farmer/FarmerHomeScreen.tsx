// src/screens/farmer/FarmerHomeScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { fetchCrops } from '../../store/slices/cropsSlice';
import { fetchOrders } from '../../store/slices/ordersSlice';

export default function FarmerHomeScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { theme } = useTheme();

  // Fetch data when screen loads
  useEffect(() => {
    dispatch(fetchCrops());
    dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.greeting, { color: theme.card }]}>
                Welcome, {user?.name}!
              </Text>
              <Text style={[styles.role, { color: theme.card, opacity: 0.8 }]}>
                Farmer Dashboard
              </Text>
            </View>
            <ThemeToggle />
          </View>
        </View>

        <View style={styles.content}>
          <Card>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('ListCrop')}
            >
              <Text style={styles.cardIcon}>📝</Text>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                List New Crop
              </Text>
              <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                Add crops available for sale
              </Text>
            </TouchableOpacity>
          </Card>

          <Card>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('MyListings')}
            >
              <Text style={styles.cardIcon}>📦</Text>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                My Listings
              </Text>
              <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                View your active crop listings
              </Text>
            </TouchableOpacity>
          </Card>

          <Card>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('ActiveOrders')}
            >
              <Text style={styles.cardIcon}>🚚</Text>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Active Orders
              </Text>
              <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                Track your ongoing deliveries
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