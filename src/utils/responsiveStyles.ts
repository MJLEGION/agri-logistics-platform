import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const isTablet = width > 600;
const isSmallPhone = width < 375;
const isLargePhone = width > 414;

export const ResponsiveValues = {
  // Screen dimensions
  screenWidth: width,
  screenHeight: height,
  isTablet,
  isSmallPhone,
  isLargePhone,

  // Padding values - scale based on screen size
  paddingXSmall: isSmallPhone ? 8 : 12,
  paddingSmall: isSmallPhone ? 12 : 16,
  paddingMedium: isSmallPhone ? 16 : 20,
  paddingLarge: isSmallPhone ? 20 : 24,
  paddingXLarge: isSmallPhone ? 24 : 32,

  // Margin values
  marginXSmall: isSmallPhone ? 4 : 6,
  marginSmall: isSmallPhone ? 8 : 12,
  marginMedium: isSmallPhone ? 12 : 16,
  marginLarge: isSmallPhone ? 16 : 20,
  marginXLarge: isSmallPhone ? 20 : 24,

  // Gap values for flex layouts
  gapXSmall: isSmallPhone ? 6 : 8,
  gapSmall: isSmallPhone ? 8 : 12,
  gapMedium: isSmallPhone ? 12 : 16,
  gapLarge: isSmallPhone ? 16 : 20,
  gapXLarge: isSmallPhone ? 20 : 24,

  // Border radius
  radiusSmall: 6,
  radiusMedium: 8,
  radiusLarge: 12,
  radiusXLarge: 16,

  // Font sizes
  fontXSmall: isSmallPhone ? 11 : 12,
  fontSmall: isSmallPhone ? 13 : 14,
  fontMedium: isSmallPhone ? 15 : 16,
  fontLarge: isSmallPhone ? 17 : 18,
  fontXLarge: isSmallPhone ? 19 : 20,
  fontTitle: isSmallPhone ? 24 : 28,

  // Button sizing
  buttonHeightSmall: 40,
  buttonHeightMedium: 48,
  buttonHeightLarge: 56,
  buttonMinTouchSize: 48, // Minimum touch target size (accessibility standard)

  // Input sizing
  inputHeight: 48,
  inputPadding: 12,

  // Card sizes
  cardBorderRadius: 12,
  cardPadding: isSmallPhone ? 12 : 16,

  // Modal sizing
  modalMaxWidth: isTablet ? 500 : width * 0.9,
  modalPadding: isSmallPhone ? 16 : 20,

  // Responsive widths
  containerMaxWidth: isTablet ? 600 : width * 0.95,
  fullWidth: width * 0.95,
  halfWidth: (width - 48) / 2, // accounting for padding

  // Header and tab sizing
  headerHeight: 56,
  tabBarHeight: 56,
};

export const getResponsivePadding = () => ({
  horizontal: ResponsiveValues.paddingMedium,
  vertical: ResponsiveValues.paddingSmall,
});

export const getResponsiveGap = () => ({
  small: ResponsiveValues.gapSmall,
  medium: ResponsiveValues.gapMedium,
  large: ResponsiveValues.gapLarge,
});

export const getResponsiveButtonStyle = (variant: 'small' | 'medium' | 'large' = 'medium') => {
  const heights = {
    small: ResponsiveValues.buttonHeightSmall,
    medium: ResponsiveValues.buttonHeightMedium,
    large: ResponsiveValues.buttonHeightLarge,
  };

  return {
    height: heights[variant],
    borderRadius: ResponsiveValues.radiusMedium,
    paddingHorizontal: ResponsiveValues.paddingMedium,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  };
};

export const getResponsiveFormLayout = () => ({
  containerPadding: ResponsiveValues.paddingMedium,
  inputMarginVertical: ResponsiveValues.marginMedium,
  labelMarginBottom: ResponsiveValues.marginSmall,
  gap: ResponsiveValues.gapMedium,
});
