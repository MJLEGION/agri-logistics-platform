# 🚀 Design System Quick Reference - Copy & Paste Ready

## Fast Start - Essential Imports

```typescript
import {
  ModernColors, // All color tokens
  ModernGradients, // Pre-made gradients
  Typography, // Text styles
  Spacing, // Margin/padding values
  BorderRadius, // Corner radius values
  Shadows, // Elevation/shadow styles
} from "../config/ModernDesignSystem";

import ModernButton from "../components/ModernButton";
import ModernDashboardHeader from "../components/ModernDashboardHeader";
import ModernStatsGrid from "../components/ModernStatsGrid";
import ModernListItem from "../components/ModernListItem";
```

---

## Color Quick Reference

### Primary Colors

```typescript
ModernColors.primary; // #0EA5E9 (main brand blue)
ModernColors.primaryDark; // #0284C7 (darker blue)
ModernColors.primaryLight; // #38BDF8 (lighter blue)
```

### Secondary Colors

```typescript
ModernColors.secondary; // #1B4332 (forest green)
ModernColors.secondaryLight; // #2D6A4F
```

### Status Colors

```typescript
ModernColors.success; // #10B981 (green)
ModernColors.warning; // #F59E0B (orange)
ModernColors.danger; // #EF4444 (red)
ModernColors.online; // #2ECC71 (bright green)
ModernColors.offline; // #E74C3C (bright red)
```

### Background Colors

```typescript
ModernColors.background; // #0F1419 (dark base)
ModernColors.backgroundSecondary; // #1A1F2E (slightly lighter)
ModernColors.backgroundTertiary; // #26293B (even lighter)
```

### Text Colors

```typescript
ModernColors.textPrimary; // #FFFFFF (white)
ModernColors.textSecondary; // rgba(255, 255, 255, 0.7)
ModernColors.textTertiary; // rgba(255, 255, 255, 0.5)
ModernColors.textDisabled; // rgba(255, 255, 255, 0.3)
```

---

## Spacing Quick Reference

```typescript
Spacing.xs; // 4px   - minimal gaps
Spacing.sm; // 8px   - compact spacing
Spacing.md; // 12px  - standard gap (most common)
Spacing.lg; // 16px  - comfortable padding
Spacing.xl; // 24px  - generous spacing
Spacing.xxl; // 32px  - section spacing
Spacing.xxxl; // 48px  - large sections
```

### Common Spacing Patterns

```typescript
// Card padding
paddingHorizontal: Spacing.lg,    // 16px sides
paddingVertical: Spacing.lg,      // 16px top/bottom

// Section spacing
marginBottom: Spacing.xl,         // 24px between sections

// Item gaps
gap: Spacing.md,                  // 12px between list items
```

---

## Border Radius Quick Reference

```typescript
BorderRadius.none; // 0px
BorderRadius.xs; // 4px
BorderRadius.sm; // 6px
BorderRadius.md; // 8px   - standard buttons/inputs
BorderRadius.lg; // 12px  - cards (most common)
BorderRadius.xl; // 16px  - modals/large corners
BorderRadius.full; // 999px - pills/avatars
```

### Common Usage

```typescript
borderRadius: BorderRadius.md; // Buttons, inputs
borderRadius: BorderRadius.lg; // Cards, sections
borderRadius: BorderRadius.xl; // Modals, headers
```

---

## Typography Quick Reference

### Headings

```typescript
<Text style={Typography.h1}>Large Title</Text>      // 32px, 700
<Text style={Typography.h2}>Section Title</Text>    // 28px, 700
<Text style={Typography.h3}>Subsection</Text>       // 24px, 600
<Text style={Typography.h4}>Card Title</Text>       // 20px, 600
<Text style={Typography.h5}>Small Title</Text>      // 18px, 600
```

### Body Text

```typescript
<Text style={Typography.bodyLarge}>Lead</Text>      // 18px, 400
<Text style={Typography.body}>Normal</Text>         // 16px, 400
<Text style={Typography.bodySmall}>Small</Text>     // 14px, 400
<Text style={Typography.bodyTiny}>Tiny</Text>       // 12px, 400
```

### Labels & Captions

```typescript
<Text style={Typography.labelLarge}>Bold Label</Text>  // 16px, 600
<Text style={Typography.label}>Label</Text>            // 14px, 600
<Text style={Typography.labelSmall}>Small Label</Text> // 12px, 600
<Text style={Typography.caption}>Caption</Text>        // 11px, 500
```

---

## Shadows Quick Reference

```typescript
// Apply entire shadow object
...Shadows.sm   // Subtle (most interactive elements)
...Shadows.md   // Standard (cards, buttons) - MOST COMMON
...Shadows.lg   // High elevation (modals)
...Shadows.xl   // Maximum elevation
```

### Usage Example

```typescript
style={[
  {
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  Shadows.md,  // Adds shadowColor, shadowOffset, etc.
]}
```

---

## Gradient Quick Reference

