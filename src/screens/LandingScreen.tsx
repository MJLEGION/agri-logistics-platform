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
      {/* Navigation Bar */}
      <LinearGradient
        colors={['#F77F00', '#FCBF49']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.navbar, { borderBottomColor: theme.border }]}
      >
        <View style={styles.navbarContent}>
          {/* Logo */}
          <View style={styles.navLogo}>
            <View style={[styles.navLogoIcon, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
              <Ionicons name="leaf" size={20} color="#FFF" />
            </View>
            <Text style={[styles.navLogoText, { color: '#FFF', fontWeight: '700' }]}>AgriLogistics</Text>
          </View>

          {/* Nav Actions */}
          <View style={styles.navActions}>
            <TouchableOpacity
              style={styles.themeToggle}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={20}
                color="#FFF"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navButton, { borderColor: '#FFF' }]}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={[styles.navButtonText, { color: '#FFF' }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        {/* Hero Section - Full-width gradient */}
        <LinearGradient
          colors={['#F77F00', '#FCBF49', '#27AE60']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
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

          <Animated.View style={[styles.heroContent, { opacity: fadeAnim }]}>
            {/* Hero Badge */}
            <View style={styles.heroBadge}>
              <Ionicons name="star" size={12} color={theme.accent} />
              <Text style={styles.heroBadgeText}>Rwanda's #1 Agricultural Platform</Text>
            </View>

            <Text style={styles.heroTitle}>
              Connecting Shippers and Transporters, Seamlessly.
            </Text>

            <Text style={styles.heroSubtitle}>
              The most efficient way to ship your agricultural cargo across Rwanda. 
              We connect farmers and other shippers directly with our network of verified transporters.
            </Text>

            <View style={styles.heroButtons}>
              <TouchableOpacity
                style={styles.heroPrimaryButton}
                onPress={() => navigation.navigate('RoleSelection')}
                activeOpacity={0.8}
              >
                <Text style={styles.heroPrimaryButtonText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.heroSecondaryButton}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.8}
              >
                <Text style={styles.heroSecondaryButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* Hero Stats */}
            <View style={styles.heroStats}>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatNumber}>1000+</Text>
                <Text style={styles.heroStatLabel}>Shippers</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatNumber}>500+</Text>
                <Text style={styles.heroStatLabel}>Transporters</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatNumber}>98%</Text>
                <Text style={styles.heroStatLabel}>Satisfaction</Text>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>



        {/* Services Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            How We Serve You
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Professional agricultural logistics for every stakeholder
          </Text>

          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
            />
          ))}
        </View>

        {/* Who We Serve Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Who We Serve
          </Text>

          <View style={styles.rolesGrid}>
            {/* Farmers Card */}
            <TouchableOpacity
              style={[styles.roleCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => navigation.navigate('RoleSelection')}
              activeOpacity={0.7}
            >
              <View style={[styles.roleIconContainer, { backgroundColor: theme.gradientOverlay }]}>
                <Ionicons name="leaf" size={32} color={theme.primary} />
              </View>
              <Text style={[styles.roleTitle, { color: theme.text }]}>Farmers</Text>
              <Text style={[styles.roleDescription, { color: theme.textSecondary }]}>
                List your cargo and connect with reliable transporters nationwide.
              </Text>
              <View style={styles.roleFeatures}>
                <View style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                  <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                    Easy cargo listing
                  </Text>
                </View>
                <View style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                  <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                    Reliable transport
                  </Text>
                </View>
                <View style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                  <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                    Fair pricing
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Transporters Card */}
            <TouchableOpacity
              style={[styles.roleCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => navigation.navigate('RoleSelection')}
              activeOpacity={0.7}
            >
              <View style={[styles.roleIconContainer, { backgroundColor: theme.gradientOverlay }]}>
                <Ionicons name="car" size={32} color={theme.secondary} />
              </View>
              <Text style={[styles.roleTitle, { color: theme.text }]}>Transporters</Text>
              <Text style={[styles.roleDescription, { color: theme.textSecondary }]}>
                Find loads, optimize routes, and maximize earnings efficiently
              </Text>
              <View style={styles.roleFeatures}>
                <View style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                  <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                    Available loads
                  </Text>
                </View>
                <View style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                  <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                    Route optimization
                  </Text>
                </View>
                <View style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                  <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                    Best rates
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Testimonials Section */}
        <View style={[styles.section, { backgroundColor: theme.backgroundAlt }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            What Our Users Say
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Trusted by farmers and transporters across Rwanda
          </Text>

          {testimonials.map((testimonial, index) => (
            <Testimonial
              key={index}
              rating={testimonial.rating}
              text={testimonial.text}
              author={testimonial.author}
              company={testimonial.company}
            />
          ))}
        </View>

        {/* How It Works Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            How AgriLogistics Works
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Simple, transparent process connecting shippers with transporters
          </Text>

          <View style={styles.howItWorksContainer}>
            {howItWorks.map((item, index) => (
              <HowItWorksCard
                key={index}
                step={item.step}
                icon={item.icon}
                title={item.title}
                description={item.description}
                color={item.color}
              />
            ))}
          </View>
        </View>



        {/* CTA Section */}
        <View style={styles.section}>
          <View style={[styles.ctaCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="rocket" size={48} color={theme.primary} />
            <Text style={[styles.ctaTitle, { color: theme.text }]}>
              Ready to Transform Your Agricultural Business?
            </Text>
                          <Text style={[styles.ctaDescription, { color: theme.textSecondary }]}>
                            Join thousands of shippers and transporters already using our platform
                          </Text>            <Button
              title="Get Started Today"
              onPress={() => navigation.navigate('RoleSelection')}
              variant="primary"
              size="large"
            />
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
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  navbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navLogoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLogoText: {
    fontSize: 18,
    fontWeight: '700',
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeToggle: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Hero Section
  hero: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
    color: '#FFF',
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 8,
    color: 'rgba(255, 255, 255, 0.95)',
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 40,
  },
  heroPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  heroPrimaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D6A4F',
  },
  heroSecondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  heroSecondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
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