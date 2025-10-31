# 🎨 Premium UI - Quick Reference Card

## 🚀 Quick Start Template

Copy-paste this to start any new screen:

```tsx
import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import PremiumScreenWrapper from "../components/PremiumScreenWrapper";
import PremiumCard from "../components/PremiumCard";
import PremiumButton from "../components/PremiumButton";
import { PREMIUM_THEME } from "../config/premiumTheme";

export default function MyScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <PremiumScreenWrapper showNavBar={true} scrollable={true}>
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Your content here */}
      </Animated.View>
    </PremiumScreenWrapper>
  );
}
```

---

## 🎨 Color Palette Cheat Sheet

| Element        | Color Code              | Usage                    |
| -------------- | ----------------------- | ------------------------ |
| Primary        | `#FF6B35`               | Main buttons, highlights |
| Secondary      | `#004E89`               | Secondary actions        |
| Accent         | `#27AE60`               | Success, positive states |
| Warning        | `#F39C12`               | Warnings, pending        |
| Danger         | `#E74C3C`               | Errors, delete actions   |
| Text           | `#FFFFFF`               | Main text                |
| Text Secondary | `rgba(255,255,255,0.7)` | Descriptions             |
| Text Tertiary  | `rgba(255,255,255,0.5)` | Hints                    |
| Background     | `#0F1419`               | Screen background        |
| Background Alt | `#1A1F2E`               | Card backgrounds         |

---

## 🔘 Button Usage

### Primary Action

```tsx
<PremiumButton label="Submit" variant="primary" onPress={handleSubmit} />
```

### Secondary Action

```tsx
<PremiumButton label="Cancel" variant="secondary" onPress={handleCancel} />
```

### With Icon

```tsx
<PremiumButton
  label="Continue"
  icon="arrow-right"
  iconPosition="right"
  variant="primary"
  onPress={handleContinue}
/>
```

### Loading State

```tsx
<PremiumButton
  label="Submit"
  variant="primary"
  loading={isLoading}
  onPress={handleSubmit}
/>
```

### Different Sizes

```tsx
<PremiumButton label="Small" size="sm" variant="primary" onPress={() => {}} />
<PremiumButton label="Medium" size="md" variant="primary" onPress={() => {}} />
<PremiumButton label="Large" size="lg" variant="primary" onPress={() => {}} />
```

---

## 🎴 Card Usage

### Basic Card

```tsx
<PremiumCard>
  <Text>Card content</Text>
</PremiumCard>
```

### Highlighted Card

```tsx
<PremiumCard highlighted={true}>
  <Text>Important content</Text>
</PremiumCard>
```

### With Gradient

```tsx
<PremiumCard gradient={true} gradientColors={PREMIUM_THEME.gradients.primary}>
  <Text style={{ color: "#FFF" }}>Gradient card</Text>
</PremiumCard>
```

---

## 📝 Text Styles

### Heading 1 (48px)

```tsx
<Text
  style={{ ...PREMIUM_THEME.typography.h1, color: PREMIUM_THEME.colors.text }}
>
  Main Title
</Text>
```

### Heading 2 (36px)

```tsx
<Text
  style={{ ...PREMIUM_THEME.typography.h2, color: PREMIUM_THEME.colors.text }}
>
  Section Title
</Text>
```

### Body Text (16px)

```tsx
<Text
  style={{ ...PREMIUM_THEME.typography.body, color: PREMIUM_THEME.colors.text }}
>
  Body text content
</Text>
```

### Small Text (14px)

```tsx
<Text
  style={{
    ...PREMIUM_THEME.typography.bodySmall,
    color: PREMIUM_THEME.colors.textSecondary,
  }}
>
  Small description
</Text>
```

### Label (12px)

```tsx
<Text
  style={{
    ...PREMIUM_THEME.typography.label,
    color: PREMIUM_THEME.colors.textTertiary,
  }}
>
  LABEL TEXT
</Text>
```

---

## 🎬 Animation Snippets

### Fade In

```tsx
const fadeAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 800,
    useNativeDriver: true,
  }).start();
}, []);

<Animated.View style={{ opacity: fadeAnim }} />;
```

