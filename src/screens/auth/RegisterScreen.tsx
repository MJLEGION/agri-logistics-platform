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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { register } from '../../store/slices/authSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ModernButton from '../../components/ModernButton';
import Toast, { useToast } from '../../components/Toast';
import ProgressBar from '../../components/ProgressBar';
import { ModernColors, ModernGradients, Typography, Spacing, BorderRadius, Shadows } from '../../config/ModernDesignSystem';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen({ route, navigation }: any) {
  const { role } = route.params;
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { toast, showError, showSuccess, showWarning, hideToast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // Animation refs
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
      newErrors.name = 'Name is required';
      valid = false;
    } else if (name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
      valid = false;
    }

    if (!phone) {
      newErrors.phone = 'Phone number is required';
      valid = false;
    } else if (phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      valid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      console.log('🔐 Attempting registration:', { name, phone, role });
      await dispatch(register({ name, phone, password, role })).unwrap();
      console.log('✅ Registration successful!');
      showSuccess('Account created successfully!');
      // Navigation happens automatically via AppNavigator
    } catch (err: any) {
      console.error('❌ Registration failed:', err);
      const errorMessage = err || 'Could not register. Please check your connection and try again.';
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
            colors={['#27AE60', '#2ECC71', '#27AE60']}
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

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
              <View style={styles.iconContainer}>
                <Ionicons name={getRoleIcon() as any} size={48} color="#FFFFFF" />
              </View>
              <Text style={styles.headerTitle}>Create Account</Text>
              <Text style={styles.headerSubtitle}>
                Register as {role.charAt(0).toUpperCase() + role.slice(1)}
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

            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrors({ ...errors, name: '' });
              }}
              icon="person-outline"
              error={errors.name}
              autoCapitalize="words"
            />

            <Input
              label="Phone Number"
              placeholder="+250 XXX XXX XXX"
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
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors({ ...errors, password: '' });
              }}
              secureTextEntry
              icon="lock-closed-outline"
              error={errors.password}
              helperText="Must be at least 6 characters"
            />

            <Input
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrors({ ...errors, confirmPassword: '' });
              }}
              secureTextEntry
              icon="lock-closed-outline"
              error={errors.confirmPassword}
            />

            <View style={[styles.infoBox, { backgroundColor: `${getRoleColor()}10` }]}>
              <Ionicons name="information-circle" size={20} color={getRoleColor()} />
              <Text style={[styles.infoText, { color: theme.text }]}>
                {role === 'farmer' && 'As a farmer, you can list crops and manage orders'}
                {role === 'buyer' && 'As a buyer, you can browse and purchase crops'}
                {role === 'transporter' && 'As a transporter, you can find and deliver loads'}
              </Text>
            </View>

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              fullWidth
              size="large"
              icon={<Ionicons name="person-add-outline" size={20} color="#FFFFFF" />}
            />

            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: theme.textSecondary }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.loginLink, { color: theme.primary }]}>Sign In</Text>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
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