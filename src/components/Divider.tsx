import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, Typography } from '../config/ModernDesignSystem';

interface DividerProps {
  text?: string;
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  spacing?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Divider: React.FC<DividerProps> = ({
  text,
  orientation = 'horizontal',
  thickness = 1,
  spacing = 'md',
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  const getSpacing = () => {
    const spacings = {
      sm: Spacing.sm,
      md: Spacing.lg,
      lg: Spacing.xl,
    };
    return spacings[spacing];
  };

  const marginValue = getSpacing();

  if (orientation === 'vertical') {
    return (
      <View
        style={[
          styles.verticalDivider,
          {
            width: thickness,
            backgroundColor: theme.border,
            marginHorizontal: marginValue,
          },
          style,
        ]}
      />
    );
  }

  if (text) {
    return (
      <View
        style={[
          styles.horizontalWithText,
          {
            marginVertical: marginValue,
          },
          style,
        ]}
      >
        <View
          style={[
            styles.line,
            {
              height: thickness,
              backgroundColor: theme.border,
            },
          ]}
        />
        <Text
          style={[
            styles.text,
            {
              color: theme.textSecondary,
            },
            textStyle,
          ]}
        >
          {text}
        </Text>
        <View
          style={[
            styles.line,
            {
              height: thickness,
              backgroundColor: theme.border,
            },
          ]}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.horizontalDivider,
        {
          height: thickness,
          backgroundColor: theme.border,
          marginVertical: marginValue,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  horizontalDivider: {
    width: '100%',
  },
  verticalDivider: {
    height: '100%',
  },
  horizontalWithText: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  line: {
    flex: 1,
  },
  text: {
    ...Typography.labelSmall,
    paddingHorizontal: Spacing.md,
    textTransform: 'uppercase',
  },
});

export default Divider;
