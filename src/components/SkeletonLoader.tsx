// Skeleton loading components for better UX
import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const SkeletonLoader: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const { theme } = useTheme();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Card skeleton for crop cards
export const CropCardSkeleton: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.cardSkeleton, { backgroundColor: theme.card }]}>
      <SkeletonLoader width={60} height={60} borderRadius={30} />
      <View style={styles.cardContent}>
        <SkeletonLoader width="80%" height={16} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="60%" height={14} style={{ marginBottom: 4 }} />
        <SkeletonLoader width="40%" height={14} />
      </View>
    </View>
  );
};

// List item skeleton
export const ListItemSkeleton: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.listItemSkeleton, { backgroundColor: theme.card }]}>
      <SkeletonLoader width={40} height={40} borderRadius={20} />
      <View style={styles.listItemContent}>
        <SkeletonLoader width="70%" height={16} style={{ marginBottom: 6 }} />
        <SkeletonLoader width="50%" height={14} />
      </View>
      <SkeletonLoader width={20} height={20} borderRadius={10} />
    </View>
  );
};

// Stats card skeleton
export const StatCardSkeleton: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.statCardSkeleton, { backgroundColor: theme.card }]}>
      <SkeletonLoader width={24} height={24} borderRadius={12} style={{ marginBottom: 8 }} />
      <SkeletonLoader width="60%" height={24} style={{ marginBottom: 4 }} />
      <SkeletonLoader width="80%" height={12} />
    </View>
  );
};

// Button skeleton
export const ButtonSkeleton: React.FC<{ width?: number | string }> = ({ width = 120 }) => {
  return <SkeletonLoader width={width} height={48} borderRadius={8} />;
};

// Text skeleton
export const TextSkeleton: React.FC<{ lines?: number }> = ({ lines = 1 }) => {
  return (
    <View>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLoader
          key={index}
          width={index === lines - 1 ? '60%' : '100%'}
          height={16}
          style={{ marginBottom: index < lines - 1 ? 8 : 0 }}
        />
      ))}
    </View>
  );
};

// Map skeleton
export const MapSkeleton: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.mapSkeleton, { backgroundColor: theme.border }]}>
      <SkeletonLoader width="100%" height="100%" borderRadius={12} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E0E0E0',
  },
  cardSkeleton: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  listItemSkeleton: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  statCardSkeleton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  mapSkeleton: {
    height: 200,
    borderRadius: 12,
    marginVertical: 16,
  },
});

export default SkeletonLoader;
