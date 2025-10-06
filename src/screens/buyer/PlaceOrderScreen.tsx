// src/screens/buyer/PlaceOrderScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { addOrder } from '../../store/slices/ordersSlice';
import { Order } from '../../types';

export default function PlaceOrderScreen({ route, navigation }: any) {
  const { crop } = route.params;
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<'kg' | 'tons' | 'bags'>(crop.unit);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const convertQuantity = () => {
    if (!quantity) return 0;
    const qty = parseFloat(quantity);
    
    // Convert to crop's base unit for comparison
    if (unit === crop.unit) return qty;
    
    // Conversion logic
    if (crop.unit === 'kg') {
      if (unit === 'tons') return qty * 1000;
      if (unit === 'bags') return qty * 50; // 1 bag = 50kg
    }
    if (crop.unit === 'tons') {
      if (unit === 'kg') return qty / 1000;
      if (unit === 'bags') return qty * 0.05; // 1 bag = 0.05 tons
    }
    if (crop.unit === 'bags') {
      if (unit === 'kg') return qty / 50;
      if (unit === 'tons') return qty / 0.05;
    }
    return qty;
  };

  const calculateTotal = () => {
    if (!quantity || !crop.pricePerUnit) return 0;
    return convertQuantity() * crop.pricePerUnit;
  };

  const handlePlaceOrder = () => {
    if (!quantity || !deliveryAddress) {
      alert('Please fill all fields');
      return;
    }

    const convertedQty = convertQuantity();
    if (convertedQty > crop.quantity) {
      alert(`Only ${crop.quantity} ${crop.unit} available`);
      return;
    }

    const newOrder: Order = {
      id: Date.now().toString(),
      cropId: crop.id,
      farmerId: crop.farmerId,
      buyerId: user?.id || '',
      quantity: convertedQty,
      totalPrice: calculateTotal(),
      status: 'accepted',
      pickupLocation: crop.location,
      deliveryLocation: {
        latitude: -1.9500,
        longitude: 30.0588,
        address: deliveryAddress,
      },
    };

    dispatch(addOrder(newOrder));
    alert('Order placed successfully!');
    navigation.navigate('Home');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Place Order</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.cropInfo}>
          <Text style={styles.cropName}>{crop.name}</Text>
          <Text style={styles.availableText}>
            Available: {crop.quantity} {crop.unit}
          </Text>
          {crop.pricePerUnit && (
            <Text style={styles.priceText}>
              {crop.pricePerUnit} RWF/{crop.unit}
            </Text>
          )}
        </View>

        <View style={styles.form}>
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

          <Text style={styles.label}>Delivery Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter delivery address"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            multiline
            numberOfLines={3}
          />

          <View style={styles.pickupInfo}>
            <Text style={styles.pickupLabel}>Pickup Location:</Text>
            <Text style={styles.pickupText}>{crop.location.address}</Text>
          </View>

          {quantity && crop.pricePerUnit && (
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalAmount}>
                {calculateTotal().toLocaleString()} RWF
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.orderButton} onPress={handlePlaceOrder}>
            <Text style={styles.orderButtonText}>Confirm Order</Text>
          </TouchableOpacity>
        </View>
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
  content: {
    padding: 15,
  },
  cropInfo: {
    backgroundColor: '#FFF3E0',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  cropName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  availableText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  form: {
    backgroundColor: '#fff',
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
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  unitText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 12,
  },
  unitTextActive: {
    color: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickupInfo: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  pickupLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  pickupText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  totalCard: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  orderButton: {
    backgroundColor: '#FF9800',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});