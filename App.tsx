// App.tsx
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { store, persistor } from './src/store';
import { ThemeProvider } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { OfflineBanner } from './src/components/OfflineBanner';
import ErrorBoundary from './src/components/ErrorBoundary';
import { initializeAllServices } from './src/services/authService';
import SplashScreen from './src/screens/SplashScreen';
import ToastProvider from './src/components/ToastProvider';

function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize app with splash screen
    const initializeApp = async () => {
      try {
        // Initialize all mock services
        await initializeAllServices();
        console.log('✅ Services initialized');
        setIsInitialized(true);

        // Show splash screen for minimum 4 seconds (2 seconds longer)
        await new Promise(resolve => setTimeout(resolve, 4000));

        setIsReady(true);
      } catch (err) {
        console.error('Service init error:', err);
        setIsInitialized(true);
        setIsReady(true); // Still show app even if init fails
      }
    };

    initializeApp();
  }, []);

  if (!isReady) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ToastProvider>
        <OfflineBanner />
        <AppNavigator />
      </ToastProvider>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<SplashScreen />} persistor={persistor}>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});