// src/screens/auth/PremiumRoleSelectionScreen.tsx - Modern Role Selection matching Landing Page
import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface RoleOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
}

export default function PremiumRoleSelectionScreen({ navigation }: any) {
  const [selectedRole, setSelectedRole] = React.useState<string | null>(null);
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
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
    ]).start();
  }, []);

  const roles: RoleOption[] = [
    {
      id: 'shipper',
      title: 'Shipper',
      description: 'I want to ship agricultural products',
      icon: 'leaf',
      color: '#10797D',
      features: ['List cargo', 'Request transport', 'Track shipments', 'Pay transporters'],
    },
    {
      id: 'transporter',
      title: 'Transporter',
      description: 'I want to transport agricultural cargo',
      icon: 'car',
      color: '#1E8449',
      features: ['View available loads', 'Accept trips', 'Real-time tracking', 'Earn money'],
    },
  ];

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setTimeout(() => {
      navigation.navigate('Register', { role: roleId });
    }, 300);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Modern Header with Green Gradient */}
      <LinearGradient
        colors={['#10797D', '#0D5F66', '#10797D']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Animated Background Pattern */}
        <View style={styles.backgroundPattern}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="people-outline" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>Choose Your Role</Text>
          <Text style={styles.headerSubtitle}>
            Select how you want to use AgriLogistics
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Role Cards */}
          <View style={styles.rolesContainer}>
            {roles.map((role) => {
              const isSelected = selectedRole === role.id;
              return (
                <TouchableOpacity
                  key={role.id}
                  style={[
                    styles.roleCard,
                    { backgroundColor: theme.surface },
                    isSelected && { borderColor: role.color, borderWidth: 2 },
                  ]}
                  onPress={() => handleRoleSelect(role.id)}
                  activeOpacity={0.7}
                >
                  {/* Role Icon */}
                  <LinearGradient
                    colors={[role.color, role.color + '80']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.roleIcon}
                  >
                    <Ionicons name={role.icon as any} size={48} color="#FFF" />
                  </LinearGradient>

                  {/* Role Title */}
                  <Text style={[styles.roleTitle, { color: theme.text }]}>{role.title}</Text>
                  <Text style={[styles.roleDescription, { color: theme.textSecondary }]}>
                    {role.description}
                  </Text>

                  {/* Features */}
                  <View style={styles.featuresContainer}>
                    {role.features.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={role.color}
                        />
                        <Text style={[styles.featureText, { color: theme.text }]}>
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Select Indicator */}
                  {isSelected && (
                    <View style={[styles.selectedBadge, { backgroundColor: role.color }]}>
                      <Ionicons name="checkmark" size={20} color="#FFF" />
                      <Text style={styles.selectedText}>Selected</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Info Section */}
          <View style={[styles.infoSection, { backgroundColor: `${theme.primary}10` }]}>
            <Ionicons name="information-circle-outline" size={24} color={theme.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: theme.text }]}>
                Can't decide?
              </Text>
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                You can change your role anytime in your account settings. Many users participate as both shippers and transporters!
              </Text>
            </View>
          </View>

          {/* Back Button */}
          <TouchableOpacity
            style={[styles.backToLoginButton, { borderColor: theme.border }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={theme.primary} />
            <Text style={[styles.backToLoginText, { color: theme.primary }]}>
              Back to Login
            </Text>
          </TouchableOpacity>
        </Animated.View>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 32,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },

  // Role Cards
  rolesContainer: {
    gap: 20,
    marginBottom: 32,
  },
  roleCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  roleIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },

  // Features
  featuresContainer: {
    gap: 12,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Selected Badge
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },

  // Info Section
  infoSection: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(39, 174, 96, 0.2)',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },

  // Back to Login
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    maxWidth: 300,
    alignSelf: 'center',
    width: '100%',
  },
  backToLoginText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
