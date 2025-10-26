// src/screens/SplashScreen.tsx - FIXED VERSION FOR WEB
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F77F00', '#FCBF49', '#27AE60']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Background Pattern */}
        <View style={styles.backgroundPattern}>
          <Animated.View
            style={[
              styles.circle,
              styles.circle1,
              { transform: [{ rotate: spin }] },
            ]}
          />
          <Animated.View
            style={[
              styles.circle,
              styles.circle2,
              {
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['360deg', '0deg'],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.circle,
              styles.circle3,
              { transform: [{ rotate: spin }] },
            ]}
          />
        </View>

        {/* Main Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Logo Container */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="leaf" size={80} color="#FFF" />
            </View>
            <View style={styles.iconRow}>
              <View style={styles.smallIconCircle}>
                <Ionicons name="car-sport" size={24} color="#FFF" />
              </View>
              <View style={styles.smallIconCircle}>
                <Ionicons name="cart" size={24} color="#FFF" />
              </View>
            </View>
          </View>

          {/* App Name */}
          <Animated.View
            style={[
              styles.textContainer,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.title}>Agri-Logistics</Text>
            <Text style={styles.subtitle}>Connecting Farms to Markets</Text>
            <View style={styles.tagline}>
              <View style={styles.tagItem}>
                <Ionicons name="leaf-outline" size={16} color="#FFF" />
                <Text style={styles.tagText}>Fresh Produce</Text>
              </View>
              <View style={styles.tagDot} />
              <View style={styles.tagItem}>
                <Ionicons name="car-sport-outline" size={16} color="#FFF" />
                <Text style={styles.tagText}>Fast Delivery</Text>
              </View>
            </View>
          </Animated.View>

          {/* Loading Indicator */}
          <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
            <View style={styles.loadingBar}>
              <Animated.View
                style={[
                  styles.loadingFill,
                  {
                    transform: [
                      {
                        translateX: rotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: Platform.OS === 'web' ? [-200, 200] : [-300, 300],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>
            <Text style={styles.loadingText}>Loading...</Text>
          </Animated.View>
        </Animated.View>

        {/* Version */}
        <Animated.View style={[styles.versionContainer, { opacity: fadeAnim }]}>
          <Text style={styles.versionText}>Version 2.0 - Logistics Edition</Text>
          <Text style={styles.poweredBy}>Powered by React Native + Expo</Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
    }),
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      width: '100%',
      height: '100%',
    }),
  },
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web' && {
      overflow: 'hidden',
    }),
  },
  circle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 999,
  },
  circle1: {
    width: Platform.OS === 'web' ? 250 : 300,
    height: Platform.OS === 'web' ? 250 : 300,
    top: Platform.OS === 'web' ? -80 : -100,
    right: Platform.OS === 'web' ? -80 : -100,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: -50,
    left: -50,
  },
  circle3: {
    width: 150,
    height: 150,
    top: Platform.OS === 'web' ? '40%' : '50%',
    right: -75,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    ...(Platform.OS === 'web' && {
      maxWidth: 600,
      paddingHorizontal: 20,
    }),
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
    }),
  },
  iconRow: {
    flexDirection: 'row',
    marginTop: -20,
    gap: 80,
  },
  smallIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
    }),
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
    ...(Platform.OS === 'web' && {
      width: '100%',
    }),
  },
  title: {
    fontSize: Platform.OS === 'web' ? 38 : 42,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    ...(Platform.OS === 'web' && {
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    }),
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    opacity: 0.95,
    textAlign: 'center',
    marginBottom: 20,
  },
  tagline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
    opacity: 0.9,
  },
  tagDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFF',
    opacity: 0.7,
  },
  loadingContainer: {
    alignItems: 'center',
    width: Platform.OS === 'web' ? '80%' : '70%',
    maxWidth: 400,
  },
  loadingBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  loadingFill: {
    width: '40%',
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
    opacity: 0.9,
  },
  versionContainer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      paddingBottom: 20,
    }),
  },
  versionText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
    opacity: 0.8,
    marginBottom: 4,
  },
  poweredBy: {
    fontSize: 11,
    color: '#FFF',
    opacity: 0.7,
  },
});