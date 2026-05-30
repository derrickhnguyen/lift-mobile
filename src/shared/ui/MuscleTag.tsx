import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from './useTheme';
import { getMuscleColor } from '../lib/muscleColors';
import { MUSCLE_GROUP_LABELS } from '../config/constants';

interface MuscleTagProps {
  group: string;
  size?: 'sm' | 'md';
}

export const MuscleTag: React.FC<MuscleTagProps> = ({ group, size = 'md' }) => {
  const { colors, typography } = useTheme();
  const small = size === 'sm';
  const color = getMuscleColor(group);
  const label = MUSCLE_GROUP_LABELS[group] ?? group;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: small ? 8 : 10,
        paddingVertical: small ? 3 : 4,
        borderRadius: 999,
        backgroundColor: colors.surface2,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          width: small ? 6 : 8,
          height: small ? 6 : 8,
          borderRadius: 999,
          backgroundColor: color,
        }}
      />
      <Text
        style={{
          fontFamily: typography.bodyFontSemibold,
          fontSize: small ? 11 : 12,
          color: colors.text2,
          textTransform: 'capitalize',
        }}
      >
        {label}
      </Text>
    </View>
  );
};
