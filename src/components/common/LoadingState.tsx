// src/components/common/LoadingState.tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, borderRadius } from '../../constants/designTokens';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius: radius = 8,
  style,
}) => {
  const { theme, isDarkMode } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  const baseColor = isDarkMode ? '#2A2A2A' : '#E5E5E5';
  const shimmerColor = isDarkMode ? '#3A3A3A' : '#F5F5F5';

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: baseColor,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={[baseColor, shimmerColor, baseColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

// Card Loading Skeleton
export const CardSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View style={styles.cardHeader}>
        <Skeleton width={48} height={48} borderRadius={24} />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Skeleton width="60%" height={16} style={{ marginBottom: spacing.sm }} />
          <Skeleton width="40%" height={12} />
        </View>
      </View>
      <View style={styles.cardContent}>
        <Skeleton width="100%" height={12} style={{ marginBottom: spacing.sm }} />
        <Skeleton width="80%" height={12} style={{ marginBottom: spacing.sm }} />
        <Skeleton width="90%" height={12} />
      </View>
    </View>
  );
};

// List Loading Skeleton
export const ListLoadingSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </View>
  );
};

// Stats Card Skeleton
export const StatsCardSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
      <Skeleton width={40} height={40} borderRadius={20} style={{ marginBottom: spacing.md }} />
      <Skeleton width="70%" height={24} style={{ marginBottom: spacing.sm }} />
      <Skeleton width="50%" height={14} />
    </View>
  );
};

// Grid Loading Skeleton
export const GridLoadingSkeleton: React.FC<{ columns?: number; count?: number }> = ({
  columns = 2,
  count = 4,
}) => {
  return (
    <View style={styles.gridContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={{ width: `${100 / columns - 2}%` }}>
          <StatsCardSkeleton />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardContent: {
    marginTop: spacing.sm,
  },
  listContainer: {
    padding: spacing.lg,
  },
  statsCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    padding: spacing.lg,
  },
});

export default { Skeleton, CardSkeleton, ListLoadingSkeleton, StatsCardSkeleton, GridLoadingSkeleton };
