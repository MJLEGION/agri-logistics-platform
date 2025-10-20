// src/screens/farmer/MyListingsScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';
import { fetchCrops } from '../../store/slices/cropsSlice';
import { useAppDispatch, useAppSelector } from '../../store';

export default function MyListingsScreen({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const { crops, isLoading } = useAppSelector((state) => state.crops);
  const { theme } = useTheme();
  const dispatch = useAppDispatch();

  // Fetch crops on screen mount
  useEffect(() => {
    dispatch(fetchCrops());
  }, [dispatch]);

  // Refetch crops when screen comes into focus (after creating a new crop)
  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchCrops());
    }, [dispatch])
  );

  const myListings = crops.filter(crop => {
    const farmerId = typeof crop.farmerId === 'string' ? crop.farmerId : crop.farmerId?._id;
    return farmerId === user?._id || farmerId === user?.id;
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: theme.card }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.card }]}>My Listings</Text>
      </View>

      {myListings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={[styles.emptyText, { color: theme.text }]}>No crops listed yet</Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('ListCrop')}
          >
            <Text style={styles.addButtonText}>+ List Your First Crop</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={myListings}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('CropDetails', { cropId: item._id || item.id })}>
              <Card>
                <View style={styles.cropHeader}>
                  <Text style={[styles.cropName, { color: theme.text }]}>{item.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: theme.info + '20' }]}>
                    <Text style={[styles.statusText, { color: theme.info }]}>{item.status}</Text>
                  </View>
                </View>
                <Text style={[styles.cropDetail, { color: theme.textSecondary }]}>
                  Quantity: {item.quantity} {item.unit}
                </Text>
                {item.pricePerUnit && (
                  <Text style={[styles.cropDetail, { color: theme.textSecondary }]}>
                    Price: {item.pricePerUnit} RWF/{item.unit}
                  </Text>
                )}
                <Text style={[styles.cropDetail, { color: theme.textSecondary }]}>
                  Harvest Date: {new Date(item.harvestDate).toLocaleDateString()}
                </Text>
                <Text style={[styles.cropLocation, { color: theme.textSecondary }]}>
                  📍 {item.location.address}
                </Text>
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
    marginBottom: 30,
  },
  addButton: {
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
  cropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cropName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cropDetail: {
    fontSize: 14,
    marginBottom: 5,
  },
  cropLocation: {
    fontSize: 12,
    marginTop: 5,
  },
});