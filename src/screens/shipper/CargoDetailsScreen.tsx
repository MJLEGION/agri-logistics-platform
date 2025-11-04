// src/screens/shipper/CargoDetailsScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Pressable, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { deleteCargo, updateCargo } from '../../store/slices/cargoSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';
import { useAppDispatch, useAppSelector } from '../../store';
import PaymentModal from '../../components/PaymentModal';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Divider from '../../components/Divider';
import Toast, { useToast } from '../../components/Toast';
import { useScreenAnimations } from '../../hooks/useScreenAnimations';

export default function CargoDetailsScreen({ route, navigation }: any) {
  const { cargoId } = route.params;
  const dispatch = useAppDispatch();
  const { cargo } = useAppSelector((state) => state.cargo);
  const { user } = useAppSelector((state) => state.auth);
  const { theme } = useTheme();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const { toast, showSuccess, showError, hideToast } = useToast();
  
  // ✨ Pizzazz Animations
  const animations = useScreenAnimations(5);
  
  const cargoItem = cargo.find(c => c._id === cargoId || c.id === cargoId);

  if (!cargoItem) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>Cargo not found</Text>
      </View>
    );
  }

  const handleDelete = () => {
    // Using confirm pattern - in a real app, you'd want a custom modal
    dispatch(deleteCargo(cargoItem._id || cargoItem.id || cargoId));
    showSuccess('Cargo deleted successfully!');
    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  };

  const calculateShippingFee = () => {
    // Use pre-calculated shipping cost from cargo, or fallback to legacy calculation
    if (cargoItem.shippingCost) {
      return cargoItem.shippingCost;
    }
    // Fallback for old cargo items
    const cargoValue = (cargoItem.quantity * (cargoItem.pricePerUnit || 0)) || 0;
    const fee = Math.max(cargoValue * 0.1, 5000);
    return Math.round(fee);
  };

  const handlePaymentSuccess = async (transactionId: string, referenceId: string) => {
    setIsPaymentLoading(true);
    try {
      // Update cargo status to 'payment_completed' and add payment details
      await dispatch(
        updateCargo({
          id: cargoItem._id || cargoItem.id,
          data: {
            status: 'payment_completed',
            paymentDetails: {
              transactionId,
              referenceId,
              amount: calculateShippingFee(),
              timestamp: new Date().toISOString(),
              method: 'flutterwave_momo',
            },
          },
        }) as any
      ).unwrap();

      setShowPaymentModal(false);
      showSuccess(`Payment successful! ${calculateShippingFee().toLocaleString()} RWF paid. Cargo ready for pickup!`);
      setTimeout(() => {
        navigation.navigate('MyCargo');
      }, 2000);
    } catch (error) {
      console.error('Error updating cargo:', error);
      showError('Payment successful, but issue updating cargo status. Please refresh.');
    } finally {
      setIsPaymentLoading(false);
    }
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

  const getStatusVariant = (status: string): 'primary' | 'success' | 'warning' | 'danger' | 'gray' => {
    switch (status) {
      case 'listed': return 'success';
      case 'payment_completed': return 'primary';
      case 'matched': return 'warning';
      case 'picked_up': return 'primary';
      case 'in_transit': return 'primary';
      case 'delivered': return 'success';
      default: return 'gray';
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
          {/* 🎉 Animated Cargo Name Card */}
          <Animated.View style={animations.getFloatingCardStyle(0)}>
            <Card>
              <Text style={[styles.cropName, { color: theme.text }]}>{cargoItem.name}</Text>
              <View style={{ alignItems: 'center', marginTop: 8 }}>
                <Badge
                  label={cargoItem.status.toUpperCase()}
                  variant={getStatusVariant(cargoItem.status)}
                  size="md"
                />
              </View>
            </Card>
          </Animated.View>

          <Divider spacing="sm" />

          <Card>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Quantity</Text>
            <Text style={[styles.detailText, { color: theme.text }]}>
              {cargoItem.quantity} {cargoItem.unit}
            </Text>
          </Card>

          <Divider spacing="sm" />

          {cargoItem.pricePerUnit && (
            <>
              <Card>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Price per Unit</Text>
                <Text style={[styles.detailText, { color: theme.text }]}>
                  {cargoItem.pricePerUnit} RWF/{cargoItem.unit}
                </Text>
                <Text style={[styles.totalPrice, { color: theme.success }]}>
                  Total Value: {(cargoItem.quantity * cargoItem.pricePerUnit).toLocaleString()} RWF
                </Text>
              </Card>
              <Divider spacing="sm" />
            </>
          )}

          <Card>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Ready Date</Text>
            <Text style={[styles.detailText, { color: theme.text }]}>{cargoItem.readyDate}</Text>
          </Card>

          <Divider spacing="sm" />

          <Card>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>📍 Origin Location</Text>
            <Text style={[styles.detailText, { color: theme.text }]}>{cargoItem.location.address}</Text>
            <Text style={[styles.coordinates, { color: theme.textSecondary }]}>
              {cargoItem.location.latitude.toFixed(4)}, {cargoItem.location.longitude.toFixed(4)}
            </Text>
          </Card>

          {cargoItem.destination && (
            <>
              <Divider spacing="sm" />
              <Card>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>📍 Destination Location</Text>
                <Text style={[styles.detailText, { color: theme.text }]}>{cargoItem.destination.address}</Text>
                <Text style={[styles.coordinates, { color: theme.textSecondary }]}>
                  {cargoItem.destination.latitude.toFixed(4)}, {cargoItem.destination.longitude.toFixed(4)}
                </Text>
              </Card>
            </>
          )}

          {cargoItem.distance && (
            <>
              <Divider spacing="sm" />
              <Card>
                <View style={styles.infoRow}>
                  <View style={styles.infoPart}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>📍 Distance</Text>
                    <Text style={[styles.detailText, { color: theme.text }]}>{cargoItem.distance.toFixed(1)} km</Text>
                  </View>
                  {cargoItem.eta && (
                    <View style={styles.infoPart}>
                      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>⏱️ Estimated Time</Text>
                      <Text style={[styles.detailText, { color: theme.text }]}>{cargoItem.eta} minutes</Text>
                    </View>
                  )}
                </View>
              </Card>
            </>
          )}

          {cargoItem.suggestedVehicle && (
            <>
              <Divider spacing="sm" />
              <Card>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>🚚 Suggested Vehicle</Text>
                <Text style={[styles.detailText, { color: theme.text }]}>{cargoItem.suggestedVehicle}</Text>
              </Card>
            </>
          )}

          <Divider spacing="md" />

          <View style={styles.actions}>
            {/* Payment Fee Display - Animated */}
            {cargoItem.status === 'listed' && (
              <Animated.View style={animations.getFloatingCardStyle(1)}>
                <View style={[styles.feeCard, { backgroundColor: '#F59E0B20', borderColor: '#F59E0B' }]}>
                  <View>
                    <Text style={[styles.feeLabel, { color: '#F59E0B' }]}>Shipping Fee</Text>
                    <Text style={[styles.feeAmount, { color: '#F59E0B' }]}>
                      {calculateShippingFee().toLocaleString()} RWF
                    </Text>
                  </View>
                  <Ionicons name="wallet" size={32} color="#F59E0B" />
                </View>
              </Animated.View>
            )}

            {/* Payment Button - 3D Tilt with Pulse */}
            {cargoItem.status === 'listed' && (
              <Animated.View
                style={animations.get3DTiltStyle(2, true)}
                {...animations.createTiltHandler(2).panHandlers}
              >
                <Pressable
                  onPressIn={() => animations.handlePressIn(2)}
                  onPressOut={() => animations.handlePressOut(2)}
                  onPress={() => setShowPaymentModal(true)}
                >
                  <Button
                    title={isPaymentLoading ? 'Processing...' : 'Pay for Shipping'}
                    onPress={() => setShowPaymentModal(true)}
                    variant="warning"
                    size="lg"
                    fullWidth
                    loading={isPaymentLoading}
                    disabled={isPaymentLoading}
                    icon={<Ionicons name="card" size={20} color="#fff" />}
                  />
                </Pressable>
              </Animated.View>
            )}

            {/* Status Badge for Paid Cargo */}
            {cargoItem.status !== 'listed' && (
              <View style={[styles.statusCard, { backgroundColor: '#10B98120', borderColor: '#10B981' }]}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={[styles.statusCardText, { color: '#10B981' }]}>
                  {cargoItem.status === 'payment_completed' ? 'Payment Complete - Ready for Pickup' : 'Cargo Processing'}
                </Text>
              </View>
            )}

            {/* Request Transport Button - 3D Tilt with Pulse */}
            {cargoItem.status === 'payment_completed' && (
              <Animated.View
                style={animations.get3DTiltStyle(3, true)}
                {...animations.createTiltHandler(3).panHandlers}
              >
                <Pressable
                  onPressIn={() => animations.handlePressIn(3)}
                  onPressOut={() => animations.handlePressOut(3)}
                  onPress={() => navigation.navigate('TransportRequest', { cargo: cargoItem })}
                >
                  <Button
                    title="Request Transport"
                    onPress={() => navigation.navigate('TransportRequest', { cargo: cargoItem })}
                    variant="primary"
                    size="lg"
                    fullWidth
                    icon={<Ionicons name="send" size={18} color="#fff" />}
                  />
                </Pressable>
              </Animated.View>
            )}

            {/* Edit Button - 3D Tilt */}
            <Animated.View
              style={animations.get3DTiltStyle(4, false)}
              {...animations.createTiltHandler(4).panHandlers}
            >
              <Pressable
                onPressIn={() => animations.handlePressIn(4)}
                onPressOut={() => animations.handlePressOut(4)}
                onPress={() => navigation.navigate('EditCargo', { cargoId: cargoItem._id || cargoItem.id || cargoId })}
              >
                <Button
                  title="Edit Cargo"
                  onPress={() => navigation.navigate('EditCargo', { cargoId: cargoItem._id || cargoItem.id || cargoId })}
                  variant="secondary"
                  size="lg"
                  fullWidth
                  icon={<Ionicons name="create-outline" size={20} color="#fff" />}
                />
              </Pressable>
            </Animated.View>

            {/* Delete Button */}
            <Button
              title="Delete Cargo"
              onPress={handleDelete}
              variant="danger"
              size="lg"
              fullWidth
              icon={<Ionicons name="trash-outline" size={20} color="#fff" />}
            />
          </View>
        </View>
      </ScrollView>

      {/* Payment Modal */}
      <PaymentModal
        visible={showPaymentModal}
        amount={calculateShippingFee()}
        orderId={`cargo_${cargoItem._id || cargoItem.id}`}
        userEmail={user?.email || 'user@example.com'}
        userName={user?.name || 'User'}
        purpose="shipping"
        onSuccess={handlePaymentSuccess}
        onCancel={() => setShowPaymentModal(false)}
      />

      {/* Toast Notifications */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  infoPart: {
    flex: 1,
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
  requestTransportButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  requestTransportButtonText: {
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
  feeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  feeLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  feeAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  paymentButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  statusCardText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});