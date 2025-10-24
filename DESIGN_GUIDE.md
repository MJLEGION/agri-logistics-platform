# Agri-Logistics Platform Design Guide 🎨

## Quick Reference for Maintaining Consistent Design

---

## 🎨 Color System

### Role-Based Gradients
```typescript
// Transporter
colors={['#F77F00', '#FCBF49']}

// Farmer
colors={['#27AE60', '#2ECC71']}

// Buyer
colors={['#3B82F6', '#2563EB']}

// Splash Screen
colors={['#F77F00', '#FCBF49', '#27AE60']}
```

### Functional Colors
```typescript
// Success / Completed
'#10B981'

// Warning / Pending
'#F59E0B'

// Error / Danger
'#EF4444'

// Info / Active
'#3B82F6'

// Primary Green
'#27AE60'
```

### Icon Box Backgrounds (20% Opacity)
```typescript
backgroundColor: '#27AE60' + '20'  // Green
backgroundColor: '#3B82F6' + '20'  // Blue
backgroundColor: '#F59E0B' + '20'  // Orange
backgroundColor: '#10B981' + '20'  // Success Green
```

---

## 📐 Layout Standards

### Header Structure
```typescript
<LinearGradient
  colors={['#COLOR1', '#COLOR2']}
  style={styles.header}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
>
  <View style={styles.headerTop}>
    <View style={styles.headerLeft}>
      <View style={styles.avatarCircle}>
        <Ionicons name="ICON" size={32} color="#FFF" />
      </View>
      <View style={styles.headerText}>
        <Text style={styles.greeting}>Welcome back!</Text>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.role}>EMOJI Role</Text>
      </View>
    </View>
    <ThemeToggle />
  </View>
</LinearGradient>
```

### Floating Stat Cards
```typescript
<View style={styles.statsContainer}>
  <View style={[styles.statCard, { backgroundColor: theme.card }]}>
    <View style={[styles.statIconBox, { backgroundColor: '#COLOR' + '20' }]}>
      <Ionicons name="ICON" size={24} color="#COLOR" />
    </View>
    <Text style={[styles.statNumber, { color: theme.text }]}>
      {count}
    </Text>
    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
      Label
    </Text>
  </View>
</View>
```

### Action Buttons
```typescript
<TouchableOpacity
  style={[styles.actionCard, { backgroundColor: theme.card }]}
  onPress={() => navigation.navigate('Screen')}
>
  <LinearGradient
    colors={['#COLOR1', '#COLOR2']}
    style={styles.actionGradient}
  >
    <Ionicons name="ICON" size={32} color="#FFF" />
  </LinearGradient>
  <Text style={[styles.actionTitle, { color: theme.text }]}>
    Title
  </Text>
  <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
    Description
  </Text>
</TouchableOpacity>
```

### Activity Cards
```typescript
<TouchableOpacity
  style={[styles.activityCardNew, { backgroundColor: theme.card }]}
  onPress={() => navigation.navigate('Screen')}
>
  <View style={styles.activityLeft}>
    <View style={[styles.activityIconNew, { backgroundColor: '#COLOR' + '20' }]}>
      <Ionicons name="ICON" size={20} color="#COLOR" />
    </View>
    <View style={styles.activityInfo}>
      <Text style={[styles.activityTitleNew, { color: theme.text }]}>
        Title
      </Text>
      <Text style={[styles.activityDescNew, { color: theme.textSecondary }]}>
        Description
      </Text>
    </View>
  </View>
  <View style={[styles.statusBadge, { backgroundColor: '#COLOR' }]}>
    <Text style={styles.statusText}>STATUS</Text>
  </View>
</TouchableOpacity>
```

---

## 📏 Standard Styles

