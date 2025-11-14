// Status Badge with color coding
import React from 'react';
import { View, Text, StyleSheet } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const statusConfig: Record<string, {label: string; color: string; bgColor: string; icon: keyof typeof Ionicons.glyphMap}> = {
  listed: { label: 'Listed', color: '#3B82F6', bgColor: '#DBEAFE', icon: 'list' },
  active: { label: 'Active', color: '#10B981', bgColor: '#D1FAE5', icon: 'checkmark-circle' },
  pending: { label: 'Pending', color: '#F59E0B', bgColor: '#FEF3C7', icon: 'time' },
  in_transit: { label: 'In Transit', color: '#8B5CF6', bgColor: '#EDE9FE', icon: 'car' },
  delivered: { label: 'Delivered', color: '#10B981', bgColor: '#D1FAE5', icon: 'checkmark-done' },
  completed: { label: 'Completed', color: '#059669', bgColor: '#D1FAE5', icon: 'checkmark-done-circle' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bgColor: '#FEE2E2', icon: 'close-circle' },
  matched: { label: 'Matched', color: '#8B5CF6', bgColor: '#EDE9FE', icon: 'link' },
  picked_up: { label: 'Picked Up', color: '#F59E0B', bgColor: '#FEF3C7', icon: 'cube' },
  accepted: { label: 'Accepted', color: '#10B981', bgColor: '#D1FAE5', icon: 'checkmark' },
};

const sizeMap = {
  sm: { fontSize: 11, paddingH: 8, paddingV: 4, iconSize: 12 },
  md: { fontSize: 12, paddingH: 10, paddingV: 5, iconSize: 14 },
  lg: { fontSize: 14, paddingH: 12, paddingV: 6, iconSize: 16 },
};

export default function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
  const sizes = sizeMap[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bgColor,
          paddingHorizontal: sizes.paddingH,
          paddingVertical: sizes.paddingV,
        },
      ]}
    >
      {showIcon && (
        <Ionicons name={config.icon} size={sizes.iconSize} color={config.color} />
      )}
      <Text style={[styles.text, { color: config.color, fontSize: sizes.fontSize }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
