// Delivery Alerts Panel Component
// Displays real-time delivery alerts and notifications for farmers

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { DeliveryAlert, getFarmerAlerts, markAlertAsRead, onAlertReceived } from '../services/deliveryAlertsService';

interface DeliveryAlertsPanelProps {
  farmerId: string;
  theme?: any;
  onAlertPress?: (alert: DeliveryAlert) => void;
}

export const DeliveryAlertsPanel: React.FC<DeliveryAlertsPanelProps> = ({
  farmerId,
  theme,
  onAlertPress,
}) => {
  const [alerts, setAlerts] = useState<DeliveryAlert[]>([]);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load initial alerts
    const initialAlerts = getFarmerAlerts(farmerId, 20);
    setAlerts(initialAlerts);
    updateUnreadCount(initialAlerts);

    // Listen for new alerts
    const unsubscribe = onAlertReceived((newAlert) => {
      if (newAlert.farmerId === farmerId) {
        setAlerts((prevAlerts) => [newAlert, ...prevAlerts]);
        updateUnreadCount([newAlert, ...alerts]);
      }
    });

    return unsubscribe;
  }, [farmerId]);

  const updateUnreadCount = (alertList: DeliveryAlert[]) => {
    const unread = alertList.filter((a) => !a.read).length;
    setUnreadCount(unread);
  };

  const handleAlertPress = (alert: DeliveryAlert) => {
    if (!alert.read) {
      markAlertAsRead(alert.id);
      setAlerts((prevAlerts) =>
        prevAlerts.map((a) => (a.id === alert.id ? { ...a, read: true } : a))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    setExpandedAlert(expandedAlert === alert.id ? null : alert.id);

    if (onAlertPress) {
      onAlertPress(alert);
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'en_route':
        return 'truck';
      case 'eta_update':
        return 'clock-o';
      case 'arriving_soon':
        return 'map-marker';
      case 'delayed':
        return 'exclamation-triangle';
      case 'delivered':
        return 'check-circle';
      case 'address_confirmation':
        return 'question-circle';
      default:
        return 'bell';
    }
  };

  const getAlertColor = (alertType: string) => {
    switch (alertType) {
      case 'en_route':
        return '#007AFF';
      case 'eta_update':
        return '#5AC8FA';
      case 'arriving_soon':
        return '#34C759';
      case 'delayed':
        return '#FF9500';
      case 'delivered':
        return '#5AC8FA';
      case 'address_confirmation':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <FontAwesome name="bell" size={20} color="#007AFF" />
          <Text style={styles.headerText}>Delivery Alerts</Text>
        </View>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Alerts List */}
      <ScrollView style={styles.alertsList} showsVerticalScrollIndicator={false}>
        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome name="inbox" size={48} color="#D1D1D6" />
            <Text style={styles.emptyText}>No alerts yet</Text>
            <Text style={styles.emptySubtext}>
              You'll receive notifications about your deliveries here
            </Text>
          </View>
        ) : (
          alerts.map((alert) => (
            <TouchableOpacity
              key={alert.id}
              style={[
                styles.alertCard,
                !alert.read && styles.unreadCard,
                expandedAlert === alert.id && styles.expandedCard,
              ]}
              onPress={() => handleAlertPress(alert)}
              activeOpacity={0.7}
            >
              {/* Alert Header */}
              <View style={styles.alertHeader}>
                <View style={[styles.iconBox, { backgroundColor: getAlertColor(alert.alertType) + '20' }]}>
                  <FontAwesome
                    name={getAlertIcon(alert.alertType)}
                    size={16}
                    color={getAlertColor(alert.alertType)}
                  />
                </View>

                <View style={styles.alertContent}>
                  <Text
                    style={[styles.alertMessage, !alert.read && styles.unreadMessage]}
                    numberOfLines={expandedAlert === alert.id ? 0 : 2}
                  >
                    {alert.message}
                  </Text>
                  <Text style={styles.alertTime}>{formatTime(alert.timestamp)}</Text>
                </View>

                {!alert.read && <View style={styles.unreadDot} />}
              </View>

              {/* Alert Details (Expanded) */}
              {expandedAlert === alert.id && alert.metadata && (
                <View style={styles.alertDetails}>
                  {alert.metadata.eta && (
                    <View style={styles.detailRow}>
                      <FontAwesome name="hourglass-half" size={14} color="#666" />
                      <Text style={styles.detailText}>ETA: {alert.metadata.eta} minutes</Text>
                    </View>
                  )}
                  {alert.metadata.delay && (
                    <View style={styles.detailRow}>
                      <FontAwesome name="exclamation-circle" size={14} color="#FF9500" />
                      <Text style={styles.detailText}>
                        Delay: {alert.metadata.delay} minutes
                      </Text>
                    </View>
                  )}
                  {alert.metadata.distance && (
                    <View style={styles.detailRow}>
                      <FontAwesome name="map" size={14} color="#666" />
                      <Text style={styles.detailText}>
                        Distance: {alert.metadata.distance.toFixed(1)} km
                      </Text>
                    </View>
                  )}
                  {alert.metadata.estimatedArrival && (
                    <View style={styles.detailRow}>
                      <FontAwesome name="calendar" size={14} color="#666" />
                      <Text style={styles.detailText}>
                        Est. Arrival: {new Date(alert.metadata.estimatedArrival).toLocaleTimeString()}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Quick Stats */}
      {alerts.length > 0 && (
        <View style={styles.statsBar}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>In Transit</Text>
            <Text style={styles.statValue}>
              {alerts.filter((a) => a.alertType === 'en_route').length}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Delayed</Text>
            <Text style={[styles.statValue, { color: '#FF9500' }]}>
              {alerts.filter((a) => a.alertType === 'delayed').length}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Delivered</Text>
            <Text style={[styles.statValue, { color: '#34C759' }]}>
              {alerts.filter((a) => a.alertType === 'delivered').length}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertsList: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  alertCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#F0F8FF',
  },
  expandedCard: {
    shadowOpacity: 0.15,
    elevation: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    fontWeight: '500',
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#000',
  },
  alertTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginTop: 6,
  },
  alertDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});

export default DeliveryAlertsPanel;