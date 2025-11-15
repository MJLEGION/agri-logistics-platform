import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchAddresses,
  createAddress,
  deleteAddress,
  updateAddress,
} from '../store/slices/addressSlice';
import { SavedAddress } from '../services/addressService';
import { Card } from './common/Card';
import Button from './Button';
import { showToast } from '../services/toastService';
import { ConfirmDialog } from './common/ConfirmDialog';

interface AddressManagerProps {
  userId: string;
  onAddressSelect?: (address: SavedAddress) => void;
}

export default function AddressManager({ userId, onAddressSelect }: AddressManagerProps) {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { addresses, isLoading } = useAppSelector((state) => state.address);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SavedAddress>>({
    label: '',
    address: '',
    latitude: 0,
    longitude: 0,
    type: 'home',
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAddresses(userId));
  }, [dispatch, userId]);

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      label: '',
      address: '',
      latitude: 0,
      longitude: 0,
      type: 'home',
    });
    setShowModal(true);
  };

  const handleEdit = (address: SavedAddress) => {
    setEditingId(address._id || address.id || null);
    setFormData(address);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.label || !formData.address || !formData.latitude || !formData.longitude) {
      showToast.error('Please fill all fields');
      return;
    }

    try {
      if (editingId) {
        await dispatch(
          updateAddress({
            userId,
            addressId: editingId,
            addressData: formData as SavedAddress,
          })
        ).unwrap();
        showToast.success('Address updated successfully');
      } else {
        await dispatch(
          createAddress({
            userId,
            addressData: formData as Omit<SavedAddress, 'userId' | '_id' | 'id' | 'createdAt' | 'updatedAt'>,
          })
        ).unwrap();
        showToast.success('Address created successfully');
      }
      setShowModal(false);
    } catch (error: any) {
      showToast.error(error || 'Failed to save address');
    }
  };

  const handleDelete = (addressId: string) => {
    setDeleteAddressId(addressId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteAddressId) return;

    try {
      await dispatch(deleteAddress({ userId, addressId: deleteAddressId })).unwrap();
      showToast.success('Address deleted successfully');
    } catch (error: any) {
      showToast.error(error || 'Failed to delete address');
    } finally {
      setShowDeleteDialog(false);
      setDeleteAddressId(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'home':
        return 'home';
      case 'office':
        return 'briefcase';
      case 'warehouse':
        return 'cube';
      case 'farm':
        return 'leaf';
      default:
        return 'location';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Add New Address Button */}
        <Button
          title="+ Add New Address"
          onPress={handleAddNew}
          variant="primary"
          size="lg"
          fullWidth
        />

        {/* Addresses List */}
        {isLoading ? (
          <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
        ) : addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No addresses saved yet
            </Text>
          </View>
        ) : (
          <View style={styles.addressList}>
            {addresses.map((address) => (
              <Card key={address._id || address.id} style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <View style={styles.addressTitleRow}>
                    <Ionicons
                      name={getTypeIcon(address.type)}
                      size={20}
                      color={theme.primary}
                      style={styles.typeIcon}
                    />
                    <Text style={[styles.addressLabel, { color: theme.text }]}>
                      {address.label}
                    </Text>
                    <Text style={[styles.addressType, { color: theme.textSecondary }]}>
                      ({address.type})
                    </Text>
                  </View>
                  <View style={styles.addressActions}>
                    {onAddressSelect && (
                      <TouchableOpacity
                        onPress={() => onAddressSelect(address)}
                        style={styles.selectButton}
                      >
                        <Ionicons name="checkmark-circle-outline" size={20} color={theme.success} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => handleEdit(address)}
                      style={styles.editButton}
                    >
                      <Ionicons name="pencil" size={18} color={theme.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(address._id || address.id || '')}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash" size={18} color={theme.danger} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={[styles.addressText, { color: theme.text }]}>
                  {address.address}
                </Text>
                <Text style={[styles.coordinates, { color: theme.textSecondary }]}>
                  {address.latitude.toFixed(4)}, {address.longitude.toFixed(4)}
                </Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: theme.background }]}>
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={[styles.closeButton, { color: theme.primary }]}>← Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editingId ? 'Edit Address' : 'Add New Address'}
              </Text>
            </View>

            {/* Form Fields */}
            <View style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Label *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                  placeholder="e.g., Home, Office"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.label || ''}
                  onChangeText={(text) =>
                    setFormData({ ...formData, label: text })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Type *</Text>
                <View style={styles.typeSelector}>
                  {(['home', 'office', 'warehouse', 'farm', 'other'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        {
                          backgroundColor:
                            formData.type === type ? theme.primary : theme.card,
                          borderColor: theme.border,
                        },
                      ]}
                      onPress={() => setFormData({ ...formData, type })}
                    >
                      <Ionicons
                        name={getTypeIcon(type) as any}
                        size={18}
                        color={
                          formData.type === type ? theme.card : theme.text
                        }
                      />
                      <Text
                        style={[
                          styles.typeButtonText,
                          {
                            color:
                              formData.type === type ? theme.card : theme.text,
                          },
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Address *</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                  placeholder="e.g., 123 Main Street, Kigali"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.address || ''}
                  onChangeText={(text) =>
                    setFormData({ ...formData, address: text })
                  }
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.coordinatesRow}>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>Latitude *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                        color: theme.text,
                      },
                    ]}
                    placeholder="-1.9536"
                    placeholderTextColor={theme.textSecondary}
                    value={formData.latitude?.toString() || ''}
                    onChangeText={(text) =>
                      setFormData({ ...formData, latitude: parseFloat(text) || 0 })
                    }
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>Longitude *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                        color: theme.text,
                      },
                    ]}
                    placeholder="30.0605"
                    placeholderTextColor={theme.textSecondary}
                    value={formData.longitude?.toString() || ''}
                    onChangeText={(text) =>
                      setFormData({ ...formData, longitude: parseFloat(text) || 0 })
                    }
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <Button
                title={editingId ? 'Update Address' : 'Save Address'}
                onPress={handleSave}
                variant="primary"
                size="lg"
                fullWidth
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      <ConfirmDialog
        visible={showDeleteDialog}
        title="Delete Address"
        message="Are you sure you want to delete this address?"
        cancelText="Cancel"
        confirmText="Delete"
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        isDestructive={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
  },
  addressList: {
    marginTop: 20,
    gap: 12,
  },
  addressCard: {
    marginBottom: 8,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeIcon: {
    marginRight: 4,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  addressType: {
    fontSize: 12,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
  },
  selectButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  addressText: {
    fontSize: 14,
    marginBottom: 8,
  },
  coordinates: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    paddingTop: 50,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  closeButton: {
    fontSize: 16,
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  form: {
    paddingBottom: 30,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 10,
  },
  coordinatesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    minWidth: '28%',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeButtonText: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
});
