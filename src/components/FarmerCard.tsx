// src/components/FarmerCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface FarmerCardProps {
  id: string;
  name: string;
  location: string;
  cropTypes: string[];
  rating: number;
  reviews: number;
  imageUrl?: string;
  onPress?: () => void;
}

export default function FarmerCard({
  id,
  name,
  location,
  cropTypes,
  rating,
  reviews,
  imageUrl,
  onPress,
}: FarmerCardProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Farmer Image/Avatar */}
      <View
        style={[
          styles.imageContainer,
          { backgroundColor: theme.gradientOverlay },
        ]}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
          />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              { backgroundColor: theme.primary },
            ]}
          >
            <Ionicons name="person" size={32} color="#FFF" />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Header with name and rating */}
        <View style={styles.header}>
          <Text
            style={[styles.farmerName, { color: theme.text }]}
            numberOfLines={1}
          >
            {name}
          </Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color={theme.accent} />
            <Text style={[styles.rating, { color: theme.text }]}>
              {rating.toFixed(1)}
            </Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location" size={13} color={theme.textSecondary} />
          <Text
            style={[styles.location, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {location}
          </Text>
        </View>

        {/* Crops */}
        <View style={styles.cropsContainer}>
          {cropTypes.slice(0, 3).map((crop, index) => (
            <View
              key={index}
              style={[
                styles.cropTag,
                { backgroundColor: theme.backgroundAlt },
              ]}
            >
              <Text
                style={[styles.cropTag, { color: theme.primary, fontSize: 11 }]}
              >
                {crop}
              </Text>
            </View>
          ))}
        </View>

        {/* Review Count */}
        <Text style={[styles.reviews, { color: theme.textSecondary }]}>
          ({reviews} reviews)
        </Text>
      </View>

      {/* Arrow */}
      <Ionicons name="chevron-forward" size={20} color={theme.textLight} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  farmerName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  location: {
    fontSize: 12,
    marginLeft: 4,
    flex: 1,
  },
  cropsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  cropTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 2,
    fontSize: 10,
  },
  reviews: {
    fontSize: 11,
  },
});