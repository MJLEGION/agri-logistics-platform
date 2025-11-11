# Screen Update Guide

## Quick Reference for Updating Screens

This guide provides step-by-step instructions and code patterns for updating all screens with:
1. ✅ Design system imports
2. ✅ Toast notifications (replacing Alert.alert)
3. ✅ Accessibility labels
4. ✅ Skeleton loaders

---

## Step 1: Update Imports

### Find and Replace

**Old imports:**
```tsx
import { ModernColors, ModernGradients, Typography, Spacing } from '../config/ModernDesignSystem';
import { spacing, typography, colors } from '../constants/designTokens';
```

**New imports:**
```tsx
import { Colors, Gradients, Typography, Spacing, BorderRadius, Shadows } from '../config/designSystem';
import { showToast } from '../services/toastService';
import { ListSkeleton, CardSkeleton } from '../components/SkeletonLoader';
```

---

## Step 2: Replace Alert.alert with Toast

### Pattern 1: Simple Success Message

**Before:**
```tsx
Alert.alert('Success', 'Cargo created successfully');
```

**After:**
```tsx
showToast.success('Cargo created successfully');
```

### Pattern 2: Error Message

**Before:**
```tsx
Alert.alert('Error', 'Failed to delete cargo');
```

**After:**
```tsx
showToast.error('Failed to delete cargo');
```

### Pattern 3: Confirmation Dialog (Use ConfirmDialog Instead)

**Before:**
```tsx
Alert.alert(
  'Delete Cargo',
  'Are you sure you want to delete this cargo?',
  [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', onPress: handleDelete, style: 'destructive' },
  ]
);
```

**After:**
```tsx
import { ConfirmDialog } from '../components/common/ConfirmDialog';

const [showDeleteDialog, setShowDeleteDialog] = useState(false);

<ConfirmDialog
  visible={showDeleteDialog}
  title="Delete Cargo?"
  message="Are you sure you want to delete this cargo? This action cannot be undone."
  cancelText="Cancel"
  confirmText="Delete"
  onCancel={() => setShowDeleteDialog(false)}
  onConfirm={() => {
    setShowDeleteDialog(false);
    handleDelete();
  }}
  isDestructive={true}
/>

// Trigger with:
<TouchableOpacity onPress={() => setShowDeleteDialog(true)}>
```

---

## Step 3: Add Accessibility Labels

### Pattern 1: Basic TouchableOpacity

**Before:**
```tsx
<TouchableOpacity onPress={handleEdit}>
  <Ionicons name="pencil" size={24} />
</TouchableOpacity>
```

**After:**
```tsx
<TouchableOpacity
  onPress={handleEdit}
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel="Edit cargo"
  accessibilityHint="Double tap to edit cargo details"
>
  <Ionicons name="pencil" size={24} />
</TouchableOpacity>
```

### Pattern 2: List Item

**Before:**
```tsx
<TouchableOpacity onPress={() => navigateToDetails(item.id)}>
  <Text>{item.name}</Text>
</TouchableOpacity>
```

**After:**
```tsx
<TouchableOpacity
  onPress={() => navigateToDetails(item.id)}
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel={`View ${item.name} details`}
  accessibilityHint="Double tap to view full details"
>
  <Text>{item.name}</Text>
</TouchableOpacity>
```

### Pattern 3: Icon-only Button

**Before:**
```tsx
<TouchableOpacity onPress={handleDelete}>
  <Ionicons name="trash" size={20} color="red" />
</TouchableOpacity>
```

**After:**
```tsx
<TouchableOpacity
  onPress={handleDelete}
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel="Delete item"
  accessibilityHint="Double tap to delete. This action cannot be undone"
>
  <Ionicons name="trash" size={20} color="red" />
</TouchableOpacity>
```

### Pattern 4: Pressable

**Before:**
```tsx
<Pressable onPress={handlePress}>
  <Text>Press me</Text>
</Pressable>
```

**After:**
```tsx
<Pressable
  onPress={handlePress}
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel="Press me"
  accessibilityHint="Action description"
>
  <Text>Press me</Text>
</Pressable>
```

---

## Step 4: Add Skeleton Loaders

### Pattern 1: List Screen

**Before:**
```tsx
{isLoading && <ActivityIndicator />}
{!isLoading && (
  <FlatList
    data={items}
    renderItem={renderItem}
  />
)}
```

**After:**
```tsx
{isLoading ? (
  <ListSkeleton count={5} />
) : (
  <FlatList
    data={items}
    renderItem={renderItem}
    ListEmptyComponent={
      <EmptyState
        icon="inbox-outline"
        title="No items found"
        description="Start by creating your first item"
      />
    }
  />
)}
```

