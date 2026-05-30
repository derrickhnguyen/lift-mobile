import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../../shared/ui/useTheme';
import { ClockIcon, CheckIcon } from '../../../shared/ui/Icons';
import { fmtRestTimer } from '../../../shared/lib/formatters';

interface RestTimerProps {
  endsAt: number;
  total: number;
  onAdd15: () => void;
  onSub15: () => void;
  onSkip: () => void;
}

const R = 19;
const CIRCUMFERENCE = 2 * Math.PI * R;

export const RestTimer: React.FC<RestTimerProps> = ({
  endsAt,
  total,
  onAdd15,
  onSub15,
  onSkip,
}) => {
  const { colors, palette, typography } = useTheme();
  const [remaining, setRemaining] = React.useState(
    Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
    }, 250);
    return () => clearInterval(interval);
  }, [endsAt]);

  const done = remaining <= 0;
  const pct = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
  const dashOffset = CIRCUMFERENCE * (1 - pct);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: done
          ? `${palette.accent}22`
          : colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      {/* Progress ring */}
      <View style={{ width: 46, height: 46, position: 'relative', flexShrink: 0 }}>
        <Svg
          width={46}
          height={46}
          viewBox="0 0 46 46"
          style={{ transform: [{ rotate: '-90deg' }] }}
        >
          <Circle
            cx="23"
            cy="23"
            r={R}
            fill="none"
            stroke={colors.surface3}
            strokeWidth="4"
          />
          <Circle
            cx="23"
            cy="23"
            r={R}
            fill="none"
            stroke={palette.accent}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </Svg>
        <View
          style={{
            position: 'absolute',
            inset: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {done ? (
            <CheckIcon size={20} color={palette.accent} strokeWidth={3} />
          ) : (
            <ClockIcon size={18} color={palette.accent} />
          )}
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: typography.monoFont,
            fontSize: 11,
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            color: done ? palette.accent : colors.text3,
            marginBottom: 2,
          }}
        >
          {done ? 'Rest complete' : 'Rest timer'}
        </Text>
        <Text
          style={{
            fontFamily: typography.monoFontBold,
            fontSize: 24,
            color: colors.text,
            lineHeight: 26,
          }}
        >
          {fmtRestTimer(remaining)}
        </Text>
      </View>

      {!done && (
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <TouchableOpacity
            onPress={onSub15}
            style={{
              paddingHorizontal: 11,
              paddingVertical: 9,
              borderRadius: 10,
              backgroundColor: colors.surface2,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                fontFamily: typography.monoFontBold,
                fontSize: 13,
                color: colors.text,
              }}
            >
              −15
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onAdd15}
            style={{
              paddingHorizontal: 11,
              paddingVertical: 9,
              borderRadius: 10,
              backgroundColor: colors.surface2,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                fontFamily: typography.monoFontBold,
                fontSize: 13,
                color: colors.text,
              }}
            >
              +15
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        onPress={onSkip}
        style={{
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 10,
          backgroundColor: palette.accent,
        }}
      >
        <Text
          style={{
            fontFamily: typography.bodyFontBold,
            fontSize: 14,
            color: palette.onAccent,
          }}
        >
          {done ? 'Done' : 'Skip'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
