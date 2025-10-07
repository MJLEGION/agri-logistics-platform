// src/screens/buyer/BrowseCropsScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';
import { fetchCrops } from '../../store/slices/cropsSlice';
import { useAppDispatch, useAppSelector } from '../../store';

export default function BrowseCropsScreen({ navigation }: any) {
  const { crops, isLoading } = useAppSelector((state) => state.crops);
  const { theme } = useTheme();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchCrops());
  }, [dispatch]);

  const availableCrops = crops.filter(crop => crop.status === 'listed');

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.secondary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.secondary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: theme.card }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.card }]}>Browse Crops</Text>
      </View>

      {availableCrops.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🌾</Text>
          <Text style={[styles.emptyText, { color: theme.text }]}>No crops available</Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Check back later for fresh produce
          </Text>
        </View>
      ) : (
        <FlatList
          data={availableCrops}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('PlaceOrder', { crop: item })}>
              <Card>
                <View style={styles.cropHeader}>
                  <Text style={[styles.cropName, { color: theme.text }]}>{item.name}</Text>
                  {item.pricePerUnit && (
                    <Text style={[styles.price, { color: theme.secondary }]}>
                      {item.pricePerUnit} RWF/{item.unit}
                    </Text>
                  )}
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Available:</Text>
                  <Text style={[styles.value, { color: theme.text }]}>
                    {item.quantity} {item.unit}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Harvest Date:</Text>
                  <Text style={[styles.value, { color: theme.text }]}>
                    {new Date(item.harvestDate).toLocaleDateString()}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Location:</Text>
                  <Text style={[styles.value, { color: theme.text }]}>{item.location.address}</Text>
                </View>

                <View style={[styles.orderButton, { backgroundColor: theme.secondary }]}>
                  <Text style={styles.orderButtonText}>Place Order →</Text>
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
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
  },
  backButton: {
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
  },
  list: {
    padding: 15,
  },
  cropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cropName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});