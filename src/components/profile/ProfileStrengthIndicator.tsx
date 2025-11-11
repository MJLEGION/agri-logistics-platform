// src/components/profile/ProfileStrengthIndicator.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { User } from '../../types';

interface ProfileStrengthIndicatorProps {
  user: User;
  onPress?: () => void;
  showDetails?: boolean;
}

interface ProfileSection {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  isComplete: boolean;
}

export const calculateProfileStrength = (user: User): number => {
  let filledFields = 0;
  let totalFields = 0;

  // Basic fields (always count)
  totalFields += 3;
  if (user.name) filledFields++;
  if (user.phone) filledFields++;
  if (user.role) filledFields++;

  // Profile picture
  totalFields += 1;
  if (user.profilePicture) filledFields++;

  // Personal details
  totalFields += 4;
  if (user.age) filledFields++;
  if (user.gender) filledFields++;
  if (user.location) filledFields++;
  if (user.bio) filledFields++;

  // Professional info
  totalFields += 1;
  if (user.professionalTitle) filledFields++;

  // Role-specific info
  if (user.role === 'transporter') {
    totalFields += 3;
    if (user.vehicleInfo?.type) filledFields++;
    if (user.vehicleInfo?.model) filledFields++;
    if (user.vehicleInfo?.licensePlate) filledFields++;
  } else if (user.role === 'shipper') {
    totalFields += 2;
    if (user.businessInfo?.name) filledFields++;
    if (user.businessInfo?.type) filledFields++;
  }

  // Emergency contact
  totalFields += 3;
  if (user.emergencyContact?.name) filledFields++;
  if (user.emergencyContact?.phone) filledFields++;
  if (user.emergencyContact?.relationship) filledFields++;

  // Preferences
  totalFields += 1;
  if (user.preferences?.language) filledFields++;

  // Notification preferences (count as 1 section)
  totalFields += 1;
  if (user.notificationPreferences) filledFields++;

  // Privacy settings (count as 1 section)
  totalFields += 1;
  if (user.privacySettings) filledFields++;

  return Math.round((filledFields / totalFields) * 100);
};

export const getProfileSections = (user: User): ProfileSection[] => {
  const sections: ProfileSection[] = [
    {
      name: 'Profile Picture',
      icon: 'person-circle',
      isComplete: !!user.profilePicture,
    },
    {
      name: 'Personal Details',
      icon: 'information-circle',
      isComplete: !!(user.age && user.gender && user.location && user.bio),
    },
    {
      name: 'Professional Info',
      icon: 'briefcase',
      isComplete: !!user.professionalTitle,
    },
  ];

  if (user.role === 'transporter') {
    sections.push({
      name: 'Vehicle Info',
      icon: 'car',
      isComplete: !!(
        user.vehicleInfo?.type &&
        user.vehicleInfo?.model &&
        user.vehicleInfo?.licensePlate
      ),
    });
  } else if (user.role === 'shipper') {
    sections.push({
      name: 'Business Info',
      icon: 'business',
      isComplete: !!(user.businessInfo?.name && user.businessInfo?.type),
    });
  }

  sections.push(
    {
      name: 'Emergency Contact',
      icon: 'call',
      isComplete: !!(
        user.emergencyContact?.name &&
        user.emergencyContact?.phone &&
        user.emergencyContact?.relationship
      ),
    },
    {
      name: 'Preferences',
      icon: 'settings',
      isComplete: !!user.preferences?.language,
    },
    {
      name: 'Notifications',
      icon: 'notifications',
      isComplete: !!user.notificationPreferences,
    },
    {
      name: 'Privacy Settings',
      icon: 'shield-checkmark',
      isComplete: !!user.privacySettings,
    }
  );

  return sections;
};

const ProfileStrengthIndicator: React.FC<ProfileStrengthIndicatorProps> = ({
  user,
  onPress,
  showDetails = false,
}) => {
  const { theme } = useTheme();
  const strength = calculateProfileStrength(user);
  const sections = getProfileSections(user);
  const completedSections = sections.filter((s) => s.isComplete).length;

  const getStrengthColor = (): [string, string] => {
    if (strength >= 80) return ['#10797D', '#0D5F66']; // Green
    if (strength >= 50) return ['#F59E0B', '#D97706']; // Yellow/Orange
    return ['#EF4444', '#DC2626']; // Red
  };

  const getStrengthLabel = (): string => {
    if (strength >= 80) return 'Strong Profile';
    if (strength >= 50) return 'Good Profile';
    return 'Weak Profile';
  };

  const [color1, color2] = getStrengthColor();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.card }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="speedometer" size={24} color={color1} />
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.text }]}>
              Profile Strength
            </Text>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              {completedSections} of {sections.length} sections complete
            </Text>
          </View>
        </View>
        <Text style={[styles.percentage, { color: color1 }]}>{strength}%</Text>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
        <LinearGradient
          colors={[color1, color2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${strength}%` }]}
        />
      </View>

      {/* Strength Label */}
      <View style={styles.strengthLabel}>
        <Ionicons
          name={strength >= 80 ? 'checkmark-circle' : strength >= 50 ? 'alert-circle' : 'warning'}
          size={16}
          color={color1}
        />
        <Text style={[styles.strengthText, { color: color1 }]}>
          {getStrengthLabel()}
        </Text>
      </View>

      {/* Section Breakdown */}
      {showDetails && (
        <View style={styles.sections}>
          <Text style={[styles.sectionsTitle, { color: theme.text }]}>
            Profile Sections
          </Text>
          {sections.map((section, index) => (
            <View key={index} style={styles.sectionRow}>
              <View style={styles.sectionLeft}>
                <Ionicons
                  name={section.icon}
                  size={16}
                  color={section.isComplete ? '#10797D' : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.sectionName,
                    {
                      color: section.isComplete ? theme.text : theme.textSecondary,
                    },
                  ]}
                >
                  {section.name}
                </Text>
              </View>
              <Ionicons
                name={section.isComplete ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={section.isComplete ? '#10797D' : theme.border}
              />
            </View>
          ))}
        </View>
      )}

      {/* Call to Action */}
      {strength < 100 && onPress && (
        <TouchableOpacity style={styles.cta} onPress={onPress}>
          <Text style={[styles.ctaText, { color: theme.tertiary }]}>
            Complete Your Profile
          </Text>
          <Ionicons name="chevron-forward" size={16} color={theme.tertiary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
  },
  percentage: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  strengthLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  strengthText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  sections: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  sectionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionName: {
    fontSize: 13,
    marginLeft: 10,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
});

export default ProfileStrengthIndicator;
