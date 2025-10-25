// src/screens/shipper/CargoDetailsScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { deleteCargo } from '../../store/slices/cargoSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';
import { useAppDispatch, useAppSelector } from '../../store';

export default function CargoDetailsScreen({ route, navigation }: any) {
  const { cargoId } = route.params;
  const dispatch = useAppDispatch();
  const { cargo } = useAppSelector((state) => state.cargo);
  const { theme } = useTheme();
  
  const cargoItem = cargo.find(c => c._id === cargoId || c.id === cargoId);

  if (!cargoItem) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>Cargo not found</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Cargo',
      'Are you sure you want to delete this cargo listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteCargo(cargoItem._id || cargoItem.id || cargoId));
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
          <Text style={[styles.title, { color: theme.card }]}>Cargo Details</Text>
        </View>

        <View style={styles.content}>
          <Card>
            <Text style={[styles.cropName, { color: theme.text }]}>{cargoItem.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(cargoItem.status) }]}>
              <Text style={styles.statusText}>{cargoItem.status.toUpperCase()}</Text>
            </View>
          </Card>

          <Card>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Quantity</Text>
            <Text style={[styles.detailText, { color: theme.text }]}>
              {cargoItem.quantity} {cargoItem.unit}
            </Text>
          </Card>

          {cargoItem.pricePerUnit && (
            <Card>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Price per Unit</Text>
              <Text style={[styles.detailText, { color: theme.text }]}>
                {cargoItem.pricePerUnit} RWF/{cargoItem.unit}
              </Text>
              <Text style={[styles.totalPrice, { color: theme.success }]}>
                Total Value: {(cargoItem.quantity * cargoItem.pricePerUnit).toLocaleString()} RWF
              </Text>
            </Card>
          )}

          <Card>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Ready Date</Text>
            <Text style={[styles.detailText, { color: theme.text }]}>{cargoItem.readyDate}</Text>
          </Card>

          <Card>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Location</Text>
            <Text style={[styles.detailText, { color: theme.text }]}>{cargoItem.location.address}</Text>
            <Text style={[styles.coordinates, { color: theme.textSecondary }]}>
              {cargoItem.location.latitude.toFixed(4)}, {cargoItem.location.longitude.toFixed(4)}
            </Text>
          </Card>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: theme.info }]}
              onPress={() => navigation.navigate('EditCargo', { cargoId: cargoItem._id || cargoItem.id || cargoId })}
            >
              <Text style={styles.editButtonText}>Edit Cargo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.deleteButton, { 
                backgroundColor: theme.card,
                borderColor: theme.error,
              }]}
              onPress={handleDelete}
            >
              <Text style={[styles.deleteButtonText, { color: theme.error }]}>Delete Cargo</Text>
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