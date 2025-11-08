// src/components/OfflineBanner.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import {
  checkConnectivity,
  setupNetworkListener,
  getOfflineQueueCount,
  syncOfflineQueue,
} from '../services/offlineService';

export const OfflineBanner: React.FC = () => {
  const { theme } = useTheme();
  const [isOnline, setIsOnline] = useState(true);
  const [queueCount, setQueueCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    // Check initial connectivity
    checkConnectivity().then(setIsOnline);
    updateQueueCount();

    // Setup network listener
    const unsubscribe = setupNetworkListener(
      async () => {
        setIsOnline(true);
        // Auto-sync when coming online
        await handleSync();
      },
      () => {
        setIsOnline(false);
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Animate banner in/out
    Animated.timing(slideAnim, {
      toValue: !isOnline || queueCount > 0 ? 0 : -100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOnline, queueCount]);

  const updateQueueCount = async () => {
    const count = await getOfflineQueueCount();
    setQueueCount(count);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncOfflineQueue();
      await updateQueueCount();
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  };

  if (isOnline && queueCount === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor: isOnline ? theme.warning : theme.error,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons
          name={isOnline ? 'cloud-upload-outline' : 'cloud-offline-outline'}
          size={20}
          color="#FFF"
        />
        <Text style={styles.text}>
          {isOnline
            ? `${queueCount} request${queueCount !== 1 ? 's' : ''} pending sync`
            : 'You are offline. Changes will sync when connected.'}
        </Text>
      </View>
      {isOnline && queueCount > 0 && (
        <TouchableOpacity
          style={styles.syncButton}
          onPress={handleSync}
          disabled={syncing}
        >
          <Text style={styles.syncText}>{syncing ? 'Syncing...' : 'Sync Now'}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  text: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  syncButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  syncText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});