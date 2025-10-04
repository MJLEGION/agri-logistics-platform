// src/screens/farmer/ListCropScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { addCrop } from '../../store/slices/cropsSlice';
import { Crop } from '../../types';

export default function ListCropScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [cropName, setCropName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<'kg' | 'tons' | 'bags'>('kg');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [harvestDate, setHarvestDate] = useState('');

  const handleSubmit = () => {
    if (!cropName || !quantity || !harvestDate) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const newCrop: Crop = {
      id: Date.now().toString(),
      farmerId: user?.id || '',
      name: cropName,
      quantity: parseFloat(quantity),
      unit,
      harvestDate,
      location: {
        latitude: -1.9403, // Mock location - Kigali
        longitude: 29.8739,
        address: 'Kigali, Rwanda',
      },
      status: 'listed',
      pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit) : undefined,
    };

    dispatch(addCrop(newCrop));
    Alert.alert('Success', 'Crop listed successfully!');
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>List New Crop</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Crop Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Tomatoes, Maize, Potatoes"
          value={cropName}
          onChangeText={setCropName}
        />

        <Text style={styles.label}>Quantity *</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.quantityInput]}
            placeholder="0"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />
          <View style={styles.unitSelector}>
            {(['kg', 'tons', 'bags'] as const).map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.unitButton, unit === u && styles.unitButtonActive]}
                onPress={() => setUnit(u)}
              >
                <Text style={[styles.unitText, unit === u && styles.unitTextActive]}>
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.label}>Price per Unit (RWF)</Text>
        <TextInput
          style={styles.input}
          placeholder="Optional"
          value={pricePerUnit}
          onChangeText={setPricePerUnit}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Harvest Date *</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={harvestDate}
          onChangeText={setHarvestDate}
        />

        <Text style={styles.hint}>* Required fields</Text>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>List Crop</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  quantityInput: {
    flex: 1,
  },
  unitSelector: {
    flexDirection: 'row',
    gap: 5,
  },
  unitButton: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  unitButtonActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  unitText: {
    color: '#666',
    fontWeight: '600',
  },
  unitTextActive: {
    color: '#fff',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});