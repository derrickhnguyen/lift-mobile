import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { TopBar, ChevronLeftIcon, ClockIcon, ListIcon, WeightIcon, ChartIcon, EmptyState, TrashIcon, useTheme } from '../../../shared/ui';
import { ExerciseBlock } from '../../../widgets/exercise-block';
import { GroupWrap } from '../../../widgets/group-wrap';
import { workoutApi } from '../../../entities/workout';
import { useWorkoutHistoryStore } from '../../../features/workout-history';
import { fmtDate, fmtTime, relDate, calcVolumeLbs } from '../../../shared/lib/formatters';
import type { WorkoutDetail, LocalWorkoutExercise, LocalSet } from '../../../entities/workout';
import type { RootStackParamList } from '../../../app/navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MuscleGroup } from '../../../shared/config/constants';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'SessionDetail'>;

function toLocalExercise(we: WorkoutDetail['exercises'][0]): LocalWorkoutExercise {
  return {
    localId: we.id,
    serverId: we.id,
    exercise_id: we.exercise.id,
    exercise_name: we.exercise.name,
    muscle_group: we.exercise.muscle_group as MuscleGroup,
    superset_group_id: we.superset_group_id,
    sets: we.sets.map((s) => ({
      localId: s.id,
      serverId: s.id,
      weight: s.weight,
      unit: s.unit,
      reps: s.reps,
      dropset_group_id: s.dropset_group_id,
    })),
  };
}

function groupExercises(exercises: LocalWorkoutExercise[]) {
  const groups: { supersetId: string | null; items: LocalWorkoutExercise[] }[] = [];
  for (const ex of exercises) {
    const last = groups[groups.length - 1];
    if (ex.superset_group_id && last && last.supersetId === ex.superset_group_id) {
      last.items.push(ex);
    } else {
      groups.push({ supersetId: ex.superset_group_id, items: [ex] });
    }
  }
  return groups;
}

export const SessionDetailPage: React.FC = () => {
  const { colors, palette, typography, spacing } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { sessionId } = route.params;

  const [detail, setDetail] = useState<WorkoutDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const removeOne = useWorkoutHistoryStore((s) => s.removeOne);

  useEffect(() => {
    workoutApi.get(sessionId).then(setDetail).finally(() => setIsLoading(false));
  }, [sessionId]);

  const handleDelete = () => {
    Alert.alert('Delete workout?', "This can't be undone.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await removeOne(sessionId);
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Failed to delete workout. Please try again.');
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={palette.accent} size="large" />
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <TopBar
          title="Session"
          leftSlot={
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeftIcon size={20} color={colors.text} />
            </TouchableOpacity>
          }
        />
        <EmptyState icon={<ListIcon size={36} color={colors.text3} />} title="Not found" sub="This session could not be loaded." />
      </View>
    );
  }

  const localExercises = detail.exercises.map(toLocalExercise);
  const groups = groupExercises(localExercises);
  const totalSets = localExercises.reduce((a, e) => a + e.sets.length, 0);
  const totalVol = Math.round(
    localExercises.reduce(
      (a, e) => a + calcVolumeLbs(e.sets.map((s) => ({ weight: s.weight, reps: s.reps, unit: s.unit }))),
      0,
    ),
  );
  const durationMin = Math.max(20, Math.round(totalSets * 4.5));

  let ssCount = 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <TopBar
        sub={`${relDate(detail.started_at)} · ${fmtDate(detail.started_at)}`}
        title={detail.name || 'Workout'}
        leftSlot={
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.surface2,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeftIcon size={20} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={{ padding: spacing.section, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Meta band */}
        <View style={{ flexDirection: 'row', gap: 9, marginBottom: 18 }}>
          {[
            { icon: <ClockIcon size={16} color={colors.text3} />, label: 'Duration', value: `${durationMin} min` },
            { icon: <ListIcon size={16} color={colors.text3} />, label: 'Sets', value: String(totalSets) },
            { icon: <WeightIcon size={16} color={colors.text3} />, label: 'Volume', value: `${(totalVol / 1000).toFixed(1)}k` },
          ].map((m, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                padding: 11,
                borderRadius: 14,
                backgroundColor: colors.surface2,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View style={{ marginBottom: 6 }}>{m.icon}</View>
              <Text style={{ fontFamily: typography.monoFontBold, fontSize: 17, color: colors.text, lineHeight: 19 }}>
                {m.value}
              </Text>
              <Text style={{ fontFamily: typography.monoFont, fontSize: 10.5, color: colors.text3, marginTop: 4, fontWeight: '600' }}>
                {m.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Exercise groups (read-only) */}
        <View style={{ gap: 12 }}>
          {groups.map((g, gi) => {
            const isSuperset = !!g.supersetId && g.items.length > 1;
            const letter = isSuperset ? String.fromCharCode(65 + ssCount++) : null;
            return (
              <GroupWrap key={gi} exercises={g.items} letter={letter}>
                {g.items.map((ex, ei) => (
                  <ExerciseBlock
                    key={ex.localId}
                    exercise={ex}
                    tag={isSuperset && letter ? `${letter}${ei + 1}` : null}
                    readOnly
                  />
                ))}
              </GroupWrap>
            );
          })}
        </View>

        {/* Per-exercise progress links */}
        {detail.exercises.length > 0 && (() => {
          const seen = new Set<string>();
          const unique = detail.exercises.filter((ex) => {
            if (seen.has(ex.exercise.id)) return false;
            seen.add(ex.exercise.id);
            return true;
          });
          return (
            <View style={{ marginTop: 18, gap: 8 }}>
              <Text style={{ fontFamily: typography.monoFont, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: colors.text3, marginBottom: 2 }}>
                Exercise Progress
              </Text>
              {unique.map((ex) => (
                <TouchableOpacity
                  key={ex.exercise.id}
                  onPress={() =>
                    navigation.navigate('ProgressDetail', {
                      exerciseId: ex.exercise.id,
                      exerciseName: ex.exercise.name,
                      muscleGroup: ex.exercise.muscle_group,
                    })
                  }
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: colors.border2,
                  }}
                >
                  <Text style={{ fontFamily: typography.bodyFontSemibold, fontSize: 15, color: colors.text2 }}>
                    {ex.exercise.name}
                  </Text>
                  <ChartIcon size={17} color={colors.text3} />
                </TouchableOpacity>
              ))}
            </View>
          );
        })()}

        {/* Delete button */}
        <TouchableOpacity
          onPress={handleDelete}
          disabled={isDeleting}
          style={{
            marginTop: 12,
            paddingVertical: 15,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#F06A6A44',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            opacity: isDeleting ? 0.5 : 1,
          }}
        >
          <TrashIcon size={17} color="#F06A6A" />
          <Text style={{ fontFamily: typography.bodyFontSemibold, fontSize: 15, color: '#F06A6A' }}>
            Delete workout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
