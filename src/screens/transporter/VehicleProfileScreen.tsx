// src/screens/transporter/VehicleProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Animated,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store';
import { useScreenAnimations } from '../../hooks/useScreenAnimations';
import ListItem from '../../components/ListItem';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import Toast, { useToast } from '../../components/Toast';

interface VehicleInfo {
  licensePlate: string;
  vehicleType: 'car' | 'truck' | 'van' | 'motorcycle';
  capacity: number; // in kg
  capacity_unit: string;
  year: number;
  color: string;
  insuranceStatus: 'active' | 'expired' | 'none';
  insuranceExpiry?: string;
  mileage: number; // in km
  fuelType: 'petrol' | 'diesel' | 'electric';
  fuelConsumption: number; // liters per 100km
}

export default function VehicleProfileScreen({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { toast, showSuccess, showError, hideToast } = useToast();
  const animations = useScreenAnimations(4); // ✨ Pizzazz animations

  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({
    licensePlate: 'UH-123ABC',
    vehicleType: 'truck',
    capacity: 5000,
    capacity_unit: 'kg',
    year: 2020,
    color: 'White',
    insuranceStatus: 'active',
    insuranceExpiry: '2025-12-31',
    mileage: 45230,
    fuelType: 'diesel',
    fuelConsumption: 10,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState<VehicleInfo>(vehicleInfo);
  const [isSaving, setIsSaving] = useState(false);

  const handleEditPress = () => {
    setIsEditing(true);
    setEditedInfo(vehicleInfo);
  };

  const handleSavePress = async () => {
    // Validate required fields
    if (!editedInfo.licensePlate.trim()) {
      showError('License plate is required');
      return;
    }
    if (editedInfo.capacity <= 0) {
      showError('Capacity must be greater than 0');
      return;
    }

    setIsSaving(true);
    try {
      // In a real app, this would save to backend
      setVehicleInfo(editedInfo);
      setIsEditing(false);
      showSuccess('Vehicle information updated successfully!');
    } catch (error) {
      showError('Failed to update vehicle information');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedInfo(vehicleInfo);
  };

  const handleInputChange = (field: keyof VehicleInfo, value: any) => {
    setEditedInfo({
      ...editedInfo,
      [field]: value,
    });
  };

  const getInsuranceStatusColor = () => {
    switch (vehicleInfo.insuranceStatus) {
      case 'active':
        return theme.success;
      case 'expired':
        return theme.error;
      default:
        return theme.warning;
    }
  };

  const getVehicleIcon = () => {
    switch (vehicleInfo.vehicleType) {
      case 'truck':
        return 'boat';
      case 'van':
        return 'bus';
      case 'motorcycle':
        return 'bicycle';
      default:
        return 'car';
    }
  };

  const currentInfo = isEditing ? editedInfo : vehicleInfo;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        {/* Header */}
        <LinearGradient
          colors={['#10797D', '#0D5F66']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🚗 Vehicle Profile</Text>
        </LinearGradient>

        {/* Vehicle Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
          <View style={styles.vehicleIconBox}>
            <Ionicons name={getVehicleIcon()} size={48} color="#6B7280" />
          </View>
          <View style={styles.vehicleInfo}>
            <Text style={[styles.vehiclePlate, { color: theme.text }]}>
              {currentInfo.licensePlate}
            </Text>
            <Text style={[styles.vehicleType, { color: theme.textSecondary }]}>
              {currentInfo.year} • {currentInfo.vehicleType.charAt(0).toUpperCase() + currentInfo.vehicleType.slice(1)}
            </Text>
            <Text style={[styles.vehicleColor, { color: theme.textSecondary }]}>
              {currentInfo.color}
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: theme.card }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#E5E7EB' }]}>
              <Ionicons name="speedometer" size={24} color="#6B7280" />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {currentInfo.mileage.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Mileage (km)
            </Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: theme.card }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#10797D' + '20' }]}>
              <Ionicons name="cube" size={24} color="#10797D" />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {currentInfo.capacity}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Capacity ({currentInfo.capacity_unit})
            </Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: theme.card }]}>
            <View
              style={[
                styles.statIconBox,
                { backgroundColor: getInsuranceStatusColor() + '20' },
              ]}
            >
              <Ionicons name="shield-checkmark" size={24} color={getInsuranceStatusColor()} />
            </View>
            <Text style={[styles.statValue, { color: getInsuranceStatusColor() }]}>
              {vehicleInfo.insuranceStatus === 'active' ? '✓' : '!'}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Insurance
            </Text>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              📋 Vehicle Details
            </Text>
            {!isEditing && (
              <TouchableOpacity
                onPress={handleEditPress}
                style={styles.editButton}
              >
                <Ionicons name="pencil" size={18} color="#8B5CF6" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {isEditing ? (
            // Edit Mode
            <View style={styles.editForm}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>License Plate</Text>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: theme.border, color: theme.text },
                  ]}
                  value={editedInfo.licensePlate}
                  onChangeText={(value) =>
                    handleInputChange('licensePlate', value)
                  }
                  placeholderTextColor={theme.textSecondary}
                  editable={!isSaving}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>
                  Vehicle Type
                </Text>
                <View style={styles.typeSelector}>
                  {(['car', 'truck', 'van', 'motorcycle'] as const).map((type) => (
                    <Chip
                      key={type}
                      label={type.charAt(0).toUpperCase() + type.slice(1)}
                      selected={editedInfo.vehicleType === type}
                      onPress={() => handleInputChange('vehicleType', type)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>
                  Capacity ({editedInfo.capacity_unit})
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: theme.border, color: theme.text },
                  ]}
                  value={editedInfo.capacity.toString()}
                  onChangeText={(value) =>
                    handleInputChange('capacity', parseInt(value) || 0)
                  }
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  editable={!isSaving}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Year</Text>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: theme.border, color: theme.text },
                  ]}
                  value={editedInfo.year.toString()}
                  onChangeText={(value) =>
                    handleInputChange('year', parseInt(value) || 2000)
                  }
                  placeholder="2020"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  editable={!isSaving}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Color</Text>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: theme.border, color: theme.text },
                  ]}
                  value={editedInfo.color}
                  onChangeText={(value) => handleInputChange('color', value)}
                  placeholderTextColor={theme.textSecondary}
                  editable={!isSaving}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>
                  Fuel Consumption (L/100km)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: theme.border, color: theme.text },
                  ]}
                  value={editedInfo.fuelConsumption.toString()}
                  onChangeText={(value) =>
                    handleInputChange('fuelConsumption', parseFloat(value) || 10)
                  }
                  placeholder="10"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="decimal-pad"
                  editable={!isSaving}
                />
              </View>

              <View style={styles.formActions}>
                <Button
                  title="Cancel"
                  onPress={handleCancelEdit}
                  variant="secondary"
                  size="lg"
                  disabled={isSaving}
                  icon={<Ionicons name="close-outline" size={20} color="#fff" />}
                />
                <Button
                  title="Save Changes"
                  onPress={handleSavePress}
                  variant="primary"
                  size="lg"
                  loading={isSaving}
                  disabled={isSaving}
                  icon={<Ionicons name="checkmark-circle-outline" size={20} color="#fff" />}
                />
              </View>
            </View>
          ) : (
            // View Mode
            <View>
              <ListItem
                icon="car-sport"
                title="Vehicle Type"
                subtitle={vehicleInfo.vehicleType.charAt(0).toUpperCase() + vehicleInfo.vehicleType.slice(1)}
              />
              <ListItem
                icon="calendar"
                title="Year"
                subtitle={vehicleInfo.year.toString()}
              />
              <ListItem
                icon="color-palette"
                title="Color"
                subtitle={vehicleInfo.color}
              />
              <ListItem
                icon="flash"
                title="Fuel Type"
                subtitle={vehicleInfo.fuelType.charAt(0).toUpperCase() + vehicleInfo.fuelType.slice(1)}
              />
              <ListItem
                icon="speedometer"
                title="Mileage"
                subtitle={`${vehicleInfo.mileage.toLocaleString()} km`}
              />
              <ListItem
                icon="analytics"
                title="Fuel Consumption"
                subtitle={`${vehicleInfo.fuelConsumption} L/100km`}
              />
              {vehicleInfo.insuranceStatus !== 'none' && (
                <ListItem
                  icon="shield-checkmark"
                  title="Insurance Expiry"
                  subtitle={vehicleInfo.insuranceExpiry || 'N/A'}
                />
              )}
            </View>
          )}
        </View>

        {/* Insurance Notice */}
        {vehicleInfo.insuranceStatus === 'expired' && (
          <View style={[styles.noticeBox, { backgroundColor: theme.error + '20', borderColor: theme.error }]}>
            <Ionicons name="warning" size={20} color={theme.error} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.noticeTitle, { color: theme.error }]}>
                Insurance Expired
              </Text>
              <Text style={[styles.noticeText, { color: theme.error }]}>
                Please renew your insurance to continue accepting trips
              </Text>
            </View>
          </View>
        )}

        {/* Maintenance Tips */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            🔧 Maintenance Tips
          </Text>
          <View style={[styles.tipBox, { backgroundColor: theme.card }]}>
            <Ionicons name="checkmark-circle" size={20} color={theme.success} />
            <Text style={[styles.tipText, { color: theme.text }]}>
              Regular maintenance improves earnings and safety
            </Text>
          </View>
          <View style={[styles.tipBox, { backgroundColor: theme.card }]}>
            <Ionicons name="checkmark-circle" size={20} color={theme.success} />
            <Text style={[styles.tipText, { color: theme.text }]}>
              Keep mileage records for deductions
            </Text>
          </View>
          <View style={[styles.tipBox, { backgroundColor: theme.card }]}>
            <Ionicons name="checkmark-circle" size={20} color={theme.success} />
            <Text style={[styles.tipText, { color: theme.text }]}>
              Ensure insurance is always current
            </Text>
          </View>
        </View>
      </ScrollView>

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
    paddingBottom: 30,
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryCard: {
    flexDirection: 'row',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  vehicleIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehiclePlate: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  vehicleType: {
    fontSize: 14,
    marginBottom: 4,
  },
  vehicleColor: {
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 20,
    gap: 10,
  },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButtonText: {
    color: '#10797D',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsBox: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  editForm: {
    gap: 15,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  typeOptionSelected: {
    borderColor: '#8B5CF6',
  },
  typeOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  typeOptionTextSelected: {
    color: '#fff',
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  noticeBox: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 12,
  },
  tipBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    gap: 12,
  },
  tipText: {
    fontSize: 13,
    flex: 1,
  },
});