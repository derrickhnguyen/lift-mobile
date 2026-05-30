import React from 'react';
import { View, Text } from 'react-native';
import { Card, MuscleTag, ChevronRightIcon, useTheme } from '../../../shared/ui';
import { fmtDate, relDate, fmtVolume } from '../../../shared/lib/formatters';
import type { WorkoutSession } from '../../../entities/workout';

interface WorkoutCardProps {
  session: WorkoutSession;
  exerciseCount?: number;
  setCount?: number;
  volumeLbs?: number;
  durationMin?: number;
  muscleGroups?: string[];
  onPress: () => void;
}

function Stat({
  label,
  value,
  unit,
  colors,
  typography,
}: {
  label: string;
  value: string | number;
  unit?: string;
  colors: any;
  typography: any;
}) {
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
        <Text
          style={{
            fontFamily: typography.monoFontBold,
            fontSize: 19,
            color: colors.text,
            lineHeight: 22,
          }}
        >
          {value}
        </Text>
        {unit && (
          <Text
            style={{
              fontFamily: typography.monoFont,
              fontSize: 11,
              color: colors.text3,
            }}
          >
            {unit}
          </Text>
        )}
      </View>
      <Text
        style={{
          fontFamily: typography.bodyFontSemibold,
          fontSize: 11,
          color: colors.text3,
          marginTop: 4,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  session,
  exerciseCount = 0,
  setCount = 0,
  volumeLbs = 0,
  durationMin = 0,
  muscleGroups = [],
  onPress,
}) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <Card onPress={onPress}>
      <View style={{ padding: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
            <Text
              style={{
                fontFamily: typography.monoFont,
                fontSize: 11,
                letterSpacing: 1.6,
                textTransform: 'uppercase',
                color: colors.text3,
                marginBottom: 5,
              }}
            >
              {relDate(session.started_at)} · {fmtDate(session.started_at)}
            </Text>
            <Text
              style={{
                fontFamily: typography.displayFont,
                fontWeight: '800',
                fontSize: 21,
                color: colors.text,
                letterSpacing: -0.4,
              }}
              numberOfLines={1}
            >
              {session.name || 'Workout'}
            </Text>
          </View>
          <ChevronRightIcon size={20} color={colors.text3} />
        </View>

        <View
          style={{
            flexDirection: 'row',
            gap: 18,
            marginBottom: 14,
          }}
        >
          <Stat label="Exercises" value={exerciseCount} colors={colors} typography={typography} />
          <Stat label="Sets" value={setCount} colors={colors} typography={typography} />
          <Stat
            label="Volume"
            value={fmtVolume(volumeLbs)}
            unit="lb"
            colors={colors}
            typography={typography}
          />
          <Stat label="Time" value={durationMin} unit="min" colors={colors} typography={typography} />
        </View>

        {muscleGroups.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {muscleGroups.slice(0, 5).map((g) => (
              <MuscleTag key={g} group={g} size="sm" />
            ))}
          </View>
        )}
      </View>
    </Card>
  );
};
