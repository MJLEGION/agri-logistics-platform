import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';

console.log('[Ratings] Module loaded');

export default function TransporterRatingsScreenSimple() {
  console.log('[Ratings] Render called');
  
  try {
    const navigation = useNavigation<any>();
    const { theme } = useTheme();

    console.log('[Ratings] Hooks initialized, theme:', theme?.background);

    useEffect(() => {
      console.log('[Ratings] Mounted');
      return () => console.log('[Ratings] Unmounted');
    }, []);

    console.log('[Ratings] About to return JSX');

    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={['#F77F00', '#FCBF49']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => {
            console.log('[Ratings] Back button pressed');
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Ratings & Feedback</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Ionicons name="star-outline" size={48} color={theme.textSecondary} />
          <Text style={[styles.title, { color: theme.text }]}>
            No Ratings Yet
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Complete your first delivery to receive ratings from shippers
          </Text>
        </View>
      </ScrollView>
    </View>
    );
  } catch (err) {
    console.error('[Ratings] Error rendering:', err);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ color: '#000', fontSize: 16, fontWeight: 'bold' }}>Error: {String(err)}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
