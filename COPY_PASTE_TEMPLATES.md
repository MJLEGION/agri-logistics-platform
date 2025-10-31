# 🚀 COPY-PASTE READY TEMPLATES FOR REMAINING SCREENS

## Template 1: Simple List Screen (AvailableLoadsScreen, TripHistoryScreen, etc.)

```typescript
// src/screens/transporter/ScreenName.tsx - PREMIUM DESIGN
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PREMIUM_THEME } from "../../config/premiumTheme";
import { useAppDispatch, useAppSelector } from "../../store";

export default function ScreenName({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const dispatch = useAppDispatch();

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

  const [items, setItems] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={PREMIUM_THEME.gradients.dark}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons
                name="chevron-left"
                size={24}
                color={PREMIUM_THEME.colors.text}
              />
            </TouchableOpacity>
            <Text style={styles.title}>Screen Title</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* CONTENT */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={PREMIUM_THEME.colors.primary}
              />
            </View>
          ) : items.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>No items found</Text>
              <Text style={styles.emptySubtext}>Check back later</Text>
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => (
                <View style={styles.itemCard}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                </View>
              )}
            />
          )}
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PREMIUM_THEME.colors.background,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: PREMIUM_THEME.spacing.lg,
    paddingVertical: PREMIUM_THEME.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    ...PREMIUM_THEME.typography.h3,
    color: PREMIUM_THEME.colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    paddingHorizontal: PREMIUM_THEME.spacing.md,
    paddingVertical: PREMIUM_THEME.spacing.lg,
  },
  itemCard: {
    backgroundColor: PREMIUM_THEME.colors.backgroundLight,
    borderRadius: PREMIUM_THEME.borderRadius.lg,
    padding: PREMIUM_THEME.spacing.lg,
    marginBottom: PREMIUM_THEME.spacing.md,
    borderWidth: 1,
    borderColor: PREMIUM_THEME.colors.border,
  },
  itemTitle: {
    ...PREMIUM_THEME.typography.h4,
    color: PREMIUM_THEME.colors.text,
    marginBottom: PREMIUM_THEME.spacing.sm,
  },
  itemSubtitle: {
    ...PREMIUM_THEME.typography.bodySmall,
    color: PREMIUM_THEME.colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: PREMIUM_THEME.spacing.lg,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: PREMIUM_THEME.spacing.lg,
  },
  emptyText: {
    ...PREMIUM_THEME.typography.h4,
    color: PREMIUM_THEME.colors.text,
  },
  emptySubtext: {
    ...PREMIUM_THEME.typography.body,
    color: PREMIUM_THEME.colors.textSecondary,
    marginTop: PREMIUM_THEME.spacing.sm,
  },
});
```

## Template 2: Detail/Profile Screen

```typescript
// src/screens/transporter/DetailScreen.tsx - PREMIUM DESIGN
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PREMIUM_THEME } from "../../config/premiumTheme";
import PremiumCard from "../../components/PremiumCard";
import PremiumButton from "../../components/PremiumButton";

export default function DetailScreen({ navigation, route }: any) {
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
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={PREMIUM_THEME.gradients.dark}
        style={styles.gradient}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons
              name="chevron-left"
              size={24}
              color={PREMIUM_THEME.colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View
            style={[
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* CONTENT CARD */}
            <PremiumCard style={styles.card}>
              <View style={styles.section}>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons
                    name="information"
                    size={20}
                    color={PREMIUM_THEME.colors.primary}
                  />
                  <Text style={styles.label}>Status</Text>
                </View>
                <Text style={styles.value}>Active</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.section}>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={20}
                    color={PREMIUM_THEME.colors.primary}
                  />
                  <Text style={styles.label}>Location</Text>
                </View>
                <Text style={styles.value}>Kigali, Rwanda</Text>
              </View>
            </PremiumCard>

            {/* ACTION BUTTON */}
            <PremiumButton
              label="Take Action"
              variant="primary"
              size="lg"
              icon="check"
              onPress={() => console.log("Action triggered")}
              fullWidth
              style={styles.button}
            />
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PREMIUM_THEME.colors.background,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: PREMIUM_THEME.spacing.lg,
    paddingVertical: PREMIUM_THEME.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    ...PREMIUM_THEME.typography.h3,
    color: PREMIUM_THEME.colors.text,
  },
  scrollContent: {
    paddingHorizontal: PREMIUM_THEME.spacing.lg,
    paddingVertical: PREMIUM_THEME.spacing.lg,
  },
  card: {
    marginBottom: PREMIUM_THEME.spacing.xl,
  },
  section: {
    marginBottom: PREMIUM_THEME.spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: PREMIUM_THEME.spacing.md,
    marginBottom: PREMIUM_THEME.spacing.sm,
  },
  label: {
    ...PREMIUM_THEME.typography.label,
    color: PREMIUM_THEME.colors.textSecondary,
  },
  value: {
    ...PREMIUM_THEME.typography.body,
    color: PREMIUM_THEME.colors.text,
    paddingLeft: 28,
  },
  divider: {
    height: 1,
    backgroundColor: PREMIUM_THEME.colors.border,
    marginVertical: PREMIUM_THEME.spacing.md,
  },
  button: {
    marginBottom: PREMIUM_THEME.spacing.xl,
  },
});
```

## Template 3: Form/Input Screen

