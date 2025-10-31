# 🚀 Premium UI Migration Guide - Complete Implementation

## 📊 Migration Status Overview

**Total Screens:** 21
**Updated:** 0 → Will batch update
**Templates Available:** 5 core patterns

---

## 🎯 Screens Priority List

### 🔴 CRITICAL - Update First (3 screens - 2 hours)

1. **ShipperHomeScreen.tsx** - Most used screen
2. **TransporterHomeScreen.tsx** - Most used screen
3. **LoginScreen.tsx** - First user experience

### 🟠 HIGH - Update Next (4 screens - 2 hours)

4. **RoleSelectionScreen.tsx** - Core flow
5. **ListCargoScreen.tsx** - High traffic
6. **AvailableLoadsScreen.tsx** - High traffic
7. **ActiveTripsScreen.tsx** - High traffic

### 🟡 MEDIUM - Update After (6 screens - 2 hours)

8. **EnhancedTransporterDashboard.tsx**
9. **EarningsDashboardScreen.tsx**
10. **ShipperActiveOrdersScreen.tsx**
11. **OrderTrackingScreen.tsx**
12. **TripTrackingScreen.tsx**
13. **RatingScreen.tsx** (Transporter)

### 🟢 LOW - Update Last (8 screens - 2 hours)

14. **CargoDetailsScreen.tsx**
15. **EditCargoScreen.tsx**
16. **MyCargoScreen.tsx**
17. **RegisterScreen.tsx**
18. **TripHistoryScreen.tsx**
19. **RoutePlannerScreen.tsx**
20. **VehicleProfileScreen.tsx**
21. **TransporterProfileScreen.tsx**

---

## 🛠️ Migration Patterns by Screen Type

### Pattern 1: Dashboard/Home Screens

**Files:** ShipperHomeScreen, TransporterHomeScreen, EnhancedTransporterDashboard

```tsx
import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Animated } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import PremiumScreenWrapper from "../components/PremiumScreenWrapper";
import PremiumCard from "../components/PremiumCard";
import PremiumButton from "../components/PremiumButton";
import { PREMIUM_THEME } from "../../config/premiumTheme";

export default function HomeScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <PremiumScreenWrapper scrollable={true} showNavBar={true}>
      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {/* WELCOME SECTION */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtitle}>Your logistics hub awaits</Text>
        </View>

        {/* QUICK STATS */}
        <View style={styles.statsGrid}>
          <PremiumCard style={styles.statCard}>
            <MaterialCommunityIcons
              name="package"
              size={24}
              color={PREMIUM_THEME.colors.primary}
            />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Active Shipments</Text>
          </PremiumCard>
          <PremiumCard style={styles.statCard}>
            <MaterialCommunityIcons
              name="truck-fast"
              size={24}
              color={PREMIUM_THEME.colors.accent}
            />
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>In Transit</Text>
          </PremiumCard>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actionButtons}>
          <PremiumButton
            label="Create Shipment"
            variant="primary"
            size="md"
            icon="plus"
            onPress={() => navigation.navigate("CreateCargo")}
          />
          <PremiumButton
            label="View History"
            variant="secondary"
            size="md"
            icon="history"
            onPress={() => navigation.navigate("History")}
          />
        </View>
      </Animated.View>
    </PremiumScreenWrapper>
  );
}

const styles = StyleSheet.create({
  welcomeSection: {
    marginBottom: PREMIUM_THEME.spacing.lg,
  },
  welcomeTitle: {
    fontSize: PREMIUM_THEME.typography.h2.fontSize,
    fontWeight: PREMIUM_THEME.typography.h2.fontWeight as any,
    color: PREMIUM_THEME.colors.text,
    marginBottom: PREMIUM_THEME.spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: PREMIUM_THEME.typography.body.fontSize,
    color: PREMIUM_THEME.colors.textSecondary,
  },
  statsGrid: {
    flexDirection: "row",
    gap: PREMIUM_THEME.spacing.md,
    marginBottom: PREMIUM_THEME.spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: PREMIUM_THEME.spacing.md,
  },
  statValue: {
    fontSize: PREMIUM_THEME.typography.h3.fontSize,
    fontWeight: PREMIUM_THEME.typography.h3.fontWeight as any,
    color: PREMIUM_THEME.colors.text,
    marginTop: PREMIUM_THEME.spacing.sm,
  },
  statLabel: {
    fontSize: PREMIUM_THEME.typography.caption.fontSize,
    color: PREMIUM_THEME.colors.textSecondary,
    marginTop: PREMIUM_THEME.spacing.xs,
  },
  actionButtons: {
    gap: PREMIUM_THEME.spacing.md,
    marginBottom: PREMIUM_THEME.spacing.lg,
  },
});
```

