import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  TopBar, ChevronLeftIcon, ChevronDownIcon, ClockIcon, ListIcon,
  WeightIcon, PlusIcon, EmptyState, DumbbellIcon, CheckIcon, CloseIcon,
  useTheme,
} from '../../../shared/ui';
import { ExerciseBlock } from '../../../widgets/exercise-block';
import { GroupWrap } from '../../../widgets/group-wrap';
import { SetEditor } from '../../../widgets/set-editor';
import { ExercisePicker } from '../../../widgets/exercise-picker';
import { useActiveSessionStore } from '../../../features/active-session';
import { useExerciseLibraryStore } from '../../../features/exercise-library';
import { useUserPreferencesStore } from '../../../features/user-preferences';
import { fmtTime, calcVolumeLbs } from '../../../shared/lib/formatters';
import type { LocalSet, LocalWorkoutExercise, LocalSession } from '../../../entities/workout';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

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

export const ActiveSessionPage: React.FC = () => {
  const { colors, palette, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const {
    session,
    addSet, updateSet, deleteSet, removeExercise,
    setSupersetGroup, updateName, reorderExercises,
  } = useActiveSessionStore();
  const { exercises: allExercises, hasLoaded: exLoaded, error: exError, fetchAll } = useExerciseLibraryStore();
  const { unit: defaultUnit } = useUserPreferencesStore();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [editor, setEditor] = useState<{ exerciseLocalId: string; set: LocalSet; index: number } | null>(null);
  const [exerciseMenu, setExerciseMenu] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => { if (!exLoaded) fetchAll(); }, [exLoaded]);

  if (!session) return null;

  const groups = groupExercises(session.exercises);
  const totalSets = session.exercises.reduce((a, e) => a + e.sets.length, 0);
  const totalVol = Math.round(
    session.exercises.reduce(
      (a, e) => a + calcVolumeLbs(e.sets.map((s) => ({ weight: s.weight, reps: s.reps, unit: s.unit }))),
      0,
    ),
  );

  const toggleSelect = (localId: string) => {
    setSelectedIds((prev) =>
      prev.includes(localId) ? prev.filter((id) => id !== localId) : [...prev, localId],
    );
  };

  const clearSelection = () => setSelectedIds([]);

  // Indices of selected exercises in current order
  const selectedIndices = selectedIds
    .map((id) => session.exercises.findIndex((e) => e.localId === id))
    .filter((i) => i !== -1)
    .sort((a, b) => a - b);

  const canMoveUp = selectedIndices.length > 0 && selectedIndices[0] > 0;
  const canMoveDown =
    selectedIndices.length > 0 &&
    selectedIndices[selectedIndices.length - 1] < session.exercises.length - 1;

  const moveSelectedUp = () => {
    const next = [...session.exercises];
    // Process top-to-bottom so items don't overtake each other
    for (const idx of selectedIndices) {
      if (idx > 0 && !selectedIds.includes(next[idx - 1].localId)) {
        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      }
    }
    reorderExercises(next);
  };

  const moveSelectedDown = () => {
    const next = [...session.exercises];
    // Process bottom-to-top
    for (let i = selectedIndices.length - 1; i >= 0; i--) {
      const idx = selectedIndices[i];
      if (idx < next.length - 1 && !selectedIds.includes(next[idx + 1].localId)) {
        [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      }
    }
    reorderExercises(next);
  };

  let ssCount = 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TopBar
        sub="Active session"
        title={
          <TextInput
            value={session.name}
            onChangeText={updateName}
            style={{
              fontFamily: typography.displayFont,
              fontWeight: '800',
              fontSize: 20,
              color: colors.text,
              letterSpacing: -0.4,
              padding: 0,
              flex: 1,
            }}
            placeholderTextColor={colors.text3}
          />
        }
        leftSlot={
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronLeftIcon size={20} color={colors.text} />
          </TouchableOpacity>
        }
        rightSlot={
          <TouchableOpacity
            onPress={() => navigation.replace('Summary')}
            style={{ paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10, backgroundColor: palette.accent }}
          >
            <Text style={{ fontFamily: typography.bodyFontBold, fontSize: 14, color: palette.onAccent }}>
              Finish
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.section, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Meta band */}
        <View style={{ flexDirection: 'row', gap: 9, marginBottom: 18 }}>
          {[
            { icon: <ClockIcon size={16} color={colors.text3} />, label: 'Started', value: fmtTime(session.started_at) },
            { icon: <ListIcon size={16} color={colors.text3} />, label: 'Sets', value: String(totalSets) },
            { icon: <WeightIcon size={16} color={colors.text3} />, label: 'Volume', value: `${(totalVol / 1000).toFixed(1)}k` },
          ].map((m, i) => (
            <View key={i} style={{ flex: 1, padding: 11, borderRadius: 14, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ marginBottom: 6 }}>{m.icon}</View>
              <Text style={{ fontFamily: typography.monoFontBold, fontSize: 17, color: colors.text, lineHeight: 19 }}>{m.value}</Text>
              <Text style={{ fontFamily: typography.monoFont, fontSize: 10.5, color: colors.text3, marginTop: 4, fontWeight: '600' }}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* Selection toolbar — appears when exercises are selected */}
        {selectedIds.length > 0 && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: `${palette.accent}18`,
              borderRadius: 14,
              padding: 12,
              marginBottom: 14,
              borderWidth: 1,
              borderColor: `${palette.accent}50`,
            }}
          >
            <Text style={{ flex: 1, fontFamily: typography.bodyFontSemibold, fontSize: 14, color: colors.text }}>
              {selectedIds.length} selected
            </Text>

            {/* Move up */}
            <TouchableOpacity
              onPress={moveSelectedUp}
              disabled={!canMoveUp}
              style={{
                width: 40, height: 40, borderRadius: 10,
                backgroundColor: canMoveUp ? palette.accent : colors.surface3,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <View style={{ transform: [{ rotate: '180deg' }] }}>
                <ChevronDownIcon size={20} color={canMoveUp ? palette.onAccent : colors.text3} />
              </View>
            </TouchableOpacity>

            {/* Move down */}
            <TouchableOpacity
              onPress={moveSelectedDown}
              disabled={!canMoveDown}
              style={{
                width: 40, height: 40, borderRadius: 10,
                backgroundColor: canMoveDown ? palette.accent : colors.surface3,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ChevronDownIcon
                size={20}
                color={canMoveDown ? palette.onAccent : colors.text3}
              />
            </TouchableOpacity>

            {/* Clear selection */}
            <TouchableOpacity
              onPress={clearSelection}
              style={{
                width: 40, height: 40, borderRadius: 10,
                backgroundColor: colors.surface2,
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: colors.border,
              }}
            >
              <CloseIcon size={18} color={colors.text2} />
            </TouchableOpacity>
          </View>
        )}

        {/* Exercise groups */}
        <View style={{ gap: 12 }}>
          {groups.map((g, gi) => {
            const isSuperset = !!g.supersetId && g.items.length > 1;
            const letter = isSuperset ? String.fromCharCode(65 + ssCount++) : null;
            return (
              <GroupWrap key={gi} exercises={g.items} letter={letter}>
                {g.items.map((ex, ei) => {
                  const isSelected = selectedIds.includes(ex.localId);
                  return (
                    <View key={ex.localId} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                      {/* Checkbox */}
                      <TouchableOpacity
                        onPress={() => toggleSelect(ex.localId)}
                        style={{ paddingTop: 10 }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <View
                          style={{
                            width: 22, height: 22, borderRadius: 11,
                            borderWidth: 2,
                            borderColor: isSelected ? palette.accent : colors.border2,
                            backgroundColor: isSelected ? palette.accent : 'transparent',
                            alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          {isSelected && <CheckIcon size={13} color={palette.onAccent} strokeWidth={3} />}
                        </View>
                      </TouchableOpacity>

                      {/* Exercise card */}
                      <View style={{ flex: 1 }}>
                        <ExerciseBlock
                          exercise={ex}
                          tag={isSuperset && letter ? `${letter}${ei + 1}` : null}
                          onAddSet={() => { addSet(ex.localId, defaultUnit); }}
                          onEditSet={(set, index) => setEditor({ exerciseLocalId: ex.localId, set, index })}
                          onMenu={() => setExerciseMenu(ex.localId)}
                        />
                      </View>
                    </View>
                  );
                })}
              </GroupWrap>
            );
          })}
        </View>

        {session.exercises.length === 0 && (
          <EmptyState
            icon={<DumbbellIcon size={36} color={colors.text3} />}
            title="No exercises yet"
            sub="Add your first exercise to start logging sets."
          />
        )}

        {/* Add exercise */}
        <TouchableOpacity
          onPress={() => setPickerOpen(true)}
          style={{
            marginTop: 14, paddingVertical: 15, borderRadius: 14,
            borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border2,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <PlusIcon size={19} color={colors.text2} />
          <Text style={{ fontFamily: typography.bodyFontBold, fontSize: 15, color: colors.text2 }}>
            Add exercise
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={{ height: insets.bottom }} />

      <ExercisePicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        exercises={allExercises}
        error={exError}
        onPick={async (ex) => {
          const { addExercise } = useActiveSessionStore.getState();
          await addExercise(ex, defaultUnit);
        }}
      />

      {editor && (
        <SetEditor
          visible={!!editor}
          onClose={() => setEditor(null)}
          set={editor.set}
          index={editor.index}
          defaultUnit={defaultUnit}
          canDrop={editor.index > 0}
          onSave={(data) => updateSet(editor.exerciseLocalId, editor.set.localId, data)}
          onDelete={() => deleteSet(editor.exerciseLocalId, editor.set.localId)}
        />
      )}

      {exerciseMenu && (
        <ExerciseActionMenu
          exerciseLocalId={exerciseMenu}
          session={session}
          onClose={() => setExerciseMenu(null)}
          onRemove={async (localId) => { await removeExercise(localId); setExerciseMenu(null); }}
          onSuperset={async (localId, direction) => {
            const exercises = session.exercises;
            const idx = exercises.findIndex((e) => e.localId === localId);
            const partnerId = direction === 'prev' ? idx - 1 : idx + 1;
            if (partnerId >= 0 && partnerId < exercises.length) {
              const groupId = exercises[idx].superset_group_id ?? exercises[partnerId].superset_group_id ?? `ss_${Date.now()}`;
              await setSupersetGroup(localId, groupId);
              await setSupersetGroup(exercises[partnerId].localId, groupId);
            }
            setExerciseMenu(null);
          }}
          onUngroup={async (localId) => { await setSupersetGroup(localId, null); setExerciseMenu(null); }}
        />
      )}
    </KeyboardAvoidingView>
  );
};

interface ExerciseActionMenuProps {
  exerciseLocalId: string;
  session: LocalSession;
  onClose: () => void;
  onRemove: (localId: string) => void;
  onSuperset: (localId: string, direction: 'prev' | 'next') => void;
  onUngroup: (localId: string) => void;
}

const ExerciseActionMenu: React.FC<ExerciseActionMenuProps> = ({
  exerciseLocalId, session, onClose, onRemove, onSuperset, onUngroup,
}) => {
  const { colors, typography } = useTheme();
  const ex = session.exercises.find((e) => e.localId === exerciseLocalId);
  const idx = session.exercises.findIndex((e) => e.localId === exerciseLocalId);
  const inSuperset =
    ex &&
    session.exercises.filter((e) => e.superset_group_id && e.superset_group_id === ex.superset_group_id).length > 1;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
      <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
      <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 26, borderTopRightRadius: 26, borderTopWidth: 1, borderColor: colors.border, padding: 18, paddingBottom: 36, gap: 4 }}>
        {inSuperset ? (
          <MenuAction label="Remove from superset" onPress={() => onUngroup(exerciseLocalId)} colors={colors} typography={typography} />
        ) : (
          <>
            <MenuAction label="Superset with exercise above" disabled={idx <= 0} onPress={() => onSuperset(exerciseLocalId, 'prev')} colors={colors} typography={typography} />
            <MenuAction label="Superset with exercise below" disabled={idx >= session.exercises.length - 1} onPress={() => onSuperset(exerciseLocalId, 'next')} colors={colors} typography={typography} />
          </>
        )}
        <MenuAction label="Remove exercise" danger onPress={() => onRemove(exerciseLocalId)} colors={colors} typography={typography} />
      </View>
    </View>
  );
};

const MenuAction: React.FC<{ label: string; onPress: () => void; danger?: boolean; disabled?: boolean; colors: any; typography: any }> = ({
  label, onPress, danger, disabled, colors, typography,
}) => (
  <TouchableOpacity onPress={onPress} disabled={disabled} style={{ padding: 15, borderRadius: 12, opacity: disabled ? 0.38 : 1 }}>
    <Text style={{ fontFamily: typography.bodyFontBold, fontSize: 16, color: danger ? '#F06A6A' : colors.text }}>
      {label}
    </Text>
  </TouchableOpacity>
);
