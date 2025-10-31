// src/screens/auth/PremiumLoginScreen.tsx - Premium Login Screen
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Animated,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PremiumButton from '../../components/PremiumButton';
import PremiumCard from '../../components/PremiumCard';
import { PREMIUM_THEME } from '../../config/premiumTheme';

export default function PremiumLoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    // Add your login logic here
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <LinearGradient
          colors={['#0F1419', '#1A1F2E', '#0D0E13']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Background Elements */}
          <View style={styles.backgroundPattern}>
            <View style={[styles.orb, { width: 300, height: 300, top: -150, left: -100, backgroundColor: '#FF6B35' }]} />
            <View style={[styles.orb, { width: 250, height: 250, bottom: -100, right: -80, backgroundColor: '#004E89' }]} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Logo Section */}
              <View style={styles.logoSection}>
                <LinearGradient
                  colors={['#FF6B35', '#004E89']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoBg}
                >
                  <MaterialCommunityIcons name="truck-fast" size={48} color="#FFF" />
                </LinearGradient>
                <Text style={styles.logoText}>Agri-Logistics</Text>
              </View>

              {/* Title */}
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue to your account</Text>

              {/* Form Card */}
              <PremiumCard>
                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="email-outline"
                      size={20}
                      color={PREMIUM_THEME.colors.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor={PREMIUM_THEME.colors.textTertiary}
                      value={email}
                      onChangeText={setEmail}
                      editable={!isLoading}
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="lock-outline"
                      size={20}
                      color={PREMIUM_THEME.colors.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor={PREMIUM_THEME.colors.textTertiary}
                      value={password}
                      onChangeText={setPassword}
                      editable={!isLoading}
                      secureTextEntry={!showPassword}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                      <MaterialCommunityIcons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={PREMIUM_THEME.colors.textSecondary}
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Remember & Forgot */}
                <View style={styles.rememberContainer}>
                  <Text style={styles.rememberText}>Forgot password?</Text>
                </View>
              </PremiumCard>

              {/* Login Button */}
              <PremiumButton
                label="Sign In"
                variant="primary"
                size="lg"
                icon="login"
                iconPosition="right"
                onPress={handleLogin}
                loading={isLoading}
              />

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.divider} />
              </View>

              {/* Social Login */}
              <View style={styles.socialContainer}>
                <PremiumButton
                  label="Google"
                  variant="outline"
                  icon="google"
                  onPress={() => {}}
                />
                <PremiumButton
                  label="Phone"
                  variant="outline"
                  icon="phone"
                  onPress={() => {}}
                />
              </View>

              {/* Sign Up Link */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <PremiumButton
                  label="Sign Up"
                  variant="ghost"
                  onPress={() => navigation.navigate('Register')}
                />
              </View>
            </Animated.View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PREMIUM_THEME.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.08,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    zIndex: 1,
  },
  
  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBg: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...PREMIUM_THEME.shadows.lg,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: PREMIUM_THEME.colors.text,
  },
  
  // Text
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: PREMIUM_THEME.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: PREMIUM_THEME.colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  
  // Input
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: PREMIUM_THEME.colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: PREMIUM_THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: PREMIUM_THEME.colors.border,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: PREMIUM_THEME.colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Remember
  rememberContainer: {
    alignItems: 'flex-end',
    marginTop: -8,
  },
  rememberText: {
    fontSize: 12,
    color: PREMIUM_THEME.colors.primary,
    fontWeight: '600',
  },
  
  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: PREMIUM_THEME.colors.border,
  },
  dividerText: {
    color: PREMIUM_THEME.colors.textTertiary,
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Social
  socialContainer: {
    gap: 12,
    marginBottom: 32,
  },
  
  // Signup
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: PREMIUM_THEME.colors.textSecondary,
    fontSize: 14,
  },
});

// Add Pressable import at the top
import { Pressable } from 'react-native';