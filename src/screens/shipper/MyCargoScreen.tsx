// src/screens/shipper/MyCargoScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Animated, Pressable, PanResponder } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { fetchCargo, deleteCargo } from '../../store/slices/cargoSlice';
import { useAppDispatch, useAppSelector } from '../../store';
import SearchBar from '../../components/SearchBar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Toast, { useToast } from '../../components/Toast';
import Divider from '../../components/Divider';
import { useScreenAnimations } from '../../hooks/useScreenAnimations';

export default function MyCargoScreen({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const { cargo, isLoading } = useAppSelector((state) => state.cargo);
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { toast, showSuccess, showError, hideToast } = useToast();
  
  // ✨ Pizzazz Animations
  const animations = useScreenAnimations(6);

  // State for confirmation dialog
  const [dialogVisible, setDialogVisible] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingDeleteName, setPendingDeleteName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch cargo on screen mount
  useEffect(() => {
    dispatch(fetchCargo());
  }, [dispatch]);

  // Refetch cargo when screen comes into focus (after creating new cargo)
  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchCargo());
    }, [dispatch])
  );

  const myListings = Array.isArray(cargo) ? cargo.filter(item => {
    const shipperId = typeof item.shipperId === 'string' ? item.shipperId : item.shipperId?._id;
    return shipperId === user?._id || shipperId === user?.id;
  }) : [];

  // Filter by search query
  const filteredListings = searchQuery.trim()
    ? myListings.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.status.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : myListings;

  React.useEffect(() => {
    console.log('%c📦 MyCargoScreen: myListings updated', 'color: #4CAF50; font-size: 14px; font-weight: bold');
    console.log('%cTotal cargo:', 'color: #2196F3; font-weight: bold', Array.isArray(cargo) ? cargo.length : 0);
    console.log('%cMy listings:', 'color: #2196F3; font-weight: bold', myListings.length);
    console.log('%cCargo details:', 'color: #2196F3; font-weight: bold', myListings.map(c => ({ id: c._id || c.id, name: c.name })));
    console.log('%cUser:', 'color: #2196F3; font-weight: bold', { userId: user?._id || user?.id, userName: user?.name });
  }, [myListings, cargo, user]);

  const handleDelete = (cargoId: string, cargoName: string) => {
    console.log('%c🗑️ DELETE BUTTON PRESSED!', 'color: #FF6B6B; font-size: 16px; font-weight: bold');
    console.log('%cCargo ID:', 'color: #2196F3; font-weight: bold', cargoId);
    console.log('%cCargo Name:', 'color: #2196F3; font-weight: bold', cargoName);
    
    setPendingDeleteId(cargoId);
    setPendingDeleteName(cargoName);
    setDialogVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;
    
    console.log('%c✅ Confirmed delete for:', 'color: #4CAF50; font-weight: bold', pendingDeleteId);
    setDialogVisible(false);
    
    try {
      console.log('%c🚀 Dispatching deleteCargo action...', 'color: #2196F3; font-weight: bold');
      const result = await dispatch(deleteCargo(pendingDeleteId));
      console.log('%c📦 Delete result:', 'color: #2196F3; font-weight: bold', result);
      console.log('%c📦 Result type:', 'color: #2196F3; font-weight: bold', result.type);
      
      if (result.type.includes('fulfilled')) {
        console.log('%c✅ Cargo deleted successfully!', 'color: #4CAF50; font-weight: bold');
        showSuccess('Cargo deleted successfully!');
      } else {
        console.log('%c❌ Delete failed:', 'color: #F44336; font-weight: bold', result.payload);
        showError('Failed to delete cargo. Please try again.');
      }
    } catch (error: any) {
      console.error('%c❌ Error in handleDelete:', 'color: #F44336; font-weight: bold', error);
      showError('An error occurred while deleting cargo.');
    }
    
    setPendingDeleteId(null);
    setPendingDeleteName('');
  };

  const handleCancelDelete = () => {
    console.log('%c❌ Delete cancelled', 'color: #FF9800; font-weight: bold');
    setDialogVisible(false);
    setPendingDeleteId(null);
    setPendingDeleteName('');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: theme.card }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.card }]}>My Cargo ({myListings.length})</Text>
      </View>

      {myListings.length > 0 && (
        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search cargo by name, location, or status..."
            variant="filled"
          />
        </View>
      )}

      {myListings.length === 0 ? (
        <EmptyState
          icon="cube-outline"
          title="No cargo listed yet"
          description="Start by listing your first cargo to begin shipping"
          actionText="+ List Your First Cargo"
          onActionPress={() => navigation.navigate('ListCargo')}
        />
      ) : filteredListings.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No matching cargo"
          description="Try adjusting your search query"
          actionText="Clear Search"
          onActionPress={() => setSearchQuery('')}
        />
      ) : (
        <FlatList
          data={filteredListings}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <Animated.View style={animations.getFloatingCardStyle(index % 6)}>
              <Card>
                <TouchableOpacity onPress={() => navigation.navigate('CargoDetails', { cargoId: item._id || item.id })}>
                  <View style={styles.cropHeader}>
                    <Text style={[styles.cropName, { color: theme.text }]}>{item.name}</Text>
                    <Badge
                      label={item.status}
                      variant={item.status === 'listed' ? 'primary' : item.status === 'matched' ? 'success' : 'gray'}
                      size="sm"
                    />
                  </View>
                  <Text style={[styles.cropDetail, { color: theme.textSecondary }]}>
                    Quantity: {item.quantity} {item.unit}
                  </Text>
                  {item.pricePerUnit && (
                    <Text style={[styles.cropDetail, { color: theme.textSecondary }]}>
                      Price: {item.pricePerUnit} RWF/{item.unit}
                    </Text>
                  )}
                  <Text style={[styles.cropDetail, { color: theme.textSecondary }]}>
                    Ready: {new Date(item.readyDate).toLocaleDateString()}
                  </Text>
                  <Text style={[styles.cropLocation, { color: theme.textSecondary }]}>
                    📍 {item.location.address}
                  </Text>
                </TouchableOpacity>

                <Divider spacing="sm" />

                <Button
                  title="Delete Cargo"
                  onPress={() => {
                    console.log('%c🎯 DELETE BUTTON ONPRESS FIRED!', 'color: #FF6B6B; font-size: 16px; font-weight: bold');
                    handleDelete(item._id || item.id, item.name);
                  }}
                  variant="danger"
                  size="sm"
                  fullWidth
                  icon={<Ionicons name="trash-outline" size={16} color="#fff" />}
                />
              </Card>
            </Animated.View>
          )}
        />
      )}
      
      <ConfirmDialog
        visible={dialogVisible}
        title="Delete Cargo"
        message={`Are you sure you want to delete "${pendingDeleteName}"?`}
        cancelText="Cancel"
        confirmText="Delete"
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isDestructive={true}
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 30,
  },
  addButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    padding: 15,
  },
  cropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cropName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cropDetail: {
    fontSize: 14,
    marginBottom: 5,
  },
  cropLocation: {
    fontSize: 12,
    marginTop: 5,
  },
  deleteButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});