---

### Pattern 2: List/Catalog Screens

**Files:** ListCargoScreen, AvailableLoadsScreen, ActiveTripsScreen

```tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import PremiumScreenWrapper from "../components/PremiumScreenWrapper";
import PremiumCard from "../components/PremiumCard";
import PremiumButton from "../components/PremiumButton";
import { PREMIUM_THEME } from "../../config/premiumTheme";

export default function ListScreen({ navigation }: any) {
  const [items, setItems] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Load data
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const renderItem = ({ item, index }: any) => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <PremiumCard
        style={styles.itemCard}
        onPress={() => navigation.navigate("Details", { id: item.id })}
      >
        <View style={styles.itemHeader}>
          <View>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemMeta}>{item.location}</Text>
          </View>
          <View style={styles.itemBadge}>
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color={PREMIUM_THEME.colors.accent}
            />
          </View>
        </View>
        <View style={styles.itemFooter}>
          <PremiumButton
            label="View Details"
            variant="outline"
            size="sm"
            onPress={() => navigation.navigate("Details", { id: item.id })}
          />
        </View>
      </PremiumCard>
    </Animated.View>
  );

  return (
    <PremiumScreenWrapper scrollable={false} showNavBar={true}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Items</Text>
        <Text style={styles.headerCount}>{items.length} items</Text>
      </View>

      {/* LIST */}
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={true}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </PremiumScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: PREMIUM_THEME.spacing.lg,
  },
  headerTitle: {
    fontSize: PREMIUM_THEME.typography.h2.fontSize,
    fontWeight: PREMIUM_THEME.typography.h2.fontWeight as any,
    color: PREMIUM_THEME.colors.text,
  },
  headerCount: {
    fontSize: PREMIUM_THEME.typography.body.fontSize,
    color: PREMIUM_THEME.colors.textSecondary,
    marginTop: PREMIUM_THEME.spacing.xs,
  },
  listContent: {
    paddingBottom: PREMIUM_THEME.spacing.xl,
  },
  itemCard: {
    marginBottom: PREMIUM_THEME.spacing.md,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: PREMIUM_THEME.spacing.md,
  },
  itemTitle: {
    fontSize: PREMIUM_THEME.typography.body.fontSize,
    fontWeight: "600",
    color: PREMIUM_THEME.colors.text,
  },
  itemMeta: {
    fontSize: PREMIUM_THEME.typography.caption.fontSize,
    color: PREMIUM_THEME.colors.textSecondary,
    marginTop: PREMIUM_THEME.spacing.xs,
  },
  itemBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${PREMIUM_THEME.colors.accent}20`,
    justifyContent: "center",
    alignItems: "center",
  },
  itemFooter: {
    flexDirection: "row",
    gap: PREMIUM_THEME.spacing.sm,
  },
});
```

---

### Pattern 3: Form/Auth Screens

**Files:** LoginScreen, RegisterScreen, RoleSelectionScreen

```tsx
import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Animated,
} from "react-native";
import PremiumScreenWrapper from "../components/PremiumScreenWrapper";
import PremiumButton from "../components/PremiumButton";
import { PREMIUM_THEME } from "../../config/premiumTheme";

