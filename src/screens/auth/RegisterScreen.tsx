// src/screens/auth/RegisterScreen.tsx - Modern Design System Implementation
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import { register } from '../../store/slices/authSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAppDispatch, useAppSelector } from '../../store';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ModernButton from '../../components/ModernButton';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import Toast, { useToast } from '../../components/Toast';
import ProgressBar from '../../components/ProgressBar';
import { ModernColors, ModernGradients, Typography, Spacing, BorderRadius, Shadows } from '../../config/ModernDesignSystem';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen({ route, navigation }: any) {
  const { role } = route.params;
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { toast, showError, showSuccess, showWarning, hideToast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showConfetti, setShowConfetti] = useState(false);

  // Animation refs
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 3D Tilt for icon
  const iconTiltX = useRef(new Animated.Value(0)).current;
  const iconTiltY = useRef(new Animated.Value(0)).current;

  // Floating animation for icon
  const iconFloat = useRef(new Animated.Value(0)).current;

  // Form field entrance animations
  const field1Anim = useRef(new Animated.Value(0)).current;
  const field2Anim = useRef(new Animated.Value(0)).current;
  const field3Anim = useRef(new Animated.Value(0)).current;
  const field4Anim = useRef(new Animated.Value(0)).current;

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
      // Floating icon animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconFloat, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(iconFloat, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
      // Staggered form field animations
      Animated.stagger(100, [
        Animated.timing(field1Anim, {
          toValue: 1,
          duration: 600,
          delay: 400,
          useNativeDriver: true,
        }),
        Animated.timing(field2Anim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(field3Anim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(field4Anim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getRoleIcon = () => {
    switch (role) {
      case 'farmer':
        return 'leaf';
      case 'buyer':
        return 'cart';
      case 'transporter':
        return 'car';
      default:
        return 'person';
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'farmer':
        return theme.primary;
      case 'buyer':
        return theme.accent;
      case 'transporter':
        return theme.secondary;
      default:
        return theme.primary;
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { name: '', phone: '', password: '', confirmPassword: '' };

    if (!name.trim()) {
      newErrors.name = t('validation.fullNameRequired');
      valid = false;
    } else if (name.trim().length < 3) {
      newErrors.name = t('validation.fullNameRequired');
      valid = false;
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordRequired');
      valid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordsDoNotMatch');
      valid = false;
    }

    if (!termsAccepted) {
      showWarning(t('validation.termsRequired'));
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // 3D Tilt handler for icon
  const createIconTiltHandler = () => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const { locationX, locationY } = evt.nativeEvent;
        const centerX = 48; // Icon size / 2
        const centerY = 48;

        const tiltAngleX = ((locationY - centerY) / centerY) * -15;
        const tiltAngleY = ((locationX - centerX) / centerX) * 15;

        Animated.spring(iconTiltX, {
          toValue: tiltAngleX,
          friction: 7,
          useNativeDriver: true,
        }).start();

        Animated.spring(iconTiltY, {
          toValue: tiltAngleY,
          friction: 7,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderRelease: () => {
        Animated.spring(iconTiltX, {
          toValue: 0,
          friction: 5,
          useNativeDriver: true,
        }).start();

        Animated.spring(iconTiltY, {
          toValue: 0,
          friction: 5,
          useNativeDriver: true,
        }).start();
      },
    });
  };

  const iconTiltHandler = createIconTiltHandler();

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await dispatch(register({ name, phone, password, role })).unwrap();
            // Trigger confetti
      setShowConfetti(true);
      confettiRef.current?.start();

      showSuccess(t('messages.registerSuccess'));

      // Navigate to profile completion screen
      setTimeout(() => {
        navigation.replace('ProfileCompletion');
      }, 1500);
    } catch (err: any) {
      console.error('Registration failed:', err);
      const errorMessage = err || t('messages.registerError');
      showError(errorMessage);
    }
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
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <LanguageSwitcher showLabel={false} size="small" />
            </View>

            <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
              <Animated.View
                style={[
                  styles.iconContainer,
                  {
                    transform: [
                      { perspective: 1000 },
                      {
                        translateY: iconFloat.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -10],
                        }),
                      },
                      {
                        rotateX: iconTiltX.interpolate({
                          inputRange: [-15, 15],
                          outputRange: ['-15deg', '15deg'],
                        }),
                      },
                      {
                        rotateY: iconTiltY.interpolate({
                          inputRange: [-15, 15],
                          outputRange: ['-15deg', '15deg'],
                        }),
                      },
                    ],
                  },
                ]}
                {...iconTiltHandler.panHandlers}
              >
                <Ionicons name={getRoleIcon() as any} size={48} color="#FFFFFF" />
              </Animated.View>
              <Text style={styles.headerTitle}>{t('auth.registerTitle')}</Text>
              <Text style={styles.headerSubtitle}>
                {t('auth.selectRole')}: {role.charAt(0).toUpperCase() + role.slice(1)}
              </Text>
            </Animated.View>
          </LinearGradient>

          {/* Form */}
          <View style={styles.formContainer}>
            {error && (
              <View style={[styles.errorBanner, { backgroundColor: `${theme.error}15` }]}>
                <Ionicons name="alert-circle" size={20} color={theme.error} />
                <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
              </View>
            )}

            <Animated.View
              style={{
                opacity: field1Anim,
                transform: [
                  {
                    translateY: field1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              }}
            >
              <Input
                label={t('common.fullName')}
                placeholder={t('auth.fullNamePlaceholder')}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setErrors({ ...errors, name: '' });
                }}
                icon="person-outline"
                error={errors.name}
                autoCapitalize="words"
              />
            </Animated.View>

            <Animated.View
              style={{
                opacity: field2Anim,
                transform: [
                  {
                    translateY: field2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              }}
            >
              <Input
                label={t('common.phoneNumber')}
                placeholder={t('auth.phoneNumberPlaceholder')}
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
            </Animated.View>

            <Animated.View
              style={{
                opacity: field3Anim,
                transform: [
                  {
                    translateY: field3Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              }}
            >
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
                helperText={t('validation.passwordTooShort')}
              />
            </Animated.View>

            <Animated.View
              style={{
                opacity: field4Anim,
                transform: [
                  {
                    translateY: field4Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              }}
            >
              <Input
                label={t('common.confirmPassword')}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setErrors({ ...errors, confirmPassword: '' });
                }}
                secureTextEntry
                icon="lock-closed-outline"
                error={errors.confirmPassword}
              />
            </Animated.View>

            <View style={[styles.infoBox, { backgroundColor: `${getRoleColor()}10` }]}>
              <Ionicons name="information-circle" size={20} color={getRoleColor()} />
              <Text style={[styles.infoText, { color: theme.text }]}>
                {role === 'farmer' && 'As a farmer, you can list crops and manage orders'}
                {role === 'buyer' && 'As a buyer, you can browse and purchase crops'}
                {role === 'transporter' && 'As a transporter, you can find and deliver loads'}
              </Text>
            </View>

            {/* Terms and Conditions Checkbox */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setTermsAccepted(!termsAccepted)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, { borderColor: termsAccepted ? getRoleColor() : theme.border }]}>
                {termsAccepted && (
                  <Ionicons name="checkmark" size={18} color={getRoleColor()} />
                )}
              </View>
              <Text style={[styles.termsText, { color: theme.textSecondary }]}>
                {t('auth.agreeToTerms')}{' '}
                <Text
                  style={[styles.termsLink, { color: theme.primary }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate('TermsAndConditions');
                  }}
                >
                  {t('auth.termsAndConditions')}
                </Text>
              </Text>
            </TouchableOpacity>

            <Button
              title={t('auth.registerTitle')}
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              fullWidth
              size="large"
              icon={<Ionicons name="person-add-outline" size={20} color="#FFFFFF" />}
            />

            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: theme.textSecondary }]}>
                {t('auth.haveAccount')}{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.loginLink, { color: theme.primary }]}>{t('auth.signIn')}</Text>
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

      {/* Confetti */}
      {showConfetti && (
        <ConfettiCannon
          ref={confettiRef}
          count={200}
          origin={{ x: width / 2, y: height / 2 }}
          autoStart={false}
          fadeOut
          colors={
            role === 'shipper'
              ? ['#10797D', '#0D5F66', '#1B9954', '#34D679', '#FFD700']
              : ['#1E8449', '#10797D', '#16663A', '#0D5F66', '#FFD700']
          }
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
    paddingBottom: 40,
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
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 15,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '700',
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
});