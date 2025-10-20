// src/components/HowItWorksCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface HowItWorksCardProps {
  step: number;
  icon: string;
  title: string;
  description: string;
  color?: string;
}

export default function HowItWorksCard({
  step,
  icon,
  title,
  description,
  color,
}: HowItWorksCardProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {/* Step Circle */}
      <View
        style={[
          styles.stepCircle,
          { backgroundColor: color || theme.primary },
        ]}
      >
        <Ionicons name={icon as any} size={28} color="#FFF" />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.step, { color: color || theme.primary }]}>
          Step {step}
        </Text>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  stepCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  step: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
});