export default function AuthScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <PremiumScreenWrapper scrollable={true} showNavBar={false}>
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        {/* FORM */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={PREMIUM_THEME.colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={PREMIUM_THEME.colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <PremiumButton
            label="Sign In"
            variant="primary"
            size="lg"
            onPress={() => navigation.navigate("Home")}
            style={styles.submitButton}
          />
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <PremiumButton
            label="Sign Up"
            variant="ghost"
            size="sm"
            onPress={() => navigation.navigate("Register")}
          />
        </View>
      </Animated.View>
    </PremiumScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: PREMIUM_THEME.spacing.xl,
  },
  title: {
    fontSize: PREMIUM_THEME.typography.h1.fontSize,
    fontWeight: PREMIUM_THEME.typography.h1.fontWeight as any,
    color: PREMIUM_THEME.colors.text,
  },
  subtitle: {
    fontSize: PREMIUM_THEME.typography.body.fontSize,
    color: PREMIUM_THEME.colors.textSecondary,
    marginTop: PREMIUM_THEME.spacing.sm,
  },
  form: {
    marginBottom: PREMIUM_THEME.spacing.xl,
  },
  inputGroup: {
    marginBottom: PREMIUM_THEME.spacing.lg,
  },
  label: {
    fontSize: PREMIUM_THEME.typography.body.fontSize,
    fontWeight: "600",
    color: PREMIUM_THEME.colors.text,
    marginBottom: PREMIUM_THEME.spacing.sm,
  },
  input: {
    backgroundColor: `${PREMIUM_THEME.colors.text}10`,
    borderWidth: 1,
    borderColor: `${PREMIUM_THEME.colors.text}20`,
    borderRadius: PREMIUM_THEME.borderRadius.md,
    paddingHorizontal: PREMIUM_THEME.spacing.md,
    paddingVertical: PREMIUM_THEME.spacing.md,
    fontSize: PREMIUM_THEME.typography.body.fontSize,
    color: PREMIUM_THEME.colors.text,
  },
  submitButton: {
    marginTop: PREMIUM_THEME.spacing.lg,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    fontSize: PREMIUM_THEME.typography.body.fontSize,
    color: PREMIUM_THEME.colors.textSecondary,
  },
});
```

---

### Pattern 4: Detail/Modal Screens

**Files:** CargoDetailsScreen, OrderTrackingScreen, TripTrackingScreen

```tsx
import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Animated } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import PremiumScreenWrapper from "../components/PremiumScreenWrapper";
import PremiumCard from "../components/PremiumCard";
import PremiumButton from "../components/PremiumButton";
import { PREMIUM_THEME } from "../../config/premiumTheme";

export default function DetailScreen({ navigation, route }: any) {
  const { id } = route.params;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <PremiumScreenWrapper scrollable={true} showNavBar={true}>
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* HEADER */}
        <View style={styles.header}>
          <PremiumButton
            variant="ghost"
            size="sm"
            icon="arrow-left"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.title}>Details</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* DETAIL SECTIONS */}
        <PremiumCard style={styles.section}>
          <Text style={styles.sectionTitle}>Information</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>ID:</Text>
            <Text style={styles.value}>{id}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Status:</Text>
            <View style={[styles.badge, styles.badgeActive]}>
              <Text style={styles.badgeText}>Active</Text>
            </View>
          </View>
        </PremiumCard>

        {/* ACTION BUTTONS */}
        <View style={styles.actions}>
          <PremiumButton
            label="Update"
            variant="primary"
            size="md"
            onPress={() => navigation.navigate("Edit", { id })}
          />
          <PremiumButton
            label="Cancel"
            variant="danger"
            size="md"
            onPress={() => {}}
          />
        </View>
      </Animated.View>
    </PremiumScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: PREMIUM_THEME.spacing.lg,
  },
  title: {
    fontSize: PREMIUM_THEME.typography.h2.fontSize,
    fontWeight: PREMIUM_THEME.typography.h2.fontWeight as any,
    color: PREMIUM_THEME.colors.text,
  },
  section: {
    marginBottom: PREMIUM_THEME.spacing.lg,
  },
  sectionTitle: {
    fontSize: PREMIUM_THEME.typography.h3.fontSize,
    fontWeight: "600",
    color: PREMIUM_THEME.colors.text,
    marginBottom: PREMIUM_THEME.spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: PREMIUM_THEME.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: `${PREMIUM_THEME.colors.text}10`,
  },
  label: {
    fontSize: PREMIUM_THEME.typography.body.fontSize,
    color: PREMIUM_THEME.colors.textSecondary,
  },
  value: {
    fontSize: PREMIUM_THEME.typography.body.fontSize,
    fontWeight: "600",
    color: PREMIUM_THEME.colors.text,
  },
  badge: {
    paddingHorizontal: PREMIUM_THEME.spacing.md,
    paddingVertical: PREMIUM_THEME.spacing.xs,
    borderRadius: PREMIUM_THEME.borderRadius.full,
  },
  badgeActive: {
    backgroundColor: `${PREMIUM_THEME.colors.accent}30`,
  },
  badgeText: {
    fontSize: PREMIUM_THEME.typography.caption.fontSize,
    color: PREMIUM_THEME.colors.accent,
    fontWeight: "600",
  },
  actions: {
    gap: PREMIUM_THEME.spacing.md,
    marginTop: PREMIUM_THEME.spacing.lg,
  },
});
```

---

## 🔧 Automated Migration Script

Run this to help standardize imports across all screens:

```bash
# Add to package.json scripts:
"migrate:ui": "node scripts/migrate-ui.js"
```

**scripts/migrate-ui.js:**

```javascript
const fs = require("fs");
const path = require("path");

