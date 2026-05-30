import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from './useTheme';
import { PlusIcon, MinusIcon } from './Icons';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  suffix?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  value,
  onChange,
  step = 5,
  min = 0,
  suffix,
}) => {
  const { colors, typography } = useTheme();

  const dec = () => onChange(Math.max(min, Math.round((value - step) * 100) / 100));
  const inc = () => onChange(Math.round((value + step) * 100) / 100);

  const displayValue = Number.isInteger(value)
    ? String(value)
    : (Math.round(value * 10) / 10).toFixed(1);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <TouchableOpacity
        onPress={dec}
        activeOpacity={0.7}
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: colors.surface2,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MinusIcon size={18} color={colors.text} />
      </TouchableOpacity>

      <View style={{ minWidth: 64, alignItems: 'center' }}>
        <Text
          style={{
            fontFamily: typography.monoFontBold,
            fontSize: 26,
            color: colors.text,
          }}
        >
          {displayValue}
          {suffix && (
            <Text
              style={{
                fontSize: 13,
                color: colors.text3,
                fontFamily: typography.monoFont,
              }}
            >
              {' '}
              {suffix}
            </Text>
          )}
        </Text>
      </View>

      <TouchableOpacity
        onPress={inc}
        activeOpacity={0.7}
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: colors.surface2,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PlusIcon size={18} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};
