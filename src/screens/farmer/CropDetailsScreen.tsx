// src/screens/farmer/CropDetailsScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { deleteCrop } from '../../store/slices/cropsSlice';


export default function CropDetailsScreen({ route, navigation }: any) {
  const { cropId } = route.params;
  const dispatch = useDispatch();
  const { crops } = useSelector((state: RootState) => state.crops);
  
  const crop = crops.find(c => c.id === cropId);

  if (!crop) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Crop not found</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Crop',
      'Are you sure you want to delete this crop listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteCrop(cropId));
            navigation.goBack();
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'listed': return '#4CAF50';
      case 'matched': return '#FF9800';
      case 'picked_up': return '#2196F3';
      case 'in_transit': return '#9C27B0';
      case 'delivered': return '#607D8B';
      default: return '#666';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Crop Details</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.mainCard}>
          <Text style={styles.cropName}>{crop.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(crop.status) }]}>
            <Text style={styles.statusText}>{crop.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <Text style={styles.detailText}>{crop.quantity} {crop.unit}</Text>
        </View>

        {crop.pricePerUnit && (
          <View style={styles.detailCard}>
            <Text style={styles.sectionTitle}>Price per Unit</Text>
            <Text style={styles.detailText}>{crop.pricePerUnit} RWF/{crop.unit}</Text>
            <Text style={styles.totalPrice}>
              Total Value: {(crop.quantity * crop.pricePerUnit).toLocaleString()} RWF
            </Text>
          </View>
        )}

        <View style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Harvest Date</Text>
          <Text style={styles.detailText}>{crop.harvestDate}</Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.detailText}>{crop.location.address}</Text>
          <Text style={styles.coordinates}>
            {crop.location.latitude.toFixed(4)}, {crop.location.longitude.toFixed(4)}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditCrop', { cropId })}
          >
            <Text style={styles.editButtonText}>Edit Crop</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>Delete Crop</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  content: {
    padding: 15,
  },
  mainCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  cropName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  detailCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontWeight: '600',
  },
  detailText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  totalPrice: {
    fontSize: 16,
    color: '#2E7D32',
    marginTop: 5,
    fontWeight: 'bold',
  },
  coordinates: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  actions: {
    marginTop: 20,
  },
  editButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#f44336',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
});