const screensDir = "./src/screens";

function updateScreenImports(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // Add missing imports if screen uses certain patterns
  if (
    content.includes("PremiumScreenWrapper") &&
    !content.includes("import PremiumScreenWrapper")
  ) {
    const imports = `import PremiumScreenWrapper from "../components/PremiumScreenWrapper";\n`;
    content = content.replace(/(import.*from.*;)\n/, `$1\n${imports}`);
  }

  fs.writeFileSync(filePath, content);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith(".tsx")) {
      console.log(`Processing: ${filePath}`);
      updateScreenImports(filePath);
    }
  });
}

console.log("🚀 Starting Premium UI Migration...");
walkDir(screensDir);
console.log("✅ Migration Complete!");
```

---

## ✅ Step-by-Step Implementation

### Step 1: Update Critical Screens (2 hours)

1. Update ShipperHomeScreen.tsx (use Pattern 1)
2. Update TransporterHomeScreen.tsx (use Pattern 1)
3. Update LoginScreen.tsx (use Pattern 3)

### Step 2: Update High Priority (2 hours)

4. Update RoleSelectionScreen.tsx (use Pattern 3)
5. Update ListCargoScreen.tsx (use Pattern 2)
6. Update AvailableLoadsScreen.tsx (use Pattern 2)
7. Update ActiveTripsScreen.tsx (use Pattern 2)

### Step 3: Update Medium Priority (2 hours)

8-13. Apply Pattern 1 or 2 to dashboard/list screens

### Step 4: Update Low Priority (2 hours)

14-21. Apply Pattern 3 or 4 to detail screens

### Step 5: Testing (2 hours)

- Test on iOS
- Test on Android
- Test on Web
- Verify animations 60 FPS

**Total Time: 8-10 hours for complete transformation**

---

## 🎯 Quality Checklist

Before committing each screen update:

- [ ] Uses PremiumScreenWrapper for layout
- [ ] Uses PREMIUM_THEME for all colors
- [ ] Uses PREMIUM_THEME.spacing for padding/margins
- [ ] Has fade-in or slide animation on mount
- [ ] Uses PremiumButton for all buttons
- [ ] Uses PremiumCard for content cards
- [ ] No hardcoded colors (all from PREMIUM_THEME)
- [ ] No magic numbers (all from PREMIUM_THEME)
- [ ] Animations use useNativeDriver: true
- [ ] Navigation prop properly typed
- [ ] Renders without errors in console

---

## 📞 Questions?

Refer to:

- **Quick snippets:** PREMIUM_UI_QUICK_REFERENCE.md
- **Component API:** PREMIUM_DESIGN_SYSTEM_GUIDE.md
- **Troubleshooting:** PREMIUM_UI_IMPLEMENTATION_SUMMARY.md