```typescript
// src/screens/transporter/FormScreen.tsx - PREMIUM DESIGN
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  SafeAreaView,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PREMIUM_THEME } from "../../config/premiumTheme";
import PremiumButton from "../../components/PremiumButton";
import PremiumCard from "../../components/PremiumCard";

export default function FormScreen({ navigation }: any) {
  const [formData, setFormData] = useState({ field1: "", field2: "" });
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

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={PREMIUM_THEME.gradients.dark}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons
              name="chevron-left"
              size={24}
              color={PREMIUM_THEME.colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View
            style={[
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <PremiumCard>
              {/* Field 1 */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Field 1</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons
                    name="pencil"
                    size={20}
                    color={PREMIUM_THEME.colors.textSecondary}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter value"
                    placeholderTextColor={PREMIUM_THEME.colors.textTertiary}
                    value={formData.field1}
                    onChangeText={(text) =>
                      setFormData({ ...formData, field1: text })
                    }
                  />
                </View>
              </View>

              {/* Field 2 */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Field 2</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons
                    name="text"
                    size={20}
                    color={PREMIUM_THEME.colors.textSecondary}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter value"
                    placeholderTextColor={PREMIUM_THEME.colors.textTertiary}
                    value={formData.field2}
                    onChangeText={(text) =>
                      setFormData({ ...formData, field2: text })
                    }
                    multiline
                  />
                </View>
              </View>
            </PremiumCard>

            <PremiumButton
              label="Save Changes"
              variant="primary"
              size="lg"
              icon="check"
              onPress={handleSubmit}
              fullWidth
              style={styles.button}
            />
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PREMIUM_THEME.colors.background,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: PREMIUM_THEME.spacing.lg,
    paddingVertical: PREMIUM_THEME.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    ...PREMIUM_THEME.typography.h3,
    color: PREMIUM_THEME.colors.text,
  },
  scrollContent: {
    paddingHorizontal: PREMIUM_THEME.spacing.lg,
    paddingVertical: PREMIUM_THEME.spacing.lg,
  },
  inputGroup: {
    marginBottom: PREMIUM_THEME.spacing.lg,
  },
  label: {
    ...PREMIUM_THEME.typography.label,
    color: PREMIUM_THEME.colors.text,
    marginBottom: PREMIUM_THEME.spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PREMIUM_THEME.colors.backgroundLight,
    borderWidth: 1,
    borderColor: PREMIUM_THEME.colors.border,
    borderRadius: PREMIUM_THEME.borderRadius.md,
    paddingHorizontal: PREMIUM_THEME.spacing.md,
    paddingVertical: PREMIUM_THEME.spacing.sm,
    gap: PREMIUM_THEME.spacing.md,
  },
  input: {
    flex: 1,
    ...PREMIUM_THEME.typography.body,
    color: PREMIUM_THEME.colors.text,
    paddingVertical: PREMIUM_THEME.spacing.md,
  },
  button: {
    marginVertical: PREMIUM_THEME.spacing.xl,
  },
});
```

## Conversion Checklist

### For Each Screen, Verify:

```
☐ PREMIUM_THEME imported from '../../config/premiumTheme'
☐ MaterialCommunityIcons imported (not Ionicons)
☐ No useTheme() import or usage
☐ LinearGradient wrapper with PREMIUM_THEME.gradients.dark
☐ SafeAreaView at root level
☐ Animated.View with fade/slide animations
☐ All colors use PREMIUM_THEME.colors.*
☐ All spacing uses PREMIUM_THEME.spacing.*
☐ All typography uses PREMIUM_THEME.typography.*
☐ borderRadius uses PREMIUM_THEME.borderRadius.*
☐ No hardcoded hex colors in StyleSheet
☐ Loading indicators use PREMIUM_THEME.colors.primary
☐ Empty states are visually consistent
☐ Navigation works correctly
```

## Common Replacements

| Old                             | New                                           |
| ------------------------------- | --------------------------------------------- |
| `const { theme } = useTheme();` | `// No longer needed`                         |
| `theme.background`              | `PREMIUM_THEME.colors.background`             |
| `theme.primary`                 | `PREMIUM_THEME.colors.primary`                |
| `theme.text`                    | `PREMIUM_THEME.colors.text`                   |
| `theme.textSecondary`           | `PREMIUM_THEME.colors.textSecondary`          |
| `Ionicons name="..."`           | `MaterialCommunityIcons name="..."`           |
| `fontSize: 24`                  | `...PREMIUM_THEME.typography.h3`              |
| `padding: 16`                   | `paddingHorizontal: PREMIUM_THEME.spacing.lg` |
| `borderRadius: 12`              | `borderRadius: PREMIUM_THEME.borderRadius.md` |
| `backgroundColor: '#FFF'`       | `backgroundColor: PREMIUM_THEME.colors.text`  |

## Testing the Update

After updating each screen:

```bash
# Mobile: Run your development build
npx expo start

# Web: Test responsive design
# Click to web preview

# Check:
✓ Animations smooth on entry
✓ Colors match design system
✓ Text readable (contrast OK)
✓ Buttons clickable (min 48x48 points)
✓ No console errors
✓ Navigation works
```

---

**Use these templates as starting points for the remaining 20 screens.**
**Each should take 10-15 minutes to complete.**
**Total time: 3-4 hours to finish all!**
