import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './useTheme';

interface TopBarProps {
  title: string | React.ReactNode;
  sub?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  large?: boolean;
  style?: ViewStyle;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  sub,
  leftSlot,
  rightSlot,
  large,
  style,
}) => {
  const { colors, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          paddingTop: insets.top + 14,
          paddingBottom: 12,
          paddingHorizontal: spacing.section,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.bg,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          minHeight: 60 + insets.top,
        },
        style,
      ]}
    >
      {leftSlot}
      <View style={{ flex: 1, minWidth: 0 }}>
        {sub && (
          <Text
            style={{
              fontFamily: typography.monoFont,
              fontSize: 11,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: colors.text3,
              fontWeight: '600',
              marginBottom: 2,
            }}
          >
            {sub}
          </Text>
        )}
        {typeof title === 'string' ? (
          <Text
            style={{
              fontFamily: typography.displayFont,
              fontWeight: '800',
              fontSize: large ? 27 : 20,
              color: colors.text,
              letterSpacing: -0.4,
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
        ) : (
          title
        )}
      </View>
      {rightSlot}
    </View>
  );
};