### Primary (Blue)

```typescript
ModernGradients.primary; // ['#0EA5E9', '#0284C7']
ModernGradients.primaryDark; // ['#0284C7', '#0EA5E9']
```

### Secondary (Green)

```typescript
ModernGradients.secondary; // ['#1B4332', '#2D6A4F']
```

### Buttons

```typescript
ModernGradients.buttonPrimary; // Button gradient
ModernGradients.buttonSecondary; // Secondary button gradient
ModernGradients.buttonDisabled; // Disabled state
```

### Background

```typescript
ModernGradients.background; // Page background
ModernGradients.backgroundSoft; // Card background
```

### Usage

```typescript
<LinearGradient
  colors={ModernGradients.primary}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.container}
>
  {/* Content */}
</LinearGradient>
```

---

## Component Quick Reference

### ModernButton

```typescript
<ModernButton
  title="Click Me"
  onPress={() => {}}
  variant="primary" // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size="md" // 'sm' | 'md' | 'lg'
  icon="plus" // MaterialCommunityIcon name
  iconPosition="left" // 'left' | 'right'
  loading={false}
  disabled={false}
  fullWidth={false}
/>
```

### ModernDashboardHeader

```typescript
<ModernDashboardHeader
  title="My Dashboard"
  subtitle="Welcome back"
  userName="John Farmer"
  userRole="Shipper"
  notificationCount={3}
  onMenuPress={() => {}}
  onNotificationPress={() => {}}
/>
```

### ModernStatsGrid

```typescript
<ModernStatsGrid
  stats={[
    {
      id: "1",
      label: "Active Trips",
      value: "24",
      icon: "trending-up",
      trend: "up",
      trendPercent: 12,
      color: ModernColors.success,
      onPress: () => {},
    },
  ]}
  columns={2}
/>
```

### ModernListItem

```typescript
<ModernListItem
  title="List Item Title"
  subtitle="Secondary text"
  icon="package"
  iconColor={ModernColors.primary}
  badge="New"
  badgeColor={ModernColors.success}
  onPress={() => {}}
/>
```

---

## Screen Template - Best Practices

```typescript
import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  ModernColors,
  Spacing,
  BorderRadius,
} from "../config/ModernDesignSystem";
import ModernDashboardHeader from "../components/ModernDashboardHeader";
import ModernStatsGrid from "../components/ModernStatsGrid";

export default function MyDashboardScreen() {
  return (
    <View
      style={[styles.container, { backgroundColor: ModernColors.background }]}
    >
      {/* Header */}
      <ModernDashboardHeader
        title="Dashboard"
        subtitle="Here's your overview"
        userName="John"
        userRole="Farmer"
      />

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid */}
        <ModernStatsGrid
          stats={[
            {
              id: "1",
              label: "Total Trips",
              value: "24",
              icon: "car",
            },
          ]}
          columns={2}
        />

        {/* Your content here */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: Spacing.lg,
  },
});
```

---

## Common Patterns

### Full-Width Button

```typescript
<ModernButton title="Submit" onPress={handleSubmit} fullWidth size="lg" />
```

### Card Container

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
  {/* Card content */}
</View>
```

### Centered Text

```typescript
<Text
  style={[
    Typography.h3,
    {
      color: ModernColors.textPrimary,
      textAlign: "center",
      marginVertical: Spacing.lg,
    },
  ]}
>
  Centered Heading
</Text>
```

### Header with Divider

```typescript
<View
  style={{
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: ModernColors.border,
  }}
>
  <Text style={Typography.h3}>Section</Text>
</View>
```

---

## Do's and Don'ts

✅ **DO:**

- Use design system tokens for everything
- Combine multiple styles: `[styles.base, Typography.h3, { color: ModernColors.primary }]`
- Use `fullWidth` for buttons that need it
- Apply shadows to elevated elements
- Use spacing for consistent gaps

❌ **DON'T:**

- Hardcode colors: `backgroundColor: '#F5F5F5'`
- Hardcode sizes: `padding: 16` (use Spacing instead)
- Hardcode border radius: `borderRadius: 12`
- Mix old theme system with modern design system
- Forget to spread shadows: `...Shadows.md`

---

## Checklist for New Screens

- [ ] Imported design system tokens
- [ ] Imported modern components
- [ ] Header uses ModernDashboardHeader
- [ ] All colors use ModernColors
- [ ] All spacing uses Spacing tokens
- [ ] All text uses Typography
- [ ] All buttons use ModernButton
- [ ] All shadows use Shadows tokens
- [ ] Background is ModernColors.background
- [ ] Tested on light & dark theme

---

## File Locations

- **Design System**: `src/config/ModernDesignSystem.ts`
- **Components**: `src/components/Modern*.tsx`
- **Documentation**: `DESIGN_SYSTEM_IMPLEMENTATION.md`

---

**Questions?** See `DESIGN_SYSTEM_IMPLEMENTATION.md` for detailed examples!
