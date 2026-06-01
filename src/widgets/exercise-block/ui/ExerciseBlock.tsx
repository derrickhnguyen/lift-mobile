import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../shared/ui/useTheme';
import { PlusIcon, MoreVerticalIcon, ChartIcon } from '../../../shared/ui/Icons';
import { getMuscleColor } from '../../../shared/lib/muscleColors';
import { calcVolumeLbs } from '../../../shared/lib/formatters';
import { SetRow } from '../../set-row';
import type { LocalWorkoutExercise, LocalSet } from '../../../entities/workout';
import { MUSCLE_GROUP_LABELS } from '../../../shared/config/constants';

interface ExerciseBlockProps {
  exercise: LocalWorkoutExercise;
  tag?: string | null;
  readOnly?: boolean;
  onAddSet?: () => void;
  onEditSet?: (set: LocalSet, index: number) => void;
  onMenu?: () => void;
  onPress?: () => void;
}

const DROP_COLOR = '#FF8A3C';

export const ExerciseBlock: React.FC<ExerciseBlockProps> = ({
  exercise,
  tag,
  readOnly,
  onAddSet,
  onEditSet,
  onMenu,
  onPress,
}) => {
  const { colors, typography, palette } = useTheme();
  const vol = calcVolumeLbs(
    exercise.sets.map((s) => ({
      weight: s.weight,
      reps: s.reps,
      unit: s.unit,
    })),
  );
  const hasDrops = exercise.sets.some((s) => !!s.dropset_group_id);
  const color = getMuscleColor(exercise.muscle_group);
  const label = MUSCLE_GROUP_LABELS[exercise.muscle_group] ?? exercise.muscle_group;

  const HeaderWrapper = onPress ? TouchableOpacity : View;

  return (
    <View>
      {/* Header */}
      <HeaderWrapper
        {...(onPress ? { onPress, activeOpacity: 0.7 } : {})}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingBottom: 4,
          paddingTop: 2,
        }}
      >
        {tag ? (
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              backgroundColor: palette.accent,
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Text
              style={{
                fontFamily: typography.monoFontBold,
                fontSize: 11,
                color: palette.onAccent,
              }}
            >
              {tag}
            </Text>
          </View>
        ) : (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: color,
              flexShrink: 0,
            }}
          />
        )}

        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <Text
              style={{
                fontFamily: typography.displayFont,
                fontWeight: '800',
                fontSize: 16.5,
                color: colors.text,
                letterSpacing: -0.3,
              }}
              numberOfLines={1}
            >
              {exercise.exercise_name}
            </Text>
            {hasDrops && (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: DROP_COLOR,
                  paddingHorizontal: 5,
                  paddingVertical: 1,
                  borderRadius: 4,
                }}
              >
                <Text
                  style={{
                    fontFamily: typography.monoFontBold,
                    fontSize: 8.5,
                    color: DROP_COLOR,
                    letterSpacing: 1,
                  }}
                >
                  DROPSET
                </Text>
              </View>
            )}
          </View>
          <Text
            style={{
              fontFamily: typography.monoFont,
              fontSize: 11.5,
              color: colors.text3,
              marginTop: 1,
              textTransform: 'capitalize',
            }}
          >
            {label} · {Math.round(vol).toLocaleString()} lb vol
          </Text>
        </View>

        {onPress && (
          <ChartIcon size={16} color={colors.text3} />
        )}
        {!readOnly && onMenu && (
          <TouchableOpacity
            onPress={onMenu}
            style={{
              width: 34,
              height: 34,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MoreVerticalIcon size={20} fill={colors.text3} />
          </TouchableOpacity>
        )}
      </HeaderWrapper>

      {/* Sets */}
      <View>
        {exercise.sets.map((s, i) => (
          <SetRow
            key={s.localId}
            set={s}
            index={i}
            prevSet={i > 0 ? exercise.sets[i - 1] : null}
            nextIsDrop={i < exercise.sets.length - 1 && !!exercise.sets[i + 1].dropset_group_id}
            readOnly={readOnly}
            onEdit={() => onEditSet?.(s, i)}
          />
        ))}
      </View>

      {!readOnly && (
        <TouchableOpacity
          onPress={onAddSet}
          style={{
            marginLeft: 30,
            marginTop: 4,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
            paddingVertical: 9,
          }}
        >
          <PlusIcon size={16} color={palette.accent} strokeWidth={2.4} />
          <Text
            style={{
              fontFamily: typography.bodyFontBold,
              fontSize: 13.5,
              color: palette.accent,
            }}
          >
            Add set
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
