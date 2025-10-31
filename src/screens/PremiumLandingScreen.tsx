// src/screens/PremiumLandingScreen.tsx - Premium Landing Screen
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  SafeAreaView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PremiumButton from '../components/PremiumButton';
import PremiumCard from '../components/PremiumCard';
import { PREMIUM_THEME } from '../config/premiumTheme';

export default function PremiumLandingScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 30,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const features = [
    {
      icon: 'leaf',
      title: 'Direct Shipping',
      description: 'Connect with verified transporters instantly',
      color: '#27AE60',
    },
    {
      icon: 'truck-fast',
      title: 'Fast Delivery',
      description: 'Optimized routes for quick transportation',
      color: '#FF6B35',
    },
    {
      icon: 'map-check',
      title: 'Real-Time Tracking',
      description: 'Monitor your cargo every step of the way',
      color: '#004E89',
    },
    {
      icon: 'currency-usd',
      title: 'Fair Pricing',
      description: 'Transparent rates with no hidden charges',
      color: '#F39C12',
    },
    {
      icon: 'lock-check',
      title: 'Secure Platform',
      description: 'Industry-leading security and compliance',
      color: '#9B59B6',
    },
    {
      icon: 'star',
      title: 'Rated & Reviewed',
      description: 'Trusted by thousands of users',
      color: '#E74C3C',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F1419', '#1A1F2E', '#0D0E13']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Background Elements */}
        <View style={styles.backgroundPattern}>
          <View style={[styles.orb, { width: 400, height: 400, top: -200, left: -100, backgroundColor: '#FF6B35' }]} />
          <View style={[styles.orb, { width: 350, height: 350, bottom: -150, right: -100, backgroundColor: '#004E89' }]} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {/* Hero Section */}
          <Animated.View
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Agri-Logistics</Text>
              <Text style={styles.heroSubtitle}>Revolutionizing Agricultural Transportation</Text>
              <Text style={styles.heroDescription}>
                Connect farms to markets with real-time tracking, fair pricing, and verified transporters
              </Text>

              <View style={styles.heroButtons}>
                <View style={styles.buttonWrapper}>
                  <PremiumButton
                    label="Get Started"
                    variant="primary"
                    size="lg"
                    icon="arrow-right"
                    iconPosition="right"
                    onPress={() => navigation.navigate('RoleSelection')}
                  />
                </View>
                <View style={styles.buttonWrapper}>
                  <PremiumButton
                    label="Sign In"
                    variant="secondary"
                    size="lg"
                    onPress={() => navigation.navigate('Login')}
                  />
                </View>
              </View>

              {/* Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>10K+</Text>
                  <Text style={styles.statLabel}>Active Users</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>5K+</Text>
                  <Text style={styles.statLabel}>Deliveries</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>98%</Text>
                  <Text style={styles.statLabel}>Satisfaction</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Features Grid */}
          <Animated.View style={[styles.featuresSection, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>Why Choose Agri-Logistics?</Text>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <Animated.View
                  key={index}
                  style={{
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 50],
                          outputRange: [50 - index * 5, -index * 5],
                        }),
                      },
                    ],
                  }}
                >
                  <PremiumCard highlighted={false}>
                    <View style={styles.featureIcon}>
                      <MaterialCommunityIcons
                        name={feature.icon}
                        size={32}
                        color={feature.color}
                      />
                    </View>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </PremiumCard>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* How It Works */}
          <Animated.View style={[styles.howItWorksSection, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            <View style={styles.stepsContainer}>
              {[
                { icon: 'account-plus', title: 'Sign Up', desc: 'Create your account' },
                { icon: 'briefcase', title: 'Choose Role', desc: 'Shipper or Transporter' },
                { icon: 'magnify', title: 'Find Match', desc: 'Find cargo or loads' },
                { icon: 'truck-check', title: 'Track', desc: 'Real-time updates' },
              ].map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={[styles.stepNumber, { backgroundColor: PREMIUM_THEME.colors.primary }]}>
                    <MaterialCommunityIcons name={step.icon} size={24} color="#FFF" />
                  </View>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                  {index < 3 && <View style={styles.stepArrow} />}
                </View>
              ))}
            </View>
          </Animated.View>

          {/* CTA Section */}
          <Animated.View style={[styles.ctaSection, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={['#FF6B35', '#FF8C42']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaTitle}>Ready to Transform Your Logistics?</Text>
              <Text style={styles.ctaSubtitle}>Join thousands of farmers and transporters today</Text>
              <View style={styles.ctaButton}>
                <PremiumButton
                  label="Start Now"
                  variant="primary"
                  size="lg"
                  onPress={() => navigation.navigate('RoleSelection')}
                />
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2024 Agri-Logistics. All rights reserved.</Text>
            <Text style={styles.footerSubtext}>Connecting Farms to Markets</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PREMIUM_THEME.colors.background,
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
    opacity: 0.1,
  },
  scrollView: {
    flex: 1,
  },
  
  // Hero Section
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    zIndex: 1,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 52,
    fontWeight: '900',
    color: PREMIUM_THEME.colors.text,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -2,
    ...(Platform.OS === 'web' && {
      textShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
    }),
  },
  heroSubtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: PREMIUM_THEME.colors.primary,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  heroDescription: {
    fontSize: 16,
    color: PREMIUM_THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    maxWidth: 600,
  },
  heroButtons: {
    gap: 12,
    marginBottom: 40,
    width: '100%',
  },
  buttonWrapper: {
    width: '100%',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: PREMIUM_THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: PREMIUM_THEME.colors.border,
    paddingVertical: 20,
    gap: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: PREMIUM_THEME.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: PREMIUM_THEME.colors.textSecondary,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: PREMIUM_THEME.colors.border,
  },
  
  // Features Section
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: PREMIUM_THEME.colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  featuresGrid: {
    gap: 16,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PREMIUM_THEME.colors.text,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: PREMIUM_THEME.colors.textSecondary,
    lineHeight: 20,
  },
  
  // How It Works
  howItWorksSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    zIndex: 1,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
  },
  stepNumber: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...PREMIUM_THEME.shadows.lg,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: PREMIUM_THEME.colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  stepDesc: {
    fontSize: 12,
    color: PREMIUM_THEME.colors.textSecondary,
    textAlign: 'center',
  },
  stepArrow: {
    position: 'absolute',
    right: -20,
    top: 30,
    width: 20,
    height: 2,
    backgroundColor: PREMIUM_THEME.colors.primary,
  },
  
  // CTA Section
  ctaSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    zIndex: 1,
  },
  ctaGradient: {
    borderRadius: PREMIUM_THEME.borderRadius.lg,
    padding: 32,
    alignItems: 'center',
    overflow: 'hidden',
    ...PREMIUM_THEME.shadows.xl,
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
  },
  ctaButton: {
    width: '100%',
  },
  
  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: PREMIUM_THEME.colors.border,
  },
  footerText: {
    fontSize: 12,
    color: PREMIUM_THEME.colors.textSecondary,
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 11,
    color: PREMIUM_THEME.colors.textTertiary,
    marginTop: 4,
  },
});