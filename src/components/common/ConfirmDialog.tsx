// src/components/common/ConfirmDialog.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Spacing, BorderRadius, Shadows, Typography, ZIndex } from '../../config/designSystem';
import Button from '../Button';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  cancelText?: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
  isDestructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  onCancel,
  onConfirm,
  isDestructive = false,
}) => {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
      accessible={true}
      accessibilityLabel={`${title}. ${message}`}
      accessibilityRole="alert"
    >
      <View style={[styles.backdrop, { backgroundColor: theme.overlay }]}>
        <View
          style={[
            styles.dialog,
            {
              backgroundColor: theme.surface,
              shadowColor: theme.shadow,
            },
          ]}
          accessible={true}
          accessibilityRole="alertdialog"
        >
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: isDestructive ? `${theme.error}20` : `${theme.primary}20` }]}>
            <Ionicons
              name={isDestructive ? 'warning' : 'information-circle'}
              size={32}
              color={isDestructive ? theme.error : theme.primary}
            />
          </View>

          {/* Title */}
          <Text
            style={[
              styles.title,
              { color: theme.text },
              Typography.h4,
            ]}
            accessible={true}
            accessibilityRole="header"
          >
            {title}
          </Text>

          {/* Message */}
          <Text
            style={[
              styles.message,
              { color: theme.textSecondary },
              Typography.body,
            ]}
          >
            {message}
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title={cancelText}
              onPress={onCancel}
              variant="outline"
              size="md"
              style={styles.cancelButton}
              gradient={false}
              accessibilityLabel={`${cancelText} button`}
              accessibilityHint="Dismiss this dialog"
            />

            <Button
              title={confirmText}
              onPress={onConfirm}
              variant={isDestructive ? 'danger' : 'primary'}
              size="md"
              style={styles.confirmButton}
              accessibilityLabel={`${confirmText} button`}
              accessibilityHint={isDestructive ? 'This action cannot be undone' : 'Confirm this action'}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: ZIndex.modal,
  },
  dialog: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    width: '85%',
    maxWidth: 400,
    ...Shadows.xl,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  message: {
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});