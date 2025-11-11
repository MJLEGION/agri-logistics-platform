import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Pressable,
} from 'react-native';
import { ratingService } from '../../services/ratingService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useScreenAnimations } from '../../hooks/useScreenAnimations';
import { useTheme } from '../../contexts/ThemeContext';
import { showToast } from '../../services/toastService';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

interface RatingScreenProps {
  transactionId: string;
  transporterId: string;
  transporterName: string;
  farmerId: string;
  farmerName: string;
}

const RatingScreen: React.FC<RatingScreenProps> = ({
  transactionId,
  transporterId,
  transporterName,
  farmerId,
  farmerName,
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const animations = useScreenAnimations(3); // ✨ Pizzazz animations
  
  // Get params from route if not passed directly
  const params = route?.params as RatingScreenProps;
  const actualTransactionId = transactionId || params?.transactionId;
  const actualTransporterId = transporterId || params?.transporterId;
  const actualTransporterName = transporterName || params?.transporterName;
  const actualFarmerId = farmerId || params?.farmerId;
  const actualFarmerName = farmerName || params?.farmerName;

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);

  const maxCommentLength = 1000;
  const minCommentLength = 0;

  const handleStarPress = (value: number) => {
    setRating(value);
  };

  const handleStarHover = (value: number) => {
    setHoverRating(value);
  };

  const displayRating = hoverRating || rating;

  const handleSubmitRating = async () => {
    // Validation
    if (rating === 0) {
      showToast.error('Please select a rating (1-5 stars)');
      return;
    }

    if (comment.length > maxCommentLength) {
      showToast.error(`Comment cannot exceed ${maxCommentLength} characters`);
      return;
    }

    setLoading(true);

    try {
      // Create the rating
      const ratingData = {
        transactionId: actualTransactionId,
        transporterId: actualTransporterId,
        farmerId: actualFarmerId,
        farmerName: actualFarmerName,
        transporterName: actualTransporterName,
        rating,
        comment: comment.trim() || undefined,
        timestamp: new Date().toISOString(),
        source: 'mobile_app',
      };

      await ratingService.createRating(
        actualTransactionId,
        actualTransporterId,
        actualFarmerId,
        actualFarmerName,
        rating,
        comment.trim() || undefined
      );

      setSubmitted(true);

      showToast.success(`Your ${rating}-star rating has been submitted! Thank you for your feedback.`);

      // Reset form and navigate home
      setTimeout(() => {
        setRating(0);
        setComment('');
        setSubmitted(false);
        navigation.navigate('Home');
      }, 1000);
    } catch (error) {
      console.error('Error submitting rating:', error);
      showToast.error(
        error instanceof Error ? error.message : 'Failed to submit rating. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const StarRating = () => (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleStarPress(index)}
          onMouseEnter={() => handleStarHover(index)}
          onMouseLeave={() => setHoverRating(0)}
          style={styles.starButton}
        >
          <Text
            style={[
              styles.star,
              {
                fontSize: 48,
                color: index <= displayRating ? '#FFD700' : '#E0E0E0',
              },
            ]}
          >
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const RatingLabel = () => {
    const labels: { [key: number]: string } = {
      0: 'Select a rating',
      1: 'Poor - Not satisfied',
      2: 'Fair - Some issues',
      3: 'Good - Acceptable',
      4: 'Great - Very satisfied',
      5: 'Excellent - Outstanding',
    };
    return <Text style={styles.ratingLabel}>{labels[displayRating]}</Text>;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Rate Your Experience</Text>
            <Text style={styles.subtitle}>How was your delivery with {actualTransporterName}?</Text>
          </View>

          {/* Star Rating Section */}
          <View style={styles.section}>
            <StarRating />
            <RatingLabel />
          </View>

          {/* Comment Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add a Comment (Optional)</Text>
            <Text style={styles.sectionSubtitle}>
              Share details about your experience to help improve the service
            </Text>

            <TextInput
              style={styles.commentInput}
              placeholder={`What was your experience like? (0-${maxCommentLength} characters)`}
              placeholderTextColor="#999"
              multiline
              numberOfLines={5}
              value={comment}
              onChangeText={setComment}
              maxLength={maxCommentLength}
              editable={!loading}
            />

            <View style={styles.charCounterContainer}>
              <Text
                style={[
                  styles.charCounter,
                  comment.length > maxCommentLength * 0.9 && styles.charCounterWarning,
                ]}
              >
                {comment.length} / {maxCommentLength} characters
              </Text>
            </View>
          </View>

          {/* Benefits Section */}
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>Your feedback helps:</Text>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>✓</Text>
              <Text style={styles.benefitText}>Improve service quality</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>✓</Text>
              <Text style={styles.benefitText}>Build trust in the community</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>✓</Text>
              <Text style={styles.benefitText}>Help others find reliable transporters</Text>
            </View>
          </View>

          {/* Privacy Notice */}
          <View style={styles.privacyNotice}>
            <Text style={styles.privacyText}>
              💡 Your rating is public and helps the community. Your identity is visible to other users.
            </Text>
          </View>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (loading || rating === 0) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmitRating}
              disabled={loading || rating === 0}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="large" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {rating === 0 ? 'Select a Rating to Continue' : `Submit ${rating}-Star Rating`}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => setShowSkipDialog(true)}
              disabled={loading}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Skip rating"
              accessibilityHint="Skip rating and go to home screen"
              accessibilityState={{ disabled: loading }}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </View>

          {/* Transaction Details */}
          <View style={styles.transactionDetails}>
            <Text style={styles.detailsTitle}>Transaction Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transporter:</Text>
              <Text style={styles.detailValue}>{actualTransporterName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID:</Text>
              <Text style={styles.detailValue}>{actualTransactionId.substring(0, 12)}...</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Delivery Date:</Text>
              <Text style={styles.detailValue}>{new Date().toLocaleDateString()}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Skip Rating Confirmation Dialog */}
      <ConfirmDialog
        visible={showSkipDialog}
        title="Skip Rating?"
        message="Your feedback helps the transporter improve. Are you sure you want to skip?"
        cancelText="Cancel"
        confirmText="Skip"
        onCancel={() => setShowSkipDialog(false)}
        onConfirm={() => {
          setShowSkipDialog(false);
          navigation.navigate('Home');
        }}
        isDestructive={true}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  starButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  star: {
    fontSize: 48,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
    textAlign: 'center',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#000',
    textAlignVertical: 'top',
    maxHeight: 150,
  },
  charCounterContainer: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  charCounter: {
    fontSize: 12,
    color: '#999',
  },
  charCounterWarning: {
    color: '#FF9800',
    fontWeight: '600',
  },
  benefitsSection: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitBullet: {
    fontSize: 14,
    color: '#4CAF50',
    marginRight: 8,
    fontWeight: 'bold',
  },
  benefitText: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  privacyNotice: {
    backgroundColor: '#FFF9C4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#FBC02D',
  },
  privacyText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  transactionDetails: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
  },
});

export default RatingScreen;