// src/screens/auth/RoleSelectionScreen.tsx
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  Pressable,
  PanResponder,
  Modal,
  BlurView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import { UserRole } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Divider from '../../components/Divider';

const { width, height } = Dimensions.get('window');

export default function RoleSelectionScreen({ navigation }: any) {
  const { theme } = useTheme();

  // State
  const [previewRole, setPreviewRole] = useState<UserRole | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedRoleForConfetti, setSelectedRoleForConfetti] = useState<UserRole | null>(null);

  // Animation refs
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const scale1 = useRef(new Animated.Value(1)).current;
  const scale2 = useRef(new Animated.Value(1)).current;

  // 3D Tilt refs
  const tiltX1 = useRef(new Animated.Value(0)).current;
  const tiltY1 = useRef(new Animated.Value(0)).current;
  const tiltX2 = useRef(new Animated.Value(0)).current;
  const tiltY2 = useRef(new Animated.Value(0)).current;

  // Floating animation refs
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;

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
      // Stagger card animations
      Animated.timing(card1Anim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(card2Anim, {
        toValue: 1,
        duration: 600,
        delay: 400,
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

  const handlePressIn = (cardScale: Animated.Value) => {
    Animated.spring(cardScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (cardScale: Animated.Value) => {
    Animated.spring(cardScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // 3D Tilt handlers
  const createTiltHandler = (tiltX: Animated.Value, tiltY: Animated.Value, cardWidth: number, cardHeight: number) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const { locationX, locationY } = evt.nativeEvent;
        const centerX = cardWidth / 2;
        const centerY = cardHeight / 2;

        // Calculate tilt angles (-15 to 15 degrees)
        const tiltAngleX = ((locationY - centerY) / centerY) * -15;
        const tiltAngleY = ((locationX - centerX) / centerX) * 15;

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
        // Reset tilt
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

  // Preview and Confetti handlers
  const handleLongPress = (role: UserRole) => {
    setPreviewRole(role);
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRoleForConfetti(role);
    setShowConfetti(true);
    confettiRef.current?.start();

    // Navigate after confetti
    setTimeout(() => {
      navigation.navigate('Register', { role });
    }, 2000);
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const roles = [
    {
      role: 'shipper' as UserRole,
      icon: 'leaf',
      title: 'Shipper',
      description: 'List and ship your cargo',
      color: '#10797D',
      gradient: ['#10797D', '#0D5F66'],
      features: ['List cargo', 'Manage shipments', 'Track deliveries'],
    },
    {
      role: 'transporter' as UserRole,
      icon: 'car',
      title: 'Transporter',
      description: 'Find loads and deliver crops efficiently',
      color: '#1E8449',
      gradient: ['#1E8449', '#10797D'],
      features: ['Find loads', 'Optimize routes', 'Earn more'],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
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

          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <ThemeToggle />
          </View>

          <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
            <Ionicons name="leaf" size={56} color="#FFFFFF" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Choose Your Role</Text>
            <Text style={styles.headerSubtitle}>
              Select how you want to use Agri-Logistics
            </Text>
          </Animated.View>
        </LinearGradient>

        {/* Roles */}
        <View style={styles.rolesContainer}>
          {roles.map((item, index) => {
            const cardAnim = index === 0 ? card1Anim : card2Anim;
            const scaleAnim = index === 0 ? scale1 : scale2;
            const tiltX = index === 0 ? tiltX1 : tiltX2;
            const tiltY = index === 0 ? tiltY1 : tiltY2;
            const floatAnim = index === 0 ? float1 : float2;

            const cardTransform = {
              opacity: cardAnim,
              transform: [
                { perspective: 1000 },
                { scale: scaleAnim },
                {
                  translateY: Animated.add(
                    cardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                    floatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -10],
                    })
                  ),
                },
                {
                  rotateX: tiltX.interpolate({
                    inputRange: [-15, 15],
                    outputRange: ['-15deg', '15deg'],
                  }),
                },
                {
                  rotateY: tiltY.interpolate({
                    inputRange: [-15, 15],
                    outputRange: ['-15deg', '15deg'],
                  }),
                },
              ],
            };

            const tiltHandler = createTiltHandler(tiltX, tiltY, 400, 350);

            return (
              <Animated.View
                key={index}
                style={[styles.roleCardWrapper, cardTransform]}
                {...tiltHandler.panHandlers}
              >
                <Pressable
                  onPressIn={() => handlePressIn(scaleAnim)}
                  onPressOut={() => handlePressOut(scaleAnim)}
                  onPress={() => handleRoleSelect(item.role)}
                  onLongPress={() => handleLongPress(item.role)}
                  delayLongPress={500}
                >
                  <Card elevated style={styles.roleCard}>
                    <LinearGradient
                      colors={item.gradient}
                      style={styles.roleGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.roleIconContainer}>
                        <Ionicons name={item.icon as any} size={36} color="#FFFFFF" />
                      </View>
                    </LinearGradient>

                    <View style={styles.roleContent}>
                      <Text style={[styles.roleTitle, { color: theme.text }]}>
                        {item.title}
                      </Text>
                      <Text style={[styles.roleDescription, { color: theme.textSecondary }]}>
                        {item.description}
                      </Text>

                      <View style={styles.featuresContainer}>
                        {item.features.map((feature, idx) => (
                          <View key={idx} style={styles.featureItem}>
                            <Ionicons
                              name="checkmark-circle"
                              size={14}
                              color={item.color}
                            />
                            <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                              {feature}
                            </Text>
                          </View>
                        ))}
                      </View>

                      <View style={[styles.selectButtonContainer, { backgroundColor: item.color }]}>
                        <Text style={styles.selectButtonText}>Select</Text>
                        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                      </View>
                    </View>
                  </Card>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        <Divider spacing="lg" />

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, { color: theme.textSecondary }]}>
            Already have an account?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.loginLink, { color: theme.primary }]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textLight }]}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </ScrollView>

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
        >
          <View style={styles.previewContent}>
            <Card elevated style={styles.previewCard}>
              {previewRole && (
                <>
                  <View style={styles.previewHeader}>
                    <Text style={[styles.previewTitle, { color: theme.text }]}>
                      {previewRole === 'shipper' ? 'Shipper' : 'Transporter'} Preview
                    </Text>
                    <TouchableOpacity onPress={() => setPreviewRole(null)}>
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
          colors={
            selectedRoleForConfetti === 'shipper'
              ? ['#10797D', '#0D5F66', '#1B9954', '#34D679']
              : ['#1E8449', '#10797D', '#16663A', '#0D5F66']
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
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
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
  headerIcon: {
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
    textAlign: 'center',
  },
  rolesContainer: {
    flexDirection: 'row',
    padding: 24,
    gap: 16,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  roleCardWrapper: {
    flex: 1,
    maxWidth: 400,
  },
  roleCard: {
    padding: 0,
    overflow: 'hidden',
    width: '100%',
  },
  roleGradient: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleContent: {
    padding: 16,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  roleDescription: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
    textAlign: 'center',
  },
  featuresContainer: {
    gap: 6,
    marginBottom: 14,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 11,
    flex: 1,
  },
  selectButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 6,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
    marginTop: 8,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  loginText: {
    fontSize: 15,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    alignItems: 'center',
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
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