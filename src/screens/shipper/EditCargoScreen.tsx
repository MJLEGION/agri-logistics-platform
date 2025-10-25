// src/screens/shipper/EditCargoScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { updateCargo } from '../../store/slices/cargoSlice';
import { Cargo } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store';

export default function EditCargoScreen({ route, navigation }: any) {
  const { cargoId } = route.params;
  const dispatch = useAppDispatch();
  const { cargo } = useAppSelector((state) => state.cargo);
  const { theme } = useTheme();
  
  const cargoItem = cargo.find(c => c._id === cargoId || c.id === cargoId);

  const [cargoName, setCargoName] = useState(cargoItem?.name || '');
  const [quantity, setQuantity] = useState(cargoItem?.quantity.toString() || '');
  const [unit, setUnit] = useState<'kg' | 'tons' | 'bags'>(cargoItem?.unit || 'kg');
  const [pricePerUnit, setPricePerUnit] = useState(cargoItem?.pricePerUnit?.toString() || '');
  const [readyDate, setReadyDate] = useState(cargoItem?.readyDate || '');

  if (!cargoItem) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>Cargo not found</Text>
      </View>
    );
  }

  const handleUpdate = async () => {
    if (!cargoName || !quantity || !readyDate) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const cargoData = {
      id: cargoItem._id || cargoItem.id,
      data: {
        name: cargoName,
        quantity: parseFloat(quantity),
        unit,
        pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit) : undefined,
        readyDate,
      }
    };

    try {
      await dispatch(updateCargo(cargoData)).unwrap();
      Alert.alert('Success', 'Cargo updated successfully!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to update cargo');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        <View style={[styles.header, { backgroundColor: theme.info }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.card }]}>← Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.card }]}>Edit Cargo</Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: theme.text }]}>Cargo Name *</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.card,
              borderColor: theme.border,
              color: theme.text,
            }]}
            placeholder="e.g., Tomatoes, Maize, Potatoes"
            placeholderTextColor={theme.textSecondary}
            value={cargoName}
            onChangeText={setCargoName}
          />

          <Text style={[styles.label, { color: theme.text }]}>Quantity *</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.quantityInput, { 
                backgroundColor: theme.card,
                borderColor: theme.border,
                color: theme.text,
              }]}
              placeholder="0"
              placeholderTextColor={theme.textSecondary}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
            <View style={styles.unitSelector}>
              {(['kg', 'tons', 'bags'] as const).map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[
                    styles.unitButton,
                    { 
                      backgroundColor: unit === u ? theme.info : theme.card,
                      borderColor: theme.border,
                    }
                  ]}
                  onPress={() => setUnit(u)}
                >
                  <Text style={[
                    styles.unitText,
                    { color: unit === u ? theme.card : theme.text }
                  ]}>
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={[styles.label, { color: theme.text }]}>Price per Unit (RWF)</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.card,
              borderColor: theme.border,
              color: theme.text,
            }]}
            placeholder="Optional"
            placeholderTextColor={theme.textSecondary}
            value={pricePerUnit}
            onChangeText={setPricePerUnit}
            keyboardType="numeric"
          />

          <Text style={[styles.label, { color: theme.text }]}>Ready Date *</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.card,
              borderColor: theme.border,
              color: theme.text,
            }]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.textSecondary}
            value={readyDate}
            onChangeText={setReadyDate}
          />

          <Text style={[styles.hint, { color: theme.textSecondary }]}>* Required fields</Text>

          <TouchableOpacity 
            style={[styles.updateButton, { backgroundColor: theme.info }]} 
            onPress={handleUpdate}
          >
            <Text style={styles.updateText}>Update Crop</Text>
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
  },
  backButton: {
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
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
  },
  unitText: {
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    marginTop: 10,
  },
  updateButton: {
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
    textAlign: 'center',
    marginTop: 50,
  },
});