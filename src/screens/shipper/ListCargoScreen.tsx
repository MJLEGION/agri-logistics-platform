// src/screens/shipper/ListCargoScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Platform, Modal, Animated, Pressable } from 'react-native';
import { createCargo } from '../../store/slices/cargoSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store';
import { useScreenAnimations } from '../../hooks/useScreenAnimations';
import DateTimePicker from '@react-native-community/datetimepicker';
import { validateTextField, validatePositiveNumber, validatePrice, validateFutureDate } from '../../utils/formValidation';

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
        <TouchableOpacity onPress={prevMonth} style={styles.monthButton}>
          <Text style={{ color: theme.primary, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.monthYear, { color: theme.text }]}>{monthName}</Text>
        <TouchableOpacity onPress={nextMonth} style={styles.monthButton}>
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
  const { theme } = useTheme();
  const animations = useScreenAnimations(4); // ✨ Pizzazz animations
  
  const [cargoName, setCargoName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<'kg' | 'tons' | 'bags'>('kg');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [readyDate, setReadyDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

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
      Alert.alert('Validation Error', errors.join('\n'));
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
    };


    try {
      const result = await dispatch(createCargo(cargoData));
      
      // Check if the action was fulfilled
      if (result.type.includes('fulfilled')) {
                // Use setTimeout to ensure alert is shown
        setTimeout(() => {
          Alert.alert(
            'Success! ✅',
            `Your cargo "${cargoName}" has been successfully listed and is now visible to transporters!`,
            [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
          );
        }, 100);
      } else {
        // Handle rejection
        const errorMessage = result.payload || 'Failed to list cargo. Please try again.';
        Alert.alert('Error', errorMessage);
      }
    } catch (error: any) {
      console.error('❌ ListCargoScreen: Error creating cargo:', error);
      
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || error?.payload || 'Failed to list cargo. Please try again.';
      
      Alert.alert(
        'Error',
        errorMessage
      );
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
                      >
                        <Text style={[styles.modalButtonText, { color: theme.primary }]}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.modalButton, { backgroundColor: theme.primary }]}
                        onPress={confirmDate}
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
});