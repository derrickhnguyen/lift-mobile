import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from './useTheme';

type Variant = 'accent' | 'ghost' | 'line' | 'danger';

interface ButtonProps {
  onPress?: () => void;
  variant?: Variant;
  label?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  variant = 'accent',
  label,
  children,
  disabled,
  loading,
  style,
  textStyle,
  fullWidth,
}) => {
  const { colors, palette, radii, typography } = useTheme();

  const bgMap: Record<Variant, string> = {
    accent: palette.accent,
    ghost: colors.surface2,
    line: 'transparent',
    danger: 'transparent',
  };
  const textColorMap: Record<Variant, string> = {
    accent: palette.onAccent,
    ghost: colors.text,
    line: colors.text,
    danger: palette.errorColor,
  };
  const borderMap: Record<Variant, string | undefined> = {
    accent: undefined,
    ghost: undefined,
    line: colors.border2,
    danger: `${palette.errorColor}44`,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        {
          backgroundColor: bgMap[variant],
          borderRadius: radii.md,
          borderWidth: borderMap[variant] ? 1 : 0,
          borderColor: borderMap[variant],
          paddingVertical: 15,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.5 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={textColorMap[variant]}
          size="small"
        />
      ) : (
        children ?? (
          <Text
            style={[
              {
                color: textColorMap[variant],
                fontFamily: typography.bodyFontBold,
                fontSize: 16,
              },
              textStyle,
            ]}
          >
            {label}
          </Text>
        )
      )}
    </TouchableOpacity>
  );
};
