// src/screens/farmer/EditCropScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { updateCrop } from '../../store/slices/cropsSlice';
import { Crop } from '../../types';

export default function EditCropScreen({ route, navigation }: any) {
  const { cropId } = route.params;
  const dispatch = useDispatch();
  const { crops } = useSelector((state: RootState) => state.crops);
  
  const crop = crops.find(c => c.id === cropId);

  const [cropName, setCropName] = useState(crop?.name || '');
  const [quantity, setQuantity] = useState(crop?.quantity.toString() || '');
  const [unit, setUnit] = useState<'kg' | 'tons' | 'bags'>(crop?.unit || 'kg');
  const [pricePerUnit, setPricePerUnit] = useState(crop?.pricePerUnit?.toString() || '');
  const [harvestDate, setHarvestDate] = useState(crop?.harvestDate || '');

  if (!crop) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Crop not found</Text>
      </View>
    );
  }

  const handleUpdate = () => {
    if (!cropName || !quantity || !harvestDate) {
      alert('Please fill all required fields');
      return;
    }

    const updatedCrop: Crop = {
      ...crop,
      name: cropName,
      quantity: parseFloat(quantity),
      unit,
      harvestDate,
      pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit) : undefined,
    };

    dispatch(updateCrop(updatedCrop));
    alert('Crop updated successfully!');
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Crop</Text>
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

        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
          <Text style={styles.updateText}>Update Crop</Text>
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
    backgroundColor: '#2196F3',
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
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
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
  updateButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  updateText: {
    color: '#fff',
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