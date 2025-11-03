import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import Button from './Button';
import Avatar from './Avatar';
import Badge from './Badge';

interface RateTransporterModalProps {
  visible: boolean;
  onClose: () => void;
  transporterName: string;
  transporterId: string;
  orderId: string;
  onSubmitRating: (rating: number, comment: string) => void;
  isVerified?: boolean;
}

const RateTransporterModal: React.FC<RateTransporterModalProps> = ({
  visible,
  onClose,
  transporterName,
  transporterId,
  orderId,
  onSubmitRating,
  isVerified = false,
}) => {
  const { theme } = useTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitRating(rating, comment);
      // Reset form
      setRating(0);
      setComment('');
      onClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text }]}>
                Rate Your Transporter
              </Text>
              <TouchableOpacity onPress={handleCancel}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* Transporter Info */}
            <View style={[styles.transporterInfo, { backgroundColor: theme.card }]}>
              <Avatar
                name={transporterName}
                size="lg"
                icon="car-sport"
              />
              <View style={styles.transporterDetails}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[styles.transporterName, { color: theme.text }]}>
                    {transporterName}
                  </Text>
                  {isVerified && (
                    <Badge label="Verified" variant="success" size="sm" />
                  )}
                </View>
                <Text style={[styles.transporterRole, { color: theme.textSecondary }]}>
                  Transporter
                </Text>
              </View>
            </View>

            {/* Rating Stars */}
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

            {/* Comment/Feedback */}
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
                title="Cancel"
                onPress={handleCancel}
                variant="secondary"
                size="lg"
                style={{ flex: 1 }}
              />
              <Button
                title="Submit Rating"
                onPress={handleSubmit}
                variant="primary"
                size="lg"
                style={{ flex: 1 }}
                loading={isSubmitting}
                disabled={rating === 0 || isSubmitting}
                icon={<Ionicons name="send" size={20} color="#fff" />}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
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
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
});

export default RateTransporterModal;
