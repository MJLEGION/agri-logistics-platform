// src/screens/AboutScreen.tsx
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

export default function AboutScreen({ navigation }: any) {
  const { theme } = useTheme();

  const teamValues = [
    {
      icon: 'shield-checkmark',
      title: 'Trust & Reliability',
      description: 'Building a platform you can depend on, with verified transporters and secure transactions.',
      color: '#10797D',
    },
    {
      icon: 'people',
      title: 'Community First',
      description: 'Connecting farmers and transporters to strengthen Rwanda\'s agricultural ecosystem.',
      color: '#6366F1',
    },
    {
      icon: 'trending-up',
      title: 'Innovation',
      description: 'Using technology to make agricultural logistics simple, efficient, and transparent.',
      color: '#F59E0B',
    },
    {
      icon: 'leaf',
      title: 'Sustainability',
      description: 'Supporting local agriculture and promoting efficient resource utilization.',
      color: '#27AE60',
    },
  ];

  const stats = [
    { number: '1000+', label: 'Active Users' },
    { number: '10,000+', label: 'Trips Completed' },
    { number: '500,000+', label: 'KM Covered' },
    { number: '98%', label: 'Satisfaction Rate' },
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
            <Text style={styles.heroTitle}>About AgriLogistics</Text>
            <Text style={styles.heroSubtitle}>
              Transforming agricultural logistics in Rwanda through innovative technology
            </Text>
          </View>
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Our Mission</Text>
            <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
              We're on a mission to revolutionize agricultural logistics in Rwanda by connecting farmers directly with reliable transporters. Our platform eliminates inefficiencies, reduces costs, and ensures that agricultural products reach markets quickly and safely.
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
              By leveraging modern technology, we're making it easier for farmers to access transportation services while helping transporters optimize their routes and maximize their earnings.
            </Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={[styles.statsSection, { backgroundColor: '#6366F1' }]}>
          <Text style={styles.statsTitle}>Our Impact</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={styles.statNumber}>{stat.number}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Values Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Our Values</Text>
            <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
              The principles that guide everything we do
            </Text>
          </View>

          <View style={styles.valuesGrid}>
            {teamValues.map((value, index) => (
              <View key={index} style={[styles.valueCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.valueIcon, { backgroundColor: value.color }]}>
                  <Ionicons name={value.icon as any} size={28} color="#FFFFFF" />
                </View>
                <Text style={[styles.valueTitle, { color: theme.text }]}>{value.title}</Text>
                <Text style={[styles.valueDescription, { color: theme.textSecondary }]}>
                  {value.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Story Section */}
        <View style={[styles.section, { backgroundColor: '#F9FAFB' }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Our Story</Text>
            <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
              AgriLogistics was born from a simple observation: Rwanda's farmers faced significant challenges in transporting their produce to markets, while transporters struggled to find consistent loads. We saw an opportunity to bridge this gap with technology.
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
              Founded in 2024, we started with a vision to create a transparent, efficient marketplace that benefits both farmers and transporters. Today, we're proud to serve thousands of users across Rwanda, facilitating tens of thousands of successful trips.
            </Text>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <View style={[styles.ctaCard, { backgroundColor: '#10797D' }]}>
            <Ionicons name="rocket" size={48} color="#FFFFFF" />
            <Text style={styles.ctaTitle}>Ready to Join Us?</Text>
            <Text style={styles.ctaDescription}>
              Whether you're a farmer looking to ship produce or a transporter seeking loads, we're here to help you succeed.
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('RoleSelection')}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaButtonText}>Get Started Today</Text>
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
  section: {
    paddingVertical: 60,
    paddingHorizontal: width > 768 ? 60 : 24,
  },
  sectionHeader: {
    maxWidth: 800,
    marginHorizontal: 'auto',
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: width > 768 ? 36 : 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  sectionDescription: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 16,
  },
  statsSection: {
    paddingVertical: 60,
    paddingHorizontal: width > 768 ? 60 : 24,
  },
  statsTitle: {
    fontSize: width > 768 ? 36 : 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
  },
  statsGrid: {
    flexDirection: width > 768 ? 'row' : 'column',
    gap: 24,
    justifyContent: 'center',
    maxWidth: 1000,
    marginHorizontal: 'auto',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  statNumber: {
    fontSize: width > 768 ? 48 : 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '600',
  },
  valuesGrid: {
    flexDirection: width > 768 ? 'row' : 'column',
    flexWrap: 'wrap',
    gap: 24,
    maxWidth: 1200,
    marginHorizontal: 'auto',
  },
  valueCard: {
    flex: width > 768 ? 1 : undefined,
    minWidth: width > 768 ? 250 : undefined,
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
