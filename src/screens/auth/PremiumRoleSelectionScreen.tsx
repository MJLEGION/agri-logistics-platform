// src/screens/auth/PremiumRoleSelectionScreen.tsx - Premium Role Selection
import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  SafeAreaView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PremiumButton from '../../components/PremiumButton';
import PremiumCard from '../../components/PremiumCard';
import { PREMIUM_THEME } from '../../config/premiumTheme';

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
      icon: 'package-variant-closed',
      color: '#27AE60',
      features: ['List cargo', 'Request transport', 'Track shipments', 'Pay transporters'],
    },
    {
      id: 'transporter',
      title: 'Transporter',
      description: 'I want to transport agricultural cargo',
      icon: 'truck-fast',
      color: '#FF6B35',
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
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F1419', '#1A1F2E', '#0D0E13']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Background */}
        <View style={styles.backgroundPattern}>
          <View style={[styles.orb, { width: 400, height: 400, top: -200, left: -100, backgroundColor: '#FF6B35' }]} />
          <View style={[styles.orb, { width: 350, height: 350, bottom: -150, right: -100, backgroundColor: '#004E89' }]} />
        </View>

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
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Choose Your Role</Text>
              <Text style={styles.subtitle}>
                Select how you want to use Agri-Logistics
              </Text>
            </View>

            {/* Role Cards */}
            <View style={styles.rolesContainer}>
              {roles.map((role) => {
                const isSelected = selectedRole === role.id;
                return (
                  <Animated.View key={role.id}>
                    <PremiumCard
                      highlighted={isSelected}
                      style={[isSelected && styles.selectedCard]}
                    >
                      {/* Role Icon */}
                      <LinearGradient
                        colors={[role.color, role.color + '80']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.roleIcon}
                      >
                        <MaterialCommunityIcons name={role.icon} size={48} color="#FFF" />
                      </LinearGradient>

                      {/* Role Title */}
                      <Text style={styles.roleTitle}>{role.title}</Text>
                      <Text style={styles.roleDescription}>{role.description}</Text>

                      {/* Features */}
                      <View style={styles.featuresContainer}>
                        {role.features.map((feature, index) => (
                          <View key={index} style={styles.featureItem}>
                            <MaterialCommunityIcons
                              name="check-circle"
                              size={16}
                              color={role.color}
                            />
                            <Text style={styles.featureText}>{feature}</Text>
                          </View>
                        ))}
                      </View>

                      {/* Select Button */}
                      <PremiumButton
                        label={isSelected ? 'Selected' : 'Choose Role'}
                        variant={role.id === 'shipper' ? 'accent' : 'primary'}
                        onPress={() => handleRoleSelect(role.id)}
                        icon={isSelected ? 'check' : 'arrow-right'}
                        iconPosition="right"
                      />
                    </PremiumCard>
                  </Animated.View>
                );
              })}
            </View>

            {/* Info Section */}
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>Can't decide?</Text>
              <Text style={styles.infoText}>
                You can change your role anytime in your account settings. Many users participate as both shippers and transporters!
              </Text>
            </View>

            {/* Back Button */}
            <PremiumButton
              label="Back to Login"
              variant="ghost"
              onPress={() => navigation.goBack()}
              icon="arrow-left"
            />
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PREMIUM_THEME.colors.background,
  },
  gradient: {
    flex: 1,
  },
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    zIndex: 1,
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: PREMIUM_THEME.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: PREMIUM_THEME.colors.textSecondary,
    textAlign: 'center',
  },
  
  // Roles
  rolesContainer: {
    gap: 20,
    marginBottom: 40,
  },
  selectedCard: {
    borderColor: PREMIUM_THEME.colors.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
  },
  roleIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
    ...PREMIUM_THEME.shadows.lg,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: PREMIUM_THEME.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    color: PREMIUM_THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  
  // Features
  featuresContainer: {
    marginBottom: 24,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: PREMIUM_THEME.colors.textSecondary,
    fontWeight: '500',
  },
  
  // Info
  infoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: PREMIUM_THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: PREMIUM_THEME.colors.border,
    padding: 16,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: PREMIUM_THEME.colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: PREMIUM_THEME.colors.textSecondary,
    lineHeight: 18,
  },
});