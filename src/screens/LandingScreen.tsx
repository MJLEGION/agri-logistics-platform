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
  useWindowDimensions,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import Button from '../components/Button';
import ServiceCard from '../components/ServiceCard';
import Testimonial from '../components/Testimonial';
import LanguageSwitcher from '../components/LanguageSwitcher';

import HowItWorksCard from '../components/HowItWorksCard';
import { howItWorks } from '../data/howItWorks';

// Get static dimensions for StyleSheet (used for initial layout)
const { width: staticWidth, height: staticHeight } = Dimensions.get('window');

export default function LandingScreen({ navigation }: any) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const scrollViewRef = useRef<ScrollView>(null);
  const { width, height } = useWindowDimensions();

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
      title: t('landing.service1Title'),
      description: t('landing.service1Description'),
    },
    {
      icon: 'cube',
      title: t('landing.service2Title'),
      description: t('landing.service2Description'),
    },
    {
      icon: 'car',
      title: t('landing.service3Title'),
      description: t('landing.service3Description'),
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

  // Responsive styles based on window dimensions
  const isMobile = width <= 768;
  const isSmallMobile = width < 420; // Increased threshold for better mobile experience

  const responsiveStyles = {
    navbar: {
      paddingHorizontal: isMobile ? 20 : 60,
      paddingTop: Platform.OS === 'ios' ? 50 : 24,
      paddingBottom: isMobile ? 20 : 16,
    },
    navbarContent: {
      flexDirection: 'row' as const,
      flexWrap: isMobile ? 'wrap' as const : 'nowrap' as const,
    },
    navLogo: {
      transform: isMobile ? [{ scale: 1.1 }] : [{ scale: 1 }],
    },
    navMenu: {
      display: isMobile ? 'none' : 'flex',
    },
    navActions: {
      flexDirection: 'row' as const,
      gap: isSmallMobile ? 8 : 10,
      marginLeft: isMobile ? 'auto' : 0,
    },
    navLoginButton: {
      display: isMobile ? 'none' : 'flex',
    },
    navTalkButton: {
      paddingHorizontal: isSmallMobile ? 18 : 20,
      paddingVertical: isSmallMobile ? 10 : 11,
      display: 'flex' as const,
    },
    navButtonText: {
      fontSize: isSmallMobile ? 14 : 15,
    },
    hero: {
      minHeight: isMobile ? (isSmallMobile ? 650 : 700) : height,
      paddingHorizontal: isSmallMobile ? 20 : 24,
    },
    modernHeroTitle: {
      fontSize: isMobile ? (isSmallMobile ? 36 : 40) : 52,
      lineHeight: isMobile ? (isSmallMobile ? 44 : 48) : 62,
      marginBottom: isSmallMobile ? 16 : 20,
    },
    modernHeroSubtitle: {
      fontSize: isSmallMobile ? 16 : (isMobile ? 18 : 20),
      lineHeight: isSmallMobile ? 24 : (isMobile ? 28 : 32),
      marginBottom: isSmallMobile ? 24 : 28,
    },
    featureItemText: {
      fontSize: isSmallMobile ? 15 : 16,
    },
    modernCTAButton: {
      paddingHorizontal: isSmallMobile ? 28 : 32,
      paddingVertical: isSmallMobile ? 16 : 18,
      alignSelf: isSmallMobile ? 'stretch' as const : 'flex-start' as const,
    },
    modernCTAText: {
      fontSize: isSmallMobile ? 17 : 18,
    },
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Navigation Bar - Modern Design */}
      <View style={[styles.navbar, responsiveStyles.navbar, { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderBottomColor: 'transparent' }]}>
        <View style={[styles.navbarContent, responsiveStyles.navbarContent]}>
          {/* Logo */}
          <View style={[styles.navLogo, responsiveStyles.navLogo]}>
            <View style={[styles.navLogoIcon, { backgroundColor: '#27AE60' }]}>
              <Ionicons name="leaf" size={isMobile ? 24 : 20} color="#FFFFFF" />
            </View>
            <Text style={[styles.navLogoText, { color: '#1a1a1a', fontWeight: '700', fontSize: isMobile ? 19 : 17 }]}>agrilogistics.</Text>
          </View>

          {/* Nav Menu Items */}
          <View style={[styles.navMenu, responsiveStyles.navMenu]}>
            <TouchableOpacity
              style={styles.navMenuItem}
              onPress={() => navigation.navigate('About')}
            >
              <Text style={styles.navMenuText}>{t('landing.about')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navMenuItem}
              onPress={() => navigation.navigate('Pricing')}
            >
              <Text style={styles.navMenuText}>{t('landing.pricing')}</Text>
            </TouchableOpacity>
          </View>

          {/* Nav Actions */}
          <View style={[styles.navActions, responsiveStyles.navActions]}>
            <LanguageSwitcher showLabel={false} size="small" />
            <TouchableOpacity
              style={[styles.navLoginButton, responsiveStyles.navLoginButton]}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={styles.navLoginText}>{t('landing.login')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navTalkButton, responsiveStyles.navTalkButton]}
              onPress={() => navigation.navigate('RoleSelection')}
              activeOpacity={0.7}
            >
              <Text style={[styles.navButtonText, responsiveStyles.navButtonText, { color: '#2d3748' }]}>{t('landing.getStartedFree')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        {/* Hero Section - Modern Gradient Design */}
        <View style={[styles.hero, responsiveStyles.hero]}>
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
              <Text style={[styles.modernHeroTitle, responsiveStyles.modernHeroTitle]}>
                {t('landing.heroTitle')}
              </Text>

              <Text style={[styles.modernHeroSubtitle, responsiveStyles.modernHeroSubtitle]}>
                {t('landing.heroSubtitle')}
              </Text>

              {/* Feature Highlights */}
              <View style={styles.featureHighlights}>
                <View style={styles.featureItem}>
                  <Ionicons name="flash" size={isMobile ? 18 : 16} color="#FFFFFF" />
                  <Text style={[styles.featureItemText, responsiveStyles.featureItemText]}>{t('landing.instantMatching')}</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="shield-checkmark" size={isMobile ? 18 : 16} color="#FFFFFF" />
                  <Text style={[styles.featureItemText, responsiveStyles.featureItemText]}>{t('landing.securePayments')}</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="trending-up" size={isMobile ? 18 : 16} color="#FFFFFF" />
                  <Text style={[styles.featureItemText, responsiveStyles.featureItemText]}>{t('landing.optimizeRoutes')}</Text>
                </View>
              </View>

              {/* CTA Button */}
              <TouchableOpacity
                style={[styles.modernCTAButton, responsiveStyles.modernCTAButton]}
                onPress={() => navigation.navigate('RoleSelection')}
                activeOpacity={0.8}
              >
                <Text style={[styles.modernCTAText, responsiveStyles.modernCTAText]}>{t('landing.getStartedFree')}</Text>
              </TouchableOpacity>

              {/* Rating & Trust Indicators */}
              <View style={styles.trustIndicators}>
                <View style={styles.ratingContainer}>
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons key={star} name="star" size={14} color="#FFA500" />
                    ))}
                  </View>
                  <Text style={styles.ratingText}>{t('landing.rating')}</Text>
                </View>
                <Text style={styles.noCreditCard}>{t('landing.noCreditCard')}</Text>
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
              {t('landing.howWeServe')}
            </Text>
            <Text style={styles.modernSectionSubtitle}>
              {t('landing.servicesSubtitle')}
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
              {t('landing.whoWeServe')}
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
              <Text style={styles.modernRoleTitle}>{t('landing.farmers')}</Text>
              <Text style={styles.modernRoleDescription}>
                {t('landing.farmersDescription')}
              </Text>
              <View style={styles.modernRoleFeatures}>
                <View style={styles.modernFeatureRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#10797D" />
                  <Text style={styles.modernFeatureText}>{t('landing.easyListing')}</Text>
                </View>
                <View style={styles.modernFeatureRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#10797D" />
                  <Text style={styles.modernFeatureText}>{t('landing.reliableTransport')}</Text>
                </View>
                <View style={styles.modernFeatureRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#10797D" />
                  <Text style={styles.modernFeatureText}>{t('landing.fairPricing')}</Text>
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
              <Text style={styles.modernRoleTitle}>{t('landing.transporters')}</Text>
              <Text style={styles.modernRoleDescription}>
                {t('landing.transportersDescription')}
              </Text>
              <View style={styles.modernRoleFeatures}>
                <View style={styles.modernFeatureRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#6366F1" />
                  <Text style={styles.modernFeatureText}>{t('landing.availableLoadsFeature')}</Text>
                </View>
                <View style={styles.modernFeatureRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#6366F1" />
                  <Text style={styles.modernFeatureText}>{t('landing.routeOptimization')}</Text>
                </View>
                <View style={styles.modernFeatureRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#6366F1" />
                  <Text style={styles.modernFeatureText}>{t('landing.bestRates')}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Testimonials Section - Modern Design */}
        <View style={styles.modernTestimonialsSection}>
          <View style={styles.modernSectionHeader}>
            <Text style={styles.modernSectionTitle}>
              {t('landing.whatUsersSay')}
            </Text>
            <Text style={styles.modernSectionSubtitle}>
              {t('landing.usersSaySubtitle')}
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
              {t('landing.howItWorksTitle')}
            </Text>
            <Text style={styles.modernSectionSubtitle}>
              {t('landing.howItWorksSubtitle')}
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
              {t('landing.ctaTitle')}
            </Text>
            <Text style={styles.modernCTASubtitle}>
              {t('landing.ctaSubtitle')}
            </Text>
            <TouchableOpacity
              style={styles.modernCTAPrimaryButton}
              onPress={() => navigation.navigate('RoleSelection')}
              activeOpacity={0.8}
            >
              <Text style={styles.modernCTAPrimaryButtonText}>{t('landing.getStartedToday')}</Text>
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
                {t('landing.connectingRwanda')}
              </Text>
            </View>

            {/* Footer Links Grid */}
            <View style={styles.footerLinksGrid}>
              {/* Platform Column */}
              <View style={styles.footerColumn}>
                <Text style={[styles.footerColumnTitle, { color: theme.text }]}>{t('landing.platform')}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('RoleSelection')}>
                  <Text style={[styles.footerLink, { color: theme.textSecondary }]}>{t('landing.forShippers')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('RoleSelection')}>
                  <Text style={[styles.footerLink, { color: theme.textSecondary }]}>{t('landing.forTransporters')}</Text>
                </TouchableOpacity>
              </View>

              {/* Company Column */}
              <View style={styles.footerColumn}>
                <Text style={[styles.footerColumnTitle, { color: theme.text }]}>{t('landing.company')}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('About')}>
                  <Text style={[styles.footerLink, { color: theme.textSecondary }]}>{t('landing.aboutUs')}</Text>
                </TouchableOpacity>
                <Text style={[styles.footerLink, { color: theme.textSecondary }]}>{t('landing.contact')}</Text>
                <Text style={[styles.footerLink, { color: theme.textSecondary }]}>{t('landing.careers')}</Text>
              </View>

              {/* Support Column */}
              <View style={styles.footerColumn}>
                <Text style={[styles.footerColumnTitle, { color: theme.text }]}>{t('landing.support')}</Text>
                <Text style={[styles.footerLink, { color: theme.textSecondary }]}>{t('landing.helpCenter')}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('TermsAndConditions')}>
                  <Text style={[styles.footerLink, { color: theme.textSecondary }]}>{t('landing.termsOfService')}</Text>
                </TouchableOpacity>
                <Text style={[styles.footerLink, { color: theme.textSecondary }]}>{t('landing.privacyPolicy')}</Text>
              </View>
            </View>

            {/* Footer Social */}
            <View style={styles.footerSocial}>
              <Text style={[styles.footerSocialTitle, { color: theme.text }]}>{t('landing.connectWithUs')}</Text>
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
                {t('landing.allRightsReserved')}
              </Text>
              <Text style={[styles.footerMade, { color: theme.textSecondary }]}>
                {t('landing.madeInRwanda')}
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
    paddingHorizontal: staticWidth > 768 ? 60 : 24,
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
    display: staticWidth > 768 ? 'flex' : 'none',
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
    display: staticWidth > 768 ? 'flex' : 'none',
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
    display: staticWidth > 768 ? 'flex' : 'none',
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
    minHeight: staticWidth > 768 ? staticHeight : (staticWidth < 375 ? 550 : 600),
    position: 'relative',
    overflow: 'hidden',
  },
  heroBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContainer: {
    flex: 1,
    flexDirection: staticWidth > 768 ? 'row' : 'column',
    paddingHorizontal: staticWidth > 768 ? 60 : (staticWidth < 375 ? 16 : 20),
    paddingTop: Platform.OS === 'ios' ? 120 : 100,
    paddingBottom: staticWidth < 375 ? 30 : 40,
    alignItems: 'center',
    gap: staticWidth > 768 ? 40 : 20,
  },
  heroLeftContent: {
    flex: 1,
    maxWidth: staticWidth > 768 ? 550 : '100%',
    zIndex: 10,
  },
  modernHeroTitle: {
    fontSize: staticWidth > 768 ? 52 : (staticWidth < 375 ? 28 : 32),
    fontWeight: '800',
    lineHeight: staticWidth > 768 ? 62 : (staticWidth < 375 ? 36 : 40),
    color: '#FFFFFF',
    marginBottom: staticWidth < 375 ? 12 : 16,
    letterSpacing: -1,
  },
  modernHeroSubtitle: {
    fontSize: staticWidth > 768 ? 18 : (staticWidth < 375 ? 14 : 15),
    lineHeight: staticWidth > 768 ? 28 : (staticWidth < 375 ? 20 : 22),
    color: '#FFFFFF',
    marginBottom: staticWidth < 375 ? 16 : 20,
    fontWeight: '400',
  },
  featureHighlights: {
    flexDirection: 'column',
    gap: staticWidth < 375 ? 8 : 12,
    marginBottom: staticWidth < 375 ? 20 : 28,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: staticWidth < 375 ? 8 : 10,
  },
  featureItemText: {
    fontSize: staticWidth < 375 ? 13 : 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  modernCTAButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: staticWidth < 375 ? 20 : 24,
    paddingVertical: staticWidth < 375 ? 12 : 14,
    borderRadius: 8,
    alignSelf: staticWidth < 375 ? 'stretch' : 'flex-start',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: staticWidth < 375 ? 16 : 20,
  },
  modernCTAText: {
    fontSize: staticWidth < 375 ? 14 : 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: staticWidth < 375 ? 'center' : 'left',
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
    display: staticWidth > 768 ? 'flex' : 'none',
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
    paddingVertical: staticWidth > 768 ? 80 : (staticWidth < 375 ? 40 : 50),
    paddingHorizontal: staticWidth > 768 ? 60 : (staticWidth < 375 ? 16 : 20),
    backgroundColor: '#FFFFFF',
  },
  modernSectionHeader: {
    alignItems: 'center',
    marginBottom: staticWidth > 768 ? 56 : (staticWidth < 375 ? 32 : 40),
  },
  modernSectionTitle: {
    fontSize: staticWidth > 768 ? 42 : (staticWidth < 375 ? 24 : 28),
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: staticWidth < 375 ? 8 : 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  modernSectionSubtitle: {
    fontSize: staticWidth > 768 ? 18 : (staticWidth < 375 ? 14 : 15),
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 600,
    lineHeight: staticWidth < 375 ? 20 : 24,
    paddingHorizontal: staticWidth < 375 ? 8 : 0,
  },
  servicesGrid: {
    flexDirection: staticWidth > 768 ? 'row' : 'column',
    gap: staticWidth < 375 ? 16 : 20,
    justifyContent: 'center',
    maxWidth: 1200,
    marginHorizontal: 'auto',
  },
  modernServiceCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: staticWidth > 768 ? 32 : (staticWidth < 375 ? 20 : 24),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minWidth: staticWidth > 768 ? 300 : undefined,
  },
  serviceIconWrapper: {
    marginBottom: staticWidth < 375 ? 12 : 16,
  },
  serviceIconBg: {
    width: staticWidth < 375 ? 48 : 56,
    height: staticWidth < 375 ? 48 : 56,
    borderRadius: staticWidth < 375 ? 24 : 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceTitle: {
    fontSize: staticWidth < 375 ? 16 : 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: staticWidth < 375 ? 8 : 12,
    textAlign: 'center',
  },
  serviceDescription: {
    fontSize: staticWidth < 375 ? 13 : 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: staticWidth < 375 ? 18 : 22,
  },
  // Modern Who We Serve Section
  modernWhoWeServeSection: {
    paddingVertical: staticWidth > 768 ? 80 : (staticWidth < 375 ? 40 : 50),
    paddingHorizontal: staticWidth > 768 ? 60 : (staticWidth < 375 ? 16 : 20),
    backgroundColor: '#F9FAFB',
  },
  modernRolesGrid: {
    flexDirection: staticWidth > 768 ? 'row' : 'column',
    gap: staticWidth < 375 ? 16 : 20,
    justifyContent: 'center',
    maxWidth: 1200,
    marginHorizontal: 'auto',
  },
  modernRoleCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: staticWidth > 768 ? 40 : (staticWidth < 375 ? 20 : 28),
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
    marginBottom: staticWidth < 375 ? 16 : 20,
  },
  modernRoleIcon: {
    width: staticWidth < 375 ? 52 : 64,
    height: staticWidth < 375 ? 52 : 64,
    borderRadius: staticWidth < 375 ? 26 : 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  modernRoleTitle: {
    fontSize: staticWidth < 375 ? 20 : 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: staticWidth < 375 ? 8 : 12,
  },
  modernRoleDescription: {
    fontSize: staticWidth < 375 ? 14 : 16,
    color: '#64748b',
    lineHeight: staticWidth < 375 ? 20 : 24,
    marginBottom: staticWidth < 375 ? 16 : 20,
  },
  modernRoleFeatures: {
    gap: staticWidth < 375 ? 8 : 12,
    width: '100%',
  },
  modernFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: staticWidth < 375 ? 8 : 10,
  },
  modernFeatureText: {
    fontSize: staticWidth < 375 ? 13 : 15,
    color: '#475569',
    fontWeight: '500',
  },
  // Modern Testimonials Section
  modernTestimonialsSection: {
    paddingVertical: staticWidth > 768 ? 80 : (staticWidth < 375 ? 40 : 50),
    paddingHorizontal: staticWidth > 768 ? 60 : (staticWidth < 375 ? 16 : 20),
    backgroundColor: '#FFFFFF',
  },
  testimonialsGrid: {
    flexDirection: staticWidth > 768 ? 'row' : 'column',
    flexWrap: 'wrap',
    gap: staticWidth < 375 ? 16 : 20,
    justifyContent: 'center',
    maxWidth: 1200,
    marginHorizontal: 'auto',
  },
  modernTestimonialCard: {
    flex: staticWidth > 768 ? 1 : undefined,
    minWidth: staticWidth > 768 ? 280 : undefined,
    maxWidth: staticWidth > 768 ? 500 : undefined,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: staticWidth > 768 ? 28 : (staticWidth < 375 ? 16 : 20),
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
    marginBottom: staticWidth < 375 ? 12 : 16,
  },
  testimonialText: {
    fontSize: staticWidth < 375 ? 13 : 15,
    color: '#475569',
    lineHeight: staticWidth < 375 ? 20 : 24,
    marginBottom: staticWidth < 375 ? 16 : 20,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  testimonialAvatar: {
    width: staticWidth < 375 ? 40 : 48,
    height: staticWidth < 375 ? 40 : 48,
    borderRadius: staticWidth < 375 ? 20 : 24,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonialInitial: {
    fontSize: staticWidth < 375 ? 16 : 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  testimonialAuthorName: {
    fontSize: staticWidth < 375 ? 14 : 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  testimonialCompany: {
    fontSize: staticWidth < 375 ? 12 : 13,
    color: '#64748b',
  },
  // Modern How It Works Section
  modernHowItWorksSection: {
    paddingVertical: staticWidth > 768 ? 80 : (staticWidth < 375 ? 40 : 50),
    paddingHorizontal: staticWidth > 768 ? 60 : (staticWidth < 375 ? 16 : 20),
    backgroundColor: '#F9FAFB',
  },
  modernStepsContainer: {
    gap: staticWidth < 375 ? 16 : 24,
    maxWidth: 900,
    marginHorizontal: 'auto',
    width: '100%',
  },
  modernStepCard: {
    flexDirection: staticWidth > 768 ? 'row' : 'column',
    alignItems: staticWidth > 768 ? 'flex-start' : 'center',
    gap: staticWidth < 375 ? 12 : 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: staticWidth > 768 ? 28 : (staticWidth < 375 ? 16 : 20),
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  modernStepCardReverse: {
    flexDirection: staticWidth > 768 ? 'row-reverse' : 'column',
  },
  modernStepIconContainer: {
    marginBottom: staticWidth > 768 ? 0 : (staticWidth < 375 ? 4 : 8),
  },
  modernStepIcon: {
    width: staticWidth < 375 ? 56 : 72,
    height: staticWidth < 375 ? 56 : 72,
    borderRadius: staticWidth < 375 ? 28 : 36,
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
    alignItems: staticWidth > 768 ? 'flex-start' : 'center',
  },
  modernStepLabel: {
    fontSize: staticWidth < 375 ? 11 : 13,
    fontWeight: '700',
    color: '#10797D',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: staticWidth < 375 ? 6 : 8,
  },
  modernStepTitle: {
    fontSize: staticWidth < 375 ? 16 : 20,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: staticWidth < 375 ? 6 : 8,
    textAlign: staticWidth > 768 ? 'left' : 'center',
  },
  modernStepDescription: {
    fontSize: staticWidth < 375 ? 13 : 15,
    color: '#64748b',
    lineHeight: staticWidth < 375 ? 18 : 22,
    textAlign: staticWidth > 768 ? 'left' : 'center',
  },
  // Modern CTA Section
  modernCTASection: {
    paddingVertical: staticWidth > 768 ? 80 : (staticWidth < 375 ? 40 : 50),
    paddingHorizontal: staticWidth > 768 ? 60 : (staticWidth < 375 ? 16 : 20),
    backgroundColor: '#FFFFFF',
  },
  modernCTAContainer: {
    alignItems: 'center',
    backgroundColor: '#6366F1',
    borderRadius: 24,
    padding: staticWidth > 768 ? 60 : (staticWidth < 375 ? 24 : 32),
    maxWidth: 800,
    marginHorizontal: 'auto',
    width: '100%',
  },
  modernCTAIconWrapper: {
    marginBottom: staticWidth < 375 ? 16 : 20,
  },
  modernCTAIconBg: {
    width: staticWidth < 375 ? 64 : 80,
    height: staticWidth < 375 ? 64 : 80,
    borderRadius: staticWidth < 375 ? 32 : 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernCTATitle: {
    fontSize: staticWidth > 768 ? 36 : (staticWidth < 375 ? 22 : 26),
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: staticWidth < 375 ? 12 : 16,
    lineHeight: staticWidth > 768 ? 44 : (staticWidth < 375 ? 28 : 32),
    paddingHorizontal: staticWidth < 375 ? 8 : 0,
  },
  modernCTASubtitle: {
    fontSize: staticWidth > 768 ? 18 : (staticWidth < 375 ? 14 : 15),
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: staticWidth < 375 ? 20 : 28,
    lineHeight: staticWidth < 375 ? 20 : 24,
    maxWidth: 600,
    paddingHorizontal: staticWidth < 375 ? 8 : 0,
  },
  modernCTAPrimaryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: staticWidth < 375 ? 24 : 32,
    paddingVertical: staticWidth < 375 ? 12 : 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
    width: staticWidth < 375 ? '100%' : 'auto',
  },
  modernCTAPrimaryButtonText: {
    fontSize: staticWidth < 375 ? 15 : 17,
    fontWeight: '700',
    color: '#6366F1',
    textAlign: 'center',
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
    paddingVertical: staticWidth < 375 ? 32 : 40,
    paddingHorizontal: staticWidth < 375 ? 16 : 20,
    borderTopWidth: 1,
  },
  footerContent: {
    gap: staticWidth < 375 ? 24 : 32,
  },
  footerBrand: {
    alignItems: 'center',
    gap: staticWidth < 375 ? 8 : 12,
  },
  footerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  footerLogoIcon: {
    width: staticWidth < 375 ? 36 : 40,
    height: staticWidth < 375 ? 36 : 40,
    borderRadius: staticWidth < 375 ? 18 : 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBrandName: {
    fontSize: staticWidth < 375 ? 18 : 22,
    fontWeight: '700',
  },
  footerBrandTagline: {
    fontSize: staticWidth < 375 ? 12 : 14,
    textAlign: 'center',
    lineHeight: staticWidth < 375 ? 16 : 20,
  },
  footerLinksGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: staticWidth < 375 ? 12 : 16,
    flexWrap: staticWidth < 375 ? 'wrap' : 'nowrap',
  },
  footerColumn: {
    flex: staticWidth < 375 ? undefined : 1,
    gap: staticWidth < 375 ? 8 : 12,
    minWidth: staticWidth < 375 ? '30%' : undefined,
  },
  footerColumnTitle: {
    fontSize: staticWidth < 375 ? 12 : 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  footerLink: {
    fontSize: staticWidth < 375 ? 11 : 13,
    lineHeight: staticWidth < 375 ? 16 : 20,
  },
  footerSocial: {
    alignItems: 'center',
    gap: staticWidth < 375 ? 12 : 16,
  },
  footerSocialTitle: {
    fontSize: staticWidth < 375 ? 12 : 14,
    fontWeight: '600',
  },
  footerSocialIcons: {
    flexDirection: 'row',
    gap: staticWidth < 375 ? 8 : 12,
  },
  socialIcon: {
    width: staticWidth < 375 ? 36 : 44,
    height: staticWidth < 375 ? 36 : 44,
    borderRadius: staticWidth < 375 ? 18 : 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  footerBottom: {
    paddingTop: staticWidth < 375 ? 16 : 24,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  footerCopyright: {
    fontSize: staticWidth < 375 ? 10 : 12,
    textAlign: 'center',
    paddingHorizontal: staticWidth < 375 ? 8 : 0,
  },
  footerMade: {
    fontSize: staticWidth < 375 ? 10 : 12,
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
    top: staticHeight / 2 - 75,
    right: -75,
  },
});