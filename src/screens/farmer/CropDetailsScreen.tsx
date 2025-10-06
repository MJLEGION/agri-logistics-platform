// src/screens/farmer/CropDetailsScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { deleteCrop } from '../../store/slices/cropsSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';

export default function CropDetailsScreen({ route, navigation }: any) {
  const { cropId } = route.params;
  const dispatch = useDispatch();
  const { crops } = useSelector((state: RootState) => state.crops);
  const { theme } = useTheme();
  
  const crop = crops.find(c => c.id === cropId);

  if (!crop) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>Crop not found</Text>
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
      case 'listed': return theme.success;
      case 'matched': return theme.warning;
      case 'picked_up': return theme.info;
      case 'in_transit': return theme.tertiary;
      case 'delivered': return theme.textSecondary;
      default: return theme.textSecondary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.card }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.card }]}>Crop Details</Text>
        </View>

        <View style={styles.content}>
          <Card>
            <Text style={[styles.cropName, { color: theme.text }]}>{crop.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(crop.status) }]}>
              <Text style={styles.statusText}>{crop.status.toUpperCase()}</Text>
            </View>
          </Card>

          <Card>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Quantity</Text>
            <Text style={[styles.detailText, { color: theme.text }]}>
              {crop.quantity} {crop.unit}
            </Text>
          </Card>

          {crop.pricePerUnit && (
            <Card>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Price per Unit</Text>
              <Text style={[styles.detailText, { color: theme.text }]}>
                {crop.pricePerUnit} RWF/{crop.unit}
              </Text>
              <Text style={[styles.totalPrice, { color: theme.success }]}>
                Total Value: {(crop.quantity * crop.pricePerUnit).toLocaleString()} RWF
              </Text>
            </Card>
          )}

          <Card>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Harvest Date</Text>
            <Text style={[styles.detailText, { color: theme.text }]}>{crop.harvestDate}</Text>
          </Card>

          <Card>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Location</Text>
            <Text style={[styles.detailText, { color: theme.text }]}>{crop.location.address}</Text>
            <Text style={[styles.coordinates, { color: theme.textSecondary }]}>
              {crop.location.latitude.toFixed(4)}, {crop.location.longitude.toFixed(4)}
            </Text>
          </Card>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: theme.info }]}
              onPress={() => navigation.navigate('EditCrop', { cropId })}
            >
              <Text style={styles.editButtonText}>Edit Crop</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.deleteButton, { 
                backgroundColor: theme.card,
                borderColor: theme.error,
              }]}
              onPress={handleDelete}
            >
              <Text style={[styles.deleteButtonText, { color: theme.error }]}>Delete Crop</Text>
            </TouchableOpacity>
          </View>
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
  },
  backButton: {
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 15,
  },
  cropName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '600',
  },
  detailText: {
    fontSize: 18,
    fontWeight: '500',
  },
  totalPrice: {
    fontSize: 16,
    marginTop: 5,
    fontWeight: 'bold',
  },
  coordinates: {
    fontSize: 12,
    marginTop: 5,
  },
  actions: {
    marginTop: 20,
  },
  editButton: {
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
    borderWidth: 2,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});