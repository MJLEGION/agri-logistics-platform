// App.tsx
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { store, persistor } from './src/store';
import { ThemeProvider } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { OfflineBanner } from './src/components/OfflineBanner';
import { initializeAllServices } from './src/services/authService';

function AppContent() {
  useEffect(() => {
    // Initialize all mock services on app start
    initializeAllServices().catch(err => console.error('Service init error:', err));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner />
      <AppNavigator />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});