### Slide Up

```tsx
const slideAnim = useRef(new Animated.Value(50)).current;

useEffect(() => {
  Animated.timing(slideAnim, {
    toValue: 0,
    duration: 800,
    useNativeDriver: true,
  }).start();
}, []);

<Animated.View style={{ transform: [{ translateY: slideAnim }] }} />;
```

### Scale Spring

```tsx
const scaleAnim = useRef(new Animated.Value(0.9)).current;

useEffect(() => {
  Animated.spring(scaleAnim, {
    toValue: 1,
    friction: 5,
    tension: 30,
    useNativeDriver: true,
  }).start();
}, []);

<Animated.View style={{ transform: [{ scale: scaleAnim }] }} />;
```

### Fade + Slide Combined

```tsx
<Animated.View
  style={{
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  }}
/>
```

---

## 📐 Spacing Values

```tsx
PREMIUM_THEME.spacing.xs; // 4px
PREMIUM_THEME.spacing.sm; // 8px
PREMIUM_THEME.spacing.md; // 12px
PREMIUM_THEME.spacing.lg; // 16px (most common)
PREMIUM_THEME.spacing.xl; // 24px
PREMIUM_THEME.spacing.xxl; // 32px
```

### Usage

```tsx
<View
  style={{
    padding: PREMIUM_THEME.spacing.lg,
    gap: PREMIUM_THEME.spacing.md,
    marginBottom: PREMIUM_THEME.spacing.xl,
  }}
></View>
```

---

## 🎯 Border Radius Values

```tsx
PREMIUM_THEME.borderRadius.xs; // 4px (small elements)
PREMIUM_THEME.borderRadius.sm; // 8px
PREMIUM_THEME.borderRadius.md; // 12px (buttons)
PREMIUM_THEME.borderRadius.lg; // 16px (cards)
PREMIUM_THEME.borderRadius.xl; // 20px (large)
PREMIUM_THEME.borderRadius.full; // 9999px (circles)
```

---

## 🌈 Gradient Examples

### Primary Gradient

```tsx
<LinearGradient
  colors={PREMIUM_THEME.gradients.primary}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.container}
>
  {/* Content */}
</LinearGradient>
```

### All Gradients

```tsx
PREMIUM_THEME.gradients.primary; // Orange to lighter orange
PREMIUM_THEME.gradients.secondary; // Navy blue gradient
PREMIUM_THEME.gradients.accent; // Green gradient
PREMIUM_THEME.gradients.warning; // Amber gradient
PREMIUM_THEME.gradients.danger; // Red gradient
PREMIUM_THEME.gradients.glass; // Transparent glass effect
PREMIUM_THEME.gradients.dark; // Dark background gradient
```

---

## 💫 Shadow Examples

### Small Shadow

```tsx
...PREMIUM_THEME.shadows.sm
// elevation: 2, shadowOpacity: 0.1, shadowRadius: 4
```

### Medium Shadow

```tsx
...PREMIUM_THEME.shadows.md
// elevation: 4, shadowOpacity: 0.2, shadowRadius: 8
```

### Large Shadow

```tsx
...PREMIUM_THEME.shadows.lg
// elevation: 8, shadowOpacity: 0.3, shadowRadius: 16
```

### Extra Large Shadow

```tsx
...PREMIUM_THEME.shadows.xl
// elevation: 12, shadowOpacity: 0.4, shadowRadius: 30
```

---

## 📱 Responsive Design

### Check Platform

```tsx
import { Platform } from "react-native";

if (Platform.OS === "web") {
  // Web-specific code
} else if (Platform.OS === "ios") {
  // iOS-specific code
} else {
  // Android-specific code
}
```

### Conditional Styles

```tsx
const styles = StyleSheet.create({
  container: {
    padding: PREMIUM_THEME.spacing.lg,
    ...(Platform.OS === "web" && {
      maxWidth: 1200,
      marginHorizontal: "auto",
    }),
  },
});
```

---

## 🔍 Common Patterns

### Card List

