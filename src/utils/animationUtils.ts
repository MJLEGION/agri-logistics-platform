import { Animated, Easing } from 'react-native';

export const fadeIn = (
  value: Animated.Value,
  duration = 300,
  delay = 0
) => {
  return Animated.sequence([
    Animated.delay(delay),
    Animated.timing(value, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }),
  ]);
};

export const fadeOut = (
  value: Animated.Value,
  duration = 300,
  delay = 0
) => {
  return Animated.sequence([
    Animated.delay(delay),
    Animated.timing(value, {
      toValue: 0,
      duration,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }),
  ]);
};

export const slideUp = (
  value: Animated.Value,
  duration = 300,
  delay = 0
) => {
  return Animated.sequence([
    Animated.delay(delay),
    Animated.timing(value, {
      toValue: 0,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
  ]);
};

export const slideDown = (
  value: Animated.Value,
  fromValue: number,
  duration = 300,
  delay = 0
) => {
  return Animated.sequence([
    Animated.delay(delay),
    Animated.timing(value, {
      toValue: fromValue,
      duration,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }),
  ]);
};

export const scaleIn = (
  value: Animated.Value,
  duration = 300,
  delay = 0
) => {
  return Animated.sequence([
    Animated.delay(delay),
    Animated.timing(value, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.back(1)),
      useNativeDriver: true,
    }),
  ]);
};

export const scaleOut = (
  value: Animated.Value,
  duration = 300,
  delay = 0
) => {
  return Animated.sequence([
    Animated.delay(delay),
    Animated.timing(value, {
      toValue: 0,
      duration,
      easing: Easing.in(Easing.back(1)),
      useNativeDriver: true,
    }),
  ]);
};

export const bounce = (value: Animated.Value, duration = 500) => {
  return Animated.sequence([
    Animated.timing(value, {
      toValue: 1.1,
      duration: duration * 0.5,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 1,
      duration: duration * 0.5,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }),
  ]);
};

export const shake = (value: Animated.Value, duration = 500) => {
  return Animated.sequence([
    Animated.timing(value, {
      toValue: 10,
      duration: duration * 0.1,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: -10,
      duration: duration * 0.1,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 10,
      duration: duration * 0.1,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: -10,
      duration: duration * 0.1,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 0,
      duration: duration * 0.1,
      useNativeDriver: true,
    }),
  ]);
};

export const pulse = (value: Animated.Value, duration = 1000) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: 1.1,
        duration: duration * 0.5,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 1,
        duration: duration * 0.5,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  );
};

export const rotate = (value: Animated.Value, duration = 1000) => {
  return Animated.loop(
    Animated.timing(value, {
      toValue: 1,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  );
};

export const staggerAnimation = (
  animations: Animated.CompositeAnimation[],
  stagger = 100
) => {
  return Animated.stagger(stagger, animations);
};