### Header Styles
```typescript
header: {
  padding: 20,
  paddingTop: 50,
  paddingBottom: 30,
  borderBottomLeftRadius: 32,
  borderBottomRightRadius: 32,
},
headerTop: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
},
headerLeft: {
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
},
avatarCircle: {
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 16,
},
headerText: {
  flex: 1,
},
greeting: {
  fontSize: 14,
  color: '#FFF',
  opacity: 0.9,
  fontWeight: '600',
},
userName: {
  fontSize: 24,
  fontWeight: '800',
  color: '#FFF',
  marginTop: 4,
},
role: {
  fontSize: 14,
  color: '#FFF',
  marginTop: 4,
  opacity: 0.9,
},
```

### Stat Card Styles
```typescript
statsContainer: {
  flexDirection: 'row',
  padding: 16,
  gap: 12,
  marginTop: -20,  // Creates floating effect
},
statCard: {
  flex: 1,
  padding: 16,
  borderRadius: 16,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 3,
},
statIconBox: {
  width: 48,
  height: 48,
  borderRadius: 24,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 8,
},
statNumber: {
  fontSize: 24,
  fontWeight: '800',
  marginBottom: 4,
},
statLabel: {
  fontSize: 11,
  textAlign: 'center',
  fontWeight: '600',
},
```

### Action Button Styles
```typescript
content: {
  padding: 16,
  maxWidth: 600,
  marginHorizontal: 'auto',
  width: '100%',
  alignItems: 'stretch',
},
sectionTitle: {
  fontSize: 20,
  fontWeight: '800',
  marginBottom: 16,
  marginTop: 8,
},
actionsGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 12,
  marginBottom: 24,
},
actionCard: {
  width: '48%',
  padding: 16,
  borderRadius: 16,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 3,
},
actionGradient: {
  width: 64,
  height: 64,
  borderRadius: 32,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 12,
},
actionTitle: {
  fontSize: 14,
  fontWeight: '700',
  marginBottom: 4,
  textAlign: 'center',
},
actionDesc: {
  fontSize: 12,
  textAlign: 'center',
},
```

### Activity Card Styles
```typescript
recentSection: {
  marginBottom: 24,
  paddingHorizontal: 16,
},
activityCardNew: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 16,
  borderRadius: 12,
  marginBottom: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
},
activityLeft: {
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
},
activityIconNew: {
  width: 40,
  height: 40,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
},
activityInfo: {
  flex: 1,
},
activityTitleNew: {
  fontSize: 16,
  fontWeight: '700',
  marginBottom: 4,
},
activityDescNew: {
  fontSize: 12,
},
statusBadge: {
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 12,
},
statusText: {
  color: '#FFF',
  fontSize: 10,
  fontWeight: '700',
},
```

### Logout Button
```typescript
logoutButton: {
  marginTop: 10,
  padding: 16,
  borderRadius: 12,
  alignItems: 'center',
  flexDirection: 'row',
  justifyContent: 'center',
  gap: 8,
  backgroundColor: '#EF4444',  // or theme.error
},
logoutText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '700',
},
```

---

## 🎭 Role Icons & Emojis

```typescript
const ROLE_CONFIG = {
  transporter: {
    icon: 'car-sport',
    emoji: '🚛',
    color: '#F77F00',
  },
  farmer: {
    icon: 'leaf',
    emoji: '🌾',
    color: '#27AE60',
  },
  buyer: {
    icon: 'cart',
    emoji: '🛒',
    color: '#3B82F6',
  },
};
```

---

## 🔧 Common Icons

```typescript
// Navigation & Actions
'search'              // Browse/Search
'add-circle'          // Add/Create
'list'               // Listings
'receipt'            // Orders
'car-sport'          // Transport/Delivery
'wallet'             // Earnings/Payment
'car'                // Vehicle
'map'                // Route/Location
'time'               // History/Time
'cube'               // Package/Order
'leaf'               // Crop/Product
'cart'               // Shopping
'location'           // GPS/Location
'arrow-forward'      // Next/Go
'chevron-forward'    // Detail/More
'log-out-outline'    // Logout

// Status Icons
'checkmark-circle'   // Success/Complete
'close-circle'       // Error/Failed
'time'               // Pending/Waiting
'car'                // In Transit
'alert-circle'       // Warning

// Stats Icons
'trending-up'        // Growth
'trending-down'      // Decline
'stats-chart'        // Analytics
'cash'               // Money
```

