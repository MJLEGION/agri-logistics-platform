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
      title: 'END-USER LICENSE AGREEMENT (EULA)',
      color: '#64748b',
      content: [
        'Last Updated: November 2025',
        '',
        '1. Agreement to Terms',
        'By downloading, installing, or using the Agri-Logistics PWA ("Application"), you agree to be bound by this Agreement. If you do not agree, do not use the Application. This Agreement is between you ("User") and Michael George ("Developer").',
        '',
        '2. Grant of License',
        'The Developer grants you a revocable, non-exclusive, non-transferable, limited license to download, install, and use the Application strictly in accordance with the terms of this Agreement.',
      ],
    },
    {
      icon: 'people',
      title: 'User Accounts & Responsibilities',
      color: '#64748b',
      content: [
        'Farmers: You are responsible for the accuracy of crop listings (weight, type, location). False listings may result in account suspension.',
        '',
        'Transporters: You agree to transport goods safely and in a timely manner. The Developer is not liable for traffic delays or vehicle breakdowns.',
      ],
    },
    {
      icon: 'close-circle',
      title: 'Prohibited Activities',
      color: '#64748b',
      content: [
        'You agree not to:',
        '• Reverse engineer, decompile, or attempt to derive the source code of the Application.',
        '• Use the Application for any illegal purpose or to harass, abuse, or harm others.',
        '• Input false data to manipulate the matching algorithm.',
      ],
    },
    {
      icon: 'warning',
      title: 'Limitation of Liability',
      color: '#64748b',
      content: [
        'To the maximum extent permitted by applicable law, in no event shall the Developer be liable for any special, incidental, indirect, or consequential damages whatsoever (including, but not limited to, damages for loss of crops, loss of profits, or business interruption) arising out of the use of or inability to use the Application.',
        '',
        'The Application is a matching tool only; the Developer does not own the trucks or the crops.',
      ],
    },
    {
      icon: 'close-circle',
      title: 'Termination',
      color: '#64748b',
      content: [
        'This Agreement is effective until terminated by you or the Developer. Your rights under this Agreement will terminate automatically without notice if you fail to comply with any term(s) of this Agreement.',
      ],
    },
    {
      icon: 'lock-closed',
      title: 'PRIVACY POLICY',
      color: '#64748b',
      content: [
        'Last Updated: November 2025',
        '',
        '1. Introduction',
        'Agri-Logistics ("we," "us," or "our") respects your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our Progressive Web Application (PWA).',
        '',
        '2. Information We Collect',
        'Personal Data: Name, phone number, and PIN (stored securely).',
        '',
        'Geo-Location Data: We collect your GPS location to enable the "Matching Engine" and "Route Optimization" features. Transporters: Location is tracked only during active trips. Farmers: Location is recorded only when listing a pickup point.',
        '',
        'Financial Data: We process transaction requests via the MTN Mobile Money (Momo) API. We do not store your full bank account details or Momo PINs. Transaction logs (amount, status) are retained for record-keeping.',
      ],
    },
    {
      icon: 'shield-checkmark',
      title: 'How We Use Your Information',
      color: '#64748b',
      content: [
        '• To facilitate the connection between Farmers and Transporters.',
        '• To calculate shipping costs and optimized routes.',
        '• To process payments securely.',
        '• To improve the Application\'s algorithm and performance.',
      ],
    },
    {
      icon: 'server',
      title: 'Data Storage and Security',
      color: '#64748b',
      content: [
        'Offline Data: Some data is stored locally on your device via IndexedDB/SQLite for offline access.',
        '',
        'Cloud Data: Synced data is stored on secure servers (e.g., MongoDB, Railway and Vercel).',
        '',
        'Security: We use encryption (HTTPS/SSL) and password hashing (bcrypt) to protect your data. However, no method of transmission over the internet is 100% secure.',
      ],
    },
    {
      icon: 'share-social',
      title: 'Sharing of Your Information',
      color: '#64748b',
      content: [
        'We do not sell your personal information. We may share data with:',
        '',
        'Service Providers: Third-party vendors (e.g., Map Providers, SMS Gateways) who perform services for us.',
        '',
        'Legal Obligations: If required by law to protect our rights or comply with a judicial proceeding.',
      ],
    },
    {
      icon: 'lock-closed',
      title: 'COPYRIGHT NOTICE',
      color: '#64748b',
      content: [
        '© 2025 Michael George. All Rights Reserved.',
        '',
        'The source code, design, algorithms, graphics, and architecture of the Agri-Logistics Platform are the intellectual property of Michael George.',
        '',
        'Protection: Unauthorized reproduction, distribution, or modification of this software, or any portion of it, may result in severe civil and criminal penalties and will be prosecuted to the maximum extent possible under the law.',
      ],
    },
    {
      icon: 'layers',
      title: 'Third-Party Assets',
      color: '#64748b',
      content: [
        '• Map data is provided by OpenStreetMap under the ODbL license.',
        '• Payment processing is provided by MTN Mobile Money.',
        '• Certain open-source libraries (e.g., React Native, Node.js) are used under their respective MIT or Apache 2.0 licenses.',
      ],
    },
    {
      icon: 'mail',
      title: 'Contact Information',
      color: '#64748b',
      content: [
        'For questions about these Terms or licensing inquiries, please contact:',
        '',
        'Michael George',
        'Department of Software Engineering',
        'African Leadership University',
        'Email: m.george@alustudent.com',
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
