import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from './useTheme';

interface IconButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  size?: number;
  accent?: boolean;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  children,
  size = 40,
  accent,
  style,
}) => {
  const { colors, palette } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: accent ? palette.accent : colors.surface2,
          borderWidth: accent ? 0 : 1,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {children}
    </TouchableOpacity>
  );
};
