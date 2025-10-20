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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import {
  initiateMomoPayment,
  validateMomoPhone,
  formatPhoneNumber,
  mockMomoPayment,
} from '../services/momoService';

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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'processing' | 'success'>('input');

  const handlePayment = async () => {
    // Validate phone number
    const validation = validateMomoPhone(phoneNumber);
    if (!validation.valid) {
      Alert.alert('Invalid Phone Number', validation.message || 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setStep('processing');

    try {
      // Use mock payment for demo (replace with real API when backend is ready)
      const result = await mockMomoPayment({
        amount,
        phoneNumber,
        orderId,
        currency: 'RWF',
      });

      if (result.success && result.transactionId) {
        setStep('success');
        setTimeout(() => {
          onSuccess(result.transactionId!);
          handleClose();
        }, 2000);
      } else {
        setStep('input');
        onError(result.message);
        Alert.alert('Payment Failed', result.message);
      }
    } catch (error: any) {
      setStep('input');
      onError(error.message || 'Payment failed');
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
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
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
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
                    onChangeText={(text) => setPhoneNumber(text.replace(/\D/g, ''))}
                    keyboardType="phone-pad"
                    maxLength={12} // 078 812 3456 = 12 chars with spaces
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
                    Supported providers:
                  </Text>
                  <View style={styles.providers}>
                    <View style={[styles.providerBadge, { backgroundColor: theme.warning + '20' }]}>
                      <Text style={[styles.providerText, { color: theme.warning }]}>MTN MoMo</Text>
                    </View>
                    <View style={[styles.providerBadge, { backgroundColor: theme.error + '20' }]}>
                      <Text style={[styles.providerText, { color: theme.error }]}>Airtel Money</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { borderColor: theme.border }]}
                  onPress={handleClose}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.payButton, { backgroundColor: theme.secondary }]}
                  onPress={handlePayment}
                  disabled={loading || phoneNumber.length < 9}
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