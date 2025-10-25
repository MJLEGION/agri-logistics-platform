// src/screens/shipper/ListCargoScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { createCargo } from '../../store/slices/cargoSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store';

export default function ListCargoScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { isLoading } = useAppSelector((state) => state.cargo);
  const { theme } = useTheme();
  
  const [cargoName, setCargoName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<'kg' | 'tons' | 'bags'>('kg');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [readyDate, setReadyDate] = useState('');

  const handleSubmit = async () => {
    if (!cargoName || !quantity || !readyDate) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const cargoData = {
      name: cargoName,
      quantity: parseFloat(quantity),
      unit,
      pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit) : undefined,
      readyDate,
      shipperId: user?._id || user?.id,
      location: {
        latitude: -1.9403,
        longitude: 29.8739,
        address: 'Kigali, Rwanda',
      },
    };

    try {
      await dispatch(createCargo(cargoData)).unwrap();
      Alert.alert('Success', 'Cargo listed successfully!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to list cargo');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.card }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.card }]}>List New Cargo</Text>
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
                      backgroundColor: unit === u ? theme.primary : theme.card,
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
            style={[styles.submitButton, { backgroundColor: theme.primary }]} 
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>List Cargo</Text>
            )}
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
  submitButton: {
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