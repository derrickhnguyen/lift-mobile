import React from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';
import { useTheme } from './useTheme';

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({ label, active, onPress, style }) => {
  const { colors, palette, radii, typography } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        {
          paddingHorizontal: 13,
          paddingVertical: 7,
          borderRadius: radii.full,
          borderWidth: 1,
          borderColor: active ? palette.accent : colors.border,
          backgroundColor: active ? palette.accent : colors.surface2,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: typography.bodyFontSemibold,
          fontSize: 13,
          color: active ? palette.onAccent : colors.text2,
          textTransform: 'capitalize',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};
