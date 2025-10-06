// src/screens/buyer/BrowseCropsScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export default function BrowseCropsScreen({ navigation }: any) {
  const { crops } = useSelector((state: RootState) => state.crops);

  // Show only listed crops
  const availableCrops = crops.filter(crop => crop.status === 'listed');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Browse Crops</Text>
      </View>

      {availableCrops.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🌾</Text>
          <Text style={styles.emptyText}>No crops available</Text>
          <Text style={styles.emptySubtext}>
            Check back later for fresh produce
          </Text>
        </View>
      ) : (
        <FlatList
          data={availableCrops}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.cropCard}
              onPress={() => navigation.navigate('PlaceOrder', { crop: item })}
            >
              <View style={styles.cropHeader}>
                <Text style={styles.cropName}>{item.name}</Text>
                {item.pricePerUnit && (
                  <Text style={styles.price}>{item.pricePerUnit} RWF/{item.unit}</Text>
                )}
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Available:</Text>
                <Text style={styles.value}>{item.quantity} {item.unit}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Harvest Date:</Text>
                <Text style={styles.value}>{item.harvestDate}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Location:</Text>
                <Text style={styles.value}>{item.location.address}</Text>
              </View>

              <View style={styles.orderButton}>
                <Text style={styles.orderButtonText}>Place Order →</Text>
              </View>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF9800',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
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
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  list: {
    padding: 15,
  },
  cropCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
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
    color: '#333',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  orderButton: {
    marginTop: 10,
    backgroundColor: '#FF9800',
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