```tsx
<ScrollView>
  {items.map((item) => (
    <PremiumCard key={item.id}>
      <Text>{item.title}</Text>
      <Text style={{ color: PREMIUM_THEME.colors.textSecondary }}>
        {item.description}
      </Text>
    </PremiumCard>
  ))}
</ScrollView>
```

### Status Badge

```tsx
<View
  style={{
    backgroundColor:
      status === "active" ? "rgba(39, 174, 96, 0.2)" : "rgba(231, 76, 60, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  }}
>
  <Text
    style={{
      color:
        status === "active"
          ? PREMIUM_THEME.colors.accent
          : PREMIUM_THEME.colors.danger,
      fontSize: 12,
      fontWeight: "700",
    }}
  >
    {status.toUpperCase()}
  </Text>
</View>
```

### Header with Navigation

```tsx
<View
  style={{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: PREMIUM_THEME.spacing.xl,
  }}
>
  <Text style={{ ...PREMIUM_THEME.typography.h2 }}>Title</Text>
  <Pressable onPress={() => navigation.goBack()}>
    <MaterialCommunityIcons
      name="close"
      size={24}
      color={PREMIUM_THEME.colors.text}
    />
  </Pressable>
</View>
```

### Progress Bar

```tsx
<View
  style={{
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 2,
    overflow: "hidden",
    marginVertical: PREMIUM_THEME.spacing.md,
  }}
>
  <LinearGradient
    colors={PREMIUM_THEME.gradients.primary}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={{ height: "100%", width: `${progress}%` }}
  />
</View>
```

---

## 🎯 Icon Library

Use any icon from `MaterialCommunityIcons`:

```tsx
<MaterialCommunityIcons
  name="truck-fast"
  size={24}
  color={PREMIUM_THEME.colors.primary}
/>
```

**Common icons:**

- `home` - Home screen
- `magnify` - Search
- `package-variant` - Cargo/package
- `truck-fast` - Transport/delivery
- `account-circle` - Profile
- `settings` - Settings
- `bell` - Notifications
- `star` - Ratings
- `map-marker` - Location
- `clock-outline` - Time/ETA
- `currency-usd` - Money/earnings
- `check-circle` - Confirmed
- `alert-circle` - Alert
- `plus-circle` - Add/create
- `history` - History
- `arrow-right` - Navigation
- `menu` - Menu/hamburger

---

## ✅ Pre-Update Checklist

Before updating each screen:

- [ ] Import all premium components
- [ ] Replace colors with theme values
- [ ] Replace buttons with PremiumButton
- [ ] Replace cards with PremiumCard
- [ ] Update typography with theme
- [ ] Use theme spacing
- [ ] Use theme shadows
- [ ] Remove old StyleSheet conflicts
- [ ] Test on mobile
- [ ] Test on web
- [ ] Test animations
- [ ] Remove console.logs

---

## 🚨 Common Mistakes

❌ **Wrong**: Using hardcoded colors

```tsx
color: "#FFFFFF"; // ❌ Don't do this
```

✅ **Right**: Using theme colors

```tsx
color: PREMIUM_THEME.colors.text; // ✅ Do this
```

---

❌ **Wrong**: Not wrapping with PremiumScreenWrapper

```tsx
<SafeAreaView>
  <ScrollView>{/* content */}</ScrollView>
</SafeAreaView>
```

✅ **Right**: Using PremiumScreenWrapper

```tsx
<PremiumScreenWrapper>{/* content */}</PremiumScreenWrapper>
```

---

❌ **Wrong**: Manual button styles

```tsx
<TouchableOpacity onPress={handlePress}>
  <Text>Click</Text>
</TouchableOpacity>
```

✅ **Right**: Using PremiumButton

```tsx
<PremiumButton label="Click" onPress={handlePress} />
```

---

## 📞 Need Help?

1. Check the example screens:

   - `PremiumLandingScreen.tsx`
   - `PremiumLoginScreen.tsx`
   - `PremiumShipperHomeScreen.tsx`

2. Refer to the full guide:

   - `PREMIUM_DESIGN_SYSTEM_GUIDE.md`

3. Review the implementation summary:
   - `PREMIUM_UI_IMPLEMENTATION_SUMMARY.md`

---

**Happy Coding! 🚀✨**
