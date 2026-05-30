import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TopBar, PlusIcon, SearchIcon, Input, Chip, TrashIcon, ChartIcon, EmptyState, Sheet, Stepper, useTheme } from '../../../shared/ui';
import { getMuscleColor } from '../../../shared/lib/muscleColors';
import { MUSCLE_GROUPS, MUSCLE_GROUP_LABELS } from '../../../shared/config/constants';
import type { MuscleGroup } from '../../../shared/config/constants';
import { useExerciseLibraryStore } from '../../../features/exercise-library';
import type { Exercise } from '../../../entities/exercise';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const LibraryPage: React.FC = () => {
  const { colors, palette, typography, spacing } = useTheme();
  const navigation = useNavigation<Nav>();
  const { exercises, isLoading, hasLoaded, fetchAll, deleteCustom, addCustom } =
    useExerciseLibraryStore();

  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<string>('all');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!hasLoaded) fetchAll();
  }, [hasLoaded]);

  const filtered = useMemo(
    () =>
      exercises
        .filter(
          (e) =>
            (group === 'all' || e.muscle_group === group) &&
            e.name.toLowerCase().includes(query.toLowerCase()),
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    [exercises, query, group],
  );

  const customCount = exercises.filter((e) => e.is_custom).length;

  const handleDelete = (e: Exercise) => {
    Alert.alert(`Delete "${e.name}"?`, 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteCustom(e.id),
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <TopBar
        large
        title="Exercises"
        sub={`${exercises.length} movements · ${customCount} custom`}
        rightSlot={
          <TouchableOpacity
            onPress={() => setCreating(true)}
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

      {/* Search + filter */}
      <View style={{ paddingHorizontal: spacing.section, paddingTop: 14 }}>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search exercises"
          leftSlot={<SearchIcon size={18} color={colors.text3} />}
          style={{ marginBottom: 12 }}
        />
        <FlatList
          horizontal
          data={['all', ...MUSCLE_GROUPS]}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 7, paddingBottom: 12 }}
          renderItem={({ item }) => (
            <Chip
              label={item === 'all' ? 'All' : (MUSCLE_GROUP_LABELS[item] ?? item)}
              active={group === item}
              onPress={() => setGroup(item)}
            />
          )}
        />
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={palette.accent} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(e) => e.id}
          contentContainerStyle={{
            paddingHorizontal: spacing.section,
            paddingBottom: 30,
          }}
          ListEmptyComponent={
            <EmptyState
              icon={<SearchIcon size={34} color={colors.text3} />}
              title="No exercises"
              sub={
                query
                  ? `Nothing matches "${query}". Create a custom exercise.`
                  : 'No exercises found for this filter.'
              }
            />
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
                paddingVertical: 13,
                paddingHorizontal: 4,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  backgroundColor: `${getMuscleColor(item.muscle_group)}28`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <View
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 5,
                    backgroundColor: getMuscleColor(item.muscle_group),
                  }}
                />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                  <Text
                    style={{
                      fontFamily: typography.bodyFontSemibold,
                      fontSize: 15.5,
                      color: colors.text,
                    }}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  {item.is_custom && (
                    <View
                      style={{
                        backgroundColor: colors.surface3,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 5,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: typography.monoFont,
                          fontSize: 8.5,
                          color: colors.text3,
                          letterSpacing: 1,
                          textTransform: 'uppercase',
                        }}
                      >
                        custom
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  style={{
                    fontFamily: typography.bodyFont,
                    fontSize: 12.5,
                    color: colors.text3,
                    textTransform: 'capitalize',
                    marginTop: 1,
                  }}
                >
                  {MUSCLE_GROUP_LABELS[item.muscle_group] ?? item.muscle_group}
                </Text>
              </View>
              {item.is_custom ? (
                <TouchableOpacity
                  onPress={() => handleDelete(item)}
                  style={{
                    width: 34,
                    height: 34,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrashIcon size={17} color={colors.text3} />
                </TouchableOpacity>
              ) : (
                <ChartIcon size={18} color={colors.text3} />
              )}
            </TouchableOpacity>
          )}
        />
      )}

      <CreateExerciseSheet
        visible={creating}
        onClose={() => setCreating(false)}
        onCreate={addCustom}
      />
    </View>
  );
};

const CreateExerciseSheet: React.FC<{
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, group: MuscleGroup) => Promise<void>;
}> = ({ visible, onClose, onCreate }) => {
  const { colors, palette, typography } = useTheme();
  const [name, setName] = useState('');
  const [grp, setGrp] = useState<MuscleGroup>('chest');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onCreate(name.trim(), grp);
      setName('');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Custom exercise" maxHeightRatio={0.8}>
      <View style={{ gap: 20, paddingTop: 6 }}>
        <View>
          <Text
            style={{
              fontFamily: typography.monoFont,
              fontSize: 11,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: colors.text3,
              marginBottom: 10,
            }}
          >
            Name
          </Text>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="e.g. Cable Y-Raise"
            autoFocus={visible}
          />
        </View>
        <View>
          <Text
            style={{
              fontFamily: typography.monoFont,
              fontSize: 11,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: colors.text3,
              marginBottom: 10,
            }}
          >
            Muscle group
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
            {MUSCLE_GROUPS.map((g) => (
              <Chip
                key={g}
                label={MUSCLE_GROUP_LABELS[g] ?? g}
                active={grp === g}
                onPress={() => setGrp(g as MuscleGroup)}
              />
            ))}
          </View>
        </View>
        <TouchableOpacity
          onPress={submit}
          disabled={!name.trim() || saving}
          style={{
            paddingVertical: 16,
            borderRadius: 14,
            backgroundColor: palette.accent,
            alignItems: 'center',
            opacity: name.trim() ? 1 : 0.5,
            marginTop: 4,
          }}
        >
          <Text style={{ fontFamily: typography.bodyFontBold, fontSize: 16, color: palette.onAccent }}>
            Create exercise
          </Text>
        </TouchableOpacity>
      </View>
    </Sheet>
  );
};
