// src/components/PremiumHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PREMIUM_THEME } from '../config/premiumTheme';
import { useNavigation } from '@react-navigation/native';

type Props = {
  title: string;
};

export default function PremiumHeader({ title }: Props) {
  const navigation = useNavigation();
  const theme = PREMIUM_THEME;
  const styles = getStyles(theme);

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <View style={{ width: 44 }} />
    </View>
  );
}

const getStyles = (theme: typeof PREMIUM_THEME) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
  },
});