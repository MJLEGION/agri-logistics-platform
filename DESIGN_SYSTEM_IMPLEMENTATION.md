# 🎨 Modern Design System - Implementation Guide

## Overview

This guide shows how to apply the Modern Design System (`ModernDesignSystem.ts`) across all screens for a cohesive, professional app experience.

---

## 1. Color System Usage

### ✅ DO: Use ModernColors

```typescript
import { ModernColors, ModernGradients, Typography, Spacing, BorderRadius } from '../config/ModernDesignSystem';

// Colors
backgroundColor: ModernColors.background,           // #0F1419
textColor: ModernColors.textPrimary,                // #FFFFFF
accentColor: ModernColors.primary,                  // #0EA5E9
statusColor: ModernColors.success,                  // #10B981
```

### ❌ DON'T: Hardcode colors

```typescript
backgroundColor: '#F5F5F5',   // ❌ Not from design system
```

---

## 2. Gradients for Headers & CTAs

### Header Gradient

```typescript
<LinearGradient
  colors={ModernGradients.primary} // ['#0EA5E9', '#0284C7']
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.header}
>
  {/* Content */}
</LinearGradient>
```

### Button Gradients

```typescript
<LinearGradient colors={ModernGradients.buttonPrimary} {...props} />
```

---

## 3. Typography System

### Text Hierarchy

```typescript
// Headings
<Text style={Typography.h1}>Large Title</Text>           // 32px, 700
<Text style={Typography.h2}>Section Title</Text>        // 28px, 700
<Text style={Typography.h3}>Subsection</Text>           // 24px, 600
<Text style={Typography.h4}>Card Title</Text>           // 20px, 600
<Text style={Typography.h5}>Small Title</Text>          // 18px, 600
<Text style={Typography.h6}>Mini Title</Text>           // 16px, 600

// Body
<Text style={Typography.bodyLarge}>Lead paragraph</Text> // 18px, 400
<Text style={Typography.body}>Normal text</Text>         // 16px, 400
<Text style={Typography.bodySmall}>Secondary text</Text> // 14px, 400
<Text style={Typography.bodyTiny}>Caption text</Text>    // 12px, 400

// Labels
<Text style={Typography.labelLarge}>Button text</Text>   // 16px, 600
<Text style={Typography.label}>Form label</Text>         // 14px, 600
<Text style={Typography.labelSmall}>Badge text</Text>    // 12px, 600
```

---

## 4. Spacing System

```typescript
import { Spacing } from '../config/ModernDesignSystem';

padding: Spacing.sm,           // 8px
paddingHorizontal: Spacing.lg, // 16px
marginBottom: Spacing.xl,      // 24px
gap: Spacing.md,               // 12px

// Common pattern
padding: Spacing.lg,           // 16px - comfortable padding
gap: Spacing.md,               // 12px - comfortable gaps
marginBottom: Spacing.xl,      // 24px - section separation
```

---

## 5. Border Radius System

```typescript
import { BorderRadius } from '../config/ModernDesignSystem';

borderRadius: BorderRadius.sm,   // 6px - subtle
borderRadius: BorderRadius.md,   // 8px - standard
borderRadius: BorderRadius.lg,   // 12px - cards
borderRadius: BorderRadius.xl,   // 16px - modals
borderRadius: BorderRadius.full, // 999px - pills/avatars
```

---

## 6. Shadow System

```typescript
import { Shadows } from '../config/ModernDesignSystem';

...Shadows.sm,  // Subtle elevation
...Shadows.md,  // Standard elevation (most common)
...Shadows.lg,  // High elevation
...Shadows.xl,  // Maximum elevation

// Example
style={[
  {
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  Shadows.md,  // Adds all shadow properties
]}
```

---

## 7. Component Templates

### Modern Button

```typescript
import ModernButton from "../components/ModernButton";

<ModernButton
  title="Get Started"
  onPress={handlePress}
  variant="primary" // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size="lg" // 'sm' | 'md' | 'lg'
  icon="plus"
  iconPosition="left"
  fullWidth
/>;
```

### Modern Card