### Pattern 2: Card Grid

**Before:**
```tsx
{isLoading && <ActivityIndicator />}
{!isLoading && items.map(item => <Card key={item.id} {...item} />)}
```

**After:**
```tsx
{isLoading ? (
  <>
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton />
  </>
) : (
  items.map(item => <Card key={item.id} {...item} />)
)}
```

---

## Complete Example: Cargo List Screen

```tsx
import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, Typography } from '../config/designSystem';
import { showToast } from '../services/toastService';
import { ListSkeleton } from '../components/SkeletonLoader';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import EmptyState from '../components/EmptyState';

export default function CargoListScreen({ navigation }) {
  const { theme } = useTheme();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await api.getCargo();
      setItems(data);
    } catch (error) {
      showToast.error('Failed to load cargo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteCargo(deleteId);
      showToast.success('Cargo deleted successfully');
      setDeleteId(null);
      fetchData();
    } catch (error) {
      showToast.error('Failed to delete cargo');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('CargoDetails', { id: item.id })}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`View ${item.name} cargo details`}
      accessibilityHint="Double tap to view full cargo information"
      style={styles.item}
    >
      <Text style={[Typography.h6, { color: theme.text }]}>{item.name}</Text>
      <TouchableOpacity
        onPress={() => setDeleteId(item.id)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${item.name}`}
        accessibilityHint="This action cannot be undone"
      >
        <Ionicons name="trash" size={20} color={theme.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {isLoading ? (
        <ListSkeleton count={5} />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: Spacing.lg }}
          ListEmptyComponent={
            <EmptyState
              icon="cube-outline"
              title="No cargo yet"
              description="Create your first cargo listing"
              actionLabel="Create Cargo"
              onAction={() => navigation.navigate('CreateCargo')}
            />
          }
        />
      )}

      <ConfirmDialog
        visible={deleteId !== null}
        title="Delete Cargo?"
        message="This will permanently delete the cargo listing. This action cannot be undone."
        cancelText="Cancel"
        confirmText="Delete"
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isDestructive={true}
      />
    </View>
  );
}
```

---

## Common Accessibility Labels by Element Type

### Navigation Elements
- Back button: `"Go back"` / `"Navigate to previous screen"`
- Menu button: `"Open menu"` / `"Access navigation menu"`
- Close button: `"Close"` / `"Dismiss modal"`

### Action Buttons
- Edit: `"Edit [item name]"` / `"Modify item details"`
- Delete: `"Delete [item name]"` / `"This action cannot be undone"`
- Save: `"Save changes"` / `"Save and return"`
- Cancel: `"Cancel"` / `"Discard changes"`

### List Items
- Cargo item: `"View [cargo name] details"` / `"Double tap for full information"`
- User profile: `"View [user name] profile"` / `"See user details and rating"`

### Form Elements
- Input already has accessibility through Input component
- Button already has accessibility through Button component

---

## Files That Need Updates

### High Priority (Has Alert.alert)
1. ✅ LoginScreen.tsx - COMPLETED
2. MyCargoScreen.tsx
3. ListCargoScreen.tsx
4. EditCargoScreen.tsx
5. PaymentModal.tsx
6. ProfileSettingsScreen.tsx
7. AvailableLoadsScreen.tsx
8. TransportRequestScreen.tsx
9. RatingScreenDemo.tsx
10. RoutePlannerScreen.tsx
11. EarningsDashboardScreen.tsx
12. EnhancedTransporterDashboard.tsx
13. AddressManager.tsx
14. TripTrackingScreen.tsx
15. MomoPaymentModal.tsx
16. ActiveTripScreen.tsx
17. ProfileCompletionScreen.tsx
18. RatingScreen.tsx

### Medium Priority (Design system imports)
- All screens in `src/screens/` that import from old design systems

---

## Testing Checklist

After updating each screen, test:
- [ ] Toast notifications appear and dismiss correctly
- [ ] Confirmation dialogs work for destructive actions
- [ ] Skeleton loaders show during loading
- [ ] Screen reader can navigate all interactive elements
- [ ] All buttons have descriptive labels
- [ ] Error states display correctly
- [ ] Theme switching works

---

## Quick Commands

### Find files with Alert.alert
```bash
grep -r "Alert.alert" src/screens/ --include="*.tsx"
```

### Find files with old design system imports
```bash
grep -r "ModernDesignSystem" src/screens/ --include="*.tsx"
```

### Find TouchableOpacity without accessibility
```bash
grep -B2 -A10 "TouchableOpacity" src/screens/YourScreen.tsx | grep -v "accessible"
```

---

**Generated:** 2025-01-10
**Status:** Guide Complete - Use for remaining screens
