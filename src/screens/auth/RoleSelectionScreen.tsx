// src/screens/auth/RoleSelectionScreen.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { UserRole } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import Card from '../../components/Card';

const { width } = Dimensions.get('window');

export default function RoleSelectionScreen({ navigation }: any) {
  const { theme } = useTheme();

  const roles = [
    {
      role: 'farmer' as UserRole,
      icon: 'leaf',
      title: 'Farmer',
      description: 'List and sell your crops directly to buyers',
      color: theme.primary,
      gradient: [theme.primary, theme.primaryLight],
      features: ['List crops', 'Manage inventory', 'Track orders'],
    },
    {
      role: 'buyer' as UserRole,
      icon: 'cart',
      title: 'Buyer',
      description: 'Browse and purchase fresh agricultural produce',
      color: theme.accent,
      gradient: [theme.accent, theme.accentLight],
      features: ['Browse crops', 'Place orders', 'Track deliveries'],
    },
    {
      role: 'transporter' as UserRole,
      icon: 'car',
      title: 'Transporter',
      description: 'Find loads and deliver crops efficiently',
      color: theme.secondary,
      gradient: [theme.secondary, theme.secondaryLight],
      features: ['Find loads', 'Optimize routes', 'Earn more'],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[theme.primary, theme.primaryLight]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <ThemeToggle />
          </View>

          <View style={styles.headerContent}>
            <Ionicons name="leaf" size={56} color="#FFFFFF" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Choose Your Role</Text>
            <Text style={styles.headerSubtitle}>
              Select how you want to use Agri-Logistics
            </Text>
          </View>
        </LinearGradient>

        {/* Roles */}
        <View style={styles.rolesContainer}>
          {roles.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => navigation.navigate('Register', { role: item.role })}
              activeOpacity={0.9}
            >
              <Card elevated style={styles.roleCard}>
                <LinearGradient
                  colors={item.gradient}
                  style={styles.roleGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.roleIconContainer}>
                    <Ionicons name={item.icon as any} size={40} color="#FFFFFF" />
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
                          size={16}
                          color={item.color}
                        />
                        <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={[styles.selectButton, { backgroundColor: `${item.color}15` }]}>
                    <Text style={[styles.selectButtonText, { color: item.color }]}>
                      Select {item.title}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color={item.color} />
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

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
    padding: 24,
    gap: 20,
  },
  roleCard: {
    padding: 0,
    overflow: 'hidden',
  },
  roleGradient: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleContent: {
    padding: 20,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  featuresContainer: {
    gap: 8,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
    marginTop: 8,
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
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
});