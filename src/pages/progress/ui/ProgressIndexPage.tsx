import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TopBar, ChartIcon, ChevronRightIcon, EmptyState, useTheme } from '../../../shared/ui';
import { getMuscleColor } from '../../../shared/lib/muscleColors';
import { MUSCLE_GROUP_LABELS } from '../../../shared/config/constants';
import { exerciseApi } from '../../../entities/exercise';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type TrainedExercise = { id: string; name: string; muscle_group: string; sessionCount: number };

export const ProgressIndexPage: React.FC = () => {
  const { colors, palette, typography, spacing } = useTheme();
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<TrainedExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    exerciseApi.getTrained()
      .then(setItems)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <TopBar large title="Progress" sub="Track your numbers over time" />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={palette.accent} size="large" />
        </View>
      ) : items.length === 0 ? (
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
              onPress={() =>
                navigation.navigate('ProgressDetail', {
                  exerciseId: item.id,
                  exerciseName: item.name,
                  muscleGroup: item.muscle_group,
                })
              }
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
                  <Text style={{ fontFamily: typography.monoFont }}>{item.sessionCount}</Text> sessions
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
