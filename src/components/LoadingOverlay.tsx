// src/components/LoadingOverlay.tsx
// Full-screen loading overlay component

import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Modal,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, Typography, ZIndex } from '../config/designSystem';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message,
  transparent = false,
}) => {
  const { theme } = useTheme();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      accessible={true}
      accessibilityLabel={message || 'Loading'}
      accessibilityRole="progressbar"
      accessibilityLiveRegion="polite"
    >
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: transparent
              ? theme.overlay
              : `${theme.overlay}CC`,
          },
        ]}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.surface,
              shadowColor: theme.shadow,
            },
          ]}
        >
          <ActivityIndicator size="large" color={theme.primary} />
          {message && (
            <Text
              style={[
                styles.message,
                {
                  color: theme.text,
                  ...Typography.body,
                },
              ]}
            >
              {message}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: ZIndex.modal,
  },
  container: {
    padding: Spacing.xxl,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 150,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    marginTop: Spacing.md,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default LoadingOverlay;
