import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  FlatList,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Toast from '../../components/Toast';
import * as backendRatingService from '../../services/backendRatingService';
import { logger } from '../../utils/logger';

interface OrderToRate {
  id: string;
  cargoId: string;
  status: string;
  transporterName: string;
  transporterId: string;
  location: string;
  weight: string;
  isVerified?: boolean;
  createdAt?: string;
}

const RateTransporterScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Get orders from Redux store
  const orders = useAppSelector((state: any) => state.orders?.orders || []);

  // Filter completed/delivered orders that haven't been rated yet
  const completedOrders = useMemo(() => {
    return orders
      .filter(
        (order: any) =>
          (order.status === 'completed' || order.status === 'delivered') &&
          order.transporter
      )
      .map((order: any) => ({
        id: order.id,
        cargoId: order.cargoId || `CARGO_${order.id}`,
        status: order.status,
        transporterName: order.transporter?.name || 'Unknown',
        transporterId: order.transporter?.id || '',
        location: order.destination || order.pickupLocation || '',
        weight: order.totalWeight || order.cargoWeight || 'N/A',
        isVerified: order.transporter?.verified || false,
        createdAt: order.completedAt || order.createdAt,
      }))
      .slice(0, 10);
  }, [orders]);

  const selectedOrder = selectedOrderId
    ? completedOrders.find((o) => o.id === selectedOrderId)
    : null;

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setRating(0);
    setComment('');
  };

  const handleSubmitRating = async () => {
    if (!selectedOrder) return;

    if (rating === 0) {
      showToast('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit rating to backend API
      await backendRatingService.createRating({
        ratedUserId: selectedOrder.transporterId,
        tripId: selectedOrder.id,
        rating,
        comment,
      });

      logger.info('Rating submitted successfully', {
        orderId: selectedOrder.id,
        rating,
      });

      showToast('Rating submitted successfully! 🎉');

      // Reset form and deselect order
      setTimeout(() => {
        setSelectedOrderId(null);
        setRating(0);
        setComment('');
      }, 1500);
    } catch (error: any) {
      logger.error('Failed to submit rating', error);
      const errorMessage = error?.message || 'Failed to submit rating. Please try again.';
      showToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Transporter</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.content}
      >
        {selectedOrder ? (
          // Rating Form View
          <View>
            {/* Order Card */}
            <View style={[styles.orderCard, { backgroundColor: theme.card }]}>
              <View style={styles.orderCardHeader}>
                <View>
                  <Text style={[styles.orderLabel, { color: theme.textSecondary }]}>
                    Order
                  </Text>
                  <Text style={[styles.cargoId, { color: theme.text }]}>
                    {selectedOrder.cargoId}
                  </Text>
                </View>
                <Badge label={selectedOrder.status.toUpperCase()} variant="success" />
              </View>
              <Text style={[styles.orderDetail, { color: theme.textSecondary }]}>
                {selectedOrder.weight} • {selectedOrder.location}
              </Text>
            </View>

            {/* Transporter Info */}
            <View style={[styles.transporterInfo, { backgroundColor: theme.card }]}>
              <Avatar
                name={selectedOrder.transporterName}
                size="lg"
                icon="car-sport"
              />
              <View style={styles.transporterDetails}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[styles.transporterName, { color: theme.text }]}>
                    {selectedOrder.transporterName}
                  </Text>
                  {selectedOrder.isVerified && (
                    <Badge label="Verified" variant="success" size="sm" />
                  )}
                </View>
                <Text style={[styles.transporterRole, { color: theme.textSecondary }]}>
                  Transporter
                </Text>
              </View>
            </View>

            {/* Rating Stars Section */}
            <View style={styles.ratingSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                How was your experience?
              </Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={48}
                      color={star <= rating ? '#FFC107' : theme.textSecondary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {rating > 0 && (
                <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </Text>
              )}
            </View>

            {/* Comment Section */}
            <View style={styles.commentSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Leave a comment (Optional)
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                Help other farmers by sharing your experience
              </Text>
              <TextInput
                style={[
                  styles.commentInput,
                  {
                    backgroundColor: theme.card,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Share your experience with this transporter..."
                placeholderTextColor={theme.textSecondary}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                title="Back"
                onPress={() => setSelectedOrderId(null)}
                variant="secondary"
                size="lg"
                style={{ flex: 1 }}
              />
              <Button
                title="Submit Rating"
                onPress={handleSubmitRating}
                variant="primary"
                size="lg"
                style={{ flex: 1 }}
                loading={isSubmitting}
                disabled={rating === 0 || isSubmitting}
                icon={<Ionicons name="send" size={20} color="#fff" />}
              />
            </View>
          </View>
        ) : (
          // Orders List View
          <View>
            {completedOrders.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={64}
                  color={theme.textSecondary}
                />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  No Orders to Rate
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  Once you have completed deliveries, you can rate the transporters here.
                </Text>
              </View>
            ) : (
              <View>
                <Text style={[styles.listTitle, { color: theme.text }]}>
                  Completed Orders
                </Text>
                <Text style={[styles.listSubtitle, { color: theme.textSecondary }]}>
                  Select an order to rate the transporter
                </Text>

                <View style={styles.ordersList}>
                  {completedOrders.map((order) => (
                    <Pressable
                      key={order.id}
                      onPress={() => handleSelectOrder(order.id)}
                      style={({ pressed }) => [
                        styles.orderItem,
                        {
                          backgroundColor: theme.card,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <View style={styles.orderItemLeft}>
                        <Ionicons
                          name="cube"
                          size={32}
                          color={theme.primary}
                        />
                        <View style={styles.orderItemInfo}>
                          <Text style={[styles.orderItemTitle, { color: theme.text }]}>
                            {order.cargoId}
                          </Text>
                          <Text
                            style={[styles.orderItemSubtitle, { color: theme.textSecondary }]}
                            numberOfLines={1}
                          >
                            {order.weight} • {order.location}
                          </Text>
                        </View>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color={theme.textSecondary}
                      />
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Spacing for action button */}
        {selectedOrder && <View style={{ height: 20 }} />}
      </ScrollView>

      {/* Floating Action Button Bar */}
      {!selectedOrder && completedOrders.length > 0 && (
        <View style={[styles.actionBar, { backgroundColor: theme.primary }]}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSelectOrder(completedOrders[0].id)}
          >
            <Ionicons name="star" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Rate Transporter</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Toast */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  // List View
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  listSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  ordersList: {
    gap: 12,
    marginBottom: 100,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  orderItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  orderItemSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  // Order Card in Rating Form
  orderCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  cargoId: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  orderDetail: {
    fontSize: 13,
    marginTop: 4,
  },
  // Transporter Info
  transporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  transporterDetails: {
    marginLeft: 16,
    flex: 1,
  },
  transporterName: {
    fontSize: 18,
    fontWeight: '700',
  },
  transporterRole: {
    fontSize: 14,
    marginTop: 4,
  },
  // Rating Section
  ratingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Comment Section
  commentSection: {
    marginBottom: 24,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    minHeight: 100,
  },
  // Actions
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  // Action Bar
  actionBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default RateTransporterScreen;