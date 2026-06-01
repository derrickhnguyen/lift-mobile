import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TopBar, PlusIcon, FlameIcon, DumbbellIcon, ChartIcon, LinkIcon, EmptyState, useTheme } from '../../../shared/ui';
import { WorkoutCard } from '../../../widgets/workout-card';
import { useWorkoutHistoryStore } from '../../../features/workout-history';
import { useAuthStore } from '../../../features/auth';
import { useActiveSessionStore } from '../../../features/active-session';
import { fmtVolume } from '../../../shared/lib/formatters';
import type { WorkoutSession } from '../../../entities/workout';
import type { RootStackParamList } from '../../../app/navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function calcStats(session: WorkoutSession) {
  return {
    exerciseCount: session.exerciseCount ?? 0,
    setCount: session.setCount ?? 0,
    volumeLbs: session.volumeLbs ?? 0,
    durationMin: session.durationMin ?? 0,
    muscleGroups: session.muscleGroups ?? [],
  };
}

export const HomePage: React.FC = () => {
  const { colors, palette, typography, spacing } = useTheme();
  const navigation = useNavigation<Nav>();
  const { sessions, isLoading, isLoadingMore, hasLoaded, fetchInitial, fetchMore } =
    useWorkoutHistoryStore();
  const user = useAuthStore((s) => s.user);
  const firstName = user?.first_name ?? user?.email?.split('@')[0] ?? 'there';

  useEffect(() => {
    if (!hasLoaded) fetchInitial();
  }, [hasLoaded]);

  const onEndReached = useCallback(() => {
    fetchMore();
  }, [fetchMore]);

  const activeSession = useActiveSessionStore((s) => s.session);

  const handleStartWorkout = async () => {
    const { session, start } = useActiveSessionStore.getState();
    if (!session) {
      const hour = new Date().getHours();
      const name = hour < 12 ? 'Morning Workout' : hour < 17 ? 'Afternoon Workout' : 'Evening Workout';
      await start(name, new Date().toISOString());
    }
    navigation.navigate('ActiveSession');
  };

  const handleOpenSession = (session: WorkoutSession) => {
    navigation.navigate('SessionDetail', { sessionId: session.id });
  };

  const totalVol = sessions.reduce((acc, s) => acc + ((s as any).volumeLbs ?? 0), 0);

  if (!hasLoaded && isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={palette.accent} size="large" />
      </View>
    );
  }

  if (sessions.length === 0 && hasLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <TopBar
          large
          sub={`Welcome back, ${firstName}`}
          title="Your training"
          rightSlot={
            <TouchableOpacity
              onPress={handleStartWorkout}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: palette.accent,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PlusIcon size={22} color={palette.onAccent} strokeWidth={2.2} />
            </TouchableOpacity>
          }
        />
        <FirstRunView onStart={handleStartWorkout} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <TopBar
        large
        sub={`Welcome back, ${firstName}`}
        title="Your training"
        rightSlot={
          <TouchableOpacity
            onPress={handleStartWorkout}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: palette.accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PlusIcon size={22} color={palette.onAccent} strokeWidth={2.2} />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={sessions}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ padding: spacing.section, paddingTop: 16, gap: 12 }}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View style={{ gap: 10, marginBottom: 6 }}>
          {activeSession && (
            <TouchableOpacity
              onPress={() => navigation.navigate('ActiveSession')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 13,
                backgroundColor: `${palette.accent}15`,
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: `${palette.accent}50`,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: palette.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <DumbbellIcon size={20} color={palette.onAccent} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: typography.bodyFontBold, fontSize: 14, color: colors.text }}>
                  {activeSession.name}
                </Text>
                <Text style={{ fontFamily: typography.bodyFont, fontSize: 12, color: colors.text2, marginTop: 1 }}>
                  {activeSession.exercises.length} exercise{activeSession.exercises.length !== 1 ? 's' : ''} · Tap to resume
                </Text>
              </View>
              <Text style={{ fontFamily: typography.bodyFontBold, fontSize: 13, color: palette.accent }}>
                Resume
              </Text>
            </TouchableOpacity>
          )}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
              backgroundColor: colors.surface2,
              borderRadius: 14,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 13,
                backgroundColor: `${palette.accent}2E`,
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FlameIcon size={24} color={palette.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: typography.bodyFontSemibold,
                  fontSize: 13,
                  color: colors.text2,
                }}
              >
                {sessions.length} sessions logged
              </Text>
              <Text
                style={{
                  fontFamily: typography.monoFont,
                  fontSize: 13,
                  color: colors.text3,
                  marginTop: 2,
                }}
              >
                {fmtVolume(totalVol)}lb moved · all time
              </Text>
            </View>
          </View>
          </View>
        }
        renderItem={({ item }) => (
          <WorkoutCard
            session={item}
            {...calcStats(item)}
            onPress={() => handleOpenSession(item)}
          />
        )}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator color={palette.accent} />
            </View>
          ) : sessions.length > 0 ? (
            <Text
              style={{
                textAlign: 'center',
                fontFamily: typography.monoFont,
                fontSize: 13,
                color: colors.text3,
                padding: 24,
              }}
            >
              — start of your history —
            </Text>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const FirstRunView: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const { colors, palette, typography } = useTheme();

  const tips = [
    {
      icon: <DumbbellIcon size={18} color={palette.accent} />,
      title: 'Log as you lift',
      sub: "Add exercises, then tap to record each set's weight & reps.",
    },
    {
      icon: <LinkIcon size={18} color={palette.accent} />,
      title: 'Supersets & dropsets',
      sub: "Group exercises or chain drop sets — they're shown visually.",
    },
    {
      icon: <ChartIcon size={18} color={palette.accent} />,
      title: 'Watch the numbers climb',
      sub: 'Every session feeds your per-exercise progress charts.',
    },
  ];

  return (
    <View style={{ padding: 22, alignItems: 'center' }}>
      <View
        style={{
          width: 84,
          height: 84,
          borderRadius: 26,
          backgroundColor: `${palette.accent}28`,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 30,
          marginBottom: 22,
        }}
      >
        <DumbbellIcon size={44} color={palette.accent} strokeWidth={1.8} />
      </View>

      <Text
        style={{
          fontFamily: typography.displayFont,
          fontWeight: '800',
          fontSize: 26,
          color: colors.text,
          letterSpacing: -0.5,
          marginBottom: 8,
          textAlign: 'center',
        }}
      >
        Let's get the first one in
      </Text>
      <Text
        style={{
          fontFamily: typography.bodyFont,
          fontSize: 14.5,
          color: colors.text2,
          lineHeight: 22,
          maxWidth: 300,
          textAlign: 'center',
          marginBottom: 24,
        }}
      >
        No sessions yet. Start a workout and Lift takes care of the rest.
      </Text>

      <View style={{ width: '100%', gap: 10, marginBottom: 26 }}>
        {tips.map((tip, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              gap: 13,
              alignItems: 'flex-start',
              padding: 14,
              backgroundColor: colors.surface,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: colors.surface2,
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {tip.icon}
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: typography.bodyFontBold,
                  fontSize: 14.5,
                  color: colors.text,
                }}
              >
                {tip.title}
              </Text>
              <Text
                style={{
                  fontFamily: typography.bodyFont,
                  fontSize: 12.5,
                  color: colors.text3,
                  marginTop: 2,
                  lineHeight: 18,
                }}
              >
                {tip.sub}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        onPress={onStart}
        style={{
          width: '100%',
          paddingVertical: 16,
          borderRadius: 14,
          backgroundColor: palette.accent,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <PlusIcon size={19} color={palette.onAccent} />
        <Text
          style={{
            fontFamily: typography.bodyFontBold,
            fontSize: 16,
            color: palette.onAccent,
          }}
        >
          Start your first workout
        </Text>
      </TouchableOpacity>
    </View>
  );
};