---

## 📱 Responsive Breakpoints

```typescript
// Small Phone
width < 375px  → Use 45% width for action cards

// Standard Phone
375px ≤ width < 414px → Use 48% width for action cards

// Large Phone
414px ≤ width < 768px → Use 48% width for action cards

// Tablet
width ≥ 768px → Use maxWidth: 600px for content centering

// Content Width
maxWidth: 600,
marginHorizontal: 'auto',
width: '100%',
```

---

## 🌓 Dark Mode Tokens

```typescript
// Use theme object for these
backgroundColor: theme.background   // Screen background
backgroundColor: theme.card        // Card background
color: theme.text                  // Primary text
color: theme.textSecondary        // Secondary text
color: theme.textLight            // Tertiary text
backgroundColor: theme.error      // Error/Logout button

// Keep these fixed (don't use theme)
- Gradient colors (always visible)
- White text on gradients
- Status badge colors
- Icon box backgrounds
```

---

## ✨ Animation Standards

### Splash Screen
```typescript
fadeAnim: 0 → 1 (800ms)
scaleAnim: 0.3 → 1.0 (spring: friction 4, tension 40)
slideAnim: 50 → 0 (600ms)
rotateAnim: 0° → 360° (loop, 2000ms)
```

### Touch Feedback
```typescript
activeOpacity={0.8}   // Standard touch opacity
activeOpacity={0.7}   // More pronounced feedback
```

---

## 📦 Component Checklist

When creating a new screen, include:

- [ ] Gradient header with role-specific colors
- [ ] Large avatar circle (64px) with role icon
- [ ] "Welcome back!" greeting
- [ ] User name display (24px, weight 800)
- [ ] Role badge with emoji
- [ ] ThemeToggle in header
- [ ] Floating stat cards (marginTop: -20)
- [ ] Icon boxes with 20% opacity backgrounds
- [ ] Section titles (20px, weight 800)
- [ ] Gradient action buttons (64px circles)
- [ ] Activity cards with status badges
- [ ] RefreshControl for pull-to-refresh
- [ ] ScrollView wrapper
- [ ] Logout button at bottom
- [ ] Consistent padding (16-20px)
- [ ] maxWidth: 600 for content
- [ ] Proper TypeScript types
- [ ] Theme support

---

## 🎨 Quick Copy-Paste Templates

### New Screen Template
```typescript
// src/screens/ROLE/NewScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store';

export default function NewScreen({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Load data
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={['#COLOR1', '#COLOR2']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarCircle}>
                <Ionicons name="ICON" size={32} color="#FFF" />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.greeting}>Welcome back!</Text>
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.role}>EMOJI Role</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {/* Add stat cards */}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Add content */}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Copy styles from FarmerHomeScreen or BuyerHomeScreen
});
```

---

## 🎯 Best Practices

1. **Always use theme colors** for backgrounds and text
2. **Keep gradients role-specific** and vibrant
3. **Use icon boxes** with 20% opacity for consistency
4. **Maintain spacing standards** (16-20px padding)
5. **Add shadows** to elevated elements
6. **Include RefreshControl** on all list screens
7. **Use maxWidth: 600** for tablet support
8. **Test both light and dark modes**
9. **Ensure 48px minimum touch targets**
10. **Follow the component checklist** for new screens

---

## 🚀 Quick Test Checklist

- [ ] Screen loads without errors
- [ ] Header gradient displays correctly
- [ ] Stats cards float above content (-20 margin)
- [ ] Action buttons have gradient circles
- [ ] Touch targets are ≥ 48px
- [ ] Text is readable in both light/dark mode
- [ ] Pull-to-refresh works
- [ ] Navigation works correctly
- [ ] Icons are appropriate size
- [ ] Spacing is consistent
- [ ] Shadows render properly
- [ ] Responsive on different screen sizes

---

**Last Updated:** October 24, 2025
**Version:** 2.0
**Status:** Complete Design System

**Use this guide when creating or modifying screens to maintain consistency! 🎨**
