// src/screens/buyer/PlaceOrderScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createOrder, addTestOrder } from '../../store/slices/ordersSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';
import { useAppDispatch, useAppSelector } from '../../store';
import { MomoPaymentModal } from '../../components/MomoPaymentModal';
import { checkConnectivity, saveToOfflineQueue, saveOrderLocally } from '../../services/offlineService';
import { notifyOrderCreated } from '../../services/smsService';
import mockOrderService from '../../services/mockOrderService';

export default function PlaceOrderScreen({ route, navigation }: any) {
  const { crop } = route.params;
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { theme } = useTheme();

  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<'kg' | 'tons' | 'bags'>(crop.unit);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingOrderData, setPendingOrderData] = useState<any>(null);

  useEffect(() => {
    checkConnectivity().then(setIsOnline);
  }, []);

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
      Alert.alert('Missing Information', 'Please fill all fields');
      return;
    }

    const convertedQty = convertQuantity();
    if (convertedQty > crop.quantity) {
      Alert.alert('Insufficient Stock', `Only ${crop.quantity} ${crop.unit} available`);
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

    // Check if online
    const online = await checkConnectivity();
    setIsOnline(online);

    if (!online) {
      // Offline mode: Save to queue
      Alert.alert(
        'Offline Mode',
        'You are offline. Your order will be saved and submitted when you reconnect.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save Offline',
            onPress: async () => {
              try {
                const offlineId = await saveToOfflineQueue('order', orderData);
                await saveOrderLocally({ ...orderData, _offlineId: offlineId, status: 'pending_sync' });
                Alert.alert(
                  'Order Saved',
                  'Your order has been saved and will be submitted when you reconnect to the internet.',
                  [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
                );
              } catch (error) {
                Alert.alert('Error', 'Failed to save order offline');
              }
            },
          },
        ]
      );
      return;
    }

    // Online mode: Show payment modal
    setPendingOrderData(orderData);
    setPaymentModalVisible(true);
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    console.log('=== PAYMENT SUCCESSFUL ===');
    console.log('Transaction ID:', transactionId);

    try {
      // Create order with payment info
      const orderDataWithPayment = {
        ...pendingOrderData,
        paymentMethod: 'momo',
        paymentStatus: 'completed',
        transactionId,
      };

      const result = await dispatch(createOrder(orderDataWithPayment)).unwrap();
      console.log('ORDER CREATED SUCCESSFULLY:', JSON.stringify(result, null, 2));

      // Send SMS notification
      if (user?.phone) {
        await notifyOrderCreated(user.phone, {
          orderId: result._id || result.id,
          cropName: crop.name,
          quantity: pendingOrderData.quantity,
          totalPrice: pendingOrderData.totalPrice,
        });
      }

      Alert.alert(
        'Success! 🎉',
        'Your order has been placed successfully. You will receive an SMS confirmation shortly.',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error: any) {
      console.log('ORDER CREATION FAILED:', error);
      Alert.alert('Error', error || 'Failed to place order');
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    Alert.alert('Payment Failed', error);
  };

  const handleSkipPayment = async () => {
    console.log('🧪 TEST BUTTON PRESSED');
    
    if (!quantity || !deliveryAddress) {
      Alert.alert('Missing Information', 'Please fill all fields');
      return;
    }
    
    const convertedQty = convertQuantity();
    if (convertedQty > crop.quantity) {
      Alert.alert('Insufficient Stock', `Only ${crop.quantity} ${crop.unit} available`);
      return;
    }
    
    try {
      // Generate unique order ID
      const orderId = 'TEST_ORDER_' + Date.now();
      
      const newOrder: any = {
        _id: orderId,
        id: orderId,
        buyerId: user?._id || user?.id || '2',
        farmerId: crop?.farmerId || '1',
        cropId: {
          _id: crop._id || crop.id,
          id: crop._id || crop.id,
          name: crop.name,
        },
        quantity: convertedQty,
        unit: crop.unit,
        totalPrice: calculateTotal(),
        status: 'pending',
        pickupLocation: crop.location,
        deliveryLocation: {
          latitude: -1.9500,
          longitude: 30.0588,
          address: deliveryAddress,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      console.log('🧪 TEST: Creating order:', newOrder);
      
      // Save to mock service (which saves to AsyncStorage)
      await mockOrderService.createOrder(newOrder);
      console.log('✅ TEST: Order saved to storage successfully');
      
      // Also add to Redux for immediate display
      dispatch(addTestOrder(newOrder));
      console.log('📍 Navigate to Home now!');
      
      // Navigate to Home after a short delay
      setTimeout(() => {
        navigation.navigate('Home');
      }, 500);
    } catch (error: any) {
      console.error('❌ ERROR:', error);
      Alert.alert('Error', `Failed: ${error?.message || 'Unknown error'}`);
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

        {/* Offline Indicator */}
        {!isOnline && (
          <View style={[styles.offlineBanner, { backgroundColor: theme.warning }]}>
            <Ionicons name="cloud-offline-outline" size={20} color="#FFF" />
            <Text style={styles.offlineText}>
              You are offline. Orders will be saved and synced when connected.
            </Text>
          </View>
        )}

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
              <Ionicons name={isOnline ? "card-outline" : "save-outline"} size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.orderButtonText}>
                {isOnline ? 'Proceed to Payment' : 'Save Order (Offline)'}
              </Text>
            </TouchableOpacity>

            {/* Test Mode: Skip Payment Button */}
            {isOnline && (
              <TouchableOpacity 
                activeOpacity={0.7}
                style={[styles.testButton, { backgroundColor: theme.warning }]} 
                onPress={handleSkipPayment}
              >
                <Ionicons name="flash-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.testButtonText}>⚡ Skip Payment (TEST)</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Mobile Money Payment Modal */}
      <MomoPaymentModal
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        amount={calculateTotal()}
        orderId={pendingOrderData?.cropId || 'temp'}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
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
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testButton: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  offlineText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});