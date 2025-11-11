// src/components/ToastProvider.tsx
// Global Toast Provider Component
// Connects the toast service to the Toast UI component

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Toast, { ToastType } from './Toast';
import { toastService } from '../services/toastService';

interface ToastConfig {
  visible: boolean;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastConfig, setToastConfig] = useState<ToastConfig>({
    visible: false,
    message: '',
    type: 'info',
    duration: 3000,
  });

  useEffect(() => {
    // Subscribe to toast service
    const unsubscribe = toastService.subscribe((config) => {
      setToastConfig({
        visible: true,
        message: config.message,
        type: config.type,
        duration: config.duration ?? 3000,
        action: config.action,
      });
    });

    return unsubscribe;
  }, []);

  const handleToastHide = () => {
    setToastConfig((prev) => ({ ...prev, visible: false }));
  };

  return (
    <View style={styles.container}>
      {children}
      {toastConfig.visible && (
        <Toast
          message={toastConfig.message}
          type={toastConfig.type}
          duration={toastConfig.duration}
          visible={toastConfig.visible}
          onHide={handleToastHide}
          action={toastConfig.action}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ToastProvider;
