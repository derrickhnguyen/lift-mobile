import React from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { useTheme } from './useTheme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  style?: ViewStyle;
  leftSlot?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ style, leftSlot, ...rest }) => {
  const { colors, radii, typography } = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface2,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.md,
          paddingHorizontal: 14,
        },
        style,
      ]}
    >
      {leftSlot}
      <TextInput
        {...rest}
        placeholderTextColor={colors.text3}
        style={{
          flex: 1,
          fontFamily: typography.bodyFont,
          fontSize: 16,
          color: colors.text,
          paddingVertical: 13,
          paddingLeft: leftSlot ? 8 : 0,
        }}
      />
    </View>
  );
};
