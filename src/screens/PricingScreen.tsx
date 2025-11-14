// src/screens/PricingScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function PricingScreen({ navigation }: any) {
  const { theme } = useTheme();

  const plans = [
    {
      name: 'Farmer',
      price: 'Free',
      description: 'Perfect for farmers looking to ship their produce',
      color: '#10797D',
      features: [
        'Unlimited cargo listings',
        'Direct transporter connections',
        'Real-time tracking',
        'Secure payments',
        'Rating & review system',
        'Customer support',
      ],
      cta: 'Start as Farmer',
      popular: false,
    },
    {
      name: 'Transporter',
      price: 'Commission-based',
      description: 'Ideal for transporters seeking consistent loads',
      color: '#6366F1',
      features: [
        'Browse available loads',
        'Route optimization',
        'Earnings dashboard',
        'Instant payments',
        'Build your reputation',
        'Priority support',
      ],
      cta: 'Start as Transporter',
      popular: true,
    },
  ];

  const faq = [
    {
      question: 'How does pricing work?',
      answer: 'AgriLogistics is completely free for farmers to list cargo. Transporters earn money from completed trips, and we take a small commission (5-10%) to maintain and improve the platform.',
    },
    {
      question: 'Are there any hidden fees?',
      answer: 'No hidden fees! Farmers pay only the agreed transport cost. Transporters pay a transparent commission only on completed trips.',
    },
    {
      question: 'How do payments work?',
      answer: 'We use a secure escrow system. Farmers pay upfront, funds are held safely, and released to transporters upon successful delivery confirmation.',
    },
    {
      question: 'Can I cancel a trip?',
      answer: 'Yes, both parties can cancel within specified timeframes. Check our Terms of Service for detailed cancellation policies and any applicable fees.',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Navigation Bar */}
      <View style={[styles.navbar, { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderBottomColor: theme.border }]}>
        <View style={styles.navbarContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <View style={styles.navLogo}>
            <View style={[styles.navLogoIcon, { backgroundColor: '#27AE60' }]}>
              <Ionicons name="leaf" size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.navLogoText, { color: '#1a1a1a' }]}>agrilogistics.</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Simple, Transparent Pricing</Text>
            <Text style={styles.heroSubtitle}>
              Choose the plan that works for you. No hidden fees, no surprises.
            </Text>
          </View>
        </View>

        {/* Pricing Cards */}
        <View style={styles.pricingSection}>
          <View style={styles.pricingGrid}>
            {plans.map((plan, index) => (
              <View
                key={index}
                style={[
                  styles.pricingCard,
                  { backgroundColor: theme.card, borderColor: plan.popular ? plan.color : theme.border },
                  plan.popular && styles.popularCard,
                ]}
              >
                {plan.popular && (
                  <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
                    <Text style={styles.popularText}>Most Popular</Text>
                  </View>
                )}

                <View style={[styles.planIcon, { backgroundColor: plan.color }]}>
                  <Ionicons
                    name={plan.name === 'Farmer' ? 'leaf' : 'car'}
                    size={32}
                    color="#FFFFFF"
                  />
                </View>

                <Text style={[styles.planName, { color: theme.text }]}>{plan.name}</Text>
                <Text style={[styles.planPrice, { color: plan.color }]}>{plan.price}</Text>
                <Text style={[styles.planDescription, { color: theme.textSecondary }]}>
                  {plan.description}
                </Text>

                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, idx) => (
                    <View key={idx} style={styles.featureRow}>
                      <Ionicons name="checkmark-circle" size={20} color={plan.color} />
                      <Text style={[styles.featureText, { color: theme.text }]}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.ctaButton, { backgroundColor: plan.color }]}
                  onPress={() => navigation.navigate('RoleSelection')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.ctaButtonText}>{plan.cta}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Value Proposition */}
        <View style={[styles.valueSection, { backgroundColor: '#F9FAFB' }]}>
          <Text style={styles.valueSectionTitle}>Why AgriLogistics?</Text>
          <View style={styles.valueGrid}>
            <View style={styles.valueCard}>
              <View style={[styles.valueIcon, { backgroundColor: '#10797D' }]}>
                <Ionicons name="cash" size={28} color="#FFFFFF" />
              </View>
              <Text style={[styles.valueTitle, { color: theme.text }]}>No Upfront Costs</Text>
              <Text style={[styles.valueDescription, { color: theme.textSecondary }]}>
                Start using the platform immediately with zero upfront fees
              </Text>
            </View>

            <View style={styles.valueCard}>
              <View style={[styles.valueIcon, { backgroundColor: '#6366F1' }]}>
                <Ionicons name="shield-checkmark" size={28} color="#FFFFFF" />
              </View>
              <Text style={[styles.valueTitle, { color: theme.text }]}>Secure Payments</Text>
              <Text style={[styles.valueDescription, { color: theme.textSecondary }]}>
                Protected transactions with our escrow payment system
              </Text>
            </View>

            <View style={styles.valueCard}>
              <View style={[styles.valueIcon, { backgroundColor: '#F59E0B' }]}>
                <Ionicons name="trending-up" size={28} color="#FFFFFF" />
              </View>
              <Text style={[styles.valueTitle, { color: theme.text }]}>Maximize Earnings</Text>
              <Text style={[styles.valueDescription, { color: theme.textSecondary }]}>
                Efficient route planning helps transporters earn more
              </Text>
            </View>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={[styles.faqTitle, { color: theme.text }]}>Frequently Asked Questions</Text>
          <View style={styles.faqContainer}>
            {faq.map((item, index) => (
              <View
                key={index}
                style={[styles.faqCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <Text style={[styles.faqQuestion, { color: theme.text }]}>{item.question}</Text>
                <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>{item.answer}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Final CTA */}
        <View style={[styles.finalCtaSection, { backgroundColor: '#6366F1' }]}>
          <Ionicons name="rocket" size={48} color="#FFFFFF" />
          <Text style={styles.finalCtaTitle}>Ready to Get Started?</Text>
          <Text style={styles.finalCtaDescription}>
            Join thousands of farmers and transporters already using AgriLogistics
          </Text>
          <TouchableOpacity
            style={styles.finalCtaButton}
            onPress={() => navigation.navigate('RoleSelection')}
            activeOpacity={0.8}
          >
            <Text style={styles.finalCtaButtonText}>Start Free Today</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navbar: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: width > 768 ? 60 : 24,
    borderBottomWidth: 1,
    zIndex: 100,
  },
  navbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navLogoIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLogoText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  hero: {
    paddingVertical: 60,
    paddingHorizontal: width > 768 ? 60 : 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  heroContent: {
    maxWidth: 700,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: width > 768 ? 48 : 36,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: width > 768 ? 20 : 18,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 28,
  },
  pricingSection: {
    paddingVertical: 60,
    paddingHorizontal: width > 768 ? 60 : 24,
    backgroundColor: '#FFFFFF',
  },
  pricingGrid: {
    flexDirection: width > 768 ? 'row' : 'column',
    gap: 32,
    maxWidth: 1000,
    marginHorizontal: 'auto',
    justifyContent: 'center',
  },
  pricingCard: {
    flex: 1,
    minWidth: width > 768 ? 350 : undefined,
    padding: 40,
    borderRadius: 24,
    borderWidth: 2,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  popularCard: {
    borderWidth: 3,
    transform: width > 768 ? [{ scale: 1.05 }] : [],
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  planName: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 12,
  },
  planDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    flex: 1,
  },
  ctaButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  ctaButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  valueSection: {
    paddingVertical: 80,
    paddingHorizontal: width > 768 ? 60 : 24,
  },
  valueSectionTitle: {
    fontSize: width > 768 ? 36 : 28,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 48,
  },
  valueGrid: {
    flexDirection: width > 768 ? 'row' : 'column',
    gap: 24,
    maxWidth: 1000,
    marginHorizontal: 'auto',
  },
  valueCard: {
    flex: 1,
    alignItems: 'center',
    padding: 32,
  },
  valueIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  valueTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  valueDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  faqSection: {
    paddingVertical: 80,
    paddingHorizontal: width > 768 ? 60 : 24,
    backgroundColor: '#FFFFFF',
  },
  faqTitle: {
    fontSize: width > 768 ? 36 : 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 48,
  },
  faqContainer: {
    gap: 20,
    maxWidth: 800,
    marginHorizontal: 'auto',
  },
  faqCard: {
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  faqQuestion: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  faqAnswer: {
    fontSize: 15,
    lineHeight: 24,
  },
  finalCtaSection: {
    paddingVertical: 80,
    paddingHorizontal: width > 768 ? 60 : 40,
    alignItems: 'center',
  },
  finalCtaTitle: {
    fontSize: width > 768 ? 36 : 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  finalCtaDescription: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 600,
    lineHeight: 26,
  },
  finalCtaButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  finalCtaButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366F1',
  },
});
