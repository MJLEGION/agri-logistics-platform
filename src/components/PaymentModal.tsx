// src/components/PaymentModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import {
  initiateFlutterwavePayment,
  checkFlutterwavePaymentStatus,
  detectPaymentProvider,
  getProviderName,
  formatPhoneNumber,
} from '../services/flutterwaveService';

interface PaymentModalProps {
  visible: boolean;
  amount: number;
  orderId: string;
  userEmail: string;
  userName?: string;
  purpose: 'shipping' | 'payout'; // 'shipping' for cargo payment, 'payout' for earnings withdrawal
  onSuccess: (transactionId: string, referenceId: string) => void;
  onCancel: () => void;
}

const { width } = Dimensions.get('window');

export default function PaymentModal({
  visible,
  amount,
  orderId,
  userEmail,
  userName = 'User',
  purpose,
  onSuccess,
  onCancel,
}: PaymentModalProps) {
  const { theme } = useTheme();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [referenceId, setReferenceId] = useState('');
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [pollCount, setPollCount] = useState(0);

  const detectedProvider = phoneNumber ? detectPaymentProvider(phoneNumber) : null;
  const providerName = detectedProvider ? getProviderName(detectedProvider) : 'MTN MoMo';

  const handleInitiatePayment = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    const phoneValidation = /^\+?250\d{9}$|^\d{10}$/.test(phoneNumber.replace(/\D/g, ''));
    if (!phoneValidation) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('pending');

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const paymentMethod = detectPaymentProvider(formattedPhone);

      console.log('💳 Initiating payment...', {
        amount,
        phone: formattedPhone,
        method: paymentMethod,
      });

      const response = await initiateFlutterwavePayment({
        amount,
        phoneNumber: formattedPhone,
        orderId,
        email: userEmail,
        firstName: userName.split(' ')[0],
        lastName: userName.split(' ')[1] || '',
        currency: 'RWF',
        paymentMethod,
      });

      console.log('💳 Payment response:', response);

      if (response.success && response.referenceId) {
        setReferenceId(response.referenceId);
        startStatusPolling(response.referenceId);

        // Show prompt confirmation dialog
        Alert.alert(
          '📲 Payment Prompt Sent',
          `You will receive a ${providerName} payment prompt on ${formattedPhone}\n\nEnter your PIN to confirm payment.`,
          [
            {
              text: 'I See The Prompt',
              onPress: () => {
                console.log('✅ User confirmed receiving the prompt');
              },
            },
            {
              text: 'Cancel',
              onPress: () => {
                cancelPayment();
              },
              style: 'cancel',
            },
          ]
        );
      } else {
        setPaymentStatus('failed');
        Alert.alert('Error', response.message || 'Failed to initiate payment');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      setPaymentStatus('failed');
      Alert.alert('Error', 'Payment initiation failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const startStatusPolling = (refId: string) => {
    let count = 0;
    const maxAttempts = 60; // 5 minutes (60 * 5 seconds)

    const interval = setInterval(async () => {
      count++;
      setPollCount(count);

      try {
        console.log(`🔍 Checking payment status... (attempt ${count}/${maxAttempts})`);

        const status = await checkFlutterwavePaymentStatus(refId);

        if (status.success || status.status === 'completed') {
          console.log('✅ Payment successful!', status);
          setPaymentStatus('success');
          clearInterval(interval);
          setPollingInterval(null);
          setIsProcessing(false);

          // Success feedback
          setTimeout(() => {
            Alert.alert(
              '✅ Payment Successful!',
              'Your transaction has been completed successfully.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    onSuccess(
                      status.transactionId || refId,
                      status.referenceId || refId
                    );
                    resetModal();
                  },
                },
              ]
            );
          }, 500);
        } else if (status.status === 'failed') {
          console.log('❌ Payment failed');
          setPaymentStatus('failed');
          clearInterval(interval);
          setPollingInterval(null);
          setIsProcessing(false);

          Alert.alert(
            '❌ Payment Failed',
            status.message || 'Your payment could not be processed. Please try again.'
          );
        } else if (count >= maxAttempts) {
          console.log('⏱️ Payment polling timeout');
          setPaymentStatus('failed');
          clearInterval(interval);
          setPollingInterval(null);
          setIsProcessing(false);

          Alert.alert(
            '⏱️ Payment Timeout',
            'Payment is taking longer than expected. Please check your phone and try again.'
          );
        }
      } catch (error) {
        console.error('❌ Status check error:', error);
        // Continue polling on error
      }
    }, 5000); // Poll every 5 seconds

    setPollingInterval(interval);
  };

  const cancelPayment = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setPaymentStatus('idle');
    setIsProcessing(false);
    setPhoneNumber('');
    setPollCount(0);
  };

  const resetModal = () => {
    cancelPayment();
    setReferenceId('');
  };

  const handleClose = () => {
    if (isProcessing) {
      Alert.alert(
        'Payment In Progress',
        'A payment is being processed. Are you sure you want to cancel?',
        [
          { text: 'Continue Processing', style: 'cancel' },
          {
            text: 'Cancel Payment',
            onPress: () => {
              cancelPayment();
              onCancel();
            },
            style: 'destructive',
          },
        ]
      );
    } else {
      resetModal();
      onCancel();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={[styles.container, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modal, { backgroundColor: theme.card }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]}>
              💳 {purpose === 'shipping' ? 'Pay for Shipping' : 'Request Payout'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {paymentStatus === 'idle' && (
              <>
                {/* Amount Section */}
                <View style={[styles.section, { backgroundColor: theme.background }]}>
                  <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                    Amount to Pay
                  </Text>
                  <Text style={[styles.amountText, { color: '#F59E0B' }]}>
                    {amount.toLocaleString()} RWF
                  </Text>
                </View>

                {/* Phone Number Section */}
                <View style={styles.section}>
                  <Text style={[styles.label, { color: theme.text }]}>Phone Number</Text>
                  <View
                    style={[
                      styles.inputGroup,
                      {
                        borderColor: detectedProvider ? '#10B981' : theme.border,
                        backgroundColor: theme.background,
                      },
                    ]}
                  >
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      placeholder="0788123456"
                      placeholderTextColor={theme.textSecondary}
                      keyboardType="phone-pad"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      editable={!isProcessing}
                    />
                    {detectedProvider && (
                      <View style={[styles.providerBadge, { backgroundColor: '#10B98120' }]}>
                        <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                        <Text style={[styles.providerText, { color: '#10B981' }]}>
                          {providerName}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.helpText, { color: theme.textSecondary }]}>
                    Format: 0788123456 or +250788123456
                  </Text>
                </View>

                {/* Info */}
                <View
                  style={[
                    styles.infoBox,
                    { backgroundColor: '#3B82F620', borderColor: '#3B82F6' },
                  ]}
                >
                  <Ionicons name="information-circle" size={20} color="#3B82F6" />
                  <Text style={[styles.infoText, { color: theme.text }]}>
                    You'll receive a payment prompt on your phone. Enter your PIN to confirm.
                  </Text>
                </View>

                {/* Button */}
                <TouchableOpacity
                  style={[
                    styles.payButton,
                    {
                      backgroundColor: detectedProvider ? '#F59E0B' : '#ccc',
                    },
                  ]}
                  onPress={handleInitiatePayment}
                  disabled={!detectedProvider || isProcessing}
                >
                  <Text style={styles.payButtonText}>
                    {isProcessing ? 'Processing...' : 'Pay Now'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                  <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {paymentStatus === 'pending' && (
              <View style={styles.statusContainer}>
                <ActivityIndicator size="large" color="#F59E0B" />
                <Text style={[styles.statusText, { color: theme.text }]}>
                  Waiting for payment confirmation...
                </Text>
                <Text style={[styles.statusSubtext, { color: theme.textSecondary }]}>
                  Check your phone ({phoneNumber})
                </Text>
                <Text style={[styles.pollText, { color: theme.textSecondary }]}>
                  Attempt {pollCount}/60
                </Text>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={cancelPayment}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.error }]}>
                    Cancel Payment
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {paymentStatus === 'success' && (
              <View style={styles.statusContainer}>
                <Text style={styles.successIcon}>✅</Text>
                <Text style={[styles.statusText, { color: '#10B981' }]}>
                  Payment Successful!
                </Text>
                <Text style={[styles.statusSubtext, { color: theme.textSecondary }]}>
                  Transaction ID: {referenceId.substring(0, 12)}...
                </Text>
              </View>
            )}

            {paymentStatus === 'failed' && (
              <View style={styles.statusContainer}>
                <Text style={styles.failureIcon}>❌</Text>
                <Text style={[styles.statusText, { color: theme.error }]}>
                  Payment Failed
                </Text>
                <Text style={[styles.statusSubtext, { color: theme.textSecondary }]}>
                  Please try again or use a different payment method
                </Text>
                <TouchableOpacity
                  style={[styles.payButton, { backgroundColor: '#F59E0B' }]}
                  onPress={() => {
                    setPaymentStatus('idle');
                    setPhoneNumber('');
                    setPollCount(0);
                  }}
                >
                  <Text style={styles.payButtonText}>Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                  <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  amountText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputGroup: {
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
    gap: 4,
  },
  providerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  payButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  failureIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusSubtext: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  pollText: {
    fontSize: 12,
    marginTop: 12,
  },
});