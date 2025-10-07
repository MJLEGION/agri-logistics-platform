// src/screens/buyer/PlaceOrderScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { addOrder } from '../../store/slices/ordersSlice';
import { Order } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';
import { createOrder } from '../../store/slices/ordersSlice';

export default function PlaceOrderScreen({ route, navigation }: any) {
  const { crop } = route.params;
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { theme } = useTheme();

  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<'kg' | 'tons' | 'bags'>(crop.unit);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const convertQuantity = () => {
    if (!quantity) return 0;
    const qty = parseFloat(quantity);
    
    if (unit === crop.unit) return qty;
    
    if (crop.unit === 'kg') {
      if (unit === 'tons') return qty * 1000;
      if (unit === 'bags') return qty * 50;
    }
    if (crop.unit === 'tons') {
      if (unit === 'kg') return qty / 1000;
      if (unit === 'bags') return qty * 0.05;
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

 const handlePlaceOrder = async () => {
  if (!quantity || !deliveryAddress) {
    alert('Please fill all fields');
    return;
  }

  const convertedQty = convertQuantity();
  if (convertedQty > crop.quantity) {
    alert(`Only ${crop.quantity} ${crop.unit} available`);
    return;
  }

  const orderData = {
    cropId: crop._id || crop.id,
    quantity: convertedQty,
    totalPrice: calculateTotal(),
    pickupLocation: crop.location,
    deliveryLocation: {
      latitude: -1.9500,
      longitude: 30.0588,
      address: deliveryAddress,
    },
  };

  try {
    await dispatch(createOrder(orderData)).unwrap();
    alert('Order placed successfully!');
    navigation.navigate('Home');
  } catch (error: any) {
    alert(error || 'Failed to place order');
  }
};

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        <View style={[styles.header, { backgroundColor: theme.secondary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.card }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.card }]}>Place Order</Text>
        </View>

        <View style={styles.content}>
          <Card style={[styles.cropInfo, { backgroundColor: theme.secondary + '20' }]}>
            <Text style={[styles.cropName, { color: theme.text }]}>{crop.name}</Text>
            <Text style={[styles.availableText, { color: theme.textSecondary }]}>
              Available: {crop.quantity} {crop.unit}
            </Text>
            {crop.pricePerUnit && (
              <Text style={[styles.priceText, { color: theme.secondary }]}>
                {crop.pricePerUnit} RWF/{crop.unit}
              </Text>
            )}
          </Card>

          <View style={styles.form}>
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
                        backgroundColor: unit === u ? theme.secondary : theme.card,
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

            <Text style={[styles.label, { color: theme.text }]}>Delivery Address *</Text>
            <TextInput
              style={[styles.input, styles.textArea, { 
                backgroundColor: theme.card,
                borderColor: theme.border,
                color: theme.text,
              }]}
              placeholder="Enter delivery address"
              placeholderTextColor={theme.textSecondary}
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              multiline
              numberOfLines={3}
            />

            <Card style={[styles.pickupInfo, { backgroundColor: theme.info + '20' }]}>
              <Text style={[styles.pickupLabel, { color: theme.textSecondary }]}>
                Pickup Location:
              </Text>
              <Text style={[styles.pickupText, { color: theme.text }]}>
                {crop.location.address}
              </Text>
            </Card>

            {quantity && crop.pricePerUnit && (
              <Card style={[styles.totalCard, { backgroundColor: theme.success + '20' }]}>
                <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
                  Total Amount:
                </Text>
                <Text style={[styles.totalAmount, { color: theme.success }]}>
                  {calculateTotal().toLocaleString()} RWF
                </Text>
              </Card>
            )}

            <TouchableOpacity 
              style={[styles.orderButton, { backgroundColor: theme.secondary }]} 
              onPress={handlePlaceOrder}
            >
              <Text style={styles.orderButtonText}>Confirm Order</Text>
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
  cropInfo: {
    padding: 20,
    alignItems: 'center',
  },
  cropName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  availableText: {
    fontSize: 16,
    marginBottom: 4,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  form: {
    marginTop: 15,
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
    fontSize: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickupInfo: {
    marginTop: 15,
    padding: 12,
  },
  pickupLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  pickupText: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalCard: {
    marginTop: 20,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  orderButton: {
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