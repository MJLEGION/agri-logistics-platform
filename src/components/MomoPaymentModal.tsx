// src/components/MomoPaymentModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { showToast } from '../services/toastService';
import { ConfirmDialog } from './common/ConfirmDialog';
import { useAppSelector } from '../store';
import {
  initiateMockPayment,
  checkMockPaymentStatus,
  formatPhoneNumber,
  detectPaymentProvider,
  getProviderName,
  getCachedMockPayment,
} from '../services/mockPaymentService';

interface MomoPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  amount: number;
  orderId: string;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
}

export const MomoPaymentModal: React.FC<MomoPaymentModalProps> = ({
  visible,
  onClose,
  amount,
  orderId,
  onSuccess,
  onError,
}) => {
  const { theme } = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'processing' | 'success' | 'confirm'>('input');
  const [detectedProvider, setDetectedProvider] = useState<'momo' | 'airtel' | null>(null);
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const [showPaymentPromptDialog, setShowPaymentPromptDialog] = useState(false);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  const [currentReferenceId, setCurrentReferenceId] = useState<string>('');

  // Handle phone number change and detect provider
  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    setPhoneNumber(cleaned);
    
    // Detect provider when user enters full number
    if (cleaned.length >= 9) {
      const provider = detectPaymentProvider('+250' + cleaned);
      setDetectedProvider(provider);
    } else {
      setDetectedProvider(null);
    }
  };

  // Validate phone number with proper error messages
  const validatePhoneNumber = (): { valid: boolean; message?: string } => {
    if (!phoneNumber) {
      return { valid: false, message: 'Please enter your phone number' };
    }

    if (phoneNumber.length < 9) {
      return { valid: false, message: 'Phone number must be 9 digits' };
    }

    const formatted = formatPhoneNumber(phoneNumber);
    const prefix = formatted.substring(4, 7);
    const validPrefixes = ['078', '079', '073', '072', '075'];

    if (!validPrefixes.includes(prefix)) {
      return {
        valid: false,
        message: 'Please use MTN (078/079) or Airtel (073/072) number',
      };
    }

    return { valid: true };
  };

  // Poll for payment status
  const pollPaymentStatus = async (referenceId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals

    const interval = setInterval(async () => {
      attempts++;

      try {
        const statusResult = await checkMockPaymentStatus(referenceId);

        if (statusResult.success && statusResult.status === 'completed') {
          clearInterval(interval);
          setStatusCheckInterval(null);
          
          setStep('success');
          setTimeout(() => {
            onSuccess(statusResult.transactionId || referenceId);
            handleClose();
          }, 1500);
        } else if (statusResult.status === 'failed') {
          clearInterval(interval);
          setStatusCheckInterval(null);
          
          setStep('input');
          setLoading(false);
          onError(statusResult.message);
          showToast.error(`Payment Failed: ${statusResult.message}`);
        }

        // Max attempts reached, still pending
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setStatusCheckInterval(null);

          setStep('input');
          setLoading(false);
          setShowTimeoutDialog(true);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setStatusCheckInterval(null);
        }
      }
    }, 5000); // Check every 5 seconds

    setStatusCheckInterval(interval);
  };

  const handlePayment = async () => {
    // Validate phone number
    const validation = validatePhoneNumber();
    if (!validation.valid) {
      showToast.error(validation.message || 'Please enter a valid phone number');
      return;
    }

    if (!detectedProvider) {
      showToast.error('Could not detect payment provider. Please check your number.');
      return;
    }

    if (!user?.email) {
      showToast.error('Email is required for payment processing');
      return;
    }

    setLoading(true);
    setStep('processing');

    try {
      // Initiate mock payment (demo mode - no real API needed)
      const result = await initiateMockPayment({
        amount,
        phoneNumber: formatPhoneNumber(phoneNumber),
        orderId,
        email: user.email,
        firstName: user.firstName || 'Customer',
        lastName: user.lastName || '',
        currency: 'RWF',
        paymentMethod: detectedProvider,
      });

      if (result.success && result.referenceId) {
        // User will receive payment prompt on their phone
        setCurrentReferenceId(result.referenceId);
        setShowPaymentPromptDialog(true);
      } else {
        setStep('input');
        setLoading(false);
        onError(result.message);
        showToast.error(`Payment Error: ${result.message}`);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setStep('input');
      setLoading(false);
      onError(error.message || 'Payment failed');
      showToast.error('An error occurred during payment. Please try again.');
    }
  };

  const handleConfirmPaymentPrompt = () => {
    setShowPaymentPromptDialog(false);
    if (currentReferenceId) {
      pollPaymentStatus(currentReferenceId);
    }
  };

  const handleCancelPaymentPrompt = () => {
    setShowPaymentPromptDialog(false);
    setStep('input');
    setLoading(false);
  };

  const handleConfirmTimeout = () => {
    setShowTimeoutDialog(false);
    showToast.warning('Payment timeout - Your order may still be processing');
    onError('Payment timeout');
  };

  const handleClose = () => {
    // Clean up polling interval
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
      setStatusCheckInterval(null);
    }
    setPhoneNumber('');
    setStep('input');
    setLoading(false);
    onClose();
  };

  const formatDisplayPhone = (text: string) => {
    // Auto-format as user types: 078 812 3456
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: theme.secondary + '20' }]}>
              <Ionicons name="phone-portrait" size={32} color={theme.secondary} />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Mobile Money Payment</Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close payment modal"
              accessibilityHint="Dismiss mobile money payment screen"
            >
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {step === 'input' && (
            <>
              <View style={styles.content}>
                <View style={[styles.amountCard, { backgroundColor: theme.secondary + '15' }]}>
                  <Text style={[styles.amountLabel, { color: theme.textSecondary }]}>
                    Amount to Pay
                  </Text>
                  <Text style={[styles.amount, { color: theme.secondary }]}>
                    {amount.toLocaleString()} RWF
                  </Text>
                </View>

                <Text style={[styles.label, { color: theme.text }]}>Mobile Money Number</Text>
                <View style={[styles.inputContainer, { borderColor: theme.border }]}>
                  <View style={styles.prefixContainer}>
                    <Text style={[styles.prefix, { color: theme.textSecondary }]}>+250</Text>
                  </View>
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="078 XXX XXXX"
                    placeholderTextColor={theme.textSecondary}
                    value={formatDisplayPhone(phoneNumber)}
                    onChangeText={handlePhoneChange}
                    keyboardType="phone-pad"
                    maxLength={12} // 078 812 3456 = 12 chars with spaces
                    editable={!loading}
                  />
                </View>

                <View style={[styles.infoBox, { backgroundColor: theme.info + '15' }]}>
                  <Ionicons name="information-circle" size={20} color={theme.info} />
                  <Text style={[styles.infoText, { color: theme.text }]}>
                    You'll receive a prompt on your phone to confirm the payment
                  </Text>
                </View>

                <View style={styles.providersContainer}>
                  <Text style={[styles.providersLabel, { color: theme.textSecondary }]}>
                    {detectedProvider ? 'Detected provider:' : 'Supported providers:'}
                  </Text>
                  <View style={styles.providers}>
                    {detectedProvider ? (
                      // Show only detected provider
                      <View
                        style={[
                          styles.providerBadge,
                          {
                            backgroundColor:
                              detectedProvider === 'momo'
                                ? theme.warning + '30'
                                : theme.error + '30',
                          },
                        ]}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={detectedProvider === 'momo' ? theme.warning : theme.error}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={[
                            styles.providerText,
                            {
                              color:
                                detectedProvider === 'momo'
                                  ? theme.warning
                                  : theme.error,
                              fontWeight: 'bold',
                            },
                          ]}
                        >
                          {detectedProvider === 'momo' ? 'MTN MoMo' : 'Airtel Money'}
                        </Text>
                      </View>
                    ) : (
                      <>
                        <View style={[styles.providerBadge, { backgroundColor: theme.warning + '20' }]}>
                          <Text style={[styles.providerText, { color: theme.warning }]}>
                            MTN MoMo
                          </Text>
                        </View>
                        <View style={[styles.providerBadge, { backgroundColor: theme.error + '20' }]}>
                          <Text style={[styles.providerText, { color: theme.error }]}>
                            Airtel Money
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { borderColor: theme.border }]}
                  onPress={handleClose}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel payment"
                  accessibilityHint="Close payment modal without paying"
                >
                  <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.payButton, { backgroundColor: theme.secondary }]}
                  onPress={handlePayment}
                  disabled={loading || phoneNumber.length < 9}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Pay now"
                  accessibilityHint={`Initiate ${amount.toLocaleString()} RWF payment via mobile money`}
                  accessibilityState={{ disabled: loading || phoneNumber.length < 9, busy: loading }}
                >
                  <Text style={styles.payButtonText}>Pay Now</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === 'processing' && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color={theme.secondary} />
              <Text style={[styles.processingText, { color: theme.text }]}>
                Processing payment...
              </Text>
              <Text style={[styles.processingSubtext, { color: theme.textSecondary }]}>
                Please check your phone for the payment prompt
              </Text>
            </View>
          )}

          {step === 'success' && (
            <View style={styles.successContainer}>
              <View style={[styles.successIcon, { backgroundColor: theme.success + '20' }]}>
                <Ionicons name="checkmark-circle" size={64} color={theme.success} />
              </View>
              <Text style={[styles.successText, { color: theme.success }]}>
                Payment Successful!
              </Text>
              <Text style={[styles.successSubtext, { color: theme.textSecondary }]}>
                Your order has been confirmed
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Payment Prompt Confirmation Dialog */}
      <ConfirmDialog
        visible={showPaymentPromptDialog}
        title="Payment Initiated 📱"
        message={`You will receive a payment prompt on ${formatPhoneNumber(phoneNumber)}. Please confirm to complete payment.`}
        cancelText="Cancel"
        confirmText="I See The Prompt"
        onCancel={handleCancelPaymentPrompt}
        onConfirm={handleConfirmPaymentPrompt}
        isDestructive={false}
      />

      {/* Payment Timeout Dialog */}
      <ConfirmDialog
        visible={showTimeoutDialog}
        title="Payment Timeout"
        message="We are still waiting for payment confirmation. Your order may still be processing."
        confirmText="OK"
        onCancel={() => setShowTimeoutDialog(false)}
        onConfirm={handleConfirmTimeout}
        isDestructive={false}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    position: 'relative',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  amountCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  prefixContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  prefix: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  providersContainer: {
    marginTop: 8,
  },
  providersLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  providers: {
    flexDirection: 'row',
    gap: 8,
  },
  providerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  providerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  payButton: {},
  payButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  processingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  processingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  processingSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  successContainer: {
    padding: 40,
    alignItems: 'center',
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 14,
  },
});