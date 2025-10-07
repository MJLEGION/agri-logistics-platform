// src/screens/LandingScreen.tsx
import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/Button';

const { width, height } = Dimensions.get('window');

export default function LandingScreen({ navigation }: any) {
  const { theme } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;

  const features = [
    {
      icon: 'leaf-outline',
      title: 'For Farmers',
      description: 'List your crops, manage inventory, and connect directly with buyers',
      color: theme.primary,
    },
    {
      icon: 'cart-outline',
      title: 'For Buyers',
      description: 'Browse fresh produce, place orders, and track deliveries in real-time',
      color: theme.accent,
    },
    {
      icon: 'car-outline',
      title: 'For Transporters',
      description: 'Find loads, optimize routes, and earn more with efficient logistics',
      color: theme.secondary,
    },
  ];

  const benefits = [
    { icon: 'flash-outline', title: 'Fast & Efficient', description: 'Streamlined processes save time' },
    { icon: 'shield-checkmark-outline', title: 'Secure & Reliable', description: 'Your data is protected' },
    { icon: 'analytics-outline', title: 'Real-time Tracking', description: 'Monitor every step' },
    { icon: 'people-outline', title: 'Community Driven', description: 'Supporting local agriculture' },
  ];

  const stats = [
    { number: '1000+', label: 'Active Farmers' },
    { number: '500+', label: 'Daily Orders' },
    { number: '50+', label: 'Transporters' },
    { number: '98%', label: 'Satisfaction' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={[theme.primary, theme.primaryLight]}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <Ionicons name="leaf" size={60} color="#FFFFFF" style={styles.heroIcon} />
            
            <Text style={styles.heroTitle}>Agri-Logistics</Text>
            <Text style={styles.heroSubtitle}>
              Connecting Rwanda's Agricultural Supply Chain
            </Text>
            
            <Text style={styles.heroDescription}>
              A seamless platform bringing together farmers, buyers, and transporters
              for efficient, transparent agricultural trade.
            </Text>

            <View style={styles.heroButtons}>
              <Button
                title="Get Started"
                onPress={() => navigation.navigate('RoleSelection')}
                variant="secondary"
                size="large"
                fullWidth
                style={styles.heroButton}
              />
              
              <Button
                title="Sign In"
                onPress={() => navigation.navigate('Login')}
                variant="outline"
                size="large"
                fullWidth
                style={[styles.heroButton, { borderColor: '#FFFFFF' }]}
                textStyle={{ color: '#FFFFFF' }}
              />
            </View>
          </View>

          {/* Decorative Wave */}
          <View style={styles.wave}>
            <Ionicons name="leaf" size={40} color="rgba(255,255,255,0.1)" style={styles.floatingLeaf1} />
            <Ionicons name="leaf" size={30} color="rgba(255,255,255,0.1)" style={styles.floatingLeaf2} />
          </View>
        </LinearGradient>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Who We Serve
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Tailored solutions for every stakeholder
          </Text>

          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View
                key={index}
                style={[
                  styles.featureCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.borderLight,
                  },
                ]}
              >
                <View style={[styles.featureIconContainer, { backgroundColor: `${feature.color}15` }]}>
                  <Ionicons name={feature.icon as any} size={32} color={feature.color} />
                </View>
                <Text style={[styles.featureTitle, { color: theme.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* How It Works Section */}
        <View style={[styles.section, { backgroundColor: theme.backgroundAlt }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            How It Works
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Simple steps to get started
          </Text>

          <View style={styles.stepsContainer}>
            {[
              { step: '1', title: 'Create Account', description: 'Choose your role and register' },
              { step: '2', title: 'List or Browse', description: 'Farmers list crops, buyers browse' },
              { step: '3', title: 'Connect', description: 'Match with the right partners' },
              { step: '4', title: 'Transact', description: 'Complete orders with transparency' },
            ].map((item, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
                  <Text style={styles.stepNumberText}>{item.step}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: theme.text }]}>{item.title}</Text>
                  <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
                    {item.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Our Impact
          </Text>
          
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.primary }]}>
                  {stat.number}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Benefits Section */}
        <View style={[styles.section, { backgroundColor: theme.backgroundAlt }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Why Choose Us
          </Text>

          <View style={styles.benefitsGrid}>
            {benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Ionicons name={benefit.icon as any} size={28} color={theme.primary} />
                <Text style={[styles.benefitTitle, { color: theme.text }]}>
                  {benefit.title}
                </Text>
                <Text style={[styles.benefitDescription, { color: theme.textSecondary }]}>
                  {benefit.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <LinearGradient
          colors={[theme.primary, theme.primaryDark]}
          style={styles.ctaSection}
        >
          <Ionicons name="rocket-outline" size={48} color="#FFFFFF" />
          <Text style={styles.ctaTitle}>Ready to Transform Agriculture?</Text>
          <Text style={styles.ctaDescription}>
            Join thousands of farmers, buyers, and transporters already using our platform
          </Text>
          
          <Button
            title="Get Started Now"
            onPress={() => navigation.navigate('RoleSelection')}
            variant="secondary"
            size="large"
            style={styles.ctaButton}
          />
        </LinearGradient>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: theme.card }]}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            © 2024 Agri-Logistics Platform
          </Text>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Made with ❤️ in Rwanda
          </Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    paddingTop: 60,
    paddingBottom: 80,
    paddingHorizontal: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIcon: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.95,
  },
  heroDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    opacity: 0.9,
    paddingHorizontal: 16,
  },
  heroButtons: {
    width: '100%',
    gap: 12,
  },
  heroButton: {
    marginBottom: 0,
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  floatingLeaf1: {
    position: 'absolute',
    top: -100,
    right: 20,
  },
  floatingLeaf2: {
    position: 'absolute',
    top: -150,
    left: 30,
  },
  section: {
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  stepsContainer: {
    gap: 24,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  stepNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  statItem: {
    width: (width - 64) / 2,
    alignItems: 'center',
    padding: 16,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  benefitItem: {
    width: (width - 64) / 2,
    alignItems: 'center',
    padding: 16,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  benefitDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
  ctaSection: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  ctaDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.9,
  },
  ctaButton: {
    width: '100%',
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
  },
});