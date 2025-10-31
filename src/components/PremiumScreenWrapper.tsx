// src/components/PremiumScreenWrapper.tsx - Consistent Premium Layout Wrapper
import React from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PremiumScreenWrapperProps {
  children: React.ReactNode;
  showNavBar?: boolean;
  scrollable?: boolean;
}

export default function PremiumScreenWrapper({
  children,
  showNavBar = false,
  scrollable = true,
}: PremiumScreenWrapperProps) {
  const Content = (
    <View style={styles.content}>
      {children}
      {showNavBar && <View style={styles.navBarSpacer} />}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F1419', '#1A1F2E', '#0D0E13']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Animated background elements */}
        <View style={styles.backgroundPattern}>
          <View
            style={[
              styles.floatingOrb,
              {
                width: 300,
                height: 300,
                top: -150,
                left: -100,
                backgroundColor: '#FF6B35',
              },
            ]}
          />
          <View
            style={[
              styles.floatingOrb,
              {
                width: 250,
                height: 250,
                bottom: -100,
                right: -80,
                backgroundColor: '#004E89',
              },
            ]}
          />
        </View>

        {scrollable ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
          >
            {Content}
          </ScrollView>
        ) : (
          Content
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
  },
  gradient: {
    flex: 1,
  },
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: 0,
  },
  floatingOrb: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.1,
  },
  content: {
    flex: 1,
    zIndex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  navBarSpacer: {
    height: 80,
  },
});