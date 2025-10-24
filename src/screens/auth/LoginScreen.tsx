// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { login } from '../../store/slices/authSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { UserRole, LoginScreenProps } from '../../types';

// Demo credentials for testing
const DEMO_CREDENTIALS: Record<UserRole, { phone: string; password: string; name: string }> = {
  farmer: {
    phone: '+250700000001',
    password: 'password123',
    name: 'Test Farmer',
  },
  buyer: {
    phone: '+250700000002',
    password: 'password123',
    name: 'Test Buyer',
  },
  transporter: {
    phone: '+250700000003',
    password: 'password123',
    name: 'Test Transporter',
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
  farmer: {
    icon: 'leaf',
    label: 'Farmer',
    description: 'List and sell your crops',
    gradient: ['#2E7D32', '#66BB6A'],
  },
  buyer: {
    icon: 'cart',
    label: 'Buyer',
    description: 'Browse and purchase crops',
    gradient: ['#1976D2', '#42A5F5'],
  },
  transporter: {
    icon: 'car',
    label: 'Transporter',
    description: 'Deliver crops efficiently',
    gradient: ['#F57C00', '#FFB74D'],
  },
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [errors, setErrors] = useState({ phone: '', password: '' });

  const validateForm = () => {
    let valid = true;
    const newErrors = { phone: '', password: '' };

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

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await dispatch(login({ phone, password })).unwrap();
      // Navigation happens automatically based on user's role
    } catch (err: any) {
      Alert.alert('Login Failed', err || 'Invalid credentials');
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
          {/* Header */}
          <LinearGradient
            colors={[theme.primary, theme.primaryLight]}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="log-in-outline" size={48} color="#FFFFFF" />
              </View>
              <Text style={styles.headerTitle}>Welcome Back</Text>
              <Text style={styles.headerSubtitle}>Sign in to your account</Text>
            </View>
          </LinearGradient>

          {/* Role Selection */}
          <View style={[styles.roleSelectionContainer, { backgroundColor: theme.background }]}>
            <Text style={[styles.roleSelectionLabel, { color: theme.text }]}>Select Your Role</Text>
            <View style={styles.roleButtonsContainer}>
              {(['farmer', 'buyer', 'transporter'] as UserRole[]).map((role) => {
                const isSelected = selectedRole === role;
                const roleData = ROLE_INFO[role];
                return (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      isSelected && styles.roleButtonSelected,
                      isSelected && { borderColor: roleData.gradient[0] },
                    ]}
                    onPress={() => {
                      setSelectedRole(role);
                      setErrors({ phone: '', password: '' });
                    }}
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
                  </TouchableOpacity>
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
            >
              <Ionicons name="flash" size={16} color={theme.primary} />
              <Text style={[styles.demoButtonText, { color: theme.primary }]}>
                Use Demo Credentials ({DEMO_CREDENTIALS[selectedRole].phone})
              </Text>
            </TouchableOpacity>

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
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors({ ...errors, password: '' });
              }}
              secureTextEntry
              icon="lock-closed-outline"
              error={errors.password}
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              fullWidth
              size="large"
              icon={<Ionicons name="log-in-outline" size={20} color="#FFFFFF" />}
            />

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <Text style={[styles.dividerText, { color: theme.textSecondary }]}>OR</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            <View style={styles.registerContainer}>
              <Text style={[styles.registerText, { color: theme.textSecondary }]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('RoleSelection')}>
                <Text style={[styles.registerLink, { color: theme.primary }]}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
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
  },
  roleSelectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  roleButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
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
});