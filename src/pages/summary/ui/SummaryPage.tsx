import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CheckIcon, ClockIcon, DumbbellIcon, ListIcon, WeightIcon, TrophyIcon, useTheme } from '../../../shared/ui';
import { useActiveSessionStore } from '../../../features/active-session';
import { useWorkoutHistoryStore } from '../../../features/workout-history';
import { fmtDate, fmtTime, calcVolumeLbs, toUniversalLbs } from '../../../shared/lib/formatters';
import { getMuscleColor } from '../../../shared/lib/muscleColors';
import { workoutApi } from '../../../entities/workout';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const SummaryPage: React.FC = () => {
  const { colors, palette, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { session, discard } = useActiveSessionStore();
  const { prependSession } = useWorkoutHistoryStore();

  if (!session) {
    navigation.navigate('Main');
    return null;
  }

  const totalSets = session.exercises.reduce((a, e) => a + e.sets.length, 0);
  const totalVol = Math.round(
    session.exercises.reduce(
      (a, e) =>
        a +
        calcVolumeLbs(
          e.sets.map((s) => ({ weight: s.weight, reps: s.reps, unit: s.unit })),
        ),
      0,
    ),
  );
  const exerciseCount = session.exercises.filter((e) => e.sets.length > 0).length;
  const dur = Math.max(20, Math.round(totalSets * 4.5));

  // Derive PRs would normally compare against history from the server
  // For now, show a placeholder note
  const prs: { name: string; group: string; weight: number }[] = [];

  const handleSave = async () => {
    // Session already saved on server — just prepend summary to history list
    if (session.serverId) {
      prependSession({
        id: session.serverId,
        name: session.name,
        user_id: '',
        started_at: session.started_at,
        created_at: session.started_at,
        updated_at: session.started_at,
      });
    }
    useActiveSessionStore.setState({ session: null, restTimer: null });
    navigation.navigate('Main');
  };

  const handleDiscard = async () => {
    await discard();
    navigation.navigate('Main');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{
        padding: spacing.section,
        paddingTop: insets.top + 28,
        paddingBottom: insets.bottom + 30,
        alignItems: 'center',
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Trophy */}
      <View
        style={{
          width: 76,
          height: 76,
          borderRadius: 24,
          backgroundColor: palette.accent,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 18,
        }}
      >
        <CheckIcon size={42} color={palette.onAccent} strokeWidth={2.6} />
      </View>

      <Text
        style={{
          fontFamily: typography.monoFont,
          fontSize: 11,
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          color: colors.text3,
          marginBottom: 8,
        }}
      >
        {fmtDate(session.started_at)} · {fmtTime(session.started_at)}
      </Text>

      <Text
        style={{
          fontFamily: typography.displayFont,
          fontWeight: '800',
          fontSize: 30,
          color: colors.text,
          letterSpacing: -0.6,
          marginBottom: 4,
          textAlign: 'center',
        }}
      >
        Workout complete
      </Text>
      <Text
        style={{
          fontFamily: typography.bodyFont,
          fontSize: 15,
          color: colors.text2,
          marginBottom: 24,
          textAlign: 'center',
        }}
      >
        {session.name}
      </Text>

      {/* Stat grid */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 20,
          width: '100%',
        }}
      >
        {[
          { icon: <ClockIcon size={18} color={colors.text3} />, value: `${dur}`, unit: 'min', label: 'Duration' },
          { icon: <DumbbellIcon size={18} color={colors.text3} />, value: String(exerciseCount), label: 'Exercises' },
          { icon: <ListIcon size={18} color={colors.text3} />, value: String(totalSets), label: 'Sets logged' },
          { icon: <WeightIcon size={18} color={colors.text3} />, value: `${(totalVol / 1000).toFixed(1)}`, unit: 'k lb', label: 'Total volume' },
        ].map((s, i) => (
          <View
            key={i}
            style={{
              width: '47%',
              padding: 14,
              borderRadius: 14,
              backgroundColor: colors.surface2,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View style={{ marginBottom: 8 }}>{s.icon}</View>
            <Text style={{ fontFamily: typography.monoFontBold, fontSize: 26, color: colors.text, lineHeight: 28 }}>
              {s.value}
              {s.unit && (
                <Text style={{ fontSize: 12, color: colors.text3, fontFamily: typography.monoFont }}>
                  {' '}{s.unit}
                </Text>
              )}
            </Text>
            <Text style={{ fontFamily: typography.bodyFontSemibold, fontSize: 11.5, color: colors.text3, marginTop: 6 }}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={{ width: '100%', gap: 10 }}>
        <TouchableOpacity
          onPress={handleSave}
          style={{
            width: '100%',
            paddingVertical: 16,
            borderRadius: 14,
            backgroundColor: palette.accent,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontFamily: typography.bodyFontBold, fontSize: 16, color: palette.onAccent }}>
            Save workout
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDiscard}
          style={{
            width: '100%',
            paddingVertical: 16,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#F06A6A44',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontFamily: typography.bodyFontBold, fontSize: 16, color: '#F06A6A' }}>
            Discard
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
