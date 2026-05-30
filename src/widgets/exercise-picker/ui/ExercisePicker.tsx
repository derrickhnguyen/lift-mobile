import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Sheet, Input, Chip, EmptyState, SearchIcon, PlusIcon, useTheme } from '../../../shared/ui';
import { getMuscleColor } from '../../../shared/lib/muscleColors';
import { MUSCLE_GROUPS, MUSCLE_GROUP_LABELS } from '../../../shared/config/constants';
import type { Exercise } from '../../../entities/exercise';

interface ExercisePickerProps {
  visible: boolean;
  onClose: () => void;
  exercises: Exercise[];
  onPick: (exercise: Exercise) => void;
  error?: string | null;
}

export const ExercisePicker: React.FC<ExercisePickerProps> = ({
  visible,
  onClose,
  exercises,
  onPick,
  error,
}) => {
  const { colors, typography, palette } = useTheme();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<string>('all');

  const filtered = useMemo(
    () =>
      exercises.filter(
        (e) =>
          (group === 'all' || e.muscle_group === group) &&
          e.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [exercises, query, group],
  );

  return (
    <Sheet visible={visible} onClose={onClose} title="Add exercise" maxHeightRatio={0.92}>
      {/* Search + filter */}
      <View style={{ marginBottom: 4 }}>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search 130+ exercises"
          autoFocus={visible}
          leftSlot={<SearchIcon size={18} color={colors.text3} />}
          style={{ marginBottom: 12 }}
        />
        <FlatList
          horizontal
          data={['all', ...MUSCLE_GROUPS]}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 7, paddingBottom: 4 }}
          renderItem={({ item }) => (
            <Chip
              label={item === 'all' ? 'All' : (MUSCLE_GROUP_LABELS[item] ?? item)}
              active={group === item}
              onPress={() => setGroup(item)}
            />
          )}
        />
      </View>

      {/* Results */}
      {error && exercises.length === 0 ? (
        <EmptyState
          icon={<SearchIcon size={34} color={colors.text3} />}
          title="Couldn't load exercises"
          sub={error}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<SearchIcon size={34} color={colors.text3} />}
          title="Nothing found"
          sub="Try another search or muscle group."
        />
      ) : (
        filtered.map((e) => (
          <TouchableOpacity
            key={e.id}
            onPress={() => {
              onPick(e);
              onClose();
              setQuery('');
              setGroup('all');
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 13,
              paddingHorizontal: 6,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: getMuscleColor(e.muscle_group),
              }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: typography.bodyFontSemibold,
                  fontSize: 15,
                  color: colors.text,
                }}
              >
                {e.name}
              </Text>
              <Text
                style={{
                  fontFamily: typography.bodyFont,
                  fontSize: 12,
                  color: colors.text3,
                  textTransform: 'capitalize',
                  marginTop: 1,
                }}
              >
                {MUSCLE_GROUP_LABELS[e.muscle_group] ?? e.muscle_group}
                {e.is_custom ? ' · custom' : ''}
              </Text>
            </View>
            <PlusIcon size={20} color={palette.accent} />
          </TouchableOpacity>
        ))
      )}
    </Sheet>
  );
};
