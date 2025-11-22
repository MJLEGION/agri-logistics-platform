// src/screens/auth/LoginScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import { login } from '../../store/slices/authSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ModernButton from '../../components/ModernButton';
import Divider from '../../components/Divider';
import Toast, { useToast } from '../../components/Toast';
import Card from '../../components/Card';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { UserRole, LoginScreenProps } from '../../types';
import { Colors, Gradients, Typography, Spacing, BorderRadius, Shadows } from '../../config/designSystem';
import { useLanguage } from '../../contexts/LanguageContext';

const { width, height } = Dimensions.get('window');

// Demo credentials for testing
const DEMO_CREDENTIALS: Record<UserRole, { phone: string; password: string; name: string }> = {
  shipper: {
    phone: '+250788111111',
    password: 'password123',
    name: 'Test Shipper (John Farmer)',
  },
  transporter: {
    phone: '+250789222222',
    password: 'password123',
    name: 'Test Transporter (Mike)',
  },
};

const ROLE_INFO: Record<
  UserRole,
  {
    icon: string;
    label: string;
    description: string;
    gradient: string[];
  }
> = {
  shipper: {
    icon: 'leaf',
    label: 'Shipper',
    description: 'List and ship your cargo',
    gradient: ['#10797D', '#0D5F66'],
  },
  transporter: {
    icon: 'car',
    label: 'Transporter',
    description: 'Deliver crops efficiently',
    gradient: ['#1E8449', '#10797D'],
  },
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { toast, showError, showSuccess, hideToast } = useToast();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('shipper');
  const [errors, setErrors] = useState({ phone: '', password: '' });
  const [previewRole, setPreviewRole] = useState<UserRole | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Animation refs
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 3D Tilt refs for role buttons
  const tiltX1 = useRef(new Animated.Value(0)).current;
  const tiltY1 = useRef(new Animated.Value(0)).current;
  const tiltX2 = useRef(new Animated.Value(0)).current;
  const tiltY2 = useRef(new Animated.Value(0)).current;

  // Floating animation refs
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;

  // Scale animations for press effects
  const scale1 = useRef(new Animated.Value(1)).current;
  const scale2 = useRef(new Animated.Value(1)).current;

  // Confetti ref
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      // Floating animations
      Animated.loop(
        Animated.sequence([
          Animated.timing(float1, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(float1, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(float2, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(float2, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = { phone: '', password: '' };

    if (!phone) {
      newErrors.phone = t('validation.phoneNumberRequired');
      valid = false;
    } else if (phone.length < 10) {
      newErrors.phone = t('validation.phoneNumberInvalid');
      valid = false;
    }

    if (!password) {
      newErrors.password = t('validation.passwordRequired');
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = t('validation.passwordTooShort');
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handlePressIn = (scaleAnim: Animated.Value) => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (scaleAnim: Animated.Value) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // 3D Tilt handler
  const createTiltHandler = (tiltX: Animated.Value, tiltY: Animated.Value, cardWidth: number, cardHeight: number) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const { locationX, locationY } = evt.nativeEvent;
        const centerX = cardWidth / 2;
        const centerY = cardHeight / 2;

        const tiltAngleX = ((locationY - centerY) / centerY) * -10;
        const tiltAngleY = ((locationX - centerX) / centerX) * 10;

        Animated.spring(tiltX, {
          toValue: tiltAngleX,
          friction: 7,
          useNativeDriver: true,
        }).start();

        Animated.spring(tiltY, {
          toValue: tiltAngleY,
          friction: 7,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderRelease: () => {
        Animated.spring(tiltX, {
          toValue: 0,
          friction: 5,
          useNativeDriver: true,
        }).start();

        Animated.spring(tiltY, {
          toValue: 0,
          friction: 5,
          useNativeDriver: true,
        }).start();
      },
    });
  };

  const handleLongPress = (role: UserRole) => {
    setPreviewRole(role);
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await dispatch(login({ phone, password })).unwrap();

      // Trigger confetti
      setShowConfetti(true);
      confettiRef.current?.start();

      showSuccess(t('messages.loginSuccess'));
      // Navigation happens automatically based on user's role
    } catch (err: any) {
      showError(err || t('messages.loginError'));
    }
  };

  const fillDemoCredentials = () => {
    const credentials = DEMO_CREDENTIALS[selectedRole];
    setPhone(credentials.phone);
    setPassword(credentials.password);
    setErrors({ phone: '', password: '' });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header - Gold, White, Green Theme */}
          <LinearGradient
            colors={['#10797D', '#0D5F66', '#10797D']}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Animated Background Pattern */}
            <View style={styles.backgroundPattern}>
              <Animated.View
                style={[
                  styles.circle,
                  styles.circle1,
                  { transform: [{ rotate: spin }] },
                ]}
              />
              <Animated.View
                style={[
                  styles.circle,
                  styles.circle2,
                  {
                    transform: [
                      {
                        rotate: rotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['360deg', '0deg'],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.circle,
                  styles.circle3,
                  { transform: [{ rotate: spin }] },
                ]}
              />
            </View>

            <View style={styles.headerTopBar}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                accessibilityHint="Navigate to previous screen"
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <LanguageSwitcher showLabel={false} size="small" />
            </View>

            <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
              <Image
                source={require('../../../assets/images/logos/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.headerTitle}>{t('common.welcome')}</Text>
              <Text style={styles.headerSubtitle}>{t('auth.loginTitle')}</Text>
            </Animated.View>
          </LinearGradient>

          {/* Role Selection */}
          <View style={[styles.roleSelectionContainer, { backgroundColor: theme.background }]}>
            <Text style={[styles.roleSelectionLabel, { color: theme.text }]}>{t('auth.selectRole')}</Text>
            <View style={styles.roleButtonsContainer}>
              {(['shipper', 'transporter'] as UserRole[]).map((role, index) => {
                const isSelected = selectedRole === role;
                const roleData = ROLE_INFO[role];
                const tiltX = index === 0 ? tiltX1 : tiltX2;
                const tiltY = index === 0 ? tiltY1 : tiltY2;
                const floatAnim = index === 0 ? float1 : float2;
                const scaleAnim = index === 0 ? scale1 : scale2;

                const tiltHandler = createTiltHandler(tiltX, tiltY, 150, 100);

                const animatedStyle = {
                  transform: [
                    { perspective: 1000 },
                    { scale: scaleAnim },
                    {
                      translateY: floatAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -5],
                      }),
                    },
                    {
                      rotateX: tiltX.interpolate({
                        inputRange: [-10, 10],
                        outputRange: ['-10deg', '10deg'],
                      }),
                    },
                    {
                      rotateY: tiltY.interpolate({
                        inputRange: [-10, 10],
                        outputRange: ['-10deg', '10deg'],
                      }),
                    },
                  ],
                };

                return (
                  <Animated.View key={role} style={[{ flex: 1 }, animatedStyle]} {...tiltHandler.panHandlers}>
                    <Pressable
                      style={[
                        styles.roleButton,
                        isSelected && styles.roleButtonSelected,
                        isSelected && { borderColor: roleData.gradient[0] },
                      ]}
                      onPress={() => {
                        setSelectedRole(role);
                        setErrors({ phone: '', password: '' });
                      }}
                      onLongPress={() => handleLongPress(role)}
                      delayLongPress={500}
                      onPressIn={() => handlePressIn(scaleAnim)}
                      onPressOut={() => handlePressOut(scaleAnim)}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${roleData.label} role`}
                      accessibilityHint={`${roleData.description}. Long press for more information`}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <LinearGradient
                        colors={roleData.gradient}
                        style={styles.roleButtonGradient}
                      >
                        <Ionicons name={roleData.icon as any} size={24} color="#FFFFFF" />
                      </LinearGradient>
                      <Text
                        style={[
                          styles.roleButtonText,
                          isSelected && { color: theme.primary, fontWeight: '700' },
                          !isSelected && { color: theme.textSecondary },
                        ]}
                      >
                        {roleData.label}
                      </Text>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {error && (
              <View style={[styles.errorBanner, { backgroundColor: `${theme.error}15` }]}>
                <Ionicons name="alert-circle" size={20} color={theme.error} />
                <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
              </View>
            )}

            {/* Demo Credentials Button */}
            <TouchableOpacity
              style={[styles.demoButton, { backgroundColor: `${theme.primary}15`, borderColor: theme.primary }]}
              onPress={fillDemoCredentials}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Fill demo credentials for ${selectedRole}`}
              accessibilityHint="Automatically fills in test account credentials"
            >
              <Ionicons name="flash" size={16} color={theme.primary} />
              <Text style={[styles.demoButtonText, { color: theme.primary }]}>
                {t('auth.orUseDemo')} ({DEMO_CREDENTIALS[selectedRole].phone})
              </Text>
            </TouchableOpacity>

            <Input
              label={t('common.phoneNumber')}
              placeholder="+250788123456 or +234801234567"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                setErrors({ ...errors, phone: '' });
              }}
              keyboardType="phone-pad"
              icon="call-outline"
              error={errors.phone}
              autoCapitalize="none"
            />

            <Input
              label={t('common.password')}
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors({ ...errors, password: '' });
              }}
              secureTextEntry
              icon="lock-closed-outline"
              error={errors.password}
            />

            <TouchableOpacity
              style={styles.forgotPassword}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Forgot password"
              accessibilityHint="Reset your password"
            >
              <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>
                {t('auth.forgotPassword')}
              </Text>
            </TouchableOpacity>

            <Button
              title={t('auth.signIn')}
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              fullWidth
              size="lg"
              icon={<Ionicons name="log-in-outline" size={20} color="#FFFFFF" />}
              accessibilityLabel="Sign in to your account"
              accessibilityHint={`Sign in as ${selectedRole}`}
            />

            <Divider text="OR" spacing="lg" />

            <View style={styles.registerContainer}>
              <Text style={[styles.registerText, { color: theme.textSecondary }]}>
                {t('auth.noAccount')}{' '}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('RoleSelection')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Create new account"
                accessibilityHint="Navigate to registration screen"
              >
                <Text style={[styles.registerLink, { color: theme.primary }]}>
                  {t('auth.signUp')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Toast Notifications */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* Preview Modal */}
      <Modal
        visible={previewRole !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewRole(null)}
      >
        <TouchableOpacity
          style={styles.previewOverlay}
          activeOpacity={1}
          onPress={() => setPreviewRole(null)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Close preview modal"
          accessibilityHint="Tap to dismiss role preview"
        >
          <View style={styles.previewContent}>
            <Card elevated style={styles.previewCard}>
              {previewRole && (
                <>
                  <View style={styles.previewHeader}>
                    <Text style={[styles.previewTitle, { color: theme.text }]}>
                      {ROLE_INFO[previewRole].label} Preview
                    </Text>
                    <TouchableOpacity
                      onPress={() => setPreviewRole(null)}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Close role preview"
                      accessibilityHint="Dismiss this preview modal"
                    >
                      <Ionicons name="close-circle" size={28} color={theme.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.previewBody}>
                    <Text style={[styles.previewDescription, { color: theme.textSecondary }]}>
                      {previewRole === 'shipper'
                        ? 'As a shipper, you\'ll have access to a dashboard where you can list cargo, manage shipments, track deliveries in real-time, and communicate directly with transporters. You\'ll receive instant notifications when transporters accept your shipments.'
                        : 'As a transporter, you\'ll see available loads in your area, accept trips, optimize your routes, track your earnings, and manage multiple deliveries. Our intelligent matching system connects you with the best cargo opportunities.'}
                    </Text>

                    <View style={styles.previewFeatures}>
                      <Text style={[styles.previewFeaturesTitle, { color: theme.text }]}>
                        Key Features:
                      </Text>
                      {(previewRole === 'shipper'
                        ? ['Real-time tracking', 'Instant quotes', 'Secure payments', 'Rating system']
                        : ['Smart load matching', 'Route optimization', 'Earnings dashboard', 'Verified cargo']
                      ).map((feature, idx) => (
                        <View key={idx} style={styles.previewFeatureItem}>
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#10797D"
                          />
                          <Text style={[styles.previewFeatureText, { color: theme.text }]}>
                            {feature}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </>
              )}
            </Card>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Confetti */}
      {showConfetti && (
        <ConfettiCannon
          ref={confettiRef}
          count={200}
          origin={{ x: width / 2, y: height / 2 }}
          autoStart={false}
          fadeOut
          colors={['#10797D', '#0D5F66', '#0B484C', '#067A85', '#FFD700', '#FFA500']}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
    borderRadius: 60,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  formContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 32,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 15,
  },
  registerLink: {
    fontSize: 15,
    fontWeight: '700',
  },
  roleSelectionContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  roleSelectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    maxWidth: 500,
    width: '100%',
  },
  roleButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    maxWidth: 500,
    width: '100%',
  },
  roleButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#F5F5F5',
  },
  roleButtonSelected: {
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  roleButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 20,
    gap: 8,
  },
  demoButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Animated Background Pattern
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  circle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 999,
  },
  circle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: -50,
    left: -50,
  },
  circle3: {
    width: 150,
    height: 150,
    top: height / 2 - 75,
    right: -75,
  },
  // Preview Modal Styles
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  previewContent: {
    width: '100%',
    maxWidth: 500,
  },
  previewCard: {
    padding: 24,
    maxHeight: height * 0.8,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
  },
  previewBody: {
    gap: 24,
  },
  previewDescription: {
    fontSize: 15,
    lineHeight: 24,
  },
  previewFeatures: {
    gap: 12,
  },
  previewFeaturesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewFeatureText: {
    fontSize: 15,
    flex: 1,
  },
});