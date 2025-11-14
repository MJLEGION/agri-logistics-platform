// Loading Skeleton for better UX during data fetch
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonLine({ width = '100%', height = 16, borderRadius = 8, style }: LoadingSkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

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
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <SkeletonLine width={56} height={56} borderRadius={28} />
        <View style={{ flex: 1, gap: 8 }}>
          <SkeletonLine width="60%" height={16} />
          <SkeletonLine width="40%" height={14} />
        </View>
      </View>
      <View style={{ gap: 8, marginTop: 16 }}>
        <SkeletonLine width="100%" height={14} />
        <SkeletonLine width="80%" height={14} />
      </View>
    </View>
  );
}

export function SkeletonStats() {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <SkeletonLine width={48} height={48} borderRadius={24} />
        <SkeletonLine width={60} height={32} style={{ marginTop: 12 }} />
        <SkeletonLine width="80%" height={14} style={{ marginTop: 8 }} />
      </View>
      <View style={styles.statCard}>
        <SkeletonLine width={48} height={48} borderRadius={24} />
        <SkeletonLine width={60} height={32} style={{ marginTop: 12 }} />
        <SkeletonLine width="80%" height={14} style={{ marginTop: 8 }} />
      </View>
      <View style={styles.statCard}>
        <SkeletonLine width={48} height={48} borderRadius={24} />
        <SkeletonLine width={60} height={32} style={{ marginTop: 12 }} />
        <SkeletonLine width="80%" height={14} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: -40,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
});
