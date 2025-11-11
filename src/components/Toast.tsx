import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius, Shadows, Typography, ZIndex } from '../config/designSystem';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
  visible?: boolean;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onHide,
  visible = true,
  action,
}) => {
  const { theme } = useTheme();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide
      if (duration > 0) {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  const getToastStyle = (): ViewStyle => {
    const styles: Record<ToastType, ViewStyle> = {
      success: {
        backgroundColor: theme.success,
      },
      error: {
        backgroundColor: theme.danger,
      },
      warning: {
        backgroundColor: theme.warning,
      },
      info: {
        backgroundColor: theme.primary,
      },
    };
    return styles[type];
  };

  const getIcon = (): string => {
    const icons: Record<ToastType, string> = {
      success: 'checkmark-circle',
      error: 'close-circle',
      warning: 'warning',
      info: 'information-circle',
    };
    return icons[type];
  };

  if (!visible) return null;

  const getAccessibilityLabel = (): string => {
    const typeLabels: Record<ToastType, string> = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Information',
    };
    return `${typeLabels[type]}: ${message}`;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getToastStyle(),
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
      accessible={true}
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Ionicons name={getIcon() as any} size={24} color="#FFFFFF" />

      <Text style={styles.message} numberOfLines={2}>
        {message}
      </Text>

      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          style={styles.actionButton}
          accessible={true}
          accessibilityLabel={action.label}
          accessibilityRole="button"
          accessibilityHint="Tap to perform action"
        >
          <Text style={styles.actionText}>{action.label}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={hideToast}
        style={styles.closeButton}
        accessible={true}
        accessibilityLabel="Close notification"
        accessibilityRole="button"
        accessibilityHint="Double tap to dismiss"
      >
        <Ionicons name="close" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.lg,
    zIndex: ZIndex.notification,
  },
  message: {
    flex: 1,
    marginLeft: Spacing.md,
    ...Typography.body,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  actionButton: {
    marginLeft: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  actionText: {
    ...Typography.labelSmall,
    color: '#FFFFFF',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  closeButton: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
});

export default Toast;

// Toast Manager Hook
export const useToast = () => {
  const [toast, setToast] = React.useState<{
    visible: boolean;
    message: string;
    type: ToastType;
    action?: { label: string; onPress: () => void };
  }>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = (
    message: string,
    type: ToastType = 'info',
    action?: { label: string; onPress: () => void }
  ) => {
    setToast({ visible: true, message, type, action });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  return {
    toast,
    showToast,
    hideToast,
    showSuccess: (message: string) => showToast(message, 'success'),
    showError: (message: string) => showToast(message, 'error'),
    showWarning: (message: string) => showToast(message, 'warning'),
    showInfo: (message: string) => showToast(message, 'info'),
  };
};