```typescript
<View
  style={[
    styles.card,
    {
      backgroundColor: ModernColors.backgroundSecondary,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.xl,
      borderRadius: BorderRadius.lg,
    },
    Shadows.md,
  ]}
>
  <Text style={Typography.h4}>Card Title</Text>
  <Text style={[Typography.body, { color: ModernColors.textSecondary }]}>
    Card description
  </Text>
</View>
```

### Modern Header

```typescript
<LinearGradient
  colors={ModernGradients.primary}
  style={[
    {
      paddingVertical: Spacing.xl,
      paddingHorizontal: Spacing.lg,
      borderBottomLeftRadius: BorderRadius.xl,
      borderBottomRightRadius: BorderRadius.xl,
    },
  ]}
>
  <Text style={[Typography.h1, { color: ModernColors.textPrimary }]}>
    Header Title
  </Text>
</LinearGradient>
```

---

## 8. Status Colors Usage

```typescript
// For status badges
online: ModernColors.online,           // #2ECC71 - Green
offline: ModernColors.offline,         // #E74C3C - Red
pending: ModernColors.pending,         // #F39C12 - Orange
completed: ModernColors.completed,     // #27AE60 - Dark green

<View style={{
  backgroundColor: status === 'completed' ? ModernColors.completed : ModernColors.pending
}}>
  {/* Status indicator */}
</View>
```

---

## 9. Screen Update Checklist

For each screen:

- [ ] Replace hardcoded colors with `ModernColors`
- [ ] Update gradients with `ModernGradients`
- [ ] Apply `Typography` for text
- [ ] Use `Spacing` for all margins/paddings
- [ ] Use `BorderRadius` for all rounded corners
- [ ] Apply `Shadows` where needed
- [ ] Use `ModernButton` for all CTAs
- [ ] Remove old theme dependencies where possible

---

## 10. Import Template for Each Screen

```typescript
import {
  ModernColors,
  ModernGradients,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "../config/ModernDesignSystem";
import ModernButton from "../components/ModernButton";

// Use consistently throughout
```

---

## Screens to Update (Priority Order)

### 🔴 High Priority (UX Critical)

1. **LoginScreen** - Auth entry point
2. **RegisterScreen** - New user onboarding
3. **RoleSelectionScreen** - User flow decision
4. **ShipperHomeScreen** - Main dashboard
5. **TransporterHomeScreen** - Main dashboard

### 🟡 Medium Priority

6. CargoDetailsScreen
7. MyCargoScreen
8. AvailableLoadsScreen
9. ActiveTripsScreen
10. VehicleProfileScreen

### 🟢 Low Priority (Nice to Have)

11. TripHistoryScreen
12. EarningsDashboardScreen
13. RatingScreen
14. TransporterProfileScreen

---

## Example: Before & After

### Before (Old Style)

```typescript
<View style={{ backgroundColor: "#F5F5F5", padding: 16, borderRadius: 8 }}>
  <Text style={{ fontSize: 16, fontWeight: "600", color: "#333333" }}>
    Title
  </Text>
  <TouchableOpacity style={{ backgroundColor: "#27AE60", padding: 12 }}>
    <Text style={{ color: "#FFFFFF" }}>Button</Text>
  </TouchableOpacity>
</View>
```

### After (Modern Design System)

```typescript
<View
  style={[
    {
      backgroundColor: ModernColors.backgroundSecondary,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.xl,
      borderRadius: BorderRadius.lg,
    },
    Shadows.md,
  ]}
>
  <Text style={Typography.h4}>Title</Text>
  <ModernButton title="Button" onPress={handlePress} size="md" fullWidth />
</View>
```

---

## Testing the Design System

After applying changes, verify:

- [ ] Colors are consistent across all screens
- [ ] Typography hierarchy is clear
- [ ] Spacing feels balanced
- [ ] Shadows add proper depth
- [ ] Buttons are responsive & interactive
- [ ] Dark mode looks good
- [ ] Android & iOS render consistently

---

## Next Steps

1. Update auth screens first (LoginScreen, RegisterScreen)
2. Update dashboard screens (ShipperHome, TransporterHome)
3. Update detail screens (CargoDetails, VehicleProfile)
4. Test on multiple devices
5. Gather feedback & iterate
