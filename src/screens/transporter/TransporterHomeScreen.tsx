// src/screens/transporter/TransporterHomeScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export default function TransporterHomeScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        <View style={[styles.header, { backgroundColor: theme.tertiary }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.greeting, { color: theme.card }]}>
                Welcome, {user?.name}!
              </Text>
              <Text style={[styles.role, { color: theme.card, opacity: 0.8 }]}>
                Transporter Dashboard
              </Text>
            </View>
            <ThemeToggle />
          </View>
        </View>

        <View style={styles.content}>
          <Card>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('AvailableLoads')}
            >
              <Text style={styles.cardIcon}>📍</Text>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Available Loads
              </Text>
              <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                Find crops near you to transport
              </Text>
            </TouchableOpacity>
          </Card>

          <Card>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => alert('Route optimization feature coming soon!')}
            >
              <Text style={styles.cardIcon}>🗺️</Text>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Optimize Route
              </Text>
              <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                Get best delivery routes
              </Text>
            </TouchableOpacity>
          </Card>

          <Card>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('ActiveTrips')}
            >
              <Text style={styles.cardIcon}>🚛</Text>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Active Trips
              </Text>
              <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                Manage ongoing deliveries
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