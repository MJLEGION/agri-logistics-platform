// src/screens/LandingScreen.tsx
// Professional landing page with navigation bar, organized sections, and footer
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/Button';
import ServiceCard from '../components/ServiceCard';
import Testimonial from '../components/Testimonial';

import HowItWorksCard from '../components/HowItWorksCard';
import { howItWorks } from '../data/howItWorks';

const { width, height } = Dimensions.get('window');

export default function LandingScreen({ navigation }: any) {
  const { theme, isDark, toggleTheme } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

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

  const services = [
    {
      icon: 'leaf',
      title: 'Direct Shipping for Farmers',
      description: 'Connect directly with transporters to ship your produce efficiently across Rwanda.',
    },
    {
      icon: 'cube',
      title: 'Verified Transporters',
      description: 'All transporters on our platform are vetted to ensure safe and reliable delivery of your cargo.',
    },
    {
      icon: 'car',
      title: 'Full-Service Logistics',
      description: 'Efficient delivery operations with the most affordable rates in the industry.',
    },
  ];

  const testimonials = [
    {
      rating: 5,
      text: "As a farmer, finding reliable transport used to be my biggest challenge. Now, I can easily connect with transporters and get my produce to market faster than ever.",
      author: 'John D.',
      company: 'Farmer, Eastern Province',
    },
    {
      rating: 5,
      text: 'This platform has been a game-changer for my transport business. I have a steady stream of loads, and the route optimization feature helps me save time and fuel.',
      author: 'Jane M.',
      company: 'Transporter, Kigali',
    },
    {
      rating: 5,
      text: 'The transparency and direct communication with transporters is amazing. I know exactly where my cargo is at all times.',
      author: 'Peter G.',
      company: 'Farmer, Western Province',
    },
    {
      rating: 5,
      text: 'I have seen a significant increase in my earnings since I joined this platform. I can easily find return trips and minimize empty miles.',
      author: 'Mary K.',
      company: 'Transporter, Southern Province',
    },
  ];

  const stats = [
    { number: '500,000+', label: 'Total Kilometers Covered' },
    { number: '1000+', label: 'Active Farmers' },
    { number: '10,000+', label: 'Completed Trips' },
    { number: '98%', label: 'Customer Satisfaction' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Navigation Bar - Modern Design */}
      <View style={[styles.navbar, { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderBottomColor: 'transparent' }]}>
        <View style={styles.navbarContent}>
          {/* Logo */}
          <View style={styles.navLogo}>
            <View style={[styles.navLogoIcon, { backgroundColor: '#27AE60' }]}>
              <Ionicons name="leaf" size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.navLogoText, { color: '#1a1a1a', fontWeight: '700' }]}>agrilogistics.</Text>
          </View>

          {/* Nav Menu Items */}
          <View style={styles.navMenu}>
            <TouchableOpacity
              style={styles.navMenuItem}
              onPress={() => navigation.navigate('About')}
            >
              <Text style={styles.navMenuText}>About</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navMenuItem}
              onPress={() => navigation.navigate('Pricing')}
            >
              <Text style={styles.navMenuText}>Pricing</Text>
            </TouchableOpacity>
          </View>

          {/* Nav Actions */}
          <View style={styles.navActions}>
            <TouchableOpacity
              style={styles.navLoginButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={styles.navLoginText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navTalkButton}
              onPress={() => navigation.navigate('RoleSelection')}
              activeOpacity={0.7}
            >
              <Text style={[styles.navButtonText, { color: '#2d3748' }]}>Get started free</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        {/* Hero Section - Modern Gradient Design */}
        <View style={styles.hero}>
          {/* Background Image with Gradient Overlay */}
          <Image
            source={require('../../assets/trucker-2946821.jpg')}
            style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%' }]}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(128, 239, 128, 0.60)',
                     'rgba(128, 239, 128, 0.55)',
                     'rgba(128, 239, 128, 0.50)',
                     'rgba(128, 239, 128, 0.45)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBackground}
          />

          <View style={styles.heroContainer}>
            {/* Left Content */}
            <Animated.View style={[styles.heroLeftContent, { opacity: fadeAnim }]}>
              <Text style={styles.modernHeroTitle}>
                The intuitive logistics{'\n'}platform for fast-growing agricultural businesses
              </Text>

              <Text style={styles.modernHeroSubtitle}>
                Streamline your cargo shipping with AgriLogistics' smart matching, real-time tracking, and transparent pricing platform
              </Text>

              {/* Feature Highlights */}
              <View style={styles.featureHighlights}>
                <View style={styles.featureItem}>
                  <Ionicons name="flash" size={16} color="#FFFFFF" />
                  <Text style={styles.featureItemText}>Instant transporter matching</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
                  <Text style={styles.featureItemText}>Secure escrow payments</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="trending-up" size={16} color="#FFFFFF" />
                  <Text style={styles.featureItemText}>Optimize your routes</Text>
                </View>
              </View>

              {/* CTA Button */}
              <TouchableOpacity
                style={styles.modernCTAButton}
                onPress={() => navigation.navigate('RoleSelection')}
                activeOpacity={0.8}
              >
                <Text style={styles.modernCTAText}>Get started free</Text>
              </TouchableOpacity>

              {/* Rating & Trust Indicators */}
              <View style={styles.trustIndicators}>
                <View style={styles.ratingContainer}>
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons key={star} name="star" size={14} color="#FFA500" />
                    ))}
                  </View>
                  <Text style={styles.ratingText}>4.9/5.0 RATING</Text>
                </View>
                <Text style={styles.noCreditCard}>no credit card required</Text>
              </View>
            </Animated.View>

            {/* Right Content - Dashboard Preview */}
            <View style={styles.heroRightContent}>
              <View style={styles.dashboardMockup}>
                {/* Profile Cards */}
                <View style={styles.profileCard1}>
                  <View style={styles.avatar1} />
                  <View>
                    <Text style={styles.profileName}>John Mukiza</Text>
                    <Text style={styles.profileRole}>Farmer</Text>
                  </View>
                </View>

                {/* Stats Card */}
                <View style={styles.statsCard}>
                  <Text style={styles.statsTitle}>Overview</Text>
                  <Text style={styles.statsSubtitle}>Real-time insights</Text>

                  {/* Pie Chart Placeholder */}
                  <View style={styles.chartPlaceholder}>
                    <View style={[styles.chartSegment, { backgroundColor: '#27AE60' }]} />
                    <View style={[styles.chartSegment, { backgroundColor: '#F1C40F' }]} />
                    <View style={[styles.chartSegment, { backgroundColor: '#3498DB' }]} />
                    <View style={[styles.chartSegment, { backgroundColor: '#E74C3C' }]} />
                  </View>

                  <View style={styles.statsRow}>
                    <Text style={styles.statLabel}>Active Trips</Text>
                    <Text style={styles.statValue}>24</Text>
                  </View>
                  <View style={styles.statsRow}>
                    <Text style={styles.statLabel}>Revenue</Text>
                    <Text style={styles.statValue}>RWF 2.4M</Text>
                  </View>
                </View>

                {/* Profile Card 2 */}
                <View style={styles.profileCard2}>
                  <View style={styles.avatar2} />
                  <View>
                    <Text style={styles.profileName}>Sarah K.</Text>
                    <Text style={styles.profileRole}>Transporter</Text>
                  </View>
                </View>

                {/* Activity Feed */}
                <View style={styles.activityCard}>
                  <Text style={styles.activityTitle}>Recent Activity</Text>
                  <View style={styles.activityItem}>
                    <View style={styles.activityDot} />
                    <Text style={styles.activityText}>New cargo posted</Text>
                  </View>
                  <View style={styles.activityItem}>
                    <View style={styles.activityDot} />
                    <Text style={styles.activityText}>Trip completed</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>



        {/* Services Section - Modern Design */}
        <View style={styles.modernServicesSection}>
          <View style={styles.modernSectionHeader}>
            <Text style={styles.modernSectionTitle}>
              How We Serve You
            </Text>
            <Text style={styles.modernSectionSubtitle}>
              Professional agricultural logistics for every stakeholder
            </Text>
          </View>

          <View style={styles.servicesGrid}>
            {services.map((service, index) => (
              <View key={index} style={styles.modernServiceCard}>
                <View style={styles.serviceIconWrapper}>
                  <View style={[styles.serviceIconBg, {
                    backgroundColor: index === 0 ? '#10797D' : index === 1 ? '#6366F1' : '#F59E0B'
                  }]}>
                    <Ionicons name={service.icon as any} size={24} color="#FFFFFF" />
                  </View>
                </View>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Who We Serve Section - Modern Design */}
        <View style={styles.modernWhoWeServeSection}>
          <View style={styles.modernSectionHeader}>
            <Text style={styles.modernSectionTitle}>
              Who We Serve
            </Text>
          </View>

          <View style={styles.modernRolesGrid}>
            {/* Farmers Card */}
            <TouchableOpacity
              style={styles.modernRoleCard}
              onPress={() => navigation.navigate('RoleSelection')}
              activeOpacity={0.8}
            >
              <View style={styles.modernRoleIconWrapper}>
                <View style={[styles.modernRoleIcon, { backgroundColor: '#10797D' }]}>
                  <Ionicons name="leaf" size={32} color="#FFFFFF" />
                </View>
              </View>
              <Text style={styles.modernRoleTitle}>Farmers</Text>
              <Text style={styles.modernRoleDescription}>
                List your cargo and connect with reliable transporters nationwide.
              </Text>
              <View style={styles.modernRoleFeatures}>
                <View style={styles.modernFeatureRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#10797D" />
                  <Text style={styles.modernFeatureText}>Easy cargo listing</Text>
                </View>
                <View style={styles.modernFeatureRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#10797D" />
                  <Text style={styles.modernFeatureText}>Reliable transport</Text>
                </View>
                <View style={styles.modernFeatureRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#10797D" />
                  <Text style={styles.modernFeatureText}>Fair pricing</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Transporters Card */}
            <TouchableOpacity
              style={styles.modernRoleCard}
              onPress={() => navigation.navigate('RoleSelection')}
              activeOpacity={0.8}
            >
              <View style={styles.modernRoleIconWrapper}>
                <View style={[styles.modernRoleIcon, { backgroundColor: '#6366F1' }]}>
                  <Ionicons name="car" size={32} color="#FFFFFF" />
                </View>
              </View>
              <Text style={styles.modernRoleTitle}>Transporters</Text>
              <Text style={styles.modernRoleDescription}>
                Find loads, optimize routes, and maximize earnings efficiently
              </Text>
              <View style={styles.modernRoleFeatures}>
                <View style={styles.modernFeatureRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#6366F1" />
                  <Text style={styles.modernFeatureText}>Available loads</Text>
                </View>
                <View style={styles.modernFeatureRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#6366F1" />
                  <Text style={styles.modernFeatureText}>Route optimization</Text>
                </View>
                <View style={styles.modernFeatureRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#6366F1" />
                  <Text style={styles.modernFeatureText}>Best rates</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Testimonials Section - Modern Design */}
        <View style={styles.modernTestimonialsSection}>
          <View style={styles.modernSectionHeader}>
            <Text style={styles.modernSectionTitle}>
              What Our Users Say
            </Text>
            <Text style={styles.modernSectionSubtitle}>
              Trusted by farmers and transporters across Rwanda
            </Text>
          </View>

          <View style={styles.testimonialsGrid}>
            {testimonials.map((testimonial, index) => (
              <View key={index} style={styles.modernTestimonialCard}>
                <View style={styles.testimonialStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons key={star} name="star" size={16} color="#F59E0B" />
                  ))}
                </View>
                <Text style={styles.testimonialText}>"{testimonial.text}"</Text>
                <View style={styles.testimonialAuthor}>
                  <View style={styles.testimonialAvatar}>
                    <Text style={styles.testimonialInitial}>
                      {testimonial.author.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.testimonialAuthorName}>{testimonial.author}</Text>
                    <Text style={styles.testimonialCompany}>{testimonial.company}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* How It Works Section - Modern Design */}
        <View style={styles.modernHowItWorksSection}>
          <View style={styles.modernSectionHeader}>
            <Text style={styles.modernSectionTitle}>
              How AgriLogistics Works
            </Text>
            <Text style={styles.modernSectionSubtitle}>
              Simple, transparent process connecting shippers with transporters
            </Text>
          </View>

          <View style={styles.modernStepsContainer}>
            {howItWorks.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.modernStepCard,
                  index % 2 === 1 && styles.modernStepCardReverse
                ]}
              >
                <View style={styles.modernStepIconContainer}>
                  <View style={[styles.modernStepIcon, { backgroundColor: item.color }]}>
                    <Ionicons name={item.icon as any} size={28} color="#FFFFFF" />
                  </View>
                </View>
                <View style={styles.modernStepContent}>
                  <Text style={styles.modernStepLabel}>Step {item.step}</Text>
                  <Text style={styles.modernStepTitle}>{item.title}</Text>
                  <Text style={styles.modernStepDescription}>{item.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* CTA Section - Modern Design */}
        <View style={styles.modernCTASection}>
          <View style={styles.modernCTAContainer}>
            <View style={styles.modernCTAIconWrapper}>
              <View style={styles.modernCTAIconBg}>
                <Ionicons name="rocket" size={40} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.modernCTATitle}>
              Ready to Transform Your Agricultural Business?
            </Text>
            <Text style={styles.modernCTASubtitle}>
              Join thousands of shippers and transporters already using our platform
            </Text>
            <TouchableOpacity
              style={styles.modernCTAPrimaryButton}
              onPress={() => navigation.navigate('RoleSelection')}
              activeOpacity={0.8}
            >
              <Text style={styles.modernCTAPrimaryButtonText}>Get Started Today</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: theme.backgroundAlt, borderTopColor: theme.border }]}>
          <View style={styles.footerContent}>
            {/* Footer Brand */}
            <View style={styles.footerBrand}>
              <View style={styles.footerLogo}>
                <View style={[styles.footerLogoIcon, { backgroundColor: theme.primary }]}>
                  <Ionicons name="leaf" size={24} color="#FFF" />
                </View>
                <Text style={[styles.footerBrandName, { color: theme.text }]}>
                  AgriLogistics
                </Text>
              </View>
              <Text style={[styles.footerBrandTagline, { color: theme.textSecondary }]}>
                Connecting Rwanda's agricultural ecosystem
              </Text>
            </View>

            {/* Footer Links Grid */}
            <View style={styles.footerLinksGrid}>
              {/* Platform Column */}
              <View style={styles.footerColumn}>
                <Text style={[styles.footerColumnTitle, { color: theme.text }]}>Platform</Text>
                <TouchableOpacity onPress={() => navigation.navigate('RoleSelection')}>
                  <Text style={[styles.footerLink, { color: theme.textSecondary }]}>For Shippers</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('RoleSelection')}>
                  <Text style={[styles.footerLink, { color: theme.textSecondary }]}>For Transporters</Text>
                </TouchableOpacity>
              </View>

              {/* Company Column */}
              <View style={styles.footerColumn}>
                <Text style={[styles.footerColumnTitle, { color: theme.text }]}>Company</Text>
                <Text style={[styles.footerLink, { color: theme.textSecondary }]}>About Us</Text>
                <Text style={[styles.footerLink, { color: theme.textSecondary }]}>Contact</Text>
                <Text style={[styles.footerLink, { color: theme.textSecondary }]}>Careers</Text>
              </View>

              {/* Support Column */}
              <View style={styles.footerColumn}>
                <Text style={[styles.footerColumnTitle, { color: theme.text }]}>Support</Text>
                <Text style={[styles.footerLink, { color: theme.textSecondary }]}>Help Center</Text>
                <Text style={[styles.footerLink, { color: theme.textSecondary }]}>Terms of Service</Text>
                <Text style={[styles.footerLink, { color: theme.textSecondary }]}>Privacy Policy</Text>
              </View>
            </View>

            {/* Footer Social */}
            <View style={styles.footerSocial}>
              <Text style={[styles.footerSocialTitle, { color: theme.text }]}>Connect With Us</Text>
              <View style={styles.footerSocialIcons}>
                <TouchableOpacity style={[styles.socialIcon, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Ionicons name="logo-facebook" size={20} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.socialIcon, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Ionicons name="logo-twitter" size={20} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.socialIcon, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Ionicons name="logo-instagram" size={20} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.socialIcon, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Ionicons name="logo-linkedin" size={20} color={theme.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer Bottom */}
            <View style={[styles.footerBottom, { borderTopColor: theme.border }]}>
              <Text style={[styles.footerCopyright, { color: theme.textSecondary }]}>
                © 2024 AgriLogistics Platform. All rights reserved.
              </Text>
              <Text style={[styles.footerMade, { color: theme.textSecondary }]}>
                Made with ❤️ in Rwanda 🇷🇼
              </Text>
            </View>
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
  // Navigation Bar
  navbar: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: width > 768 ? 60 : 24,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  navbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  navMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    flex: 1,
    marginLeft: 48,
    display: width > 768 ? 'flex' : 'none',
  },
  navMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  navMenuText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4a5568',
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navLoginButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    display: width > 768 ? 'flex' : 'none',
  },
  navLoginText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4a5568',
  },
  navTalkButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    backgroundColor: '#ffffff',
    display: width > 768 ? 'flex' : 'none',
  },
  navTalkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2d3748',
  },
  navGetStartedButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 6,
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  navButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Hero Section - Modern Design
  hero: {
    minHeight: height > 600 ? height : 700,
    position: 'relative',
    overflow: 'hidden',
  },
  heroBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContainer: {
    flex: 1,
    flexDirection: width > 768 ? 'row' : 'column',
    paddingHorizontal: width > 768 ? 60 : 24,
    paddingTop: Platform.OS === 'ios' ? 140 : 120,
    paddingBottom: 60,
    alignItems: 'center',
    gap: 40,
  },
  heroLeftContent: {
    flex: 1,
    maxWidth: width > 768 ? 550 : '100%',
    zIndex: 10,
  },
  modernHeroTitle: {
    fontSize: width > 768 ? 52 : 36,
    fontWeight: '800',
    lineHeight: width > 768 ? 62 : 44,
    color: '#FFFFFF',
    marginBottom: 20,
    letterSpacing: -1,
  },
  modernHeroSubtitle: {
    fontSize: width > 768 ? 18 : 16,
    lineHeight: width > 768 ? 28 : 24,
    color: '#FFFFFF',
    marginBottom: 24,
    fontWeight: '400',
  },
  featureHighlights: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  modernCTAButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 8,
    alignSelf: 'flex-start',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 20,
  },
  modernCTAText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  trustIndicators: {
    flexDirection: 'column',
    gap: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4a5568',
    letterSpacing: 0.5,
  },
  noCreditCard: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#718096',
    fontFamily: Platform.OS === 'ios' ? 'Bradley Hand' : 'cursive',
  },
  heroRightContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    display: width > 768 ? 'flex' : 'none',
  },
  dashboardMockup: {
    width: 400,
    height: 500,
    position: 'relative',
  },
  profileCard1: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    zIndex: 3,
  },
  avatar1: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFA500',
  },
  profileName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2d3748',
  },
  profileRole: {
    fontSize: 11,
    color: '#718096',
  },
  statsCard: {
    position: 'absolute',
    top: 120,
    left: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
    zIndex: 2,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statsSubtitle: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 16,
  },
  chartPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    alignSelf: 'center',
    overflow: 'hidden',
    flexDirection: 'row',
    transform: [{ rotate: '45deg' }],
  },
  chartSegment: {
    flex: 1,
    height: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  statLabel: {
    fontSize: 13,
    color: '#718096',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
  },
  profileCard2: {
    position: 'absolute',
    bottom: 160,
    right: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    zIndex: 3,
  },
  avatar2: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
  },
  activityCard: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    zIndex: 1,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#27AE60',
  },
  activityText: {
    fontSize: 11,
    color: '#718096',
  },
  // Modern Services Section
  modernServicesSection: {
    paddingVertical: 80,
    paddingHorizontal: width > 768 ? 60 : 24,
    backgroundColor: '#FFFFFF',
  },
  modernSectionHeader: {
    alignItems: 'center',
    marginBottom: 56,
  },
  modernSectionTitle: {
    fontSize: width > 768 ? 42 : 32,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  modernSectionSubtitle: {
    fontSize: width > 768 ? 18 : 16,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 600,
    lineHeight: 26,
  },
  servicesGrid: {
    flexDirection: width > 768 ? 'row' : 'column',
    gap: 24,
    justifyContent: 'center',
    maxWidth: 1200,
    marginHorizontal: 'auto',
  },
  modernServiceCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minWidth: width > 768 ? 300 : undefined,
  },
  serviceIconWrapper: {
    marginBottom: 20,
  },
  serviceIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  serviceDescription: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Modern Who We Serve Section
  modernWhoWeServeSection: {
    paddingVertical: 80,
    paddingHorizontal: width > 768 ? 60 : 24,
    backgroundColor: '#F9FAFB',
  },
  modernRolesGrid: {
    flexDirection: width > 768 ? 'row' : 'column',
    gap: 24,
    justifyContent: 'center',
    maxWidth: 1200,
    marginHorizontal: 'auto',
  },
  modernRoleCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  modernRoleIconWrapper: {
    marginBottom: 24,
  },
  modernRoleIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  modernRoleTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  modernRoleDescription: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 24,
  },
  modernRoleFeatures: {
    gap: 12,
    width: '100%',
  },
  modernFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modernFeatureText: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
  },
  // Modern Testimonials Section
  modernTestimonialsSection: {
    paddingVertical: 80,
    paddingHorizontal: width > 768 ? 60 : 24,
    backgroundColor: '#FFFFFF',
  },
  testimonialsGrid: {
    flexDirection: width > 768 ? 'row' : 'column',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'center',
    maxWidth: 1200,
    marginHorizontal: 'auto',
  },
  modernTestimonialCard: {
    flex: width > 768 ? 1 : undefined,
    minWidth: width > 768 ? 280 : undefined,
    maxWidth: width > 768 ? 500 : undefined,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  testimonialStars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 16,
  },
  testimonialText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  testimonialAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonialInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  testimonialAuthorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  testimonialCompany: {
    fontSize: 13,
    color: '#64748b',
  },
  // Modern How It Works Section
  modernHowItWorksSection: {
    paddingVertical: 80,
    paddingHorizontal: width > 768 ? 60 : 24,
    backgroundColor: '#F9FAFB',
  },
  modernStepsContainer: {
    gap: 32,
    maxWidth: 900,
    marginHorizontal: 'auto',
    width: '100%',
  },
  modernStepCard: {
    flexDirection: width > 768 ? 'row' : 'column',
    alignItems: width > 768 ? 'flex-start' : 'center',
    gap: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  modernStepCardReverse: {
    flexDirection: width > 768 ? 'row-reverse' : 'column',
  },
  modernStepIconContainer: {
    marginBottom: width > 768 ? 0 : 8,
  },
  modernStepIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  modernStepContent: {
    flex: 1,
    alignItems: width > 768 ? 'flex-start' : 'center',
  },
  modernStepLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10797D',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  modernStepTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: width > 768 ? 'left' : 'center',
  },
  modernStepDescription: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
    textAlign: width > 768 ? 'left' : 'center',
  },
  // Modern CTA Section
  modernCTASection: {
    paddingVertical: 80,
    paddingHorizontal: width > 768 ? 60 : 24,
    backgroundColor: '#FFFFFF',
  },
  modernCTAContainer: {
    alignItems: 'center',
    backgroundColor: '#6366F1',
    borderRadius: 24,
    padding: width > 768 ? 60 : 40,
    maxWidth: 800,
    marginHorizontal: 'auto',
    width: '100%',
  },
  modernCTAIconWrapper: {
    marginBottom: 24,
  },
  modernCTAIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernCTATitle: {
    fontSize: width > 768 ? 36 : 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: width > 768 ? 44 : 36,
  },
  modernCTASubtitle: {
    fontSize: width > 768 ? 18 : 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
    maxWidth: 600,
  },
  modernCTAPrimaryButton: {
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
  modernCTAPrimaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#6366F1',
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  heroStatItem: {
    alignItems: 'center',
  },
  heroStatNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 2,
  },
  heroStatLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  heroStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  banner: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  bannerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    maxWidth: 600,
    marginHorizontal: 'auto',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  rolesGrid: {
    gap: 12,
    alignItems: 'stretch',
  },
  roleCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  roleIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  roleDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  roleFeatures: {
    gap: 6,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 13,
  },
  ctaCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  ctaDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  // Footer
  footer: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderTopWidth: 1,
  },
  footerContent: {
    gap: 32,
  },
  footerBrand: {
    alignItems: 'center',
    gap: 12,
  },
  footerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  footerLogoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBrandName: {
    fontSize: 22,
    fontWeight: '700',
  },
  footerBrandTagline: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLinksGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  footerColumn: {
    flex: 1,
    gap: 12,
  },
  footerColumnTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  footerLink: {
    fontSize: 13,
    lineHeight: 20,
  },
  footerSocial: {
    alignItems: 'center',
    gap: 16,
  },
  footerSocialTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  footerSocialIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  footerBottom: {
    paddingTop: 24,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  footerCopyright: {
    fontSize: 12,
    textAlign: 'center',
  },
  footerMade: {
    fontSize: 12,
    textAlign: 'center',
  },
  // How It Works Section
  howItWorksContainer: {
    paddingVertical: 8,
  },
  // Farmers Section
  farmersContainer: {
    marginBottom: 20,
  },
  viewAllButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewAllButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
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