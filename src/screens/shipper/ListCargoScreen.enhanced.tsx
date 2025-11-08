// src/screens/shipper/ListCargoScreen.enhanced.tsx
// Enhanced version with destination input, vehicle selection, and dynamic pricing
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Platform, Modal } from 'react-native';
import { createCargo } from '../../store/slices/cargoSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store';
import { distanceService } from '../../services/distanceService';
import { suggestVehicleType, getVehicleType, calculateShippingCost, getTrafficFactor, getTrafficDescription, VEHICLE_TYPES } from '../../services/vehicleService';
import { geocodeAddress } from '../../services/geocodingService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

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
  
  // Form state
  const [cargoName, setCargoName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<'kg' | 'tons' | 'bags'>('kg');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [readyDate, setReadyDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  // Location state
  const [originAddress, setOriginAddress] = useState('Kigali, Rwanda');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [showDestinationInput, setShowDestinationInput] = useState(false);
  const [showOriginInput, setShowOriginInput] = useState(false);
  const [customOriginAddress, setCustomOriginAddress] = useState('Kigali, Rwanda');
  const [customDestinationAddress, setCustomDestinationAddress] = useState('');

  // Vehicle and pricing state
  const [suggestedVehicle, setSuggestedVehicle] = useState<string>('van');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('van');
  const [distance, setDistance] = useState<number>(0);
  const [trafficFactor, setTrafficFactor] = useState(1.0);
  const [shippingCost, setShippingCost] = useState(0);
  const [eta, setEta] = useState(0);

  // Submission feedback state
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Preset destinations for Rwanda
  const RWANDA_DESTINATIONS = [
    { name: 'Kigali City Center', lat: -1.9536, lon: 30.0605 },
    { name: 'Kigali International Airport', lat: -1.9686, lon: 30.1395 },
    { name: 'Nyarutarama', lat: -1.9486, lon: 30.0872 },
    { name: 'Remera', lat: -1.9571, lon: 30.0994 },
    { name: 'Kimihurura', lat: -1.9503, lon: 30.0857 },
    { name: 'Huye (Butare)', lat: -2.5974, lon: 29.7399 },
    { name: 'Musanze (Ruhengeri)', lat: -1.5, lon: 29.6 },
    { name: 'Muhanga', lat: -1.9762, lon: 30.1844 },
    { name: 'Gisenyi', lat: -1.7039, lon: 29.2562 },
    { name: 'Kibuye', lat: -1.7039, lon: 29.2562 },
  ];

  // Kigali city center - default coordinates
  const DEFAULT_KIGALI_COORDS = { lat: -1.9536, lon: 30.0605 };

  // Auto-calculate distance and ETA when destination/quantity/origin changes
  useEffect(() => {
        if (destinationAddress && quantity) {

      // Geocode the origin address
      const originCoords = geocodeAddress(originAddress);

      // Find if destination is a preset destination
      const presetDest = RWANDA_DESTINATIONS.find(d => d.name === destinationAddress);

      if (presetDest) {
        // Use preset coordinates for destination
        const calculatedDistance = distanceService.calculateDistance(
          originCoords.latitude,
          originCoords.longitude,
          presetDest.lat,
          presetDest.lon
        );

        setDistance(calculatedDistance);

        const traffic = getTrafficFactor();
        setTrafficFactor(traffic);

        const cost = calculateShippingCost(calculatedDistance, selectedVehicle, traffic);
        setShippingCost(cost);

        const estimatedEta = distanceService.calculateETA(calculatedDistance, 45, traffic);
        setEta(estimatedEta);

              } else if (destinationAddress) {
        // Geocode custom destination address
        const destCoords = geocodeAddress(destinationAddress);

        const calculatedDistance = distanceService.calculateDistance(
          originCoords.latitude,
          originCoords.longitude,
          destCoords.latitude,
          destCoords.longitude
        );

        setDistance(calculatedDistance);

        const traffic = getTrafficFactor();
        setTrafficFactor(traffic);

        const cost = calculateShippingCost(calculatedDistance, selectedVehicle, traffic);
        setShippingCost(cost);

        const estimatedEta = distanceService.calculateETA(calculatedDistance, 45, traffic);
        setEta(estimatedEta);
      }
    }
  }, [originAddress, destinationAddress, quantity, selectedVehicle]);

  // Handle quantity change and suggest vehicle
  const handleQuantityChange = (value: string) => {
    setQuantity(value);
    
    if (value) {
      const qty = parseFloat(value);
      let weightInKg = qty;
      
      // Convert to kg if needed
      if (unit === 'tons') {
        weightInKg = qty * 1000;
      } else if (unit === 'bags') {
        // Assume ~50kg per bag
        weightInKg = qty * 50;
      }

      const suggested = suggestVehicleType(weightInKg);
      setSuggestedVehicle(suggested);
      setSelectedVehicle(suggested);
    }
  };

  // Calculate distance and pricing when destination changes
  const handleDestinationSelect = (dest: typeof RWANDA_DESTINATIONS[0]) => {
    setDestinationAddress(dest.name);
    setShowDestinationInput(false);

    // Calculate distance using Haversine formula (geocode origin first)
    const originCoords = geocodeAddress(originAddress);
    const calculatedDistance = distanceService.calculateDistance(
      originCoords.latitude,
      originCoords.longitude,
      dest.lat,
      dest.lon
    );

    setDistance(calculatedDistance);

    // Get current traffic factor
    const traffic = getTrafficFactor();
    setTrafficFactor(traffic);

    // Calculate shipping cost
    const cost = calculateShippingCost(calculatedDistance, selectedVehicle, traffic);
    setShippingCost(cost);

    // Calculate ETA
    const estimatedEta = distanceService.calculateETA(calculatedDistance, 45, traffic);
    setEta(estimatedEta);
  };

  // Recalculate pricing when vehicle changes
  const handleVehicleChange = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
    
    if (distance > 0) {
      const cost = calculateShippingCost(distance, vehicleId, trafficFactor);
      setShippingCost(cost);
    }
  };

  // Date handling
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

  // Form submission
  // Update customOriginAddress when originAddress changes
  useEffect(() => {
    setCustomOriginAddress(originAddress);
  }, []);

  const handleSubmit = async () => {
    
    // Validation
    if (!cargoName || !quantity || !readyDate || !destinationAddress) {
      Alert.alert('Error', 'Please fill all required fields including destination');
      return;
    }

    if (!user?._id && !user?.id) {
      Alert.alert('Error', 'User ID is missing. Please try logging in again.');
      return;
    }

    const cargoData = {
      name: cargoName,
      quantity: parseFloat(quantity),
      unit,
      pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit) : undefined,
      readyDate: readyDate.toISOString().split('T')[0],
      shipperId: user?._id || user?.id,
      status: 'listed',
      suggestedVehicle: selectedVehicle,
      shippingCost: shippingCost,
      distance: distance,
      eta: eta,
      // Origin location (geocode the address to get accurate coordinates)
      location: (() => {
        const originCoords = geocodeAddress(originAddress);
        return {
          latitude: originCoords.latitude,
          longitude: originCoords.longitude,
          address: originAddress,
        };
      })(),
      // Destination location
      destination: (() => {
        // First try to find in preset destinations
        const presetDest = RWANDA_DESTINATIONS.find(d => d.name === destinationAddress);
        if (presetDest) {
          return {
            latitude: presetDest.lat,
            longitude: presetDest.lon,
            address: destinationAddress,
          };
        }

        // If not found, geocode the custom address
        const geocoded = geocodeAddress(destinationAddress);
        return {
          latitude: geocoded.latitude,
          longitude: geocoded.longitude,
          address: destinationAddress,
        };
      })(),
    };


    try {
      const result = await dispatch(createCargo(cargoData as any));
      
      if (result.type.includes('fulfilled')) {
        // Show success state temporarily
        setSubmissionSuccess(true);
        
        // Auto-navigate after success overlay shows for 2 seconds
        setTimeout(() => {
          setSubmissionSuccess(false);
          
          // Reset form for next use
          setCargoName('');
          setQuantity('');
          setUnit('kg');
          setPricePerUnit('');
          setReadyDate(new Date());
          setDestinationAddress('');
          setDistance(0);
          setShippingCost(0);
          setEta(0);
          
          // Navigate to MyCargo screen to see the newly listed cargo
          navigation.navigate('MyCargo');
        }, 2000);
      } else {
        setSubmissionSuccess(false);
        Alert.alert('Error', result.payload || 'Failed to list cargo');
      }
    } catch (error: any) {
      setSubmissionSuccess(false);
      Alert.alert('Error', error?.message || 'Failed to list cargo');
    }
  };

  const vehicleType = getVehicleType(selectedVehicle);

  // Debug: Log values before rendering

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.card }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.card }]}>List New Cargo</Text>
        </View>

        <View style={styles.formWrapper}>
          <View style={styles.form}>
          {/* Cargo Name */}
          <Text style={[styles.label, { color: theme.text }]}>Cargo Name *</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.card,
              borderColor: theme.border,
              color: theme.text,
            }]}
            placeholder="e.g., Tomatoes, Fish, Maize"
            placeholderTextColor={theme.textSecondary}
            value={cargoName}
            onChangeText={setCargoName}
          />

          {/* Quantity */}
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
              onChangeText={handleQuantityChange}
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

          {/* Price per Unit */}
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

          {/* Origin Location */}
          <Text style={[styles.label, { color: theme.text }]}>📍 Origin Location</Text>
          <TouchableOpacity 
            style={[styles.input, { 
              backgroundColor: theme.card,
              borderColor: theme.info,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }]}
            onPress={() => setShowOriginInput(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Ionicons name="location" size={18} color={theme.info} style={{ marginRight: 8 }} />
              <Text style={{ color: theme.text, flex: 1 }}>{originAddress}</Text>
            </View>
            <Ionicons name="pencil" size={16} color={theme.primary} />
          </TouchableOpacity>

          {/* Origin Address Modal */}
          <Modal visible={showOriginInput} transparent animationType="slide">
            <View style={[styles.modalOverlay, { backgroundColor: theme.background + 'E6' }]}>
              <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Origin Location</Text>
                  <TouchableOpacity onPress={() => setShowOriginInput(false)}>
                    <Text style={{ fontSize: 20, color: theme.text }}>✕</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                    color: theme.text,
                    marginBottom: 16,
                  }]}
                  placeholder="Enter origin address (e.g., Kigali, Rwanda)"
                  placeholderTextColor={theme.textSecondary}
                  value={customOriginAddress}
                  onChangeText={setCustomOriginAddress}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, { borderColor: theme.primary }]}
                    onPress={() => setShowOriginInput(false)}
                  >
                    <Text style={[styles.modalButtonText, { color: theme.primary }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, { backgroundColor: theme.primary }]}
                    onPress={() => {
                      setOriginAddress(customOriginAddress);
                      setShowOriginInput(false);
                    }}
                  >
                    <Text style={[styles.modalButtonText, { color: theme.card }]}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Destination Location */}
          <Text style={[styles.label, { color: theme.text }]}>📍 Destination Location *</Text>
          <TouchableOpacity 
            style={[styles.input, { 
              backgroundColor: theme.card,
              borderColor: theme.border,
              justifyContent: 'center',
              flexDirection: 'row',
              alignItems: 'center',
            }]}
            onPress={() => {
              setCustomDestinationAddress(destinationAddress);
              setShowDestinationInput(true);
            }}
          >
            <Ionicons name="location" size={18} color={theme.primary} style={{ marginRight: 8 }} />
            <Text style={{ color: destinationAddress ? theme.text : theme.textSecondary, flex: 1 }}>
              {destinationAddress || 'Select or enter destination'}
            </Text>
            <Ionicons name="pencil" size={16} color={theme.primary} />
          </TouchableOpacity>

          {/* Destination Picker Modal */}
          <Modal visible={showDestinationInput} transparent animationType="slide">
            <View style={[styles.modalOverlay, { backgroundColor: theme.background + 'E6' }]}>
              <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Destination Location</Text>
                  <TouchableOpacity onPress={() => setShowDestinationInput(false)}>
                    <Text style={{ fontSize: 20, color: theme.text }}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Custom address input */}
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                    color: theme.text,
                    marginBottom: 16,
                  }]}
                  placeholder="Enter custom destination address"
                  placeholderTextColor={theme.textSecondary}
                  value={customDestinationAddress}
                  onChangeText={setCustomDestinationAddress}
                />

                {/* Or separator */}
                <View style={[styles.separatorContainer, { backgroundColor: theme.background }]}>
                  <View style={[styles.separatorLine, { backgroundColor: theme.border }]} />
                  <Text style={[styles.separatorText, { color: theme.textSecondary }]}>OR SELECT FROM LIST</Text>
                  <View style={[styles.separatorLine, { backgroundColor: theme.border }]} />
                </View>

                {/* Preset destinations */}
                <ScrollView style={styles.destinationList}>
                  {RWANDA_DESTINATIONS.map((dest) => (
                    <TouchableOpacity
                      key={dest.name}
                      style={[styles.destinationItem, { borderBottomColor: theme.border }]}
                      onPress={() => handleDestinationSelect(dest)}
                    >
                      <Ionicons name="location" size={20} color={theme.primary} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.destName, { color: theme.text }]}>{dest.name}</Text>
                      </View>
                      {destinationAddress === dest.name && (
                        <Ionicons name="checkmark-circle" size={20} color={theme.success} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Custom destination button */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, { borderColor: theme.primary }]}
                    onPress={() => setShowDestinationInput(false)}
                  >
                    <Text style={[styles.modalButtonText, { color: theme.primary }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: theme.primary }]}
                    disabled={!customDestinationAddress}
                    onPress={() => {
                      setDestinationAddress(customDestinationAddress);
                      setShowDestinationInput(false);

                      // Geocode both origin and destination addresses
                      const originCoords = geocodeAddress(originAddress);
                      const destCoords = geocodeAddress(customDestinationAddress);

                      // Calculate distance using geocoded coordinates
                      const calculatedDistance = distanceService.calculateDistance(
                        originCoords.latitude,
                        originCoords.longitude,
                        destCoords.latitude,
                        destCoords.longitude
                      );

                      setDistance(calculatedDistance);

                      // Get current traffic factor
                      const traffic = getTrafficFactor();
                      setTrafficFactor(traffic);

                      // Calculate shipping cost
                      const cost = calculateShippingCost(calculatedDistance, selectedVehicle, traffic);
                      setShippingCost(cost);

                      // Calculate ETA
                      const estimatedEta = distanceService.calculateETA(calculatedDistance, 45, traffic);
                      setEta(estimatedEta);
                    }}
                  >
                    <Text style={[styles.modalButtonText, { color: customDestinationAddress ? theme.card : theme.textSecondary }]}>
                      Use This Address
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Ready Date */}
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
            <Modal visible={showDatePicker} transparent animationType="fade">
              <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Select Date</Text>
                  <View style={styles.datePickerContainer}>
                    <Calendar date={tempDate} onChange={setTempDate} theme={theme} />
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

          {/* Vehicle Selection */}
          {destinationAddress && (
            <>
              <View style={styles.divider} />
              <Text style={[styles.label, { color: theme.text }]}>
                🚚 Vehicle Type (Suggested: {VEHICLE_TYPES[suggestedVehicle].icon})
              </Text>
              <View style={styles.vehicleGrid}>
                {Object.values(VEHICLE_TYPES).map((vehicle) => (
                  <TouchableOpacity
                    key={vehicle.id}
                    style={[
                      styles.vehicleCard,
                      {
                        backgroundColor: selectedVehicle === vehicle.id ? theme.primary + '20' : theme.card,
                        borderColor: selectedVehicle === vehicle.id ? theme.primary : theme.border,
                        borderWidth: selectedVehicle === vehicle.id ? 2 : 1,
                      },
                    ]}
                    onPress={() => handleVehicleChange(vehicle.id)}
                  >
                    <Text style={styles.vehicleIcon}>{vehicle.icon}</Text>
                    <Text style={[styles.vehicleName, { color: theme.text }]}>{vehicle.name.split('|')[0]}</Text>
                    <Text style={[styles.vehicleCapacity, { color: theme.textSecondary }]}>{vehicle.capacity}</Text>
                    <Text style={[styles.vehicleRate, { color: theme.primary }]}>
                      {vehicle.baseRatePerKm} RWF/km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Pricing Summary */}
          {distance > 0 && vehicleType && (
            <>
              <View style={[styles.pricingCard, { backgroundColor: theme.primary + '10', borderColor: theme.primary }]}>
                <View style={styles.pricingRow}>
                  <Text style={[styles.pricingLabel, { color: theme.text }]}>📍 Distance:</Text>
                  <Text style={[styles.pricingValue, { color: theme.primary }]}>{distance.toFixed(1)} km</Text>
                </View>

                <View style={styles.pricingRow}>
                  <Text style={[styles.pricingLabel, { color: theme.text }]}>🚗 Vehicle Rate:</Text>
                  <Text style={[styles.pricingValue, { color: theme.primary }]}>
                    {vehicleType.baseRatePerKm.toLocaleString()} RWF/km
                  </Text>
                </View>

                <View style={styles.pricingRow}>
                  <Text style={[styles.pricingLabel, { color: theme.text }]}>
                    🚦 Traffic: {getTrafficDescription(trafficFactor)}
                  </Text>
                  <Text style={[styles.pricingValue, { color: theme.warning }]}>
                    +{Math.round((trafficFactor - 1) * 100)}%
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.pricingRow}>
                  <Text style={[styles.pricingLabel, { color: theme.text, fontWeight: '700' }]}>
                    💰 Estimated Shipping:
                  </Text>
                  <Text style={[styles.pricingValue, { color: theme.success, fontSize: 18, fontWeight: '700' }]}>
                    {shippingCost.toLocaleString()} RWF
                  </Text>
                </View>

                <View style={styles.pricingRow}>
                  <Text style={[styles.pricingLabel, { color: theme.text }]}>⏱️ ETA:</Text>
                  <Text style={[styles.pricingValue, { color: theme.tertiary }]}>
                    ~{eta} minutes
                  </Text>
                </View>
              </View>
            </>
          )}

          <Text style={[styles.hint, { color: theme.textSecondary }]}>* Required fields</Text>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.primary }]}
            onPress={handleSubmit}
            disabled={isLoading || !destinationAddress}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>List Cargo</Text>
            )}
          </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Success Overlay */}
      {submissionSuccess && (
        <View style={[styles.successOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.successCard, { backgroundColor: theme.card }]}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={[styles.successTitle, { color: theme.success }]}>Success!</Text>
            <Text style={[styles.successMessage, { color: theme.text }]}>
              Your cargo has been listed and is ready for transporters to accept.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  formWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  form: {
    width: '100%',
    maxWidth: 600,
    paddingVertical: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  quantityInput: {
    flex: 1,
  },
  unitSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  unitText: {
    fontSize: 12,
    fontWeight: '600',
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    gap: 10,
  },
  locationText: {
    fontSize: 14,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  destinationList: {
    maxHeight: 400,
  },
  destinationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  destName: {
    fontSize: 16,
    fontWeight: '500',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  separatorLine: {
    flex: 1,
    height: 1,
  },
  separatorText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  datePickerContainer: {
    marginVertical: 20,
  },
  calendar: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  monthButton: {
    padding: 12,
    borderRadius: 6,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '700',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  weekDay: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    width: '14.28%',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: '13%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    margin: 3,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
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
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  vehicleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  vehicleCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  vehicleIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  vehicleName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  vehicleCapacity: {
    fontSize: 11,
    marginBottom: 6,
  },
  vehicleRate: {
    fontSize: 12,
    fontWeight: '600',
  },
  pricingCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pricingLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  pricingValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    fontSize: 11,
    marginTop: 16,
    marginBottom: 8,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  successCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  successDetails: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});