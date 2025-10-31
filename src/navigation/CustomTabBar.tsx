// src/navigation/CustomTabBar.tsx - Premium Animated Navigation Bar
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface TabItem {
  name: string;
  label: string;
  icon: string;
  color: string;
}

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const TAB_ITEMS: TabItem[] = [
  { name: 'Home', label: 'Home', icon: 'home', color: '#FF6B35' },
  { name: 'Search', label: 'Search', icon: 'magnify', color: '#004E89' },
  { name: 'Orders', label: 'Orders', icon: 'package-variant', color: '#27AE60' },
  { name: 'Earnings', label: 'Earnings', icon: 'currency-usd', color: '#F39C12' },
  { name: 'Profile', label: 'Profile', icon: 'account-circle', color: '#9B59B6' },
];

export default function CustomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
  const animatedValues = React.useRef(TAB_ITEMS.map(() => new Animated.Value(0))).current;
  const scaleAnimations = React.useRef(TAB_ITEMS.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    // Animate the active tab
    TAB_ITEMS.forEach((_, index) => {
      Animated.parallel([
        Animated.spring(animatedValues[index], {
          toValue: index === state.index ? 1 : 0,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnimations[index], {
          toValue: index === state.index ? 1.1 : 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [state.index]);

  const handleTabPress = (index: number) => {
    const route = state.routes[index];
    const isFocused = index === state.index;

    if (!isFocused) {
      navigation.navigate(route.name);
    }
  };

  return (
    <View style={styles.container}>
      {/* Gradient overlay */}
      <LinearGradient
        colors={['rgba(15, 20, 25, 0.95)', 'rgba(26, 31, 46, 0.98)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      />

      {/* Glass effect border */}
      <View style={styles.topBorder} />

      {/* Tab items container */}
      <View style={styles.tabsContainer}>
        {TAB_ITEMS.map((item, index) => {
          const isActive = index === state.index;
          const animatedBackgroundOpacity = animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.15],
          });

          return (
            <Pressable
              key={item.name}
              onPress={() => handleTabPress(index)}
              style={styles.tabPressable}
            >
              <Animated.View
                style={[
                  styles.tabItem,
                  {
                    transform: [{ scale: scaleAnimations[index] }],
                  },
                ]}
              >
                {/* Background glow when active */}
                {isActive && (
                  <Animated.View
                    style={[
                      styles.activeBackground,
                      {
                        backgroundColor: item.color,
                        opacity: animatedBackgroundOpacity,
                      },
                    ]}
                  />
                )}

                {/* Icon with animation */}
                <Animated.View
                  style={[
                    styles.iconContainer,
                    {
                      transform: [
                        {
                          scale: animatedValues[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.2],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={24}
                    color={isActive ? item.color : 'rgba(255, 255, 255, 0.5)'}
                  />
                </Animated.View>

                {/* Label with animation */}
                {isActive && (
                  <Animated.View
                    style={[
                      styles.labelContainer,
                      {
                        opacity: animatedValues[index],
                      },
                    ]}
                  >
                    <Text style={[styles.label, { color: item.color }]}>
                      {item.label}
                    </Text>
                  </Animated.View>
                )}

                {/* Active indicator dot */}
                {isActive && (
                  <Animated.View
                    style={[
                      styles.indicatorDot,
                      {
                        backgroundColor: item.color,
                        opacity: animatedValues[index],
                      },
                    ]}
                  />
                )}
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: Platform.OS === 'web' ? 10 : 16,
    paddingTop: 12,
    ...(Platform.OS === 'web' && {
      paddingBottom: 20,
    }),
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    top: -1,
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 107, 53, 0.3)',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    zIndex: 10,
  },
  tabPressable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabItem: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  activeBackground: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    zIndex: -1,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    marginTop: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  indicatorDot: {
    position: 'absolute',
    bottom: -12,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});