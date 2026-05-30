import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TopBar, ChartIcon, ChevronRightIcon, EmptyState, useTheme } from '../../../shared/ui';
import { getMuscleColor } from '../../../shared/lib/muscleColors';
import { MUSCLE_GROUP_LABELS } from '../../../shared/config/constants';
import { useWorkoutHistoryStore } from '../../../features/workout-history';
import { useExerciseLibraryStore } from '../../../features/exercise-library';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const ProgressIndexPage: React.FC = () => {
  const { colors, palette, typography, spacing } = useTheme();
  const navigation = useNavigation<Nav>();
  const { sessions } = useWorkoutHistoryStore();
  const { exercises } = useExerciseLibraryStore();

  // Build frequency map from local session cache
  const counts: Record<string, { name: string; count: number; muscle_group: string }> = {};
  sessions.forEach((s) => {
    ((s as any).exercises ?? []).forEach((e: any) => {
      if (!counts[e.exercise_id ?? e.name]) {
        const ex = exercises.find((x) => x.id === e.exercise_id || x.name === e.name);
        counts[e.exercise_id ?? e.name] = {
          name: e.name,
          count: 0,
          muscle_group: ex?.muscle_group ?? 'chest',
        };
      }
      counts[e.exercise_id ?? e.name].count++;
    });
  });

  const items = Object.entries(counts)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.count - a.count);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <TopBar large title="Progress" sub="Track your numbers over time" />

      {items.length === 0 ? (
        <EmptyState
          icon={<ChartIcon size={40} color={colors.text3} />}
          title="No history yet"
          sub="Log a workout to see your progress charts here."
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: spacing.section, gap: 10 }}
          ListHeaderComponent={
            <Text
              style={{
                fontFamily: typography.monoFont,
                fontSize: 11,
                letterSpacing: 1.6,
                textTransform: 'uppercase',
                color: colors.text3,
                marginBottom: 2,
              }}
            >
              Most trained
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                const ex = exercises.find((e) => e.id === item.id || e.name === item.name);
                navigation.navigate('ProgressDetail', {
                  exerciseId: item.id,
                  exerciseName: item.name,
                  muscleGroup: item.muscle_group,
                });
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 13,
                padding: 14,
                borderRadius: 14,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 11,
                  backgroundColor: `${getMuscleColor(item.muscle_group)}28`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ChartIcon size={19} color={getMuscleColor(item.muscle_group)} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: typography.bodyFontSemibold, fontSize: 15.5, color: colors.text }}>
                  {item.name}
                </Text>
                <Text style={{ fontFamily: typography.bodyFont, fontSize: 12.5, color: colors.text3, textTransform: 'capitalize', marginTop: 1 }}>
                  {MUSCLE_GROUP_LABELS[item.muscle_group] ?? item.muscle_group} ·{' '}
                  <Text style={{ fontFamily: typography.monoFont }}>{item.count}</Text> sessions
                </Text>
              </View>
              <ChevronRightIcon size={18} color={colors.text3} />
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};
