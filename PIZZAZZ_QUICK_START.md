# 🎉 Pizzazz Quick Start Guide

## How to Add Pizzazz to ANY Screen in 3 Easy Steps!

### Step 1: Import the Hook and Components
```typescript
import { Animated, Pressable, PanResponder } from 'react-native';
import { useScreenAnimations } from '../../hooks/useScreenAnimations';
```

### Step 2: Use the Hook
```typescript
export default function YourScreen() {
  // Pass the number of cards/elements you want to animate (default is 3)
  const animations = useScreenAnimations(3);

  // ... rest of your code
}
```

### Step 3: Apply Animations to Your Elements

#### For Floating Stat Cards:
```jsx
<Animated.View style={[styles.statCard, animations.getFloatingCardStyle(0)]}>
  {/* Your stat card content */}
</Animated.View>
```

#### For 3D Tilt Action Cards:
```jsx
<Animated.View
  style={animations.get3DTiltStyle(0, false)}  // false = no pulse
  {...animations.createTiltHandler(0).panHandlers}
>
  <Pressable
    onPress={() => navigation.navigate('SomeScreen')}
    onPressIn={() => animations.handlePressIn(0)}
    onPressOut={() => animations.handlePressOut(0)}
  >
    {/* Your action card content */}
  </Pressable>
</Animated.View>
```

#### For Pulsing Primary Button (CTA):
```jsx
<Animated.View
  style={animations.get3DTiltStyle(0, true)}  // true = WITH pulse!
  {...animations.createTiltHandler(0).panHandlers}
>
  <Pressable
    onPress={() => navigation.navigate('ImportantAction')}
    onPressIn={() => animations.handlePressIn(0)}
    onPressOut={() => animations.handlePressOut(0)}
  >
    {/* Your primary CTA button */}
  </Pressable>
</Animated.View>
```

## Complete Example

```typescript
import React from 'react';
import { View, Text, Animated, Pressable } from 'react-native';
import { useScreenAnimations } from '../../hooks/useScreenAnimations';

export default function MyAwesomeScreen() {
  const animations = useScreenAnimations(3); // 3 animated elements

  return (
    <View>
      {/* Floating Stat Card #1 */}
      <Animated.View style={[styles.card, animations.getFloatingCardStyle(0)]}>
        <Text>Active: 12</Text>
      </Animated.View>

      {/* Floating Stat Card #2 */}
      <Animated.View style={[styles.card, animations.getFloatingCardStyle(1)]}>
        <Text>Pending: 5</Text>
      </Animated.View>

      {/* 3D Tilt Action Card with PULSE */}
      <Animated.View
        style={animations.get3DTiltStyle(2, true)}  // WITH PULSE!
        {...animations.createTiltHandler(2).panHandlers}
      >
        <Pressable
          onPress={() => console.log('Clicked!')}
          onPressIn={() => animations.handlePressIn(2)}
          onPressOut={() => animations.handlePressOut(2)}
        >
          <Text>Create New</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
```

## Advanced: Multiple Element Sets

If you have more than 3 elements to animate:

```typescript
// For 6 elements
const animations = useScreenAnimations(6);

// Use indices 0-5 for your elements
<Animated.View style={animations.getFloatingCardStyle(0)}>...</Animated.View>
<Animated.View style={animations.getFloatingCardStyle(1)}>...</Animated.View>
<Animated.View style={animations.get3DTiltStyle(2)}>...</Animated.View>
<Animated.View style={animations.get3DTiltStyle(3)}>...</Animated.View>
<Animated.View style={animations.get3DTiltStyle(4, true)}>...</Animated.View>
<Animated.View style={animations.getFloatingCardStyle(5)}>...</Animated.View>
```

## Features Included

✅ **Floating animations** - Cards gently float up and down
✅ **3D tilt effects** - Cards tilt based on touch position
✅ **Pulse animation** - Primary CTAs pulse to draw attention
✅ **Press feedback** - Elements scale down when pressed
✅ **Entrance animations** - Staggered fade-in on screen load
✅ **All animations use native driver** - 60fps performance!

## Tips

- Use `getFloatingCardStyle()` for stat cards, info cards
- Use `get3DTiltStyle()` for action buttons, interactive cards
- Set second parameter to `true` for pulse: `get3DTiltStyle(0, true)`
- Always wrap Pressable/TouchableOpacity inside Animated.View
- Match index numbers: same element = same index everywhere

Enjoy your pizzazz! 🎉✨
