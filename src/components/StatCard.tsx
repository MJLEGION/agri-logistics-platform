// src/components/StatCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface StatCardProps {
  number: string;
  label: string;
  icon?: React.ReactNode;
}

export default function StatCard({ number, label, icon }: StatCardProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.number, { color: theme.primary }]}>{number}</Text>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    minWidth: 120,
    maxWidth: 200,
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 6,
  },
  number: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    textAlign: 'center',
  },
});