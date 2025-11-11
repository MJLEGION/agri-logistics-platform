// src/services/toastService.ts
// Global Toast Notification Service
// Provides a singleton service for showing toast notifications from anywhere in the app

import { ToastType } from '../components/Toast';

type ToastConfig = {
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
};

type ToastListener = (config: ToastConfig) => void;

class ToastService {
  private static instance: ToastService;
  private listeners: ToastListener[] = [];

  private constructor() {}

  static getInstance(): ToastService {
    if (!ToastService.instance) {
      ToastService.instance = new ToastService();
    }
    return ToastService.instance;
  }

  /**
   * Register a listener for toast notifications
   * This is typically called by the ToastProvider component
   */
  subscribe(listener: ToastListener): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Show a toast notification
   */
  private show(config: ToastConfig): void {
    this.listeners.forEach(listener => listener(config));
  }

  /**
   * Show a success toast
   */
  success(message: string, duration?: number): void {
    this.show({ message, type: 'success', duration });
  }

  /**
   * Show an error toast
   */
  error(message: string, duration?: number): void {
    this.show({ message, type: 'error', duration });
  }

  /**
   * Show a warning toast
   */
  warning(message: string, duration?: number): void {
    this.show({ message, type: 'warning', duration });
  }

  /**
   * Show an info toast
   */
  info(message: string, duration?: number): void {
    this.show({ message, type: 'info', duration });
  }

  /**
   * Show a toast with an action button
   */
  withAction(
    message: string,
    type: ToastType,
    actionLabel: string,
    actionCallback: () => void,
    duration?: number
  ): void {
    this.show({
      message,
      type,
      duration,
      action: {
        label: actionLabel,
        onPress: actionCallback,
      },
    });
  }
}

// Export singleton instance
export const toastService = ToastService.getInstance();

// Convenience exports
export const showToast = {
  success: (message: string, duration?: number) => toastService.success(message, duration),
  error: (message: string, duration?: number) => toastService.error(message, duration),
  warning: (message: string, duration?: number) => toastService.warning(message, duration),
  info: (message: string, duration?: number) => toastService.info(message, duration),
  withAction: (
    message: string,
    type: ToastType,
    actionLabel: string,
    actionCallback: () => void,
    duration?: number
  ) => toastService.withAction(message, type, actionLabel, actionCallback, duration),
};

export default toastService;
