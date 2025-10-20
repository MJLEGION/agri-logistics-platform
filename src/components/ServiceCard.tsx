// src/components/ServiceCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
  onPress?: () => void;
}

export default function ServiceCard({ icon, title, description, onPress }: ServiceCardProps) {
  const { theme } = useTheme();

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: theme.gradientOverlay }]}>
        <Ionicons name={icon as any} size={28} color={theme.primary} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {description}
        </Text>
      </View>

      {/* Arrow if clickable */}
      {onPress && (
        <Ionicons name="chevron-forward" size={20} color={theme.textLight} />
      )}
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    maxWidth: 600,
    marginHorizontal: 'auto',
    width: '100%',
    alignSelf: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
});