import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius } from '../config/designSystem';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 12,
  borderRadius: radius = BorderRadius.md,
  style,
}) => {
  const { theme } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1, 0.5],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: theme.backgroundAlt,
          opacity,
        },
        style,
      ]}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden={true}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <View style={styles.cardSkeleton}>
      <Skeleton height={200} width="100%" borderRadius={BorderRadius.lg} />
      <View style={{ marginTop: Spacing.md }}>
        <Skeleton height={16} width="70%" />
        <Skeleton height={14} width="100%" style={{ marginTop: Spacing.sm }} />
        <Skeleton height={14} width="60%" style={{ marginTop: Spacing.sm }} />
      </View>
    </View>
  );
};

export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </View>
  );
};

// Legacy components for backward compatibility
export const CropCardSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.cropCardSkeleton, { backgroundColor: theme.card }]}>
      <Skeleton width={60} height={60} borderRadius={30} />
      <View style={styles.cardContent}>
        <Skeleton width="80%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="60%" height={14} style={{ marginBottom: 4 }} />
        <Skeleton width="40%" height={14} />
      </View>
    </View>
  );
};

export const ListItemSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.listItemSkeleton, { backgroundColor: theme.card }]}>
      <Skeleton width={40} height={40} borderRadius={20} />
      <View style={styles.listItemContent}>
        <Skeleton width="70%" height={16} style={{ marginBottom: 6 }} />
        <Skeleton width="50%" height={14} />
      </View>
      <Skeleton width={20} height={20} borderRadius={10} />
    </View>
  );
};

export const StatCardSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.statCardSkeleton, { backgroundColor: theme.card }]}>
      <Skeleton width={24} height={24} borderRadius={12} style={{ marginBottom: 8 }} />
      <Skeleton width="60%" height={24} style={{ marginBottom: 4 }} />
      <Skeleton width="80%" height={12} />
    </View>
  );
};

export const ButtonSkeleton: React.FC<{ width?: number | string }> = ({ width = 120 }) => {
  return <Skeleton width={width} height={48} borderRadius={BorderRadius.md} />;
};

export const TextSkeleton: React.FC<{ lines?: number }> = ({ lines = 1 }) => {
  return (
    <View>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? '60%' : '100%'}
          height={16}
          style={{ marginBottom: index < lines - 1 ? 8 : 0 }}
        />
      ))}
    </View>
  );
};

export const MapSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.mapSkeleton, { backgroundColor: theme.border }]}>
      <Skeleton width="100%" height="100%" borderRadius={BorderRadius.lg} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  cardSkeleton: {
    marginBottom: Spacing.md,
  },
  cropCardSkeleton: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  listItemSkeleton: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  listItemContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  statCardSkeleton: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    flex: 1,
  },
  mapSkeleton: {
    height: 200,
    borderRadius: BorderRadius.lg,
    marginVertical: Spacing.lg,
  },
});

export default Skeleton;
