import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const isTablet = width >= 768;
const isSmallPhone = width < 375;
const isMediumPhone = width >= 375 && width < 414;
const isLargePhone = width >= 414;

export const ResponsiveValues = {
  // Screen dimensions
  screenWidth: width,
  screenHeight: height,
  isTablet,
  isSmallPhone,
  isMediumPhone,
  isLargePhone,

  // Padding values - scale based on screen size
  paddingXSmall: isSmallPhone ? 6 : isMediumPhone ? 8 : 12,
  paddingSmall: isSmallPhone ? 10 : isMediumPhone ? 12 : 16,
  paddingMedium: isSmallPhone ? 14 : isMediumPhone ? 16 : 20,
  paddingLarge: isSmallPhone ? 18 : isMediumPhone ? 20 : 24,
  paddingXLarge: isSmallPhone ? 22 : isMediumPhone ? 24 : 32,

  // Margin values
  marginXSmall: isSmallPhone ? 3 : isMediumPhone ? 4 : 6,
  marginSmall: isSmallPhone ? 6 : isMediumPhone ? 8 : 12,
  marginMedium: isSmallPhone ? 10 : isMediumPhone ? 12 : 16,
  marginLarge: isSmallPhone ? 14 : isMediumPhone ? 16 : 20,
  marginXLarge: isSmallPhone ? 18 : isMediumPhone ? 20 : 24,

  // Gap values for flex layouts
  gapXSmall: isSmallPhone ? 4 : isMediumPhone ? 6 : 8,
  gapSmall: isSmallPhone ? 6 : isMediumPhone ? 8 : 12,
  gapMedium: isSmallPhone ? 10 : isMediumPhone ? 12 : 16,
  gapLarge: isSmallPhone ? 14 : isMediumPhone ? 16 : 20,
  gapXLarge: isSmallPhone ? 18 : isMediumPhone ? 20 : 24,

  // Border radius
  radiusSmall: isSmallPhone ? 4 : 6,
  radiusMedium: isSmallPhone ? 6 : 8,
  radiusLarge: isSmallPhone ? 10 : 12,
  radiusXLarge: isSmallPhone ? 14 : 16,

  // Font sizes
  fontXSmall: isSmallPhone ? 10 : isMediumPhone ? 11 : 12,
  fontSmall: isSmallPhone ? 12 : isMediumPhone ? 13 : 14,
  fontMedium: isSmallPhone ? 14 : isMediumPhone ? 15 : 16,
  fontLarge: isSmallPhone ? 16 : isMediumPhone ? 17 : 18,
  fontXLarge: isSmallPhone ? 18 : isMediumPhone ? 19 : 20,
  fontTitle: isSmallPhone ? 22 : isMediumPhone ? 24 : 28,

  // Button sizing
  buttonHeightSmall: isSmallPhone ? 36 : 40,
  buttonHeightMedium: isSmallPhone ? 44 : 48,
  buttonHeightLarge: isSmallPhone ? 52 : 56,
  buttonMinTouchSize: 44, // Minimum touch target size (accessibility standard)

  // Input sizing
  inputHeight: isSmallPhone ? 44 : 48,
  inputPadding: isSmallPhone ? 10 : 12,

  // Card sizes
  cardBorderRadius: isSmallPhone ? 8 : 12,
  cardPadding: isSmallPhone ? 10 : isMediumPhone ? 12 : 16,

  // Modal sizing
  modalMaxWidth: isTablet ? 500 : width * 0.92,
  modalPadding: isSmallPhone ? 14 : isMediumPhone ? 16 : 20,

  // Responsive widths
  containerMaxWidth: isTablet ? 600 : width * 0.95,
  fullWidth: width * 0.95,
  halfWidth: (width - (isSmallPhone ? 32 : 48)) / 2, // accounting for padding

  // Header and tab sizing
  headerHeight: isSmallPhone ? 52 : 56,
  tabBarHeight: isSmallPhone ? 52 : 56,
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
