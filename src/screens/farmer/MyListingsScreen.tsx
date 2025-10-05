// src/screens/farmer/MyListingsScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export default function MyListingsScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const { crops } = useSelector((state: RootState) => state.crops);

  const myListings = crops.filter(crop => crop.farmerId === user?.id);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Listings</Text>
      </View>

      {myListings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>No crops listed yet</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('ListCrop')}
          >
            <Text style={styles.addButtonText}>+ List Your First Crop</Text>
          </TouchableOpacity>
        </View>
      ) : (
       <FlatList
          data={myListings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('CropDetails', { cropId: item.id })}>
              <View style={styles.cropCard}>
                <View style={styles.cropHeader}>
                  <Text style={styles.cropName}>{item.name}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.cropDetail}>
                  Quantity: {item.quantity} {item.unit}
                </Text>
                {item.pricePerUnit && (
                  <Text style={styles.cropDetail}>
                    Price: {item.pricePerUnit} RWF/{item.unit}
                  </Text>
                )}
                <Text style={styles.cropDetail}>
                  Harvest Date: {item.harvestDate}
                </Text>
                <Text style={styles.cropLocation}>📍 {item.location.address}</Text>
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
    backgroundColor: '#2E7D32',
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
    marginBottom: 30,
  },
  addButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    marginBottom: 10,
  },
  cropName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  cropDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  cropLocation: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
});