// src/components/Testimonial.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface TestimonialProps {
  rating: number;
  text: string;
  author: string;
  company?: string;
}

export default function Testimonial({ rating, text, author, company }: TestimonialProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {/* Star Rating */}
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color={star <= rating ? theme.star : theme.starEmpty}
          />
        ))}
      </View>

      {/* Testimonial Text */}
      <Text style={[styles.text, { color: theme.text }]}>"{text}"</Text>

      {/* Author Info */}
      <View style={styles.authorContainer}>
        <Text style={[styles.author, { color: theme.textSecondary }]}>{author}</Text>
        {company && (
          <Text style={[styles.company, { color: theme.textMuted }]}>{company}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 3,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  authorContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    paddingTop: 10,
  },
  author: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  company: {
    fontSize: 12,
  },
});