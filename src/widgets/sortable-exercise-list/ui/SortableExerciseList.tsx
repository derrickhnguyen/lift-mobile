import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import ReorderableList, {
  useReorderableDrag,
  reorderItems,
} from 'react-native-reorderable-list';
import { useTheme } from '../../../shared/ui/useTheme';
import { DragHandleIcon } from '../../../shared/ui/Icons';
import type { LocalWorkoutExercise } from '../../../entities/workout';

interface SortableExerciseListProps {
  exercises: LocalWorkoutExercise[];
  onReorder: (exercises: LocalWorkoutExercise[]) => void;
  renderItem: (exercise: LocalWorkoutExercise, index: number) => React.ReactNode;
  header?: React.ReactElement;
  footer?: React.ReactElement;
}

interface RowProps {
  exercise: LocalWorkoutExercise;
  index: number;
  renderItem: (exercise: LocalWorkoutExercise, index: number) => React.ReactNode;
}

const ExerciseRow: React.FC<RowProps> = ({ exercise, index, renderItem }) => {
  const { colors } = useTheme();
  const drag = useReorderableDrag();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
      <View style={{ flex: 1 }}>{renderItem(exercise, index)}</View>
      <TouchableOpacity
        onLongPress={drag}
        delayLongPress={150}
        style={{ paddingTop: 8, paddingLeft: 10, paddingRight: 2 }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <DragHandleIcon size={22} color={colors.text3} />
      </TouchableOpacity>
    </View>
  );
};

export const SortableExerciseList: React.FC<SortableExerciseListProps> = ({
  exercises,
  onReorder,
  renderItem,
  header,
  footer,
}) => {
  return (
    <ReorderableList
      data={exercises}
      keyExtractor={(item) => item.localId}
      onReorder={({ from, to }) => onReorder(reorderItems(exercises, from, to))}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      contentContainerStyle={{ gap: 12 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item, index }) => (
        <ExerciseRow
          exercise={item}
          index={index}
          renderItem={renderItem}
        />
      )}
    />
  );
};
