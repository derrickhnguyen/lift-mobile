import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../shared/ui/useTheme';
import { LinkIcon } from '../../../shared/ui/Icons';
import type { LocalWorkoutExercise } from '../../../entities/workout';

interface GroupWrapProps {
  exercises: LocalWorkoutExercise[];
  letter: string | null;
  children: React.ReactNode;
}

export const GroupWrap: React.FC<GroupWrapProps> = ({
  exercises,
  letter,
  children,
}) => {
  const { colors, palette, radii, typography } = useTheme();
  const isSuperset = exercises.length > 1 && !!exercises[0].superset_group_id;

  if (!isSuperset) {
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 15,
        }}
      >
        {children}
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: `${palette.accent}0F`,
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: `${palette.accent}60`,
        padding: 15,
        paddingLeft: 19,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left bracket */}
      <View
        style={{
          position: 'absolute',
          left: 7,
          top: 14,
          bottom: 14,
          width: 5,
          backgroundColor: palette.accent,
          borderRadius: 4,
        }}
      />

      {/* Superset header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginBottom: 13,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: palette.accent,
            paddingHorizontal: 9,
            paddingVertical: 4,
            borderRadius: 7,
          }}
        >
          <LinkIcon size={13} color={palette.onAccent} strokeWidth={2.6} />
          <Text
            style={{
              fontFamily: typography.monoFontBold,
              fontSize: 10,
              color: palette.onAccent,
              letterSpacing: 1,
            }}
          >
            SUPERSET {letter}
          </Text>
        </View>
        <Text
          style={{
            fontFamily: typography.bodyFontSemibold,
            fontSize: 11.5,
            color: colors.text3,
          }}
        >
          {exercises.length} exercises · alternate sets
        </Text>
      </View>

      <View style={{ gap: 14 }}>{children}</View>
    </View>
  );
};
