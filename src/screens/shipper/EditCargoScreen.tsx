// src/screens/shipper/EditCargoScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Animated, Pressable, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateCargo } from '../../store/slices/cargoSlice';
import { fetchAddresses } from '../../store/slices/addressSlice';
import { Cargo } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store';
import { useScreenAnimations } from '../../hooks/useScreenAnimations';
import { SavedAddress } from '../../services/addressService';
import Badge from '../../components/Badge';
import { showToast } from '../../services/toastService';

export default function EditCargoScreen({ route, navigation }: any) {
  const { cargoId } = route.params;
  const dispatch = useAppDispatch();
  const { cargo } = useAppSelector((state) => state.cargo);
  const { user } = useAppSelector((state) => state.auth);
  const { addresses } = useAppSelector((state) => state.address);
  const { theme } = useTheme();
  const animations = useScreenAnimations(4); // ✨ Pizzazz animations
  
  const cargoItem = cargo.find(c => c._id === cargoId || c.id === cargoId);

  const [cargoName, setCargoName] = useState(cargoItem?.name || '');
  const [quantity, setQuantity] = useState(cargoItem?.quantity.toString() || '');
  const [unit, setUnit] = useState<'kg' | 'tons' | 'bags'>(cargoItem?.unit || 'kg');
  const [pricePerUnit, setPricePerUnit] = useState(cargoItem?.pricePerUnit?.toString() || '');
  const [readyDate, setReadyDate] = useState(cargoItem?.readyDate || '');
  const [selectedDestination, setSelectedDestination] = useState<SavedAddress | null>(cargoItem?.destination || null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchAddresses(user._id));
    }
  }, [dispatch, user]);

  if (!cargoItem) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>Cargo not found</Text>
      </View>
    );
  }

  const handleUpdate = async () => {
    if (!cargoName || !quantity || !readyDate) {
      showToast.error('Please fill all required fields');
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
        destination: selectedDestination ? {
          address: selectedDestination.address,
          latitude: selectedDestination.latitude,
          longitude: selectedDestination.longitude,
        } : undefined,
      }
    };

    try {
      await dispatch(updateCargo(cargoData)).unwrap();
      showToast.success('Cargo updated successfully!');
      navigation.goBack();
    } catch (error: any) {
      showToast.error(error || 'Failed to update cargo');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        <View style={[styles.header, { backgroundColor: theme.info }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            accessibilityHint="Discard changes and go back"
          >
            <Text style={[styles.backButton, { color: theme.card }]}>← Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.card }]}>Edit Cargo</Text>
        </View>

        <View style={styles.form}>
          <Animated.View style={animations.getFloatingCardStyle(0)}>
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
          </Animated.View>

          <Animated.View style={animations.getFloatingCardStyle(1)}>
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
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${u} unit`}
                  accessibilityState={{ selected: unit === u }}
                  accessibilityHint="Unit of measurement for cargo quantity"
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
          </Animated.View>

          <Animated.View style={animations.getFloatingCardStyle(2)}>
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
          </Animated.View>

          <Animated.View style={animations.getFloatingCardStyle(3)}>
            <Text style={[styles.label, { color: theme.text }]}>Destination Address</Text>
            {selectedDestination ? (
              <View style={[styles.selectedAddressBox, { borderColor: theme.primary, backgroundColor: theme.primary + '10' }]}>
                <View style={styles.selectedAddressContent}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.success} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.selectedAddressLabel, { color: theme.text }]}>
                      {selectedDestination.label}
                    </Text>
                    <Text style={[styles.selectedAddressText, { color: theme.textSecondary }]} numberOfLines={1}>
                      {selectedDestination.address}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedDestination(null)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Remove destination"
                    accessibilityHint="Clear selected destination address"
                  >
                    <Ionicons name="close-circle" size={20} color={theme.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.input, styles.selectAddressButton, {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                }]}
                onPress={() => setShowAddressModal(true)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Select destination address"
                accessibilityHint="Open saved addresses list"
              >
                <Ionicons name="location-outline" size={18} color={theme.primary} />
                <Text style={[styles.selectAddressText, { color: theme.textSecondary }]}>
                  Select Destination...
                </Text>
              </TouchableOpacity>
            )}
            {selectedDestination && (
              <TouchableOpacity
                onPress={() => setShowAddressModal(true)}
                style={[styles.changeButton, { backgroundColor: theme.info + '20' }]}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Change destination address"
                accessibilityHint="Select a different destination from saved addresses"
              >
                <Text style={[styles.changeButtonText, { color: theme.info }]}>Change Destination</Text>
              </TouchableOpacity>
            )}
          </Animated.View>

          <Modal visible={showAddressModal} transparent animationType="fade">
            <View style={[styles.modalOverlay, { backgroundColor: theme.background + 'E6' }]}>
              <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Select Destination</Text>
                  <TouchableOpacity
                    onPress={() => setShowAddressModal(false)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                    accessibilityHint="Dismiss address selection modal"
                  >
                    <Ionicons name="close" size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>

                {addresses.length === 0 ? (
                  <View style={styles.emptyAddresses}>
                    <Ionicons name="location-outline" size={40} color={theme.textSecondary} />
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                      No saved addresses yet
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setShowAddressModal(false);
                        navigation.navigate('ProfileSettings');
                      }}
                      style={[styles.addAddressButton, { backgroundColor: theme.primary }]}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Add new address"
                      accessibilityHint="Navigate to profile settings to add a new address"
                    >
                      <Text style={{ color: theme.card, fontWeight: '600' }}>
                        + Add Address
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <FlatList
                    data={addresses}
                    keyExtractor={(item) => item._id || item.id || ''}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.addressOption,
                          {
                            backgroundColor: selectedDestination?.id === item.id || selectedDestination?._id === item._id ? theme.primary + '20' : theme.card,
                            borderColor: theme.border,
                          },
                        ]}
                        onPress={() => {
                          setSelectedDestination(item);
                          setShowAddressModal(false);
                        }}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Select ${item.label}`}
                        accessibilityHint={`Set destination to ${item.address}`}
                        accessibilityState={{
                          selected: selectedDestination?.id === item.id || selectedDestination?._id === item._id
                        }}
                      >
                        <Ionicons name="location" size={18} color={theme.primary} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.addressOptionLabel, { color: theme.text }]}>
                            {item.label}
                          </Text>
                          <Text style={[styles.addressOptionText, { color: theme.textSecondary }]} numberOfLines={1}>
                            {item.address}
                          </Text>
                        </View>
                        {(selectedDestination?.id === item.id || selectedDestination?._id === item._id) && (
                          <Ionicons name="checkmark-circle" size={18} color={theme.success} />
                        )}
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>
            </View>
          </Modal>

          <Animated.View style={animations.getFloatingCardStyle(4)}>
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
          </Animated.View>

          <Text style={[styles.hint, { color: theme.textSecondary }]}>* Required fields</Text>

          <TouchableOpacity
            style={[styles.updateButton, { backgroundColor: theme.info }]}
            onPress={handleUpdate}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Update cargo"
            accessibilityHint="Save changes to cargo listing"
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
  selectedAddressBox: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  selectedAddressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectedAddressLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  selectedAddressText: {
    fontSize: 12,
  },
  selectAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  selectAddressText: {
    fontSize: 14,
  },
  changeButton: {
    marginTop: 8,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  changeButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyAddresses: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
  },
  addAddressButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  addressOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  addressOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  addressOptionText: {
    fontSize: 12,
  },
});