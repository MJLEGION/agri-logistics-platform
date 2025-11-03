// src/hooks/useScreenAnimations.ts
// Reusable animation hook for adding pizzazz to any screen!
import { useRef, useEffect } from 'react';
import { Animated, PanResponder } from 'react-native';

export const useScreenAnimations = (numCards: number = 3) => {
  // Floating animations for cards/stats
  const floatAnims = Array.from({ length: numCards }, () => useRef(new Animated.Value(0)).current);

  // 3D Tilt animations
  const tiltXAnims = Array.from({ length: numCards }, () => useRef(new Animated.Value(0)).current);
  const tiltYAnims = Array.from({ length: numCards }, () => useRef(new Animated.Value(0)).current);

  // Scale animations for press effects
  const scaleAnims = Array.from({ length: numCards }, () => useRef(new Animated.Value(1)).current);

  // Entrance animations
  const entranceAnims = Array.from({ length: numCards }, () => useRef(new Animated.Value(0)).current);

  // Pulse animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start all floating animations
    const floatAnimations = floatAnims.map((anim, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000 + (index * 200),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 2000 + (index * 200),
            useNativeDriver: true,
          }),
        ])
      )
    );

    // Pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Entrance animations (staggered)
    const entrance = Animated.stagger(
      100,
      entranceAnims.map(anim =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        })
      )
    );

    Animated.parallel([...floatAnimations, pulse, entrance]).start();
  }, []);

  // 3D Tilt handler
  const createTiltHandler = (index: number) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const centerX = 75;
        const centerY = 75;

        const tiltAngleX = ((locationY - centerY) / centerY) * -10;
        const tiltAngleY = ((locationX - centerX) / centerX) * 10;

        Animated.spring(tiltXAnims[index], {
          toValue: tiltAngleX,
          friction: 7,
          useNativeDriver: true,
        }).start();

        Animated.spring(tiltYAnims[index], {
          toValue: tiltAngleY,
          friction: 7,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderRelease: () => {
        Animated.spring(tiltXAnims[index], {
          toValue: 0,
          friction: 5,
          useNativeDriver: true,
        }).start();

        Animated.spring(tiltYAnims[index], {
          toValue: 0,
          friction: 5,
          useNativeDriver: true,
        }).start();
      },
    });
  };

  // Press handlers
  const handlePressIn = (index: number) => {
    Animated.spring(scaleAnims[index], {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (index: number) => {
    Animated.spring(scaleAnims[index], {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Helper to get animated style for floating cards
  const getFloatingCardStyle = (index: number) => ({
    opacity: entranceAnims[index],
    transform: [
      {
        translateY: Animated.add(
          entranceAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          }),
          floatAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, -8],
          })
        ),
      },
    ],
  });

  // Helper to get animated style for 3D tilt cards
  const get3DTiltStyle = (index: number, withPulse: boolean = false) => ({
    transform: [
      { perspective: 1000 },
      { scale: withPulse ? Animated.multiply(scaleAnims[index], pulseAnim) : scaleAnims[index] },
      {
        rotateX: tiltXAnims[index].interpolate({
          inputRange: [-10, 10],
          outputRange: ['-10deg', '10deg'],
        }),
      },
      {
        rotateY: tiltYAnims[index].interpolate({
          inputRange: [-10, 10],
          outputRange: ['-10deg', '10deg'],
        }),
      },
    ],
  });

  return {
    floatAnims,
    tiltXAnims,
    tiltYAnims,
    scaleAnims,
    entranceAnims,
    pulseAnim,
    createTiltHandler,
    handlePressIn,
    handlePressOut,
    getFloatingCardStyle,
    get3DTiltStyle,
  };
};
