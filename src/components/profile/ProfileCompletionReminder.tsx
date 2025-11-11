// src/components/profile/ProfileCompletionReminder.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { User } from '../../types';
import { calculateProfileStrength } from './ProfileStrengthIndicator';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProfileCompletionReminderProps {
  user: User;
  onComplete: () => void;
  onDismiss?: () => void;
}

const REMINDER_DISMISSED_KEY = 'profile_reminder_dismissed';
const REMINDER_DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

const ProfileCompletionReminder: React.FC<ProfileCompletionReminderProps> = ({
  user,
  onComplete,
  onDismiss,
}) => {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-100));
  const strength = calculateProfileStrength(user);

  useEffect(() => {
    checkShouldShow();
  }, [user]);

  const checkShouldShow = async () => {
    try {
      // Don't show if profile is strong enough (80%+)
      if (strength >= 80) {
        setVisible(false);
        return;
      }

      // Check if user has dismissed the reminder recently
      const dismissedData = await AsyncStorage.getItem(REMINDER_DISMISSED_KEY);
      if (dismissedData) {
        const { timestamp, userId } = JSON.parse(dismissedData);
        const now = Date.now();

        // If the same user dismissed within the last 7 days, don't show
        if (userId === user._id && now - timestamp < REMINDER_DISMISS_DURATION) {
          setVisible(false);
          return;
        }
      }

      // Show the reminder with animation
      setVisible(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } catch (error) {
      console.error('Error checking reminder status:', error);
    }
  };

  const handleDismiss = async () => {
    try {
      // Save dismissal timestamp
      await AsyncStorage.setItem(
        REMINDER_DISMISSED_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          userId: user._id,
        })
      );

      // Animate out
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
        onDismiss?.();
      });
    } catch (error) {
      console.error('Error dismissing reminder:', error);
    }
  };

  const getMessage = (): string => {
    if (strength < 30) {
      return 'Complete your profile to unlock all features';
    } else if (strength < 60) {
      return 'Add more details to build trust with users';
    } else {
      return 'Almost there! Complete your profile';
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={20} color="#FFF" />
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="alert-circle" size={28} color="#FFF" />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>Profile Incomplete</Text>
            <Text style={styles.message}>{getMessage()}</Text>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${strength}%` }]} />
              </View>
              <Text style={styles.progressText}>{strength}%</Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity style={styles.actionButton} onPress={onComplete}>
            <Text style={styles.actionText}>Complete</Text>
            <Ionicons name="chevron-forward" size={16} color="#6366F1" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  gradient: {
    padding: 16,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    padding: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 10,
    lineHeight: 18,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
    minWidth: 35,
    textAlign: 'right',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366F1',
    marginRight: 4,
  },
});

export default ProfileCompletionReminder;
