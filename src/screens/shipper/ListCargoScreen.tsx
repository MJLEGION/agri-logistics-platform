// src/screens/shipper/ListCargoScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Platform, Modal, Animated, Pressable, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createCargo } from '../../store/slices/cargoSlice';
import { fetchAddresses } from '../../store/slices/addressSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store';
import { useScreenAnimations } from '../../hooks/useScreenAnimations';
import DateTimePicker from '@react-native-community/datetimepicker';
import { validateTextField, validatePositiveNumber, validatePrice, validateFutureDate } from '../../utils/formValidation';
import { SavedAddress } from '../../services/addressService';
import { showToast } from '../../services/toastService';

// Simple Calendar Component for Web
const Calendar = ({ date, onChange, theme }: any) => {
  const [displayMonth, setDisplayMonth] = useState(new Date(date));

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthName = displayMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(displayMonth);
  const firstDay = getFirstDayOfMonth(displayMonth);

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const prevMonth = () => {
    setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1));
  };

  const selectDay = (day: number) => {
    const newDate = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
    onChange(newDate);
  };

  return (
    <View style={[styles.calendar, { borderColor: theme.border }]}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity
          onPress={prevMonth}
          style={styles.monthButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          accessibilityHint="Navigate to previous month"
        >
          <Text style={{ color: theme.primary, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.monthYear, { color: theme.text }]}>{monthName}</Text>
        <TouchableOpacity
          onPress={nextMonth}
          style={styles.monthButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Next month"
          accessibilityHint="Navigate to next month"
        >
          <Text style={{ color: theme.primary, fontSize: 18 }}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekDays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Text key={day} style={[styles.weekDay, { color: theme.text }]}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayCell,
              {
                backgroundColor: day === date.getDate() &&
                  displayMonth.getMonth() === date.getMonth() &&
                  displayMonth.getFullYear() === date.getFullYear()
                  ? theme.primary
                  : 'transparent',
                borderColor: theme.border,
              },
            ]}
            onPress={() => day && selectDay(day)}
            disabled={!day}
            accessible={!!day}
            accessibilityRole={day ? "button" : "none"}
            accessibilityLabel={day ? `Select ${day}` : undefined}
            accessibilityState={{
              selected: day === date.getDate() &&
                displayMonth.getMonth() === date.getMonth() &&
                displayMonth.getFullYear() === date.getFullYear()
            }}
          >
            <Text
              style={[
                styles.dayText,
                {
                  color: day === date.getDate() &&
                    displayMonth.getMonth() === date.getMonth() &&
                    displayMonth.getFullYear() === date.getFullYear()
                    ? theme.card
                    : day ? theme.text : theme.textSecondary,
                },
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default function ListCargoScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { isLoading } = useAppSelector((state) => state.cargo);
  const { addresses } = useAppSelector((state) => state.address);
  const { theme } = useTheme();
  const animations = useScreenAnimations(4); // ✨ Pizzazz animations
  
  const [cargoName, setCargoName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<'kg' | 'tons' | 'bags'>('kg');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [readyDate, setReadyDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [selectedDestination, setSelectedDestination] = useState<SavedAddress | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchAddresses(user._id));
    }
  }, [dispatch, user]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'ios') {
      setTempDate(selectedDate || tempDate);
    } else {
      setShowDatePicker(false);
      if (selectedDate) {
        setReadyDate(selectedDate);
      }
    }
  };

  const openDatepicker = () => {
    setTempDate(readyDate);
    setShowDatePicker(true);
  };

  const confirmDate = () => {
    setReadyDate(tempDate);
    setShowDatePicker(false);
  };

  const handleSubmit = async () => {
    // Comprehensive validation
    const errors: string[] = [];

    // Validate cargo name
    const nameResult = validateTextField(cargoName, 'Cargo name', 2, 100);
    if (!nameResult.isValid) errors.push(nameResult.error!);

    // Validate quantity
    const quantityResult = validatePositiveNumber(quantity, 'Quantity');
    if (!quantityResult.isValid) errors.push(quantityResult.error!);

    // Validate price per unit (if provided)
    if (pricePerUnit) {
      const priceResult = validatePrice(pricePerUnit);
      if (!priceResult.isValid) errors.push(priceResult.error!);
    }

    // Validate ready date
    if (!readyDate) {
      errors.push('Ready date is required');
    } else {
      const dateResult = validateFutureDate(readyDate);
      if (!dateResult.isValid) errors.push(dateResult.error!);
    }

    // Validate user
    if (!user?._id && !user?.id) {
      errors.push('User not logged in. Please try logging in again.');
    }

    // If there are validation errors, show them
    if (errors.length > 0) {
      showToast.error(errors.join('. '));
      return;
    }

    const cargoData = {
      name: cargoName,
      quantity: parseFloat(quantity),
      unit,
      pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit) : undefined,
      readyDate: readyDate.toISOString().split('T')[0], // Format date to YYYY-MM-DD
      shipperId: user?._id || user?.id,
      status: 'listed', // Explicitly set status to 'listed' so transporters see it
      location: {
        latitude: -1.9403,
        longitude: 29.8739,
        address: 'Kigali, Rwanda',
      },
      destination: selectedDestination ? {
        address: selectedDestination.address,
        latitude: selectedDestination.latitude,
        longitude: selectedDestination.longitude,
      } : undefined,
    };


    try {
      const result = await dispatch(createCargo(cargoData));

      // Check if the action was fulfilled
      if (result.type.includes('fulfilled')) {
        showToast.success(`Your cargo "${cargoName}" has been successfully listed!`);
        // Navigate after a short delay to show the toast
        setTimeout(() => {
          navigation.navigate('Home');
        }, 500);
      } else {
        // Handle rejection
        const errorMessage = result.payload || 'Failed to list cargo. Please try again.';
        showToast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('❌ ListCargoScreen: Error creating cargo:', error);

      const errorMessage = typeof error === 'string'
        ? error
        : error?.message || error?.payload || 'Failed to list cargo. Please try again.';

      showToast.error(errorMessage);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Navigate to previous screen"
          >
            <Text style={[styles.backButton, { color: theme.card }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.card }]}>List New Cargo</Text>
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
                      backgroundColor: unit === u ? theme.primary : theme.card,
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
            <Text style={[styles.label, { color: theme.text }]}>Ready Date *</Text>
          <TouchableOpacity
            onPress={openDatepicker}
            style={[styles.input, {
              backgroundColor: theme.card,
              borderColor: theme.border,
              justifyContent: 'center',
            }]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Ready date: ${readyDate.toLocaleDateString()}`}
            accessibilityHint="Open date picker to select ready date"
          >
            <Text style={{ color: theme.text }}>{readyDate.toLocaleDateString()}</Text>
          </TouchableOpacity>

            {Platform.OS === 'web' ? (
              <Modal
                visible={showDatePicker}
                transparent={true}
                animationType="fade"
              >
                <View style={styles.modalOverlay}>
                  <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                    <Text style={[styles.modalTitle, { color: theme.text }]}>Select Date</Text>
                    
                    <View style={styles.datePickerContainer}>
                      <Calendar
                        date={tempDate}
                        onChange={setTempDate}
                        theme={theme}
                      />
                    </View>

                    <View style={styles.modalButtons}>
                      <TouchableOpacity
                        style={[styles.modalButton, { borderColor: theme.primary }]}
                        onPress={() => setShowDatePicker(false)}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel="Cancel"
                        accessibilityHint="Close date picker without changes"
                      >
                        <Text style={[styles.modalButtonText, { color: theme.primary }]}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modalButton, { backgroundColor: theme.primary }]}
                        onPress={confirmDate}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel="Confirm date"
                        accessibilityHint={`Set ready date to ${tempDate.toLocaleDateString()}`}
                      >
                        <Text style={[styles.modalButtonText, { color: theme.card }]}>Confirm</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            ) : (
              showDatePicker && (
                <DateTimePicker
                  testID="nativeDateTimePicker"
                  value={readyDate}
                  mode="date"
                  is24Hour={true}
                  display="default"
                  onChange={handleDateChange}
                />
              )
            )}
          </Animated.View>

          <Animated.View style={animations.getFloatingCardStyle(4)}>
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

          <Text style={[styles.hint, { color: theme.textSecondary }]}>* Required fields</Text>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.primary }]}
            onPress={handleSubmit}
            disabled={isLoading}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="List cargo"
            accessibilityHint="Submit cargo listing to make it visible to transporters"
            accessibilityState={{ disabled: isLoading, busy: isLoading }}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  datePickerContainer: {
    marginVertical: 15,
    alignItems: 'center',
    width: '100%',
  },
  calendar: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  monthButton: {
    padding: 8,
    width: 36,
    alignItems: 'center',
  },
  monthYear: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 12,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    marginBottom: 4,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
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