# Silk Design Migration Guide

## Overview
The silk design is a professional dashboard layout with:
- **80px dark sidebar** with icon-based navigation
- **Background image** with 0.35 opacity overlay
- **Consistent blue theme** for transporter (#3B82F6) and green for shipper (#10B981)
- **Reusable `DashboardLayout` component** for wrapping screen content

## Quick Conversion Template

### Step 1: Import DashboardLayout
```tsx
import DashboardLayout from '../../components/layouts/DashboardLayout';
```

### Step 2: Define Sidebar Navigation
```tsx
const sidebarNav = [
  { icon: 'briefcase-outline', label: 'Item 1', screen: 'Screen1' },
  { icon: 'navigate-outline', label: 'Item 2', screen: 'Screen2' },
  { icon: 'cash-outline', label: 'Item 3', screen: 'Screen3' },
  { icon: 'time-outline', label: 'Item 4', screen: 'Screen4' },
];
```

### Step 3: Wrap Content with DashboardLayout
```tsx
return (
  <DashboardLayout
    title="Screen Title"
    sidebarColor="#0F172A"
    accentColor="#3B82F6"  // Blue for transporter, #10B981 for shipper
    backgroundImage={require('../../../assets/images/backimages/transporter.jpg')}
    sidebarNav={sidebarNav}
    userRole="transporter"  // or "shipper"
    navigation={navigation}
    contentPadding={false}
  >
    {/* Your existing JSX content goes here - remove old header */}
  </DashboardLayout>
);
```

### Step 4: Clean Up Styles
- **Remove**: Old `header`, `headerTop`, `headerCenter`, `headerBottom`, `title`, `backButton`, `refreshButton` styles
- **Remove**: Redundant sidebar/layout styles
- **Keep**: Card styles, list styles, specific component styles

## Theme Colors

### Transporter
- Sidebar: `#0F172A` (dark blue-black)
- Accent: `#3B82F6` (blue)
- Background: `transporter.jpg`

### Shipper
- Sidebar: `#0F172A` (dark blue-black)
- Accent: `#10B981` (green)
- Background: `shipper.jpg`

## Screens to Convert

### Priority 1: Transporter Screens
- [ ] `EarningsDashboardScreen.tsx`
- [ ] `TripHistoryScreen.tsx`
- [ ] `RoutePlannerScreen.tsx`
- [ ] `TransporterHomeScreen.tsx`
- [ ] `TransporterProfileScreen.tsx`
- [ ] `VehicleProfileScreen.tsx`
- [ ] `RatingScreen.tsx`
- [ ] `TransporterRatingsScreen.tsx`

### Priority 2: Shipper Screens
- [ ] `ShipperHomeScreen.tsx`
- [ ] `MyCargoScreen.tsx`
- [ ] `ShipperActiveOrdersScreen.tsx`
- [ ] `ListCargoScreen.tsx`
- [ ] `ListCargoScreen.enhanced.tsx`
- [ ] `ShipperTrackingDashboard.tsx`

### Priority 3: Detail/Modal Screens
- [ ] `CargoDetailsScreen.tsx`
- [ ] `EditCargoScreen.tsx`
- [ ] `RateTransporterScreen.tsx`
- [ ] `TripTrackingScreen.tsx`
- [ ] `ActiveTripScreen.tsx`

### Priority 4: Auth & Info Screens
- [ ] `LoginScreen.tsx`
- [ ] `RegisterScreen.tsx`
- [ ] `RoleSelectionScreen.tsx`
- [ ] `ProfileCompletionScreen.tsx`
- [ ] `LandingScreen.tsx`
- [ ] `AboutScreen.tsx`
- [ ] `PricingScreen.tsx`

### Priority 5: Settings
- [ ] `ProfileSettingsScreen.tsx`

## Example Conversion: EarningsDashboardScreen

```tsx
// 1. Add import
import DashboardLayout from '../../components/layouts/DashboardLayout';

// 2. Inside component, add before return
const sidebarNav = [
  { icon: 'cash-outline', label: 'Earnings', screen: 'EarningsDashboard' },
  { icon: 'navigate-outline', label: 'Active Trips', screen: 'ActiveTrips' },
  { icon: 'briefcase-outline', label: 'Available Loads', screen: 'AvailableLoads' },
  { icon: 'time-outline', label: 'History', screen: 'TripHistory' },
];

// 3. Replace return View with DashboardLayout
return (
  <DashboardLayout
    title="Earnings"
    sidebarColor="#0F172A"
    accentColor="#3B82F6"
    backgroundImage={require('../../../assets/images/backimages/transporter.jpg')}
    sidebarNav={sidebarNav}
    userRole="transporter"
    navigation={navigation}
    contentPadding={false}
  >
    {/* Original screen content */}
  </DashboardLayout>
);

// 4. Remove old header styles from StyleSheet
// Delete: header, headerTop, headerCenter, title, backButton, refreshButton, etc.
```

## Layout Properties

```tsx
interface DashboardLayoutProps {
  children: React.ReactNode;                    // Screen content
  title?: string;                               // Page title
  sidebarColor?: string;                        // Sidebar background (#0F172A)
  accentColor?: string;                         // Primary color
  backgroundImage?: any;                        // require(...jpg)
  sidebarNav?: SidebarNav[];                    // Navigation items
  userRole?: 'transporter' | 'shipper' | 'admin';
  navigation?: any;                             // React Navigation
  contentPadding?: boolean;                     // Add default padding (true) or none (false)
}

interface SidebarNav {
  icon: string;                                 // Ionicons name
  label: string;                                // Tooltip
  screen?: string;                              // Navigation screen name
  onPress?: () => void;                         // Custom action
}
```

## Features

✅ Automatic sidebar navigation
✅ Dark theme with icon-based nav
✅ Background image with proper opacity
✅ Platform-responsive (web/mobile)
✅ Theme integration (dark/light mode)
✅ Logout button in footer
✅ Theme toggle in sidebar

## Performance Tips

- Use `contentPadding={false}` for custom layouts (FlatList, ScrollView)
- Keep sidebar navigation to 4-5 items max
- Background image is set to 0.35 opacity for visibility
- ScrollView content is automatically wrapped for scroll support

## Common Issues

**Issue**: Old header still showing
**Solution**: Remove the old `<View style={styles.header}>` completely, DashboardLayout handles it

**Issue**: Content not visible behind sidebar
**Solution**: Content is automatically positioned after sidebar, no manual adjustment needed

**Issue**: Background image not showing
**Solution**: Check opacity setting in DashboardLayout - default is 0.35

**Issue**: Navigation not working
**Solution**: Ensure screen names in `sidebarNav` match your navigation stack names

## Next Steps

1. ✅ Completed: `ActiveTripsScreen.tsx`, `AvailableLoadsScreen.tsx`
2. Start with high-priority transporter screens
3. Apply same pattern to shipper screens
4. Handle auth/info screens (may need simpler layout)
5. Test on both web and mobile

## Files Modified

- `src/components/layouts/DashboardLayout.tsx` - New reusable layout component
- `src/screens/transporter/ActiveTripsScreen.tsx` - ✅ Converted
- `src/screens/transporter/AvailableLoadsScreen.tsx` - ✅ Converted
