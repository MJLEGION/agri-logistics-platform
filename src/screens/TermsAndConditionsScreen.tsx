// src/screens/TermsAndConditionsScreen.tsx
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

export default function TermsAndConditionsScreen({ navigation }: any) {
  const { theme } = useTheme();

  const sections = [
    {
      icon: 'document-text',
      title: '1. Acceptance of Terms',
      color: '#10797D',
      content: [
        'By accessing and using the AgriLogistics platform ("Platform"), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.',
        'If you do not agree to these terms, please do not use our services.',
        'These terms apply to all users, including shippers, transporters, and visitors to the Platform.',
      ],
    },
    {
      icon: 'business',
      title: '2. Service Description',
      color: '#6366F1',
      content: [
        'AgriLogistics provides a digital marketplace connecting agricultural shippers with transportation service providers in Rwanda.',
        'We facilitate connections but do not directly provide transportation services. We are a technology platform, not a transportation carrier.',
        'Services include: cargo listing, transporter matching, trip tracking, payment processing, and ratings/reviews.',
      ],
    },
    {
      icon: 'person-add',
      title: '3. User Accounts & Registration',
      color: '#F59E0B',
      content: [
        'You must be at least 18 years old and legally capable of entering binding contracts to use this Platform.',
        'You must provide accurate, current, and complete information during registration.',
        'You are responsible for maintaining the confidentiality of your account credentials.',
        'You agree to notify us immediately of any unauthorized access to your account.',
        'One person or entity may not maintain more than one account without our permission.',
      ],
    },
    {
      icon: 'people',
      title: '4. User Responsibilities',
      color: '#27AE60',
      content: [
        'For Shippers: Provide accurate cargo details (weight, dimensions, type, pickup/delivery locations). Ensure cargo is properly packaged and labeled. Be present or arrange representation at pickup/delivery times. Pay agreed-upon fees promptly.',
        'For Transporters: Maintain valid licenses, insurance, and vehicle documentation. Handle cargo with reasonable care. Provide accurate vehicle and capacity information. Complete trips as agreed and update status in real-time.',
        'All Users: Communicate professionally and respectfully. Comply with all applicable laws and regulations. Not use the Platform for illegal activities or fraudulent purposes.',
      ],
    },
    {
      icon: 'shield-checkmark',
      title: '5. Platform Usage Rules',
      color: '#EC4899',
      content: [
        'You may not: Attempt to gain unauthorized access to the Platform or other user accounts. Interfere with or disrupt the Platform\'s operation. Use automated systems or bots without our permission. Copy, modify, or distribute Platform content without authorization. Harass, abuse, or harm other users.',
        'We reserve the right to suspend or terminate accounts that violate these rules.',
      ],
    },
    {
      icon: 'card',
      title: '6. Payment Terms',
      color: '#8B5CF6',
      content: [
        'All fees are quoted in Rwandan Francs (RWF) unless otherwise stated.',
        'Platform service fees are deducted from each transaction as specified in our pricing.',
        'Payment is processed through our secure payment partners.',
        'Refunds are subject to our refund policy and must be requested within 7 days of transaction completion.',
        'You are responsible for any taxes applicable to your use of the Platform.',
      ],
    },
    {
      icon: 'warning',
      title: '7. Limitation of Liability',
      color: '#EF4444',
      content: [
        'AgriLogistics is a technology platform that connects users. We are not responsible for: The quality, safety, or legality of cargo transported. The accuracy of listings or user-provided information. Any damage, loss, or delays during transportation. Disputes between shippers and transporters.',
        'To the maximum extent permitted by law, our liability shall not exceed the service fees paid by you in the 12 months preceding the claim.',
        'We strongly recommend users obtain appropriate insurance coverage.',
      ],
    },
    {
      icon: 'lock-closed',
      title: '8. Intellectual Property',
      color: '#06B6D4',
      content: [
        'All Platform content, features, and functionality are owned by AgriLogistics and protected by international copyright, trademark, and other intellectual property laws.',
        'You may not reproduce, distribute, or create derivative works without our express written permission.',
        'User-generated content (reviews, ratings, listings) remains your property, but you grant us a license to use it for Platform operations.',
      ],
    },
    {
      icon: 'eye',
      title: '9. Privacy & Data Protection',
      color: '#84CC16',
      content: [
        'We collect and process your personal data in accordance with our Privacy Policy.',
        'By using the Platform, you consent to data collection and processing as described.',
        'We implement reasonable security measures but cannot guarantee absolute security.',
        'You have rights to access, correct, and delete your personal data subject to legal requirements.',
      ],
    },
    {
      icon: 'megaphone',
      title: '10. Dispute Resolution',
      color: '#F97316',
      content: [
        'We encourage users to resolve disputes directly through our in-app communication tools.',
        'If a dispute cannot be resolved directly, you may contact our support team at support@agrilogistics.rw.',
        'Any legal disputes shall be governed by the laws of Rwanda and resolved in Rwandan courts.',
        'You agree to attempt mediation before pursuing legal action.',
      ],
    },
    {
      icon: 'close-circle',
      title: '11. Termination',
      color: '#DC2626',
      content: [
        'You may terminate your account at any time through account settings or by contacting support.',
        'We may suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or for any reason at our discretion.',
        'Upon termination, your right to use the Platform ceases immediately.',
        'Certain provisions (payment obligations, liability limitations, intellectual property) survive termination.',
      ],
    },
    {
      icon: 'sync',
      title: '12. Changes to Terms',
      color: '#0EA5E9',
      content: [
        'We reserve the right to modify these Terms at any time.',
        'We will provide notice of material changes via email or Platform notification.',
        'Continued use of the Platform after changes constitutes acceptance of the revised Terms.',
        'Last updated: January 2025',
      ],
    },
    {
      icon: 'mail',
      title: '13. Contact Information',
      color: '#10797D',
      content: [
        'For questions about these Terms, please contact us:',
        'Email: legal@agrilogistics.rw',
        'Phone: +250 XXX XXX XXX',
        'Address: Kigali, Rwanda',
      ],
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
        <View style={[styles.hero, { backgroundColor: '#F9FAFB' }]}>
          <View style={styles.heroContent}>
            <View style={[styles.heroIcon, { backgroundColor: '#10797D' }]}>
              <Ionicons name="document-text" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.heroTitle}>Terms and Conditions</Text>
            <Text style={styles.heroSubtitle}>
              Please read these terms carefully before using our platform
            </Text>
            <View style={styles.lastUpdated}>
              <Ionicons name="calendar" size={16} color="#64748b" />
              <Text style={styles.lastUpdatedText}>Last updated: January 2025</Text>
            </View>
          </View>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <View style={styles.introCard}>
            <Ionicons name="information-circle" size={28} color="#6366F1" />
            <Text style={[styles.introText, { color: theme.textSecondary }]}>
              These Terms and Conditions govern your use of the AgriLogistics platform and services.
              By creating an account or using our services, you agree to comply with these terms.
            </Text>
          </View>
        </View>

        {/* Terms Sections */}
        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: section.color }]}>
                  <Ionicons name={section.icon as any} size={24} color="#FFFFFF" />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{section.title}</Text>
              </View>
              {section.content.map((paragraph, pIndex) => (
                <Text key={pIndex} style={[styles.sectionContent, { color: theme.textSecondary }]}>
                  {paragraph}
                </Text>
              ))}
            </View>
          </View>
        ))}

        {/* Agreement Section */}
        <View style={[styles.agreementSection, { backgroundColor: '#EFF6FF' }]}>
          <View style={styles.agreementCard}>
            <Ionicons name="checkmark-circle" size={48} color="#10797D" />
            <Text style={styles.agreementTitle}>By Using Our Platform</Text>
            <Text style={styles.agreementText}>
              You acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              If you have any questions, please contact our support team before proceeding.
            </Text>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <View style={[styles.ctaCard, { backgroundColor: '#10797D' }]}>
            <Ionicons name="shield-checkmark" size={48} color="#FFFFFF" />
            <Text style={styles.ctaTitle}>Questions About These Terms?</Text>
            <Text style={styles.ctaDescription}>
              Our support team is here to help. Contact us at legal@agrilogistics.rw
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
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
  },
  heroContent: {
    maxWidth: 700,
    alignItems: 'center',
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
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
    marginBottom: 24,
  },
  lastUpdated: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  lastUpdatedText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: width > 768 ? 60 : 24,
    paddingVertical: 12,
  },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 24,
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  introText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
  },
  sectionCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
  agreementSection: {
    paddingVertical: 60,
    paddingHorizontal: width > 768 ? 60 : 24,
    marginTop: 40,
  },
  agreementCard: {
    alignItems: 'center',
    maxWidth: 600,
    marginHorizontal: 'auto',
  },
  agreementTitle: {
    fontSize: width > 768 ? 32 : 24,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  agreementText: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 26,
  },
  ctaSection: {
    paddingVertical: 60,
    paddingHorizontal: width > 768 ? 60 : 24,
  },
  ctaCard: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    borderRadius: 24,
    alignItems: 'center',
    maxWidth: 700,
    marginHorizontal: 'auto',
  },
  ctaTitle: {
    fontSize: width > 768 ? 32 : 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  ctaDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 500,
  },
  ctaButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  ctaButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#10797D',
  },
});
