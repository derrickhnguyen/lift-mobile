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
  onPickMultiple: (exercises: Exercise[]) => void;
  error?: string | null;
}

export const ExercisePicker: React.FC<ExercisePickerProps> = ({
  visible,
  onClose,
  exercises,
  onPickMultiple,
  error,
}) => {
  const { colors, typography, palette } = useTheme();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<string>('all');
  const [selected, setSelected] = useState<Exercise[]>([]);

  const filtered = useMemo(
    () =>
      exercises.filter(
        (e) =>
          (group === 'all' || e.muscle_group === group) &&
          e.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [exercises, query, group],
  );

  const toggle = (exercise: Exercise) => {
    setSelected((prev) =>
      prev.some((e) => e.id === exercise.id)
        ? prev.filter((e) => e.id !== exercise.id)
        : [...prev, exercise],
    );
  };

  const handleConfirm = () => {
    onPickMultiple(selected);
    setSelected([]);
    setQuery('');
    setGroup('all');
    onClose();
  };

  const handleClose = () => {
    setSelected([]);
    setQuery('');
    setGroup('all');
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={handleClose} title="Add exercises" fullHeight>
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
        filtered.map((e) => {
          const selIdx = selected.findIndex((s) => s.id === e.id);
          const isSelected = selIdx !== -1;
          return (
            <TouchableOpacity
              key={e.id}
              onPress={() => toggle(e)}
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
                    color: isSelected ? palette.accent : colors.text,
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
              {isSelected ? (
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: palette.accent,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: typography.monoFontBold,
                      fontSize: 11,
                      color: palette.onAccent,
                    }}
                  >
                    {selIdx + 1}
                  </Text>
                </View>
              ) : (
                <PlusIcon size={20} color={palette.accent} />
              )}
            </TouchableOpacity>
          );
        })
      )}

      {/* Confirm button */}
      {selected.length > 0 && (
        <TouchableOpacity
          onPress={handleConfirm}
          style={{
            marginTop: 16,
            paddingVertical: 15,
            borderRadius: 14,
            backgroundColor: palette.accent,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontFamily: typography.bodyFontBold, fontSize: 16, color: palette.onAccent }}>
            Add {selected.length} exercise{selected.length !== 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>
      )}
    </Sheet>
  );
};
